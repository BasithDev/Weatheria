// --- TYPE DEFINITIONS ---
export interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  pressure: number;
  lat?: number;
  lon?: number;
}

export interface ForecastData {
  dt: number;
  temp: {
    min: number;
    max: number;
  };
  description: string;
  icon: string;
}

export interface CitySuggestion {
  id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}
