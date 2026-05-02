import { listReferenceData } from "@/modules/reference-data/application/list-reference-data";

export function GET(request: Request) {
  return listReferenceData(request, {
    table: "badge_public",
    idKey: "id_badge_public",
    codeKey: "code_badge_public",
    labelKey: "libelle_badge_public",
  });
}
