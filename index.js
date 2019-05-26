'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

const token = "EAAevWHxDRssBAJuxiZBQ2SXlCkcM1gm4JIfiPJyxjHbG5jPwmps2DpglusJznfz05pYQP6IK4B5Nls295uMKQnbYMZBs5CN9YrpEbcTU9CIRirAy0oEtVdGIefZA9sod0lWqbZB9o7qAWpgGCn87Fr3YTmhUJrV0s9LmY08nOwZDZD"

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

app.post('webhook', function(req, res) {
    let messaging_events = req.body.entry[0].messaging_events
    for(let i = 0; i < messaging_events.length; i++) {
        let event = messaging_events[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            sendText(sender, "Text echo " + text.substring(0,100))
        }
    }
    res.sendStatus(200)
})

function sendText(sender, text) {
    let messageData = {text: text}
    request({
        url: "https://graph.facebook.com/v3.3/me/messages",
        qs: {access_token, token},
        method: 'POST',
        json: {
            receipt: {id: sender},
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
