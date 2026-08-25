export function emailsMatch(actualEmail: string | null | undefined, expectedEmail: string) {
  const normalizedExpected = expectedEmail.trim().toLowerCase();

  return Boolean(normalizedExpected) && actualEmail?.trim().toLowerCase() === normalizedExpected;
}
