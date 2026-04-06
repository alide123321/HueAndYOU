// Route endpoints to appropriate js and pages
import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const root = path.join(__dirname, '../../public/views');

// api paths
const apiRoot = path.join(__dirname, '../api');
import * as generateAPI from '../api/generate.js';

// Serve the homepage
router.get('/', (req, res) => {
  res.sendFile('GenerationPage.html', {root: root});
});

// Serve the edit page
router.get('/edit', (req, res) => {
  res.sendFile('editPage.html', {root: root});
});

// Serve the library page
router.get('/library', (req, res) => {
  res.sendFile('library.html', {root: root});
});

// CAP-30: Exporter testing routes - these can be removed once the exporter is integrated into the UI
router.get('/exporter', (req, res) => {
  res.redirect('/sandbox/exportModal.html');
});

router.post('/generate', express.json(), generateAPI.generateBatchPalettes);

export default router;
