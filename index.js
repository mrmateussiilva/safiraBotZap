const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize the client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

// Patch para corrigir erro 'markedUnread' em versões recentes do WhatsApp Web
client.on('ready', async () => {
    console.log('SafiraBot is ready!');
    // Tenta injetar o patch se a página recarregar ou na inicialização
    try {
        await client.pupPage.evaluate(() => {
            if (window.WWebJS && !window.WWebJS.sendSeen) {
                window.WWebJS.sendSeen = async () => { return true; };
            }
        });
    } catch (e) { }
});

// Generate QR Code for authentication
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});



// Listening for all messages (including yours)
client.on('message_create', async message => {
    const chat = await message.getChat();
    const contact = await message.getContact();

    // LEITURA DE DADOS: Log de mensagens
    console.log(`[${chat.isGroup ? 'GROUP: ' + chat.name : 'PRIVATE'}] ${contact.pushname || 'Você'} (${message.from}): ${message.body}`);

    // Evitar que o bot responda a ele mesmo em loop infinito (apenas para respostas simples)
    // Mas PERMITIR que você (dono) execute comandos
    if (message.fromMe && !message.body.startsWith('!')) {
        return;
    }

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
            // Updated: Mentions should be an array of strings (IDs) or just passed directly if supported, 
            // but the error suggests the contact object issue. 
            // The library now prefers IDs for mentions in some versions, or re-fetching contacts can be tricky.
            // Let's use the safer approach: just push the ID string or the Contact object but ensuring it's valid.
            // However, the error "Mentions with an array of Contact are now deprecated" is a specific warning.
            // The crash "TypeError: Cannot read properties of undefined (reading 'markedUnread')" is separate, likely internal library issue with 'sendSeen'.

            // Fix 1: Use IDs for mentions if possible, or keep contacts but ensure they are fully loaded.
            // Actually, the deprecation warning says "Mentions with an array of Contact are now deprecated", so we should simply NOT pass the Contact object array if we can avoid it, 
            // OR ignore it if it's just a warning. But the flush came right after.

            // Let's try passing the serialized IDs which is often safer/cleaner.
            mentions.push(participant.id._serialized);
            text += `@${participant.id.user} `;
        }

        // Fix 2: Wrap verify into try-catch to avoid crashing the bot on library internal errors
        try {
            await chat.sendMessage(text, { mentions });
        } catch (err) {
            console.log('Erro ao enviar !todos:', err);
        }
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
