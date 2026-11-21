export async function exchangeAuthLinkCode(
  url: string,
  exchangeCode: (code: string) => Promise<{ error: unknown | null }>,
): Promise<"unrelated" | "completed" | "failed"> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return "failed";
  }

  if (
    parsedUrl.searchParams.has("error") ||
    parsedUrl.searchParams.has("error_code")
  ) {
    return "failed";
  }

  const code = parsedUrl.searchParams.get("code");
  if (!code) {
    return "unrelated";
  }

  try {
    const { error } = await exchangeCode(code);
    return error ? "failed" : "completed";
  } catch {
    return "failed";
  }
}
