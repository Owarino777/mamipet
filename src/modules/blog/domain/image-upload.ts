// Stay below the 4.5 MB request limit of the deployment's serverless functions.
export const maxBlogImageBytes = 4 * 1024 * 1024;

export function detectBlogImage(
  bytes: Uint8Array,
): { extension: string; contentType: string } | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { extension: "jpg", contentType: "image/jpeg" };
  if (
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, i) => bytes[i] === value,
    )
  )
    return { extension: "png", contentType: "image/png" };
  const decoder = new TextDecoder();
  if (
    decoder.decode(bytes.slice(0, 4)) === "RIFF" &&
    decoder.decode(bytes.slice(8, 12)) === "WEBP"
  )
    return { extension: "webp", contentType: "image/webp" };
  return null;
}
