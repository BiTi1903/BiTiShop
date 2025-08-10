// components/Header.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCategories } from '../lib/api';
import { getCartItems } from '../lib/cart';
import { Category } from '../types/product';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Lấy danh mục
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    };
    fetchCategories();
 const updateCartCount = () => setCartCount(
      getCartItems().reduce((sum, item) => sum + item.quantity, 0)
    );
    // Lấy số lượng giỏ hàng
    setCartCount(getCartItems().length);

    const handleStorageChange = () => {
      setCartCount(getCartItems().length);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>📞 Hotline: 0865340630</span>
            <span className="hidden md:inline">📧 lebaothienbiti@gmail.com</span>
          </div>
          <div className="hidden md:block">
            <span>🚚 Miễn phí vận chuyển mọi đơn hàng</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🛍️ BiTi Shop
          </h1>
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="text-black w-full px-4 py-3 pl-12 pr-20 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none transition"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition">
                Tìm
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 hover:text-blue-600 cursor-pointer transition">
              <span>👤</span>
              <span className="text-black font-medium">Tài khoản</span>
            </div>

            {/* Giỏ hàng */}
            <Link href="/cart" className="relative hover:text-blue-600 cursor-pointer transition">
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-2xl"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <nav className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="space-y-3">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`#${category.slug}`}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span>{category.name}</span>
                  </a>
                ))}
                <div className="pt-4 border-t">
                  <a href="#" className="flex items-center space-x-2 text-gray-700 py-2">
                    <span>👤</span>
                    <span>Tài khoản</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
