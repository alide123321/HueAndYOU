import { ShareService } from "@src/sharing/ShareService";
import { ShareRepository } from "@src/sharing/ShareRepository";

describe('ShareService.isUsable() Unit Test', () => {
    const repo = new ShareRepository();
    const service = new ShareService(repo);

    it('should return false for null', () => {
        expect(service.isUsable(null)).toBe(false);
    });

    it('should return false for undefined', () => {
        expect(service.isUsable(undefined)).toBe(false);
    });

    it('should return true when the record has no expiresAt', () => {
        expect(service.isUsable({ payload: {} })).toBe(true);
    });

    it('should return true when expiresAt is in the future', () => {
        const future = new Date();
        future.setDate(future.getDate() + 90);

        expect(service.isUsable({ expiresAt: future })).toBe(true);
    });

    it('should return false when expiresAt is in the past', () => {
        const past = new Date();
        past.setDate(past.getDate() - 1);

        expect(service.isUsable({ expiresAt: past })).toBe(false);
    });

    it('should return false when expiresAt equals now exactly', () => {
        const now = new Date();

        expect(service.isUsable({ expiresAt: now }, now)).toBe(false);
    });
});