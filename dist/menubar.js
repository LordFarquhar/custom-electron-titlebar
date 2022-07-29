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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.escape = exports.Menubar = void 0;

const dom_1 = require("./vs/base/browser/dom");

const mnemonic_1 = require("./mnemonic");

const keyboardEvent_1 = require("./vs/base/browser/keyboardEvent");

const keyCodes_1 = require("./vs/base/common/keyCodes");

const lifecycle_1 = require("./vs/base/common/lifecycle");

const event_1 = require("./vs/base/common/event");

const event_2 = require("./vs/base/browser/event");

const platform_1 = require("./vs/base/common/platform");

const menu_1 = require("./menu"); // we don't have typings yet for the module - so for a quick win, we require it in


const remote = require("@electron/remote");

var MenubarState;

(function (MenubarState) {
  MenubarState[MenubarState["HIDDEN"] = 0] = "HIDDEN";
  MenubarState[MenubarState["VISIBLE"] = 1] = "VISIBLE";
  MenubarState[MenubarState["FOCUSED"] = 2] = "FOCUSED";
  MenubarState[MenubarState["OPEN"] = 3] = "OPEN";
})(_get__("MenubarState") || _assign__("MenubarState", {}));

class Menubar extends _get__("lifecycle_1").Disposable {
  constructor(container, options, closeSubMenu = () => {}) {
    super();
    this.container = container;
    this.options = options; // Input-related

    this._mnemonicsInUse = false;
    this.openedViaKeyboard = false;
    this.awaitingAltRelease = false;
    this.ignoreNextMouseUp = false;
    this.menuItems = [];
    this.mnemonics = new Map();
    this.closeSubMenu = closeSubMenu;
    this._focusState = _get__("MenubarState").VISIBLE;
    this._onVisibilityChange = this._register(new (_get__("event_1").Emitter)());
    this._onFocusStateChange = this._register(new (_get__("event_1").Emitter)());

    this._register(_get__("ModifierKeyEmitter").getInstance().event(this.onModifierKeyToggled, this));

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.KEY_DOWN, e => {
      var _a;

      let event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
      let eventHandled = true;
      const key = !!e.key ? _get__("keyCodes_1").KeyCodeUtils.fromString(e.key) : 0
      /* Unknown */
      ;

      if (event.equals(15
      /* LeftArrow */
      )) {
        this.focusPrevious();
      } else if (event.equals(17
      /* RightArrow */
      )) {
        this.focusNext();
      } else if (event.equals(9
      /* Escape */
      ) && this.isFocused && !this.isOpen) {
        this.setUnfocusedState();
      } else if (!this.isOpen && !event.ctrlKey && ((_a = this.options) === null || _a === void 0 ? void 0 : _a.enableMnemonics) && this.mnemonicsInUse && this.mnemonics.has(key)) {
        const menuIndex = this.mnemonics.get(key);
        this.onMenuTriggered(menuIndex, false);
      } else {
        eventHandled = false;
      }

      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(window, _get__("dom_1").EventType.MOUSE_DOWN, () => {
      // This mouse event is outside the menubar so it counts as a focus out
      if (this.isFocused) {
        this.setUnfocusedState();
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.FOCUS_IN, e => {
      let event = e;

      if (event.relatedTarget) {
        if (!this.container.contains(event.relatedTarget)) {
          this.focusToReturn = event.relatedTarget;
        }
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.FOCUS_OUT, e => {
      let event = e;

      if (event.relatedTarget) {
        if (!this.container.contains(event.relatedTarget)) {
          this.focusToReturn = undefined;
          this.setUnfocusedState();
        }
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(window, _get__("dom_1").EventType.KEY_DOWN, e => {
      var _a;

      if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.enableMnemonics) || !e.altKey || e.ctrlKey || e.defaultPrevented) {
        return;
      }

      const key = _get__("keyCodes_1").KeyCodeUtils.fromString(e.key);

      if (!this.mnemonics.has(key)) {
        return;
      }

      this.mnemonicsInUse = true;
      this.updateMnemonicVisibility(true);
      const menuIndex = this.mnemonics.get(key);
      this.onMenuTriggered(menuIndex, false);
    }));

    this.setUnfocusedState();
    this.registerListeners();
  }

  registerListeners() {
    if (!_get__("platform_1").isMacintosh) {
      this._register((0, _get__("dom_1").addDisposableListener)(window, _get__("dom_1").EventType.RESIZE, () => {
        this.blur();
      }));
    }
  }

  setupMenubar() {
    var _a;

    const topLevelMenus = ((_a = this.options.menu) === null || _a === void 0 ? void 0 : _a.items) || [];

    this._register(this.onFocusStateChange(e => this._onFocusStateChange.fire(e)));

    this._register(this.onVisibilityChange(e => this._onVisibilityChange.fire(e)));

    topLevelMenus.forEach(menubarMenu => {
      const menuIndex = this.menuItems.length;
      const cleanMenuLabel = (0, _get__("mnemonic_1").cleanMnemonic)(menubarMenu.label);
      const buttonElement = (0, _get__("dom_1").$)('div.menubar-menu-button', {
        'role': 'menuitem',
        'tabindex': -1,
        'aria-label': cleanMenuLabel,
        'aria-haspopup': true
      });

      if (!menubarMenu.enabled) {
        (0, _get__("dom_1").addClass)(buttonElement, 'disabled');
      }

      const titleElement = (0, _get__("dom_1").$)('div.menubar-menu-title', {
        'role': 'none',
        'aria-hidden': true
      });
      buttonElement.appendChild(titleElement);
      (0, _get__("dom_1").append)(this.container, buttonElement);

      let mnemonicMatches = _get__("mnemonic_1").MENU_MNEMONIC_REGEX.exec(menubarMenu.label); // Register mnemonics


      if (mnemonicMatches) {
        let mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
        this.registerMnemonic(this.menuItems.length, mnemonic);
      }

      this.updateLabels(titleElement, buttonElement, menubarMenu.label);

      if (menubarMenu.enabled) {
        this._register((0, _get__("dom_1").addDisposableListener)(buttonElement, _get__("dom_1").EventType.KEY_UP, e => {
          let event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
          let eventHandled = true;

          if ((event.equals(18
          /* DownArrow */
          ) || event.equals(3
          /* Enter */
          )) && !this.isOpen) {
            this.focusedMenu = {
              index: menuIndex
            };
            this.openedViaKeyboard = true;
            this.focusState = _get__("MenubarState").OPEN;
          } else {
            eventHandled = false;
          }

          if (eventHandled) {
            event.preventDefault();
            event.stopPropagation();
          }
        }));

        this._register((0, _get__("dom_1").addDisposableListener)(buttonElement, _get__("dom_1").EventType.MOUSE_DOWN, e => {
          if (!this.isOpen) {
            // Open the menu with mouse down and ignore the following mouse up event
            this.ignoreNextMouseUp = true;
            this.onMenuTriggered(menuIndex, true);
          } else {
            this.ignoreNextMouseUp = false;
          }

          e.preventDefault();
          e.stopPropagation();
        }));

        this._register((0, _get__("dom_1").addDisposableListener)(buttonElement, _get__("dom_1").EventType.MOUSE_UP, () => {
          if (!this.ignoreNextMouseUp) {
            if (this.isFocused) {
              this.onMenuTriggered(menuIndex, true);
            }
          } else {
            this.ignoreNextMouseUp = false;
          }
        }));

        this._register((0, _get__("dom_1").addDisposableListener)(buttonElement, _get__("dom_1").EventType.MOUSE_ENTER, () => {
          if (this.isOpen && !this.isCurrentMenu(menuIndex)) {
            this.menuItems[menuIndex].buttonElement.focus();
            this.cleanupMenu();

            if (this.menuItems[menuIndex].submenu) {
              this.showMenu(menuIndex, false);
            }
          } else if (this.isFocused && !this.isOpen) {
            this.focusedMenu = {
              index: menuIndex
            };
            buttonElement.focus();
          }
        }));

        this.menuItems.push({
          menuItem: menubarMenu,
          submenu: menubarMenu.submenu,
          buttonElement: buttonElement,
          titleElement: titleElement
        });
      }
    });
  }

  onClick(menuIndex) {
    const item = this.menuItems[menuIndex].menuItem;

    if (item.click) {
      item.click(item, _get__("remote").getCurrentWindow());
    }
  }

  get onVisibilityChange() {
    return this._onVisibilityChange.event;
  }

  get onFocusStateChange() {
    return this._onFocusStateChange.event;
  }

  dispose() {
    super.dispose();
    this.menuItems.forEach(menuBarMenu => {
      (0, _get__("dom_1").removeNode)(menuBarMenu.titleElement);
      (0, _get__("dom_1").removeNode)(menuBarMenu.buttonElement);
    });
  }

  blur() {
    this.setUnfocusedState();
  }

  setStyles(style) {
    this.menuStyle = style;
  }

  updateLabels(titleElement, buttonElement, label) {
    if (this.options.enableMnemonics) {
      let innerHtml = _get__("escape")(label); // This is global so reset it


      _get__("mnemonic_1").MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;

      let escMatch = _get__("mnemonic_1").MENU_ESCAPED_MNEMONIC_REGEX.exec(innerHtml); // We can't use negative lookbehind so we match our negative and skip


      while (escMatch && escMatch[1]) {
        escMatch = _get__("mnemonic_1").MENU_ESCAPED_MNEMONIC_REGEX.exec(innerHtml);
      }

      if (escMatch) {
        innerHtml = `${innerHtml.substr(0, escMatch.index)}<mnemonic aria-hidden="true">${escMatch[3]}</mnemonic>${innerHtml.substr(escMatch.index + escMatch[0].length)}`;
      }

      innerHtml = innerHtml.replace(/&amp;&amp;/g, '&amp;');
      titleElement.innerHTML = innerHtml;
    } else {
      const cleanMenuLabel = (0, _get__("mnemonic_1").cleanMnemonic)(label);
      titleElement.innerHTML = cleanMenuLabel.replace(/&&/g, '&');
    }

    let mnemonicMatches = _get__("mnemonic_1").MENU_MNEMONIC_REGEX.exec(label); // Register mnemonics


    if (mnemonicMatches) {
      let mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];

      if (this.options.enableMnemonics) {
        buttonElement.setAttribute('aria-keyshortcuts', 'Alt+' + mnemonic.toLocaleLowerCase());
      } else {
        buttonElement.removeAttribute('aria-keyshortcuts');
      }
    }
  }

  registerMnemonic(menuIndex, mnemonic) {
    this.mnemonics.set(_get__("keyCodes_1").KeyCodeUtils.fromString(mnemonic), menuIndex);
  }

  hideMenubar() {
    if (this.container.style.display !== 'none') {
      this.container.style.display = 'none';
    }
  }

  showMenubar() {
    if (this.container.style.display !== 'flex') {
      this.container.style.display = 'flex';
    }
  }

  get focusState() {
    return this._focusState;
  }

  set focusState(value) {
    if (value === this._focusState) {
      return;
    }

    const isVisible = this.isVisible;
    const isOpen = this.isOpen;
    const isFocused = this.isFocused;
    this._focusState = value;

    switch (value) {
      case _get__("MenubarState").HIDDEN:
        if (isVisible) {
          this.hideMenubar();
        }

        if (isOpen) {
          this.cleanupMenu();
        }

        if (isFocused) {
          this.focusedMenu = undefined;

          if (this.focusToReturn) {
            this.focusToReturn.focus();
            this.focusToReturn = undefined;
          }
        }

        break;

      case _get__("MenubarState").VISIBLE:
        if (!isVisible) {
          this.showMenubar();
        }

        if (isOpen) {
          this.cleanupMenu();
        }

        if (isFocused) {
          if (this.focusedMenu) {
            this.menuItems[this.focusedMenu.index].buttonElement.blur();
          }

          this.focusedMenu = undefined;

          if (this.focusToReturn) {
            this.focusToReturn.focus();
            this.focusToReturn = undefined;
          }
        }

        break;

      case _get__("MenubarState").FOCUSED:
        if (!isVisible) {
          this.showMenubar();
        }

        if (isOpen) {
          this.cleanupMenu();
        }

        if (this.focusedMenu) {
          this.menuItems[this.focusedMenu.index].buttonElement.focus();
        }

        break;

      case _get__("MenubarState").OPEN:
        if (!isVisible) {
          this.showMenubar();
        }

        if (this.focusedMenu) {
          if (this.menuItems[this.focusedMenu.index].submenu) {
            this.showMenu(this.focusedMenu.index, this.openedViaKeyboard);
          }
        }

        break;
    }

    this._focusState = value;
  }

  get isVisible() {
    return this.focusState >= _get__("MenubarState").VISIBLE;
  }

  get isFocused() {
    return this.focusState >= _get__("MenubarState").FOCUSED;
  }

  get isOpen() {
    return this.focusState >= _get__("MenubarState").OPEN;
  }

  setUnfocusedState() {
    this.focusState = _get__("MenubarState").VISIBLE;
    this.ignoreNextMouseUp = false;
    this.mnemonicsInUse = false;
    this.updateMnemonicVisibility(false);
  }

  focusPrevious() {
    if (!this.focusedMenu) {
      return;
    }

    let newFocusedIndex = (this.focusedMenu.index - 1 + this.menuItems.length) % this.menuItems.length;

    if (newFocusedIndex === this.focusedMenu.index) {
      return;
    }

    if (this.isOpen) {
      this.cleanupMenu();

      if (this.menuItems[newFocusedIndex].submenu) {
        this.showMenu(newFocusedIndex);
      }
    } else if (this.isFocused) {
      this.focusedMenu.index = newFocusedIndex;
      this.menuItems[newFocusedIndex].buttonElement.focus();
    }
  }

  focusNext() {
    if (!this.focusedMenu) {
      return;
    }

    let newFocusedIndex = (this.focusedMenu.index + 1) % this.menuItems.length;

    if (newFocusedIndex === this.focusedMenu.index) {
      return;
    }

    if (this.isOpen) {
      this.cleanupMenu();

      if (this.menuItems[newFocusedIndex].submenu) {
        this.showMenu(newFocusedIndex);
      }
    } else if (this.isFocused) {
      this.focusedMenu.index = newFocusedIndex;
      this.menuItems[newFocusedIndex].buttonElement.focus();
    }
  }

  updateMnemonicVisibility(visible) {
    if (this.menuItems) {
      this.menuItems.forEach(menuBarMenu => {
        if (menuBarMenu.titleElement.children.length) {
          let child = menuBarMenu.titleElement.children.item(0);

          if (child) {
            if (visible) {
              child.style.textDecoration = 'underline';
            } else {
              child.style.removeProperty('text-decoration');
            }
          }
        }
      });
    }
  }

  get mnemonicsInUse() {
    return this._mnemonicsInUse;
  }

  set mnemonicsInUse(value) {
    this._mnemonicsInUse = value;
  }

  onMenuTriggered(menuIndex, clicked) {
    if (this.isOpen) {
      if (this.isCurrentMenu(menuIndex)) {
        this.setUnfocusedState();
      } else {
        this.cleanupMenu();

        if (this.menuItems[menuIndex].submenu) {
          this.showMenu(menuIndex, this.openedViaKeyboard);
        } else {
          if (this.menuItems[menuIndex].menuItem.enabled) {
            this.onClick(menuIndex);
          }
        }
      }
    } else {
      this.focusedMenu = {
        index: menuIndex
      };
      this.openedViaKeyboard = !clicked;

      if (this.menuItems[menuIndex].submenu) {
        this.focusState = _get__("MenubarState").OPEN;
      }

      if (this.menuItems[menuIndex].menuItem.enabled) {
        this.onClick(menuIndex);
      }
    }
  }

  onModifierKeyToggled(modifierKeyStatus) {
    const allModifiersReleased = !modifierKeyStatus.altKey && !modifierKeyStatus.ctrlKey && !modifierKeyStatus.shiftKey; // Alt key pressed while menu is focused. This should return focus away from the menubar

    if (this.isFocused && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.altKey) {
      this.setUnfocusedState();
      this.mnemonicsInUse = false;
      this.awaitingAltRelease = true;
    } // Clean alt key press and release


    if (allModifiersReleased && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.lastKeyReleased === 'alt') {
      if (!this.awaitingAltRelease) {
        if (!this.isFocused) {
          this.mnemonicsInUse = true;
          this.focusedMenu = {
            index: 0
          };
          this.focusState = _get__("MenubarState").FOCUSED;
        } else if (!this.isOpen) {
          this.setUnfocusedState();
        }
      }
    } // Alt key released


    if (!modifierKeyStatus.altKey && modifierKeyStatus.lastKeyReleased === 'alt') {
      this.awaitingAltRelease = false;
    }

    if (this.options.enableMnemonics && this.menuItems && !this.isOpen) {
      this.updateMnemonicVisibility(!this.awaitingAltRelease && modifierKeyStatus.altKey || this.mnemonicsInUse);
    }
  }

  isCurrentMenu(menuIndex) {
    if (!this.focusedMenu) {
      return false;
    }

    return this.focusedMenu.index === menuIndex;
  }

  cleanupMenu() {
    if (this.focusedMenu) {
      // Remove focus from the menus first
      this.menuItems[this.focusedMenu.index].buttonElement.focus();

      if (this.focusedMenu.holder) {
        if (this.focusedMenu.holder.parentElement) {
          (0, _get__("dom_1").removeClass)(this.focusedMenu.holder.parentElement, 'open');
        }

        this.focusedMenu.holder.remove();
      }

      if (this.focusedMenu.widget) {
        this.focusedMenu.widget.dispose();
      }

      this.focusedMenu = {
        index: this.focusedMenu.index
      };
    }
  }

  showMenu(menuIndex, selectFirst = true) {
    var _a;

    const customMenu = this.menuItems[menuIndex];
    const menuHolder = (0, _get__("dom_1").$)('ul.menubar-menu-container');
    (0, _get__("dom_1").addClass)(customMenu.buttonElement, 'open');
    menuHolder.setAttribute('role', 'menu');
    menuHolder.tabIndex = 0;
    menuHolder.style.top = `${customMenu.buttonElement.getBoundingClientRect().bottom}px`;
    menuHolder.style.left = `${customMenu.buttonElement.getBoundingClientRect().left}px`;
    customMenu.buttonElement.appendChild(menuHolder);
    let menuOptions = {
      enableMnemonics: this.mnemonicsInUse && this.options.enableMnemonics,
      //ariaLabel: customMenu.buttonElement.attributes['aria-label'].value
      ariaLabel: customMenu.buttonElement.getAttribute('aria-label') || undefined
    };
    let menuWidget = new (_get__("menu_1").CETMenu)(menuHolder, menuOptions, this.closeSubMenu);
    menuWidget.createMenu(((_a = customMenu.submenu) === null || _a === void 0 ? void 0 : _a.items) || []);
    menuWidget.style(this.menuStyle || {});

    this._register(menuWidget.onDidCancel(() => {
      this.focusState = _get__("MenubarState").FOCUSED;
    }));

    menuWidget.focus(selectFirst);
    this.focusedMenu = {
      index: menuIndex,
      holder: menuHolder,
      widget: menuWidget
    };
  }

}

exports.Menubar = _get__("Menubar");

class ModifierKeyEmitter extends _get__("event_1").Emitter {
  constructor() {
    super();
    this._subscriptions = [];
    this._keyStatus = {
      altKey: false,
      shiftKey: false,
      ctrlKey: false
    };

    this._subscriptions.push((0, _get__("event_2").domEvent)(document.body, 'keydown', true)(e => {
      const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);

      if (e.altKey && !this._keyStatus.altKey) {
        this._keyStatus.lastKeyPressed = 'alt';
      } else if (e.ctrlKey && !this._keyStatus.ctrlKey) {
        this._keyStatus.lastKeyPressed = 'ctrl';
      } else if (e.shiftKey && !this._keyStatus.shiftKey) {
        this._keyStatus.lastKeyPressed = 'shift';
      } else if (event.keyCode !== 6
      /* Alt */
      ) {
        this._keyStatus.lastKeyPressed = undefined;
      } else {
        return;
      }

      this._keyStatus.altKey = e.altKey;
      this._keyStatus.ctrlKey = e.ctrlKey;
      this._keyStatus.shiftKey = e.shiftKey;

      if (this._keyStatus.lastKeyPressed) {
        this.fire(this._keyStatus);
      }
    }));

    this._subscriptions.push((0, _get__("event_2").domEvent)(document.body, 'keyup', true)(e => {
      if (!e.altKey && this._keyStatus.altKey) {
        this._keyStatus.lastKeyReleased = 'alt';
      } else if (!e.ctrlKey && this._keyStatus.ctrlKey) {
        this._keyStatus.lastKeyReleased = 'ctrl';
      } else if (!e.shiftKey && this._keyStatus.shiftKey) {
        this._keyStatus.lastKeyReleased = 'shift';
      } else {
        this._keyStatus.lastKeyReleased = undefined;
      }

      if (this._keyStatus.lastKeyPressed !== this._keyStatus.lastKeyReleased) {
        this._keyStatus.lastKeyPressed = undefined;
      }

      this._keyStatus.altKey = e.altKey;
      this._keyStatus.ctrlKey = e.ctrlKey;
      this._keyStatus.shiftKey = e.shiftKey;

      if (this._keyStatus.lastKeyReleased) {
        this.fire(this._keyStatus);
      }
    }));

    this._subscriptions.push((0, _get__("event_2").domEvent)(document.body, 'mousedown', true)(() => {
      this._keyStatus.lastKeyPressed = undefined;
    }));

    this._subscriptions.push((0, _get__("event_2").domEvent)(window, 'blur')(() => {
      this._keyStatus.lastKeyPressed = undefined;
      this._keyStatus.lastKeyReleased = undefined;
      this._keyStatus.altKey = false;
      this._keyStatus.shiftKey = false;
      this._keyStatus.shiftKey = false;
      this.fire(this._keyStatus);
    }));
  }

  static getInstance() {
    if (!_get__("ModifierKeyEmitter").instance) {
      _get__("ModifierKeyEmitter").instance = new (_get__("ModifierKeyEmitter"))();
    }

    return _get__("ModifierKeyEmitter").instance;
  }

  dispose() {
    super.dispose();
    this._subscriptions = (0, _get__("lifecycle_1").dispose)(this._subscriptions);
  }

}

function escape(html) {
  return html.replace(/[<>&]/g, function (match) {
    switch (match) {
      case '<':
        return '&lt;';

      case '>':
        return '&gt;';

      case '&':
        return '&amp;';

      default:
        return match;
    }
  });
}

exports.escape = _get__("escape");

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
    case "MenubarState":
      return MenubarState;

    case "event_1":
      return event_1;

    case "ModifierKeyEmitter":
      return ModifierKeyEmitter;

    case "dom_1":
      return dom_1;

    case "keyboardEvent_1":
      return keyboardEvent_1;

    case "keyCodes_1":
      return keyCodes_1;

    case "platform_1":
      return platform_1;

    case "mnemonic_1":
      return mnemonic_1;

    case "remote":
      return remote;

    case "escape":
      return escape;

    case "menu_1":
      return menu_1;

    case "lifecycle_1":
      return lifecycle_1;

    case "Menubar":
      return Menubar;

    case "event_2":
      return event_2;
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
    case "MenubarState":
      return MenubarState = _value;
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