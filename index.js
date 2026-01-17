const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize the client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

// Generate QR Code for authentication
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

// Client is ready
client.on('ready', () => {
    console.log('SafiraBot is ready!');
});

// Listening for messages
client.on('message', async message => {
    const chat = await message.getChat();
    const contact = await message.getContact();

    // LEITURA DE DADOS: Log de mensagens (mostra se é grupo ou privado)
    console.log(`[${chat.isGroup ? 'GROUP: ' + chat.name : 'PRIVATE'}] ${contact.pushname} (${message.from}): ${message.body}`);

    // AUTOMAÇÃO DE GRUPO
    // Exemplo: !info para ver dados do grupo
    if (chat.isGroup && message.body === '!info') {
        const description = chat.description || 'Sem descrição';
        await message.reply(`*Grupo:* ${chat.name}\n*Participantes:* ${chat.participants.length}\n*Descrição:* ${description}`);
    }

    // Exemplo: !todos para marcar todo mundo (CUIDADO COM SPAM)
    if (chat.isGroup && message.body === '!todos') {
        let text = '';
        let mentions = [];

        for (const participant of chat.participants) {
            const contact = await client.getContactById(participant.id._serialized);
            mentions.push(contact);
            text += `@${participant.id.user} `;
        }

        await chat.sendMessage(text, { mentions });
    }

    // ENVIAR PRA NÚMEROS (via comando)
    // Uso: !enviar 5511999999999 Olá, esta é uma mensagem automatica
    if (message.body.startsWith('!enviar ')) {
        const args = message.body.split(' ');
        const number = args[1]; // Pega o número
        const text = args.slice(2).join(' '); // Pega o resto da frase

        if (!number || !text) {
            await message.reply('Erro: Use !enviar <55+DDD+NUMERO> <MENSAGEM>');
            return;
        }

        // Formata o ID do whats (apenas numeros + @c.us)
        const finalNumber = number.replace(/\D/g, '');
        if (finalNumber.length < 10) {
            await message.reply('Número parece inválido. Certifique-se de usar o DDI e DDD (ex: 5511...)');
            return;
        }
        const chatId = `${finalNumber}@c.us`;

        try {
            await client.sendMessage(chatId, text);
            await message.reply(`Enviado para ${number}`);
        } catch (e) {
            console.error('Erro ao enviar:', e);
            await message.reply('Falha ao enviar. Verifique o log.');
        }
    }

    if (message.body === '!ping') {
        await message.reply('pong');
    }
});

// Start the client
client.initialize();
