const dayjs = require("dayjs");
const express = require("express");
const Joi = require("joi");
const cors = require("cors");
const connection = require("../database");
const { ObjectId } = require("mongodb");

const router = express.Router();
router.use(express.json());
router.use(cors());

const messageSchema = Joi.object({
  to: Joi.string().empty(),
  text: Joi.string().empty(),
  type: Joi.string().valid("message", "private_message"),
  from: Joi.string().empty(),
});

router.post("/", async (request, response) => {
  const { to, text, type } = request.body;
  const { user: from } = request.headers;

  if (!messageSchema.validate({ to, text, type, from }, { abortEarly: false }))
    return response.sendStatus(422);

  try {
    const db = await connection();
    const isParticipant = await db
      .collection("participants")
      .findOne({ name: from });

    if (!isParticipant) return response.sendStatus(422);

    await db.collection("messages").insertOne({
      to,
      text,
      type,
      from,
      time: dayjs(Date.now()).format("HH:mm:ss"),
    });

    return response.sendStatus(201);
  } catch (err) {
    return response.sendStatus(400);
  }
});

router.get("/", async (request, response) => {
  let { limit } = request.query;
  const { user: from } = request.headers;
  if (!Joi.number().integer().validate(limit, { abortEarly: false }))
    limit = false;

  try {
    const db = await connection();
    const messagesCollection = await db.collection("messages");

    let messages = await messagesCollection.find().toArray();
    messages = messages.filter(
      (message) =>
        message.to === "Todos" || message.to === from || message.from === from
    );

    if (limit) messages = messages.slice(0, parseInt(limit));

    return response.json(messages);
  } catch (err) {
    return response.sendStatus(400);
  }
});

router.delete("/:id", async (request, response) => {
  const { user: from } = request.headers;

  const { id } = request.params;

  console.log(id);

  try {
    const db = await connection();
    const participant = await db
      .collection("participants")
      .findOne({ name: from });

    if (!participant) return response.sendStatus(404);

    const message = await db
      .collection("messages")
      .findOne({ _id: ObjectId(id) });

    console.log(message);

    if (!message || message.from !== from) return response.sendStatus(401);

    await db.collection("messages").deleteOne({ _id: message._id });

    return response.sendStatus(200);
  } catch (err) {
    response.sendStatus(400);
  }

  response.send("OK");
});

router.put("/:id", async (request, response) => {
  const { user: from } = request.headers;
  const { to, text, type } = request.body;
  const { id } = request.params;

  if (!messageSchema.validate({ to, text, type, from }, { abortEarly: false }))
    return response.sendStatus(422);

  try {
    const db = await connection();
    const participant = await db
      .collection("participants")
      .findOne({ name: from });

    if (!participant) return response.sendStatus(404);

    const message = await db
      .collection("messages")
      .findOne({ _id: ObjectId(id) });

    console.log(message);

    if (!message) return response.sendStatus(401);
    if (message.from !== from) return response.sendStatus(404);

    await db
      .collection("messages")
      .updateOne({ _id: message._id }, { $set: { to, text, type } });

    return response.sendStatus(200);
  } catch (err) {
    response.sendStatus(400);
  }

  response.send("OK");
});

module.exports = router;
