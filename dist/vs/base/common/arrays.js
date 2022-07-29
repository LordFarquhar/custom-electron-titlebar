"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getRandomElement = exports.toArray = exports.asArray = exports.mapArrayOrNot = exports.find = exports.pushToEnd = exports.pushToStart = exports.shuffle = exports.arrayInsert = exports.remove = exports.insert = exports.index = exports.range = exports.flatten = exports.commonPrefixLength = exports.firstOrDefault = exports.first = exports.firstIndex = exports.lastIndex = exports.uniqueFilter = exports.distinctES6 = exports.distinct = exports.isNonEmptyArray = exports.isFalsyOrEmpty = exports.move = exports.coalesceInPlace = exports.coalesce = exports.topAsync = exports.top = exports.delta = exports.sortedDiff = exports.groupBy = exports.mergeSort = exports.findFirstInSorted = exports.binarySearch = exports.equals = exports.tail2 = exports.tail = void 0;

const errors_1 = require("./errors");
/**
 * Returns the last element of an array.
 * @param array The array.
 * @param n Which element from the end (default is zero).
 */


function tail(array, n = 0) {
  return array[array.length - (1 + n)];
}

exports.tail = _get__("tail");

function tail2(arr) {
  if (arr.length === 0) {
    throw new Error('Invalid tail call');
  }

  return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
}

exports.tail2 = _get__("tail2");

function equals(one, other, itemEquals = (a, b) => a === b) {
  if (one === other) {
    return true;
  }

  if (!one || !other) {
    return false;
  }

  if (one.length !== other.length) {
    return false;
  }

  for (let i = 0, len = one.length; i < len; i++) {
    if (!itemEquals(one[i], other[i])) {
      return false;
    }
  }

  return true;
}

exports.equals = _get__("equals");

function binarySearch(array, key, comparator) {
  let low = 0,
      high = array.length - 1;

  while (low <= high) {
    const mid = (low + high) / 2 | 0;
    const comp = comparator(array[mid], key);

    if (comp < 0) {
      low = mid + 1;
    } else if (comp > 0) {
      high = mid - 1;
    } else {
      return mid;
    }
  }

  return -(low + 1);
}

exports.binarySearch = _get__("binarySearch");
/**
 * Takes a sorted array and a function p. The array is sorted in such a way that all elements where p(x) is false
 * are located before all elements where p(x) is true.
 * @returns the least x for which p(x) is true or array.length if no element fullfills the given function.
 */

