// app/api/forecast/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Coordinates are required' }, { status: 400 });
  }

  try {
    // Using 5-day/3-hour forecast API (free tier)
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.message || 'Failed to fetch forecast' }, { status: res.status });
    }

    const data = await res.json();

    // Filter to get one forecast per day, around noon
    const dailyForecasts = data.list
      .filter((item: any) => item.dt_txt.includes('12:00:00'))
      .map((day: any) => ({
        dt: day.dt,
        temp: {
          day: day.main.temp,
          min: day.main.temp_min,
          max: day.main.temp_max,
        },
        weather: {
          main: day.weather[0].main,
          description: day.weather[0].description,
          icon: day.weather[0].icon,
        },
      }));

    return NextResponse.json(dailyForecasts);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
