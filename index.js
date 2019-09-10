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

const VERIFY_TOKEN = "EAAXxpGmj2UwBAO27SZCsuZBs917jfH3hnceAufGFwxP6VnCsEF4UZBO7Ae3HkLE2xb9QOhetym1IaDHNFGDg3ZBBlZCeY1aQbcZCfA33sQiMUE0grkZBkvNHwi289tIZAOi5df69l1tpvDCYbSBOZCp9HnRCv4XzJituNZBEqEW2KZCGQZDZD";

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

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === "subscribe" && token === VERIFY_TOKEN) {

            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

app.get('/pricelist/', (req, res) => {
    return getPriceList();
});

app.post('/webhook/', (req, res) => {
    let messaging_events = req.body.entry[0].messaging

    for (let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let message = event.message.text;

            if (message.includes("price list") || message.includes("pricelist")) {
                sendText(sender, getPriceList())
            }
        }
    }
    res.sendStatus(200)
});

function sendText(sender, text) {
    let messageData = { text: text }
    console.log("sender", sender);
    request({
        url: "https://graph.facebook.com/v4.0/me/messages",
        qs: { access_token: "EAAXxpGmj2UwBANuHnXzeVLO9VOl3rqNaVZACnLwmnSb88U8XgKZCjXiWpdBZACtwnQUrPiU9yEeN1OZCYqbNtLqYxnrO89VGOgtzfk2ibuVgBp6AYJjUM12JwzCojSTXDwa7O3qDA2zg7u8TjuyGZCDUd3zx1j2whotTl7eplHwTc6w2b3RVK" },
        method: 'POST',
        json: {
            messaging_type: "RESPONSE",
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
