module.exports = UsirDispatch;

var TIMEOUT = {timeout: true};

function UsirDispatch() {
  this.pending = 0;
}

UsirDispatch.prototype = {
  call: function(fn) {
    var called = false;
    this.pending++;
    fn(function(response) {
      if (called) return;
      called = true;
      this.pending--;
      if (response) this.send(response);
    }.bind(this));
  },
  send: function(message) {
    this.oninfo(message);
  },
  sendTimeout: function() {
    this.send(TIMEOUT);
  },
  handleInfo: function(message) {
    return message;
  },
  isTimeout: function(message) {
    return message === TIMEOUT;
  },
  oninfo: function(info) {
    console.warn('Unhandled info ' + JSON.stringify(info));
  },
  size: function() {
    return this.pending;
  }
};
