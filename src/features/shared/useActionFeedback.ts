import { useState } from "react";

/**
 * Success feedback for store actions. `run` clears the old message and the
 * store error, awaits the action and, when it resolves, shows `success`. A
 * failure leaves the message empty: the store holds the error for its banner.
 * Returns whether the action succeeded.
 */
export function useActionFeedback(clearError?: () => void) {
  const [feedback, setFeedback] = useState("");

  const run = async (
    action: () => Promise<unknown>,
    success: string,
  ): Promise<boolean> => {
    setFeedback("");
    clearError?.();
    try {
      await action();
      setFeedback(success);
      return true;
    } catch {
      return false;
    }
  };

  return { feedback, run };
}
