import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("q");
  if (!query) return NextResponse.json({ error: "Arama terimi gerekli" }, { status: 400 });

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GOOGLE_MAPS_API_KEY tanımlı değil" }, { status: 500 });

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&language=tr&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  const places = (data.results ?? []).slice(0, 5).map((p: {
    place_id: string;
    name: string;
    formatted_address: string;
    rating?: number;
    user_ratings_total?: number;
  }) => ({
    placeId: p.place_id,
    name: p.name,
    address: p.formatted_address,
    rating: p.rating ?? null,
    totalRatings: p.user_ratings_total ?? 0,
  }));

  return NextResponse.json({ places });
}
