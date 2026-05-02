import { listReferenceData } from "@/modules/reference-data/application/list-reference-data";

export function GET(request: Request) {
  return listReferenceData(request, {
    table: "lieu_garde",
    idKey: "id_lieu_garde",
    codeKey: "code_lieu_garde",
    labelKey: "libelle_lieu_garde",
  });
}
