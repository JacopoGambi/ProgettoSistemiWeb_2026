import type { Request, Response } from "express";

export type User = {
  username: string;
  ruolo: string;
};

const COOKIE_NAME = "ghm_user";

export function getUser(req: Request, _res: Response): User | null {
  // Usa req.cookies popolato da cookie-parser middleware
  const raw = req.cookies?.[COOKIE_NAME];

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

  res.cookie(COOKIE_NAME, payload, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 ore
  });
}

export function unsetUser(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });
}
