const crypto = require('crypto')
global.crypto = crypto.webcrypto

const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys')

const Pino = require('pino')

let pairingRequested = false

async function startBot () {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: Pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['★VĮŁŁĄŁƁĄ★ bot', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  // ⏳ PEDIR CÓDIGO AL INICIAR
  if (!sock.authState.creds.registered && !pairingRequested) {
    pairingRequested = true

    setTimeout(async () => {
      try {
        const phoneNumber = '595993633752' // 👈 TU NÚMERO SIN +
        const code = await sock.requestPairingCode(phoneNumber)
        console.log('📲 CÓDIGO DE VINCULACIÓN:', code)
      } catch (err) {
        console.log('❌ Error al generar código:', err.message)
      }
    }, 4000)
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      console.log('✅ BOT CONECTADO CORRECTAMENTE')
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log('⚠️ Conexión cerrada. Reintentando:', shouldReconnect)

      if (shouldReconnect) startBot()
    }
  })
}

startBot()
