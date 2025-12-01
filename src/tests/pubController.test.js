import { describe, it, expect, vi, beforeEach } from "vitest"
import axios from "axios"
import { CheckPub } from "../controller/pubController"

vi.mock("axios")

describe("Pub Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

    await new CheckPub()

    expect(axios.post).toHaveBeenCalledTimes(1)

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        content: expect.stringContaining("IT-pub"),
      })
    )
  })
})
