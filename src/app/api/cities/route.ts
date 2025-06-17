// app/api/cities/route.ts
import { NextResponse } from 'next/server';

interface OpenWeatherCity {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch city data: ${res.statusText}`);
    }

    const data: OpenWeatherCity[] = await res.json();

    if (!Array.isArray(data)) {
      console.error('City API did not return an array:', data);
      return NextResponse.json([]);
    }
    
    const formattedCities = data.map((city, index) => ({
        id: `${city.lat}-${city.lon}-${index}`,
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon,
    }));

    return NextResponse.json(formattedCities);
  } catch (err) {
    console.error('Error fetching city suggestions:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
