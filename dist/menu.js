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
exports.CETMenu = void 0;

const dom_1 = require("./vs/base/browser/dom");

const keyCodes_1 = require("./vs/base/common/keyCodes");

const platform_1 = require("./vs/base/common/platform");

const keyboardEvent_1 = require("./vs/base/browser/keyboardEvent");

const menuitem_1 = require("./menuitem");

const lifecycle_1 = require("./vs/base/common/lifecycle");

const event_1 = require("./vs/base/common/event");

const async_1 = require("./vs/base/common/async");

class CETMenu extends _get__("lifecycle_1").Disposable {
  constructor(container, options = {}, closeSubMenu = () => {}) {
    super();
    this.triggerKeys = {
      keys: [3
      /* Enter */
      , 10
      /* Space */
      ],
      keyDown: true
    };
    this.parentData = {
      parent: this
    };
    this._onDidCancel = this._register(new (_get__("event_1").Emitter)());
    this.menuContainer = container;
    this.options = options;
    this.closeSubMenu = closeSubMenu;
    this.items = [];
    this.focusedItem = undefined;
    this.mnemonics = new Map();

    this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.KEY_DOWN, e => {
      const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);
      let eventHandled = true;

      if (event.equals(16
      /* UpArrow */
      )) {
        this.focusPrevious();
      } else if (event.equals(18
      /* DownArrow */
      )) {
        this.focusNext();
      } else if (event.equals(9
      /* Escape */
      )) {
        this.cancel();
      } else if (this.isTriggerKeyEvent(event)) {
        // Staying out of the else branch even if not triggered
        if (this.triggerKeys && this.triggerKeys.keyDown) {
          this.doTrigger(event);
        }
      } else {
        eventHandled = false;
      }

      if (eventHandled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.KEY_UP, e => {
      const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e); // Run action on Enter/Space

      if (this.isTriggerKeyEvent(event)) {
        if (this.triggerKeys && !this.triggerKeys.keyDown) {
          this.doTrigger(event);
        }

        event.preventDefault();
        event.stopPropagation();
      } // Recompute focused item
      else if (event.equals(2
      /* Tab */
      ) || event.equals(1024
      /* Shift */
      | 2
      /* Tab */
      )) {
        this.updateFocusedItem();
      }
    }));

    if (options.enableMnemonics) {
      this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.KEY_DOWN, e => {
        const key = _get__("keyCodes_1").KeyCodeUtils.fromString(e.key);

        if (this.mnemonics.has(key)) {
          const items = this.mnemonics.get(key);

          if (items.length === 1) {
            if (items[0] instanceof _get__("Submenu")) {
              this.focusItemByElement(items[0].getContainer());
            }

            items[0].onClick(e);
          }

          if (items.length > 1) {
            const item = items.shift();

            if (item) {
              this.focusItemByElement(item.getContainer());
              items.push(item);
            }

            this.mnemonics.set(key, items);
          }
        }
      }));
    }

    if (_get__("platform_1").isLinux) {
      this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.KEY_DOWN, e => {
        const event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);

        if (event.equals(14
        /* Home */
        ) || event.equals(11
        /* PageUp */
        )) {
          this.focusedItem = this.items.length - 1;
          this.focusNext();

          _get__("dom_1").EventHelper.stop(e, true);
        } else if (event.equals(13
        /* End */
        ) || event.equals(12
        /* PageDown */
        )) {
          this.focusedItem = 0;
          this.focusPrevious();

          _get__("dom_1").EventHelper.stop(e, true);
        }
      }));
    }

    this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.MOUSE_OUT, e => {
      let relatedTarget = e.relatedTarget;

      if (!(0, _get__("dom_1").isAncestor)(relatedTarget, this.menuContainer)) {
        this.focusedItem = undefined;
        this.updateFocus();
        e.stopPropagation();
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.MOUSE_UP, e => {
      // Absorb clicks in menu dead space https://github.com/Microsoft/vscode/issues/63575
      _get__("dom_1").EventHelper.stop(e, true);
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.menuContainer, _get__("dom_1").EventType.MOUSE_OVER, e => {
      let target = e.target;

      if (!target || !(0, _get__("dom_1").isAncestor)(target, this.menuContainer) || target === this.menuContainer) {
        return;
      }

      while (target.parentElement !== this.menuContainer && target.parentElement !== null) {
        target = target.parentElement;
      }

      if ((0, _get__("dom_1").hasClass)(target, 'action-item')) {
        const lastFocusedItem = this.focusedItem;
        this.setFocusedItem(target);

        if (lastFocusedItem !== this.focusedItem) {
          this.updateFocus();
        }
      }
    }));

    if (this.options.ariaLabel) {
      this.menuContainer.setAttribute('aria-label', this.options.ariaLabel);
    } //container.style.maxHeight = `${Math.max(10, window.innerHeight - container.getBoundingClientRect().top - 70)}px`;

  }

  get onDidCancel() {
    return this._onDidCancel.event;
  }

  setAriaLabel(label) {
    if (label) {
      this.menuContainer.setAttribute('aria-label', label);
    } else {
      this.menuContainer.removeAttribute('aria-label');
    }
  }

  isTriggerKeyEvent(event) {
    let ret = false;

    if (this.triggerKeys) {
      this.triggerKeys.keys.forEach(keyCode => {
        ret = ret || event.equals(keyCode);
      });
    }

    return ret;
  }

  updateFocusedItem() {
    for (let i = 0; i < this.menuContainer.children.length; i++) {
      const elem = this.menuContainer.children[i];

      if ((0, _get__("dom_1").isAncestor)(document.activeElement, elem)) {
        this.focusedItem = i;
        break;
      }
    }
  }

  getContainer() {
    return this.menuContainer;
  }

  createMenu(items) {
    items.forEach(menuItem => {
      const itemElement = document.createElement('li');
      itemElement.className = 'action-item';
      itemElement.setAttribute('role', 'presentation'); // Prevent native context menu on actions

      this._register((0, _get__("dom_1").addDisposableListener)(itemElement, _get__("dom_1").EventType.CONTEXT_MENU, e => {
        e.preventDefault();
        e.stopPropagation();
      }));

      let item;

      if (menuItem.type === 'separator') {
        item = new (_get__("Separator"))(menuItem, this.options);
      } else if (menuItem.type === 'submenu' || menuItem.submenu) {
        const submenuItems = menuItem.submenu.items;
        item = new (_get__("Submenu"))(menuItem, submenuItems, this.parentData, this.options, this.closeSubMenu);

        if (this.options.enableMnemonics) {
          const mnemonic = item.getMnemonic();

          if (mnemonic && item.isEnabled()) {
            let actionItems = [];

            if (this.mnemonics.has(mnemonic)) {
              actionItems = this.mnemonics.get(mnemonic);
            }

            actionItems.push(item);
            this.mnemonics.set(mnemonic, actionItems);
          }
        }
      } else {
        const menuItemOptions = {
          enableMnemonics: this.options.enableMnemonics
        };
        item = new (_get__("menuitem_1").CETMenuItem)(menuItem, menuItemOptions, this.closeSubMenu);

        if (this.options.enableMnemonics) {
          const mnemonic = item.getMnemonic();

          if (mnemonic && item.isEnabled()) {
            let actionItems = [];

            if (this.mnemonics.has(mnemonic)) {
              actionItems = this.mnemonics.get(mnemonic);
            }

            actionItems.push(item);
            this.mnemonics.set(mnemonic, actionItems);
          }
        }
      }

      item.render(itemElement);
      this.menuContainer.appendChild(itemElement);
      this.items.push(item);
    });
  }

  focus(arg) {
    let selectFirst = false;
    let index = undefined;

    if (arg === undefined) {
      selectFirst = true;
    } else if (typeof arg === 'number') {
      index = arg;
    } else if (typeof arg === 'boolean') {
      selectFirst = arg;
    }

    if (selectFirst && typeof this.focusedItem === 'undefined') {
      // Focus the first enabled item
      this.focusedItem = this.items.length - 1;
      this.focusNext();
    } else {
      if (index !== undefined) {
        this.focusedItem = index;
      }

      this.updateFocus();
    }
  }

  focusNext() {
    if (typeof this.focusedItem === 'undefined') {
      this.focusedItem = this.items.length - 1;
    }

    const startIndex = this.focusedItem;
    let item;

    do {
      this.focusedItem = (this.focusedItem + 1) % this.items.length;
      item = this.items[this.focusedItem];
    } while (this.focusedItem !== startIndex && !item.isEnabled() || item.isSeparator());

    if (this.focusedItem === startIndex && !item.isEnabled() || item.isSeparator()) {
      this.focusedItem = undefined;
    }

    this.updateFocus();
  }

  focusPrevious() {
    if (typeof this.focusedItem === 'undefined') {
      this.focusedItem = 0;
    }

    const startIndex = this.focusedItem;
    let item;

    do {
      this.focusedItem = this.focusedItem - 1;

      if (this.focusedItem < 0) {
        this.focusedItem = this.items.length - 1;
      }

      item = this.items[this.focusedItem];
    } while (this.focusedItem !== startIndex && !item.isEnabled() || item.isSeparator());

    if (this.focusedItem === startIndex && !item.isEnabled() || item.isSeparator()) {
      this.focusedItem = undefined;
    }

    this.updateFocus();
  }

  updateFocus() {
    if (typeof this.focusedItem === 'undefined') {
      this.menuContainer.focus();
    }

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];

      if (i === this.focusedItem) {
        if (item.isEnabled()) {
          item.focus();
        } else {
          this.menuContainer.focus();
        }
      } else {
        item.blur();
      }
    }
  }

  doTrigger(event) {
    if (typeof this.focusedItem === 'undefined') {
      return; //nothing to focus
    } // trigger action


    const item = this.items[this.focusedItem];

    if (item instanceof _get__("menuitem_1").CETMenuItem) {
      item.onClick(event);
    }
  }

  cancel() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur(); // remove focus from focused action
    }

    this._onDidCancel.fire();
  }

  dispose() {
    (0, _get__("lifecycle_1").dispose)(this.items);
    this.items = [];
    this.getContainer().remove();
    super.dispose();
  }

  style(style) {
    const container = this.getContainer();

    if (style.backgroundColor) {
      container.style.backgroundColor = style.backgroundColor.toString();
    } else {
      container.style.removeProperty('background-color');
    }

    if (this.items) {
      this.items.forEach(item => {
        if (item instanceof _get__("menuitem_1").CETMenuItem || item instanceof _get__("Separator")) {
          item.style(style);
        }
      });
    }
  }

  focusItemByElement(element) {
    if (!element) return;
    const lastFocusedItem = this.focusedItem;
    this.setFocusedItem(element);

    if (lastFocusedItem !== this.focusedItem) {
      this.updateFocus();
    }
  }

  setFocusedItem(element) {
    for (let i = 0; i < this.menuContainer.children.length; i++) {
      let elem = this.menuContainer.children[i];

      if (element === elem) {
        this.focusedItem = i;
        break;
      }
    }
  }

}

