import { HttpError } from "@/shared/errors/http-error";

export async function readLimitedBody(
  request: Request,
  maxBytes: number,
): Promise<Uint8Array> {
  const tooLarge = () =>
    new HttpError(
      "Le contenu dépasse la taille autorisée.",
      413,
      "PAYLOAD_TOO_LARGE",
    );
  if (Number(request.headers.get("content-length")) > maxBytes)
    throw tooLarge();
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw tooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}
