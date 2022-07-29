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
exports.IntervalCounter = exports.TaskSequentializer = exports.retry = exports.IdleValue = exports.runWhenIdle = exports.RunOnceWorker = exports.RunOnceScheduler = exports.IntervalTimer = exports.TimeoutTimer = exports.ResourceQueue = exports.Queue = exports.Limiter = exports.firstParallel = exports.first = exports.sequence = exports.ignoreErrors = exports.disposableTimeout = exports.timeout = exports.Barrier = exports.ThrottledDelayer = exports.Delayer = exports.SequencerByKey = exports.Sequencer = exports.Throttler = exports.asPromise = exports.raceTimeout = exports.raceCancellablePromises = exports.raceCancellation = exports.createCancelablePromise = exports.isThenable = void 0;

const cancellation_1 = require("./cancellation");

const errors = _get__("__importStar")(require("./errors"));

const event_1 = require("./event");

const lifecycle_1 = require("./lifecycle");

function isThenable(obj) {
  return obj && typeof obj.then === 'function';
}

exports.isThenable = _get__("isThenable");

function createCancelablePromise(callback) {
  const source = new (_get__("cancellation_1").CancellationTokenSource)();
  const thenable = callback(source.token);
  const promise = new Promise((resolve, reject) => {
    source.token.onCancellationRequested(() => {
      reject(_get__("errors").canceled());
    });
    Promise.resolve(thenable).then(value => {
      source.dispose();
      resolve(value);
    }, err => {
      source.dispose();
      reject(err);
    });
  });
  return new class {
    cancel() {
      source.cancel();
    }

    then(resolve, reject) {
      return promise.then(resolve, reject);
    }

    catch(reject) {
      return this.then(undefined, reject);
    }

    finally(onfinally) {
      return promise.finally(onfinally);
    }

  }();
}

exports.createCancelablePromise = _get__("createCancelablePromise");

function raceCancellation(promise, token, defaultValue) {
  return Promise.race([promise, new Promise(resolve => token.onCancellationRequested(() => resolve(defaultValue)))]);
}

exports.raceCancellation = _get__("raceCancellation");
/**
 * Returns as soon as one of the promises is resolved and cancels remaining promises
 */

async function raceCancellablePromises(cancellablePromises) {
  let resolvedPromiseIndex = -1;
  const promises = cancellablePromises.map((promise, index) => promise.then(result => {
    resolvedPromiseIndex = index;
    return result;
  }));
  const result = await Promise.race(promises);
  cancellablePromises.forEach((cancellablePromise, index) => {
    if (index !== resolvedPromiseIndex) {
      cancellablePromise.cancel();
    }
  });
  return result;
}

exports.raceCancellablePromises = _get__("raceCancellablePromises");

function raceTimeout(promise, timeout, onTimeout) {
  let promiseResolve = undefined;
  const timer = setTimeout(() => {
    promiseResolve === null || promiseResolve === void 0 ? void 0 : promiseResolve(undefined);
    onTimeout === null || onTimeout === void 0 ? void 0 : onTimeout();
  }, timeout);
  return Promise.race([promise.finally(() => clearTimeout(timer)), new Promise(resolve => promiseResolve = resolve)]);
}

exports.raceTimeout = _get__("raceTimeout");

function asPromise(callback) {
  return new Promise((resolve, reject) => {
    const item = callback();

    if (_get__("isThenable")(item)) {
      item.then(resolve, reject);
    } else {
      resolve(item);
    }
  });
}

exports.asPromise = _get__("asPromise");
/**
 * A helper to prevent accumulation of sequential async tasks.
 *
 * Imagine a mail man with the sole task of delivering letters. As soon as
 * a letter submitted for delivery, he drives to the destination, delivers it
 * and returns to his base. Imagine that during the trip, N more letters were submitted.
 * When the mail man returns, he picks those N letters and delivers them all in a
 * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
 *
 * The throttler implements this via the queue() method, by providing it a task
 * factory. Following the example:
 *
 * 		const throttler = new Throttler();
 * 		const letters = [];
 *
 * 		function deliver() {
 * 			const lettersToDeliver = letters;
 * 			letters = [];
 * 			return makeTheTrip(lettersToDeliver);
 * 		}
 *
 * 		function onLetterReceived(l) {
 * 			letters.push(l);
 * 			throttler.queue(deliver);
 * 		}
 */

