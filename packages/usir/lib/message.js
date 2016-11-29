function ClientMount() {
  if (!(this instanceof ClientMount)) return ClientMount.fromArray(arguments);
}
function ClientUnmount() {
  if (!(this instanceof ClientUnmount)) return ClientUnmount.fromArray(arguments);
}
function ClientAuthenticate() {
  if (!(this instanceof ClientAuthenticate)) return ClientAuthenticate.fromArray(arguments);
}
function ClientAction() {
  if (!(this instanceof ClientAction)) return ClientAction.fromArray(arguments);
}
function ClientCallResponse() {
  if (!(this instanceof ClientCallResponse)) return ClientCallResponse.fromArray(arguments);
}
function ClientCallError() {
  if (!(this instanceof ClientCallError)) return ClientCallError.fromArray(arguments);
}

function ServerMounted() {}
function ServerUnmounted() {}
function ServerNotFound() {}
function ServerAuthenticationRequired() {}
function ServerAuthenticationInvalid() {}
function ServerUnauthorized() {}
function ServerAuthenticationAcknowledged() {}
function ServerActionAcknowledged() {}
function ServerActionInvalid() {}
function ServerInfo() {}
function ServerCall() {}
function ServerError() {}

exports = module.exports = {
  client: {
    mount: id(ClientMount, 0, ['instance', 'path', 'state', 'props']),
    unmount: id(ClientUnmount, 1, ['instance']),
    authenticate: id(ClientAuthenticate, 2, ['instance', 'method', 'token']),
    action: id(ClientAction, 3, ['instance', 'ref', 'body']),
    callResponse: id(ClientCallResponse, 4, ['instance', 'ref', 'data']),
    callError: id(ClientCallError, 5, ['instance', 'ref', 'message']),
  },
  server: {
    mounted: id(ServerMounted, 8, ['instance', 'path', 'state', 'body']),
    unmounted: id(ServerUnmounted, 9, ['instance']),
    notFound: id(ServerNotFound, 10, ['instance', 'path']),
    authenticationRequired: id(ServerAuthenticationRequired, 11, ['instance', 'methods']),
    authenticationInvalid: id(ServerAuthenticationInvalid, 12, ['instance', 'method']),
    unauthorized: id(ServerUnauthorized, 13, ['instance', 'info']),
    authenticationAcknowledged: id(ServerAuthenticationAcknowledged, 14, ['instance', 'method']),
    actionAcknowledged: id(ServerActionAcknowledged, 15, ['instance', 'ref']),
    actionInvalid: id(ServerActionInvalid, 16, ['instance', 'ref', 'info']),
    info: id(ServerInfo, 17, ['instance', 'name', 'data']),
    call: id(ServerCall, 18, ['instance', 'name', 'data', 'ref']),
    error: id(ServerError, 19, ['instance', 'path', 'info'])
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
