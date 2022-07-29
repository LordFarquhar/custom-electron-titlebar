"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResolvedKeybinding = exports.ResolvedKeybindingPart = exports.ChordKeybinding = exports.SimpleKeybinding = exports.createSimpleKeybinding = exports.createKeybinding = exports.KeyChord = exports.KeyCodeUtils = void 0;

const errors_1 = require("./errors");

class KeyCodeStrMap {
  constructor() {
    this._keyCodeToStr = [];
    this._strToKeyCode = Object.create(null);
  }

  define(keyCode, str) {
    this._keyCodeToStr[keyCode] = str;
    this._strToKeyCode[str.toLowerCase()] = keyCode;
  }

  keyCodeToStr(keyCode) {
    return this._keyCodeToStr[keyCode];
  }

  strToKeyCode(str) {
    return this._strToKeyCode[str.toLowerCase()] || 0
    /* Unknown */
    ;
  }

}

const uiMap = new (_get__("KeyCodeStrMap"))();
const userSettingsUSMap = new (_get__("KeyCodeStrMap"))();
const userSettingsGeneralMap = new (_get__("KeyCodeStrMap"))();

(function () {
  function define(keyCode, uiLabel, usUserSettingsLabel = uiLabel, generalUserSettingsLabel = usUserSettingsLabel) {
    _get__("uiMap").define(keyCode, uiLabel);

    _get__("userSettingsUSMap").define(keyCode, usUserSettingsLabel);

    _get__("userSettingsGeneralMap").define(keyCode, generalUserSettingsLabel);
  }

  define(0
  /* Unknown */
  , 'unknown');
  define(1
  /* Backspace */
  , 'Backspace');
  define(2
  /* Tab */
  , 'Tab');
  define(3
  /* Enter */
  , 'Enter');
  define(4
  /* Shift */
  , 'Shift');
  define(5
  /* Ctrl */
  , 'Ctrl');
  define(6
  /* Alt */
  , 'Alt');
  define(7
  /* PauseBreak */
  , 'PauseBreak');
  define(8
  /* CapsLock */
  , 'CapsLock');
  define(9
  /* Escape */
  , 'Escape');
  define(10
  /* Space */
  , 'Space');
  define(11
  /* PageUp */
  , 'PageUp');
  define(12
  /* PageDown */
  , 'PageDown');
  define(13
  /* End */
  , 'End');
  define(14
  /* Home */
  , 'Home');
  define(15
  /* LeftArrow */
  , 'LeftArrow', 'Left');
  define(16
  /* UpArrow */
  , 'UpArrow', 'Up');
  define(17
  /* RightArrow */
  , 'RightArrow', 'Right');
  define(18
  /* DownArrow */
  , 'DownArrow', 'Down');
  define(19
  /* Insert */
  , 'Insert');
  define(20
  /* Delete */
  , 'Delete');
  define(21
  /* KEY_0 */
  , '0');
  define(22
  /* KEY_1 */
  , '1');
  define(23
  /* KEY_2 */
  , '2');
  define(24
  /* KEY_3 */
  , '3');
  define(25
  /* KEY_4 */
  , '4');
  define(26
  /* KEY_5 */
  , '5');
  define(27
  /* KEY_6 */
  , '6');
  define(28
  /* KEY_7 */
  , '7');
  define(29
  /* KEY_8 */
  , '8');
  define(30
  /* KEY_9 */
  , '9');
  define(31
  /* KEY_A */
  , 'A');
  define(32
  /* KEY_B */
  , 'B');
  define(33
  /* KEY_C */
  , 'C');
  define(34
  /* KEY_D */
  , 'D');
  define(35
  /* KEY_E */
  , 'E');
  define(36
  /* KEY_F */
  , 'F');
  define(37
  /* KEY_G */
  , 'G');
  define(38
  /* KEY_H */
  , 'H');
  define(39
  /* KEY_I */
  , 'I');
  define(40
  /* KEY_J */
  , 'J');
  define(41
  /* KEY_K */
  , 'K');
  define(42
  /* KEY_L */
  , 'L');
  define(43
  /* KEY_M */
  , 'M');
  define(44
  /* KEY_N */
  , 'N');
  define(45
  /* KEY_O */
  , 'O');
  define(46
  /* KEY_P */
  , 'P');
  define(47
  /* KEY_Q */
  , 'Q');
  define(48
  /* KEY_R */
  , 'R');
  define(49
  /* KEY_S */
  , 'S');
  define(50
  /* KEY_T */
  , 'T');
  define(51
  /* KEY_U */
  , 'U');
  define(52
  /* KEY_V */
  , 'V');
  define(53
  /* KEY_W */
  , 'W');
  define(54
  /* KEY_X */
  , 'X');
  define(55
  /* KEY_Y */
  , 'Y');
  define(56
  /* KEY_Z */
  , 'Z');
  define(57
  /* Meta */
  , 'Meta');
  define(58
  /* ContextMenu */
  , 'ContextMenu');
  define(59
  /* F1 */
  , 'F1');
  define(60
  /* F2 */
  , 'F2');
  define(61
  /* F3 */
  , 'F3');
  define(62
  /* F4 */
  , 'F4');
  define(63
  /* F5 */
  , 'F5');
  define(64
  /* F6 */
  , 'F6');
  define(65
  /* F7 */
  , 'F7');
  define(66
  /* F8 */
  , 'F8');
  define(67
  /* F9 */
  , 'F9');
  define(68
  /* F10 */
  , 'F10');
  define(69
  /* F11 */
  , 'F11');
  define(70
  /* F12 */
  , 'F12');
  define(71
  /* F13 */
  , 'F13');
  define(72
  /* F14 */
  , 'F14');
  define(73
  /* F15 */
  , 'F15');
  define(74
  /* F16 */
  , 'F16');
  define(75
  /* F17 */
  , 'F17');
  define(76
  /* F18 */
  , 'F18');
  define(77
  /* F19 */
  , 'F19');
  define(78
  /* NumLock */
  , 'NumLock');
  define(79
  /* ScrollLock */
  , 'ScrollLock');
  define(80
  /* US_SEMICOLON */
  , ';', ';', 'OEM_1');
  define(81
  /* US_EQUAL */
  , '=', '=', 'OEM_PLUS');
  define(82
  /* US_COMMA */
  , ',', ',', 'OEM_COMMA');
  define(83
  /* US_MINUS */
  , '-', '-', 'OEM_MINUS');
  define(84
  /* US_DOT */
  , '.', '.', 'OEM_PERIOD');
  define(85
  /* US_SLASH */
  , '/', '/', 'OEM_2');
  define(86
  /* US_BACKTICK */
  , '`', '`', 'OEM_3');
  define(110
  /* ABNT_C1 */
  , 'ABNT_C1');
  define(111
  /* ABNT_C2 */
  , 'ABNT_C2');
  define(87
  /* US_OPEN_SQUARE_BRACKET */
  , '[', '[', 'OEM_4');
  define(88
  /* US_BACKSLASH */
  , '\\', '\\', 'OEM_5');
  define(89
  /* US_CLOSE_SQUARE_BRACKET */
  , ']', ']', 'OEM_6');
  define(90
  /* US_QUOTE */
  , '\'', '\'', 'OEM_7');
  define(91
  /* OEM_8 */
  , 'OEM_8');
  define(92
  /* OEM_102 */
  , 'OEM_102');
  define(93
  /* NUMPAD_0 */
  , 'NumPad0');
  define(94
  /* NUMPAD_1 */
  , 'NumPad1');
  define(95
  /* NUMPAD_2 */
  , 'NumPad2');
  define(96
  /* NUMPAD_3 */
  , 'NumPad3');
  define(97
  /* NUMPAD_4 */
  , 'NumPad4');
  define(98
  /* NUMPAD_5 */
  , 'NumPad5');
  define(99
  /* NUMPAD_6 */
  , 'NumPad6');
  define(100
  /* NUMPAD_7 */
  , 'NumPad7');
  define(101
  /* NUMPAD_8 */
  , 'NumPad8');
  define(102
  /* NUMPAD_9 */
  , 'NumPad9');
  define(103
  /* NUMPAD_MULTIPLY */
  , 'NumPad_Multiply');
  define(104
  /* NUMPAD_ADD */
  , 'NumPad_Add');
  define(105
  /* NUMPAD_SEPARATOR */
  , 'NumPad_Separator');
  define(106
  /* NUMPAD_SUBTRACT */
  , 'NumPad_Subtract');
  define(107
  /* NUMPAD_DECIMAL */
  , 'NumPad_Decimal');
  define(108
  /* NUMPAD_DIVIDE */
  , 'NumPad_Divide');
})();

