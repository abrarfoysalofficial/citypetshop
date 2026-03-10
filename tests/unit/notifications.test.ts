/**
 * Notifications: sendEmail stub (RESEND_API_KEY missing → ok:false), no ok:true dev stub.
 */
import { sendEmail } from "@/lib/notifications";

describe("sendEmail", () => {
  const originalKey = process.env.RESEND_API_KEY;

  afterEach(() => {
    process.env.RESEND_API_KEY = originalKey;
  });

  it("returns ok:false when RESEND_API_KEY is missing (no dev stub ok:true)", async () => {
    delete process.env.RESEND_API_KEY;
    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Test</p>",
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("RESEND_API_KEY");
  });
});
