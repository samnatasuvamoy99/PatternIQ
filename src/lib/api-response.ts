import { NextResponse } from "next/server";

export function ok(data: unknown, message = "Success", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function created(data: unknown, message = "Created successfully") {
  return ok(data, message, 201);
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}
