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
exports.EventType = exports.isHTMLElement = exports.removeCSSRulesContainingSelector = exports.createCSSRule = exports.createMetaElement = exports.createStyleSheet = exports.getActiveElement = exports.getShadowRoot = exports.isInShadowDOM = exports.isShadowRoot = exports.hasParentWithClass = exports.findParentWithClass = exports.isAncestor = exports.getLargestChildWidth = exports.getTotalHeight = exports.getContentHeight = exports.getTotalScrollWidth = exports.getContentWidth = exports.getTotalWidth = exports.StandardWindow = exports.getDomNodePagePosition = exports.position = exports.size = exports.getTopLeftOffset = exports.Dimension = exports.getClientArea = exports.getComputedStyle = exports.addDisposableThrottledListener = exports.modify = exports.measure = exports.scheduleAtNextAnimationFrame = exports.runAtThisOrScheduleAtNextAnimationFrame = exports.addDisposableNonBubblingPointerOutListener = exports.addDisposableNonBubblingMouseOutListener = exports.addDisposableGenericMouseUpListner = exports.addDisposableGenericMouseMoveListner = exports.addDisposableGenericMouseDownListner = exports.addStandardDisposableGenericMouseUpListner = exports.addStandardDisposableGenericMouseDownListner = exports.addStandardDisposableListener = exports.addDisposableListener = exports.toggleClass = exports.removeClasses = exports.removeClass = exports.addClasses = exports.addClass = exports.hasClass = exports.isInDOM = exports.removeNode = exports.clearNode = void 0;
exports.triggerDownload = exports.asCSSUrl = exports.asDomUri = exports.animate = exports.windowOpenNoOpener = exports.computeScreenAwareSize = exports.domContentLoaded = exports.finalHandler = exports.getElementsByTagName = exports.removeTabIndexAndUpdateFocus = exports.hide = exports.show = exports.join = exports.$ = exports.Namespace = exports.prepend = exports.append = exports.trackFocus = exports.restoreParentsScrollTop = exports.saveParentsScrollTop = exports.EventHelper = void 0;

const browser = _get__("__importStar")(require("./browser"));

const event_1 = require("./event");

const keyboardEvent_1 = require("./keyboardEvent");

const mouseEvent_1 = require("./mouseEvent");

const async_1 = require("../common/async");

const errors_1 = require("../common/errors");

const event_2 = require("../common/event");

const lifecycle_1 = require("../common/lifecycle");

const platform = _get__("__importStar")(require("../common/platform"));

const arrays_1 = require("../common/arrays");

const uri_1 = require("../common/uri");

const network_1 = require("../common/network");

const canIUse_1 = require("./canIUse");

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

exports.clearNode = _get__("clearNode");
/**
 * @deprecated use `node.remove()` instead
 */

