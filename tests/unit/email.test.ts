import { eq } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { db, schema } from "@/lib/db";
import { enqueueAndSend, renderEmail, renderPlaceholders, retryEmail, sendTemplatedEmail, setMailTransport } from "@/lib/email";

afterEach(() => setMailTransport(null));

describe("templates", () => {
  it("replaces nested placeholders and escapes html in the html part only", () => {
    const ctx = { evento: { titolo: "Cena <b>&</b>" }, nome: "Ada" };
    expect(renderPlaceholders("Ciao {{ nome }}, {{evento.titolo}} {{manca.x}}!", ctx)).toBe("Ciao Ada, Cena <b>&</b> !");
    const r = renderEmail({ subject: "Iscrizione a {{evento.titolo}}\nx", body: "Ciao {{nome}}\n\nTi aspettiamo a <{{evento.titolo}}>" }, ctx);
    expect(r.subject).not.toMatch(/\n/);
    expect(r.html).toContain("Cena &lt;b&gt;&amp;&lt;/b&gt;");
    expect(r.html).toContain("&lt;Cena");
    expect(r.html).not.toContain("<b>");
    expect(r.text).toContain("Cena <b>&</b>");
  });
});

describe("outbox", () => {
  it("marks not_configured without SMTP (never 'sent') and can be retried once configured", async () => {
    const res = await enqueueAndSend({ idempotencyKey: "t:nc:1", to: "a@b.it", subject: "s", text: "t" });
    expect(res.status).toBe("not_configured");
    const sendMail = vi.fn().mockResolvedValue({});
    setMailTransport({ sendMail });
    expect(await retryEmail(res.id)).toBe("sent");
    expect(sendMail).toHaveBeenCalledTimes(1);
    // retrying a sent message never sends twice
    expect(await retryEmail(res.id)).toBe("sent");
    expect(sendMail).toHaveBeenCalledTimes(1);
    const [row] = await db.select().from(schema.emailOutbox).where(eq(schema.emailOutbox.id, res.id));
    expect(row!.status).toBe("sent");
    expect(row!.sentAt).toBeTruthy();
  });

  it("is idempotent per key", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    setMailTransport({ sendMail });
    const a = await enqueueAndSend({ idempotencyKey: "t:idem:1", to: "a@b.it", subject: "s", text: "t" });
    const b = await enqueueAndSend({ idempotencyKey: "t:idem:1", to: "a@b.it", subject: "s", text: "t" });
    expect(a.id).toBe(b.id);
    expect(b.created).toBe(false);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it("records failures and allows retry", async () => {
    setMailTransport({ sendMail: vi.fn().mockRejectedValueOnce(new Error("smtp down")).mockResolvedValue({}) });
    const a = await enqueueAndSend({ idempotencyKey: "t:fail:1", to: "a@b.it", subject: "s", text: "t" });
    expect(a.status).toBe("failed");
    const [row] = await db.select().from(schema.emailOutbox).where(eq(schema.emailOutbox.id, a.id));
    expect(row!.lastError).toContain("smtp down");
    expect(row!.attempts).toBe(1);
    expect(await retryEmail(a.id)).toBe("sent");
  });

  it("sendTemplatedEmail renders the default password_reset template", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    setMailTransport({ sendMail });
    await sendTemplatedEmail({ template: "password_reset", to: "u@x.it", idempotencyKey: "t:tpl:1", ctx: { utente: { nome: "Ada" }, link: "https://x/y?t=1" } });
    const msg = sendMail.mock.calls[0]![0];
    expect(msg.text).toContain("Ciao Ada");
    expect(msg.text).toContain("https://x/y?t=1");
  });
});
