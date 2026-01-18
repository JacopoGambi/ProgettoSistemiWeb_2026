import type { Request, Response } from "express";

export type User = {
  username: string;
  ruolo: string;
};

const COOKIE_NAME = "ghm_user";

function parseCookies(cookieHeader?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;

  cookieHeader.split(";").forEach((part) => {
    const [k, ...rest] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(rest.join("=") || "");
  });
  return out;
}

export function getUser(req: Request, _res: Response): User | null {
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[COOKIE_NAME];
  // Se il cookie non esiste o è vuoto, l'utente non è loggato
  if (!raw || raw.trim() === "") return null;

  try {
    const json = Buffer.from(raw, "base64").toString("utf8");
    const user = JSON.parse(json);
    if (!user?.username || !user?.ruolo) return null;
    return { username: user.username, ruolo: user.ruolo };
  } catch {
    return null;
  }
}

export function setUser(_req: Request, res: Response, user: User) {
  const payload = Buffer.from(JSON.stringify(user), "utf8").toString("base64");

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(payload)}; Path=/; HttpOnly; SameSite=Lax`
  );
}

export function unsetUser(_req: Request, res: Response) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
  );
}
