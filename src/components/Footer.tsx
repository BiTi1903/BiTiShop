import { FaFacebookF } from 'react-icons/fa';
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              🛍️ MY SHOP
            </h3>
            <p className="text-gray-300 mb-4">
              Cửa hàng trực tuyến uy tín với hàng ngàn sản phẩm chất lượng và dịch vụ tận tâm.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Liên kết nhanh</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition">Trang chủ</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Sản phẩm</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Khuyến mãi</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Tin tức</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Liên hệ</a></li>
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Chăm sóc khách hàng</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-white transition">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Chính sách đổi trả</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Chính sách bảo hành</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition">Phương thức thanh toán</a></li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Thông tin liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-blue-400">📍</span>
                <span className="text-gray-300">Phường 2 Bảo Lộc, Lâm Đồng</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-400">📞</span>
                <span className="text-gray-300">0865.340.630</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-400">📧</span>
                <span className="text-gray-300">biti@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-400">⏰</span>
                <span className="text-gray-300">8:00 - 22:00 (Hàng ngày)</span>
              </div>
              <div className="flex items-center space-x-3">
                <a href="https://www.facebook.com/iambiti" className="text-blue-600 hover:text-blue-500 transition">
  <FaFacebookF className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/iambiti" className="text-gray-300 hover:text-white transition">
                    Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © BiTi
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-gray-400 text-sm">Thanh toán:</span>
              <span className="text-2xl">💳</span>
              <span className="text-2xl">📱</span>
              <span className="text-2xl">🏦</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}