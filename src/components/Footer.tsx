'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const siteSettings = {
  site_title: 'الغلة',
  site_description: 'منصة متكاملة للمزارعين لبيع وشراء المنتجات الزراعية، المعدات، الأراضي، والخدمات الاستشارية',
  contact_email: 'contact@elghella.com',
  address: 'الجزائر'
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('تم الاشتراك بنجاح! شكراً لك.');
        setMessageType('success');
        setEmail('');
        setFullName('');
      } else {
        setMessage(data.error || 'حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 space-x-reverse mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-emerald-400/30">
                <img src="/assets/logo o.jpg" alt="الغلة" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-emerald-400">{siteSettings.site_title}</h3>
                <p className="text-sm text-gray-400">منصة المزارعين</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {siteSettings.site_description}
            </p>

            {/* Newsletter Subscription */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 text-emerald-400">اشترك في النشرة الإخبارية</h4>
              <p className="text-sm text-gray-400 mb-4">احصل على آخر الأخبار والنصائح الزراعية</p>

              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="الاسم الكامل (اختياري)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="email"
                    placeholder="البريد الإلكتروني *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      جاري الاشتراك...
                    </>
                  ) : (
                    'اشترك الآن'
                  )}
                </button>
              </form>

              {message && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  messageType === 'success'
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-red-500/20 border border-red-500/30 text-red-400'
                }`}>
                  {message}
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-4 space-x-reverse">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61578467404013&mibextid=wwXIfr&rdid=SeDWt8dZzlNCz9Fh&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1ApK4nZXXR%2F%3Fmibextid%3DwwXIfr#"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="تابعنا على Facebook"
              >
                <i className="fab fa-facebook-f text-white text-lg group-hover:text-white"></i>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/el_ghella_/?fbclid=IwY2xjawLwqzJleHRuA2FlbQIxMABicmlkETF1V0htdkVhRVNhcG9hb1YzAR6JtdV_SYKFKbWZi-eAC56MfdAcEwok-_hDSctq9tRuEhCBPYW1s0HPl-F6ig_aem_Akct20fqf2UrxE9Mf1EoiQ"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="تابعنا على Instagram"
              >
                <i className="fab fa-instagram text-white text-lg group-hover:text-white"></i>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@elghella10?_t=ZN-8yKMuFB1wIA&_r=1&fbclid=IwY2xjawLwqy5leHRuA2FlbQIxMABicmlkETF1V0htdkVhRVNhcG9hb1YzAR6jZLxUf1XjQseM-gHEzbPOsMaV0wH7ZLTgJu-Wter5Kxs0aKEnUr9In9w5fg_aem_BdvgT-Mkmob_c0Rp62-dGg"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-12 h-12 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="تابعنا على TikTok"
              >
                <i className="fab fa-tiktok text-white text-lg group-hover:text-white"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-emerald-400">روابط سريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  خدماتنا
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  السوق
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-emerald-400">معلومات الاتصال</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <a
                  href={`mailto:${siteSettings.contact_email}`}
                  className="text-gray-300 hover:text-emerald-400 transition-colors"
                >
                  {siteSettings.contact_email}
                </a>
              </div>

              {/* Phone Numbers */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <a
                    href="tel:0558981686"
                    className="text-gray-300 hover:text-emerald-400 transition-colors"
                  >
                    05 58981686
                  </a>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <a
                    href="tel:0798700447"
                    className="text-gray-300 hover:text-emerald-400 transition-colors"
                  >
                    07 98700447
                  </a>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <a
                    href="tel:0660378697"
                    className="text-gray-300 hover:text-emerald-400 transition-colors"
                  >
                    06 60378697
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-2 space-x-reverse">
                <span className="text-gray-300">{siteSettings.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} {siteSettings.site_title}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
