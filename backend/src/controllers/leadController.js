import Lead from '../models/Lead.js';

function authorize(req, res, next) {
  if (req.headers['x-admin-api-key'] !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

export const adminAuth = authorize;

export async function getLeads(req, res) {
  const leads = await Lead.find().sort({ updatedAt: -1 }).limit(200);
  res.json(leads);
}

export async function updateLead(req, res) {
  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json(lead);
}

export async function getStats(req, res) {
  const [total, byChannel, byStatus] = await Promise.all([
    Lead.countDocuments(),
    Lead.aggregate([{ $group: { _id: '$channel', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  ]);
  res.json({ total, byChannel, byStatus });
}
