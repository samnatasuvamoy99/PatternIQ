import { NextRequest } from "next/server";
import { apiHandler, requireAuth, parseJson } from "@/lib/handler";
import { ok } from "@/lib/api-response";
import { updateNoteSchema } from "@/lib/validations/note.validation";
import { updateNote, deleteNote } from "@/services/note.service";
import { AuthContext } from "@/lib/auth";

export const PATCH = apiHandler(async (
  req: NextRequest, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const body = updateNoteSchema.parse(await parseJson(req));
  const note = await updateNote(userId, params.id, body.content);
  return ok(note, "Note updated");
});

export const DELETE = apiHandler(async (
  _req, { params, auth }: { params: { id: string }; auth: AuthContext | null }
) => {
  const { userId } = requireAuth(auth);
  const result = await deleteNote(userId, params.id);
  return ok(result, "Note deleted");
});
