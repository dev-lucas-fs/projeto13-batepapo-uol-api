const express = require("express");
const dotenv = require("dotenv");
const connection = require("./database");
const dayjs = require("dayjs");

const app = express();

app.use("/participants", require("./routes/Participants.js"));
app.use("/messages", require("./routes/Messages.js"));
app.use("/status", require("./routes/Status.js"));

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
      await db.collection("messages").insertOne({
        from: participant.name,
        to: "Todos",
        text: "sai da sala...",
        type: "status",
        time: dayjs(Date.now()).format("HH:mm:ss"),
      });
    });
  } catch (err) {
    console.log(err);
  }
}

setInterval(removeInactiveUsers, 15 * 1000);
