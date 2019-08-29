'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

let token = "EAAXxpGmj2UwBAGlaBDL4oQI2uZB2O41I7GnTMyEmGUbfLIlPZC59LXoB1a1aaSYnbUxDNhhfyTKsTqSn4YcHlEIK3XZCdUXA2t7PTxFinZCyBkrFnTc6bbt5EtvRov5UyE64QAt1ZB3duxjovt8ZATZAtE2DNzUje2xXz6FwHUK1s3ZAJeKbph6O"

app.set('port', (process.env.PORT || '5000'));

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.send('Hi I am a chatbot');
});

app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === 'token') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Wrong token')
});

function getPriceList() {
    let fs = require('fs');
    let filename = "pricelist.txt";
    let content = fs.readFileSync(process.cwd() + "/" + filename).toString();

    return content;
}

app.post('/webhook/', function(req, res) {
    getPriceList();
    let messaging_events = req.body.entry[0].messaging
    for(let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let message = event.message.text;

            if(message.includes("pricelist") || message.includes("pricelist")) {
                sendText(sender, getPriceList())
            }
        }
    }
    res.sendStatus(200)
})

function sendText(sender, text) {
    let messageData = {text: text}
    request({
        url: "https://graph.facebook.com/v3.3/me/messages",
        qs: {access_token: token},
        method: 'POST',
        json: {
            recipient: {id: sender},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log(response.body.error)
        } else if (response.body.error) {
            console.log("response body error")
        }
    });
}

app.listen(app.get('port'), function() {
    console.log('Running: port');
});
