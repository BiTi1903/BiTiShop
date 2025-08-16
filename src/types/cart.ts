// src/types/cart.ts
import { Product } from './product';

export interface CartItem extends Product {
  quantity: number;
}
