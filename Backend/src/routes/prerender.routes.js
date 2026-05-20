import express from 'express';
import { prerenderPage } from '../controllers/prerender.controller.js';

const router = express.Router();

router.get('/', prerenderPage);

export default router;