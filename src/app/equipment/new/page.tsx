'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useAuth } from '@clerk/nextjs'
import { apiClient } from '@/lib/api/client'
import { motion } from 'framer-motion'
import ProgressIndicator, { ProgressStep } from '@/components/ProgressIndicator'
import EnhancedErrorDisplay from '@/components/EnhancedErrorDisplay'
import imageOptimizer, { OptimizedImage } from '@/lib/imageOptimizer'
import offlineFormManager, { SavedForm } from '@/lib/offlineFormManager'
import { 
  Upload, 
  X, 
  Plus, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Camera,
  DollarSign,
  MapPin,
  Settings,
  FileText,
  Info
} from 'lucide-react'
import Image from 'next/image'

export default function EquipmentForm() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'good' as const,
    location: '',
    contact_phone: '',
    category_id: '', // Will be handled by database trigger
    brand: '',
    model: '',
    year: '',
    hours_used: ''
  })

  // Progress tracking
  const [currentStep, setCurrentStep] = useState<string>('')
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([
    {
      id: 'validating',
      title: 'التحقق من البيانات',
      description: 'جاري التحقق من صحة المعلومات المدخلة',
      status: 'pending'
    },
    {
      id: 'uploading',
      title: 'رفع الصور',
      description: 'جاري معالجة ورفع الصور المرفقة',
      status: 'pending'
    },
    {
      id: 'processing',
      title: 'معالجة الإعلان',
      description: 'جاري إعداد الإعلان للنشر',
      status: 'pending'
    },
    {
      id: 'publishing',
      title: 'نشر الإعلان',
      description: 'جاري نشر الإعلان في السوق',
      status: 'pending'
    }
  ])

  const updateStepStatus = (stepId: string, status: ProgressStep['status']) => {
    setProgressSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
  }

  const [formId] = useState(() => offlineFormManager.generateFormId())
  const [hasOfflineData, setHasOfflineData] = useState(false)

  // Load offline form data on component mount
  useEffect(() => {
    const savedForm = offlineFormManager.loadForm(formId);
    if (savedForm && savedForm.formType === 'equipment') {
      setFormData(prev => ({ ...prev, ...savedForm.data }));
      setHasOfflineData(true);
      console.log('Loaded form data from offline storage');
    }
  }, [formId]);

  // Auto-save form data when it changes
  useEffect(() => {
    const saveData = () => {
      offlineFormManager.autoSaveForm('equipment', formId, formData);
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData, formId]);

  // Remove category selection for now - let database handle it
  // const categoryOptions = [
  //   { value: 'tractor', label: 'جرارات', icon: '🚜' },
  //   { value: 'harvester', label: 'حصادات', icon: '🌾' },
  //   { value: 'plow', label: 'محاريث', icon: '⚒️' },
  //   { value: 'seeder', label: 'آلات بذر', icon: '🌱' },
  //   { value: 'sprayer', label: 'رشاشات', icon: '💧' },
  //   { value: 'irrigation', label: 'أنظمة ري', icon: '🌀' },
  //   { value: 'tools', label: 'أدوات زراعية', icon: '🔧' }
  // ]

  // Set default category on component mount
  // useEffect(() => {
  //   if (!formData.category_id && categoryOptions.length > 0) {
  //     setFormData(prev => ({ ...prev, category_id: categoryOptions[0].value }))
  //   }
  // }, [])
  
  const [files, setFiles] = useState<FileList | null>(null)
  const [optimizedImages, setOptimizedImages] = useState<OptimizedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    if (selectedFiles.length > 5) {
      setError('يمكنك تحميل حتى 5 صور فقط')
      return
    }

    setError(null)
    setFiles(selectedFiles)

    try {
      // Show loading state for optimization
      setUploading(true)
      
      // Optimize images
      const optimized = await imageOptimizer.optimizeImages(selectedFiles, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format: 'webp'
      })

      setOptimizedImages(optimized)
      
      // Log optimization results
      const totalOriginalSize = optimized.reduce((sum, img) => sum + img.originalSize, 0)
      const totalOptimizedSize = optimized.reduce((sum, img) => sum + img.optimizedSize, 0)
      const totalCompression = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100
      
      console.log(`Image optimization complete: ${totalCompression.toFixed(1)}% size reduction`)
      
    } catch (error) {
      console.error('Image optimization failed:', error)
      setError('فشل في تحسين الصور. سيتم استخدام الصور الأصلية.')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    if (!files) return
    
    const dt = new DataTransfer()
    Array.from(files).forEach((file, i) => {
      if (i !== index) dt.items.add(file)
    })
    setFiles(dt.files)
  }

  // Helper function to convert image to base64
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.onerror = () => {
        reject(new Error('Failed to convert image to base64'))
      }
      reader.readAsDataURL(file)
    })
  }

  const uploadImages = async (): Promise<string[]> => {
    // Use optimized images if available, otherwise fallback to original files
    const imagesToProcess = optimizedImages.length > 0 ? optimizedImages : files
    
    if (!imagesToProcess || imagesToProcess.length === 0) return []

    const imageUrls: string[] = []

    for (let i = 0; i < imagesToProcess.length; i++) {
      const item = imagesToProcess[i]
      const file = 'file' in item ? item.file : item
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`الصورة ${file.name} كبيرة جداً. الحد الأقصى 5 ميجابايت`)
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} ليس ملف صورة صالح`)
      }

      try {
        // If we have optimized images, use their dataUrl
        if (optimizedImages.length > 0 && optimizedImages[i]) {
          imageUrls.push(optimizedImages[i].dataUrl)
        } else {
          // Fallback to original conversion
          const base64String = await convertImageToBase64(file)
          imageUrls.push(base64String)
        }
      } catch (error) {
        console.error('Error processing image:', error)
        imageUrls.push('/placeholder-image.jpg')
      }
    }

    return imageUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('يجب تسجيل الدخول لإضافة معدات')
      return
    }

    // Basic validation - only require title, price, and location
    if (!formData.title.trim()) {
      setError('عنوان المعدة مطلوب')
      return
    }

    if (!formData.price.trim()) {
      setError('سعر المعدة مطلوب')
      return
    }

    if (!formData.location.trim()) {
      setError('موقع المعدة مطلوب')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Step 1: Validating
      setCurrentStep('validating')
      updateStepStatus('validating', 'active')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate validation
      updateStepStatus('validating', 'completed')

      // Step 2: Uploading images
      setCurrentStep('uploading')
      updateStepStatus('uploading', 'active')
      const imageUrls = await uploadImages()
      updateStepStatus('uploading', 'completed')

      // Step 3: Processing
      setCurrentStep('processing')
      updateStepStatus('processing', 'active')
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate processing
      updateStepStatus('processing', 'completed')

      // Create equipment data with smart defaults
      const equipmentData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        currency: 'DZD',
        // category_id will be set by database trigger
        condition: formData.condition,
        location: formData.location.trim(),
        contact_phone: formData.contact_phone.trim() || null,
        brand: formData.brand.trim() || null,
        model: formData.model.trim() || null,
        year: formData.year ? parseInt(formData.year) : null,
        hours_used: formData.hours_used ? parseInt(formData.hours_used) : null,
        images: imageUrls,
        is_available: true,
        is_featured: false,
        view_count: 0,
        coordinates: null
      }

      console.log('🔍 Equipment data being sent:', equipmentData)

      // Step 4: Publishing
      setCurrentStep('publishing')
      updateStepStatus('publishing', 'active')

      // Get Clerk token
      const token = await getToken()
      if (!token) {
        router.push('/sign-in')
        return
      }

      // Use API client to create equipment
      const data = await apiClient.createEquipment(token, equipmentData)

      console.log('Equipment created successfully:', data)
      updateStepStatus('publishing', 'completed')
      setSuccess(true)
      
      // Clear offline form data after successful submission
      offlineFormManager.deleteForm(formId);
      
      // Force refresh and redirect
      setTimeout(() => {
        router.push('/equipment')
        // Force a page refresh to ensure data is updated
        window.location.reload()
      }, 2000)
      
      return data
    } catch (error) {
      console.error('Error creating equipment:', error)
      setError((error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-4">يجب تسجيل الدخول أولاً</h1>
          <p className="text-white/70 mb-8">سجل دخولك لإضافة معدات جديدة</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            تسجيل الدخول
          </button>
        </motion.div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="text-6xl mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <span>✅</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-4">تم إضافة المعدات بنجاح!</h1>
          <p className="text-white/70 mb-6">تم نشر إعلانك في السوق الزراعي</p>
          <p className="text-emerald-300 mb-8">سيتم توجيهك إلى صفحة المعدات خلال ثانيتين...</p>
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 text-white">
      {/* Header */}
      <div className="relative z-10 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>العودة</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">إضافة معدات جديدة</h1>
                <p className="text-sm text-white/60">أضف معداتك للبيع أو التأجير</p>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-300 mb-1">نصائح للنشر السريع</h3>
                <p className="text-sm text-blue-200/80">
                  الحقول المطلوبة فقط: العنوان، السعر، الموقع. باقي الحقول اختيارية ويمكنك إضافتها لاحقاً.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Error Display */}
          {error && (
            <div className="mb-6">
              <EnhancedErrorDisplay
                error={error}
                onRetry={() => {
                  setError(null);
                  // Retry the last action
                  if (uploading) {
                    handleSubmit(new Event('submit') as any);
                  }
                }}
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          {/* Offline Data Recovery Notification */}
          {hasOfflineData && (
            <motion.div 
              className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-blue-300 font-medium">تم استعادة البيانات المحفوظة</p>
                  <p className="text-blue-200/80 text-sm">تم تحميل البيانات من التخزين المحلي</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Indicator */}
          {uploading && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ProgressIndicator 
                steps={progressSteps}
                currentStep={currentStep}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6"
              />
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">المعلومات الأساسية</h2>
              </div>

              {/* Title - Required */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-white/90 mb-3">
                  عنوان المعدة * <span className="text-red-400">(مطلوب)</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
                  placeholder="مثال: جرار زراعي جديد"
                />
              </div>

              {/* Price - Required */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-white/90 mb-3">
                  السعر (دينار جزائري) * <span className="text-red-400">(مطلوب)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50">💰</div>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
                    placeholder="500000"
                  />
                </div>
              </div>

              {/* Location - Required */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-white/90 mb-3">
                  الموقع * <span className="text-red-400">(مطلوب)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50">📍</div>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
                    placeholder="مثال: الجزائر العاصمة"
                  />
                </div>
              </div>

              {/* Contact Phone - Optional */}
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-white/90 mb-3">
                  رقم الهاتف للتواصل <span className="text-gray-400">(اختياري)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50">📞</div>
                  <input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
                    placeholder="0770123456"
                  />
                </div>
              </div>
            </div>

            {/* Optional Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">تفاصيل إضافية <span className="text-sm text-white/60">(اختيارية)</span></h2>
              </div>

              {/* Description - Optional */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-white/90 mb-3">
                  الوصف التفصيلي <span className="text-gray-400">(اختياري)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300 resize-none"
                  placeholder="وصف تفصيلي للمعدة، الحالة، الاستخدام..."
                />
              </div>

              {/* Condition */}
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-white/90 mb-3">
                  حالة المعدة
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
                >
                  <option value="new">جديد</option>
                  <option value="excellent">ممتاز</option>
                  <option value="good">جيد</option>
                  <option value="fair">مقبول</option>
                  <option value="poor">يحتاج صيانة</option>
                </select>
              </div>

              {/* Brand and Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-white/90 mb-3">
                    الماركة
                  </label>
                  <input
                    id="brand"
                    name="brand"
                    type="text"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
                    placeholder="مثال: John Deere"
                  />
                </div>
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-white/90 mb-3">
                    الموديل
                  </label>
                  <input
                    id="model"
                    name="model"
                    type="text"
                    value={formData.model}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
                    placeholder="مثال: 5075E"
                  />
                </div>
              </div>

              {/* Year and Hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-white/90 mb-3">
                    سنة الصنع
                  </label>
                  <input
                    id="year"
                    name="year"
                    type="number"
                    value={formData.year}
                    onChange={handleChange}
                    min="1900"
                    max="2024"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
                    placeholder="2020"
                  />
                </div>
                <div>
                  <label htmlFor="hours_used" className="block text-sm font-medium text-white/90 mb-3">
                    ساعات الاستخدام
                  </label>
                  <input
                    id="hours_used"
                    name="hours_used"
                    type="number"
                    value={formData.hours_used}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/50 transition-all duration-300"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">الصور <span className="text-sm text-white/60">(اختيارية)</span></h2>
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {!files || files.length === 0 ? (
                  <div>
                    <div className="text-6xl mb-4">📸</div>
                    <h3 className="text-lg font-semibold mb-2">أضف صور للمعدة</h3>
                    <p className="text-white/60 mb-4">اسحب الصور هنا أو اضغط لاختيار الملفات</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/30 transition-all duration-300"
                    >
                      <Upload className="w-5 h-5 inline mr-2" />
                      اختيار الصور
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Optimization Info */}
                    {optimizedImages.length > 0 && (
                      <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-green-300 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>تم تحسين الصور بنجاح</span>
                        </div>
                        <div className="mt-2 text-xs text-green-200/80">
                          {(() => {
                            const totalOriginal = optimizedImages.reduce((sum, img) => sum + img.originalSize, 0)
                            const totalOptimized = optimizedImages.reduce((sum, img) => sum + img.optimizedSize, 0)
                            const compression = ((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1)
                            return `تم تقليل الحجم بنسبة ${compression}% (${imageOptimizer.formatFileSize(totalOriginal)} → ${imageOptimizer.formatFileSize(totalOptimized)})`
                          })()}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                      {(optimizedImages.length > 0 ? optimizedImages : Array.from(files)).map((item, index) => {
                        const file = 'file' in item ? item.file : item
                        const imageUrl = 'dataUrl' in item ? item.dataUrl : URL.createObjectURL(file)
                        const originalSize = 'originalSize' in item ? item.originalSize : file.size
                        const optimizedSize = 'optimizedSize' in item ? item.optimizedSize : file.size
                        
                        return (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            
                            {/* Size info overlay */}
                            {optimizedImages.length > 0 && (
                              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                                {imageOptimizer.formatFileSize(optimizedSize)}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-300 hover:bg-emerald-500/30 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      إضافة المزيد
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={uploading}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    نشر المعدة
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
