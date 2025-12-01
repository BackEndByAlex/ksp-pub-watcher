import express from "express"
import { CheckPub } from "../controller/pubController.js"

const router = express.Router()

router.get("/", (req, res) => {
  res.send("The Pub Scout is running! 🍺")
})

router.get("/check-now", async (req, res) => {
  console.log("🔔 Manuell koll startad via webben...")

  const watcher = new CheckPub()
  await watcher.check()

  res.send("Manuell koll utförd! Kolla loggarna eller Discord.")
})

export default router
