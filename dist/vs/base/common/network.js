"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  Object.defineProperty(o, k2, {
    enumerable: true,
    get: function () {
      return m[k];
    }
  });
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) _get__("__createBinding")(result, mod, k);

  _get__("__setModuleDefault")(result, mod);

  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteAuthorities = exports.Schemas = void 0;

const uri_1 = require("./uri");

const platform = _get__("__importStar")(require("./platform"));

var Schemas;

(function (Schemas) {
  /**
   * A schema that is used for models that exist in memory
   * only and that have no correspondence on a server or such.
   */
  Schemas.inMemory = 'inmemory';
  /**
   * A schema that is used for setting files
   */

  Schemas.vscode = 'vscode';
  /**
   * A schema that is used for internal private files
   */

  Schemas.internal = 'private';
  /**
   * A walk-through document.
   */

  Schemas.walkThrough = 'walkThrough';
  /**
   * An embedded code snippet.
   */

  Schemas.walkThroughSnippet = 'walkThroughSnippet';
  Schemas.http = 'http';
  Schemas.https = 'https';
  Schemas.file = 'file';
  Schemas.mailto = 'mailto';
  Schemas.untitled = 'untitled';
  Schemas.data = 'data';
  Schemas.command = 'command';
  Schemas.vscodeRemote = 'vscode-remote';
  Schemas.vscodeRemoteResource = 'vscode-remote-resource';
  Schemas.userData = 'vscode-userdata';
  Schemas.vscodeCustomEditor = 'vscode-custom-editor';
  Schemas.vscodeNotebook = 'vscode-notebook';
  Schemas.vscodeNotebookCell = 'vscode-notebook-cell';
  Schemas.vscodeSettings = 'vscode-settings';
  Schemas.webviewPanel = 'webview-panel';
  /**
   * Scheme used for loading the wrapper html and script in webviews.
   */

  Schemas.vscodeWebview = 'vscode-webview';
  /**
   * Scheme used for loading resources inside of webviews.
   */

  Schemas.vscodeWebviewResource = 'vscode-webview-resource';
  /**
   * Scheme used for extension pages
   */

  Schemas.extension = 'extension';
})(_assign__("Schemas", exports.Schemas || (exports.Schemas = {})));

class RemoteAuthoritiesImpl {
  constructor() {
    this._hosts = Object.create(null);
    this._ports = Object.create(null);
    this._connectionTokens = Object.create(null);
    this._preferredWebSchema = 'http';
    this._delegate = null;
  }

  setPreferredWebSchema(schema) {
    this._preferredWebSchema = schema;
  }

  setDelegate(delegate) {
    this._delegate = delegate;
  }

  set(authority, host, port) {
    this._hosts[authority] = host;
    this._ports[authority] = port;
  }

  setConnectionToken(authority, connectionToken) {
    this._connectionTokens[authority] = connectionToken;
  }

  rewrite(uri) {
    if (this._delegate) {
      return this._delegate(uri);
    }

    const authority = uri.authority;
    let host = this._hosts[authority];

    if (host && host.indexOf(':') !== -1) {
      host = `[${host}]`;
    }

    const port = this._ports[authority];
    const connectionToken = this._connectionTokens[authority];
    let query = `path=${encodeURIComponent(uri.path)}`;

    if (typeof connectionToken === 'string') {
      query += `&tkn=${encodeURIComponent(connectionToken)}`;
    }

    return _get__("uri_1").URI.from({
      scheme: _get__("platform").isWeb ? this._preferredWebSchema : _get__("Schemas").vscodeRemoteResource,
      authority: `${host}:${port}`,
      path: `/vscode-remote-resource`,
      query
    });
  }

}

exports.RemoteAuthorities = new (_get__("RemoteAuthoritiesImpl"))();

function _getGlobalObject() {
  try {
    if (!!global) {
      return global;
    }
  } catch (e) {
    try {
      if (!!window) {
        return window;
      }
    } catch (e) {
      return this;
    }
  }
}

;
var _RewireModuleId__ = null;

function _getRewireModuleId__() {
  if (_RewireModuleId__ === null) {
    let globalVariable = _getGlobalObject();

    if (!globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__) {
      globalVariable.__$$GLOBAL_REWIRE_NEXT_MODULE_ID__ = 0;
    }

    _RewireModuleId__ = __$$GLOBAL_REWIRE_NEXT_MODULE_ID__++;
  }

  return _RewireModuleId__;
}

function _getRewireRegistry__() {
  let theGlobalVariable = _getGlobalObject();

  if (!theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__) {
    theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
  }

  return theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__;
}

function _getRewiredData__() {
  let moduleId = _getRewireModuleId__();

  let registry = _getRewireRegistry__();

  let rewireData = registry[moduleId];

  if (!rewireData) {
    registry[moduleId] = Object.create(null);
    rewireData = registry[moduleId];
  }

  return rewireData;
}

