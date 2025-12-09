'use client';

import React, { useState, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api/client';

const animalTypes = [
  { value: 'sheep', label: 'أغنام' },
  { value: 'cow', label: 'أبقار' },
  { value: 'goat', label: 'ماعز' },
  { value: 'chicken', label: 'دجاج' },
  { value: 'camel', label: 'إبل' },
  { value: 'horse', label: 'خيول' },
  { value: 'other', label: 'أخرى' },
];

const purposes = [
  { value: 'meat', label: 'لحم' },
  { value: 'dairy', label: 'ألبان' },
  { value: 'breeding', label: 'تربية' },
  { value: 'work', label: 'عمل' },
  { value: 'pets', label: 'حيوانات أليفة' },
  { value: 'other', label: 'أخرى' },
];

const genders = [
  { value: 'male', label: 'ذكر' },
  { value: 'female', label: 'أنثى' },
  { value: 'mixed', label: 'مختلط' },
];

const locations = [
  'الجزائر', 'وهران', 'قسنطينة', 'سطيف', 'تيارت',
  'البليدة', 'مستغانم', 'ورقلة', 'بسكرة', 'عنابة',
  'باتنة', 'بجاية', 'سكيكدة', 'تلمسان'
];

export default function NewAnimalPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    animal_type: 'sheep',
    breed: '',
    age_months: '',
    gender: 'male',
    quantity: '1',
    health_status: '',
    vaccination_status: false,
    location: '',
    weight_kg: '',
    price_per_head: true,
    purpose: 'meat',
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length && imageFiles.length + newFiles.length < 10; i++) {
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

      if (imageFiles.length === 0) {
        throw new Error('يجب رفع صورة واحدة على الأقل');
      }

      const token = await getToken();
      if (!token) throw new Error('يرجى تسجيل الدخول أولاً');

      // Upload images to R2
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploadingImages(true);
        try {
          const uploadResult = await apiClient.uploadFiles(token, imageFiles, 'animals');
          imageUrls = uploadResult.urls || [];
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
        } finally {
          setUploadingImages(false);
        }
      }

      const animalData = {
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        currency: 'دج',
        animal_type: formData.animal_type,
        breed: formData.breed || null,
        age_months: formData.age_months ? parseInt(formData.age_months) : null,
        gender: formData.gender,
        quantity: parseInt(formData.quantity),
        health_status: formData.health_status || null,
        vaccination_status: formData.vaccination_status,
        location: formData.location,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        price_per_head: formData.price_per_head,
        purpose: formData.purpose,
        images: imageUrls,
        is_available: true,
        is_featured: false,
      };

      await apiClient.createAnimal(token, animalData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الحيوان');
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
            <p>لإضافة حيوانات جديدة، يرجى تسجيل الدخول أولاً</p>
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
              <h2>تم إضافة الحيوان بنجاح</h2>
              <p>سيتم مراجعة إعلانك ونشره قريباً</p>
              <div className="flex gap-3 justify-center">
                <Link href="/animals" className="btn-form-primary">
                  عرض الحيوانات
                </Link>
                <button onClick={() => { setSuccess(false); setFormData({ title: '', description: '', price: '', animal_type: 'sheep', breed: '', age_months: '', gender: 'male', quantity: '1', health_status: '', vaccination_status: false, location: '', weight_kg: '', price_per_head: true, purpose: 'meat' }); setImages([]); }} className="btn-form-secondary">
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
        <Link href="/animals" className="page-form-back">
          ← العودة للحيوانات
        </Link>

        <div className="form-unified">
          <div className="form-unified-header">
            <h1>إضافة حيوان جديد</h1>
            <p>أضف حيواناتك للبيع في سوق الحيوانات</p>
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
                      placeholder="مثال: أغنام عواسي للبيع"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">نوع الحيوان</label>
                    <select
                      name="animal_type"
                      value={formData.animal_type}
                      onChange={handleInputChange}
                      className="form-input form-select"
                      required
                    >
                      {animalTypes.map(type => (
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

              {/* Animal Details */}
              <div className="form-section">
                <h3 className="form-section-title">تفاصيل الحيوان</h3>
                <div className="form-grid form-grid-3">
                  <div className="form-field">
                    <label className="form-label">السلالة</label>
                    <input
                      type="text"
                      name="breed"
                      value={formData.breed}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="مثال: عواسي"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">الغرض من البيع</label>
                    <select
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      className="form-input form-select"
                      required
                    >
                      {purposes.map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">الجنس</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-input form-select"
                      required
                    >
                      {genders.map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label form-label-required">العدد</label>
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
                    <label className="form-label">العمر (بالأشهر)</label>
                    <input
                      type="number"
                      name="age_months"
                      value={formData.age_months}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">الوزن (كيلوغرام)</label>
                    <input
                      type="number"
                      name="weight_kg"
                      value={formData.weight_kg}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Health Information */}
              <div className="form-section">
                <h3 className="form-section-title">المعلومات الصحية</h3>
                <div className="form-grid form-grid-2">
                  <div className="form-field">
                    <label className="form-label">الحالة الصحية</label>
                    <input
                      type="text"
                      name="health_status"
                      value={formData.health_status}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="مثال: ممتازة، جيدة"
                    />
                  </div>
                  <div className="form-field flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      name="vaccination_status"
                      checked={formData.vaccination_status}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label className="form-label mb-0">الحيوانات مُطعمة</label>
                  </div>
                </div>
                <div className="form-field mt-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="price_per_head"
                      checked={formData.price_per_head}
                      onChange={handleInputChange}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <label className="form-label mb-0">السعر لكل رأس</label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 mr-8">
                    {formData.price_per_head ? 'السعر المدخل هو لكل رأس واحد' : 'السعر المدخل هو للكمية الإجمالية'}
                  </p>
                </div>
                <div className="form-field mt-4">
                  <label className="form-label">الوصف</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-input form-textarea"
                    placeholder="اكتب وصف مفصل للحيوانات..."
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
                  <p className="form-image-upload-hint">يمكنك إضافة حتى 10 صور (الحد الأقصى 5 ميجابايت لكل صورة)</p>
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
                <Link href="/animals" className="btn-form-secondary">
                  إلغاء
                </Link>
                <button type="submit" disabled={loading} className="btn-form-primary">
                  {loading ? 'جاري الإضافة...' : 'إضافة الحيوان'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
