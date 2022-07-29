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
exports.uriToFsPath = exports.URI = void 0;

const platform_1 = require("./platform");

const paths = _get__("__importStar")(require("./path"));

const _schemePattern = /^\w[\w\d+.-]*$/;
const _singleSlashStart = /^\//;
const _doubleSlashStart = /^\/\//;

function _validateUri(ret, _strict) {
  // scheme, must be set
  if (!ret.scheme && _strict) {
    throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`);
  } // scheme, https://tools.ietf.org/html/rfc3986#section-3.1
  // ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )


  if (ret.scheme && !_get__("_schemePattern").test(ret.scheme)) {
    throw new Error('[UriError]: Scheme contains illegal characters.');
  } // path, http://tools.ietf.org/html/rfc3986#section-3.3
  // If a URI contains an authority component, then the path component
  // must either be empty or begin with a slash ("/") character.  If a URI
  // does not contain an authority component, then the path cannot begin
  // with two slash characters ("//").


  if (ret.path) {
    if (ret.authority) {
      if (!_get__("_singleSlashStart").test(ret.path)) {
        throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
      }
    } else {
      if (_get__("_doubleSlashStart").test(ret.path)) {
        throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
      }
    }
  }
} // for a while we allowed uris *without* schemes and this is the migration
// for them, e.g. an uri without scheme and without strict-mode warns and falls
// back to the file-scheme. that should cause the least carnage and still be a
// clear warning


function _schemeFix(scheme, _strict) {
  if (!scheme && !_strict) {
    return 'file';
  }

  return scheme;
} // implements a bit of https://tools.ietf.org/html/rfc3986#section-5


function _referenceResolution(scheme, path) {
  // the slash-character is our 'default base' as we don't
  // support constructing URIs relative to other URIs. This
  // also means that we alter and potentially break paths.
  // see https://tools.ietf.org/html/rfc3986#section-5.1.4
  switch (scheme) {
    case 'https':
    case 'http':
    case 'file':
      if (!path) {
        path = _get__("_slash");
      } else if (path[0] !== _get__("_slash")) {
        path = _get__("_slash") + path;
      }

      break;
  }

  return path;
}

const _empty = '';
const _slash = '/';
const _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
/**
 * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 * ```txt
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 * ```
 */

class URI {
  /**
   * @internal
   */
  constructor(schemeOrData, authority, path, query, fragment, _strict = false) {
    if (typeof schemeOrData === 'object') {
      this.scheme = schemeOrData.scheme || _get__("_empty");
      this.authority = schemeOrData.authority || _get__("_empty");
      this.path = schemeOrData.path || _get__("_empty");
      this.query = schemeOrData.query || _get__("_empty");
      this.fragment = schemeOrData.fragment || _get__("_empty"); // no validation because it's this URI
      // that creates uri components.
      // _validateUri(this);
    } else {
      this.scheme = _get__("_schemeFix")(schemeOrData, _strict);
      this.authority = authority || _get__("_empty");
      this.path = _get__("_referenceResolution")(this.scheme, path || _get__("_empty"));
      this.query = query || _get__("_empty");
      this.fragment = fragment || _get__("_empty");

      _get__("_validateUri")(this, _strict);
    }
  }

  static isUri(thing) {
    if (thing instanceof _get__("URI")) {
      return true;
    }

    if (!thing) {
      return false;
    }

    return typeof thing.authority === 'string' && typeof thing.fragment === 'string' && typeof thing.path === 'string' && typeof thing.query === 'string' && typeof thing.scheme === 'string' && typeof thing.fsPath === 'function' && typeof thing.with === 'function' && typeof thing.toString === 'function';
  } // ---- filesystem path -----------------------

  /**
   * Returns a string representing the corresponding file system path of this URI.
   * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
   * platform specific path separator.
   *
   * * Will *not* validate the path for invalid characters and semantics.
   * * Will *not* look at the scheme of this URI.
   * * The result shall *not* be used for display purposes but for accessing a file on disk.
   *
   *
   * The *difference* to `URI#path` is the use of the platform specific separator and the handling
   * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
   *
   * ```ts
      const u = URI.parse('file://server/c$/folder/file.txt')
      u.authority === 'server'
      u.path === '/shares/c$/file.txt'
      u.fsPath === '\\server\c$\folder\file.txt'
  ```
   *
   * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
   * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
   * with URIs that represent files on disk (`file` scheme).
   */


  get fsPath() {
    // if (this.scheme !== 'file') {
    // 	console.warn(`[UriError] calling fsPath with scheme ${this.scheme}`);
    // }
    return _get__("uriToFsPath")(this, false);
  } // ---- modify to new -------------------------


  with(change) {
    if (!change) {
      return this;
    }

    let {
      scheme,
      authority,
      path,
      query,
      fragment
    } = change;

    if (scheme === undefined) {
      scheme = this.scheme;
    } else if (scheme === null) {
      scheme = _get__("_empty");
    }

    if (authority === undefined) {
      authority = this.authority;
    } else if (authority === null) {
      authority = _get__("_empty");
    }

    if (path === undefined) {
      path = this.path;
    } else if (path === null) {
      path = _get__("_empty");
    }

    if (query === undefined) {
      query = this.query;
    } else if (query === null) {
      query = _get__("_empty");
    }

    if (fragment === undefined) {
      fragment = this.fragment;
    } else if (fragment === null) {
      fragment = _get__("_empty");
    }

    if (scheme === this.scheme && authority === this.authority && path === this.path && query === this.query && fragment === this.fragment) {
      return this;
    }

    return new (_get__("Uri"))(scheme, authority, path, query, fragment);
  } // ---- parse & validate ------------------------

  /**
   * Creates a new URI from a string, e.g. `http://www.msft.com/some/path`,
   * `file:///usr/home`, or `scheme:with/path`.
   *
   * @param value A string which represents an URI (see `URI#toString`).
   */


  static parse(value, _strict = false) {
    const match = _get__("_regexp").exec(value);

    if (!match) {
      return new (_get__("Uri"))(_get__("_empty"), _get__("_empty"), _get__("_empty"), _get__("_empty"), _get__("_empty"));
    }

    return new (_get__("Uri"))(match[2] || _get__("_empty"), _get__("percentDecode")(match[4] || _get__("_empty")), _get__("percentDecode")(match[5] || _get__("_empty")), _get__("percentDecode")(match[7] || _get__("_empty")), _get__("percentDecode")(match[9] || _get__("_empty")), _strict);
  }
  /**
   * Creates a new URI from a file system path, e.g. `c:\my\files`,
   * `/usr/home`, or `\\server\share\some\path`.
   *
   * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
   * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
   * `URI.parse('file://' + path)` because the path might contain characters that are
   * interpreted (# and ?). See the following sample:
   * ```ts
  const good = URI.file('/coding/c#/project1');
  good.scheme === 'file';
  good.path === '/coding/c#/project1';
  good.fragment === '';
  const bad = URI.parse('file://' + '/coding/c#/project1');
  bad.scheme === 'file';
  bad.path === '/coding/c'; // path is now broken
  bad.fragment === '/project1';
  ```
   *
   * @param path A file system path (see `URI#fsPath`)
   */


  static file(path) {
    let authority = _get__("_empty"); // normalize to fwd-slashes on windows,
    // on other systems bwd-slashes are valid
    // filename character, eg /f\oo/ba\r.txt


    if (_get__("platform_1").isWindows) {
      path = path.replace(/\\/g, _get__("_slash"));
    } // check for authority as used in UNC shares
    // or use the path as given


    if (path[0] === _get__("_slash") && path[1] === _get__("_slash")) {
      const idx = path.indexOf(_get__("_slash"), 2);

      if (idx === -1) {
        authority = path.substring(2);
        path = _get__("_slash");
      } else {
        authority = path.substring(2, idx);
        path = path.substring(idx) || _get__("_slash");
      }
    }

    return new (_get__("Uri"))('file', authority, path, _get__("_empty"), _get__("_empty"));
  }

  static from(components) {
    return new (_get__("Uri"))(components.scheme, components.authority, components.path, components.query, components.fragment);
  }
  /**
   * Join a URI path with path fragments and normalizes the resulting path.
   *
   * @param uri The input URI.
   * @param pathFragment The path fragment to add to the URI path.
   * @returns The resulting URI.
   */


  static joinPath(uri, ...pathFragment) {
    if (!uri.path) {
      throw new Error(`[UriError]: cannot call joinPaths on URI without path`);
    }

    let newPath;

    if (_get__("platform_1").isWindows && uri.scheme === 'file') {
      newPath = _get__("URI").file(_get__("paths").win32.join(_get__("uriToFsPath")(uri, true), ...pathFragment)).path;
    } else {
      newPath = _get__("paths").posix.join(uri.path, ...pathFragment);
    }

    return uri.with({
      path: newPath
    });
  } // ---- printing/externalize ---------------------------

  /**
   * Creates a string representation for this URI. It's guaranteed that calling
   * `URI.parse` with the result of this function creates an URI which is equal
   * to this URI.
   *
   * * The result shall *not* be used for display purposes but for externalization or transport.
   * * The result will be encoded using the percentage encoding and encoding happens mostly
   * ignore the scheme-specific encoding rules.
   *
   * @param skipEncoding Do not encode the result, default is `false`
   */


  toString(skipEncoding = false) {
    return _get__("_asFormatted")(this, skipEncoding);
  }

  toJSON() {
    return this;
  }

  static revive(data) {
    if (!data) {
      return data;
    } else if (data instanceof _get__("URI")) {
      return data;
    } else {
      const result = new (_get__("Uri"))(data);
      result._formatted = data.external;
      result._fsPath = data._sep === _get__("_pathSepMarker") ? data.fsPath : null;
      return result;
    }
  }

}

exports.URI = _get__("URI");

const _pathSepMarker = _get__("platform_1").isWindows ? 1 : undefined; // This class exists so that URI is compatibile with vscode.Uri (API).


class Uri extends _get__("URI") {
  constructor() {
    super(...arguments);
    this._formatted = null;
    this._fsPath = null;
  }

  get fsPath() {
    if (!this._fsPath) {
      this._fsPath = _get__("uriToFsPath")(this, false);
    }

    return this._fsPath;
  }

  toString(skipEncoding = false) {
    if (!skipEncoding) {
      if (!this._formatted) {
        this._formatted = _get__("_asFormatted")(this, false);
      }

      return this._formatted;
    } else {
      // we don't cache that
      return _get__("_asFormatted")(this, true);
    }
  }

  toJSON() {
    const res = {
      $mid: 1
    }; // cached state

    if (this._fsPath) {
      res.fsPath = this._fsPath;
      res._sep = _get__("_pathSepMarker");
    }

    if (this._formatted) {
      res.external = this._formatted;
    } // uri components


    if (this.path) {
      res.path = this.path;
    }

    if (this.scheme) {
      res.scheme = this.scheme;
    }

    if (this.authority) {
      res.authority = this.authority;
    }

    if (this.query) {
      res.query = this.query;
    }

    if (this.fragment) {
      res.fragment = this.fragment;
    }

    return res;
  }

} // reserved characters: https://tools.ietf.org/html/rfc3986#section-2.2


const encodeTable = {
  [58
  /* Colon */
  ]: '%3A',
  [47
  /* Slash */
  ]: '%2F',
  [63
  /* QuestionMark */
  ]: '%3F',
  [35
  /* Hash */
  ]: '%23',
  [91
  /* OpenSquareBracket */
  ]: '%5B',
  [93
  /* CloseSquareBracket */
  ]: '%5D',
  [64
  /* AtSign */
  ]: '%40',
  [33
  /* ExclamationMark */
  ]: '%21',
  [36
  /* DollarSign */
  ]: '%24',
  [38
  /* Ampersand */
  ]: '%26',
  [39
  /* SingleQuote */
  ]: '%27',
  [40
  /* OpenParen */
  ]: '%28',
  [41
  /* CloseParen */
  ]: '%29',
  [42
  /* Asterisk */
  ]: '%2A',
  [43
  /* Plus */
  ]: '%2B',
  [44
  /* Comma */
  ]: '%2C',
  [59
  /* Semicolon */
  ]: '%3B',
  [61
  /* Equals */
  ]: '%3D',
  [32
  /* Space */
  ]: '%20'
};

function encodeURIComponentFast(uriComponent, allowSlash) {
  let res = undefined;
  let nativeEncodePos = -1;

  for (let pos = 0; pos < uriComponent.length; pos++) {
    const code = uriComponent.charCodeAt(pos); // unreserved characters: https://tools.ietf.org/html/rfc3986#section-2.3

    if (code >= 97
    /* a */
    && code <= 122
    /* z */
    || code >= 65
    /* A */
    && code <= 90
    /* Z */
    || code >= 48
    /* Digit0 */
    && code <= 57
    /* Digit9 */
    || code === 45
    /* Dash */
    || code === 46
    /* Period */
    || code === 95
    /* Underline */
    || code === 126
    /* Tilde */
    || allowSlash && code === 47
    /* Slash */
    ) {
      // check if we are delaying native encode
      if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
        nativeEncodePos = -1;
      } // check if we write into a new string (by default we try to return the param)


      if (res !== undefined) {
        res += uriComponent.charAt(pos);
      }
    } else {
      // encoding needed, we need to allocate a new string
      if (res === undefined) {
        res = uriComponent.substr(0, pos);
      } // check with default table first


      const escaped = _get__("encodeTable")[code];

      if (escaped !== undefined) {
        // check if we are delaying native encode
        if (nativeEncodePos !== -1) {
          res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
          nativeEncodePos = -1;
        } // append escaped variant to result


        res += escaped;
      } else if (nativeEncodePos === -1) {
        // use native encode only when needed
        nativeEncodePos = pos;
      }
    }
  }

  if (nativeEncodePos !== -1) {
    res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
  }

  return res !== undefined ? res : uriComponent;
}