class Throttler {
  constructor() {
    this.activePromise = null;
    this.queuedPromise = null;
    this.queuedPromiseFactory = null;
  }

  queue(promiseFactory) {
    if (this.activePromise) {
      this.queuedPromiseFactory = promiseFactory;

      if (!this.queuedPromise) {
        const onComplete = () => {
          this.queuedPromise = null;
          const result = this.queue(this.queuedPromiseFactory);
          this.queuedPromiseFactory = null;
          return result;
        };

        this.queuedPromise = new Promise(c => {
          this.activePromise.then(onComplete, onComplete).then(c);
        });
      }

      return new Promise((c, e) => {
        this.queuedPromise.then(c, e);
      });
    }

    this.activePromise = promiseFactory();
    return new Promise((resolve, reject) => {
      this.activePromise.then(result => {
        this.activePromise = null;
        resolve(result);
      }, err => {
        this.activePromise = null;
        reject(err);
      });
    });
  }

}

exports.Throttler = _get__("Throttler");

class Sequencer {
  constructor() {
    this.current = Promise.resolve(null);
  }

  queue(promiseTask) {
    return this.current = this.current.then(() => promiseTask());
  }

}

exports.Sequencer = _get__("Sequencer");

class SequencerByKey {
  constructor() {
    this.promiseMap = new Map();
  }

  queue(key, promiseTask) {
    var _a;

    const runningPromise = (_a = this.promiseMap.get(key)) !== null && _a !== void 0 ? _a : Promise.resolve();
    const newPromise = runningPromise.catch(() => {}).then(promiseTask).finally(() => {
      if (this.promiseMap.get(key) === newPromise) {
        this.promiseMap.delete(key);
      }
    });
    this.promiseMap.set(key, newPromise);
    return newPromise;
  }

}

exports.SequencerByKey = _get__("SequencerByKey");
/**
 * A helper to delay execution of a task that is being requested often.
 *
 * Following the throttler, now imagine the mail man wants to optimize the number of
 * trips proactively. The trip itself can be long, so he decides not to make the trip
 * as soon as a letter is submitted. Instead he waits a while, in case more
 * letters are submitted. After said waiting period, if no letters were submitted, he
 * decides to make the trip. Imagine that N more letters were submitted after the first
 * one, all within a short period of time between each other. Even though N+1
 * submissions occurred, only 1 delivery was made.
 *
 * The delayer offers this behavior via the trigger() method, into which both the task
 * to be executed and the waiting period (delay) must be passed in as arguments. Following
 * the example:
 *
 * 		const delayer = new Delayer(WAITING_PERIOD);
 * 		const letters = [];
 *
 * 		function letterReceived(l) {
 * 			letters.push(l);
 * 			delayer.trigger(() => { return makeTheTrip(); });
 * 		}
 */

class Delayer {
  constructor(defaultDelay) {
    this.defaultDelay = defaultDelay;
    this.timeout = null;
    this.completionPromise = null;
    this.doResolve = null;
    this.doReject = null;
    this.task = null;
  }

  trigger(task, delay = this.defaultDelay) {
    this.task = task;
    this.cancelTimeout();

    if (!this.completionPromise) {
      this.completionPromise = new Promise((c, e) => {
        this.doResolve = c;
        this.doReject = e;
      }).then(() => {
        this.completionPromise = null;
        this.doResolve = null;

        if (this.task) {
          const task = this.task;
          this.task = null;
          return task();
        }

        return undefined;
      });
    }

    this.timeout = setTimeout(() => {
      this.timeout = null;

      if (this.doResolve) {
        this.doResolve(null);
      }
    }, delay);
    return this.completionPromise;
  }

