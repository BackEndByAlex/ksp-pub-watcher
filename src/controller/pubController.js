import axios from "axios"
import * as cheerio from "cheerio"
import { ScrapeEventDetails } from "../Service/eventScraper.js"
import { EventCache } from "../storage/eventCache.js"

export class CheckPub {
  constructor() {
    this.url = process.env.KSP
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL
    this.cache = new EventCache()
    this.scraper = new ScrapeEventDetails()
  }

  async check() {
    if (!this.url || !this.webhookUrl) {
      console.error("Missing environment variables (KSP or Webhook).")
      return
    }

    try {
      const { data } = await axios.get(this.url)
      const $ = cheerio.load(data)
      const links = $("a")

      for (const element of links) {
        const link = $(element).attr("href")
        const textContent = $(element).text().trim()
        const titleAttr = $(element).attr("title") || ""
        const ariaLabel = $(element).attr("aria-label") || ""

        const combinedText =
          `${textContent} ${titleAttr} ${ariaLabel}`.toLowerCase()

        if (link && combinedText.includes("it-pub")) {
          const lastSeen = await this.cache.getLastLink()

          if (link === lastSeen) return

          const details = await this.scraper.scrapeDetails(link)

          if (details) {
            await this.sendDetailedAlert(details, link)
          } else {
            const displayText = textContent || titleAttr || "Nytt Event"
            await axios.post(this.webhookUrl, {
              content: `Found: ${displayText}\nLink: ${link}`,
            })
          }

          await this.cache.saveLastLink(link)
          return
        }
      }
    } catch (error) {
      console.error("Error in check routine:", error.message)
    }
  }

  async sendDetailedAlert(details, link) {
    try {
      const embed = {
        title: `🍺 ${details.title}`,
        url: link,
        description: `${details.description}\n\n👉 [Läs mer och anmäl dig här](${link})`,
        color: 3066993, // Grön
        image: {
          url: details.imageUrl,
        },
        fields: [
          { name: "📅 När?", value: details.date, inline: true },
          { name: "📍 Var?", value: details.location, inline: true },
        ],
        footer: { text: "Pub-Spanaren • Kalmar Science Park" },
      }

      await axios.post(this.webhookUrl, {
        embeds: [embed],
      })
    } catch (error) {
      console.error("Failed to send Discord alert:", error.message)
    }
  }
}
