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

var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};

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
exports.Gesture = exports.EventType = void 0;

const arrays = _get__("__importStar")(require("../common/arrays"));

const lifecycle_1 = require("../common/lifecycle");

const DomUtils = _get__("__importStar")(require("./dom"));

const decorators_1 = require("../common/decorators");

var EventType;

(function (EventType) {
  EventType.Tap = '-monaco-gesturetap';
  EventType.Change = '-monaco-gesturechange';
  EventType.Start = '-monaco-gesturestart';
  EventType.End = '-monaco-gesturesend';
  EventType.Contextmenu = '-monaco-gesturecontextmenu';
})(_assign__("EventType", exports.EventType || (exports.EventType = {})));

class Gesture extends _get__("lifecycle_1").Disposable {
  constructor() {
    super();
    this.dispatched = false;
    this.activeTouches = {};
    this.handle = null;
    this.targets = [];
    this.ignoreTargets = [];
    this._lastSetTapCountTime = 0;

    this._register(_get__("DomUtils").addDisposableListener(document, 'touchstart', e => this.onTouchStart(e), {
      passive: false
    }));

    this._register(_get__("DomUtils").addDisposableListener(document, 'touchend', e => this.onTouchEnd(e)));

    this._register(_get__("DomUtils").addDisposableListener(document, 'touchmove', e => this.onTouchMove(e), {
      passive: false
    }));
  }

  static addTarget(element) {
    if (!_get__("Gesture").isTouchDevice()) {
      return _get__("lifecycle_1").Disposable.None;
    }

    if (!_get__("Gesture").INSTANCE) {
      _get__("Gesture").INSTANCE = new (_get__("Gesture"))();
    }

    _get__("Gesture").INSTANCE.targets.push(element);

    return {
      dispose: () => {
        _get__("Gesture").INSTANCE.targets = _get__("Gesture").INSTANCE.targets.filter(t => t !== element);
      }
    };
  }

  static ignoreTarget(element) {
    if (!_get__("Gesture").isTouchDevice()) {
      return _get__("lifecycle_1").Disposable.None;
    }

    if (!_get__("Gesture").INSTANCE) {
      _get__("Gesture").INSTANCE = new (_get__("Gesture"))();
    }

    _get__("Gesture").INSTANCE.ignoreTargets.push(element);

    return {
      dispose: () => {
        _get__("Gesture").INSTANCE.ignoreTargets = _get__("Gesture").INSTANCE.ignoreTargets.filter(t => t !== element);
      }
    };
  }

