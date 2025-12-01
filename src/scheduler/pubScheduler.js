import { CheckPub } from "../controller/pubController.js"

const INTERVAL_MS = 60 * 60 * 1000 * 24

export const startScheduler = () => {
  const watcher = new CheckPub()

  watcher.check()

  setInterval(() => {
    watcher.check()
  }, INTERVAL_MS)
}
