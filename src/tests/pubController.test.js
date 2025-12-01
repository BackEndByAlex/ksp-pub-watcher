import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"
import { CheckPub } from "../controller/pubController"

vi.mock("axios")

describe("Pub Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.DISCORD_WEBHOOK_URL = "https://fake-discord-url.com"
    process.env.KSP = "https://fake-ksp-url.com"
  })

  it("Should send notice to Disord if HTML 'It-pub'", async () => {
    // Arrange

    const fakeHTML = `
      <html>
        <body> 
          <a href="/notFunny">Meeting</a>
          <a href="/party">Cool It-pub with code</a>
        <body> 
      <html>
    `

    axios.get.mockReturnValue({ data: fakeHTML })

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
})
