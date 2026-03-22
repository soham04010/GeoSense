export interface RiskInfo {
  level: string;
  color: string;
  message: string;
  action: string;
}

export interface CitySummary {
  city: string;
  pm25: number;
  aqi?: number;
  station?: string;
  is_anomaly: boolean;
  all_pollutants: Record<string, number>;
  warming: number;
  predicted_2050: number;
  risks: {
    air_quality?: RiskInfo;
    soil?: RiskInfo;
    temperature?: RiskInfo;
  };
}

export interface ChartDataPoint {
  year: number;
  temperature: number;
}

export interface CityTrends {
  city: string;
  parameter: string;
  chart_data: ChartDataPoint[];
}

export interface Alert {
  parameter: string;
  level: string;
  color: string;
  message: string;
  action: string;
}

export interface CityAnomalies {
  city: string;
  alerts: Alert[];
}

export interface WardData {
  ward: string;
  lst: number;
  ndvi: number;
  pm25: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  ozone?: number;
  aqi?: number;
  lat: number;
  lng: number;
  geometry: any;
}

export interface CityHeatmap {
  city: string;
  wards: WardData[];
}
