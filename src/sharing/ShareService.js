import { ShareType } from './ShareType.js';
import { customAlphabet } from 'nanoid';
import { ShareRepository } from './ShareRepository.js';

export class ShareService {

  constructor(repo = new ShareRepository()) {
    this.repo = repo;
  }

  async createEditorShare(editorPayload) {
    const record = this.#buildRecord(
      ShareType.EDITOR_PALETTE,
      editorPayload
    );

    try {
        const code = await this.repo.save(record); //returns the inserted ID of the database listing
        return code;
    } catch (err) {
        //in the case of a collision, DB will throw 11000 error
        if (err.code == 11000) {
            return this.createEditorShare(editorPayload);
        }
        throw err;
    }
  }

  async createGenerationShare(genSettingsPayload) {
    const record = this.#buildRecord(
      ShareType.GENERATION_SESSION,
      genSettingsPayload
    );

    try {
        const code = await this.repo.save(record); //returns the inserted ID of the database listing
        return code;
    } catch (err) {
        //in the case of a collision, DB will throw 11000 error
        if (err.code == 11000) {
            return this.createGenerationShare(genSettingsPayload);
        }
        throw err;
    }
  }

 async resolve(code) {
    const record = await this.repo.findById(code);
 
    if (!this.isUsable(record)) {
      if (record) {
        // Record exists but is expired — clean it up
        await this.repo.deleteById(code);
      }
      return null;
    }
 
    return record;
  }
 
   // Returns true if the record exists and has not expired.
  isUsable(record, now = new Date()) {
    if (!record) return false;
    return !record.expiresAt || record.expiresAt > now;
  }


  #buildRecord(type, payload) {
    return {
      _id: this.#generateCode(),
      type,
      payload,
      createdAt: new Date(),
      expiresAt: this.#buildExpiryDate(90)
    };
  }

  #generateCode(length = 8) {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return customAlphabet(alphabet, 8); //chars, code size (8)
  }

  #buildExpiryDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }
}