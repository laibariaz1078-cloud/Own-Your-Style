import { MongoClient } from "mongodb";

const localUri = process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/my-app";
const atlasUri = process.env.MONGODB_URI;

if (!atlasUri) {
  throw new Error("MONGODB_URI is required for the Atlas destination.");
}

const source = new MongoClient(localUri);
const destination = new MongoClient(atlasUri);

try {
  await source.connect();
  await destination.connect();

  const sourceDb = source.db();
  const destinationDb = destination.db();
  const collections = await sourceDb.listCollections().toArray();

  console.log(`Copying ${collections.length} collection(s) from local MongoDB to Atlas...`);

  for (const { name } of collections) {
    const sourceCollection = sourceDb.collection(name);
    const destinationCollection = destinationDb.collection(name);
    const documents = await sourceCollection.find({}).toArray();

    if (documents.length > 0) {
      const operations = documents.map((document) => ({
        replaceOne: {
          filter: { _id: document._id },
          replacement: document,
          upsert: true,
        },
      }));
      await destinationCollection.bulkWrite(operations, { ordered: false });
    }

    const indexes = await sourceCollection.listIndexes().toArray();
    for (const index of indexes) {
      if (index.name === "_id_") continue;
      const options = {};
      for (const optionName of ["unique", "sparse", "expireAfterSeconds", "partialFilterExpression", "collation"]) {
        if (index[optionName] !== undefined) options[optionName] = index[optionName];
      }
      await destinationCollection.createIndex(index.key, { ...options, name: index.name });
    }

    console.log(`- ${name}: ${documents.length} document(s) copied`);
  }

  console.log("Migration completed successfully.");
} finally {
  await source.close();
  await destination.close();
}
