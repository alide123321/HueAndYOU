import { ShareService } from "./ShareService";

class ShareController {
  shareService = new ShareService();

  constructor(service) {
    this.shareService = service;
  }

  createEditorShare(palette) {
    const payload = this.toEditorPayload(palette);
    return this.shareService.createEditorShare(payload);
  }

  createGenerationShare(generationSettings) {
    const payload = this.toGenerationPayload(generationSettings);
    return this.shareService.createGenerationShare(payload);
  }

  resolve(code) {
    return this.shareService.resolve(code);
  }

  toEditorPayload(palette) {
    return {
      palette,
      version: 1
    };
  }

  toGenerationPayload(generationSettings) {
    return {
      settings: generationSettings,
      results: [],
      version: 1
    };
  }
}