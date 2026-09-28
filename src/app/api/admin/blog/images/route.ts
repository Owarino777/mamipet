import { randomUUID } from "node:crypto";
import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import {
  detectBlogImage,
  maxBlogImageBytes,
} from "@/modules/blog/domain/image-upload";
import { HttpError } from "@/shared/errors/http-error";
import { jsonCreated, jsonError } from "@/shared/http/route-response";
import { readLimitedBody } from "@/shared/http/read-limited-body";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireAdminAccount(request);
    const bytes = await readLimitedBody(request, maxBlogImageBytes);
    if (!bytes.length)
      throw new HttpError(
        "Choisissez une image non vide.",
        400,
        "INVALID_IMAGE",
      );
    const format = detectBlogImage(bytes);
    if (!format)
      throw new HttpError(
        "Choisissez une image JPEG, PNG ou WebP.",
        400,
        "INVALID_IMAGE",
      );
    const path = `${user.id}/${randomUUID()}.${format.extension}`;
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(path, bytes, { contentType: format.contentType, upsert: false });
    if (error)
      throw new HttpError("Unable to upload image.", 502, "STORAGE_ERROR");
    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    return jsonCreated({ url: data.publicUrl });
  } catch (error) {
    return jsonError(error);
  }
}
