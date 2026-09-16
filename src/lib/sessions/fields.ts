export interface SessionBookFieldsUpdate {
  page_ini?: number | null;
  page_final?: number | null;
  time_reading?: string | null;
  notes?: string | null;
}

type ParseResult =
  | { data: SessionBookFieldsUpdate; error?: undefined }
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

/** Faz o parsing/validação dos campos de sessions_book presentes no body (parcial). */
export function parseSessionFields(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) {
    return { error: "corpo da requisição inválido" };
  }
  const b = body as Record<string, unknown>;
  const data: SessionBookFieldsUpdate = {};

  if ("page_ini" in b) {
    const parsed = parseNullableInt(b.page_ini, "page_ini");
    if ("error" in parsed) return parsed;
    data.page_ini = parsed.value;
  }

  if ("page_final" in b) {
    const parsed = parseNullableInt(b.page_final, "page_final");
    if ("error" in parsed) return parsed;
    data.page_final = parsed.value;
  }

  if ("time_reading" in b) {
    const parsed = parseNullableString(b.time_reading, "time_reading");
    if ("error" in parsed) return parsed;
    data.time_reading = parsed.value;
  }

  if ("notes" in b) {
    const parsed = parseNullableString(b.notes, "notes");
    if ("error" in parsed) return parsed;
    data.notes = parsed.value;
  }

  return { data };
}
