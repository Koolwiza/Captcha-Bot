module.exports = {
    name: "ping",
    description: "Send your ping",
    usage: "ping",
    async execute(message, args, client) {
        let msg = await message.channel.send("Pinging...")
        let clientPing = client.ws.ping
        let latency = msg.createdTimestamp - message.createdTimestamp
        msg.edit(`API Latency: ${clientPing}\nMessage Latency: ${latency}`)
    }
}