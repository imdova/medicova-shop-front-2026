export function extractSessionToken(session: unknown): string | undefined {
  const sessionAny = session as any;
  const userAny = sessionAny?.user as any;

  const candidates = [
    sessionAny?.accessToken,
    userAny?.accessToken,
    userAny?.token,
    sessionAny?.token,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed.length > 0) return trimmed;
    }
  }

  return undefined;
}
