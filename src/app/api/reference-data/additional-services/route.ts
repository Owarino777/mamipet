import { listReferenceData } from "@/modules/reference-data/application/list-reference-data";

export function GET(request: Request) {
  return listReferenceData(request, {
    table: "service_additionnel",
    idKey: "id_service_additionnel",
    codeKey: "code_service_additionnel",
    labelKey: "libelle_service_additionnel",
  });
}