function removeNode(node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

exports.removeNode = _get__("removeNode");

function isInDOM(node) {
  while (node) {
    if (node === document.body) {
      return true;
    }

    node = node.parentNode || node.host;
  }

  return false;
}

exports.isInDOM = _get__("isInDOM");

const _classList = new class {
  hasClass(node, className) {
    return Boolean(className) && node.classList && node.classList.contains(className);
  }

  addClasses(node, ...classNames) {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
  }

  addClass(node, className) {
    if (className && node.classList) {
      node.classList.add(className);
    }
  }

  removeClass(node, className) {
    if (className && node.classList) {
      node.classList.remove(className);
    }
  }

  removeClasses(node, ...classNames) {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
  }

  toggleClass(node, className, shouldHaveIt) {
    if (node.classList) {
      node.classList.toggle(className, shouldHaveIt);
    }
  }

}();
/** @deprecated ES6 - use classList*/


exports.hasClass = _get__("_classList").hasClass.bind(_get__("_classList"));
/** @deprecated ES6 - use classList*/

exports.addClass = _get__("_classList").addClass.bind(_get__("_classList"));
/** @deprecated ES6 - use classList*/

exports.addClasses = _get__("_classList").addClasses.bind(_get__("_classList"));
/** @deprecated ES6 - use classList*/

exports.removeClass = _get__("_classList").removeClass.bind(_get__("_classList"));
/** @deprecated ES6 - use classList*/

exports.removeClasses = _get__("_classList").removeClasses.bind(_get__("_classList"));
/** @deprecated ES6 - use classList*/

exports.toggleClass = _get__("_classList").toggleClass.bind(_get__("_classList"));

class DomListener {
  constructor(node, type, handler, options) {
    this._node = node;
    this._type = type;
    this._handler = handler;
    this._options = options || false;

    this._node.addEventListener(this._type, this._handler, this._options);
  }

  dispose() {
    if (!this._handler) {
      // Already disposed
      return;
    }

    this._node.removeEventListener(this._type, this._handler, this._options); // Prevent leakers from holding on to the dom or handler func


    this._node = null;
    this._handler = null;
  }

}

function addDisposableListener(node, type, handler, useCaptureOrOptions) {
  return new (_get__("DomListener"))(node, type, handler, useCaptureOrOptions);
}

exports.addDisposableListener = _get__("addDisposableListener");

function _wrapAsStandardMouseEvent(handler) {
  return function (e) {
    return handler(new (_get__("mouseEvent_1").StandardMouseEvent)(e));
  };
}

function _wrapAsStandardKeyboardEvent(handler) {
  return function (e) {
    return handler(new (_get__("keyboardEvent_1").StandardKeyboardEvent)(e));
  };
}

let addStandardDisposableListener = function addStandardDisposableListener(node, type, handler, useCapture) {
  let wrapHandler = handler;

  if (type === 'click' || type === 'mousedown') {
    wrapHandler = _get__("_wrapAsStandardMouseEvent")(handler);
  } else if (type === 'keydown' || type === 'keypress' || type === 'keyup') {
    wrapHandler = _get__("_wrapAsStandardKeyboardEvent")(handler);
  }

  return _get__("addDisposableListener")(node, type, wrapHandler, useCapture);
};

exports.addStandardDisposableListener = _get__("addStandardDisposableListener");

let addStandardDisposableGenericMouseDownListner = function addStandardDisposableListener(node, handler, useCapture) {
  let wrapHandler = _get__("_wrapAsStandardMouseEvent")(handler);

  return _get__("addDisposableGenericMouseDownListner")(node, wrapHandler, useCapture);
};

exports.addStandardDisposableGenericMouseDownListner = _get__("addStandardDisposableGenericMouseDownListner");

let addStandardDisposableGenericMouseUpListner = function addStandardDisposableListener(node, handler, useCapture) {
  let wrapHandler = _get__("_wrapAsStandardMouseEvent")(handler);

  return _get__("addDisposableGenericMouseUpListner")(node, wrapHandler, useCapture);
};

exports.addStandardDisposableGenericMouseUpListner = _get__("addStandardDisposableGenericMouseUpListner");

function addDisposableGenericMouseDownListner(node, handler, useCapture) {
  return _get__("addDisposableListener")(node, _get__("platform").isIOS && _get__("canIUse_1").BrowserFeatures.pointerEvents ? exports.EventType.POINTER_DOWN : exports.EventType.MOUSE_DOWN, handler, useCapture);
}

exports.addDisposableGenericMouseDownListner = _get__("addDisposableGenericMouseDownListner");

function addDisposableGenericMouseMoveListner(node, handler, useCapture) {
  return _get__("addDisposableListener")(node, _get__("platform").isIOS && _get__("canIUse_1").BrowserFeatures.pointerEvents ? exports.EventType.POINTER_MOVE : exports.EventType.MOUSE_MOVE, handler, useCapture);
}

exports.addDisposableGenericMouseMoveListner = _get__("addDisposableGenericMouseMoveListner");

function addDisposableGenericMouseUpListner(node, handler, useCapture) {
  return _get__("addDisposableListener")(node, _get__("platform").isIOS && _get__("canIUse_1").BrowserFeatures.pointerEvents ? exports.EventType.POINTER_UP : exports.EventType.MOUSE_UP, handler, useCapture);
}

exports.addDisposableGenericMouseUpListner = _get__("addDisposableGenericMouseUpListner");

function addDisposableNonBubblingMouseOutListener(node, handler) {
  return _get__("addDisposableListener")(node, 'mouseout', e => {
    // Mouse out bubbles, so this is an attempt to ignore faux mouse outs coming from children elements
    let toElement = e.relatedTarget;

    while (toElement && toElement !== node) {
      toElement = toElement.parentNode;
    }

    if (toElement === node) {
      return;
    }

    handler(e);
  });
}

exports.addDisposableNonBubblingMouseOutListener = _get__("addDisposableNonBubblingMouseOutListener");

function addDisposableNonBubblingPointerOutListener(node, handler) {
  return _get__("addDisposableListener")(node, 'pointerout', e => {
    // Mouse out bubbles, so this is an attempt to ignore faux mouse outs coming from children elements
    let toElement = e.relatedTarget;

    while (toElement && toElement !== node) {
      toElement = toElement.parentNode;
    }

    if (toElement === node) {
      return;
    }

    handler(e);
  });
}

exports.addDisposableNonBubblingPointerOutListener = _get__("addDisposableNonBubblingPointerOutListener");
let _animationFrame = null;

function doRequestAnimationFrame(callback) {
  if (!_get__("_animationFrame")) {
    const emulatedRequestAnimationFrame = callback => {
      return setTimeout(() => callback(new Date().getTime()), 0);
    };

    _assign__("_animationFrame", self.requestAnimationFrame || self.msRequestAnimationFrame || self.webkitRequestAnimationFrame || self.mozRequestAnimationFrame || self.oRequestAnimationFrame || emulatedRequestAnimationFrame);
  }

  return _get__("_animationFrame").call(self, callback);
}

class AnimationFrameQueueItem {
  constructor(runner, priority = 0) {
    this._runner = runner;
    this.priority = priority;
    this._canceled = false;
  }

  dispose() {
    this._canceled = true;
  }

  execute() {
    if (this._canceled) {
      return;
    }

    try {
      this._runner();
    } catch (e) {
      (0, _get__("errors_1").onUnexpectedError)(e);
    }
  } // Sort by priority (largest to lowest)


  static sort(a, b) {
    return b.priority - a.priority;
  }

}

(function () {
  /**
   * The runners scheduled at the next animation frame
   */
  let NEXT_QUEUE = [];
  /**
   * The runners scheduled at the current animation frame
   */

  let CURRENT_QUEUE = null;
  /**
   * A flag to keep track if the native requestAnimationFrame was already called
   */

  let animFrameRequested = false;
  /**
   * A flag to indicate if currently handling a native requestAnimationFrame callback
   */

  let inAnimationFrameRunner = false;

  let animationFrameRunner = () => {
    animFrameRequested = false;
    CURRENT_QUEUE = NEXT_QUEUE;
    NEXT_QUEUE = [];
    inAnimationFrameRunner = true;

    while (CURRENT_QUEUE.length > 0) {
      CURRENT_QUEUE.sort(_get__("AnimationFrameQueueItem").sort);
      let top = CURRENT_QUEUE.shift();
      top.execute();
    }

    inAnimationFrameRunner = false;
  };

  exports.scheduleAtNextAnimationFrame = (runner, priority = 0) => {
    let item = new (_get__("AnimationFrameQueueItem"))(runner, priority);
    NEXT_QUEUE.push(item);

    if (!animFrameRequested) {
      animFrameRequested = true;

      _get__("doRequestAnimationFrame")(animationFrameRunner);
    }

    return item;
  };

  exports.runAtThisOrScheduleAtNextAnimationFrame = (runner, priority) => {
    if (inAnimationFrameRunner) {
      let item = new (_get__("AnimationFrameQueueItem"))(runner, priority);
      CURRENT_QUEUE.push(item);
      return item;
    } else {
      return (0, exports.scheduleAtNextAnimationFrame)(runner, priority);
    }
  };
})();

function measure(callback) {
  return (0, exports.scheduleAtNextAnimationFrame)(callback, 10000
  /* must be early */
  );
}

exports.measure = _get__("measure");

function modify(callback) {
  return (0, exports.scheduleAtNextAnimationFrame)(callback, -10000
  /* must be late */
  );
}

exports.modify = _get__("modify");
const MINIMUM_TIME_MS = 16;

const DEFAULT_EVENT_MERGER = function (lastEvent, currentEvent) {
  return currentEvent;
};

class TimeoutThrottledDomListener extends _get__("lifecycle_1").Disposable {
  constructor(node, type, handler, eventMerger = _get__("DEFAULT_EVENT_MERGER"), minimumTimeMs = _get__("MINIMUM_TIME_MS")) {
    super();
    let lastEvent = null;
    let lastHandlerTime = 0;

    let timeout = this._register(new (_get__("async_1").TimeoutTimer)());

    let invokeHandler = () => {
      lastHandlerTime = new Date().getTime();
      handler(lastEvent);
      lastEvent = null;
    };

    this._register(_get__("addDisposableListener")(node, type, e => {
      lastEvent = eventMerger(lastEvent, e);
      let elapsedTime = new Date().getTime() - lastHandlerTime;

      if (elapsedTime >= minimumTimeMs) {
        timeout.cancel();
        invokeHandler();
      } else {
        timeout.setIfNotSet(invokeHandler, minimumTimeMs - elapsedTime);
      }
    }));
  }

}

function addDisposableThrottledListener(node, type, handler, eventMerger, minimumTimeMs) {
  return new (_get__("TimeoutThrottledDomListener"))(node, type, handler, eventMerger, minimumTimeMs);
}

exports.addDisposableThrottledListener = _get__("addDisposableThrottledListener");

function getComputedStyle(el) {
  return document.defaultView.getComputedStyle(el, null);
}

exports.getComputedStyle = _get__("getComputedStyle");

function getClientArea(element) {
  // Try with DOM clientWidth / clientHeight
  if (element !== document.body) {
    return new (_get__("Dimension"))(element.clientWidth, element.clientHeight);
  } // If visual view port exits and it's on mobile, it should be used instead of window innerWidth / innerHeight, or document.body.clientWidth / document.body.clientHeight


  if (_get__("platform").isIOS && window.visualViewport) {
    const width = window.visualViewport.width;
    const height = window.visualViewport.height - (_get__("browser").isStandalone // in PWA mode, the visual viewport always includes the safe-area-inset-bottom (which is for the home indicator)
    // even when you are using the onscreen monitor, the visual viewport will include the area between system statusbar and the onscreen keyboard
    // plus the area between onscreen keyboard and the bottom bezel, which is 20px on iOS.
    ? 20 + 4 : 0);
    return new (_get__("Dimension"))(width, height);
  } // Try innerWidth / innerHeight


  if (window.innerWidth && window.innerHeight) {
    return new (_get__("Dimension"))(window.innerWidth, window.innerHeight);
  } // Try with document.body.clientWidth / document.body.clientHeight


  if (document.body && document.body.clientWidth && document.body.clientHeight) {
    return new (_get__("Dimension"))(document.body.clientWidth, document.body.clientHeight);
  } // Try with document.documentElement.clientWidth / document.documentElement.clientHeight


  if (document.documentElement && document.documentElement.clientWidth && document.documentElement.clientHeight) {
    return new (_get__("Dimension"))(document.documentElement.clientWidth, document.documentElement.clientHeight);
  }

  throw new Error('Unable to figure out browser width and height');
}

exports.getClientArea = _get__("getClientArea");

class SizeUtils {
  // Adapted from WinJS
  // Converts a CSS positioning string for the specified element to pixels.
  static convertToPixels(element, value) {
    return parseFloat(value) || 0;
  }

  static getDimension(element, cssPropertyName, jsPropertyName) {
    let computedStyle = _get__("getComputedStyle")(element);

    let value = '0';

    if (computedStyle) {
      if (computedStyle.getPropertyValue) {
        value = computedStyle.getPropertyValue(cssPropertyName);
      } else {
        // IE8
        value = computedStyle.getAttribute(jsPropertyName);
      }
    }

    return _get__("SizeUtils").convertToPixels(element, value);
  }

  static getBorderLeftWidth(element) {
    return _get__("SizeUtils").getDimension(element, 'border-left-width', 'borderLeftWidth');
  }

  static getBorderRightWidth(element) {
    return _get__("SizeUtils").getDimension(element, 'border-right-width', 'borderRightWidth');
  }

  static getBorderTopWidth(element) {
    return _get__("SizeUtils").getDimension(element, 'border-top-width', 'borderTopWidth');
  }

  static getBorderBottomWidth(element) {
    return _get__("SizeUtils").getDimension(element, 'border-bottom-width', 'borderBottomWidth');
  }

  static getPaddingLeft(element) {
    return _get__("SizeUtils").getDimension(element, 'padding-left', 'paddingLeft');
  }

  static getPaddingRight(element) {
    return _get__("SizeUtils").getDimension(element, 'padding-right', 'paddingRight');
  }

  static getPaddingTop(element) {
    return _get__("SizeUtils").getDimension(element, 'padding-top', 'paddingTop');
  }

  static getPaddingBottom(element) {
    return _get__("SizeUtils").getDimension(element, 'padding-bottom', 'paddingBottom');
  }

  static getMarginLeft(element) {
    return _get__("SizeUtils").getDimension(element, 'margin-left', 'marginLeft');
  }

  static getMarginTop(element) {
    return _get__("SizeUtils").getDimension(element, 'margin-top', 'marginTop');
  }

  static getMarginRight(element) {
    return _get__("SizeUtils").getDimension(element, 'margin-right', 'marginRight');
  }

  static getMarginBottom(element) {
    return _get__("SizeUtils").getDimension(element, 'margin-bottom', 'marginBottom');
  }

}

class Dimension {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  static equals(a, b) {
    if (a === b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }

    return a.width === b.width && a.height === b.height;
  }

}

exports.Dimension = _get__("Dimension");

function getTopLeftOffset(element) {
  // Adapted from WinJS.Utilities.getPosition
  // and added borders to the mix
  let offsetParent = element.offsetParent;
  let top = element.offsetTop;
  let left = element.offsetLeft;

  while ((element = element.parentNode) !== null && element !== document.body && element !== document.documentElement) {
    top -= element.scrollTop;
    const c = _get__("isShadowRoot")(element) ? null : _get__("getComputedStyle")(element);

    if (c) {
      left -= c.direction !== 'rtl' ? element.scrollLeft : -element.scrollLeft;
    }

    if (element === offsetParent) {
      left += _get__("SizeUtils").getBorderLeftWidth(element);
      top += _get__("SizeUtils").getBorderTopWidth(element);
      top += element.offsetTop;
      left += element.offsetLeft;
      offsetParent = element.offsetParent;
    }
  }

  return {
    left: left,
    top: top
  };
}

exports.getTopLeftOffset = _get__("getTopLeftOffset");

function size(element, width, height) {
  if (typeof width === 'number') {
    element.style.width = `${width}px`;
  }

  if (typeof height === 'number') {
    element.style.height = `${height}px`;
  }
}

exports.size = _get__("size");

function position(element, top, right, bottom, left, position = 'absolute') {
  if (typeof top === 'number') {
    element.style.top = `${top}px`;
  }

  if (typeof right === 'number') {
    element.style.right = `${right}px`;
  }

  if (typeof bottom === 'number') {
    element.style.bottom = `${bottom}px`;
  }

  if (typeof left === 'number') {
    element.style.left = `${left}px`;
  }

  element.style.position = position;
}

exports.position = _get__("position");
/**
 * Returns the position of a dom node relative to the entire page.
 */

function getDomNodePagePosition(domNode) {
  let bb = domNode.getBoundingClientRect();
  return {
    left: bb.left + exports.StandardWindow.scrollX,
    top: bb.top + exports.StandardWindow.scrollY,
    width: bb.width,
    height: bb.height
  };
}

exports.getDomNodePagePosition = _get__("getDomNodePagePosition");
exports.StandardWindow = new class {
  get scrollX() {
    if (typeof window.scrollX === 'number') {
      // modern browsers
      return window.scrollX;
    } else {
      return document.body.scrollLeft + document.documentElement.scrollLeft;
    }
  }

  get scrollY() {
    if (typeof window.scrollY === 'number') {
      // modern browsers
      return window.scrollY;
    } else {
      return document.body.scrollTop + document.documentElement.scrollTop;
    }
  }

}(); // Adapted from WinJS
// Gets the width of the element, including margins.

function getTotalWidth(element) {
  let margin = _get__("SizeUtils").getMarginLeft(element) + _get__("SizeUtils").getMarginRight(element);

  return element.offsetWidth + margin;
}

exports.getTotalWidth = _get__("getTotalWidth");

function getContentWidth(element) {
  let border = _get__("SizeUtils").getBorderLeftWidth(element) + _get__("SizeUtils").getBorderRightWidth(element);

  let padding = _get__("SizeUtils").getPaddingLeft(element) + _get__("SizeUtils").getPaddingRight(element);

  return element.offsetWidth - border - padding;
}

exports.getContentWidth = _get__("getContentWidth");

function getTotalScrollWidth(element) {
  let margin = _get__("SizeUtils").getMarginLeft(element) + _get__("SizeUtils").getMarginRight(element);

  return element.scrollWidth + margin;
}

exports.getTotalScrollWidth = _get__("getTotalScrollWidth"); // Adapted from WinJS
// Gets the height of the content of the specified element. The content height does not include borders or padding.

function getContentHeight(element) {
  let border = _get__("SizeUtils").getBorderTopWidth(element) + _get__("SizeUtils").getBorderBottomWidth(element);

  let padding = _get__("SizeUtils").getPaddingTop(element) + _get__("SizeUtils").getPaddingBottom(element);

  return element.offsetHeight - border - padding;
}

exports.getContentHeight = _get__("getContentHeight"); // Adapted from WinJS
// Gets the height of the element, including its margins.

function getTotalHeight(element) {
  let margin = _get__("SizeUtils").getMarginTop(element) + _get__("SizeUtils").getMarginBottom(element);

  return element.offsetHeight + margin;
}

exports.getTotalHeight = _get__("getTotalHeight"); // Gets the left coordinate of the specified element relative to the specified parent.

function getRelativeLeft(element, parent) {
  if (element === null) {
    return 0;
  }

  let elementPosition = _get__("getTopLeftOffset")(element);

  let parentPosition = _get__("getTopLeftOffset")(parent);

  return elementPosition.left - parentPosition.left;
}

function getLargestChildWidth(parent, children) {
  let childWidths = children.map(child => {
    return Math.max(_get__("getTotalScrollWidth")(child), _get__("getTotalWidth")(child)) + _get__("getRelativeLeft")(child, parent) || 0;
  });
  let maxWidth = Math.max(...childWidths);
  return maxWidth;
}

exports.getLargestChildWidth = _get__("getLargestChildWidth"); // ----------------------------------------------------------------------------------------

function isAncestor(testChild, testAncestor) {
  while (testChild) {
    if (testChild === testAncestor) {
      return true;
    }

    testChild = testChild.parentNode;
  }

  return false;
}

exports.isAncestor = _get__("isAncestor");

function findParentWithClass(node, clazz, stopAtClazzOrNode) {
  while (node && node.nodeType === node.ELEMENT_NODE) {
    if ((0, exports.hasClass)(node, clazz)) {
      return node;
    }

    if (stopAtClazzOrNode) {
      if (typeof stopAtClazzOrNode === 'string') {
        if ((0, exports.hasClass)(node, stopAtClazzOrNode)) {
          return null;
        }
      } else {
        if (node === stopAtClazzOrNode) {
          return null;
        }
      }
    }

    node = node.parentNode;
  }

  return null;
}

exports.findParentWithClass = _get__("findParentWithClass");

function hasParentWithClass(node, clazz, stopAtClazzOrNode) {
  return !!_get__("findParentWithClass")(node, clazz, stopAtClazzOrNode);
}

exports.hasParentWithClass = _get__("hasParentWithClass");

function isShadowRoot(node) {
  return node && !!node.host && !!node.mode;
}

exports.isShadowRoot = _get__("isShadowRoot");

function isInShadowDOM(domNode) {
  return !!_get__("getShadowRoot")(domNode);
}

exports.isInShadowDOM = _get__("isInShadowDOM");

function getShadowRoot(domNode) {
  while (domNode.parentNode) {
    if (domNode === document.body) {
      // reached the body
      return null;
    }

    domNode = domNode.parentNode;
  }

  return _get__("isShadowRoot")(domNode) ? domNode : null;
}

exports.getShadowRoot = _get__("getShadowRoot");

function getActiveElement() {
  let result = document.activeElement;

  while (result && result.shadowRoot) {
    result = result.shadowRoot.activeElement;
  }

  return result;
}

exports.getActiveElement = _get__("getActiveElement");

function createStyleSheet(container = document.getElementsByTagName('head')[0]) {
  let style = document.createElement('style');
  style.type = 'text/css';
  style.media = 'screen';
  container.appendChild(style);
  return style;
}

exports.createStyleSheet = _get__("createStyleSheet");

function createMetaElement(container = document.getElementsByTagName('head')[0]) {
  let meta = document.createElement('meta');
  container.appendChild(meta);
  return meta;
}

exports.createMetaElement = _get__("createMetaElement");
let _sharedStyleSheet = null;

function getSharedStyleSheet() {
  if (!_get__("_sharedStyleSheet")) {
    _assign__("_sharedStyleSheet", _get__("createStyleSheet")());
  }

  return _get__("_sharedStyleSheet");
}

function getDynamicStyleSheetRules(style) {
  if (style && style.sheet && style.sheet.rules) {
    // Chrome, IE
    return style.sheet.rules;
  }

  if (style && style.sheet && style.sheet.cssRules) {
    // FF
    return style.sheet.cssRules;
  }

  return [];
}

function createCSSRule(selector, cssText, style = _get__("getSharedStyleSheet")()) {
  if (!style || !cssText) {
    return;
  }

  style.sheet.insertRule(selector + '{' + cssText + '}', 0);
}

exports.createCSSRule = _get__("createCSSRule");

function removeCSSRulesContainingSelector(ruleName, style = _get__("getSharedStyleSheet")()) {
  if (!style) {
    return;
  }

  let rules = _get__("getDynamicStyleSheetRules")(style);

  let toDelete = [];

  for (let i = 0; i < rules.length; i++) {
    let rule = rules[i];

    if (rule.selectorText.indexOf(ruleName) !== -1) {
      toDelete.push(i);
    }
  }

  for (let i = toDelete.length - 1; i >= 0; i--) {
    style.sheet.deleteRule(toDelete[i]);
  }
}

exports.removeCSSRulesContainingSelector = _get__("removeCSSRulesContainingSelector");

function isHTMLElement(o) {
  if (typeof HTMLElement === 'object') {
    return o instanceof HTMLElement;
  }

  return o && typeof o === 'object' && o.nodeType === 1 && typeof o.nodeName === 'string';
}

exports.isHTMLElement = _get__("isHTMLElement");
exports.EventType = {
  // Mouse
  CLICK: 'click',
  AUXCLICK: 'auxclick',
  DBLCLICK: 'dblclick',
  MOUSE_UP: 'mouseup',
  MOUSE_DOWN: 'mousedown',
  MOUSE_OVER: 'mouseover',
  MOUSE_MOVE: 'mousemove',
  MOUSE_OUT: 'mouseout',
  MOUSE_ENTER: 'mouseenter',
  MOUSE_LEAVE: 'mouseleave',
  MOUSE_WHEEL: _get__("browser").isEdge ? 'mousewheel' : 'wheel',
  POINTER_UP: 'pointerup',
  POINTER_DOWN: 'pointerdown',
  POINTER_MOVE: 'pointermove',
  CONTEXT_MENU: 'contextmenu',
  WHEEL: 'wheel',
  // Keyboard
  KEY_DOWN: 'keydown',
  KEY_PRESS: 'keypress',
  KEY_UP: 'keyup',
  // HTML Document
  LOAD: 'load',
  BEFORE_UNLOAD: 'beforeunload',
  UNLOAD: 'unload',
  ABORT: 'abort',
  ERROR: 'error',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  FULLSCREEN_CHANGE: 'fullscreenchange',
  WK_FULLSCREEN_CHANGE: 'webkitfullscreenchange',
  // Form
  SELECT: 'select',
  CHANGE: 'change',
  SUBMIT: 'submit',
  RESET: 'reset',
  FOCUS: 'focus',
  FOCUS_IN: 'focusin',
  FOCUS_OUT: 'focusout',
  BLUR: 'blur',
  INPUT: 'input',
  // Local Storage
  STORAGE: 'storage',
  // Drag
  DRAG_START: 'dragstart',
  DRAG: 'drag',
  DRAG_ENTER: 'dragenter',
  DRAG_LEAVE: 'dragleave',
  DRAG_OVER: 'dragover',
  DROP: 'drop',
  DRAG_END: 'dragend',
  // Animation
  ANIMATION_START: _get__("browser").isWebKit ? 'webkitAnimationStart' : 'animationstart',
  ANIMATION_END: _get__("browser").isWebKit ? 'webkitAnimationEnd' : 'animationend',
  ANIMATION_ITERATION: _get__("browser").isWebKit ? 'webkitAnimationIteration' : 'animationiteration'
};
exports.EventHelper = {
  stop: function (e, cancelBubble) {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      // IE8
      e.returnValue = false;
    }

    if (cancelBubble) {
      if (e.stopPropagation) {
        e.stopPropagation();
      } else {
        // IE8
        e.cancelBubble = true;
      }
    }
  }
};

