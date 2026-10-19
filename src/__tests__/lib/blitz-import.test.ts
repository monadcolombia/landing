import { describe, expect, it } from "vitest";
import { mapBlitzProject, normalizeName } from "@/lib/blitz-import";

describe("mapBlitzProject", () => {
  it("maps fields and keeps member names only", () => {
    const r = mapBlitzProject({
      id: "1",
      title: "  Monad Royale ",
      description: "Game. Contract 0x6edb1b98b01a95808c1c0f0f8c06ad96bd15eba6 on testnet",
      github_url: "https://github.com/a/b",
      demo_url: "https://demo.app",
      tweet_url: "https://x.com/a/status/9?s=20",
      image_url: "https://img.example/p.png",
      category: " DeFi ",
      members: [{ name: "Ana" }, { name: "x@y.com" }, { name: "" }, { name: "Luis" }],
    });
    expect(r).toEqual({
      name: "Monad Royale",
      team: "Ana, Luis",
      description: "Game. Contract 0x6edb1b98b01a95808c1c0f0f8c06ad96bd15eba6 on testnet",
      repoUrl: "https://github.com/a/b",
      demoUrl: "https://demo.app",
      contractAddress: "0x6edb1b98b01a95808c1c0f0f8c06ad96bd15eba6",
      tweetUrl: "https://x.com/a/status/9",
      imageUrl: "https://img.example/p.png",
      category: "DeFi",
    });
  });

  it("skips projects without a title", () => {
    expect(mapBlitzProject({ id: "2", title: "  " })).toBeNull();
  });
});

describe("normalizeName", () => {
  it("ignores case, accents and spaces", () => {
    expect(normalizeName("Pásalo App")).toBe(normalizeName("pasalo-app"));
  });
});
