require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const client = require('./client');
const prefix = '!';

bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

// filtrar por canal de texto - teste-bot

var description = [];

const addDescription = (message) => {
    description.push(message);
}
const endDescription = () => {
    return description.join();  
}
const showDescription = () => {
    for(message in description){
        console.log(message);
    }
}
bot.on('message', async (message) => {

    if(message.author.bot){
        return;
    }

    if(!message.content.startsWith(prefix)){
        return;
    };


    if(message.content.startsWith(prefix)){
        switch(message.content){
            case prefix + 'adicionar':{
                message.channel.send('Descreva o que aconteceu, por favor.');
                let filter = m => !m.author.bot
                let collector = new Discord.MessageCollector(message.channel, filter, {max: 2, time: 10000});
                collector.on('collect', (message, col) => {
                    addDescription(message.content);
                    collector.stop();
                });  
                break;                             
            }
            case prefix + 'finalizar':{
                if(description.length == 0){
                    message.channel.send('Não há conteúdo suficiente para produzir uma ata :(');
                    return;
                }
                message.channel.send('Quais foram os participantes?');
                let filter = m => !m.author.bot;
                let collector = new Discord.MessageCollector(message.channel, filter, {max: 2, time: 10000});
                collector.on('collect', async (message, col) => {
                    participants = message.content;
                    message.channel.send('Criando a ata...');
                    await client.adicionarAta(description, participants);
                    collector.stop();
                    message.channel.send('Ata criada!');
                });
                break;
            }
            
        }
    }}
);
