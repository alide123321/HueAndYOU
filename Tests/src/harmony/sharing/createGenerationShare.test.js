import { ShareService } from "@src/sharing/ShareService";
import { ShareRepository } from "@src/sharing/ShareRepository";
import { ShareType } from "@src/dto/ShareType";
import { startConnection, closeConnection } from "@src/data/MongoClient";

describe('ShareService.createGenerationShare() Integration Test (With MongoClient)', () => {
    const repo = new ShareRepository();
    const service = new ShareService(repo);

    const generationPayload = {
        settings: {
            harmonyType:         'COMPLEMENTARY',
            baseColorHex:        '#3498DB',
            numberOfColors:      5,
            numberOfPalettes:    1,
            filters:             {},
            isLightMode:         true,
            includeBgTextColors: false,
            opts:                {},
        },
        results: [],
    };

    beforeAll(async () => {
        await startConnection();
    })

    afterAll(async () => {
        //kill the connection so jest can exit
        await closeConnection();
    })

    it('should save a generation share and return an 8-character code', async () => {
        const code = await service.createGenerationShare(generationPayload);

        expect(typeof code).toBe('string');
        expect(code).toHaveLength(8);
    });

    it('should persist the record with the correct type and payload', async () => {
        const code = await service.createGenerationShare(generationPayload);
        const record = await repo.findById(code);

        expect(record).toBeDefined();
        expect(record.type).toBe(ShareType.GENERATION_SESSION);
        expect(record.payload).toMatchObject(generationPayload);
    });

    it('should set createdAt and expiresAt on the record', async () => {
        const code = await service.createGenerationShare(generationPayload);
        const record = await repo.findById(code);

        expect(record.createdAt).toBeInstanceOf(Date);
        expect(record.expiresAt).toBeInstanceOf(Date);
        expect(record.expiresAt > record.createdAt).toBe(true);
    });
});