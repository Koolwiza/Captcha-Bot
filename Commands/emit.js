module.exports = {
    name: "emit",
    description: "Emit an event",
    usage: "ping",
    async execute(message, args, client) {
        client.emit(args[0], message.member)
    }
}