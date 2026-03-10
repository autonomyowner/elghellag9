// SoilGrids REST API - Real soil data from ISRIC
// Free, CORS-friendly, no API key needed
// https://rest.isric.org/soilgrids/v2.0/docs

export interface SoilGridsData {
  clay: number;      // % weight
  sand: number;      // % weight
  silt: number;      // % weight
  ph: number;        // pH units (API returns ×10)
  organicCarbon: number; // g/kg
  nitrogen: number;  // cg/kg
  soilType: string;  // Derived: طينية / رملية / طميية
}

export async function fetchSoilGridsData(lat: number, lon: number): Promise<SoilGridsData | null> {
  try {
    const url = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=clay&property=sand&property=silt&property=phh2o&property=ocd&property=nitrogen&depth=0-5cm&value=mean`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn('SoilGrids API returned status:', response.status);
      return null;
    }

    const data = await response.json();
    const layers = data.properties?.layers;
    if (!layers || layers.length === 0) return null;

    const getValue = (propertyName: string): number | null => {
      const layer = layers.find((l: any) => l.name === propertyName);
      const depth = layer?.depths?.find((d: any) => d.label === '0-5cm');
      const val = depth?.values?.mean;
      return val !== undefined && val !== null ? val : null;
    };

    const clayRaw = getValue('clay');     // g/kg
    const sandRaw = getValue('sand');     // g/kg
    const siltRaw = getValue('silt');     // g/kg
    const phRaw = getValue('phh2o');      // pH × 10
    const ocdRaw = getValue('ocd');       // dg/kg (decigrams per kg)
    const nitrogenRaw = getValue('nitrogen'); // cg/kg

    if (clayRaw === null && sandRaw === null) return null;

    // Convert g/kg to percentage
    const clay = clayRaw !== null ? clayRaw / 10 : 0;
    const sand = sandRaw !== null ? sandRaw / 10 : 0;
    const silt = siltRaw !== null ? siltRaw / 10 : 0;
    const ph = phRaw !== null ? phRaw / 10 : 0;
    const organicCarbon = ocdRaw !== null ? ocdRaw / 10 : 0; // Convert dg/kg to g/kg
    const nitrogen = nitrogenRaw !== null ? nitrogenRaw : 0;

    // Derive soil type in Arabic
    let soilType: string;
    if (clay > 40) {
      soilType = 'طينية';
    } else if (sand > 60) {
      soilType = 'رملية';
    } else {
      soilType = 'طميية';
    }

    return { clay, sand, silt, ph, organicCarbon, nitrogen, soilType };
  } catch (error) {
    console.error('SoilGrids API error:', error);
    return null;
  }
}
