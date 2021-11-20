// modules exported and middlewares
const express = require("express");
const app = express();
const http = require("http");
const fs = require("fs");
const server = http.createServer(app);
const path = require("path");
const { find } = require("async");

// middleware for testing on webapps
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.json());

// hostname and port
const hostname = "127.0.0.1";
const port = 80;

//database connections
const mongoose = require("mongoose");

// models import
const Event = require("./models/events");

// connect to the mongodb database
const mongo_atlas_path =
  "mongodb+srv://Architjain:UEkpXUAtUP6Pt6B@cluster0.2jwdx.mongodb.net/sportistaan-db?retryWrites=true&w=majority";
mongoose
  .connect(mongo_atlas_path, {
    // useNEWUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
  })
  .then(() => {
    console.log("mongodb connected!");
  })
  .catch((err) => {
    console.log(err);
  });

// routes and controllers

// route for creating an event/tournament basically for hosting
app.post("/create-event", (req, res) => {
  // const event1 = new Event({
  //   gameName: "football",
  //   time: "11pm",
  //   venue: "grounds",
  //   student_id: ["person1", "person2"],
  //   finish: false,
  //   winner: "person1",
  // });
  const event = new Event(req.body);
  event.save();
});

// route for a client to join a particular tournament
app.post("/join-event", (req, res) => {
  Event.updateMany(
    { _id: req.body._id },
    { $push: { student_info: { name: req.body.name } } } //  {_id: "12345", student_id: person's Name}
  )
    .then((result) => console.log(result))
    .catch((err) => console.log(err));
});

// route to all the information of the scheduled events.
app.get("/show-event", (req, res) => {
  Event.find({})
    .then((result) => {
      if (result.finish == true) res.send(result.winner);
      else {
        res.send(result);
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// chat application
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 80 });
app.get("/", (req, res) => {
  wss.once("connection", function onConnection(ws) {
    console.log("New ws connection established!");

    // ws.on("message", (data) => {
    //   console.log("client sends:" + data);

    //   ws.send(String(data).toUpperCase());
    // });

    ws.on("message", function incoming(data, isBinary) {
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          // console.log(data);
          client.send(data, { binary: isBinary });
          // client.send(JSON.stringify([data, name]), { binary: isBinary });
        }
      });
    });

    ws.on("close", () => {
      console.log("client disconnected");
    });
  });
  res.render("home");
});

// listening to the server
server.listen(port, hostname, () => {
  console.log(`server running at http://${hostname}:${port}`);
});