const Discord = require('discord.js'),
    fs = require('fs'),
    client = new Discord.Client(),
    {
        prefix,
        token
    } = require('./config.json'),
    Enmap = require('enmap'),
    Captcha = require('./Captcha')

client.commands = new Discord.Collection()
client.captcha = new Enmap({
    name: "captcha",
    autoFetch: true,
    fetchAll: true
})


const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('guildMemberAdd', async member => {
    let data = client.captcha.ensure(member.guild.id, {
        text: null,
        size: null,
        color: null, // Dark codes default color
        opacity: null
    })

    let captchaImage = new Captcha({
        defaultText: data.text === "reset" ? null : data.text,
        textSize: data.size,
        textColor: data.color,
        decoyOpacity: data.opacity
    }).create()

    let embed = new Discord.MessageEmbed()
        .attachFiles([new Discord.MessageAttachment(captchaImage.image, "captcha.png")])
        .setImage('attachment://captcha.png')
        .setColor("GREEN")
        .setTitle("Captcha")
        .setDescription(`You are required to solve this captcha before joining the server!
        You will be prompted with the corresponding captcha. 
        To solve the captcha, please solve send the words you see in the following image.
        
        *Keep in mind this captcha is CASE-SENSITIVE*
        
        **YOUR CAPTCHA**:`)

    await member.send(embed).catch(e => {
        console.log("Member has DM's closed")
    })
    
    let dm = await member.user.createDM()
    let col = await dm.awaitMessages(m => m.author.id === member.user.id, {
        time: 2 * 60 * 1000, // 2 minutes
        max: 1,
        errors: ['time']
    })
    let content = col.first().content
    if(captchaImage.text === content) {
        member.user.send("You have completed the captcha!")
        /* await member.roles.add('roleId').catch(e => {
            console.log("Could not add role to " + member.user.tag)
        }) */
    } else {
        await member.send(new Discord.MessageEmbed()
            .setTitle("CAPTCHA FAILED")
            .setDescription(`You failed the captcha, join the server to try again!\n*Keep in mind the captcha is CASE SENSITIVE!*`)
            .setColor("RED")
            .setFooter(client.user.username, client.user.displayAvatarURL())
            .setAuthor(member.user.tag, member.user.displayAvatarURL()))
        await member.kick('Failed captcha').catch(e => {
            console.log(`Could not kick ${member.user.tag}`)
        })
    }
})

client.on('ready', () => {
    console.clear()
    console.log(`${client.user.tag} is online serving ${client.guilds.cache.reduce((a, v) => a + v.memberCount, 0)} members`)
    client.user.setActivity("Some status", {
        type: "PLAYING"
    })
})

client.on('message', async message => {

    if (message.author.bot || !message.content.startsWith(prefix)) return;
    if (message.guild) client.captcha.ensure(message.guild.id, {
        text: null,
        size: null,
        color: null,
        opacity: null
    })
    let args = message.content.trim().slice(prefix.length).trim().split(/\s+/g)
    let command = args.shift().toLowerCase()


    if (!command) return;
    try {
        let cmd = client.commands.get(command)
        await cmd.execute(message, args, client)
    } catch (e) {
        console.log(e)
        message.channel.send("An error occured, please try again")
    }

})

client.login(token)