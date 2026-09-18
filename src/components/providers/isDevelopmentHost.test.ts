import { describe, expect, it } from "vitest"
import { isDevelopmentHost } from "./isDevelopmentHost"

describe("isDevelopmentHost", () => {
  it("matches local development hosts", () => {
    expect(isDevelopmentHost("localhost")).toBe(true)
    expect(isDevelopmentHost("127.0.0.1")).toBe(true)
    expect(isDevelopmentHost("my-machine.local")).toBe(true)
  })

  it("is case insensitive", () => {
    expect(isDevelopmentHost("LocalHost")).toBe(true)
    expect(isDevelopmentHost("My-Machine.LOCAL")).toBe(true)
  })

  it("does not match production or preview hosts", () => {
    expect(isDevelopmentHost("starsailors.space")).toBe(false)
    expect(isDevelopmentHost("client-git-preview.vercel.app")).toBe(false)
    expect(isDevelopmentHost("localhost.example.com")).toBe(false)
  })
})
