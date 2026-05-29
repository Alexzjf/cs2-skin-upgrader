import { skins } from "@/data/skins";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const rarity = searchParams.get("rarity");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const search = searchParams.get("search");

  let filtered = [...skins];

  if (rarity) {
    filtered = filtered.filter((s) => s.rarity === rarity);
  }

  if (minPrice) {
    filtered = filtered.filter((s) => s.price >= parseFloat(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter((s) => s.price <= parseFloat(maxPrice));
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.weapon.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => a.price - b.price);

  return Response.json({ skins: filtered });
}
