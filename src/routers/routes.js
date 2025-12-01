import express from "express"
import { CheckPub } from "../controller/pubController.js"

const router = express.Router()

// 1. Health Check (För Railway/Uptime robotar)
router.get("/", (req, res) => {
  res.send("The Pub Scout is running! 🍺")
})

// 2. Manuell Trigger (Tvinga fram en koll)
// Gå till din-url.railway.app/check-now för att testa
router.get("/check-now", async (req, res) => {
  console.log("🔔 Manuell koll startad via webben...")

  // Vi skapar en ny instans bara för denna koll
  const watcher = new CheckPub()
  await watcher.check()

  res.send("Manuell koll utförd! Kolla loggarna eller Discord.")
})

export default router
