var EventEmitter = require('events');
var WebSocket = require('websocket').w3cwebsocket;
var messages = require('usir/lib/message');
var toBuffer = require('usir/lib/to-buffer');
var client = messages.client;
var server = messages.server;

module.exports = UsirTransportWebsocketClientConn;

function UsirTransportWebsocketClientConn(url, opts, accepts, createConn) {
  this._handleMessage = this._handleMessage.bind(this);
  this._url = url;
  this._opts = opts || {};
  this._accepts = accepts;
  this._createConn = createConn;
  this._callBuffer = [];
  this._emitter = new EventEmitter;

  this._open();
}

UsirTransportWebsocketClientConn.prototype = {
  mount: function(instance, path, state, props) {
    var message = client.mount(instance, path, state, props);
    this._call(message);
  },

  unmount: function(instance) {
    var message = client.unmount(instance);
    this._call(message);
  },

  authenticate: function(instance, method, token) {
    var message = client.authenticate(instance, method, token);
    this._call(message);
  },

  action: function(instance, ref, body) {
    var message = client.action(instance, ref, body);
    this._call(message);
  },

  on: function(event, cb) {
    var emitter = this._emitter;
    emitter.on(event, cb);
    return function off() {
      emitter.removeListener(event, cb);
    };
  },

  isConnected: function() {
    return !!this._client;
  },

  _call: function(message) {
    var protocol = this._protocol;
    protocol ?
      protocol.dispatch.send(message) :
      this._callBuffer.push(message);
    if (!this._client) this._open();
  },

  _open: function() {
    var self = this;
    var url = self._url;
    var opts = self._opts;
    var accepts = self._accepts;
    var createConn = self._createConn;
    var c = self._client = new WebSocket(url, accepts);
    var emitter = self._emitter;
    var protocol;

    c.addEventListener('open', function() {
      protocol = self._protocol = createConn(self, c.protocol || '', opts);
      protocol.dispatch.oninfo = self._handleMessage;

      self._callBuffer.forEach(function(message) {
        self._call(message);
      });
      self._callBuffer = [];

      if (opts.buffer) {
        protocol.buffer = opts.buffer;
        protocol.dispatch.sendTimeout();
      }
    });

    c.addEventListener('message', function(evt) {
      toBuffer(evt.data, function(err, data) {
        self._handleReply(protocol.handlePacket(data));
      });
    });

    c.addEventListener('close', function(evt) {
      self._callBuffer = (protocol && protocol.terminate()) || [];
      delete self._client;
      delete self._protocol;
      emitter.emit('close');
    });

    c.addEventListener('error', function(err) {
      emitter.emit('error', err);
    });
  },
  _handleMessage: function(message) {
    this._handleReply(this._protocol.handleInfo(message));
  },
  _handleReply: function(data) {
    var client = this._client;
    if (!data) return;
    if (client && client.readyState === 1) return client.send(data);
    self._callBuffer.push(data);
    self._open();
  },
};
