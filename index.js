'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

app.set('port', (process.env.PORT || '5000'));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hi I am a chatbot');
});

const VERIFY_TOKEN = "itsalreadylateandineedtogetthisdone"

function getPriceList() {
    let fs = require('fs');
    let filename = "pricelist.txt";
    let content = fs.readFileSync(process.cwd() + "/" + filename).toString();

    return content;
}

app.get('/webhook/', (req, res) => {

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    console.log("mode", mode);
    console.log("token", token);
    console.log("challenge", challenge);
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (token === VERIFY_TOKEN) {

            if (mode === "subscribe") {
                res.status(200).send(challenge);
            }

            let body = req.body;

            // Iterates over each entry - there may be multiple if batched
            body.entry.forEach(function (entry) {

                // Gets the message. entry.messaging is an array, but 
                // will only ever contain one message, so we get index 0
                let messaging_events = entry.messaging[0];
                for (let i = 0; i < messaging_events.length; i++) {
                    let event = messaging_events[i]
                    let sender = event.sender.id
                    if (event.message && event.message.text) {
                        let message = event.message.text;

                        if (message.includes("pricelist") || message.includes("pricelist")) {
                            sendText(sender, getPriceList())
                        }
                    }
                }
            });

            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

app.post('/webhook/', (req, res) => {
    let messaging_events = req.body.entry[0].messaging
    console.log("messaging_events.length", messaging_events.length)
    for (let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let message = event.message.text;

            console.log("message", message)

            if (message.includes("pricelist") || message.includes("pricelist")) {
                sendText(sender, getPriceList())
            }
        }
    }
    res.sendStatus(200)
});

function sendText(sender, text) {
    let messageData = { text: text }
    request({
        url: "https://graph.facebook.com/v3.3/me/messages",
        qs: { access_token: VERIFY_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: messageData
        }
    }, function (error, response, body) {
        if (error) {
            console.log(response.body.error)
        } else if (response.body.error) {
            console.log("response body error", response.body.error)
        }
    });
}

app.listen(app.get('port'), function () {
    console.log('Webhook is live!');
});
