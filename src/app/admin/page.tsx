'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct as apiDeleteProduct,
  getCategories,
  addCategory,
} from '../../lib/api';
import { Product } from '../../types/product';

import AddProductModal from './addproduct';
import AddCategory from './addcategory';
import DeleteProductButton from './deleteproduct';
import ProductDetailModal from '../admin/detail'; // <-- import modal detail

// Hàm slugify đơn giản
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  // Mới: detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const [productsData, categoriesData] = await Promise.all([getProducts(), getCategories()]);
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData.map((cat) => cat.name));
      } else {
        setProducts([]);
        setFilteredProducts([]);
        setCategories([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Đăng nhập thành công!');
    } catch {
      alert('Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setProducts([]);
    setFilteredProducts([]);
    setCategories([]);
    alert('Đã đăng xuất.');
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
      alert('Cập nhật sản phẩm thành công!');
    } else {
      await addProduct(productData);
      alert('Thêm sản phẩm thành công!');
    }
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    await apiDeleteProduct(id);
    const updatedProducts = await getProducts();
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    alert('Xóa sản phẩm thành công!');
  };

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }
    if (categories.includes(trimmed)) {
      alert('Danh mục này đã tồn tại');
      return;
    }
    const slug = slugify(trimmed);

    try {
      await addCategory({ name: trimmed, slug });
      const categoriesData = await getCategories();
      setCategories(categoriesData.map((cat) => cat.name));
      setNewCategory('');
      alert(`Đã thêm danh mục: "${trimmed}"`);
    } catch (error) {
      console.error('Lỗi thêm danh mục:', error);
      alert('Thêm danh mục thất bại, vui lòng thử lại');
    }
  };

  const avgPrice =
    products.length > 0
      ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)
      : 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-black bg-white p-6 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-black text-2xl font-semibold mb-4">Đăng nhập Admin</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-black w-full p-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="text-black block text-sm font-medium">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-5">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex justify-between items-center">
            <h1 className="text-4xl font-bold">🛍️ Admin Quản Lý Sản Phẩm</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl text-center shadow-lg">
              <div className="text-3xl font-bold">{products.length}</div>
              <div className="text-sm uppercase tracking-wide opacity-90">Tổng sản phẩm</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl text-center shadow-lg">
              <div className="text-3xl font-bold">{formatPrice(avgPrice)}</div>
              <div className="text-sm uppercase tracking-wide opacity-90">Giá trung bình</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none placeholder-black text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2">🔍</span>
            </div>

            <div className="flex gap-3 flex-wrap items-center">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsModalOpen(true);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                ➕ Thêm sản phẩm
              </button>

              {/* Không còn dùng nút chi tiết ở đây nữa */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nhập danh mục mới..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Thêm danh mục
                </button>
              </div>

              <AddCategory categories={categories} />
            </div>
          </div>

          <table className="w-full text-left border-collapse rounded-lg overflow-hidden shadow-lg">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3">Tên sản phẩm</th>
                <th className="p-3">Danh mục</th>
                <th className="p-3">Giá</th>
                <th className="p-3">Mới</th>
                <th className="p-3">Giảm giá</th>
                <th className="p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    Không tìm thấy sản phẩm
                  </td>
                </tr>
              )}
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-black font-semibold">{product.name}</td>
                  <td className="p-3 text-black font-semibold">{product.category}</td>
                  <td className="p-3 text-black font-semibold">{formatPrice(product.price)}</td>
                  <td className="p-3">{product.isNew ? '✔️' : ''}</td>
                  <td className="p-3">{product.isSale ? '✔️' : ''}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      ✏️ Sửa
                    </button>

                    <button
                      onClick={() => {
                        setDetailProduct(product);
                        setIsDetailModalOpen(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    >
                      📝 Chi tiết
                    </button>

                    <DeleteProductButton productId={product.id} onDelete={handleDeleteProduct} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal thêm/sửa sản phẩm */}
      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        categories={categories}
        initialData={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Modal chi tiết sản phẩm */}
      {detailProduct && (
  <ProductDetailModal
    isOpen={isDetailModalOpen}
    onClose={() => {
      setIsDetailModalOpen(false);
      setDetailProduct(null);
    }}
    products={products}
    initialProductId={detailProduct.id}
    onSave={async (productId, details) => {
      await updateProduct(productId, { details });
      const updatedProducts = await getProducts();
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      alert('Cập nhật chi tiết sản phẩm thành công!');
      setIsDetailModalOpen(false);
      setDetailProduct(null);
    }}
  />
)}

    </div>
  );
}
