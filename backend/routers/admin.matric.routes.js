// routers/admin.metrics.routes.js
const express = require("express");
const { authRequired, adminOnly } = require("../middleware/auth");
const Order = require("../models/order");

const router = express.Router();

/**
 * GET /api/admin/metrics
 * Optional query:
 *   - days=90                 // last N days (ignored if from/to provided)
 *   - from=YYYY-MM-DD&to=...  // explicit range
 *   - statuses=pending,paid   // comma list; default: all except canceled/refunded
 */
router.get("/metrics", authRequired, adminOnly, async (req, res, next) => {
  try {
    // ----- time range -----
    const to = req.query.to ? new Date(req.query.to) : new Date();
    let from;
    if (req.query.from) {
      from = new Date(req.query.from);
    } else {
      const days = Number(req.query.days || 90);
      from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
    }

    // ----- statuses -----
    let statusMatch;
    if (req.query.statuses) {
      // explicit allow-list
      const statuses = req.query.statuses
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      statusMatch = { $in: statuses };
    } else {
      // default: include everything except canceled/refunded
      statusMatch = { $nin: ["canceled", "refunded"] };
    }

    // Base match used by most aggs
    const baseMatch = {
      createdAt: { $gte: from, $lte: to },
      status: statusMatch,
    };

    // Helper to compute revenue from total, with fallback if total is missing
    async function kpiAgg(match) {
      const rows = await Order.aggregate([
        { $match: match },
        {
          $facet: {
            // sum stored totals
            fromTotals: [
              {
                $group: {
                  _id: null,
                  rev: { $sum: "$total" },
                  count: { $sum: 1 },
                },
              },
            ],
            // fallback: compute from items
            fromItems: [
              { $unwind: "$items" },
              {
                $group: {
                  _id: null,
                  rev: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
                },
              },
            ],
          },
        },
        {
          $project: {
            totalRevenue: {
              $cond: [
                { $gt: [{ $size: "$fromTotals" }, 0] },
                { $ifNull: [{ $arrayElemAt: ["$fromTotals.rev", 0] }, 0] },
                { $ifNull: [{ $arrayElemAt: ["$fromItems.rev", 0] }, 0] },
              ],
            },
            ordersCount: {
              $cond: [
                { $gt: [{ $size: "$fromTotals" }, 0] },
                { $ifNull: [{ $arrayElemAt: ["$fromTotals.count", 0] }, 0] },
                0,
              ],
            },
          },
        },
      ]);
      return rows[0] || { totalRevenue: 0, ordersCount: 0 };
    }

    // Current period KPIs
    const kpi = await kpiAgg(baseMatch);

    // Today’s sales (same status rules)
    const startOfDay = new Date(to);
    startOfDay.setHours(0, 0, 0, 0);
    const kpiToday = await kpiAgg({
      ...baseMatch,
      createdAt: { $gte: startOfDay, $lte: to },
    });

    // Previous period for growth
    const prevFrom = new Date(from.getTime() - (to - from));
    const prevTo = new Date(from);
    const prevKpi = await kpiAgg({
      createdAt: { $gte: prevFrom, $lte: prevTo },
      status: statusMatch,
    });

    const revenueGrowthPct =
      prevKpi.totalRevenue > 0
        ? ((kpi.totalRevenue - prevKpi.totalRevenue) / prevKpi.totalRevenue) *
          100
        : 0;

    // Monthly revenue trend (last 12 months, same status)
    const twelveMonthsAgo = new Date(to);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    const trend = await Order.aggregate([
      {
        $match: {
          status: statusMatch,
          createdAt: { $gte: twelveMonthsAgo, $lte: to },
        },
      },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          revenue: { $sum: "$total" },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]).then((rows) =>
      rows.map((r) => ({
        label: `${r._id.y}-${String(r._id.m).padStart(2, "0")}`,
        revenue: r.revenue || 0,
      }))
    );

    // Top products by revenue in range (fallback to items calc if needed)
    const productPerformance = await Order.aggregate([
      { $match: baseMatch },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $last: "$items.name" },
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
          qty: { $sum: "$items.qty" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      range: { from, to, prevFrom, prevTo },
      kpi: {
        dailySales: kpiToday.totalRevenue || 0,
        totalRevenue: kpi.totalRevenue || 0,
        ordersCount: kpi.ordersCount || 0,
        revenueGrowthPct,
      },
      trend,
      productPerformance,
      topProduct: productPerformance[0] || null,
      table: productPerformance.map((p) => ({
        productId: p._id,
        product: p.name,
        revenue: p.revenue,
        qty: p.qty,
        growthPct: null,
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
