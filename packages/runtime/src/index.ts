const cwd = process.cwd();
const functionFile = process.argv[2];
const importFile = `${cwd}/${functionFile}`;
const fn = require(importFile);
const express = require("express");
const invokeUserFn = require("./invoker.js").default;

const server = express();
const PORT = process.env.port || 8080;

server.post("/", (_, res) => {
  invokeUserFn(fn);
  console.log("message received");
  res.send("Hello World!");
});

server.listen(PORT, () => {
  console.log(`Invoker listening on port ${PORT}`);
});
