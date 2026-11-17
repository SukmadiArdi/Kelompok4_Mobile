import { useCallback, useEffect, useState } from 'react';
import { DestinationWeather } from '../types';
import {
  fetchDestinationWeather,
  fetchWeatherWithPromise,
  validateCoordinatesPromise,
} from '../services/weatherService';

/**
 * Custom Hook untuk mengambil data cuaca destinasi dari External API:
 * - Menggunakan Promise.resolve() & .then()/.catch()/.finally() di useEffect
 * - Menggunakan custom async function (async/await) pada fungsi refresh()
 */
export function useDestinationWeather(
  lat: number,
  lng: number,
  destinationName: string
) {
  const [weather, setWeather] = useState<DestinationWeather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    void Promise.resolve()
      .then(() => {
        if (!isCancelled) {
          setLoading(true);
          setError(null);
        }
        return validateCoordinatesPromise(lat, lng);
      })
      .then((coords) =>
        fetchWeatherWithPromise(coords.lat, coords.lng, destinationName)
      )
      .then((weatherObject) => {
        if (!isCancelled) {
          setWeather(weatherObject);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal memuat data cuaca dari External API.'
          );
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [lat, lng, destinationName]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchDestinationWeather(lat, lng, destinationName);
    if (result.success && result.data) {
      setWeather(result.data);
    } else {
      setError(result.message);
    }
    setLoading(false);
  }, [lat, lng, destinationName]);

  return { weather, loading, error, refresh };
}
