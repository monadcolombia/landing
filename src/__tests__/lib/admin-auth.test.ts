import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (store.has(name) ? { value: store.get(name) } : undefined),
    set: (name: string, value: string) => store.set(name, value),
    delete: (name: string) => store.delete(name),
  }),
}));

import { canWriteRole, getWritableRoles, setAdminCookie } from "@/lib/admin-auth";

describe("admin write permissions", () => {
  beforeEach(() => {
    store.clear();
    process.env.SESSION_SECRET = "test-secret";
    process.env.ADMIN_FULL_ACCESS_EMAILS = "owner@example.com";
    process.env.ADMIN_VOLUNTEER_ACCESS_EMAILS = "Volunteers@Example.com";
  });

  it("gives full access emails every role", async () => {
    await setAdminCookie("owner@example.com");
    expect(await getWritableRoles()).toEqual(["mentor", "judge", "volunteer"]);
  });

  it("limits volunteer access emails to volunteers", async () => {
    await setAdminCookie("volunteers@example.com");
    expect(await getWritableRoles()).toEqual(["volunteer"]);
    expect(await canWriteRole("volunteer")).toBe(true);
    expect(await canWriteRole("mentor")).toBe(false);
    expect(await canWriteRole("judge")).toBe(false);
  });

  it("keeps other emails read-only", async () => {
    await setAdminCookie("viewer@example.com");
    expect(await getWritableRoles()).toEqual([]);
  });

  it("returns no roles without a session", async () => {
    expect(await getWritableRoles()).toEqual([]);
  });
});
