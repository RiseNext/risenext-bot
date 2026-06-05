import {
  buildMainMenuText,
  findService,
  normalizeText
} from "../utils/menu.js";

import { upsertLead } from "../services/leadService.js";

import {
  sendInstagramText,
  sendWhatsAppMainMenu,
  sendWhatsAppServiceMenu,
  sendWhatsAppText
} from "../services/metaService.js";

import { askRiseNextAI } from "../services/openaiService.js";
import { company } from "../config/company.js";

export function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
}

export async function handleWebhook(req, res) {
  res.sendStatus(200);

  try {
    const body = req.body;

    if (body.object === "whatsapp_business_account") {
      await handleWhatsApp(body);
    }

    if (body.object === "instagram") {
      await handleInstagram(body);
    }
  } catch (error) {
    console.error(
      "Webhook processing error:",
      error.response?.data || error.message
    );
  }
}

function getWhatsAppIncoming(message) {
  if (message.type === "interactive") {
    return {
      text:
        message.interactive?.list_reply?.title ||
        message.interactive?.button_reply?.title ||
        "",
      selectedId:
        message.interactive?.list_reply?.id ||
        message.interactive?.button_reply?.id ||
        ""
    };
  }

  return {
    text: message.text?.body || "",
    selectedId: ""
  };
}

function thankYouMessage() {
  return `✅ Thank you for contacting Rise Next Solutions.

Your request has been successfully registered.

Our Rise Next team will contact you shortly.

📞 Call: +91 7207409354
📧 Email: info@risenext.in
🌐 Website: https://www.risenext.in

Thank you for choosing Rise Next Solutions 🚀`;
}

function selectedFinalOption(selectedId = "") {
  return selectedId.startsWith("option_") || selectedId === "talk_team";
}

function isMainMenuTrigger(normalized = "") {
  return ["hi", "hello", "hey", "menu", "start", "help"].includes(normalized);
}

async function saveWhatsAppLead({ from, contact, text, selectedId, service, message }) {
  await upsertLead({
    channel: "whatsapp",
    customerId: from,
    name: contact?.profile?.name,
    phone: from,
    incomingText: text || selectedId || "Hi",
    selectedService: service?.label || selectedId || "Main Menu",
    payload: message
  });
}

async function handleWhatsApp(body) {
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      const contact = value.contacts?.[0];
      const message = value.messages?.[0];

      if (!message) continue;

      const from = message.from;
      const { text, selectedId } = getWhatsAppIncoming(message);
      const normalized = normalizeText(text);

      const serviceKey = selectedId.startsWith("service_")
        ? selectedId.replace("service_", "")
        : "";

      const service =
        company.services.find((s) => s.key === serviceKey) ||
        findService(text);

      await saveWhatsAppLead({
        from,
        contact,
        text,
        selectedId,
        service,
        message
      });

      // FAST REPLY: first message/menu should not call OpenAI
      if (isMainMenuTrigger(normalized) && !selectedId) {
        await sendWhatsAppMainMenu(from);
        continue;
      }

      // Final option selected
      if (selectedFinalOption(selectedId)) {
        await sendWhatsAppText(from, thankYouMessage());
        continue;
      }

      // Service selected or typed
      if (service) {
        await sendWhatsAppServiceMenu(from, service);
        continue;
      }

      // If OpenAI is disabled, always show menu
      if (!process.env.OPENAI_API_KEY) {
        await sendWhatsAppMainMenu(from);
        continue;
      }

      // OpenAI only for custom queries
      try {
        const aiReply = await askRiseNextAI(
          text || "Customer needs assistance with Rise Next Solutions"
        );

        await sendWhatsAppText(from, aiReply);
        await sendWhatsAppMainMenu(from);
      } catch (error) {
        console.error("OpenAI fallback error:", error.response?.data || error.message);
        await sendWhatsAppMainMenu(from);
      }
    }
  }
}

async function handleInstagram(body) {
  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      const senderId = event.sender?.id;
      const text = event.message?.text || event.postback?.payload || "";

      if (!senderId || !text) continue;

      const normalized = normalizeText(text);
      const service = findService(text);

      let reply = buildMainMenuText();

      if (service) {
        reply = `${service.label}\n\n${service.details}`;
      }

      if (
        process.env.OPENAI_API_KEY &&
        !service &&
        !isMainMenuTrigger(normalized)
      ) {
        try {
          reply = await askRiseNextAI(text);
        } catch (error) {
          console.error("Instagram OpenAI error:", error.response?.data || error.message);
          reply = buildMainMenuText();
        }
      }

      await upsertLead({
        channel: "instagram",
        customerId: senderId,
        username: senderId,
        incomingText: text,
        selectedService: service?.label || "Main Menu",
        payload: event
      });

      await sendInstagramText(senderId, reply);
    }
  }
}
