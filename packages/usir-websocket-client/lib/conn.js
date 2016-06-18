var inherits = require('util').inherits;
var EventEmitter = require('events');
var WebSocket = require('websocket').w3cwebsocket;
var backoff = require('backoff-func').create;

module.exports = UsirTransportWebsocketClientConn;

function UsirTransportWebsocketClientConn(url, opts, accepts, createConn) {
  this._handleMessage = this._handleMessage.bind(this);
  this._open(url, opts, accepts, createConn);
  this._callBuffer = [];
  EventEmitter.call(this);
}

UsirTransportWebsocketClientConn.prototype = {
  resolve: function(path) {
    // TODO create the message
    var message = [0, path];
    this._call(message);
  },

  authenticate: function(method, token) {
    // TODO create the message
    var message = {method: method, token: token, type: "authenticate"};
    this._call(message);
  },

  sendMessage: function(path, affordance, body) {
    // TODO create the message
    var message = {path: path, affordance: affordance, body: body, type: "sendMessage"};
    this._call(message);
  },

  setLocales: function(locales) {
    // TODO create the message
    var message = {locales: locales, type: "setLocales"};
    this._call(message);
  },

  _call: function(message) {
    var protocol = this._protocol;
    protocol ?
      protocol.dispatch.send(message) :
      this._callBuffer.push(message);
  },

  _open: function(url, opts, accepts, createConn, buffer) {
    var self = this;
    var c = self._client = new WebSocket(url, accepts);
    var protocol;

    c.addEventListener('open', function() {
      protocol = self._protocol = createConn(self, c.protocol || '', opts);
      protocol.dispatch.oninfo = self._handleMessage;

      self._callBuffer.forEach(function(message) {
        self._call(message);
      });
      self._callBuffer = [];

      if (buffer) {
        protocol.buffer = buffer;
        protocol.dispatch.sendTimeout();
      }
    });

    c.addEventListener('message', function(evt) {
      self._handleReply(protocol.handlePacket(evt.data));
    });

    c.addEventListener('close', function(evt) {
      console.log(evt);
      var buffer = protocol ? protocol.terminate() : null;
      // TODO only reconnect on errors
      if (opts.reconnect !== false) self._reconnect(url, opts, accepts, createConn, buffer);
    });

    c.addEventListener('error', function(err) {
      self.emit('error', err);
    });
  },
  _handleMessage: function(message) {
    this._handleReply(this._protocol.handleInfo(message));
  },
  _handleReply: function(data) {
    // TODO check that the connection is open
    if (data) this._client.send(data);
  },
  _reconnect: function(url, opts, accepts, createConn, buffer) {
    var self = this;
    (self._b = self._b || backoff(opts.reconnect))(function() {
      self._open(url, opts, accepts, createConn, buffer);
    });
  }
};

inherits(UsirTransportWebsocketClientConn, EventEmitter);
