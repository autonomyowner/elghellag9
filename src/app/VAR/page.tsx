'use client';

import React, { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Real API imports
import { fetchNasaData, NasaData } from '@/lib/nasaApi';
import { openWeatherApi, OpenWeatherData } from '@/lib/openWeatherApi';
import { fetchSoilGridsData, SoilGridsData } from '@/lib/soilGridsApi';
import { getClimateZone, getCropRecommendations, CropRecommendation, getMonthNameAr, ClimateZone } from '@/lib/algerianCropData';

const VarInteractiveMap = dynamic(() => import('@/components/VarInteractiveMap'), { ssr: false });
const CostCalculator = dynamic(() => import('@/components/CostCalculator'), { ssr: false });
const WeatherAlerts = dynamic(() => import('@/components/WeatherAlerts'), { ssr: false });

import {
  MapPin, Satellite, Droplets, Leaf, TrendingUp,
  Download, FileText, BarChart3,
  Thermometer, Sun, CloudRain, Wind,
  Layers, Eye, RefreshCw, X,
  Globe, Calculator, Trash2, Cloud, Sprout
} from 'lucide-react';

const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false, loading: () => <div /> });
const AnimatePresence = dynamic(() => import('framer-motion').then(mod => mod.AnimatePresence), { ssr: false, loading: () => null });

// Interface for real data
interface LandData {
  coordinates: { lat: number; lon: number };
  soilData: {
    clay: number | null;
    silt: number | null;
    sand: number | null;
    ph: number | null;
    organicCarbon: number | null;
    nitrogen: number | null;
    soilType: string | null;
  };
  weatherData: {
    temperature: number | null;
    humidity: number | null;
    rainfall: number | null;
    windSpeed: number | null;
    solarRadiation: number | null;
    pressure: number | null;
    description: string | null;
  };
  climateZone: ClimateZone;
  recommendations: Array<{
    type: 'irrigation' | 'fertilizer' | 'soil' | 'crop' | 'climate';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
  }>;
  cropRecommendations: CropRecommendation[];
  dataSources: string[];
}

const formatVal = (val: number | null | undefined, decimals = 1, suffix = ''): string => {
  if (val === null || val === undefined) return 'غير متاح';
  return `${val.toFixed(decimals)}${suffix}`;
};

