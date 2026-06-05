import { company } from "../config/company.js";

export function normalizeText(text = "") {
  return text.toString().trim().toLowerCase();
}

export function buildMainMenuText() {
  return `👋 Welcome to Rise Next Solutions!

Please select a service from the menu:

📈 Digital Marketing
🎬 RN Studio
💻 Technology Solutions
📞 BPO Services
👨‍💼 Hiring & Staffing
💰 Loan & Financing Assistance
📞 Talk To Us`;
}

export function buildFallbackText() {
  return buildMainMenuText();
}

export function findService(text = "") {
  const normalized = normalizeText(text);

  return company.services.find((service) => {
    const serviceKey = service.key.replaceAll("_", " ");
    const cleanLabel = service.label
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

    return (
      normalized.includes(serviceKey) ||
      normalized.includes(cleanLabel) ||
      service.options.some((option) =>
        normalized.includes(option.toLowerCase())
      )
    );
  });
}

export function buildServiceText(service) {
  if (!service) return buildMainMenuText();

  return `${service.label}

${service.details}

Please select one option from the list below.`;
}