function findFirstInSorted(array, p) {
  let low = 0,
      high = array.length;

  if (high === 0) {
    return 0; // no children
  }

  while (low < high) {
    const mid = Math.floor((low + high) / 2);

    if (p(array[mid])) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low;
}

exports.findFirstInSorted = _get__("findFirstInSorted");
/**
 * Like `Array#sort` but always stable. Usually runs a little slower `than Array#sort`
 * so only use this when actually needing stable sort.
 */

function mergeSort(data, compare) {
  _get__("_sort")(data, compare, 0, data.length - 1, []);

  return data;
}

exports.mergeSort = _get__("mergeSort");

function _merge(a, compare, lo, mid, hi, aux) {
  let leftIdx = lo,
      rightIdx = mid + 1;

  for (let i = lo; i <= hi; i++) {
    aux[i] = a[i];
  }

  for (let i = lo; i <= hi; i++) {
    if (leftIdx > mid) {
      // left side consumed
      a[i] = aux[rightIdx++];
    } else if (rightIdx > hi) {
      // right side consumed
      a[i] = aux[leftIdx++];
    } else if (compare(aux[rightIdx], aux[leftIdx]) < 0) {
      // right element is less -> comes first
      a[i] = aux[rightIdx++];
    } else {
      // left element comes first (less or equal)
      a[i] = aux[leftIdx++];
    }
  }
}

function _sort(a, compare, lo, hi, aux) {
  if (hi <= lo) {
    return;
  }

  const mid = lo + (hi - lo) / 2 | 0;

  _get__("_sort")(a, compare, lo, mid, aux);

  _get__("_sort")(a, compare, mid + 1, hi, aux);

  if (compare(a[mid], a[mid + 1]) <= 0) {
    // left and right are sorted and if the last-left element is less
    // or equals than the first-right element there is nothing else
    // to do
    return;
  }

  _get__("_merge")(a, compare, lo, mid, hi, aux);
}

function groupBy(data, compare) {
  const result = [];
  let currentGroup = undefined;

  for (const element of _get__("mergeSort")(data.slice(0), compare)) {
    if (!currentGroup || compare(currentGroup[0], element) !== 0) {
      currentGroup = [element];
      result.push(currentGroup);
    } else {
      currentGroup.push(element);
    }
  }

  return result;
}

exports.groupBy = _get__("groupBy");
/**
 * Diffs two *sorted* arrays and computes the splices which apply the diff.
 */

function sortedDiff(before, after, compare) {
  const result = [];

  function pushSplice(start, deleteCount, toInsert) {
    if (deleteCount === 0 && toInsert.length === 0) {
      return;
    }

    const latest = result[result.length - 1];

    if (latest && latest.start + latest.deleteCount === start) {
      latest.deleteCount += deleteCount;
      latest.toInsert.push(...toInsert);
    } else {
      result.push({
        start,
        deleteCount,
        toInsert
      });
    }
  }

  let beforeIdx = 0;
  let afterIdx = 0;

  while (true) {
    if (beforeIdx === before.length) {
      pushSplice(beforeIdx, 0, after.slice(afterIdx));
      break;
    }

    if (afterIdx === after.length) {
      pushSplice(beforeIdx, before.length - beforeIdx, []);
      break;
    }

    const beforeElement = before[beforeIdx];
    const afterElement = after[afterIdx];
    const n = compare(beforeElement, afterElement);

    if (n === 0) {
      // equal
      beforeIdx += 1;
      afterIdx += 1;
    } else if (n < 0) {
      // beforeElement is smaller -> before element removed
      pushSplice(beforeIdx, 1, []);
      beforeIdx += 1;
    } else if (n > 0) {
      // beforeElement is greater -> after element added
      pushSplice(beforeIdx, 0, [afterElement]);
      afterIdx += 1;
    }
  }

  return result;
}

exports.sortedDiff = _get__("sortedDiff");
/**
 * Takes two *sorted* arrays and computes their delta (removed, added elements).
 * Finishes in `Math.min(before.length, after.length)` steps.
 */

function delta(before, after, compare) {
  const splices = _get__("sortedDiff")(before, after, compare);

  const removed = [];
  const added = [];

  for (const splice of splices) {
    removed.push(...before.slice(splice.start, splice.start + splice.deleteCount));
    added.push(...splice.toInsert);
  }

  return {
    removed,
    added
  };
}

exports.delta = _get__("delta");
/**
 * Returns the top N elements from the array.
 *
 * Faster than sorting the entire array when the array is a lot larger than N.
 *
 * @param array The unsorted array.
 * @param compare A sort function for the elements.
 * @param n The number of elements to return.
 * @return The first n elemnts from array when sorted with compare.
 */

function top(array, compare, n) {
  if (n === 0) {
    return [];
  }

  const result = array.slice(0, n).sort(compare);

  _get__("topStep")(array, compare, result, n, array.length);

  return result;
}

exports.top = _get__("top");
/**
 * Asynchronous variant of `top()` allowing for splitting up work in batches between which the event loop can run.
 *
 * Returns the top N elements from the array.
 *
 * Faster than sorting the entire array when the array is a lot larger than N.
 *
 * @param array The unsorted array.
 * @param compare A sort function for the elements.
 * @param n The number of elements to return.
 * @param batch The number of elements to examine before yielding to the event loop.
 * @return The first n elemnts from array when sorted with compare.
 */

function topAsync(array, compare, n, batch, token) {
  if (n === 0) {
    return Promise.resolve([]);
  }

  return new Promise((resolve, reject) => {
    (async () => {
      const o = array.length;
      const result = array.slice(0, n).sort(compare);

      for (let i = n, m = Math.min(n + batch, o); i < o; i = m, m = Math.min(m + batch, o)) {
        if (i > n) {
          await new Promise(resolve => setTimeout(resolve)); // nextTick() would starve I/O.
        }

        if (token && token.isCancellationRequested) {
          throw (0, _get__("errors_1").canceled)();
        }

        _get__("topStep")(array, compare, result, i, m);
      }

      return result;
    })().then(resolve, reject);
  });
}

exports.topAsync = _get__("topAsync");

function topStep(array, compare, result, i, m) {
  for (const n = result.length; i < m; i++) {
    const element = array[i];

    if (compare(element, result[n - 1]) < 0) {
      result.pop();

      const j = _get__("findFirstInSorted")(result, e => compare(element, e) < 0);

      result.splice(j, 0, element);
    }
  }
}
/**
 * @returns New array with all falsy values removed. The original array IS NOT modified.
 */


function coalesce(array) {
  return array.filter(e => !!e);
}

exports.coalesce = _get__("coalesce");
/**
 * Remove all falsey values from `array`. The original array IS modified.
 */

function coalesceInPlace(array) {
  let to = 0;

  for (let i = 0; i < array.length; i++) {
    if (!!array[i]) {
      array[to] = array[i];
      to += 1;
    }
  }

  array.length = to;
}

exports.coalesceInPlace = _get__("coalesceInPlace");
/**
 * Moves the element in the array for the provided positions.
 */

function move(array, from, to) {
  array.splice(to, 0, array.splice(from, 1)[0]);
}

exports.move = _get__("move");
/**
 * @returns false if the provided object is an array and not empty.
 */

function isFalsyOrEmpty(obj) {
  return !Array.isArray(obj) || obj.length === 0;
}

exports.isFalsyOrEmpty = _get__("isFalsyOrEmpty");

function isNonEmptyArray(obj) {
  return Array.isArray(obj) && obj.length > 0;
}

exports.isNonEmptyArray = _get__("isNonEmptyArray");
/**
 * Removes duplicates from the given array. The optional keyFn allows to specify
 * how elements are checked for equalness by returning a unique string for each.
 */

function distinct(array, keyFn) {
  if (!keyFn) {
    return array.filter((element, position) => {
      return array.indexOf(element) === position;
    });
  }

  const seen = Object.create(null);
  return array.filter(elem => {
    const key = keyFn(elem);

    if (seen[key]) {
      return false;
    }

    seen[key] = true;
    return true;
  });
}

exports.distinct = _get__("distinct");

function distinctES6(array) {
  const seen = new Set();
  return array.filter(element => {
    if (seen.has(element)) {
      return false;
    }

    seen.add(element);
    return true;
  });
}

exports.distinctES6 = _get__("distinctES6");

function uniqueFilter(keyFn) {
  const seen = Object.create(null);
  return element => {
    const key = keyFn(element);

    if (seen[key]) {
      return false;
    }

    seen[key] = true;
    return true;
  };
}

exports.uniqueFilter = _get__("uniqueFilter");

function lastIndex(array, fn) {
  for (let i = array.length - 1; i >= 0; i--) {
    const element = array[i];

    if (fn(element)) {
      return i;
    }
  }

  return -1;
}

exports.lastIndex = _get__("lastIndex");
/**
 * @deprecated ES6: use `Array.findIndex`
 */

function firstIndex(array, fn) {
  for (let i = 0; i < array.length; i++) {
    const element = array[i];

    if (fn(element)) {
      return i;
    }
  }

  return -1;
}

exports.firstIndex = _get__("firstIndex");

function first(array, fn, notFoundValue = undefined) {
  const index = _get__("firstIndex")(array, fn);

  return index < 0 ? notFoundValue : array[index];
}

exports.first = _get__("first");

function firstOrDefault(array, notFoundValue) {
  return array.length > 0 ? array[0] : notFoundValue;
}

exports.firstOrDefault = _get__("firstOrDefault");

function commonPrefixLength(one, other, equals = (a, b) => a === b) {
  let result = 0;

  for (let i = 0, len = Math.min(one.length, other.length); i < len && equals(one[i], other[i]); i++) {
    result++;
  }

  return result;
}

exports.commonPrefixLength = _get__("commonPrefixLength");

function flatten(arr) {
  return [].concat(...arr);
}

exports.flatten = _get__("flatten");

function range(arg, to) {
  let from = typeof to === 'number' ? arg : 0;

  if (typeof to === 'number') {
    from = arg;
  } else {
    from = 0;
    to = arg;
  }

  const result = [];

  if (from <= to) {
    for (let i = from; i < to; i++) {
      result.push(i);
    }
  } else {
    for (let i = from; i > to; i--) {
      result.push(i);
    }
  }

  return result;
}

exports.range = _get__("range");

function index(array, indexer, mapper) {
  return array.reduce((r, t) => {
    r[indexer(t)] = mapper ? mapper(t) : t;
    return r;
  }, Object.create(null));
}

exports.index = _get__("index");
/**
 * Inserts an element into an array. Returns a function which, when
 * called, will remove that element from the array.
 */

function insert(array, element) {
  array.push(element);
  return () => _get__("remove")(array, element);
}

exports.insert = _get__("insert");
/**
 * Removes an element from an array if it can be found.
 */

function remove(array, element) {
  const index = array.indexOf(element);

  if (index > -1) {
    array.splice(index, 1);
    return element;
  }

  return undefined;
}

exports.remove = _get__("remove");
/**
 * Insert `insertArr` inside `target` at `insertIndex`.
 * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
 */

function arrayInsert(target, insertIndex, insertArr) {
  const before = target.slice(0, insertIndex);
  const after = target.slice(insertIndex);
  return before.concat(insertArr, after);
}

exports.arrayInsert = _get__("arrayInsert");
/**
 * Uses Fisher-Yates shuffle to shuffle the given array
 */

function shuffle(array, _seed) {
  let rand;

  if (typeof _seed === 'number') {
    let seed = _seed; // Seeded random number generator in JS. Modified from:
    // https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript

    rand = () => {
      const x = Math.sin(seed++) * 179426549; // throw away most significant digits and reduce any potential bias

      return x - Math.floor(x);
    };
  } else {
    rand = Math.random;
  }

  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

exports.shuffle = _get__("shuffle");
/**
 * Pushes an element to the start of the array, if found.
 */

function pushToStart(arr, value) {
  const index = arr.indexOf(value);

  if (index > -1) {
    arr.splice(index, 1);
    arr.unshift(value);
  }
}

exports.pushToStart = _get__("pushToStart");
/**
 * Pushes an element to the end of the array, if found.
 */

function pushToEnd(arr, value) {
  const index = arr.indexOf(value);

  if (index > -1) {
    arr.splice(index, 1);
    arr.push(value);
  }
}

exports.pushToEnd = _get__("pushToEnd");
/**
 * @deprecated ES6: use `Array.find`
 */

function find(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    if (predicate(element, i, arr)) {
      return element;
    }
  }

  return undefined;
}

exports.find = _get__("find");

function mapArrayOrNot(items, fn) {
  return Array.isArray(items) ? items.map(fn) : fn(items);
}

exports.mapArrayOrNot = _get__("mapArrayOrNot");

function asArray(x) {
  return Array.isArray(x) ? x : [x];
}

exports.asArray = _get__("asArray");
/**
 * @deprecated Use `Array.from` or `[...iter]`
 */

function toArray(iterable) {
  const result = [];

  for (let element of iterable) {
    result.push(element);
  }

  return result;
}

exports.toArray = _get__("toArray");

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

exports.getRandomElement = _get__("getRandomElement");

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
    case "tail":
      return tail;

    case "tail2":
      return tail2;

    case "equals":
      return equals;

    case "binarySearch":
      return binarySearch;

    case "findFirstInSorted":
      return findFirstInSorted;

    case "_sort":
      return _sort;

    case "mergeSort":
      return mergeSort;

    case "_merge":
      return _merge;

    case "groupBy":
      return groupBy;

    case "sortedDiff":
      return sortedDiff;

    case "delta":
      return delta;

    case "topStep":
      return topStep;

    case "top":
      return top;

    case "errors_1":
      return errors_1;

    case "topAsync":
      return topAsync;

    case "coalesce":
      return coalesce;

    case "coalesceInPlace":
      return coalesceInPlace;

    case "move":
      return move;

    case "isFalsyOrEmpty":
      return isFalsyOrEmpty;

    case "isNonEmptyArray":
      return isNonEmptyArray;

    case "distinct":
      return distinct;

    case "distinctES6":
      return distinctES6;

    case "uniqueFilter":
      return uniqueFilter;

    case "lastIndex":
      return lastIndex;

    case "firstIndex":
      return firstIndex;

    case "first":
      return first;

    case "firstOrDefault":
      return firstOrDefault;

    case "commonPrefixLength":
      return commonPrefixLength;

    case "flatten":
      return flatten;

    case "range":
      return range;

    case "index":
      return index;

    case "remove":
      return remove;

    case "insert":
      return insert;

    case "arrayInsert":
      return arrayInsert;

    case "shuffle":
      return shuffle;

    case "pushToStart":
      return pushToStart;

    case "pushToEnd":
      return pushToEnd;

    case "find":
      return find;

    case "mapArrayOrNot":
      return mapArrayOrNot;

    case "asArray":
      return asArray;

    case "toArray":
      return toArray;

    case "getRandomElement":
      return getRandomElement;
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