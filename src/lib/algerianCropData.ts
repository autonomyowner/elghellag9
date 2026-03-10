// Algerian Agricultural Crop Data
// Accurate crop calendar, climate zones, and recommendations for Algeria

export type ClimateZone = 'ساحلية' | 'هضابية' | 'صحراوية';

export interface CropInfo {
  nameAr: string;
  nameEn: string;
  plantingMonths: number[];   // 1-12
  harvestMonths: number[];    // 1-12
  optimalTempMin: number;     // °C
  optimalTempMax: number;     // °C
  waterNeeds: 'منخفضة' | 'متوسطة' | 'عالية';
  soilPhMin: number;
  soilPhMax: number;
  yieldPerHa: number;        // tons/ha average
  pricePerTon: number;       // DZD/ton
  suitableZones: ClimateZone[];
}

export const CROPS: Record<string, CropInfo> = {
  wheat: {
    nameAr: 'قمح',
    nameEn: 'wheat',
    plantingMonths: [10, 11, 12],
    harvestMonths: [5, 6, 7],
    optimalTempMin: 10,
    optimalTempMax: 25,
    waterNeeds: 'متوسطة',
    soilPhMin: 6.0,
    soilPhMax: 7.5,
    yieldPerHa: 4.5,
    pricePerTon: 45000,
    suitableZones: ['ساحلية', 'هضابية'],
  },
  barley: {
    nameAr: 'شعير',
    nameEn: 'barley',
    plantingMonths: [10, 11],
    harvestMonths: [5, 6],
    optimalTempMin: 8,
    optimalTempMax: 22,
    waterNeeds: 'منخفضة',
    soilPhMin: 6.0,
    soilPhMax: 8.0,
    yieldPerHa: 3.5,
    pricePerTon: 35000,
    suitableZones: ['ساحلية', 'هضابية', 'صحراوية'],
  },
  potatoes: {
    nameAr: 'بطاطس',
    nameEn: 'potatoes',
    plantingMonths: [1, 2, 3, 9, 10],
    harvestMonths: [5, 6, 7, 12, 1],
    optimalTempMin: 12,
    optimalTempMax: 22,
    waterNeeds: 'عالية',
    soilPhMin: 5.0,
    soilPhMax: 6.5,
    yieldPerHa: 25,
    pricePerTon: 40000,
    suitableZones: ['ساحلية', 'هضابية'],
  },
  tomatoes: {
    nameAr: 'طماطم',
    nameEn: 'tomatoes',
    plantingMonths: [2, 3, 4],
    harvestMonths: [6, 7, 8, 9],
    optimalTempMin: 18,
    optimalTempMax: 30,
    waterNeeds: 'عالية',
    soilPhMin: 6.0,
    soilPhMax: 7.0,
    yieldPerHa: 40,
    pricePerTon: 30000,
    suitableZones: ['ساحلية', 'هضابية'],
  },
  onions: {
    nameAr: 'بصل',
    nameEn: 'onions',
    plantingMonths: [9, 10, 11],
    harvestMonths: [4, 5, 6],
    optimalTempMin: 12,
    optimalTempMax: 25,
    waterNeeds: 'متوسطة',
    soilPhMin: 6.0,
    soilPhMax: 7.0,
    yieldPerHa: 30,
    pricePerTon: 25000,
    suitableZones: ['ساحلية', 'هضابية'],
  },
  olives: {
    nameAr: 'زيتون',
    nameEn: 'olives',
    plantingMonths: [11, 12, 1, 2],
    harvestMonths: [10, 11, 12],
    optimalTempMin: 10,
    optimalTempMax: 30,
    waterNeeds: 'منخفضة',
    soilPhMin: 6.5,
    soilPhMax: 8.5,
    yieldPerHa: 5,
    pricePerTon: 120000,
    suitableZones: ['ساحلية', 'هضابية'],
  },
  dates: {
    nameAr: 'تمور',
    nameEn: 'dates',
    plantingMonths: [3, 4],
    harvestMonths: [9, 10, 11],
    optimalTempMin: 25,
    optimalTempMax: 45,
    waterNeeds: 'عالية',
    soilPhMin: 7.0,
    soilPhMax: 8.5,
    yieldPerHa: 8,
    pricePerTon: 200000,
    suitableZones: ['صحراوية'],
  },
  citrus: {
    nameAr: 'حمضيات',
    nameEn: 'citrus',
    plantingMonths: [2, 3, 4],
    harvestMonths: [11, 12, 1, 2],
    optimalTempMin: 13,
    optimalTempMax: 35,
    waterNeeds: 'عالية',
    soilPhMin: 5.5,
    soilPhMax: 7.0,
    yieldPerHa: 20,
    pricePerTon: 60000,
    suitableZones: ['ساحلية'],
  },
  watermelon: {
    nameAr: 'بطيخ',
    nameEn: 'watermelon',
    plantingMonths: [3, 4, 5],
    harvestMonths: [7, 8, 9],
    optimalTempMin: 20,
    optimalTempMax: 35,
    waterNeeds: 'عالية',
    soilPhMin: 6.0,
    soilPhMax: 7.0,
    yieldPerHa: 35,
    pricePerTon: 15000,
    suitableZones: ['ساحلية', 'هضابية', 'صحراوية'],
  },
  chickpeas: {
    nameAr: 'حمص',
    nameEn: 'chickpeas',
    plantingMonths: [11, 12, 1],
    harvestMonths: [5, 6],
    optimalTempMin: 10,
    optimalTempMax: 25,
    waterNeeds: 'منخفضة',
    soilPhMin: 6.0,
    soilPhMax: 8.0,
    yieldPerHa: 1.5,
    pricePerTon: 80000,
    suitableZones: ['ساحلية', 'هضابية'],
  },
  lentils: {
    nameAr: 'عدس',
    nameEn: 'lentils',
    plantingMonths: [11, 12],
    harvestMonths: [5, 6],
    optimalTempMin: 10,
    optimalTempMax: 22,
    waterNeeds: 'منخفضة',
    soilPhMin: 6.0,
    soilPhMax: 8.0,
    yieldPerHa: 1.2,
    pricePerTon: 90000,
    suitableZones: ['ساحلية', 'هضابية'],
  },
  corn: {
    nameAr: 'ذرة',
    nameEn: 'corn',
    plantingMonths: [3, 4, 5],
    harvestMonths: [8, 9, 10],
    optimalTempMin: 18,
    optimalTempMax: 32,
    waterNeeds: 'عالية',
    soilPhMin: 5.8,
    soilPhMax: 7.0,
    yieldPerHa: 8,
    pricePerTon: 35000,
    suitableZones: ['ساحلية', 'هضابية'],
  },
};

