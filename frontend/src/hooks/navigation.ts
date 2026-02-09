import { useState } from "react";

export interface NavigationResult {
  start: string;
  end: string;
  totalSteps: number;
  floor: string;
  path: any[];
  instructions: string[];
}

export function useNavigation() {
  const [navigationResult, setNavigationResult] = useState<NavigationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setNavigationResult(null);
    setError("");
  }

  const findPath = async (from: string, to: string) => {
    if (!to || !from) {
      setError("Please select both start and end locations");
      return;
    }

    if (to === from) {
      setError("Start and end locations cannot be the same");
      return;
    }

    setLoading(true);
    setError("");
    setNavigationResult(null);

    try {
      const response = await fetch(
        `/api/navigation/from/${from}/to/${to}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setNavigationResult(data);
      } else {
        setError(data.error || "Failed to find path");
      }
    } catch {
      setError("Failed to connect to navigation service");
    } finally {
      setLoading(false);
    }
  };

  return {
    navigationResult,
    loading,
    error,
    findPath,
    reset
  };
}
