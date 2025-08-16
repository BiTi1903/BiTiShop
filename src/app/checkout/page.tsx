import { Suspense } from 'react';
import CheckoutClient from '../../components/CheckoutClient';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
