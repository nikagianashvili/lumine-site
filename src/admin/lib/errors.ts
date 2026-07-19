// Distinguishes "this feature's table was never migrated" (PostgREST:
// 'relation … does not exist' / '… in the schema cache') from an ordinary
// failed fetch — pages previously told users the database table was
// missing for any error, including plain network blips.
export function isMissingTableError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /does not exist|schema cache/i.test(msg);
}