exports.CETMenu = _get__("CETMenu");

class Submenu extends _get__("menuitem_1").CETMenuItem {
  constructor(item, submenuItems, parentData, submenuOptions, closeSubMenu = () => {}) {
    super(item, submenuOptions, closeSubMenu);
    this.submenuItems = submenuItems;
    this.parentData = parentData;
    this.submenuOptions = submenuOptions;
    this.mysubmenu = null;
    this.submenuDisposables = [];
    this.mouseOver = false;
    this.showScheduler = new (_get__("async_1").RunOnceScheduler)(() => {
      if (this.mouseOver) {
        this.cleanupExistingSubmenu(false);
        this.createSubmenu(false);
      }
    }, 250);
    this.hideScheduler = new (_get__("async_1").RunOnceScheduler)(() => {
      if (this.container && !(0, _get__("dom_1").isAncestor)(document.activeElement, this.container) && this.parentData.submenu === this.mysubmenu) {
        this.parentData.parent.focus(false);
        this.cleanupExistingSubmenu(true);
      }
    }, 750);
  }

  render(container) {
    super.render(container);

    if (!this.itemElement || !this.container) {
      return;
    }

    (0, _get__("dom_1").addClass)(this.itemElement, 'submenu-item');
    this.itemElement.setAttribute('aria-haspopup', 'true');
    this.submenuIndicator = (0, _get__("dom_1").append)(this.itemElement, (0, _get__("dom_1").$)('span.submenu-indicator'));
    this.submenuIndicator.setAttribute('aria-hidden', 'true');

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.KEY_UP, e => {
      let event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);

      if (event.equals(17
      /* RightArrow */
      ) || event.equals(3
      /* Enter */
      )) {
        _get__("dom_1").EventHelper.stop(e, true);

        this.createSubmenu(true);
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.KEY_DOWN, e => {
      let event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);

      if (event.equals(17
      /* RightArrow */
      ) || event.equals(3
      /* Enter */
      )) {
        _get__("dom_1").EventHelper.stop(e, true);
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.MOUSE_OVER, () => {
      if (!this.mouseOver) {
        this.mouseOver = true;
        this.showScheduler.schedule();
      }
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.MOUSE_LEAVE, () => {
      this.mouseOver = false;
    }));

    this._register((0, _get__("dom_1").addDisposableListener)(this.container, _get__("dom_1").EventType.FOCUS_OUT, () => {
      if (this.container && !(0, _get__("dom_1").isAncestor)(document.activeElement, this.container)) {
        this.hideScheduler.schedule();
      }
    }));
  }

  onClick(e) {
    // stop clicking from trying to run an action
    _get__("dom_1").EventHelper.stop(e, true);

    this.cleanupExistingSubmenu(false);
    this.createSubmenu(false);
  }

  cleanupExistingSubmenu(force) {
    if (this.parentData.submenu && (force || this.parentData.submenu !== this.mysubmenu)) {
      this.parentData.submenu.dispose();
      this.parentData.submenu = undefined;

      if (this.submenuContainer) {
        this.submenuContainer = undefined;
      }
    }
  }

  createSubmenu(selectFirstItem = true) {
    if (!this.itemElement || !this.container) {
      return;
    }

    if (!this.parentData.submenu) {
      this.submenuContainer = (0, _get__("dom_1").append)(this.container, (0, _get__("dom_1").$)('ul.submenu'));
      (0, _get__("dom_1").addClasses)(this.submenuContainer, 'menubar-menu-container');
      this.parentData.submenu = new (_get__("CETMenu"))(this.submenuContainer, this.submenuOptions, this.closeSubMenu);
      this.parentData.submenu.createMenu(this.submenuItems);

      if (this.menuStyle) {
        this.parentData.submenu.style(this.menuStyle);
      }

      const boundingRect = this.container.getBoundingClientRect();
      const childBoundingRect = this.submenuContainer.getBoundingClientRect();
      const computedStyles = getComputedStyle(this.parentData.parent.getContainer());
      const paddingTop = parseFloat(computedStyles.paddingTop || '0') || 0;

      if (window.innerWidth <= boundingRect.right + childBoundingRect.width) {
        this.submenuContainer.style.left = '10px';
        this.submenuContainer.style.top = `${this.container.offsetTop + boundingRect.height}px`;
      } else {
        this.submenuContainer.style.left = `${this.container.offsetWidth}px`;
        this.submenuContainer.style.top = `${this.container.offsetTop - paddingTop}px`;
      }

      this.submenuDisposables.push((0, _get__("dom_1").addDisposableListener)(this.submenuContainer, _get__("dom_1").EventType.KEY_UP, e => {
        let event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);

        if (event.equals(15
        /* LeftArrow */
        )) {
          _get__("dom_1").EventHelper.stop(e, true);

          this.parentData.parent.focus();

          if (this.parentData.submenu) {
            this.parentData.submenu.dispose();
            this.parentData.submenu = undefined;
          }

          this.submenuDisposables = (0, _get__("lifecycle_1").dispose)(this.submenuDisposables);
          this.submenuContainer = undefined;
        }
      }));
      this.submenuDisposables.push((0, _get__("dom_1").addDisposableListener)(this.submenuContainer, _get__("dom_1").EventType.KEY_DOWN, e => {
        let event = new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e);

        if (event.equals(15
        /* LeftArrow */
        )) {
          _get__("dom_1").EventHelper.stop(e, true);
        }
      }));
      this.submenuDisposables.push(this.parentData.submenu.onDidCancel(() => {
        this.parentData.parent.focus();

        if (this.parentData.submenu) {
          this.parentData.submenu.dispose();
          this.parentData.submenu = undefined;
        }

        this.submenuDisposables = (0, _get__("lifecycle_1").dispose)(this.submenuDisposables);
        this.submenuContainer = undefined;
      }));
      this.parentData.submenu.focus(selectFirstItem);
      this.mysubmenu = this.parentData.submenu;
    } else {
      this.parentData.submenu.focus(false);
    }
  }

  applyStyle() {
    super.applyStyle();

    if (!this.menuStyle) {
      return;
    }

    const isSelected = this.container && (0, _get__("dom_1").hasClass)(this.container, 'focused');
    const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;

    if (this.submenuIndicator) {
      if (fgColor) {
        this.submenuIndicator.style.backgroundColor = `${fgColor}`;
      } else {
        this.submenuIndicator.style.removeProperty('background-color');
      }
    }

    if (this.parentData.submenu) {
      this.parentData.submenu.style(this.menuStyle);
    }
  }

  dispose() {
    super.dispose();
    this.hideScheduler.dispose();

    if (this.mysubmenu) {
      this.mysubmenu.dispose();
      this.mysubmenu = null;
    }

    if (this.submenuContainer) {
      this.submenuDisposables = (0, _get__("lifecycle_1").dispose)(this.submenuDisposables);
      this.submenuContainer = undefined;
    }
  }

}

class Separator extends _get__("menuitem_1").CETMenuItem {
  constructor(item, options) {
    super(item, options);
  }

  render(container) {
    if (container) {
      this.separatorElement = (0, _get__("dom_1").append)(container, (0, _get__("dom_1").$)('a.action-label'));
      this.separatorElement.setAttribute('role', 'presentation');
      (0, _get__("dom_1").addClass)(this.separatorElement, 'separator');
    }
  }

  style(style) {
    if (!this.separatorElement) return;

    if (style.separatorColor) {
      this.separatorElement.style.borderBottomColor = `${style.separatorColor}`;
    } else {
      this.separatorElement.style.removeProperty('border-bottom-color');
    }
  }

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
    case "event_1":
      return event_1;

    case "dom_1":
      return dom_1;

    case "keyboardEvent_1":
      return keyboardEvent_1;

    case "keyCodes_1":
      return keyCodes_1;

    case "Submenu":
      return Submenu;

    case "platform_1":
      return platform_1;

    case "Separator":
      return Separator;

    case "menuitem_1":
      return menuitem_1;

    case "lifecycle_1":
      return lifecycle_1;

    case "CETMenu":
      return CETMenu;

    case "async_1":
      return async_1;
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