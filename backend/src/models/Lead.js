import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    direction: { type: String, enum: ['in', 'out'], required: true },
    text: String,
    payload: mongoose.Schema.Types.Mixed,
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    channel: { type: String, enum: ['whatsapp', 'instagram'], required: true },
    customerId: { type: String, required: true, index: true },
    name: String,
    phone: String,
    username: String,
    selectedService: String,
    requirement: String,
    status: { type: String, default: 'New', enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Closed'] },
    assignedTo: String,
    messages: [messageSchema]
  },
  { timestamps: true }
);

leadSchema.index({ channel: 1, customerId: 1 }, { unique: true });

export default mongoose.model('Lead', leadSchema);
