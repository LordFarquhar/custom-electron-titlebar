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
exports.Titlebar = void 0;

const platform_1 = require("./vs/base/common/platform");

const color_1 = require("./vs/base/common/color");

const dom_1 = require("./vs/base/browser/dom");

const menubar_1 = require("./menubar");

const themebar_1 = require("./themebar"); // we don't have typings yet for the module - so for a quick win, we require it in


const remote = require("@electron/remote");

const INACTIVE_FOREGROUND_DARK = _get__("color_1").Color.fromHex('#222222');

const ACTIVE_FOREGROUND_DARK = _get__("color_1").Color.fromHex('#333333');

const INACTIVE_FOREGROUND = _get__("color_1").Color.fromHex('#EEEEEE');

const ACTIVE_FOREGROUND = _get__("color_1").Color.fromHex('#FFFFFF');

const BOTTOM_TITLEBAR_HEIGHT = '60px';
const TOP_TITLEBAR_HEIGHT_MAC = '22px';
const TOP_TITLEBAR_HEIGHT_WIN = '30px';
const TitlebarEventType = { ..._get__("dom_1").EventType,
  // Window
  MINIMIZE: 'minimize',
  MAXIMIZE: 'maximize',
  UNMAXIMIZE: 'unmaximize',
  ENTER_FULLSCREEN: 'enter-full-screen',
  LEAVE_FULLSCREEN: 'leave-full-screen'
};
const defaultOptions = {
  backgroundColor: _get__("color_1").Color.fromHex('#444444'),
  iconsTheme: _get__("themebar_1").Themebar.win,
  shadow: false,
  menu: _get__("remote").Menu.getApplicationMenu(),
  minimizable: true,
  maximizable: true,
  closeable: true,
  enableMnemonics: true,
  hideWhenClickingClose: false,
  unfocusEffect: true,
  overflow: "auto",
  menuPosition: "left",
  titleHorizontalAlignment: "center"
};

class Titlebar extends _get__("themebar_1").Themebar {
  constructor(options) {
    super();

    this.closeMenu = () => {
      if (this.menubar) {
        this.menubar.blur();
      }
    };

    this.currentWindow = _get__("remote").getCurrentWindow();
    this._options = { ..._get__("defaultOptions"),
      ...options
    };

    if (options && !options.iconsTheme) {
      if (_get__("platform_1").isWindows || _get__("platform_1").isLinux) {
        this._options.iconsTheme = _get__("themebar_1").Themebar.win;
      } else {
        this._options.iconsTheme = _get__("themebar_1").Themebar.mac;
      }
    }

    this.registerListeners();
    this.createTitlebar();
    this.updateStyles();
    this.registerTheme(this._options.iconsTheme);
  }

  registerListeners() {
    this.events = {};

    this.events[_get__("TitlebarEventType").FOCUS] = () => this.onDidChangeWindowFocus(true);

    this.events[_get__("TitlebarEventType").BLUR] = () => this.onDidChangeWindowFocus(false);

    this.events[_get__("TitlebarEventType").MAXIMIZE] = () => this.onDidChangeMaximized(true);

    this.events[_get__("TitlebarEventType").UNMAXIMIZE] = () => this.onDidChangeMaximized(false);

    this.events[_get__("TitlebarEventType").ENTER_FULLSCREEN] = () => this.onDidChangeFullscreen(true);

    this.events[_get__("TitlebarEventType").LEAVE_FULLSCREEN] = () => this.onDidChangeFullscreen(false);

    for (const k in this.events) {
      this.currentWindow.on(k, this.events[k]);
    }
  }

  removeListeners() {
    for (const k in this.events) {
      this.currentWindow.removeListener(k, this.events[k]);
    }

    this.events = {};
  }

