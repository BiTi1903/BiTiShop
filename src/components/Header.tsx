'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getCategories } from '../lib/api';
import { getCartItems } from '../lib/cart';
import { Category } from '../types/product';
import { FaFacebookF } from 'react-icons/fa';

import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    };
    fetchCategories();

    setCartCount(getCartItems().reduce((sum, item) => sum + item.quantity, 0));

    const handleStorageChange = () => {
      setCartCount(getCartItems().reduce((sum, item) => sum + item.quantity, 0));
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen Firebase Auth state change
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    // Click outside dropdown to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    setShowAccountMenu(false);
    // Có thể redirect về trang chủ hoặc trang login nếu muốn
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4 min-w-[220px] flex-shrink-0">
            <span className="whitespace-nowrap truncate">📞 Hotline: 0865340630</span>
          </div>

          {/* <div className="flex-1 text-center whitespace-nowrap px-2">
            <span className="truncate block">🚚 Miễn phí Ship</span>
          </div> */}

          
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🛍️ BITI SHOP
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
          <div className="flex items-center space-x-6 relative" ref={accountMenuRef}>
            {!isLoggedIn && (
              <Link
                href="/account"
                className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer transition"
              >
                <span className="text-black font-medium">Đăng nhập</span>
              </Link>
            )}

            {isLoggedIn && (
              <div
                className="flex items-center space-x-2 hover:text-blue-600 cursor-pointer transition select-none"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                <span>👤</span>
                <span className="text-black font-medium">Tài khoản</span>
              </div>
            )}

            {/* Dropdown menu */}
            {showAccountMenu && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
                <Link
                  href="/account/info"
                  className="block px-4 py-2 hover:bg-blue-100 text-gray-700"
                  onClick={() => setShowAccountMenu(false)}
                >
                  Thông tin
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 hover:bg-blue-100 text-gray-700"
                >
                  Đăng xuất
                </button>
              </div>
            )}

            <Link href="/cart" className="relative hover:text-blue-600 cursor-pointer transition">
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
