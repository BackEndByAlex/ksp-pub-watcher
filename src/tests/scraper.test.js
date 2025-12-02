import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"
import { ScrapeEventDetails } from "../Service/eventScraper"

vi.mock("axios")

describe("Event Scraper Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("Should extract title, description, date and location from HTML", async () => {
    // VIKTIGT: HTML-strukturen här måste matcha selektorerna i eventScraper.js
    // .page-text, .event-info-block__body time, .event-info-block__body .address
    const fakePageHTML = `
      <html>
        <body>
          <h1 class="entry-title">IT-pub med Neurawave</h1>
          
          <div class="page-text">
            <p>Välkommen på IT-pub...</p>
            <p>Det blir kul!</p>
          </div>
          
          <div class="event-info-block__body">
            <time>2/12 17:00 - 20:00</time>
            <div class="address">Bredbandet 1, Kalmar</div>
          </div>
        </body>
      </html>
    `

    axios.get.mockReturnValue({ data: fakePageHTML })

    const scraper = new ScrapeEventDetails()

    // --- ACT ---
    const details = await scraper.scrapeDetails("https://fake-url.com/event")

    expect(details).toEqual({
      title: "IT-pub med Neurawave",
      description: expect.stringContaining("Välkommen på IT-pub"),
      date: "2/12 17:00 - 20:00",
      location: "Bredbandet 1, Kalmar",
      imageUrl: "", // Vi la inte till någon meta-tagg i HTMLen ovan, så denna blir tom
    })
  })
})
