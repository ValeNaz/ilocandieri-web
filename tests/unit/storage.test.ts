import { describe, expect, it } from "vitest";
import { UnsafePathError, resolveInside, detectDocument, detectImage, newStoredPath, safeDisplayName, validateCv, validateImage } from "@/lib/storage";
import { localDriver } from "@/lib/storage/local";

const jpg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(20)]);
const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(20)]);
const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 "), Buffer.alloc(8)]);
const avif = Buffer.concat([Buffer.alloc(4), Buffer.from("ftypavif"), Buffer.alloc(8)]);
const pdf = Buffer.from("%PDF-1.7\n....");
const doc = Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), Buffer.alloc(16)]);
const docx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("[Content_Types].xml word/document.xml")]);

describe("file validation (magic bytes)", () => {
  it("detects images", () => {
    expect(detectImage(jpg)?.ext).toBe("jpg");
    expect(detectImage(png)?.ext).toBe("png");
    expect(detectImage(webp)?.ext).toBe("webp");
    expect(detectImage(avif)?.ext).toBe("avif");
    expect(detectImage(pdf)).toBeNull();
    expect(detectImage(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>"))).toBeNull();
  });
  it("detects documents", () => {
    expect(detectDocument(pdf)?.ext).toBe("pdf");
    expect(detectDocument(doc)?.ext).toBe("doc");
    expect(detectDocument(docx)?.ext).toBe("docx");
    expect(detectDocument(Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("other.zip contents")]))).toBeNull();
    expect(detectDocument(jpg)).toBeNull();
  });
  it("enforces size limits and rejects empty/unknown", () => {
    expect(validateImage(jpg).ok).toBe(true);
    expect(validateImage(jpg, 5).ok).toBe(false);
    expect(validateImage(Buffer.alloc(0)).ok).toBe(false);
    expect(validateCv(pdf).ok).toBe(true);
    expect(validateCv(png).ok).toBe(false);
    expect(validateCv(pdf, 3).ok).toBe(false);
  });
  it("sanitises display names", () => {
    expect(safeDisplayName("../../etc/passwd\n.pdf")).not.toMatch(/[/\\\n]/);
  });
});

describe("path safety", () => {
  it("blocks traversal and absolute paths", () => {
    for (const bad of ["../x", "a/../../x", "/etc/passwd", "a\\b", "a/./b", "", "a//b", ".env", "a/.hidden", "a\0b"]) {
      expect(() => resolveInside("/tmp/base", bad), bad).toThrow(UnsafePathError);
    }
    expect(resolveInside("/tmp/base", "2026/10/a.jpg")).toBe("/tmp/base/2026/10/a.jpg");
  });
  it("local driver round-trips and isolates scopes", async () => {
    const rel = newStoredPath("jpg");
    await localDriver.put("public", rel, jpg);
    expect((await localDriver.get("public", rel))?.equals(jpg)).toBe(true);
    expect(await localDriver.exists("private", rel)).toBe(false);
    await localDriver.remove("public", rel);
    expect(await localDriver.get("public", rel)).toBeNull();
    await expect(localDriver.get("public", "../private/x.pdf")).rejects.toThrow(UnsafePathError);
  });
});
