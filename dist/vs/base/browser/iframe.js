"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IframeUtils = void 0;
let hasDifferentOriginAncestorFlag = false;
let sameOriginWindowChainCache = null;

function getParentWindowIfSameOrigin(w) {
  if (!w.parent || w.parent === w) {
    return null;
  } // Cannot really tell if we have access to the parent window unless we try to access something in it


  try {
    let location = w.location;
    let parentLocation = w.parent.location;

    if (location.protocol !== parentLocation.protocol || location.hostname !== parentLocation.hostname || location.port !== parentLocation.port) {
      _assign__("hasDifferentOriginAncestorFlag", true);

      return null;
    }
  } catch (e) {
    _assign__("hasDifferentOriginAncestorFlag", true);

    return null;
  }

  return w.parent;
}

function findIframeElementInParentWindow(parentWindow, childWindow) {
  let parentWindowIframes = parentWindow.document.getElementsByTagName('iframe');
  let iframe;

  for (let i = 0, len = parentWindowIframes.length; i < len; i++) {
    iframe = parentWindowIframes[i];

    if (iframe.contentWindow === childWindow) {
      return iframe;
    }
  }

  return null;
}

class IframeUtils {
  /**
   * Returns a chain of embedded windows with the same origin (which can be accessed programmatically).
   * Having a chain of length 1 might mean that the current execution environment is running outside of an iframe or inside an iframe embedded in a window with a different origin.
   * To distinguish if at one point the current execution environment is running inside a window with a different origin, see hasDifferentOriginAncestor()
   */
  static getSameOriginWindowChain() {
    if (!_get__("sameOriginWindowChainCache")) {
      _assign__("sameOriginWindowChainCache", []);

      let w = window;
      let parent;

      do {
        parent = _get__("getParentWindowIfSameOrigin")(w);

        if (parent) {
          _get__("sameOriginWindowChainCache").push({
            window: w,
            iframeElement: _get__("findIframeElementInParentWindow")(parent, w)
          });
        } else {
          _get__("sameOriginWindowChainCache").push({
            window: w,
            iframeElement: null
          });
        }

        w = parent;
      } while (w);
    }

    return _get__("sameOriginWindowChainCache").slice(0);
  }
  /**
   * Returns true if the current execution environment is chained in a list of iframes which at one point ends in a window with a different origin.
   * Returns false if the current execution environment is not running inside an iframe or if the entire chain of iframes have the same origin.
   */


  static hasDifferentOriginAncestor() {
    if (!_get__("sameOriginWindowChainCache")) {
      this.getSameOriginWindowChain();
    }

    return _get__("hasDifferentOriginAncestorFlag");
  }
  /**
   * Returns the position of `childWindow` relative to `ancestorWindow`
   */


  static getPositionOfChildWindowRelativeToAncestorWindow(childWindow, ancestorWindow) {
    if (!ancestorWindow || childWindow === ancestorWindow) {
      return {
        top: 0,
        left: 0
      };
    }

    let top = 0,
        left = 0;
    let windowChain = this.getSameOriginWindowChain();

    for (const windowChainEl of windowChain) {
      if (windowChainEl.window === ancestorWindow) {
        break;
      }

      if (!windowChainEl.iframeElement) {
        break;
      }

      let boundingRect = windowChainEl.iframeElement.getBoundingClientRect();
      top += boundingRect.top;
      left += boundingRect.left;
    }

    return {
      top: top,
      left: left
    };
  }

}

exports.IframeUtils = _get__("IframeUtils");

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
    case "hasDifferentOriginAncestorFlag":
      return hasDifferentOriginAncestorFlag;

    case "sameOriginWindowChainCache":
      return sameOriginWindowChainCache;

    case "getParentWindowIfSameOrigin":
      return getParentWindowIfSameOrigin;

    case "findIframeElementInParentWindow":
      return findIframeElementInParentWindow;

    case "IframeUtils":
      return IframeUtils;
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
    case "hasDifferentOriginAncestorFlag":
      return hasDifferentOriginAncestorFlag = _value;

    case "sameOriginWindowChainCache":
      return sameOriginWindowChainCache = _value;
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