import express from "express";
import {
  createRecensione,
  getRecensioni,
} from "../controllers/recensioni-controller";

const router = express.Router();

router.get("/mostraRecensioni", getRecensioni);
router.post("/creaRecensioni", createRecensione);

export default router;