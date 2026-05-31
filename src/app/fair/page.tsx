"use client";

import { useState } from "react";

export default function FairPage() {
  const [serverSeed, setServerSeed] = useState("");
  const [clientSeed, setClientSeed] = useState("");
  const [nonce, setNonce] = useState("");
  const [verifyResult, setVerifyResult] = useState<{
    roll: number;
    hash: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!serverSeed || !clientSeed || !nonce) return;
    setVerifying(true);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serverSeed,
          clientSeed,
          nonce: parseInt(nonce, 10),
        }),
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch {
      setVerifyResult(null);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-2">Provably Fair</h1>
      <p className="text-gray-400 mb-8">
        Every upgrade result is determined by a provably fair algorithm. You can
        verify any result using the seeds and nonce below.
      </p>

      <div className="bg-[#12122a] rounded-2xl border border-[#2a2a4a] p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">How It Works</h2>
        <ol className="space-y-3 text-gray-300 text-sm list-decimal list-inside">
          <li>
            Before each roll, the server generates a random{" "}
            <span className="text-orange-400 font-mono">server_seed</span> and
            the client gets a random{" "}
            <span className="text-orange-400 font-mono">client_seed</span>.
          </li>
          <li>
            A combined hash is computed:{" "}
            <span className="text-orange-400 font-mono">
              HMAC-SHA256(server_seed, server_seed:client_seed:nonce)
            </span>
          </li>
          <li>
            The first 8 hex characters of the hash are converted to a decimal
            number, then mapped to a roll between 0.00 and 99.99.
          </li>
          <li>
            If the roll is less than the win chance percentage, you win the
            upgrade!
          </li>
          <li>
            After the game, both seeds are revealed so you can independently
            verify the result.
          </li>
        </ol>
      </div>

      <div className="bg-[#12122a] rounded-2xl border border-[#2a2a4a] p-6">
        <h2 className="text-xl font-bold text-white mb-4">Verify a Result</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Server Seed
            </label>
            <input
              type="text"
              value={serverSeed}
              onChange={(e) => setServerSeed(e.target.value)}
              placeholder="Enter server seed..."
              className="w-full bg-[#0f0f23] border border-[#2a2a4a] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Client Seed
            </label>
            <input
              type="text"
              value={clientSeed}
              onChange={(e) => setClientSeed(e.target.value)}
              placeholder="Enter client seed..."
              className="w-full bg-[#0f0f23] border border-[#2a2a4a] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nonce</label>
            <input
              type="number"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
              placeholder="Enter nonce..."
              className="w-full bg-[#0f0f23] border border-[#2a2a4a] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-orange-400"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={!serverSeed || !clientSeed || !nonce || verifying}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold py-3 rounded-lg hover:from-orange-400 hover:to-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? "Verifying..." : "Verify Result"}
          </button>

          {verifyResult && (
            <div className="bg-[#0f0f23] rounded-lg p-4 border border-[#2a2a4a]">
              <h3 className="text-sm font-bold text-white mb-2">Result</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Roll:</span>
                  <span className="text-orange-400 font-bold font-mono">
                    {verifyResult.roll.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Hash:</span>
                  <p className="text-green-400 font-mono text-xs mt-1 break-all">
                    {verifyResult.hash}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
