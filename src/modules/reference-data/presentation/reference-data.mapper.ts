export type ReferenceItemDto = {
  id: string;
  code: string;
  label: string;
};

export function mapReferenceRow(
  row: Record<string, unknown>,
  idKey: string,
  codeKey: string,
  labelKey: string,
): ReferenceItemDto {
  return {
    id: String(row[idKey]),
    code: String(row[codeKey]),
    label: String(row[labelKey]),
  };
}
