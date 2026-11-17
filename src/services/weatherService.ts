import {
  DailyForecastItem,
  DestinationWeather,
  NusantaraDestinationPoint,
  OpenMeteoApiResponse,
  WeatherServiceResponse,
} from '../types';
import { delay } from '../utils/delay';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export const NUSANTARA_WEATHER_DESTINATIONS: NusantaraDestinationPoint[] = [
  { id: 'dest-yogya', name: 'Yogyakarta', region: 'Jawa', lat: -7.7956, lng: 110.3695 },
  { id: 'dest-sumba', name: 'Sumba Timur', region: 'NTT', lat: -9.5123, lng: 120.0894 },
  { id: 'dest-lombok', name: 'Lombok Utara', region: 'NTB', lat: -8.3522, lng: 116.4017 },
  { id: 'dest-banyuwangi', name: 'Banyuwangi', region: 'Jawa Timur', lat: -8.2192, lng: 114.3691 },
  { id: 'dest-toraja', name: 'Toraja Utara', region: 'Sulawesi', lat: -2.9718, lng: 119.8988 },
];

export function mapWeatherCodeToInfo(code: number): {
  label: string;
  icon: string;
  advice: string;
} {
  if (code === 0) {
    return {
      label: 'Cerah',
      icon: 'sunny',
      advice: 'Cuaca cerah ideal untuk eksplorasi wisata budaya & alam terbuka.',
    };
  }
  if (code >= 1 && code <= 3) {
    return {
      label: code === 1 ? 'Cerah Berawan' : 'Berawan',
      icon: 'partly-sunny',
      advice: 'Cuaca teduh dan nyaman untuk perjalanan darat maupun trekking ringan.',
    };
  }
  if (code === 45 || code === 48) {
    return {
      label: 'Berkabut',
      icon: 'cloudy',
      advice: 'Jarak pandang berkurang, berhati-hatilah saat melintasi jalur perbukitan.',
    };
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return {
      label: 'Hujan',
      icon: 'rainy',
      advice: 'Sediakan jas hujan/payung dan pilih alas kaki anti-slip.',
    };
  }
  if (code >= 95) {
    return {
      label: 'Badai Petir',
      icon: 'thunderstorm',
      advice: 'Tunda aktivitas luar ruang atau air terjun hingga cuaca kembali aman.',
    };
  }
  return {
    label: 'Berawan',
    icon: 'cloudy',
    advice: 'Pantau kondisi cuaca lokal sebelum memulai perjalanan.',
  };
}

export function mapOpenMeteoToDestinationWeather(
  raw: OpenMeteoApiResponse,
  destinationName: string
): DestinationWeather {
  const weatherInfo = mapWeatherCodeToInfo(raw.current.weather_code);
  const dailyDates = raw.daily?.time ?? [];
  const dailyForecasts: DailyForecastItem[] = dailyDates.map((dateStr, index) => ({
    date: dateStr,
    tempMaxC: raw.daily.temperature_2m_max[index] ?? raw.current.temperature_2m,
    tempMinC: raw.daily.temperature_2m_min[index] ?? raw.current.temperature_2m,
    rainChancePercent: raw.daily.precipitation_probability_max[index] ?? 0,
  }));

  const weatherObject: DestinationWeather = {
    destinationName,
    latitude: raw.latitude,
    longitude: raw.longitude,
    elevationM: Math.round(raw.elevation),
    timezone: raw.timezone_abbreviation || raw.timezone,
    temperatureC: raw.current.temperature_2m,
    humidityPercent: raw.current.relative_humidity_2m,
    windSpeedKmh: raw.current.wind_speed_10m,
    weatherCode: raw.current.weather_code,
    weatherLabel: weatherInfo.label,
    weatherIcon: weatherInfo.icon,
    travelAdvice: weatherInfo.advice,
    fetchedAt: raw.current.time,
    dailyForecasts,
  };

  return weatherObject;
}

export function validateCoordinatesPromise(
  lat: number,
  lng: number
): Promise<{ lat: number; lng: number }> {
  const isValidLat = Number.isFinite(lat) && lat >= -90 && lat <= 90;
  const isValidLng = Number.isFinite(lng) && lng >= -180 && lng <= 180;

  if (!isValidLat || !isValidLng) {
    return Promise.reject(
      new Error(`Koordinat tidak valid (lat: ${lat}, lng: ${lng}).`)
    );
  }

  return Promise.resolve({ lat, lng });
}

export function fetchWeatherWithPromise(
  lat: number,
  lng: number,
  destinationName: string
): Promise<DestinationWeather> {
  const queryParams = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Jakarta',
    forecast_days: '3',
  });

  const endpointUrl = `${OPEN_METEO_BASE_URL}?${queryParams.toString()}`;

  return new Promise<DestinationWeather>((resolve, reject) => {
    fetch(endpointUrl)
      .then((response) => {
        if (!response.ok) {
          reject(new Error(`Gagal mengambil data cuaca (HTTP ${response.status})`));
          return null;
        }
        // response.json() adalah pre-built async function yang mengembalikan Promise
        return response.json() as Promise<OpenMeteoApiResponse>;
      })
      .then((rawData) => {
        if (!rawData) return;

        if (!rawData.current || typeof rawData.current.temperature_2m !== 'number') {
          reject(new Error('Format respons dari External API Open-Meteo tidak sesuai.'));
          return;
        }

        const weatherObject: DestinationWeather = mapOpenMeteoToDestinationWeather(
          rawData,
          destinationName
        );
        resolve(weatherObject);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal terhubung ke External API Open-Meteo.';
        reject(new Error(message));
      });
  });
}


export async function fetchDestinationWeather(
  lat: number,
  lng: number,
  destinationName: string
): Promise<WeatherServiceResponse<DestinationWeather>> {
  try {
    const coords = await validateCoordinatesPromise(lat, lng);
    await delay(200);
    const weatherData = await fetchWeatherWithPromise(
      coords.lat,
      coords.lng,
      destinationName
    );

    return {
      success: true,
      data: weatherData,
      message: 'Berhasil mengambil data cuaca dari External API.',
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat memproses data cuaca.',
    };
  }
}

export async function fetchMultipleDestinationWeathers(
  destinations: NusantaraDestinationPoint[] = NUSANTARA_WEATHER_DESTINATIONS
): Promise<DestinationWeather[]> {
  const requests = destinations.map((dest) =>
    fetchWeatherWithPromise(dest.lat, dest.lng, dest.name)
  );
  return await Promise.all(requests);
}

