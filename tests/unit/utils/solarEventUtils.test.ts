import {
  STAR_NAMES,
  calculateProgressPercentage,
  formatTimeRemaining,
  getStarName,
  getWeekEnd,
  getWeekStart,
  isInCurrentWeek,
} from "@/src/utils/solarEventUtils"

describe("solarEventUtils", () => {
  it("calculates week start and week end boundaries", () => {
    const date = new Date("2026-02-19T15:32:10.000Z")
    const weekStart = getWeekStart(date)
    const weekEnd = getWeekEnd(date)

    expect(weekStart.getHours()).toBe(0)
    expect(weekStart.getMinutes()).toBe(0)
    expect(weekStart.getSeconds()).toBe(0)
    expect(weekStart.getMilliseconds()).toBe(0)
    expect(weekStart.getTime()).toBeLessThanOrEqual(date.getTime())
    expect(weekEnd.getTime()).toBeGreaterThan(date.getTime())
    expect(weekEnd.getTime() - weekStart.getTime()).toBe(7 * 24 * 60 * 60 * 1000)
  })

  it("formats ended events", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-19T12:00:00.000Z"))

    expect(formatTimeRemaining(new Date("2026-02-19T11:59:00.000Z"))).toBe("Event ended")

    vi.useRealTimers()
  })

  it("formats days/hours remaining", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-19T12:00:00.000Z"))

    const end = new Date("2026-02-21T17:00:00.000Z")
    expect(formatTimeRemaining(end)).toBe("2d 5h remaining")

    vi.useRealTimers()
  })

  it("formats hours/minutes remaining", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-19T12:00:00.000Z"))

    const end = new Date("2026-02-19T15:45:00.000Z")
    expect(formatTimeRemaining(end)).toBe("3h 45m remaining")

    vi.useRealTimers()
  })

  it("formats minutes-only remaining", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-19T12:00:00.000Z"))

    const end = new Date("2026-02-19T12:09:00.000Z")
    expect(formatTimeRemaining(end)).toBe("9m remaining")

    vi.useRealTimers()
  })

  it("returns rotating star names", () => {
    const week0 = new Date(0)
    const week1 = new Date(7 * 24 * 60 * 60 * 1000)

    expect(getStarName(week0)).toBe(STAR_NAMES[0])
    expect(getStarName(week1)).toBe(STAR_NAMES[1])
  })

  it("detects dates in the current week", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-02-19T12:00:00.000Z"))

    expect(isInCurrentWeek(new Date("2026-02-18T12:00:00.000Z"))).toBe(true)
    expect(isInCurrentWeek(new Date("2026-02-28T12:00:00.000Z"))).toBe(false)

    vi.useRealTimers()
  })

  it("calculates progress with 100 cap", () => {
    expect(calculateProgressPercentage(25, 100)).toBe(25)
    expect(calculateProgressPercentage(300, 100)).toBe(100)
  })
})
