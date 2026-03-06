export function isDemoModeClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("demo_user=true");
}