  createTitlebar() {
    // Content container
    this.container = (0, _get__("dom_1").$)('div.container-after-titlebar');

    if (this._options.menuPosition === 'bottom') {
      this.container.style.top = _get__("BOTTOM_TITLEBAR_HEIGHT");
      this.container.style.bottom = '0px';
    } else {
      this.container.style.top = _get__("platform_1").isMacintosh ? _get__("TOP_TITLEBAR_HEIGHT_MAC") : _get__("TOP_TITLEBAR_HEIGHT_WIN");
      this.container.style.bottom = '0px';
    }

    this.container.style.right = '0';
    this.container.style.left = '0';
    this.container.style.position = 'absolute';
    this.container.style.overflow = this._options.overflow;

    while (document.body.firstChild) {
      (0, _get__("dom_1").append)(this.container, document.body.firstChild);
    }

    (0, _get__("dom_1").append)(document.body, this.container);
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0'; // Titlebar

    this.titlebar = (0, _get__("dom_1").$)('div.titlebar');
    (0, _get__("dom_1").addClass)(this.titlebar, _get__("platform_1").isWindows ? 'cet-windows' : _get__("platform_1").isLinux ? 'cet-linux' : 'cet-mac');

    if (this._options.order) {
      (0, _get__("dom_1").addClass)(this.titlebar, this._options.order);
    }

    if (this._options.shadow) {
      this.titlebar.style.boxShadow = `0 2px 1px -1px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)`;
    }

    this.dragRegion = (0, _get__("dom_1").append)(this.titlebar, (0, _get__("dom_1").$)('div.titlebar-drag-region')); // App Icon (Windows/Linux)

    if (!_get__("platform_1").isMacintosh && this._options.icon) {
      this.appIcon = (0, _get__("dom_1").append)(this.titlebar, (0, _get__("dom_1").$)('div.window-appicon'));
      this.updateIcon(this._options.icon);
    } // Menubar


    this.menubarContainer = (0, _get__("dom_1").append)(this.titlebar, (0, _get__("dom_1").$)('div.menubar'));
    this.menubarContainer.setAttribute('role', 'menubar');

    if (this._options.menu) {
      this.updateMenu(this._options.menu);
      this.updateMenuPosition(this._options.menuPosition);
    } // Title


    this.title = (0, _get__("dom_1").append)(this.titlebar, (0, _get__("dom_1").$)('div.window-title'));

    if (!_get__("platform_1").isMacintosh) {
      this.title.style.cursor = 'default';
    }

    this.updateTitle();
    this.setHorizontalAlignment(this._options.titleHorizontalAlignment); // Maximize/Restore on doubleclick

    if (_get__("platform_1").isMacintosh) {
      let isMaximized = this.currentWindow.isMaximized();

      this._register((0, _get__("dom_1").addDisposableListener)(this.titlebar, _get__("dom_1").EventType.DBLCLICK, () => {
        isMaximized = !isMaximized;
        this.onDidChangeMaximized(isMaximized);
      }));
    } // Window Controls (Windows/Linux)


    if (!_get__("platform_1").isMacintosh) {
      this.windowControls = (0, _get__("dom_1").append)(this.titlebar, (0, _get__("dom_1").$)('div.window-controls-container')); // Minimize

      const minimizeIconContainer = (0, _get__("dom_1").append)(this.windowControls, (0, _get__("dom_1").$)('div.window-icon-bg'));
      const minimizeIcon = (0, _get__("dom_1").append)(minimizeIconContainer, (0, _get__("dom_1").$)('div.window-icon'));
      (0, _get__("dom_1").addClass)(minimizeIcon, 'window-minimize');

      if (!this._options.minimizable) {
        (0, _get__("dom_1").addClass)(minimizeIconContainer, 'inactive');
      } else {
        this._register((0, _get__("dom_1").addDisposableListener)(minimizeIcon, _get__("dom_1").EventType.CLICK, () => {
          this.currentWindow.minimize();
        }));
      } // Restore


      const restoreIconContainer = (0, _get__("dom_1").append)(this.windowControls, (0, _get__("dom_1").$)('div.window-icon-bg'));
      this.maxRestoreControl = (0, _get__("dom_1").append)(restoreIconContainer, (0, _get__("dom_1").$)('div.window-icon'));
      (0, _get__("dom_1").addClass)(this.maxRestoreControl, 'window-max-restore');

      if (!this._options.maximizable) {
        (0, _get__("dom_1").addClass)(restoreIconContainer, 'inactive');
      } else {
        this._register((0, _get__("dom_1").addDisposableListener)(this.maxRestoreControl, _get__("dom_1").EventType.CLICK, () => {
          if (this.currentWindow.isMaximized()) {
            this.currentWindow.unmaximize();
            this.onDidChangeMaximized(false);
          } else {
            this.currentWindow.maximize();
            this.onDidChangeMaximized(true);
          }
        }));
      } // Close


      const closeIconContainer = (0, _get__("dom_1").append)(this.windowControls, (0, _get__("dom_1").$)('div.window-icon-bg'));
      (0, _get__("dom_1").addClass)(closeIconContainer, 'window-close-bg');
      const closeIcon = (0, _get__("dom_1").append)(closeIconContainer, (0, _get__("dom_1").$)('div.window-icon'));
      (0, _get__("dom_1").addClass)(closeIcon, 'window-close');

      if (!this._options.closeable) {
        (0, _get__("dom_1").addClass)(closeIconContainer, 'inactive');
      } else {
        this._register((0, _get__("dom_1").addDisposableListener)(closeIcon, _get__("dom_1").EventType.CLICK, () => {
          if (this._options.hideWhenClickingClose) {
            this.currentWindow.hide();
          } else {
            this.currentWindow.close();
          }
        }));
      } // Resizer


      this.resizer = {
        top: (0, _get__("dom_1").append)(this.titlebar, (0, _get__("dom_1").$)('div.resizer.top')),
        left: (0, _get__("dom_1").append)(this.titlebar, (0, _get__("dom_1").$)('div.resizer.left'))
      };
      this.onDidChangeMaximized(this.currentWindow.isMaximized());
    } else {
      this.windowControls = (0, _get__("dom_1").prepend)(this.titlebar, (0, _get__("dom_1").$)('div.window-controls-container')); // Close

      const closeIconContainer = (0, _get__("dom_1").append)(this.windowControls, (0, _get__("dom_1").$)('div.window-icon-bg'));
      const closeIcon = (0, _get__("dom_1").append)(closeIconContainer, (0, _get__("dom_1").$)('div.window-icon'));
      closeIconContainer.classList.add('window-close-bg');
      closeIcon.classList.add('window-close');

      if (!this._options.closeable) {
        closeIconContainer.classList.add('inactive');
      } else {
        this._register((0, _get__("dom_1").addDisposableListener)(closeIcon, _get__("dom_1").EventType.CLICK, () => {
          if (this._options.hideWhenClickingClose) {
            this.currentWindow.hide();
          } else {
            this.currentWindow.close();
          }
        }));
      } // Minimize


      const minimizeIconContainer = (0, _get__("dom_1").append)(this.windowControls, (0, _get__("dom_1").$)('div.window-icon-bg'));
      const minimizeIcon = (0, _get__("dom_1").append)(minimizeIconContainer, (0, _get__("dom_1").$)('div.window-icon'));
      minimizeIconContainer.classList.add('window-minimize-bg');
      minimizeIcon.classList.add('window-minimize');

      if (!this._options.minimizable) {
        minimizeIconContainer.classList.add('inactive');
      } else {
        this._register((0, _get__("dom_1").addDisposableListener)(minimizeIcon, _get__("dom_1").EventType.CLICK, () => {
          this.currentWindow.minimize();
        }));
      } // Restore


      const restoreIconContainer = (0, _get__("dom_1").append)(this.windowControls, (0, _get__("dom_1").$)('div.window-icon-bg'));
      this.maxRestoreControl = (0, _get__("dom_1").append)(restoreIconContainer, (0, _get__("dom_1").$)('div.window-icon'));
      restoreIconContainer.classList.add('window-restore-bg');
      this.maxRestoreControl.classList.add('window-max-restore');

      if (!this._options.maximizable) {
        restoreIconContainer.classList.add('inactive');
      } else {
        this._register((0, _get__("dom_1").addDisposableListener)(this.maxRestoreControl, _get__("dom_1").EventType.CLICK, () => {
          if (this.currentWindow.isMaximized()) {
            this.currentWindow.unmaximize();
            this.onDidChangeMaximized(false);
          } else {
            this.currentWindow.maximize();
            this.onDidChangeMaximized(true);
          }
        }));
      } // Resizer


      this.resizer = {
        top: (0, _get__("dom_1").append)(this.titlebar, (0, _get__("dom_1").$)('div.resizer.top')),
        left: (0, _get__("dom_1").append)(this.titlebar, (0, _get__("dom_1").$)('div.resizer.left'))
      };
      this.onDidChangeMaximized(this.currentWindow.isMaximized());
    }

    (0, _get__("dom_1").prepend)(document.body, this.titlebar);
  }

