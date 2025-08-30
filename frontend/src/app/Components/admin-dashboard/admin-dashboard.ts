import { Component, OnDestroy } from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { Service } from '../../services/service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnDestroy {
  loading = true;
  kpi: any = {};
  trend: { label: string; revenue: number }[] = [];
  perf: any[] = [];
  table: any[] = [];
  topProduct: any = null;

  private trendChart: any;
  private perfChart: any;

  constructor(private api: Service) {}

  ngOnInit() {
    this.fetch();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  fetch() {
    this.loading = true;
    this.api
      .getAdminMetrics()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          this.kpi = res.kpi;
          this.trend = this.backfillTrend(res.trend || []);
          this.perf = res.productPerformance || [];
          this.table = res.table || [];
          this.topProduct = res.topProduct;

          requestAnimationFrame(() => this.drawCharts());
        },
        error: (err) => {
          console.error('Failed to load metrics', err);
        },
      });
  }

  // === HELPERS ===

  private backfillTrend(
    source?: Array<{ label: string; revenue: number }>
  ): Array<{ label: string; revenue: number }> {
    const data = source ?? []; // ✅ never undefined past here
    const to = new Date();
    const months: { label: string; revenue: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(to);
      d.setMonth(d.getMonth() - i, 1);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}`;
      months.push({ label, revenue: 0 });
    }

    const map = new Map(data.map((r) => [r.label, r.revenue]));
    return months.map((m) => ({
      label: m.label,
      revenue: map.get(m.label) ?? 0,
    }));
  }

  private destroyCharts() {
    if (this.trendChart) {
      this.trendChart.destroy();
      this.trendChart = null;
    }
    if (this.perfChart) {
      this.perfChart.destroy();
      this.perfChart = null;
    }
  }

  private async drawCharts() {
    const { default: Chart } = await import('chart.js/auto');
    this.destroyCharts();

    // Sales Trend (line)
    const trendEl = document.getElementById('trendChart') as HTMLCanvasElement;
    if (
      trendEl &&
      this.trend.length > 0 &&
      this.trend.some((t) => t.revenue > 0)
    ) {
      this.trendChart = new Chart(trendEl, {
        type: 'line',
        data: {
          labels: this.trend.map((t) => t.label),
          datasets: [
            {
              label: 'Revenue',
              data: this.trend.map((t) => t.revenue),
              borderColor: '#4bc0c0',
              tension: 0.35,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              ticks: {
                callback: (v: any) => `$${Number(v).toLocaleString()}`,
              },
            },
          },
        },
      });
    }

    // Product Performance (donut)
    const perfEl = document.getElementById('perfChart') as HTMLCanvasElement;
    if (perfEl && this.perf.length > 0) {
      this.perfChart = new Chart(perfEl, {
        type: 'doughnut',
        data: {
          labels: this.perf.map((p) => p.name),
          datasets: [
            {
              data: this.perf.map((p) => p.revenue),
              backgroundColor: [
                '#36a2eb',
                '#ff6384',
                '#ff9f40',
                '#4bc0c0',
                '#9966ff',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
        },
      });
    }
  }
}
