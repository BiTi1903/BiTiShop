// lib/cart.ts
import { Product } from '../types/product';

const CART_KEY = 'cart';

export function getCartItems(): (Product & { quantity: number })[] {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

export function addToCart(product: Product) {
  const cart = getCartItems();
  const existingIndex = cart.findIndex((item) => item.id === product.id);

  if (existingIndex !== -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function removeFromCart(id: string) {
  const cart = getCartItems().filter((item) => item.id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}

export function updateCartItemQuantity(id: string, quantity: number) {
  const cart = getCartItems();
  const index = cart.findIndex((item) => item.id === id);

  if (index !== -1) {
    cart[index].quantity = quantity;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}