  isTriggered() {
    return this.timeout !== null;
  }

  cancel() {
    this.cancelTimeout();

    if (this.completionPromise) {
      if (this.doReject) {
        this.doReject(_get__("errors").canceled());
      }

      this.completionPromise = null;
    }
  }

  cancelTimeout() {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  dispose() {
    this.cancelTimeout();
  }

}

exports.Delayer = _get__("Delayer");
/**
 * A helper to delay execution of a task that is being requested often, while
 * preventing accumulation of consecutive executions, while the task runs.
 *
 * The mail man is clever and waits for a certain amount of time, before going
 * out to deliver letters. While the mail man is going out, more letters arrive
 * and can only be delivered once he is back. Once he is back the mail man will
 * do one more trip to deliver the letters that have accumulated while he was out.
 */

class ThrottledDelayer {
  constructor(defaultDelay) {
    this.delayer = new (_get__("Delayer"))(defaultDelay);
    this.throttler = new (_get__("Throttler"))();
  }

  trigger(promiseFactory, delay) {
    return this.delayer.trigger(() => this.throttler.queue(promiseFactory), delay);
  }

  isTriggered() {
    return this.delayer.isTriggered();
  }

  cancel() {
    this.delayer.cancel();
  }

  dispose() {
    this.delayer.dispose();
  }

}

exports.ThrottledDelayer = _get__("ThrottledDelayer");
/**
 * A barrier that is initially closed and then becomes opened permanently.
 */

class Barrier {
  constructor() {
    this._isOpen = false;
    this._promise = new Promise((c, e) => {
      this._completePromise = c;
    });
  }

  isOpen() {
    return this._isOpen;
  }

  open() {
    this._isOpen = true;

    this._completePromise(true);
  }

