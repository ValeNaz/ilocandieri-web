import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isAllowedVideoUrl, MEDIA_SLOTS, mediaSlot, mediaSlotsByPage, parseMediaSlotsSetting, resolveMediaSource, validateSlotEntry } from "@/lib/media-slots";

const photo = mediaSlot("giardino-casolare");
const video = mediaSlot("home-video");
const image = { url: "/media/2026/10/abc.jpg", alt: "Library alt", width: 1600, height: 1200 };

describe("media slots registry", () => {
  it("has unique ids and every slot is grouped once", () => {
    const ids = MEDIA_SLOTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(mediaSlotsByPage().flatMap((g) => g.slots.map((s) => s.id))).toEqual(expect.arrayContaining(ids));
    expect(mediaSlotsByPage().reduce((n, g) => n + g.slots.length, 0)).toBe(ids.length);
  });
  it("shot list doc lists every slot", () => {
    const doc = readFileSync("docs/FOTO_DA_FORNIRE.md", "utf8");
    for (const s of MEDIA_SLOTS) expect(doc, s.id).toContain(`\`${s.id}\``);
  });
});

describe("video url validation", () => {
  it.each([
    ["https://cdn.example.org/v/giardino.mp4", true],
    ["https://cdn.example.org/v/giardino.webm?v=2", true],
    ["/reali/home-video.mp4", true],
    ["http://cdn.example.org/a.mp4", false],
    ["https://user:pw@cdn.example.org/a.mp4", false],
    ["https://www.youtube.com/watch?v=abc", false],
    ["javascript:alert(1)//a.mp4", false],
    ["/reali/../secret.mp4", false],
    ["/media/a.mp4", false],
    ["https://localhost/a.mp4", false],
  ])("%s -> %s", (url, ok) => expect(isAllowedVideoUrl(url)).toBe(ok));
});

describe("slot entry validation", () => {
  it("accepts a photo with trimmed fields", () => {
    const r = validateSlotEntry(photo, { mediaId: " abc_123 ", alt: "  Il casolare al mattino ", caption: "Foto di Anna", videoUrl: "" });
    expect(r).toEqual({ ok: true, entry: { mediaId: "abc_123", alt: "Il casolare al mattino", caption: "Foto di Anna", videoUrl: "" } });
  });
  it("treats an all-empty form as a cleared slot", () => {
    expect(validateSlotEntry(photo, { mediaId: "", alt: "", caption: "", videoUrl: null })).toEqual({ ok: true, entry: null });
  });
  it("rejects a video url on a photo slot", () => {
    const r = validateSlotEntry(photo, { mediaId: "", videoUrl: "https://cdn.example.org/a.mp4" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.videoUrl).toBeTruthy();
  });
  it("rejects bad ids, short alt, long caption, bad video url", () => {
    const r = validateSlotEntry(video, { mediaId: "../x", alt: "ab", caption: "x".repeat(161), videoUrl: "https://youtu.be/abc" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.fieldErrors).sort()).toEqual(["alt", "caption", "mediaId", "videoUrl"]);
  });
  it("parses the stored setting defensively", () => {
    const parsed = parseMediaSlotsSetting({
      "giardino-casolare": { mediaId: "m1", alt: "", caption: "", videoUrl: "" },
      "home-video": { mediaId: null, alt: "", caption: "", videoUrl: "https://cdn.example.org/a.mp4" },
      "campo-panoramica": { mediaId: null, alt: "", caption: "", videoUrl: "https://cdn.example.org/a.mp4" },
      "non-esiste": { mediaId: "m2" },
      "storia-prima": "nope",
    });
    expect(Object.keys(parsed).sort()).toEqual(["giardino-casolare", "home-video"]);
    expect(parseMediaSlotsSetting(null)).toEqual({});
    expect(parseMediaSlotsSetting([1, 2])).toEqual({});
  });
});

describe("media source resolution", () => {
  const entry = { mediaId: "m1", alt: "", caption: "", videoUrl: "" };
  it("admin image wins over files, registry alt by default", () => {
    const r = resolveMediaSource({ slot: photo, entry, image, files: { photo: "/reali/giardino-casolare.jpg" } });
    expect(r).toEqual({ origin: "admin", type: "photo", src: image.url, alt: photo.alt, caption: undefined, width: 1600, height: 1200 });
  });
  it("admin alt and caption override registry and prop caption", () => {
    const r = resolveMediaSource({ slot: photo, entry: { ...entry, alt: "Mio alt", caption: "Mia" }, image, caption: "Prop" });
    expect(r).toMatchObject({ alt: "Mio alt", caption: "Mia" });
  });
  it("falls back to the public/reali file when the library image was deleted", () => {
    const r = resolveMediaSource({ slot: photo, entry, image: null, files: { photo: "/reali/giardino-casolare.webp", photoSize: { width: 800, height: 600 } }, caption: "Prop" });
    expect(r).toEqual({ origin: "file", type: "photo", src: "/reali/giardino-casolare.webp", alt: photo.alt, caption: "Prop", width: 800, height: 600 });
  });
  it("video slot: admin url with library poster, then file video, then poster-only photo", () => {
    expect(resolveMediaSource({ slot: video, entry: { ...entry, videoUrl: "https://cdn.example.org/a.mp4" }, image, files: { video: "/reali/home-video.mp4" } }))
      .toMatchObject({ origin: "admin", type: "video", src: "https://cdn.example.org/a.mp4", poster: image.url });
    expect(resolveMediaSource({ slot: video, entry: null, files: { video: "/reali/home-video.mp4", poster: "/reali/home-video-poster.jpg" } }))
      .toMatchObject({ origin: "file", type: "video", poster: "/reali/home-video-poster.jpg" });
    expect(resolveMediaSource({ slot: video, entry, image })).toMatchObject({ origin: "admin", type: "photo", src: image.url });
  });
  it("ignores a video file on a photo slot", () => {
    expect(resolveMediaSource({ slot: photo, files: { video: "/reali/x.mp4" } })).toBeNull();
  });
  it("placeholder only when allowed, otherwise null", () => {
    expect(resolveMediaSource({ slot: photo, showPlaceholder: true })).toEqual({ origin: "placeholder" });
    expect(resolveMediaSource({ slot: photo })).toBeNull();
  });
});
