"use strict";
/*--------------------------------------------------------------------------------------------------------
 *  This file has been modified by @AlexTorresSk (http://github.com/AlexTorresSk)
 *  to work in custom-electron-titlebar.
 *
 *  The original copy of this file and its respective license are in https://github.com/Microsoft/vscode/
 *
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 *-------------------------------------------------------------------------------------------------------*/

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
exports.CETMenuItem = void 0;

const dom_1 = require("./vs/base/browser/dom");

const remote_1 = require("@electron/remote");

const mnemonic_1 = require("./mnemonic");

const keyCodes_1 = require("./vs/base/common/keyCodes");

const lifecycle_1 = require("./vs/base/common/lifecycle");

const platform_1 = require("./vs/base/common/platform");

const strings = _get__("__importStar")(require("./vs/base/common/strings"));

const touch_1 = require("./vs/base/browser/touch");

let menuItemId = 0;

class CETMenuItem extends _get__("lifecycle_1").Disposable {
  constructor(item, options = {}, closeSubMenu = () => {}) {
    super();
    this.item = item;
    this.options = options;
    this.options.icon = options.icon !== undefined ? options.icon : false;
    this.options.label = options.label !== undefined ? options.label : true;
    this.currentWindow = (0, _get__("remote_1").getCurrentWindow)();
    this.closeSubMenu = closeSubMenu; // Set mnemonic

    if (this.options.label && options.enableMnemonics) {
      let label = this.item.label;

      if (label) {
        const matches = _get__("mnemonic_1").MENU_MNEMONIC_REGEX.exec(label);

        if (matches) {
          this.mnemonic = _get__("keyCodes_1").KeyCodeUtils.fromString((!!matches[1] ? matches[1] : matches[3]).toLocaleUpperCase());
        }
      }
    } //this.item._id = menuItemId++;

  }

  getContainer() {
    return this.container;
  }

  isEnabled() {
    return this.item.enabled;
  }

  isSeparator() {
    return this.item.type === 'separator';
  }

