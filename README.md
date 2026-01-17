# SafiraBotZap

Um chatbot simples para WhatsApp, construído com Node.js (whatsapp-web.js) e executado com Bun.

## Pré-requisitos

- Node.js (necessário para o whatsapp-web.js e Puppeteer)
- Bun
- pnpm

## Instalação

As dependências já foram instaladas. Se precisar reinstalar:

```bash
pnpm install
# Instalar o Chrome para o Puppeteer (se necessário)
npx puppeteer browsers install chrome
```

## Como rodar

Para iniciar o bot:

```bash
pnpm start
```

Ou diretamente com bun:

```bash
bun index.js
```

## Uso

1. Ao iniciar, um QR Code aparecerá no terminal.
2. Abra o WhatsApp no seu celular, vá em "Aparelhos Conectados" e escaneie o código.
3. O bot estará pronto quando aparecer "SafiraBot is ready!".
4. Comandos disponíveis:
   - `!ping` -> Responde "pong"
   - `oi` ou `olá` -> Apresentação do bot
