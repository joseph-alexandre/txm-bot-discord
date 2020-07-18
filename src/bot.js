require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client();
const TOKEN = process.env.TOKEN;
const client = require('./client');
const prefix = '!';
const questions = require('./questions.json');

const endRecord = async (loggedBrowser, description, participants, message) => {
    await message.channel.send('Estou organizando a ata e preparando para enviá-la. É possível que demore alguns segundos, você consegue esperar.');
    // console.log(loggedBrowser, description, participants, message)
    await client.adicionarAta(loggedBrowser, description, participants);
    await message.channel.send('Tá na mão, meu patrão.');
}

const showRecord = async (botInstance, message) => {
    // mostra ata para verificação
    message.channel.send("Ata completa:");
    message.channel.send(`**${botInstance.arrayDescription.join("\n")}**`);
    message.channel.send(`Confirmando participantes: ${botInstance.participants}`);
}
    
const getParticipants = (botInstance, message) => {
    // pergunta pelos participantes
    // filtro para ignorar msg do bot
    const participantsFilter = m => !m.author.bot;
    // pergunta e espera pela resposta
    message.channel.send('Quais foram os outros envolvidos, Sr(a)?');
    const response = message.channel.createMessageCollector( participantsFilter, { max:1 , time: 15000});
    return response.on('collect', message =>{
        // após resposta, adiciona no atributo do objeto
        botInstance.participants = message.content;
    });
}
const questionProcess = (botInstance, message) => {
    // Busca a pergunta de prosseguir/descartar
    const askSir = questions[0];
    // verifica se a resposta é uma das opções.
    const questionFilter = response => {
        return askSir.answers.some(answer => answer.toLowerCase() === response.content.toLowerCase())&&!response.author.bot;                  
    };
    // mostra a mensagem e, em seguida espera pela resposta.
    return message.channel.send(askSir.question).then( () => {
        message.channel.awaitMessages(questionFilter, {max: 2, time: 15000, errors: ['time']})
        .then( collected => {    
            // verifica se a resposta é prosseguir
            if( collected.first().content.toLowerCase() === askSir.answers[0].toLowerCase() ){
                // if: prosseguir
                // formata a descrição no atributo do objeto
                botInstance.arrayDescription = botInstance.arrayDescription.join("\n");
                
            } else {
                // descartar
                message.channel.send('Como desejar...');
                message.channel.send('Estou abortando esta missão!');
                botInstance.arrayDescription = [];
                
            }                          
        })
        .catch( collected => {
            message.channel.send(`Pelo amor de Morcegod, ${collected.first().author}! Peço-lhe que me chame quando estiver menos ocupado.`);
            
        });
    });
}

bot.login(TOKEN);

bot.on('ready', async () => {

    console.info(`Logged in as ${bot.user.tag}!`);

    // Criando um atributo para o objeto Bot, 
    // que utilizará a mesma conexão do puppeteer.
    this.loggedBrowser = await client.login();
    this.arrayDescription = [];
    this.participants = "";

});

bot.on('message', async (message) => {

    if(message.author.bot){
        return;
    }
    if(!message.content.startsWith(prefix)){
        return;
    };
    if(message.content.startsWith(prefix)){

        // novo atributo para o bot
        this.channel = message.channel;

        const filter = m => !m.author.bot
        switch(message.content){
            case prefix + 'debug': {
                this.channel.send(`A descrição é: \n**${this.arrayDescription}** \ne os participantes são: \n**${this.participants}**`);
                break;
            }
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
                        await client.adicionarAta(this.loggedBrowser, description, participants);
                        collector2.stop();
                        message.channel.send('Ata criada!');
                    });
                    collector.stop();
                });
                break;
            }
            case prefix + 'print': {
                message.channel.send('Entrando na página e tirando print...');
                await client.printTelaAta(this.loggedBrowser);
                message.channel.send('Print tirado.', {files: ['../print.png']});
                break;
            }
            case prefix + 'adicionar': {
                // verifica se já foi iniciada
                if(this.arrayDescription.lenght > 0){
                    return;
                }
                message.channel.send(`Por favor, patrão ${message.author}, descreva-me o que aconteceu.`);

                // abre um collector que não aceita mensagens do bot 
                let collector = new Discord.MessageCollector(message.channel, filter);

                // ao coletar, verifica:
                collector.on('collect', m => {
                    if(m.content == prefix + 'finalizar'){
                        // se for finalizar, para de coletar.
                        // para o coletor manualmente, pois o filter não é alcançável daqui.
                        collector.stop();                     
                    } else {
                        // se for mensagem, adiciona ao array.
                        this.arrayDescription.push(m.content)
                    }
                });
                collector.on('end', collected =>{
                    // ao encerrar o coletor de descrição, 
                    // inicia procedimento de finalização.
                    questionProcess(this, collected.first())
                    .then( response => getParticipants(response, collected.first()) )
                    .then( response => showRecord(response, collected.first()) )
                    // endProcess(this, collected.first());
                });
            }
            
        }
    }
});

