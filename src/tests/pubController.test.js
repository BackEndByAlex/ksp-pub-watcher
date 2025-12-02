import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"
import { CheckPub } from "../controller/pubController"

// --- 1. Skapa mock-funktionerna med vi.hoisted ---
// Detta krävs för att de ska vara tillgängliga inuti vi.mock nedanför
const { mockGetLastLink, mockSaveLastLink, mockScrapeDetails } = vi.hoisted(
  () => {
    return {
      mockGetLastLink: vi.fn(),
      mockSaveLastLink: vi.fn(),
      mockScrapeDetails: vi.fn(),
    }
  }
)

// --- 2. Mocka axios ---
vi.mock("axios")

// --- 3. Mocka EventCache (Använd 'class' för att 'new EventCache()' ska fungera) ---
vi.mock("../storage/eventCache.js", () => {
  return {
    EventCache: class {
      getLastLink = mockGetLastLink
      saveLastLink = mockSaveLastLink
    },
  }
})

// --- 4. Mocka ScrapeEventDetails (Använd 'class' här med) ---
vi.mock("../Service/eventScraper.js", () => {
  return {
    ScrapeEventDetails: class {
      scrapeDetails = mockScrapeDetails
    },
  }
})

describe("Pub Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.DISCORD_WEBHOOK_URL = "https://fake-discord-url.com"
    process.env.KSP = "https://fake-ksp-url.com"

    // Standardvärden inför varje test
    mockGetLastLink.mockResolvedValue(null)
    mockScrapeDetails.mockResolvedValue(null)
  })

  it("Should send notice to Discord if HTML contains 'It-pub'", async () => {
    const fakeHTML = `
      <html>
        <body> 
          <a href="/notFunny">Meeting</a>
          <a href="/party">Cool It-pub with code</a>
        <body> 
      <html>
    `
    axios.get.mockResolvedValue({ data: fakeHTML })

    const pubWatcher = new CheckPub()
    await pubWatcher.check()

    expect(axios.post).toHaveBeenCalledTimes(1)
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        content: expect.stringContaining("It-pub"),
      })
    )
  })

  it("Should NOT send duplicate notice if the event is already known", async () => {
    const htmlEventA = `<html><body><a href="/old">IT-pub: Old Event</a></body></html>`

    // Simulera att vi redan har sett denna länk
    mockGetLastLink.mockResolvedValue("/old")
    axios.get.mockResolvedValue({ data: htmlEventA })

    const pubWatcher = new CheckPub()
    await pubWatcher.check()

    expect(axios.post).not.toHaveBeenCalled()
  })

  it("Should send notice if event is NEW (not in cache)", async () => {
    const htmlEventB = `<html><body><a href="/new">IT-pub: New Awesome Event</a></body></html>`

    // Simulera att cachen har något gammalt
    mockGetLastLink.mockResolvedValue("/old-link")
    axios.get.mockResolvedValue({ data: htmlEventB })

    const pubWatcher = new CheckPub()
    await pubWatcher.check()

    expect(axios.post).toHaveBeenCalledTimes(1)
    // Bekräfta att vi sparar den nya länken
    expect(mockSaveLastLink).toHaveBeenCalledWith("/new")
  })

  it("Should include the URL link in the Discord message", async () => {
    const expectedLink = "https://kalmarsciencepark.se/event/party-time"
    const fakeHTML = `
      <html><body>
        <a href="${expectedLink}">Super IT-pub</a>
      </body></html>
    `

    axios.get.mockResolvedValue({ data: fakeHTML })
    const pubWatcher = new CheckPub()

    await pubWatcher.check()

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        content: expect.stringContaining(expectedLink),
      })
    )
  })
})
