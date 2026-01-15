// src/api/apiClient.ts

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

async function handleTokenRefresh(): Promise<string> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("Kein Refresh-Token gefunden");
  }

  const formData = new URLSearchParams();
  formData.append("grant_type", "refresh_token");
  formData.append("refresh_token", refreshToken);
  formData.append("client_id", "client");

  const res = await fetch("/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  if (!res.ok) {
    // Falls der Refresh fehlschlägt: Alles löschen und zum Login
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("Session abgelaufen");
  }

  const data: TokenResponse = await res.json();

  // Neue Daten speichern
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  // Wir speichern den absoluten Ablauf-Zeitpunkt in Millisekunden
  localStorage.setItem("expires_in", (Date.now() + data.expires_in * 1000).toString());

  return data.access_token;
}

/**
 * Ein Wrapper für fetch, der Auth-Header und Refresh-Logic automatisch handhabt.
 */
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const expiresAt = Number(localStorage.getItem("expires_in") || 0);

  // 1. Pre-emptive Check: Wenn Token abgelaufen oder in den nächsten 30 Sek abläuft
  if (Date.now() > (expiresAt - 30000)) {
    console.log("Token ist abgelaufen oder läuft bald ab, starte Refresh...");
    try {
      await handleTokenRefresh();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  // 2. Authorization Header hinzufügen
  const token = localStorage.getItem("access_token");
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Standardmäßig JSON Content-Type, falls ein Body vorhanden ist
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 3. Request ausführen
  let response = await fetch(url, { ...options, headers });

  // 4. Falls Server trotzdem 401 liefert (z.B. Token wurde serverseitig gelöscht)
  if (response.status === 401) {
    console.warn("401 Unauthorized erhalten, versuche letzten Notfall-Refresh...");
    try {
      const newToken = await handleTokenRefresh();
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers });
    } catch (err) {
      return Promise.reject(err);
    }
  }

  return response;
};