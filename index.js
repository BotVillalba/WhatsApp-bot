import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import P from "pino";

let sock;
let isConnecting = false;

async function startBot() {
  if (isConnecting) return;
  isConnecting = true;

  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["★VĮŁŁĄŁƁĄ★", "Chrome", "1.0"]
  });

  // 🔑 Código de 8 dígitos SOLO si no está registrado
  if (!state.creds.registered) {
    const phoneNumber = process.env.PHONE_NUMBER;595993633752 // ej: 5959XXXXXXXX
    const code = await sock.requestPairingCode(phoneNumber);
    console.log("🔑 CÓDIGO DE VINCULACIÓN:", code);
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("✅ WhatsApp conectado correctamente");
      isConnecting = false;
    }

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason === DisconnectReason.loggedOut) {
        console.log("❌ Sesión cerrada. Borrando auth...");
        isConnecting = false;
      } else {
        console.log("🔄 Reconectando en 5 segundos...");
        isConnecting = false;
        setTimeout(startBot, 5000);
      }
    }
  });
}

startBot();
