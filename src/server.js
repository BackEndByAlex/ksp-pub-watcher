/**
 * @file The starting point of the application.
 * @module src/server
 * @author Alexandru Antonescu
 * @version 1.0.0
 */

import express from "express"
import helmet from "helmet" // Valfritt: Om du vill installera 'helmet' för extra säkerhet
import router from "./routers/routes.js"
import { startScheduler } from "./scheduler/pubScheduler.js"

// Ladda miljövariabler krävs inte här om du kör via Railway/Node direkt med --env-file,
// men bra att ha kvar om du kör lokalt med dotenv.
import dotenv from "dotenv"
dotenv.config()

try {
  const app = express()
  app.use(helmet())

  // SÄKERHET: Dölj att vi använder Express
  app.disable("x-powered-by")

  // SÄKERHET: Grundläggande headers (valfritt men bra)
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff")
    res.setHeader("X-Frame-Options", "DENY")
    next()
  })

  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))

  // Registrera router
  app.use("/", router)

  // Starta schemaläggaren (Automatiseringen)
  startScheduler()

  // Starta servern
  const PORT = process.env.PORT
  const server = app.listen(PORT, () => {
    console.info(`Server is running on port ${PORT}`) // Denna logg är okej att ha vid start
  })
} catch (error) {
  console.error("Critical error starting server:", error.message)
  process.exit(1)
}
