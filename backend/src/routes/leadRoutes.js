import express from 'express';
import { adminAuth, getLeads, getStats, updateLead } from '../controllers/leadController.js';
const router = express.Router();
router.use(adminAuth);
router.get('/', getLeads);
router.get('/stats/summary', getStats);
router.patch('/:id', updateLead);
export default router;
