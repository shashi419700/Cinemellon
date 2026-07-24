import dns from "node:dns";

/**
 * By default, Node will happily try an IPv6 route first if your machine
 * advertises an IPv6 address, even when that route is actually broken
 * (common on home routers, some ISPs, some VPNs/corporate networks). The
 * TCP handshake or TLS session then gets killed mid-flight by the OS and
 * surfaces as exactly this:
 *
 *   TypeError: fetch failed   { cause: Error: read ECONNRESET }
 *
 * This is a well-known Node.js footgun (see nodejs/node#40702) and the
 * official recommended fix is to prefer IPv4 results at the DNS-resolution
 * level. It's set once, globally, for the whole process, and requires no
 * extra dependency.
 */
dns.setDefaultResultOrder("ipv4first");

const TRANSIENT_ERROR_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ENOTFOUND",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);

function isTransientNetworkError(err: unknown): boolean {
  const cause = (err as { cause?: unknown })?.cause as { code?: string } | undefined;
  const code = cause?.code ?? (err as { code?: string })?.code;
  return typeof code === "string" && TRANSIENT_ERROR_CODES.has(code);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ResilientFetchOptions extends RequestInit {
  /** Per-attempt timeout in ms. Default 15s. */
  timeoutMs?: number;
  /** How many times to retry on transient network errors. Default 2 (3 attempts total). */
  retries?: number;
}

/**
 * A drop-in replacement for `fetch` that:
 *  - forces IPv4 (see above),
 *  - aborts and fails cleanly if a request hangs instead of just resetting,
 *  - retries a couple of times, with backoff, on transient connection
 *    errors (ECONNRESET, timeouts, DNS blips) — the kind of thing that's
 *    genuinely just network flakiness rather than a bug in the request
 *    itself.
 *
 * It does NOT retry on HTTP error responses (4xx/5xx) — those are returned
 * as-is for the caller to inspect, same as normal fetch.
 */
export async function resilientFetch(url: string, options: ResilientFetchOptions = {}): Promise<Response> {
  const { timeoutMs = 15_000, retries = 2, ...init } = options;

  // Node's fetch sends no User-Agent at all by default (unlike curl or any
  // browser). Some TLS-inspecting antivirus/firewall software is more
  // likely to flag and reset headerless requests as bot-like traffic, so
  // we always send an identifiable one, without clobbering a caller's own.
  const headers = new Headers(init.headers);
  if (!headers.has("user-agent")) headers.set("User-Agent", "Cinemellon/1.0 (+backend fetch)");

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, { ...init, headers, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err;

      const isTimeout = (err as { name?: string })?.name === "AbortError";
      const shouldRetry = (isTimeout || isTransientNetworkError(err)) && attempt < retries;

      if (!shouldRetry) throw err;

      // Exponential backoff: 300ms, 900ms, ...
      await sleep(300 * 3 ** attempt);
    }
  }

  // Unreachable, but keeps TypeScript happy.
  throw lastError;
}
