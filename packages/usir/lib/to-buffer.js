var blobToBuffer = require('blob-to-buffer');

module.exports = function(thing, cb) {
  if (thing instanceof Blob) return blobToBuffer(thing, cb);
  if (thing instanceof ArrayBuffer) return cb(null, new Buffer(thing));
  return console.log('UNHANDED BINARY TYPE', thing);
};
