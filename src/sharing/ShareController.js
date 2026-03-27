import { ShareService } from "./ShareService";

class ShareController {
  shareService = new ShareService();

  constructor(service) {
    this.shareService = service;
  }

   async createEditorShare(req, res) {
    try {
      const palette = req.body;
      const payload = this.toEditorPayload(palette);
      const code = await this.shareService.createEditorShare(payload);
      return res.status(201).json({ code });
    } catch (err) {
      console.error('createEditorShare error:', err);
      return res.status(500).json({ error: 'Failed to create share link.' });
    }
  }
 
  async createGenerationShare(req, res) {
    try {
      const generationSettings = req.body;
      const payload = this.toGenerationPayload(generationSettings);
      const code = await this.shareService.createGenerationShare(payload);
      return res.status(201).json({ code });
    } catch (err) {
      console.error('createGenerationShare error:', err);
      return res.status(500).json({ error: 'Failed to create share link.' });
    }
  }
 
  async resolve(req, res) {
    try {
      const { code } = req.params;
      const record = await this.shareService.resolve(code);
 
      if (!record) {
        return res.status(404).json({ error: 'Share link not found or has expired.' });
      }
 
      return res.status(200).json(record);
    } catch (err) {
      console.error('resolve error:', err);
      return res.status(500).json({ error: 'Failed to resolve share link.' });
    }
  }
 
  toEditorPayload(palette) {
    return palette.toEditorDTO();
  }
 
  toGenerationPayload(generationSettings) {
    return generationSettings.toGenerationDTO();
  }
}