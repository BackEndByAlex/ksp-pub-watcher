import axios from "axios"
import * as cheerio from "cheerio"

export class CheckPub {
  constructor() {
    this.url = process.env.KSP
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL
  }

  async check() {
    try {
      const { data } = await axios.get(this.url)
      const $ = cheerio.load(data)
      const links = $("a")

      for (const element of links) {
        const text = $(element).text()

        if (text.toLowerCase().includes("it-pub")) {
          await axios.post(this.webhookUrl, {
            content: `Found: ${text}`,
          })
          return
        }
      }
    } catch (error) {
      throw new Error("Something went wrong", error)
    }
  }
}
