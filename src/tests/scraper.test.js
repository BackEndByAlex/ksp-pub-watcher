import { describe, it, expect, vi } from "vitest"
import axios from "axios"
import { scrapeEventDetails } from "../services/eventScraper.js"

vi.mock("axios")

describe("Event Scraper Service", () => {
  it("Should extract title, description, date and location fro HTML", async () => {
    const mockHtml = `
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

    axios.get.mockReturnValue({ data: mockHtml })

    const data = await scraperEventDetais("https://fake-url.com")

    expect(data).toEqual({
      title: "IT-pub med Neurawave",
      description: expect.stringContaining("Välkommen på IT-pub"),
      date: "2/12 17:00 - 20:00",
      location: "Bredbandet 1, Kalmar",
    })
  })
})
