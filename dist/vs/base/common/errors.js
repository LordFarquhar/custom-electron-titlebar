"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotSupportedError = exports.NotImplementedError = exports.getErrorMessage = exports.disposed = exports.readonly = exports.illegalState = exports.illegalArgument = exports.canceled = exports.isPromiseCanceledError = exports.transformErrorForSerialization = exports.onUnexpectedExternalError = exports.onUnexpectedError = exports.setUnexpectedErrorHandler = exports.errorHandler = exports.ErrorHandler = void 0; // Avoid circular dependency on EventEmitter by implementing a subset of the interface.

class ErrorHandler {
  constructor() {
    this.listeners = [];

    this.unexpectedErrorHandler = function (e) {
      setTimeout(() => {
        if (e.stack) {
          throw new Error(e.message + '\n\n' + e.stack);
        }

        throw e;
      }, 0);
    };
  }

  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this._removeListener(listener);
    };
  }

  emit(e) {
    this.listeners.forEach(listener => {
      listener(e);
    });
  }

  _removeListener(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  }

  setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
    this.unexpectedErrorHandler = newUnexpectedErrorHandler;
  }

  getUnexpectedErrorHandler() {
    return this.unexpectedErrorHandler;
  }

  onUnexpectedError(e) {
    this.unexpectedErrorHandler(e);
    this.emit(e);
  } // For external errors, we don't want the listeners to be called


  onUnexpectedExternalError(e) {
    this.unexpectedErrorHandler(e);
  }

}

exports.ErrorHandler = _get__("ErrorHandler");
exports.errorHandler = new (_get__("ErrorHandler"))();

function setUnexpectedErrorHandler(newUnexpectedErrorHandler) {
  exports.errorHandler.setUnexpectedErrorHandler(newUnexpectedErrorHandler);
}

exports.setUnexpectedErrorHandler = _get__("setUnexpectedErrorHandler");

function onUnexpectedError(e) {
  // ignore errors from cancelled promises
  if (!_get__("isPromiseCanceledError")(e)) {
    exports.errorHandler.onUnexpectedError(e);
  }

  return undefined;
}

exports.onUnexpectedError = _get__("onUnexpectedError");

function onUnexpectedExternalError(e) {
  // ignore errors from cancelled promises
  if (!_get__("isPromiseCanceledError")(e)) {
    exports.errorHandler.onUnexpectedExternalError(e);
  }

  return undefined;
}

exports.onUnexpectedExternalError = _get__("onUnexpectedExternalError");

function transformErrorForSerialization(error) {
  if (error instanceof Error) {
    let {
      name,
      message
    } = error;
    const stack = error.stacktrace || error.stack;
    return {
      $isError: true,
      name,
      message,
      stack
    };
  } // return as is


  return error;
}

exports.transformErrorForSerialization = _get__("transformErrorForSerialization");
const canceledName = 'Canceled';
/**
 * Checks if the given error is a promise in canceled state
 */

function isPromiseCanceledError(error) {
  return error instanceof Error && error.name === _get__("canceledName") && error.message === _get__("canceledName");
}

exports.isPromiseCanceledError = _get__("isPromiseCanceledError");
/**
 * Returns an error that signals cancellation.
 */

function canceled() {
  const error = new Error(_get__("canceledName"));
  error.name = error.message;
  return error;
}

exports.canceled = _get__("canceled");

function illegalArgument(name) {
  if (name) {
    return new Error(`Illegal argument: ${name}`);
  } else {
    return new Error('Illegal argument');
  }
}

exports.illegalArgument = _get__("illegalArgument");

function illegalState(name) {
  if (name) {
    return new Error(`Illegal state: ${name}`);
  } else {
    return new Error('Illegal state');
  }
}

exports.illegalState = _get__("illegalState");

function readonly(name) {
  return name ? new Error(`readonly property '${name} cannot be changed'`) : new Error('readonly property cannot be changed');
}

exports.readonly = _get__("readonly");

function disposed(what) {
  const result = new Error(`${what} has been disposed`);
  result.name = 'DISPOSED';
  return result;
}

exports.disposed = _get__("disposed");

function getErrorMessage(err) {
  if (!err) {
    return 'Error';
  }

  if (err.message) {
    return err.message;
  }

  if (err.stack) {
    return err.stack.split('\n')[0];
  }

  return String(err);
}

exports.getErrorMessage = _get__("getErrorMessage");

class NotImplementedError extends Error {
  constructor(message) {
    super('NotImplemented');

    if (message) {
      this.message = message;
    }
  }

}

exports.NotImplementedError = _get__("NotImplementedError");

class NotSupportedError extends Error {
  constructor(message) {
    super('NotSupported');

    if (message) {
      this.message = message;
    }
  }

}

exports.NotSupportedError = _get__("NotSupportedError");

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
    case "ErrorHandler":
      return ErrorHandler;

    case "setUnexpectedErrorHandler":
      return setUnexpectedErrorHandler;

    case "isPromiseCanceledError":
      return isPromiseCanceledError;

    case "onUnexpectedError":
      return onUnexpectedError;

    case "onUnexpectedExternalError":
      return onUnexpectedExternalError;

    case "transformErrorForSerialization":
      return transformErrorForSerialization;

    case "canceledName":
      return canceledName;

    case "canceled":
      return canceled;

    case "illegalArgument":
      return illegalArgument;

    case "illegalState":
      return illegalState;

    case "readonly":
      return readonly;

    case "disposed":
      return disposed;

    case "getErrorMessage":
      return getErrorMessage;

    case "NotImplementedError":
      return NotImplementedError;

    case "NotSupportedError":
      return NotSupportedError;
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
  switch (variableName) {}

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