  wait() {
    return this._promise;
  }

}

exports.Barrier = _get__("Barrier");

function timeout(millis, token) {
  if (!token) {
    return _get__("createCancelablePromise")(token => _get__("timeout")(millis, token));
  }

  return new Promise((resolve, reject) => {
    const handle = setTimeout(resolve, millis);
    token.onCancellationRequested(() => {
      clearTimeout(handle);
      reject(_get__("errors").canceled());
    });
  });
}

exports.timeout = _get__("timeout");

function disposableTimeout(handler, timeout = 0) {
  const timer = setTimeout(handler, timeout);
  return (0, _get__("lifecycle_1").toDisposable)(() => clearTimeout(timer));
}

exports.disposableTimeout = _get__("disposableTimeout");

function ignoreErrors(promise) {
  return promise.then(undefined, _ => undefined);
}

exports.ignoreErrors = _get__("ignoreErrors");
/**
 * Runs the provided list of promise factories in sequential order. The returned
 * promise will complete to an array of results from each promise.
 */

function sequence(promiseFactories) {
  const results = [];
  let index = 0;
  const len = promiseFactories.length;

  function next() {
    return index < len ? promiseFactories[index++]() : null;
  }

  function thenHandler(result) {
    if (result !== undefined && result !== null) {
      results.push(result);
    }

    const n = next();

    if (n) {
      return n.then(thenHandler);
    }

    return Promise.resolve(results);
  }

  return Promise.resolve(null).then(thenHandler);
}

exports.sequence = _get__("sequence");

function first(promiseFactories, shouldStop = t => !!t, defaultValue = null) {
  let index = 0;
  const len = promiseFactories.length;

  const loop = () => {
    if (index >= len) {
      return Promise.resolve(defaultValue);
    }

    const factory = promiseFactories[index++];
    const promise = Promise.resolve(factory());
    return promise.then(result => {
      if (shouldStop(result)) {
        return Promise.resolve(result);
      }

      return loop();
    });
  };

  return loop();
}

exports.first = _get__("first");

function firstParallel(promiseList, shouldStop = t => !!t, defaultValue = null) {
  if (promiseList.length === 0) {
    return Promise.resolve(defaultValue);
  }

  let todo = promiseList.length;

  const finish = () => {
    var _a, _b;

    todo = -1;

    for (const promise of promiseList) {
      (_b = (_a = promise).cancel) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
  };

  return new Promise((resolve, reject) => {
    for (const promise of promiseList) {
      promise.then(result => {
        if (--todo >= 0 && shouldStop(result)) {
          finish();
          resolve(result);
        } else if (todo === 0) {
          resolve(defaultValue);
        }
      }).catch(err => {
        if (--todo >= 0) {
          finish();
          reject(err);
        }
      });
    }
  });
}

exports.firstParallel = _get__("firstParallel");
/**
 * A helper to queue N promises and run them all with a max degree of parallelism. The helper
 * ensures that at any time no more than M promises are running at the same time.
 */

class Limiter {
  constructor(maxDegreeOfParalellism) {
    this._size = 0;
    this.maxDegreeOfParalellism = maxDegreeOfParalellism;
    this.outstandingPromises = [];
    this.runningPromises = 0;
    this._onFinished = new (_get__("event_1").Emitter)();
  }

  get onFinished() {
    return this._onFinished.event;
  }

  get size() {
    return this._size; // return this.runningPromises + this.outstandingPromises.length;
  }

  queue(factory) {
    this._size++;
    return new Promise((c, e) => {
      this.outstandingPromises.push({
        factory,
        c,
        e
      });
      this.consume();
    });
  }

  consume() {
    while (this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism) {
      const iLimitedTask = this.outstandingPromises.shift();
      this.runningPromises++;
      const promise = iLimitedTask.factory();
      promise.then(iLimitedTask.c, iLimitedTask.e);
      promise.then(() => this.consumed(), () => this.consumed());
    }
  }

  consumed() {
    this._size--;
    this.runningPromises--;

    if (this.outstandingPromises.length > 0) {
      this.consume();
    } else {
      this._onFinished.fire();
    }
  }

  dispose() {
    this._onFinished.dispose();
  }

}

exports.Limiter = _get__("Limiter");
/**
 * A queue is handles one promise at a time and guarantees that at any time only one promise is executing.
 */

class Queue extends _get__("Limiter") {
  constructor() {
    super(1);
  }

}

exports.Queue = _get__("Queue");
/**
 * A helper to organize queues per resource. The ResourceQueue makes sure to manage queues per resource
 * by disposing them once the queue is empty.
 */

class ResourceQueue {
  constructor() {
    this.queues = new Map();
  }

  queueFor(resource) {
    const key = resource.toString();

    if (!this.queues.has(key)) {
      const queue = new (_get__("Queue"))();
      queue.onFinished(() => {
        queue.dispose();
        this.queues.delete(key);
      });
      this.queues.set(key, queue);
    }

    return this.queues.get(key);
  }

  dispose() {
    this.queues.forEach(queue => queue.dispose());
    this.queues.clear();
  }

}

exports.ResourceQueue = _get__("ResourceQueue");

class TimeoutTimer {
  constructor(runner, timeout) {
    this._token = -1;

    if (typeof runner === 'function' && typeof timeout === 'number') {
      this.setIfNotSet(runner, timeout);
    }
  }

  dispose() {
    this.cancel();
  }

  cancel() {
    if (this._token !== -1) {
      clearTimeout(this._token);
      this._token = -1;
    }
  }

  cancelAndSet(runner, timeout) {
    this.cancel();
    this._token = setTimeout(() => {
      this._token = -1;
      runner();
    }, timeout);
  }

  setIfNotSet(runner, timeout) {
    if (this._token !== -1) {
      // timer is already set
      return;
    }

    this._token = setTimeout(() => {
      this._token = -1;
      runner();
    }, timeout);
  }

}

exports.TimeoutTimer = _get__("TimeoutTimer");

class IntervalTimer {
  constructor() {
    this._token = -1;
  }

  dispose() {
    this.cancel();
  }

  cancel() {
    if (this._token !== -1) {
      clearInterval(this._token);
      this._token = -1;
    }
  }

  cancelAndSet(runner, interval) {
    this.cancel();
    this._token = setInterval(() => {
      runner();
    }, interval);
  }

}

exports.IntervalTimer = _get__("IntervalTimer");

class RunOnceScheduler {
  constructor(runner, delay) {
    this.timeoutToken = -1;
    this.runner = runner;
    this.timeout = delay;
    this.timeoutHandler = this.onTimeout.bind(this);
  }
  /**
   * Dispose RunOnceScheduler
   */


  dispose() {
    this.cancel();
    this.runner = null;
  }
  /**
   * Cancel current scheduled runner (if any).
   */


  cancel() {
    if (this.isScheduled()) {
      clearTimeout(this.timeoutToken);
      this.timeoutToken = -1;
    }
  }
  /**
   * Cancel previous runner (if any) & schedule a new runner.
   */


  schedule(delay = this.timeout) {
    this.cancel();
    this.timeoutToken = setTimeout(this.timeoutHandler, delay);
  }

  get delay() {
    return this.timeout;
  }

  set delay(value) {
    this.timeout = value;
  }
  /**
   * Returns true if scheduled.
   */


  isScheduled() {
    return this.timeoutToken !== -1;
  }

  onTimeout() {
    this.timeoutToken = -1;

    if (this.runner) {
      this.doRun();
    }
  }

  doRun() {
    if (this.runner) {
      this.runner();
    }
  }

}

exports.RunOnceScheduler = _get__("RunOnceScheduler");

class RunOnceWorker extends _get__("RunOnceScheduler") {
  constructor(runner, timeout) {
    super(runner, timeout);
    this.units = [];
  }

  work(unit) {
    this.units.push(unit);

    if (!this.isScheduled()) {
      this.schedule();
    }
  }

  doRun() {
    const units = this.units;
    this.units = [];

    if (this.runner) {
      this.runner(units);
    }
  }

  dispose() {
    this.units = [];
    super.dispose();
  }

}

exports.RunOnceWorker = _get__("RunOnceWorker");

(function () {
  if (typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function') {
    const dummyIdle = Object.freeze({
      didTimeout: true,

      timeRemaining() {
        return 15;
      }

    });

    exports.runWhenIdle = runner => {
      const handle = setTimeout(() => runner(dummyIdle));
      let disposed = false;
      return {
        dispose() {
          if (disposed) {
            return;
          }

          disposed = true;
          clearTimeout(handle);
        }

      };
    };
  } else {
    exports.runWhenIdle = (runner, timeout) => {
      const handle = requestIdleCallback(runner, typeof timeout === 'number' ? {
        timeout
      } : undefined);
      let disposed = false;
      return {
        dispose() {
          if (disposed) {
            return;
          }

          disposed = true;
          cancelIdleCallback(handle);
        }

      };
    };
  }
})();
/**
 * An implementation of the "idle-until-urgent"-strategy as introduced
 * here: https://philipwalton.com/articles/idle-until-urgent/
 */


class IdleValue {
  constructor(executor) {
    this._didRun = false;

    this._executor = () => {
      try {
        this._value = executor();
      } catch (err) {
        this._error = err;
      } finally {
        this._didRun = true;
      }
    };

    this._handle = (0, exports.runWhenIdle)(() => this._executor());
  }

  dispose() {
    this._handle.dispose();
  }

  get value() {
    if (!this._didRun) {
      this._handle.dispose();

      this._executor();
    }

    if (this._error) {
      throw this._error;
    }

    return this._value;
  }

}

exports.IdleValue = _get__("IdleValue"); //#endregion

async function retry(task, delay, retries) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      await _get__("timeout")(delay);
    }
  }

  throw lastError;
}

