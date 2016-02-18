'use strict';

let TelegramBot = require('node-telegram-bot-api');
var Firebase = require("firebase");
let request = require('request-promise');

let TelegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
let telegramBot = new TelegramBot(TelegramBotToken, { polling: true });

let registeredUsers = [], currentTopStory;

function getTopStory(){
    return request('https://hacker-news.firebaseio.com/v0/topstories.json').then(data => 
        request('https://hacker-news.firebaseio.com/v0/item/' + JSON.parse(data)[0] + '.json?print=pretty')
    );
};

function pushTopStory(story){
    registeredUsers.forEach(user => telegramBot.sendMessage(user, story.title + ' - ' + story.url));
    currentTopStory = story.id;
}

setInterval(() => {
     getTopStory().then(data => {
        data = JSON.parse(data);

        if(data.id !== currentTopStory){
            pushTopStory(data);
        }
     });
}, 10000);

telegramBot.onText(/\/start/, msg => {
    registeredUsers.push(msg.from.id);
    telegramBot.sendMessage(msg.from.id, 'Thanks, you\'re now registered, you\'ll get a message when the top story changes!');
});
