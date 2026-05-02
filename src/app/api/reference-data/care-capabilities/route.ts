import { listReferenceData } from "@/modules/reference-data/application/list-reference-data";

export function GET(request: Request) {
  return listReferenceData(request, {
    table: "capacite_soin",
    idKey: "id_capacite_soin",
    codeKey: "code_capacite_soin",
    labelKey: "libelle_capacite_soin",
  });
}
