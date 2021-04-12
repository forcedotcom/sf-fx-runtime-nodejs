const cwd = process.cwd();
const functionFile = process.argv[2];
const importFile = `${cwd}/${functionFile}`;
const fn = require(importFile);
const express = require("express");
const invokeUserFn = require("./invoker.js").default;

const server = express();
const PORT = process.env.port || 8080;

try {
  server.use(express.json());

  server.post("/", (req, res) => {
    // invokeUserFn(fn);
    console.log(req);
    console.log(req.body);
    console.log("message received");
    // res.json(req.body);
    res.send("Hello World!");
  });
  
  server.listen(PORT, () => {
    console.log(`Invoker listening on port ${PORT}`);
  });
} catch(e) {
  console.log("something happened");
  console.log(e);
}
