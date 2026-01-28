// ====== FIX CRYPTO PARA NODE 18+ ======
const crypto = require('crypto')
global.crypto = crypto.webcrypto

// ====== IMPORTS ======
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys')

const Pino = require('pino')

// ====== BOT ======
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

  // ====== GUARDAR SESIÓN ======
  sock.ev.on('creds.update', saveCreds)

  // ====== CONEXIÓN ======
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update

    // ---- CONECTADO ----
    if (connection === 'open') {
      console.log('✅ BOT CONECTADO')

      // GENERAR CÓDIGO SOLO SI NO ESTÁ REGISTRADO
      if (!sock.authState.creds.registered) {
        const phoneNumber = '595993633752' // 👈 TU NÚMERO SIN +
        const code = await sock.requestPairingCode(phoneNumber)
        console.log('📲 CÓDIGO DE VINCULACIÓN:', code)
      }
    }

    // ---- DESCONECTADO ----
    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log('⚠️ Conexión cerrada. Reintentando:', shouldReconnect)

      if (shouldReconnect) {
        startBot()
      }
    }
  })
}

// ====== INICIAR BOT ======
startBot()