function saveParentsScrollTop(node) {
  let r = [];

  for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
    r[i] = node.scrollTop;
    node = node.parentNode;
  }

  return r;
}

exports.saveParentsScrollTop = _get__("saveParentsScrollTop");

function restoreParentsScrollTop(node, state) {
  for (let i = 0; node && node.nodeType === node.ELEMENT_NODE; i++) {
    if (node.scrollTop !== state[i]) {
      node.scrollTop = state[i];
    }

    node = node.parentNode;
  }
}

exports.restoreParentsScrollTop = _get__("restoreParentsScrollTop");

class FocusTracker extends _get__("lifecycle_1").Disposable {
  constructor(element) {
    super();
    this._onDidFocus = this._register(new (_get__("event_2").Emitter)());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlur = this._register(new (_get__("event_2").Emitter)());
    this.onDidBlur = this._onDidBlur.event;

    let hasFocus = _get__("isAncestor")(document.activeElement, element);

    let loosingFocus = false;

    const onFocus = () => {
      loosingFocus = false;

      if (!hasFocus) {
        hasFocus = true;

        this._onDidFocus.fire();
      }
    };

    const onBlur = () => {
      if (hasFocus) {
        loosingFocus = true;
        window.setTimeout(() => {
          if (loosingFocus) {
            loosingFocus = false;
            hasFocus = false;

            this._onDidBlur.fire();
          }
        }, 0);
      }
    };

    this._refreshStateHandler = () => {
      let currentNodeHasFocus = _get__("isAncestor")(document.activeElement, element);

      if (currentNodeHasFocus !== hasFocus) {
        if (hasFocus) {
          onBlur();
        } else {
          onFocus();
        }
      }
    };

    this._register((0, _get__("event_1").domEvent)(element, exports.EventType.FOCUS, true)(onFocus));

    this._register((0, _get__("event_1").domEvent)(element, exports.EventType.BLUR, true)(onBlur));
  }