(function registerResetAll() {
  let theGlobalVariable = _getGlobalObject();

  if (!theGlobalVariable['__rewire_reset_all__']) {
    theGlobalVariable['__rewire_reset_all__'] = function () {
      theGlobalVariable.__$$GLOBAL_REWIRE_REGISTRY__ = Object.create(null);
    };
  }
})();

var INTENTIONAL_UNDEFINED = '__INTENTIONAL_UNDEFINED__';
let _RewireAPI__ = {};

(function () {
  function addPropertyToAPIObject(name, value) {
    Object.defineProperty(_RewireAPI__, name, {
      value: value,
      enumerable: false,
      configurable: true
    });
  }

  addPropertyToAPIObject('__get__', _get__);
  addPropertyToAPIObject('__GetDependency__', _get__);
  addPropertyToAPIObject('__Rewire__', _set__);
  addPropertyToAPIObject('__set__', _set__);
  addPropertyToAPIObject('__reset__', _reset__);
  addPropertyToAPIObject('__ResetDependency__', _reset__);
  addPropertyToAPIObject('__with__', _with__);
})();

function _get__(variableName) {
  let rewireData = _getRewiredData__();

  if (rewireData[variableName] === undefined) {
    return _get_original__(variableName);
  } else {
    var value = rewireData[variableName];

    if (value === INTENTIONAL_UNDEFINED) {
      return undefined;
    } else {
      return value;
    }
  }
}

function _get_original__(variableName) {
  switch (variableName) {
    case "__createBinding":
      return __createBinding;

    case "__setModuleDefault":
      return __setModuleDefault;

    case "__importStar":
      return __importStar;

    case "Schemas":
      return Schemas;

    case "uri_1":
      return uri_1;

    case "platform":
      return platform;

    case "RemoteAuthoritiesImpl":
      return RemoteAuthoritiesImpl;
  }

  return undefined;
}

function _assign__(variableName, value) {
  let rewireData = _getRewiredData__();

  if (rewireData[variableName] === undefined) {
    return _set_original__(variableName, value);
  } else {
    return rewireData[variableName] = value;
  }
}

function _set_original__(variableName, _value) {
  switch (variableName) {
    case "Schemas":
      return Schemas = _value;
  }

  return undefined;
}

function _update_operation__(operation, variableName, prefix) {
  var oldValue = _get__(variableName);

  var newValue = operation === '++' ? oldValue + 1 : oldValue - 1;

  _assign__(variableName, newValue);

  return prefix ? newValue : oldValue;
}

function _set__(variableName, value) {
  let rewireData = _getRewiredData__();

  if (typeof variableName === 'object') {
    Object.keys(variableName).forEach(function (name) {
      rewireData[name] = variableName[name];
    });
    return function () {
      Object.keys(variableName).forEach(function (name) {
        _reset__(variableName);
      });
    };
  } else {
    if (value === undefined) {
      rewireData[variableName] = INTENTIONAL_UNDEFINED;
    } else {
      rewireData[variableName] = value;
    }

    return function () {
      _reset__(variableName);
    };
  }
}

function _reset__(variableName) {
  let rewireData = _getRewiredData__();

  delete rewireData[variableName];

  if (Object.keys(rewireData).length == 0) {
    delete _getRewireRegistry__()[_getRewireModuleId__];
  }

  ;
}

function _with__(object) {
  let rewireData = _getRewiredData__();

  var rewiredVariableNames = Object.keys(object);
  var previousValues = {};

  function reset() {
    rewiredVariableNames.forEach(function (variableName) {
      rewireData[variableName] = previousValues[variableName];
    });
  }

  return function (callback) {
    rewiredVariableNames.forEach(function (variableName) {
      previousValues[variableName] = rewireData[variableName];
      rewireData[variableName] = object[variableName];
    });
    let result = callback();

    if (!!result && typeof result.then == 'function') {
      result.then(reset).catch(reset);
    } else {
      reset();
    }

    return result;
  };
}

let _typeOfOriginalExport = typeof module.exports;

function addNonEnumerableProperty(name, value) {
  Object.defineProperty(module.exports, name, {
    value: value,
    enumerable: false,
    configurable: true
  });
}

if ((_typeOfOriginalExport === 'object' || _typeOfOriginalExport === 'function') && Object.isExtensible(module.exports)) {
  addNonEnumerableProperty('__get__', _get__);
  addNonEnumerableProperty('__GetDependency__', _get__);
  addNonEnumerableProperty('__Rewire__', _set__);
  addNonEnumerableProperty('__set__', _set__);
  addNonEnumerableProperty('__reset__', _reset__);
  addNonEnumerableProperty('__ResetDependency__', _reset__);
  addNonEnumerableProperty('__with__', _with__);
  addNonEnumerableProperty('__RewireAPI__', _RewireAPI__);
}