var msgpack = require('msgpack-lite');
var blobToBuffer = require('blob-to-buffer');
var messages = require('../message');
var client = messages.client;
var server = messages.server;

module.exports = function(hook) {
  var codec = msgpack.createCodec({});

  var e = encode.bind(null, codec);
  var d = decode.bind(null, codec);

  var format = {
    encode: e,
    decode: d,
    codec: codec
  };

  Object.keys(client).forEach(handleKey.bind(null, format, client));
  Object.keys(server).forEach(handleKey.bind(null, format, server));

  hook && hook(codec, e, d);

  return format;
};

function encode(codec, data) {
  return msgpack.encode(data, {codec: codec});
}

function decode(codec, data) {
  return msgpack.decode(data, {codec: codec});
}

function handleKey(format, obj, item) {
  var constructor = obj[item];
  var keys = constructor.keys;
  var codec = format.codec;

  codec.addExtPacker(constructor.id, constructor, [
    function(inst) {
      return inst.toArray();
    },
    format.encode
  ]);

  codec.addExtUnpacker(constructor.id, [
    format.decode,
    constructor.fromArray
  ]);
}
