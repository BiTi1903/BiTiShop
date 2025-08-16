'use client';

import { useRef, useState, useEffect, Fragment } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../lib/api';
import { Product, Category } from '../types/product';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

type CartItem = Product & { quantity: number };
type SortOption = 'priceAsc' | 'priceDesc' | null;

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

  const productsPerPage = 12;

  const sortOptions = [
    { id: 'priceAsc', name: 'Giá tăng dần' },
    { id: 'priceDesc', name: 'Giá giảm dần' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const productsData = await getProducts();
      const categoriesData = await getCategories();
      setProducts(productsData);
      setCategories(categoriesData);
    };
    fetchData();
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
    productRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddToCart = (product: Product) => {
    const existingCart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const index = existingCart.findIndex((item) => item.id === product.id);
    if (index >= 0) {
      existingCart[index].quantity += 1;
    } else {
      existingCart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('storage'));
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const handleBuyNow = (product: Product) => {
    const url = product.shopeeLink || `https://shopee.vn/search?keyword=${encodeURIComponent(product.name)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Header />

      {/* Banner */}
      <section className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32 animate-fadeIn text-center">
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 drop-shadow-lg">
            Siêu Sale <span className="block text-yellow-300 animate-bounce">Giảm đến 50%</span>
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed">
            Đỉnh cao chất lượng, giá cả cạnh tranh. <br /> 🚚 Miễn phí vận chuyển toàn quốc!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-white text-blue-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
              🛒 Mua sắm ngay
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-700 transition-all shadow-lg">
              📞 Hotline: 0865.340.630
            </button>
          </div>
        </div>
      </section>

      {/* Danh mục */}
      <section
        ref={categoryRef}
        className={`py-6 bg-white transition-all duration-500 ${highlightCategory ? 'ring-4 ring-yellow-400' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <button
              onClick={() => {
                handleCategoryClick('all');
                setSearchTerm('');
              }}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏪 Tất cả
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  handleCategoryClick(category.slug);
                  setSearchTerm('');
                }}
                className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center space-x-2 ${
                  selectedCategory === category.slug
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto px-4 mb-1 md:hidden">
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
                className="w-full border border-gray-300 rounded-full py-3 pl-12 pr-20 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">🔍</span>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Sản phẩm */}
      <section ref={productRef} className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="p-3 text-black text-2xl font-bold inline-block">
              {selectedCategory === 'all'
                ? 'Tất cả sản phẩm'
                : categories.find((c) => c.slug === selectedCategory)?.name || 'Sản phẩm'}
            </h3>

            {/* Dropdown sắp xếp */}
            <div className="w-38 relative">
              <Listbox
                value={sortOption}
                onChange={(value) => {
                  setSortOption(value);
                  setCurrentPage(1);
                }}
              >
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-full border border-red-200 bg-white py-1 pl-3 pr-1 text-left text-red-100 shadow-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100 focus:ring-opacity-75 transition">
                    <span className="block truncate font-bold text-black">
                      {sortOption === null ? 'Giá' : sortOptions.find((o) => o.id === sortOption)?.name}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon className="h-5 w-5 text-black" aria-hidden="true" />
                    </span>
                  </Listbox.Button>

                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                      {sortOptions.map((option) => (
                        <Listbox.Option
                          key={option.id}
                          className={({ active }) =>
                            `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                              active ? 'bg-red-50 text-black' : 'text-gray-900'
                            }`
                          }
                          value={option.id}
                        >
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                {option.name}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-red-600">
                                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>

          {/* Grid sản phẩm */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onBuyNow={() => handleBuyNow(product)}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">Không tìm thấy sản phẩm phù hợp.</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-4 py-2 rounded transition-all ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white shadow-md scale-110'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
