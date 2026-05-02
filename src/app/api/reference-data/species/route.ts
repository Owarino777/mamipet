import { listReferenceData } from "@/modules/reference-data/application/list-reference-data";

export function GET(request: Request) {
  return listReferenceData(request, {
    table: "espece",
    idKey: "id_espece",
    codeKey: "code_espece",
    labelKey: "libelle_espece",
  });
}
