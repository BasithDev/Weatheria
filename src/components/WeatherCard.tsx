"use client";

import { motion } from 'framer-motion';
import { Droplets, Wind, Gauge, Thermometer, MapPin, Loader } from 'lucide-react';
import Image from 'next/image';
import { WeatherData, ForecastData } from '@/lib/types';

const MotionImage = motion(Image);

interface WeatherCardProps {
  title: string;
  weather: WeatherData | null;
  forecast: ForecastData[] | null;
  isLoading: boolean;
  error: string | null;
  isImageLoading: boolean;
  onImageLoad: () => void;
}

const WeatherCard = ({ title, weather, forecast, isLoading, error, isImageLoading, onImageLoad }: WeatherCardProps) => {
  const cardContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <Loader className="animate-spin h-12 w-12 text-white" />
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-red-400">
          <p className="text-center text-xl font-bold">{error}</p>
          <p className="text-center mt-2 text-sm text-white/70">Please try searching for another city.</p>
        </div>
      );
    }

    if (!weather) {
      return <p className="text-center min-h-[400px] flex items-center justify-center text-lg">Search for a city to see the weather.</p>;
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="text-center">
          <h2 className="text-3xl font-bold">{weather.city}</h2>
          <div className="flex justify-center items-center my-2">
            {weather.icon && (
              <MotionImage
                key={weather.icon}
                src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                alt={weather.description}
                width={160}
                height={160}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: isImageLoading ? 0 : 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onLoad={onImageLoad}
                priority
              />
            )}
            <p className="text-6xl font-bold ml-4">{Math.round(weather.temperature)}°C</p>
          </div>
          <p className="capitalize text-xl">{weather.description}</p>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8 grid grid-cols-2 gap-4 text-md">
          {typeof weather.humidity === 'number' && <div className="flex items-center gap-2"><Droplets /> Humidity: {weather.humidity}%</div>}
          {typeof weather.windSpeed === 'number' && <div className="flex items-center gap-2"><Wind /> Wind: {weather.windSpeed.toFixed(1)} m/s</div>}
          {typeof weather.pressure === 'number' && <div className="flex items-center gap-2"><Gauge /> Pressure: {weather.pressure} hPa</div>}
          {typeof weather.feelsLike === 'number' && <div className="flex items-center gap-2"><Thermometer /> Feels like: {Math.round(weather.feelsLike)}°C</div>}
        </motion.div>

        {forecast && forecast.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 w-full">
            <h3 className="text-2xl font-semibold text-center mb-4">5-Day Forecast</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {forecast.map((day, index) => (
                <motion.div key={day.dt} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }} className="bg-white/20 p-3 rounded-lg text-center flex flex-col items-center justify-between">
                  <p className="font-semibold text-md">{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  {day?.icon && (
                    <MotionImage src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt={day.description} width={60} height={60} className="my-1" />
                  )}
                  <p className="text-md font-semibold">{Math.round(day.temp.max)}°</p>
                  <p className="text-sm opacity-80">{Math.round(day.temp.min)}°</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl shadow-lg p-6 text-white w-full">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><MapPin /> {title}</h2>
      {cardContent()}
    </div>
  );
};

export default WeatherCard;
