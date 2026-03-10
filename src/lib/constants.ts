export const CATEGORIES = [
  { value: "vegetables", label: "خضروات", emoji: "🥬" },
  { value: "fruits", label: "فواكه", emoji: "🍎" },
  { value: "grains", label: "حبوب", emoji: "🌾" },
  { value: "livestock", label: "مواشي", emoji: "🐄" },
  { value: "equipment", label: "معدات", emoji: "🚜" },
  { value: "land", label: "أراضي", emoji: "🌍" },
  { value: "seeds", label: "بذور", emoji: "🌱" },
  { value: "fertilizers", label: "أسمدة", emoji: "🧪" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export const WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة",
  "بشار", "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت",
  "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة",
  "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم",
  "المسيلة", "معسكر", "ورقلة", "وهران", "البيض", "إليزي", "برج بوعريريج",
  "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة",
  "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت",
  "غرداية", "غليزان", "تيميمون", "برج باجي مختار", "أولاد جلال",
  "بني عباس", "عين صالح", "عين قزام", "تقرت", "جانت", "المغير",
  "المنيعة",
] as const;

export const UNITS = [
  { value: "kg", label: "كيلوغرام" },
  { value: "ton", label: "طن" },
  { value: "piece", label: "قطعة" },
  { value: "bundle", label: "حزمة" },
  { value: "box", label: "صندوق" },
  { value: "hectare", label: "هكتار" },
  { value: "liter", label: "لتر" },
  { value: "bag", label: "كيس" },
] as const;

export const CONDITIONS = [
  { value: "new", label: "جديد" },
  { value: "excellent", label: "ممتاز" },
  { value: "good", label: "جيد" },
  { value: "fair", label: "مقبول" },
] as const;
