"use client";

type Props = {
  min: string;
  max: string;
  beds: string;
  baths: string;
  type: string;
  onChange: (key: string, value: string) => void;
};

const chip = "rounded-full border px-3 py-2 text-sm hover:bg-gray-50";

export default function FilterBar({
  min,
  max,
  beds,
  baths,
  type,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        <input
          inputMode="numeric"
          placeholder="Min"
          className="w-20 rounded-full border px-3 py-2 text-sm focus:ring-2 focus:ring-black"
          value={min}
          onChange={(e) => onChange("min", e.target.value)}
        />
        <span className="text-gray-400">–</span>
        <input
          inputMode="numeric"
          placeholder="Max"
          className="w-20 rounded-full border px-3 py-2 text-sm focus:ring-2 focus:ring-black"
          value={max}
          onChange={(e) => onChange("max", e.target.value)}
        />
      </div>

      <select
        className={chip}
        value={beds}
        onChange={(e) => onChange("beds", e.target.value)}
        aria-label="Beds"
      >
        <option value="">Beds</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
      </select>

      <select
        className={chip}
        value={baths}
        onChange={(e) => onChange("baths", e.target.value)}
        aria-label="Baths"
      >
        <option value="">Baths</option>
        <option value="1">1+</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
      </select>

      <select
        className={chip}
        value={type}
        onChange={(e) => onChange("type", e.target.value)}
        aria-label="Home type"
      >
        <option value="">Home type</option>
        <option value="house">House</option>
        <option value="condo">Condo</option>
        <option value="townhouse">Townhouse</option>
        <option value="semi">Semi-detached</option>
      </select>

      <button className={chip} onClick={() => alert("More filters (stub)")}>
        More
      </button>
    </div>
  );
}