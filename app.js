'use strict';

let TelegramBot = require('node-telegram-bot-api');
let request = require('request-promise');

let TelegramBotToken = '181738313:AAEpiHaCbDwhKROlir4rForfxF-Zy4asH7Y';
let telegramBot = new TelegramBot(TelegramBotToken, { polling: true });

let registeredUsers = [], previousTopStories = [];

function getTopStory(){
    return request('https://hacker-news.firebaseio.com/v0/topstories.json').then(data => 
        request('https://hacker-news.firebaseio.com/v0/item/' + JSON.parse(data)[0] + '.json?print=pretty')
    );
};

function pushTopStory(story){
    registeredUsers.forEach(user => telegramBot.sendMessage(user, story.title + ' - ' + story.url));
    previousTopStories.push(story.id);
}

setInterval(() => {
     getTopStory().then(data => {
        data = JSON.parse(data);

        if(previousTopStories.indexOf(data.id) === -1){
            pushTopStory(data);
        }
     });
}, 10000);

telegramBot.onText(/\/start/, msg => {
    registeredUsers.push(msg.from.id);
    telegramBot.sendMessage(msg.from.id, 'Thanks, you\'re now registered, you\'ll get a message when the top story changes!');
});
