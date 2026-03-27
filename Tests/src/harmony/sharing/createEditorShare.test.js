import { ShareService } from "@src/sharing/ShareService";
import { ShareRepository } from "@src/sharing/ShareRepository";
import { ShareType } from "@src/dto/ShareType";
import { startConnection, closeConnection } from "@src/data/MongoClient";

describe('ShareService.createEditorShare() Integration Test (With MongoClient)', () => {
    const testCode = 'EDTR0001'; //test code
    const repo = new ShareRepository();
    const service = new ShareService(repo);

    const editorPayload = {
        isDarkTheme: false,
        entries: [
            { hex: '#FF5733', role: 'primary' },
            { hex: '#FFFFFF', role: 'background' },
        ],
    };

    beforeAll(async () => {
        await startConnection();
    })

    afterAll(async () => {
        //first clean out test data
        try {
            await repo.collection.deleteOne({ _id: testCode });
        } catch (e) {
        }

        //kill the connection so jest can exit
        await closeConnection();
    })

    it('should save an editor share and return an 8-character code', async () => {
        const code = await service.createEditorShare(editorPayload);

        expect(typeof code).toBe('string');
        expect(code).toHaveLength(8);
    });

    it('should persist the record with the correct type and payload', async () => {
        const code = await service.createEditorShare(editorPayload);
        const record = await repo.findById(code);

        expect(record).toBeDefined();
        expect(record.type).toBe(ShareType.EDITOR_PALETTE);
        expect(record.payload).toMatchObject(editorPayload);
    });

    it('should set createdAt and expiresAt on the record', async () => {
        const code = await service.createEditorShare(editorPayload);
        const record = await repo.findById(code);

        expect(record.createdAt).toBeInstanceOf(Date);
        expect(record.expiresAt).toBeInstanceOf(Date);
        expect(record.expiresAt > record.createdAt).toBe(true);
    });
});