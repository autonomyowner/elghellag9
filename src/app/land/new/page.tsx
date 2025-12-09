'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/api/client';
import Link from 'next/link';
import Image from 'next/image';

const AddLandPage: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'DZD',
    listing_type: 'sale' as 'sale' | 'rent',
    area_size: '',
    area_unit: 'hectare' as 'hectare' | 'acre' | 'dunum',
    location: '',
    contact_phone: '',
    water_source: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 5) {
      setError('يمكنك تحميل حتى 5 صور فقط');
      return;
    }
    setFiles(selectedFiles);
    setError(null);
  };

  // Helper function to convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert image to base64'));
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!files || files.length === 0) return [];

    const imageUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`الصورة ${file.name} كبيرة جداً. الحد الأقصى 5 ميجابايت`);
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} ليس ملف صورة صالح`);
      }

      try {
        // Convert image to base64 instead of uploading to Firebase Storage
        const base64String = await convertImageToBase64(file);
        imageUrls.push(base64String);
        console.log('Image converted to base64 successfully');
      } catch (error) {
        console.error('Error converting image:', error);
        // If conversion fails, use a placeholder image
        imageUrls.push('/placeholder-image.jpg');
        console.log('Using placeholder image due to conversion failure');
      }
    }

    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Starting land form submission...');
      
      // Upload images first
      const imageUrls = await uploadImages();
      console.log('Images processed:', imageUrls.length);

      const landData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: formData.currency,
        listing_type: formData.listing_type,
        area_size: parseFloat(formData.area_size),
        area_unit: formData.area_unit,
        location: formData.location,
        contact_phone: formData.contact_phone || null,
        water_source: formData.water_source || null,
        images: imageUrls,
        is_available: true,
        is_featured: false,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Land data prepared:', landData);

      // Get Clerk token
      const token = await getToken();
      if (!token) {
        router.push('/sign-in');
        return;
      }

      // Use API client to create land listing
      const newLand = await apiClient.createLand(token, landData);
      console.log('Land added successfully:', newLand);

      // Show success message
      alert('تم إضافة الأرض بنجاح!');

      // Redirect to land page
      router.push('/land');
      router.refresh();
    } catch (error) {
      console.error('Error creating land listing:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      setError(`خطأ في إضافة الأرض: ${errorMessage}`);
      alert(`خطأ في إضافة الأرض: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="glass-arabic p-8 text-center">
            <h1 className="text-2xl font-bold text-green-800 mb-4">يجب تسجيل الدخول</h1>
            <p className="text-green-600 mb-6">يجب تسجيل الدخول لإضافة إعلان أرض جديدة</p>
            <Link href="/sign-in" className="btn-primary-arabic">
              <i className="fas fa-sign-in-alt ml-2"></i>
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="arabic-title mb-4">إضافة أرض جديدة</h1>
          <p className="arabic-subtitle">أضف أرضك للبيع أو الإيجار في منصة الغلة</p>
        </div>

        {/* Form */}
        <div className="glass-arabic p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-green-700 font-bold mb-2">عنوان الإعلان *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="search-arabic w-full"
                  placeholder="مثال: مزرعة كبيرة للبيع في تيارت"
                />
              </div>

              <div>
                <label className="block text-green-700 font-bold mb-2">نوع الإعلان *</label>
                <select
                  name="listing_type"
                  value={formData.listing_type}
                  onChange={handleInputChange}
                  required
                  className="search-arabic w-full"
                >
                  <option value="sale">للبيع</option>
                  <option value="rent">للإيجار</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-green-700 font-bold mb-2">وصف الأرض *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="search-arabic w-full"
                placeholder="وصف مفصل للأرض، نوع التربة، المحاصيل المناسبة..."
              />
            </div>

            {/* Price and Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-green-700 font-bold mb-2">السعر *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="search-arabic w-full"
                  placeholder="45000000"
                />
              </div>

              <div>
                <label className="block text-green-700 font-bold mb-2">العملة</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="search-arabic w-full"
                >
                  <option value="DZD">دينار جزائري</option>
                  <option value="USD">دولار أمريكي</option>
                  <option value="EUR">يورو</option>
                </select>
              </div>

              <div>
                <label className="block text-green-700 font-bold mb-2">المساحة *</label>
                <input
                  type="number"
                  name="area_size"
                  value={formData.area_size}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.1"
                  className="search-arabic w-full"
                  placeholder="50"
                />
              </div>
            </div>

            {/* Area Unit and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-green-700 font-bold mb-2">وحدة المساحة</label>
                <select
                  name="area_unit"
                  value={formData.area_unit}
                  onChange={handleInputChange}
                  className="search-arabic w-full"
                >
                  <option value="hectare">هكتار</option>
                  <option value="acre">فدان</option>
                  <option value="dunum">دونم</option>
                </select>
              </div>

              <div>
                <label className="block text-green-700 font-bold mb-2">الموقع *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="search-arabic w-full"
                  placeholder="مثال: تيارت، سطيف، قسنطينة..."
                />
              </div>
            </div>

            {/* Soil and Water */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-green-700 font-bold mb-2">رقم الهاتف</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="search-arabic w-full"
                  placeholder="مثال: 0770123456"
                />
              </div>

              <div>
                <label className="block text-green-700 font-bold mb-2">مصدر المياه</label>
                <input
                  type="text"
                  name="water_source"
                  value={formData.water_source}
                  onChange={handleInputChange}
                  className="search-arabic w-full"
                  placeholder="مثال: بئر ارتوازي + نظام ري"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="flex flex-col items-center justify-center w-full">
              <label htmlFor="image-upload" className="block text-green-700 font-bold mb-2">
                صور الأرض (حتى 5 صور)
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                ref={fileInputRef}
                className="block w-full text-sm text-green-900 border border-green-300 rounded-lg cursor-pointer bg-green-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {files && files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {Array.from(files).map((file, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-arabic flex-1"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin ml-2"></i>
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus ml-2"></i>
                    إضافة الإعلان
                  </>
                )}
              </button>

              <Link href="/land" className="btn-secondary-arabic">
                <i className="fas fa-times ml-2"></i>
                إلغاء
              </Link>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="glass-arabic p-6 mt-8">
          <h3 className="text-lg font-bold text-green-800 mb-4">
            <i className="fas fa-lightbulb text-yellow-500 ml-2"></i>
            نصائح لإعلان أفضل
          </h3>
          <ul className="space-y-2 text-green-700">
            <li>• اكتب وصفاً مفصلاً ومفيداً للأرض</li>
            <li>• اذكر نوع التربة والمحاصيل المناسبة</li>
            <li>• وضح مصادر المياه والري المتاحة</li>
            <li>• أضف صور واضحة للأرض إن أمكن</li>
            <li>• حدد السعر المناسب حسب السوق المحلي</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddLandPage; 
