import { afterEach, describe, it, expect, vi } from "vitest";
import { COMMUNITY_LINKS, footerNav, getUpcomingCity, primaryCta } from "@/lib/constants";

afterEach(() => vi.useRealTimers());

describe("calls to action between editions", () => {
  it("invites to the community and hides Colabora when no event is upcoming", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-20T12:00:00Z"));
    expect(getUpcomingCity()).toBeUndefined();
    expect(primaryCta()).toEqual({
      href: COMMUNITY_LINKS.telegram,
      label: "Únete a la comunidad",
    });
    expect(footerNav().programas.links.some((l) => l.href === "/apply")).toBe(false);
  });

  it("asks to register and keeps Colabora while an event is upcoming", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T12:00:00Z"));
    expect(getUpcomingCity()?.id).toBe("medellin-v2");
    expect(primaryCta()).toEqual({ href: "https://luma.com/f6xhhyld", label: "Regístrate" });
    expect(footerNav().programas.links.some((l) => l.href === "/apply")).toBe(true);
  });
});
