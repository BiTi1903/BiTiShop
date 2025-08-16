// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Product, Category } from '../types/product';

const firebaseConfig = {
  apiKey: "AIzaSyBloxYssi5CutUy8J9azissCaT8LyQcZ8M",
  authDomain: "testshop-3a30d.firebaseapp.com",
  projectId: "testshop-3a30d",
  storageBucket: "testshop-3a30d.firebasestorage.app",
  messagingSenderId: "845646249753",
  appId: "1:845646249753:web:de6aa0e7a0ba193647cf88",
  measurementId: "G-76W8YYZF50"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);


// Products
export const getProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, 'products'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
};

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