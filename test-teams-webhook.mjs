import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
const message = process.argv.slice(2).join(" ").trim() || `Cendien Teams webhook test at ${new Date().toISOString()}`;

if (!webhookUrl) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: "Missing TEAMS_WEBHOOK_URL in .env"
      },
      null,
      2
    )
  );
  process.exit(1);
}

const adaptiveCard = {
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
  type: "AdaptiveCard",
  version: "1.4",
  body: [
    {
      type: "TextBlock",
      text: "Cendien Webhook Test",
      weight: "Bolder",
      size: "Large"
    },
    {
      type: "TextBlock",
      text: message,
      wrap: true
    }
  ]
};

const payload = {
  text: message,
  adaptiveCard,
  type: "message",
  attachments: [
    {
      contentType: "application/vnd.microsoft.card.adaptive",
      contentUrl: null,
      content: adaptiveCard
    }
  ]
};

try {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const responseBody = await response.text().catch(() => "");

  console.log(
    JSON.stringify(
      {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseBody
      },
      null,
      2
    )
  );
} catch (error) {
  const err = error;
  console.error(
    JSON.stringify(
      {
        ok: false,
        errorName: err instanceof Error ? err.name : "Error",
        errorMessage: err instanceof Error ? err.message : String(err)
      },
      null,
      2
    )
  );
  process.exit(1);
}
