import Lead from '../models/Lead.js';

export async function upsertLead({
  channel,
  customerId,
  name,
  phone,
  username,
  incomingText,
  selectedService,
  payload
}) {
  try {
    console.log('📥 Saving lead:', {
      channel,
      customerId,
      incomingText,
      selectedService
    });

    const update = {
      $setOnInsert: {
        channel,
        customerId,
        name,
        phone,
        username
      },
      $set: {},
      $push: {
        messages: {
          direction: 'in',
          text: incomingText,
          payload
        }
      }
    };

    if (selectedService) {
      update.$set.selectedService = selectedService;
    }

    if (incomingText && !selectedService) {
      update.$set.requirement = incomingText;
    }

    const lead = await Lead.findOneAndUpdate(
      { channel, customerId },
      update,
      {
        new: true,
        upsert: true
      }
    );

    console.log('✅ Lead saved successfully:', lead._id);

    return lead;
  } catch (error) {
    console.error('❌ Lead save error:', error);
    throw error;
  }
}

export async function addOutgoingMessage({
  channel,
  customerId,
  text,
  payload
}) {
  try {
    return await Lead.findOneAndUpdate(
      { channel, customerId },
      {
        $push: {
          messages: {
            direction: 'out',
            text,
            payload
          }
        }
      },
      { new: true }
    );
  } catch (error) {
    console.error('❌ Outgoing message save error:', error);
  }
}