function encodeURIComponentMinimal(path) {
  let res = undefined;

  for (let pos = 0; pos < path.length; pos++) {
    const code = path.charCodeAt(pos);

    if (code === 35
    /* Hash */
    || code === 63
    /* QuestionMark */
    ) {
      if (res === undefined) {
        res = path.substr(0, pos);
      }

      res += _get__("encodeTable")[code];
    } else {
      if (res !== undefined) {
        res += path[pos];
      }
    }
  }

  return res !== undefined ? res : path;
}
/**
 * Compute `fsPath` for the given uri
 */


function uriToFsPath(uri, keepDriveLetterCasing) {
  let value;

  if (uri.authority && uri.path.length > 1 && uri.scheme === 'file') {
    // unc path: file://shares/c$/far/boo
    value = `//${uri.authority}${uri.path}`;
  } else if (uri.path.charCodeAt(0) === 47
  /* Slash */
  && (uri.path.charCodeAt(1) >= 65
  /* A */
  && uri.path.charCodeAt(1) <= 90
  /* Z */
  || uri.path.charCodeAt(1) >= 97
  /* a */
  && uri.path.charCodeAt(1) <= 122
  /* z */
  ) && uri.path.charCodeAt(2) === 58
  /* Colon */
  ) {
    if (!keepDriveLetterCasing) {
      // windows drive letter: file:///c:/far/boo
      value = uri.path[1].toLowerCase() + uri.path.substr(2);
    } else {
      value = uri.path.substr(1);
    }
  } else {
    // other path
    value = uri.path;
  }

  if (_get__("platform_1").isWindows) {
    value = value.replace(/\//g, '\\');
  }

  return value;
}

exports.uriToFsPath = _get__("uriToFsPath");
/**
 * Create the external version of a uri
 */

function _asFormatted(uri, skipEncoding) {
  const encoder = !skipEncoding ? _get__("encodeURIComponentFast") : _get__("encodeURIComponentMinimal");
  let res = '';
  let {
    scheme,
    authority,
    path,
    query,
    fragment
  } = uri;

  if (scheme) {
    res += scheme;
    res += ':';
  }

  if (authority || scheme === 'file') {
    res += _get__("_slash");
    res += _get__("_slash");
  }

  if (authority) {
    let idx = authority.indexOf('@');

    if (idx !== -1) {
      // <user>@<auth>
      const userinfo = authority.substr(0, idx);
      authority = authority.substr(idx + 1);
      idx = userinfo.indexOf(':');

      if (idx === -1) {
        res += encoder(userinfo, false);
      } else {
        // <user>:<pass>@<auth>
        res += encoder(userinfo.substr(0, idx), false);
        res += ':';
        res += encoder(userinfo.substr(idx + 1), false);
      }

      res += '@';
    }

    authority = authority.toLowerCase();
    idx = authority.indexOf(':');

    if (idx === -1) {
      res += encoder(authority, false);
    } else {
      // <auth>:<port>
      res += encoder(authority.substr(0, idx), false);
      res += authority.substr(idx);
    }
  }

  if (path) {
    // lower-case windows drive letters in /C:/fff or C:/fff
    if (path.length >= 3 && path.charCodeAt(0) === 47
    /* Slash */
    && path.charCodeAt(2) === 58
    /* Colon */
    ) {
      const code = path.charCodeAt(1);

      if (code >= 65
      /* A */
      && code <= 90
      /* Z */
      ) {
        path = `/${String.fromCharCode(code + 32)}:${path.substr(3)}`; // "/c:".length === 3
      }
    } else if (path.length >= 2 && path.charCodeAt(1) === 58
    /* Colon */
    ) {
      const code = path.charCodeAt(0);

      if (code >= 65
      /* A */
      && code <= 90
      /* Z */
      ) {
        path = `${String.fromCharCode(code + 32)}:${path.substr(2)}`; // "/c:".length === 3
      }
    } // encode the rest of the path


    res += encoder(path, true);
  }

  if (query) {
    res += '?';
    res += encoder(query, false);
  }

  if (fragment) {
    res += '#';
    res += !skipEncoding ? _get__("encodeURIComponentFast")(fragment, false) : fragment;
  }

  return res;
} // --- decode


function decodeURIComponentGraceful(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    if (str.length > 3) {
      return str.substr(0, 3) + _get__("decodeURIComponentGraceful")(str.substr(3));
    } else {
      return str;
    }
  }
}