  onBlur() {
    this.isInactive = true;
    this.updateStyles();
  }

  onFocus() {
    this.isInactive = false;
    this.updateStyles();
  }

  onMenubarVisibilityChanged(visible) {
    if (this.dragRegion && (_get__("platform_1").isWindows || _get__("platform_1").isLinux)) {
      // Hide title when toggling menu bar
      if (visible) {
        // Hack to fix issue #52522 with layered webkit-app-region elements appearing under cursor
        const dragRegion = this.dragRegion;
        (0, _get__("dom_1").hide)(dragRegion);
        setTimeout(() => (0, _get__("dom_1").show)(dragRegion), 50);
      }
    }
  }

  onMenubarFocusChanged(focused) {
    if (this.dragRegion && (_get__("platform_1").isWindows || _get__("platform_1").isLinux)) {
      if (focused) {
        (0, _get__("dom_1").hide)(this.dragRegion);
      } else {
        (0, _get__("dom_1").show)(this.dragRegion);
      }
    }
  }

  onDidChangeWindowFocus(hasFocus) {
    if (this.titlebar) {
      if (hasFocus) {
        (0, _get__("dom_1").removeClass)(this.titlebar, 'inactive');
        this.onFocus();
      } else {
        (0, _get__("dom_1").addClass)(this.titlebar, 'inactive');
        this.closeMenu();
        this.onBlur();
      }
    }
  }

