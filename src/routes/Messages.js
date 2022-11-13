const dayjs = require("dayjs");
const express = require("express");
const Joi = require("joi");
const cors = require("cors");
const connection = require("../database");

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

  if (!(await messageSchema.validateAsync({ to, text, type, from })))
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
  if (!(await Joi.number().integer().validateAsync(limit))) limit = false;

  try {
    const db = await connection();
    const messagesCollection = await db.collection("messages");

    let messages = await messagesCollection.find().toArray();
    messages = messages
      .reverse()
      .filter((message) => message.to === "Todos" || message.to === from);

    if (limit) messages = messages.slice(0, parseInt(limit));

    return response.json(messages);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
