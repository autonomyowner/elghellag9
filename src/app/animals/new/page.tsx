'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const NewAnimalListingPage: React.FC = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'DZD',
    animal_type: 'sheep' as 'sheep' | 'cow' | 'goat' | 'chicken' | 'camel' | 'horse' | 'other',
    breed: '',
    age_months: '',
    gender: 'male' as 'male' | 'female' | 'mixed',
    quantity: '1',
    health_status: '',
    vaccination_status: false,
    location: '',
    weight_kg: '',
    price_per_head: true,
    purpose: 'meat' as 'meat' | 'dairy' | 'breeding' | 'work' | 'pets' | 'other',
    is_featured: false
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);


  // Check authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">يجب تسجيل الدخول</h2>
          <p className="text-gray-600 mb-6">يجب عليك تسجيل الدخول لإضافة حيوانات جديدة</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors text-white"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      setError('يمكنك رفع حتى 10 صور فقط');
      return;
    }

    // Validate file sizes and types
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setError('يمكنك رفع صور فقط');
        return false;
      }
      return true;
    });

    if (validFiles.length !== files.length) return;

    setImages(prev => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (listingId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    // Check if user is authenticated
    if (!user) {
      console.log('User not authenticated, using placeholder images');
      return images.map(() => '/placeholder-image.jpg');
    }

    for (const [index, image] of images.entries()) {
      try {
        // Convert image to base64 instead of uploading to Firebase Storage
        const base64String = await convertImageToBase64(image);
        uploadedUrls.push(base64String);
        console.log('Image converted to base64 successfully');
      } catch (error) {
        console.error('Error converting image:', error);
        // If conversion fails, use a placeholder image
        uploadedUrls.push('/placeholder-image.jpg');
        console.log('Using placeholder image due to conversion failure');
      }
    }

    return uploadedUrls;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('يجب تسجيل الدخول أولاً');
      return;
    }

    // Validation
    if (!formData.title.trim()) {
      setError('عنوان الإعلان مطلوب');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('السعر مطلوب ويجب أن يكون أكبر من صفر');
      return;
    }

    if (!formData.location.trim()) {
      setError('الموقع مطلوب');
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      setError('الكمية مطلوبة ويجب أن تكون أكبر من صفر');
      return;
    }

    if (images.length === 0) {
      setError('يجب رفع صورة واحدة على الأقل');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload images first
      const imageUrls = await uploadImages('temp_id');

      // Create the listing with images
      const listingData = {
        user_id: user.id, // Use user.id for Supabase
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        currency: formData.currency,
        animal_type: formData.animal_type,
        breed: formData.breed.trim() || null,
        age_months: formData.age_months ? parseInt(formData.age_months) : null,
        gender: formData.gender,
        quantity: parseInt(formData.quantity),
        health_status: formData.health_status.trim() || null,
        vaccination_status: formData.vaccination_status,
        location: formData.location.trim(),
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        price_per_head: formData.price_per_head,
        purpose: formData.purpose,
        is_available: true,
        is_featured: formData.is_featured,
        images: imageUrls
      };

      // Get Clerk token
      const token = await getToken();
      if (!token) {
        router.push('/sign-in');
        return;
      }

      // Add to database using API client
      const result = await apiClient.createAnimal(token, listingData);

      console.log('Animal listing created successfully:', result);
      setSuccess(true);
      setTimeout(() => {
        router.push('/animals');
      }, 2000);

    } catch (err: any) {
      console.error('Error creating listing:', err);
      setError(err.message || 'حدث خطأ في إنشاء الإعلان');
    } finally {
      setLoading(false);
    }
  };

  const animalTypeLabels = {
    sheep: 'أغنام',
    cow: 'أبقار',
    goat: 'ماعز',
    chicken: 'دجاج',
    camel: 'إبل',
    horse: 'خيول',
    other: 'أخرى'
  };

  const purposeLabels = {
    meat: 'لحم',
    dairy: 'ألبان',
    breeding: 'تربية',
    work: 'عمل',
    pets: 'حيوانات أليفة',
    other: 'أخرى'
  };

  const genderLabels = {
    male: 'ذكر',
    female: 'أنثى',
    mixed: 'مختلط'
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-green-600 mb-4"></i>
          <p className="text-gray-600">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <i className="fas fa-check-circle text-6xl text-green-600 mb-4"></i>
          <h2 className="text-2xl font-bold text-green-600 mb-2">تم إنشاء الإعلان بنجاح!</h2>
          <p className="text-gray-600 mb-4">جاري توجيهك لصفحة الإعلان...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center">إضافة إعلان حيوان جديد</h1>
          <p className="text-center mt-2 opacity-90">أضف حيواناتك للبيع في سوق الحيوانات</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle ml-2"></i>
                  {error}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                <i className="fas fa-info-circle ml-2 text-green-600"></i>
                المعلومات الأساسية
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان الإعلان *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="مثال: أغنام عواسي للبيع"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الحيوان *
                  </label>
                  <select
                    name="animal_type"
                    value={formData.animal_type}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {Object.entries(animalTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السلالة
                  </label>
                  <input
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    placeholder="مثال: عواسي، هولشتاين"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الغرض من البيع *
                  </label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {Object.entries(purposeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنس *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    {Object.entries(genderLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العدد *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العمر (بالأشهر)
                  </label>
                  <input
                    type="number"
                    name="age_months"
                    value={formData.age_months}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوزن (كيلوغرام)
                  </label>
                  <input
                    type="number"
                    name="weight_kg"
                    value={formData.weight_kg}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="اكتب وصف مفصل للحيوانات..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Health Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                <i className="fas fa-heart ml-2 text-red-500"></i>
                المعلومات الصحية
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة الصحية
                  </label>
                  <input
                    type="text"
                    name="health_status"
                    value={formData.health_status}
                    onChange={handleInputChange}
                    placeholder="مثال: ممتازة، جيدة"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-3 space-x-reverse">
                    <input
                      type="checkbox"
                      name="vaccination_status"
                      checked={formData.vaccination_status}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      الحيوانات مُطعمة
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Price and Location */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                <i className="fas fa-dollar-sign ml-2 text-green-600"></i>
                السعر والموقع
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر *
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="p-3 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                    >
                      <option value="DZD">دج</option>
                      <option value="USD">$</option>
                      <option value="EUR">€</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-3 space-x-reverse mt-6">
                    <input
                      type="checkbox"
                      name="price_per_head"
                      checked={formData.price_per_head}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      السعر لكل رأس
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.price_per_head ? 
                      'السعر المدخل هو لكل رأس واحد' : 
                      'السعر المدخل هو للكمية الإجمالية'
                    }
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموقع *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="مثال: ولاية الجزائر، دائرة بئر مراد رايس"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                <i className="fas fa-images ml-2 text-blue-600"></i>
                الصور *
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رفع الصور (حتى 10 صور، حد أقصى 5 ميجابايت لكل صورة)
                </label>
                <input
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Options */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                <i className="fas fa-cog ml-2 text-gray-600"></i>
                خيارات إضافية
              </h2>

              <div>
                <label className="flex items-center space-x-3 space-x-reverse">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    إعلان مميز
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  الإعلانات المميزة تظهر في المقدمة وتحصل على مشاهدات أكثر
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 space-x-reverse">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin ml-2"></i>
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus ml-2"></i>
                    نشر الإعلان
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewAnimalListingPage;
