import axios from "axios"
import * as cheerio from "cheerio"

export class ScrapeEventDetails {
  async scrapeDetails(url) {
    try {
      const { data } = await axios.get(url)
      const $ = cheerio.load(data)
      const title = $("h1").first().text().trim()

      let description = $(".page-text").text().trim() || $("main").text().trim()

      if (description.length > 1000) {
        description = description.substring(0, 997) + "..."
      }

      const date =
        $(".event-info-block__body time").text().trim() || "Date was not found"

      const location =
        $(".event-info-block__body .address").text().trim() ||
        "Location was not found"

      const imageUrl = $('meta[property="og:image"]').attr("content") || ""

      return {
        title,
        description,
        date,
        location,
        imageUrl,
      }
    } catch (error) {
      console.error("Scraper fail:", error.message)
      return null
    }
  }
}
