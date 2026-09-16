export interface BookFieldsUpdate {
  title?: string;
  author?: string | null;
  imge_url?: string | null;
  total_pages?: number | null;
  type_book?: string | null;
  status?: number | null;
  note?: string | null;
  data_init?: string | null;
  data_final?: string | null;
}

type ParseResult =
  | { data: BookFieldsUpdate; error?: undefined }
  | { data?: undefined; error: string };

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

function parseNullableInt(
  value: unknown,
  field: string,
  { min }: { min?: number } = {}
): { value: number | null } | { error: string } {
  if (value === null) return { value: null };
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return { error: `${field} deve ser um número inteiro ou null` };
  }
  if (min !== undefined && value < min) {
    return { error: `${field} deve ser >= ${min}` };
  }
  return { value };
}

function parseNullableDate(
  value: unknown,
  field: string
): { value: string | null } | { error: string } {
  if (value === null) return { value: null };
  if (typeof value !== "string") {
    return { error: `${field} deve ser uma string de data (ISO) ou null` };
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { error: `${field} não é uma data válida` };
  }
  return { value: date.toISOString() };
}

/** Faz o parsing/validação dos campos de books presentes no body (parcial). */
export function parseBookFields(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) {
    return { error: "corpo da requisição inválido" };
  }
  const b = body as Record<string, unknown>;
  const data: BookFieldsUpdate = {};

  if ("title" in b) {
    if (typeof b.title !== "string" || !b.title.trim()) {
      return { error: "title deve ser uma string não vazia" };
    }
    data.title = b.title.trim();
  }

  if ("author" in b) {
    const parsed = parseNullableString(b.author, "author");
    if ("error" in parsed) return parsed;
    data.author = parsed.value;
  }

  if ("imge_url" in b) {
    const parsed = parseNullableString(b.imge_url, "imge_url");
    if ("error" in parsed) return parsed;
    data.imge_url = parsed.value;
  }

  if ("type_book" in b) {
    const parsed = parseNullableString(b.type_book, "type_book");
    if ("error" in parsed) return parsed;
    data.type_book = parsed.value;
  }

  if ("note" in b) {
    const parsed = parseNullableString(b.note, "note");
    if ("error" in parsed) return parsed;
    data.note = parsed.value;
  }

  if ("total_pages" in b) {
    const parsed = parseNullableInt(b.total_pages, "total_pages", { min: 0 });
    if ("error" in parsed) return parsed;
    data.total_pages = parsed.value;
  }

  if ("status" in b) {
    const parsed = parseNullableInt(b.status, "status");
    if ("error" in parsed) return parsed;
    data.status = parsed.value;
  }

  if ("data_init" in b) {
    const parsed = parseNullableDate(b.data_init, "data_init");
    if ("error" in parsed) return parsed;
    data.data_init = parsed.value;
  }

  if ("data_final" in b) {
    const parsed = parseNullableDate(b.data_final, "data_final");
    if ("error" in parsed) return parsed;
    data.data_final = parsed.value;
  }

  return { data };
}