const _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;

function percentDecode(str) {
  if (!str.match(_get__("_rEncodedAsHex"))) {
    return str;
  }

  return str.replace(_get__("_rEncodedAsHex"), match => _get__("decodeURIComponentGraceful")(match));
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

    case "_schemePattern":
      return _schemePattern;

    case "_singleSlashStart":
      return _singleSlashStart;

    case "_doubleSlashStart":
      return _doubleSlashStart;

    case "_slash":
      return _slash;

    case "_empty":
      return _empty;

    case "_schemeFix":
      return _schemeFix;

    case "_referenceResolution":
      return _referenceResolution;

    case "_validateUri":
      return _validateUri;

    case "URI":
      return URI;

    case "uriToFsPath":
      return uriToFsPath;

    case "Uri":
      return Uri;

    case "_regexp":
      return _regexp;

    case "percentDecode":
      return percentDecode;

    case "platform_1":
      return platform_1;

    case "paths":
      return paths;

    case "_asFormatted":
      return _asFormatted;

    case "_pathSepMarker":
      return _pathSepMarker;

    case "encodeTable":
      return encodeTable;

    case "encodeURIComponentFast":
      return encodeURIComponentFast;

    case "encodeURIComponentMinimal":
      return encodeURIComponentMinimal;

    case "decodeURIComponentGraceful":
      return decodeURIComponentGraceful;

    case "_rEncodedAsHex":
      return _rEncodedAsHex;
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