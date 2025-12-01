/**
 * @file The starting point of the application.
 * @module src/server
 * @author Alexandru Antonescu
 * @version 1.0.0
 */

import express from "express"
import dotenv from "dotenv"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import router from "./routers/routes.js"

dotenv.config()

try {
  // Create Express application.
  const app = express()
  app.use(express.json())

  // Set the base URL to use for all relative URLs in a document.
  const baseURL = process.env.BASE_URL || "/"

  app.use(express.urlencoded({ extended: false }))

  // Middleware to pass base URL to views
  app.use((req, res, next) => {
    res.locals.baseURL = baseURL
    next()
  })

  // Register router
  app.use("/", router)

  // Start the server.
  const server = app.listen(process.env.PORT, () => {
    console.info(
      `Frontend running at http://localhost:${server.address().port}`
    )
    console.info("Press Ctrl-C to terminate...")
  })
} catch (error) {
  console.error("Error starting the server:", error)
  process.exit(1) // Exit the process with a failure code
}
