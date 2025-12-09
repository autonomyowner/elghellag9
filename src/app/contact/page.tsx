'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ContactForm from '@/components/ContactForm';

const contactInfo = {
  email: 'contact@elghella.com',
  address: 'الجزائر',
  phones: ['0558981686', '0798700447', '0660378697']
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-gray-900">
      {/* Hero Section */}
      <div className="py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-green-200 mb-4">اتصل بنا</h1>
        <p className="text-lg md:text-xl text-green-100 max-w-2xl mx-auto">نحن هنا للإجابة على جميع استفساراتك وتقديم الدعم اللازم لك في أي وقت.</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 rounded-2xl shadow-lg p-6 border border-green-500/20"
            >
              <h2 className="text-xl font-bold text-green-200 mb-6 flex items-center">
                معلومات الاتصال
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  </div>
                  <div>
                    <p className="text-sm text-green-100">البريد الإلكتروني</p>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-green-200 hover:text-green-300 font-semibold"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    </div>
                    <div>
                      <p className="text-sm text-green-100">أرقام الهاتف</p>
                      <div className="space-y-1">
                        <a
                          href="tel:0558981686"
                          className="text-green-200 hover:text-green-300 font-semibold block"
                          dir="ltr"
                        >
                          05 58981686
                        </a>
                        <a
                          href="tel:0798700447"
                          className="text-green-200 hover:text-green-300 font-semibold block"
                          dir="ltr"
                        >
                          07 98700447
                        </a>
                        <a
                          href="tel:0660378697"
                          className="text-green-200 hover:text-green-300 font-semibold block"
                          dir="ltr"
                        >
                          06 60378697
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  </div>
                  <div>
                    <p className="text-sm text-green-100">العنوان</p>
                    <p className="text-green-200 font-semibold">{contactInfo.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 rounded-2xl shadow-lg p-6 border border-green-500/20"
            >
              <h2 className="text-xl font-bold text-green-200 mb-6 flex items-center">
                <i className="fas fa-share-alt text-green-400 ml-3"></i>
                وسائل التواصل الاجتماعي
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=61578467404013&mibextid=wwXIfr&rdid=SeDWt8dZzlNCz9Fh&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1ApK4nZXXR%2F%3Fmibextid%3DwwXIfr#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-3 space-x-reverse p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <i className="fab fa-facebook-f text-white text-lg"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-green-200 group-hover:text-blue-200">Facebook</p>
                    <p className="text-sm text-green-100">تابعنا على فيسبوك</p>
                  </div>
                  <i className="fas fa-external-link-alt text-green-300 group-hover:text-blue-200 transition-colors mr-auto"></i>
                </a>
                
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/el_ghella_/?fbclid=IwY2xjawLwqzJleHRuA2FlbQIxMABicmlkETF1V0htdkVhRVNhcG9hb1YzAR6JtdV_SYKFKbWZi-eAC56MfdAcEwok-_hDSctq9tRuEhCBPYW1s0HPl-F6ig_aem_Akct20fqf2UrxE9Mf1EoiQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-3 space-x-reverse p-4 bg-pink-500/10 hover:bg-pink-500/20 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center group-hover:from-green-600 group-hover:to-green-700 transition-all">
                    <i className="fab fa-instagram text-white text-lg"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-green-200 group-hover:text-pink-200">Instagram</p>
                    <p className="text-sm text-green-100">تابعنا على انستغرام</p>
                  </div>
                  <i className="fas fa-external-link-alt text-green-300 group-hover:text-pink-200 transition-colors mr-auto"></i>
                </a>
                
                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@elghella10?_t=ZN-8yKMuFB1wIA&_r=1&fbclid=IwY2xjawLwqy5leHRuA2FlbQIxMABicmlkETF1V0htdkVhRVNhcG9hb1YzAR6jZLxUf1XjQseM-gHEzbPOsMaV0wH7ZLTgJu-Wter5Kxs0aKEnUr9In9w5fg_aem_BdvgT-Mkmob_c0Rp62-dGg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center space-x-3 space-x-reverse p-4 bg-black/10 hover:bg-black/20 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                    <i className="fab fa-tiktok text-white text-lg"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-green-200 group-hover:text-gray-200">TikTok</p>
                    <p className="text-sm text-green-100">تابعنا على تيك توك</p>
                  </div>
                  <i className="fas fa-external-link-alt text-green-300 group-hover:text-gray-200 transition-colors mr-auto"></i>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
