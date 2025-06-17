// app/api/forecast/route.ts
import { NextResponse } from 'next/server';

// This is the structure for a single forecast item in the 'list' array from the API
interface ForecastListItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  dt_txt: string;
}

// This is the overall structure of the API response
interface OpenWeatherForecastResponse {
  list: ForecastListItem[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch forecast data: ${res.statusText}`);
    }

    const data: OpenWeatherForecastResponse = await res.json();

    // Filter to get one forecast per day (around noon)
    const dailyForecasts = data.list
      .filter((item) => item.dt_txt.includes('12:00:00'))
      .map((item) => ({
        dt: item.dt,
        temp: {
          day: item.main.temp,
          min: item.main.temp_min,
          max: item.main.temp_max,
        },
        weather: {
          main: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        },
      }));

    return NextResponse.json(dailyForecasts);
  } catch (err) {
    console.error('Error fetching forecast data:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
