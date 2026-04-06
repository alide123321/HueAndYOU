import {ShareService} from './ShareService.js';

export class ShareController {
  constructor(service = new ShareService()) {
    this.shareService = service;
  }

// POST share/editor to store a palette and return a share code
  async createEditorShare(req, res) {
    try {
      const payload = this.toEditorPayload(req.body);
      const code = await this.shareService.createEditorShare(payload);
// 201 — share link created successfully
      return res.status(201).json({code});
    } catch (err) {
      console.error('createEditorShare error:', err);
// 500 — server error
      return res.status(500).json({error: 'Failed to create share link.'});
    }
  }

// POST share/generation to store generation settings and return a share code
  async createGenerationShare(req, res) {
    try {
      const payload = this.toGenSettingsPayload(req.body);
      const code = await this.shareService.createGenerationShare(payload);
      return res.status(201).json({code});
    } catch (err) {
      console.error('createGenerationShare error:', err);
      return res.status(500).json({error: 'Failed to create share link.'});
    }
  }

// GET /share/:code to look up a share code and return stored record
  async resolve(req, res) {
    try {
      const {code} = req.params;
      const record = await this.shareService.resolve(code);
// 404 — code does not exist or has expired
      if (!record) {
        return res
          .status(404)
          .json({error: 'Share link not found or has expired.'});
      }
// 200 — share link resolved successfully
      return res.status(200).json(record);
    } catch (err) {
      console.error('resolve error:', err);
      return res.status(500).json({error: 'Failed to resolve share link.'});
    }
  }

// Map editor palette data to the DTO stored in MongoDB
  toEditorPayload(palette) {
    return {...palette, version: 1};
  }

// Map generation settings to the DTO stored in MongoDB
  toGenSettingsPayload(generationSettings) {
    return {...generationSettings, version: 1};
  }
}
