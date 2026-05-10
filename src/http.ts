/**
 * Minimal promise-based HTTP/HTTPS GET helper.
 *
 * Using Node's built-in `https` module keeps this dependency-free.
 * Times out after 10 seconds to avoid hanging the CLI or the plugin host.
 */

import https from "node:https";
import http from "node:http";

/**
 * Fetch a URL and return the response body as a string.
 *
 * @param url - The URL to fetch.
 * @param headers - Optional request headers.
 * @returns The response body.
 * @throws On non-2xx responses or network/timeout errors.
 */
export function httpGet(url: string, headers?: Record<string, string>): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers, timeout: 10_000 }, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });
  });
}
