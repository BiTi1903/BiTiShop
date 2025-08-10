// types/Product.ts
export interface Product {
  id: string; // Thay đổi từ number sang string để phù hợp với Firestore ID
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  tiktokLink?: string; // Thêm từ AdminPage
  shopeeLink?: string; // Thêm từ AdminPage
  Slug?: string; // Thêm từ AdminPage
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}