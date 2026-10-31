const { Client, IntentsBitField } = require('discord.js');
const admin = require('firebase-admin');

// 1. Inicializa o Robô com permissões para ler e enviar mensagens
const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

// 2. Configura a conexão segura com o seu Firebase Realtime Database
// Ele vai ler as credenciais de forma oculta pelo painel do Render por segurança
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        databaseURL: "https://firebaseio.com"
    });
}
const db = admin.database();

// 3. Alerta no painel quando o robô ligar com sucesso
bot.once('ready', () => {
    console.log(`🤖 O Bot ${bot.user.tag} está online e pronto!`);
});

// 4. Lógica dos comandos do chat do Discord
bot.on('messageCreate', async (message) => {
    // Evita que o robô responda a si mesmo ou a outros robôs
    if (message.author.bot) return;

    // Comando para gerar o código de uso único
    if (message.content.toLowerCase() === '!codigo') {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigoGerado = '';
        for (let i = 0; i < 6; i++) {
            codigoGerado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }

        try {
            // Salva o token gerado direto na pasta do seu Firebase
            const ref = db.ref('codigos_gerados');
            await ref.push({
                codigo: codigoGerado,
                geradoEm: admin.database.ServerValue.TIMESTAMP
            });

            // Responde no chat do Discord de forma confirmada
            message.reply(`🔑 **Novo Código Gerado:** \`${codigoGerado}\`\n*Ele já está ativo no seu site e será apagado após o uso único!*`);
        } catch (error) {
            console.error("Erro ao salvar no Firebase:", error);
            message.reply("❌ Erro ao tentar salvar o código no banco de dados.");
        }
    }
});

// Liga o robô usando o Token salvo oculto
bot.login(process.env.DISCORD_TOKEN);
