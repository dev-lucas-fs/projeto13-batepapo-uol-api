const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connection = require("./database");
const dayjs = require("dayjs");

const app = express();

app.use("/participants", require("./routes/Participants.js"));
app.use("/messages", require("./routes/Messages.js"));
app.use("/status", require("./routes/Status.js"));

app.use(cors());
dotenv.config();

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});

async function removeInactiveUsers() {
  try {
    const db = await connection();

    let participants = await db.collection("participants").find().toArray();
    participants = participants.filter(
      (participant) =>
        dayjs(Date.now()).diff(dayjs(participant.lastStatus), "second") > 10
    );

    participants.forEach(async (participant) => {
      await db.collection("participants").deleteOne({ name: participant.name });
    });
  } catch (err) {
    console.log(err);
  }
}

setInterval(removeInactiveUsers, 15 * 1000);
