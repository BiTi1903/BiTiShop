// lib/api.ts
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Product, Category } from '../types/product';

// Products
export const getProducts = async (): Promise<Product[]> => {
  const querySnapshot = await getDocs(collection(db, 'products'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
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