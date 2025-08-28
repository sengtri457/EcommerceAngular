// models/product.model.ts
export interface Product {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  description?: string;
  price: number;
  image?: string;
  images?: string[];
  category?: string;
  tags?: string[];
  rating?: number;
  variants?: Array<{
    color: string;
    images?: string[];
    sizes?: Array<{ label: string; stock: number }>;
  }>;
  specs?: Record<string, string>;
}
