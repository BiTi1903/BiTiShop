'use client';

import { useRef, useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../lib/api';
import { Product, Category } from '../types/product';

type CartItem = Product & { quantity: number };

export default function Home() {
  const categoryRef = useRef<HTMLDivElement | null>(null);
  const productRef = useRef<HTMLDivElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [highlightCategory, setHighlightCategory] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; // Đổi để hiển thị nhiều hơn mỗi trang (6 x 2 hàng)

  useEffect(() => {
    const fetchData = async () => {
      const productsData = await getProducts();
      const categoriesData = await getCategories();
      setProducts(productsData);
      setCategories(categoriesData);
    };
    fetchData();
  }, []);

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => {
          const cat = categories.find((c) => c.slug === selectedCategory);
          return cat ? product.category === cat.name || product.category === cat.slug : false;
        });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (categoryRef.current) {
      categoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightCategory(true);
      setTimeout(() => setHighlightCategory(false), 600);
    }
  };

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    if (productRef.current) {
      productRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    const url =
      product.shopeeLink || `https://shopee.vn/search?keyword=${encodeURIComponent(product.name)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Banner */}
      <section className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Siêu Sale
              <span className="block text-yellow-300">Giảm đến 50%</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Sản phẩm chất lượng cao với giá tốt nhất. Miễn phí vận chuyển!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                🛒 Mua sắm ngay
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all">
                📞 Hotline: 0865.340.630
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flash sale */}
      <section className="bg-red-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center space-x-4 text-lg font-bold">
            <span className="animate-pulse">⚡SALE</span>
            <span>|</span>
            <span>Còn lại:</span>
            <div className="flex space-x-2">
              <div className="bg-white text-red-600 px-2 py-1 rounded font-mono">02</div>
              <span>:</span>
              <div className="bg-white text-red-600 px-2 py-1 rounded font-mono">15</div>
              <span>:</span>
              <div className="bg-white text-red-600 px-2 py-1 rounded font-mono">30</div>
            </div>
          </div>
        </div>
      </section>

      {/* Danh mục */}
      <section
        ref={categoryRef}
        className={`py-14 bg-white transition-all duration-500 ${
          highlightCategory ? 'ring-4 ring-yellow-400' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-black text-3xl font-bold text-center mb-8">Danh mục sản phẩm</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏪 Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center space-x-2 ${
                  selectedCategory === category.slug
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sản phẩm */}
      <section ref={productRef} className="py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="p-3 text-black text-3xl font-bold mb-6">
            {selectedCategory === 'all'
              ? 'Tất cả sản phẩm'
              : categories.find((c) => c.slug === selectedCategory)?.name || 'Sản phẩm'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {currentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onBuyNow={() => handleBuyNow(product)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === index + 1
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-all`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
