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
import {ShareController} from '../sharing/ShareController.js';
const shareController = new ShareController();

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

// Serve the share link for the editor palette 
router.post('/generate', express.json(), generateAPI.generateBatchPalettes);
router.post('/share/editor', express.json(), (req, res) =>
  shareController.createEditorShare(req, res)
);

// Serve the share link for the generation settings
router.post('/share/generation', express.json(), (req, res) =>
  shareController.createGenerationShare(req, res)
);

//Serve the share code and returns stored record
router.get('/share/:code', (req, res) => shareController.resolve(req, res));
export default router;
