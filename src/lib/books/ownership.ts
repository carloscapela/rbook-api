import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Confirma que o livro `bookId` existe e pertence a `userId`. */
export async function isBookOwnedByUser(
  supabase: SupabaseClient,
  bookId: number,
  userId: number
): Promise<boolean> {
  const { data } = await supabase
    .from("books")
    .select("id")
    .eq("id", bookId)
    .eq("user_id", userId)
    .maybeSingle();
  return data !== null;
}
