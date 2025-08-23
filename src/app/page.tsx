
  'use client';

  import { useRef, useState, useEffect, Fragment } from 'react';
  import Header from '../components/Header';
  import Footer from '../components/Footer';
  import ProductCard from '../components/ProductCard';
  import { getProducts, getCategories } from '../lib/api';
  import { Product, Category } from '../types/product';
  import { Listbox, Transition } from '@headlessui/react';
  import { CheckIcon, ChevronUpDownIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
  import MusicPlayer from "@/components/MusicPlayer";


  type CartItem = Product & { quantity: number };
  type SortOption = 'priceAsc' | 'priceDesc' | null;

  // Notification Component
  const NotificationToast = ({ message, isVisible, onClose }: { 
    message: string; 
    isVisible: boolean; 
    onClose: () => void;
  }) => {
    useEffect(() => {
      if (isVisible) {
        const timer = setTimeout(() => {
          onClose();
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [isVisible, onClose]);

    return (
      <div 
        className={`fixed top-20 right-4 z-50 transform transition-all duration-500 ease-out ${
          isVisible 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-400/20 backdrop-blur-sm min-w-[300px]">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm leading-tight">
                {message}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default function Home() {
    const categoryRef = useRef<HTMLDivElement | null>(null);
    const productRef = useRef<HTMLDivElement | null>(null);

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [highlightCategory, setHighlightCategory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<SortOption>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileCategories, setShowMobileCategories] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(true);

    
    // Notification states
    const [notification, setNotification] = useState({ message: '', isVisible: false });

    const productsPerPage = 12;

    const sortOptions = [
      { id: 'priceAsc', name: 'Giá tăng dần', icon: '📈' },
      { id: 'priceDesc', name: 'Giá giảm dần', icon: '📉' },
    ];

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        const productsData = await getProducts();
        const categoriesData = await getCategories();
        setProducts(productsData);
        setCategories(categoriesData);
        setIsLoading(false);
      };
      fetchData();
    }, []);

    // Scroll tracking effect
    useEffect(() => {
      const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const heroHeight = 400; // Approximate hero section height
        setIsScrolled(scrollPosition > heroHeight);
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lọc sản phẩm theo category + search
    const filteredProducts = products.filter((product) => {
      const cat = categories.find((c) => c.slug === selectedCategory);
      const categoryMatch =
        selectedCategory === 'all' || (cat ? product.category === cat.name || product.category === cat.slug : false);
      const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });

    // Sắp xếp
    const sortedProducts = sortOption
      ? filteredProducts.slice().sort((a, b) =>
          sortOption === 'priceAsc' ? a.price - b.price : b.price - a.price
        )
      : filteredProducts;

    // Pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
      productRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleCategoryClick = (slug: string) => {
      setSelectedCategory(slug);
      setSortOption(null);
      setCurrentPage(1);
      setShowMobileCategories(false); // Đóng menu sau khi chọn
      productRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Enhanced Add to Cart function with notification
    const handleAddToCart = (product: Product) => {
      try {
        // Note: In a real app, you'd use React state management instead of localStorage
        // This is just for demonstration purposes
        const existingCart: CartItem[] = JSON.parse(localStorage?.getItem('cart') || '[]');
        const index = existingCart.findIndex((item) => item.id === product.id);
        
        if (index >= 0) {
          existingCart[index].quantity += 1;
        } else {
          existingCart.push({ ...product, quantity: 1 });
        }
        
        localStorage?.setItem('cart', JSON.stringify(existingCart));
        
        // Dispatch storage event to update cart in other components
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('storage'));
        }
        
        // Show notification
        setNotification({
          message: `Đã thêm "${product.name}" vào giỏ hàng!`,
          isVisible: true
        });
        
      } catch (error) {
        console.error('Error adding to cart:', error);
        setNotification({
          message: `❌ Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!`,
          isVisible: true
        });
      }
    };

    const handleBuyNow = (product: Product) => {
      const url = product.shopeeLink || `https://shopee.vn/search?keyword=${encodeURIComponent(product.name)}`;
      window.open(url, '_blank');
    };

    // Close notification
    const closeNotification = () => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    };

    // Get selected category info
    const getSelectedCategoryInfo = () => {
      if (selectedCategory === 'all') {
        return { name: 'Tất cả', icon: '🏪' };
      }
      const cat = categories.find((c) => c.slug === selectedCategory);
      return cat ? { name: cat.name, icon: cat.icon } : { name: 'Tất cả', icon: '🏪' };
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Header />

        {/* Notification Toast */}
        <NotificationToast 
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={closeNotification}
        />

        {/* Enhanced Hero Banner */}
        <section className="relative overflow-hidden">
          {/* Background with animated gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          {/* Animated background shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-8 lg:py-5 text-center text-white">
            {/* Main heading with enhanced typography */}
            <div className="mb-8">
              <h1 className="text-5xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent drop-shadow-2xl">
                BITI SHOP
              </h1>
              <div className="relative inline-block">
                <h2 className="text-3xl lg:text-5xl font-bold mb-2 text-yellow-300 animate-bounce">
                  🔥 SIÊU SALE 50% 🔥
                </h2>
                <div className="absolute -inset-2 bg-yellow-400/20 blur-xl rounded-full"></div>
              </div>
            </div>

            {/* Enhanced description */}
            <p className="text-xl lg:text-2xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed font-medium">
              ✨ Chất lượng cao cấp, giá cả siêu ưu đãi<br/>
              🚚 Miễn phí vận chuyển toàn quốc • ⚡ Giao hàng nhanh 24h
            </p>

            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                onClick={() => productRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative bg-white text-blue-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-white/25 min-w-[200px]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  🛒 Mua sắm ngay
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button className="group relative border-2 border-white text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-700 transition-all duration-300 shadow-xl min-w-[200px] backdrop-blur-sm">
                <span className="flex items-center justify-center gap-2">
                  📞 Hotline: 0865.340.630
                </span>
              </button>
            </div>

            {/* Stats section */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: '👥', number: '50K+', label: 'Khách hàng' },
                { icon: '⭐', number: '4.9/5', label: 'Đánh giá' },
                { icon: '📦', number: '100K+', label: 'Đơn hàng' },
                { icon: '🏆', number: '#1', label: 'Tin cậy' },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.number}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Categories Section */}
        <section
          ref={categoryRef}
          className={`py-4 lg:py-8 bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 transition-all duration-500 ${
            highlightCategory ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''
          } ${isScrolled ? 'py-2 lg:py-4' : ''}`}
        >
          <div className="max-w-7xl mx-auto px-4">
            {/* Desktop Categories - Hidden on mobile */}
            <div className={`hidden lg:flex flex-wrap justify-center gap-3 transition-all duration-300 ${
              isScrolled ? 'mb-2' : 'mb-6'
            }`}>
              <button
                onClick={() => {
                  handleCategoryClick('all');
                  setSearchTerm('');
                }}
                className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl shadow-blue-500/25'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-lg'
                } ${isScrolled ? 'px-4 py-2 text-sm' : ''}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  🏪 Tất cả
                  {selectedCategory === 'all' && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </span>
                {selectedCategory === 'all' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-50"></div>
                )}
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    handleCategoryClick(category.slug);
                    setSearchTerm('');
                  }}
                  className={`group relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.slug
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl shadow-blue-500/25'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-lg'
                  } ${isScrolled ? 'px-4 py-2 text-sm' : ''}`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className={`${isScrolled ? 'text-base' : 'text-lg'}`}>{category.icon}</span>
                    <span>{category.name}</span>
                    {selectedCategory === category.slug && (
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </span>
                  {selectedCategory === category.slug && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-50"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Categories - Compact dropdown */}
            <div className="lg:hidden mb-4">
              {/* Mobile category button */}
              <button
                onClick={() => setShowMobileCategories(!showMobileCategories)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  showMobileCategories 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSelectedCategoryInfo().icon}</span>
                  <span>Danh mục: {getSelectedCategoryInfo().name}</span>
                </div>
                <ChevronDownIcon 
                  className={`w-5 h-5 transition-transform duration-300 ${
                    showMobileCategories ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Mobile categories dropdown */}
              <div className={`overflow-hidden transition-all duration-300 ${
                showMobileCategories ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
              }`}>
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        handleCategoryClick('all');
                        setSearchTerm('');
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                        selectedCategory === 'all'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>🏪</span>
                      <span>Tất cả</span>
                    </button>

                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          handleCategoryClick(category.slug);
                          setSearchTerm('');
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                          selectedCategory === category.slug
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-base">{category.icon}</span>
                        <span className="truncate">{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Mobile Search */}
            <div className="max-w-xl mx-auto mb-2 lg:hidden">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition-all duration-300"></div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCurrentPage(1);
                  }}
                  className="relative"
                >
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-2xl py-3 pl-12 pr-20 text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/90 backdrop-blur-sm"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    Tìm
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Products Section */}
        <section ref={productRef} className="py-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            {/* Enhanced section header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  {selectedCategory === 'all'
                    ? 'Tất cả sản phẩm'
                    : categories.find((c) => c.slug === selectedCategory)?.name || 'Sản phẩm'}
                </h3>
              </div>

              {/* Enhanced Sort Dropdown */}
              <div className="w-full lg:w-64">
                <Listbox
                  value={sortOption}
                  onChange={(value) => {
                    setSortOption(value);
                    setCurrentPage(1);
                  }}
                >
                  <div className="relative">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-2xl border-2 border-gray-200 bg-white py-3 pl-4 pr-12 text-left shadow-sm hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300">
                      <span className="flex items-center gap-2 font-semibold text-gray-700">
                        <span className="text-lg">
                          {sortOption === 'priceAsc' ? '📈' : sortOption === 'priceDesc' ? '📉' : '🔀'}
                        </span>
                        {sortOption === null ? 'Sắp xếp theo giá' : sortOptions.find((o) => o.id === sortOption)?.name}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>

                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
                        <div className="py-2">
                          {sortOptions.map((option) => (
                            <Listbox.Option
                              key={option.id}
                              className={({ active, selected }) =>
                                `relative cursor-pointer select-none py-3 px-4 transition-all duration-200 ${
                                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                } ${selected ? 'bg-blue-100' : ''}`
                              }
                              value={option.id}
                            >
                              {({ selected }) => (
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{option.icon}</span>
                                  <span className={`block truncate ${selected ? 'font-bold' : 'font-medium'}`}>
                                    {option.name}
                                  </span>
                                  {selected && (
                                    <CheckIcon className="h-5 w-5 text-blue-600 ml-auto" aria-hidden="true" />
                                  )}
                                </div>
                              )}
                            </Listbox.Option>
                          ))}
                        </div>
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-xl mb-3"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4 mb-3"></div>
                    <div className="bg-gray-200 h-8 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              /* Enhanced Products Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="transform hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={() => handleAddToCart(product)}
                        onBuyNow={() => handleBuyNow(product)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</h4>
                    <p className="text-gray-500">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-2">
                {/* Previous button */}
                <button
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  ← Trước
                </button>

                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 transform ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                

                {/* Next button */}
                <button
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  Sau →
                </button>
              </div>
            )}
          </div>
        </section>

        <Footer />
        {/* Music Player */}
{showMusicPlayer && (
  <MusicPlayer 
    isMinimized={isPlayerMinimized}
    onToggleMinimize={setIsPlayerMinimized}
    onClose={() => setShowMusicPlayer(false)}
  />
)}
      </div>
    );
  }