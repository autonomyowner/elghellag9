// NASA POWER API — Real agricultural weather data
// Free, no API key needed
// https://power.larc.nasa.gov/docs/services/api/

export interface NasaPowerData {
  temperature: number | null;       // °C average
  temperatureMax: number | null;    // °C max
  temperatureMin: number | null;    // °C min
  humidity: number | null;          // %
  rainfall: number | null;          // mm/day average
  windSpeed: number | null;         // m/s
  solarRadiation: number | null;    // kWh/m²/day
  pressure: number | null;          // kPa
}

export interface NasaData {
  power: NasaPowerData;
  gibs: {
    landCover: string;
    tileUrl: string;
  };
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function average(values: Record<string, number>): number | null {
  const nums = Object.values(values).filter(v => v !== -999 && v !== null && v !== undefined);
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export async function fetchPowerData(lat: number, lon: number): Promise<NasaPowerData> {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,RH2M,PRECTOTCORR,WS2M,ALLSKY_SFC_SW_DWN,PS&community=AG&longitude=${lon}&latitude=${lat}&start=${formatDate(start)}&end=${formatDate(end)}&format=JSON`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn('NASA POWER API status:', response.status);
      return nullPowerData();
    }

    const data = await response.json();
    const params = data.properties?.parameter;
    if (!params) return nullPowerData();

    return {
      temperature: average(params.T2M ?? {}),
      temperatureMax: average(params.T2M_MAX ?? {}),
      temperatureMin: average(params.T2M_MIN ?? {}),
      humidity: average(params.RH2M ?? {}),
      rainfall: average(params.PRECTOTCORR ?? {}),
      windSpeed: average(params.WS2M ?? {}),
      solarRadiation: average(params.ALLSKY_SFC_SW_DWN ?? {}),
      pressure: average(params.PS ?? {}),
    };
  } catch (error) {
    console.error('NASA POWER API error:', error);
    return nullPowerData();
  }
}

function nullPowerData(): NasaPowerData {
  return {
    temperature: null,
    temperatureMax: null,
    temperatureMin: null,
    humidity: null,
    rainfall: null,
    windSpeed: null,
    solarRadiation: null,
    pressure: null,
  };
}

function getLandCoverType(lat: number, lon: number): string {
  if (lat > 35 && lon > -2 && lon < 10) return 'زراعة متوسطية';
  if (lat > 33 && lat <= 35) return 'زراعة هضابية';
  if (lat <= 33) return 'زراعة صحراوية';
  return 'زراعة عامة';
}

export function fetchGibsData(lat: number, lon: number): { landCover: string; tileUrl: string } {
  const today = new Date().toISOString().split('T')[0];
  const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_NDVI_8Day/default/${today}/250m/6/${Math.floor((90 - lat) / 180 * 64)}/${Math.floor((lon + 180) / 360 * 128)}.png`;

  return {
    landCover: getLandCoverType(lat, lon),
    tileUrl,
  };
}

export async function fetchNasaData(lat: number, lon: number): Promise<NasaData> {
  const [power, gibs] = await Promise.all([
    fetchPowerData(lat, lon),
    Promise.resolve(fetchGibsData(lat, lon)),
  ]);

  return { power, gibs };
}
