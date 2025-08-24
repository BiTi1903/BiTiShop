'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';

import {
  getCartItems,
  removeFromCart,
  clearCart,
  updateCartItemQuantity,
} from '../../lib/cart';
import { Product } from '../../types/product';
import Header from '../../components/Header';

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<(Product & { quantity: number })[]>([]);

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setItems(getCartItems());
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleClear = () => {
    clearCart();
    setItems([]);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartItemQuantity(id, quantity);
    setItems(getCartItems());
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleCheckout = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    // Chưa đăng nhập -> chuyển sang trang đăng nhập
    router.push('/account'); // hoặc đường dẫn trang login của bạn
    return;
  }

  // Nếu đã đăng nhập -> chuyển sang checkout
  router.push('/checkout');
};

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-100 to-rose-100 font-sans">
      <Header />

      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
        {/* <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
            🛍️ Giỏ hàng ({items.length})
          </span>
        </h1> */}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-lg text-center">
            <p className="text-7xl mb-4">🛒</p>
            <p className="text-xl font-semibold text-slate-700">Giỏ hàng của bạn đang trống</p>
          </div>
        ) : (
          <>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl">
              {/* Tiêu đề cột */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-4 border-b border-slate-200 pb-4 mb-4 text-sm font-semibold text-slate-600">
                <span>Sản phẩm</span>
                <span className="text-center">Số lượng</span>
                <span className="text-right">Tổng giá</span>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center border-b border-slate-200 py-4 last:border-b-0 hover:bg-slate-50/50 transition-all duration-200 rounded-lg"
                >
                  {/* Ảnh + tên + giá */}
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm"
                    />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-blue-600 font-semibold text-sm mt-1">{formatPrice(item.price)}</p>
                    </div>
                  </div>

                  {/* Số lượng */}
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-800 bg-slate-200 rounded-lg hover:bg-slate-300 transition-all duration-200"
                    >
                      –
                    </button>
                    <span className="text-slate-900 w-10 text-center font-semibold text-sm sm:text-base">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                    >
                      +
                    </button>
                  </div>

                  {/* Tổng tiền + xóa */}
                  <div className="flex items-center justify-end gap-4">
                    <p className="font-bold text-blue-600 text-sm sm:text-base">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-700 font-semibold text-sm transition-all duration-200"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right text-lg sm:text-xl font-bold text-slate-900 mt-6">
                Tổng tiền: {formatPrice(totalPrice)}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={handleClear}
                className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-200 hover:scale-105"
              >
                Xóa tất cả
              </button>
              <button
                onClick={handleCheckout}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-200 hover:scale-105"
              >
                Thanh toán
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}