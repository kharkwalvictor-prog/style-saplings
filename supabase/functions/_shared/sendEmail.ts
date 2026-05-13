export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("RESEND_API_KEY not configured");
    return { success: false, data: { error: "Email service not configured" } };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "Style Saplings <orders@stylesaplings.com>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: replyTo || "support@stylesaplings.com",
    }),
  });

  const data = await res.json();
  return { success: res.ok, data };
}