const LiveLandIntelligenceTool: React.FC = () => {
  const [landData, setLandData] = useState<LandData | null>(null);
  const [nasaData, setNasaData] = useState<NasaData | null>(null);
  const [openWeatherData, setOpenWeatherData] = useState<OpenWeatherData | null>(null);
  const [soilData, setSoilData] = useState<SoilGridsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: 36.75, lon: 3.05 });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Filters
  const [selectedCropFilter, setSelectedCropFilter] = useState<string | null>(null);

  const [showCostCalculator, setShowCostCalculator] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('قمح');
  const [landArea, setLandArea] = useState(1);

  // Land drawing
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

  const handleLandDrawn = useCallback((data: {
    area: number;
    perimeter: number;
    coordinates: Array<{ lat: number; lng: number }>;
    center: { lat: number; lng: number };
  }) => {
    const newLand = { id: `land_${Date.now()}`, ...data, cropType: '', notes: '' };
    setDrawnLands(prev => [...prev, newLand]);
    setSelectedLandId(newLand.id);
    setLandArea(data.area);
  }, []);

  const handleDeleteLand = useCallback((landId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الأرض؟')) {
      setDrawnLands(prev => prev.filter(land => land.id !== landId));
      if (selectedLandId === landId) setSelectedLandId(null);
    }
  }, [selectedLandId]);

  const fetchLandData = useCallback(async (lat: number, lon: number) => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const [nasaResult, owResult, soilResult] = await Promise.allSettled([
        fetchNasaData(lat, lon),
        openWeatherApi.fetchWeatherData(lat, lon),
        fetchSoilGridsData(lat, lon),
      ]);

      const nasa = nasaResult.status === 'fulfilled' ? nasaResult.value : null;
      const ow = owResult.status === 'fulfilled' ? owResult.value : null;
      const soil = soilResult.status === 'fulfilled' ? soilResult.value : null;

      setNasaData(nasa);
      setOpenWeatherData(ow ?? null);
      setSoilData(soil ?? null);

      // Prefer OpenWeather for current weather, fallback to NASA POWER
      const temp = ow?.current?.temperature ?? nasa?.power?.temperature ?? null;
      const humidity = ow?.current?.humidity ?? nasa?.power?.humidity ?? null;
      const rainfall = ow?.current?.rainfall ?? nasa?.power?.rainfall ?? null;
      const windSpeed = ow?.current?.windSpeed ?? nasa?.power?.windSpeed ?? null;
      const solarRadiation = nasa?.power?.solarRadiation ?? null;
      const pressure = ow?.current?.pressure ?? (nasa?.power?.pressure ? nasa.power.pressure * 10 : null); // kPa to hPa
      const description = ow?.current?.weatherDescription ?? null;

      const climateZone = getClimateZone(lat);

      // Generate real recommendations
      const recommendations: LandData['recommendations'] = [];

      if (temp !== null && temp > 35) {
        recommendations.push({
          type: 'irrigation', priority: 'high',
          title: 'زيادة الري',
          description: `درجة الحرارة مرتفعة (${temp.toFixed(1)}°C) - زد تكرار الري لتقليل إجهاد المحاصيل`
        });
      }
      if (temp !== null && temp < 5) {
        recommendations.push({
          type: 'climate', priority: 'high',
          title: 'خطر الصقيع',
          description: `درجة الحرارة منخفضة (${temp.toFixed(1)}°C) - احمِ المحاصيل الحساسة من الصقيع`
        });
      }
      if (soil?.ph !== null && soil?.ph !== undefined && soil.ph < 5.5) {
        recommendations.push({
          type: 'soil', priority: 'medium',
          title: 'تعديل حموضة التربة',
          description: `حموضة التربة منخفضة (${soil.ph.toFixed(1)}) - أضف الجير لرفع درجة الحموضة`
        });
      }
      if (soil?.ph !== null && soil?.ph !== undefined && soil.ph > 8.0) {
        recommendations.push({
          type: 'soil', priority: 'medium',
          title: 'تربة قلوية',
          description: `حموضة التربة مرتفعة (${soil.ph.toFixed(1)}) - أضف الكبريت أو السماد العضوي`
        });
      }
      if (humidity !== null && humidity > 80) {
        recommendations.push({
          type: 'crop', priority: 'medium',
          title: 'مراقبة الأمراض الفطرية',
          description: `الرطوبة عالية (${humidity.toFixed(0)}%) - راقب المحاصيل للأمراض الفطرية`
        });
      }
      if (rainfall !== null && rainfall < 1 && humidity !== null && humidity < 40) {
        recommendations.push({
          type: 'irrigation', priority: 'high',
          title: 'ري ضروري',
          description: 'قلة الأمطار ورطوبة منخفضة - الري الفوري ضروري'
        });
      }
      if (soil?.organicCarbon !== null && soil?.organicCarbon !== undefined && soil.organicCarbon < 10) {
        recommendations.push({
          type: 'fertilizer', priority: 'medium',
          title: 'زيادة المادة العضوية',
          description: 'محتوى الكربون العضوي منخفض - أضف السماد العضوي أو الكمبوست'
        });
      }

      if (recommendations.length === 0) {
        recommendations.push({
          type: 'crop', priority: 'low',
          title: 'ظروف جيدة',
          description: 'الظروف الحالية مناسبة للزراعة - استمر في المراقبة الدورية'
        });
      }

      const cropRecs = getCropRecommendations(temp, rainfall, soil?.ph ?? null, lat);

      const dataSources: string[] = [];
      if (nasa) dataSources.push('NASA POWER');
      if (ow) dataSources.push('OpenWeatherMap');
      if (soil) dataSources.push('SoilGrids (ISRIC)');

      const enhancedLandData: LandData = {
        coordinates: { lat, lon },
        soilData: {
          clay: soil?.clay ?? null,
          silt: soil?.silt ?? null,
          sand: soil?.sand ?? null,
          ph: soil?.ph ?? null,
          organicCarbon: soil?.organicCarbon ?? null,
          nitrogen: soil?.nitrogen ?? null,
          soilType: soil?.soilType ?? null,
        },
        weatherData: {
          temperature: temp,
          humidity,
          rainfall,
          windSpeed,
          solarRadiation,
          pressure,
          description,
        },
        climateZone,
        recommendations,
        cropRecommendations: cropRecs,
        dataSources,
      };

      setLandData(enhancedLandData);
      setStatusMessage(`تم التحليل بنجاح — ${dataSources.length} مصادر بيانات`);
    } catch (error) {
      console.error('Error fetching land data:', error);
      setStatusMessage('حدث خطأ أثناء جلب البيانات — حاول مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateReport = async () => {
    if (!landData) return;
    setIsGeneratingReport(true);

    const d = landData;
    const now = new Date();
    const lines = [
      '═══════════════════════════════════════════════════',
      '         تقرير تحليل الأراضي الزراعية',
      '         منصة الغلة — بيانات حقيقية',
      '═══════════════════════════════════════════════════',
      '',
      `التاريخ: ${now.toLocaleDateString('ar-DZ')}`,
      `الإحداثيات: ${d.coordinates.lat.toFixed(4)}, ${d.coordinates.lon.toFixed(4)}`,
      `المنطقة المناخية: ${d.climateZone}`,
      '',
      '── بيانات الطقس ──────────────────────────────────',
      `درجة الحرارة: ${formatVal(d.weatherData.temperature, 1, '°C')}`,
      `الرطوبة: ${formatVal(d.weatherData.humidity, 0, '%')}`,
      `الأمطار: ${formatVal(d.weatherData.rainfall, 1, ' مم/يوم')}`,
      `سرعة الرياح: ${formatVal(d.weatherData.windSpeed, 1, ' م/ث')}`,
      `الإشعاع الشمسي: ${formatVal(d.weatherData.solarRadiation, 1, ' kWh/m²/يوم')}`,
      `الضغط الجوي: ${formatVal(d.weatherData.pressure, 0, ' hPa')}`,
      d.weatherData.description ? `الوصف: ${d.weatherData.description}` : '',
      '',
      '── تحليل التربة ──────────────────────────────────',
      `نوع التربة: ${d.soilData.soilType ?? 'غير متاح'}`,
      `الطين: ${formatVal(d.soilData.clay, 1, '%')}`,
      `الطمي: ${formatVal(d.soilData.silt, 1, '%')}`,
      `الرمل: ${formatVal(d.soilData.sand, 1, '%')}`,
      `درجة الحموضة (pH): ${formatVal(d.soilData.ph)}`,
      `الكربون العضوي: ${formatVal(d.soilData.organicCarbon, 1, ' غ/كغ')}`,
      `النيتروجين: ${formatVal(d.soilData.nitrogen, 1, ' سغ/كغ')}`,
      '',
      '── التوصيات الزراعية ─────────────────────────────',
      ...d.recommendations.map((r, i) => `${i + 1}. [${r.priority === 'high' ? 'عاجل' : r.priority === 'medium' ? 'متوسط' : 'منخفض'}] ${r.title}: ${r.description}`),
      '',
      '── المحاصيل المناسبة ─────────────────────────────',
      ...d.cropRecommendations.slice(0, 5).map((r, i) => `${i + 1}. ${r.crop.nameAr} (ملاءمة: ${r.score}%) — ${r.reason}`),
      '',
      '── مصادر البيانات ────────────────────────────────',
      ...d.dataSources.map(s => `• ${s}`),
      '',
      '═══════════════════════════════════════════════════',
      'هذا التقرير يستخدم بيانات حقيقية من مصادر مفتوحة.',
      'منصة الغلة — elghella.com',
    ];

    const text = lines.join('\n');
    const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `تقرير-تحليل-${now.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsGeneratingReport(false);
    setStatusMessage('تم تحميل التقرير بنجاح');
  };

  const filteredCropRecs = landData?.cropRecommendations?.filter(r =>
    !selectedCropFilter || r.crop.nameAr === selectedCropFilter
  ) ?? [];

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-gray-900" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 md:px-6 lg:px-8">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: 'url(/assets/field.gif)' }}
        />
        <div className="absolute inset-0 bg-black/60 z-10" />

        <div className="text-center max-w-7xl mx-auto relative z-20">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-semibold mb-8 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            أداة تحليل الأراضي الزراعية — بيانات حقيقية
          </div>

          <p className="text-xl md:text-2xl lg:text-3xl text-emerald-200 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto">
            تحليل الأراضي الزراعية الجزائرية باستخدام بيانات حقيقية من مصادر مفتوحة عالمية
          </p>

          {/* Tech Icons */}
          <div className="flex justify-center items-center space-x-8 space-x-reverse mb-12">
            <div className="flex items-center space-x-2 space-x-reverse text-emerald-300">
              <Satellite className="w-8 h-8" />
              <span className="text-lg font-semibold">NASA</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-emerald-300">
              <Cloud className="w-8 h-8" />
              <span className="text-lg font-semibold">OpenWeather</span>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse text-emerald-300">
              <Layers className="w-8 h-8" />
              <span className="text-lg font-semibold">SoilGrids</span>
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
              {isGeneratingReport ? 'جاري التحميل...' : 'تقرير شامل'}
            </button>

            <button
              onClick={() => setShowCostCalculator(true)}
              className="group px-8 py-4 md:px-12 md:py-5 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-2xl font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 flex items-center"
            >
              <Calculator className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
              حاسبة التكاليف
            </button>
          </div>

          {/* Quick Stats — honest */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-black text-emerald-400 mb-2">3+</div>
              <div className="text-emerald-200 text-sm">مصادر بيانات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-black text-emerald-400 mb-2">58</div>
              <div className="text-emerald-200 text-sm">ولاية مغطاة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-black text-emerald-400 mb-2">NASA</div>
              <div className="text-emerald-200 text-sm">بيانات فضائية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-black text-emerald-400 mb-2">مجاني</div>
              <div className="text-emerald-200 text-sm">بدون تسجيل</div>
            </div>
          </div>

          {/* Status message */}
          {statusMessage && (
            <div className="mt-8 inline-flex items-center px-6 py-3 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-emerald-300">
              {statusMessage}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="relative z-10 py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
              الخريطة <span className="text-emerald-400">التفاعلية</span>
            </h2>
            <p className="text-xl text-emerald-200 max-w-3xl mx-auto">
              انقر على الخريطة لتحليل أي موقع في الجزائر
            </p>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-emerald-400 ml-2" />
              <h3 className="text-2xl font-bold text-white">تحليل الطقس والتربة</h3>
            </div>
            <VarInteractiveMap
              lat={coordinates.lat}
              lon={coordinates.lon}
              weatherData={landData?.weatherData ? {
                temperature: landData.weatherData.temperature ?? 0,
                humidity: landData.weatherData.humidity ?? 0,
                rainfall: landData.weatherData.rainfall ?? 0,
                windSpeed: landData.weatherData.windSpeed ?? 0,
                solarRadiation: landData.weatherData.solarRadiation ?? 0,
                forecast: [],
              } : undefined}
              soilData={landData?.soilData ? {
                clay: landData.soilData.clay ?? 0,
                silt: landData.soilData.silt ?? 0,
                sand: landData.soilData.sand ?? 0,
                organicMatter: (landData.soilData.organicCarbon ?? 0) / 10,
                ph: landData.soilData.ph ?? 0,
                moisture: 0,
                nitrogen: landData.soilData.nitrogen ?? 0,
                phosphorus: 0,
                potassium: 0,
                carbonSequestration: 0,
                microbialActivity: 0,
              } : undefined}
              satelliteImages={[]}
              onLandDrawn={handleLandDrawn}
            />
          </div>
        </div>
      </section>

      {/* Filters Section — simplified */}
      <section className="relative z-10 py-12 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-black/50 to-emerald-900/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
              فلاتر <span className="text-emerald-400">المحاصيل</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Crop filter */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center mb-3">
                <Leaf className="w-5 h-5 text-emerald-400 ml-2" />
                <h3 className="text-sm font-bold text-white">المحصول</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {['قمح', 'شعير', 'بطاطس', 'طماطم', 'بصل', 'زيتون', 'تمور', 'حمضيات', 'بطيخ', 'حمص', 'عدس', 'ذرة'].map((crop) => (
                  <button
                    key={crop}
                    onClick={() => setSelectedCropFilter(selectedCropFilter === crop ? null : crop)}
                    className={`px-2 py-1 text-xs rounded-full transition-all ${
                      selectedCropFilter === crop
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/10 text-emerald-200 hover:bg-emerald-500/20'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Soil type — auto-detected */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center mb-3">
                <Layers className="w-5 h-5 text-emerald-400 ml-2" />
                <h3 className="text-sm font-bold text-white">نوع التربة</h3>
              </div>
              <div className="text-center py-3">
                <p className="text-2xl font-bold text-white">
                  {landData?.soilData?.soilType ?? 'غير محلل'}
                </p>
                <p className="text-xs text-emerald-300 mt-1">يُكتشف تلقائياً من SoilGrids</p>
              </div>
            </div>

            {/* Climate zone — auto-detected */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg">
              <div className="flex items-center mb-3">
                <Thermometer className="w-5 h-5 text-emerald-400 ml-2" />
                <h3 className="text-sm font-bold text-white">المنطقة المناخية</h3>
              </div>
              <div className="text-center py-3">
                <p className="text-2xl font-bold text-white">
                  {landData?.climateZone ?? 'غير محلل'}
                </p>
                <p className="text-xs text-emerald-300 mt-1">حسب خط العرض</p>
              </div>
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
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">جاري جلب البيانات الحقيقية...</h3>
            <p className="text-emerald-200 text-lg">NASA POWER + OpenWeatherMap + SoilGrids</p>
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
                    بيانات الطقس
                    {landData.weatherData.description && (
                      <span className="mr-3 text-base font-normal text-emerald-300">— {landData.weatherData.description}</span>
                    )}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/30">
                      <Thermometer className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                      <p className="text-3xl font-black text-white mb-1">
                        {formatVal(landData.weatherData.temperature, 1, '°C')}
                      </p>
                      <p className="text-emerald-300 text-sm">درجة الحرارة</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30">
                      <Droplets className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                      <p className="text-3xl font-black text-white mb-1">
                        {formatVal(landData.weatherData.humidity, 0, '%')}
                      </p>
                      <p className="text-blue-300 text-sm">الرطوبة</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30">
                      <CloudRain className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                      <p className="text-3xl font-black text-white mb-1">
                        {formatVal(landData.weatherData.rainfall, 1, 'mm')}
                      </p>
                      <p className="text-purple-300 text-sm">الأمطار</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-400/30">
                      <Wind className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                      <p className="text-3xl font-black text-white mb-1">
                        {formatVal(landData.weatherData.windSpeed, 1, ' م/ث')}
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
                            {formatVal(landData.weatherData.solarRadiation, 1, ' kWh/m²')}
                          </p>
                          <p className="text-yellow-300 text-sm">الإشعاع الشمسي (معدل يومي)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-white">
                          {formatVal(landData.weatherData.pressure, 0, ' hPa')}
                        </p>
                        <p className="text-yellow-300 text-sm">الضغط الجوي</p>
                      </div>
                    </div>
                  </div>
                </MotionDiv>

                {/* Soil Analysis */}
                <MotionDiv
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Layers className="w-6 h-6 text-emerald-400 ml-3" />
                    تحليل التربة
                    {landData.soilData.soilType && (
                      <span className="mr-3 text-base font-normal text-emerald-300">— {landData.soilData.soilType}</span>
                    )}
                  </h2>
                  {landData.soilData.clay === null && landData.soilData.ph === null ? (
                    <div className="text-center py-8 text-emerald-300">
                      <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">بيانات التربة غير متاحة لهذا الموقع</p>
                      <p className="text-sm text-emerald-400 mt-2">قد لا تغطي قاعدة بيانات SoilGrids هذه المنطقة</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/30">
                          <div className="text-3xl font-black text-white mb-1">
                            {formatVal(landData.soilData.clay, 1, '%')}
                          </div>
                          <div className="text-emerald-300 text-sm">محتوى الطين</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30">
                          <div className="text-3xl font-black text-white mb-1">
                            {formatVal(landData.soilData.silt, 1, '%')}
                          </div>
                          <div className="text-blue-300 text-sm">محتوى الطمي</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-400/30">
                          <div className="text-3xl font-black text-white mb-1">
                            {formatVal(landData.soilData.sand, 1, '%')}
                          </div>
                          <div className="text-yellow-300 text-sm">محتوى الرمل</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl border border-red-400/30">
                          <div className="text-3xl font-black text-white mb-1">
                            {formatVal(landData.soilData.ph)}
                          </div>
                          <div className="text-red-300 text-sm">مستوى الحموضة (pH)</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-400/30">
                          <div className="text-3xl font-black text-white mb-1">
                            {formatVal(landData.soilData.organicCarbon, 1, '')}
                          </div>
                          <div className="text-green-300 text-sm">الكربون العضوي (غ/كغ)</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl border border-teal-400/30">
                          <div className="text-3xl font-black text-white mb-1">
                            {formatVal(landData.soilData.nitrogen, 1, '')}
                          </div>
                          <div className="text-teal-300 text-sm">النيتروجين (سغ/كغ)</div>
                        </div>
                      </div>
                    </>
                  )}
                </MotionDiv>

                {/* Weather Alerts */}
                {openWeatherData && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                  >
                    <WeatherAlerts
                      alerts={openWeatherData.alerts}
                      agricultural={openWeatherData.agricultural}
                    />
                  </MotionDiv>
                )}

                {/* Recommendations */}
                {landData.recommendations.length > 0 && (
                  <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                  >
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <Sprout className="w-6 h-6 text-emerald-400 ml-3" />
                      التوصيات الزراعية
                    </h2>
                    <div className="space-y-4">
                      {landData.recommendations.map((rec, i) => (
                        <div key={i} className={`p-4 rounded-2xl border ${
                          rec.priority === 'high'
                            ? 'bg-red-500/10 border-red-400/30'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-500/10 border-yellow-400/30'
                            : 'bg-green-500/10 border-green-400/30'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-white">{rec.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              rec.priority === 'high' ? 'bg-red-500/30 text-red-300' :
                              rec.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                              'bg-green-500/30 text-green-300'
                            }`}>
                              {rec.priority === 'high' ? 'عاجل' : rec.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </span>
                          </div>
                          <p className="text-emerald-200 text-sm">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </MotionDiv>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Crop Recommendations */}
                <MotionDiv
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Leaf className="w-6 h-6 text-emerald-400 ml-3" />
                    المحاصيل المناسبة
                  </h2>
                  <div className="space-y-4">
                    {filteredCropRecs.slice(0, 6).map((rec, i) => (
                      <div key={i} className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-400/30">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-white">{rec.crop.nameAr}</h3>
                          <span className="text-emerald-300 text-sm font-bold">{rec.score}%</span>
                        </div>
                        <p className="text-emerald-200 text-xs mb-2">{rec.reason}</p>
                        <div className="flex justify-between text-xs text-emerald-300">
                          <span>إنتاج: {rec.crop.yieldPerHa} طن/هك</span>
                          <span>مياه: {rec.crop.waterNeeds}</span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-emerald-400 h-2 rounded-full transition-all"
                              style={{ width: `${rec.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
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
                    <button
                      onClick={() => fetchLandData(coordinates.lat, coordinates.lon)}
                      className="w-full flex items-center justify-center space-x-2 space-x-reverse px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105"
                    >
                      <RefreshCw className="w-5 h-5" />
                      <span>تحديث البيانات</span>
                    </button>
                    <button
                      onClick={generateReport}
                      disabled={!landData}
                      className="w-full flex items-center justify-center space-x-2 space-x-reverse px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                    >
                      <Download className="w-5 h-5" />
                      <span>تحميل التقرير</span>
                    </button>
                    <button
                      onClick={() => setShowCostCalculator(true)}
                      className="w-full flex items-center justify-center space-x-2 space-x-reverse px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
                    >
                      <Calculator className="w-5 h-5" />
                      <span>حاسبة التكاليف</span>
                    </button>
                  </div>
                </MotionDiv>

                {/* Data Sources */}
                <MotionDiv
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl"
                >
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <Globe className="w-5 h-5 text-emerald-400 ml-2" />
                    مصادر البيانات
                  </h3>
                  <div className="space-y-2">
                    {landData.dataSources.map((src, i) => (
                      <div key={i} className="flex items-center text-sm text-emerald-200">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full ml-2"></span>
                        {src}
                      </div>
                    ))}
                    {landData.dataSources.length === 0 && (
                      <p className="text-sm text-emerald-300">لم يتم الاتصال بأي مصدر</p>
                    )}
                  </div>
                </MotionDiv>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Land Management Section */}
      {drawnLands.length > 0 && (
        <section className="relative z-10 py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-black/50 to-emerald-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
                إدارة <span className="text-emerald-400">الأراضي المرسومة</span>
              </h2>
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
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLand(land.id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-500/20"
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
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف الكل</span>
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">{drawnLands.length}</div>
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
