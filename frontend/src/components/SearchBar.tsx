import { useState, useRef, useEffect } from "react";
import "./SearchBar.css";

interface SearchResult {
  id: number;
  first_name: string;
  last_name: string;
  room?: string;
  subjects?: string;
}

interface SearchBarProps {
  placeholder?: string;
  onResults?: (results: SearchResult[]) => void;
  onSelectResult: (room: string) => void;
}

export default function SearchBar({ placeholder = "Search...", onResults, onSelectResult }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const MAX_QUERY_LENGTH = 40; // Max allowed characters for the search bar

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedQuery = query.trim().slice(0, MAX_QUERY_LENGTH);

    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/search?q=${encodeURIComponent(trimmedQuery)}`);
      const data = await res.json();
      const r = data.results || [];
      setResults(r);
      if (onResults) onResults(r);
      setSearched(true);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setResults([]);
        setSearched(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-bar-container" ref={containerRef}>
      <form onSubmit={handleSearch} className="search-bar-form">
        <input
          type="text"
          className="search-bar-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, MAX_QUERY_LENGTH))} // enforce limit while typing
        />
        <button type="submit" className="search-bar-button">
          {loading ? "..." : "Search"}
        </button>
      </form>

      {searched && (
        <ul className="search-bar-results">
          {results.length > 0 ? (
            results.map((r) => (
              <li
                key={r.id}
                onClick={() => {
                  if (r.room) {
                    onSelectResult(r.room);
                  }
                  setResults([]);
                  setSearched(false);
                }}
              >
                <strong>{r.first_name} {r.last_name}</strong>
                {r.room && <span> {r.room}</span>}
                {r.subjects && <span> {r.subjects}</span>}
              </li>
            ))
          ) : (
            <li className="search-bar-no-results">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}
