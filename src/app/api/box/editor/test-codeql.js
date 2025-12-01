const { exec } = require("child_process");
const express = require("express");
const app = express();

app.get("/run", (req, res) => {
  const cmd = req.query.cmd;
  exec(cmd); // 🚨 CodeQL MUST flag this
  res.send("done");
});

app.listen(3000);
