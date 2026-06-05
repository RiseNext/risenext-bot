import axios from 'axios';
import { addOutgoingMessage } from './leadService.js';
import { company } from '../config/company.js';

const graphVersion = process.env.META_GRAPH_VERSION || 'v21.0';
const graphBase = `https://graph.facebook.com/${graphVersion}`;

function whatsappConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  return { token, phoneNumberId };
}

async function sendWhatsAppPayload(to, payload, outText = '') {
  const { token, phoneNumberId } = whatsappConfig();

  if (!token || !phoneNumberId || token.includes('PASTE_')) {
    console.log('ℹ️ WhatsApp token not configured. Mock reply:', { to, payload });
    return { mocked: true };
  }

  const res = await axios.post(`${graphBase}/${phoneNumberId}/messages`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  await addOutgoingMessage({
    channel: 'whatsapp',
    customerId: to,
    text: outText,
    payload: res.data
  });

  return res.data;
}

export async function sendWhatsAppText(to, text) {
  return sendWhatsAppPayload(
    to,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text
      }
    },
    text
  );
}

export async function sendWhatsAppMainMenu(to) {
  const rows = company.services.map((service) => ({
    id: `service_${service.key}`,
    title: service.label.slice(0, 24),
    description: service.details.slice(0, 72)
  }));

  rows.push({
    id: 'talk_team',
    title: 'Talk to Team',
    description: 'Connect with Rise Next team'
  });

  return sendWhatsAppPayload(
    to,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: 'Rise Next Solutions'
        },
        body: {
          text: `Welcome to ${company.name} 👋\nPlease choose a service.`
        },
        footer: {
          text: 'Build • Manage • Scale'
        },
        action: {
          button: 'Choose Service',
          sections: [
            {
              title: 'Services',
              rows
            }
          ]
        }
      }
    },
    'Main menu sent'
  );
}

export async function sendWhatsAppServiceMenu(to, service) {
  const rows = service.options.slice(0, 9).map((option, index) => ({
    id: `option_${service.key}_${index + 1}`,
    title: option.slice(0, 24),
    description: 'Tap to continue'
  }));

  rows.push({
    id: 'talk_team',
    title: 'Talk to Team',
    description: 'Request callback'
  });

  return sendWhatsAppPayload(
    to,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: {
          type: 'text',
          text: service.label.slice(0, 60)
        },
        body: {
          text: service.details
        },
        action: {
          button: 'Select Option',
          sections: [
            {
              title: service.label.slice(0, 24),
              rows
            }
          ]
        }
      }
    },
    `${service.label} menu sent`
  );
}

export async function sendInstagramText(recipientId, text) {
  const token = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN;
  const pageId = process.env.INSTAGRAM_PAGE_ID;

  if (!token || !pageId || token.includes('PASTE_')) {
    console.log('ℹ️ Instagram token not configured. Mock reply:', {
      recipientId,
      text
    });
    return { mocked: true };
  }

  const res = await axios.post(
    `${graphBase}/${pageId}/messages`,
    {
      recipient: {
        id: recipientId
      },
      messaging_type: 'RESPONSE',
      message: {
        text
      }
    },
    {
      params: {
        access_token: token
      }
    }
  );

  await addOutgoingMessage({
    channel: 'instagram',
    customerId: recipientId,
    text,
    payload: res.data
  });

  return res.data;
}
