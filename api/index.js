// Este arquivo serve como ponte para o Vercel encontrar o backend
// no padrão exigido (pasta /api)
import app from '../Backend/src/app.js';
import serverless from 'serverless-http';

export default serverless(app);