import { describe, expect, it } from "vitest";
import { RateLimiter } from "@/lib/http/RateLimiter";

const HOUR = 60 * 60_000;

function limiterAt(start: number) {
  const clock = { now: start };
  const limiter = new RateLimiter(10, HOUR, () => clock.now);
  return { limiter, clock };
}

describe("RateLimiter", () => {
  it("allows 10 requests per window and blocks the 11th", () => {
    const { limiter } = limiterAt(0);

    for (let i = 0; i < 10; i++) expect(limiter.allow("1.2.3.4")).toBe(true);

    expect(limiter.allow("1.2.3.4")).toBe(false);
  });

  it("allows requests again once the window has passed", () => {
    const { limiter, clock } = limiterAt(0);
    for (let i = 0; i < 10; i++) limiter.allow("1.2.3.4");

    clock.now = HOUR + 1;

    expect(limiter.allow("1.2.3.4")).toBe(true);
  });

  it("counts each IP separately", () => {
    const { limiter } = limiterAt(0);
    for (let i = 0; i < 10; i++) limiter.allow("1.2.3.4");

    expect(limiter.allow("5.6.7.8")).toBe(true);
  });
});
