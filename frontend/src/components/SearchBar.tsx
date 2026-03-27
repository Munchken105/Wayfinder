import { useState, useRef, useEffect, useCallback } from "react";
import Keyboard from "react-simple-keyboard";
import "simple-keyboard/build/css/index.css";
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

/** True when a touch screen or coarse pointer is present (e.g. Pi kiosk). */
function useTouchUi(): boolean {
  const [touchUi, setTouchUi] = useState(false);
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const touch = navigator.maxTouchPoints > 0;
    setTouchUi(coarse || touch);
  }, []);
  return touchUi;
}

export default function SearchBar({ placeholder = "Search...", onResults, onSelectResult }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const keyboardRef = useRef<{ setInput: (value: string) => void } | null>(null);
  const touchUi = useTouchUi();

  const MAX_QUERY_LENGTH = 40;

  const runSearch = useCallback(async () => {
    const trimmedQuery = query.trim().slice(0, MAX_QUERY_LENGTH);
    if (!trimmedQuery) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
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
  }, [query, onResults]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch();
  };

  const onKeyboardChange = (input: string) => {
    setQuery(input.slice(0, MAX_QUERY_LENGTH));
  };

  const onKeyboardKeyPress = (button: string) => {
    if (button === "{enter}") {
      void runSearch();
    }
  };

  useEffect(() => {
    keyboardRef.current?.setInput(query);
  }, [query]);

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
          inputMode={touchUi ? "none" : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value.slice(0, MAX_QUERY_LENGTH))}
        />
        <button type="submit" className="search-bar-button">
          {loading ? "..." : "Search"}
        </button>
      </form>

      {touchUi && (
        <div
          className="search-bar-virtual-keyboard"
          onMouseDown={(e) => e.preventDefault()}
          onPointerDown={(e) => e.preventDefault()}
        >
          <Keyboard
            keyboardRef={(r) => {
              keyboardRef.current = r;
            }}
            onChange={onKeyboardChange}
            onKeyPress={onKeyboardKeyPress}
            theme="hg-theme-default hg-layout-default"
            physicalKeyboardHighlight
            physicalKeyboardHighlightTextColor="#ffffff"
            physicalKeyboardHighlightBgColor="#005bbb"
          />
        </div>
      )}

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
                <strong>
                  {r.first_name} {r.last_name}
                </strong>
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
