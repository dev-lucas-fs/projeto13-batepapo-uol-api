const express = require("express");
const Joi = require("joi");
const connection = require("../database");

const router = express.Router();
router.use(express.json());

router.post("/", async (request, response) => {
  const { name } = request.body;
  const isName = await Joi.string().empty("").validateAsync(name);
  if (!isName) return response.sendStatus(422);

  try {
    const db = await connection();

    const usersCollection = db.collection("users");

    if (await usersCollection.findOne({ name }))
      return response.sendStatus(409);

    await usersCollection.insertOne({ name, lastStatus: Date.now() });
    return response.sendStatus(201);
  } catch (err) {
    return response.sendStatus(400);
  }
});

module.exports = router;
