import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where
} from 'firebase/firestore';
import { Product, Category } from '../types/product';

// Products
export const getProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, 'products'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

// 🔹 Lấy sản phẩm theo ID
export const getProductById = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
};

// 🔹 Tìm kiếm sản phẩm theo tên (không phân biệt hoa thường)
export const searchProducts = async (keyword: string): Promise<Product[]> => {
  if (!keyword.trim()) return [];
  const keywordLower = keyword.toLowerCase();

  const products = await getProducts();
  return products.filter((p) => p.name.toLowerCase().includes(keywordLower));
};

export const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'products'), product);
  return docRef.id;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
  await updateDoc(doc(db, 'products', id), product);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'products', id));
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const querySnapshot = await getDocs(collection(db, 'categories'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const addCategory = async (category: Omit<Category, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'categories'), category);
  return docRef.id;
};