  onDidChangeMaximized(maximized) {
    if (this.maxRestoreControl) {
      if (maximized) {
        (0, _get__("dom_1").removeClass)(this.maxRestoreControl, 'window-maximize');
        (0, _get__("dom_1").addClass)(this.maxRestoreControl, 'window-unmaximize');
      } else {
        (0, _get__("dom_1").removeClass)(this.maxRestoreControl, 'window-unmaximize');
        (0, _get__("dom_1").addClass)(this.maxRestoreControl, 'window-maximize');
      }
    }

    if (this.resizer) {
      if (maximized) {
        (0, _get__("dom_1").hide)(this.resizer.top, this.resizer.left);
      } else {
        (0, _get__("dom_1").show)(this.resizer.top, this.resizer.left);
      }
    }
  }

  onDidChangeFullscreen(fullscreen) {
    if (!_get__("platform_1").isMacintosh && this.appIcon && this.title && this.windowControls) {
      if (fullscreen) {
        (0, _get__("dom_1").hide)(this.appIcon, this.title, this.windowControls);
      } else {
        (0, _get__("dom_1").show)(this.appIcon, this.title, this.windowControls);
      }
    }
  }

  updateStyles() {
    if (this.titlebar) {
      if (this.isInactive) {
        (0, _get__("dom_1").addClass)(this.titlebar, 'inactive');
      } else {
        (0, _get__("dom_1").removeClass)(this.titlebar, 'inactive');
      }

      const titleBackground = this.isInactive && this._options.unfocusEffect ? this._options.backgroundColor.lighten(.45) : this._options.backgroundColor;
      this.titlebar.style.backgroundColor = titleBackground.toString();
      let titleForeground;

      if (titleBackground.isLighter()) {
        (0, _get__("dom_1").addClass)(this.titlebar, 'light');
        titleForeground = this.isInactive && this._options.unfocusEffect ? _get__("INACTIVE_FOREGROUND_DARK") : _get__("ACTIVE_FOREGROUND_DARK");
      } else {
        (0, _get__("dom_1").removeClass)(this.titlebar, 'light');
        titleForeground = this.isInactive && this._options.unfocusEffect ? _get__("INACTIVE_FOREGROUND") : _get__("ACTIVE_FOREGROUND");
      }

      this.titlebar.style.color = titleForeground.toString();

      const backgroundColor = this._options.backgroundColor.darken(.16);

      const foregroundColor = backgroundColor.isLighter() ? _get__("INACTIVE_FOREGROUND_DARK") : _get__("INACTIVE_FOREGROUND");
      const bgColor = !this._options.itemBackgroundColor || this._options.itemBackgroundColor.equals(backgroundColor) ? new (_get__("color_1").Color)(new (_get__("color_1").RGBA)(0, 0, 0, .14)) : this._options.itemBackgroundColor;
      const fgColor = bgColor.isLighter() ? _get__("ACTIVE_FOREGROUND_DARK") : _get__("ACTIVE_FOREGROUND");

      if (this.menubar) {
        this.menubar.setStyles({
          backgroundColor: backgroundColor,
          foregroundColor: foregroundColor,
          selectionBackgroundColor: bgColor,
          selectionForegroundColor: fgColor,
          separatorColor: foregroundColor
        });
      }
    }
  }
  /**
   * get the options of the titlebar
   */


