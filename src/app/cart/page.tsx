'use client';
import { useState, useEffect } from 'react';
import { getCartItems, removeFromCart, clearCart, updateCartItemQuantity } from '../../lib/cart';
import { Product } from '../../types/product';

export default function CartPage() {
  const [items, setItems] = useState<(Product & { quantity: number })[]>([]);

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setItems(getCartItems());
    window.dispatchEvent(new Event('storage'));
  };

  const handleClear = () => {
    clearCart();
    setItems([]);
    window.dispatchEvent(new Event('storage'));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartItemQuantity(id, quantity);
    setItems(getCartItems());
    window.dispatchEvent(new Event('storage'));
  };

  if (items.length === 0) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center text-gray-600">
          <p className="text-5xl mb-4">🛒</p>
          <p className="text-lg font-medium">Giỏ hàng của bạn đang trống</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen w-full">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-black text-3xl font-bold mb-6">🛍️ Giỏ hàng của bạn</h1>
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b py-4"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div>
                  <p className="text-black font-bold">{item.name}</p>
                  <p className="text-blue-600 font-semibold">
                    {item.price.toLocaleString()}₫
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity - 1)
                  }
                  className="text-black px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span className="text-black px-3">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(item.id, item.quantity + 1)
                  }
                  className="text-black px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-bold text-gray-800">
                  {(item.price * item.quantity).toLocaleString()}₫
                </p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleClear}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Xóa tất cả
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded">
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
