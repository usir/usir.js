module.exports = UsirQueue;

function UsirQueue(limit) {
  this._pending = [];
  this.limit = limit === undefined ? 10 : (limit || Infinity);
}

UsirQueue.prototype = {
  push: function(fn) {
    this._pending.push(fn);
    return this;
  },
  pop: function(count) {
    return count < this.limit ?
      this._pending.shift() :
      null;
  }
};
