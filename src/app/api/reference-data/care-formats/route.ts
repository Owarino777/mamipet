import { listReferenceData } from "@/modules/reference-data/application/list-reference-data";

export function GET(request: Request) {
  return listReferenceData(request, {
    table: "format_garde",
    idKey: "id_format_garde",
    codeKey: "code_format_garde",
    labelKey: "libelle_format_garde",
  });
}