  get options() {
    return this._options;
  }
  /**
   * Update the background color of the title bar
   * @param backgroundColor The color for the background
   */


  updateBackground(backgroundColor) {
    this._options.backgroundColor = backgroundColor;
    this.updateStyles();
  }
  /**
   * Update the item background color of the menubar
   * @param itemBGColor The color for the item background
   */


  updateItemBGColor(itemBGColor) {
    this._options.itemBackgroundColor = itemBGColor;
    this.updateStyles();
  }
  /**
   * Update the title of the title bar.
   * You can use this method if change the content of `<title>` tag on your html.
   * @param title The title of the title bar and document.
   */


  updateTitle(title) {
    if (this.title) {
      if (title) {
        document.title = title;
      } else {
        title = document.title;
      }

      this.title.innerText = title;
    }
  }
  /**
   * It method set new icon to title-bar-icon of title-bar.
   * @param path path to icon
   */


  updateIcon(path) {
    if (path === null || path === '') {
      return;
    }

    if (this.appIcon) {
      this.appIcon.style.backgroundImage = `url("${path}")`;
    }
  }
  /**
   * Update the default menu or set a new menu.
   * @param menu The menu.
   */
  // Menu enhancements, moved menu to bottom of window-titlebar. (by @MairwunNx) https://github.com/AlexTorresSk/custom-electron-titlebar/pull/9


  updateMenu(menu) {
    if (!this.menubarContainer) return;

    if (!_get__("platform_1").isMacintosh) {
      if (this.menubar) {
        this.menubar.dispose();
        this._options.menu = menu;
      }

      this.menubar = new (_get__("menubar_1").Menubar)(this.menubarContainer, this._options, this.closeMenu);
      this.menubar.setupMenubar();

      this._register(this.menubar.onVisibilityChange(e => this.onMenubarVisibilityChanged(e)));

      this._register(this.menubar.onFocusStateChange(e => this.onMenubarFocusChanged(e)));

      this.updateStyles();
    } else {
      _get__("remote").Menu.setApplicationMenu(menu);
    }
  }
  /**
   * Update the position of menubar.
   * @param menuPosition The position of the menu `left` or `bottom`.
   */