  render(container) {
    if (!container) return;
    this.container = container;

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("touch_1").EventType.Tap, e => this.onClick(e)));

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.MOUSE_DOWN, e => {
      if (this.item.enabled && e.button === 0) {
        this.container.classList.add('active');
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.CLICK, e => {
      if (this.item.enabled) {
        this.onClick(e);
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.DBLCLICK, e => {
      _get__("dom_1").EventHelper.stop(e, true);
    }));

    [_get__("dom_1").EventType.MOUSE_UP, _get__("dom_1").EventType.MOUSE_OUT].forEach(event => {
      this._register((0, _get__("dom_1").addDisposableListener)(this.container, event, e => {
        _get__("dom_1").EventHelper.stop(e);

        this.container.classList.remove('active');
      }));
    });
    this.itemElement = (0, _get__("dom_1").append)(this.container, (0, _get__("dom_1").$)('a.action-menu-item'));
    this.itemElement.setAttribute('role', 'menuitem');

    if (this.mnemonic) {
      this.itemElement.setAttribute('aria-keyshortcuts', `${this.mnemonic}`);
    }

    this.checkElement = (0, _get__("dom_1").append)(this.itemElement, (0, _get__("dom_1").$)('span.menu-item-check'));
    this.checkElement.setAttribute('role', 'none');
    this.iconElement = (0, _get__("dom_1").append)(this.itemElement, (0, _get__("dom_1").$)('span.menu-item-icon'));
    this.iconElement.setAttribute('role', 'none');
    this.labelElement = (0, _get__("dom_1").append)(this.itemElement, (0, _get__("dom_1").$)('span.action-label'));
    this.setAccelerator();
    this.updateLabel();
    this.updateIcon();
    this.updateTooltip();
    this.updateEnabled();
    this.updateChecked();
    this.updateVisibility();
  }

  onClick(event) {
    _get__("dom_1").EventHelper.stop(event, true);

    if (this.item.click) {
      this.item.click(this.item, this.currentWindow, this.event);
    }

    if (this.item.type === 'checkbox') {
      this.item.checked = !this.item.checked;
      this.updateChecked();
    }

    this.closeSubMenu();
  }

  focus() {
    if (this.container) {
      this.container.focus();
      (0, _get__("dom_1").addClass)(this.container, 'focused');
    }

    this.applyStyle();
  }

  blur() {
    if (this.container) {
      this.container.blur();
      (0, _get__("dom_1").removeClass)(this.container, 'focused');
    }

    this.applyStyle();
  }

  setAccelerator() {
    let accelerator = null;

    if (this.item.role) {
      switch (this.item.role.toLocaleLowerCase()) {
        case 'undo':
          accelerator = 'CtrlOrCmd+Z';
          break;

        case 'redo':
          accelerator = 'CtrlOrCmd+Y';
          break;

        case 'cut':
          accelerator = 'CtrlOrCmd+X';
          break;

        case 'copy':
          accelerator = 'CtrlOrCmd+C';
          break;

        case 'paste':
          accelerator = 'CtrlOrCmd+V';
          break;

        case 'selectall':
          accelerator = 'CtrlOrCmd+A';
          break;

        case 'minimize':
          accelerator = 'CtrlOrCmd+M';
          break;

        case 'close':
          accelerator = 'CtrlOrCmd+W';
          break;

        case 'reload':
          accelerator = 'CtrlOrCmd+R';
          break;

        case 'forcereload':
          accelerator = 'CtrlOrCmd+Shift+R';
          break;

        case 'toggledevtools':
          accelerator = 'CtrlOrCmd+Shift+I';
          break;

        case 'togglefullscreen':
          accelerator = 'F11';
          break;

        case 'resetzoom':
          accelerator = 'CtrlOrCmd+0';
          break;

        case 'zoomin':
          accelerator = 'CtrlOrCmd+Shift+=';
          break;

        case 'zoomout':
          accelerator = 'CtrlOrCmd+-';
          break;
      }
    }

    if (this.item.label && this.item.accelerator) {
      accelerator = this.item.accelerator;
    }

    if (this.itemElement && accelerator !== null) {
      (0, _get__("dom_1").append)(this.itemElement, (0, _get__("dom_1").$)('span.keybinding')).textContent = _get__("parseAccelerator")(accelerator);
    }
  }

  updateLabel() {
    if (this.item.label) {
      let label = this.item.label;

      if (label) {
        const cleanLabel = (0, _get__("mnemonic_1").cleanMnemonic)(label);

        if (!this.options.enableMnemonics) {
          label = cleanLabel;
        }

        if (this.labelElement) {
          this.labelElement.setAttribute('aria-label', cleanLabel.replace(/&&/g, '&'));
        }

        const matches = _get__("mnemonic_1").MENU_MNEMONIC_REGEX.exec(label);

        if (matches) {
          label = _get__("strings").escape(label); // This is global, reset it

          _get__("mnemonic_1").MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;

          let escMatch = _get__("mnemonic_1").MENU_ESCAPED_MNEMONIC_REGEX.exec(label); // We can't use negative lookbehind so if we match our negative and skip


          while (escMatch && escMatch[1]) {
            escMatch = _get__("mnemonic_1").MENU_ESCAPED_MNEMONIC_REGEX.exec(label);
          }

          const replaceDoubleEscapes = str => str.replace(/&amp;&amp;/g, '&amp;');

          if (escMatch) {
            label = `${label.substr(0, escMatch.index)}<u aria-hidden="true">${escMatch[3]}</u>${label.substr(escMatch.index + escMatch[0].length)}`;
          } else {}

          label = label.replace(/&amp;&amp;/g, '&amp;');

          if (this.itemElement) {
            this.itemElement.setAttribute('aria-keyshortcuts', (!!matches[1] ? matches[1] : matches[3]).toLocaleLowerCase());
          }
        } else {
          label = label.replace(/&&/g, '&');
        }
      }

      if (this.labelElement) {
        this.labelElement.innerHTML = label.trim();
      }
    }
  }

  updateIcon() {
    let icon = null;

    if (this.item.icon) {
      icon = this.item.icon;
    }

    if (this.iconElement && icon) {
      const iconE = (0, _get__("dom_1").append)(this.iconElement, (0, _get__("dom_1").$)('img'));
      iconE.setAttribute('src', icon.toString());
    }
  }

  updateTooltip() {
    let title = null;

    if (this.item.sublabel) {
      title = this.item.sublabel;
    } else if (!this.item.label && this.item.label && this.item.icon) {
      title = this.item.label;

      if (this.item.accelerator) {
        title = _get__("parseAccelerator")(this.item.accelerator);
      }
    }

    if (this.itemElement && title) {
      this.itemElement.title = title;
    }
  }

  updateEnabled() {
    if (!this.container) return;

    if (this.item.enabled && this.item.type !== 'separator') {
      (0, _get__("dom_1").removeClass)(this.container, 'disabled');
      this.container.tabIndex = 0;
    } else {
      (0, _get__("dom_1").addClass)(this.container, 'disabled');
    }
  }

  updateVisibility() {
    if (!this.item.visible && this.itemElement) {
      this.itemElement.remove();
    }
  }

  updateChecked() {
    if (!this.itemElement) return;

    if (this.item.checked) {
      this.itemElement.classList.add('checked');
      this.itemElement.setAttribute('role', 'menuitemcheckbox');
      this.itemElement.setAttribute('aria-checked', 'true');
    } else {
      this.itemElement.classList.remove('checked');
      this.itemElement.setAttribute('role', 'menuitem');
      this.itemElement.setAttribute('aria-checked', 'false');
    }
  }

  dispose() {
    if (this.itemElement) {
      this.itemElement.remove();
      this.itemElement = undefined;
    }

    super.dispose();
  }

  getMnemonic() {
    return this.mnemonic;
  }

  applyStyle() {
    if (!this.menuStyle) {
      return;
    }

    const isSelected = this.container && this.container.classList.contains('focused');
    const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;
    const bgColor = isSelected && this.menuStyle.selectionBackgroundColor ? this.menuStyle.selectionBackgroundColor : this.menuStyle.backgroundColor;

    if (!this.checkElement || !this.itemElement) {
      return;
    }

    if (fgColor) {
      this.itemElement.style.color = fgColor.toString();
      this.checkElement.style.backgroundColor = fgColor.toString();
    } else {
      this.itemElement.style.removeProperty('color');
      this.checkElement.style.removeProperty('background-color');
    }

    if (bgColor) {
      this.itemElement.style.backgroundColor = bgColor.toString();
    } else {
      this.itemElement.style.removeProperty('background-color');
    }
  }

  style(style) {
    this.menuStyle = style;
    this.applyStyle();
  }

}

exports.CETMenuItem = _get__("CETMenuItem");

function parseAccelerator(a) {
  let accelerator;

  if (!_get__("platform_1").isMacintosh) {
    accelerator = a.replace(/(Cmd)|(Command)/gi, '');
  } else {
    accelerator = a.replace(/(Ctrl)|(Control)/gi, '');
  }

  accelerator = accelerator.replace(/(Or)/gi, '');
  return accelerator;
}

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

    case "remote_1":
      return remote_1;

    case "mnemonic_1":
      return mnemonic_1;

    case "keyCodes_1":
      return keyCodes_1;

    case "dom_1":
      return dom_1;

    case "touch_1":
      return touch_1;

    case "parseAccelerator":
      return parseAccelerator;

    case "strings":
      return strings;

    case "lifecycle_1":
      return lifecycle_1;

    case "CETMenuItem":
      return CETMenuItem;

    case "platform_1":
      return platform_1;
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