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

/** Restrict in-page keyboard to the local kiosk session on the Pi. */
function useLocalKioskHost(): boolean {
  const [isLocalKioskHost, setIsLocalKioskHost] = useState(false);
  useEffect(() => {
    const host = window.location.hostname;
    setIsLocalKioskHost(host === "localhost" || host === "127.0.0.1");
  }, []);
  return isLocalKioskHost;
}

export default function SearchBar({ placeholder = "Search...", onResults, onSelectResult }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardRef = useRef<{ setInput: (value: string) => void } | null>(null);
  const touchUi = useTouchUi();
  const isLocalKioskHost = useLocalKioskHost();
  const showVirtualKeyboard = touchUi && isLocalKioskHost;

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
      setKeyboardVisible(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    keyboardRef.current?.setInput(query);
  }, [query]);

  useEffect(() => {
    function handleInteractionOutside(event: Event) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setResults([]);
        setSearched(false);
        setKeyboardVisible(false);
      }
    }

    document.addEventListener("pointerdown", handleInteractionOutside);
    document.addEventListener("touchstart", handleInteractionOutside);
    document.addEventListener("mousedown", handleInteractionOutside);
    return () => {
      document.removeEventListener("pointerdown", handleInteractionOutside);
      document.removeEventListener("touchstart", handleInteractionOutside);
      document.removeEventListener("mousedown", handleInteractionOutside);
    };
  }, []);

  return (
    <div className="search-bar-container" ref={containerRef}>
      <form onSubmit={handleSearch} className="search-bar-form">
        <input
          ref={inputRef}
          type="text"
          className="search-bar-input"
          placeholder={placeholder}
          value={query}
          inputMode={showVirtualKeyboard ? "none" : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          onFocus={() => setKeyboardVisible(true)}
          onBlur={() => {
            window.setTimeout(() => {
              const active = document.activeElement;
              if (!containerRef.current?.contains(active)) {
                setKeyboardVisible(false);
              }
            }, 0);
          }}
          onChange={(e) => setQuery(e.target.value.slice(0, MAX_QUERY_LENGTH))}
        />
        <button type="submit" className="search-bar-button">
          {loading ? "..." : "Search"}
        </button>
      </form>

      {showVirtualKeyboard && keyboardVisible && (
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
                  setKeyboardVisible(false);
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
