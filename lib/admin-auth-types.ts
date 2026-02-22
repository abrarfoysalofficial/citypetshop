export type AdminAuthResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; status: 401; message: string }
  | { ok: false; status: 403; message: string }
  | { ok: false; status: 500; message: string };
