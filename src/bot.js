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
                message.channel.send('Qual a descrição da ata?');
                let description;
                let participants;
                let filter = m => !m.author.bot
                let collector = new Discord.MessageCollector(message.channel, filter, {max: 2, time: 10000});
                collector.on('collect', (message, col) => {
                    description = message.content;
                    message.channel.send('Quais são os participantes?')
                    let collector2 = new Discord.MessageCollector(message.channel, filter, {max: 2, time: 10000});
                    collector2.on('collect', async (message, col) => {
                        participants = message.content;
                        message.channel.send('Criando a ata...');
                        await client.adicionarAta(description, participants);
                        collector2.stop();
                        message.channel.send('Ata criada!');
                    });
                    collector.stop();
                });
                break;
            }
        }
    }}
);
