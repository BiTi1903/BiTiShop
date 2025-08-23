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
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const accountMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

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

    // Click ngoài để đóng menu
    const handleClickOutside = (event: MouseEvent) => {
      // Đóng account menu
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setShowAccountMenu(false);
      }
      
      // Đóng search results
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchResults([]);
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
      setSearchResults([]);
      setShowMobileSearch(false);
    }
  };

  const handleProductClick = (productId: string) => {
    setSearchResults([]);
    setShowMobileSearch(false);
    router.push(`/product/${productId}`);
  };

  return (
    <header className="bg-white shadow-lg relative z-50">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-2">
              <span>📞</span>
              <span className="font-medium">Hotline: 0865.340.630</span>
            </span>
            <span className="hidden sm:flex items-center gap-2">
              <span>🚚</span>
              <span>Miễn phí vận chuyển toàn quốc</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div 
            className="cursor-pointer group flex items-center gap-2"
            onClick={() => router.push('/')}
          >
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
              🛍️
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BITI SHOP
            </h1>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <div className="relative w-full group">
              {/* Gradient border effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 rounded-2xl opacity-0 group-focus-within:opacity-30 blur-sm transition-all duration-300"></div>
              
              <div className="relative bg-white rounded-2xl">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-6 py-4 pl-14 pr-24 border-2 border-gray-200 rounded-2xl 
                            focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                            outline-none transition-all duration-300 text-gray-800
                            hover:border-blue-300 hover:shadow-md
                            placeholder:text-gray-400"
                />
                
                {/* Search icon */}
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Search button */}
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 
                            bg-gradient-to-r from-blue-500 to-purple-500 text-white 
                            px-6 py-2 rounded-xl font-semibold
                            hover:shadow-lg hover:scale-105 active:scale-95 
                            transition-all duration-300"
                >
                  <span className="hidden sm:inline">Tìm kiếm</span>
                  <span className="sm:hidden">Tìm</span>
                </button>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl mt-2 z-50 max-h-80 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="text-sm text-gray-500 px-4 py-2 border-b border-gray-100">
                    Tìm thấy {searchResults.length} sản phẩm
                  </div>
                  {searchResults.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleProductClick(item.id)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors duration-200 group"
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200">
  {item.image ? (
    <img
      src={item.image}
      alt={item.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-lg">📦</span>
  )}
</div>

                      <div className="flex-1">
                        <div className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-200">
                          {item.name}
                        </div>
                        <div className="text-sm text-blue-600 font-semibold">
                          {item.price?.toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Mobile Search Button */}
          {/* <button
            onClick={() => setShowMobileSearch(true)}
            className="md:hidden p-3 rounded-xl hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button> */}

          {/* Account + Cart */}
          <div className="flex items-center space-x-4" ref={accountMenuRef}>
            {/* Account */}
            {!isLoggedIn ? (
              <Link
                href="/account"
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors duration-200"
              >
                <span className="text-lg">👤</span>
                <span className="hidden sm:inline text-gray-700 font-medium">Đăng nhập</span>
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-blue-50 transition-all duration-200 hover:scale-105"
                >
                  <span className="text-lg">👤</span>
                  <span className="hidden sm:inline text-gray-700 font-medium">Tài khoản</span>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showAccountMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {showAccountMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2">
                        <Link
                          href="/account/info"
                          onClick={() => setShowAccountMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors duration-200 group"
                        >
                          <span className="text-gray-700 group-hover:text-blue-700">Thông tin</span>
                        </Link>
                        <Link
                          href="/account/user/orderid"
                          onClick={() => setShowAccountMenu(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl transition-colors duration-200 group"
                        >
                          <span className="text-gray-700 group-hover:text-blue-700">Lịch sử</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl transition-colors duration-200 group"
                        >
                          <span className="text-gray-700 group-hover:text-red-600">Đăng xuất</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 hover:scale-105 group">
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Modal
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setShowMobileSearch(false)}
          >
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="bg-white p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-4 py-3 pl-12 pr-20 border-2 border-gray-200 rounded-2xl 
                              focus:border-blue-500 focus:ring-4 focus:ring-blue-100 
                              outline-none transition-all duration-300"
                    autoFocus
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 
                              bg-gradient-to-r from-blue-500 to-purple-500 text-white 
                              px-5 py-2 rounded-xl font-medium
                              hover:shadow-lg transition-all duration-300"
                  >
                    Tìm
                  </button>
                </div>
              </div>

              Mobile Search Results
              {searchResults.length > 0 && (
                <div className="max-h-96 overflow-y-auto">
                  <div className="text-sm text-gray-500 px-2 py-2 border-b border-gray-100">
                    Tìm thấy {searchResults.length} sản phẩm
                  </div>
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleProductClick(item.id)}
                      className="flex items-center gap-3 px-2 py-3 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors duration-200"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📦</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-sm text-blue-600 font-semibold">
                          {item.price?.toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </header>
  );
}