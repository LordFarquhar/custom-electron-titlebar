"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isLittleEndian = exports.OS = exports.setImmediate = exports.globals = exports.translationsConfigFile = exports.locale = exports.Language = exports.language = exports.isRootUser = exports.userAgent = exports.platform = exports.isIOS = exports.isWeb = exports.isNative = exports.isLinux = exports.isMacintosh = exports.isWindows = exports.PlatformToString = void 0;
const LANGUAGE_DEFAULT = 'en';
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isNative = false;
let _isWeb = false;
let _isIOS = false;
let _locale = undefined;

let _language = _get__("LANGUAGE_DEFAULT");

let _translationsConfigFile = undefined;
let _userAgent = undefined;
const isElectronRenderer = typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.electron !== 'undefined' && process.type === 'renderer'; // OS detection

if (typeof navigator === 'object' && !_get__("isElectronRenderer")) {
  _assign__("_userAgent", navigator.userAgent);

  _assign__("_isWindows", _get__("_userAgent").indexOf('Windows') >= 0);

  _assign__("_isMacintosh", _get__("_userAgent").indexOf('Macintosh') >= 0);

  _assign__("_isIOS", (_get__("_userAgent").indexOf('Macintosh') >= 0 || _get__("_userAgent").indexOf('iPad') >= 0 || _get__("_userAgent").indexOf('iPhone') >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  _assign__("_isLinux", _get__("_userAgent").indexOf('Linux') >= 0);

  _assign__("_isWeb", true);

  _assign__("_locale", navigator.language);

  _assign__("_language", _get__("_locale"));
} else if (typeof process === 'object') {
  // _isWindows = (process.platform === 'darwin');  // uncomment this and comment the next 2 lines to test it on macos
  _assign__("_isWindows", process.platform === 'win32');

  _assign__("_isMacintosh", process.platform === 'darwin');

  _assign__("_isLinux", process.platform === 'linux');

  _assign__("_locale", _get__("LANGUAGE_DEFAULT"));

  _assign__("_language", _get__("LANGUAGE_DEFAULT"));

  const rawNlsConfig = process.env['VSCODE_NLS_CONFIG'];

  if (rawNlsConfig) {
    try {
      const nlsConfig = JSON.parse(rawNlsConfig);
      const resolved = nlsConfig.availableLanguages['*'];

      _assign__("_locale", nlsConfig.locale); // VSCode's default language is 'en'


      _assign__("_language", resolved ? resolved : _get__("LANGUAGE_DEFAULT"));

      _assign__("_translationsConfigFile", nlsConfig._translationsConfigFile);
    } catch (e) {}
  }

  _assign__("_isNative", true);
}

function PlatformToString(platform) {
  switch (platform) {
    case 0
    /* Web */
    :
      return 'Web';

    case 1
    /* Mac */
    :
      return 'Mac';

    case 2
    /* Linux */
    :
      return 'Linux';

    case 3
    /* Windows */
    :
      return 'Windows';
  }
}

exports.PlatformToString = _get__("PlatformToString");
let _platform = 0
/* Web */
;

if (_get__("_isMacintosh")) {
  _assign__("_platform", 1)
  /* Mac */
  ;
} else if (_get__("_isWindows")) {
  _assign__("_platform", 3)
  /* Windows */
  ;
} else if (_get__("_isLinux")) {
  _assign__("_platform", 2)
  /* Linux */
  ;
} // use the first two lines for development on MacOS only.
// export const isWindows = true || _isWindows;
// export const isMacintosh = false && _isMacintosh;


exports.isWindows = _get__("_isWindows");
exports.isMacintosh = _get__("_isMacintosh");
exports.isLinux = _get__("_isLinux");
exports.isNative = _get__("_isNative");
exports.isWeb = _get__("_isWeb");
exports.isIOS = _get__("_isIOS");
exports.platform = _get__("_platform");
exports.userAgent = _get__("_userAgent");

function isRootUser() {
  return _get__("_isNative") && !_get__("_isWindows") && process.getuid() === 0;
}

exports.isRootUser = _get__("isRootUser");
/**
 * The language used for the user interface. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese)
 */

exports.language = _get__("_language");
var Language;

(function (Language) {
  function value() {
    return exports.language;
  }

  Language.value = value;

  function isDefaultVariant() {
    if (exports.language.length === 2) {
      return exports.language === 'en';
    } else if (exports.language.length >= 3) {
      return exports.language[0] === 'e' && exports.language[1] === 'n' && exports.language[2] === '-';
    } else {
      return false;
    }
  }

  Language.isDefaultVariant = isDefaultVariant;

  function isDefault() {
    return exports.language === 'en';
  }

  Language.isDefault = isDefault;
})(_assign__("Language", exports.Language || (exports.Language = {})));
/**
 * The OS locale or the locale specified by --locale. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese). The UI is not necessarily shown in the provided locale.
 */


exports.locale = _get__("_locale");
/**
 * The translatios that are available through language packs.
 */

exports.translationsConfigFile = _get__("_translationsConfigFile");

const _globals = typeof self === 'object' ? self : typeof global === 'object' ? global : {};

exports.globals = _get__("_globals");

exports.setImmediate = function defineSetImmediate() {
  if (exports.globals.setImmediate) {
    return exports.globals.setImmediate.bind(exports.globals);
  }

  if (typeof exports.globals.postMessage === 'function' && !exports.globals.importScripts) {
    let pending = [];
    exports.globals.addEventListener('message', e => {
      if (e.data && e.data.vscodeSetImmediateId) {
        for (let i = 0, len = pending.length; i < len; i++) {
          const candidate = pending[i];

          if (candidate.id === e.data.vscodeSetImmediateId) {
            pending.splice(i, 1);
            candidate.callback();
            return;
          }
        }
      }
    });
    let lastId = 0;
    return callback => {
      const myId = ++lastId;
      pending.push({
        id: myId,
        callback: callback
      });
      exports.globals.postMessage({
        vscodeSetImmediateId: myId
      }, '*');
    };
  }

  if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
    return process.nextTick.bind(process);
  }

  const _promise = Promise.resolve();

  return callback => _promise.then(callback);
}();

exports.OS = _get__("_isMacintosh") || _get__("_isIOS") ? 2
/* Macintosh */
: _get__("_isWindows") ? 1
/* Windows */
: 3
/* Linux */
;
let _isLittleEndian = true;
let _isLittleEndianComputed = false;

function isLittleEndian() {
  if (!_get__("_isLittleEndianComputed")) {
    _assign__("_isLittleEndianComputed", true);

    const test = new Uint8Array(2);
    test[0] = 1;
    test[1] = 2;
    const view = new Uint16Array(test.buffer);

    _assign__("_isLittleEndian", view[0] === (2 << 8) + 1);
  }

  return _get__("_isLittleEndian");
}

exports.isLittleEndian = _get__("isLittleEndian");

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
    case "LANGUAGE_DEFAULT":
      return LANGUAGE_DEFAULT;

    case "isElectronRenderer":
      return isElectronRenderer;

    case "_userAgent":
      return _userAgent;

    case "_isWindows":
      return _isWindows;

    case "_isMacintosh":
      return _isMacintosh;

    case "_isIOS":
      return _isIOS;

    case "_isLinux":
      return _isLinux;

    case "_isWeb":
      return _isWeb;

    case "_locale":
      return _locale;

    case "_language":
      return _language;

    case "_translationsConfigFile":
      return _translationsConfigFile;

    case "_isNative":
      return _isNative;

    case "PlatformToString":
      return PlatformToString;

    case "_platform":
      return _platform;

    case "isRootUser":
      return isRootUser;

    case "Language":
      return Language;

    case "_globals":
      return _globals;

    case "_isLittleEndianComputed":
      return _isLittleEndianComputed;

    case "_isLittleEndian":
      return _isLittleEndian;

    case "isLittleEndian":
      return isLittleEndian;
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
    case "_userAgent":
      return _userAgent = _value;

    case "_isWindows":
      return _isWindows = _value;

    case "_isMacintosh":
      return _isMacintosh = _value;

    case "_isIOS":
      return _isIOS = _value;

    case "_isLinux":
      return _isLinux = _value;

    case "_isWeb":
      return _isWeb = _value;

    case "_locale":
      return _locale = _value;

    case "_language":
      return _language = _value;

    case "_translationsConfigFile":
      return _translationsConfigFile = _value;

    case "_isNative":
      return _isNative = _value;

    case "_platform":
      return _platform = _value;

    case "Language":
      return Language = _value;

    case "_isLittleEndianComputed":
      return _isLittleEndianComputed = _value;

    case "_isLittleEndian":
      return _isLittleEndian = _value;
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