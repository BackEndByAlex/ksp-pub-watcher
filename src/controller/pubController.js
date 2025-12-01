import axios from "axios"
import * as cheerio from "cheerio"
import { ScrapeEventDetails } from "../Service/eventScraper.js"

export class CheckPub {
  constructor() {
    this.url = process.env.KSP
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL

    this.lastKnownEvent = ""
    this.scraper = new ScrapeEventDetails()
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
          if (text === this.lastKnownEvent) return

          const details = await this.scraper.scrapeDetails(link)

          if (details) {
            await this.sendDetailedAlert(details, link)
          } else {
            await axios.post(this.webhookUrl, {
              content: `Found: ${text}\nLink:  ${link}`,
            })
          }

          this.lastKnownEvent = text
          return
        }
      }
    } catch (error) {
      throw new Error("Something went wrong", error)
    }
  }

  async sendDetailedAlert(details, link) {
    const embed = {
      title: `🍺 ${details.title}`,
      url: link,
      description: details.description,
      color: 3066993, // Grön färg
      fields: [
        { name: "📅 Datum", value: details.date, inline: true },
        { name: "⏰ Tid", value: details.time, inline: true },
        { name: "📍 Plats", value: details.location, inline: true },
      ],
      footer: { text: "Pub-Spanaren" },
    }

    await axios.post(this.webhookUrl, {
      embeds: [embed],
    })
  }
}
