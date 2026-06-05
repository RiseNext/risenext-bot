import 'dotenv/config';
import { connectDB } from './config/db.js';
import Lead from './models/Lead.js';

await connectDB();
await Lead.deleteMany({});
await Lead.insertMany([
  {
    channel: 'whatsapp',
    customerId: '919494119354',
    phone: '919494119354',
    name: 'Demo Customer',
    selectedService: 'Technology Solutions',
    requirement: 'Need company website and WhatsApp bot',
    messages: [{ direction: 'in', text: 'Need website' }, { direction: 'out', text: 'Please choose a service' }]
  },
  {
    channel: 'instagram',
    customerId: '17840000000000000',
    username: 'demo_insta_user',
    selectedService: 'VN Studios / Creative',
    requirement: 'Need podcast shoot package',
    messages: [{ direction: 'in', text: 'Podcast shoot' }]
  }
]);
console.log('✅ Demo leads inserted');
process.exit(0);
