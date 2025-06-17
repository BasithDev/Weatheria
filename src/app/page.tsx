'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WeatherData, ForecastData } from '@/lib/types';
import SearchForm from '@/components/SearchForm';
import WeatherCard from '@/components/WeatherCard';

export default function Home() {
  // State for local weather
  const [localWeather, setLocalWeather] = useState<WeatherData | null>(null);
  const [localForecast, setLocalForecast] = useState<ForecastData[] | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLocalImageLoading, setLocalImageLoading] = useState(true);

  // State for searched weather
  const [searchedWeather, setSearchedWeather] = useState<WeatherData | null>(null);
  const [searchedForecast, setSearchedForecast] = useState<ForecastData[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearchImageLoading, setSearchImageLoading] = useState(true);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        setLocalLoading(true);
        setLocalError(null);
        try {
          const weatherResponse = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}`);
          const weatherData = await weatherResponse.json();
          if (!weatherResponse.ok) throw new Error(weatherData.error || 'Failed to fetch local weather.');
          setLocalWeather(weatherData);
          setLocalImageLoading(true);

          const forecastResponse = await fetch(`/api/forecast?lat=${latitude}&lon=${longitude}`);
          const forecastData = await forecastResponse.json();
          if (!forecastResponse.ok) throw new Error(forecastData.error || 'Failed to fetch local forecast.');
          setLocalForecast(forecastData);

        } catch (err: unknown) {
          if (err instanceof Error) {
            setLocalError(err.message);
          } else {
            setLocalError('An unknown error occurred while fetching local weather.');
          }
        } finally {
          setLocalLoading(false);
        }
      }, (error) => {
        setLocalError(`Geolocation error: ${error.message}`);
        setLocalLoading(false);
      });
    } else {
      setLocalError('Geolocation is not supported by your browser.');
      setLocalLoading(false);
    }
  }, []);

  const handleSearch = async (searchCity: string) => {
    if (!searchCity) return;
    setSearchLoading(true);
    setSearchError(null);
    setSearchedWeather(null);
    setSearchedForecast(null);

    try {
      const weatherResponse = await fetch(`/api/weather?city=${encodeURIComponent(searchCity)}`);
      const weatherData = await weatherResponse.json();
      if (!weatherResponse.ok) throw new Error(weatherData.error || 'City not found');
      setSearchedWeather(weatherData);
      setSearchImageLoading(true);

      if (weatherData.lat && weatherData.lon) {
        const forecastResponse = await fetch(`/api/forecast?lat=${weatherData.lat}&lon=${weatherData.lon}`);
        const forecastData = await forecastResponse.json();
        if (!forecastResponse.ok) throw new Error(forecastData.error || 'Failed to fetch forecast.');
        setSearchedForecast(forecastData);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSearchError(err.message);
      } else {
        setSearchError('An unknown error occurred during the search.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4 sm:p-6 lg:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <SearchForm onSearch={handleSearch} />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:sticky lg:top-8"
          >
            <WeatherCard
              title="Your Location"
              weather={localWeather}
              forecast={localForecast}
              isLoading={localLoading}
              error={localError}
              isImageLoading={isLocalImageLoading}
              onImageLoad={() => setLocalImageLoading(false)}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <WeatherCard
              title="Search Result"
              weather={searchedWeather}
              forecast={searchedForecast}
              isLoading={searchLoading}
              error={searchError}
              isImageLoading={isSearchImageLoading}
              onImageLoad={() => setSearchImageLoading(false)}
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}
