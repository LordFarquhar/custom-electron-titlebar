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
exports.StandardKeyboardEvent = exports.getCodeForKeyCode = void 0;

const browser = _get__("__importStar")(require("./browser"));

const keyCodes_1 = require("../common/keyCodes");

const platform = _get__("__importStar")(require("../common/platform"));

let KEY_CODE_MAP = new Array(230);
let INVERSE_KEY_CODE_MAP = new Array(112
/* MAX_VALUE */
);

(function () {
  for (let i = 0; i < _get__("INVERSE_KEY_CODE_MAP").length; i++) {
    _get__("INVERSE_KEY_CODE_MAP")[i] = -1;
  }

  function define(code, keyCode) {
    _get__("KEY_CODE_MAP")[code] = keyCode;
    _get__("INVERSE_KEY_CODE_MAP")[keyCode] = code;
  }

  define(3, 7
  /* PauseBreak */
  ); // VK_CANCEL 0x03 Control-break processing

  define(8, 1
  /* Backspace */
  );
  define(9, 2
  /* Tab */
  );
  define(13, 3
  /* Enter */
  );
  define(16, 4
  /* Shift */
  );
  define(17, 5
  /* Ctrl */
  );
  define(18, 6
  /* Alt */
  );
  define(19, 7
  /* PauseBreak */
  );
  define(20, 8
  /* CapsLock */
  );
  define(27, 9
  /* Escape */
  );
  define(32, 10
  /* Space */
  );
  define(33, 11
  /* PageUp */
  );
  define(34, 12
  /* PageDown */
  );
  define(35, 13
  /* End */
  );
  define(36, 14
  /* Home */
  );
  define(37, 15
  /* LeftArrow */
  );
  define(38, 16
  /* UpArrow */
  );
  define(39, 17
  /* RightArrow */
  );
  define(40, 18
  /* DownArrow */
  );
  define(45, 19
  /* Insert */
  );
  define(46, 20
  /* Delete */
  );
  define(48, 21
  /* KEY_0 */
  );
  define(49, 22
  /* KEY_1 */
  );
  define(50, 23
  /* KEY_2 */
  );
  define(51, 24
  /* KEY_3 */
  );
  define(52, 25
  /* KEY_4 */
  );
  define(53, 26
  /* KEY_5 */
  );
  define(54, 27
  /* KEY_6 */
  );
  define(55, 28
  /* KEY_7 */
  );
  define(56, 29
  /* KEY_8 */
  );
  define(57, 30
  /* KEY_9 */
  );
  define(65, 31
  /* KEY_A */
  );
  define(66, 32
  /* KEY_B */
  );
  define(67, 33
  /* KEY_C */
  );
  define(68, 34
  /* KEY_D */
  );
  define(69, 35
  /* KEY_E */
  );
  define(70, 36
  /* KEY_F */
  );
  define(71, 37
  /* KEY_G */
  );
  define(72, 38
  /* KEY_H */
  );
  define(73, 39
  /* KEY_I */
  );
  define(74, 40
  /* KEY_J */
  );
  define(75, 41
  /* KEY_K */
  );
  define(76, 42
  /* KEY_L */
  );
  define(77, 43
  /* KEY_M */
  );
  define(78, 44
  /* KEY_N */
  );
  define(79, 45
  /* KEY_O */
  );
  define(80, 46
  /* KEY_P */
  );
  define(81, 47
  /* KEY_Q */
  );
  define(82, 48
  /* KEY_R */
  );
  define(83, 49
  /* KEY_S */
  );
  define(84, 50
  /* KEY_T */
  );
  define(85, 51
  /* KEY_U */
  );
  define(86, 52
  /* KEY_V */
  );
  define(87, 53
  /* KEY_W */
  );
  define(88, 54
  /* KEY_X */
  );
  define(89, 55
  /* KEY_Y */
  );
  define(90, 56
  /* KEY_Z */
  );
  define(93, 58
  /* ContextMenu */
  );
  define(96, 93
  /* NUMPAD_0 */
  );
  define(97, 94
  /* NUMPAD_1 */
  );
  define(98, 95
  /* NUMPAD_2 */
  );
  define(99, 96
  /* NUMPAD_3 */
  );
  define(100, 97
  /* NUMPAD_4 */
  );
  define(101, 98
  /* NUMPAD_5 */
  );
  define(102, 99
  /* NUMPAD_6 */
  );
  define(103, 100
  /* NUMPAD_7 */
  );
  define(104, 101
  /* NUMPAD_8 */
  );
  define(105, 102
  /* NUMPAD_9 */
  );
  define(106, 103
  /* NUMPAD_MULTIPLY */
  );
  define(107, 104
  /* NUMPAD_ADD */
  );
  define(108, 105
  /* NUMPAD_SEPARATOR */
  );
  define(109, 106
  /* NUMPAD_SUBTRACT */
  );
  define(110, 107
  /* NUMPAD_DECIMAL */
  );
  define(111, 108
  /* NUMPAD_DIVIDE */
  );
  define(112, 59
  /* F1 */
  );
  define(113, 60
  /* F2 */
  );
  define(114, 61
  /* F3 */
  );
  define(115, 62
  /* F4 */
  );
  define(116, 63
  /* F5 */
  );
  define(117, 64
  /* F6 */
  );
  define(118, 65
  /* F7 */
  );
  define(119, 66
  /* F8 */
  );
  define(120, 67
  /* F9 */
  );
  define(121, 68
  /* F10 */
  );
  define(122, 69
  /* F11 */
  );
  define(123, 70
  /* F12 */
  );
  define(124, 71
  /* F13 */
  );
  define(125, 72
  /* F14 */
  );
  define(126, 73
  /* F15 */
  );
  define(127, 74
  /* F16 */
  );
  define(128, 75
  /* F17 */
  );
  define(129, 76
  /* F18 */
  );
  define(130, 77
  /* F19 */
  );
  define(144, 78
  /* NumLock */
  );
  define(145, 79
  /* ScrollLock */
  );
  define(186, 80
  /* US_SEMICOLON */
  );
  define(187, 81
  /* US_EQUAL */
  );
  define(188, 82
  /* US_COMMA */
  );
  define(189, 83
  /* US_MINUS */
  );
  define(190, 84
  /* US_DOT */
  );
  define(191, 85
  /* US_SLASH */
  );
  define(192, 86
  /* US_BACKTICK */
  );
  define(193, 110
  /* ABNT_C1 */
  );
  define(194, 111
  /* ABNT_C2 */
  );
  define(219, 87
  /* US_OPEN_SQUARE_BRACKET */
  );
  define(220, 88
  /* US_BACKSLASH */
  );
  define(221, 89
  /* US_CLOSE_SQUARE_BRACKET */
  );
  define(222, 90
  /* US_QUOTE */
  );
  define(223, 91
  /* OEM_8 */
  );
  define(226, 92
  /* OEM_102 */
  );
  /**
   * https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
   * If an Input Method Editor is processing key input and the event is keydown, return 229.
   */

  define(229, 109
  /* KEY_IN_COMPOSITION */
  );

  if (_get__("browser").isFirefox) {
    define(59, 80
    /* US_SEMICOLON */
    );
    define(107, 81
    /* US_EQUAL */
    );
    define(109, 83
    /* US_MINUS */
    );

    if (_get__("platform").isMacintosh) {
      define(224, 57
      /* Meta */
      );
    }
  } else if (_get__("browser").isWebKit) {
    define(91, 57
    /* Meta */
    );

    if (_get__("platform").isMacintosh) {
      // the two meta keys in the Mac have different key codes (91 and 93)
      define(93, 57
      /* Meta */
      );
    } else {
      define(92, 57
      /* Meta */
      );
    }
  }
})();

