/**
 * Interface untuk data unit cuaca terkini dari External API Open-Meteo.
 */
export interface OpenMeteoCurrentUnits {
  time: string;
  interval: string;
  temperature_2m: string;
  relative_humidity_2m: string;
  wind_speed_10m: string;
  weather_code: string;
}

/**
 * Interface untuk data cuaca terkini (current) dari External API Open-Meteo.
 */
export interface OpenMeteoCurrentData {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
}

/**
 * Interface untuk prakiraan harian (daily) dari External API Open-Meteo.
 */
export interface OpenMeteoDailyData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
}

/**
 * Interface respons mentah JSON dari External API Open-Meteo.
 */
export interface OpenMeteoApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: OpenMeteoCurrentUnits;
  current: OpenMeteoCurrentData;
  daily: OpenMeteoDailyData;
}

/**
 * Interface Object untuk item prakiraan cuaca harian yang sudah dipetakan.
 */
export interface DailyForecastItem {
  date: string;
  tempMaxC: number;
  tempMinC: number;
  rainChancePercent: number;
}

/**
 * Interface Object utama untuk menyimpan data cuaca destinasi LokalTrip
 * hasil pemetaan dari External API.
 */
export interface DestinationWeather {
  destinationName: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  timezone: string;
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  weatherCode: number;
  weatherLabel: string;
  weatherIcon: string;
  travelAdvice: string;
  fetchedAt: string;
  dailyForecasts: DailyForecastItem[];
}

/**
 * Interface wrapper generik untuk hasil pemanggilan service async.
 */
export interface WeatherServiceResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * Interface titik koordinat destinasi wisata Nusantara untuk pengecekan cuaca.
 */
export interface NusantaraDestinationPoint {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

