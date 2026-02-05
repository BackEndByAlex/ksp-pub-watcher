/**
 * @file The starting point of the application.
 * @module src/server
 * @author Alexandru Antonescu
 * @version 1.0.0
 */

import express from "express"
import helmet from "helmet"
import router from "./routers/routes.js"
import { startScheduler, runCheckOnce } from "./scheduler/pubScheduler.js"

import dotenv from "dotenv"
dotenv.config()

// ==================================================================
// DUAL MODE: Server Mode vs Cron Mode
// ==================================================================
// Railway Cron Schedule kommer sätta CRON_MODE=true
const isCronMode = process.env.CRON_MODE === "true"

if (isCronMode) {
  // ========== CRON MODE ==========
  // Kör pub check EN GÅNG och avsluta sedan
  console.log("🕐 Running in CRON MODE - will execute once and exit")
  console.log(`⏰ Started at: ${new Date().toISOString()}`)

  runCheckOnce()
    .then(() => {
      console.log("✅ Pub check completed successfully")
      console.log(`⏰ Finished at: ${new Date().toISOString()}`)
      process.exit(0)
    })
    .catch((error) => {
      console.error("❌ Pub check failed:", error.message)
      console.error(error.stack)
      process.exit(1)
    })
} else {
  // ========== SERVER MODE ==========
  // Kör kontinuerligt med Express server + scheduler backup
  console.log("🚀 Running in SERVER MODE - continuous operation")

  try {
    const app = express()
    app.use(helmet())

    // SÄKERHET: Dölj att vi använder Express
    app.disable("x-powered-by")

    // SÄKERHET: Grundläggande headers
    app.use((req, res, next) => {
      res.setHeader("X-Content-Type-Options", "nosniff")
      res.setHeader("X-Frame-Options", "DENY")
      next()
    })

    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    // Registrera router
    app.use("/", router)

    // Starta schemaläggaren (Backup om Railway Cron inte triggar)
    startScheduler()

    // Starta servern
    const PORT = process.env.PORT || 3000
    const server = app.listen(PORT, () => {
      console.info(`✅ Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("❌ Critical error starting server:", error.message)
    process.exit(1)
  }
}
