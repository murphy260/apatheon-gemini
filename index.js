const { Client, GatewayIntentBits, Partials, ActivityType } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('./config.json');

// Gemini Kurulumu
const genAI = new GoogleGenerativeAI(config.geminiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // En hızlı ve stabil model

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.on('ready', () => {
    console.log(`[BOT AKTİF] ${client.user.tag} olarak giriş yapıldı!`);
    client.user.setActivity('Gemini AI ile sohbet', { type: ActivityType.Listening });
});

client.on('messageCreate', async (message) => {
    // Botun kendi mesajlarını veya etiketsiz mesajları görmezden gel
    if (message.author.bot || !message.mentions.has(client.user)) return;

    try {
        await message.channel.sendTyping();

        // Mesajdan bot etiketini temizle
        const prompt = message.content.replace(/<@!\d+>|<@\d+>/g, "").trim();
        
        if (!prompt) return message.reply("Efendim? Sana nasıl yardımcı olabilirim? 😊");

        // Gemini'den yanıt iste
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Discord limitine göre mesajı gönder (2000 karakter)
        await message.reply(text.slice(0, 2000));

    } catch (error) {
        console.error("Hata Oluştu:", error);
        await message.reply("Şu an bağlantı kuramıyorum, lütfen anahtarını veya internetimi kontrol et. 😵‍💫");
    }
});

client.login(config.tokenlar[0]);