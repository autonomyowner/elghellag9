'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Download,
  Share2,
  RefreshCw
} from 'lucide-react';

interface CostCalculatorProps {
  cropType: string;
  landArea: number;
  region: string;
  onClose?: () => void;
}

interface CostBreakdown {
  seeds: { quantity: number; pricePerUnit: number; totalCost: number };
  fertilizers: {
    nitrogen: { kg: number; pricePerKg: number; total: number };
    phosphorus: { kg: number; pricePerKg: number; total: number };
    potassium: { kg: number; pricePerKg: number; total: number };
    organic: { kg: number; pricePerKg: number; total: number };
  };
  pesticides: {
    herbicides: { liters: number; pricePerLiter: number; total: number };
    insecticides: { liters: number; pricePerLiter: number; total: number };
    fungicides: { liters: number; pricePerLiter: number; total: number };
  };
  labor: {
    landPreparation: { hours: number; ratePerHour: number; total: number };
    planting: { hours: number; ratePerHour: number; total: number };
    weeding: { hours: number; ratePerHour: number; total: number };
    harvesting: { hours: number; ratePerHour: number; total: number };
  };
  irrigation: {
    waterCost: number;
    electricity: number;
    equipment: number;
    maintenance: number;
  };
  equipment: {
    tractorRental: number;
    implements: number;
    fuel: number;
    maintenance: number;
  };
}

interface RevenueProjection {
  expectedYield: { quantity: number; unit: string };
  marketPrice: { currentPrice: number; expectedPrice: number; pricePerUnit: string };
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
}