function extractKeyCode(e) {
  if (e.charCode) {
    // "keypress" events mostly
    let char = String.fromCharCode(e.charCode).toUpperCase();
    return _get__("keyCodes_1").KeyCodeUtils.fromString(char);
  }

  return _get__("KEY_CODE_MAP")[e.keyCode] || 0
  /* Unknown */
  ;
}

function getCodeForKeyCode(keyCode) {
  return _get__("INVERSE_KEY_CODE_MAP")[keyCode];
}

exports.getCodeForKeyCode = _get__("getCodeForKeyCode");
const ctrlKeyMod = _get__("platform").isMacintosh ? 256
/* WinCtrl */
: 2048
/* CtrlCmd */
;
const altKeyMod = 512
/* Alt */
;
const shiftKeyMod = 1024
/* Shift */
;
const metaKeyMod = _get__("platform").isMacintosh ? 2048
/* CtrlCmd */
: 256
/* WinCtrl */
;

class StandardKeyboardEvent {
  constructor(source) {
    this._standardKeyboardEventBrand = true;
    let e = source;
    this.browserEvent = e;
    this.target = e.target;
    this.ctrlKey = e.ctrlKey;
    this.shiftKey = e.shiftKey;
    this.altKey = e.altKey;
    this.metaKey = e.metaKey;
    this.keyCode = _get__("extractKeyCode")(e);
    this.code = e.code; // console.info(e.type + ": keyCode: " + e.keyCode + ", which: " + e.which + ", charCode: " + e.charCode + ", detail: " + e.detail + " ====> " + this.keyCode + ' -- ' + KeyCode[this.keyCode]);

    this.ctrlKey = this.ctrlKey || this.keyCode === 5
    /* Ctrl */
    ;
    this.altKey = this.altKey || this.keyCode === 6
    /* Alt */
    ;
    this.shiftKey = this.shiftKey || this.keyCode === 4
    /* Shift */
    ;
    this.metaKey = this.metaKey || this.keyCode === 57
    /* Meta */
    ;
    this._asKeybinding = this._computeKeybinding();
    this._asRuntimeKeybinding = this._computeRuntimeKeybinding(); // console.log(`code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`);
  }

