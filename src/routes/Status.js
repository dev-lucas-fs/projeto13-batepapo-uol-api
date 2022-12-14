const express = require("express");
const Joi = require("joi");
const connection = require("../database");
const cors = require("cors");

const router = express.Router();
router.use(express.json());
router.use(cors());

router.post("/", async (request, response) => {
  const { user } = request.headers;

  if (!Joi.string().empty().validate(user, { abortEarly: false }))
    return response.sendStatus(404);

  try {
    const db = await connection();
    const participant = await db
      .collection("participants")
      .findOne({ name: user });

    if (!participant) return response.sendStatus(404);

    await db
      .collection("participants")
      .updateOne({ name: user }, { $set: { lastStatus: Date.now() } });

    return response.sendStatus(200);
  } catch (err) {
    return response.sendStatus(400);
  }
});

module.exports = router;
