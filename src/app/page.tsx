import UpgradeGame from "@/components/UpgradeGame";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-white mb-2">
          CS2 Skin <span className="text-orange-400">Upgrader</span>
        </h1>
        <p className="text-gray-400">
          Pick your skin, choose a target, and try your luck!
        </p>
      </div>
      <UpgradeGame />
    </div>
  );
}
