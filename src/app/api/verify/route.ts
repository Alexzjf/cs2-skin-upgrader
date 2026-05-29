import { verifyResult } from "@/lib/provably-fair";

export async function POST(request: Request) {
  const body = await request.json();
  const { serverSeed, clientSeed, nonce } = body;

  if (!serverSeed || !clientSeed || nonce === undefined) {
    return Response.json(
      { error: "serverSeed, clientSeed, and nonce are required" },
      { status: 400 }
    );
  }

  const result = verifyResult(serverSeed, clientSeed, nonce);

  return Response.json({
    roll: Math.round(result.roll * 100) / 100,
    hash: result.hash,
  });
}