const MONTH_NAMES_AR = [
  '', 'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export function getMonthNameAr(month: number): string {
  return MONTH_NAMES_AR[month] || '';
}

export function getClimateZone(lat: number): ClimateZone {
  if (lat > 35.5) return 'ساحلية';
  if (lat > 33) return 'هضابية';
  return 'صحراوية';
}

export function getSuitableCrops(lat: number, month: number): CropInfo[] {
  const zone = getClimateZone(lat);
  return Object.values(CROPS).filter(crop =>
    crop.suitableZones.includes(zone) &&
    (crop.plantingMonths.includes(month) || crop.harvestMonths.includes(month))
  );
}

export interface CropRecommendation {
  crop: CropInfo;
  reason: string;
  score: number; // 0-100
}

export function getCropRecommendations(
  temp: number | null,
  rainfall: number | null,
  soilPh: number | null,
  lat: number
): CropRecommendation[] {
  const zone = getClimateZone(lat);
  const currentMonth = new Date().getMonth() + 1;

  return Object.values(CROPS)
    .filter(crop => crop.suitableZones.includes(zone))
    .map(crop => {
      let score = 50; // base score for being in the right zone
      const reasons: string[] = [];

      // Temperature suitability
      if (temp !== null) {
        if (temp >= crop.optimalTempMin && temp <= crop.optimalTempMax) {
          score += 20;
          reasons.push('درجة الحرارة مناسبة');
        } else if (temp < crop.optimalTempMin - 5 || temp > crop.optimalTempMax + 5) {
          score -= 20;
          reasons.push('درجة الحرارة غير مناسبة');
        }
      }

      // pH suitability
      if (soilPh !== null && soilPh > 0) {
        if (soilPh >= crop.soilPhMin && soilPh <= crop.soilPhMax) {
          score += 15;
          reasons.push('حموضة التربة مناسبة');
        } else {
          score -= 10;
          reasons.push('حموضة التربة خارج النطاق المثالي');
        }
      }

      // Planting season
      if (crop.plantingMonths.includes(currentMonth)) {
        score += 15;
        reasons.push('موسم الزراعة الحالي');
      } else if (crop.harvestMonths.includes(currentMonth)) {
        score += 5;
        reasons.push('موسم الحصاد');
      }

      return {
        crop,
        reason: reasons.join(' | ') || `مناسب للمنطقة ${zone}`,
        score: Math.max(0, Math.min(100, score)),
      };
    })
    .sort((a, b) => b.score - a.score);
}
