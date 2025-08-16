'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getCategories, getProducts } from '../lib/api';
import { getCartItems } from '../lib/cart';
import { Category, Product } from '../types/product';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Lấy dữ liệu ban đầu
  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    };
    const fetchProducts = async () => {
      const productsData = await getProducts();
      setProducts(productsData);
    };
    fetchCategories();
    fetchProducts();

    // Lấy số lượng giỏ hàng hiện tại
    setCartCount(getCartItems().reduce((sum, item) => sum + item.quantity, 0));

    // Lắng nghe sự kiện storage để cập nhật giỏ hàng (tab khác)
    const handleStorageChange = () => {
      setCartCount(getCartItems().reduce((sum, item) => sum + item.quantity, 0));
    };
    window.addEventListener('storage', handleStorageChange);

    // Lắng nghe custom event cartUpdated
    const handleCartUpdated = () => {
      setCartCount(getCartItems().reduce((sum, item) => sum + item.quantity, 0));
    };
    window.addEventListener('cartUpdated', handleCartUpdated);

    // Lắng nghe trạng thái đăng nhập
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    // Click ngoài để đóng menu tài khoản
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
      window.removeEventListener('cartUpdated', handleCartUpdated);
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Ẩn hiện header khi scroll, chỉ áp dụng cho trang Home
  useEffect(() => {
    if (pathname === '/') {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setShowHeader(false);
        } else {
          setShowHeader(true);
        }
        setLastScrollY(currentScrollY);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setShowHeader(true); // các trang khác luôn hiện header
    }
  }, [pathname, lastScrollY]);

  // Thuật toán tìm kiếm
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const results = products.filter((p) =>
      p.name.toLowerCase().includes(lowerQuery)
    );
    setSearchResults(results.slice(0, 8));
  }, [searchQuery, products]);

  const handleSignOut = async () => {
    await signOut(auth);
    setShowAccountMenu(false);
    router.push('/account');
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className={`bg-white shadow-lg sticky top-0 z-50 transition-transform duration-300 ${
        showHeader ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Top bar */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4 min-w-[220px] flex-shrink-0">
            <span className="whitespace-nowrap truncate">📞 Hotline: 0865340630</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <h1
            className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent cursor-pointer"
            onClick={() => router.push('/')}
          >
            🛍️ BITI SHOP
          </h1>

          {/* Search box */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative group">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="text-black w-full px-4 py-3 pl-12 pr-20 border-2 border-gray-200 rounded-full 
                        focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                        outline-none transition-all duration-300"
            />
            <div
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 
                        transition-transform duration-300 group-focus-within:scale-110"
            >
              🔍
            </div>
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 
                        bg-gradient-to-r from-teal-500 to-blue-600 text-white 
                        px-6 py-2 rounded-full 
                        hover:opacity-90 active:scale-95 transition-all duration-300 shadow-md"
            >
              Tìm
            </button>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-50 max-h-64 overflow-y-auto">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/product/${item.id}`}
                    className="block px-4 py-2 hover:bg-gray-100 text-black"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Account + Cart */}
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
                className="flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer select-none transition-all duration-300 ease-in-out hover:bg-teal-50 hover:scale-105"
                onClick={() => setShowAccountMenu(!showAccountMenu)}
              >
                <span>👤</span>
                <span className="text-black font-bold">Tài khoản</span>
              </div>
            )}

            <AnimatePresence>
              {showAccountMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50"
                >
                  <Link
                    href="/account/info"
                    className="block px-4 py-2 hover:bg-teal-50 text-gray-700"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    Thông tin
                  </Link>
                  <Link
                    href="/account/user/orderid"
                    className="block px-4 py-2 hover:bg-teal-50 text-gray-700"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    Lịch sử đặt hàng
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 hover:bg-teal-50 text-gray-700"
                  >
                    Đăng xuất
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

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