  preventDefault() {
    if (this.browserEvent && this.browserEvent.preventDefault) {
      this.browserEvent.preventDefault();
    }
  }

  stopPropagation() {
    if (this.browserEvent && this.browserEvent.stopPropagation) {
      this.browserEvent.stopPropagation();
    }
  }

  toKeybinding() {
    return this._asRuntimeKeybinding;
  }

  equals(other) {
    return this._asKeybinding === other;
  }

  _computeKeybinding() {
    let key = 0
    /* Unknown */
    ;

    if (this.keyCode !== 5
    /* Ctrl */
    && this.keyCode !== 4
    /* Shift */
    && this.keyCode !== 6
    /* Alt */
    && this.keyCode !== 57
    /* Meta */
    ) {
      key = this.keyCode;
    }

    let result = 0;

    if (this.ctrlKey) {
      result |= _get__("ctrlKeyMod");
    }

    if (this.altKey) {
      result |= _get__("altKeyMod");
    }

    if (this.shiftKey) {
      result |= _get__("shiftKeyMod");
    }

    if (this.metaKey) {
      result |= _get__("metaKeyMod");
    }

    result |= key;
    return result;
  }

  _computeRuntimeKeybinding() {
    let key = 0
    /* Unknown */
    ;

    if (this.keyCode !== 5
    /* Ctrl */
    && this.keyCode !== 4
    /* Shift */
    && this.keyCode !== 6
    /* Alt */
    && this.keyCode !== 57
    /* Meta */
    ) {
      key = this.keyCode;
    }

    return new (_get__("keyCodes_1").SimpleKeybinding)(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key);
  }

}

exports.StandardKeyboardEvent = _get__("StandardKeyboardEvent");

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

    case "INVERSE_KEY_CODE_MAP":
      return INVERSE_KEY_CODE_MAP;

    case "KEY_CODE_MAP":
      return KEY_CODE_MAP;

    case "browser":
      return browser;

    case "platform":
      return platform;

    case "keyCodes_1":
      return keyCodes_1;

    case "getCodeForKeyCode":
      return getCodeForKeyCode;

    case "extractKeyCode":
      return extractKeyCode;

    case "ctrlKeyMod":
      return ctrlKeyMod;

    case "altKeyMod":
      return altKeyMod;

    case "shiftKeyMod":
      return shiftKeyMod;

    case "metaKeyMod":
      return metaKeyMod;

    case "StandardKeyboardEvent":
      return StandardKeyboardEvent;
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