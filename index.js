const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys')
const Pino = require('pino')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')

  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: Pino({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['★VĮŁŁĄŁƁĄ★ bot', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  // 👉 FORZAR CÓDIGO DE VINCULACIÓN
  if (!sock.authState.creds.registered) {
    const phoneNumber = '595993633752' // ← TU NÚMERO CON CÓDIGO PAÍS, SIN +
    setTimeout(async () => {
      const code = await sock.requestPairingCode(phoneNumber)
      console.log('📲 CÓDIGO DE VINCULACIÓN:', code)
    }, 3000)
  }

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    }

    if (connection === 'open') {
      console.log('✅ BOT CONECTADO A WHATSAPP')
    }
  })
}

startBot()
