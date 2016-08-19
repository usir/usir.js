exports = module.exports = {
  client: {
    mount: id(function ClientMount() {
      if (!(this instanceof ClientMount)) return new ClientMount.fromArray(arguments);
    }, 0, ['instance', 'path', 'state', 'props']),
    unmount: id(function ClientUnmount() {
      if (!(this instanceof ClientUnmount)) return new ClientUnmount.fromArray(arguments);
    }, 1, ['instance']),
    authenticate: id(function ClientAuthenticate() {
      if (!(this instanceof ClientAuthenticate)) return new ClientAuthenticate.fromArray(arguments);
    }, 2, ['instance', 'method', 'token']),
    action: id(function ClientAction() {
      if (!(this instanceof ClientAction)) return new ClientAction.fromArray(arguments);
    }, 3, ['instance', 'ref', 'body']),
    callResponse: id(function ClientCallResponse() {
      if (!(this instanceof ClientCallResponse)) return new ClientCallResponse.fromArray(arguments);
    }, 4, ['instance', 'ref', 'data']),
    callError: id(function ClientCallError() {
      if (!(this instanceof ClientCallError)) return new ClientCallError.fromArray(arguments);
    }, 5, ['instance', 'ref', 'message']),
  },
  server: {
    mounted: id(function ServerMounted() {}, 8, ['instance', 'path', 'state', 'body']),
    unmounted: id(function ServerMounted() {}, 9, ['instance']),
    notFound: id(function ServerNotFound() {}, 10, ['instance', 'path']),
    authenticationRequired: id(function ServerAuthenticationRequired() {}, 11, ['instance', 'methods']),
    authenticationInvalid: id(function ServerAuthenticationInvalid() {}, 12, ['instance', 'method']),
    unauthorized: id(function ServerUnauthorized() {}, 13, ['instance', 'info']),
    authenticationAcknowledged: id(function ServerAuthenticationAcknowledged(){}, 14, ['instance', 'method']),
    actionAcknowledged: id(function ServerActionAcknowledged() {}, 15, ['instance', 'ref']),
    actionInvalid: id(function ServerActionInvalid() {}, 16, ['instance', 'ref', 'info']),
    info: id(function ServerInfo() {}, 17, ['instance', 'name', 'data']),
    call: id(function ServerCall() {}, 18, ['instance', 'name', 'data', 'ref']),
    error: id(function ServerError() {}, 19, ['instance', 'path', 'info'])
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
