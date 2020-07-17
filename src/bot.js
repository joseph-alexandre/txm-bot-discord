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
    const arrayDescription = [];

    if(message.author.bot){
        return;
    }
    if(!message.content.startsWith(prefix)){
        return;
    };


    if(message.content.startsWith(prefix)){
        const filter = m => !m.author.bot
        switch(message.content){
            case prefix + 'cadastrar':{
                message.channel.send('Qual a descrição da ata?');
                let description;
                let participants;
                let collector = new Discord.MessageCollector(message.channel, filter, {max: 2, time: 10000});
                collector.on('collect', (message, col) => {
                    description = message.content;
                    message.channel.send('Quais foram os participantes?')
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
            case prefix + 'print': {
                message.channel.send('Entrando na página e tirando print...');
                await client.printTelaAta();
                message.channel.send('Print tirado.', {files: ['../print.png']});
                break;
            }
            case prefix + 'adicionar': {
                message.channel.send(`Por favor, patrão ${message.author}, descreva-me o que aconteceu.`);
                let collector = new Discord.MessageCollector(message.channel, filter);
                collector.on('collect', async (message, col) => {
                    if(message.content == prefix + 'finalizar'){
                        collector.stop();
                    }
                });

                collector.on('end', collected1 => {
                    message.channel.send(`Você finalizou a ata. Deseja prosseguir ou cancelar, patrão ${message.author}?`);
                    let collector2 = new Discord.MessageCollector(message.channel, filter);
                    collector2.on('collect', async (message, col) => {
                          switch(message.content){
                          case 'cancelar': {
                            message.channel.send('Missão abortada.');
                            collector.stop();
                            collector2.stop();
                            break;
                        } case 'prosseguir': {
                            collector2.stop();
                            collected1.forEach(msg => arrayDescription.push(msg.content));
                            let description = arrayDescription.join('\n');
                            let participants;
                            message.channel.send('Quais foram os outros ?')
                            let collector3 = new Discord.MessageCollector(message.channel, filter, {max: 2});
                            collector3.on('collect', async (message, col) => {
                                participants = message.content;
                                await message.channel.send('Estou organizando a ata e preparando para enviá-la. É possível que demore alguns segundos, você consegue esperar.');
                                await client.adicionarAta(description, participants);
                                await message.channel.send('Tá na mão, meu patrão.');
                                collector3.stop();
                                collector.stop();
                            });
                            break;
                        } 
                        default: {
                            message.channel.send('Comando desconhecido. Por favor, escolha entre prosseguir ou cancelar o procedimento.');
                        }
                    }
                    });
                });
            }
            
        }
    }}

    );

