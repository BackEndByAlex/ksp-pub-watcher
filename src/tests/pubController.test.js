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

  it("Should NOT send dublicate notice if the event is already known", async () => {
    const htmlEventA = `
      <html><body><a href="/old">IT-pub: Old Event</a></body></html>
    `
    const htmlEventB = `
      <html><body><a href="/new">IT-pub: New Awesome Event</a></body></html>
    `

    axios.get.mockReturnValue({ data: htmlEventA })
    const pubWatcher = new CheckPub()

    await pubWatcher.check()
    expect(axios.post).toHaveBeenCalledTimes(1)

    axios.post.mockClear()
    await pubWatcher.check()

    expect(axios.post).not.toHaveBeenCalled()

    axios.get.mockReturnValue({ data: htmlEventB })
    await pubWatcher.check()

    expect(axios.post).toHaveBeenCalledTimes(1)
  })
})
