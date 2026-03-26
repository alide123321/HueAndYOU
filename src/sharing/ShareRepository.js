import { getDb, SHARE_COLLECTION } from "../data/MongoClient.js";

export class ShareRepository {
  constructor() {}

  //ensures that we don't look for collection until it needs to be called
  get collection()  {
    return getDb().collection(SHARE_COLLECTION);
  }

  async save(data) {
    const result = await this.collection.insertOne(data);
    //Shape of mongodb response: 
    /*
    *   {"acknowledged" : true, "insertedId": ...} insertedId is the successful code
    */
    return result.insertedId; 
  }

  //retrieves the record from mongodb
  async findById(id) {
    return await this.collection.findOne({ _id: id });
  }
}