exports.retry = _get__("retry");

class TaskSequentializer {
  hasPending(taskId) {
    if (!this._pending) {
      return false;
    }

    if (typeof taskId === 'number') {
      return this._pending.taskId === taskId;
    }

    return !!this._pending;
  }

  get pending() {
    return this._pending ? this._pending.promise : undefined;
  }

  cancelPending() {
    var _a;

    (_a = this._pending) === null || _a === void 0 ? void 0 : _a.cancel();
  }

  setPending(taskId, promise, onCancel) {
    this._pending = {
      taskId: taskId,
      cancel: () => onCancel === null || onCancel === void 0 ? void 0 : onCancel(),
      promise
    };
    promise.then(() => this.donePending(taskId), () => this.donePending(taskId));
    return promise;
  }

  donePending(taskId) {
    if (this._pending && taskId === this._pending.taskId) {
      // only set pending to done if the promise finished that is associated with that taskId
      this._pending = undefined; // schedule the next task now that we are free if we have any

      this.triggerNext();
    }
  }

  triggerNext() {
    if (this._next) {
      const next = this._next;
      this._next = undefined; // Run next task and complete on the associated promise

      next.run().then(next.promiseResolve, next.promiseReject);
    }
  }

  setNext(run) {
    // this is our first next task, so we create associated promise with it
    // so that we can return a promise that completes when the task has
    // completed.
    if (!this._next) {
      let promiseResolve;
      let promiseReject;
      const promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
      });
      this._next = {
        run,
        promise,
        promiseResolve: promiseResolve,
        promiseReject: promiseReject
      };
    } // we have a previous next task, just overwrite it
    else {
      this._next.run = run;
    }

    return this._next.promise;
  }

}

