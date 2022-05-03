require("dotenv").config();

const { Client, Intents } = require("discord.js");
const fs = require("fs");

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    "GUILD_PRESENCES",
    "GUILD_MEMBERS",
  ],
});

client.once("ready", async () => {
  let guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
  const members = await guild.members.fetch();
  const role = guild.roles.cache.find(
    (r) => r.id === process.env.DISCORD_REGISTER_ROLE
  );

  const unknownUsers = [];
  const tags = fs.readFileSync("./tags.txt", "utf-8");
  const tagsPromises = tags.split(/\r?\n/).map(async (tag) => {
    tag = tag.trim();
    if (tag === "") {
      return;
    }
    const member = members.find((member) => member.user.tag === tag);
    if (!member) {
      console.log(`Could not find the user ${tag}`);
      unknownUsers.push(tag);
      return;
    }
    const new_role = await member.roles.add(role);
    console.log(`Role added: ${new_role.user.tag}`);
    return;
  });

  await Promise.all(tagsPromises);
  console.log("\n");
  console.log(
    `Role assignment completed.\nThe following tags could not be set:\n- ${unknownUsers.join(
      "\n- "
    )}`
  );

  process.exit();
});

client.login(process.env.DISCORD_TOKEN);
