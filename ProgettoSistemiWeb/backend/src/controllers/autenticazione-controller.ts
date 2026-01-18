import { Request, Response } from "express"
import { getUser, setUser, unsetUser, User } from "../utils/auth"
import { db } from "../utils/db";

//registrazione
export const register = async (req: Request, res: Response) => {

  const { username, password } = req.body

  //verifica se l'username esiste già
  const checkUser = await db.execute("SELECT username FROM utenti WHERE username=?", [username,])
  const users = checkUser[0]

  if (Array.isArray(users) && users.length > 0) {
    res.status(400).send("Username già in uso.")
    return
  }

  await db.execute("INSERT INTO utenti (username, password, ruolo) VALUES (?, ?, ?)", [
    username,
    password,  
    'cliente'
  ])

  const [rows] = await db.execute(
    "SELECT username, ruolo FROM utenti WHERE username=?",
    [username]
  ) as any //cast
  const newUser = (rows as User[])[0]

  setUser(req, res, newUser)

  res.json({ message: "Registrazione effettuata con successo" })
}


//login
export const login = async (req: Request, res: Response) => {

  const { username, password } = req.body

  console.log("[LOGIN] Tentativo login:", username)

  const [userLog] = await db.execute(
    "SELECT username, password, ruolo FROM utenti WHERE username=?",
    [username]
  ) as any

  if (!Array.isArray(userLog) || userLog.length == 0) {
    console.log("[LOGIN] Utente non trovato nel database:", username)
    res.status(400).send("Credenziali errate.")
    return
  }

  const userData = userLog[0] as any
  console.log("[LOGIN] Utente trovato. Ruolo:", userData.ruolo)
  console.log("[LOGIN] Password ricevuta dal frontend:", `"${password}"`)
  console.log("[LOGIN] Password nel database:", `"${userData.password}"`)

  const correctPassword = password === userData.password
  console.log("[LOGIN] Password corretta:", correctPassword)

  if (!correctPassword) {
    console.log("[LOGIN] Password errata per utente:", username)
    res.status(400).send("Credenziali errate.")
    return
  }

  console.log("[LOGIN] Login riuscito per:", username)

  delete userData.password

  setUser(req, res, userData)

  res.json({
    success: true,
    user: {
      username: userData.username,
      ruolo: userData.ruolo
    }
  })
}


//logout
export const logout = async (req: Request, res: Response) => {
  unsetUser(req, res)

  res.json({ message: "Logout effettuato con successo" })
}


//mostra profilo utente
export const getProfile = async (req: Request, res: Response) => {
  const user = getUser(req, res)
  res.json(user)
}