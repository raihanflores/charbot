"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();

let VERIFY_TOKEN =
  "EAAevWHxDRssBAJuxiZBQ2SXlCkcM1gm4JIfiPJyxjHbG5jPwmps2DpglusJznfz05pYQP6IK4B5Nls295uMKQnbYMZBs5CN9YrpEbcTU9CIRirAy0oEtVdGIefZA9sod0lWqbZB9o7qAWpgGCn87Fr3YTmhUJrV0s9LmY08nOwZDZD";

app.set("port", process.env.PORT || "5000");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.send("Hi I am a chatbot");
});

app.get("/webhook/", function(req, res) {
  if (req.query["hub.verify_token"] === "token") {
    res.send(req.query["hub.challenge"]);
  }
  res.send("Wrong token");
});

function getPriceList() {
  let fs = require("fs");
  let filename = "pricelist.txt";
  let content = fs.readFileSync(process.cwd() + "/" + filename).toString();

  return content;
}

app.post("/webhook/", function(req, res) {
  // Parse the request body from the POST
  let body = req.body;
  console.log(body.object);
  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (
    received_message.text.toLowerCase().includes("pricelist") ||
    received_message.text.toLowerCase().includes("price list")
  ) {
    // Create the payload for a basic text message
    response = {
      text: getPriceList()
    };
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === "yes") {
    response = { text: "Thanks!" };
  } else if (payload === "no") {
    response = { text: "Oops, try sending another image." };
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid
    },
    message: response
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token:
          "EAAXxpGmj2UwBAPb8L6dfe0WsY0U7j9ynFZBUDO2b7ZB3dbQ3WoAjrjJu2EZAZBS7qvSOY83c51KyyaO5WASnAP1bZAdmj6YilHLqQAZBAU3hX1v47FAwE1LLqRq3ZCDxMexXhXtWQoTpOF4EBOUZBlDK4kZBYdKLlWMbD0LwyK9ceqqUSkT7jrg3Y"
      },
      method: "POST",
      json: request_body
    },
    (err, res, body) => {
      if (!err) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
}

app.listen(app.get("port"), function() {
  console.log("Running: port");
});
