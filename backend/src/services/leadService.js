import Lead from '../models/Lead.js';

export async function upsertLead({ channel, customerId, name, phone, username, incomingText, selectedService, payload }) {
  const update = {
    $setOnInsert: { channel, customerId, name, phone, username },
    $set: {},
    $push: { messages: { direction: 'in', text: incomingText, payload } }
  };
  if (selectedService) update.$set.selectedService = selectedService;
  if (incomingText && !selectedService) update.$set.requirement = incomingText;

  return Lead.findOneAndUpdate({ channel, customerId }, update, { new: true, upsert: true });
}

export async function addOutgoingMessage({ channel, customerId, text, payload }) {
  return Lead.findOneAndUpdate(
    { channel, customerId },
    { $push: { messages: { direction: 'out', text, payload } } },
    { new: true }
  );
}