var KeyCodeUtils;

(function (KeyCodeUtils) {
  function toString(keyCode) {
    return _get__("uiMap").keyCodeToStr(keyCode);
  }

  KeyCodeUtils.toString = toString;

  function fromString(key) {
    return _get__("uiMap").strToKeyCode(key);
  }

  KeyCodeUtils.fromString = fromString;

  function toUserSettingsUS(keyCode) {
    return _get__("userSettingsUSMap").keyCodeToStr(keyCode);
  }

  KeyCodeUtils.toUserSettingsUS = toUserSettingsUS;

  function toUserSettingsGeneral(keyCode) {
    return _get__("userSettingsGeneralMap").keyCodeToStr(keyCode);
  }

  KeyCodeUtils.toUserSettingsGeneral = toUserSettingsGeneral;

  function fromUserSettings(key) {
    return _get__("userSettingsUSMap").strToKeyCode(key) || _get__("userSettingsGeneralMap").strToKeyCode(key);
  }

  KeyCodeUtils.fromUserSettings = fromUserSettings;
})(_assign__("KeyCodeUtils", exports.KeyCodeUtils || (exports.KeyCodeUtils = {})));

function KeyChord(firstPart, secondPart) {
  const chordPart = (secondPart & 0x0000FFFF) << 16 >>> 0;
  return (firstPart | chordPart) >>> 0;
}

exports.KeyChord = _get__("KeyChord");

