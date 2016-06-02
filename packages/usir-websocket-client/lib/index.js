var Client = require('usir/lib/client');
var statefulProtocol = require('usir/lib/protocol/stateful').createProtocol;
var UsirTransportWebsocketClientConn = require('./conn');
var jsonFormat = require('usir/lib/format/json');

module.exports = UsirTransportWebsocketClient;

function UsirTransportWebsocketClient(formats, handler, createProtocol) {
  this.formats = formats;
  this.handler = handler;
  this.accepts = Object.keys(formats).map(function(accept) {
    return 'usir|' + accept;
  });
  this.createProtocol = createProtocol || statefulProtocol;
  this._init = this._init.bind(this);
}

UsirTransportWebsocketClient.open = function(url, opts, formats) {
  opts = opts || {};
  formats = formats || opts.formats || {};
  var client = new UsirTransportWebsocketClient(formats, opts.handler, opts.createProtocol);
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

    var format = this.formats[wsprotocol.replace('usir|', '')] || jsonFormat;

    var conn = new Client(handler, format);
    return this.createProtocol(conn, opts);
  }
};
