const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const app = express();

app.use("/participants", require("./routes/Participants.js"));
app.use("/messages", require("./routes/Messages.js"));

app.use(cors());
dotenv.config();

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
