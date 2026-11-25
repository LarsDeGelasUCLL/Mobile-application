import { useCallback, useState } from "react";
import { getErrorMessage } from "../../utils/errors";

/**
 * Loading state for a page load made of several steps. `run` sets
 * `isLoading`, awaits the steps, turns a failure into `error` (with
 * `fallback` when the error has no message) and then sets `isLoaded`.
 */
export function useLoadState(fallback: string) {
  const [isLoading, setIsLoading] = useState(false);
  // Set after the first run, whatever its outcome.
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (load: () => Promise<void>) => {
      setIsLoading(true);
      setError(null);
      try {
        await load();
      } catch (loadError) {
        setError(getErrorMessage(loadError, fallback));
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    },
    [fallback],
  );

  return { isLoading, isLoaded, error, run };
}
