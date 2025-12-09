'use client';

import React, { useState, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';

const plantTypes = [
  { value: 'fruit_trees', label: 'أشجار مثمرة' },
  { value: 'ornamental', label: 'نباتات زينة' },
  { value: 'vegetables', label: 'خضروات' },
  { value: 'herbs', label: 'أعشاب' },
  { value: 'forest', label: 'أشجار حرجية' },
  { value: 'other', label: 'أخرى' },
];

const locations = [
  'الجزائر', 'وهران', 'قسنطينة', 'سطيف', 'تيارت',
  'البليدة', 'مستغانم', 'ورقلة', 'بسكرة', 'عنابة',
  'باتنة', 'بجاية', 'سكيكدة', 'تلمسان'
];

export default function NewNurseryPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    plant_type: 'fruit_trees',
    quantity: '1',
    location: '',
    contact_phone: '',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length && imageFiles.length + newFiles.length < 5; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        continue;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setImageFiles(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.title || !formData.price || !formData.location) {
        throw new Error('يرجى ملء جميع الحقول المطلوبة');
      }

      const token = await getToken();
      if (!token) throw new Error('يرجى تسجيل الدخول أولاً');

      // Upload images to R2
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        try {
          const uploadResult = await apiClient.uploadFiles(token, imageFiles, 'nurseries');
          imageUrls = uploadResult.urls || [];
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
        } finally {
          setUploadingImages(false);
        }
      }

      const nurseryData = {
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        currency: 'دج',
        plant_type: formData.plant_type,
        quantity: parseInt(formData.quantity),
        location: formData.location,
        contact_phone: formData.contact_phone || null,
        images: imageUrls,
        is_available: true,
        is_featured: false,
      };

      await apiClient.createNursery(token, nurseryData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الشتلة');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="page-form-container flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2d5016] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-form-container">
        <div className="page-form-wrapper">
          <div className="auth-required">
            <h2>يجب تسجيل الدخول</h2>
            <p>لإضافة شتلات جديدة، يرجى تسجيل الدخول أولاً</p>
            <Link href="/sign-in">تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-form-container">
        <div className="page-form-wrapper">
          <div className="form-unified">
            <div className="form-success-screen">
              <div className="form-success-checkmark">✓</div>
              <h2>تم إضافة الشتلة بنجاح</h2>
              <p>سيتم مراجعة إعلانك ونشره قريباً</p>
              <div className="flex gap-3 justify-center">
                <Link href="/nurseries" className="btn-form-primary">
                  عرض الشتلات
                </Link>
                <button onClick={() => { setSuccess(false); setFormData({ title: '', description: '', price: '', plant_type: 'fruit_trees', quantity: '1', location: '', contact_phone: '' }); setImages([]); }} className="btn-form-secondary">
                  إضافة أخرى
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-form-container">
      <div className="page-form-wrapper">
        <Link href="/nurseries" className="page-form-back">
          ← العودة للشتلات
        </Link>

        <div className="form-unified">
          <div className="form-unified-header">
            <h1>إضافة شتلة جديدة</h1>
            <p>أضف شتلاتك للنباتات في منصة الغلة</p>
          </div>

          <div className="form-unified-body">
            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="form-section-title">المعلومات الأساسية</h3>
                <div className="form-grid form-grid-2">
                  <div className="form-field">
                    <label className="form-label form-label-required">عنوان الإعلان</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="مثال: شتلات برتقال طازجة"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">نوع النبات</label>
                    <select
                      name="plant_type"
                      value={formData.plant_type}
                      onChange={handleInputChange}
                      className="form-input form-select"
                      required
                    >
                      {plantTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">السعر (دج)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">الولاية</label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input form-select"
                      required
                    >
                      <option value="">اختر الولاية</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Nursery Details */}
              <div className="form-section">
                <h3 className="form-section-title">تفاصيل الشتلة</h3>
                <div className="form-grid form-grid-2">
                  <div className="form-field">
                    <label className="form-label form-label-required">الكمية</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="form-input"
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">رقم الهاتف</label>
                    <input
                      type="tel"
                      name="contact_phone"
                      value={formData.contact_phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="0XXX XXX XXX"
                    />
                  </div>
                </div>
                <div className="form-field mt-4">
                  <label className="form-label">الوصف</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input form-textarea"
                    placeholder="وصف مفصل عن الشتلات..."
                  />
                </div>
              </div>

              {/* Images */}
              <div className="form-section">
                <h3 className="form-section-title">الصور</h3>
                <div
                  className="form-image-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="form-image-upload-text">اضغط لإضافة صور</p>
                  <p className="form-image-upload-hint">يمكنك إضافة حتى 5 صور (الحد الأقصى 5 ميجابايت لكل صورة)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                {images.length > 0 && (
                  <div className="form-image-grid">
                    {images.map((img, index) => (
                      <div key={index} className="form-image-preview">
                        <Image src={img} alt={`صورة ${index + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="form-image-remove"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="form-actions">
                <Link href="/nurseries" className="btn-form-secondary">
                  إلغاء
                </Link>
                <button type="submit" disabled={loading} className="btn-form-primary">
                  {loading ? 'جاري الإضافة...' : 'إضافة الشتلة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
