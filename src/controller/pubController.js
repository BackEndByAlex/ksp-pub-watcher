import axios from "axios"
import * as cheerio from "cheerio"

export class CheckPub {
  constructor() {
    this.url = process.env.KSP
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL

    this.lastKnownEvent = ""
  }

  async check() {
    try {
      const { data } = await axios.get(this.url)
      const $ = cheerio.load(data)
      const links = $("a")

      for (const element of links) {
        const text = $(element).text().trim()
        const link = $(element).attr("href")

        if (text.toLowerCase().includes("it-pub")) {
          if (text === this.lastKnownEvent) {
            return
          }

          await axios.post(this.webhookUrl, {
            content: `Found: ${text}\nLink:  ${link}`,
          })

          this.lastKnownEvent = text
          return
        }
      }
    } catch (error) {
      throw new Error("Something went wrong", error)
    }
  }
}
