export interface MetaFieldsUpdate {
  type?: number | null;
  period?: number | null;
  value_check?: string | null;
}

type ParseResult =
  | { data: MetaFieldsUpdate; error?: undefined }
  | { data?: undefined; error: string };

function parseNullableInt(
  value: unknown,
  field: string
): { value: number | null } | { error: string } {
  if (value === null) return { value: null };
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return { error: `${field} deve ser um número inteiro ou null` };
  }
  return { value };
}

function parseNullableString(
  value: unknown,
  field: string
): { value: string | null } | { error: string } {
  if (value === null) return { value: null };
  if (typeof value !== "string") {
    return { error: `${field} deve ser uma string ou null` };
  }
  return { value: value.trim() };
}

/** Faz o parsing/validação dos campos de metas presentes no body (parcial). */
export function parseMetaFields(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) {
    return { error: "corpo da requisição inválido" };
  }
  const b = body as Record<string, unknown>;
  const data: MetaFieldsUpdate = {};

  if ("type" in b) {
    const parsed = parseNullableInt(b.type, "type");
    if ("error" in parsed) return parsed;
    data.type = parsed.value;
  }

  if ("period" in b) {
    const parsed = parseNullableInt(b.period, "period");
    if ("error" in parsed) return parsed;
    data.period = parsed.value;
  }

  if ("value_check" in b) {
    const parsed = parseNullableString(b.value_check, "value_check");
    if ("error" in parsed) return parsed;
    data.value_check = parsed.value;
  }

  return { data };
}
