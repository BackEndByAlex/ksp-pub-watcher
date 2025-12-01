import axios from "axios"
import * as cheerio from "cheerio"

export class ScrapeEventDetails {
  async scrapeDetails(url) {
    try {
      const { data } = await axios.get(url)
      const $ = cheerio.load(data)

      const title = $("h1").first().text().trim()

      let description =
        $(".entry-content").text().trim() || $("main").text().trim()

      if (description.length > 1000) {
        description = description.substring(0, 997) + "..."
      }
      const date = $(".event-date").text().trim() || "Date was not found"
      const location =
        $(".event-location").text().trim() || "Location was not found"

      return {
        title,
        description,
        date,
        location,
      }
    } catch (error) {
      console.error("Scraper fail:", error.massage)
      return null
    }
  }
}