  refreshState() {
    this._refreshStateHandler();
  }

}

function trackFocus(element) {
  return new (_get__("FocusTracker"))(element);
}

exports.trackFocus = _get__("trackFocus");

function append(parent, ...children) {
  children.forEach(child => parent.appendChild(child));
  return children[children.length - 1];
}

exports.append = _get__("append");

function prepend(parent, child) {
  parent.insertBefore(child, parent.firstChild);
  return child;
}

exports.prepend = _get__("prepend");
const SELECTOR_REGEX = /([\w\-]+)?(#([\w\-]+))?((\.([\w\-]+))*)/;
var Namespace;

(function (Namespace) {
  Namespace["HTML"] = "http://www.w3.org/1999/xhtml";
  Namespace["SVG"] = "http://www.w3.org/2000/svg";
})(_assign__("Namespace", exports.Namespace || (exports.Namespace = {})));

function _$(namespace, description, attrs, ...children) {
  let match = _get__("SELECTOR_REGEX").exec(description);

  if (!match) {
    throw new Error('Bad use of emmet');
  }

  attrs = { ...(attrs || {})
  };
  let tagName = match[1] || 'div';
  let result;

  if (namespace !== _get__("Namespace").HTML) {
    result = document.createElementNS(namespace, tagName);
  } else {
    result = document.createElement(tagName);
  }

  if (match[3]) {
    result.id = match[3];
  }

  if (match[4]) {
    result.className = match[4].replace(/\./g, ' ').trim();
  }

  Object.keys(attrs).forEach(name => {
    const value = attrs[name];

    if (typeof value === 'undefined') {
      return;
    }

    if (/^on\w+$/.test(name)) {
      result[name] = value;
    } else if (name === 'selected') {
      if (value) {
        result.setAttribute(name, 'true');
      }
    } else {
      result.setAttribute(name, value);
    }
  });
  (0, _get__("arrays_1").coalesce)(children).forEach(child => {
    if (child instanceof Node) {
      result.appendChild(child);
    } else {
      result.appendChild(document.createTextNode(child));
    }
  });
  return result;
}

function $(description, attrs, ...children) {
  return _get__("_$")(_get__("Namespace").HTML, description, attrs, ...children);
}

exports.$ = _get__("$");

_get__("$").SVG = function (description, attrs, ...children) {
  return _get__("_$")(_get__("Namespace").SVG, description, attrs, ...children);
};

function join(nodes, separator) {
  const result = [];
  nodes.forEach((node, index) => {
    if (index > 0) {
      if (separator instanceof Node) {
        result.push(separator.cloneNode());
      } else {
        result.push(document.createTextNode(separator));
      }
    }

    result.push(node);
  });
  return result;
}

exports.join = _get__("join");

function show(...elements) {
  for (let element of elements) {
    element.style.display = '';
    element.removeAttribute('aria-hidden');
  }
}

exports.show = _get__("show");

function hide(...elements) {
  for (let element of elements) {
    element.style.display = 'none';
    element.setAttribute('aria-hidden', 'true');
  }
}

exports.hide = _get__("hide");

function findParentWithAttribute(node, attribute) {
  while (node && node.nodeType === node.ELEMENT_NODE) {
    if (node instanceof HTMLElement && node.hasAttribute(attribute)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
}

function removeTabIndexAndUpdateFocus(node) {
  if (!node || !node.hasAttribute('tabIndex')) {
    return;
  } // If we are the currently focused element and tabIndex is removed,
  // standard DOM behavior is to move focus to the <body> element. We
  // typically never want that, rather put focus to the closest element
  // in the hierarchy of the parent DOM nodes.


  if (document.activeElement === node) {
    let parentFocusable = _get__("findParentWithAttribute")(node.parentElement, 'tabIndex');

    if (parentFocusable) {
      parentFocusable.focus();
    }
  }

  node.removeAttribute('tabindex');
}

exports.removeTabIndexAndUpdateFocus = _get__("removeTabIndexAndUpdateFocus");

function getElementsByTagName(tag) {
  return Array.prototype.slice.call(document.getElementsByTagName(tag), 0);
}

exports.getElementsByTagName = _get__("getElementsByTagName");

function finalHandler(fn) {
  return e => {
    e.preventDefault();
    e.stopPropagation();
    fn(e);
  };
}

exports.finalHandler = _get__("finalHandler");

function domContentLoaded() {
  return new Promise(resolve => {
    const readyState = document.readyState;

    if (readyState === 'complete' || document && document.body !== null) {
      _get__("platform").setImmediate(resolve);
    } else {
      window.addEventListener('DOMContentLoaded', resolve, false);
    }
  });
}

exports.domContentLoaded = _get__("domContentLoaded");
/**
 * Find a value usable for a dom node size such that the likelihood that it would be
 * displayed with constant screen pixels size is as high as possible.
 *
 * e.g. We would desire for the cursors to be 2px (CSS px) wide. Under a devicePixelRatio
 * of 1.25, the cursor will be 2.5 screen pixels wide. Depending on how the dom node aligns/"snaps"
 * with the screen pixels, it will sometimes be rendered with 2 screen pixels, and sometimes with 3 screen pixels.
 */

function computeScreenAwareSize(cssPx) {
  const screenPx = window.devicePixelRatio * cssPx;
  return Math.max(1, Math.floor(screenPx)) / window.devicePixelRatio;
}

exports.computeScreenAwareSize = _get__("computeScreenAwareSize");
/**
 * See https://github.com/Microsoft/monaco-editor/issues/601
 * To protect against malicious code in the linked site, particularly phishing attempts,
 * the window.opener should be set to null to prevent the linked site from having access
 * to change the location of the current page.
 * See https://mathiasbynens.github.io/rel-noopener/
 */

function windowOpenNoOpener(url) {
  if (_get__("platform").isNative || _get__("browser").isEdgeWebView) {
    // In VSCode, window.open() always returns null...
    // The same is true for a WebView (see https://github.com/Microsoft/monaco-editor/issues/628)
    window.open(url);
  } else {
    let newTab = window.open();

    if (newTab) {
      newTab.opener = null;
      newTab.location.href = url;
    }
  }
}

exports.windowOpenNoOpener = _get__("windowOpenNoOpener");

function animate(fn) {
  const step = () => {
    fn();
    stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(step);
  };

  let stepDisposable = (0, exports.scheduleAtNextAnimationFrame)(step);
  return (0, _get__("lifecycle_1").toDisposable)(() => stepDisposable.dispose());
}

exports.animate = _get__("animate");

_get__("network_1").RemoteAuthorities.setPreferredWebSchema(/^https:/.test(window.location.href) ? 'https' : 'http');

function asDomUri(uri) {
  if (!uri) {
    return uri;
  }

  if (_get__("network_1").Schemas.vscodeRemote === uri.scheme) {
    return _get__("network_1").RemoteAuthorities.rewrite(uri);
  }

  return uri;
}

exports.asDomUri = _get__("asDomUri");
/**
 * returns url('...')
 */

function asCSSUrl(uri) {
  if (!uri) {
    return `url('')`;
  }

  return `url('${_get__("asDomUri")(uri).toString(true).replace(/'/g, '%27')}')`;
}

exports.asCSSUrl = _get__("asCSSUrl");

function triggerDownload(dataOrUri, name) {
  // If the data is provided as Buffer, we create a
  // blog URL out of it to produce a valid link
  let url;

  if (_get__("uri_1").URI.isUri(dataOrUri)) {
    url = dataOrUri.toString(true);
  } else {
    const blob = new Blob([dataOrUri]);
    url = URL.createObjectURL(blob); // Ensure to free the data from DOM eventually

    setTimeout(() => URL.revokeObjectURL(url));
  } // In order to download from the browser, the only way seems
  // to be creating a <a> element with download attribute that
  // points to the file to download.
  // See also https://developers.google.com/web/updates/2011/08/Downloading-resources-in-HTML5-a-download


  const anchor = document.createElement('a');
  document.body.appendChild(anchor);
  anchor.download = name;
  anchor.href = url;
  anchor.click(); // Ensure to remove the element from DOM eventually

  setTimeout(() => document.body.removeChild(anchor));
}

exports.triggerDownload = _get__("triggerDownload");

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

    case "clearNode":
      return clearNode;

    case "removeNode":
      return removeNode;

    case "isInDOM":
      return isInDOM;

    case "_classList":
      return _classList;

    case "DomListener":
      return DomListener;

    case "addDisposableListener":
      return addDisposableListener;

    case "mouseEvent_1":
      return mouseEvent_1;

    case "keyboardEvent_1":
      return keyboardEvent_1;

    case "_wrapAsStandardMouseEvent":
      return _wrapAsStandardMouseEvent;

    case "_wrapAsStandardKeyboardEvent":
      return _wrapAsStandardKeyboardEvent;

    case "addStandardDisposableListener":
      return addStandardDisposableListener;

    case "addDisposableGenericMouseDownListner":
      return addDisposableGenericMouseDownListner;

    case "addStandardDisposableGenericMouseDownListner":
      return addStandardDisposableGenericMouseDownListner;

    case "addDisposableGenericMouseUpListner":
      return addDisposableGenericMouseUpListner;

    case "addStandardDisposableGenericMouseUpListner":
      return addStandardDisposableGenericMouseUpListner;

    case "platform":
      return platform;

    case "canIUse_1":
      return canIUse_1;

    case "addDisposableGenericMouseMoveListner":
      return addDisposableGenericMouseMoveListner;

    case "addDisposableNonBubblingMouseOutListener":
      return addDisposableNonBubblingMouseOutListener;

    case "addDisposableNonBubblingPointerOutListener":
      return addDisposableNonBubblingPointerOutListener;

    case "_animationFrame":
      return _animationFrame;

    case "errors_1":
      return errors_1;

    case "AnimationFrameQueueItem":
      return AnimationFrameQueueItem;

    case "doRequestAnimationFrame":
      return doRequestAnimationFrame;

    case "measure":
      return measure;

    case "modify":
      return modify;

    case "DEFAULT_EVENT_MERGER":
      return DEFAULT_EVENT_MERGER;

    case "MINIMUM_TIME_MS":
      return MINIMUM_TIME_MS;

    case "async_1":
      return async_1;

    case "lifecycle_1":
      return lifecycle_1;

    case "TimeoutThrottledDomListener":
      return TimeoutThrottledDomListener;

    case "addDisposableThrottledListener":
      return addDisposableThrottledListener;

    case "getComputedStyle":
      return getComputedStyle;

    case "Dimension":
      return Dimension;

    case "browser":
      return browser;

    case "getClientArea":
      return getClientArea;

    case "SizeUtils":
      return SizeUtils;

    case "isShadowRoot":
      return isShadowRoot;

    case "getTopLeftOffset":
      return getTopLeftOffset;

    case "size":
      return size;

    case "position":
      return position;

    case "getDomNodePagePosition":
      return getDomNodePagePosition;

    case "getTotalWidth":
      return getTotalWidth;

    case "getContentWidth":
      return getContentWidth;

    case "getTotalScrollWidth":
      return getTotalScrollWidth;

    case "getContentHeight":
      return getContentHeight;

    case "getTotalHeight":
      return getTotalHeight;

    case "getRelativeLeft":
      return getRelativeLeft;

    case "getLargestChildWidth":
      return getLargestChildWidth;

    case "isAncestor":
      return isAncestor;

    case "findParentWithClass":
      return findParentWithClass;

    case "hasParentWithClass":
      return hasParentWithClass;

    case "getShadowRoot":
      return getShadowRoot;

    case "isInShadowDOM":
      return isInShadowDOM;

    case "getActiveElement":
      return getActiveElement;

    case "createStyleSheet":
      return createStyleSheet;

    case "createMetaElement":
      return createMetaElement;

    case "_sharedStyleSheet":
      return _sharedStyleSheet;

    case "getSharedStyleSheet":
      return getSharedStyleSheet;

    case "createCSSRule":
      return createCSSRule;

    case "getDynamicStyleSheetRules":
      return getDynamicStyleSheetRules;

    case "removeCSSRulesContainingSelector":
      return removeCSSRulesContainingSelector;

    case "isHTMLElement":
      return isHTMLElement;

    case "saveParentsScrollTop":
      return saveParentsScrollTop;

    case "restoreParentsScrollTop":
      return restoreParentsScrollTop;

    case "event_2":
      return event_2;

    case "event_1":
      return event_1;

    case "FocusTracker":
      return FocusTracker;

    case "trackFocus":
      return trackFocus;

    case "append":
      return append;

    case "prepend":
      return prepend;

    case "Namespace":
      return Namespace;

    case "SELECTOR_REGEX":
      return SELECTOR_REGEX;

    case "arrays_1":
      return arrays_1;

    case "_$":
      return _$;

    case "$":
      return $;

    case "join":
      return join;

    case "show":
      return show;

    case "hide":
      return hide;

    case "findParentWithAttribute":
      return findParentWithAttribute;

    case "removeTabIndexAndUpdateFocus":
      return removeTabIndexAndUpdateFocus;

    case "getElementsByTagName":
      return getElementsByTagName;

    case "finalHandler":
      return finalHandler;

    case "domContentLoaded":
      return domContentLoaded;

    case "computeScreenAwareSize":
      return computeScreenAwareSize;

    case "windowOpenNoOpener":
      return windowOpenNoOpener;

    case "animate":
      return animate;

    case "network_1":
      return network_1;

    case "asDomUri":
      return asDomUri;

    case "asCSSUrl":
      return asCSSUrl;

    case "uri_1":
      return uri_1;

    case "triggerDownload":
      return triggerDownload;
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
    case "_animationFrame":
      return _animationFrame = _value;

    case "_sharedStyleSheet":
      return _sharedStyleSheet = _value;

    case "Namespace":
      return Namespace = _value;
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