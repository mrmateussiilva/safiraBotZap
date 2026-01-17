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
    console.log('Message received:', message.body);

    if (message.body === '!ping') {
        await message.reply('pong');
    }

    if (message.body.toLowerCase() === 'oi' || message.body.toLowerCase() === 'olá') {
        await message.reply('Olá! Eu sou a Safira, seu bot pessoal via Bun + WhatsApp Web JS.');
    }
});

// Start the client
client.initialize();
