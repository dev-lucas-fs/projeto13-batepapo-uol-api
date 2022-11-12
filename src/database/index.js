const { MongoClient } = require("mongodb");

module.exports = async () => {
  const client = await MongoClient.connect(process.env.MONGO);

  try {
    const db = client.db("project-13-uol");
    return db;
  } catch (err) {
    return err;
  }
};
