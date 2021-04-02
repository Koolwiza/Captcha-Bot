const {
    Permissions: {
        FLAGS: {
            MANAGE_GUILD
        }
    }
} = require('discord.js')

module.exports = {
    name: "config",
    description: "Configure guild settings",
    usage: "config <type> [value]",
    async execute(message, [type, ...args], client) {
        if (!message.member.permissions.has(MANAGE_GUILD)) return;
        let types = ['show', ...Object.keys(client.captcha.get(message.guild.id))]
        if (!type) return message.channel.send("Please provide a type. \n" + types.join(', '))
        if (!types.includes(type)) return message.channel.send("Please provide a valid type.\n" + types.join(', '))

        if (type === "show") {
            let output = `\`\`\`asciidoc\n== Captcha Configurations ==\n`
            let ac = client.captcha.get(message.guild.id)
            let props = Object.keys(client.captcha.get(message.guild.id))
            const longest = props.reduce((long, str) => Math.max(long, str.length), 0)
            props.forEach(c => {
                if (c instanceof Array) c = c.join(", ")
                if (ac[c] === null) {
                    output += `${c}${" ".repeat(longest - c.length)} :: None\n`
                } else {
                    output += `${c}${" ".repeat(longest - c.length)} :: ${ac[c]}\n`
                }

            })
            return message.channel.send(output + "```");
        } else if (type === "role") {
            let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || message.guild.roles.cache.find(c => c.name.toLowerCase().includes(args.join(" ").toLowerCase()))
            client.captcha.set(message.guild.id, role.id, "role")
        } else {
            client.captcha.set(message.guild.id, args.join(" "), type)
            message.channel.send(`I have set \`${type}\` as \`${args.join(" ")}\`. \n \\**Keep in mind some keys have certain params.*\`\`\`Text: String (To the string to a randomized one, set it to "reset")\nSize: Number (will be parsed into number in system)\nColor: Hex (Can start with or without #)\nOpacity: Number (will be parsed into number in system))\`\`\``)
        }
    }
}