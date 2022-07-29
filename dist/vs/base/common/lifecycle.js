"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImmortalReference = exports.ReferenceCollection = exports.MutableDisposable = exports.Disposable = exports.DisposableStore = exports.toDisposable = exports.combinedDisposable = exports.dispose = exports.isDisposable = exports.MultiDisposeError = void 0;

const functional_1 = require("./functional");

const iterator_1 = require("./iterator");
/**
 * Enables logging of potentially leaked disposables.
 *
 * A disposable is considered leaked if it is not disposed or not registered as the child of
 * another disposable. This tracking is very simple an only works for classes that either
 * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
 */


const TRACK_DISPOSABLES = false;
const __is_disposable_tracked__ = '__is_disposable_tracked__';

function markTracked(x) {
  if (!_get__("TRACK_DISPOSABLES")) {
    return;
  }

  if (x && x !== _get__("Disposable").None) {
    try {
      x[__is_disposable_tracked__] = true;
    } catch {// noop
    }
  }
}

function trackDisposable(x) {
  if (!_get__("TRACK_DISPOSABLES")) {
    return x;
  }

  const stack = new Error('Potentially leaked disposable').stack;
  setTimeout(() => {
    if (!x[__is_disposable_tracked__]) {
      console.log(stack);
    }
  }, 3000);
  return x;
}

class MultiDisposeError extends Error {
  constructor(errors) {
    super(`Encounter errors while disposing of store. Errors: [${errors.join(', ')}]`);
    this.errors = errors;
  }

}

exports.MultiDisposeError = _get__("MultiDisposeError");

function isDisposable(thing) {
  return typeof thing.dispose === 'function' && thing.dispose.length === 0;
}

exports.isDisposable = _get__("isDisposable");

function dispose(arg) {
  if (_get__("iterator_1").Iterable.is(arg)) {
    let errors = [];

    for (const d of arg) {
      if (d) {
        _get__("markTracked")(d);

        try {
          d.dispose();
        } catch (e) {
          errors.push(e);
        }
      }
    }

    if (errors.length === 1) {
      throw errors[0];
    } else if (errors.length > 1) {
      throw new (_get__("MultiDisposeError"))(errors);
    }

    return Array.isArray(arg) ? [] : arg;
  } else if (arg) {
    _get__("markTracked")(arg);

    arg.dispose();
    return arg;
  }
}

exports.dispose = _get__("dispose");

function combinedDisposable(...disposables) {
  disposables.forEach(_get__("markTracked"));
  return _get__("trackDisposable")({
    dispose: () => _get__("dispose")(disposables)
  });
}

exports.combinedDisposable = _get__("combinedDisposable");

function toDisposable(fn) {
  const self = _get__("trackDisposable")({
    dispose: () => {
      _get__("markTracked")(self);

      fn();
    }
  });

  return self;
}

exports.toDisposable = _get__("toDisposable");

class DisposableStore {
  constructor() {
    this._toDispose = new Set();
    this._isDisposed = false;
  }
  /**
   * Dispose of all registered disposables and mark this object as disposed.
   *
   * Any future disposables added to this object will be disposed of on `add`.
   */


  dispose() {
    if (this._isDisposed) {
      return;
    }

    _get__("markTracked")(this);

    this._isDisposed = true;
    this.clear();
  }
  /**
   * Dispose of all registered disposables but do not mark this object as disposed.
   */


  clear() {
    try {
      _get__("dispose")(this._toDispose.values());
    } finally {
      this._toDispose.clear();
    }
  }

  add(t) {
    if (!t) {
      return t;
    }

    if (t === this) {
      throw new Error('Cannot register a disposable on itself!');
    }

    _get__("markTracked")(t);

    if (this._isDisposed) {
      if (!_get__("DisposableStore").DISABLE_DISPOSED_WARNING) {
        console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
      }
    } else {
      this._toDispose.add(t);
    }

    return t;
  }

}

exports.DisposableStore = _get__("DisposableStore");
_get__("DisposableStore").DISABLE_DISPOSED_WARNING = false;

class Disposable {
  constructor() {
    this._store = new (_get__("DisposableStore"))();

    _get__("trackDisposable")(this);
  }

  dispose() {
    _get__("markTracked")(this);

    this._store.dispose();
  }

  _register(t) {
    if (t === this) {
      throw new Error('Cannot register a disposable on itself!');
    }

    return this._store.add(t);
  }

}

exports.Disposable = _get__("Disposable");
_get__("Disposable").None = Object.freeze({
  dispose() {}

});
/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
 */

class MutableDisposable {
  constructor() {
    this._isDisposed = false;

    _get__("trackDisposable")(this);
  }

  get value() {
    return this._isDisposed ? undefined : this._value;
  }

  set value(value) {
    if (this._isDisposed || value === this._value) {
      return;
    }

    if (this._value) {
      this._value.dispose();
    }

    if (value) {
      _get__("markTracked")(value);
    }

    this._value = value;
  }

  clear() {
    this.value = undefined;
  }

  dispose() {
    this._isDisposed = true;

    _get__("markTracked")(this);

    if (this._value) {
      this._value.dispose();
    }

    this._value = undefined;
  }

}

exports.MutableDisposable = _get__("MutableDisposable");

class ReferenceCollection {
  constructor() {
    this.references = new Map();
  }

  acquire(key, ...args) {
    let reference = this.references.get(key);

    if (!reference) {
      reference = {
        counter: 0,
        object: this.createReferencedObject(key, ...args)
      };
      this.references.set(key, reference);
    }

    const {
      object
    } = reference;
    const dispose = (0, _get__("functional_1").once)(() => {
      if (--reference.counter === 0) {
        this.destroyReferencedObject(key, reference.object);
        this.references.delete(key);
      }
    });
    reference.counter++;
    return {
      object,
      dispose
    };
  }

}

exports.ReferenceCollection = _get__("ReferenceCollection");

class ImmortalReference {
  constructor(object) {
    this.object = object;
  }

  dispose() {}

}

exports.ImmortalReference = _get__("ImmortalReference");

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
    case "TRACK_DISPOSABLES":
      return TRACK_DISPOSABLES;

    case "Disposable":
      return Disposable;

    case "MultiDisposeError":
      return MultiDisposeError;

    case "isDisposable":
      return isDisposable;

    case "iterator_1":
      return iterator_1;

    case "markTracked":
      return markTracked;

    case "dispose":
      return dispose;

    case "trackDisposable":
      return trackDisposable;

    case "combinedDisposable":
      return combinedDisposable;

    case "toDisposable":
      return toDisposable;

    case "DisposableStore":
      return DisposableStore;

    case "MutableDisposable":
      return MutableDisposable;

    case "functional_1":
      return functional_1;

    case "ReferenceCollection":
      return ReferenceCollection;

    case "ImmortalReference":
      return ImmortalReference;
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