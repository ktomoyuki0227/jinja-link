"use client";

interface Oshigami {
  id: string;
  name: string;
  personality: string;
  icon: string;
}

interface OshigamiSelectorProps {
  oshigami: Oshigami[];
  onSelect: (oshigamiId: string) => void;
}

export default function OshigamiSelector({
  oshigami,
  onSelect,
}: OshigamiSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {oshigami.map((o) => (
        <div
          key={o.id}
          onClick={() => onSelect(o.id)}
          className="p-6 rounded-lg border-2 border-gray-200 bg-white cursor-pointer hover:border-pink-500 hover:shadow-lg transition-all"
        >
          <div className="text-5xl mb-4">{o.icon}</div>
          <h3 className="text-xl font-bold mb-2">{o.name}</h3>
          <p className="text-gray-600 mb-4">{o.personality}</p>
          <button className="w-full py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-semibold">
            選ぶ
          </button>
        </div>
      ))}
    </div>
  );
}
