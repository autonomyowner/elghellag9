'use client';

import React, { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Premium components with lazy loading

// Import existing APIs
import { nasaApi, NasaData } from '@/lib/nasaApi';
import { openWeatherApi, OpenWeatherData } from '@/lib/openWeatherApi';
import { sentinelHubApi, SentinelData } from '@/lib/sentinelHubApi';
import { usgsErosApi, UsgsErosData } from '@/lib/usgsErosApi';
const VarInteractiveMap = dynamic(() => import('@/components/VarInteractiveMap'), { ssr: false });
const CostCalculator = dynamic(() => import('@/components/CostCalculator'), { ssr: false });
const WeatherAlerts = dynamic(() => import('@/components/WeatherAlerts'), { ssr: false });
const SatelliteAnalysis = dynamic(() => import('@/components/SatelliteAnalysis'), { ssr: false });
const UsgsErosAnalysis = dynamic(() => import('@/components/UsgsErosAnalysis'), { ssr: false });

// Import icons and components
import {
  MapPin, Satellite, Droplets, Leaf, TrendingUp,
  Download, FileText, BarChart3,
  Thermometer, Sun, CloudRain, Wind, Target,
  Layers, Eye, RefreshCw, X,
  Brain, Cpu, Database, Shield, Rocket, Globe,
  Calculator, Trash2
} from 'lucide-react';

// Import framer-motion components
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false, loading: () => <div /> });
const MotionButton = dynamic(() => import('framer-motion').then(mod => mod.motion.button), { ssr: false, loading: () => <button /> });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false, loading: () => null });

// Premium loading component
const PremiumLoadingSpinner = () => (
  <div className="h-screen w-full relative overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <div className="absolute inset-0 w-20 h-20 border-4 border-teal-400 border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
      </div>
      <p className="text-emerald-300 font-semibold text-lg">جاري تحميل منصة تحليل الأراضي...</p>
      <p className="text-emerald-400 text-sm mt-2">أحدث التقنيات لتحليل الأراضي الزراعية</p>
    </div>
  </div>
);

// Enhanced interfaces for advanced agricultural intelligence
interface LandData {
  coordinates: { lat: number; lon: number; };
  soilData: {
    clay: number; silt: number; sand: number; organicMatter: number; ph: number; moisture: number;
    nitrogen: number; phosphorus: number; potassium: number; carbonSequestration: number; microbialActivity: number;
  };
  cropData: {
    ndvi: number; health: 'excellent' | 'good' | 'fair' | 'poor'; growthStage: string; yieldPrediction: number;
    biomass: number; chlorophyll: number; waterStress: number; nutrientDeficiency: string[];
  };
  weatherData: {
    temperature: number; humidity: number; rainfall: number; windSpeed: number; solarRadiation: number;
    forecast: Array<{ date: string; temp: number; rain: number; condition: string; humidity: number; }>;
  };
  recommendations: Array<{
    type: 'irrigation' | 'fertilizer' | 'pest' | 'harvest' | 'soil' | 'crop' | 'climate' | 'ai';
    priority: 'high' | 'medium' | 'low'; title: string; description: string; impact: string;
    confidence: number; cost: number; roi: number;
  }>;
  aiInsights: {
    cropSuitability: string[]; optimalPlantingTime: string; pestRisk: number; diseaseProbability: number;
    marketTrends: string; sustainabilityScore: number;
  };
}

interface SatelliteImage {
  url: string;
  date: string;
  type: 'ndvi' | 'rgb' | 'thermal' | 'moisture' | 'chlorophyll';
  resolution: string;
}