function createKeybinding(keybinding, OS) {
  if (keybinding === 0) {
    return null;
  }

  const firstPart = (keybinding & 0x0000FFFF) >>> 0;
  const chordPart = (keybinding & 0xFFFF0000) >>> 16;

  if (chordPart !== 0) {
    return new (_get__("ChordKeybinding"))([_get__("createSimpleKeybinding")(firstPart, OS), _get__("createSimpleKeybinding")(chordPart, OS)]);
  }

  return new (_get__("ChordKeybinding"))([_get__("createSimpleKeybinding")(firstPart, OS)]);
}

exports.createKeybinding = _get__("createKeybinding");

function createSimpleKeybinding(keybinding, OS) {
  const ctrlCmd = keybinding & 2048
  /* CtrlCmd */
  ? true : false;
  const winCtrl = keybinding & 256
  /* WinCtrl */
  ? true : false;
  const ctrlKey = OS === 2
  /* Macintosh */
  ? winCtrl : ctrlCmd;
  const shiftKey = keybinding & 1024
  /* Shift */
  ? true : false;
  const altKey = keybinding & 512
  /* Alt */
  ? true : false;
  const metaKey = OS === 2
  /* Macintosh */
  ? ctrlCmd : winCtrl;
  const keyCode = keybinding & 255
  /* KeyCode */
  ;
  return new (_get__("SimpleKeybinding"))(ctrlKey, shiftKey, altKey, metaKey, keyCode);
}

exports.createSimpleKeybinding = _get__("createSimpleKeybinding");

class SimpleKeybinding {
  constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyCode = keyCode;
  }

  equals(other) {
    return this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.keyCode === other.keyCode;
  }

  getHashCode() {
    const ctrl = this.ctrlKey ? '1' : '0';
    const shift = this.shiftKey ? '1' : '0';
    const alt = this.altKey ? '1' : '0';
    const meta = this.metaKey ? '1' : '0';
    return `${ctrl}${shift}${alt}${meta}${this.keyCode}`;
  }

  isModifierKey() {
    return this.keyCode === 0
    /* Unknown */
    || this.keyCode === 5
    /* Ctrl */
    || this.keyCode === 57
    /* Meta */
    || this.keyCode === 6
    /* Alt */
    || this.keyCode === 4
    /* Shift */
    ;
  }

  toChord() {
    return new (_get__("ChordKeybinding"))([this]);
  }
  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */


  isDuplicateModifierCase() {
    return this.ctrlKey && this.keyCode === 5
    /* Ctrl */
    || this.shiftKey && this.keyCode === 4
    /* Shift */
    || this.altKey && this.keyCode === 6
    /* Alt */
    || this.metaKey && this.keyCode === 57
    /* Meta */
    ;
  }

}

exports.SimpleKeybinding = _get__("SimpleKeybinding");

class ChordKeybinding {
  constructor(parts) {
    if (parts.length === 0) {
      throw (0, _get__("errors_1").illegalArgument)(`parts`);
    }

    this.parts = parts;
  }

  getHashCode() {
    let result = '';

    for (let i = 0, len = this.parts.length; i < len; i++) {
      if (i !== 0) {
        result += ';';
      }

      result += this.parts[i].getHashCode();
    }

    return result;
  }

  equals(other) {
    if (other === null) {
      return false;
    }

    if (this.parts.length !== other.parts.length) {
      return false;
    }

    for (let i = 0; i < this.parts.length; i++) {
      if (!this.parts[i].equals(other.parts[i])) {
        return false;
      }
    }

    return true;
  }

}

exports.ChordKeybinding = _get__("ChordKeybinding");

class ResolvedKeybindingPart {
  constructor(ctrlKey, shiftKey, altKey, metaKey, kbLabel, kbAriaLabel) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyLabel = kbLabel;
    this.keyAriaLabel = kbAriaLabel;
  }

}

exports.ResolvedKeybindingPart = _get__("ResolvedKeybindingPart");
/**
 * A resolved keybinding. Can be a simple keybinding or a chord keybinding.
 */

class ResolvedKeybinding {}

exports.ResolvedKeybinding = _get__("ResolvedKeybinding");

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
    case "KeyCodeStrMap":
      return KeyCodeStrMap;

    case "uiMap":
      return uiMap;

    case "userSettingsUSMap":
      return userSettingsUSMap;

    case "userSettingsGeneralMap":
      return userSettingsGeneralMap;

    case "KeyCodeUtils":
      return KeyCodeUtils;

    case "KeyChord":
      return KeyChord;

    case "ChordKeybinding":
      return ChordKeybinding;

    case "createSimpleKeybinding":
      return createSimpleKeybinding;

    case "createKeybinding":
      return createKeybinding;

    case "SimpleKeybinding":
      return SimpleKeybinding;

    case "errors_1":
      return errors_1;

    case "ResolvedKeybindingPart":
      return ResolvedKeybindingPart;

    case "ResolvedKeybinding":
      return ResolvedKeybinding;
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
    case "KeyCodeUtils":
      return KeyCodeUtils = _value;
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