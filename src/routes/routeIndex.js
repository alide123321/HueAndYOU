// Route endpoints to appropriate js and pages
import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const root = path.join(__dirname, '../../public/views');

// Serve the homepage
router.get('/', (req, res) => {
  res.sendFile('generationPage.html', {root: root});
});

export default router;