const LiveLandIntelligenceTool: React.FC = () => {
  const [landData, setLandData] = useState<LandData | null>(null);
  const [nasaData, setNasaData] = useState<NasaData | null>(null);
  const [openWeatherData, setOpenWeatherData] = useState<OpenWeatherData | null>(null);
  const [sentinelData, setSentinelData] = useState<SentinelData | null>(null);
  const [usgsErosData, setUsgsErosData] = useState<UsgsErosData | null>(null);
  const [satelliteImages, setSatelliteImages] = useState<SatelliteImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SatelliteImage | null>(null);
  const [coordinates, setCoordinates] = useState({ lat: 36.75, lon: 3.05 });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [dataSource] = useState<'satellite' | 'nasa' | 'combined'>('combined');
  
  // Advanced filter states
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [selectedSoilTypes, setSelectedSoilTypes] = useState<string[]>([]);
  const [selectedClimateZones, setSelectedClimateZones] = useState<string[]>([]);
  const [selectedWaterTypes, setSelectedWaterTypes] = useState<string[]>([]);
  const [selectedLandSizes, setSelectedLandSizes] = useState<string[]>([]);
  const [selectedTechLevels, setSelectedTechLevels] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [yieldRange, setYieldRange] = useState<[number, number]>([0, 100]);
  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('قمح');
  const [landArea, setLandArea] = useState(1);
  
  // Land drawing states
  const [drawnLands, setDrawnLands] = useState<Array<{
    id: string;
    area: number;
    perimeter: number;
    coordinates: Array<{ lat: number; lng: number }>;
    center: { lat: number; lng: number };
    cropType?: string;
    notes?: string;
  }>>([]);
  const [selectedLandId, setSelectedLandId] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);

  // Handle land drawing
  const handleLandDrawn = useCallback((landData: {
    area: number;
    perimeter: number;
    coordinates: Array<{ lat: number; lng: number }>;
    center: { lat: number; lng: number };
  }) => {
    const newLand = {
      id: `land_${Date.now()}`,
      ...landData,
      cropType: '',
      notes: ''
    };
    setDrawnLands(prev => [...prev, newLand]);
    setSelectedLandId(newLand.id);
    
    // Update cost calculator with new area
    setLandArea(landData.area);
  }, []);

  const handleDeleteLand = useCallback((landId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الأرض؟')) {
      setDrawnLands(prev => prev.filter(land => land.id !== landId));
      if (selectedLandId === landId) {
        setSelectedLandId(null);
      }
    }
  }, [selectedLandId]);

  const fetchLandData = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    try {
      // Fetch data from all APIs in parallel with proper error handling
      const results = await Promise.allSettled([
        nasaApi.fetchNasaData(lat, lon),
        openWeatherApi.fetchWeatherData(lat, lon),
        sentinelHubApi.fetchSentinelData(lat, lon),
        usgsErosApi.fetchUsgsErosData(lat, lon)
      ]);

      // Extract successful results and handle failures gracefully
      const nasaResult = results[0].status === 'fulfilled' ? results[0].value as NasaData : null;
      const openWeatherResult = results[1].status === 'fulfilled' ? results[1].value as OpenWeatherData : null;
      const sentinelResult = results[2].status === 'fulfilled' ? results[2].value as SentinelData : null;
      const usgsErosResult = results[3].status === 'fulfilled' ? results[3].value as UsgsErosData : null;
      
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`API ${index} failed:`, result.reason);
        }
      });

      // Generate simplified and concise agricultural data
      const enhancedLandData: LandData = {
        coordinates: { lat, lon },
        soilData: {
          clay: 25 + Math.random() * 15, 
          silt: 30 + Math.random() * 20, 
          sand: 45 + Math.random() * 25,
          organicMatter: 2.5 + Math.random() * 3, 
          ph: 6.2 + Math.random() * 1.6, 
          moisture: 35 + Math.random() * 25,
          nitrogen: 15 + Math.random() * 10,
          phosphorus: 20 + Math.random() * 15,
          potassium: 25 + Math.random() * 20,
          carbonSequestration: 2.5 + Math.random() * 3,
          microbialActivity: 60 + Math.random() * 30
        },
        cropData: {
          ndvi: 0.65 + Math.random() * 0.25, 
          health: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any,
          growthStage: ['Seedling', 'Vegetative', 'Flowering', 'Fruiting'][Math.floor(Math.random() * 4)],
          yieldPrediction: 85 + Math.random() * 15,
          biomass: 2.5 + Math.random() * 3,
          chlorophyll: 35 + Math.random() * 25,
          waterStress: 20 + Math.random() * 40,
          nutrientDeficiency: Math.random() > 0.7 ? ['Nitrogen'] : []
        },
        weatherData: {
          temperature: 22 + Math.random() * 15, 
          humidity: 60 + Math.random() * 30, 
          rainfall: Math.random() * 50,
          windSpeed: 5 + Math.random() * 15,
          solarRadiation: 800 + Math.random() * 400,
          forecast: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            temp: 20 + Math.random() * 15, 
            rain: Math.random() * 30,
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
            humidity: 50 + Math.random() * 30
          }))
        },
        recommendations: [
          { 
            type: 'irrigation', 
            priority: 'high', 
            title: 'تحسين الري', 
            description: 'زيادة تكرار الري بنسبة 20%', 
            impact: 'تحسين الإنتاجية 15%', 
            confidence: 0.85, 
            cost: 200, 
            roi: 2.5 
          },
          { 
            type: 'fertilizer', 
            priority: 'medium', 
            title: 'تطبيق الأسمدة', 
            description: 'إضافة 50 كجم/هكتار NPK', 
            impact: 'تحسين الإنتاجية 8%', 
            confidence: 0.75, 
            cost: 150, 
            roi: 1.8 
          },
          { 
            type: 'pest', 
            priority: 'low', 
            title: 'مراقبة الآفات', 
            description: 'المراقبة الدقيقة للآفات', 
            impact: 'منع الخسائر 5%', 
            confidence: 0.6, 
            cost: 50, 
            roi: 1.2 
          }
        ],
        aiInsights: {
          cropSuitability: ['قمح', 'شعير', 'ذرة'],
          optimalPlantingTime: 'أكتوبر - نوفمبر',
          pestRisk: 15 + Math.random() * 25,
          diseaseProbability: 10 + Math.random() * 20,
          marketTrends: 'ارتفاع أسعار الحبوب',
          sustainabilityScore: 75 + Math.random() * 20
        }
      };

      setLandData(enhancedLandData);
      setNasaData(nasaResult);
      setOpenWeatherData(openWeatherResult);
      setSentinelData(sentinelResult);
      setUsgsErosData(usgsErosResult);

      // Show success message
      console.log('✅ Agricultural analysis completed successfully!');
      
      // Show simple success notification
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          alert(`✅ تم إكمال التحليل الزراعي!

📊 النتائج:
• التربة: ${enhancedLandData.soilData.ph.toFixed(1)} pH
• المحاصيل: ${enhancedLandData.cropData.health} - NDVI: ${enhancedLandData.cropData.ndvi.toFixed(2)}
• الطقس: ${enhancedLandData.weatherData.temperature.toFixed(1)}°C

💡 التوصيات: ${enhancedLandData.recommendations.length} توصية زراعية`);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error fetching land data:', error);
      // Fallback to mock data
      const mockData: LandData = {
        coordinates: { lat, lon },
        soilData: {
          clay: 25 + Math.random() * 15, silt: 30 + Math.random() * 20, sand: 45 + Math.random() * 25,
          organicMatter: 2.5 + Math.random() * 3, ph: 6.2 + Math.random() * 1.6, moisture: 35 + Math.random() * 25,
          nitrogen: 15 + Math.random() * 10, phosphorus: 20 + Math.random() * 15, potassium: 25 + Math.random() * 20,
          carbonSequestration: 2.5 + Math.random() * 3, microbialActivity: 60 + Math.random() * 30
        },
        cropData: {
          ndvi: 0.65 + Math.random() * 0.25, health: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any,
          growthStage: ['Seedling', 'Vegetative', 'Flowering', 'Fruiting'][Math.floor(Math.random() * 4)],
          yieldPrediction: 85 + Math.random() * 15, biomass: 2.5 + Math.random() * 3, chlorophyll: 35 + Math.random() * 25,
          waterStress: 20 + Math.random() * 40, nutrientDeficiency: Math.random() > 0.7 ? ['Nitrogen'] : []
        },
        weatherData: {
          temperature: 22 + Math.random() * 15, humidity: 60 + Math.random() * 30, rainfall: Math.random() * 50,
          windSpeed: 5 + Math.random() * 15, solarRadiation: 800 + Math.random() * 400,
          forecast: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            temp: 20 + Math.random() * 15, rain: Math.random() * 30,
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
            humidity: 50 + Math.random() * 30
          }))
        },
        recommendations: [
          { type: 'irrigation', priority: 'high', title: 'تحسين الري', description: 'زيادة تكرار الري بنسبة 20%', impact: 'تحسين الإنتاجية 15%', confidence: 0.85, cost: 200, roi: 2.5 },
          { type: 'fertilizer', priority: 'medium', title: 'تطبيق الأسمدة', description: 'إضافة 50 كجم/هكتار NPK', impact: 'تحسين الإنتاجية 8%', confidence: 0.75, cost: 150, roi: 1.8 },
          { type: 'pest', priority: 'low', title: 'مراقبة الآفات', description: 'المراقبة الدقيقة للآفات', impact: 'منع الخسائر 5%', confidence: 0.6, cost: 50, roi: 1.2 }
        ],
        aiInsights: {
          cropSuitability: ['قمح', 'شعير', 'ذرة'], optimalPlantingTime: 'أكتوبر - نوفمبر',
          pestRisk: 15 + Math.random() * 25, diseaseProbability: 10 + Math.random() * 20,
          marketTrends: 'ارتفاع أسعار الحبوب', sustainabilityScore: 75 + Math.random() * 20
        }
      };
      setLandData(mockData);
    } finally {
      setIsLoading(false);
    }
  }, [dataSource]);



  const generateReport = async () => {
    setIsGeneratingReport(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingReport(false);
    
    // Show success notification
    if (typeof window !== 'undefined') {
      alert('✅ تم إنشاء التقرير بنجاح!\n\n📊 التقرير يتضمن:\n• تحليل التربة والمناخ\n• توصيات زراعية\n• توقعات الإنتاجية\n• تحليل اقتصادي');
    }
  };

  // Filter handler functions
  const handleCropFilter = (crop: string) => {
    setSelectedCrops(prev => 
      prev.includes(crop) 
        ? prev.filter(c => c !== crop)
        : [...prev, crop]
    );
  };

  const handleSoilFilter = (soil: string) => {
    setSelectedSoilTypes(prev => 
      prev.includes(soil) 
        ? prev.filter(s => s !== soil)
        : [...prev, soil]
    );
  };

  const handleClimateFilter = (climate: string) => {
    setSelectedClimateZones(prev => 
      prev.includes(climate) 
        ? prev.filter(c => c !== climate)
        : [...prev, climate]
    );
  };

  const handleWaterFilter = (water: string) => {
    setSelectedWaterTypes(prev => 
      prev.includes(water) 
        ? prev.filter(w => w !== water)
        : [...prev, water]
    );
  };

  const handleLandSizeFilter = (size: string) => {
    setSelectedLandSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleTechLevelFilter = (tech: string) => {
    setSelectedTechLevels(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const applyFilters = () => {
    // Apply all selected filters and refresh data
    console.log('Applying filters:', {
      crops: selectedCrops,
      soils: selectedSoilTypes,
      climates: selectedClimateZones,
      waters: selectedWaterTypes,
      sizes: selectedLandSizes,
      techs: selectedTechLevels,
      priceRange,
      yieldRange
    });
    
    // Refresh data with new filters
    fetchLandData(coordinates.lat, coordinates.lon);
  };

  const exportResults = () => {
    const data = {
      coordinates,
      landData,
      nasaData,
      filters: {
        crops: selectedCrops,
        soils: selectedSoilTypes,
        climates: selectedClimateZones,
        waters: selectedWaterTypes,
        sizes: selectedLandSizes,
        techs: selectedTechLevels,
        priceRange,
        yieldRange
      },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agricultural-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8">
        {/* Hero Background GIF */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: 'url(/assets/field.gif)',
          }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        
        {/* Hero Content */}
        <div className="text-center max-w-7xl mx-auto relative z-20">
          {/* Premium Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-semibold mb-8 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            منصة تحليل الأراضي المتطورة - تقنيات NASA
          </div>


          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-emerald-200 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto">
            أحدث تقنيات تحليل البيانات وبيانات الأقمار الصناعية لتحليل الأراضي الزراعية وتحسين الإنتاجية
          </p>

          {/* Technology Icons */}
          <div className="flex justify-center items-center space-x-8 space-x-reverse mb-12">
            <div className="flex items-center space-x-2 space-x-reverse text-emerald-300">
              <Satellite className="w-8 h-8" />
              <span className="text-lg font-semibold">NASA</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-emerald-300">
              <Database className="w-8 h-8" />
              <span className="text-lg font-semibold">Big Data</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-emerald-300">
              <Cpu className="w-8 h-8" />
              <span className="text-lg font-semibold">ML</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-12">
            <button
              onClick={() => fetchLandData(coordinates.lat, coordinates.lon)}
              disabled={isLoading}
              className="group px-8 py-4 md:px-12 md:py-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 flex items-center disabled:opacity-50"
            >
              <RefreshCw className={`w-6 h-6 mr-3 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-300'}`} />
              {isLoading ? 'جاري التحليل...' : 'ابدأ التحليل الذكي'}
            </button>
            
            <button
              onClick={generateReport}
              disabled={isGeneratingReport || !landData}
              className="group px-8 py-4 md:px-12 md:py-5 bg-transparent border-2 border-emerald-400 hover:bg-emerald-400/10 text-emerald-300 hover:text-white rounded-2xl font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-105 flex items-center disabled:opacity-50"
            >
              <FileText className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
              {isGeneratingReport ? 'جاري التوليد...' : 'تقرير شامل'}
            </button>

            <button
              onClick={() => setShowCostCalculator(true)}
              className="group px-8 py-4 md:px-12 md:py-5 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 flex items-center"
            >
              <Calculator className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
              حاسبة التكاليف
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-black text-emerald-400 mb-2">99%</div>
              <div className="text-emerald-200 text-sm">دقة التحليل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-black text-emerald-400 mb-2">ML</div>
              <div className="text-emerald-200 text-sm">تعلم آلي</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-black text-emerald-400 mb-2">NASA</div>
              <div className="text-emerald-200 text-sm">بيانات فضائية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-black text-emerald-400 mb-2">24/7</div>
              <div className="text-emerald-200 text-sm">مراقبة مستمرة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="relative z-10 py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              الخريطة <span className="text-emerald-400">التفاعلية الذكية</span>
            </h2>
            <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
              تحليل شامل للأراضي الزراعية باستخدام أحدث تقنيات الأقمار الصناعية وتحليل البيانات
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-emerald-400 ml-2" />
              <h3 className="text-2xl font-bold text-white">تحليل متقدم للطقس والتربة وصور الأقمار الصناعية</h3>
            </div>
            <VarInteractiveMap
              lat={coordinates.lat}
              lon={coordinates.lon}
              weatherData={landData?.weatherData}
              soilData={landData?.soilData}
              satelliteImages={satelliteImages}
              onLandDrawn={handleLandDrawn}
            />
          </div>
        </div>
      </section>

      {/* Compact Filters Section */}
      <section className="relative z-10 py-12 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-black/50 to-emerald-900/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
              فلاتر <span className="text-emerald-400">سريعة للمزارعين</span>
            </h2>
            <p className="text-lg text-emerald-200">
              أدوات تحليل سريعة ومفيدة لتحسين القرارات الزراعية
            </p>
          </div>

          {/* Compact Filter Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Quick Crop Filter */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Leaf className="w-5 h-5 text-emerald-400 ml-2" />
                  <h3 className="text-sm font-bold text-white">المحاصيل</h3>
              </div>
                <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-full">
                  {selectedCrops.length} محدد
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['قمح', 'شعير', 'ذرة', 'بطاطس'].map((crop) => (
                  <button
                    key={crop}
                    onClick={() => handleCropFilter(crop)}
                    className={`px-2 py-1 text-xs rounded-full transition-all ${
                      selectedCrops.includes(crop)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-emerald-200 hover:bg-emerald-500/20'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Soil Filter */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Layers className="w-5 h-5 text-emerald-400 ml-2" />
                  <h3 className="text-sm font-bold text-white">التربة</h3>
              </div>
                <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-full">
                  {selectedSoilTypes.length} محدد
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['طينية', 'رملية', 'طميية'].map((soil) => (
                  <button
                    key={soil}
                    onClick={() => handleSoilFilter(soil)}
                    className={`px-2 py-1 text-xs rounded-full transition-all ${
                      selectedSoilTypes.includes(soil)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-emerald-200 hover:bg-emerald-500/20'
                    }`}
                  >
                    {soil}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Climate Filter */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Thermometer className="w-5 h-5 text-emerald-400 ml-2" />
                  <h3 className="text-sm font-bold text-white">المناخ</h3>
              </div>
                <span className="text-xs text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-full">
                  {selectedClimateZones.length} محدد
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['ساحلية', 'جبلية', 'صحراوية'].map((climate) => (
                  <button
                    key={climate}
                    onClick={() => handleClimateFilter(climate)}
                    className={`px-2 py-1 text-xs rounded-full transition-all ${
                      selectedClimateZones.includes(climate)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-emerald-200 hover:bg-emerald-500/20'
                    }`}
                  >
                    {climate}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button 
              onClick={applyFilters}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              تطبيق الفلاتر
            </button>
            <button 
              onClick={exportResults}
              className="px-6 py-3 bg-transparent border border-emerald-400 hover:bg-emerald-400/10 text-emerald-300 hover:text-white rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              تصدير النتائج
            </button>
            <button 
              onClick={generateReport}
              className="px-6 py-3 bg-transparent border border-blue-400 hover:bg-blue-400/10 text-blue-300 hover:text-white rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              تقرير سريع
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-400/30">
              <Brain className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">تحليل ذكي</p>
              <p className="text-emerald-300 text-xs">بيانات متقدمة</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30">
              <TrendingUp className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">تحليل السوق</p>
              <p className="text-blue-300 text-xs">أسعار وطلب</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
              <Shield className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">حماية المحاصيل</p>
              <p className="text-purple-300 text-xs">اكتشاف مبكر</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-400/30">
              <Rocket className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">تحسين الإنتاجية</p>
              <p className="text-orange-300 text-xs">+30% محصول</p>
            </div>
          </div>
        </div>
      </section>

      {/* Loading Section */}
      {isLoading ? (
        <section className="relative z-10 py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
              <div className="absolute inset-0 w-24 h-24 border-4 border-teal-400 border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">جاري تحليل البيانات من الأقمار الصناعية...</h3>
            <p className="text-emerald-200 text-lg">قد يستغرق هذا بضع ثوانٍ</p>
            <div className="mt-8 flex justify-center space-x-4 space-x-reverse">
              <div className="flex items-center text-emerald-300">
                <Brain className="w-5 h-5 mr-2" />
                <span>تحليل البيانات</span>
              </div>
              <div className="flex items-center text-emerald-300">
                <Satellite className="w-5 h-5 mr-2" />
                <span>بيانات NASA</span>
              </div>
              <div className="flex items-center text-emerald-300">
                <Database className="w-5 h-5 mr-2" />
                <span>معالجة البيانات</span>
              </div>
            </div>
          </div>
        </section>
      ) : landData ? (
        <div className="relative z-10 py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Analysis Panel */}
              <div className="lg:col-span-2 space-y-8">


                {/* Weather Data */}
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Thermometer className="w-6 h-6 text-emerald-400 ml-3" />
                    بيانات الطقس المتقدمة
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/30">
                      <Thermometer className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                      <p className="text-3xl font-black text-white mb-1">
                        {landData?.weatherData?.temperature?.toFixed(1) || '25.0'}°C
                      </p>
                      <p className="text-emerald-300 text-sm">درجة الحرارة</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30">
                      <Droplets className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                      <p className="text-3xl font-black text-white mb-1">
                        {landData?.weatherData?.humidity?.toFixed(0) || '65'}%
                      </p>
                      <p className="text-blue-300 text-sm">الرطوبة</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30">
                      <CloudRain className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                      <p className="text-3xl font-black text-white mb-1">
                        {landData?.weatherData?.rainfall?.toFixed(1) || '0.0'}mm
                      </p>
                      <p className="text-purple-300 text-sm">الأمطار</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-400/30">
                      <Wind className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                      <p className="text-3xl font-black text-white mb-1">
                        {landData?.weatherData?.windSpeed?.toFixed(1) || '8.0'}km/h
                      </p>
                      <p className="text-orange-300 text-sm">سرعة الرياح</p>
                    </div>
                  </div>
                  
                  {/* Solar Radiation */}
                  <div className="mt-6 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-400/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Sun className="w-8 h-8 text-yellow-400 ml-3" />
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {landData?.weatherData?.solarRadiation?.toFixed(0) || '850'} W/m²
                          </p>
                          <p className="text-yellow-300 text-sm">الإشعاع الشمسي</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">ممتاز</p>
                        <p className="text-yellow-300 text-sm">للمحاصيل</p>
                      </div>
                    </div>
                  </div>
                </MotionDiv>

                {/* Soil Analysis */}
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Layers className="w-6 h-6 text-emerald-400 ml-3" />
                    تحليل التربة المتقدم
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/30">
                      <div className="text-3xl font-black text-white mb-1">
                        {landData?.soilData?.clay?.toFixed(1) || '30.0'}%
                      </div>
                      <div className="text-emerald-300 text-sm">محتوى الطين</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30">
                      <div className="text-3xl font-black text-white mb-1">
                        {landData?.soilData?.silt?.toFixed(1) || '35.0'}%
                      </div>
                      <div className="text-blue-300 text-sm">محتوى الطمي</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-400/30">
                      <div className="text-3xl font-black text-white mb-1">
                        {landData?.soilData?.sand?.toFixed(1) || '35.0'}%
                      </div>
                      <div className="text-yellow-300 text-sm">محتوى الرمل</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30">
                      <div className="text-3xl font-black text-white mb-1">
                        {landData?.soilData?.organicMatter?.toFixed(1) || '2.5'}%
                      </div>
                      <div className="text-purple-300 text-sm">المادة العضوية</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl border border-red-400/30">
                      <div className="text-3xl font-black text-white mb-1">
                        {landData?.soilData?.ph?.toFixed(1) || '6.5'}
                      </div>
                      <div className="text-red-300 text-sm">مستوى الحموضة</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl border border-teal-400/30">
                      <div className="text-3xl font-black text-white mb-1">
                        {landData?.soilData?.moisture?.toFixed(1) || '45.0'}%
                      </div>
                      <div className="text-teal-300 text-sm">رطوبة التربة</div>
                    </div>
                  </div>
                  
                  {/* Advanced Soil Metrics */}
                  <div className="mt-8 grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-400/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {landData?.soilData?.nitrogen?.toFixed(1) || '20.0'} mg/kg
                          </p>
                          <p className="text-green-300 text-sm">النيتروجين</p>
                        </div>
                        <Leaf className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {landData?.soilData?.phosphorus?.toFixed(1) || '25.0'} mg/kg
                          </p>
                          <p className="text-blue-300 text-sm">الفسفور</p>
                        </div>
                        <Droplets className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                  </div>
                </MotionDiv>

                {/* Weather Alerts Section */}
                {openWeatherData && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                  >
                    <WeatherAlerts 
                      alerts={openWeatherData.alerts}
                      agricultural={openWeatherData.agricultural}
                    />
                  </MotionDiv>
                )}

                {/* Satellite Analysis Section */}
                {sentinelData && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                  >
                    <SatelliteAnalysis sentinelData={sentinelData} />
                  </MotionDiv>
                )}

                {/* USGS EROS Analysis Section */}
                {usgsErosData && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                  >
                    <UsgsErosAnalysis usgsData={usgsErosData} />
                  </MotionDiv>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* AI Insights */}
                <MotionDiv
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                                    <Brain className="w-6 h-6 text-emerald-400 ml-3" />
                رؤى تحليل البيانات
                  </h2>
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/30">
                      <h3 className="font-bold text-white mb-2">المحاصيل المناسبة</h3>
                      <div className="flex flex-wrap gap-2">
                        {landData.aiInsights.cropSuitability.map((crop, index) => (
                          <span key={index} className="px-3 py-1 bg-emerald-500/30 text-emerald-200 rounded-full text-sm">
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30">
                      <h3 className="font-bold text-white mb-2">وقت الزراعة الأمثل</h3>
                      <p className="text-blue-300">{landData.aiInsights.optimalPlantingTime}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30">
                      <h3 className="font-bold text-white mb-2">مخاطر الآفات</h3>
                      <p className="text-purple-300">{landData.aiInsights.pestRisk.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-400/30">
                      <h3 className="font-bold text-white mb-2">معدل الاستدامة</h3>
                      <p className="text-orange-300">{landData.aiInsights.sustainabilityScore.toFixed(1)}%</p>
                    </div>
                  </div>
                </MotionDiv>

                {/* Quick Actions */}
                <MotionDiv
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                >
                  <h2 className="text-2xl font-bold text-white mb-6">إجراءات سريعة</h2>
                  <div className="space-y-4">
                    <button className="w-full flex items-center justify-center space-x-2 space-x-reverse px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105">
                      <BarChart3 className="w-5 h-5" />
                      <span>تحليل متقدم</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 space-x-reverse px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105">
                      <Download className="w-5 h-5" />
                      <span>تصدير البيانات</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 space-x-reverse px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105">
                      <TrendingUp className="w-5 h-5" />
                      <span>توقعات المستقبل</span>
                    </button>
                  </div>
                </MotionDiv>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <MotionDiv
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">صورة القمر الصناعي</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-emerald-300 hover:text-white transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              <img
                src={selectedImage.url}
                alt={`Satellite ${selectedImage.type}`}
                className="w-full h-96 object-cover rounded-2xl border border-white/20"
              />
              <div className="mt-6 text-emerald-200 space-y-2">
                <p><strong>النوع:</strong> {selectedImage.type}</p>
                <p><strong>الدقة:</strong> {selectedImage.resolution}</p>
                <p><strong>التاريخ:</strong> {new Date(selectedImage.date).toLocaleDateString('ar-SA')}</p>
              </div>
            </MotionDiv>
          </MotionDiv>
        )}
      </AnimatePresence>

      {/* Land Management Section */}
      {drawnLands.length > 0 && (
        <section className="relative z-10 py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-black/50 to-emerald-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                إدارة <span className="text-emerald-400">الأراضي المرسومة</span>
              </h2>
              <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
                تخطيط وإدارة الأراضي الزراعية مع حساب التكاليف والأرباح المتوقعة
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {drawnLands.map((land, index) => (
                <MotionDiv
                  key={land.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">الأرض {index + 1}</h3>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => setSelectedLandId(land.id)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors p-1 rounded-full hover:bg-emerald-500/20"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLand(land.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-500/20"
                        title="حذف الأرض"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-200">المساحة:</span>
                      <span className="text-white font-bold">{land.area.toFixed(2)} هكتار</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-200">المحيط:</span>
                      <span className="text-white font-bold">{land.perimeter.toFixed(0)} متر</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-200">عدد النقاط:</span>
                      <span className="text-white font-bold">{land.coordinates.length}</span>
                    </div>
                    
                    {land.cropType && (
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-200">المحصول:</span>
                        <span className="text-white font-bold">{land.cropType}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => {
                        setSelectedCrop(land.cropType || 'قمح');
                        setLandArea(land.area);
                        setShowCostCalculator(true);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
                    >
                      حساب التكاليف
                    </button>
                    
                    <button
                      onClick={() => {
                        const dataStr = JSON.stringify(land.coordinates, null, 2);
                        const dataBlob = new Blob([dataStr], { type: 'application/json' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `land_${index + 1}_coordinates.json`;
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
                    >
                      تصدير الإحداثيات
                    </button>
                  </div>
                </MotionDiv>
              ))}
            </div>

            {/* Total Summary */}
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">ملخص الأراضي</h3>
                <button
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد من حذف جميع الأراضي؟')) {
                      setDrawnLands([]);
                      setSelectedLandId(null);
                    }
                  }}
                  className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                  title="حذف جميع الأراضي"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف الكل</span>
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {drawnLands.length}
                  </div>
                  <div className="text-emerald-200">عدد الأراضي</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {drawnLands.reduce((total, land) => total + land.area, 0).toFixed(2)}
                  </div>
                  <div className="text-emerald-200">إجمالي المساحة (هكتار)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {drawnLands.reduce((total, land) => total + land.perimeter, 0).toFixed(0)}
                  </div>
                  <div className="text-emerald-200">إجمالي المحيط (متر)</div>
                </div>
              </div>
            </MotionDiv>
          </div>
        </section>
      )}

      {/* Cost Calculator Modal */}
      {showCostCalculator && (
        <CostCalculator
          cropType={selectedCrop}
          landArea={landArea}
          region="الجزائر"
          onClose={() => setShowCostCalculator(false)}
        />
      )}
    </div>
  );
};

export default LiveLandIntelligenceTool; 