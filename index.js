require('http').createServer().listen(3000)

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

const Welcome = require("discord-welcome");

var version = (
  "1.1.5"
);

var creator = (
  "RoboCookie#1925"
);

var owner = (
  "**Unknown**"
);

Welcome(client, {
    privatemsg : "**Welcome to the Sinister Sages Discord Community**",
    publicmsg : "**Welcome to our community, Enjoy your staying and make sure to read the rules and follow them\n| @MEMBER |**",
    publicchannel : "welcome"
});

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  client.user.setActivity(`/help`);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`/help`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`/help`);
});

client.on("message", async message => {
  if(message.author.bot) return;
  
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(command === "yeet") {
    message.channel.send('**Yeetus Deletus**');
  }
  
  if(command === "say") {
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{}); 
    message.channel.send(`**Message: ${sayMessage} (requested by: ${message.author})**`);
  };
  
  if(command === "kick") {
    if(!message.member.roles.some(r=>["Admin", "Moderator", "Administrator", "Mod"].includes(r.name)) )
      return message.reply("**Sorry, you don't have permissions to use this**");
    
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("**Please mention a valid member of this server**");
    if(!member.kickable) 
      return message.reply("**I cannot kick this user! Do they have a higher role? Do I have kick permissions?**");
    
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "**No reason given**";
    
    await member.kick(reason)
      .catch(error => message.reply(`**Sorry ${message.author} I couldn't kick because of : ${error}**`));
    message.reply(`**${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}**`);

  }
  
  if(command === "ban") {
    if(!message.member.roles.some(r=>["Admin", "Moderator", "Administrator", "Mod"].includes(r.name)) )
      return message.reply("**Sorry, you don't have permissions to use this**");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("**Please mention a valid member of this server**");
    if(!member.bannable) 
      return message.reply("**I cannot ban this user! Do they have a higher role? Do I have ban permissions?**");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "**No reason given**";
    
    await member.ban(reason)
      .catch(error => message.reply(`**Sorry ${message.author} I couldn't ban because of : ${error}**`));
    message.reply(`**${member.user.tag} has been banned by ${message.author.tag} because: ${reason}**`);
  }
  
  if(command === "clear") {
    if(!message.member.hasPermission("MANAGE_MESSAGES") || !message.guild.owner) return message.channel.send("You dont have permission to use this command.");
    const deleteCount = parseInt(args[0], 10);
    
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`**Couldn't delete messages because of: ${error}**`));
  }

  if(command === 'mute') {
    if(!message.member.hasPermission("MANAGE_ROLES") || !message.guild.owner) return message.channel.send("You dont have permission to use this command.");

    if(!message.guild.me.hasPermission(["MANAGE_ROLES", "ADMINISTRATOR"])) return message.channel.send("I don't have permission to add roles!")

    let mutee = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!mutee) return message.channel.send("**Please supply a user to be muted**");

    let reason = args.slice(1).join(" ");
    if(!reason) reason = "**No reason given**"

    let muterole = message.guild.roles.find(r => r.name === "Muted")
    if(!muterole) {
        try{
            muterole = await message.guild.createRole({
                name: "Muted",
                color: "#514f48",
                permissions: []
            })
            message.guild.channels.forEach(async (channel, id) => {
                await channel.overwritePermissions(muterole, {
                    SEND_MESSAGES: false,
                    ADD_REACTIONS: false,
                    SEND_TTS_MESSAGES: false,
                    ATTACH_FILES: false,
                    SPEAK: false
                })
            })
        } catch(e) {
            console.log(e.stack);
        }
    }

    mutee.addRole(muterole.id).then(() => {
        message.delete()
        mutee.send(`**Hello, you have been in ${message.guild.name} for: ${reason}**`).catch(err => console.log(err))
        message.channel.send(`**${mutee.user.username} was successfully muted**`)
    })

    let embed = new Discord.RichEmbed()
    .setColor('#1420c9')
    .setAuthor(`${message.guild.name} logs`, message.guild.iconURL)
    .addField("Moderation:", "mute")
    .addField("Mutee:", mutee.user.username)
    .addField("Moderator:", message.author.username)
    .addField("Reason:", reason)
    .addField("Date:", message.createdAt.toLocaleString())

    let sChannel = message.guild.channels.find(c => c.name === "logs")
    sChannel.send(embed)
  }

  if(command === 'unmute') {
    if(!message.member.hasPermission("MANAGE_ROLES") || !message.guild.owner) return message.channel.send("You dont have permission to use this command.");

    if(!message.guild.me.hasPermission(["MANAGE_ROLES", "ADMINISTRATOR"])) return message.channel.send("I don't have permission to add roles!")

    let mutee = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!mutee) return message.channel.send("**Please supply a user to be muted**");

    let reason = args.slice(1).join(" ");
    if(!reason) reason = "**No reason given**"

    let muterole = message.guild.roles.find(r => r.name === "Muted")
    if(!muterole) return message.channel.send("There is no mute role to remove!")

    mutee.removeRole(muterole.id).then(() => {
        message.delete()
        mutee.send(`**Hello, you have been unmuted in ${message.guild.name} for: ${reason}**`).catch(err => console.log(err))
        message.channel.send(`**${mutee.user.username} was unmuted**`)
    })

    let embed = new Discord.RichEmbed()
    .setColor("#1420c9")
    .setAuthor(`${message.guild.name} logs`, message.guild.iconURL)
    .addField("Moderation:", "unmute")
    .addField("Mutee:", mutee.user.username)
    .addField("Moderator:", message.author.username)
    .addField("Reason:", reason)
    .addField("Date:", message.createdAt.toLocaleString())

    let sChannel = message.guild.channels.find(c => c.name === "logs")
    sChannel.send(embed)
  }

  if(command === 'botinfo') {
    let embed = new Discord.RichEmbed()
    .setColor("#1420c9")
    .setTitle("Botinfo:")
    .addField("Bot version:", `${version}`)
    .addField("Bot creator:", `${creator}`)
    .addField("Bot owner:", `${owner}`)
    .addBlankField()
    .addField("Latency:", `${message.createdTimestamp}ms`)
    .addField("API Latency:", `${Math.round(client.ping)}ms`)

    message.channel.send(embed);
  }

  if(command === 'serverinfo') {
    let embed = new Discord.RichEmbed()
    .setColor("#1420c9")
    .setTitle("Serverinfo:")
    .addField("Server name:", message.guild.name)
    .addField("Created at:", message.guild.createdAt)
    .addField("Members:", message.guild.memberCount)

    message.channel.send(embed);
  }

  if(command === 'userinfo') {
    let user = message.mentions.users.first() || message.author;

    let embed = new Discord.RichEmbed()
    .setAuthor(user.tag, user.displayAvatarURL)
    .setThumbnail(user.avatarURL)
    .setColor("#1420c9")
    .addField('Username', user.username, true)
    .addField('Discord tag', `#${user.discriminator}`, true)
    .addField('ID', user.id, true)
    .addField('Status', user.status, true)
    .addField('Registered', user.createdAt)

    message.channel.send(embed);
  }

  if(command === 'help') {
    let UserCommandEmbed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setTitle('User commands')
    .setFooter('Help')
    .setColor("#1420c9")
    .setTimestamp(message.createdAt)
    .addField('help', `Shows you a list of all the avaible command to normal users and moderators`)
    .addField('say', `Let the bot say something you want it to say, the bot also shows the name of the author`)
    .addField('ping', `Bot answers "Pong!"`)
    .addField('botinfo', `Gives you some info about the bot`)
    .addField('serverinfo', `Gives you some info about the server you're in`)
    .addField('userinfo', `Gives you some info about the user you tagged or about yourself if you didn't tag someone`)
    .addField('test-server', `Gives a link to WR's test server that's live at the moment`)
    .addField('report', `Reports the mentioned user for the given reason`)
    .addField('ticket', `Opens a ticket that you and the Support Staff can see`)
    .addField('avatar', `Send the avatar of the mentioned user`)

    message.channel.send(UserCommandEmbed);

    let ModCommandEmbed = new Discord.RichEmbed()
    .setAuthor(message.author.username)
    .setTitle('Moderator commands')
    .setFooter('Help')
    .setColor("#1420c9")
    .setTimestamp(message.createdAt)
    .addField('kick', `Kicks the mentioned user if you have the moderator or admin role`)
    .addField('ban', `Bans the mentioned user if you have the moderator or admin role`)
    .addField('softban', `Softbans a user (for 1 day, then the user can join again)`)
    .addField('unban', `Unbans a user from the server`)
    .addField('mute', `Mutes the mentioned user if you have the permission to manage roles`)
    .addField('unmute', `Unmutes the mentioned user if you have the permission to manage roles`)
    .addField('addrole', `Adds the mentioned role to the mentioned user`)
    .addField('removerole', `Removes the mentioned role from the mentioned user`)
    .addField('delticket', `Deletes ticket channel you're in`)

    message.channel.send(ModCommandEmbed);
  }

  if(command === 'test-server') {
    message.channel.send('**https://warrobots.fandom.com/wiki/Test_Server**');
  }

  if(command === 'addrole') {
    if(!message.member.hasPermission(["MANAGE_ROLES", "ADMINISTRATOR"])) return message.channel.send("You dont have permission to perform this command!")

    let rMember = message.mentions.members.first() || message.guild.members.find(m => m.user.tag === args[0]) || message.guild.members.get(args[0])
    if(!rMember) return message.channel.send("Please provide a user to add a role too.")
    let role = message.guild.roles.find(r => r.name == args[1]) || message.guild.roles.find(r => r.id == args[1]) || message.mentions.roles.first()
    if(!role) return message.channel.send("Please provide a role to add to said user.") 
    let reason = args.slice(2).join(" ")
    if(!reason) return message.channel.send("Please provide a reason")

    if(!message.guild.me.hasPermission(["MANAGE_ROLES", "ADMINISTRATOR"])) return message.channel.send("I don't have permission to perform this command.")

    if(rMember.roles.has(role.id)) {
        return message.channel.send(`${rMember.displayName}, already has the role!`)
    } else {
        await rMember.addRole(role.id).catch(e => console.log(e.message))
        message.channel.send(`The role, ${role.name}, has been added to ${rMember.displayName}.`)
    }

    let embed = new Discord.RichEmbed()
    .setColor("#1420c9")
    .setAuthor(`${message.guild.name} logs`, message.guild.iconURL)
    .addField("Moderation:", "Addrole")
    .addField("Mutee:", rMember.user.username)
    .addField("Moderator:", message.author.username)
    .addField("Reason:", reason)
    .addField("Date:", message.createdAt.toLocaleString())
    
        let sChannel = message.guild.channels.find(c => c.name === "logs")
        sChannel.send(embed)
  }

  if(command === 'removerole') {
    if(!message.member.hasPermission(["MANAGE_ROLES", "ADMINISTRATOR"])) return message.channel.send("You dont have permission to perform this command!")

    let rMember = message.mentions.members.first() || message.guild.members.find(m => m.user.tag === args[0]) || message.guild.members.get(args[0])
    if(!rMember) return message.channel.send("Please provide a user to remove a role too.")
    let role = message.guild.roles.find(r => r.name == args[1]) || message.guild.roles.find(r => r.id == args[1]) || message.mentions.roles.first()
    if(!role) return message.channel.send("Please provide a role to remove from said user.") 
    let reason = args.slice(2).join(" ")
    if(!reason) return message.channel.send("Please provide a reason")

    if(!message.guild.me.hasPermission(["MANAGE_ROLES", "ADMINISTRATOR"])) return message.channel.send("I don't have permission to perform this command.")

    if(!rMember.roles.has(role.id)) {
        return message.channel.send(`${rMember.displayName}, doesnt have the role!`)
    } else {
        await rMember.removeRole(role.id).catch(e => console.log(e.message))
        message.channel.send(`The role, ${role.name}, has been removed from ${rMember.displayName}.`)
    }

    let embed = new Discord.RichEmbed()
    .setColor("#1420c9")
    .setAuthor(`${message.guild.name} logs`, message.guild.iconURL)
    .addField("Moderation:", "Addrole")
    .addField("Mutee:", rMember.user.username)
    .addField("Moderator:", message.author.username)
    .addField("Reason:", reason)
    .addField("Date:", message.createdAt.toLocaleString())
    
        let sChannel = message.guild.channels.find(c => c.name === "logs")
        sChannel.send(embed)
  }

  if(command === 'unban') {
    if(!message.member.hasPermission(["BAN_MEMBERS", "ADMINISTRATOR"])) return message.channel.send("You dont have permission to perform this command!")

		
    if(isNaN(args[0])) return message.channel.send("You need to provide an ID.")
      let bannedMember = await bot.fetchUser(args[0])
          if(!bannedMember) return message.channel.send("Please provide a user id to unban someone!")
  
      let reason = args.slice(1).join(" ")
          if(!reason) reason = "**No reason given**"
  
      if(!message.guild.me.hasPermission(["BAN_MEMBERS", "ADMINISTRATOR"])) return message.channel.send("I dont have permission to perform this command!")|
      message.delete()
      try {
          message.guild.unban(bannedMember, reason)
          message.channel.send(`${bannedMember.tag} has been unbanned from the guild!`)
      } catch(e) {
          console.log(e.message)
      }
  
      let embed = new RichEmbed()
      .setColor(redlight)
      .setAuthor(`${message.guild.name} logs`, message.guild.iconURL)
      .addField("Moderation:", "unban")
      .addField("Moderated on:", `${bannedMember.username} (${bannedMember.id})`)
      .addField("Moderator:", message.author.username)
      .addField("Reason:", reason)
      .addField("Date:", message.createdAt.toLocaleString())
      
          let sChannel = message.guild.channels.find(c => c.name === "logs")
          sChannel.send(embed)
  }

  if(command === 'softban') {
    if(!message.member.hasPermission(["BAN_MEMBERS", "ADMINISTRATOR"])) return message.channel.send("You do not have permission to perform this command!")

    let banMember = message.mentions.members.first() || message.guild.members.get(args[0]) 
    if(!banMember) return message.channel.send("Please provide a user to ban!")
 
    let reason = args.slice(1).join(" ");
    if(!reason) reason = "**No reason given**"
 
    if(!message.guild.me.hasPermission(["BAN_MEMBERS", "ADMINISTRATOR"])) return message.channel.send("**I dont have permission to perform this command**")
 
    banMember.send(`Hello, you have been banned from ${message.guild.name} for: ${reason}`).then(() =>
    message.guild.ban(banMember, { days: 1, reason: reason})).then(() => message.guild.unban(banMember.id, { reason: "**Softban**"})).catch(err => console.log(err))
 
    message.channel.send(`**${banMember.user.tag}** has been banned`).then(m => m.delete(5000))
 
     let embed = new RichEmbed()
     .setColor("#1420c9")
     .setAuthor(`${message.guild.name} logs`, message.guild.iconURL)
     .addField("Moderation:", "ban")
     .addField("Mutee:", banMember.user.username)
     .addField("Moderator:", message.author.username)
     .addField("Reason:", reason)
     .addField("Date:", message.createdAt.toLocaleString())
     
         let sChannel = message.guild.channels.find(c => c.name === "logs")
         sChannel.send(embed)
  }

  if(command === 'report') {
	message.delete()

        let target = message.mentions.members.first() || message.guild.members.get(args[0])
        if(!target) return message.channel.send("**Please provide a valid user**").then(m => m.delete(15000))


        let reason = args.slice(1).join(" ")
        if(!reason) return message.channel.send(`Please provide a reason for reporting **${target.user.tag}**`).then(m => m.delete(15000))


        let sChannel = message.guild.channels.find(x => x.name === "reports")


        message.channel.send("**Your report has been filed to the staff team. Thank you**").then(m => m.delete(15000))
        sChannel.send(`**${message.author.tag}** has reported **${target.user.tag}** for **${reason}**.`).then(async msg => {
            await msg.react("✅")
            await msg.react("❌")
        })
  }
	
  if(command === 'delticket') {
	if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send('You don\'t have permission to Manage Messages');
	if (!message.channel.name.startsWith(`ticket-`)) return message.channel.send(`You can't use the close command outside of a ticket channel.`);

        message.channel.send(`Are you sure? Once confirmed, you cannot reverse this action!\nTo confirm, type \`/confirm\`. This will time out in 10 seconds and be cancelled.`)
            .then((m) => {
                message.channel.awaitMessages(response => response.content === '/confirm', {
                        max: 1,
                        time: 10000,
                        errors: ['time'],
                    })
                    .then((collected) => {
                        message.channel.delete();
                    })
                    .catch(() => {
                        m.edit('Ticket close timed out, the ticket was not closed.').then(m2 => {
                            m2.delete();
                        }, 3000);
                    });
            });
  }
	
  if(command === 'ticket') {
	const reason = message.content.split(" ").slice(1).join(" ");
        if (!message.guild.roles.exists("name", "Support Staff")) return message.channel.send(`This server doesn't have a \`Support Staff\` role made, so the ticket won't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
        if (message.guild.channels.exists("name", "ticket-" + message.author.id)) return message.channel.send(`You already have a ticket open.`);
        message.guild.createChannel(`ticket-${message.author.id}`, "text").then(c => {
            let role = message.guild.roles.find("name", "Support Staff");
            let role2 = message.guild.roles.find("name", "@everyone");
            c.overwritePermissions(role, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            c.overwritePermissions(role2, {
                SEND_MESSAGES: false,
                READ_MESSAGES: false
            });
            c.overwritePermissions(message.author, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            message.channel.send(`:white_check_mark: Your ticket has been created, #${c.name}.`);
            const embed = new Discord.RichEmbed()
                .setColor(0xCF40FA)
                .addField(`Hey ${message.author.username}`, `Please try explain why you opened this ticket with as much detail as possible. Our **Support Staff** will be here soon to help.`)
                .setTimestamp();
            c.send({
                embed: embed
            });
        }).catch(console.error);
  }
	
  if(command === 'avatar') {
    let msg = await message.channel.send("**doing some magic ...**");
    let target = message.mentions.users.first() || message.author;

    await message.channel.send({files: [
        {
            attachment: target.displayAvatarURL,
            name: "avatar.png"
        }
    ]});

    msg.delete();
  }
});

client.login(process.env.TOKEN);
