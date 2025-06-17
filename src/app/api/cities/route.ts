// app/api/cities/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const API_KEY = process.env.OPENWEATHER_API_KEY;

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch cities' }, { status: res.status });
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('City API did not return an array:', data);
      return NextResponse.json([]);
    }
    
    const formattedCities = data.map((city: any, index: number) => ({
        id: `${city.lat}-${city.lon}-${index}`,
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon,
    }));

    return NextResponse.json(formattedCities);
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
