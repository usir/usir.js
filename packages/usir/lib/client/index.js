module.exports = UsirClient;

function UsirClient(handler, format) {
  this.handler = handler;
  this.format = format;
}

UsirClient.prototype = {
  handlePacket: function(packet, queue) {
    var handler = this.handler;

    this.format.decode(packet).forEach(function(message) {
      var fn = handler[message.type] || handler.unhandledMessage;
      if (!fn) return console.warn('Unhandled message ' + JSON.stringify(message));

      return queue.push(function(cb) {
        fn.length == 1 ?
          cb(fn.apply(handler, [message])) :
          fn.apply(handler, [message, cb]);
      });
    });
  },
  handleInfo: function(message) {
    // TODO mutate the conn based on the message
    return message;
  },
  encodePacket: function(messages) {
    return this.format.encode(messages);
  }
};
