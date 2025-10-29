import { useState } from "react";

interface SearchResult {
  id: number;
  name: string;
  department?: string;
  tag?: string;
}

interface SearchBarProps {
  placeholder?: string;
  onResults?: (results: SearchResult[]) => void; // optional callback
}

export default function SearchBar({ placeholder = "Search...", onResults }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/search?q=${query}`);
      const data = await res.json();
      const r = data.results || [];
      setResults(r);
      if (onResults) onResults(r); // send results up if parent needs it
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block w-full max-w-md">
      <form onSubmit={handleSearch} className="flex">
        <input
          type="text"
          className="flex-1 border rounded-l p-2 outline-none"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
        >
          {loading ? "..." : "Search"}
        </button>
      </form>

      {results.length > 0 && (
        <ul className="absolute bg-white border mt-1 w-full rounded shadow-md z-10">
          {results.map((r) => (
            <li
              key={r.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => alert(`Selected: ${r.name}`)}
            >
              <strong>{r.name}</strong>
              {r.department && <span className="text-gray-500"> — {r.department}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}