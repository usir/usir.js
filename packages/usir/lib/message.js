exports = module.exports = {
  client: {
    mount: id(function ClientMount() {
      if (!(this instanceof ClientMount)) return new ClientMount.fromArray(arguments);
    }, 0, ['instance', 'path', 'state', 'props']),
    unmount: id(function ClientUnmount() {}, 1, ['instance']),
    authenticate: id(function ClientAuthenticate() {}, 2, ['instance', 'method', 'token']),
    action: id(function ClientAction() {
      if (!(this instanceof ClientAction)) return new ClientAction.fromArray(arguments);
    }, 3, ['instance', 'ref', 'body'])
  },
  server: {
    mounted: id(function ServerMounted() {}, 4, ['instance', 'path', 'state', 'body']),
    unmounted: id(function ServerMounted() {}, 5, ['instance']),
    notFound: id(function ServerNotFound() {}, 6, ['instance', 'path']),
    authenticationRequired: id(function ServerAuthenticationRequired() {}, 7, ['instance', 'methods']),
    authenticationInvalid: id(function ServerAuthenticationInvalid() {}, 8, ['instance', 'method']),
    unauthorized: id(function ServerUnauthorized() {}, 9, ['instance', 'info']),
    authenticationAcknowledged: id(function ServerAuthenticationAcknowledged(){}, 10, ['instance', 'method']),
    actionAcknowledged: id(function ServerActionAcknowledged() {}, 11, ['instance', 'ref']),
    actionInvalid: id(function ServerActionInvalid() {}, 12, ['instance', 'ref', 'info']),
    error: id(function ServerError() {}, 13, ['instance', 'path', 'info'])
  }
};

var types = {};

Object.keys(exports.client).forEach(setType.bind(null, exports.client));
Object.keys(exports.server).forEach(setType.bind(null, exports.server));

function setType(obj, key) {
  types[obj[key].id] = key;
}

function id(constructor, id, keys) {
  constructor.id = id;
  constructor.fromArray = function(arr) {
    var obj = new constructor();
    for (var i = 0, key; i < keys.length; i++) {
      key = keys[i];
      obj[key] = arr[i];
    }
    return obj;
  };

  var proto = constructor.prototype;

  proto.toArray = function() {
    return keys.map(function(key) {
      var value = this[key];
      if (typeof value === 'undefined') value = null;
      return value;
    }.bind(this));
  };

  Object.defineProperty(proto, 'type', {
    get: function() {
      return types[id];
    }
  });

  return constructor;
}
