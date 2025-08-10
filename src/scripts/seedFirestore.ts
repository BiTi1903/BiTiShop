// scripts/seedFirestore.ts
import { db } from '../lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { products, categories } from '../data/products'; // Giả sử bạn có một file data chứa sản phẩm và danh mục

const seedFirestore = async () => {
  for (const category of categories) {
    await addDoc(collection(db, 'categories'), category);
  }
  console.log('Categories added');

  for (const product of products) {
    await addDoc(collection(db, 'products'), {
      ...product,
      tiktokLink: '', // Thêm mặc định vì products.ts chưa có
      shopeeLink: '', // Thêm mặc định vì products.ts chưa có
    });
  }
  console.log('Products added');
};

seedFirestore().catch(console.error);