  static isTouchDevice() {
    // `'ontouchstart' in window` always evaluates to true with typescript's modern typings. This causes `window` to be
    // `never` later in `window.navigator`. That's why we need the explicit `window as Window` cast
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  dispose() {
    if (this.handle) {
      this.handle.dispose();
      this.handle = null;
    }

    super.dispose();
  }

  onTouchStart(e) {
    let timestamp = Date.now(); // use Date.now() because on FF e.timeStamp is not epoch based.

    if (this.handle) {
      this.handle.dispose();
      this.handle = null;
    }

    for (let i = 0, len = e.targetTouches.length; i < len; i++) {
      let touch = e.targetTouches.item(i);
      this.activeTouches[touch.identifier] = {
        id: touch.identifier,
        initialTarget: touch.target,
        initialTimeStamp: timestamp,
        initialPageX: touch.pageX,
        initialPageY: touch.pageY,
        rollingTimestamps: [timestamp],
        rollingPageX: [touch.pageX],
        rollingPageY: [touch.pageY]
      };
      let evt = this.newGestureEvent(_get__("EventType").Start, touch.target);
      evt.pageX = touch.pageX;
      evt.pageY = touch.pageY;
      this.dispatchEvent(evt);
    }

    if (this.dispatched) {
      e.preventDefault();
      e.stopPropagation();
      this.dispatched = false;
    }
  }

  onTouchEnd(e) {
    let timestamp = Date.now(); // use Date.now() because on FF e.timeStamp is not epoch based.

    let activeTouchCount = Object.keys(this.activeTouches).length;

    for (let i = 0, len = e.changedTouches.length; i < len; i++) {
      let touch = e.changedTouches.item(i);

      if (!this.activeTouches.hasOwnProperty(String(touch.identifier))) {
        console.warn('move of an UNKNOWN touch', touch);
        continue;
      }

      let data = this.activeTouches[touch.identifier],
          holdTime = Date.now() - data.initialTimeStamp;

      if (holdTime < _get__("Gesture").HOLD_DELAY && Math.abs(data.initialPageX - _get__("arrays").tail(data.rollingPageX)) < 30 && Math.abs(data.initialPageY - _get__("arrays").tail(data.rollingPageY)) < 30) {
        let evt = this.newGestureEvent(_get__("EventType").Tap, data.initialTarget);
        evt.pageX = _get__("arrays").tail(data.rollingPageX);
        evt.pageY = _get__("arrays").tail(data.rollingPageY);
        this.dispatchEvent(evt);
      } else if (holdTime >= _get__("Gesture").HOLD_DELAY && Math.abs(data.initialPageX - _get__("arrays").tail(data.rollingPageX)) < 30 && Math.abs(data.initialPageY - _get__("arrays").tail(data.rollingPageY)) < 30) {
        let evt = this.newGestureEvent(_get__("EventType").Contextmenu, data.initialTarget);
        evt.pageX = _get__("arrays").tail(data.rollingPageX);
        evt.pageY = _get__("arrays").tail(data.rollingPageY);
        this.dispatchEvent(evt);
      } else if (activeTouchCount === 1) {
        let finalX = _get__("arrays").tail(data.rollingPageX);

        let finalY = _get__("arrays").tail(data.rollingPageY);

        let deltaT = _get__("arrays").tail(data.rollingTimestamps) - data.rollingTimestamps[0];
        let deltaX = finalX - data.rollingPageX[0];
        let deltaY = finalY - data.rollingPageY[0]; // We need to get all the dispatch targets on the start of the inertia event

        const dispatchTo = this.targets.filter(t => data.initialTarget instanceof Node && t.contains(data.initialTarget));
        this.inertia(dispatchTo, timestamp, // time now
        Math.abs(deltaX) / deltaT, // speed
        deltaX > 0 ? 1 : -1, // x direction
        finalX, // x now
        Math.abs(deltaY) / deltaT, // y speed
        deltaY > 0 ? 1 : -1, // y direction
        finalY // y now
        );
      }

      this.dispatchEvent(this.newGestureEvent(_get__("EventType").End, data.initialTarget)); // forget about this touch

      delete this.activeTouches[touch.identifier];
    }

    if (this.dispatched) {
      e.preventDefault();
      e.stopPropagation();
      this.dispatched = false;
    }
  }

  newGestureEvent(type, initialTarget) {
    let event = document.createEvent('CustomEvent');
    event.initEvent(type, false, true);
    event.initialTarget = initialTarget;
    event.tapCount = 0;
    return event;
  }

  dispatchEvent(event) {
    if (event.type === _get__("EventType").Tap) {
      const currentTime = new Date().getTime();
      let setTapCount = 0;

      if (currentTime - this._lastSetTapCountTime > _get__("Gesture").CLEAR_TAP_COUNT_TIME) {
        setTapCount = 1;
      } else {
        setTapCount = 2;
      }

      this._lastSetTapCountTime = currentTime;
      event.tapCount = setTapCount;
    } else if (event.type === _get__("EventType").Change || event.type === _get__("EventType").Contextmenu) {
      // tap is canceled by scrolling or context menu
      this._lastSetTapCountTime = 0;
    }

    for (let i = 0; i < this.ignoreTargets.length; i++) {
      if (event.initialTarget instanceof Node && this.ignoreTargets[i].contains(event.initialTarget)) {
        return;
      }
    }

    this.targets.forEach(target => {
      if (event.initialTarget instanceof Node && target.contains(event.initialTarget)) {
        target.dispatchEvent(event);
        this.dispatched = true;
      }
    });
  }

  inertia(dispatchTo, t1, vX, dirX, x, vY, dirY, y) {
    this.handle = _get__("DomUtils").scheduleAtNextAnimationFrame(() => {
      let now = Date.now(); // velocity: old speed + accel_over_time

      let deltaT = now - t1,
          delta_pos_x = 0,
          delta_pos_y = 0,
          stopped = true;
      vX += _get__("Gesture").SCROLL_FRICTION * deltaT;
      vY += _get__("Gesture").SCROLL_FRICTION * deltaT;

      if (vX > 0) {
        stopped = false;
        delta_pos_x = dirX * vX * deltaT;
      }

      if (vY > 0) {
        stopped = false;
        delta_pos_y = dirY * vY * deltaT;
      } // dispatch translation event


      let evt = this.newGestureEvent(_get__("EventType").Change);
      evt.translationX = delta_pos_x;
      evt.translationY = delta_pos_y;
      dispatchTo.forEach(d => d.dispatchEvent(evt));

      if (!stopped) {
        this.inertia(dispatchTo, now, vX, dirX, x + delta_pos_x, vY, dirY, y + delta_pos_y);
      }
    });
  }

  onTouchMove(e) {
    let timestamp = Date.now(); // use Date.now() because on FF e.timeStamp is not epoch based.

    for (let i = 0, len = e.changedTouches.length; i < len; i++) {
      let touch = e.changedTouches.item(i);

      if (!this.activeTouches.hasOwnProperty(String(touch.identifier))) {
        console.warn('end of an UNKNOWN touch', touch);
        continue;
      }

      let data = this.activeTouches[touch.identifier];
      let evt = this.newGestureEvent(_get__("EventType").Change, data.initialTarget);
      evt.translationX = touch.pageX - _get__("arrays").tail(data.rollingPageX);
      evt.translationY = touch.pageY - _get__("arrays").tail(data.rollingPageY);
      evt.pageX = touch.pageX;
      evt.pageY = touch.pageY;
      this.dispatchEvent(evt); // only keep a few data points, to average the final speed

      if (data.rollingPageX.length > 3) {
        data.rollingPageX.shift();
        data.rollingPageY.shift();
        data.rollingTimestamps.shift();
      }

      data.rollingPageX.push(touch.pageX);
      data.rollingPageY.push(touch.pageY);
      data.rollingTimestamps.push(timestamp);
    }

    if (this.dispatched) {
      e.preventDefault();
      e.stopPropagation();
      this.dispatched = false;
    }
  }

}

_get__("Gesture").SCROLL_FRICTION = -0.005;
_get__("Gesture").HOLD_DELAY = 700;
_get__("Gesture").CLEAR_TAP_COUNT_TIME = 400; // ms

_get__("__decorate")([_get__("decorators_1").memoize], _get__("Gesture"), "isTouchDevice", null);

exports.Gesture = _get__("Gesture");

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

    case "EventType":
      return EventType;

    case "DomUtils":
      return DomUtils;

    case "Gesture":
      return Gesture;

    case "lifecycle_1":
      return lifecycle_1;

    case "arrays":
      return arrays;

    case "__decorate":
      return __decorate;

    case "decorators_1":
      return decorators_1;
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
    case "EventType":
      return EventType = _value;
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