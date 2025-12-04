import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import axios from "axios"
import { CheckPub } from "../controller/pubController"

vi.mock("axios")

const mockRedisGet = vi.fn()
const mockRedisSet = vi.fn()
const mockRedisConnect = vi.fn()

vi.mock("redis", () => {
  return {
    createClient: () => ({
      on: vi.fn(),
      connect: mockRedisConnect,
      isOpen: false,
      get: mockRedisGet,
      set: mockRedisSet,
    }),
  }
})

describe("Integration: Pub Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.DISCORD_WEBHOOK_URL = "https://fake-discord.com"
    process.env.KSP = "https://ksp-fake.com"

    mockRedisGet.mockResolvedValue(null)
  })

  it("Should flow through Controller -> Scraper -> Discord -> Redis correctly", async () => {
    // ARRANGE:
    const listHTML = `
      <html><body>
        <a href="https://ksp-fake.com/event/nytt-it-pub" title="Spännande Event">
          IT-pub med Kod
        </a>
      </body></html>
    `
    const detailHTML = `
      <html><body>
        <h1>IT-pub med Kod</h1>
        <div class="page-text">Kom och drick öl!</div>
        <div class="event-info-block__body">
          <time>Fredag 17:00</time>
          <div class="address">Puben</div>
        </div>
      </body></html>
    `

    axios.get.mockImplementation(async (url) => {
      if (url === process.env.KSP) {
        return { data: listHTML }
      }
      if (url === "https://ksp-fake.com/event/nytt-it-pub") {
        return { data: detailHTML }
      }
      return { data: "" }
    })

    // ACT:
    const pubWatcher = new CheckPub()
    await pubWatcher.check()

    // ASSERT:

    // 1. Verifiera att Redis tillfrågades
    expect(mockRedisGet).toHaveBeenCalledWith("last_seen_pub")

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        embeds: expect.arrayContaining([
          expect.objectContaining({
            title: expect.stringContaining("IT-pub med Kod"),
            description: expect.stringContaining("Kom och drick öl!"),
          }),
        ]),
      })
    )

    expect(mockRedisSet).toHaveBeenCalledWith(
      "last_seen_pub",
      "https://ksp-fake.com/event/nytt-it-pub"
    )
  })

  it("Should abort early if Redis already has the link", async () => {
    // ARRANGE
    const link = "https://ksp-fake.com/event/gammal-pub"
    const listHTML = `<html><body><a href="${link}">Gammal It-pub</a></body></html>`

    axios.get.mockResolvedValue({ data: listHTML })

    mockRedisGet.mockResolvedValue(link)

    // ACT
    const pubWatcher = new CheckPub()
    await pubWatcher.check()

    // ASSERT
    expect(axios.get).toHaveBeenCalledTimes(1) // Endast huvudlistan
    expect(axios.post).not.toHaveBeenCalled() // Inget till Discord
  })
})
