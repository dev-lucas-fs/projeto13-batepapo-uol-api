const dayjs = require("dayjs");
const express = require("express");
const Joi = require("joi");
const connection = require("../database");
const cors = require("cors");

const router = express.Router();
router.use(express.json());
router.use(cors());

router.post("/", async (request, response) => {
  const { name } = request.body;
  const isName = await Joi.string().empty("").validateAsync(name);
  if (!isName) return response.sendStatus(422);

  try {
    const db = await connection();

    const usersCollection = db.collection("participants");

    if (await usersCollection.findOne({ name }))
      return response.sendStatus(409);

    const timestamp = Date.now();

    await usersCollection.insertOne({ name, lastStatus: timestamp });

    const messagesCollection = db.collection("messages");

    await messagesCollection.insertOne({
      from: name,
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs(timestamp).format("HH:mm:ss"),
    });

    return response.sendStatus(201);
  } catch (err) {
    return response.sendStatus(400);
  }
});

router.get("/", async (request, response) => {
  try {
    const db = await connection();

    const participantsCollection = db.collection("participants");

    const participants = await participantsCollection.find().toArray();

    return response.send(participants);
  } catch (err) {
    return response.sendStatus(400);
  }
});

module.exports = router;
