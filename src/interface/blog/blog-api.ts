export async function blogApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    signal: init?.signal ?? AbortSignal.timeout(15000),
  });
  const payload = await response.json();
  if (!response.ok) {
    if (response.status === 401)
      throw new Error(
        "Votre session a expiré. Reconnectez-vous avant de poursuivre.",
      );
    if (response.status === 403)
      throw new Error("Un compte administrateur actif est nécessaire.");
    if (response.status >= 500)
      throw new Error(
        "Le service est indisponible. Votre texte reste dans l’éditeur ; réessayez après rétablissement.",
      );
    const issue = payload.error?.details?.issues?.[0];
    throw new Error(
      issue
        ? `${issue.path.join(" · ")} : ${issue.message}`
        : (payload.error?.message ?? "Cette action a échoué."),
    );
  }
  return payload.data as T;
}

export function jsonRequest(method: string, value: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  };
}