  updateMenuPosition(menuPosition) {
    if (!this.titlebar || !this.container || !this.menubarContainer) return;
    this._options.menuPosition = menuPosition;

    if (_get__("platform_1").isMacintosh) {
      this.titlebar.style.height = this._options.menuPosition && this._options.menuPosition === 'bottom' ? _get__("BOTTOM_TITLEBAR_HEIGHT") : _get__("TOP_TITLEBAR_HEIGHT_MAC");
      this.container.style.top = this._options.menuPosition && this._options.menuPosition === 'bottom' ? _get__("BOTTOM_TITLEBAR_HEIGHT") : _get__("TOP_TITLEBAR_HEIGHT_MAC");
    } else {
      this.titlebar.style.height = this._options.menuPosition && this._options.menuPosition === 'bottom' ? _get__("BOTTOM_TITLEBAR_HEIGHT") : _get__("TOP_TITLEBAR_HEIGHT_WIN");
      this.container.style.top = this._options.menuPosition && this._options.menuPosition === 'bottom' ? _get__("BOTTOM_TITLEBAR_HEIGHT") : _get__("TOP_TITLEBAR_HEIGHT_WIN");
    }

    if (this._options.menuPosition && this._options.menuPosition === 'bottom') {
      this.titlebar.style.flexWrap = 'wrap';
    }

    if (this._options.menuPosition === 'bottom') {
      (0, _get__("dom_1").addClass)(this.menubarContainer, 'bottom');
    } else {
      (0, _get__("dom_1").removeClass)(this.menubarContainer, 'bottom');
    }
  }
  /**
   * Horizontal alignment of the title.
   * @param side `left`, `center` or `right`.
   */
  // Add ability to customize title-bar title. (by @MairwunNx) https://github.com/AlexTorresSk/custom-electron-titlebar/pull/8


  setHorizontalAlignment(side) {
    if (!this.title) return;

    if (side === 'left' || side === 'right' && this._options.order === 'inverted') {
      this.title.style.marginLeft = '8px';
      this.title.style.marginRight = 'auto';
    }

    if (side === 'right' || side === 'left' && this._options.order === 'inverted') {
      this.title.style.marginRight = '8px';
      this.title.style.marginLeft = 'auto';
    }

    if (side === 'center') {
      this.title.style.marginRight = 'auto';
      this.title.style.marginLeft = 'auto';

      if (_get__("platform_1").isMacintosh) {
        this.title.style.paddingRight = '60px';
      }
    }
  }
  /**
   * Remove the titlebar, menubar and all methods.
   */


  dispose() {
    if (this.menubar) this.menubar.dispose();
    if (this.titlebar) (0, _get__("dom_1").removeNode)(this.titlebar);

    if (this.container) {
      while (this.container.firstChild) {
        (0, _get__("dom_1").append)(document.body, this.container.firstChild);
      }

      (0, _get__("dom_1").removeNode)(this.container);
    }

    this.removeListeners();
    super.dispose();
  }

}

exports.Titlebar = _get__("Titlebar");

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
    case "color_1":
      return color_1;

    case "dom_1":
      return dom_1;

    case "themebar_1":
      return themebar_1;

    case "remote":
      return remote;

    case "defaultOptions":
      return defaultOptions;

    case "platform_1":
      return platform_1;

    case "TitlebarEventType":
      return TitlebarEventType;

    case "BOTTOM_TITLEBAR_HEIGHT":
      return BOTTOM_TITLEBAR_HEIGHT;

    case "TOP_TITLEBAR_HEIGHT_MAC":
      return TOP_TITLEBAR_HEIGHT_MAC;

    case "TOP_TITLEBAR_HEIGHT_WIN":
      return TOP_TITLEBAR_HEIGHT_WIN;

    case "INACTIVE_FOREGROUND_DARK":
      return INACTIVE_FOREGROUND_DARK;

    case "ACTIVE_FOREGROUND_DARK":
      return ACTIVE_FOREGROUND_DARK;

    case "INACTIVE_FOREGROUND":
      return INACTIVE_FOREGROUND;

    case "ACTIVE_FOREGROUND":
      return ACTIVE_FOREGROUND;

    case "menubar_1":
      return menubar_1;

    case "Titlebar":
      return Titlebar;
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