exports.TaskSequentializer = _get__("TaskSequentializer"); //#endregion
//#region

/**
 * The `IntervalCounter` allows to count the number
 * of calls to `increment()` over a duration of
 * `interval`. This utility can be used to conditionally
 * throttle a frequent task when a certain threshold
 * is reached.
 */

class IntervalCounter {
  constructor(interval) {
    this.interval = interval;
    this.lastIncrementTime = 0;
    this.value = 0;
  }

  increment() {
    const now = Date.now(); // We are outside of the range of `interval` and as such
    // start counting from 0 and remember the time

    if (now - this.lastIncrementTime > this.interval) {
      this.lastIncrementTime = now;
      this.value = 0;
    }

    this.value++;
    return this.value;
  }

}

exports.IntervalCounter = _get__("IntervalCounter"); //#endregion

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

    case "isThenable":
      return isThenable;

    case "cancellation_1":
      return cancellation_1;

    case "errors":
      return errors;

    case "createCancelablePromise":
      return createCancelablePromise;

    case "raceCancellation":
      return raceCancellation;

    case "raceCancellablePromises":
      return raceCancellablePromises;

    case "raceTimeout":
      return raceTimeout;

    case "asPromise":
      return asPromise;

    case "Throttler":
      return Throttler;

    case "Sequencer":
      return Sequencer;

    case "SequencerByKey":
      return SequencerByKey;

    case "Delayer":
      return Delayer;

    case "ThrottledDelayer":
      return ThrottledDelayer;

    case "Barrier":
      return Barrier;

    case "timeout":
      return timeout;

    case "lifecycle_1":
      return lifecycle_1;

    case "disposableTimeout":
      return disposableTimeout;

    case "ignoreErrors":
      return ignoreErrors;

    case "sequence":
      return sequence;

    case "first":
      return first;

    case "firstParallel":
      return firstParallel;

    case "event_1":
      return event_1;

    case "Limiter":
      return Limiter;

    case "Queue":
      return Queue;

    case "ResourceQueue":
      return ResourceQueue;

    case "TimeoutTimer":
      return TimeoutTimer;

    case "IntervalTimer":
      return IntervalTimer;

    case "RunOnceScheduler":
      return RunOnceScheduler;

    case "RunOnceWorker":
      return RunOnceWorker;

    case "IdleValue":
      return IdleValue;

    case "retry":
      return retry;

    case "TaskSequentializer":
      return TaskSequentializer;

    case "IntervalCounter":
      return IntervalCounter;
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