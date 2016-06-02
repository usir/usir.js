var Dispatch = require('../dispatch');
var Queue = require('../queue');

module.exports = UsirProtocolStateful;

function UsirProtocolStateful(conn, dispatch, queue, opts) {
  this.conn = conn;
  this.dispatch = dispatch || new Dispatch();
  this.queue = queue || new Queue();
  opts = opts || {};
  this.maxBufferSize = opts.maxBufferSize || 10;
  this.maxTimeout = opts.maxTimeout || 10;
  this.buffer = [];
}

UsirProtocolStateful.createProtocol = function(conn, opts) {
  return new UsirProtocolStateful(conn, null, null, opts);
};

UsirProtocolStateful.prototype = {
  handlePacket: function(packet) {
    this.conn.handlePacket(packet, this.queue);
    this._call();
    return this._reply();
  },
  handleInfo: function(message) {
    if (this.dispatch.isTimeout(message)) return this._sendPacket();
    this._handleMessage(message);
    this._call();
    return this._reply();
  },
  terminate: function() {
    this.dispatch.terminate();
    this._clearTimeout();
    var buffer = this.buffer;
    return buffer.length ? buffer : null;
  },

  _call: function() {
    var dispatch = this.dispatch;
    var queue = this.queue;
    var call;
    while((call = queue.pop(dispatch.size()))) {
      dispatch.call(call);
    }
  },
  _handleMessage: function(message) {
    message = this.dispatch.handleInfo(message);
    if (message) this.buffer.push(this.conn.handleInfo(message));
  },
  _reply: function() {
    var buffer = this.buffer;
    var dispatch = this.dispatch;

    if (buffer.length > this.maxBufferSize) return this._sendPacket();

    if (buffer.length !== 0 && !this._timeout) this._timeout = setTimeout(function() {
      dispatch.sendTimeout();
    }, this.maxTimeout);

    return null;
  },
  _sendPacket: function() {
    var buffer = this.buffer;
    this.buffer = [];
    this._clearTimeout();
    return this.conn.encodePacket(buffer);
  },
  _clearTimeout: function() {
    clearTimeout(this._timeout);
    delete this._timeout;
  }
};
