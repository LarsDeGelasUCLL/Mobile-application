import { useCallback, useState } from "react";
import { errorMessage, type TranslationKey } from "../../i18n";

/**
 * Loading state for a page load made of several steps. `run` sets
 * `isLoading`, awaits the steps, turns a failure into `error` (see
 * `errorMessage`, with the `fallback` key) and then sets `isLoaded`.
 */
export function useLoadState(fallback: TranslationKey) {
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
        setError(errorMessage(loadError, fallback));
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    },
    [fallback],
  );

  return { isLoading, isLoaded, error, run };
}
