"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinkedList = void 0;

class Node {
  constructor(element) {
    this.element = element;
    this.next = _get__("Node").Undefined;
    this.prev = _get__("Node").Undefined;
  }

}

_get__("Node").Undefined = new (_get__("Node"))(undefined);

class LinkedList {
  constructor() {
    this._first = _get__("Node").Undefined;
    this._last = _get__("Node").Undefined;
    this._size = 0;
  }

  get size() {
    return this._size;
  }

  isEmpty() {
    return this._first === _get__("Node").Undefined;
  }

  clear() {
    this._first = _get__("Node").Undefined;
    this._last = _get__("Node").Undefined;
    this._size = 0;
  }

  unshift(element) {
    return this._insert(element, false);
  }

  push(element) {
    return this._insert(element, true);
  }

  _insert(element, atTheEnd) {
    const newNode = new (_get__("Node"))(element);

    if (this._first === _get__("Node").Undefined) {
      this._first = newNode;
      this._last = newNode;
    } else if (atTheEnd) {
      // push
      const oldLast = this._last;
      this._last = newNode;
      newNode.prev = oldLast;
      oldLast.next = newNode;
    } else {
      // unshift
      const oldFirst = this._first;
      this._first = newNode;
      newNode.next = oldFirst;
      oldFirst.prev = newNode;
    }

    this._size += 1;
    let didRemove = false;
    return () => {
      if (!didRemove) {
        didRemove = true;

        this._remove(newNode);
      }
    };
  }

  shift() {
    if (this._first === _get__("Node").Undefined) {
      return undefined;
    } else {
      const res = this._first.element;

      this._remove(this._first);

      return res;
    }
  }

  pop() {
    if (this._last === _get__("Node").Undefined) {
      return undefined;
    } else {
      const res = this._last.element;

      this._remove(this._last);

      return res;
    }
  }

  _remove(node) {
    if (node.prev !== _get__("Node").Undefined && node.next !== _get__("Node").Undefined) {
      // middle
      const anchor = node.prev;
      anchor.next = node.next;
      node.next.prev = anchor;
    } else if (node.prev === _get__("Node").Undefined && node.next === _get__("Node").Undefined) {
      // only node
      this._first = _get__("Node").Undefined;
      this._last = _get__("Node").Undefined;
    } else if (node.next === _get__("Node").Undefined) {
      // last
      this._last = this._last.prev;
      this._last.next = _get__("Node").Undefined;
    } else if (node.prev === _get__("Node").Undefined) {
      // first
      this._first = this._first.next;
      this._first.prev = _get__("Node").Undefined;
    } // done


    this._size -= 1;
  }

  *[Symbol.iterator]() {
    let node = this._first;

    while (node !== _get__("Node").Undefined) {
      yield node.element;
      node = node.next;
    }
  }

  toArray() {
    const result = [];

    for (let node = this._first; node !== _get__("Node").Undefined; node = node.next) {
      result.push(node.element);
    }

    return result;
  }

}

exports.LinkedList = _get__("LinkedList");

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
    case "Node":
      return Node;

    case "LinkedList":
      return LinkedList;
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