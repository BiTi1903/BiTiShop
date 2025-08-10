'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCartItems,
  removeFromCart,
  clearCart,
  updateCartItemQuantity,
} from '../../lib/cart';
import { Product } from '../../types/product';

export default function CartPage() {
  const router = useRouter();
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
    <div className="bg-white min-h-screen flex flex-col px-4">
      <button
        onClick={() => router.back()}
        className="self-start mt-6 mb-10 inline-flex items-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        ← Quay trở lại
      </button>
      <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-600">
        <p className="text-6xl mb-4">🛒</p>
        <p className="text-lg font-medium">Giỏ hàng của bạn đang trống</p>
      </div>
    </div>
  );
}

  return (
    <div className="bg-white min-h-screen w-full px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          ← Quay trở lại
        </button>
        <h1 className="text-black text-3xl font-bold mb-8">🛍️ Giỏ hàng của bạn</h1>

        <div className="bg-gray-50 p-6 rounded-lg shadow space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 last:border-b-0 last:pb-0 gap-6"
            >
              {/* Ảnh + tên + giá */}
              <div className="flex items-center space-x-4 min-w-0 flex-1">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-black font-semibold truncate">{item.name}</p>
                  <p className="text-blue-600 font-semibold mt-1">
                    {item.price.toLocaleString()}₫
                  </p>
                </div>
              </div>

              {/* Số lượng */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="text-black px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 select-none transition"
                >
                  –
                </button>
                <span className="text-black w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="text-black px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 select-none transition"
                >
                  +
                </button>
              </div>

              {/* Tổng tiền + xóa */}
              <div className="flex items-center space-x-6 min-w-[140px] justify-end">
                <p className="font-bold text-gray-800 whitespace-nowrap">
                  {(item.price * item.quantity).toLocaleString()}₫
                </p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-600 hover:underline font-medium"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
          <button
            onClick={handleClear}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition"
          >
            Xóa tất cả
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition">
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
}
