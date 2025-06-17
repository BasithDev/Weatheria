// app/api/weather/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!city && (!lat || !lon)) {
    return NextResponse.json({ error: 'City or coordinates are required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      city
        ? `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'City not found' }, { status: res.status });
    }

    const data = await res.json();

    const formatted = {
      city: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      feelsLike: data.main.feels_like,
      pressure: data.main.pressure,
      lat: data.coord.lat,
      lon: data.coord.lon,
    };

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
