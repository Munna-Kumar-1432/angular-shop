import { Product } from '../services/product.service';

export interface CartItem {
  product: Product;
  quantity: number;
} 