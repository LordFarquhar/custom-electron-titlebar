"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CancellationTokenSource = exports.CancellationToken = void 0;

const event_1 = require("./event");

const shortcutEvent = Object.freeze(function (callback, context) {
  const handle = setTimeout(callback.bind(context), 0);
  return {
    dispose() {
      clearTimeout(handle);
    }

  };
});
var CancellationToken;

(function (CancellationToken) {
  function isCancellationToken(thing) {
    if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
      return true;
    }

    if (thing instanceof _get__("MutableToken")) {
      return true;
    }

    if (!thing || typeof thing !== 'object') {
      return false;
    }

    return typeof thing.isCancellationRequested === 'boolean' && typeof thing.onCancellationRequested === 'function';
  }

  CancellationToken.isCancellationToken = isCancellationToken;
  CancellationToken.None = Object.freeze({
    isCancellationRequested: false,
    onCancellationRequested: _get__("event_1").Event.None
  });
  CancellationToken.Cancelled = Object.freeze({
    isCancellationRequested: true,
    onCancellationRequested: _get__("shortcutEvent")
  });
})(_assign__("CancellationToken", exports.CancellationToken || (exports.CancellationToken = {})));

class MutableToken {
  constructor() {
    this._isCancelled = false;
    this._emitter = null;
  }

  cancel() {
    if (!this._isCancelled) {
      this._isCancelled = true;

      if (this._emitter) {
        this._emitter.fire(undefined);

        this.dispose();
      }
    }
  }

  get isCancellationRequested() {
    return this._isCancelled;
  }

  get onCancellationRequested() {
    if (this._isCancelled) {
      return _get__("shortcutEvent");
    }

    if (!this._emitter) {
      this._emitter = new (_get__("event_1").Emitter)();
    }

    return this._emitter.event;
  }

  dispose() {
    if (this._emitter) {
      this._emitter.dispose();

      this._emitter = null;
    }
  }

}

class CancellationTokenSource {
  constructor(parent) {
    this._token = undefined;
    this._parentListener = undefined;
    this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
  }

  get token() {
    if (!this._token) {
      // be lazy and create the token only when
      // actually needed
      this._token = new (_get__("MutableToken"))();
    }

    return this._token;
  }

  cancel() {
    if (!this._token) {
      // save an object by returning the default
      // cancelled token when cancellation happens
      // before someone asks for the token
      this._token = _get__("CancellationToken").Cancelled;
    } else if (this._token instanceof _get__("MutableToken")) {
      // actually cancel
      this._token.cancel();
    }
  }

  dispose(cancel = false) {
    if (cancel) {
      this.cancel();
    }

    if (this._parentListener) {
      this._parentListener.dispose();
    }

    if (!this._token) {
      // ensure to initialize with an empty token if we had none
      this._token = _get__("CancellationToken").None;
    } else if (this._token instanceof _get__("MutableToken")) {
      // actually dispose
      this._token.dispose();
    }
  }

}

exports.CancellationTokenSource = _get__("CancellationTokenSource");

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
    case "MutableToken":
      return MutableToken;

    case "event_1":
      return event_1;

    case "shortcutEvent":
      return shortcutEvent;

    case "CancellationToken":
      return CancellationToken;

    case "CancellationTokenSource":
      return CancellationTokenSource;
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
    case "CancellationToken":
      return CancellationToken = _value;
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