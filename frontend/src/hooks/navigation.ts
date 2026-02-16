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

  const findPath = async (from: string, to: string) => { //At the moment, from should only be "Main Entrance"
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
      const urlFrom = encodeURIComponent(from);
      const urlTo = encodeURIComponent(to);
      const response = await fetch(
        `http://localhost:5000/api/navigation/from/${urlFrom}/to/${urlTo}`
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
  };
}
