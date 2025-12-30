// --- RENDER WEB SERVER START ---
const http = require('http');
http.createServer((req, res) => {
  res.write("Bot is alive!");
  res.end();
}).listen(process.env.PORT || 8080);
// --- RENDER WEB SERVER END ---

const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Events
} = require('discord.js');

// Load environment variables from .env file
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const SHEETDB_API = 'https://sheetdb.io/api/v1/wsen6e04jyn0l';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Register slash command
const commands = [
  new SlashCommandBuilder()
    .setName('dkp')
    .setDescription('Check your DKP points privately'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    console.log('Refreshing slash commands...');
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('Slash command registered successfully');
  } catch (err) {
    console.error('Error registering commands:', err);
  }
})();

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'dkp') return;

  // flags: 64 = Ephemeral (Only you can see this)
  await interaction.deferReply({ flags: 64 });

  const ign = interaction.member?.nickname || interaction.user.username;

  try {
    // ignore_cache=1 ensures it pulls current numbers from Google Sheets
    const response = await fetch(
      `${SHEETDB_API}/search?sheet=DKP System&IGN=${encodeURIComponent(ign)}&ignore_cache=1`
    );

    const text = await response.text();

    if (!response.ok || text.startsWith('<')) {
      console.error('SheetDB error:', text);
      return interaction.editReply('⚠️ SheetDB error: DKP System sheet not found.');
    }

    const data = JSON.parse(text);

    if (!Array.isArray(data) || data.length === 0) {
      return interaction.editReply(`❌ No DKP record found for **${ign}** in the IGN column.`);
    }

    // Try both naming conventions just in case SheetDB reformats the header
    const biddingDKP = data[0]['Bidding_dkp'] || data[0]['Bidding DKP'] || "0";

    await interaction.editReply(`🤫 **${ign}**\nYour **Bidding DKP** is **${biddingDKP}**`);

  } catch (err) {
    console.error(err);
    await interaction.editReply('⚠️ Unexpected error fetching DKP data.');
  }
});

client.login(TOKEN);