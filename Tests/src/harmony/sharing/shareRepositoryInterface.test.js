import {ShareRepository} from '@src/sharing/ShareRepository';
import {startConnection, closeConnection} from '@src/data/MongoClient';

describe('ShareRepository Integration Test (With MongoClient)', () => {
  const testCode = 'jasd81m0'; //test code
  const repo = new ShareRepository();

  beforeAll(async () => {
    await startConnection();
  });

  afterAll(async () => {
    //first clean out test data
    try {
      const db = repo.collection;
      await db.deleteOne({_id: testCode});
    } catch (e) {}

    //kill the connect so jest can exit
    await closeConnection();
  });

  it('should save and find a record by an 8-character code', async () => {
    const data = {_id: testCode, body: '...'}; // This is just test data, not a schema test

    //test saving
    const savedId = await repo.save(data);
    expect(savedId).toBe(testCode);

    //test find
    const found = await repo.findById(testCode);
    expect(found).toBeDefined();
    expect(found.body).toBe('...');
  });
});
