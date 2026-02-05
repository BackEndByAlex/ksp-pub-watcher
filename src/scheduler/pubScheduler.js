import { CheckPub } from "../controller/pubController.js"

const INTERVAL_MS = 60 * 60 * 1000 * 24

/**
 * Kör pub check EN GÅNG utan schemaläggning (för Railway Cron Mode)
 */
export const runCheckOnce = async () => {
  const watcher = new CheckPub()
  await watcher.check()
}

/**
 * Startar kontinuerlig schemaläggning (för Server Mode)
 */
export const startScheduler = () => {
  const watcher = new CheckPub()

  watcher.check()

  setInterval(() => {
    watcher.check()
  }, INTERVAL_MS)
}