const CostCalculator: React.FC<CostCalculatorProps> = ({ cropType, landArea, region, onClose }) => {
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
    seeds: { quantity: 0, pricePerUnit: 0, totalCost: 0 },
    fertilizers: {
      nitrogen: { kg: 0, pricePerKg: 0, total: 0 },
      phosphorus: { kg: 0, pricePerKg: 0, total: 0 },
      potassium: { kg: 0, pricePerKg: 0, total: 0 },
      organic: { kg: 0, pricePerKg: 0, total: 0 }
    },
    pesticides: {
      herbicides: { liters: 0, pricePerLiter: 0, total: 0 },
      insecticides: { liters: 0, pricePerLiter: 0, total: 0 },
      fungicides: { liters: 0, pricePerLiter: 0, total: 0 }
    },
    labor: {
      landPreparation: { hours: 0, ratePerHour: 0, total: 0 },
      planting: { hours: 0, ratePerHour: 0, total: 0 },
      weeding: { hours: 0, ratePerHour: 0, total: 0 },
      harvesting: { hours: 0, ratePerHour: 0, total: 0 }
    },
    irrigation: {
      waterCost: 0,
      electricity: 0,
      equipment: 0,
      maintenance: 0
    },
    equipment: {
      tractorRental: 0,
      implements: 0,
      fuel: 0,
      maintenance: 0
    }
  });

  const [revenueProjection, setRevenueProjection] = useState<RevenueProjection>({
    expectedYield: { quantity: 0, unit: 'طن' },
    marketPrice: { currentPrice: 0, expectedPrice: 0, pricePerUnit: 'دج/طن' },
    totalRevenue: 0,
    totalCosts: 0,
    netProfit: 0,
    profitMargin: 0,
    roi: 0
  });

  const [isCalculating, setIsCalculating] = useState(false);

  // Default values based on crop type
  useEffect(() => {
    loadDefaultValues();
  }, [cropType, landArea]);

  const loadDefaultValues = () => {
    const defaults = getDefaultValues(cropType, landArea);
    setCostBreakdown(defaults.costs);
    setRevenueProjection(defaults.revenue);
  };

  const getDefaultValues = (crop: string, area: number) => {
    const cropDefaults: { [key: string]: any } = {
      'قمح': {
        costs: {
          seeds: { quantity: 150 * area, pricePerUnit: 25, totalCost: 150 * area * 25 },
          fertilizers: {
            nitrogen: { kg: 120 * area, pricePerKg: 45, total: 120 * area * 45 },
            phosphorus: { kg: 60 * area, pricePerKg: 55, total: 60 * area * 55 },
            potassium: { kg: 30 * area, pricePerKg: 65, total: 30 * area * 65 },
            organic: { kg: 0, pricePerKg: 0, total: 0 }
          },
          pesticides: {
            herbicides: { liters: 2 * area, pricePerLiter: 800, total: 2 * area * 800 },
            insecticides: { liters: 1 * area, pricePerLiter: 1200, total: 1 * area * 1200 },
            fungicides: { liters: 0.5 * area, pricePerLiter: 1500, total: 0.5 * area * 1500 }
          },
          labor: {
            landPreparation: { hours: 8 * area, ratePerHour: 500, total: 8 * area * 500 },
            planting: { hours: 4 * area, ratePerHour: 500, total: 4 * area * 500 },
            weeding: { hours: 12 * area, ratePerHour: 500, total: 12 * area * 500 },
            harvesting: { hours: 16 * area, ratePerHour: 500, total: 16 * area * 500 }
          },
          irrigation: {
            waterCost: 3000 * area,
            electricity: 1500 * area,
            equipment: 2000 * area,
            maintenance: 1000 * area
          },
          equipment: {
            tractorRental: 8000 * area,
            implements: 3000 * area,
            fuel: 4000 * area,
            maintenance: 2000 * area
          }
        },
        revenue: {
          expectedYield: { quantity: 4.5 * area, unit: 'طن' },
          marketPrice: { currentPrice: 45000, expectedPrice: 48000, pricePerUnit: 'دج/طن' },
          totalRevenue: 4.5 * area * 48000,
          totalCosts: 0, // Will be calculated
          netProfit: 0, // Will be calculated
          profitMargin: 0, // Will be calculated
          roi: 0 // Will be calculated
        }
      },
      'شعير': {
        costs: {
          seeds: { quantity: 120 * area, pricePerUnit: 20, totalCost: 120 * area * 20 },
          fertilizers: {
            nitrogen: { kg: 100 * area, pricePerKg: 45, total: 100 * area * 45 },
            phosphorus: { kg: 50 * area, pricePerKg: 55, total: 50 * area * 55 },
            potassium: { kg: 25 * area, pricePerKg: 65, total: 25 * area * 65 },
            organic: { kg: 0, pricePerKg: 0, total: 0 }
          },
          pesticides: {
            herbicides: { liters: 1.5 * area, pricePerLiter: 800, total: 1.5 * area * 800 },
            insecticides: { liters: 0.8 * area, pricePerLiter: 1200, total: 0.8 * area * 1200 },
            fungicides: { liters: 0.3 * area, pricePerLiter: 1500, total: 0.3 * area * 1500 }
          },
          labor: {
            landPreparation: { hours: 6 * area, ratePerHour: 500, total: 6 * area * 500 },
            planting: { hours: 3 * area, ratePerHour: 500, total: 3 * area * 500 },
            weeding: { hours: 10 * area, ratePerHour: 500, total: 10 * area * 500 },
            harvesting: { hours: 14 * area, ratePerHour: 500, total: 14 * area * 500 }
          },
          irrigation: {
            waterCost: 2500 * area,
            electricity: 1200 * area,
            equipment: 1800 * area,
            maintenance: 800 * area
          },
          equipment: {
            tractorRental: 7000 * area,
            implements: 2500 * area,
            fuel: 3500 * area,
            maintenance: 1800 * area
          }
        },
        revenue: {
          expectedYield: { quantity: 3.5 * area, unit: 'طن' },
          marketPrice: { currentPrice: 35000, expectedPrice: 38000, pricePerUnit: 'دج/طن' },
          totalRevenue: 3.5 * area * 38000,
          totalCosts: 0,
          netProfit: 0,
          profitMargin: 0,
          roi: 0
        }
      }
    };

    return cropDefaults[crop] || cropDefaults['قمح'];
  };

  const calculateTotals = () => {
    setIsCalculating(true);

    // Calculate total input costs
    const totalSeeds = costBreakdown.seeds.totalCost;
    const totalFertilizers = Object.values(costBreakdown.fertilizers).reduce((sum, fert) => sum + fert.total, 0);
    const totalPesticides = Object.values(costBreakdown.pesticides).reduce((sum, pest) => sum + pest.total, 0);
    const totalInputCosts = totalSeeds + totalFertilizers + totalPesticides;

    // Calculate total operational costs
    const totalLabor = Object.values(costBreakdown.labor).reduce((sum, lab) => sum + lab.total, 0);
    const totalIrrigation = Object.values(costBreakdown.irrigation).reduce((sum, irr) => sum + irr, 0);
    const totalEquipment = Object.values(costBreakdown.equipment).reduce((sum, equip) => sum + equip, 0);
    const totalOperationalCosts = totalLabor + totalIrrigation + totalEquipment;

    const totalCosts = totalInputCosts + totalOperationalCosts;
    const totalRevenue = revenueProjection.expectedYield.quantity * revenueProjection.marketPrice.expectedPrice;
    const netProfit = totalRevenue - totalCosts;
    const profitMargin = totalCosts > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;

    setRevenueProjection(prev => ({
      ...prev,
      totalCosts,
      totalRevenue,
      netProfit,
      profitMargin,
      roi
    }));

    setTimeout(() => setIsCalculating(false), 1000);
  };

  const handleInputChange = (section: string, field: string, value: number) => {
    setCostBreakdown(prev => {
      const newBreakdown = { ...prev };
      if (section === 'seeds') {
        newBreakdown.seeds[field as keyof typeof newBreakdown.seeds] = value;
        newBreakdown.seeds.totalCost = newBreakdown.seeds.quantity * newBreakdown.seeds.pricePerUnit;
      } else if (section === 'fertilizers' || section === 'pesticides') {
        const sectionData = newBreakdown[section as keyof typeof newBreakdown] as any;
        const fieldData = sectionData[field as keyof typeof sectionData] as any;
        if (fieldData && typeof fieldData === 'object' && 'kg' in fieldData) {
          fieldData.kg = value;
          fieldData.total = fieldData.kg * fieldData.pricePerKg;
        } else if (fieldData && typeof fieldData === 'object' && 'liters' in fieldData) {
          fieldData.liters = value;
          fieldData.total = fieldData.liters * fieldData.pricePerLiter;
        }
      } else if (section === 'labor') {
        const laborData = newBreakdown.labor[field as keyof typeof newBreakdown.labor] as any;
        laborData.hours = value;
        laborData.total = laborData.hours * laborData.ratePerHour;
      } else if (section === 'irrigation' || section === 'equipment') {
        (newBreakdown[section] as any)[field as keyof typeof newBreakdown[typeof section]] = value;
      }
      return newBreakdown;
    });
  };

  const exportReport = () => {
    const report = {
      cropType,
      landArea,
      region,
      costBreakdown,
      revenueProjection,
      calculatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cost-calculator-${cropType}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getProfitStatus = () => {
    if (revenueProjection.roi >= 200) return { status: 'ممتاز', color: 'text-green-500', bgColor: 'bg-green-500/20' };
    if (revenueProjection.roi >= 100) return { status: 'جيد', color: 'text-blue-500', bgColor: 'bg-blue-500/20' };
    if (revenueProjection.roi >= 50) return { status: 'مقبول', color: 'text-yellow-500', bgColor: 'bg-yellow-500/20' };
    return { status: 'ضعيف', color: 'text-red-500', bgColor: 'bg-red-500/20' };
  };

  const profitStatus = getProfitStatus();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Calculator className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">حاسبة تكاليف زراعة {cropType}</h2>
                <p className="text-green-100">مساحة الأرض: {landArea} هكتار | المنطقة: {region}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-green-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Input Costs Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <DollarSign className="w-6 h-6 text-green-600 ml-2" />
              تكاليف المدخلات
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Seeds */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-gray-200 mb-3">البذور</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">الكمية (كجم)</label>
                    <input
                      type="number"
                      value={costBreakdown.seeds.quantity}
                      onChange={(e) => handleInputChange('seeds', 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">السعر لكل كجم (دج)</label>
                    <input
                      type="number"
                      value={costBreakdown.seeds.pricePerUnit}
                      onChange={(e) => handleInputChange('seeds', 'pricePerUnit', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-xl">
                    <p className="text-sm text-gray-400">إجمالي تكلفة البذور</p>
                    <p className="text-lg font-bold text-green-600">{costBreakdown.seeds.totalCost.toLocaleString()} دج</p>
                  </div>
                </div>
              </div>

              {/* Fertilizers */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-gray-200 mb-3">الأسمدة</h4>
                <div className="space-y-3">
                  {Object.entries(costBreakdown.fertilizers).map(([type, fert]) => (
                    <div key={type}>
                      <label className="block text-sm text-gray-400 mb-1">{type === 'nitrogen' ? 'نيتروجين' : type === 'phosphorus' ? 'فوسفور' : type === 'potassium' ? 'بوتاسيوم' : 'عضوي'} (كجم)</label>
                      <input
                        type="number"
                        value={fert.kg}
                        onChange={(e) => handleInputChange('fertilizers', type, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <div className="mt-1 text-sm text-gray-400">
                        السعر: {fert.pricePerKg} دج/كجم | الإجمالي: {fert.total.toLocaleString()} دج
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pesticides */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-gray-200 mb-3">المبيدات</h4>
                <div className="space-y-3">
                  {Object.entries(costBreakdown.pesticides).map(([type, pest]) => (
                    <div key={type}>
                      <label className="block text-sm text-gray-400 mb-1">{type === 'herbicides' ? 'مبيدات الأعشاب' : type === 'insecticides' ? 'مبيدات الحشرات' : 'مبيدات الفطريات'} (لتر)</label>
                      <input
                        type="number"
                        value={pest.liters}
                        onChange={(e) => handleInputChange('pesticides', type, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <div className="mt-1 text-sm text-gray-400">
                        السعر: {pest.pricePerLiter} دج/لتر | الإجمالي: {pest.total.toLocaleString()} دج
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Operational Costs Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 text-blue-600 ml-2" />
              تكاليف التشغيل
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Labor */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-gray-200 mb-3">العمالة</h4>
                <div className="space-y-3">
                  {Object.entries(costBreakdown.labor).map(([type, lab]) => (
                    <div key={type}>
                      <label className="block text-sm text-gray-400 mb-1">
                        {type === 'landPreparation' ? 'تحضير الأرض' : 
                         type === 'planting' ? 'الزراعة' : 
                         type === 'weeding' ? 'إزالة الأعشاب' : 'الحصاد'} (ساعات)
                      </label>
                      <input
                        type="number"
                        value={lab.hours}
                        onChange={(e) => handleInputChange('labor', type, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <div className="mt-1 text-sm text-gray-400">
                        السعر: {lab.ratePerHour} دج/ساعة | الإجمالي: {lab.total.toLocaleString()} دج
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Irrigation */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-gray-200 mb-3">الري</h4>
                <div className="space-y-3">
                  {Object.entries(costBreakdown.irrigation).map(([type, cost]) => (
                    <div key={type}>
                      <label className="block text-sm text-gray-400 mb-1">
                        {type === 'waterCost' ? 'تكلفة المياه' : 
                         type === 'electricity' ? 'الكهرباء' : 
                         type === 'equipment' ? 'المعدات' : 'الصيانة'} (دج)
                      </label>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) => handleInputChange('irrigation', type, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-gray-200 mb-3">المعدات</h4>
                <div className="space-y-3">
                  {Object.entries(costBreakdown.equipment).map(([type, cost]) => (
                    <div key={type}>
                      <label className="block text-sm text-gray-400 mb-1">
                        {type === 'tractorRental' ? 'إيجار الجرار' : 
                         type === 'implements' ? 'الأدوات' : 
                         type === 'fuel' ? 'الوقود' : 'الصيانة'} (دج)
                      </label>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) => handleInputChange('equipment', type, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Projection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 text-emerald-600 ml-2" />
              توقعات الإيرادات
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-gray-200 mb-3">المحصول المتوقع</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">الكمية المتوقعة ({revenueProjection.expectedYield.unit})</label>
                    <input
                      type="number"
                      value={revenueProjection.expectedYield.quantity}
                      onChange={(e) => setRevenueProjection(prev => ({
                        ...prev,
                        expectedYield: { ...prev.expectedYield, quantity: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">السعر المتوقع ({revenueProjection.marketPrice.pricePerUnit})</label>
                    <input
                      type="number"
                      value={revenueProjection.marketPrice.expectedPrice}
                      onChange={(e) => setRevenueProjection(prev => ({
                        ...prev,
                        marketPrice: { ...prev.marketPrice, expectedPrice: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={calculateTotals}
              disabled={isCalculating}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isCalculating ? (
                <>
                  <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                  جاري الحساب...
                </>
              ) : (
                <>
                  <Calculator className="w-6 h-6 mr-3" />
                  حساب التكاليف والأرباح
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          {revenueProjection.totalCosts > 0 && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">نتائج الحساب</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">إجمالي التكاليف</p>
                  <p className="text-2xl font-bold text-red-600">{revenueProjection.totalCosts.toLocaleString()} دج</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">الإيرادات المتوقعة</p>
                  <p className="text-2xl font-bold text-green-600">{revenueProjection.totalRevenue.toLocaleString()} دج</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">صافي الربح</p>
                  <p className={`text-2xl font-bold ${revenueProjection.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueProjection.netProfit.toLocaleString()} دج
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">نسبة العائد</p>
                  <p className="text-2xl font-bold text-blue-600">{revenueProjection.roi.toFixed(1)}%</p>
                </div>
              </div>

              {/* Profit Status */}
              <div className={`${profitStatus.bgColor} rounded-xl p-4 text-center mb-6`}>
                <div className="flex items-center justify-center space-x-2 space-x-reverse">
                  {revenueProjection.roi >= 200 ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : revenueProjection.roi >= 100 ? (
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  ) : revenueProjection.roi >= 50 ? (
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  )}
                  <span className={`text-lg font-bold ${profitStatus.color}`}>
                    حالة الربحية: {profitStatus.status}
                  </span>
                </div>
                <p className="text-gray-400 mt-2">
                  {revenueProjection.roi >= 200 ? 'مشروع مربح جداً - موصى به' :
                   revenueProjection.roi >= 100 ? 'مشروع مربح - جيد للاستثمار' :
                   revenueProjection.roi >= 50 ? 'مشروع مقبول - يحتاج مراجعة' :
                   'مشروع غير مربح - غير موصى به'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={exportReport}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  تصدير التقرير
                </button>
                <button
                  onClick={loadDefaultValues}
                  className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  إعادة تعيين
                </button>
              </div>
            </div>
          )}

          {/* Tips Section */}
          <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-500/30">
            <h4 className="text-lg font-bold text-blue-300 mb-4 flex items-center">
              <Info className="w-5 h-5 ml-2" />
              نصائح للمزارعين
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-300">
              <div>
                <p className="font-semibold mb-2">• احتفظ بسجلات دقيقة لجميع التكاليف</p>
                <p className="font-semibold mb-2">• قارن بين المحاصيل المختلفة</p>
                <p className="font-semibold mb-2">• راقب أسعار السوق باستمرار</p>
              </div>
              <div>
                <p className="font-semibold mb-2">• فكر في التكلفة على المدى الطويل</p>
                <p className="font-semibold mb-2">• استشر الخبراء قبل اتخاذ القرارات</p>
                <p className="font-semibold mb-2">• خطط لموسم الزراعة القادم</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostCalculator; 