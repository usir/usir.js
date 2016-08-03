var Client = require('usir/lib/client');
var statefulProtocol = require('usir/lib/protocol/stateful').createProtocol;
var UsirTransportWebsocketClientConn = require('./conn');
var defaultFormat = require('usir/lib/format/msgpack');

module.exports = UsirTransportWebsocketClient;

function UsirTransportWebsocketClient(handler, formats, opts) {
  this.formats = formats;
  this.handler = handler;
  this.accepts = Object.keys(formats).map(function(accept) {
    return 'usir|' + accept;
  });
  this.createProtocol = opts.createProtocol || statefulProtocol;
  this._init = this._init.bind(this);
}

UsirTransportWebsocketClient.open = function(url, handler, formats, opts) {
  opts = opts || {};
  var client = new UsirTransportWebsocketClient(handler, formats, {});
  return client.open(url, opts);
};

UsirTransportWebsocketClient.prototype = {
  open: function(url, opts) {
    opts = opts || {};
    return new UsirTransportWebsocketClientConn(url, opts, this.accepts, this._init);
  },
  _init: function(child, wsprotocol, opts) {
    var handler = opts.handler || this.handler || {
      unhandledMessage: function(message) {
        child.emit(message.type, message);
      }
    };

    var format = this.formats[wsprotocol.replace('usir|', '')] || defaultFormat();

    var conn = new Client(handler, format, opts);
    return this.createProtocol(conn);
  }
};
