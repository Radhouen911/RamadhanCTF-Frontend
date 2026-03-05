/**
 * Extract CSRF nonce from the page HTML
 * This is needed because CTFd injects the nonce into the page HTML
 */
export async function getNonce(): Promise<string | null> {
  try {
    // First check if we already cached it
    if ((window as any).cachedNonce) {
      return (window as any).cachedNonce;
    }

    // Try to get from window.init (if set by backend)
    if ((window as any).init?.csrfNonce) {
      (window as any).cachedNonce = (window as any).init.csrfNonce;
      return (window as any).init.csrfNonce;
    }

    // If not cached, fetch the current page HTML and extract nonce
    const response = await fetch(window.location.href, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn("Failed to fetch page for CSRF nonce extraction");
      return null;
    }

    const html = await response.text();

    // Look for nonce in various formats that CTFd uses
    // Format 1: data-nonce attribute
    const nonceMatch =
      html.match(/data-nonce="([^"]+)"/) ||
      // Format 2: csrfNonce in script
      html.match(/csrfNonce:\s*"([^"]+)"/) ||
      // Format 3: CSRF-Token in meta tag
      html.match(/<meta\s+name="CSRF-Token"\s+content="([^"]+)"/);

    if (nonceMatch && nonceMatch[1]) {
      const nonce = nonceMatch[1];
      (window as any).cachedNonce = nonce;
      (window as any).init = (window as any).init || {};
      (window as any).init.csrfNonce = nonce;
      return nonce;
    }

    console.warn("Could not find CSRF nonce in page HTML");
    return null;
  } catch (error) {
    console.error("Error extracting CSRF nonce:", error);
    return null;
  }
}
