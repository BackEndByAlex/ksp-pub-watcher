import { createClient } from "redis"

export class EventCache {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    })

    this.client.on("error", (err) => console.error("Redis Client Error", err))
  }

  async _ensureConnection() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  async getLastLink() {
    try {
      await this._ensureConnection()
      const link = await this.client.get("last_seen_pub")
      return link
    } catch (error) {
      console.error("Kunde inte hämta från cache:", error.message)
      return null
    }
  }

  async saveLastLink(link) {
    try {
      await this._ensureConnection()
      await this.client.set("last_seen_pub", link)
    } catch (error) {
      console.error("Kunde inte spara till cache:", error.message)
    }
  }
}
