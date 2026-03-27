import { ShareService } from "@src/sharing/ShareService";
import { ShareRepository } from "@src/sharing/ShareRepository";
import { ShareType } from "@src/sharing/ShareType";
import { startConnection, closeConnection } from "@src/data/MongoClient";

describe('ShareService.resolve() Integration Test (With MongoClient)', () => {
    const testExpiredCode = ''; //test code for expired record
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
            await repo.collection.deleteOne({ _id: testExpiredCode });
        } catch (e) {
        }

        //kill the connection so jest can exit
        await closeConnection();
    })

    it('should return the record when it exists and is not expired', async () => {
        const code = await service.createEditorShare(editorPayload);
        const record = await service.resolve(code);

        expect(record).toBeDefined();
        expect(record.type).toBe(ShareType.EDITOR_PALETTE);
        expect(record.payload).toMatchObject(editorPayload);
    });

    it('should return null when the code does not exist', async () => {
        const record = await service.resolve('00000000');

        expect(record).toBeNull();
    });

    it('should delete an expired record and return null', async () => {
        //insert an already-expired record directly via the repo
        await repo.collection.insertOne({
            _id:      testExpiredCode,
            type:      ShareType.EDITOR_PALETTE,
            version:   1,
            payload:   editorPayload,
            createdAt: new Date('2000-01-01'),
            expiresAt: new Date('2000-04-01'), //expired
        });

        const record = await service.resolve(testExpiredCode);

        expect(record).toBeNull();

        //confirm it was deleted from the DB
        const stillThere = await repo.findById(testExpiredCode);
        expect(stillThere).toBeNull();
    });
});