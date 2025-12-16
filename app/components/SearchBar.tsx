"use client";

import { useState } from "react";

export default function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value ?? "");
  return (
    <div className="relative w-72">
      <input
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        ⌕
      </span>
    </div>
  );
}