const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys')

const Pino = require('pino')
const express = require('express')

const app = express()
const PORT = process.env.PORT || 3000

// Servidor web (Railway necesita esto)
app.get('/', (req, res) => {
  res.send('🤖 WhatsApp Bot activo')
})

app.listen(PORT, () => {
  console.log(`🌐 Servidor web activo en puerto ${PORT}`)
})

async function startBot () {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: Pino({ level: 'silent' }),
    printQRInTerminal: false
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, pairingCode } = update

    if (pairingCode) {
      console.log('📲 CÓDIGO DE VINCULACIÓN:', pairingCode)
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log('⚠️ Conexión cerrada. Reintentando:', shouldReconnect)

      if (shouldReconnect) startBot()
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp conectado correctamente')
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const texto =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      ''

    if (texto.toLowerCase() === 'menu') {
      await sock.sendMessage(msg.key.remoteJid, {
        text: '🤖 Bot activo\n\nEscribí *menu* para probar'
      })
    }
  })
}

startBot()
