const express = require("express");
const dotenv = require("dotenv");

const PORT = process.env.PORT;

const app = express();
dotenv.config();

app.listen(PORT, () => {
  console.log(`Listening in port ${PORT}`);
});
