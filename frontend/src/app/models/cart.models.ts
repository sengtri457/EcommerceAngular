import { Product } from './products.models';

export interface CartItem {
  product: Product;
  qty: number;
  selection?: CartSelection;
}

export type CartSelection = {
  color?: string;
  size?: string;
};
