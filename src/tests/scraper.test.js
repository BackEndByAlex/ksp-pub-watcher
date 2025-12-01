import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"
import { ScrapeEventDetails } from "../Service/eventScraper"

vi.mock("axios")

describe("Event Scraper Service", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("Should extract title, description, date and location from HTML", async () => {
    const fakePageHTML = `
      <html>
        <body>
          <h1 class="entry-title">IT-pub med Neurawave</h1>
          <div class="entry-content">
            <p>Välkommen på IT-pub...</p>
            <p>Det blir kul!</p>
          </div>
          <div class="event-date">2/12 17:00 - 20:00</div>
          <div class="event-location">Bredbandet 1, Kalmar</div>
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
    })
  })
})
