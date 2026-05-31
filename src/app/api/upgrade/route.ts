import { getSkinById } from "@/data/skins";
import {
  generateServerSeed,
  generateClientSeed,
  calculateUpgradeResult,
} from "@/lib/provably-fair";

let nonce = 0;

export async function POST(request: Request) {
  const body = await request.json();
  const { betSkinId, targetSkinId } = body;

  if (!betSkinId || !targetSkinId) {
    return Response.json(
      { error: "betSkinId and targetSkinId are required" },
      { status: 400 }
    );
  }

  const betSkin = getSkinById(betSkinId);
  const targetSkin = getSkinById(targetSkinId);

  if (!betSkin || !targetSkin) {
    return Response.json({ error: "Skin not found" }, { status: 404 });
  }

  if (betSkin.price >= targetSkin.price) {
    return Response.json(
      { error: "Bet skin must be cheaper than target skin" },
      { status: 400 }
    );
  }

  const chance = Math.min((betSkin.price / targetSkin.price) * 100, 95);

  const serverSeed = generateServerSeed();
  const clientSeed = generateClientSeed();
  nonce++;

  const { won, roll, hash } = calculateUpgradeResult(
    serverSeed,
    clientSeed,
    nonce,
    chance
  );

  return Response.json({
    won,
    chance: Math.round(chance * 100) / 100,
    roll: Math.round(roll * 100) / 100,
    targetSkin,
    betSkin,
    serverSeed,
    clientSeed,
    nonce,
    hash,
  });
}
