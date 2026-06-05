import OpenAI from 'openai';
import { company } from '../config/company.js';

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function askRiseNextAI(userMessage = '') {
  if (!client) {
    return `Thanks for contacting ${company.name}. Please choose one option from the menu or share your requirement. Our team will contact you shortly.`;
  }

  const services = company.services
    .map((s) => `${s.label}: ${s.details}`)
    .join('\n');

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 220,
    messages: [
      {
        role: 'system',
        content: `You are the official WhatsApp assistant for ${company.name}. Reply briefly, professionally, and sales-focused. Do not invent prices. Ask for name, company, service requirement, and location when needed. Always guide the user toward selecting a Rise Next service or speaking to the team. Services:\n${services}\nContact: ${company.phone}, ${company.email}, ${company.website}`
      },
      { role: 'user', content: userMessage }
    ]
  });

  return response.choices?.[0]?.message?.content || `Please share your requirement. Our team will contact you shortly.`;
}
