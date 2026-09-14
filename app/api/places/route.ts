import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { niche, city } = await request.json();
  const query = `${niche} em ${city}`;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) return NextResponse.json({ error: 'API Key missing' }, { status: 500 });

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber'
      },
      body: JSON.stringify({ textQuery: query })
    });

    const data = await response.json();
    
    // Filtra APENAS quem NÃO tem site
    const potentialClients = (data.places || []).filter((place: any) => !place.websiteUri);

    // Calculando o "Score de Potencial"
    const clientsWithScore = potentialClients.map((place: any) => {
      const rating = place.rating || 0;
      const reviews = place.userRatingCount || 0;
      
      let score = 30;
      if (rating >= 4.5 && reviews > 30) score = 95;
      else if (rating >= 4.0 && reviews > 10) score = 75;
      else if (rating >= 3.5) score = 50;

      return { ...place, potentialScore: score };
    });

    return NextResponse.json(clientsWithScore);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch places' }, { status: 500 });
  }
}