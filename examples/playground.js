(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],5:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],6:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":5,"_process":3,"inherits":4}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../templates/utils");
const json_pointer_1 = require("@mojule/json-pointer");
exports.getData = (form) => {
    const entries = utils_1.getEntries(form, false);
    const pointers = utils_1.entriesToPointers(entries);
    const map = {};
    pointers.forEach(([pointer, value]) => {
        map[pointer] = value;
    });
    return json_pointer_1.expand(map);
};

},{"../templates/utils":36,"@mojule/json-pointer":39}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ajv = require("ajv");
const schemas = require("../schema");
const data = require("../schema/data");
const get_data_1 = require("./get-data");
const __1 = require("..");
const templates_1 = require("../templates");
const valid = '✔️';
const invalid = '❌';
const unknown = '❓';
const ajv = new Ajv({
    schemaId: 'id',
    allErrors: true,
    jsonPointers: true
});
ajv.addMetaSchema(schemas.meta);
ajv.addFormat('multiline', () => true);
ajv.addFormat('password', () => true);
ajv.addFormat('tel', () => true);
ajv.addFormat('range', () => true);
ajv.addFormat('hidden', () => true);
ajv.addFormat('color', /^\#[a-f0-9]{6}$/);
ajv.addFormat('month', /^\d{4}-\d{1,2}$/);
ajv.addFormat('week', /^\d{4}-W\d{1,2}$/);
document.addEventListener('DOMContentLoaded', () => {
    const schemaToDom = __1.SchemaToFormElements(templates_1.ClientFormTemplates(document));
    const { form, submit, select, schema, schemaSubmit, resultJson, resultFormData, resultSubmit, schemaSection, formSection, resultSection, schemaValid, formValid, resultValid, formErrors, schemaErrors, resultErrors, showJson, showFormData } = init();
    submit.onclick = e => {
        e.preventDefault();
        onFormSubmit();
    };
    schemaSubmit.onclick = e => {
        e.preventDefault();
        onSchemaSubmit();
    };
    resultSubmit.onclick = e => {
        e.preventDefault();
        onResultSubmit();
    };
    const onFormSubmit = () => {
        if (!isSchemaValid())
            return;
        if (!isFormValid())
            return;
        resultSection.classList.remove('invalid');
        const value = get_data_1.getData(form);
        resultJson.value = JSON.stringify(value, null, 2);
        const formData = new FormData(form);
        resultFormData.innerHTML = '';
        Array.from(formData.entries()).forEach(([key, value]) => {
            const tr = document.createElement('tr');
            const th = document.createElement('th');
            const td = document.createElement('td');
            th.innerText = key;
            td.innerHTML = String(value).split('\n').join('<br>');
            tr.appendChild(th);
            tr.appendChild(td);
            resultFormData.appendChild(tr);
        });
        const isValid = isResultValid();
        resultValid.innerText = isValid ? valid : invalid;
        if (!isValid) {
            resultSection.classList.add('invalid');
            let errors = ajv.errorsText(ajv.errors);
            if (errors === 'No errors') {
                errors = 'Invalid JSON';
            }
            else {
                errors = errors.split(', ').join('\n');
            }
            resultErrors.innerText = errors;
        }
    };
    const onSelect = () => {
        const key = select.selectedOptions[0].value;
        let currentSchema = schemas[key];
        if (key in data) {
            currentSchema = JSON.parse(JSON.stringify(currentSchema));
            currentSchema.default = data[key];
        }
        schema.value = JSON.stringify(currentSchema, null, 2);
        form.innerHTML = '';
        resultJson.value = '';
        resultFormData.innerHTML = '';
        onSchemaChange();
    };
    const onSchemaChange = () => {
        const isValid = isSchemaValid();
        schemaValid.innerText = isValid ? valid : invalid;
        formSection.classList.remove('invalid');
        resultSection.classList.remove('invalid');
        if (!isValid) {
            schemaSection.classList.add('invalid');
            let errors = ajv.errorsText(ajv.errors);
            if (errors === 'No errors') {
                errors = 'Invalid JSON';
            }
            else {
                errors = errors.split(', ').join('\n');
            }
            schemaErrors.innerText = errors;
            form.innerHTML = '';
            resultJson.value = '';
            resultFormData.innerHTML = '';
            formValid.innerText = unknown;
            resultValid.innerText = unknown;
            return;
        }
        schemaSection.classList.remove('invalid');
        onSchemaSubmit();
    };
    const onSchemaSubmit = () => {
        const currentSchema = JSON.parse(schema.value);
        const schemaDom = schemaToDom(currentSchema);
        form.innerHTML = '';
        resultJson.value = '';
        resultFormData.innerHTML = '';
        form.appendChild(schemaDom);
        onFormChange();
    };
    const onFormChange = () => {
        console.log('form change');
        const isValid = isFormValid();
        formValid.innerText = isValid ? valid : invalid;
        if (!isValid) {
            formSection.classList.add('invalid');
            let errors = '';
            const invalidItems = Array.from(form.querySelectorAll(':invalid'));
            invalidItems.forEach(item => {
                if (item.localName === 'fieldset')
                    return;
                errors += `${item.title || item.name || item.localName}: ${item.validationMessage}\n`;
            });
            formErrors.innerText = errors;
            const currentFocus = document.activeElement;
            form.reportValidity();
            if (currentFocus !== null)
                currentFocus.focus();
            resultValid.innerText = unknown;
            resultJson.value = '';
            resultFormData.innerHTML = '';
            return;
        }
        formSection.classList.remove('invalid');
        onFormSubmit();
    };
    const onResultChange = () => {
        const isValid = isResultValid();
        resultValid.innerText = isValid ? valid : invalid;
        if (!isValid) {
            resultSection.classList.add('invalid');
            let errors = ajv.errorsText(ajv.errors);
            if (errors === 'No errors') {
                errors = 'Invalid JSON';
            }
            else {
                errors = errors.split(', ').join('\n');
            }
            resultErrors.innerText = errors;
        }
    };
    const onResultSubmit = () => {
        if (!isSchemaValid())
            return;
        if (!isFormValid())
            return;
        if (!isResultValid())
            return;
        const resultValue = JSON.parse(resultJson.value);
        let currentSchema = JSON.parse(schema.value);
        currentSchema.default = resultValue;
        schema.value = JSON.stringify(currentSchema, null, 2);
        onSchemaSubmit();
    };
    schema.oninput = onSchemaChange;
    form.oninput = onFormChange;
    resultJson.oninput = onResultChange;
    select.onchange = onSelect;
    showJson.onclick = e => {
        e.preventDefault();
        showJson.classList.add('selected');
        showFormData.classList.remove('selected');
        resultSection.classList.remove('form-data');
        resultSection.classList.add('json');
    };
    showFormData.onclick = e => {
        e.preventDefault();
        showJson.classList.remove('selected');
        showFormData.classList.add('selected');
        resultSection.classList.add('form-data');
        resultSection.classList.remove('json');
    };
    onSelect();
});
const isSchemaValid = () => {
    const schema = getCurrentSchema();
    if (!schema)
        return false;
    return ajv.validate('http://json-schema.org/draft-04/schema#', schema);
};
const isFormValid = () => {
    const form = getForm();
    if (!form)
        return false;
    return form.checkValidity();
};
const isResultValid = () => {
    const result = getResult();
    if (result === undefined)
        return false;
    if (!isSchemaValid())
        return false;
    const currentSchema = getCurrentSchema();
    if (!currentSchema)
        return false;
    return ajv.validate(currentSchema, result);
};
const getCurrentSchema = () => {
    try {
        const schema = document.querySelector('.schema textarea');
        return JSON.parse(schema.value);
    }
    catch (_a) {
        return;
    }
};
const getForm = () => {
    const form = document.querySelector('.form form');
    if (form)
        return form;
};
const getResult = () => {
    try {
        const result = document.querySelector('.result textarea');
        return JSON.parse(result.value);
    }
    catch (_a) {
        return;
    }
};
const init = () => {
    const form = createForm();
    const submit = createFormButton();
    const select = createSelect();
    const schema = document.querySelector('.schema textarea');
    const schemaSubmit = createSchemaButton();
    const resultJson = document.querySelector('.result textarea.json');
    const resultFormData = document.querySelector('.result table.form-data');
    const resultSubmit = createResultButton();
    const formSection = document.querySelector('.form');
    const schemaSection = document.querySelector('.schema');
    const resultSection = document.querySelector('.result');
    const schemaValid = document.querySelector('.schema-valid');
    const formValid = document.querySelector('.form-valid');
    const resultValid = document.querySelector('.result-valid');
    const formErrors = document.querySelector('.form pre');
    const schemaErrors = document.querySelector('.schema pre');
    const resultErrors = document.querySelector('.result pre');
    const showJson = document.querySelector('.result a[href="#json"]');
    const showFormData = document.querySelector('.result a[href="#form-data"]');
    return {
        form, submit, select, schema, schemaSubmit, resultJson, resultFormData,
        resultSubmit, formSection, schemaSection, resultSection, schemaValid,
        formValid, resultValid, formErrors, schemaErrors, resultErrors, showJson,
        showFormData
    };
};
const createForm = () => {
    const form = document.querySelector('.form form');
    return form;
};
const createFormButton = () => {
    const formButtonContainer = document.querySelector('.form-button');
    const submit = document.createElement('input');
    submit.type = 'submit';
    submit.value = 'Update Results';
    formButtonContainer.appendChild(submit);
    return submit;
};
const createSchemaButton = () => {
    const schemaButtonContainer = document.querySelector('.schema-button');
    const schemaSubmit = document.createElement('input');
    schemaSubmit.type = 'submit';
    schemaSubmit.value = 'Update Form';
    schemaButtonContainer.appendChild(schemaSubmit);
    return schemaSubmit;
};
const createResultButton = () => {
    const resultButtonContainer = document.querySelector('.result-button');
    const resultSubmit = document.createElement('input');
    resultSubmit.type = 'submit';
    resultSubmit.value = 'Update Schema Defaults';
    resultButtonContainer.appendChild(resultSubmit);
    return resultSubmit;
};
const createSelect = () => {
    const select = document.querySelector('header select');
    const keys = Object.keys(schemas);
    keys.forEach((key, i) => {
        const schema = schemas[key];
        const option = document.createElement('option');
        option.value = key;
        option.innerText = schema.title;
        option.selected = i === 0;
        select.appendChild(option);
    });
    return select;
};

},{"..":9,"../schema":13,"../schema/data":11,"../templates":26,"./get-data":7,"ajv":40}],9:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./templates/api/array-list"));
__export(require("./templates/decorators/fieldset"));
__export(require("./templates/decorators/format"));
__export(require("./templates/decorators/label"));
__export(require("./templates/decorators/mutable-array-list"));
__export(require("./templates/types/array"));
__export(require("./templates/types/boolean"));
__export(require("./templates/types/number"));
__export(require("./templates/types/object"));
__export(require("./templates/types/string"));
__export(require("./templates/types/array/array-item"));
__export(require("./templates/types/array/array-list"));
__export(require("./templates/types/array/tuple"));
__export(require("./templates/types"));
__export(require("./templates/utils"));
__export(require("./templates"));
exports.SchemaToFormElements = (templates) => {
    const schemaToFormElements = (schema, name = '', value) => {
        if (typeof schema.type !== 'string')
            throw Error('Expected type to be a string');
        if (!schemaTypeNames.includes(schema.type))
            throw Error(`Expected type to be one of ${schemaTypeNames}`);
        const template = templates[schema.type];
        if (!template)
            throw Error(`No template found for ${schema.type}`);
        return template(schema, name, value);
    };
    return schemaToFormElements;
};
const schemaTypeNames = [
    'array', 'boolean', 'number', 'integer', 'object', 'string'
];

},{"./templates":26,"./templates/api/array-list":19,"./templates/decorators/fieldset":21,"./templates/decorators/format":22,"./templates/decorators/label":23,"./templates/decorators/mutable-array-list":24,"./templates/types":32,"./templates/types/array":29,"./templates/types/array/array-item":27,"./templates/types/array/array-list":28,"./templates/types/array/tuple":30,"./templates/types/boolean":31,"./templates/types/number":33,"./templates/types/object":34,"./templates/types/string":35,"./templates/utils":36}],10:[function(require,module,exports){
module.exports={
    "type": "object",
    "title": "Contact Form",
    "description": "A simple Contact Form",
    "properties": {
        "name": {
            "type": "string",
            "title": "Name"
        },
        "email": {
            "type": "string",
            "title": "Email",
            "format": "email"
        },
        "subject": {
            "type": "string",
            "title": "Subject",
            "default": "I have a query"
        },
        "message": {
            "type": "string",
            "title": "Message",
            "format": "multiline"
        }
    },
    "required": [
        "name",
        "email",
        "message"
    ]
}

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nestedArrayData = require("./nested-array.json");
exports.nestedArray = nestedArrayData;

},{"./nested-array.json":12}],12:[function(require,module,exports){
module.exports=[[4, 3], [2, 1]]

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contactFormSchema = require("./contact-form.schema.json");
const stringsSchema = require("./strings.schema.json");
const nestedArraySchema = require("./nested-array.schema.json");
const simpleArraySchema = require("./simple-array.schema.json");
const tupleArraySchema = require("./tuple-array.schema.json");
const metaSchema = require("./meta.schema.json");
exports.contactForm = contactFormSchema;
exports.stringsForm = stringsSchema;
exports.tupleArray = tupleArraySchema;
exports.simpleArray = simpleArraySchema;
exports.nestedArray = nestedArraySchema;
exports.meta = metaSchema;

},{"./contact-form.schema.json":10,"./meta.schema.json":14,"./nested-array.schema.json":15,"./simple-array.schema.json":16,"./strings.schema.json":17,"./tuple-array.schema.json":18}],14:[function(require,module,exports){
module.exports={
    "id": "http://json-schema.org/draft-04/schema#",
    "$schema": "http://json-schema.org/draft-04/schema#",
    "title": "JSON Schema 4 Meta-schema",
    "description": "Core schema meta-schema",
    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#" }
        },
        "positiveInteger": {
            "type": "integer",
            "minimum": 0
        },
        "positiveIntegerDefault0": {
            "allOf": [{ "$ref": "#/definitions/positiveInteger" }, { "default": 0 }]
        },
        "simpleTypes": {
            "enum": ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        "stringArray": {
            "type": "array",
            "items": { "type": "string" },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "type": "object",
    "properties": {
        "id": {
            "type": "string"
        },
        "$schema": {
            "type": "string"
        },
        "title": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "default": {},
        "multipleOf": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
        },
        "maximum": {
            "type": "number"
        },
        "exclusiveMaximum": {
            "type": "boolean",
            "default": false
        },
        "minimum": {
            "type": "number"
        },
        "exclusiveMinimum": {
            "type": "boolean",
            "default": false
        },
        "maxLength": { "$ref": "#/definitions/positiveInteger" },
        "minLength": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "additionalItems": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "items": {
            "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
            ],
            "default": {}
        },
        "maxItems": { "$ref": "#/definitions/positiveInteger" },
        "minItems": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "maxProperties": { "$ref": "#/definitions/positiveInteger" },
        "minProperties": { "$ref": "#/definitions/positiveIntegerDefault0" },
        "required": { "$ref": "#/definitions/stringArray" },
        "additionalProperties": {
            "anyOf": [
                { "type": "boolean" },
                { "$ref": "#" }
            ],
            "default": {}
        },
        "definitions": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "properties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "patternProperties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "dependencies": {
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    { "$ref": "#" },
                    { "$ref": "#/definitions/stringArray" }
                ]
            }
        },
        "enum": {
            "type": "array",
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {
            "anyOf": [
                { "$ref": "#/definitions/simpleTypes" },
                {
                    "type": "array",
                    "items": { "$ref": "#/definitions/simpleTypes" },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "format": { "type": "string" },
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" }
    },
    "dependencies": {
        "exclusiveMaximum": ["maximum"],
        "exclusiveMinimum": ["minimum"]
    },
    "default": {}
}

},{}],15:[function(require,module,exports){
module.exports={
    "type": "array",
    "title": "Nested Array",
    "description": "A nested array",
    "items": {
        "type": "array",
        "title": "Values",
        "items": {
            "title": "Value",
            "type": "number"
        }
    },
    "default": [[1, 2], [3, 4]]
}

},{}],16:[function(require,module,exports){
module.exports={
    "type": "array",
    "title": "Simple Array",
    "description": "A simple array",
    "items": {
        "title": "Value",
        "type": "number"
    },
    "default": [1, 2, 3]
}

},{}],17:[function(require,module,exports){
module.exports={
    "title": "Strings",
    "type": "object",
    "properties": {
        "plain-string": {
            "title": "String",
            "type": "string"
        },
        "multiline": {
            "title": "Multiline String",
            "type": "string",
            "format": "multiline"
        },
        "select-string": {
            "title": "String Enum",
            "type": "string",
            "enum": ["Foo", "Bar", "Baz"]
        },
        "select-string-default": {
            "title": "String Enum with Default",
            "type": "string",
            "enum": ["Foo", "Bar", "Baz"],
            "default": "Bar"
        },
        "const-string": {
            "title": "Const String",
            "type": "string",
            "enum": ["Foo"]
        },
        "hidden-string": {
            "title": "Hidden String",
            "type": "string",
            "enum": ["Bar"],
            "format": "hidden"
        },
        "plain-string-min-length": {
            "title": "String with Minimum Length",
            "type": "string",
            "minLength": 2
        },
        "plain-string-max-length": {
            "title": "String with Maximum Length",
            "type": "string",
            "maxLength": 10
        },
        "plain-string-min-max-length": {
            "title": "String with Minimum and Maximum Length",
            "type": "string",
            "minLength": 2,
            "maxLength": 10
        },
        "plain-string-pattern": {
            "title": "String with pattern",
            "type": "string",
            "pattern": "^[0-9a-z]+$"
        },
        "color-string": {
            "title": "Color String",
            "type": "string",
            "format": "color"
        },
        "datetime-string": {
            "title": "Date-time String",
            "type": "string",
            "format": "date-time"
        },
        "email-string": {
            "title": "Email String",
            "type": "string",
            "format": "email"
        },
        "month-string": {
            "title": "Month String",
            "type": "string",
            "format": "month"
        },
        "password": {
            "title": "Password String",
            "type": "string",
            "format": "password"
        },
        "telephone": {
            "title": "Telephone String",
            "type": "string",
            "format": "tel"
        },
        "time": {
            "title": "Time String",
            "type": "string",
            "format": "time"
        },
        "url": {
            "title": "URL String",
            "type": "string",
            "format": "uri"
        },
        "week": {
            "title": "Week String",
            "type": "string",
            "format": "week"
        }
    }
}

},{}],18:[function(require,module,exports){
module.exports={
    "type": "array",
    "title": "Tuple Array",
    "description": "A tuple array",
    "items": [
        {
            "title": "Foo",
            "type": "number"
        },
        {
            "title": "Bar",
            "type": "string"
        },
        {
            "title": "Baz",
            "type": "boolean"
        }
    ],
    "default": [1, "Bar", true]
}

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_item_1 = require("../types/array/array-item");
const utils_1 = require("../utils");
// TODO enforce minItems/maxItems
exports.ArrayListApi = (document, container, schema, templates) => {
    const list = container.querySelector('ol');
    if (!list)
        throw Error('ArrayListApi: container is missing OL');
    if (!schema.items || Array.isArray(schema.items))
        throw Error('ArrayListApi: schema.items should be a schema');
    const childSchema = schema.items;
    if (typeof childSchema.type !== 'string')
        throw Error('ArrayListApi: schema.items.type should be a string');
    const template = templates[childSchema.type];
    if (!template)
        throw Error(`ArrayListApi: missing template ${childSchema.type}`);
    const name = container.dataset.name || '';
    const count = () => list.childElementCount;
    const clear = () => { list.innerHTML = ''; };
    const add = (value) => {
        let arrayItem = templates.arrayItem;
        if (!arrayItem) {
            arrayItem = array_item_1.ArrayItemTemplate(document, templates);
        }
        const key = count();
        const childName = utils_1.getChildName(name, count());
        const li = arrayItem(childSchema, childName, value);
        list.appendChild(li);
        return key;
    };
    const remove = (index) => {
        if (index >= count())
            throw Error('ArrayListApi: remove index out of bounds');
        const previousCount = count();
        list.children[index].remove();
        renumber(previousCount, index + 1);
    };
    const renumber = (previousCount, from) => {
        const name = container.dataset.name || '';
        for (let i = from; i < previousCount; i++) {
            const oldName = utils_1.getChildName(name, i);
            const newName = utils_1.getChildName(name, i - 1);
            const targets = Array.from(list.querySelectorAll('[name]'));
            targets.forEach(target => {
                if (target.name.startsWith(oldName)) {
                    target.name = target.name.replace(oldName, newName);
                }
            });
        }
    };
    return {
        get count() {
            return count();
        },
        clear,
        add,
        remove
    };
};

},{"../types/array/array-item":27,"../utils":36}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConstDecorator = (_document, stringOrNumberTemplate) => {
    const constDecorator = (schema = {}, name = '', value, isRequired = false) => {
        if (Array.isArray(schema.enum) && schema.enum.length === 1) {
            const editor = stringOrNumberTemplate(schema, name, schema.enum[0]);
            const input = (editor.matches('input') ? editor :
                editor.querySelector('input'));
            if (!input)
                return editor;
            if (schema.format === 'hidden') {
                input.type = 'hidden';
                return input;
            }
            input.readOnly = true;
            return input;
        }
        return stringOrNumberTemplate(schema, name, value, isRequired);
    };
    return constDecorator;
};

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.FieldsetDecorator = (document, containerTemplate, useLegend = true) => {
    const fieldsetDecorator = (schema = {}, name = '', value) => {
        const container = containerTemplate(schema, name, value);
        const title = utils_1.getTitle(schema, name, 'Container');
        const fieldset = document.createElement('fieldset');
        if (useLegend) {
            const legend = document.createElement('legend');
            legend.innerHTML = title;
            fieldset.appendChild(legend);
        }
        fieldset.appendChild(container);
        return fieldset;
    };
    return fieldsetDecorator;
};

},{"../utils":36}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDecorator = (_document, stringTemplates, formatToTemplateKey = new Map(), formatToTypeAttribute = exports.defaultFormatToType) => {
    const formatDecorator = (schema = {}, name = '', value, isRequired = false) => {
        const stringTemplate = stringTemplates.string;
        let format;
        if (typeof schema.format !== 'string') {
            return stringTemplate(schema, name, value, isRequired);
        }
        format = formatToTemplateKey.get(schema.format) || schema.format;
        if (typeof stringTemplates[format] !== 'undefined') {
            return stringTemplates[format](schema, name, value, isRequired);
        }
        const editor = stringTemplate(schema, name, value, isRequired);
        const input = (editor.matches('input') ? editor :
            editor.querySelector('input'));
        if (!input)
            throw Error('formatDecorator could not find an input element!');
        format = formatToTypeAttribute.get(schema.format) || schema.format;
        input.type = format;
        return editor;
    };
    return formatDecorator;
};
exports.defaultFormatToType = new Map();
exports.defaultFormatToType.set('date-time', 'datetime-local');
exports.defaultFormatToType.set('uri', 'url');

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.LabelDecorator = (document, inputTemplate, isSuffix = false) => {
    const labelDecorator = (schema = {}, name = '', value, isRequired = false) => {
        const editor = inputTemplate(schema, name, value, isRequired);
        const input = (editor.matches('input') ? editor :
            editor.querySelector('input'));
        if (input && input.type === 'hidden')
            return editor;
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.innerHTML =
            `${utils_1.getTitle(schema, name, 'Input')}${isRequired ? '*' : ''}`;
        if (isSuffix) {
            label.appendChild(editor);
            label.appendChild(span);
        }
        else {
            label.appendChild(span);
            label.appendChild(editor);
        }
        return label;
    };
    return labelDecorator;
};

},{"../utils":36}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_list_1 = require("../api/array-list");
const utils_1 = require("../utils");
// TODO enforce minItems/maxItems
exports.MutableArrayListDecorator = (document, arrayList, templates) => {
    const mutableArrayListDecorator = (schema = {}, name = '', value) => {
        const container = arrayList(schema, name, value);
        if (!schema.items ||
            Array.isArray(schema.items) ||
            typeof schema.items.type !== 'string')
            return container;
        const api = array_list_1.ArrayListApi(document, container, schema, templates);
        const title = `Add ${utils_1.getTitle(schema.items, '', 'Item')}`;
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.innerHTML = title;
        addButton.dataset.action = 'array-list-add';
        container.appendChild(addButton);
        container.addEventListener('click', e => {
            const target = e.target;
            if (target.dataset.action === 'array-list-add') {
                e.stopPropagation();
                api.add();
                container.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (target.dataset.action === 'array-list-delete') {
                e.stopPropagation();
                const li = target.closest('li');
                // can't throw errors in event handlers, no way to catch them
                // when using dispatchEvent, so throwing makes this untestable
                if (!li)
                    return;
                const ol = li.parentNode;
                const index = Array.from(ol.children).indexOf(li);
                api.remove(index);
                container.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        return container;
    };
    return mutableArrayListDecorator;
};
exports.MutableArrayItemDecorator = (document, arrayItem) => {
    const mutableArrayItemDecorator = (schema = {}, name = '', value) => {
        const item = arrayItem(schema, name, value);
        const title = `Delete ${utils_1.getTitle(schema, name, 'Item')}`;
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.innerHTML = title;
        deleteButton.dataset.action = 'array-list-delete';
        item.appendChild(deleteButton);
        return item;
    };
    return mutableArrayItemDecorator;
};

},{"../api/array-list":19,"../utils":36}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.SelectDecorator = (document, stringTemplate, predicate = (_schema) => true) => {
    const selectDecorator = (schema = {}, name = '', value, isRequired = false) => {
        if (!Array.isArray(schema.enum) || !predicate(schema))
            return stringTemplate(schema, name, value, isRequired);
        if (!schema.enum.every(value => typeof value === 'string'))
            throw Error('Expected enum to be an array of strings');
        const enumValues = schema.enum;
        const editor = document.createElement('select');
        editor.title = utils_1.getTitle(schema, name, 'String');
        if (isRequired)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        enumValues.forEach((enumValue, i) => {
            const option = document.createElement('option');
            const title = (schema['_enumTitles'] && schema['_enumTitles'][i] ?
                schema['_enumTitles'][i] :
                enumValue);
            option.value = enumValue;
            option.innerHTML = title;
            if (typeof value === 'string') {
                option.selected = enumValue === value;
            }
            else if (typeof schema.default === 'string') {
                option.selected = enumValue === schema.default;
            }
            editor.appendChild(option);
        });
        return editor;
    };
    return selectDecorator;
};

},{"../utils":36}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("./types/array");
const boolean_1 = require("./types/boolean");
const number_1 = require("./types/number");
const object_1 = require("./types/object");
const string_1 = require("./types/string");
const fieldset_1 = require("./decorators/fieldset");
const format_1 = require("./decorators/format");
const label_1 = require("./decorators/label");
const mutable_array_list_1 = require("./decorators/mutable-array-list");
const array_list_1 = require("./types/array/array-list");
const array_item_1 = require("./types/array/array-item");
const select_1 = require("./decorators/select");
const const_1 = require("./decorators/const");
exports.ServerFormTemplates = (document) => {
    const templates = {};
    templates.array = fieldset_1.FieldsetDecorator(document, array_1.ArrayTemplate(document, templates));
    templates.boolean = label_1.LabelDecorator(document, boolean_1.BooleanTemplate(document), true);
    templates.number = label_1.LabelDecorator(document, const_1.ConstDecorator(document, number_1.NumberTemplate(document)));
    templates.integer = templates.number;
    templates.object = fieldset_1.FieldsetDecorator(document, object_1.ObjectTemplate(document, templates));
    templates.string = label_1.LabelDecorator(document, const_1.ConstDecorator(document, select_1.SelectDecorator(document, format_1.FormatDecorator(document, {
        string: string_1.StringTemplate(document),
        multiline: string_1.StringTemplate(document, true)
    }), (schema) => Array.isArray(schema.enum) && schema.enum.length > 1)));
    return templates;
};
exports.ClientFormTemplates = (document) => {
    const templates = exports.ServerFormTemplates(document);
    templates.arrayList = fieldset_1.FieldsetDecorator(document, mutable_array_list_1.MutableArrayListDecorator(document, array_list_1.ArrayListTemplate(document, templates), templates));
    templates.arrayItem = mutable_array_list_1.MutableArrayItemDecorator(document, array_item_1.ArrayItemTemplate(document, templates));
    return templates;
};

},{"./decorators/const":20,"./decorators/fieldset":21,"./decorators/format":22,"./decorators/label":23,"./decorators/mutable-array-list":24,"./decorators/select":25,"./types/array":29,"./types/array/array-item":27,"./types/array/array-list":28,"./types/boolean":31,"./types/number":33,"./types/object":34,"./types/string":35}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayItemTemplate = (document, templates = {}) => {
    const arrayItemEditor = (schema = {}, name = '', value) => {
        const li = document.createElement('li');
        if (typeof schema.type !== 'string')
            return li;
        const template = templates[schema.type];
        if (!template)
            return li;
        const editorItem = template(schema, name, value);
        li.appendChild(editorItem);
        return li;
    };
    return arrayItemEditor;
};

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_item_1 = require("./array-item");
const utils_1 = require("../../utils");
exports.ArrayListTemplate = (document, templates = {}) => {
    const arrayListEditor = (schema = {}, name = '', value) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Array List');
        if (name)
            container.dataset.name = name;
        if (!schema.items || Array.isArray(schema.items))
            return container;
        const childSchema = schema.items;
        if (typeof childSchema.type !== 'string')
            return container;
        const template = templates[childSchema.type];
        if (!template)
            return container;
        const itemTemplate = (templates.arrayItem || array_item_1.ArrayItemTemplate(document, templates));
        if (typeof value === 'undefined' && Array.isArray(schema.default))
            value = schema.default;
        const hasMaxItems = typeof schema.maxItems === 'number';
        const hasMinItems = typeof schema.minItems === 'number';
        let count = (Array.isArray(value) ? value.length :
            hasMaxItems ? schema.maxItems :
                hasMinItems ? schema.minItems :
                    1);
        if (hasMaxItems && count > schema.maxItems) {
            count = schema.maxItems;
        }
        if (hasMinItems && count < schema.minItems) {
            count = schema.minItems;
        }
        const list = document.createElement('ol');
        container.appendChild(list);
        for (let key = 0; key < count; key++) {
            let childValue = undefined;
            if (Array.isArray(value)) {
                childValue = value[key];
            }
            const childName = utils_1.getChildName(name, key);
            const li = itemTemplate(childSchema, childName, childValue);
            list.appendChild(li);
        }
        return container;
    };
    return arrayListEditor;
};

},{"../../utils":36,"./array-item":27}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tuple_1 = require("./tuple");
const array_list_1 = require("./array-list");
exports.ArrayTemplate = (document, templates = {}) => {
    const arrayTemplate = (schema = {}, name = '', value) => {
        if (typeof value === 'undefined' &&
            Array.isArray(schema.default)) {
            value = schema.default;
        }
        if (Array.isArray(schema.items)) {
            if (templates.tuple) {
                return templates.tuple(schema, name, value);
            }
            return tuple_1.TupleTemplate(document, templates)(schema, name, value);
        }
        if (templates.arrayList) {
            return templates.arrayList(schema, name, value);
        }
        return array_list_1.ArrayListTemplate(document, templates)(schema, name, value);
    };
    return arrayTemplate;
};

},{"./array-list":28,"./tuple":30}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
exports.TupleTemplate = (document, templates = {}) => {
    const tupleTemplate = (schema = {}, name = '', value, isRequired = false) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Tuple');
        if (name)
            container.dataset.name = name;
        if (!Array.isArray(schema.items))
            return container;
        if (typeof value === 'undefined' && Array.isArray(schema.default))
            value = schema.default;
        schema.items.forEach((childSchema, key) => {
            if (typeof childSchema.type !== 'string')
                return;
            const template = templates[childSchema.type];
            if (!template)
                return;
            let childValue = undefined;
            if (Array.isArray(value)) {
                childValue = value[key];
            }
            const childName = utils_1.getChildName(name, key);
            const editor = template(childSchema, childName, childValue, isRequired);
            container.appendChild(editor);
        });
        return container;
    };
    return tupleTemplate;
};

},{"../../utils":36}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.BooleanTemplate = (document) => {
    const booleanTemplate = (schema = {}, name = '', value) => {
        const editor = document.createElement('input');
        editor.type = 'checkbox';
        editor.title = utils_1.getTitle(schema, name, 'Boolean');
        if (Array.isArray(schema.enum) &&
            schema.enum.length === 1 &&
            schema.enum[0] === true)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        if (typeof value === 'boolean') {
            if (value)
                editor.setAttribute('checked', '');
        }
        else if (typeof schema.default === 'boolean') {
            if (schema.default)
                editor.setAttribute('checked', '');
        }
        return editor;
    };
    return booleanTemplate;
};

},{"../utils":36}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("./array");
const boolean_1 = require("./boolean");
const number_1 = require("./number");
const object_1 = require("./object");
const string_1 = require("./string");
exports.TypeTemplates = (document) => {
    const templates = {};
    templates.array = array_1.ArrayTemplate(document, templates);
    templates.boolean = boolean_1.BooleanTemplate(document);
    templates.number = number_1.NumberTemplate(document);
    templates.integer = templates.number;
    templates.object = object_1.ObjectTemplate(document, templates);
    templates.string = string_1.StringTemplate(document);
    return templates;
};

},{"./array":29,"./boolean":31,"./number":33,"./object":34,"./string":35}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.NumberTemplate = (document, isRange = false) => {
    const numberTemplate = (schema = {}, name = '', value, isRequired = false) => {
        const editor = document.createElement('input');
        editor.type = isRange ? 'range' : 'number';
        editor.title = utils_1.getTitle(schema, name, schema.type === 'integer' ? 'Integer' : 'Number');
        if (isRequired)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        if (typeof value === 'number') {
            editor.defaultValue = String(value);
        }
        else if (typeof schema.default === 'number') {
            editor.defaultValue = String(schema.default);
        }
        if (typeof schema.multipleOf === 'number') {
            editor.step = String(schema.multipleOf);
        }
        else if (schema.type === 'integer') {
            editor.step = '1';
        }
        if (typeof schema.minimum === 'number') {
            editor.min = String(schema.minimum);
        }
        if (typeof schema.maximum === 'number') {
            editor.max = String(schema.maximum);
        }
        return editor;
    };
    return numberTemplate;
};

},{"../utils":36}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.ObjectTemplate = (document, templates = {}) => {
    const objectTemplate = (schema = {}, name = '', value) => {
        const container = document.createElement('div');
        container.title = utils_1.getTitle(schema, name, 'Object');
        if (name)
            container.dataset.name = name;
        if (!schema.properties)
            return container;
        if (typeof value === 'undefined' && typeof schema.default !== 'undefined')
            value = schema.default;
        const required = schema.required || [];
        Object.keys(schema.properties).forEach(key => {
            const childSchema = schema.properties[key];
            if (typeof childSchema.type !== 'string')
                return;
            const template = templates[childSchema.type];
            if (!template)
                return;
            let childValue = undefined;
            if (typeof value === 'object') {
                childValue = value[key];
            }
            const isRequired = required.includes(key);
            const childName = utils_1.getChildName(name, key);
            const editor = template(childSchema, childName, childValue, isRequired);
            container.appendChild(editor);
        });
        return container;
    };
    return objectTemplate;
};

},{"../utils":36}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.StringTemplate = (document, isMultiline = false) => {
    const stringTemplate = (schema = {}, name = '', value, isRequired = false) => {
        let editor;
        if (isMultiline) {
            editor = document.createElement('textarea');
        }
        else {
            editor = document.createElement('input');
            editor.type = 'text';
            if (schema.pattern) {
                editor.pattern = schema.pattern;
            }
        }
        editor.title = utils_1.getTitle(schema, name, 'String');
        if (isRequired)
            editor.setAttribute('required', '');
        if (name)
            editor.name = name;
        if (typeof value === 'string') {
            editor.defaultValue = value;
        }
        else if (typeof schema.default === 'string') {
            editor.defaultValue = schema.default;
        }
        if (typeof schema.minLength === 'number') {
            editor.minLength = schema.minLength;
        }
        if (typeof schema.maxLength === 'number') {
            editor.maxLength = schema.maxLength;
        }
        return editor;
    };
    return stringTemplate;
};

},{"../utils":36}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTitle = (schema, name = '', fallback = 'Schema') => schema.title || name || fallback;
exports.getChildName = (name, key) => name ? `${name}[${key}]` : String(key);
exports.H = (document, name) => (attributes = {}, ...children) => {
    const el = document.createElement(name);
    Object.keys(attributes).forEach(name => el.setAttribute(name, String(attributes[name])));
    children.forEach(child => el.appendChild(child));
    return el;
};
exports.Form = (document) => exports.H(document, 'form');
exports.getEntries = (form, allowEmptyValue = true) => {
    const result = [];
    const editors = Array.from(form.querySelectorAll('input, textarea, select'));
    editors.forEach(editor => {
        let { name, value } = editor;
        if (!value && !allowEmptyValue) {
            return;
        }
        let typedValue = value;
        if (name.endsWith('__number') ||
            name.endsWith('__string') ||
            name.endsWith('__boolean')) {
            name = name.split('__')[0];
        }
        if (editor.type === 'number')
            typedValue = Number(typedValue);
        if (editor.type === 'checkbox')
            typedValue = editor.checked;
        result.push([name, typedValue]);
    });
    return result;
};
exports.keyToJsonPointer = (key) => {
    key = key.replace(/\[/g, '/');
    key = key.replace(/\]/g, '/');
    if (key[key.length - 1] === '/')
        key = key.substr(0, key.length - 1);
    if (!key.startsWith('/'))
        key = '/' + key;
    return key;
};
exports.entriesToPointers = (entries) => entries.map(([key, value]) => [exports.keyToJsonPointer(key), value]);

},{}],37:[function(require,module,exports){
"use strict";
const is_1 = require("./is");
/*
  We add the custom predicates twice - first time, so that their key order is
  retained, then we add the defaults, then we add the custom predicates again
  in case any of them are supposed to override a default predicate
*/
const extendDefaults = (predicates) => Object.assign({}, predicates, is_1.is, predicates);
const Utils = (predicates) => {
    const keys = Object.keys(predicates);
    const isType = (subject, typename) => predicates[typename] && predicates[typename](subject);
    const isOnly = (subject, typename) => isType(subject, typename) && allOf(subject).length === 1;
    const some = (subject, ...typenames) => typenames.some(typename => isType(subject, typename));
    const every = (subject, ...typenames) => typenames.every(typename => isType(subject, typename));
    const _of = (subject) => keys.find(key => isType(subject, key));
    const allOf = (subject) => keys.filter(key => isType(subject, key));
    const types = () => keys.slice();
    return { isType, isOnly, some, every, of: _of, allOf, types };
};
const utils = Utils(is_1.is);
const Is = { is: is_1.is, extendDefaults, utils, Utils };
module.exports = Is;

},{"./is":38}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isEmptyObject = (obj) => {
    for (const key in obj)
        return false;
    return true;
};
const isNumber = (subject) => typeof subject === 'number' && isFinite(subject);
const isInteger = (subject) => Number.isInteger(subject);
const isString = (subject) => typeof subject === 'string';
const isBoolean = (subject) => typeof subject === 'boolean';
const isArray = (subject) => Array.isArray(subject);
const isNull = (subject) => subject === null;
const isUndefined = (subject) => subject === undefined;
const isFunction = (subject) => typeof subject === 'function';
// I think you can exclude array, null etc with Diff<T, U> in TS 2.8, look into
const isObject = (subject) => typeof subject === 'object' && !isNull(subject) && !isArray(subject);
const isEmpty = (subject) => isObject(subject) && isEmptyObject(subject);
exports.is = {
    number: isNumber,
    integer: isInteger,
    string: isString,
    boolean: isBoolean,
    array: isArray,
    null: isNull,
    undefined: isUndefined,
    function: isFunction,
    object: isObject,
    empty: isEmpty
};

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = require("@mojule/is");
const mm = require("micromatch");
const unescape = str => str.replace(/~1/g, '/').replace(/~0/g, '~');
const escape = str => str.replace(/~/g, '~0').replace(/\//g, '~1');
const setter = (obj, parts, value) => {
    let target;
    let hasNext;
    const { length } = parts;
    for (let i = 1; i < length;) {
        target = unescape(parts[i++]);
        hasNext = length > i;
        if (is_1.is.undefined(obj[target])) {
            if (is_1.is.array(obj) && target === '-') {
                target = obj.length;
            }
            // support nested objects/array when setting values
            if (hasNext) {
                if ((parts[i] !== '' && parts[i] < Infinity) ||
                    parts[i] === '-') {
                    obj[target] = [];
                }
                else {
                    obj[target] = {};
                }
            }
        }
        if (!hasNext)
            break;
        obj = obj[target];
    }
    const oldValue = obj[target];
    if (is_1.is.undefined(value)) {
        delete obj[target];
    }
    else {
        obj[target] = value;
    }
    return oldValue;
};
const compilePointer = (pointer) => {
    if (is_1.is.string(pointer)) {
        pointer = pointer.split('/');
        if (pointer[0] === '')
            return pointer;
        throw Error('Invalid JSON pointer.');
    }
    if (is_1.is.array(pointer))
        return pointer;
    throw Error('Invalid JSON pointer.');
};
exports.get = (obj, pointer) => {
    if (typeof obj !== 'object')
        throw Error('Invalid input object.');
    pointer = compilePointer(pointer);
    const { length } = pointer;
    if (length === 1)
        return obj;
    for (var i = 1; i < length;) {
        obj = obj[unescape(pointer[i++])];
        if (length === i)
            return obj;
        if (typeof obj !== 'object')
            return undefined;
    }
};
exports.set = (obj, pointer, value) => {
    if (typeof obj !== 'object')
        throw Error('Invalid input object.');
    pointer = compilePointer(pointer);
    if (pointer.length === 0)
        throw Error('Invalid JSON pointer for set.');
    return setter(obj, pointer, value);
};
exports.compile = (pointer) => {
    const compiled = compilePointer(pointer);
    return {
        get: obj => exports.get(obj, compiled),
        set: (obj, value) => exports.set(obj, compiled, value)
    };
};
const clone = value => JSON.parse(JSON.stringify(value));
const isValueType = value => is_1.is.string(value) || is_1.is.number(value) || is_1.is.boolean(value) ||
    is_1.is.null(value);
exports.flatten = source => {
    try {
        source = clone(source);
    }
    catch (e) {
        throw Error('Expected JSON compatible value');
    }
    const isFlattenable = (is_1.is.object(source) && !is_1.is.empty(source)) ||
        (is_1.is.array(source) && source.length > 0);
    if (!isFlattenable)
        return source;
    const target = {};
    const route = (current, prefix = '') => {
        const isArray = is_1.is.array(current);
        const isValue = (isArray && current.length === 0) ||
            isValueType(current) || is_1.is.empty(current);
        if (isValue) {
            target[prefix] = current;
            return;
        }
        if (is_1.is.array(current)) {
            current.forEach((value, i) => {
                route(value, `${prefix}/${i}`);
            });
            return;
        }
        Object.keys(current).forEach(key => {
            route(current[key], `${prefix}/${escape(key)}`);
        });
    };
    route(source);
    return target;
};
exports.expand = (source, target) => {
    if (!is_1.is.object(source))
        throw Error('Invalid input object.');
    const keys = Object.keys(source);
    if (keys.length === 0)
        return target || {};
    const pointers = keys.reduce((obj, key) => {
        obj[key] = compilePointer(key);
        return obj;
    }, {});
    if (is_1.is.undefined(target)) {
        const pointer = pointers[keys[0]];
        const first = pointer[1];
        target = /^\d+$/.test(first) ? [] : {};
    }
    keys.forEach(key => exports.set(target, pointers[key], source[key]));
    return target;
};
exports.pointers = source => {
    try {
        source = clone(source);
    }
    catch (e) {
        throw Error('Expected JSON compatible value');
    }
    const hasPaths = is_1.is.object(source) || is_1.is.array(source);
    if (!hasPaths)
        return [];
    const paths = [];
    const route = (current, prefix = '') => {
        paths.push(prefix);
        if (is_1.is.array(current)) {
            current.forEach((value, i) => {
                route(value, `${prefix}/${i}`);
            });
        }
        else if (is_1.is.object(current)) {
            Object.keys(current).forEach(key => {
                route(current[key], `${prefix}/${escape(key)}`);
            });
        }
    };
    route(source);
    return paths;
};
exports.glob = (source, patterns, options) => {
    const paths = exports.pointers(source);
    const matches = mm(paths, patterns, options);
    const result = matches.map(match => exports.get(source, match));
    return result;
};
exports.pointerValueArray = (pointerMap) => Object.keys(pointerMap).map((pointer, order) => ({
    pointer,
    value: pointerMap[pointer],
    order
}));
exports.globPointerValues = (pointerValues, patterns, options) => {
    const paths = pointerValues.map(pv => pv.pointer);
    const matches = mm(paths, patterns, options);
    return pointerValues.filter(pv => matches.includes(pv.pointer));
};
exports.sortedPointerValues = (pointerValues) => pointerValues.slice().sort((a, b) => a.order - b.order);
exports.pointerValueArrayToPointerMap = (pointerValues, sort = true) => {
    if (sort)
        pointerValues = exports.sortedPointerValues(pointerValues);
    return pointerValues.reduce((map, pointerValue) => {
        map[pointerValue.pointer] = pointerValue.value;
        return map;
    }, {});
};
const valueEquals = (a, b) => {
    if (Array.isArray(a) && a.length === 0 &&
        Array.isArray(b) && b.length === 0)
        return true;
    if (typeof a === 'object' && Object.keys(a).length === 0 &&
        typeof b === 'object' && Object.keys(b).length === 0)
        return true;
    return a === b;
};
exports.diff = (left, right, sort = false) => {
    const diff = [];
    const handled = {};
    if (sort) {
        left = exports.sortedPointerValues(left);
        right = exports.sortedPointerValues(right);
    }
    left.forEach((pvLeft, index) => {
        if (pvLeft.order !== index)
            throw Error('diff requires pointer values to be sorted by order');
        const indexRight = right.findIndex(pvRight => pvLeft.pointer === pvRight.pointer);
        const pvRight = right[indexRight];
        const indicesMatch = indexRight === index;
        const valuesMatch = pvRight && valueEquals(pvLeft.value, pvRight.value);
        if (indicesMatch) {
            if (valuesMatch) {
                // the key, index and value are the same - no change
                diff.push(pvLeft);
            }
            else {
                // the key and index are the same, but the value is different
                diff.push(Object.assign({}, pvLeft, { newValue: pvRight.value }));
            }
        }
        else if (valuesMatch) {
            // the key and value are the same but it moved
            diff.push(Object.assign({}, pvLeft, { newOrder: indexRight }));
        }
        else if (pvRight) {
            // it was moved and changed
            diff.push(Object.assign({}, pvLeft, { newValue: pvRight.value, newOrder: indexRight }));
        }
        else {
            // it was deleted
            diff.push(Object.assign({}, pvLeft, { delete: true }));
        }
        handled[pvLeft.pointer] = true;
    });
    right.forEach((pvRight, index) => {
        if (pvRight.order !== index)
            throw Error('diff requires pointer values to be sorted by order');
        if (handled[pvRight.pointer])
            return;
        diff.push(Object.assign({}, pvRight, { add: true }));
    });
    return diff;
};
exports.newFromDiff = (diffs) => {
    const pva = [];
    diffs.forEach(diff => {
        if (diff.delete)
            return;
        const { pointer, value, order } = diff;
        const pv = { pointer, value, order };
        if (diff.newOrder !== undefined) {
            pv.order = diff.newOrder;
        }
        if (diff.newValue !== undefined) {
            pv.value = diff.newValue;
        }
        pva.push(pv);
    });
    return pva;
};
exports.oldFromDiff = (diffs) => {
    const pva = [];
    diffs.forEach(diff => {
        if (diff.add)
            return;
        const { pointer, value, order } = diff;
        const pv = { pointer, value, order };
        pva.push(pv);
    });
    return pva;
};

},{"@mojule/is":37,"micromatch":155}],40:[function(require,module,exports){
'use strict';

var compileSchema = require('./compile')
  , resolve = require('./compile/resolve')
  , Cache = require('./cache')
  , SchemaObject = require('./compile/schema_obj')
  , stableStringify = require('fast-json-stable-stringify')
  , formats = require('./compile/formats')
  , rules = require('./compile/rules')
  , $dataMetaSchema = require('./data')
  , util = require('./compile/util');

module.exports = Ajv;

Ajv.prototype.validate = validate;
Ajv.prototype.compile = compile;
Ajv.prototype.addSchema = addSchema;
Ajv.prototype.addMetaSchema = addMetaSchema;
Ajv.prototype.validateSchema = validateSchema;
Ajv.prototype.getSchema = getSchema;
Ajv.prototype.removeSchema = removeSchema;
Ajv.prototype.addFormat = addFormat;
Ajv.prototype.errorsText = errorsText;

Ajv.prototype._addSchema = _addSchema;
Ajv.prototype._compile = _compile;

Ajv.prototype.compileAsync = require('./compile/async');
var customKeyword = require('./keyword');
Ajv.prototype.addKeyword = customKeyword.add;
Ajv.prototype.getKeyword = customKeyword.get;
Ajv.prototype.removeKeyword = customKeyword.remove;
Ajv.prototype.validateKeyword = customKeyword.validate;

var errorClasses = require('./compile/error_classes');
Ajv.ValidationError = errorClasses.Validation;
Ajv.MissingRefError = errorClasses.MissingRef;
Ajv.$dataMetaSchema = $dataMetaSchema;

var META_SCHEMA_ID = 'http://json-schema.org/draft-07/schema';

var META_IGNORE_OPTIONS = [ 'removeAdditional', 'useDefaults', 'coerceTypes', 'strictDefaults' ];
var META_SUPPORT_DATA = ['/properties'];

/**
 * Creates validator instance.
 * Usage: `Ajv(opts)`
 * @param {Object} opts optional options
 * @return {Object} ajv instance
 */
function Ajv(opts) {
  if (!(this instanceof Ajv)) return new Ajv(opts);
  opts = this._opts = util.copy(opts) || {};
  setLogger(this);
  this._schemas = {};
  this._refs = {};
  this._fragments = {};
  this._formats = formats(opts.format);

  this._cache = opts.cache || new Cache;
  this._loadingSchemas = {};
  this._compilations = [];
  this.RULES = rules();
  this._getId = chooseGetId(opts);

  opts.loopRequired = opts.loopRequired || Infinity;
  if (opts.errorDataPath == 'property') opts._errorDataPathProperty = true;
  if (opts.serialize === undefined) opts.serialize = stableStringify;
  this._metaOpts = getMetaSchemaOptions(this);

  if (opts.formats) addInitialFormats(this);
  addDefaultMetaSchema(this);
  if (typeof opts.meta == 'object') this.addMetaSchema(opts.meta);
  if (opts.nullable) this.addKeyword('nullable', {metaSchema: {type: 'boolean'}});
  addInitialSchemas(this);
}



/**
 * Validate data using schema
 * Schema will be compiled and cached (using serialized JSON as key. [fast-json-stable-stringify](https://github.com/epoberezkin/fast-json-stable-stringify) is used to serialize.
 * @this   Ajv
 * @param  {String|Object} schemaKeyRef key, ref or schema object
 * @param  {Any} data to be validated
 * @return {Boolean} validation result. Errors from the last validation will be available in `ajv.errors` (and also in compiled schema: `schema.errors`).
 */
function validate(schemaKeyRef, data) {
  var v;
  if (typeof schemaKeyRef == 'string') {
    v = this.getSchema(schemaKeyRef);
    if (!v) throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
  } else {
    var schemaObj = this._addSchema(schemaKeyRef);
    v = schemaObj.validate || this._compile(schemaObj);
  }

  var valid = v(data);
  if (v.$async !== true) this.errors = v.errors;
  return valid;
}


/**
 * Create validating function for passed schema.
 * @this   Ajv
 * @param  {Object} schema schema object
 * @param  {Boolean} _meta true if schema is a meta-schema. Used internally to compile meta schemas of custom keywords.
 * @return {Function} validating function
 */
function compile(schema, _meta) {
  var schemaObj = this._addSchema(schema, undefined, _meta);
  return schemaObj.validate || this._compile(schemaObj);
}


/**
 * Adds schema to the instance.
 * @this   Ajv
 * @param {Object|Array} schema schema or array of schemas. If array is passed, `key` and other parameters will be ignored.
 * @param {String} key Optional schema key. Can be passed to `validate` method instead of schema object or id/ref. One schema per instance can have empty `id` and `key`.
 * @param {Boolean} _skipValidation true to skip schema validation. Used internally, option validateSchema should be used instead.
 * @param {Boolean} _meta true if schema is a meta-schema. Used internally, addMetaSchema should be used instead.
 * @return {Ajv} this for method chaining
 */
function addSchema(schema, key, _skipValidation, _meta) {
  if (Array.isArray(schema)){
    for (var i=0; i<schema.length; i++) this.addSchema(schema[i], undefined, _skipValidation, _meta);
    return this;
  }
  var id = this._getId(schema);
  if (id !== undefined && typeof id != 'string')
    throw new Error('schema id must be string');
  key = resolve.normalizeId(key || id);
  checkUnique(this, key);
  this._schemas[key] = this._addSchema(schema, _skipValidation, _meta, true);
  return this;
}


/**
 * Add schema that will be used to validate other schemas
 * options in META_IGNORE_OPTIONS are alway set to false
 * @this   Ajv
 * @param {Object} schema schema object
 * @param {String} key optional schema key
 * @param {Boolean} skipValidation true to skip schema validation, can be used to override validateSchema option for meta-schema
 * @return {Ajv} this for method chaining
 */
function addMetaSchema(schema, key, skipValidation) {
  this.addSchema(schema, key, skipValidation, true);
  return this;
}


/**
 * Validate schema
 * @this   Ajv
 * @param {Object} schema schema to validate
 * @param {Boolean} throwOrLogError pass true to throw (or log) an error if invalid
 * @return {Boolean} true if schema is valid
 */
function validateSchema(schema, throwOrLogError) {
  var $schema = schema.$schema;
  if ($schema !== undefined && typeof $schema != 'string')
    throw new Error('$schema must be a string');
  $schema = $schema || this._opts.defaultMeta || defaultMeta(this);
  if (!$schema) {
    this.logger.warn('meta-schema not available');
    this.errors = null;
    return true;
  }
  var valid = this.validate($schema, schema);
  if (!valid && throwOrLogError) {
    var message = 'schema is invalid: ' + this.errorsText();
    if (this._opts.validateSchema == 'log') this.logger.error(message);
    else throw new Error(message);
  }
  return valid;
}


function defaultMeta(self) {
  var meta = self._opts.meta;
  self._opts.defaultMeta = typeof meta == 'object'
                            ? self._getId(meta) || meta
                            : self.getSchema(META_SCHEMA_ID)
                              ? META_SCHEMA_ID
                              : undefined;
  return self._opts.defaultMeta;
}


/**
 * Get compiled schema from the instance by `key` or `ref`.
 * @this   Ajv
 * @param  {String} keyRef `key` that was passed to `addSchema` or full schema reference (`schema.id` or resolved id).
 * @return {Function} schema validating function (with property `schema`).
 */
function getSchema(keyRef) {
  var schemaObj = _getSchemaObj(this, keyRef);
  switch (typeof schemaObj) {
    case 'object': return schemaObj.validate || this._compile(schemaObj);
    case 'string': return this.getSchema(schemaObj);
    case 'undefined': return _getSchemaFragment(this, keyRef);
  }
}


function _getSchemaFragment(self, ref) {
  var res = resolve.schema.call(self, { schema: {} }, ref);
  if (res) {
    var schema = res.schema
      , root = res.root
      , baseId = res.baseId;
    var v = compileSchema.call(self, schema, root, undefined, baseId);
    self._fragments[ref] = new SchemaObject({
      ref: ref,
      fragment: true,
      schema: schema,
      root: root,
      baseId: baseId,
      validate: v
    });
    return v;
  }
}


function _getSchemaObj(self, keyRef) {
  keyRef = resolve.normalizeId(keyRef);
  return self._schemas[keyRef] || self._refs[keyRef] || self._fragments[keyRef];
}


/**
 * Remove cached schema(s).
 * If no parameter is passed all schemas but meta-schemas are removed.
 * If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
 * Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
 * @this   Ajv
 * @param  {String|Object|RegExp} schemaKeyRef key, ref, pattern to match key/ref or schema object
 * @return {Ajv} this for method chaining
 */
function removeSchema(schemaKeyRef) {
  if (schemaKeyRef instanceof RegExp) {
    _removeAllSchemas(this, this._schemas, schemaKeyRef);
    _removeAllSchemas(this, this._refs, schemaKeyRef);
    return this;
  }
  switch (typeof schemaKeyRef) {
    case 'undefined':
      _removeAllSchemas(this, this._schemas);
      _removeAllSchemas(this, this._refs);
      this._cache.clear();
      return this;
    case 'string':
      var schemaObj = _getSchemaObj(this, schemaKeyRef);
      if (schemaObj) this._cache.del(schemaObj.cacheKey);
      delete this._schemas[schemaKeyRef];
      delete this._refs[schemaKeyRef];
      return this;
    case 'object':
      var serialize = this._opts.serialize;
      var cacheKey = serialize ? serialize(schemaKeyRef) : schemaKeyRef;
      this._cache.del(cacheKey);
      var id = this._getId(schemaKeyRef);
      if (id) {
        id = resolve.normalizeId(id);
        delete this._schemas[id];
        delete this._refs[id];
      }
  }
  return this;
}


function _removeAllSchemas(self, schemas, regex) {
  for (var keyRef in schemas) {
    var schemaObj = schemas[keyRef];
    if (!schemaObj.meta && (!regex || regex.test(keyRef))) {
      self._cache.del(schemaObj.cacheKey);
      delete schemas[keyRef];
    }
  }
}


/* @this   Ajv */
function _addSchema(schema, skipValidation, meta, shouldAddSchema) {
  if (typeof schema != 'object' && typeof schema != 'boolean')
    throw new Error('schema should be object or boolean');
  var serialize = this._opts.serialize;
  var cacheKey = serialize ? serialize(schema) : schema;
  var cached = this._cache.get(cacheKey);
  if (cached) return cached;

  shouldAddSchema = shouldAddSchema || this._opts.addUsedSchema !== false;

  var id = resolve.normalizeId(this._getId(schema));
  if (id && shouldAddSchema) checkUnique(this, id);

  var willValidate = this._opts.validateSchema !== false && !skipValidation;
  var recursiveMeta;
  if (willValidate && !(recursiveMeta = id && id == resolve.normalizeId(schema.$schema)))
    this.validateSchema(schema, true);

  var localRefs = resolve.ids.call(this, schema);

  var schemaObj = new SchemaObject({
    id: id,
    schema: schema,
    localRefs: localRefs,
    cacheKey: cacheKey,
    meta: meta
  });

  if (id[0] != '#' && shouldAddSchema) this._refs[id] = schemaObj;
  this._cache.put(cacheKey, schemaObj);

  if (willValidate && recursiveMeta) this.validateSchema(schema, true);

  return schemaObj;
}


/* @this   Ajv */
function _compile(schemaObj, root) {
  if (schemaObj.compiling) {
    schemaObj.validate = callValidate;
    callValidate.schema = schemaObj.schema;
    callValidate.errors = null;
    callValidate.root = root ? root : callValidate;
    if (schemaObj.schema.$async === true)
      callValidate.$async = true;
    return callValidate;
  }
  schemaObj.compiling = true;

  var currentOpts;
  if (schemaObj.meta) {
    currentOpts = this._opts;
    this._opts = this._metaOpts;
  }

  var v;
  try { v = compileSchema.call(this, schemaObj.schema, root, schemaObj.localRefs); }
  catch(e) {
    delete schemaObj.validate;
    throw e;
  }
  finally {
    schemaObj.compiling = false;
    if (schemaObj.meta) this._opts = currentOpts;
  }

  schemaObj.validate = v;
  schemaObj.refs = v.refs;
  schemaObj.refVal = v.refVal;
  schemaObj.root = v.root;
  return v;


  /* @this   {*} - custom context, see passContext option */
  function callValidate() {
    /* jshint validthis: true */
    var _validate = schemaObj.validate;
    var result = _validate.apply(this, arguments);
    callValidate.errors = _validate.errors;
    return result;
  }
}


function chooseGetId(opts) {
  switch (opts.schemaId) {
    case 'auto': return _get$IdOrId;
    case 'id': return _getId;
    default: return _get$Id;
  }
}

/* @this   Ajv */
function _getId(schema) {
  if (schema.$id) this.logger.warn('schema $id ignored', schema.$id);
  return schema.id;
}

/* @this   Ajv */
function _get$Id(schema) {
  if (schema.id) this.logger.warn('schema id ignored', schema.id);
  return schema.$id;
}


function _get$IdOrId(schema) {
  if (schema.$id && schema.id && schema.$id != schema.id)
    throw new Error('schema $id is different from id');
  return schema.$id || schema.id;
}


/**
 * Convert array of error message objects to string
 * @this   Ajv
 * @param  {Array<Object>} errors optional array of validation errors, if not passed errors from the instance are used.
 * @param  {Object} options optional options with properties `separator` and `dataVar`.
 * @return {String} human readable string with all errors descriptions
 */
function errorsText(errors, options) {
  errors = errors || this.errors;
  if (!errors) return 'No errors';
  options = options || {};
  var separator = options.separator === undefined ? ', ' : options.separator;
  var dataVar = options.dataVar === undefined ? 'data' : options.dataVar;

  var text = '';
  for (var i=0; i<errors.length; i++) {
    var e = errors[i];
    if (e) text += dataVar + e.dataPath + ' ' + e.message + separator;
  }
  return text.slice(0, -separator.length);
}


/**
 * Add custom format
 * @this   Ajv
 * @param {String} name format name
 * @param {String|RegExp|Function} format string is converted to RegExp; function should return boolean (true when valid)
 * @return {Ajv} this for method chaining
 */
function addFormat(name, format) {
  if (typeof format == 'string') format = new RegExp(format);
  this._formats[name] = format;
  return this;
}


function addDefaultMetaSchema(self) {
  var $dataSchema;
  if (self._opts.$data) {
    $dataSchema = require('./refs/data.json');
    self.addMetaSchema($dataSchema, $dataSchema.$id, true);
  }
  if (self._opts.meta === false) return;
  var metaSchema = require('./refs/json-schema-draft-07.json');
  if (self._opts.$data) metaSchema = $dataMetaSchema(metaSchema, META_SUPPORT_DATA);
  self.addMetaSchema(metaSchema, META_SCHEMA_ID, true);
  self._refs['http://json-schema.org/schema'] = META_SCHEMA_ID;
}


function addInitialSchemas(self) {
  var optsSchemas = self._opts.schemas;
  if (!optsSchemas) return;
  if (Array.isArray(optsSchemas)) self.addSchema(optsSchemas);
  else for (var key in optsSchemas) self.addSchema(optsSchemas[key], key);
}


function addInitialFormats(self) {
  for (var name in self._opts.formats) {
    var format = self._opts.formats[name];
    self.addFormat(name, format);
  }
}


function checkUnique(self, id) {
  if (self._schemas[id] || self._refs[id])
    throw new Error('schema with key or id "' + id + '" already exists');
}


function getMetaSchemaOptions(self) {
  var metaOpts = util.copy(self._opts);
  for (var i=0; i<META_IGNORE_OPTIONS.length; i++)
    delete metaOpts[META_IGNORE_OPTIONS[i]];
  return metaOpts;
}


function setLogger(self) {
  var logger = self._opts.logger;
  if (logger === false) {
    self.logger = {log: noop, warn: noop, error: noop};
  } else {
    if (logger === undefined) logger = console;
    if (!(typeof logger == 'object' && logger.log && logger.warn && logger.error))
      throw new Error('logger must implement log, warn and error methods');
    self.logger = logger;
  }
}


function noop() {}

},{"./cache":41,"./compile":45,"./compile/async":42,"./compile/error_classes":43,"./compile/formats":44,"./compile/resolve":46,"./compile/rules":47,"./compile/schema_obj":48,"./compile/util":50,"./data":51,"./keyword":78,"./refs/data.json":79,"./refs/json-schema-draft-07.json":80,"fast-json-stable-stringify":128}],41:[function(require,module,exports){
'use strict';


var Cache = module.exports = function Cache() {
  this._cache = {};
};


Cache.prototype.put = function Cache_put(key, value) {
  this._cache[key] = value;
};


Cache.prototype.get = function Cache_get(key) {
  return this._cache[key];
};


Cache.prototype.del = function Cache_del(key) {
  delete this._cache[key];
};


Cache.prototype.clear = function Cache_clear() {
  this._cache = {};
};

},{}],42:[function(require,module,exports){
'use strict';

var MissingRefError = require('./error_classes').MissingRef;

module.exports = compileAsync;


/**
 * Creates validating function for passed schema with asynchronous loading of missing schemas.
 * `loadSchema` option should be a function that accepts schema uri and returns promise that resolves with the schema.
 * @this  Ajv
 * @param {Object}   schema schema object
 * @param {Boolean}  meta optional true to compile meta-schema; this parameter can be skipped
 * @param {Function} callback an optional node-style callback, it is called with 2 parameters: error (or null) and validating function.
 * @return {Promise} promise that resolves with a validating function.
 */
function compileAsync(schema, meta, callback) {
  /* eslint no-shadow: 0 */
  /* global Promise */
  /* jshint validthis: true */
  var self = this;
  if (typeof this._opts.loadSchema != 'function')
    throw new Error('options.loadSchema should be a function');

  if (typeof meta == 'function') {
    callback = meta;
    meta = undefined;
  }

  var p = loadMetaSchemaOf(schema).then(function () {
    var schemaObj = self._addSchema(schema, undefined, meta);
    return schemaObj.validate || _compileAsync(schemaObj);
  });

  if (callback) {
    p.then(
      function(v) { callback(null, v); },
      callback
    );
  }

  return p;


  function loadMetaSchemaOf(sch) {
    var $schema = sch.$schema;
    return $schema && !self.getSchema($schema)
            ? compileAsync.call(self, { $ref: $schema }, true)
            : Promise.resolve();
  }


  function _compileAsync(schemaObj) {
    try { return self._compile(schemaObj); }
    catch(e) {
      if (e instanceof MissingRefError) return loadMissingSchema(e);
      throw e;
    }


    function loadMissingSchema(e) {
      var ref = e.missingSchema;
      if (added(ref)) throw new Error('Schema ' + ref + ' is loaded but ' + e.missingRef + ' cannot be resolved');

      var schemaPromise = self._loadingSchemas[ref];
      if (!schemaPromise) {
        schemaPromise = self._loadingSchemas[ref] = self._opts.loadSchema(ref);
        schemaPromise.then(removePromise, removePromise);
      }

      return schemaPromise.then(function (sch) {
        if (!added(ref)) {
          return loadMetaSchemaOf(sch).then(function () {
            if (!added(ref)) self.addSchema(sch, ref, undefined, meta);
          });
        }
      }).then(function() {
        return _compileAsync(schemaObj);
      });

      function removePromise() {
        delete self._loadingSchemas[ref];
      }

      function added(ref) {
        return self._refs[ref] || self._schemas[ref];
      }
    }
  }
}

},{"./error_classes":43}],43:[function(require,module,exports){
'use strict';

var resolve = require('./resolve');

module.exports = {
  Validation: errorSubclass(ValidationError),
  MissingRef: errorSubclass(MissingRefError)
};


function ValidationError(errors) {
  this.message = 'validation failed';
  this.errors = errors;
  this.ajv = this.validation = true;
}


MissingRefError.message = function (baseId, ref) {
  return 'can\'t resolve reference ' + ref + ' from id ' + baseId;
};


function MissingRefError(baseId, ref, message) {
  this.message = message || MissingRefError.message(baseId, ref);
  this.missingRef = resolve.url(baseId, ref);
  this.missingSchema = resolve.normalizeId(resolve.fullPath(this.missingRef));
}


function errorSubclass(Subclass) {
  Subclass.prototype = Object.create(Error.prototype);
  Subclass.prototype.constructor = Subclass;
  return Subclass;
}

},{"./resolve":46}],44:[function(require,module,exports){
'use strict';

var util = require('./util');

var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
var DAYS = [0,31,28,31,30,31,30,31,31,30,31,30,31];
var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d:\d\d)?$/i;
var HOSTNAME = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*$/i;
var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
var URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
// uri-template: https://tools.ietf.org/html/rfc6570
var URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
// For the source: https://gist.github.com/dperini/729294
// For test cases: https://mathiasbynens.be/demo/url-regex
// @todo Delete current URL in favour of the commented out URL rule when this issue is fixed https://github.com/eslint/eslint/issues/7983.
// var URL = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)(?:\.(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
var URL = /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/i;
var UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
var JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
var JSON_POINTER_URI_FRAGMENT = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
var RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;


module.exports = formats;

function formats(mode) {
  mode = mode == 'full' ? 'full' : 'fast';
  return util.copy(formats[mode]);
}


formats.fast = {
  // date: http://tools.ietf.org/html/rfc3339#section-5.6
  date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
  // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
  time: /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d:\d\d)?$/i,
  'date-time': /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d:\d\d)$/i,
  // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
  uri: /^(?:[a-z][a-z0-9+-.]*:)(?:\/?\/)?[^\s]*$/i,
  'uri-reference': /^(?:(?:[a-z][a-z0-9+-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
  'uri-template': URITEMPLATE,
  url: URL,
  // email (sources from jsen validator):
  // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
  // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'willful violation')
  email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
  hostname: HOSTNAME,
  // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  // optimized http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
  ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
  regex: regex,
  // uuid: http://tools.ietf.org/html/rfc4122
  uuid: UUID,
  // JSON-pointer: https://tools.ietf.org/html/rfc6901
  // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
  'json-pointer': JSON_POINTER,
  'json-pointer-uri-fragment': JSON_POINTER_URI_FRAGMENT,
  // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
  'relative-json-pointer': RELATIVE_JSON_POINTER
};


formats.full = {
  date: date,
  time: time,
  'date-time': date_time,
  uri: uri,
  'uri-reference': URIREF,
  'uri-template': URITEMPLATE,
  url: URL,
  email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
  hostname: hostname,
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
  regex: regex,
  uuid: UUID,
  'json-pointer': JSON_POINTER,
  'json-pointer-uri-fragment': JSON_POINTER_URI_FRAGMENT,
  'relative-json-pointer': RELATIVE_JSON_POINTER
};


function isLeapYear(year) {
  // https://tools.ietf.org/html/rfc3339#appendix-C
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}


function date(str) {
  // full-date from http://tools.ietf.org/html/rfc3339#section-5.6
  var matches = str.match(DATE);
  if (!matches) return false;

  var year = +matches[1];
  var month = +matches[2];
  var day = +matches[3];

  return month >= 1 && month <= 12 && day >= 1 &&
          day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month]);
}


function time(str, full) {
  var matches = str.match(TIME);
  if (!matches) return false;

  var hour = matches[1];
  var minute = matches[2];
  var second = matches[3];
  var timeZone = matches[5];
  return ((hour <= 23 && minute <= 59 && second <= 59) ||
          (hour == 23 && minute == 59 && second == 60)) &&
         (!full || timeZone);
}


var DATE_TIME_SEPARATOR = /t|\s/i;
function date_time(str) {
  // http://tools.ietf.org/html/rfc3339#section-5.6
  var dateTime = str.split(DATE_TIME_SEPARATOR);
  return dateTime.length == 2 && date(dateTime[0]) && time(dateTime[1], true);
}


function hostname(str) {
  // https://tools.ietf.org/html/rfc1034#section-3.5
  // https://tools.ietf.org/html/rfc1123#section-2
  return str.length <= 255 && HOSTNAME.test(str);
}


var NOT_URI_FRAGMENT = /\/|:/;
function uri(str) {
  // http://jmrware.com/articles/2009/uri_regexp/URI_regex.html + optional protocol + required "."
  return NOT_URI_FRAGMENT.test(str) && URI.test(str);
}


var Z_ANCHOR = /[^\\]\\Z/;
function regex(str) {
  if (Z_ANCHOR.test(str)) return false;
  try {
    new RegExp(str);
    return true;
  } catch(e) {
    return false;
  }
}

},{"./util":50}],45:[function(require,module,exports){
'use strict';

var resolve = require('./resolve')
  , util = require('./util')
  , errorClasses = require('./error_classes')
  , stableStringify = require('fast-json-stable-stringify');

var validateGenerator = require('../dotjs/validate');

/**
 * Functions below are used inside compiled validations function
 */

var ucs2length = util.ucs2length;
var equal = require('fast-deep-equal');

// this error is thrown by async schemas to return validation errors via exception
var ValidationError = errorClasses.Validation;

module.exports = compile;


/**
 * Compiles schema to validation function
 * @this   Ajv
 * @param  {Object} schema schema object
 * @param  {Object} root object with information about the root schema for this schema
 * @param  {Object} localRefs the hash of local references inside the schema (created by resolve.id), used for inline resolution
 * @param  {String} baseId base ID for IDs in the schema
 * @return {Function} validation function
 */
function compile(schema, root, localRefs, baseId) {
  /* jshint validthis: true, evil: true */
  /* eslint no-shadow: 0 */
  var self = this
    , opts = this._opts
    , refVal = [ undefined ]
    , refs = {}
    , patterns = []
    , patternsHash = {}
    , defaults = []
    , defaultsHash = {}
    , customRules = [];

  root = root || { schema: schema, refVal: refVal, refs: refs };

  var c = checkCompiling.call(this, schema, root, baseId);
  var compilation = this._compilations[c.index];
  if (c.compiling) return (compilation.callValidate = callValidate);

  var formats = this._formats;
  var RULES = this.RULES;

  try {
    var v = localCompile(schema, root, localRefs, baseId);
    compilation.validate = v;
    var cv = compilation.callValidate;
    if (cv) {
      cv.schema = v.schema;
      cv.errors = null;
      cv.refs = v.refs;
      cv.refVal = v.refVal;
      cv.root = v.root;
      cv.$async = v.$async;
      if (opts.sourceCode) cv.source = v.source;
    }
    return v;
  } finally {
    endCompiling.call(this, schema, root, baseId);
  }

  /* @this   {*} - custom context, see passContext option */
  function callValidate() {
    /* jshint validthis: true */
    var validate = compilation.validate;
    var result = validate.apply(this, arguments);
    callValidate.errors = validate.errors;
    return result;
  }

  function localCompile(_schema, _root, localRefs, baseId) {
    var isRoot = !_root || (_root && _root.schema == _schema);
    if (_root.schema != root.schema)
      return compile.call(self, _schema, _root, localRefs, baseId);

    var $async = _schema.$async === true;

    var sourceCode = validateGenerator({
      isTop: true,
      schema: _schema,
      isRoot: isRoot,
      baseId: baseId,
      root: _root,
      schemaPath: '',
      errSchemaPath: '#',
      errorPath: '""',
      MissingRefError: errorClasses.MissingRef,
      RULES: RULES,
      validate: validateGenerator,
      util: util,
      resolve: resolve,
      resolveRef: resolveRef,
      usePattern: usePattern,
      useDefault: useDefault,
      useCustomRule: useCustomRule,
      opts: opts,
      formats: formats,
      logger: self.logger,
      self: self
    });

    sourceCode = vars(refVal, refValCode) + vars(patterns, patternCode)
                   + vars(defaults, defaultCode) + vars(customRules, customRuleCode)
                   + sourceCode;

    if (opts.processCode) sourceCode = opts.processCode(sourceCode);
    // console.log('\n\n\n *** \n', JSON.stringify(sourceCode));
    var validate;
    try {
      var makeValidate = new Function(
        'self',
        'RULES',
        'formats',
        'root',
        'refVal',
        'defaults',
        'customRules',
        'equal',
        'ucs2length',
        'ValidationError',
        sourceCode
      );

      validate = makeValidate(
        self,
        RULES,
        formats,
        root,
        refVal,
        defaults,
        customRules,
        equal,
        ucs2length,
        ValidationError
      );

      refVal[0] = validate;
    } catch(e) {
      self.logger.error('Error compiling schema, function code:', sourceCode);
      throw e;
    }

    validate.schema = _schema;
    validate.errors = null;
    validate.refs = refs;
    validate.refVal = refVal;
    validate.root = isRoot ? validate : _root;
    if ($async) validate.$async = true;
    if (opts.sourceCode === true) {
      validate.source = {
        code: sourceCode,
        patterns: patterns,
        defaults: defaults
      };
    }

    return validate;
  }

  function resolveRef(baseId, ref, isRoot) {
    ref = resolve.url(baseId, ref);
    var refIndex = refs[ref];
    var _refVal, refCode;
    if (refIndex !== undefined) {
      _refVal = refVal[refIndex];
      refCode = 'refVal[' + refIndex + ']';
      return resolvedRef(_refVal, refCode);
    }
    if (!isRoot && root.refs) {
      var rootRefId = root.refs[ref];
      if (rootRefId !== undefined) {
        _refVal = root.refVal[rootRefId];
        refCode = addLocalRef(ref, _refVal);
        return resolvedRef(_refVal, refCode);
      }
    }

    refCode = addLocalRef(ref);
    var v = resolve.call(self, localCompile, root, ref);
    if (v === undefined) {
      var localSchema = localRefs && localRefs[ref];
      if (localSchema) {
        v = resolve.inlineRef(localSchema, opts.inlineRefs)
            ? localSchema
            : compile.call(self, localSchema, root, localRefs, baseId);
      }
    }

    if (v === undefined) {
      removeLocalRef(ref);
    } else {
      replaceLocalRef(ref, v);
      return resolvedRef(v, refCode);
    }
  }

  function addLocalRef(ref, v) {
    var refId = refVal.length;
    refVal[refId] = v;
    refs[ref] = refId;
    return 'refVal' + refId;
  }

  function removeLocalRef(ref) {
    delete refs[ref];
  }

  function replaceLocalRef(ref, v) {
    var refId = refs[ref];
    refVal[refId] = v;
  }

  function resolvedRef(refVal, code) {
    return typeof refVal == 'object' || typeof refVal == 'boolean'
            ? { code: code, schema: refVal, inline: true }
            : { code: code, $async: refVal && !!refVal.$async };
  }

  function usePattern(regexStr) {
    var index = patternsHash[regexStr];
    if (index === undefined) {
      index = patternsHash[regexStr] = patterns.length;
      patterns[index] = regexStr;
    }
    return 'pattern' + index;
  }

  function useDefault(value) {
    switch (typeof value) {
      case 'boolean':
      case 'number':
        return '' + value;
      case 'string':
        return util.toQuotedString(value);
      case 'object':
        if (value === null) return 'null';
        var valueStr = stableStringify(value);
        var index = defaultsHash[valueStr];
        if (index === undefined) {
          index = defaultsHash[valueStr] = defaults.length;
          defaults[index] = value;
        }
        return 'default' + index;
    }
  }

  function useCustomRule(rule, schema, parentSchema, it) {
    if (self._opts.validateSchema !== false) {
      var deps = rule.definition.dependencies;
      if (deps && !deps.every(function(keyword) {
        return Object.prototype.hasOwnProperty.call(parentSchema, keyword);
      }))
        throw new Error('parent schema must have all required keywords: ' + deps.join(','));

      var validateSchema = rule.definition.validateSchema;
      if (validateSchema) {
        var valid = validateSchema(schema);
        if (!valid) {
          var message = 'keyword schema is invalid: ' + self.errorsText(validateSchema.errors);
          if (self._opts.validateSchema == 'log') self.logger.error(message);
          else throw new Error(message);
        }
      }
    }

    var compile = rule.definition.compile
      , inline = rule.definition.inline
      , macro = rule.definition.macro;

    var validate;
    if (compile) {
      validate = compile.call(self, schema, parentSchema, it);
    } else if (macro) {
      validate = macro.call(self, schema, parentSchema, it);
      if (opts.validateSchema !== false) self.validateSchema(validate, true);
    } else if (inline) {
      validate = inline.call(self, it, rule.keyword, schema, parentSchema);
    } else {
      validate = rule.definition.validate;
      if (!validate) return;
    }

    if (validate === undefined)
      throw new Error('custom keyword "' + rule.keyword + '"failed to compile');

    var index = customRules.length;
    customRules[index] = validate;

    return {
      code: 'customRule' + index,
      validate: validate
    };
  }
}


/**
 * Checks if the schema is currently compiled
 * @this   Ajv
 * @param  {Object} schema schema to compile
 * @param  {Object} root root object
 * @param  {String} baseId base schema ID
 * @return {Object} object with properties "index" (compilation index) and "compiling" (boolean)
 */
function checkCompiling(schema, root, baseId) {
  /* jshint validthis: true */
  var index = compIndex.call(this, schema, root, baseId);
  if (index >= 0) return { index: index, compiling: true };
  index = this._compilations.length;
  this._compilations[index] = {
    schema: schema,
    root: root,
    baseId: baseId
  };
  return { index: index, compiling: false };
}


/**
 * Removes the schema from the currently compiled list
 * @this   Ajv
 * @param  {Object} schema schema to compile
 * @param  {Object} root root object
 * @param  {String} baseId base schema ID
 */
function endCompiling(schema, root, baseId) {
  /* jshint validthis: true */
  var i = compIndex.call(this, schema, root, baseId);
  if (i >= 0) this._compilations.splice(i, 1);
}


/**
 * Index of schema compilation in the currently compiled list
 * @this   Ajv
 * @param  {Object} schema schema to compile
 * @param  {Object} root root object
 * @param  {String} baseId base schema ID
 * @return {Integer} compilation index
 */
function compIndex(schema, root, baseId) {
  /* jshint validthis: true */
  for (var i=0; i<this._compilations.length; i++) {
    var c = this._compilations[i];
    if (c.schema == schema && c.root == root && c.baseId == baseId) return i;
  }
  return -1;
}


function patternCode(i, patterns) {
  return 'var pattern' + i + ' = new RegExp(' + util.toQuotedString(patterns[i]) + ');';
}


function defaultCode(i) {
  return 'var default' + i + ' = defaults[' + i + '];';
}


function refValCode(i, refVal) {
  return refVal[i] === undefined ? '' : 'var refVal' + i + ' = refVal[' + i + '];';
}


function customRuleCode(i) {
  return 'var customRule' + i + ' = customRules[' + i + '];';
}


function vars(arr, statement) {
  if (!arr.length) return '';
  var code = '';
  for (var i=0; i<arr.length; i++)
    code += statement(i, arr);
  return code;
}

},{"../dotjs/validate":77,"./error_classes":43,"./resolve":46,"./util":50,"fast-deep-equal":127,"fast-json-stable-stringify":128}],46:[function(require,module,exports){
'use strict';

var URI = require('uri-js')
  , equal = require('fast-deep-equal')
  , util = require('./util')
  , SchemaObject = require('./schema_obj')
  , traverse = require('json-schema-traverse');

module.exports = resolve;

resolve.normalizeId = normalizeId;
resolve.fullPath = getFullPath;
resolve.url = resolveUrl;
resolve.ids = resolveIds;
resolve.inlineRef = inlineRef;
resolve.schema = resolveSchema;

/**
 * [resolve and compile the references ($ref)]
 * @this   Ajv
 * @param  {Function} compile reference to schema compilation funciton (localCompile)
 * @param  {Object} root object with information about the root schema for the current schema
 * @param  {String} ref reference to resolve
 * @return {Object|Function} schema object (if the schema can be inlined) or validation function
 */
function resolve(compile, root, ref) {
  /* jshint validthis: true */
  var refVal = this._refs[ref];
  if (typeof refVal == 'string') {
    if (this._refs[refVal]) refVal = this._refs[refVal];
    else return resolve.call(this, compile, root, refVal);
  }

  refVal = refVal || this._schemas[ref];
  if (refVal instanceof SchemaObject) {
    return inlineRef(refVal.schema, this._opts.inlineRefs)
            ? refVal.schema
            : refVal.validate || this._compile(refVal);
  }

  var res = resolveSchema.call(this, root, ref);
  var schema, v, baseId;
  if (res) {
    schema = res.schema;
    root = res.root;
    baseId = res.baseId;
  }

  if (schema instanceof SchemaObject) {
    v = schema.validate || compile.call(this, schema.schema, root, undefined, baseId);
  } else if (schema !== undefined) {
    v = inlineRef(schema, this._opts.inlineRefs)
        ? schema
        : compile.call(this, schema, root, undefined, baseId);
  }

  return v;
}


/**
 * Resolve schema, its root and baseId
 * @this Ajv
 * @param  {Object} root root object with properties schema, refVal, refs
 * @param  {String} ref  reference to resolve
 * @return {Object} object with properties schema, root, baseId
 */
function resolveSchema(root, ref) {
  /* jshint validthis: true */
  var p = URI.parse(ref)
    , refPath = _getFullPath(p)
    , baseId = getFullPath(this._getId(root.schema));
  if (Object.keys(root.schema).length === 0 || refPath !== baseId) {
    var id = normalizeId(refPath);
    var refVal = this._refs[id];
    if (typeof refVal == 'string') {
      return resolveRecursive.call(this, root, refVal, p);
    } else if (refVal instanceof SchemaObject) {
      if (!refVal.validate) this._compile(refVal);
      root = refVal;
    } else {
      refVal = this._schemas[id];
      if (refVal instanceof SchemaObject) {
        if (!refVal.validate) this._compile(refVal);
        if (id == normalizeId(ref))
          return { schema: refVal, root: root, baseId: baseId };
        root = refVal;
      } else {
        return;
      }
    }
    if (!root.schema) return;
    baseId = getFullPath(this._getId(root.schema));
  }
  return getJsonPointer.call(this, p, baseId, root.schema, root);
}


/* @this Ajv */
function resolveRecursive(root, ref, parsedRef) {
  /* jshint validthis: true */
  var res = resolveSchema.call(this, root, ref);
  if (res) {
    var schema = res.schema;
    var baseId = res.baseId;
    root = res.root;
    var id = this._getId(schema);
    if (id) baseId = resolveUrl(baseId, id);
    return getJsonPointer.call(this, parsedRef, baseId, schema, root);
  }
}


var PREVENT_SCOPE_CHANGE = util.toHash(['properties', 'patternProperties', 'enum', 'dependencies', 'definitions']);
/* @this Ajv */
function getJsonPointer(parsedRef, baseId, schema, root) {
  /* jshint validthis: true */
  parsedRef.fragment = parsedRef.fragment || '';
  if (parsedRef.fragment.slice(0,1) != '/') return;
  var parts = parsedRef.fragment.split('/');

  for (var i = 1; i < parts.length; i++) {
    var part = parts[i];
    if (part) {
      part = util.unescapeFragment(part);
      schema = schema[part];
      if (schema === undefined) break;
      var id;
      if (!PREVENT_SCOPE_CHANGE[part]) {
        id = this._getId(schema);
        if (id) baseId = resolveUrl(baseId, id);
        if (schema.$ref) {
          var $ref = resolveUrl(baseId, schema.$ref);
          var res = resolveSchema.call(this, root, $ref);
          if (res) {
            schema = res.schema;
            root = res.root;
            baseId = res.baseId;
          }
        }
      }
    }
  }
  if (schema !== undefined && schema !== root.schema)
    return { schema: schema, root: root, baseId: baseId };
}


var SIMPLE_INLINED = util.toHash([
  'type', 'format', 'pattern',
  'maxLength', 'minLength',
  'maxProperties', 'minProperties',
  'maxItems', 'minItems',
  'maximum', 'minimum',
  'uniqueItems', 'multipleOf',
  'required', 'enum'
]);
function inlineRef(schema, limit) {
  if (limit === false) return false;
  if (limit === undefined || limit === true) return checkNoRef(schema);
  else if (limit) return countKeys(schema) <= limit;
}


function checkNoRef(schema) {
  var item;
  if (Array.isArray(schema)) {
    for (var i=0; i<schema.length; i++) {
      item = schema[i];
      if (typeof item == 'object' && !checkNoRef(item)) return false;
    }
  } else {
    for (var key in schema) {
      if (key == '$ref') return false;
      item = schema[key];
      if (typeof item == 'object' && !checkNoRef(item)) return false;
    }
  }
  return true;
}


function countKeys(schema) {
  var count = 0, item;
  if (Array.isArray(schema)) {
    for (var i=0; i<schema.length; i++) {
      item = schema[i];
      if (typeof item == 'object') count += countKeys(item);
      if (count == Infinity) return Infinity;
    }
  } else {
    for (var key in schema) {
      if (key == '$ref') return Infinity;
      if (SIMPLE_INLINED[key]) {
        count++;
      } else {
        item = schema[key];
        if (typeof item == 'object') count += countKeys(item) + 1;
        if (count == Infinity) return Infinity;
      }
    }
  }
  return count;
}


function getFullPath(id, normalize) {
  if (normalize !== false) id = normalizeId(id);
  var p = URI.parse(id);
  return _getFullPath(p);
}


function _getFullPath(p) {
  return URI.serialize(p).split('#')[0] + '#';
}


var TRAILING_SLASH_HASH = /#\/?$/;
function normalizeId(id) {
  return id ? id.replace(TRAILING_SLASH_HASH, '') : '';
}


function resolveUrl(baseId, id) {
  id = normalizeId(id);
  return URI.resolve(baseId, id);
}


/* @this Ajv */
function resolveIds(schema) {
  var schemaId = normalizeId(this._getId(schema));
  var baseIds = {'': schemaId};
  var fullPaths = {'': getFullPath(schemaId, false)};
  var localRefs = {};
  var self = this;

  traverse(schema, {allKeys: true}, function(sch, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
    if (jsonPtr === '') return;
    var id = self._getId(sch);
    var baseId = baseIds[parentJsonPtr];
    var fullPath = fullPaths[parentJsonPtr] + '/' + parentKeyword;
    if (keyIndex !== undefined)
      fullPath += '/' + (typeof keyIndex == 'number' ? keyIndex : util.escapeFragment(keyIndex));

    if (typeof id == 'string') {
      id = baseId = normalizeId(baseId ? URI.resolve(baseId, id) : id);

      var refVal = self._refs[id];
      if (typeof refVal == 'string') refVal = self._refs[refVal];
      if (refVal && refVal.schema) {
        if (!equal(sch, refVal.schema))
          throw new Error('id "' + id + '" resolves to more than one schema');
      } else if (id != normalizeId(fullPath)) {
        if (id[0] == '#') {
          if (localRefs[id] && !equal(sch, localRefs[id]))
            throw new Error('id "' + id + '" resolves to more than one schema');
          localRefs[id] = sch;
        } else {
          self._refs[id] = fullPath;
        }
      }
    }
    baseIds[jsonPtr] = baseId;
    fullPaths[jsonPtr] = fullPath;
  });

  return localRefs;
}

},{"./schema_obj":48,"./util":50,"fast-deep-equal":127,"json-schema-traverse":151,"uri-js":231}],47:[function(require,module,exports){
'use strict';

var ruleModules = require('../dotjs')
  , toHash = require('./util').toHash;

module.exports = function rules() {
  var RULES = [
    { type: 'number',
      rules: [ { 'maximum': ['exclusiveMaximum'] },
               { 'minimum': ['exclusiveMinimum'] }, 'multipleOf', 'format'] },
    { type: 'string',
      rules: [ 'maxLength', 'minLength', 'pattern', 'format' ] },
    { type: 'array',
      rules: [ 'maxItems', 'minItems', 'items', 'contains', 'uniqueItems' ] },
    { type: 'object',
      rules: [ 'maxProperties', 'minProperties', 'required', 'dependencies', 'propertyNames',
               { 'properties': ['additionalProperties', 'patternProperties'] } ] },
    { rules: [ '$ref', 'const', 'enum', 'not', 'anyOf', 'oneOf', 'allOf', 'if' ] }
  ];

  var ALL = [ 'type', '$comment' ];
  var KEYWORDS = [
    '$schema', '$id', 'id', '$data', '$async', 'title',
    'description', 'default', 'definitions',
    'examples', 'readOnly', 'writeOnly',
    'contentMediaType', 'contentEncoding',
    'additionalItems', 'then', 'else'
  ];
  var TYPES = [ 'number', 'integer', 'string', 'array', 'object', 'boolean', 'null' ];
  RULES.all = toHash(ALL);
  RULES.types = toHash(TYPES);

  RULES.forEach(function (group) {
    group.rules = group.rules.map(function (keyword) {
      var implKeywords;
      if (typeof keyword == 'object') {
        var key = Object.keys(keyword)[0];
        implKeywords = keyword[key];
        keyword = key;
        implKeywords.forEach(function (k) {
          ALL.push(k);
          RULES.all[k] = true;
        });
      }
      ALL.push(keyword);
      var rule = RULES.all[keyword] = {
        keyword: keyword,
        code: ruleModules[keyword],
        implements: implKeywords
      };
      return rule;
    });

    RULES.all.$comment = {
      keyword: '$comment',
      code: ruleModules.$comment
    };

    if (group.type) RULES.types[group.type] = group;
  });

  RULES.keywords = toHash(ALL.concat(KEYWORDS));
  RULES.custom = {};

  return RULES;
};

},{"../dotjs":66,"./util":50}],48:[function(require,module,exports){
'use strict';

var util = require('./util');

module.exports = SchemaObject;

function SchemaObject(obj) {
  util.copy(obj, this);
}

},{"./util":50}],49:[function(require,module,exports){
'use strict';

// https://mathiasbynens.be/notes/javascript-encoding
// https://github.com/bestiejs/punycode.js - punycode.ucs2.decode
module.exports = function ucs2length(str) {
  var length = 0
    , len = str.length
    , pos = 0
    , value;
  while (pos < len) {
    length++;
    value = str.charCodeAt(pos++);
    if (value >= 0xD800 && value <= 0xDBFF && pos < len) {
      // high surrogate, and there is a next character
      value = str.charCodeAt(pos);
      if ((value & 0xFC00) == 0xDC00) pos++; // low surrogate
    }
  }
  return length;
};

},{}],50:[function(require,module,exports){
'use strict';


module.exports = {
  copy: copy,
  checkDataType: checkDataType,
  checkDataTypes: checkDataTypes,
  coerceToTypes: coerceToTypes,
  toHash: toHash,
  getProperty: getProperty,
  escapeQuotes: escapeQuotes,
  equal: require('fast-deep-equal'),
  ucs2length: require('./ucs2length'),
  varOccurences: varOccurences,
  varReplace: varReplace,
  cleanUpCode: cleanUpCode,
  finalCleanUpCode: finalCleanUpCode,
  schemaHasRules: schemaHasRules,
  schemaHasRulesExcept: schemaHasRulesExcept,
  schemaUnknownRules: schemaUnknownRules,
  toQuotedString: toQuotedString,
  getPathExpr: getPathExpr,
  getPath: getPath,
  getData: getData,
  unescapeFragment: unescapeFragment,
  unescapeJsonPointer: unescapeJsonPointer,
  escapeFragment: escapeFragment,
  escapeJsonPointer: escapeJsonPointer
};


function copy(o, to) {
  to = to || {};
  for (var key in o) to[key] = o[key];
  return to;
}


function checkDataType(dataType, data, negate) {
  var EQUAL = negate ? ' !== ' : ' === '
    , AND = negate ? ' || ' : ' && '
    , OK = negate ? '!' : ''
    , NOT = negate ? '' : '!';
  switch (dataType) {
    case 'null': return data + EQUAL + 'null';
    case 'array': return OK + 'Array.isArray(' + data + ')';
    case 'object': return '(' + OK + data + AND +
                          'typeof ' + data + EQUAL + '"object"' + AND +
                          NOT + 'Array.isArray(' + data + '))';
    case 'integer': return '(typeof ' + data + EQUAL + '"number"' + AND +
                           NOT + '(' + data + ' % 1)' +
                           AND + data + EQUAL + data + ')';
    default: return 'typeof ' + data + EQUAL + '"' + dataType + '"';
  }
}


function checkDataTypes(dataTypes, data) {
  switch (dataTypes.length) {
    case 1: return checkDataType(dataTypes[0], data, true);
    default:
      var code = '';
      var types = toHash(dataTypes);
      if (types.array && types.object) {
        code = types.null ? '(': '(!' + data + ' || ';
        code += 'typeof ' + data + ' !== "object")';
        delete types.null;
        delete types.array;
        delete types.object;
      }
      if (types.number) delete types.integer;
      for (var t in types)
        code += (code ? ' && ' : '' ) + checkDataType(t, data, true);

      return code;
  }
}


var COERCE_TO_TYPES = toHash([ 'string', 'number', 'integer', 'boolean', 'null' ]);
function coerceToTypes(optionCoerceTypes, dataTypes) {
  if (Array.isArray(dataTypes)) {
    var types = [];
    for (var i=0; i<dataTypes.length; i++) {
      var t = dataTypes[i];
      if (COERCE_TO_TYPES[t]) types[types.length] = t;
      else if (optionCoerceTypes === 'array' && t === 'array') types[types.length] = t;
    }
    if (types.length) return types;
  } else if (COERCE_TO_TYPES[dataTypes]) {
    return [dataTypes];
  } else if (optionCoerceTypes === 'array' && dataTypes === 'array') {
    return ['array'];
  }
}


function toHash(arr) {
  var hash = {};
  for (var i=0; i<arr.length; i++) hash[arr[i]] = true;
  return hash;
}


var IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
var SINGLE_QUOTE = /'|\\/g;
function getProperty(key) {
  return typeof key == 'number'
          ? '[' + key + ']'
          : IDENTIFIER.test(key)
            ? '.' + key
            : "['" + escapeQuotes(key) + "']";
}


function escapeQuotes(str) {
  return str.replace(SINGLE_QUOTE, '\\$&')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\f/g, '\\f')
            .replace(/\t/g, '\\t');
}


function varOccurences(str, dataVar) {
  dataVar += '[^0-9]';
  var matches = str.match(new RegExp(dataVar, 'g'));
  return matches ? matches.length : 0;
}


function varReplace(str, dataVar, expr) {
  dataVar += '([^0-9])';
  expr = expr.replace(/\$/g, '$$$$');
  return str.replace(new RegExp(dataVar, 'g'), expr + '$1');
}


var EMPTY_ELSE = /else\s*{\s*}/g
  , EMPTY_IF_NO_ELSE = /if\s*\([^)]+\)\s*\{\s*\}(?!\s*else)/g
  , EMPTY_IF_WITH_ELSE = /if\s*\(([^)]+)\)\s*\{\s*\}\s*else(?!\s*if)/g;
function cleanUpCode(out) {
  return out.replace(EMPTY_ELSE, '')
            .replace(EMPTY_IF_NO_ELSE, '')
            .replace(EMPTY_IF_WITH_ELSE, 'if (!($1))');
}


var ERRORS_REGEXP = /[^v.]errors/g
  , REMOVE_ERRORS = /var errors = 0;|var vErrors = null;|validate.errors = vErrors;/g
  , REMOVE_ERRORS_ASYNC = /var errors = 0;|var vErrors = null;/g
  , RETURN_VALID = 'return errors === 0;'
  , RETURN_TRUE = 'validate.errors = null; return true;'
  , RETURN_ASYNC = /if \(errors === 0\) return data;\s*else throw new ValidationError\(vErrors\);/
  , RETURN_DATA_ASYNC = 'return data;'
  , ROOTDATA_REGEXP = /[^A-Za-z_$]rootData[^A-Za-z0-9_$]/g
  , REMOVE_ROOTDATA = /if \(rootData === undefined\) rootData = data;/;

function finalCleanUpCode(out, async) {
  var matches = out.match(ERRORS_REGEXP);
  if (matches && matches.length == 2) {
    out = async
          ? out.replace(REMOVE_ERRORS_ASYNC, '')
               .replace(RETURN_ASYNC, RETURN_DATA_ASYNC)
          : out.replace(REMOVE_ERRORS, '')
               .replace(RETURN_VALID, RETURN_TRUE);
  }

  matches = out.match(ROOTDATA_REGEXP);
  if (!matches || matches.length !== 3) return out;
  return out.replace(REMOVE_ROOTDATA, '');
}


function schemaHasRules(schema, rules) {
  if (typeof schema == 'boolean') return !schema;
  for (var key in schema) if (rules[key]) return true;
}


function schemaHasRulesExcept(schema, rules, exceptKeyword) {
  if (typeof schema == 'boolean') return !schema && exceptKeyword != 'not';
  for (var key in schema) if (key != exceptKeyword && rules[key]) return true;
}


function schemaUnknownRules(schema, rules) {
  if (typeof schema == 'boolean') return;
  for (var key in schema) if (!rules[key]) return key;
}


function toQuotedString(str) {
  return '\'' + escapeQuotes(str) + '\'';
}


function getPathExpr(currentPath, expr, jsonPointers, isNumber) {
  var path = jsonPointers // false by default
              ? '\'/\' + ' + expr + (isNumber ? '' : '.replace(/~/g, \'~0\').replace(/\\//g, \'~1\')')
              : (isNumber ? '\'[\' + ' + expr + ' + \']\'' : '\'[\\\'\' + ' + expr + ' + \'\\\']\'');
  return joinPaths(currentPath, path);
}


function getPath(currentPath, prop, jsonPointers) {
  var path = jsonPointers // false by default
              ? toQuotedString('/' + escapeJsonPointer(prop))
              : toQuotedString(getProperty(prop));
  return joinPaths(currentPath, path);
}


var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function getData($data, lvl, paths) {
  var up, jsonPointer, data, matches;
  if ($data === '') return 'rootData';
  if ($data[0] == '/') {
    if (!JSON_POINTER.test($data)) throw new Error('Invalid JSON-pointer: ' + $data);
    jsonPointer = $data;
    data = 'rootData';
  } else {
    matches = $data.match(RELATIVE_JSON_POINTER);
    if (!matches) throw new Error('Invalid JSON-pointer: ' + $data);
    up = +matches[1];
    jsonPointer = matches[2];
    if (jsonPointer == '#') {
      if (up >= lvl) throw new Error('Cannot access property/index ' + up + ' levels up, current level is ' + lvl);
      return paths[lvl - up];
    }

    if (up > lvl) throw new Error('Cannot access data ' + up + ' levels up, current level is ' + lvl);
    data = 'data' + ((lvl - up) || '');
    if (!jsonPointer) return data;
  }

  var expr = data;
  var segments = jsonPointer.split('/');
  for (var i=0; i<segments.length; i++) {
    var segment = segments[i];
    if (segment) {
      data += getProperty(unescapeJsonPointer(segment));
      expr += ' && ' + data;
    }
  }
  return expr;
}


function joinPaths (a, b) {
  if (a == '""') return b;
  return (a + ' + ' + b).replace(/' \+ '/g, '');
}


function unescapeFragment(str) {
  return unescapeJsonPointer(decodeURIComponent(str));
}


function escapeFragment(str) {
  return encodeURIComponent(escapeJsonPointer(str));
}


function escapeJsonPointer(str) {
  return str.replace(/~/g, '~0').replace(/\//g, '~1');
}


function unescapeJsonPointer(str) {
  return str.replace(/~1/g, '/').replace(/~0/g, '~');
}

},{"./ucs2length":49,"fast-deep-equal":127}],51:[function(require,module,exports){
'use strict';

var KEYWORDS = [
  'multipleOf',
  'maximum',
  'exclusiveMaximum',
  'minimum',
  'exclusiveMinimum',
  'maxLength',
  'minLength',
  'pattern',
  'additionalItems',
  'maxItems',
  'minItems',
  'uniqueItems',
  'maxProperties',
  'minProperties',
  'required',
  'additionalProperties',
  'enum',
  'format',
  'const'
];

module.exports = function (metaSchema, keywordsJsonPointers) {
  for (var i=0; i<keywordsJsonPointers.length; i++) {
    metaSchema = JSON.parse(JSON.stringify(metaSchema));
    var segments = keywordsJsonPointers[i].split('/');
    var keywords = metaSchema;
    var j;
    for (j=1; j<segments.length; j++)
      keywords = keywords[segments[j]];

    for (j=0; j<KEYWORDS.length; j++) {
      var key = KEYWORDS[j];
      var schema = keywords[key];
      if (schema) {
        keywords[key] = {
          anyOf: [
            schema,
            { $ref: 'https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/data.json#' }
          ]
        };
      }
    }
  }

  return metaSchema;
};

},{}],52:[function(require,module,exports){
'use strict';
module.exports = function generate__limit(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $errorKeyword;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $isMax = $keyword == 'maximum',
    $exclusiveKeyword = $isMax ? 'exclusiveMaximum' : 'exclusiveMinimum',
    $schemaExcl = it.schema[$exclusiveKeyword],
    $isDataExcl = it.opts.$data && $schemaExcl && $schemaExcl.$data,
    $op = $isMax ? '<' : '>',
    $notOp = $isMax ? '>' : '<',
    $errorKeyword = undefined;
  if ($isDataExcl) {
    var $schemaValueExcl = it.util.getData($schemaExcl.$data, $dataLvl, it.dataPathArr),
      $exclusive = 'exclusive' + $lvl,
      $exclType = 'exclType' + $lvl,
      $exclIsNumber = 'exclIsNumber' + $lvl,
      $opExpr = 'op' + $lvl,
      $opStr = '\' + ' + $opExpr + ' + \'';
    out += ' var schemaExcl' + ($lvl) + ' = ' + ($schemaValueExcl) + '; ';
    $schemaValueExcl = 'schemaExcl' + $lvl;
    out += ' var ' + ($exclusive) + '; var ' + ($exclType) + ' = typeof ' + ($schemaValueExcl) + '; if (' + ($exclType) + ' != \'boolean\' && ' + ($exclType) + ' != \'undefined\' && ' + ($exclType) + ' != \'number\') { ';
    var $errorKeyword = $exclusiveKeyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = ''; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ($errorKeyword || '_exclusiveLimit') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
      if (it.opts.messages !== false) {
        out += ' , message: \'' + ($exclusiveKeyword) + ' should be boolean\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError([' + (__err) + ']); ';
      } else {
        out += ' validate.errors = [' + (__err) + ']; return false; ';
      }
    } else {
      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    }
    out += ' } else if ( ';
    if ($isData) {
      out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
    }
    out += ' ' + ($exclType) + ' == \'number\' ? ( (' + ($exclusive) + ' = ' + ($schemaValue) + ' === undefined || ' + ($schemaValueExcl) + ' ' + ($op) + '= ' + ($schemaValue) + ') ? ' + ($data) + ' ' + ($notOp) + '= ' + ($schemaValueExcl) + ' : ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' ) : ( (' + ($exclusive) + ' = ' + ($schemaValueExcl) + ' === true) ? ' + ($data) + ' ' + ($notOp) + '= ' + ($schemaValue) + ' : ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' ) || ' + ($data) + ' !== ' + ($data) + ') { var op' + ($lvl) + ' = ' + ($exclusive) + ' ? \'' + ($op) + '\' : \'' + ($op) + '=\'; ';
    if ($schema === undefined) {
      $errorKeyword = $exclusiveKeyword;
      $errSchemaPath = it.errSchemaPath + '/' + $exclusiveKeyword;
      $schemaValue = $schemaValueExcl;
      $isData = $isDataExcl;
    }
  } else {
    var $exclIsNumber = typeof $schemaExcl == 'number',
      $opStr = $op;
    if ($exclIsNumber && $isData) {
      var $opExpr = '\'' + $opStr + '\'';
      out += ' if ( ';
      if ($isData) {
        out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
      }
      out += ' ( ' + ($schemaValue) + ' === undefined || ' + ($schemaExcl) + ' ' + ($op) + '= ' + ($schemaValue) + ' ? ' + ($data) + ' ' + ($notOp) + '= ' + ($schemaExcl) + ' : ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' ) || ' + ($data) + ' !== ' + ($data) + ') { ';
    } else {
      if ($exclIsNumber && $schema === undefined) {
        $exclusive = true;
        $errorKeyword = $exclusiveKeyword;
        $errSchemaPath = it.errSchemaPath + '/' + $exclusiveKeyword;
        $schemaValue = $schemaExcl;
        $notOp += '=';
      } else {
        if ($exclIsNumber) $schemaValue = Math[$isMax ? 'min' : 'max']($schemaExcl, $schema);
        if ($schemaExcl === ($exclIsNumber ? $schemaValue : true)) {
          $exclusive = true;
          $errorKeyword = $exclusiveKeyword;
          $errSchemaPath = it.errSchemaPath + '/' + $exclusiveKeyword;
          $notOp += '=';
        } else {
          $exclusive = false;
          $opStr += '=';
        }
      }
      var $opExpr = '\'' + $opStr + '\'';
      out += ' if ( ';
      if ($isData) {
        out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
      }
      out += ' ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' || ' + ($data) + ' !== ' + ($data) + ') { ';
    }
  }
  $errorKeyword = $errorKeyword || $keyword;
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ($errorKeyword || '_limit') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { comparison: ' + ($opExpr) + ', limit: ' + ($schemaValue) + ', exclusive: ' + ($exclusive) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should be ' + ($opStr) + ' ';
      if ($isData) {
        out += '\' + ' + ($schemaValue);
      } else {
        out += '' + ($schemaValue) + '\'';
      }
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + ($schema);
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += ' } ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}

},{}],53:[function(require,module,exports){
'use strict';
module.exports = function generate__limitItems(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $errorKeyword;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $op = $keyword == 'maxItems' ? '>' : '<';
  out += 'if ( ';
  if ($isData) {
    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
  }
  out += ' ' + ($data) + '.length ' + ($op) + ' ' + ($schemaValue) + ') { ';
  var $errorKeyword = $keyword;
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ($errorKeyword || '_limitItems') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schemaValue) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should NOT have ';
      if ($keyword == 'maxItems') {
        out += 'more';
      } else {
        out += 'fewer';
      }
      out += ' than ';
      if ($isData) {
        out += '\' + ' + ($schemaValue) + ' + \'';
      } else {
        out += '' + ($schema);
      }
      out += ' items\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + ($schema);
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += '} ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}

},{}],54:[function(require,module,exports){
'use strict';
module.exports = function generate__limitLength(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $errorKeyword;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $op = $keyword == 'maxLength' ? '>' : '<';
  out += 'if ( ';
  if ($isData) {
    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
  }
  if (it.opts.unicode === false) {
    out += ' ' + ($data) + '.length ';
  } else {
    out += ' ucs2length(' + ($data) + ') ';
  }
  out += ' ' + ($op) + ' ' + ($schemaValue) + ') { ';
  var $errorKeyword = $keyword;
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ($errorKeyword || '_limitLength') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schemaValue) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should NOT be ';
      if ($keyword == 'maxLength') {
        out += 'longer';
      } else {
        out += 'shorter';
      }
      out += ' than ';
      if ($isData) {
        out += '\' + ' + ($schemaValue) + ' + \'';
      } else {
        out += '' + ($schema);
      }
      out += ' characters\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + ($schema);
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += '} ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}

},{}],55:[function(require,module,exports){
'use strict';
module.exports = function generate__limitProperties(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $errorKeyword;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $op = $keyword == 'maxProperties' ? '>' : '<';
  out += 'if ( ';
  if ($isData) {
    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
  }
  out += ' Object.keys(' + ($data) + ').length ' + ($op) + ' ' + ($schemaValue) + ') { ';
  var $errorKeyword = $keyword;
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ($errorKeyword || '_limitProperties') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schemaValue) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should NOT have ';
      if ($keyword == 'maxProperties') {
        out += 'more';
      } else {
        out += 'fewer';
      }
      out += ' than ';
      if ($isData) {
        out += '\' + ' + ($schemaValue) + ' + \'';
      } else {
        out += '' + ($schema);
      }
      out += ' properties\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + ($schema);
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += '} ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}

},{}],56:[function(require,module,exports){
'use strict';
module.exports = function generate_allOf(it, $keyword, $ruleType) {
  var out = ' ';
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $currentBaseId = $it.baseId,
    $allSchemasEmpty = true;
  var arr1 = $schema;
  if (arr1) {
    var $sch, $i = -1,
      l1 = arr1.length - 1;
    while ($i < l1) {
      $sch = arr1[$i += 1];
      if (it.util.schemaHasRules($sch, it.RULES.all)) {
        $allSchemasEmpty = false;
        $it.schema = $sch;
        $it.schemaPath = $schemaPath + '[' + $i + ']';
        $it.errSchemaPath = $errSchemaPath + '/' + $i;
        out += '  ' + (it.validate($it)) + ' ';
        $it.baseId = $currentBaseId;
        if ($breakOnError) {
          out += ' if (' + ($nextValid) + ') { ';
          $closingBraces += '}';
        }
      }
    }
  }
  if ($breakOnError) {
    if ($allSchemasEmpty) {
      out += ' if (true) { ';
    } else {
      out += ' ' + ($closingBraces.slice(0, -1)) + ' ';
    }
  }
  out = it.util.cleanUpCode(out);
  return out;
}

},{}],57:[function(require,module,exports){
'use strict';
module.exports = function generate_anyOf(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $noEmptySchema = $schema.every(function($sch) {
    return it.util.schemaHasRules($sch, it.RULES.all);
  });
  if ($noEmptySchema) {
    var $currentBaseId = $it.baseId;
    out += ' var ' + ($errs) + ' = errors; var ' + ($valid) + ' = false;  ';
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    var arr1 = $schema;
    if (arr1) {
      var $sch, $i = -1,
        l1 = arr1.length - 1;
      while ($i < l1) {
        $sch = arr1[$i += 1];
        $it.schema = $sch;
        $it.schemaPath = $schemaPath + '[' + $i + ']';
        $it.errSchemaPath = $errSchemaPath + '/' + $i;
        out += '  ' + (it.validate($it)) + ' ';
        $it.baseId = $currentBaseId;
        out += ' ' + ($valid) + ' = ' + ($valid) + ' || ' + ($nextValid) + '; if (!' + ($valid) + ') { ';
        $closingBraces += '}';
      }
    }
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += ' ' + ($closingBraces) + ' if (!' + ($valid) + ') {   var err =   '; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('anyOf') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should match some schema in anyOf\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError(vErrors); ';
      } else {
        out += ' validate.errors = vErrors; return false; ';
      }
    }
    out += ' } else {  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; } ';
    if (it.opts.allErrors) {
      out += ' } ';
    }
    out = it.util.cleanUpCode(out);
  } else {
    if ($breakOnError) {
      out += ' if (true) { ';
    }
  }
  return out;
}

},{}],58:[function(require,module,exports){
'use strict';
module.exports = function generate_comment(it, $keyword, $ruleType) {
  var out = ' ';
  var $schema = it.schema[$keyword];
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $comment = it.util.toQuotedString($schema);
  if (it.opts.$comment === true) {
    out += ' console.log(' + ($comment) + ');';
  } else if (typeof it.opts.$comment == 'function') {
    out += ' self._opts.$comment(' + ($comment) + ', ' + (it.util.toQuotedString($errSchemaPath)) + ', validate.root.schema);';
  }
  return out;
}

},{}],59:[function(require,module,exports){
'use strict';
module.exports = function generate_const(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  if (!$isData) {
    out += ' var schema' + ($lvl) + ' = validate.schema' + ($schemaPath) + ';';
  }
  out += 'var ' + ($valid) + ' = equal(' + ($data) + ', schema' + ($lvl) + '); if (!' + ($valid) + ') {   ';
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('const') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { allowedValue: schema' + ($lvl) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should be equal to constant\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += ' }';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}

},{}],60:[function(require,module,exports){
'use strict';
module.exports = function generate_contains(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $idx = 'i' + $lvl,
    $dataNxt = $it.dataLevel = it.dataLevel + 1,
    $nextData = 'data' + $dataNxt,
    $currentBaseId = it.baseId,
    $nonEmptySchema = it.util.schemaHasRules($schema, it.RULES.all);
  out += 'var ' + ($errs) + ' = errors;var ' + ($valid) + ';';
  if ($nonEmptySchema) {
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    $it.schema = $schema;
    $it.schemaPath = $schemaPath;
    $it.errSchemaPath = $errSchemaPath;
    out += ' var ' + ($nextValid) + ' = false; for (var ' + ($idx) + ' = 0; ' + ($idx) + ' < ' + ($data) + '.length; ' + ($idx) + '++) { ';
    $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
    var $passData = $data + '[' + $idx + ']';
    $it.dataPathArr[$dataNxt] = $idx;
    var $code = it.validate($it);
    $it.baseId = $currentBaseId;
    if (it.util.varOccurences($code, $nextData) < 2) {
      out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
    } else {
      out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
    }
    out += ' if (' + ($nextValid) + ') break; }  ';
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += ' ' + ($closingBraces) + ' if (!' + ($nextValid) + ') {';
  } else {
    out += ' if (' + ($data) + '.length == 0) {';
  }
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('contains') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should contain a valid item\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += ' } else { ';
  if ($nonEmptySchema) {
    out += '  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; } ';
  }
  if (it.opts.allErrors) {
    out += ' } ';
  }
  out = it.util.cleanUpCode(out);
  return out;
}

},{}],61:[function(require,module,exports){
'use strict';
module.exports = function generate_custom(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $errorKeyword;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $rule = this,
    $definition = 'definition' + $lvl,
    $rDef = $rule.definition,
    $closingBraces = '';
  var $compile, $inline, $macro, $ruleValidate, $validateCode;
  if ($isData && $rDef.$data) {
    $validateCode = 'keywordValidate' + $lvl;
    var $validateSchema = $rDef.validateSchema;
    out += ' var ' + ($definition) + ' = RULES.custom[\'' + ($keyword) + '\'].definition; var ' + ($validateCode) + ' = ' + ($definition) + '.validate;';
  } else {
    $ruleValidate = it.useCustomRule($rule, $schema, it.schema, it);
    if (!$ruleValidate) return;
    $schemaValue = 'validate.schema' + $schemaPath;
    $validateCode = $ruleValidate.code;
    $compile = $rDef.compile;
    $inline = $rDef.inline;
    $macro = $rDef.macro;
  }
  var $ruleErrs = $validateCode + '.errors',
    $i = 'i' + $lvl,
    $ruleErr = 'ruleErr' + $lvl,
    $asyncKeyword = $rDef.async;
  if ($asyncKeyword && !it.async) throw new Error('async keyword in sync schema');
  if (!($inline || $macro)) {
    out += '' + ($ruleErrs) + ' = null;';
  }
  out += 'var ' + ($errs) + ' = errors;var ' + ($valid) + ';';
  if ($isData && $rDef.$data) {
    $closingBraces += '}';
    out += ' if (' + ($schemaValue) + ' === undefined) { ' + ($valid) + ' = true; } else { ';
    if ($validateSchema) {
      $closingBraces += '}';
      out += ' ' + ($valid) + ' = ' + ($definition) + '.validateSchema(' + ($schemaValue) + '); if (' + ($valid) + ') { ';
    }
  }
  if ($inline) {
    if ($rDef.statements) {
      out += ' ' + ($ruleValidate.validate) + ' ';
    } else {
      out += ' ' + ($valid) + ' = ' + ($ruleValidate.validate) + '; ';
    }
  } else if ($macro) {
    var $it = it.util.copy(it);
    var $closingBraces = '';
    $it.level++;
    var $nextValid = 'valid' + $it.level;
    $it.schema = $ruleValidate.validate;
    $it.schemaPath = '';
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    var $code = it.validate($it).replace(/validate\.schema/g, $validateCode);
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += ' ' + ($code);
  } else {
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = '';
    out += '  ' + ($validateCode) + '.call( ';
    if (it.opts.passContext) {
      out += 'this';
    } else {
      out += 'self';
    }
    if ($compile || $rDef.schema === false) {
      out += ' , ' + ($data) + ' ';
    } else {
      out += ' , ' + ($schemaValue) + ' , ' + ($data) + ' , validate.schema' + (it.schemaPath) + ' ';
    }
    out += ' , (dataPath || \'\')';
    if (it.errorPath != '""') {
      out += ' + ' + (it.errorPath);
    }
    var $parentData = $dataLvl ? 'data' + (($dataLvl - 1) || '') : 'parentData',
      $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : 'parentDataProperty';
    out += ' , ' + ($parentData) + ' , ' + ($parentDataProperty) + ' , rootData )  ';
    var def_callRuleValidate = out;
    out = $$outStack.pop();
    if ($rDef.errors === false) {
      out += ' ' + ($valid) + ' = ';
      if ($asyncKeyword) {
        out += 'await ';
      }
      out += '' + (def_callRuleValidate) + '; ';
    } else {
      if ($asyncKeyword) {
        $ruleErrs = 'customErrors' + $lvl;
        out += ' var ' + ($ruleErrs) + ' = null; try { ' + ($valid) + ' = await ' + (def_callRuleValidate) + '; } catch (e) { ' + ($valid) + ' = false; if (e instanceof ValidationError) ' + ($ruleErrs) + ' = e.errors; else throw e; } ';
      } else {
        out += ' ' + ($ruleErrs) + ' = null; ' + ($valid) + ' = ' + (def_callRuleValidate) + '; ';
      }
    }
  }
  if ($rDef.modifying) {
    out += ' if (' + ($parentData) + ') ' + ($data) + ' = ' + ($parentData) + '[' + ($parentDataProperty) + '];';
  }
  out += '' + ($closingBraces);
  if ($rDef.valid) {
    if ($breakOnError) {
      out += ' if (true) { ';
    }
  } else {
    out += ' if ( ';
    if ($rDef.valid === undefined) {
      out += ' !';
      if ($macro) {
        out += '' + ($nextValid);
      } else {
        out += '' + ($valid);
      }
    } else {
      out += ' ' + (!$rDef.valid) + ' ';
    }
    out += ') { ';
    $errorKeyword = $rule.keyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = '';
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = ''; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ($errorKeyword || 'custom') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { keyword: \'' + ($rule.keyword) + '\' } ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should pass "' + ($rule.keyword) + '" keyword validation\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError([' + (__err) + ']); ';
      } else {
        out += ' validate.errors = [' + (__err) + ']; return false; ';
      }
    } else {
      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    }
    var def_customError = out;
    out = $$outStack.pop();
    if ($inline) {
      if ($rDef.errors) {
        if ($rDef.errors != 'full') {
          out += '  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + '; if (' + ($ruleErr) + '.schemaPath === undefined) { ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '"; } ';
          if (it.opts.verbose) {
            out += ' ' + ($ruleErr) + '.schema = ' + ($schemaValue) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
          }
          out += ' } ';
        }
      } else {
        if ($rDef.errors === false) {
          out += ' ' + (def_customError) + ' ';
        } else {
          out += ' if (' + ($errs) + ' == errors) { ' + (def_customError) + ' } else {  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + '; if (' + ($ruleErr) + '.schemaPath === undefined) { ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '"; } ';
          if (it.opts.verbose) {
            out += ' ' + ($ruleErr) + '.schema = ' + ($schemaValue) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
          }
          out += ' } } ';
        }
      }
    } else if ($macro) {
      out += '   var err =   '; /* istanbul ignore else */
      if (it.createErrors !== false) {
        out += ' { keyword: \'' + ($errorKeyword || 'custom') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { keyword: \'' + ($rule.keyword) + '\' } ';
        if (it.opts.messages !== false) {
          out += ' , message: \'should pass "' + ($rule.keyword) + '" keyword validation\' ';
        }
        if (it.opts.verbose) {
          out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
        }
        out += ' } ';
      } else {
        out += ' {} ';
      }
      out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
      if (!it.compositeRule && $breakOnError) {
        /* istanbul ignore if */
        if (it.async) {
          out += ' throw new ValidationError(vErrors); ';
        } else {
          out += ' validate.errors = vErrors; return false; ';
        }
      }
    } else {
      if ($rDef.errors === false) {
        out += ' ' + (def_customError) + ' ';
      } else {
        out += ' if (Array.isArray(' + ($ruleErrs) + ')) { if (vErrors === null) vErrors = ' + ($ruleErrs) + '; else vErrors = vErrors.concat(' + ($ruleErrs) + '); errors = vErrors.length;  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + ';  ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '";  ';
        if (it.opts.verbose) {
          out += ' ' + ($ruleErr) + '.schema = ' + ($schemaValue) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
        }
        out += ' } } else { ' + (def_customError) + ' } ';
      }
    }
    out += ' } ';
    if ($breakOnError) {
      out += ' else { ';
    }
  }
  return out;
}

},{}],62:[function(require,module,exports){
'use strict';
module.exports = function generate_dependencies(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $schemaDeps = {},
    $propertyDeps = {},
    $ownProperties = it.opts.ownProperties;
  for ($property in $schema) {
    var $sch = $schema[$property];
    var $deps = Array.isArray($sch) ? $propertyDeps : $schemaDeps;
    $deps[$property] = $sch;
  }
  out += 'var ' + ($errs) + ' = errors;';
  var $currentErrorPath = it.errorPath;
  out += 'var missing' + ($lvl) + ';';
  for (var $property in $propertyDeps) {
    $deps = $propertyDeps[$property];
    if ($deps.length) {
      out += ' if ( ' + ($data) + (it.util.getProperty($property)) + ' !== undefined ';
      if ($ownProperties) {
        out += ' && Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($property)) + '\') ';
      }
      if ($breakOnError) {
        out += ' && ( ';
        var arr1 = $deps;
        if (arr1) {
          var $propertyKey, $i = -1,
            l1 = arr1.length - 1;
          while ($i < l1) {
            $propertyKey = arr1[$i += 1];
            if ($i) {
              out += ' || ';
            }
            var $prop = it.util.getProperty($propertyKey),
              $useData = $data + $prop;
            out += ' ( ( ' + ($useData) + ' === undefined ';
            if ($ownProperties) {
              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
            }
            out += ') && (missing' + ($lvl) + ' = ' + (it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop)) + ') ) ';
          }
        }
        out += ')) {  ';
        var $propertyPath = 'missing' + $lvl,
          $missingProperty = '\' + ' + $propertyPath + ' + \'';
        if (it.opts._errorDataPathProperty) {
          it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, true) : $currentErrorPath + ' + ' + $propertyPath;
        }
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ('dependencies') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { property: \'' + (it.util.escapeQuotes($property)) + '\', missingProperty: \'' + ($missingProperty) + '\', depsCount: ' + ($deps.length) + ', deps: \'' + (it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", "))) + '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'should have ';
            if ($deps.length == 1) {
              out += 'property ' + (it.util.escapeQuotes($deps[0]));
            } else {
              out += 'properties ' + (it.util.escapeQuotes($deps.join(", ")));
            }
            out += ' when property ' + (it.util.escapeQuotes($property)) + ' is present\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
      } else {
        out += ' ) { ';
        var arr2 = $deps;
        if (arr2) {
          var $propertyKey, i2 = -1,
            l2 = arr2.length - 1;
          while (i2 < l2) {
            $propertyKey = arr2[i2 += 1];
            var $prop = it.util.getProperty($propertyKey),
              $missingProperty = it.util.escapeQuotes($propertyKey),
              $useData = $data + $prop;
            if (it.opts._errorDataPathProperty) {
              it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
            }
            out += ' if ( ' + ($useData) + ' === undefined ';
            if ($ownProperties) {
              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
            }
            out += ') {  var err =   '; /* istanbul ignore else */
            if (it.createErrors !== false) {
              out += ' { keyword: \'' + ('dependencies') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { property: \'' + (it.util.escapeQuotes($property)) + '\', missingProperty: \'' + ($missingProperty) + '\', depsCount: ' + ($deps.length) + ', deps: \'' + (it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", "))) + '\' } ';
              if (it.opts.messages !== false) {
                out += ' , message: \'should have ';
                if ($deps.length == 1) {
                  out += 'property ' + (it.util.escapeQuotes($deps[0]));
                } else {
                  out += 'properties ' + (it.util.escapeQuotes($deps.join(", ")));
                }
                out += ' when property ' + (it.util.escapeQuotes($property)) + ' is present\' ';
              }
              if (it.opts.verbose) {
                out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
              }
              out += ' } ';
            } else {
              out += ' {} ';
            }
            out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ';
          }
        }
      }
      out += ' }   ';
      if ($breakOnError) {
        $closingBraces += '}';
        out += ' else { ';
      }
    }
  }
  it.errorPath = $currentErrorPath;
  var $currentBaseId = $it.baseId;
  for (var $property in $schemaDeps) {
    var $sch = $schemaDeps[$property];
    if (it.util.schemaHasRules($sch, it.RULES.all)) {
      out += ' ' + ($nextValid) + ' = true; if ( ' + ($data) + (it.util.getProperty($property)) + ' !== undefined ';
      if ($ownProperties) {
        out += ' && Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($property)) + '\') ';
      }
      out += ') { ';
      $it.schema = $sch;
      $it.schemaPath = $schemaPath + it.util.getProperty($property);
      $it.errSchemaPath = $errSchemaPath + '/' + it.util.escapeFragment($property);
      out += '  ' + (it.validate($it)) + ' ';
      $it.baseId = $currentBaseId;
      out += ' }  ';
      if ($breakOnError) {
        out += ' if (' + ($nextValid) + ') { ';
        $closingBraces += '}';
      }
    }
  }
  if ($breakOnError) {
    out += '   ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
  }
  out = it.util.cleanUpCode(out);
  return out;
}

},{}],63:[function(require,module,exports){
'use strict';
module.exports = function generate_enum(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $i = 'i' + $lvl,
    $vSchema = 'schema' + $lvl;
  if (!$isData) {
    out += ' var ' + ($vSchema) + ' = validate.schema' + ($schemaPath) + ';';
  }
  out += 'var ' + ($valid) + ';';
  if ($isData) {
    out += ' if (schema' + ($lvl) + ' === undefined) ' + ($valid) + ' = true; else if (!Array.isArray(schema' + ($lvl) + ')) ' + ($valid) + ' = false; else {';
  }
  out += '' + ($valid) + ' = false;for (var ' + ($i) + '=0; ' + ($i) + '<' + ($vSchema) + '.length; ' + ($i) + '++) if (equal(' + ($data) + ', ' + ($vSchema) + '[' + ($i) + '])) { ' + ($valid) + ' = true; break; }';
  if ($isData) {
    out += '  }  ';
  }
  out += ' if (!' + ($valid) + ') {   ';
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('enum') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { allowedValues: schema' + ($lvl) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should be equal to one of the allowed values\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += ' }';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}

},{}],64:[function(require,module,exports){
'use strict';
module.exports = function generate_format(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  if (it.opts.format === false) {
    if ($breakOnError) {
      out += ' if (true) { ';
    }
    return out;
  }
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $unknownFormats = it.opts.unknownFormats,
    $allowUnknown = Array.isArray($unknownFormats);
  if ($isData) {
    var $format = 'format' + $lvl,
      $isObject = 'isObject' + $lvl,
      $formatType = 'formatType' + $lvl;
    out += ' var ' + ($format) + ' = formats[' + ($schemaValue) + ']; var ' + ($isObject) + ' = typeof ' + ($format) + ' == \'object\' && !(' + ($format) + ' instanceof RegExp) && ' + ($format) + '.validate; var ' + ($formatType) + ' = ' + ($isObject) + ' && ' + ($format) + '.type || \'string\'; if (' + ($isObject) + ') { ';
    if (it.async) {
      out += ' var async' + ($lvl) + ' = ' + ($format) + '.async; ';
    }
    out += ' ' + ($format) + ' = ' + ($format) + '.validate; } if (  ';
    if ($isData) {
      out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'string\') || ';
    }
    out += ' (';
    if ($unknownFormats != 'ignore') {
      out += ' (' + ($schemaValue) + ' && !' + ($format) + ' ';
      if ($allowUnknown) {
        out += ' && self._opts.unknownFormats.indexOf(' + ($schemaValue) + ') == -1 ';
      }
      out += ') || ';
    }
    out += ' (' + ($format) + ' && ' + ($formatType) + ' == \'' + ($ruleType) + '\' && !(typeof ' + ($format) + ' == \'function\' ? ';
    if (it.async) {
      out += ' (async' + ($lvl) + ' ? await ' + ($format) + '(' + ($data) + ') : ' + ($format) + '(' + ($data) + ')) ';
    } else {
      out += ' ' + ($format) + '(' + ($data) + ') ';
    }
    out += ' : ' + ($format) + '.test(' + ($data) + '))))) {';
  } else {
    var $format = it.formats[$schema];
    if (!$format) {
      if ($unknownFormats == 'ignore') {
        it.logger.warn('unknown format "' + $schema + '" ignored in schema at path "' + it.errSchemaPath + '"');
        if ($breakOnError) {
          out += ' if (true) { ';
        }
        return out;
      } else if ($allowUnknown && $unknownFormats.indexOf($schema) >= 0) {
        if ($breakOnError) {
          out += ' if (true) { ';
        }
        return out;
      } else {
        throw new Error('unknown format "' + $schema + '" is used in schema at path "' + it.errSchemaPath + '"');
      }
    }
    var $isObject = typeof $format == 'object' && !($format instanceof RegExp) && $format.validate;
    var $formatType = $isObject && $format.type || 'string';
    if ($isObject) {
      var $async = $format.async === true;
      $format = $format.validate;
    }
    if ($formatType != $ruleType) {
      if ($breakOnError) {
        out += ' if (true) { ';
      }
      return out;
    }
    if ($async) {
      if (!it.async) throw new Error('async format in sync schema');
      var $formatRef = 'formats' + it.util.getProperty($schema) + '.validate';
      out += ' if (!(await ' + ($formatRef) + '(' + ($data) + '))) { ';
    } else {
      out += ' if (! ';
      var $formatRef = 'formats' + it.util.getProperty($schema);
      if ($isObject) $formatRef += '.validate';
      if (typeof $format == 'function') {
        out += ' ' + ($formatRef) + '(' + ($data) + ') ';
      } else {
        out += ' ' + ($formatRef) + '.test(' + ($data) + ') ';
      }
      out += ') { ';
    }
  }
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('format') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { format:  ';
    if ($isData) {
      out += '' + ($schemaValue);
    } else {
      out += '' + (it.util.toQuotedString($schema));
    }
    out += '  } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should match format "';
      if ($isData) {
        out += '\' + ' + ($schemaValue) + ' + \'';
      } else {
        out += '' + (it.util.escapeQuotes($schema));
      }
      out += '"\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + (it.util.toQuotedString($schema));
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += ' } ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}

},{}],65:[function(require,module,exports){
'use strict';
module.exports = function generate_if(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $thenSch = it.schema['then'],
    $elseSch = it.schema['else'],
    $thenPresent = $thenSch !== undefined && it.util.schemaHasRules($thenSch, it.RULES.all),
    $elsePresent = $elseSch !== undefined && it.util.schemaHasRules($elseSch, it.RULES.all),
    $currentBaseId = $it.baseId;
  if ($thenPresent || $elsePresent) {
    var $ifClause;
    $it.createErrors = false;
    $it.schema = $schema;
    $it.schemaPath = $schemaPath;
    $it.errSchemaPath = $errSchemaPath;
    out += ' var ' + ($errs) + ' = errors; var ' + ($valid) + ' = true;  ';
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    out += '  ' + (it.validate($it)) + ' ';
    $it.baseId = $currentBaseId;
    $it.createErrors = true;
    out += '  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; }  ';
    it.compositeRule = $it.compositeRule = $wasComposite;
    if ($thenPresent) {
      out += ' if (' + ($nextValid) + ') {  ';
      $it.schema = it.schema['then'];
      $it.schemaPath = it.schemaPath + '.then';
      $it.errSchemaPath = it.errSchemaPath + '/then';
      out += '  ' + (it.validate($it)) + ' ';
      $it.baseId = $currentBaseId;
      out += ' ' + ($valid) + ' = ' + ($nextValid) + '; ';
      if ($thenPresent && $elsePresent) {
        $ifClause = 'ifClause' + $lvl;
        out += ' var ' + ($ifClause) + ' = \'then\'; ';
      } else {
        $ifClause = '\'then\'';
      }
      out += ' } ';
      if ($elsePresent) {
        out += ' else { ';
      }
    } else {
      out += ' if (!' + ($nextValid) + ') { ';
    }
    if ($elsePresent) {
      $it.schema = it.schema['else'];
      $it.schemaPath = it.schemaPath + '.else';
      $it.errSchemaPath = it.errSchemaPath + '/else';
      out += '  ' + (it.validate($it)) + ' ';
      $it.baseId = $currentBaseId;
      out += ' ' + ($valid) + ' = ' + ($nextValid) + '; ';
      if ($thenPresent && $elsePresent) {
        $ifClause = 'ifClause' + $lvl;
        out += ' var ' + ($ifClause) + ' = \'else\'; ';
      } else {
        $ifClause = '\'else\'';
      }
      out += ' } ';
    }
    out += ' if (!' + ($valid) + ') {   var err =   '; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('if') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { failingKeyword: ' + ($ifClause) + ' } ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should match "\' + ' + ($ifClause) + ' + \'" schema\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError(vErrors); ';
      } else {
        out += ' validate.errors = vErrors; return false; ';
      }
    }
    out += ' }   ';
    if ($breakOnError) {
      out += ' else { ';
    }
    out = it.util.cleanUpCode(out);
  } else {
    if ($breakOnError) {
      out += ' if (true) { ';
    }
  }
  return out;
}

},{}],66:[function(require,module,exports){
'use strict';

//all requires must be explicit because browserify won't work with dynamic requires
module.exports = {
  '$ref': require('./ref'),
  allOf: require('./allOf'),
  anyOf: require('./anyOf'),
  '$comment': require('./comment'),
  const: require('./const'),
  contains: require('./contains'),
  dependencies: require('./dependencies'),
  'enum': require('./enum'),
  format: require('./format'),
  'if': require('./if'),
  items: require('./items'),
  maximum: require('./_limit'),
  minimum: require('./_limit'),
  maxItems: require('./_limitItems'),
  minItems: require('./_limitItems'),
  maxLength: require('./_limitLength'),
  minLength: require('./_limitLength'),
  maxProperties: require('./_limitProperties'),
  minProperties: require('./_limitProperties'),
  multipleOf: require('./multipleOf'),
  not: require('./not'),
  oneOf: require('./oneOf'),
  pattern: require('./pattern'),
  properties: require('./properties'),
  propertyNames: require('./propertyNames'),
  required: require('./required'),
  uniqueItems: require('./uniqueItems'),
  validate: require('./validate')
};

},{"./_limit":52,"./_limitItems":53,"./_limitLength":54,"./_limitProperties":55,"./allOf":56,"./anyOf":57,"./comment":58,"./const":59,"./contains":60,"./dependencies":62,"./enum":63,"./format":64,"./if":65,"./items":67,"./multipleOf":68,"./not":69,"./oneOf":70,"./pattern":71,"./properties":72,"./propertyNames":73,"./ref":74,"./required":75,"./uniqueItems":76,"./validate":77}],67:[function(require,module,exports){
'use strict';
module.exports = function generate_items(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $idx = 'i' + $lvl,
    $dataNxt = $it.dataLevel = it.dataLevel + 1,
    $nextData = 'data' + $dataNxt,
    $currentBaseId = it.baseId;
  out += 'var ' + ($errs) + ' = errors;var ' + ($valid) + ';';
  if (Array.isArray($schema)) {
    var $additionalItems = it.schema.additionalItems;
    if ($additionalItems === false) {
      out += ' ' + ($valid) + ' = ' + ($data) + '.length <= ' + ($schema.length) + '; ';
      var $currErrSchemaPath = $errSchemaPath;
      $errSchemaPath = it.errSchemaPath + '/additionalItems';
      out += '  if (!' + ($valid) + ') {   ';
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = ''; /* istanbul ignore else */
      if (it.createErrors !== false) {
        out += ' { keyword: \'' + ('additionalItems') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schema.length) + ' } ';
        if (it.opts.messages !== false) {
          out += ' , message: \'should NOT have more than ' + ($schema.length) + ' items\' ';
        }
        if (it.opts.verbose) {
          out += ' , schema: false , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
        }
        out += ' } ';
      } else {
        out += ' {} ';
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        /* istanbul ignore if */
        if (it.async) {
          out += ' throw new ValidationError([' + (__err) + ']); ';
        } else {
          out += ' validate.errors = [' + (__err) + ']; return false; ';
        }
      } else {
        out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
      }
      out += ' } ';
      $errSchemaPath = $currErrSchemaPath;
      if ($breakOnError) {
        $closingBraces += '}';
        out += ' else { ';
      }
    }
    var arr1 = $schema;
    if (arr1) {
      var $sch, $i = -1,
        l1 = arr1.length - 1;
      while ($i < l1) {
        $sch = arr1[$i += 1];
        if (it.util.schemaHasRules($sch, it.RULES.all)) {
          out += ' ' + ($nextValid) + ' = true; if (' + ($data) + '.length > ' + ($i) + ') { ';
          var $passData = $data + '[' + $i + ']';
          $it.schema = $sch;
          $it.schemaPath = $schemaPath + '[' + $i + ']';
          $it.errSchemaPath = $errSchemaPath + '/' + $i;
          $it.errorPath = it.util.getPathExpr(it.errorPath, $i, it.opts.jsonPointers, true);
          $it.dataPathArr[$dataNxt] = $i;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
          } else {
            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
          }
          out += ' }  ';
          if ($breakOnError) {
            out += ' if (' + ($nextValid) + ') { ';
            $closingBraces += '}';
          }
        }
      }
    }
    if (typeof $additionalItems == 'object' && it.util.schemaHasRules($additionalItems, it.RULES.all)) {
      $it.schema = $additionalItems;
      $it.schemaPath = it.schemaPath + '.additionalItems';
      $it.errSchemaPath = it.errSchemaPath + '/additionalItems';
      out += ' ' + ($nextValid) + ' = true; if (' + ($data) + '.length > ' + ($schema.length) + ') {  for (var ' + ($idx) + ' = ' + ($schema.length) + '; ' + ($idx) + ' < ' + ($data) + '.length; ' + ($idx) + '++) { ';
      $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
      var $passData = $data + '[' + $idx + ']';
      $it.dataPathArr[$dataNxt] = $idx;
      var $code = it.validate($it);
      $it.baseId = $currentBaseId;
      if (it.util.varOccurences($code, $nextData) < 2) {
        out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
      } else {
        out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
      }
      if ($breakOnError) {
        out += ' if (!' + ($nextValid) + ') break; ';
      }
      out += ' } }  ';
      if ($breakOnError) {
        out += ' if (' + ($nextValid) + ') { ';
        $closingBraces += '}';
      }
    }
  } else if (it.util.schemaHasRules($schema, it.RULES.all)) {
    $it.schema = $schema;
    $it.schemaPath = $schemaPath;
    $it.errSchemaPath = $errSchemaPath;
    out += '  for (var ' + ($idx) + ' = ' + (0) + '; ' + ($idx) + ' < ' + ($data) + '.length; ' + ($idx) + '++) { ';
    $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
    var $passData = $data + '[' + $idx + ']';
    $it.dataPathArr[$dataNxt] = $idx;
    var $code = it.validate($it);
    $it.baseId = $currentBaseId;
    if (it.util.varOccurences($code, $nextData) < 2) {
      out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
    } else {
      out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
    }
    if ($breakOnError) {
      out += ' if (!' + ($nextValid) + ') break; ';
    }
    out += ' }';
  }
  if ($breakOnError) {
    out += ' ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
  }
  out = it.util.cleanUpCode(out);
  return out;
}

},{}],68:[function(require,module,exports){
'use strict';
module.exports = function generate_multipleOf(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  out += 'var division' + ($lvl) + ';if (';
  if ($isData) {
    out += ' ' + ($schemaValue) + ' !== undefined && ( typeof ' + ($schemaValue) + ' != \'number\' || ';
  }
  out += ' (division' + ($lvl) + ' = ' + ($data) + ' / ' + ($schemaValue) + ', ';
  if (it.opts.multipleOfPrecision) {
    out += ' Math.abs(Math.round(division' + ($lvl) + ') - division' + ($lvl) + ') > 1e-' + (it.opts.multipleOfPrecision) + ' ';
  } else {
    out += ' division' + ($lvl) + ' !== parseInt(division' + ($lvl) + ') ';
  }
  out += ' ) ';
  if ($isData) {
    out += '  )  ';
  }
  out += ' ) {   ';
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('multipleOf') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { multipleOf: ' + ($schemaValue) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should be multiple of ';
      if ($isData) {
        out += '\' + ' + ($schemaValue);
      } else {
        out += '' + ($schemaValue) + '\'';
      }
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + ($schema);
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += '} ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}

},{}],69:[function(require,module,exports){
'use strict';
module.exports = function generate_not(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  if (it.util.schemaHasRules($schema, it.RULES.all)) {
    $it.schema = $schema;
    $it.schemaPath = $schemaPath;
    $it.errSchemaPath = $errSchemaPath;
    out += ' var ' + ($errs) + ' = errors;  ';
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    $it.createErrors = false;
    var $allErrorsOption;
    if ($it.opts.allErrors) {
      $allErrorsOption = $it.opts.allErrors;
      $it.opts.allErrors = false;
    }
    out += ' ' + (it.validate($it)) + ' ';
    $it.createErrors = true;
    if ($allErrorsOption) $it.opts.allErrors = $allErrorsOption;
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += ' if (' + ($nextValid) + ') {   ';
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = ''; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('not') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should NOT be valid\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError([' + (__err) + ']); ';
      } else {
        out += ' validate.errors = [' + (__err) + ']; return false; ';
      }
    } else {
      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    }
    out += ' } else {  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; } ';
    if (it.opts.allErrors) {
      out += ' } ';
    }
  } else {
    out += '  var err =   '; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('not') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should NOT be valid\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    if ($breakOnError) {
      out += ' if (false) { ';
    }
  }
  return out;
}

},{}],70:[function(require,module,exports){
'use strict';
module.exports = function generate_oneOf(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $currentBaseId = $it.baseId,
    $prevValid = 'prevValid' + $lvl,
    $passingSchemas = 'passingSchemas' + $lvl;
  out += 'var ' + ($errs) + ' = errors , ' + ($prevValid) + ' = false , ' + ($valid) + ' = false , ' + ($passingSchemas) + ' = null; ';
  var $wasComposite = it.compositeRule;
  it.compositeRule = $it.compositeRule = true;
  var arr1 = $schema;
  if (arr1) {
    var $sch, $i = -1,
      l1 = arr1.length - 1;
    while ($i < l1) {
      $sch = arr1[$i += 1];
      if (it.util.schemaHasRules($sch, it.RULES.all)) {
        $it.schema = $sch;
        $it.schemaPath = $schemaPath + '[' + $i + ']';
        $it.errSchemaPath = $errSchemaPath + '/' + $i;
        out += '  ' + (it.validate($it)) + ' ';
        $it.baseId = $currentBaseId;
      } else {
        out += ' var ' + ($nextValid) + ' = true; ';
      }
      if ($i) {
        out += ' if (' + ($nextValid) + ' && ' + ($prevValid) + ') { ' + ($valid) + ' = false; ' + ($passingSchemas) + ' = [' + ($passingSchemas) + ', ' + ($i) + ']; } else { ';
        $closingBraces += '}';
      }
      out += ' if (' + ($nextValid) + ') { ' + ($valid) + ' = ' + ($prevValid) + ' = true; ' + ($passingSchemas) + ' = ' + ($i) + '; }';
    }
  }
  it.compositeRule = $it.compositeRule = $wasComposite;
  out += '' + ($closingBraces) + 'if (!' + ($valid) + ') {   var err =   '; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('oneOf') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { passingSchemas: ' + ($passingSchemas) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should match exactly one schema in oneOf\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError(vErrors); ';
    } else {
      out += ' validate.errors = vErrors; return false; ';
    }
  }
  out += '} else {  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; }';
  if (it.opts.allErrors) {
    out += ' } ';
  }
  return out;
}

},{}],71:[function(require,module,exports){
'use strict';
module.exports = function generate_pattern(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $regexp = $isData ? '(new RegExp(' + $schemaValue + '))' : it.usePattern($schema);
  out += 'if ( ';
  if ($isData) {
    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'string\') || ';
  }
  out += ' !' + ($regexp) + '.test(' + ($data) + ') ) {   ';
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('pattern') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { pattern:  ';
    if ($isData) {
      out += '' + ($schemaValue);
    } else {
      out += '' + (it.util.toQuotedString($schema));
    }
    out += '  } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should match pattern "';
      if ($isData) {
        out += '\' + ' + ($schemaValue) + ' + \'';
      } else {
        out += '' + (it.util.escapeQuotes($schema));
      }
      out += '"\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + (it.util.toQuotedString($schema));
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += '} ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}

},{}],72:[function(require,module,exports){
'use strict';
module.exports = function generate_properties(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $key = 'key' + $lvl,
    $idx = 'idx' + $lvl,
    $dataNxt = $it.dataLevel = it.dataLevel + 1,
    $nextData = 'data' + $dataNxt,
    $dataProperties = 'dataProperties' + $lvl;
  var $schemaKeys = Object.keys($schema || {}),
    $pProperties = it.schema.patternProperties || {},
    $pPropertyKeys = Object.keys($pProperties),
    $aProperties = it.schema.additionalProperties,
    $someProperties = $schemaKeys.length || $pPropertyKeys.length,
    $noAdditional = $aProperties === false,
    $additionalIsSchema = typeof $aProperties == 'object' && Object.keys($aProperties).length,
    $removeAdditional = it.opts.removeAdditional,
    $checkAdditional = $noAdditional || $additionalIsSchema || $removeAdditional,
    $ownProperties = it.opts.ownProperties,
    $currentBaseId = it.baseId;
  var $required = it.schema.required;
  if ($required && !(it.opts.$data && $required.$data) && $required.length < it.opts.loopRequired) var $requiredHash = it.util.toHash($required);
  out += 'var ' + ($errs) + ' = errors;var ' + ($nextValid) + ' = true;';
  if ($ownProperties) {
    out += ' var ' + ($dataProperties) + ' = undefined;';
  }
  if ($checkAdditional) {
    if ($ownProperties) {
      out += ' ' + ($dataProperties) + ' = ' + ($dataProperties) + ' || Object.keys(' + ($data) + '); for (var ' + ($idx) + '=0; ' + ($idx) + '<' + ($dataProperties) + '.length; ' + ($idx) + '++) { var ' + ($key) + ' = ' + ($dataProperties) + '[' + ($idx) + ']; ';
    } else {
      out += ' for (var ' + ($key) + ' in ' + ($data) + ') { ';
    }
    if ($someProperties) {
      out += ' var isAdditional' + ($lvl) + ' = !(false ';
      if ($schemaKeys.length) {
        if ($schemaKeys.length > 8) {
          out += ' || validate.schema' + ($schemaPath) + '.hasOwnProperty(' + ($key) + ') ';
        } else {
          var arr1 = $schemaKeys;
          if (arr1) {
            var $propertyKey, i1 = -1,
              l1 = arr1.length - 1;
            while (i1 < l1) {
              $propertyKey = arr1[i1 += 1];
              out += ' || ' + ($key) + ' == ' + (it.util.toQuotedString($propertyKey)) + ' ';
            }
          }
        }
      }
      if ($pPropertyKeys.length) {
        var arr2 = $pPropertyKeys;
        if (arr2) {
          var $pProperty, $i = -1,
            l2 = arr2.length - 1;
          while ($i < l2) {
            $pProperty = arr2[$i += 1];
            out += ' || ' + (it.usePattern($pProperty)) + '.test(' + ($key) + ') ';
          }
        }
      }
      out += ' ); if (isAdditional' + ($lvl) + ') { ';
    }
    if ($removeAdditional == 'all') {
      out += ' delete ' + ($data) + '[' + ($key) + ']; ';
    } else {
      var $currentErrorPath = it.errorPath;
      var $additionalProperty = '\' + ' + $key + ' + \'';
      if (it.opts._errorDataPathProperty) {
        it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
      }
      if ($noAdditional) {
        if ($removeAdditional) {
          out += ' delete ' + ($data) + '[' + ($key) + ']; ';
        } else {
          out += ' ' + ($nextValid) + ' = false; ';
          var $currErrSchemaPath = $errSchemaPath;
          $errSchemaPath = it.errSchemaPath + '/additionalProperties';
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = ''; /* istanbul ignore else */
          if (it.createErrors !== false) {
            out += ' { keyword: \'' + ('additionalProperties') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { additionalProperty: \'' + ($additionalProperty) + '\' } ';
            if (it.opts.messages !== false) {
              out += ' , message: \'';
              if (it.opts._errorDataPathProperty) {
                out += 'is an invalid additional property';
              } else {
                out += 'should NOT have additional properties';
              }
              out += '\' ';
            }
            if (it.opts.verbose) {
              out += ' , schema: false , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
            }
            out += ' } ';
          } else {
            out += ' {} ';
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            /* istanbul ignore if */
            if (it.async) {
              out += ' throw new ValidationError([' + (__err) + ']); ';
            } else {
              out += ' validate.errors = [' + (__err) + ']; return false; ';
            }
          } else {
            out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
          }
          $errSchemaPath = $currErrSchemaPath;
          if ($breakOnError) {
            out += ' break; ';
          }
        }
      } else if ($additionalIsSchema) {
        if ($removeAdditional == 'failing') {
          out += ' var ' + ($errs) + ' = errors;  ';
          var $wasComposite = it.compositeRule;
          it.compositeRule = $it.compositeRule = true;
          $it.schema = $aProperties;
          $it.schemaPath = it.schemaPath + '.additionalProperties';
          $it.errSchemaPath = it.errSchemaPath + '/additionalProperties';
          $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
          var $passData = $data + '[' + $key + ']';
          $it.dataPathArr[$dataNxt] = $key;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
          } else {
            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
          }
          out += ' if (!' + ($nextValid) + ') { errors = ' + ($errs) + '; if (validate.errors !== null) { if (errors) validate.errors.length = errors; else validate.errors = null; } delete ' + ($data) + '[' + ($key) + ']; }  ';
          it.compositeRule = $it.compositeRule = $wasComposite;
        } else {
          $it.schema = $aProperties;
          $it.schemaPath = it.schemaPath + '.additionalProperties';
          $it.errSchemaPath = it.errSchemaPath + '/additionalProperties';
          $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
          var $passData = $data + '[' + $key + ']';
          $it.dataPathArr[$dataNxt] = $key;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
          } else {
            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
          }
          if ($breakOnError) {
            out += ' if (!' + ($nextValid) + ') break; ';
          }
        }
      }
      it.errorPath = $currentErrorPath;
    }
    if ($someProperties) {
      out += ' } ';
    }
    out += ' }  ';
    if ($breakOnError) {
      out += ' if (' + ($nextValid) + ') { ';
      $closingBraces += '}';
    }
  }
  var $useDefaults = it.opts.useDefaults && !it.compositeRule;
  if ($schemaKeys.length) {
    var arr3 = $schemaKeys;
    if (arr3) {
      var $propertyKey, i3 = -1,
        l3 = arr3.length - 1;
      while (i3 < l3) {
        $propertyKey = arr3[i3 += 1];
        var $sch = $schema[$propertyKey];
        if (it.util.schemaHasRules($sch, it.RULES.all)) {
          var $prop = it.util.getProperty($propertyKey),
            $passData = $data + $prop,
            $hasDefault = $useDefaults && $sch.default !== undefined;
          $it.schema = $sch;
          $it.schemaPath = $schemaPath + $prop;
          $it.errSchemaPath = $errSchemaPath + '/' + it.util.escapeFragment($propertyKey);
          $it.errorPath = it.util.getPath(it.errorPath, $propertyKey, it.opts.jsonPointers);
          $it.dataPathArr[$dataNxt] = it.util.toQuotedString($propertyKey);
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            $code = it.util.varReplace($code, $nextData, $passData);
            var $useData = $passData;
          } else {
            var $useData = $nextData;
            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ';
          }
          if ($hasDefault) {
            out += ' ' + ($code) + ' ';
          } else {
            if ($requiredHash && $requiredHash[$propertyKey]) {
              out += ' if ( ' + ($useData) + ' === undefined ';
              if ($ownProperties) {
                out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
              }
              out += ') { ' + ($nextValid) + ' = false; ';
              var $currentErrorPath = it.errorPath,
                $currErrSchemaPath = $errSchemaPath,
                $missingProperty = it.util.escapeQuotes($propertyKey);
              if (it.opts._errorDataPathProperty) {
                it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
              }
              $errSchemaPath = it.errSchemaPath + '/required';
              var $$outStack = $$outStack || [];
              $$outStack.push(out);
              out = ''; /* istanbul ignore else */
              if (it.createErrors !== false) {
                out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
                if (it.opts.messages !== false) {
                  out += ' , message: \'';
                  if (it.opts._errorDataPathProperty) {
                    out += 'is a required property';
                  } else {
                    out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
                  }
                  out += '\' ';
                }
                if (it.opts.verbose) {
                  out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
                }
                out += ' } ';
              } else {
                out += ' {} ';
              }
              var __err = out;
              out = $$outStack.pop();
              if (!it.compositeRule && $breakOnError) {
                /* istanbul ignore if */
                if (it.async) {
                  out += ' throw new ValidationError([' + (__err) + ']); ';
                } else {
                  out += ' validate.errors = [' + (__err) + ']; return false; ';
                }
              } else {
                out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
              }
              $errSchemaPath = $currErrSchemaPath;
              it.errorPath = $currentErrorPath;
              out += ' } else { ';
            } else {
              if ($breakOnError) {
                out += ' if ( ' + ($useData) + ' === undefined ';
                if ($ownProperties) {
                  out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
                }
                out += ') { ' + ($nextValid) + ' = true; } else { ';
              } else {
                out += ' if (' + ($useData) + ' !== undefined ';
                if ($ownProperties) {
                  out += ' &&   Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
                }
                out += ' ) { ';
              }
            }
            out += ' ' + ($code) + ' } ';
          }
        }
        if ($breakOnError) {
          out += ' if (' + ($nextValid) + ') { ';
          $closingBraces += '}';
        }
      }
    }
  }
  if ($pPropertyKeys.length) {
    var arr4 = $pPropertyKeys;
    if (arr4) {
      var $pProperty, i4 = -1,
        l4 = arr4.length - 1;
      while (i4 < l4) {
        $pProperty = arr4[i4 += 1];
        var $sch = $pProperties[$pProperty];
        if (it.util.schemaHasRules($sch, it.RULES.all)) {
          $it.schema = $sch;
          $it.schemaPath = it.schemaPath + '.patternProperties' + it.util.getProperty($pProperty);
          $it.errSchemaPath = it.errSchemaPath + '/patternProperties/' + it.util.escapeFragment($pProperty);
          if ($ownProperties) {
            out += ' ' + ($dataProperties) + ' = ' + ($dataProperties) + ' || Object.keys(' + ($data) + '); for (var ' + ($idx) + '=0; ' + ($idx) + '<' + ($dataProperties) + '.length; ' + ($idx) + '++) { var ' + ($key) + ' = ' + ($dataProperties) + '[' + ($idx) + ']; ';
          } else {
            out += ' for (var ' + ($key) + ' in ' + ($data) + ') { ';
          }
          out += ' if (' + (it.usePattern($pProperty)) + '.test(' + ($key) + ')) { ';
          $it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
          var $passData = $data + '[' + $key + ']';
          $it.dataPathArr[$dataNxt] = $key;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
          } else {
            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
          }
          if ($breakOnError) {
            out += ' if (!' + ($nextValid) + ') break; ';
          }
          out += ' } ';
          if ($breakOnError) {
            out += ' else ' + ($nextValid) + ' = true; ';
          }
          out += ' }  ';
          if ($breakOnError) {
            out += ' if (' + ($nextValid) + ') { ';
            $closingBraces += '}';
          }
        }
      }
    }
  }
  if ($breakOnError) {
    out += ' ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
  }
  out = it.util.cleanUpCode(out);
  return out;
}

},{}],73:[function(require,module,exports){
'use strict';
module.exports = function generate_propertyNames(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  out += 'var ' + ($errs) + ' = errors;';
  if (it.util.schemaHasRules($schema, it.RULES.all)) {
    $it.schema = $schema;
    $it.schemaPath = $schemaPath;
    $it.errSchemaPath = $errSchemaPath;
    var $key = 'key' + $lvl,
      $idx = 'idx' + $lvl,
      $i = 'i' + $lvl,
      $invalidName = '\' + ' + $key + ' + \'',
      $dataNxt = $it.dataLevel = it.dataLevel + 1,
      $nextData = 'data' + $dataNxt,
      $dataProperties = 'dataProperties' + $lvl,
      $ownProperties = it.opts.ownProperties,
      $currentBaseId = it.baseId;
    if ($ownProperties) {
      out += ' var ' + ($dataProperties) + ' = undefined; ';
    }
    if ($ownProperties) {
      out += ' ' + ($dataProperties) + ' = ' + ($dataProperties) + ' || Object.keys(' + ($data) + '); for (var ' + ($idx) + '=0; ' + ($idx) + '<' + ($dataProperties) + '.length; ' + ($idx) + '++) { var ' + ($key) + ' = ' + ($dataProperties) + '[' + ($idx) + ']; ';
    } else {
      out += ' for (var ' + ($key) + ' in ' + ($data) + ') { ';
    }
    out += ' var startErrs' + ($lvl) + ' = errors; ';
    var $passData = $key;
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    var $code = it.validate($it);
    $it.baseId = $currentBaseId;
    if (it.util.varOccurences($code, $nextData) < 2) {
      out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
    } else {
      out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
    }
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += ' if (!' + ($nextValid) + ') { for (var ' + ($i) + '=startErrs' + ($lvl) + '; ' + ($i) + '<errors; ' + ($i) + '++) { vErrors[' + ($i) + '].propertyName = ' + ($key) + '; }   var err =   '; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('propertyNames') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { propertyName: \'' + ($invalidName) + '\' } ';
      if (it.opts.messages !== false) {
        out += ' , message: \'property name \\\'' + ($invalidName) + '\\\' is invalid\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError(vErrors); ';
      } else {
        out += ' validate.errors = vErrors; return false; ';
      }
    }
    if ($breakOnError) {
      out += ' break; ';
    }
    out += ' } }';
  }
  if ($breakOnError) {
    out += ' ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
  }
  out = it.util.cleanUpCode(out);
  return out;
}

},{}],74:[function(require,module,exports){
'use strict';
module.exports = function generate_ref(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $async, $refCode;
  if ($schema == '#' || $schema == '#/') {
    if (it.isRoot) {
      $async = it.async;
      $refCode = 'validate';
    } else {
      $async = it.root.schema.$async === true;
      $refCode = 'root.refVal[0]';
    }
  } else {
    var $refVal = it.resolveRef(it.baseId, $schema, it.isRoot);
    if ($refVal === undefined) {
      var $message = it.MissingRefError.message(it.baseId, $schema);
      if (it.opts.missingRefs == 'fail') {
        it.logger.error($message);
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ('$ref') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { ref: \'' + (it.util.escapeQuotes($schema)) + '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'can\\\'t resolve reference ' + (it.util.escapeQuotes($schema)) + '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: ' + (it.util.toQuotedString($schema)) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
        if ($breakOnError) {
          out += ' if (false) { ';
        }
      } else if (it.opts.missingRefs == 'ignore') {
        it.logger.warn($message);
        if ($breakOnError) {
          out += ' if (true) { ';
        }
      } else {
        throw new it.MissingRefError(it.baseId, $schema, $message);
      }
    } else if ($refVal.inline) {
      var $it = it.util.copy(it);
      $it.level++;
      var $nextValid = 'valid' + $it.level;
      $it.schema = $refVal.schema;
      $it.schemaPath = '';
      $it.errSchemaPath = $schema;
      var $code = it.validate($it).replace(/validate\.schema/g, $refVal.code);
      out += ' ' + ($code) + ' ';
      if ($breakOnError) {
        out += ' if (' + ($nextValid) + ') { ';
      }
    } else {
      $async = $refVal.$async === true || (it.async && $refVal.$async !== false);
      $refCode = $refVal.code;
    }
  }
  if ($refCode) {
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = '';
    if (it.opts.passContext) {
      out += ' ' + ($refCode) + '.call(this, ';
    } else {
      out += ' ' + ($refCode) + '( ';
    }
    out += ' ' + ($data) + ', (dataPath || \'\')';
    if (it.errorPath != '""') {
      out += ' + ' + (it.errorPath);
    }
    var $parentData = $dataLvl ? 'data' + (($dataLvl - 1) || '') : 'parentData',
      $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : 'parentDataProperty';
    out += ' , ' + ($parentData) + ' , ' + ($parentDataProperty) + ', rootData)  ';
    var __callValidate = out;
    out = $$outStack.pop();
    if ($async) {
      if (!it.async) throw new Error('async schema referenced by sync schema');
      if ($breakOnError) {
        out += ' var ' + ($valid) + '; ';
      }
      out += ' try { await ' + (__callValidate) + '; ';
      if ($breakOnError) {
        out += ' ' + ($valid) + ' = true; ';
      }
      out += ' } catch (e) { if (!(e instanceof ValidationError)) throw e; if (vErrors === null) vErrors = e.errors; else vErrors = vErrors.concat(e.errors); errors = vErrors.length; ';
      if ($breakOnError) {
        out += ' ' + ($valid) + ' = false; ';
      }
      out += ' } ';
      if ($breakOnError) {
        out += ' if (' + ($valid) + ') { ';
      }
    } else {
      out += ' if (!' + (__callValidate) + ') { if (vErrors === null) vErrors = ' + ($refCode) + '.errors; else vErrors = vErrors.concat(' + ($refCode) + '.errors); errors = vErrors.length; } ';
      if ($breakOnError) {
        out += ' else { ';
      }
    }
  }
  return out;
}

},{}],75:[function(require,module,exports){
'use strict';
module.exports = function generate_required(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $vSchema = 'schema' + $lvl;
  if (!$isData) {
    if ($schema.length < it.opts.loopRequired && it.schema.properties && Object.keys(it.schema.properties).length) {
      var $required = [];
      var arr1 = $schema;
      if (arr1) {
        var $property, i1 = -1,
          l1 = arr1.length - 1;
        while (i1 < l1) {
          $property = arr1[i1 += 1];
          var $propertySch = it.schema.properties[$property];
          if (!($propertySch && it.util.schemaHasRules($propertySch, it.RULES.all))) {
            $required[$required.length] = $property;
          }
        }
      }
    } else {
      var $required = $schema;
    }
  }
  if ($isData || $required.length) {
    var $currentErrorPath = it.errorPath,
      $loopRequired = $isData || $required.length >= it.opts.loopRequired,
      $ownProperties = it.opts.ownProperties;
    if ($breakOnError) {
      out += ' var missing' + ($lvl) + '; ';
      if ($loopRequired) {
        if (!$isData) {
          out += ' var ' + ($vSchema) + ' = validate.schema' + ($schemaPath) + '; ';
        }
        var $i = 'i' + $lvl,
          $propertyPath = 'schema' + $lvl + '[' + $i + ']',
          $missingProperty = '\' + ' + $propertyPath + ' + \'';
        if (it.opts._errorDataPathProperty) {
          it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers);
        }
        out += ' var ' + ($valid) + ' = true; ';
        if ($isData) {
          out += ' if (schema' + ($lvl) + ' === undefined) ' + ($valid) + ' = true; else if (!Array.isArray(schema' + ($lvl) + ')) ' + ($valid) + ' = false; else {';
        }
        out += ' for (var ' + ($i) + ' = 0; ' + ($i) + ' < ' + ($vSchema) + '.length; ' + ($i) + '++) { ' + ($valid) + ' = ' + ($data) + '[' + ($vSchema) + '[' + ($i) + ']] !== undefined ';
        if ($ownProperties) {
          out += ' &&   Object.prototype.hasOwnProperty.call(' + ($data) + ', ' + ($vSchema) + '[' + ($i) + ']) ';
        }
        out += '; if (!' + ($valid) + ') break; } ';
        if ($isData) {
          out += '  }  ';
        }
        out += '  if (!' + ($valid) + ') {   ';
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'';
            if (it.opts._errorDataPathProperty) {
              out += 'is a required property';
            } else {
              out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
            }
            out += '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
        out += ' } else { ';
      } else {
        out += ' if ( ';
        var arr2 = $required;
        if (arr2) {
          var $propertyKey, $i = -1,
            l2 = arr2.length - 1;
          while ($i < l2) {
            $propertyKey = arr2[$i += 1];
            if ($i) {
              out += ' || ';
            }
            var $prop = it.util.getProperty($propertyKey),
              $useData = $data + $prop;
            out += ' ( ( ' + ($useData) + ' === undefined ';
            if ($ownProperties) {
              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
            }
            out += ') && (missing' + ($lvl) + ' = ' + (it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop)) + ') ) ';
          }
        }
        out += ') {  ';
        var $propertyPath = 'missing' + $lvl,
          $missingProperty = '\' + ' + $propertyPath + ' + \'';
        if (it.opts._errorDataPathProperty) {
          it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, true) : $currentErrorPath + ' + ' + $propertyPath;
        }
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'';
            if (it.opts._errorDataPathProperty) {
              out += 'is a required property';
            } else {
              out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
            }
            out += '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
        out += ' } else { ';
      }
    } else {
      if ($loopRequired) {
        if (!$isData) {
          out += ' var ' + ($vSchema) + ' = validate.schema' + ($schemaPath) + '; ';
        }
        var $i = 'i' + $lvl,
          $propertyPath = 'schema' + $lvl + '[' + $i + ']',
          $missingProperty = '\' + ' + $propertyPath + ' + \'';
        if (it.opts._errorDataPathProperty) {
          it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers);
        }
        if ($isData) {
          out += ' if (' + ($vSchema) + ' && !Array.isArray(' + ($vSchema) + ')) {  var err =   '; /* istanbul ignore else */
          if (it.createErrors !== false) {
            out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
            if (it.opts.messages !== false) {
              out += ' , message: \'';
              if (it.opts._errorDataPathProperty) {
                out += 'is a required property';
              } else {
                out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
              }
              out += '\' ';
            }
            if (it.opts.verbose) {
              out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
            }
            out += ' } ';
          } else {
            out += ' {} ';
          }
          out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } else if (' + ($vSchema) + ' !== undefined) { ';
        }
        out += ' for (var ' + ($i) + ' = 0; ' + ($i) + ' < ' + ($vSchema) + '.length; ' + ($i) + '++) { if (' + ($data) + '[' + ($vSchema) + '[' + ($i) + ']] === undefined ';
        if ($ownProperties) {
          out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', ' + ($vSchema) + '[' + ($i) + ']) ';
        }
        out += ') {  var err =   '; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'';
            if (it.opts._errorDataPathProperty) {
              out += 'is a required property';
            } else {
              out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
            }
            out += '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } } ';
        if ($isData) {
          out += '  }  ';
        }
      } else {
        var arr3 = $required;
        if (arr3) {
          var $propertyKey, i3 = -1,
            l3 = arr3.length - 1;
          while (i3 < l3) {
            $propertyKey = arr3[i3 += 1];
            var $prop = it.util.getProperty($propertyKey),
              $missingProperty = it.util.escapeQuotes($propertyKey),
              $useData = $data + $prop;
            if (it.opts._errorDataPathProperty) {
              it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
            }
            out += ' if ( ' + ($useData) + ' === undefined ';
            if ($ownProperties) {
              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
            }
            out += ') {  var err =   '; /* istanbul ignore else */
            if (it.createErrors !== false) {
              out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
              if (it.opts.messages !== false) {
                out += ' , message: \'';
                if (it.opts._errorDataPathProperty) {
                  out += 'is a required property';
                } else {
                  out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
                }
                out += '\' ';
              }
              if (it.opts.verbose) {
                out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
              }
              out += ' } ';
            } else {
              out += ' {} ';
            }
            out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ';
          }
        }
      }
    }
    it.errorPath = $currentErrorPath;
  } else if ($breakOnError) {
    out += ' if (true) {';
  }
  return out;
}

},{}],76:[function(require,module,exports){
'use strict';
module.exports = function generate_uniqueItems(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  if (($schema || $isData) && it.opts.uniqueItems !== false) {
    if ($isData) {
      out += ' var ' + ($valid) + '; if (' + ($schemaValue) + ' === false || ' + ($schemaValue) + ' === undefined) ' + ($valid) + ' = true; else if (typeof ' + ($schemaValue) + ' != \'boolean\') ' + ($valid) + ' = false; else { ';
    }
    out += ' var i = ' + ($data) + '.length , ' + ($valid) + ' = true , j; if (i > 1) { ';
    var $itemType = it.schema.items && it.schema.items.type,
      $typeIsArray = Array.isArray($itemType);
    if (!$itemType || $itemType == 'object' || $itemType == 'array' || ($typeIsArray && ($itemType.indexOf('object') >= 0 || $itemType.indexOf('array') >= 0))) {
      out += ' outer: for (;i--;) { for (j = i; j--;) { if (equal(' + ($data) + '[i], ' + ($data) + '[j])) { ' + ($valid) + ' = false; break outer; } } } ';
    } else {
      out += ' var itemIndices = {}, item; for (;i--;) { var item = ' + ($data) + '[i]; ';
      var $method = 'checkDataType' + ($typeIsArray ? 's' : '');
      out += ' if (' + (it.util[$method]($itemType, 'item', true)) + ') continue; ';
      if ($typeIsArray) {
        out += ' if (typeof item == \'string\') item = \'"\' + item; ';
      }
      out += ' if (typeof itemIndices[item] == \'number\') { ' + ($valid) + ' = false; j = itemIndices[item]; break; } itemIndices[item] = i; } ';
    }
    out += ' } ';
    if ($isData) {
      out += '  }  ';
    }
    out += ' if (!' + ($valid) + ') {   ';
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = ''; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('uniqueItems') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { i: i, j: j } ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should NOT have duplicate items (items ## \' + j + \' and \' + i + \' are identical)\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema:  ';
        if ($isData) {
          out += 'validate.schema' + ($schemaPath);
        } else {
          out += '' + ($schema);
        }
        out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError([' + (__err) + ']); ';
      } else {
        out += ' validate.errors = [' + (__err) + ']; return false; ';
      }
    } else {
      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    }
    out += ' } ';
    if ($breakOnError) {
      out += ' else { ';
    }
  } else {
    if ($breakOnError) {
      out += ' if (true) { ';
    }
  }
  return out;
}

},{}],77:[function(require,module,exports){
'use strict';
module.exports = function generate_validate(it, $keyword, $ruleType) {
  var out = '';
  var $async = it.schema.$async === true,
    $refKeywords = it.util.schemaHasRulesExcept(it.schema, it.RULES.all, '$ref'),
    $id = it.self._getId(it.schema);
  if (it.opts.strictKeywords) {
    var $unknownKwd = it.util.schemaUnknownRules(it.schema, it.RULES.keywords);
    if ($unknownKwd) {
      var $keywordsMsg = 'unknown keyword: ' + $unknownKwd;
      if (it.opts.strictKeywords === 'log') it.logger.warn($keywordsMsg);
      else throw new Error($keywordsMsg);
    }
  }
  if (it.isTop) {
    out += ' var validate = ';
    if ($async) {
      it.async = true;
      out += 'async ';
    }
    out += 'function(data, dataPath, parentData, parentDataProperty, rootData) { \'use strict\'; ';
    if ($id && (it.opts.sourceCode || it.opts.processCode)) {
      out += ' ' + ('/\*# sourceURL=' + $id + ' */') + ' ';
    }
  }
  if (typeof it.schema == 'boolean' || !($refKeywords || it.schema.$ref)) {
    var $keyword = 'false schema';
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = 'data' + ($dataLvl || '');
    var $valid = 'valid' + $lvl;
    if (it.schema === false) {
      if (it.isTop) {
        $breakOnError = true;
      } else {
        out += ' var ' + ($valid) + ' = false; ';
      }
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = ''; /* istanbul ignore else */
      if (it.createErrors !== false) {
        out += ' { keyword: \'' + ($errorKeyword || 'false schema') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
        if (it.opts.messages !== false) {
          out += ' , message: \'boolean schema is false\' ';
        }
        if (it.opts.verbose) {
          out += ' , schema: false , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
        }
        out += ' } ';
      } else {
        out += ' {} ';
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        /* istanbul ignore if */
        if (it.async) {
          out += ' throw new ValidationError([' + (__err) + ']); ';
        } else {
          out += ' validate.errors = [' + (__err) + ']; return false; ';
        }
      } else {
        out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
      }
    } else {
      if (it.isTop) {
        if ($async) {
          out += ' return data; ';
        } else {
          out += ' validate.errors = null; return true; ';
        }
      } else {
        out += ' var ' + ($valid) + ' = true; ';
      }
    }
    if (it.isTop) {
      out += ' }; return validate; ';
    }
    return out;
  }
  if (it.isTop) {
    var $top = it.isTop,
      $lvl = it.level = 0,
      $dataLvl = it.dataLevel = 0,
      $data = 'data';
    it.rootId = it.resolve.fullPath(it.self._getId(it.root.schema));
    it.baseId = it.baseId || it.rootId;
    delete it.isTop;
    it.dataPathArr = [undefined];
    if (it.schema.default !== undefined && it.opts.useDefaults && it.opts.strictDefaults) {
      var $defaultMsg = 'default is ignored in the schema root';
      if (it.opts.strictDefaults === 'log') it.logger.warn($defaultMsg);
      else throw new Error($defaultMsg);
    }
    out += ' var vErrors = null; ';
    out += ' var errors = 0;     ';
    out += ' if (rootData === undefined) rootData = data; ';
  } else {
    var $lvl = it.level,
      $dataLvl = it.dataLevel,
      $data = 'data' + ($dataLvl || '');
    if ($id) it.baseId = it.resolve.url(it.baseId, $id);
    if ($async && !it.async) throw new Error('async schema in sync schema');
    out += ' var errs_' + ($lvl) + ' = errors;';
  }
  var $valid = 'valid' + $lvl,
    $breakOnError = !it.opts.allErrors,
    $closingBraces1 = '',
    $closingBraces2 = '';
  var $errorKeyword;
  var $typeSchema = it.schema.type,
    $typeIsArray = Array.isArray($typeSchema);
  if ($typeSchema && it.opts.nullable && it.schema.nullable === true) {
    if ($typeIsArray) {
      if ($typeSchema.indexOf('null') == -1) $typeSchema = $typeSchema.concat('null');
    } else if ($typeSchema != 'null') {
      $typeSchema = [$typeSchema, 'null'];
      $typeIsArray = true;
    }
  }
  if ($typeIsArray && $typeSchema.length == 1) {
    $typeSchema = $typeSchema[0];
    $typeIsArray = false;
  }
  if (it.schema.$ref && $refKeywords) {
    if (it.opts.extendRefs == 'fail') {
      throw new Error('$ref: validation keywords used in schema at path "' + it.errSchemaPath + '" (see option extendRefs)');
    } else if (it.opts.extendRefs !== true) {
      $refKeywords = false;
      it.logger.warn('$ref: keywords ignored in schema at path "' + it.errSchemaPath + '"');
    }
  }
  if (it.schema.$comment && it.opts.$comment) {
    out += ' ' + (it.RULES.all.$comment.code(it, '$comment'));
  }
  if ($typeSchema) {
    if (it.opts.coerceTypes) {
      var $coerceToTypes = it.util.coerceToTypes(it.opts.coerceTypes, $typeSchema);
    }
    var $rulesGroup = it.RULES.types[$typeSchema];
    if ($coerceToTypes || $typeIsArray || $rulesGroup === true || ($rulesGroup && !$shouldUseGroup($rulesGroup))) {
      var $schemaPath = it.schemaPath + '.type',
        $errSchemaPath = it.errSchemaPath + '/type';
      var $schemaPath = it.schemaPath + '.type',
        $errSchemaPath = it.errSchemaPath + '/type',
        $method = $typeIsArray ? 'checkDataTypes' : 'checkDataType';
      out += ' if (' + (it.util[$method]($typeSchema, $data, true)) + ') { ';
      if ($coerceToTypes) {
        var $dataType = 'dataType' + $lvl,
          $coerced = 'coerced' + $lvl;
        out += ' var ' + ($dataType) + ' = typeof ' + ($data) + '; ';
        if (it.opts.coerceTypes == 'array') {
          out += ' if (' + ($dataType) + ' == \'object\' && Array.isArray(' + ($data) + ')) ' + ($dataType) + ' = \'array\'; ';
        }
        out += ' var ' + ($coerced) + ' = undefined; ';
        var $bracesCoercion = '';
        var arr1 = $coerceToTypes;
        if (arr1) {
          var $type, $i = -1,
            l1 = arr1.length - 1;
          while ($i < l1) {
            $type = arr1[$i += 1];
            if ($i) {
              out += ' if (' + ($coerced) + ' === undefined) { ';
              $bracesCoercion += '}';
            }
            if (it.opts.coerceTypes == 'array' && $type != 'array') {
              out += ' if (' + ($dataType) + ' == \'array\' && ' + ($data) + '.length == 1) { ' + ($coerced) + ' = ' + ($data) + ' = ' + ($data) + '[0]; ' + ($dataType) + ' = typeof ' + ($data) + ';  } ';
            }
            if ($type == 'string') {
              out += ' if (' + ($dataType) + ' == \'number\' || ' + ($dataType) + ' == \'boolean\') ' + ($coerced) + ' = \'\' + ' + ($data) + '; else if (' + ($data) + ' === null) ' + ($coerced) + ' = \'\'; ';
            } else if ($type == 'number' || $type == 'integer') {
              out += ' if (' + ($dataType) + ' == \'boolean\' || ' + ($data) + ' === null || (' + ($dataType) + ' == \'string\' && ' + ($data) + ' && ' + ($data) + ' == +' + ($data) + ' ';
              if ($type == 'integer') {
                out += ' && !(' + ($data) + ' % 1)';
              }
              out += ')) ' + ($coerced) + ' = +' + ($data) + '; ';
            } else if ($type == 'boolean') {
              out += ' if (' + ($data) + ' === \'false\' || ' + ($data) + ' === 0 || ' + ($data) + ' === null) ' + ($coerced) + ' = false; else if (' + ($data) + ' === \'true\' || ' + ($data) + ' === 1) ' + ($coerced) + ' = true; ';
            } else if ($type == 'null') {
              out += ' if (' + ($data) + ' === \'\' || ' + ($data) + ' === 0 || ' + ($data) + ' === false) ' + ($coerced) + ' = null; ';
            } else if (it.opts.coerceTypes == 'array' && $type == 'array') {
              out += ' if (' + ($dataType) + ' == \'string\' || ' + ($dataType) + ' == \'number\' || ' + ($dataType) + ' == \'boolean\' || ' + ($data) + ' == null) ' + ($coerced) + ' = [' + ($data) + ']; ';
            }
          }
        }
        out += ' ' + ($bracesCoercion) + ' if (' + ($coerced) + ' === undefined) {   ';
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { type: \'';
          if ($typeIsArray) {
            out += '' + ($typeSchema.join(","));
          } else {
            out += '' + ($typeSchema);
          }
          out += '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'should be ';
            if ($typeIsArray) {
              out += '' + ($typeSchema.join(","));
            } else {
              out += '' + ($typeSchema);
            }
            out += '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
        out += ' } else {  ';
        var $parentData = $dataLvl ? 'data' + (($dataLvl - 1) || '') : 'parentData',
          $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : 'parentDataProperty';
        out += ' ' + ($data) + ' = ' + ($coerced) + '; ';
        if (!$dataLvl) {
          out += 'if (' + ($parentData) + ' !== undefined)';
        }
        out += ' ' + ($parentData) + '[' + ($parentDataProperty) + '] = ' + ($coerced) + '; } ';
      } else {
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { type: \'';
          if ($typeIsArray) {
            out += '' + ($typeSchema.join(","));
          } else {
            out += '' + ($typeSchema);
          }
          out += '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'should be ';
            if ($typeIsArray) {
              out += '' + ($typeSchema.join(","));
            } else {
              out += '' + ($typeSchema);
            }
            out += '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
      }
      out += ' } ';
    }
  }
  if (it.schema.$ref && !$refKeywords) {
    out += ' ' + (it.RULES.all.$ref.code(it, '$ref')) + ' ';
    if ($breakOnError) {
      out += ' } if (errors === ';
      if ($top) {
        out += '0';
      } else {
        out += 'errs_' + ($lvl);
      }
      out += ') { ';
      $closingBraces2 += '}';
    }
  } else {
    var arr2 = it.RULES;
    if (arr2) {
      var $rulesGroup, i2 = -1,
        l2 = arr2.length - 1;
      while (i2 < l2) {
        $rulesGroup = arr2[i2 += 1];
        if ($shouldUseGroup($rulesGroup)) {
          if ($rulesGroup.type) {
            out += ' if (' + (it.util.checkDataType($rulesGroup.type, $data)) + ') { ';
          }
          if (it.opts.useDefaults) {
            if ($rulesGroup.type == 'object' && it.schema.properties) {
              var $schema = it.schema.properties,
                $schemaKeys = Object.keys($schema);
              var arr3 = $schemaKeys;
              if (arr3) {
                var $propertyKey, i3 = -1,
                  l3 = arr3.length - 1;
                while (i3 < l3) {
                  $propertyKey = arr3[i3 += 1];
                  var $sch = $schema[$propertyKey];
                  if ($sch.default !== undefined) {
                    var $passData = $data + it.util.getProperty($propertyKey);
                    if (it.compositeRule) {
                      if (it.opts.strictDefaults) {
                        var $defaultMsg = 'default is ignored for: ' + $passData;
                        if (it.opts.strictDefaults === 'log') it.logger.warn($defaultMsg);
                        else throw new Error($defaultMsg);
                      }
                    } else {
                      out += ' if (' + ($passData) + ' === undefined ';
                      if (it.opts.useDefaults == 'empty') {
                        out += ' || ' + ($passData) + ' === null || ' + ($passData) + ' === \'\' ';
                      }
                      out += ' ) ' + ($passData) + ' = ';
                      if (it.opts.useDefaults == 'shared') {
                        out += ' ' + (it.useDefault($sch.default)) + ' ';
                      } else {
                        out += ' ' + (JSON.stringify($sch.default)) + ' ';
                      }
                      out += '; ';
                    }
                  }
                }
              }
            } else if ($rulesGroup.type == 'array' && Array.isArray(it.schema.items)) {
              var arr4 = it.schema.items;
              if (arr4) {
                var $sch, $i = -1,
                  l4 = arr4.length - 1;
                while ($i < l4) {
                  $sch = arr4[$i += 1];
                  if ($sch.default !== undefined) {
                    var $passData = $data + '[' + $i + ']';
                    if (it.compositeRule) {
                      if (it.opts.strictDefaults) {
                        var $defaultMsg = 'default is ignored for: ' + $passData;
                        if (it.opts.strictDefaults === 'log') it.logger.warn($defaultMsg);
                        else throw new Error($defaultMsg);
                      }
                    } else {
                      out += ' if (' + ($passData) + ' === undefined ';
                      if (it.opts.useDefaults == 'empty') {
                        out += ' || ' + ($passData) + ' === null || ' + ($passData) + ' === \'\' ';
                      }
                      out += ' ) ' + ($passData) + ' = ';
                      if (it.opts.useDefaults == 'shared') {
                        out += ' ' + (it.useDefault($sch.default)) + ' ';
                      } else {
                        out += ' ' + (JSON.stringify($sch.default)) + ' ';
                      }
                      out += '; ';
                    }
                  }
                }
              }
            }
          }
          var arr5 = $rulesGroup.rules;
          if (arr5) {
            var $rule, i5 = -1,
              l5 = arr5.length - 1;
            while (i5 < l5) {
              $rule = arr5[i5 += 1];
              if ($shouldUseRule($rule)) {
                var $code = $rule.code(it, $rule.keyword, $rulesGroup.type);
                if ($code) {
                  out += ' ' + ($code) + ' ';
                  if ($breakOnError) {
                    $closingBraces1 += '}';
                  }
                }
              }
            }
          }
          if ($breakOnError) {
            out += ' ' + ($closingBraces1) + ' ';
            $closingBraces1 = '';
          }
          if ($rulesGroup.type) {
            out += ' } ';
            if ($typeSchema && $typeSchema === $rulesGroup.type && !$coerceToTypes) {
              out += ' else { ';
              var $schemaPath = it.schemaPath + '.type',
                $errSchemaPath = it.errSchemaPath + '/type';
              var $$outStack = $$outStack || [];
              $$outStack.push(out);
              out = ''; /* istanbul ignore else */
              if (it.createErrors !== false) {
                out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { type: \'';
                if ($typeIsArray) {
                  out += '' + ($typeSchema.join(","));
                } else {
                  out += '' + ($typeSchema);
                }
                out += '\' } ';
                if (it.opts.messages !== false) {
                  out += ' , message: \'should be ';
                  if ($typeIsArray) {
                    out += '' + ($typeSchema.join(","));
                  } else {
                    out += '' + ($typeSchema);
                  }
                  out += '\' ';
                }
                if (it.opts.verbose) {
                  out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
                }
                out += ' } ';
              } else {
                out += ' {} ';
              }
              var __err = out;
              out = $$outStack.pop();
              if (!it.compositeRule && $breakOnError) {
                /* istanbul ignore if */
                if (it.async) {
                  out += ' throw new ValidationError([' + (__err) + ']); ';
                } else {
                  out += ' validate.errors = [' + (__err) + ']; return false; ';
                }
              } else {
                out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
              }
              out += ' } ';
            }
          }
          if ($breakOnError) {
            out += ' if (errors === ';
            if ($top) {
              out += '0';
            } else {
              out += 'errs_' + ($lvl);
            }
            out += ') { ';
            $closingBraces2 += '}';
          }
        }
      }
    }
  }
  if ($breakOnError) {
    out += ' ' + ($closingBraces2) + ' ';
  }
  if ($top) {
    if ($async) {
      out += ' if (errors === 0) return data;           ';
      out += ' else throw new ValidationError(vErrors); ';
    } else {
      out += ' validate.errors = vErrors; ';
      out += ' return errors === 0;       ';
    }
    out += ' }; return validate;';
  } else {
    out += ' var ' + ($valid) + ' = errors === errs_' + ($lvl) + ';';
  }
  out = it.util.cleanUpCode(out);
  if ($top) {
    out = it.util.finalCleanUpCode(out, $async);
  }

  function $shouldUseGroup($rulesGroup) {
    var rules = $rulesGroup.rules;
    for (var i = 0; i < rules.length; i++)
      if ($shouldUseRule(rules[i])) return true;
  }

  function $shouldUseRule($rule) {
    return it.schema[$rule.keyword] !== undefined || ($rule.implements && $ruleImplementsSomeKeyword($rule));
  }

  function $ruleImplementsSomeKeyword($rule) {
    var impl = $rule.implements;
    for (var i = 0; i < impl.length; i++)
      if (it.schema[impl[i]] !== undefined) return true;
  }
  return out;
}

},{}],78:[function(require,module,exports){
'use strict';

var IDENTIFIER = /^[a-z_$][a-z0-9_$-]*$/i;
var customRuleCode = require('./dotjs/custom');
var metaSchema = require('./refs/json-schema-draft-07.json');

module.exports = {
  add: addKeyword,
  get: getKeyword,
  remove: removeKeyword,
  validate: validateKeyword
};

var definitionSchema = {
  definitions: {
    simpleTypes: metaSchema.definitions.simpleTypes
  },
  type: 'object',
  dependencies: {
    schema: ['validate'],
    $data: ['validate'],
    statements: ['inline'],
    valid: {not: {required: ['macro']}}
  },
  properties: {
    type: metaSchema.properties.type,
    schema: {type: 'boolean'},
    statements: {type: 'boolean'},
    dependencies: {
      type: 'array',
      items: {type: 'string'}
    },
    metaSchema: {type: 'object'},
    modifying: {type: 'boolean'},
    valid: {type: 'boolean'},
    $data: {type: 'boolean'},
    async: {type: 'boolean'},
    errors: {
      anyOf: [
        {type: 'boolean'},
        {const: 'full'}
      ]
    }
  }
};

/**
 * Define custom keyword
 * @this  Ajv
 * @param {String} keyword custom keyword, should be unique (including different from all standard, custom and macro keywords).
 * @param {Object} definition keyword definition object with properties `type` (type(s) which the keyword applies to), `validate` or `compile`.
 * @return {Ajv} this for method chaining
 */
function addKeyword(keyword, definition) {
  /* jshint validthis: true */
  /* eslint no-shadow: 0 */
  var RULES = this.RULES;
  if (RULES.keywords[keyword])
    throw new Error('Keyword ' + keyword + ' is already defined');

  if (!IDENTIFIER.test(keyword))
    throw new Error('Keyword ' + keyword + ' is not a valid identifier');

  if (definition) {
    this.validateKeyword(definition, true);

    var dataType = definition.type;
    if (Array.isArray(dataType)) {
      for (var i=0; i<dataType.length; i++)
        _addRule(keyword, dataType[i], definition);
    } else {
      _addRule(keyword, dataType, definition);
    }

    var metaSchema = definition.metaSchema;
    if (metaSchema) {
      if (definition.$data && this._opts.$data) {
        metaSchema = {
          anyOf: [
            metaSchema,
            { '$ref': 'https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/data.json#' }
          ]
        };
      }
      definition.validateSchema = this.compile(metaSchema, true);
    }
  }

  RULES.keywords[keyword] = RULES.all[keyword] = true;


  function _addRule(keyword, dataType, definition) {
    var ruleGroup;
    for (var i=0; i<RULES.length; i++) {
      var rg = RULES[i];
      if (rg.type == dataType) {
        ruleGroup = rg;
        break;
      }
    }

    if (!ruleGroup) {
      ruleGroup = { type: dataType, rules: [] };
      RULES.push(ruleGroup);
    }

    var rule = {
      keyword: keyword,
      definition: definition,
      custom: true,
      code: customRuleCode,
      implements: definition.implements
    };
    ruleGroup.rules.push(rule);
    RULES.custom[keyword] = rule;
  }

  return this;
}


/**
 * Get keyword
 * @this  Ajv
 * @param {String} keyword pre-defined or custom keyword.
 * @return {Object|Boolean} custom keyword definition, `true` if it is a predefined keyword, `false` otherwise.
 */
function getKeyword(keyword) {
  /* jshint validthis: true */
  var rule = this.RULES.custom[keyword];
  return rule ? rule.definition : this.RULES.keywords[keyword] || false;
}


/**
 * Remove keyword
 * @this  Ajv
 * @param {String} keyword pre-defined or custom keyword.
 * @return {Ajv} this for method chaining
 */
function removeKeyword(keyword) {
  /* jshint validthis: true */
  var RULES = this.RULES;
  delete RULES.keywords[keyword];
  delete RULES.all[keyword];
  delete RULES.custom[keyword];
  for (var i=0; i<RULES.length; i++) {
    var rules = RULES[i].rules;
    for (var j=0; j<rules.length; j++) {
      if (rules[j].keyword == keyword) {
        rules.splice(j, 1);
        break;
      }
    }
  }
  return this;
}


/**
 * Validate keyword definition
 * @this  Ajv
 * @param {Object} definition keyword definition object.
 * @param {Boolean} throwError true to throw exception if definition is invalid
 * @return {boolean} validation result
 */
function validateKeyword(definition, throwError) {
  validateKeyword.errors = null;
  var v = this._validateKeyword = this._validateKeyword
                                  || this.compile(definitionSchema, true);

  if (v(definition)) return true;
  validateKeyword.errors = v.errors;
  if (throwError)
    throw new Error('custom keyword definition is invalid: '  + this.errorsText(v.errors));
  else
    return false;
}

},{"./dotjs/custom":61,"./refs/json-schema-draft-07.json":80}],79:[function(require,module,exports){
module.exports={
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/data.json#",
    "description": "Meta-schema for $data reference (JSON Schema extension proposal)",
    "type": "object",
    "required": [ "$data" ],
    "properties": {
        "$data": {
            "type": "string",
            "anyOf": [
                { "format": "relative-json-pointer" }, 
                { "format": "json-pointer" }
            ]
        }
    },
    "additionalProperties": false
}

},{}],80:[function(require,module,exports){
module.exports={
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "http://json-schema.org/draft-07/schema#",
    "title": "Core schema meta-schema",
    "definitions": {
        "schemaArray": {
            "type": "array",
            "minItems": 1,
            "items": { "$ref": "#" }
        },
        "nonNegativeInteger": {
            "type": "integer",
            "minimum": 0
        },
        "nonNegativeIntegerDefault0": {
            "allOf": [
                { "$ref": "#/definitions/nonNegativeInteger" },
                { "default": 0 }
            ]
        },
        "simpleTypes": {
            "enum": [
                "array",
                "boolean",
                "integer",
                "null",
                "number",
                "object",
                "string"
            ]
        },
        "stringArray": {
            "type": "array",
            "items": { "type": "string" },
            "uniqueItems": true,
            "default": []
        }
    },
    "type": ["object", "boolean"],
    "properties": {
        "$id": {
            "type": "string",
            "format": "uri-reference"
        },
        "$schema": {
            "type": "string",
            "format": "uri"
        },
        "$ref": {
            "type": "string",
            "format": "uri-reference"
        },
        "$comment": {
            "type": "string"
        },
        "title": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "default": true,
        "readOnly": {
            "type": "boolean",
            "default": false
        },
        "examples": {
            "type": "array",
            "items": true
        },
        "multipleOf": {
            "type": "number",
            "exclusiveMinimum": 0
        },
        "maximum": {
            "type": "number"
        },
        "exclusiveMaximum": {
            "type": "number"
        },
        "minimum": {
            "type": "number"
        },
        "exclusiveMinimum": {
            "type": "number"
        },
        "maxLength": { "$ref": "#/definitions/nonNegativeInteger" },
        "minLength": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
        "pattern": {
            "type": "string",
            "format": "regex"
        },
        "additionalItems": { "$ref": "#" },
        "items": {
            "anyOf": [
                { "$ref": "#" },
                { "$ref": "#/definitions/schemaArray" }
            ],
            "default": true
        },
        "maxItems": { "$ref": "#/definitions/nonNegativeInteger" },
        "minItems": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
        "uniqueItems": {
            "type": "boolean",
            "default": false
        },
        "contains": { "$ref": "#" },
        "maxProperties": { "$ref": "#/definitions/nonNegativeInteger" },
        "minProperties": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
        "required": { "$ref": "#/definitions/stringArray" },
        "additionalProperties": { "$ref": "#" },
        "definitions": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "properties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "default": {}
        },
        "patternProperties": {
            "type": "object",
            "additionalProperties": { "$ref": "#" },
            "propertyNames": { "format": "regex" },
            "default": {}
        },
        "dependencies": {
            "type": "object",
            "additionalProperties": {
                "anyOf": [
                    { "$ref": "#" },
                    { "$ref": "#/definitions/stringArray" }
                ]
            }
        },
        "propertyNames": { "$ref": "#" },
        "const": true,
        "enum": {
            "type": "array",
            "items": true,
            "minItems": 1,
            "uniqueItems": true
        },
        "type": {
            "anyOf": [
                { "$ref": "#/definitions/simpleTypes" },
                {
                    "type": "array",
                    "items": { "$ref": "#/definitions/simpleTypes" },
                    "minItems": 1,
                    "uniqueItems": true
                }
            ]
        },
        "format": { "type": "string" },
        "contentMediaType": { "type": "string" },
        "contentEncoding": { "type": "string" },
        "if": {"$ref": "#"},
        "then": {"$ref": "#"},
        "else": {"$ref": "#"},
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" }
    },
    "default": true
}

},{}],81:[function(require,module,exports){
/*!
 * arr-diff <https://github.com/jonschlinkert/arr-diff>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

module.exports = function diff(arr/*, arrays*/) {
  var len = arguments.length;
  var idx = 0;
  while (++idx < len) {
    arr = diffArray(arr, arguments[idx]);
  }
  return arr;
};

function diffArray(one, two) {
  if (!Array.isArray(two)) {
    return one.slice();
  }

  var tlen = two.length
  var olen = one.length;
  var idx = -1;
  var arr = [];

  while (++idx < olen) {
    var ele = one[idx];

    var hasEle = false;
    for (var i = 0; i < tlen; i++) {
      var val = two[i];

      if (ele === val) {
        hasEle = true;
        break;
      }
    }

    if (hasEle === false) {
      arr.push(ele);
    }
  }
  return arr;
}

},{}],82:[function(require,module,exports){
/*!
 * arr-flatten <https://github.com/jonschlinkert/arr-flatten>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

module.exports = function (arr) {
  return flat(arr, []);
};

function flat(arr, res) {
  var i = 0, cur;
  var len = arr.length;
  for (; i < len; i++) {
    cur = arr[i];
    Array.isArray(cur) ? flat(cur, res) : res.push(cur);
  }
  return res;
}

},{}],83:[function(require,module,exports){
'use strict';

module.exports = function union(init) {
  if (!Array.isArray(init)) {
    throw new TypeError('arr-union expects the first argument to be an array.');
  }

  var len = arguments.length;
  var i = 0;

  while (++i < len) {
    var arg = arguments[i];
    if (!arg) continue;

    if (!Array.isArray(arg)) {
      arg = [arg];
    }

    for (var j = 0; j < arg.length; j++) {
      var ele = arg[j];

      if (init.indexOf(ele) >= 0) {
        continue;
      }
      init.push(ele);
    }
  }
  return init;
};

},{}],84:[function(require,module,exports){
/*!
 * array-unique <https://github.com/jonschlinkert/array-unique>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function unique(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.');
  }

  var len = arr.length;
  var i = -1;

  while (i++ < len) {
    var j = i + 1;

    for (; j < arr.length; ++j) {
      if (arr[i] === arr[j]) {
        arr.splice(j--, 1);
      }
    }
  }
  return arr;
};

module.exports.immutable = function uniqueImmutable(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.');
  }

  var arrLen = arr.length;
  var newArr = new Array(arrLen);

  for (var i = 0; i < arrLen; i++) {
    newArr[i] = arr[i];
  }

  return module.exports(newArr);
};

},{}],85:[function(require,module,exports){
/*!
 * assign-symbols <https://github.com/jonschlinkert/assign-symbols>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function(receiver, objects) {
  if (receiver === null || typeof receiver === 'undefined') {
    throw new TypeError('expected first argument to be an object.');
  }

  if (typeof objects === 'undefined' || typeof Symbol === 'undefined') {
    return receiver;
  }

  if (typeof Object.getOwnPropertySymbols !== 'function') {
    return receiver;
  }

  var isEnumerable = Object.prototype.propertyIsEnumerable;
  var target = Object(receiver);
  var len = arguments.length, i = 0;

  while (++i < len) {
    var provider = Object(arguments[i]);
    var names = Object.getOwnPropertySymbols(provider);

    for (var j = 0; j < names.length; j++) {
      var key = names[j];

      if (isEnumerable.call(provider, key)) {
        target[key] = provider[key];
      }
    }
  }
  return target;
};

},{}],86:[function(require,module,exports){
'use strict';

var util = require('util');
var define = require('define-property');
var CacheBase = require('cache-base');
var Emitter = require('component-emitter');
var isObject = require('isobject');
var merge = require('mixin-deep');
var pascal = require('pascalcase');
var cu = require('class-utils');

/**
 * Optionally define a custom `cache` namespace to use.
 */

function namespace(name) {
  var Cache = name ? CacheBase.namespace(name) : CacheBase;
  var fns = [];

  /**
   * Create an instance of `Base` with the given `config` and `options`.
   *
   * ```js
   * // initialize with `config` and `options`
   * var app = new Base({isApp: true}, {abc: true});
   * app.set('foo', 'bar');
   *
   * // values defined with the given `config` object will be on the root of the instance
   * console.log(app.baz); //=> undefined
   * console.log(app.foo); //=> 'bar'
   * // or use `.get`
   * console.log(app.get('isApp')); //=> true
   * console.log(app.get('foo')); //=> 'bar'
   *
   * // values defined with the given `options` object will be on `app.options
   * console.log(app.options.abc); //=> true
   * ```
   *
   * @param {Object} `config` If supplied, this object is passed to [cache-base][] to merge onto the the instance upon instantiation.
   * @param {Object} `options` If supplied, this object is used to initialize the `base.options` object.
   * @api public
   */

  function Base(config, options) {
    if (!(this instanceof Base)) {
      return new Base(config, options);
    }
    Cache.call(this, config);
    this.is('base');
    this.initBase(config, options);
  }

  /**
   * Inherit cache-base
   */

  util.inherits(Base, Cache);

  /**
   * Add static emitter methods
   */

  Emitter(Base);

  /**
   * Initialize `Base` defaults with the given `config` object
   */

  Base.prototype.initBase = function(config, options) {
    this.options = merge({}, this.options, options);
    this.cache = this.cache || {};
    this.define('registered', {});
    if (name) this[name] = {};

    // make `app._callbacks` non-enumerable
    this.define('_callbacks', this._callbacks);
    if (isObject(config)) {
      this.visit('set', config);
    }
    Base.run(this, 'use', fns);
  };

  /**
   * Set the given `name` on `app._name` and `app.is*` properties. Used for doing
   * lookups in plugins.
   *
   * ```js
   * app.is('foo');
   * console.log(app._name);
   * //=> 'foo'
   * console.log(app.isFoo);
   * //=> true
   * app.is('bar');
   * console.log(app.isFoo);
   * //=> true
   * console.log(app.isBar);
   * //=> true
   * console.log(app._name);
   * //=> 'bar'
   * ```
   * @name .is
   * @param {String} `name`
   * @return {Boolean}
   * @api public
   */

  Base.prototype.is = function(name) {
    if (typeof name !== 'string') {
      throw new TypeError('expected name to be a string');
    }
    this.define('is' + pascal(name), true);
    this.define('_name', name);
    this.define('_appname', name);
    return this;
  };

  /**
   * Returns true if a plugin has already been registered on an instance.
   *
   * Plugin implementors are encouraged to use this first thing in a plugin
   * to prevent the plugin from being called more than once on the same
   * instance.
   *
   * ```js
   * var base = new Base();
   * base.use(function(app) {
   *   if (app.isRegistered('myPlugin')) return;
   *   // do stuff to `app`
   * });
   *
   * // to also record the plugin as being registered
   * base.use(function(app) {
   *   if (app.isRegistered('myPlugin', true)) return;
   *   // do stuff to `app`
   * });
   * ```
   * @name .isRegistered
   * @emits `plugin` Emits the name of the plugin being registered. Useful for unit tests, to ensure plugins are only registered once.
   * @param {String} `name` The plugin name.
   * @param {Boolean} `register` If the plugin if not already registered, to record it as being registered pass `true` as the second argument.
   * @return {Boolean} Returns true if a plugin is already registered.
   * @api public
   */

  Base.prototype.isRegistered = function(name, register) {
    if (this.registered.hasOwnProperty(name)) {
      return true;
    }
    if (register !== false) {
      this.registered[name] = true;
      this.emit('plugin', name);
    }
    return false;
  };

  /**
   * Define a plugin function to be called immediately upon init. Plugins are chainable
   * and expose the following arguments to the plugin function:
   *
   * - `app`: the current instance of `Base`
   * - `base`: the [first ancestor instance](#base) of `Base`
   *
   * ```js
   * var app = new Base()
   *   .use(foo)
   *   .use(bar)
   *   .use(baz)
   * ```
   * @name .use
   * @param {Function} `fn` plugin function to call
   * @return {Object} Returns the item instance for chaining.
   * @api public
   */

  Base.prototype.use = function(fn) {
    fn.call(this, this);
    return this;
  };

  /**
   * The `.define` method is used for adding non-enumerable property on the instance.
   * Dot-notation is **not supported** with `define`.
   *
   * ```js
   * // arbitrary `render` function using lodash `template`
   * app.define('render', function(str, locals) {
   *   return _.template(str)(locals);
   * });
   * ```
   * @name .define
   * @param {String} `key` The name of the property to define.
   * @param {any} `value`
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  Base.prototype.define = function(key, val) {
    if (isObject(key)) {
      return this.visit('define', key);
    }
    define(this, key, val);
    return this;
  };

  /**
   * Mix property `key` onto the Base prototype. If base is inherited using
   * `Base.extend` this method will be overridden by a new `mixin` method that will
   * only add properties to the prototype of the inheriting application.
   *
   * ```js
   * app.mixin('foo', function() {
   *   // do stuff
   * });
   * ```
   * @name .mixin
   * @param {String} `key`
   * @param {Object|Array} `val`
   * @return {Object} Returns the `base` instance for chaining.
   * @api public
   */

  Base.prototype.mixin = function(key, val) {
    Base.prototype[key] = val;
    return this;
  };

  /**
   * Non-enumberable mixin array, used by the static [Base.mixin]() method.
   */

  Base.prototype.mixins = Base.prototype.mixins || [];

  /**
   * Getter/setter used when creating nested instances of `Base`, for storing a reference
   * to the first ancestor instance. This works by setting an instance of `Base` on the `parent`
   * property of a "child" instance. The `base` property defaults to the current instance if
   * no `parent` property is defined.
   *
   * ```js
   * // create an instance of `Base`, this is our first ("base") instance
   * var first = new Base();
   * first.foo = 'bar'; // arbitrary property, to make it easier to see what's happening later
   *
   * // create another instance
   * var second = new Base();
   * // create a reference to the first instance (`first`)
   * second.parent = first;
   *
   * // create another instance
   * var third = new Base();
   * // create a reference to the previous instance (`second`)
   * // repeat this pattern every time a "child" instance is created
   * third.parent = second;
   *
   * // we can always access the first instance using the `base` property
   * console.log(first.base.foo);
   * //=> 'bar'
   * console.log(second.base.foo);
   * //=> 'bar'
   * console.log(third.base.foo);
   * //=> 'bar'
   * // and now you know how to get to third base ;)
   * ```
   * @name .base
   * @api public
   */

  Object.defineProperty(Base.prototype, 'base', {
    configurable: true,
    get: function() {
      return this.parent ? this.parent.base : this;
    }
  });

  /**
   * Static method for adding global plugin functions that will
   * be added to an instance when created.
   *
   * ```js
   * Base.use(function(app) {
   *   app.foo = 'bar';
   * });
   * var app = new Base();
   * console.log(app.foo);
   * //=> 'bar'
   * ```
   * @name #use
   * @param {Function} `fn` Plugin function to use on each instance.
   * @return {Object} Returns the `Base` constructor for chaining
   * @api public
   */

  define(Base, 'use', function(fn) {
    fns.push(fn);
    return Base;
  });

  /**
   * Run an array of functions by passing each function
   * to a method on the given object specified by the given property.
   *
   * @param  {Object} `obj` Object containing method to use.
   * @param  {String} `prop` Name of the method on the object to use.
   * @param  {Array} `arr` Array of functions to pass to the method.
   */

  define(Base, 'run', function(obj, prop, arr) {
    var len = arr.length, i = 0;
    while (len--) {
      obj[prop](arr[i++]);
    }
    return Base;
  });

  /**
   * Static method for inheriting the prototype and static methods of the `Base` class.
   * This method greatly simplifies the process of creating inheritance-based applications.
   * See [static-extend][] for more details.
   *
   * ```js
   * var extend = cu.extend(Parent);
   * Parent.extend(Child);
   *
   * // optional methods
   * Parent.extend(Child, {
   *   foo: function() {},
   *   bar: function() {}
   * });
   * ```
   * @name #extend
   * @param {Function} `Ctor` constructor to extend
   * @param {Object} `methods` Optional prototype properties to mix in.
   * @return {Object} Returns the `Base` constructor for chaining
   * @api public
   */

  define(Base, 'extend', cu.extend(Base, function(Ctor, Parent) {
    Ctor.prototype.mixins = Ctor.prototype.mixins || [];

    define(Ctor, 'mixin', function(fn) {
      var mixin = fn(Ctor.prototype, Ctor);
      if (typeof mixin === 'function') {
        Ctor.prototype.mixins.push(mixin);
      }
      return Ctor;
    });

    define(Ctor, 'mixins', function(Child) {
      Base.run(Child, 'mixin', Ctor.prototype.mixins);
      return Ctor;
    });

    Ctor.prototype.mixin = function(key, value) {
      Ctor.prototype[key] = value;
      return this;
    };
    return Base;
  }));

  /**
   * Used for adding methods to the `Base` prototype, and/or to the prototype of child instances.
   * When a mixin function returns a function, the returned function is pushed onto the `.mixins`
   * array, making it available to be used on inheriting classes whenever `Base.mixins()` is
   * called (e.g. `Base.mixins(Child)`).
   *
   * ```js
   * Base.mixin(function(proto) {
   *   proto.foo = function(msg) {
   *     return 'foo ' + msg;
   *   };
   * });
   * ```
   * @name #mixin
   * @param {Function} `fn` Function to call
   * @return {Object} Returns the `Base` constructor for chaining
   * @api public
   */

  define(Base, 'mixin', function(fn) {
    var mixin = fn(Base.prototype, Base);
    if (typeof mixin === 'function') {
      Base.prototype.mixins.push(mixin);
    }
    return Base;
  });

  /**
   * Static method for running global mixin functions against a child constructor.
   * Mixins must be registered before calling this method.
   *
   * ```js
   * Base.extend(Child);
   * Base.mixins(Child);
   * ```
   * @name #mixins
   * @param {Function} `Child` Constructor function of a child class
   * @return {Object} Returns the `Base` constructor for chaining
   * @api public
   */

  define(Base, 'mixins', function(Child) {
    Base.run(Child, 'mixin', Base.prototype.mixins);
    return Base;
  });

  /**
   * Similar to `util.inherit`, but copies all static properties, prototype properties, and
   * getters/setters from `Provider` to `Receiver`. See [class-utils][]{#inherit} for more details.
   *
   * ```js
   * Base.inherit(Foo, Bar);
   * ```
   * @name #inherit
   * @param {Function} `Receiver` Receiving (child) constructor
   * @param {Function} `Provider` Providing (parent) constructor
   * @return {Object} Returns the `Base` constructor for chaining
   * @api public
   */

  define(Base, 'inherit', cu.inherit);
  define(Base, 'bubble', cu.bubble);
  return Base;
}

/**
 * Expose `Base` with default settings
 */

module.exports = namespace();

/**
 * Allow users to define a namespace
 */

module.exports.namespace = namespace;

},{"cache-base":97,"class-utils":98,"component-emitter":101,"define-property":87,"isobject":150,"mixin-deep":160,"pascalcase":173,"util":6}],87:[function(require,module,exports){
/*!
 * define-property <https://github.com/jonschlinkert/define-property>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var isDescriptor = require('is-descriptor');

module.exports = function defineProperty(obj, prop, val) {
  if (typeof obj !== 'object' && typeof obj !== 'function') {
    throw new TypeError('expected an object or function.');
  }

  if (typeof prop !== 'string') {
    throw new TypeError('expected `prop` to be a string.');
  }

  if (isDescriptor(val) && ('set' in val || 'get' in val)) {
    return Object.defineProperty(obj, prop, val);
  }

  return Object.defineProperty(obj, prop, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: val
  });
};

},{"is-descriptor":90}],88:[function(require,module,exports){
/*!
 * is-accessor-descriptor <https://github.com/jonschlinkert/is-accessor-descriptor>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var typeOf = require('kind-of');

// accessor descriptor properties
var accessor = {
  get: 'function',
  set: 'function',
  configurable: 'boolean',
  enumerable: 'boolean'
};

function isAccessorDescriptor(obj, prop) {
  if (typeof prop === 'string') {
    var val = Object.getOwnPropertyDescriptor(obj, prop);
    return typeof val !== 'undefined';
  }

  if (typeOf(obj) !== 'object') {
    return false;
  }

  if (has(obj, 'value') || has(obj, 'writable')) {
    return false;
  }

  if (!has(obj, 'get') || typeof obj.get !== 'function') {
    return false;
  }

  // tldr: it's valid to have "set" be undefined
  // "set" might be undefined if `Object.getOwnPropertyDescriptor`
  // was used to get the value, and only `get` was defined by the user
  if (has(obj, 'set') && typeof obj[key] !== 'function' && typeof obj[key] !== 'undefined') {
    return false;
  }

  for (var key in obj) {
    if (!accessor.hasOwnProperty(key)) {
      continue;
    }

    if (typeOf(obj[key]) === accessor[key]) {
      continue;
    }

    if (typeof obj[key] !== 'undefined') {
      return false;
    }
  }
  return true;
}

function has(obj, key) {
  return {}.hasOwnProperty.call(obj, key);
}

/**
 * Expose `isAccessorDescriptor`
 */

module.exports = isAccessorDescriptor;

},{"kind-of":152}],89:[function(require,module,exports){
/*!
 * is-data-descriptor <https://github.com/jonschlinkert/is-data-descriptor>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var typeOf = require('kind-of');

module.exports = function isDataDescriptor(obj, prop) {
  // data descriptor properties
  var data = {
    configurable: 'boolean',
    enumerable: 'boolean',
    writable: 'boolean'
  };

  if (typeOf(obj) !== 'object') {
    return false;
  }

  if (typeof prop === 'string') {
    var val = Object.getOwnPropertyDescriptor(obj, prop);
    return typeof val !== 'undefined';
  }

  if (!('value' in obj) && !('writable' in obj)) {
    return false;
  }

  for (var key in obj) {
    if (key === 'value') continue;

    if (!data.hasOwnProperty(key)) {
      continue;
    }

    if (typeOf(obj[key]) === data[key]) {
      continue;
    }

    if (typeof obj[key] !== 'undefined') {
      return false;
    }
  }
  return true;
};

},{"kind-of":152}],90:[function(require,module,exports){
/*!
 * is-descriptor <https://github.com/jonschlinkert/is-descriptor>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var typeOf = require('kind-of');
var isAccessor = require('is-accessor-descriptor');
var isData = require('is-data-descriptor');

module.exports = function isDescriptor(obj, key) {
  if (typeOf(obj) !== 'object') {
    return false;
  }
  if ('get' in obj) {
    return isAccessor(obj, key);
  }
  return isData(obj, key);
};

},{"is-accessor-descriptor":88,"is-data-descriptor":89,"kind-of":152}],91:[function(require,module,exports){
'use strict';

/**
 * Module dependencies
 */

var toRegex = require('to-regex');
var unique = require('array-unique');
var extend = require('extend-shallow');

/**
 * Local dependencies
 */

var compilers = require('./lib/compilers');
var parsers = require('./lib/parsers');
var Braces = require('./lib/braces');
var utils = require('./lib/utils');
var MAX_LENGTH = 1024 * 64;
var cache = {};

/**
 * Convert the given `braces` pattern into a regex-compatible string. By default, only one string is generated for every input string. Set `options.expand` to true to return an array of patterns (similar to Bash or minimatch. Before using `options.expand`, it's recommended that you read the [performance notes](#performance)).
 *
 * ```js
 * var braces = require('braces');
 * console.log(braces('{a,b,c}'));
 * //=> ['(a|b|c)']
 *
 * console.log(braces('{a,b,c}', {expand: true}));
 * //=> ['a', 'b', 'c']
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

function braces(pattern, options) {
  var key = utils.createKey(String(pattern), options);
  var arr = [];

  var disabled = options && options.cache === false;
  if (!disabled && cache.hasOwnProperty(key)) {
    return cache[key];
  }

  if (Array.isArray(pattern)) {
    for (var i = 0; i < pattern.length; i++) {
      arr.push.apply(arr, braces.create(pattern[i], options));
    }
  } else {
    arr = braces.create(pattern, options);
  }

  if (options && options.nodupes === true) {
    arr = unique(arr);
  }

  if (!disabled) {
    cache[key] = arr;
  }
  return arr;
}

/**
 * Expands a brace pattern into an array. This method is called by the main [braces](#braces) function when `options.expand` is true. Before using this method it's recommended that you read the [performance notes](#performance)) and advantages of using [.optimize](#optimize) instead.
 *
 * ```js
 * var braces = require('braces');
 * console.log(braces.expand('a/{b,c}/d'));
 * //=> ['a/b/d', 'a/c/d'];
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces.expand = function(pattern, options) {
  return braces.create(pattern, extend({}, options, {expand: true}));
};

/**
 * Expands a brace pattern into a regex-compatible, optimized string. This method is called by the main [braces](#braces) function by default.
 *
 * ```js
 * var braces = require('braces');
 * console.log(braces.expand('a/{b,c}/d'));
 * //=> ['a/(b|c)/d']
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces.optimize = function(pattern, options) {
  return braces.create(pattern, options);
};

/**
 * Processes a brace pattern and returns either an expanded array (if `options.expand` is true), a highly optimized regex-compatible string. This method is called by the main [braces](#braces) function.
 *
 * ```js
 * var braces = require('braces');
 * console.log(braces.create('user-{200..300}/project-{a,b,c}-{1..10}'))
 * //=> 'user-(20[0-9]|2[1-9][0-9]|300)/project-(a|b|c)-([1-9]|10)'
 * ```
 * @param {String} `pattern` Brace pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of expanded values.
 * @api public
 */

braces.create = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected a string');
  }

  var maxLength = (options && options.maxLength) || MAX_LENGTH;
  if (pattern.length >= maxLength) {
    throw new Error('expected pattern to be less than ' + maxLength + ' characters');
  }

  function create() {
    if (pattern === '' || pattern.length < 3) {
      return [pattern];
    }

    if (utils.isEmptySets(pattern)) {
      return [];
    }

    if (utils.isQuotedString(pattern)) {
      return [pattern.slice(1, -1)];
    }

    var proto = new Braces(options);
    var result = !options || options.expand !== true
      ? proto.optimize(pattern, options)
      : proto.expand(pattern, options);

    // get the generated pattern(s)
    var arr = result.output;

    // filter out empty strings if specified
    if (options && options.noempty === true) {
      arr = arr.filter(Boolean);
    }

    // filter out duplicates if specified
    if (options && options.nodupes === true) {
      arr = unique(arr);
    }

    Object.defineProperty(arr, 'result', {
      enumerable: false,
      value: result
    });

    return arr;
  }

  return memoize('create', pattern, options, create);
};

/**
 * Create a regular expression from the given string `pattern`.
 *
 * ```js
 * var braces = require('braces');
 *
 * console.log(braces.makeRe('id-{200..300}'));
 * //=> /^(?:id-(20[0-9]|2[1-9][0-9]|300))$/
 * ```
 * @param {String} `pattern` The pattern to convert to regex.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

braces.makeRe = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected a string');
  }

  var maxLength = (options && options.maxLength) || MAX_LENGTH;
  if (pattern.length >= maxLength) {
    throw new Error('expected pattern to be less than ' + maxLength + ' characters');
  }

  function makeRe() {
    var arr = braces(pattern, options);
    var opts = extend({strictErrors: false}, options);
    return toRegex(arr, opts);
  }

  return memoize('makeRe', pattern, options, makeRe);
};

/**
 * Parse the given `str` with the given `options`.
 *
 * ```js
 * var braces = require('braces');
 * var ast = braces.parse('a/{b,c}/d');
 * console.log(ast);
 * // { type: 'root',
 * //   errors: [],
 * //   input: 'a/{b,c}/d',
 * //   nodes:
 * //    [ { type: 'bos', val: '' },
 * //      { type: 'text', val: 'a/' },
 * //      { type: 'brace',
 * //        nodes:
 * //         [ { type: 'brace.open', val: '{' },
 * //           { type: 'text', val: 'b,c' },
 * //           { type: 'brace.close', val: '}' } ] },
 * //      { type: 'text', val: '/d' },
 * //      { type: 'eos', val: '' } ] }
 * ```
 * @param {String} `pattern` Brace pattern to parse
 * @param {Object} `options`
 * @return {Object} Returns an AST
 * @api public
 */

braces.parse = function(pattern, options) {
  var proto = new Braces(options);
  return proto.parse(pattern, options);
};

/**
 * Compile the given `ast` or string with the given `options`.
 *
 * ```js
 * var braces = require('braces');
 * var ast = braces.parse('a/{b,c}/d');
 * console.log(braces.compile(ast));
 * // { options: { source: 'string' },
 * //   state: {},
 * //   compilers:
 * //    { eos: [Function],
 * //      noop: [Function],
 * //      bos: [Function],
 * //      brace: [Function],
 * //      'brace.open': [Function],
 * //      text: [Function],
 * //      'brace.close': [Function] },
 * //   output: [ 'a/(b|c)/d' ],
 * //   ast:
 * //    { ... },
 * //   parsingErrors: [] }
 * ```
 * @param {Object|String} `ast` AST from [.parse](#parse). If a string is passed it will be parsed first.
 * @param {Object} `options`
 * @return {Object} Returns an object that has an `output` property with the compiled string.
 * @api public
 */

braces.compile = function(ast, options) {
  var proto = new Braces(options);
  return proto.compile(ast, options);
};

/**
 * Clear the regex cache.
 *
 * ```js
 * braces.clearCache();
 * ```
 * @api public
 */

braces.clearCache = function() {
  cache = braces.cache = {};
};

/**
 * Memoize a generated regex or function. A unique key is generated
 * from the method name, pattern, and user-defined options. Set
 * options.memoize to false to disable.
 */

function memoize(type, pattern, options, fn) {
  var key = utils.createKey(type + ':' + pattern, options);
  var disabled = options && options.cache === false;
  if (disabled) {
    braces.clearCache();
    return fn(pattern, options);
  }

  if (cache.hasOwnProperty(key)) {
    return cache[key];
  }

  var res = fn(pattern, options);
  cache[key] = res;
  return res;
}

/**
 * Expose `Braces` constructor and methods
 * @type {Function}
 */

braces.Braces = Braces;
braces.compilers = compilers;
braces.parsers = parsers;
braces.cache = cache;

/**
 * Expose `braces`
 * @type {Function}
 */

module.exports = braces;

},{"./lib/braces":92,"./lib/compilers":93,"./lib/parsers":94,"./lib/utils":95,"array-unique":84,"extend-shallow":96,"to-regex":223}],92:[function(require,module,exports){
'use strict';

var extend = require('extend-shallow');
var Snapdragon = require('snapdragon');
var compilers = require('./compilers');
var parsers = require('./parsers');
var utils = require('./utils');

/**
 * Customize Snapdragon parser and renderer
 */

function Braces(options) {
  this.options = extend({}, options);
}

/**
 * Initialize braces
 */

Braces.prototype.init = function(options) {
  if (this.isInitialized) return;
  this.isInitialized = true;
  var opts = utils.createOptions({}, this.options, options);
  this.snapdragon = this.options.snapdragon || new Snapdragon(opts);
  this.compiler = this.snapdragon.compiler;
  this.parser = this.snapdragon.parser;

  compilers(this.snapdragon, opts);
  parsers(this.snapdragon, opts);

  /**
   * Call Snapdragon `.parse` method. When AST is returned, we check to
   * see if any unclosed braces are left on the stack and, if so, we iterate
   * over the stack and correct the AST so that compilers are called in the correct
   * order and unbalance braces are properly escaped.
   */

  utils.define(this.snapdragon, 'parse', function(pattern, options) {
    var parsed = Snapdragon.prototype.parse.apply(this, arguments);
    this.parser.ast.input = pattern;

    var stack = this.parser.stack;
    while (stack.length) {
      addParent({type: 'brace.close', val: ''}, stack.pop());
    }

    function addParent(node, parent) {
      utils.define(node, 'parent', parent);
      parent.nodes.push(node);
    }

    // add non-enumerable parser reference
    utils.define(parsed, 'parser', this.parser);
    return parsed;
  });
};

/**
 * Decorate `.parse` method
 */

Braces.prototype.parse = function(ast, options) {
  if (ast && typeof ast === 'object' && ast.nodes) return ast;
  this.init(options);
  return this.snapdragon.parse(ast, options);
};

/**
 * Decorate `.compile` method
 */

Braces.prototype.compile = function(ast, options) {
  if (typeof ast === 'string') {
    ast = this.parse(ast, options);
  } else {
    this.init(options);
  }
  return this.snapdragon.compile(ast, options);
};

/**
 * Expand
 */

Braces.prototype.expand = function(pattern) {
  var ast = this.parse(pattern, {expand: true});
  return this.compile(ast, {expand: true});
};

/**
 * Optimize
 */

Braces.prototype.optimize = function(pattern) {
  var ast = this.parse(pattern, {optimize: true});
  return this.compile(ast, {optimize: true});
};

/**
 * Expose `Braces`
 */

module.exports = Braces;

},{"./compilers":93,"./parsers":94,"./utils":95,"extend-shallow":96,"snapdragon":194}],93:[function(require,module,exports){
'use strict';

var utils = require('./utils');

module.exports = function(braces, options) {
  braces.compiler

    /**
     * bos
     */

    .set('bos', function() {
      if (this.output) return;
      this.ast.queue = isEscaped(this.ast) ? [this.ast.val] : [];
      this.ast.count = 1;
    })

    /**
     * Square brackets
     */

    .set('bracket', function(node) {
      var close = node.close;
      var open = !node.escaped ? '[' : '\\[';
      var negated = node.negated;
      var inner = node.inner;

      inner = inner.replace(/\\(?=[\\\w]|$)/g, '\\\\');
      if (inner === ']-') {
        inner = '\\]\\-';
      }

      if (negated && inner.indexOf('.') === -1) {
        inner += '.';
      }
      if (negated && inner.indexOf('/') === -1) {
        inner += '/';
      }

      var val = open + negated + inner + close;
      var queue = node.parent.queue;
      var last = utils.arrayify(queue.pop());

      queue.push(utils.join(last, val));
      queue.push.apply(queue, []);
    })

    /**
     * Brace
     */

    .set('brace', function(node) {
      node.queue = isEscaped(node) ? [node.val] : [];
      node.count = 1;
      return this.mapVisit(node.nodes);
    })

    /**
     * Open
     */

    .set('brace.open', function(node) {
      node.parent.open = node.val;
    })

    /**
     * Inner
     */

    .set('text', function(node) {
      var queue = node.parent.queue;
      var escaped = node.escaped;
      var segs = [node.val];

      if (node.optimize === false) {
        options = utils.extend({}, options, {optimize: false});
      }

      if (node.multiplier > 1) {
        node.parent.count *= node.multiplier;
      }

      if (options.quantifiers === true && utils.isQuantifier(node.val)) {
        escaped = true;

      } else if (node.val.length > 1) {
        if (isType(node.parent, 'brace') && !isEscaped(node)) {
          var expanded = utils.expand(node.val, options);
          segs = expanded.segs;

          if (expanded.isOptimized) {
            node.parent.isOptimized = true;
          }

          // if nothing was expanded, we probably have a literal brace
          if (!segs.length) {
            var val = (expanded.val || node.val);
            if (options.unescape !== false) {
              // unescape unexpanded brace sequence/set separators
              val = val.replace(/\\([,.])/g, '$1');
              // strip quotes
              val = val.replace(/["'`]/g, '');
            }

            segs = [val];
            escaped = true;
          }
        }

      } else if (node.val === ',') {
        if (options.expand) {
          node.parent.queue.push(['']);
          segs = [''];
        } else {
          segs = ['|'];
        }
      } else {
        escaped = true;
      }

      if (escaped && isType(node.parent, 'brace')) {
        if (node.parent.nodes.length <= 4 && node.parent.count === 1) {
          node.parent.escaped = true;
        } else if (node.parent.length <= 3) {
          node.parent.escaped = true;
        }
      }

      if (!hasQueue(node.parent)) {
        node.parent.queue = segs;
        return;
      }

      var last = utils.arrayify(queue.pop());
      if (node.parent.count > 1 && options.expand) {
        last = multiply(last, node.parent.count);
        node.parent.count = 1;
      }

      queue.push(utils.join(utils.flatten(last), segs.shift()));
      queue.push.apply(queue, segs);
    })

    /**
     * Close
     */

    .set('brace.close', function(node) {
      var queue = node.parent.queue;
      var prev = node.parent.parent;
      var last = prev.queue.pop();
      var open = node.parent.open;
      var close = node.val;

      if (open && close && isOptimized(node, options)) {
        open = '(';
        close = ')';
      }

      // if a close brace exists, and the previous segment is one character
      // don't wrap the result in braces or parens
      var ele = utils.last(queue);
      if (node.parent.count > 1 && options.expand) {
        ele = multiply(queue.pop(), node.parent.count);
        node.parent.count = 1;
        queue.push(ele);
      }

      if (close && typeof ele === 'string' && ele.length === 1) {
        open = '';
        close = '';
      }

      if ((isLiteralBrace(node, options) || noInner(node)) && !node.parent.hasEmpty) {
        queue.push(utils.join(open, queue.pop() || ''));
        queue = utils.flatten(utils.join(queue, close));
      }

      if (typeof last === 'undefined') {
        prev.queue = [queue];
      } else {
        prev.queue.push(utils.flatten(utils.join(last, queue)));
      }
    })

    /**
     * eos
     */

    .set('eos', function(node) {
      if (this.input) return;

      if (options.optimize !== false) {
        this.output = utils.last(utils.flatten(this.ast.queue));
      } else if (Array.isArray(utils.last(this.ast.queue))) {
        this.output = utils.flatten(this.ast.queue.pop());
      } else {
        this.output = utils.flatten(this.ast.queue);
      }

      if (node.parent.count > 1 && options.expand) {
        this.output = multiply(this.output, node.parent.count);
      }

      this.output = utils.arrayify(this.output);
      this.ast.queue = [];
    });

};

/**
 * Multiply the segments in the current brace level
 */

function multiply(queue, n, options) {
  return utils.flatten(utils.repeat(utils.arrayify(queue), n));
}

/**
 * Return true if `node` is escaped
 */

function isEscaped(node) {
  return node.escaped === true;
}

/**
 * Returns true if regex parens should be used for sets. If the parent `type`
 * is not `brace`, then we're on a root node, which means we should never
 * expand segments and open/close braces should be `{}` (since this indicates
 * a brace is missing from the set)
 */

function isOptimized(node, options) {
  if (node.parent.isOptimized) return true;
  return isType(node.parent, 'brace')
    && !isEscaped(node.parent)
    && options.expand !== true;
}

/**
 * Returns true if the value in `node` should be wrapped in a literal brace.
 * @return {Boolean}
 */

function isLiteralBrace(node, options) {
  return isEscaped(node.parent) || options.optimize !== false;
}

/**
 * Returns true if the given `node` does not have an inner value.
 * @return {Boolean}
 */

function noInner(node, type) {
  if (node.parent.queue.length === 1) {
    return true;
  }
  var nodes = node.parent.nodes;
  return nodes.length === 3
    && isType(nodes[0], 'brace.open')
    && !isType(nodes[1], 'text')
    && isType(nodes[2], 'brace.close');
}

/**
 * Returns true if the given `node` is the given `type`
 * @return {Boolean}
 */

function isType(node, type) {
  return typeof node !== 'undefined' && node.type === type;
}

/**
 * Returns true if the given `node` has a non-empty queue.
 * @return {Boolean}
 */

function hasQueue(node) {
  return Array.isArray(node.queue) && node.queue.length;
}

},{"./utils":95}],94:[function(require,module,exports){
'use strict';

var Node = require('snapdragon-node');
var utils = require('./utils');

/**
 * Braces parsers
 */

module.exports = function(braces, options) {
  braces.parser
    .set('bos', function() {
      if (!this.parsed) {
        this.ast = this.nodes[0] = new Node(this.ast);
      }
    })

    /**
     * Character parsers
     */

    .set('escape', function() {
      var pos = this.position();
      var m = this.match(/^(?:\\(.)|\$\{)/);
      if (!m) return;

      var prev = this.prev();
      var last = utils.last(prev.nodes);

      var node = pos(new Node({
        type: 'text',
        multiplier: 1,
        val: m[0]
      }));

      if (node.val === '\\\\') {
        return node;
      }

      if (node.val === '${') {
        var str = this.input;
        var idx = -1;
        var ch;

        while ((ch = str[++idx])) {
          this.consume(1);
          node.val += ch;
          if (ch === '\\') {
            node.val += str[++idx];
            continue;
          }
          if (ch === '}') {
            break;
          }
        }
      }

      if (this.options.unescape !== false) {
        node.val = node.val.replace(/\\([{}])/g, '$1');
      }

      if (last.val === '"' && this.input.charAt(0) === '"') {
        last.val = node.val;
        this.consume(1);
        return;
      }

      return concatNodes.call(this, pos, node, prev, options);
    })

    /**
     * Brackets: "[...]" (basic, this is overridden by
     * other parsers in more advanced implementations)
     */

    .set('bracket', function() {
      var isInside = this.isInside('brace');
      var pos = this.position();
      var m = this.match(/^(?:\[([!^]?)([^\]]{2,}|\]-)(\]|[^*+?]+)|\[)/);
      if (!m) return;

      var prev = this.prev();
      var val = m[0];
      var negated = m[1] ? '^' : '';
      var inner = m[2] || '';
      var close = m[3] || '';

      if (isInside && prev.type === 'brace') {
        prev.text = prev.text || '';
        prev.text += val;
      }

      var esc = this.input.slice(0, 2);
      if (inner === '' && esc === '\\]') {
        inner += esc;
        this.consume(2);

        var str = this.input;
        var idx = -1;
        var ch;

        while ((ch = str[++idx])) {
          this.consume(1);
          if (ch === ']') {
            close = ch;
            break;
          }
          inner += ch;
        }
      }

      return pos(new Node({
        type: 'bracket',
        val: val,
        escaped: close !== ']',
        negated: negated,
        inner: inner,
        close: close
      }));
    })

    /**
     * Empty braces (we capture these early to
     * speed up processing in the compiler)
     */

    .set('multiplier', function() {
      var isInside = this.isInside('brace');
      var pos = this.position();
      var m = this.match(/^\{((?:,|\{,+\})+)\}/);
      if (!m) return;

      this.multiplier = true;
      var prev = this.prev();
      var val = m[0];

      if (isInside && prev.type === 'brace') {
        prev.text = prev.text || '';
        prev.text += val;
      }

      var node = pos(new Node({
        type: 'text',
        multiplier: 1,
        match: m,
        val: val
      }));

      return concatNodes.call(this, pos, node, prev, options);
    })

    /**
     * Open
     */

    .set('brace.open', function() {
      var pos = this.position();
      var m = this.match(/^\{(?!(?:[^\\}]?|,+)\})/);
      if (!m) return;

      var prev = this.prev();
      var last = utils.last(prev.nodes);

      // if the last parsed character was an extglob character
      // we need to _not optimize_ the brace pattern because
      // it might be mistaken for an extglob by a downstream parser
      if (last && last.val && isExtglobChar(last.val.slice(-1))) {
        last.optimize = false;
      }

      var open = pos(new Node({
        type: 'brace.open',
        val: m[0]
      }));

      var node = pos(new Node({
        type: 'brace',
        nodes: []
      }));

      node.push(open);
      prev.push(node);
      this.push('brace', node);
    })

    /**
     * Close
     */

    .set('brace.close', function() {
      var pos = this.position();
      var m = this.match(/^\}/);
      if (!m || !m[0]) return;

      var brace = this.pop('brace');
      var node = pos(new Node({
        type: 'brace.close',
        val: m[0]
      }));

      if (!this.isType(brace, 'brace')) {
        if (this.options.strict) {
          throw new Error('missing opening "{"');
        }
        node.type = 'text';
        node.multiplier = 0;
        node.escaped = true;
        return node;
      }

      var prev = this.prev();
      var last = utils.last(prev.nodes);
      if (last.text) {
        var lastNode = utils.last(last.nodes);
        if (lastNode.val === ')' && /[!@*?+]\(/.test(last.text)) {
          var open = last.nodes[0];
          var text = last.nodes[1];
          if (open.type === 'brace.open' && text && text.type === 'text') {
            text.optimize = false;
          }
        }
      }

      if (brace.nodes.length > 2) {
        var first = brace.nodes[1];
        if (first.type === 'text' && first.val === ',') {
          brace.nodes.splice(1, 1);
          brace.nodes.push(first);
        }
      }

      brace.push(node);
    })

    /**
     * Capture boundary characters
     */

    .set('boundary', function() {
      var pos = this.position();
      var m = this.match(/^[$^](?!\{)/);
      if (!m) return;
      return pos(new Node({
        type: 'text',
        val: m[0]
      }));
    })

    /**
     * One or zero, non-comma characters wrapped in braces
     */

    .set('nobrace', function() {
      var isInside = this.isInside('brace');
      var pos = this.position();
      var m = this.match(/^\{[^,]?\}/);
      if (!m) return;

      var prev = this.prev();
      var val = m[0];

      if (isInside && prev.type === 'brace') {
        prev.text = prev.text || '';
        prev.text += val;
      }

      return pos(new Node({
        type: 'text',
        multiplier: 0,
        val: val
      }));
    })

    /**
     * Text
     */

    .set('text', function() {
      var isInside = this.isInside('brace');
      var pos = this.position();
      var m = this.match(/^((?!\\)[^${}[\]])+/);
      if (!m) return;

      var prev = this.prev();
      var val = m[0];

      if (isInside && prev.type === 'brace') {
        prev.text = prev.text || '';
        prev.text += val;
      }

      var node = pos(new Node({
        type: 'text',
        multiplier: 1,
        val: val
      }));

      return concatNodes.call(this, pos, node, prev, options);
    });
};

/**
 * Returns true if the character is an extglob character.
 */

function isExtglobChar(ch) {
  return ch === '!' || ch === '@' || ch === '*' || ch === '?' || ch === '+';
}

/**
 * Combine text nodes, and calculate empty sets (`{,,}`)
 * @param {Function} `pos` Function to calculate node position
 * @param {Object} `node` AST node
 * @return {Object}
 */

function concatNodes(pos, node, parent, options) {
  node.orig = node.val;
  var prev = this.prev();
  var last = utils.last(prev.nodes);
  var isEscaped = false;

  if (node.val.length > 1) {
    var a = node.val.charAt(0);
    var b = node.val.slice(-1);

    isEscaped = (a === '"' && b === '"')
      || (a === "'" && b === "'")
      || (a === '`' && b === '`');
  }

  if (isEscaped && options.unescape !== false) {
    node.val = node.val.slice(1, node.val.length - 1);
    node.escaped = true;
  }

  if (node.match) {
    var match = node.match[1];
    if (!match || match.indexOf('}') === -1) {
      match = node.match[0];
    }

    // replace each set with a single ","
    var val = match.replace(/\{/g, ',').replace(/\}/g, '');
    node.multiplier *= val.length;
    node.val = '';
  }

  var simpleText = last.type === 'text'
    && last.multiplier === 1
    && node.multiplier === 1
    && node.val;

  if (simpleText) {
    last.val += node.val;
    return;
  }

  prev.push(node);
}

},{"./utils":95,"snapdragon-node":187}],95:[function(require,module,exports){
'use strict';

var splitString = require('split-string');
var utils = module.exports;

/**
 * Module dependencies
 */

utils.extend = require('extend-shallow');
utils.flatten = require('arr-flatten');
utils.isObject = require('isobject');
utils.fillRange = require('fill-range');
utils.repeat = require('repeat-element');
utils.unique = require('array-unique');

utils.define = function(obj, key, val) {
  Object.defineProperty(obj, key, {
    writable: true,
    configurable: true,
    enumerable: false,
    value: val
  });
};

/**
 * Returns true if the given string contains only empty brace sets.
 */

utils.isEmptySets = function(str) {
  return /^(?:\{,\})+$/.test(str);
};

/**
 * Returns true if the given string contains only empty brace sets.
 */

utils.isQuotedString = function(str) {
  var open = str.charAt(0);
  if (open === '\'' || open === '"' || open === '`') {
    return str.slice(-1) === open;
  }
  return false;
};

/**
 * Create the key to use for memoization. The unique key is generated
 * by iterating over the options and concatenating key-value pairs
 * to the pattern string.
 */

utils.createKey = function(pattern, options) {
  var id = pattern;
  if (typeof options === 'undefined') {
    return id;
  }
  var keys = Object.keys(options);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    id += ';' + key + '=' + String(options[key]);
  }
  return id;
};

/**
 * Normalize options
 */

utils.createOptions = function(options) {
  var opts = utils.extend.apply(null, arguments);
  if (typeof opts.expand === 'boolean') {
    opts.optimize = !opts.expand;
  }
  if (typeof opts.optimize === 'boolean') {
    opts.expand = !opts.optimize;
  }
  if (opts.optimize === true) {
    opts.makeRe = true;
  }
  return opts;
};

/**
 * Join patterns in `a` to patterns in `b`
 */

utils.join = function(a, b, options) {
  options = options || {};
  a = utils.arrayify(a);
  b = utils.arrayify(b);

  if (!a.length) return b;
  if (!b.length) return a;

  var len = a.length;
  var idx = -1;
  var arr = [];

  while (++idx < len) {
    var val = a[idx];
    if (Array.isArray(val)) {
      for (var i = 0; i < val.length; i++) {
        val[i] = utils.join(val[i], b, options);
      }
      arr.push(val);
      continue;
    }

    for (var j = 0; j < b.length; j++) {
      var bval = b[j];

      if (Array.isArray(bval)) {
        arr.push(utils.join(val, bval, options));
      } else {
        arr.push(val + bval);
      }
    }
  }
  return arr;
};

/**
 * Split the given string on `,` if not escaped.
 */

utils.split = function(str, options) {
  var opts = utils.extend({sep: ','}, options);
  if (typeof opts.keepQuotes !== 'boolean') {
    opts.keepQuotes = true;
  }
  if (opts.unescape === false) {
    opts.keepEscaping = true;
  }
  return splitString(str, opts, utils.escapeBrackets(opts));
};

/**
 * Expand ranges or sets in the given `pattern`.
 *
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object}
 */

utils.expand = function(str, options) {
  var opts = utils.extend({rangeLimit: 10000}, options);
  var segs = utils.split(str, opts);
  var tok = { segs: segs };

  if (utils.isQuotedString(str)) {
    return tok;
  }

  if (opts.rangeLimit === true) {
    opts.rangeLimit = 10000;
  }

  if (segs.length > 1) {
    if (opts.optimize === false) {
      tok.val = segs[0];
      return tok;
    }

    tok.segs = utils.stringifyArray(tok.segs);
  } else if (segs.length === 1) {
    var arr = str.split('..');

    if (arr.length === 1) {
      tok.val = tok.segs[tok.segs.length - 1] || tok.val || str;
      tok.segs = [];
      return tok;
    }

    if (arr.length === 2 && arr[0] === arr[1]) {
      tok.escaped = true;
      tok.val = arr[0];
      tok.segs = [];
      return tok;
    }

    if (arr.length > 1) {
      if (opts.optimize !== false) {
        opts.optimize = true;
        delete opts.expand;
      }

      if (opts.optimize !== true) {
        var min = Math.min(arr[0], arr[1]);
        var max = Math.max(arr[0], arr[1]);
        var step = arr[2] || 1;

        if (opts.rangeLimit !== false && ((max - min) / step >= opts.rangeLimit)) {
          throw new RangeError('expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.');
        }
      }

      arr.push(opts);
      tok.segs = utils.fillRange.apply(null, arr);

      if (!tok.segs.length) {
        tok.escaped = true;
        tok.val = str;
        return tok;
      }

      if (opts.optimize === true) {
        tok.segs = utils.stringifyArray(tok.segs);
      }

      if (tok.segs === '') {
        tok.val = str;
      } else {
        tok.val = tok.segs[0];
      }
      return tok;
    }
  } else {
    tok.val = str;
  }
  return tok;
};

/**
 * Ensure commas inside brackets and parens are not split.
 * @param {Object} `tok` Token from the `split-string` module
 * @return {undefined}
 */

utils.escapeBrackets = function(options) {
  return function(tok) {
    if (tok.escaped && tok.val === 'b') {
      tok.val = '\\b';
      return;
    }

    if (tok.val !== '(' && tok.val !== '[') return;
    var opts = utils.extend({}, options);
    var brackets = [];
    var parens = [];
    var stack = [];
    var val = tok.val;
    var str = tok.str;
    var i = tok.idx - 1;

    while (++i < str.length) {
      var ch = str[i];

      if (ch === '\\') {
        val += (opts.keepEscaping === false ? '' : ch) + str[++i];
        continue;
      }

      if (ch === '(') {
        parens.push(ch);
        stack.push(ch);
      }

      if (ch === '[') {
        brackets.push(ch);
        stack.push(ch);
      }

      if (ch === ')') {
        parens.pop();
        stack.pop();
        if (!stack.length) {
          val += ch;
          break;
        }
      }

      if (ch === ']') {
        brackets.pop();
        stack.pop();
        if (!stack.length) {
          val += ch;
          break;
        }
      }
      val += ch;
    }

    tok.split = false;
    tok.val = val.slice(1);
    tok.idx = i;
  };
};

/**
 * Returns true if the given string looks like a regex quantifier
 * @return {Boolean}
 */

utils.isQuantifier = function(str) {
  return /^(?:[0-9]?,[0-9]|[0-9],)$/.test(str);
};

/**
 * Cast `val` to an array.
 * @param {*} `val`
 */

utils.stringifyArray = function(arr) {
  return [utils.arrayify(arr).join('|')];
};

/**
 * Cast `val` to an array.
 * @param {*} `val`
 */

utils.arrayify = function(arr) {
  if (typeof arr === 'undefined') {
    return [];
  }
  if (typeof arr === 'string') {
    return [arr];
  }
  return arr;
};

/**
 * Returns true if the given `str` is a non-empty string
 * @return {Boolean}
 */

utils.isString = function(str) {
  return str != null && typeof str === 'string';
};

/**
 * Get the last element from `array`
 * @param {Array} `array`
 * @return {*}
 */

utils.last = function(arr, n) {
  return arr[arr.length - (n || 1)];
};

utils.escapeRegex = function(str) {
  return str.replace(/\\?([!^*?()[\]{}+?/])/g, '\\$1');
};

},{"arr-flatten":82,"array-unique":84,"extend-shallow":96,"fill-range":129,"isobject":150,"repeat-element":176,"split-string":217}],96:[function(require,module,exports){
'use strict';

var isObject = require('is-extendable');

module.exports = function extend(o/*, objects*/) {
  if (!isObject(o)) { o = {}; }

  var len = arguments.length;
  for (var i = 1; i < len; i++) {
    var obj = arguments[i];

    if (isObject(obj)) {
      assign(o, obj);
    }
  }
  return o;
};

function assign(a, b) {
  for (var key in b) {
    if (hasOwn(b, key)) {
      a[key] = b[key];
    }
  }
}

/**
 * Returns true if the given `key` is an own property of `obj`.
 */

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

},{"is-extendable":144}],97:[function(require,module,exports){
'use strict';

var isObject = require('isobject');
var Emitter = require('component-emitter');
var visit = require('collection-visit');
var toPath = require('to-object-path');
var union = require('union-value');
var del = require('unset-value');
var get = require('get-value');
var has = require('has-value');
var set = require('set-value');

/**
 * Create a `Cache` constructor that when instantiated will
 * store values on the given `prop`.
 *
 * ```js
 * var Cache = require('cache-base').namespace('data');
 * var cache = new Cache();
 *
 * cache.set('foo', 'bar');
 * //=> {data: {foo: 'bar'}}
 * ```
 * @param {String} `prop` The property name to use for storing values.
 * @return {Function} Returns a custom `Cache` constructor
 * @api public
 */

function namespace(prop) {

  /**
   * Create a new `Cache`. Internally the `Cache` constructor is created using
   * the `namespace` function, with `cache` defined as the storage object.
   *
   * ```js
   * var app = new Cache();
   * ```
   * @param {Object} `cache` Optionally pass an object to initialize with.
   * @constructor
   * @api public
   */

  function Cache(cache) {
    if (prop) {
      this[prop] = {};
    }
    if (cache) {
      this.set(cache);
    }
  }

  /**
   * Inherit Emitter
   */

  Emitter(Cache.prototype);

  /**
   * Assign `value` to `key`. Also emits `set` with
   * the key and value.
   *
   * ```js
   * app.on('set', function(key, val) {
   *   // do something when `set` is emitted
   * });
   *
   * app.set(key, value);
   *
   * // also takes an object or array
   * app.set({name: 'Halle'});
   * app.set([{foo: 'bar'}, {baz: 'quux'}]);
   * console.log(app);
   * //=> {name: 'Halle', foo: 'bar', baz: 'quux'}
   * ```
   *
   * @name .set
   * @emits `set` with `key` and `value` as arguments.
   * @param {String} `key`
   * @param {any} `value`
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  Cache.prototype.set = function(key, val) {
    if (Array.isArray(key) && arguments.length === 2) {
      key = toPath(key);
    }
    if (isObject(key) || Array.isArray(key)) {
      this.visit('set', key);
    } else {
      set(prop ? this[prop] : this, key, val);
      this.emit('set', key, val);
    }
    return this;
  };

  /**
   * Union `array` to `key`. Also emits `set` with
   * the key and value.
   *
   * ```js
   * app.union('a.b', ['foo']);
   * app.union('a.b', ['bar']);
   * console.log(app.get('a'));
   * //=> {b: ['foo', 'bar']}
   * ```
   * @name .union
   * @param {String} `key`
   * @param {any} `value`
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  Cache.prototype.union = function(key, val) {
    if (Array.isArray(key) && arguments.length === 2) {
      key = toPath(key);
    }
    var ctx = prop ? this[prop] : this;
    union(ctx, key, arrayify(val));
    this.emit('union', val);
    return this;
  };

  /**
   * Return the value of `key`. Dot notation may be used
   * to get [nested property values][get-value].
   *
   * ```js
   * app.set('a.b.c', 'd');
   * app.get('a.b');
   * //=> {c: 'd'}
   *
   * app.get(['a', 'b']);
   * //=> {c: 'd'}
   * ```
   *
   * @name .get
   * @emits `get` with `key` and `value` as arguments.
   * @param {String} `key` The name of the property to get. Dot-notation may be used.
   * @return {any} Returns the value of `key`
   * @api public
   */

  Cache.prototype.get = function(key) {
    key = toPath(arguments);

    var ctx = prop ? this[prop] : this;
    var val = get(ctx, key);

    this.emit('get', key, val);
    return val;
  };

  /**
   * Return true if app has a stored value for `key`,
   * false only if value is `undefined`.
   *
   * ```js
   * app.set('foo', 'bar');
   * app.has('foo');
   * //=> true
   * ```
   *
   * @name .has
   * @emits `has` with `key` and true or false as arguments.
   * @param {String} `key`
   * @return {Boolean}
   * @api public
   */

  Cache.prototype.has = function(key) {
    key = toPath(arguments);

    var ctx = prop ? this[prop] : this;
    var val = get(ctx, key);

    var has = typeof val !== 'undefined';
    this.emit('has', key, has);
    return has;
  };

  /**
   * Delete one or more properties from the instance.
   *
   * ```js
   * app.del(); // delete all
   * // or
   * app.del('foo');
   * // or
   * app.del(['foo', 'bar']);
   * ```
   * @name .del
   * @emits `del` with the `key` as the only argument.
   * @param {String|Array} `key` Property name or array of property names.
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  Cache.prototype.del = function(key) {
    if (Array.isArray(key)) {
      this.visit('del', key);
    } else {
      del(prop ? this[prop] : this, key);
      this.emit('del', key);
    }
    return this;
  };

  /**
   * Reset the entire cache to an empty object.
   *
   * ```js
   * app.clear();
   * ```
   * @api public
   */

  Cache.prototype.clear = function() {
    if (prop) {
      this[prop] = {};
    }
  };

  /**
   * Visit `method` over the properties in the given object, or map
   * visit over the object-elements in an array.
   *
   * @name .visit
   * @param {String} `method` The name of the `base` method to call.
   * @param {Object|Array} `val` The object or array to iterate over.
   * @return {Object} Returns the instance for chaining.
   * @api public
   */

  Cache.prototype.visit = function(method, val) {
    visit(this, method, val);
    return this;
  };

  return Cache;
}

/**
 * Cast val to an array
 */

function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}

/**
 * Expose `Cache`
 */

module.exports = namespace();

/**
 * Expose `Cache.namespace`
 */

module.exports.namespace = namespace;

},{"collection-visit":100,"component-emitter":101,"get-value":133,"has-value":134,"isobject":150,"set-value":185,"to-object-path":220,"union-value":224,"unset-value":227}],98:[function(require,module,exports){
'use strict';

var util = require('util');
var union = require('arr-union');
var define = require('define-property');
var staticExtend = require('static-extend');
var isObj = require('isobject');

/**
 * Expose class utils
 */

var cu = module.exports;

/**
 * Expose class utils: `cu`
 */

cu.isObject = function isObject(val) {
  return isObj(val) || typeof val === 'function';
};

/**
 * Returns true if an array has any of the given elements, or an
 * object has any of the give keys.
 *
 * ```js
 * cu.has(['a', 'b', 'c'], 'c');
 * //=> true
 *
 * cu.has(['a', 'b', 'c'], ['c', 'z']);
 * //=> true
 *
 * cu.has({a: 'b', c: 'd'}, ['c', 'z']);
 * //=> true
 * ```
 * @param {Object} `obj`
 * @param {String|Array} `val`
 * @return {Boolean}
 * @api public
 */

cu.has = function has(obj, val) {
  val = cu.arrayify(val);
  var len = val.length;

  if (cu.isObject(obj)) {
    for (var key in obj) {
      if (val.indexOf(key) > -1) {
        return true;
      }
    }

    var keys = cu.nativeKeys(obj);
    return cu.has(keys, val);
  }

  if (Array.isArray(obj)) {
    var arr = obj;
    while (len--) {
      if (arr.indexOf(val[len]) > -1) {
        return true;
      }
    }
    return false;
  }

  throw new TypeError('expected an array or object.');
};

/**
 * Returns true if an array or object has all of the given values.
 *
 * ```js
 * cu.hasAll(['a', 'b', 'c'], 'c');
 * //=> true
 *
 * cu.hasAll(['a', 'b', 'c'], ['c', 'z']);
 * //=> false
 *
 * cu.hasAll({a: 'b', c: 'd'}, ['c', 'z']);
 * //=> false
 * ```
 * @param {Object|Array} `val`
 * @param {String|Array} `values`
 * @return {Boolean}
 * @api public
 */

cu.hasAll = function hasAll(val, values) {
  values = cu.arrayify(values);
  var len = values.length;
  while (len--) {
    if (!cu.has(val, values[len])) {
      return false;
    }
  }
  return true;
};

/**
 * Cast the given value to an array.
 *
 * ```js
 * cu.arrayify('foo');
 * //=> ['foo']
 *
 * cu.arrayify(['foo']);
 * //=> ['foo']
 * ```
 *
 * @param {String|Array} `val`
 * @return {Array}
 * @api public
 */

cu.arrayify = function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Noop
 */

cu.noop = function noop() {
  return;
};

/**
 * Returns the first argument passed to the function.
 */

cu.identity = function identity(val) {
  return val;
};

/**
 * Returns true if a value has a `contructor`
 *
 * ```js
 * cu.hasConstructor({});
 * //=> true
 *
 * cu.hasConstructor(Object.create(null));
 * //=> false
 * ```
 * @param  {Object} `value`
 * @return {Boolean}
 * @api public
 */

cu.hasConstructor = function hasConstructor(val) {
  return cu.isObject(val) && typeof val.constructor !== 'undefined';
};

/**
 * Get the native `ownPropertyNames` from the constructor of the
 * given `object`. An empty array is returned if the object does
 * not have a constructor.
 *
 * ```js
 * cu.nativeKeys({a: 'b', b: 'c', c: 'd'})
 * //=> ['a', 'b', 'c']
 *
 * cu.nativeKeys(function(){})
 * //=> ['length', 'caller']
 * ```
 *
 * @param  {Object} `obj` Object that has a `constructor`.
 * @return {Array} Array of keys.
 * @api public
 */

cu.nativeKeys = function nativeKeys(val) {
  if (!cu.hasConstructor(val)) return [];
  var keys = Object.getOwnPropertyNames(val);
  if ('caller' in val) keys.push('caller');
  return keys;
};

/**
 * Returns property descriptor `key` if it's an "own" property
 * of the given object.
 *
 * ```js
 * function App() {}
 * Object.defineProperty(App.prototype, 'count', {
 *   get: function() {
 *     return Object.keys(this).length;
 *   }
 * });
 * cu.getDescriptor(App.prototype, 'count');
 * // returns:
 * // {
 * //   get: [Function],
 * //   set: undefined,
 * //   enumerable: false,
 * //   configurable: false
 * // }
 * ```
 *
 * @param {Object} `obj`
 * @param {String} `key`
 * @return {Object} Returns descriptor `key`
 * @api public
 */

cu.getDescriptor = function getDescriptor(obj, key) {
  if (!cu.isObject(obj)) {
    throw new TypeError('expected an object.');
  }
  if (typeof key !== 'string') {
    throw new TypeError('expected key to be a string.');
  }
  return Object.getOwnPropertyDescriptor(obj, key);
};

/**
 * Copy a descriptor from one object to another.
 *
 * ```js
 * function App() {}
 * Object.defineProperty(App.prototype, 'count', {
 *   get: function() {
 *     return Object.keys(this).length;
 *   }
 * });
 * var obj = {};
 * cu.copyDescriptor(obj, App.prototype, 'count');
 * ```
 * @param {Object} `receiver`
 * @param {Object} `provider`
 * @param {String} `name`
 * @return {Object}
 * @api public
 */

cu.copyDescriptor = function copyDescriptor(receiver, provider, name) {
  if (!cu.isObject(receiver)) {
    throw new TypeError('expected receiving object to be an object.');
  }
  if (!cu.isObject(provider)) {
    throw new TypeError('expected providing object to be an object.');
  }
  if (typeof name !== 'string') {
    throw new TypeError('expected name to be a string.');
  }

  var val = cu.getDescriptor(provider, name);
  if (val) Object.defineProperty(receiver, name, val);
};

/**
 * Copy static properties, prototype properties, and descriptors
 * from one object to another.
 *
 * @param {Object} `receiver`
 * @param {Object} `provider`
 * @param {String|Array} `omit` One or more properties to omit
 * @return {Object}
 * @api public
 */

cu.copy = function copy(receiver, provider, omit) {
  if (!cu.isObject(receiver)) {
    throw new TypeError('expected receiving object to be an object.');
  }
  if (!cu.isObject(provider)) {
    throw new TypeError('expected providing object to be an object.');
  }
  var props = Object.getOwnPropertyNames(provider);
  var keys = Object.keys(provider);
  var len = props.length,
    key;
  omit = cu.arrayify(omit);

  while (len--) {
    key = props[len];

    if (cu.has(keys, key)) {
      define(receiver, key, provider[key]);
    } else if (!(key in receiver) && !cu.has(omit, key)) {
      cu.copyDescriptor(receiver, provider, key);
    }
  }
};

/**
 * Inherit the static properties, prototype properties, and descriptors
 * from of an object.
 *
 * @param {Object} `receiver`
 * @param {Object} `provider`
 * @param {String|Array} `omit` One or more properties to omit
 * @return {Object}
 * @api public
 */

cu.inherit = function inherit(receiver, provider, omit) {
  if (!cu.isObject(receiver)) {
    throw new TypeError('expected receiving object to be an object.');
  }
  if (!cu.isObject(provider)) {
    throw new TypeError('expected providing object to be an object.');
  }

  var keys = [];
  for (var key in provider) {
    keys.push(key);
    receiver[key] = provider[key];
  }

  keys = keys.concat(cu.arrayify(omit));

  var a = provider.prototype || provider;
  var b = receiver.prototype || receiver;
  cu.copy(b, a, keys);
};

/**
 * Returns a function for extending the static properties,
 * prototype properties, and descriptors from the `Parent`
 * constructor onto `Child` constructors.
 *
 * ```js
 * var extend = cu.extend(Parent);
 * Parent.extend(Child);
 *
 * // optional methods
 * Parent.extend(Child, {
 *   foo: function() {},
 *   bar: function() {}
 * });
 * ```
 * @param {Function} `Parent` Parent ctor
 * @param {Function} `extend` Optional extend function to handle custom extensions. Useful when updating methods that require a specific prototype.
 *   @param {Function} `Child` Child ctor
 *   @param {Object} `proto` Optionally pass additional prototype properties to inherit.
 *   @return {Object}
 * @api public
 */

cu.extend = function() {
  // keep it lazy, instead of assigning to `cu.extend`
  return staticExtend.apply(null, arguments);
};

/**
 * Bubble up events emitted from static methods on the Parent ctor.
 *
 * @param {Object} `Parent`
 * @param {Array} `events` Event names to bubble up
 * @api public
 */

cu.bubble = function(Parent, events) {
  events = events || [];
  Parent.bubble = function(Child, arr) {
    if (Array.isArray(arr)) {
      events = union([], events, arr);
    }
    var len = events.length;
    var idx = -1;
    while (++idx < len) {
      var name = events[idx];
      Parent.on(name, Child.emit.bind(Child, name));
    }
    cu.bubble(Child, events);
  };
};

},{"arr-union":83,"define-property":99,"isobject":150,"static-extend":218,"util":6}],99:[function(require,module,exports){
/*!
 * define-property <https://github.com/jonschlinkert/define-property>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isDescriptor = require('is-descriptor');

module.exports = function defineProperty(obj, prop, val) {
  if (typeof obj !== 'object' && typeof obj !== 'function') {
    throw new TypeError('expected an object or function.');
  }

  if (typeof prop !== 'string') {
    throw new TypeError('expected `prop` to be a string.');
  }

  if (isDescriptor(val) && ('set' in val || 'get' in val)) {
    return Object.defineProperty(obj, prop, val);
  }

  return Object.defineProperty(obj, prop, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: val
  });
};

},{"is-descriptor":142}],100:[function(require,module,exports){
/*!
 * collection-visit <https://github.com/jonschlinkert/collection-visit>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var visit = require('object-visit');
var mapVisit = require('map-visit');

module.exports = function(collection, method, val) {
  var result;

  if (typeof val === 'string' && (method in collection)) {
    var args = [].slice.call(arguments, 2);
    result = collection[method].apply(collection, args);
  } else if (Array.isArray(val)) {
    result = mapVisit.apply(null, arguments);
  } else {
    result = visit.apply(null, arguments);
  }

  if (typeof result !== 'undefined') {
    return result;
  }

  return collection;
};

},{"map-visit":154,"object-visit":171}],101:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],102:[function(require,module,exports){
/*!
 * copy-descriptor <https://github.com/jonschlinkert/copy-descriptor>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Copy a descriptor from one object to another.
 *
 * ```js
 * function App() {
 *   this.cache = {};
 * }
 * App.prototype.set = function(key, val) {
 *   this.cache[key] = val;
 *   return this;
 * };
 * Object.defineProperty(App.prototype, 'count', {
 *   get: function() {
 *     return Object.keys(this.cache).length;
 *   }
 * });
 *
 * copy(App.prototype, 'count', 'len');
 *
 * // create an instance
 * var app = new App();
 *
 * app.set('a', true);
 * app.set('b', true);
 * app.set('c', true);
 *
 * console.log(app.count);
 * //=> 3
 * console.log(app.len);
 * //=> 3
 * ```
 * @name copy
 * @param {Object} `receiver` The target object
 * @param {Object} `provider` The provider object
 * @param {String} `from` The key to copy on provider.
 * @param {String} `to` Optionally specify a new key name to use.
 * @return {Object}
 * @api public
 */

module.exports = function copyDescriptor(receiver, provider, from, to) {
  if (!isObject(provider) && typeof provider !== 'function') {
    to = from;
    from = provider;
    provider = receiver;
  }
  if (!isObject(receiver) && typeof receiver !== 'function') {
    throw new TypeError('expected the first argument to be an object');
  }
  if (!isObject(provider) && typeof provider !== 'function') {
    throw new TypeError('expected provider to be an object');
  }

  if (typeof to !== 'string') {
    to = from;
  }
  if (typeof from !== 'string') {
    throw new TypeError('expected key to be a string');
  }

  if (!(from in provider)) {
    throw new Error('property "' + from + '" does not exist');
  }

  var val = Object.getOwnPropertyDescriptor(provider, from);
  if (val) Object.defineProperty(receiver, to, val);
};

function isObject(val) {
  return {}.toString.call(val) === '[object Object]';
}


},{}],103:[function(require,module,exports){
/*!
 * define-property <https://github.com/jonschlinkert/define-property>
 *
 * Copyright (c) 2015-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var isobject = require('isobject');
var isDescriptor = require('is-descriptor');
var define = (typeof Reflect !== 'undefined' && Reflect.defineProperty)
  ? Reflect.defineProperty
  : Object.defineProperty;

module.exports = function defineProperty(obj, key, val) {
  if (!isobject(obj) && typeof obj !== 'function' && !Array.isArray(obj)) {
    throw new TypeError('expected an object, function, or array');
  }

  if (typeof key !== 'string') {
    throw new TypeError('expected "key" to be a string');
  }

  if (isDescriptor(val)) {
    define(obj, key, val);
    return obj;
  }

  define(obj, key, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: val
  });

  return obj;
};

},{"is-descriptor":106,"isobject":150}],104:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"dup":88,"kind-of":152}],105:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"dup":89,"kind-of":152}],106:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90,"is-accessor-descriptor":104,"is-data-descriptor":105,"kind-of":152}],107:[function(require,module,exports){
(function (__filename){
'use strict';

/**
 * Local dependencies
 */

var compilers = require('./lib/compilers');
var parsers = require('./lib/parsers');

/**
 * Module dependencies
 */

var debug = require('debug')('expand-brackets');
var extend = require('extend-shallow');
var Snapdragon = require('snapdragon');
var toRegex = require('to-regex');

/**
 * Parses the given POSIX character class `pattern` and returns a
 * string that can be used for creating regular expressions for matching.
 *
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object}
 * @api public
 */

function brackets(pattern, options) {
  debug('initializing from <%s>', __filename);
  var res = brackets.create(pattern, options);
  return res.output;
}

/**
 * Takes an array of strings and a POSIX character class pattern, and returns a new
 * array with only the strings that matched the pattern.
 *
 * ```js
 * var brackets = require('expand-brackets');
 * console.log(brackets.match(['1', 'a', 'ab'], '[[:alpha:]]'));
 * //=> ['a']
 *
 * console.log(brackets.match(['1', 'a', 'ab'], '[[:alpha:]]+'));
 * //=> ['a', 'ab']
 * ```
 * @param {Array} `arr` Array of strings to match
 * @param {String} `pattern` POSIX character class pattern(s)
 * @param {Object} `options`
 * @return {Array}
 * @api public
 */

brackets.match = function(arr, pattern, options) {
  arr = [].concat(arr);
  var opts = extend({}, options);
  var isMatch = brackets.matcher(pattern, opts);
  var len = arr.length;
  var idx = -1;
  var res = [];

  while (++idx < len) {
    var ele = arr[idx];
    if (isMatch(ele)) {
      res.push(ele);
    }
  }

  if (res.length === 0) {
    if (opts.failglob === true) {
      throw new Error('no matches found for "' + pattern + '"');
    }

    if (opts.nonull === true || opts.nullglob === true) {
      return [pattern.split('\\').join('')];
    }
  }
  return res;
};

/**
 * Returns true if the specified `string` matches the given
 * brackets `pattern`.
 *
 * ```js
 * var brackets = require('expand-brackets');
 *
 * console.log(brackets.isMatch('a.a', '[[:alpha:]].[[:alpha:]]'));
 * //=> true
 * console.log(brackets.isMatch('1.2', '[[:alpha:]].[[:alpha:]]'));
 * //=> false
 * ```
 * @param {String} `string` String to match
 * @param {String} `pattern` Poxis pattern
 * @param {String} `options`
 * @return {Boolean}
 * @api public
 */

brackets.isMatch = function(str, pattern, options) {
  return brackets.matcher(pattern, options)(str);
};

/**
 * Takes a POSIX character class pattern and returns a matcher function. The returned
 * function takes the string to match as its only argument.
 *
 * ```js
 * var brackets = require('expand-brackets');
 * var isMatch = brackets.matcher('[[:lower:]].[[:upper:]]');
 *
 * console.log(isMatch('a.a'));
 * //=> false
 * console.log(isMatch('a.A'));
 * //=> true
 * ```
 * @param {String} `pattern` Poxis pattern
 * @param {String} `options`
 * @return {Boolean}
 * @api public
 */

brackets.matcher = function(pattern, options) {
  var re = brackets.makeRe(pattern, options);
  return function(str) {
    return re.test(str);
  };
};

/**
 * Create a regular expression from the given `pattern`.
 *
 * ```js
 * var brackets = require('expand-brackets');
 * var re = brackets.makeRe('[[:alpha:]]');
 * console.log(re);
 * //=> /^(?:[a-zA-Z])$/
 * ```
 * @param {String} `pattern` The pattern to convert to regex.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

brackets.makeRe = function(pattern, options) {
  var res = brackets.create(pattern, options);
  var opts = extend({strictErrors: false}, options);
  return toRegex(res.output, opts);
};

/**
 * Parses the given POSIX character class `pattern` and returns an object
 * with the compiled `output` and optional source `map`.
 *
 * ```js
 * var brackets = require('expand-brackets');
 * console.log(brackets('[[:alpha:]]'));
 * // { options: { source: 'string' },
 * //   input: '[[:alpha:]]',
 * //   state: {},
 * //   compilers:
 * //    { eos: [Function],
 * //      noop: [Function],
 * //      bos: [Function],
 * //      not: [Function],
 * //      escape: [Function],
 * //      text: [Function],
 * //      posix: [Function],
 * //      bracket: [Function],
 * //      'bracket.open': [Function],
 * //      'bracket.inner': [Function],
 * //      'bracket.literal': [Function],
 * //      'bracket.close': [Function] },
 * //   output: '[a-zA-Z]',
 * //   ast:
 * //    { type: 'root',
 * //      errors: [],
 * //      nodes: [ [Object], [Object], [Object] ] },
 * //   parsingErrors: [] }
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {Object}
 * @api public
 */

brackets.create = function(pattern, options) {
  var snapdragon = (options && options.snapdragon) || new Snapdragon(options);
  compilers(snapdragon);
  parsers(snapdragon);

  var ast = snapdragon.parse(pattern, options);
  ast.input = pattern;
  var res = snapdragon.compile(ast, options);
  res.input = pattern;
  return res;
};

/**
 * Expose `brackets` constructor, parsers and compilers
 */

brackets.compilers = compilers;
brackets.parsers = parsers;

/**
 * Expose `brackets`
 * @type {Function}
 */

module.exports = brackets;

}).call(this,"/node_modules\\expand-brackets\\index.js")
},{"./lib/compilers":108,"./lib/parsers":109,"debug":111,"extend-shallow":114,"snapdragon":194,"to-regex":223}],108:[function(require,module,exports){
'use strict';

var posix = require('posix-character-classes');

module.exports = function(brackets) {
  brackets.compiler

    /**
     * Escaped characters
     */

    .set('escape', function(node) {
      return this.emit('\\' + node.val.replace(/^\\/, ''), node);
    })

    /**
     * Text
     */

    .set('text', function(node) {
      return this.emit(node.val.replace(/([{}])/g, '\\$1'), node);
    })

    /**
     * POSIX character classes
     */

    .set('posix', function(node) {
      if (node.val === '[::]') {
        return this.emit('\\[::\\]', node);
      }

      var val = posix[node.inner];
      if (typeof val === 'undefined') {
        val = '[' + node.inner + ']';
      }
      return this.emit(val, node);
    })

    /**
     * Non-posix brackets
     */

    .set('bracket', function(node) {
      return this.mapVisit(node.nodes);
    })
    .set('bracket.open', function(node) {
      return this.emit(node.val, node);
    })
    .set('bracket.inner', function(node) {
      var inner = node.val;

      if (inner === '[' || inner === ']') {
        return this.emit('\\' + node.val, node);
      }
      if (inner === '^]') {
        return this.emit('^\\]', node);
      }
      if (inner === '^') {
        return this.emit('^', node);
      }

      if (/-/.test(inner) && !/(\d-\d|\w-\w)/.test(inner)) {
        inner = inner.split('-').join('\\-');
      }

      var isNegated = inner.charAt(0) === '^';
      // add slashes to negated brackets, per spec
      if (isNegated && inner.indexOf('/') === -1) {
        inner += '/';
      }
      if (isNegated && inner.indexOf('.') === -1) {
        inner += '.';
      }

      // don't unescape `0` (octal literal)
      inner = inner.replace(/\\([1-9])/g, '$1');
      return this.emit(inner, node);
    })
    .set('bracket.close', function(node) {
      var val = node.val.replace(/^\\/, '');
      if (node.parent.escaped === true) {
        return this.emit('\\' + val, node);
      }
      return this.emit(val, node);
    });
};

},{"posix-character-classes":174}],109:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var define = require('define-property');

/**
 * Text regex
 */

var TEXT_REGEX = '(\\[(?=.*\\])|\\])+';
var not = utils.createRegex(TEXT_REGEX);

/**
 * Brackets parsers
 */

function parsers(brackets) {
  brackets.state = brackets.state || {};
  brackets.parser.sets.bracket = brackets.parser.sets.bracket || [];
  brackets.parser

    .capture('escape', function() {
      if (this.isInside('bracket')) return;
      var pos = this.position();
      var m = this.match(/^\\(.)/);
      if (!m) return;

      return pos({
        type: 'escape',
        val: m[0]
      });
    })

    /**
     * Text parser
     */

    .capture('text', function() {
      if (this.isInside('bracket')) return;
      var pos = this.position();
      var m = this.match(not);
      if (!m || !m[0]) return;

      return pos({
        type: 'text',
        val: m[0]
      });
    })

    /**
     * POSIX character classes: "[[:alpha:][:digits:]]"
     */

    .capture('posix', function() {
      var pos = this.position();
      var m = this.match(/^\[:(.*?):\](?=.*\])/);
      if (!m) return;

      var inside = this.isInside('bracket');
      if (inside) {
        brackets.posix++;
      }

      return pos({
        type: 'posix',
        insideBracket: inside,
        inner: m[1],
        val: m[0]
      });
    })

    /**
     * Bracket (noop)
     */

    .capture('bracket', function() {})

    /**
     * Open: '['
     */

    .capture('bracket.open', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\[(?=.*\])/);
      if (!m) return;

      var prev = this.prev();
      var last = utils.last(prev.nodes);

      if (parsed.slice(-1) === '\\' && !this.isInside('bracket')) {
        last.val = last.val.slice(0, last.val.length - 1);
        return pos({
          type: 'escape',
          val: m[0]
        });
      }

      var open = pos({
        type: 'bracket.open',
        val: m[0]
      });

      if (last.type === 'bracket.open' || this.isInside('bracket')) {
        open.val = '\\' + open.val;
        open.type = 'bracket.inner';
        open.escaped = true;
        return open;
      }

      var node = pos({
        type: 'bracket',
        nodes: [open]
      });

      define(node, 'parent', prev);
      define(open, 'parent', node);
      this.push('bracket', node);
      prev.nodes.push(node);
    })

    /**
     * Bracket text
     */

    .capture('bracket.inner', function() {
      if (!this.isInside('bracket')) return;
      var pos = this.position();
      var m = this.match(not);
      if (!m || !m[0]) return;

      var next = this.input.charAt(0);
      var val = m[0];

      var node = pos({
        type: 'bracket.inner',
        val: val
      });

      if (val === '\\\\') {
        return node;
      }

      var first = val.charAt(0);
      var last = val.slice(-1);

      if (first === '!') {
        val = '^' + val.slice(1);
      }

      if (last === '\\' || (val === '^' && next === ']')) {
        val += this.input[0];
        this.consume(1);
      }

      node.val = val;
      return node;
    })

    /**
     * Close: ']'
     */

    .capture('bracket.close', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\]/);
      if (!m) return;

      var prev = this.prev();
      var last = utils.last(prev.nodes);

      if (parsed.slice(-1) === '\\' && !this.isInside('bracket')) {
        last.val = last.val.slice(0, last.val.length - 1);

        return pos({
          type: 'escape',
          val: m[0]
        });
      }

      var node = pos({
        type: 'bracket.close',
        rest: this.input,
        val: m[0]
      });

      if (last.type === 'bracket.open') {
        node.type = 'bracket.inner';
        node.escaped = true;
        return node;
      }

      var bracket = this.pop('bracket');
      if (!this.isType(bracket, 'bracket')) {
        if (this.options.strict) {
          throw new Error('missing opening "["');
        }
        node.type = 'bracket.inner';
        node.escaped = true;
        return node;
      }

      bracket.nodes.push(node);
      define(node, 'parent', bracket);
    });
}

/**
 * Brackets parsers
 */

module.exports = parsers;

/**
 * Expose text regex
 */

module.exports.TEXT_REGEX = TEXT_REGEX;

},{"./utils":110,"define-property":113}],110:[function(require,module,exports){
'use strict';

var toRegex = require('to-regex');
var regexNot = require('regex-not');
var cached;

/**
 * Get the last element from `array`
 * @param {Array} `array`
 * @return {*}
 */

exports.last = function(arr) {
  return arr[arr.length - 1];
};

/**
 * Create and cache regex to use for text nodes
 */

exports.createRegex = function(pattern, include) {
  if (cached) return cached;
  var opts = {contains: true, strictClose: false};
  var not = regexNot.create(pattern, opts);
  var re;

  if (typeof include === 'string') {
    re = toRegex('^(?:' + include + '|' + not + ')', opts);
  } else {
    re = toRegex(not, opts);
  }

  return (cached = re);
};

},{"regex-not":175,"to-regex":223}],111:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":112,"_process":3}],112:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":162}],113:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"dup":99,"is-descriptor":142}],114:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"dup":96,"is-extendable":144}],115:[function(require,module,exports){
'use strict';

var isExtendable = require('is-extendable');
var assignSymbols = require('assign-symbols');

module.exports = Object.assign || function(obj/*, objects*/) {
  if (obj === null || typeof obj === 'undefined') {
    throw new TypeError('Cannot convert undefined or null to object');
  }
  if (!isObject(obj)) {
    obj = {};
  }
  for (var i = 1; i < arguments.length; i++) {
    var val = arguments[i];
    if (isString(val)) {
      val = toObject(val);
    }
    if (isObject(val)) {
      assign(obj, val);
      assignSymbols(obj, val);
    }
  }
  return obj;
};

function assign(a, b) {
  for (var key in b) {
    if (hasOwn(b, key)) {
      a[key] = b[key];
    }
  }
}

function isString(val) {
  return (val && typeof val === 'string');
}

function toObject(str) {
  var obj = {};
  for (var i in str) {
    obj[i] = str[i];
  }
  return obj;
}

function isObject(val) {
  return (val && typeof val === 'object') || isExtendable(val);
}

/**
 * Returns true if the given `key` is an own property of `obj`.
 */

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function isEnum(obj, key) {
  return Object.prototype.propertyIsEnumerable.call(obj, key);
}

},{"assign-symbols":85,"is-extendable":116}],116:[function(require,module,exports){
/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var isPlainObject = require('is-plain-object');

module.exports = function isExtendable(val) {
  return isPlainObject(val) || typeof val === 'function' || Array.isArray(val);
};

},{"is-plain-object":147}],117:[function(require,module,exports){
'use strict';

/**
 * Module dependencies
 */

var extend = require('extend-shallow');
var unique = require('array-unique');
var toRegex = require('to-regex');

/**
 * Local dependencies
 */

var compilers = require('./lib/compilers');
var parsers = require('./lib/parsers');
var Extglob = require('./lib/extglob');
var utils = require('./lib/utils');
var MAX_LENGTH = 1024 * 64;

/**
 * Convert the given `extglob` pattern into a regex-compatible string. Returns
 * an object with the compiled result and the parsed AST.
 *
 * ```js
 * var extglob = require('extglob');
 * console.log(extglob('*.!(*a)'));
 * //=> '(?!\\.)[^/]*?\\.(?!(?!\\.)[^/]*?a\\b).*?'
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

function extglob(pattern, options) {
  return extglob.create(pattern, options).output;
}

/**
 * Takes an array of strings and an extglob pattern and returns a new
 * array that contains only the strings that match the pattern.
 *
 * ```js
 * var extglob = require('extglob');
 * console.log(extglob.match(['a.a', 'a.b', 'a.c'], '*.!(*a)'));
 * //=> ['a.b', 'a.c']
 * ```
 * @param {Array} `list` Array of strings to match
 * @param {String} `pattern` Extglob pattern
 * @param {Object} `options`
 * @return {Array} Returns an array of matches
 * @api public
 */

extglob.match = function(list, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  list = utils.arrayify(list);
  var isMatch = extglob.matcher(pattern, options);
  var len = list.length;
  var idx = -1;
  var matches = [];

  while (++idx < len) {
    var ele = list[idx];

    if (isMatch(ele)) {
      matches.push(ele);
    }
  }

  // if no options were passed, uniquify results and return
  if (typeof options === 'undefined') {
    return unique(matches);
  }

  if (matches.length === 0) {
    if (options.failglob === true) {
      throw new Error('no matches found for "' + pattern + '"');
    }
    if (options.nonull === true || options.nullglob === true) {
      return [pattern.split('\\').join('')];
    }
  }

  return options.nodupes !== false ? unique(matches) : matches;
};

/**
 * Returns true if the specified `string` matches the given
 * extglob `pattern`.
 *
 * ```js
 * var extglob = require('extglob');
 *
 * console.log(extglob.isMatch('a.a', '*.!(*a)'));
 * //=> false
 * console.log(extglob.isMatch('a.b', '*.!(*a)'));
 * //=> true
 * ```
 * @param {String} `string` String to match
 * @param {String} `pattern` Extglob pattern
 * @param {String} `options`
 * @return {Boolean}
 * @api public
 */

extglob.isMatch = function(str, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  if (pattern === str) {
    return true;
  }

  if (pattern === '' || pattern === ' ' || pattern === '.') {
    return pattern === str;
  }

  var isMatch = utils.memoize('isMatch', pattern, options, extglob.matcher);
  return isMatch(str);
};

/**
 * Returns true if the given `string` contains the given pattern. Similar to `.isMatch` but
 * the pattern can match any part of the string.
 *
 * ```js
 * var extglob = require('extglob');
 * console.log(extglob.contains('aa/bb/cc', '*b'));
 * //=> true
 * console.log(extglob.contains('aa/bb/cc', '*d'));
 * //=> false
 * ```
 * @param {String} `str` The string to match.
 * @param {String} `pattern` Glob pattern to use for matching.
 * @param {Object} `options`
 * @return {Boolean} Returns true if the patter matches any part of `str`.
 * @api public
 */

extglob.contains = function(str, pattern, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  if (pattern === '' || pattern === ' ' || pattern === '.') {
    return pattern === str;
  }

  var opts = extend({}, options, {contains: true});
  opts.strictClose = false;
  opts.strictOpen = false;
  return extglob.isMatch(str, pattern, opts);
};

/**
 * Takes an extglob pattern and returns a matcher function. The returned
 * function takes the string to match as its only argument.
 *
 * ```js
 * var extglob = require('extglob');
 * var isMatch = extglob.matcher('*.!(*a)');
 *
 * console.log(isMatch('a.a'));
 * //=> false
 * console.log(isMatch('a.b'));
 * //=> true
 * ```
 * @param {String} `pattern` Extglob pattern
 * @param {String} `options`
 * @return {Boolean}
 * @api public
 */

extglob.matcher = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  function matcher() {
    var re = extglob.makeRe(pattern, options);
    return function(str) {
      return re.test(str);
    };
  }

  return utils.memoize('matcher', pattern, options, matcher);
};

/**
 * Convert the given `extglob` pattern into a regex-compatible string. Returns
 * an object with the compiled result and the parsed AST.
 *
 * ```js
 * var extglob = require('extglob');
 * console.log(extglob.create('*.!(*a)').output);
 * //=> '(?!\\.)[^/]*?\\.(?!(?!\\.)[^/]*?a\\b).*?'
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

extglob.create = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  function create() {
    var ext = new Extglob(options);
    var ast = ext.parse(pattern, options);
    return ext.compile(ast, options);
  }

  return utils.memoize('create', pattern, options, create);
};

/**
 * Returns an array of matches captured by `pattern` in `string`, or `null`
 * if the pattern did not match.
 *
 * ```js
 * var extglob = require('extglob');
 * extglob.capture(pattern, string[, options]);
 *
 * console.log(extglob.capture('test/*.js', 'test/foo.js'));
 * //=> ['foo']
 * console.log(extglob.capture('test/*.js', 'foo/bar.css'));
 * //=> null
 * ```
 * @param {String} `pattern` Glob pattern to use for matching.
 * @param {String} `string` String to match
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns an array of captures if the string matches the glob pattern, otherwise `null`.
 * @api public
 */

extglob.capture = function(pattern, str, options) {
  var re = extglob.makeRe(pattern, extend({capture: true}, options));

  function match() {
    return function(string) {
      var match = re.exec(string);
      if (!match) {
        return null;
      }

      return match.slice(1);
    };
  }

  var capture = utils.memoize('capture', pattern, options, match);
  return capture(str);
};

/**
 * Create a regular expression from the given `pattern` and `options`.
 *
 * ```js
 * var extglob = require('extglob');
 * var re = extglob.makeRe('*.!(*a)');
 * console.log(re);
 * //=> /^[^\/]*?\.(?![^\/]*?a)[^\/]*?$/
 * ```
 * @param {String} `pattern` The pattern to convert to regex.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

extglob.makeRe = function(pattern, options) {
  if (pattern instanceof RegExp) {
    return pattern;
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  if (pattern.length > MAX_LENGTH) {
    throw new Error('expected pattern to be less than ' + MAX_LENGTH + ' characters');
  }

  function makeRe() {
    var opts = extend({strictErrors: false}, options);
    if (opts.strictErrors === true) opts.strict = true;
    var res = extglob.create(pattern, opts);
    return toRegex(res.output, opts);
  }

  var regex = utils.memoize('makeRe', pattern, options, makeRe);
  if (regex.source.length > MAX_LENGTH) {
    throw new SyntaxError('potentially malicious regex detected');
  }

  return regex;
};

/**
 * Cache
 */

extglob.cache = utils.cache;
extglob.clearCache = function() {
  extglob.cache.__data__ = {};
};

/**
 * Expose `Extglob` constructor, parsers and compilers
 */

extglob.Extglob = Extglob;
extglob.compilers = compilers;
extglob.parsers = parsers;

/**
 * Expose `extglob`
 * @type {Function}
 */

module.exports = extglob;

},{"./lib/compilers":118,"./lib/extglob":119,"./lib/parsers":120,"./lib/utils":121,"array-unique":84,"extend-shallow":123,"to-regex":223}],118:[function(require,module,exports){
'use strict';

var brackets = require('expand-brackets');

/**
 * Extglob compilers
 */

module.exports = function(extglob) {
  function star() {
    if (typeof extglob.options.star === 'function') {
      return extglob.options.star.apply(this, arguments);
    }
    if (typeof extglob.options.star === 'string') {
      return extglob.options.star;
    }
    return '.*?';
  }

  /**
   * Use `expand-brackets` compilers
   */

  extglob.use(brackets.compilers);
  extglob.compiler

    /**
     * Escaped: "\\*"
     */

    .set('escape', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * Dot: "."
     */

    .set('dot', function(node) {
      return this.emit('\\' + node.val, node);
    })

    /**
     * Question mark: "?"
     */

    .set('qmark', function(node) {
      var val = '[^\\\\/.]';
      var prev = this.prev();

      if (node.parsed.slice(-1) === '(') {
        var ch = node.rest.charAt(0);
        if (ch !== '!' && ch !== '=' && ch !== ':') {
          return this.emit(val, node);
        }
        return this.emit(node.val, node);
      }

      if (prev.type === 'text' && prev.val) {
        return this.emit(val, node);
      }

      if (node.val.length > 1) {
        val += '{' + node.val.length + '}';
      }
      return this.emit(val, node);
    })

    /**
     * Plus: "+"
     */

    .set('plus', function(node) {
      var prev = node.parsed.slice(-1);
      if (prev === ']' || prev === ')') {
        return this.emit(node.val, node);
      }
      var ch = this.output.slice(-1);
      if (!this.output || (/[?*+]/.test(ch) && node.parent.type !== 'bracket')) {
        return this.emit('\\+', node);
      }
      if (/\w/.test(ch) && !node.inside) {
        return this.emit('+\\+?', node);
      }
      return this.emit('+', node);
    })

    /**
     * Star: "*"
     */

    .set('star', function(node) {
      var prev = this.prev();
      var prefix = prev.type !== 'text' && prev.type !== 'escape'
        ? '(?!\\.)'
        : '';

      return this.emit(prefix + star.call(this, node), node);
    })

    /**
     * Parens
     */

    .set('paren', function(node) {
      return this.mapVisit(node.nodes);
    })
    .set('paren.open', function(node) {
      var capture = this.options.capture ? '(' : '';

      switch (node.parent.prefix) {
        case '!':
        case '^':
          return this.emit(capture + '(?:(?!(?:', node);
        case '*':
        case '+':
        case '?':
        case '@':
          return this.emit(capture + '(?:', node);
        default: {
          var val = node.val;
          if (this.options.bash === true) {
            val = '\\' + val;
          } else if (!this.options.capture && val === '(' && node.parent.rest[0] !== '?') {
            val += '?:';
          }

          return this.emit(val, node);
        }
      }
    })
    .set('paren.close', function(node) {
      var capture = this.options.capture ? ')' : '';

      switch (node.prefix) {
        case '!':
        case '^':
          var prefix = /^(\)|$)/.test(node.rest) ? '$' : '';
          var str = star.call(this, node);

          // if the extglob has a slash explicitly defined, we know the user wants
          // to match slashes, so we need to ensure the "star" regex allows for it
          if (node.parent.hasSlash && !this.options.star && this.options.slash !== false) {
            str = '.*?';
          }

          return this.emit(prefix + ('))' + str + ')') + capture, node);
        case '*':
        case '+':
        case '?':
          return this.emit(')' + node.prefix + capture, node);
        case '@':
          return this.emit(')' + capture, node);
        default: {
          var val = (this.options.bash === true ? '\\' : '') + ')';
          return this.emit(val, node);
        }
      }
    })

    /**
     * Text
     */

    .set('text', function(node) {
      var val = node.val.replace(/[\[\]]/g, '\\$&');
      return this.emit(val, node);
    });
};

},{"expand-brackets":107}],119:[function(require,module,exports){
'use strict';

/**
 * Module dependencies
 */

var Snapdragon = require('snapdragon');
var define = require('define-property');
var extend = require('extend-shallow');

/**
 * Local dependencies
 */

var compilers = require('./compilers');
var parsers = require('./parsers');

/**
 * Customize Snapdragon parser and renderer
 */

function Extglob(options) {
  this.options = extend({source: 'extglob'}, options);
  this.snapdragon = this.options.snapdragon || new Snapdragon(this.options);
  this.snapdragon.patterns = this.snapdragon.patterns || {};
  this.compiler = this.snapdragon.compiler;
  this.parser = this.snapdragon.parser;

  compilers(this.snapdragon);
  parsers(this.snapdragon);

  /**
   * Override Snapdragon `.parse` method
   */

  define(this.snapdragon, 'parse', function(str, options) {
    var parsed = Snapdragon.prototype.parse.apply(this, arguments);
    parsed.input = str;

    // escape unmatched brace/bracket/parens
    var last = this.parser.stack.pop();
    if (last && this.options.strict !== true) {
      var node = last.nodes[0];
      node.val = '\\' + node.val;
      var sibling = node.parent.nodes[1];
      if (sibling.type === 'star') {
        sibling.loose = true;
      }
    }

    // add non-enumerable parser reference
    define(parsed, 'parser', this.parser);
    return parsed;
  });

  /**
   * Decorate `.parse` method
   */

  define(this, 'parse', function(ast, options) {
    return this.snapdragon.parse.apply(this.snapdragon, arguments);
  });

  /**
   * Decorate `.compile` method
   */

  define(this, 'compile', function(ast, options) {
    return this.snapdragon.compile.apply(this.snapdragon, arguments);
  });

}

/**
 * Expose `Extglob`
 */

module.exports = Extglob;

},{"./compilers":118,"./parsers":120,"define-property":122,"extend-shallow":123,"snapdragon":194}],120:[function(require,module,exports){
'use strict';

var brackets = require('expand-brackets');
var define = require('define-property');
var utils = require('./utils');

/**
 * Characters to use in text regex (we want to "not" match
 * characters that are matched by other parsers)
 */

var TEXT_REGEX = '([!@*?+]?\\(|\\)|[*?.+\\\\]|\\[:?(?=.*\\])|:?\\])+';
var not = utils.createRegex(TEXT_REGEX);

/**
 * Extglob parsers
 */

function parsers(extglob) {
  extglob.state = extglob.state || {};

  /**
   * Use `expand-brackets` parsers
   */

  extglob.use(brackets.parsers);
  extglob.parser.sets.paren = extglob.parser.sets.paren || [];
  extglob.parser

    /**
     * Extglob open: "*("
     */

    .capture('paren.open', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^([!@*?+])?\(/);
      if (!m) return;

      var prev = this.prev();
      var prefix = m[1];
      var val = m[0];

      var open = pos({
        type: 'paren.open',
        parsed: parsed,
        val: val
      });

      var node = pos({
        type: 'paren',
        prefix: prefix,
        nodes: [open]
      });

      // if nested negation extglobs, just cancel them out to simplify
      if (prefix === '!' && prev.type === 'paren' && prev.prefix === '!') {
        prev.prefix = '@';
        node.prefix = '@';
      }

      define(node, 'rest', this.input);
      define(node, 'parsed', parsed);
      define(node, 'parent', prev);
      define(open, 'parent', node);

      this.push('paren', node);
      prev.nodes.push(node);
    })

    /**
     * Extglob close: ")"
     */

    .capture('paren.close', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\)/);
      if (!m) return;

      var parent = this.pop('paren');
      var node = pos({
        type: 'paren.close',
        rest: this.input,
        parsed: parsed,
        val: m[0]
      });

      if (!this.isType(parent, 'paren')) {
        if (this.options.strict) {
          throw new Error('missing opening paren: "("');
        }
        node.escaped = true;
        return node;
      }

      node.prefix = parent.prefix;
      parent.nodes.push(node);
      define(node, 'parent', parent);
    })

    /**
     * Escape: "\\."
     */

    .capture('escape', function() {
      var pos = this.position();
      var m = this.match(/^\\(.)/);
      if (!m) return;

      return pos({
        type: 'escape',
        val: m[0],
        ch: m[1]
      });
    })

    /**
     * Question marks: "?"
     */

    .capture('qmark', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\?+(?!\()/);
      if (!m) return;
      extglob.state.metachar = true;
      return pos({
        type: 'qmark',
        rest: this.input,
        parsed: parsed,
        val: m[0]
      });
    })

    /**
     * Character parsers
     */

    .capture('star', /^\*(?!\()/)
    .capture('plus', /^\+(?!\()/)
    .capture('dot', /^\./)
    .capture('text', not);
};

/**
 * Expose text regex string
 */

module.exports.TEXT_REGEX = TEXT_REGEX;

/**
 * Extglob parsers
 */

module.exports = parsers;

},{"./utils":121,"define-property":122,"expand-brackets":107}],121:[function(require,module,exports){
'use strict';

var regex = require('regex-not');
var Cache = require('fragment-cache');

/**
 * Utils
 */

var utils = module.exports;
var cache = utils.cache = new Cache();

/**
 * Cast `val` to an array
 * @return {Array}
 */

utils.arrayify = function(val) {
  if (!Array.isArray(val)) {
    return [val];
  }
  return val;
};

/**
 * Memoize a generated regex or function
 */

utils.memoize = function(type, pattern, options, fn) {
  var key = utils.createKey(type + pattern, options);

  if (cache.has(type, key)) {
    return cache.get(type, key);
  }

  var val = fn(pattern, options);
  if (options && options.cache === false) {
    return val;
  }

  cache.set(type, key, val);
  return val;
};

/**
 * Create the key to use for memoization. The key is generated
 * by iterating over the options and concatenating key-value pairs
 * to the pattern string.
 */

utils.createKey = function(pattern, options) {
  var key = pattern;
  if (typeof options === 'undefined') {
    return key;
  }
  for (var prop in options) {
    key += ';' + prop + '=' + String(options[prop]);
  }
  return key;
};

/**
 * Create the regex to use for matching text
 */

utils.createRegex = function(str) {
  var opts = {contains: true, strictClose: false};
  return regex(str, opts);
};

},{"fragment-cache":132,"regex-not":175}],122:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"dup":87,"is-descriptor":126}],123:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"dup":96,"is-extendable":144}],124:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"dup":88,"kind-of":152}],125:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"dup":89,"kind-of":152}],126:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90,"is-accessor-descriptor":124,"is-data-descriptor":125,"kind-of":152}],127:[function(require,module,exports){
'use strict';

var isArray = Array.isArray;
var keyList = Object.keys;
var hasProp = Object.prototype.hasOwnProperty;

module.exports = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    var arrA = isArray(a)
      , arrB = isArray(b)
      , i
      , length
      , key;

    if (arrA && arrB) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }

    if (arrA != arrB) return false;

    var dateA = a instanceof Date
      , dateB = b instanceof Date;
    if (dateA != dateB) return false;
    if (dateA && dateB) return a.getTime() == b.getTime();

    var regexpA = a instanceof RegExp
      , regexpB = b instanceof RegExp;
    if (regexpA != regexpB) return false;
    if (regexpA && regexpB) return a.toString() == b.toString();

    var keys = keyList(a);
    length = keys.length;

    if (length !== keyList(b).length)
      return false;

    for (i = length; i-- !== 0;)
      if (!hasProp.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      key = keys[i];
      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  return a!==a && b!==b;
};

},{}],128:[function(require,module,exports){
'use strict';

module.exports = function (data, opts) {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;

    var cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (a, b) {
                var aobj = { key: a, value: node[a] };
                var bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    })(opts.cmp);

    var seen = [];
    return (function stringify (node) {
        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        if (node === undefined) return;
        if (typeof node == 'number') return isFinite(node) ? '' + node : 'null';
        if (typeof node !== 'object') return JSON.stringify(node);

        var i, out;
        if (Array.isArray(node)) {
            out = '[';
            for (i = 0; i < node.length; i++) {
                if (i) out += ',';
                out += stringify(node[i]) || 'null';
            }
            return out + ']';
        }

        if (node === null) return 'null';

        if (seen.indexOf(node) !== -1) {
            if (cycles) return JSON.stringify('__cycle__');
            throw new TypeError('Converting circular structure to JSON');
        }

        var seenIndex = seen.push(node) - 1;
        var keys = Object.keys(node).sort(cmp && cmp(node));
        out = '';
        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = stringify(node[key]);

            if (!value) continue;
            if (out) out += ',';
            out += JSON.stringify(key) + ':' + value;
        }
        seen.splice(seenIndex, 1);
        return '{' + out + '}';
    })(data);
};

},{}],129:[function(require,module,exports){
/*!
 * fill-range <https://github.com/jonschlinkert/fill-range>
 *
 * Copyright (c) 2014-2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var util = require('util');
var isNumber = require('is-number');
var extend = require('extend-shallow');
var repeat = require('repeat-string');
var toRegex = require('to-regex-range');

/**
 * Return a range of numbers or letters.
 *
 * @param  {String} `start` Start of the range
 * @param  {String} `stop` End of the range
 * @param  {String} `step` Increment or decrement to use.
 * @param  {Function} `fn` Custom function to modify each element in the range.
 * @return {Array}
 */

function fillRange(start, stop, step, options) {
  if (typeof start === 'undefined') {
    return [];
  }

  if (typeof stop === 'undefined' || start === stop) {
    // special case, for handling negative zero
    var isString = typeof start === 'string';
    if (isNumber(start) && !toNumber(start)) {
      return [isString ? '0' : 0];
    }
    return [start];
  }

  if (typeof step !== 'number' && typeof step !== 'string') {
    options = step;
    step = undefined;
  }

  if (typeof options === 'function') {
    options = { transform: options };
  }

  var opts = extend({step: step}, options);
  if (opts.step && !isValidNumber(opts.step)) {
    if (opts.strictRanges === true) {
      throw new TypeError('expected options.step to be a number');
    }
    return [];
  }

  opts.isNumber = isValidNumber(start) && isValidNumber(stop);
  if (!opts.isNumber && !isValid(start, stop)) {
    if (opts.strictRanges === true) {
      throw new RangeError('invalid range arguments: ' + util.inspect([start, stop]));
    }
    return [];
  }

  opts.isPadded = isPadded(start) || isPadded(stop);
  opts.toString = opts.stringify
    || typeof opts.step === 'string'
    || typeof start === 'string'
    || typeof stop === 'string'
    || !opts.isNumber;

  if (opts.isPadded) {
    opts.maxLength = Math.max(String(start).length, String(stop).length);
  }

  // support legacy minimatch/fill-range options
  if (typeof opts.optimize === 'boolean') opts.toRegex = opts.optimize;
  if (typeof opts.makeRe === 'boolean') opts.toRegex = opts.makeRe;
  return expand(start, stop, opts);
}

function expand(start, stop, options) {
  var a = options.isNumber ? toNumber(start) : start.charCodeAt(0);
  var b = options.isNumber ? toNumber(stop) : stop.charCodeAt(0);

  var step = Math.abs(toNumber(options.step)) || 1;
  if (options.toRegex && step === 1) {
    return toRange(a, b, start, stop, options);
  }

  var zero = {greater: [], lesser: []};
  var asc = a < b;
  var arr = new Array(Math.round((asc ? b - a : a - b) / step));
  var idx = 0;

  while (asc ? a <= b : a >= b) {
    var val = options.isNumber ? a : String.fromCharCode(a);
    if (options.toRegex && (val >= 0 || !options.isNumber)) {
      zero.greater.push(val);
    } else {
      zero.lesser.push(Math.abs(val));
    }

    if (options.isPadded) {
      val = zeros(val, options);
    }

    if (options.toString) {
      val = String(val);
    }

    if (typeof options.transform === 'function') {
      arr[idx++] = options.transform(val, a, b, step, idx, arr, options);
    } else {
      arr[idx++] = val;
    }

    if (asc) {
      a += step;
    } else {
      a -= step;
    }
  }

  if (options.toRegex === true) {
    return toSequence(arr, zero, options);
  }
  return arr;
}

function toRange(a, b, start, stop, options) {
  if (options.isPadded) {
    return toRegex(start, stop, options);
  }

  if (options.isNumber) {
    return toRegex(Math.min(a, b), Math.max(a, b), options);
  }

  var start = String.fromCharCode(Math.min(a, b));
  var stop = String.fromCharCode(Math.max(a, b));
  return '[' + start + '-' + stop + ']';
}

function toSequence(arr, zeros, options) {
  var greater = '', lesser = '';
  if (zeros.greater.length) {
    greater = zeros.greater.join('|');
  }
  if (zeros.lesser.length) {
    lesser = '-(' + zeros.lesser.join('|') + ')';
  }
  var res = greater && lesser
    ? greater + '|' + lesser
    : greater || lesser;

  if (options.capture) {
    return '(' + res + ')';
  }
  return res;
}

function zeros(val, options) {
  if (options.isPadded) {
    var str = String(val);
    var len = str.length;
    var dash = '';
    if (str.charAt(0) === '-') {
      dash = '-';
      str = str.slice(1);
    }
    var diff = options.maxLength - len;
    var pad = repeat('0', diff);
    val = (dash + pad + str);
  }
  if (options.stringify) {
    return String(val);
  }
  return val;
}

function toNumber(val) {
  return Number(val) || 0;
}

function isPadded(str) {
  return /^-?0\d/.test(str);
}

function isValid(min, max) {
  return (isValidNumber(min) || isValidLetter(min))
      && (isValidNumber(max) || isValidLetter(max));
}

function isValidLetter(ch) {
  return typeof ch === 'string' && ch.length === 1 && /^\w+$/.test(ch);
}

function isValidNumber(n) {
  return isNumber(n) && !/\./.test(n);
}

/**
 * Expose `fillRange`
 * @type {Function}
 */

module.exports = fillRange;

},{"extend-shallow":130,"is-number":145,"repeat-string":177,"to-regex-range":222,"util":6}],130:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"dup":96,"is-extendable":144}],131:[function(require,module,exports){
/*!
 * for-in <https://github.com/jonschlinkert/for-in>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

module.exports = function forIn(obj, fn, thisArg) {
  for (var key in obj) {
    if (fn.call(thisArg, obj[key], key, obj) === false) {
      break;
    }
  }
};

},{}],132:[function(require,module,exports){
/*!
 * fragment-cache <https://github.com/jonschlinkert/fragment-cache>
 *
 * Copyright (c) 2016-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var MapCache = require('map-cache');

/**
 * Create a new `FragmentCache` with an optional object to use for `caches`.
 *
 * ```js
 * var fragment = new FragmentCache();
 * ```
 * @name FragmentCache
 * @param {String} `cacheName`
 * @return {Object} Returns the [map-cache][] instance.
 * @api public
 */

function FragmentCache(caches) {
  this.caches = caches || {};
}

/**
 * Prototype
 */

FragmentCache.prototype = {

  /**
   * Get cache `name` from the `fragment.caches` object. Creates a new
   * `MapCache` if it doesn't already exist.
   *
   * ```js
   * var cache = fragment.cache('files');
   * console.log(fragment.caches.hasOwnProperty('files'));
   * //=> true
   * ```
   * @name .cache
   * @param {String} `cacheName`
   * @return {Object} Returns the [map-cache][] instance.
   * @api public
   */

  cache: function(cacheName) {
    return this.caches[cacheName] || (this.caches[cacheName] = new MapCache());
  },

  /**
   * Set a value for property `key` on cache `name`
   *
   * ```js
   * fragment.set('files', 'somefile.js', new File({path: 'somefile.js'}));
   * ```
   * @name .set
   * @param {String} `name`
   * @param {String} `key` Property name to set
   * @param {any} `val` The value of `key`
   * @return {Object} The cache instance for chaining
   * @api public
   */

  set: function(cacheName, key, val) {
    var cache = this.cache(cacheName);
    cache.set(key, val);
    return cache;
  },

  /**
   * Returns true if a non-undefined value is set for `key` on fragment cache `name`.
   *
   * ```js
   * var cache = fragment.cache('files');
   * cache.set('somefile.js');
   *
   * console.log(cache.has('somefile.js'));
   * //=> true
   *
   * console.log(cache.has('some-other-file.js'));
   * //=> false
   * ```
   * @name .has
   * @param {String} `name` Cache name
   * @param {String} `key` Optionally specify a property to check for on cache `name`
   * @return {Boolean}
   * @api public
   */

  has: function(cacheName, key) {
    return typeof this.get(cacheName, key) !== 'undefined';
  },

  /**
   * Get `name`, or if specified, the value of `key`. Invokes the [cache]() method,
   * so that cache `name` will be created it doesn't already exist. If `key` is not passed,
   * the entire cache (`name`) is returned.
   *
   * ```js
   * var Vinyl = require('vinyl');
   * var cache = fragment.cache('files');
   * cache.set('somefile.js', new Vinyl({path: 'somefile.js'}));
   * console.log(cache.get('somefile.js'));
   * //=> <File "somefile.js">
   * ```
   * @name .get
   * @param {String} `name`
   * @return {Object} Returns cache `name`, or the value of `key` if specified
   * @api public
   */

  get: function(name, key) {
    var cache = this.cache(name);
    if (typeof key === 'string') {
      return cache.get(key);
    }
    return cache;
  }
};

/**
 * Expose `FragmentCache`
 */

exports = module.exports = FragmentCache;

},{"map-cache":153}],133:[function(require,module,exports){
/*!
 * get-value <https://github.com/jonschlinkert/get-value>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

module.exports = function(obj, prop, a, b, c) {
  if (!isObject(obj) || !prop) {
    return obj;
  }

  prop = toString(prop);

  // allowing for multiple properties to be passed as
  // a string or array, but much faster (3-4x) than doing
  // `[].slice.call(arguments)`
  if (a) prop += '.' + toString(a);
  if (b) prop += '.' + toString(b);
  if (c) prop += '.' + toString(c);

  if (prop in obj) {
    return obj[prop];
  }

  var segs = prop.split('.');
  var len = segs.length;
  var i = -1;

  while (obj && (++i < len)) {
    var key = segs[i];
    while (key[key.length - 1] === '\\') {
      key = key.slice(0, -1) + '.' + segs[++i];
    }
    obj = obj[key];
  }
  return obj;
};

function isObject(val) {
  return val !== null && (typeof val === 'object' || typeof val === 'function');
}

function toString(val) {
  if (!val) return '';
  if (Array.isArray(val)) {
    return val.join('.');
  }
  return val;
}

},{}],134:[function(require,module,exports){
/*!
 * has-value <https://github.com/jonschlinkert/has-value>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isObject = require('isobject');
var hasValues = require('has-values');
var get = require('get-value');

module.exports = function(val, prop) {
  return hasValues(isObject(val) && prop ? get(val, prop) : val);
};

},{"get-value":133,"has-values":135,"isobject":150}],135:[function(require,module,exports){
/*!
 * has-values <https://github.com/jonschlinkert/has-values>
 *
 * Copyright (c) 2014-2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var typeOf = require('kind-of');
var isNumber = require('is-number');

module.exports = function hasValue(val) {
  // is-number checks for NaN and other edge cases
  if (isNumber(val)) {
    return true;
  }

  switch (typeOf(val)) {
    case 'null':
    case 'boolean':
    case 'function':
      return true;
    case 'string':
    case 'arguments':
      return val.length !== 0;
    case 'error':
      return val.message !== '';
    case 'array':
      var len = val.length;
      if (len === 0) {
        return false;
      }
      for (var i = 0; i < len; i++) {
        if (hasValue(val[i])) {
          return true;
        }
      }
      return false;
    case 'file':
    case 'map':
    case 'set':
      return val.size !== 0;
    case 'object':
      var keys = Object.keys(val);
      if (keys.length === 0) {
        return false;
      }
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (hasValue(val[key])) {
          return true;
        }
      }
      return false;
    default: {
      return false;
    }
  }
};

},{"is-number":145,"kind-of":136}],136:[function(require,module,exports){
var isBuffer = require('is-buffer');
var toString = Object.prototype.toString;

/**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */

module.exports = function kindOf(val) {
  // primitivies
  if (typeof val === 'undefined') {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }
  if (val === true || val === false || val instanceof Boolean) {
    return 'boolean';
  }
  if (typeof val === 'string' || val instanceof String) {
    return 'string';
  }
  if (typeof val === 'number' || val instanceof Number) {
    return 'number';
  }

  // functions
  if (typeof val === 'function' || val instanceof Function) {
    return 'function';
  }

  // array
  if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
    return 'array';
  }

  // check for instances of RegExp and Date before calling `toString`
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val instanceof Date) {
    return 'date';
  }

  // other objects
  var type = toString.call(val);

  if (type === '[object RegExp]') {
    return 'regexp';
  }
  if (type === '[object Date]') {
    return 'date';
  }
  if (type === '[object Arguments]') {
    return 'arguments';
  }
  if (type === '[object Error]') {
    return 'error';
  }
  if (type === '[object Promise]') {
    return 'promise';
  }

  // buffer
  if (isBuffer(val)) {
    return 'buffer';
  }

  // es6: Map, WeakMap, Set, WeakSet
  if (type === '[object Set]') {
    return 'set';
  }
  if (type === '[object WeakSet]') {
    return 'weakset';
  }
  if (type === '[object Map]') {
    return 'map';
  }
  if (type === '[object WeakMap]') {
    return 'weakmap';
  }
  if (type === '[object Symbol]') {
    return 'symbol';
  }

  // typed arrays
  if (type === '[object Int8Array]') {
    return 'int8array';
  }
  if (type === '[object Uint8Array]') {
    return 'uint8array';
  }
  if (type === '[object Uint8ClampedArray]') {
    return 'uint8clampedarray';
  }
  if (type === '[object Int16Array]') {
    return 'int16array';
  }
  if (type === '[object Uint16Array]') {
    return 'uint16array';
  }
  if (type === '[object Int32Array]') {
    return 'int32array';
  }
  if (type === '[object Uint32Array]') {
    return 'uint32array';
  }
  if (type === '[object Float32Array]') {
    return 'float32array';
  }
  if (type === '[object Float64Array]') {
    return 'float64array';
  }

  // must be a plain object
  return 'object';
};

},{"is-buffer":139}],137:[function(require,module,exports){
/*!
 * is-accessor-descriptor <https://github.com/jonschlinkert/is-accessor-descriptor>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var typeOf = require('kind-of');

// accessor descriptor properties
var accessor = {
  get: 'function',
  set: 'function',
  configurable: 'boolean',
  enumerable: 'boolean'
};

function isAccessorDescriptor(obj, prop) {
  if (typeof prop === 'string') {
    var val = Object.getOwnPropertyDescriptor(obj, prop);
    return typeof val !== 'undefined';
  }

  if (typeOf(obj) !== 'object') {
    return false;
  }

  if (has(obj, 'value') || has(obj, 'writable')) {
    return false;
  }

  if (!has(obj, 'get') || typeof obj.get !== 'function') {
    return false;
  }

  // tldr: it's valid to have "set" be undefined
  // "set" might be undefined if `Object.getOwnPropertyDescriptor`
  // was used to get the value, and only `get` was defined by the user
  if (has(obj, 'set') && typeof obj[key] !== 'function' && typeof obj[key] !== 'undefined') {
    return false;
  }

  for (var key in obj) {
    if (!accessor.hasOwnProperty(key)) {
      continue;
    }

    if (typeOf(obj[key]) === accessor[key]) {
      continue;
    }

    if (typeof obj[key] !== 'undefined') {
      return false;
    }
  }
  return true;
}

function has(obj, key) {
  return {}.hasOwnProperty.call(obj, key);
}

/**
 * Expose `isAccessorDescriptor`
 */

module.exports = isAccessorDescriptor;

},{"kind-of":138}],138:[function(require,module,exports){
var isBuffer = require('is-buffer');
var toString = Object.prototype.toString;

/**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */

module.exports = function kindOf(val) {
  // primitivies
  if (typeof val === 'undefined') {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }
  if (val === true || val === false || val instanceof Boolean) {
    return 'boolean';
  }
  if (typeof val === 'string' || val instanceof String) {
    return 'string';
  }
  if (typeof val === 'number' || val instanceof Number) {
    return 'number';
  }

  // functions
  if (typeof val === 'function' || val instanceof Function) {
    return 'function';
  }

  // array
  if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
    return 'array';
  }

  // check for instances of RegExp and Date before calling `toString`
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val instanceof Date) {
    return 'date';
  }

  // other objects
  var type = toString.call(val);

  if (type === '[object RegExp]') {
    return 'regexp';
  }
  if (type === '[object Date]') {
    return 'date';
  }
  if (type === '[object Arguments]') {
    return 'arguments';
  }
  if (type === '[object Error]') {
    return 'error';
  }

  // buffer
  if (isBuffer(val)) {
    return 'buffer';
  }

  // es6: Map, WeakMap, Set, WeakSet
  if (type === '[object Set]') {
    return 'set';
  }
  if (type === '[object WeakSet]') {
    return 'weakset';
  }
  if (type === '[object Map]') {
    return 'map';
  }
  if (type === '[object WeakMap]') {
    return 'weakmap';
  }
  if (type === '[object Symbol]') {
    return 'symbol';
  }

  // typed arrays
  if (type === '[object Int8Array]') {
    return 'int8array';
  }
  if (type === '[object Uint8Array]') {
    return 'uint8array';
  }
  if (type === '[object Uint8ClampedArray]') {
    return 'uint8clampedarray';
  }
  if (type === '[object Int16Array]') {
    return 'int16array';
  }
  if (type === '[object Uint16Array]') {
    return 'uint16array';
  }
  if (type === '[object Int32Array]') {
    return 'int32array';
  }
  if (type === '[object Uint32Array]') {
    return 'uint32array';
  }
  if (type === '[object Float32Array]') {
    return 'float32array';
  }
  if (type === '[object Float64Array]') {
    return 'float64array';
  }

  // must be a plain object
  return 'object';
};

},{"is-buffer":139}],139:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],140:[function(require,module,exports){
/*!
 * is-data-descriptor <https://github.com/jonschlinkert/is-data-descriptor>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var typeOf = require('kind-of');

// data descriptor properties
var data = {
  configurable: 'boolean',
  enumerable: 'boolean',
  writable: 'boolean'
};

function isDataDescriptor(obj, prop) {
  if (typeOf(obj) !== 'object') {
    return false;
  }

  if (typeof prop === 'string') {
    var val = Object.getOwnPropertyDescriptor(obj, prop);
    return typeof val !== 'undefined';
  }

  if (!('value' in obj) && !('writable' in obj)) {
    return false;
  }

  for (var key in obj) {
    if (key === 'value') continue;

    if (!data.hasOwnProperty(key)) {
      continue;
    }

    if (typeOf(obj[key]) === data[key]) {
      continue;
    }

    if (typeof obj[key] !== 'undefined') {
      return false;
    }
  }
  return true;
}

/**
 * Expose `isDataDescriptor`
 */

module.exports = isDataDescriptor;

},{"kind-of":141}],141:[function(require,module,exports){
arguments[4][138][0].apply(exports,arguments)
},{"dup":138,"is-buffer":139}],142:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90,"is-accessor-descriptor":137,"is-data-descriptor":140,"kind-of":143}],143:[function(require,module,exports){
var toString = Object.prototype.toString;

/**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */

module.exports = function kindOf(val) {
  var type = typeof val;

  // primitivies
  if (type === 'undefined') {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }
  if (val === true || val === false || val instanceof Boolean) {
    return 'boolean';
  }
  if (type === 'string' || val instanceof String) {
    return 'string';
  }
  if (type === 'number' || val instanceof Number) {
    return 'number';
  }

  // functions
  if (type === 'function' || val instanceof Function) {
    if (typeof val.constructor.name !== 'undefined' && val.constructor.name.slice(0, 9) === 'Generator') {
      return 'generatorfunction';
    }
    return 'function';
  }

  // array
  if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
    return 'array';
  }

  // check for instances of RegExp and Date before calling `toString`
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val instanceof Date) {
    return 'date';
  }

  // other objects
  type = toString.call(val);

  if (type === '[object RegExp]') {
    return 'regexp';
  }
  if (type === '[object Date]') {
    return 'date';
  }
  if (type === '[object Arguments]') {
    return 'arguments';
  }
  if (type === '[object Error]') {
    return 'error';
  }
  if (type === '[object Promise]') {
    return 'promise';
  }

  // buffer
  if (isBuffer(val)) {
    return 'buffer';
  }

  // es6: Map, WeakMap, Set, WeakSet
  if (type === '[object Set]') {
    return 'set';
  }
  if (type === '[object WeakSet]') {
    return 'weakset';
  }
  if (type === '[object Map]') {
    return 'map';
  }
  if (type === '[object WeakMap]') {
    return 'weakmap';
  }
  if (type === '[object Symbol]') {
    return 'symbol';
  }
  
  if (type === '[object Map Iterator]') {
    return 'mapiterator';
  }
  if (type === '[object Set Iterator]') {
    return 'setiterator';
  }
  if (type === '[object String Iterator]') {
    return 'stringiterator';
  }
  if (type === '[object Array Iterator]') {
    return 'arrayiterator';
  }
  
  // typed arrays
  if (type === '[object Int8Array]') {
    return 'int8array';
  }
  if (type === '[object Uint8Array]') {
    return 'uint8array';
  }
  if (type === '[object Uint8ClampedArray]') {
    return 'uint8clampedarray';
  }
  if (type === '[object Int16Array]') {
    return 'int16array';
  }
  if (type === '[object Uint16Array]') {
    return 'uint16array';
  }
  if (type === '[object Int32Array]') {
    return 'int32array';
  }
  if (type === '[object Uint32Array]') {
    return 'uint32array';
  }
  if (type === '[object Float32Array]') {
    return 'float32array';
  }
  if (type === '[object Float64Array]') {
    return 'float64array';
  }

  // must be a plain object
  return 'object';
};

/**
 * If you need to support Safari 5-7 (8-10 yr-old browser),
 * take a look at https://github.com/feross/is-buffer
 */

function isBuffer(val) {
  return val.constructor
    && typeof val.constructor.isBuffer === 'function'
    && val.constructor.isBuffer(val);
}

},{}],144:[function(require,module,exports){
/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function isExtendable(val) {
  return typeof val !== 'undefined' && val !== null
    && (typeof val === 'object' || typeof val === 'function');
};

},{}],145:[function(require,module,exports){
/*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var typeOf = require('kind-of');

module.exports = function isNumber(num) {
  var type = typeOf(num);

  if (type === 'string') {
    if (!num.trim()) return false;
  } else if (type !== 'number') {
    return false;
  }

  return (num - num + 1) >= 0;
};

},{"kind-of":146}],146:[function(require,module,exports){
arguments[4][138][0].apply(exports,arguments)
},{"dup":138,"is-buffer":139}],147:[function(require,module,exports){
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var isObject = require('isobject');

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};

},{"isobject":150}],148:[function(require,module,exports){
(function (process,global){
/*!
 * is-windows <https://github.com/jonschlinkert/is-windows>
 *
 * Copyright © 2015-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

(function(factory) {
  if (exports && typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof window !== 'undefined') {
    window.isWindows = factory();
  } else if (typeof global !== 'undefined') {
    global.isWindows = factory();
  } else if (typeof self !== 'undefined') {
    self.isWindows = factory();
  } else {
    this.isWindows = factory();
  }
})(function() {
  'use strict';
  return function isWindows() {
    return process && (process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE));
  };
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":3}],149:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],150:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

},{}],151:[function(require,module,exports){
'use strict';

var traverse = module.exports = function (schema, opts, cb) {
  // Legacy support for v0.3.1 and earlier.
  if (typeof opts == 'function') {
    cb = opts;
    opts = {};
  }

  cb = opts.cb || cb;
  var pre = (typeof cb == 'function') ? cb : cb.pre || function() {};
  var post = cb.post || function() {};

  _traverse(opts, pre, post, schema, '', schema);
};


traverse.keywords = {
  additionalItems: true,
  items: true,
  contains: true,
  additionalProperties: true,
  propertyNames: true,
  not: true
};

traverse.arrayKeywords = {
  items: true,
  allOf: true,
  anyOf: true,
  oneOf: true
};

traverse.propsKeywords = {
  definitions: true,
  properties: true,
  patternProperties: true,
  dependencies: true
};

traverse.skipKeywords = {
  default: true,
  enum: true,
  const: true,
  required: true,
  maximum: true,
  minimum: true,
  exclusiveMaximum: true,
  exclusiveMinimum: true,
  multipleOf: true,
  maxLength: true,
  minLength: true,
  pattern: true,
  format: true,
  maxItems: true,
  minItems: true,
  uniqueItems: true,
  maxProperties: true,
  minProperties: true
};


function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
  if (schema && typeof schema == 'object' && !Array.isArray(schema)) {
    pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    for (var key in schema) {
      var sch = schema[key];
      if (Array.isArray(sch)) {
        if (key in traverse.arrayKeywords) {
          for (var i=0; i<sch.length; i++)
            _traverse(opts, pre, post, sch[i], jsonPtr + '/' + key + '/' + i, rootSchema, jsonPtr, key, schema, i);
        }
      } else if (key in traverse.propsKeywords) {
        if (sch && typeof sch == 'object') {
          for (var prop in sch)
            _traverse(opts, pre, post, sch[prop], jsonPtr + '/' + key + '/' + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
        }
      } else if (key in traverse.keywords || (opts.allKeys && !(key in traverse.skipKeywords))) {
        _traverse(opts, pre, post, sch, jsonPtr + '/' + key, rootSchema, jsonPtr, key, schema);
      }
    }
    post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
  }
}


function escapeJsonPtr(str) {
  return str.replace(/~/g, '~0').replace(/\//g, '~1');
}

},{}],152:[function(require,module,exports){
var toString = Object.prototype.toString;

module.exports = function kindOf(val) {
  if (val === void 0) return 'undefined';
  if (val === null) return 'null';

  var type = typeof val;
  if (type === 'boolean') return 'boolean';
  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'symbol') return 'symbol';
  if (type === 'function') {
    return isGeneratorFn(val) ? 'generatorfunction' : 'function';
  }

  if (isArray(val)) return 'array';
  if (isBuffer(val)) return 'buffer';
  if (isArguments(val)) return 'arguments';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';
  if (isRegexp(val)) return 'regexp';

  switch (ctorName(val)) {
    case 'Symbol': return 'symbol';
    case 'Promise': return 'promise';

    // Set, Map, WeakSet, WeakMap
    case 'WeakMap': return 'weakmap';
    case 'WeakSet': return 'weakset';
    case 'Map': return 'map';
    case 'Set': return 'set';

    // 8-bit typed arrays
    case 'Int8Array': return 'int8array';
    case 'Uint8Array': return 'uint8array';
    case 'Uint8ClampedArray': return 'uint8clampedarray';

    // 16-bit typed arrays
    case 'Int16Array': return 'int16array';
    case 'Uint16Array': return 'uint16array';

    // 32-bit typed arrays
    case 'Int32Array': return 'int32array';
    case 'Uint32Array': return 'uint32array';
    case 'Float32Array': return 'float32array';
    case 'Float64Array': return 'float64array';
  }

  if (isGeneratorObj(val)) {
    return 'generator';
  }

  // Non-plain objects
  type = toString.call(val);
  switch (type) {
    case '[object Object]': return 'object';
    // iterators
    case '[object Map Iterator]': return 'mapiterator';
    case '[object Set Iterator]': return 'setiterator';
    case '[object String Iterator]': return 'stringiterator';
    case '[object Array Iterator]': return 'arrayiterator';
  }

  // other
  return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
};

function ctorName(val) {
  return val.constructor ? val.constructor.name : null;
}

function isArray(val) {
  if (Array.isArray) return Array.isArray(val);
  return val instanceof Array;
}

function isError(val) {
  return val instanceof Error || (typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number');
}

function isDate(val) {
  if (val instanceof Date) return true;
  return typeof val.toDateString === 'function'
    && typeof val.getDate === 'function'
    && typeof val.setDate === 'function';
}

function isRegexp(val) {
  if (val instanceof RegExp) return true;
  return typeof val.flags === 'string'
    && typeof val.ignoreCase === 'boolean'
    && typeof val.multiline === 'boolean'
    && typeof val.global === 'boolean';
}

function isGeneratorFn(name, val) {
  return ctorName(name) === 'GeneratorFunction';
}

function isGeneratorObj(val) {
  return typeof val.throw === 'function'
    && typeof val.return === 'function'
    && typeof val.next === 'function';
}

function isArguments(val) {
  try {
    if (typeof val.length === 'number' && typeof val.callee === 'function') {
      return true;
    }
  } catch (err) {
    if (err.message.indexOf('callee') !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * If you need to support Safari 5-7 (8-10 yr-old browser),
 * take a look at https://github.com/feross/is-buffer
 */

function isBuffer(val) {
  if (val.constructor && typeof val.constructor.isBuffer === 'function') {
    return val.constructor.isBuffer(val);
  }
  return false;
}

},{}],153:[function(require,module,exports){
/*!
 * map-cache <https://github.com/jonschlinkert/map-cache>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var hasOwn = Object.prototype.hasOwnProperty;

/**
 * Expose `MapCache`
 */

module.exports = MapCache;

/**
 * Creates a cache object to store key/value pairs.
 *
 * ```js
 * var cache = new MapCache();
 * ```
 *
 * @api public
 */

function MapCache(data) {
  this.__data__ = data || {};
}

/**
 * Adds `value` to `key` on the cache.
 *
 * ```js
 * cache.set('foo', 'bar');
 * ```
 *
 * @param {String} `key` The key of the value to cache.
 * @param {*} `value` The value to cache.
 * @returns {Object} Returns the `Cache` object for chaining.
 * @api public
 */

MapCache.prototype.set = function mapSet(key, value) {
  if (key !== '__proto__') {
    this.__data__[key] = value;
  }
  return this;
};

/**
 * Gets the cached value for `key`.
 *
 * ```js
 * cache.get('foo');
 * //=> 'bar'
 * ```
 *
 * @param {String} `key` The key of the value to get.
 * @returns {*} Returns the cached value.
 * @api public
 */

MapCache.prototype.get = function mapGet(key) {
  return key === '__proto__' ? undefined : this.__data__[key];
};

/**
 * Checks if a cached value for `key` exists.
 *
 * ```js
 * cache.has('foo');
 * //=> true
 * ```
 *
 * @param {String} `key` The key of the entry to check.
 * @returns {Boolean} Returns `true` if an entry for `key` exists, else `false`.
 * @api public
 */

MapCache.prototype.has = function mapHas(key) {
  return key !== '__proto__' && hasOwn.call(this.__data__, key);
};

/**
 * Removes `key` and its value from the cache.
 *
 * ```js
 * cache.del('foo');
 * ```
 * @title .del
 * @param {String} `key` The key of the value to remove.
 * @returns {Boolean} Returns `true` if the entry was removed successfully, else `false`.
 * @api public
 */

MapCache.prototype.del = function mapDelete(key) {
  return this.has(key) && delete this.__data__[key];
};

},{}],154:[function(require,module,exports){
'use strict';

var util = require('util');
var visit = require('object-visit');

/**
 * Map `visit` over an array of objects.
 *
 * @param  {Object} `collection` The context in which to invoke `method`
 * @param  {String} `method` Name of the method to call on `collection`
 * @param  {Object} `arr` Array of objects.
 */

module.exports = function mapVisit(collection, method, val) {
  if (isObject(val)) {
    return visit.apply(null, arguments);
  }

  if (!Array.isArray(val)) {
    throw new TypeError('expected an array: ' + util.inspect(val));
  }

  var args = [].slice.call(arguments, 3);

  for (var i = 0; i < val.length; i++) {
    var ele = val[i];
    if (isObject(ele)) {
      visit.apply(null, [collection, method, ele].concat(args));
    } else {
      collection[method].apply(collection, [ele].concat(args));
    }
  }
};

function isObject(val) {
  return val && (typeof val === 'function' || (!Array.isArray(val) && typeof val === 'object'));
}

},{"object-visit":171,"util":6}],155:[function(require,module,exports){
'use strict';

/**
 * Module dependencies
 */

var util = require('util');
var braces = require('braces');
var toRegex = require('to-regex');
var extend = require('extend-shallow');

/**
 * Local dependencies
 */

var compilers = require('./lib/compilers');
var parsers = require('./lib/parsers');
var cache = require('./lib/cache');
var utils = require('./lib/utils');
var MAX_LENGTH = 1024 * 64;

/**
 * The main function takes a list of strings and one or more
 * glob patterns to use for matching.
 *
 * ```js
 * var mm = require('micromatch');
 * mm(list, patterns[, options]);
 *
 * console.log(mm(['a.js', 'a.txt'], ['*.js']));
 * //=> [ 'a.js' ]
 * ```
 * @param {Array} `list` A list of strings to match
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Array} Returns an array of matches
 * @summary false
 * @api public
 */

function micromatch(list, patterns, options) {
  patterns = utils.arrayify(patterns);
  list = utils.arrayify(list);

  var len = patterns.length;
  if (list.length === 0 || len === 0) {
    return [];
  }

  if (len === 1) {
    return micromatch.match(list, patterns[0], options);
  }

  var omit = [];
  var keep = [];
  var idx = -1;

  while (++idx < len) {
    var pattern = patterns[idx];

    if (typeof pattern === 'string' && pattern.charCodeAt(0) === 33 /* ! */) {
      omit.push.apply(omit, micromatch.match(list, pattern.slice(1), options));
    } else {
      keep.push.apply(keep, micromatch.match(list, pattern, options));
    }
  }

  var matches = utils.diff(keep, omit);
  if (!options || options.nodupes !== false) {
    return utils.unique(matches);
  }

  return matches;
}

/**
 * Similar to the main function, but `pattern` must be a string.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.match(list, pattern[, options]);
 *
 * console.log(mm.match(['a.a', 'a.aa', 'a.b', 'a.c'], '*.a'));
 * //=> ['a.a', 'a.aa']
 * ```
 * @param {Array} `list` Array of strings to match
 * @param {String} `pattern` Glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Array} Returns an array of matches
 * @api public
 */

micromatch.match = function(list, pattern, options) {
  if (Array.isArray(pattern)) {
    throw new TypeError('expected pattern to be a string');
  }

  var unixify = utils.unixify(options);
  var isMatch = memoize('match', pattern, options, micromatch.matcher);
  var matches = [];

  list = utils.arrayify(list);
  var len = list.length;
  var idx = -1;

  while (++idx < len) {
    var ele = list[idx];
    if (ele === pattern || isMatch(ele)) {
      matches.push(utils.value(ele, unixify, options));
    }
  }

  // if no options were passed, uniquify results and return
  if (typeof options === 'undefined') {
    return utils.unique(matches);
  }

  if (matches.length === 0) {
    if (options.failglob === true) {
      throw new Error('no matches found for "' + pattern + '"');
    }
    if (options.nonull === true || options.nullglob === true) {
      return [options.unescape ? utils.unescape(pattern) : pattern];
    }
  }

  // if `opts.ignore` was defined, diff ignored list
  if (options.ignore) {
    matches = micromatch.not(matches, options.ignore, options);
  }

  return options.nodupes !== false ? utils.unique(matches) : matches;
};

/**
 * Returns true if the specified `string` matches the given glob `pattern`.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.isMatch(string, pattern[, options]);
 *
 * console.log(mm.isMatch('a.a', '*.a'));
 * //=> true
 * console.log(mm.isMatch('a.b', '*.a'));
 * //=> false
 * ```
 * @param {String} `string` String to match
 * @param {String} `pattern` Glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if the string matches the glob pattern.
 * @api public
 */

micromatch.isMatch = function(str, pattern, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string: "' + util.inspect(str) + '"');
  }

  if (isEmptyString(str) || isEmptyString(pattern)) {
    return false;
  }

  var equals = utils.equalsPattern(options);
  if (equals(str)) {
    return true;
  }

  var isMatch = memoize('isMatch', pattern, options, micromatch.matcher);
  return isMatch(str);
};

/**
 * Returns true if some of the strings in the given `list` match any of the
 * given glob `patterns`.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.some(list, patterns[, options]);
 *
 * console.log(mm.some(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
 * // true
 * console.log(mm.some(['foo.js'], ['*.js', '!foo.js']));
 * // false
 * ```
 * @param  {String|Array} `list` The string or array of strings to test. Returns as soon as the first match is found.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

micromatch.some = function(list, patterns, options) {
  if (typeof list === 'string') {
    list = [list];
  }
  for (var i = 0; i < list.length; i++) {
    if (micromatch(list[i], patterns, options).length === 1) {
      return true;
    }
  }
  return false;
};

/**
 * Returns true if every string in the given `list` matches
 * any of the given glob `patterns`.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.every(list, patterns[, options]);
 *
 * console.log(mm.every('foo.js', ['foo.js']));
 * // true
 * console.log(mm.every(['foo.js', 'bar.js'], ['*.js']));
 * // true
 * console.log(mm.every(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
 * // false
 * console.log(mm.every(['foo.js'], ['*.js', '!foo.js']));
 * // false
 * ```
 * @param  {String|Array} `list` The string or array of strings to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

micromatch.every = function(list, patterns, options) {
  if (typeof list === 'string') {
    list = [list];
  }
  for (var i = 0; i < list.length; i++) {
    if (micromatch(list[i], patterns, options).length !== 1) {
      return false;
    }
  }
  return true;
};

/**
 * Returns true if **any** of the given glob `patterns`
 * match the specified `string`.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.any(string, patterns[, options]);
 *
 * console.log(mm.any('a.a', ['b.*', '*.a']));
 * //=> true
 * console.log(mm.any('a.a', 'b.*'));
 * //=> false
 * ```
 * @param  {String|Array} `str` The string to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

micromatch.any = function(str, patterns, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string: "' + util.inspect(str) + '"');
  }

  if (isEmptyString(str) || isEmptyString(patterns)) {
    return false;
  }

  if (typeof patterns === 'string') {
    patterns = [patterns];
  }

  for (var i = 0; i < patterns.length; i++) {
    if (micromatch.isMatch(str, patterns[i], options)) {
      return true;
    }
  }
  return false;
};

/**
 * Returns true if **all** of the given `patterns` match
 * the specified string.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.all(string, patterns[, options]);
 *
 * console.log(mm.all('foo.js', ['foo.js']));
 * // true
 *
 * console.log(mm.all('foo.js', ['*.js', '!foo.js']));
 * // false
 *
 * console.log(mm.all('foo.js', ['*.js', 'foo.js']));
 * // true
 *
 * console.log(mm.all('foo.js', ['*.js', 'f*', '*o*', '*o.js']));
 * // true
 * ```
 * @param  {String|Array} `str` The string to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

micromatch.all = function(str, patterns, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string: "' + util.inspect(str) + '"');
  }
  if (typeof patterns === 'string') {
    patterns = [patterns];
  }
  for (var i = 0; i < patterns.length; i++) {
    if (!micromatch.isMatch(str, patterns[i], options)) {
      return false;
    }
  }
  return true;
};

/**
 * Returns a list of strings that _**do not match any**_ of the given `patterns`.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.not(list, patterns[, options]);
 *
 * console.log(mm.not(['a.a', 'b.b', 'c.c'], '*.a'));
 * //=> ['b.b', 'c.c']
 * ```
 * @param {Array} `list` Array of strings to match.
 * @param {String|Array} `patterns` One or more glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Array} Returns an array of strings that **do not match** the given patterns.
 * @api public
 */

micromatch.not = function(list, patterns, options) {
  var opts = extend({}, options);
  var ignore = opts.ignore;
  delete opts.ignore;

  var unixify = utils.unixify(opts);
  list = utils.arrayify(list).map(unixify);

  var matches = utils.diff(list, micromatch(list, patterns, opts));
  if (ignore) {
    matches = utils.diff(matches, micromatch(list, ignore));
  }

  return opts.nodupes !== false ? utils.unique(matches) : matches;
};

/**
 * Returns true if the given `string` contains the given pattern. Similar
 * to [.isMatch](#isMatch) but the pattern can match any part of the string.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.contains(string, pattern[, options]);
 *
 * console.log(mm.contains('aa/bb/cc', '*b'));
 * //=> true
 * console.log(mm.contains('aa/bb/cc', '*d'));
 * //=> false
 * ```
 * @param {String} `str` The string to match.
 * @param {String|Array} `patterns` Glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if the patter matches any part of `str`.
 * @api public
 */

micromatch.contains = function(str, patterns, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string: "' + util.inspect(str) + '"');
  }

  if (typeof patterns === 'string') {
    if (isEmptyString(str) || isEmptyString(patterns)) {
      return false;
    }

    var equals = utils.equalsPattern(patterns, options);
    if (equals(str)) {
      return true;
    }
    var contains = utils.containsPattern(patterns, options);
    if (contains(str)) {
      return true;
    }
  }

  var opts = extend({}, options, {contains: true});
  return micromatch.any(str, patterns, opts);
};

/**
 * Returns true if the given pattern and options should enable
 * the `matchBase` option.
 * @return {Boolean}
 * @api private
 */

micromatch.matchBase = function(pattern, options) {
  if (pattern && pattern.indexOf('/') !== -1 || !options) return false;
  return options.basename === true || options.matchBase === true;
};

/**
 * Filter the keys of the given object with the given `glob` pattern
 * and `options`. Does not attempt to match nested keys. If you need this feature,
 * use [glob-object][] instead.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.matchKeys(object, patterns[, options]);
 *
 * var obj = { aa: 'a', ab: 'b', ac: 'c' };
 * console.log(mm.matchKeys(obj, '*b'));
 * //=> { ab: 'b' }
 * ```
 * @param {Object} `object` The object with keys to filter.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Object} Returns an object with only keys that match the given patterns.
 * @api public
 */

micromatch.matchKeys = function(obj, patterns, options) {
  if (!utils.isObject(obj)) {
    throw new TypeError('expected the first argument to be an object');
  }
  var keys = micromatch(Object.keys(obj), patterns, options);
  return utils.pick(obj, keys);
};

/**
 * Returns a memoized matcher function from the given glob `pattern` and `options`.
 * The returned function takes a string to match as its only argument and returns
 * true if the string is a match.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.matcher(pattern[, options]);
 *
 * var isMatch = mm.matcher('*.!(*a)');
 * console.log(isMatch('a.a'));
 * //=> false
 * console.log(isMatch('a.b'));
 * //=> true
 * ```
 * @param {String} `pattern` Glob pattern
 * @param {Object} `options` See available [options](#options) for changing how matches are performed.
 * @return {Function} Returns a matcher function.
 * @api public
 */

micromatch.matcher = function matcher(pattern, options) {
  if (Array.isArray(pattern)) {
    return compose(pattern, options, matcher);
  }

  // if pattern is a regex
  if (pattern instanceof RegExp) {
    return test(pattern);
  }

  // if pattern is invalid
  if (!utils.isString(pattern)) {
    throw new TypeError('expected pattern to be an array, string or regex');
  }

  // if pattern is a non-glob string
  if (!utils.hasSpecialChars(pattern)) {
    if (options && options.nocase === true) {
      pattern = pattern.toLowerCase();
    }
    return utils.matchPath(pattern, options);
  }

  // if pattern is a glob string
  var re = micromatch.makeRe(pattern, options);

  // if `options.matchBase` or `options.basename` is defined
  if (micromatch.matchBase(pattern, options)) {
    return utils.matchBasename(re, options);
  }

  function test(regex) {
    var equals = utils.equalsPattern(options);
    var unixify = utils.unixify(options);

    return function(str) {
      if (equals(str)) {
        return true;
      }

      if (regex.test(unixify(str))) {
        return true;
      }
      return false;
    };
  }

  var fn = test(re);
  Object.defineProperty(fn, 'result', {
    configurable: true,
    enumerable: false,
    value: re.result
  });
  return fn;
};

/**
 * Returns an array of matches captured by `pattern` in `string, or `null` if the pattern did not match.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.capture(pattern, string[, options]);
 *
 * console.log(mm.capture('test/*.js', 'test/foo.js'));
 * //=> ['foo']
 * console.log(mm.capture('test/*.js', 'foo/bar.css'));
 * //=> null
 * ```
 * @param {String} `pattern` Glob pattern to use for matching.
 * @param {String} `string` String to match
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns an array of captures if the string matches the glob pattern, otherwise `null`.
 * @api public
 */

micromatch.capture = function(pattern, str, options) {
  var re = micromatch.makeRe(pattern, extend({capture: true}, options));
  var unixify = utils.unixify(options);

  function match() {
    return function(string) {
      var match = re.exec(unixify(string));
      if (!match) {
        return null;
      }

      return match.slice(1);
    };
  }

  var capture = memoize('capture', pattern, options, match);
  return capture(str);
};

/**
 * Create a regular expression from the given glob `pattern`.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.makeRe(pattern[, options]);
 *
 * console.log(mm.makeRe('*.js'));
 * //=> /^(?:(\.[\\\/])?(?!\.)(?=.)[^\/]*?\.js)$/
 * ```
 * @param {String} `pattern` A glob pattern to convert to regex.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed.
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */

micromatch.makeRe = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  if (pattern.length > MAX_LENGTH) {
    throw new Error('expected pattern to be less than ' + MAX_LENGTH + ' characters');
  }

  function makeRe() {
    var result = micromatch.create(pattern, options);
    var ast_array = [];
    var output = result.map(function(obj) {
      obj.ast.state = obj.state;
      ast_array.push(obj.ast);
      return obj.output;
    });

    var regex = toRegex(output.join('|'), options);
    Object.defineProperty(regex, 'result', {
      configurable: true,
      enumerable: false,
      value: ast_array
    });
    return regex;
  }

  return memoize('makeRe', pattern, options, makeRe);
};

/**
 * Expand the given brace `pattern`.
 *
 * ```js
 * var mm = require('micromatch');
 * console.log(mm.braces('foo/{a,b}/bar'));
 * //=> ['foo/(a|b)/bar']
 *
 * console.log(mm.braces('foo/{a,b}/bar', {expand: true}));
 * //=> ['foo/(a|b)/bar']
 * ```
 * @param {String} `pattern` String with brace pattern to expand.
 * @param {Object} `options` Any [options](#options) to change how expansion is performed. See the [braces][] library for all available options.
 * @return {Array}
 * @api public
 */

micromatch.braces = function(pattern, options) {
  if (typeof pattern !== 'string' && !Array.isArray(pattern)) {
    throw new TypeError('expected pattern to be an array or string');
  }

  function expand() {
    if (options && options.nobrace === true || !/\{.*\}/.test(pattern)) {
      return utils.arrayify(pattern);
    }
    return braces(pattern, options);
  }

  return memoize('braces', pattern, options, expand);
};

/**
 * Proxy to the [micromatch.braces](#method), for parity with
 * minimatch.
 */

micromatch.braceExpand = function(pattern, options) {
  var opts = extend({}, options, {expand: true});
  return micromatch.braces(pattern, opts);
};

/**
 * Parses the given glob `pattern` and returns an array of abstract syntax
 * trees (ASTs), with the compiled `output` and optional source `map` on
 * each AST.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.create(pattern[, options]);
 *
 * console.log(mm.create('abc/*.js'));
 * // [{ options: { source: 'string', sourcemap: true },
 * //   state: {},
 * //   compilers:
 * //    { ... },
 * //   output: '(\\.[\\\\\\/])?abc\\/(?!\\.)(?=.)[^\\/]*?\\.js',
 * //   ast:
 * //    { type: 'root',
 * //      errors: [],
 * //      nodes:
 * //       [ ... ],
 * //      dot: false,
 * //      input: 'abc/*.js' },
 * //   parsingErrors: [],
 * //   map:
 * //    { version: 3,
 * //      sources: [ 'string' ],
 * //      names: [],
 * //      mappings: 'AAAA,GAAG,EAAC,kBAAC,EAAC,EAAE',
 * //      sourcesContent: [ 'abc/*.js' ] },
 * //   position: { line: 1, column: 28 },
 * //   content: {},
 * //   files: {},
 * //   idx: 6 }]
 * ```
 * @param {String} `pattern` Glob pattern to parse and compile.
 * @param {Object} `options` Any [options](#options) to change how parsing and compiling is performed.
 * @return {Object} Returns an object with the parsed AST, compiled string and optional source map.
 * @api public
 */

micromatch.create = function(pattern, options) {
  return memoize('create', pattern, options, function() {
    function create(str, opts) {
      return micromatch.compile(micromatch.parse(str, opts), opts);
    }

    pattern = micromatch.braces(pattern, options);
    var len = pattern.length;
    var idx = -1;
    var res = [];

    while (++idx < len) {
      res.push(create(pattern[idx], options));
    }
    return res;
  });
};

/**
 * Parse the given `str` with the given `options`.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.parse(pattern[, options]);
 *
 * var ast = mm.parse('a/{b,c}/d');
 * console.log(ast);
 * // { type: 'root',
 * //   errors: [],
 * //   input: 'a/{b,c}/d',
 * //   nodes:
 * //    [ { type: 'bos', val: '' },
 * //      { type: 'text', val: 'a/' },
 * //      { type: 'brace',
 * //        nodes:
 * //         [ { type: 'brace.open', val: '{' },
 * //           { type: 'text', val: 'b,c' },
 * //           { type: 'brace.close', val: '}' } ] },
 * //      { type: 'text', val: '/d' },
 * //      { type: 'eos', val: '' } ] }
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object} Returns an AST
 * @api public
 */

micromatch.parse = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected a string');
  }

  function parse() {
    var snapdragon = utils.instantiate(null, options);
    parsers(snapdragon, options);

    var ast = snapdragon.parse(pattern, options);
    utils.define(ast, 'snapdragon', snapdragon);
    ast.input = pattern;
    return ast;
  }

  return memoize('parse', pattern, options, parse);
};

/**
 * Compile the given `ast` or string with the given `options`.
 *
 * ```js
 * var mm = require('micromatch');
 * mm.compile(ast[, options]);
 *
 * var ast = mm.parse('a/{b,c}/d');
 * console.log(mm.compile(ast));
 * // { options: { source: 'string' },
 * //   state: {},
 * //   compilers:
 * //    { eos: [Function],
 * //      noop: [Function],
 * //      bos: [Function],
 * //      brace: [Function],
 * //      'brace.open': [Function],
 * //      text: [Function],
 * //      'brace.close': [Function] },
 * //   output: [ 'a/(b|c)/d' ],
 * //   ast:
 * //    { ... },
 * //   parsingErrors: [] }
 * ```
 * @param {Object|String} `ast`
 * @param {Object} `options`
 * @return {Object} Returns an object that has an `output` property with the compiled string.
 * @api public
 */

micromatch.compile = function(ast, options) {
  if (typeof ast === 'string') {
    ast = micromatch.parse(ast, options);
  }

  return memoize('compile', ast.input, options, function() {
    var snapdragon = utils.instantiate(ast, options);
    compilers(snapdragon, options);
    return snapdragon.compile(ast, options);
  });
};

/**
 * Clear the regex cache.
 *
 * ```js
 * mm.clearCache();
 * ```
 * @api public
 */

micromatch.clearCache = function() {
  micromatch.cache.caches = {};
};

/**
 * Returns true if the given value is effectively an empty string
 */

function isEmptyString(val) {
  return String(val) === '' || String(val) === './';
}

/**
 * Compose a matcher function with the given patterns.
 * This allows matcher functions to be compiled once and
 * called multiple times.
 */

function compose(patterns, options, matcher) {
  var matchers;

  return memoize('compose', String(patterns), options, function() {
    return function(file) {
      // delay composition until it's invoked the first time,
      // after that it won't be called again
      if (!matchers) {
        matchers = [];
        for (var i = 0; i < patterns.length; i++) {
          matchers.push(matcher(patterns[i], options));
        }
      }

      var len = matchers.length;
      while (len--) {
        if (matchers[len](file) === true) {
          return true;
        }
      }
      return false;
    };
  });
}

/**
 * Memoize a generated regex or function. A unique key is generated
 * from the `type` (usually method name), the `pattern`, and
 * user-defined options.
 */

function memoize(type, pattern, options, fn) {
  var key = utils.createKey(type + '=' + pattern, options);

  if (options && options.cache === false) {
    return fn(pattern, options);
  }

  if (cache.has(type, key)) {
    return cache.get(type, key);
  }

  var val = fn(pattern, options);
  cache.set(type, key, val);
  return val;
}

/**
 * Expose compiler, parser and cache on `micromatch`
 */

micromatch.compilers = compilers;
micromatch.parsers = parsers;
micromatch.caches = cache.caches;

/**
 * Expose `micromatch`
 * @type {Function}
 */

module.exports = micromatch;

},{"./lib/cache":156,"./lib/compilers":157,"./lib/parsers":158,"./lib/utils":159,"braces":91,"extend-shallow":115,"to-regex":223,"util":6}],156:[function(require,module,exports){
module.exports = new (require('fragment-cache'))();

},{"fragment-cache":132}],157:[function(require,module,exports){
'use strict';

var nanomatch = require('nanomatch');
var extglob = require('extglob');

module.exports = function(snapdragon) {
  var compilers = snapdragon.compiler.compilers;
  var opts = snapdragon.options;

  // register nanomatch compilers
  snapdragon.use(nanomatch.compilers);

  // get references to some specific nanomatch compilers before they
  // are overridden by the extglob and/or custom compilers
  var escape = compilers.escape;
  var qmark = compilers.qmark;
  var slash = compilers.slash;
  var star = compilers.star;
  var text = compilers.text;
  var plus = compilers.plus;
  var dot = compilers.dot;

  // register extglob compilers or escape exglobs if disabled
  if (opts.extglob === false || opts.noext === true) {
    snapdragon.compiler.use(escapeExtglobs);
  } else {
    snapdragon.use(extglob.compilers);
  }

  snapdragon.use(function() {
    this.options.star = this.options.star || function(/*node*/) {
      return '[^\\\\/]*?';
    };
  });

  // custom micromatch compilers
  snapdragon.compiler

    // reset referenced compiler
    .set('dot', dot)
    .set('escape', escape)
    .set('plus', plus)
    .set('slash', slash)
    .set('qmark', qmark)
    .set('star', star)
    .set('text', text);
};

function escapeExtglobs(compiler) {
  compiler.set('paren', function(node) {
    var val = '';
    visit(node, function(tok) {
      if (tok.val) val += (/^\W/.test(tok.val) ? '\\' : '') + tok.val;
    });
    return this.emit(val, node);
  });

  /**
   * Visit `node` with the given `fn`
   */

  function visit(node, fn) {
    return node.nodes ? mapVisit(node.nodes, fn) : fn(node);
  }

  /**
   * Map visit over array of `nodes`.
   */

  function mapVisit(nodes, fn) {
    var len = nodes.length;
    var idx = -1;
    while (++idx < len) {
      visit(nodes[idx], fn);
    }
  }
}

},{"extglob":117,"nanomatch":163}],158:[function(require,module,exports){
'use strict';

var extglob = require('extglob');
var nanomatch = require('nanomatch');
var regexNot = require('regex-not');
var toRegex = require('to-regex');
var not;

/**
 * Characters to use in negation regex (we want to "not" match
 * characters that are matched by other parsers)
 */

var TEXT = '([!@*?+]?\\(|\\)|\\[:?(?=.*?:?\\])|:?\\]|[*+?!^$.\\\\/])+';
var createNotRegex = function(opts) {
  return not || (not = textRegex(TEXT));
};

/**
 * Parsers
 */

module.exports = function(snapdragon) {
  var parsers = snapdragon.parser.parsers;

  // register nanomatch parsers
  snapdragon.use(nanomatch.parsers);

  // get references to some specific nanomatch parsers before they
  // are overridden by the extglob and/or parsers
  var escape = parsers.escape;
  var slash = parsers.slash;
  var qmark = parsers.qmark;
  var plus = parsers.plus;
  var star = parsers.star;
  var dot = parsers.dot;

  // register extglob parsers
  snapdragon.use(extglob.parsers);

  // custom micromatch parsers
  snapdragon.parser
    .use(function() {
      // override "notRegex" created in nanomatch parser
      this.notRegex = /^\!+(?!\()/;
    })
    // reset the referenced parsers
    .capture('escape', escape)
    .capture('slash', slash)
    .capture('qmark', qmark)
    .capture('star', star)
    .capture('plus', plus)
    .capture('dot', dot)

    /**
     * Override `text` parser
     */

    .capture('text', function() {
      if (this.isInside('bracket')) return;
      var pos = this.position();
      var m = this.match(createNotRegex(this.options));
      if (!m || !m[0]) return;

      // escape regex boundary characters and simple brackets
      var val = m[0].replace(/([[\]^$])/g, '\\$1');

      return pos({
        type: 'text',
        val: val
      });
    });
};

/**
 * Create text regex
 */

function textRegex(pattern) {
  var notStr = regexNot.create(pattern, {contains: true, strictClose: false});
  var prefix = '(?:[\\^]|\\\\|';
  return toRegex(prefix + notStr + ')', {strictClose: false});
}

},{"extglob":117,"nanomatch":163,"regex-not":175,"to-regex":223}],159:[function(require,module,exports){
(function (process){
'use strict';

var utils = module.exports;
var path = require('path');

/**
 * Module dependencies
 */

var Snapdragon = require('snapdragon');
utils.define = require('define-property');
utils.diff = require('arr-diff');
utils.extend = require('extend-shallow');
utils.pick = require('object.pick');
utils.typeOf = require('kind-of');
utils.unique = require('array-unique');

/**
 * Returns true if the platform is windows, or `path.sep` is `\\`.
 * This is defined as a function to allow `path.sep` to be set in unit tests,
 * or by the user, if there is a reason to do so.
 * @return {Boolean}
 */

utils.isWindows = function() {
  return path.sep === '\\' || process.platform === 'win32';
};

/**
 * Get the `Snapdragon` instance to use
 */

utils.instantiate = function(ast, options) {
  var snapdragon;
  // if an instance was created by `.parse`, use that instance
  if (utils.typeOf(ast) === 'object' && ast.snapdragon) {
    snapdragon = ast.snapdragon;
  // if the user supplies an instance on options, use that instance
  } else if (utils.typeOf(options) === 'object' && options.snapdragon) {
    snapdragon = options.snapdragon;
  // create a new instance
  } else {
    snapdragon = new Snapdragon(options);
  }

  utils.define(snapdragon, 'parse', function(str, options) {
    var parsed = Snapdragon.prototype.parse.apply(this, arguments);
    parsed.input = str;

    // escape unmatched brace/bracket/parens
    var last = this.parser.stack.pop();
    if (last && this.options.strictErrors !== true) {
      var open = last.nodes[0];
      var inner = last.nodes[1];
      if (last.type === 'bracket') {
        if (inner.val.charAt(0) === '[') {
          inner.val = '\\' + inner.val;
        }

      } else {
        open.val = '\\' + open.val;
        var sibling = open.parent.nodes[1];
        if (sibling.type === 'star') {
          sibling.loose = true;
        }
      }
    }

    // add non-enumerable parser reference
    utils.define(parsed, 'parser', this.parser);
    return parsed;
  });

  return snapdragon;
};

/**
 * Create the key to use for memoization. The key is generated
 * by iterating over the options and concatenating key-value pairs
 * to the pattern string.
 */

utils.createKey = function(pattern, options) {
  if (utils.typeOf(options) !== 'object') {
    return pattern;
  }
  var val = pattern;
  var keys = Object.keys(options);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    val += ';' + key + '=' + String(options[key]);
  }
  return val;
};

/**
 * Cast `val` to an array
 * @return {Array}
 */

utils.arrayify = function(val) {
  if (typeof val === 'string') return [val];
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Return true if `val` is a non-empty string
 */

utils.isString = function(val) {
  return typeof val === 'string';
};

/**
 * Return true if `val` is a non-empty string
 */

utils.isObject = function(val) {
  return utils.typeOf(val) === 'object';
};

/**
 * Returns true if the given `str` has special characters
 */

utils.hasSpecialChars = function(str) {
  return /(?:(?:(^|\/)[!.])|[*?+()|\[\]{}]|[+@]\()/.test(str);
};

/**
 * Escape regex characters in the given string
 */

utils.escapeRegex = function(str) {
  return str.replace(/[-[\]{}()^$|*+?.\\\/\s]/g, '\\$&');
};

/**
 * Normalize slashes in the given filepath.
 *
 * @param {String} `filepath`
 * @return {String}
 */

utils.toPosixPath = function(str) {
  return str.replace(/\\+/g, '/');
};

/**
 * Strip backslashes before special characters in a string.
 *
 * @param {String} `str`
 * @return {String}
 */

utils.unescape = function(str) {
  return utils.toPosixPath(str.replace(/\\(?=[*+?!.])/g, ''));
};

/**
 * Strip the prefix from a filepath
 * @param {String} `fp`
 * @return {String}
 */

utils.stripPrefix = function(str) {
  if (str.charAt(0) !== '.') {
    return str;
  }
  var ch = str.charAt(1);
  if (utils.isSlash(ch)) {
    return str.slice(2);
  }
  return str;
};

/**
 * Returns true if the given str is an escaped or
 * unescaped path character
 */

utils.isSlash = function(str) {
  return str === '/' || str === '\\/' || str === '\\' || str === '\\\\';
};

/**
 * Returns a function that returns true if the given
 * pattern matches or contains a `filepath`
 *
 * @param {String} `pattern`
 * @return {Function}
 */

utils.matchPath = function(pattern, options) {
  return (options && options.contains)
    ? utils.containsPattern(pattern, options)
    : utils.equalsPattern(pattern, options);
};

/**
 * Returns true if the given (original) filepath or unixified path are equal
 * to the given pattern.
 */

utils._equals = function(filepath, unixPath, pattern) {
  return pattern === filepath || pattern === unixPath;
};

/**
 * Returns true if the given (original) filepath or unixified path contain
 * the given pattern.
 */

utils._contains = function(filepath, unixPath, pattern) {
  return filepath.indexOf(pattern) !== -1 || unixPath.indexOf(pattern) !== -1;
};

/**
 * Returns a function that returns true if the given
 * pattern is the same as a given `filepath`
 *
 * @param {String} `pattern`
 * @return {Function}
 */

utils.equalsPattern = function(pattern, options) {
  var unixify = utils.unixify(options);
  options = options || {};

  return function fn(filepath) {
    var equal = utils._equals(filepath, unixify(filepath), pattern);
    if (equal === true || options.nocase !== true) {
      return equal;
    }
    var lower = filepath.toLowerCase();
    return utils._equals(lower, unixify(lower), pattern);
  };
};

/**
 * Returns a function that returns true if the given
 * pattern contains a `filepath`
 *
 * @param {String} `pattern`
 * @return {Function}
 */

utils.containsPattern = function(pattern, options) {
  var unixify = utils.unixify(options);
  options = options || {};

  return function(filepath) {
    var contains = utils._contains(filepath, unixify(filepath), pattern);
    if (contains === true || options.nocase !== true) {
      return contains;
    }
    var lower = filepath.toLowerCase();
    return utils._contains(lower, unixify(lower), pattern);
  };
};

/**
 * Returns a function that returns true if the given
 * regex matches the `filename` of a file path.
 *
 * @param {RegExp} `re` Matching regex
 * @return {Function}
 */

utils.matchBasename = function(re) {
  return function(filepath) {
    return re.test(path.basename(filepath));
  };
};

/**
 * Determines the filepath to return based on the provided options.
 * @return {any}
 */

utils.value = function(str, unixify, options) {
  if (options && options.unixify === false) {
    return str;
  }
  return unixify(str);
};

/**
 * Returns a function that normalizes slashes in a string to forward
 * slashes, strips `./` from beginning of paths, and optionally unescapes
 * special characters.
 * @return {Function}
 */

utils.unixify = function(options) {
  options = options || {};
  return function(filepath) {
    if (utils.isWindows() || options.unixify === true) {
      filepath = utils.toPosixPath(filepath);
    }
    if (options.stripPrefix !== false) {
      filepath = utils.stripPrefix(filepath);
    }
    if (options.unescape === true) {
      filepath = utils.unescape(filepath);
    }
    return filepath;
  };
};

}).call(this,require('_process'))
},{"_process":3,"arr-diff":81,"array-unique":84,"define-property":103,"extend-shallow":115,"kind-of":152,"object.pick":172,"path":2,"snapdragon":194}],160:[function(require,module,exports){
'use strict';

var isExtendable = require('is-extendable');
var forIn = require('for-in');

function mixinDeep(target, objects) {
  var len = arguments.length, i = 0;
  while (++i < len) {
    var obj = arguments[i];
    if (isObject(obj)) {
      forIn(obj, copy, target);
    }
  }
  return target;
}

/**
 * Copy properties from the source object to the
 * target object.
 *
 * @param  {*} `val`
 * @param  {String} `key`
 */

function copy(val, key) {
  if (key === '__proto__') {
    return;
  }

  var obj = this[key];
  if (isObject(val) && isObject(obj)) {
    mixinDeep(obj, val);
  } else {
    this[key] = val;
  }
}

/**
 * Returns true if `val` is an object or function.
 *
 * @param  {any} val
 * @return {Boolean}
 */

function isObject(val) {
  return isExtendable(val) && !Array.isArray(val);
}

/**
 * Expose `mixinDeep`
 */

module.exports = mixinDeep;

},{"for-in":131,"is-extendable":161}],161:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"dup":116,"is-plain-object":147}],162:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],163:[function(require,module,exports){
'use strict';

/**
 * Module dependencies
 */

var util = require('util');
var toRegex = require('to-regex');
var extend = require('extend-shallow');

/**
 * Local dependencies
 */

var compilers = require('./lib/compilers');
var parsers = require('./lib/parsers');
var cache = require('./lib/cache');
var utils = require('./lib/utils');
var MAX_LENGTH = 1024 * 64;

/**
 * The main function takes a list of strings and one or more
 * glob patterns to use for matching.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm(list, patterns[, options]);
 *
 * console.log(nm(['a.js', 'a.txt'], ['*.js']));
 * //=> [ 'a.js' ]
 * ```
 * @param {Array} `list` A list of strings to match
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Array} Returns an array of matches
 * @summary false
 * @api public
 */

function nanomatch(list, patterns, options) {
  patterns = utils.arrayify(patterns);
  list = utils.arrayify(list);

  var len = patterns.length;
  if (list.length === 0 || len === 0) {
    return [];
  }

  if (len === 1) {
    return nanomatch.match(list, patterns[0], options);
  }

  var negated = false;
  var omit = [];
  var keep = [];
  var idx = -1;

  while (++idx < len) {
    var pattern = patterns[idx];

    if (typeof pattern === 'string' && pattern.charCodeAt(0) === 33 /* ! */) {
      omit.push.apply(omit, nanomatch.match(list, pattern.slice(1), options));
      negated = true;
    } else {
      keep.push.apply(keep, nanomatch.match(list, pattern, options));
    }
  }

  // minimatch.match parity
  if (negated && keep.length === 0) {
    if (options && options.unixify === false) {
      keep = list.slice();
    } else {
      var unixify = utils.unixify(options);
      for (var i = 0; i < list.length; i++) {
        keep.push(unixify(list[i]));
      }
    }
  }

  var matches = utils.diff(keep, omit);
  if (!options || options.nodupes !== false) {
    return utils.unique(matches);
  }

  return matches;
}

/**
 * Similar to the main function, but `pattern` must be a string.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.match(list, pattern[, options]);
 *
 * console.log(nm.match(['a.a', 'a.aa', 'a.b', 'a.c'], '*.a'));
 * //=> ['a.a', 'a.aa']
 * ```
 * @param {Array} `list` Array of strings to match
 * @param {String} `pattern` Glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Array} Returns an array of matches
 * @api public
 */

nanomatch.match = function(list, pattern, options) {
  if (Array.isArray(pattern)) {
    throw new TypeError('expected pattern to be a string');
  }

  var unixify = utils.unixify(options);
  var isMatch = memoize('match', pattern, options, nanomatch.matcher);
  var matches = [];

  list = utils.arrayify(list);
  var len = list.length;
  var idx = -1;

  while (++idx < len) {
    var ele = list[idx];
    if (ele === pattern || isMatch(ele)) {
      matches.push(utils.value(ele, unixify, options));
    }
  }

  // if no options were passed, uniquify results and return
  if (typeof options === 'undefined') {
    return utils.unique(matches);
  }

  if (matches.length === 0) {
    if (options.failglob === true) {
      throw new Error('no matches found for "' + pattern + '"');
    }
    if (options.nonull === true || options.nullglob === true) {
      return [options.unescape ? utils.unescape(pattern) : pattern];
    }
  }

  // if `opts.ignore` was defined, diff ignored list
  if (options.ignore) {
    matches = nanomatch.not(matches, options.ignore, options);
  }

  return options.nodupes !== false ? utils.unique(matches) : matches;
};

/**
 * Returns true if the specified `string` matches the given glob `pattern`.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.isMatch(string, pattern[, options]);
 *
 * console.log(nm.isMatch('a.a', '*.a'));
 * //=> true
 * console.log(nm.isMatch('a.b', '*.a'));
 * //=> false
 * ```
 * @param {String} `string` String to match
 * @param {String} `pattern` Glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if the string matches the glob pattern.
 * @api public
 */

nanomatch.isMatch = function(str, pattern, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string: "' + util.inspect(str) + '"');
  }

  if (utils.isEmptyString(str) || utils.isEmptyString(pattern)) {
    return false;
  }

  var equals = utils.equalsPattern(options);
  if (equals(str)) {
    return true;
  }

  var isMatch = memoize('isMatch', pattern, options, nanomatch.matcher);
  return isMatch(str);
};

/**
 * Returns true if some of the elements in the given `list` match any of the
 * given glob `patterns`.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.some(list, patterns[, options]);
 *
 * console.log(nm.some(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
 * // true
 * console.log(nm.some(['foo.js'], ['*.js', '!foo.js']));
 * // false
 * ```
 * @param  {String|Array} `list` The string or array of strings to test. Returns as soon as the first match is found.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

nanomatch.some = function(list, patterns, options) {
  if (typeof list === 'string') {
    list = [list];
  }

  for (var i = 0; i < list.length; i++) {
    if (nanomatch(list[i], patterns, options).length === 1) {
      return true;
    }
  }

  return false;
};

/**
 * Returns true if every element in the given `list` matches
 * at least one of the given glob `patterns`.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.every(list, patterns[, options]);
 *
 * console.log(nm.every('foo.js', ['foo.js']));
 * // true
 * console.log(nm.every(['foo.js', 'bar.js'], ['*.js']));
 * // true
 * console.log(nm.every(['foo.js', 'bar.js'], ['*.js', '!foo.js']));
 * // false
 * console.log(nm.every(['foo.js'], ['*.js', '!foo.js']));
 * // false
 * ```
 * @param  {String|Array} `list` The string or array of strings to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

nanomatch.every = function(list, patterns, options) {
  if (typeof list === 'string') {
    list = [list];
  }

  for (var i = 0; i < list.length; i++) {
    if (nanomatch(list[i], patterns, options).length !== 1) {
      return false;
    }
  }

  return true;
};

/**
 * Returns true if **any** of the given glob `patterns`
 * match the specified `string`.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.any(string, patterns[, options]);
 *
 * console.log(nm.any('a.a', ['b.*', '*.a']));
 * //=> true
 * console.log(nm.any('a.a', 'b.*'));
 * //=> false
 * ```
 * @param  {String|Array} `str` The string to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

nanomatch.any = function(str, patterns, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string: "' + util.inspect(str) + '"');
  }

  if (utils.isEmptyString(str) || utils.isEmptyString(patterns)) {
    return false;
  }

  if (typeof patterns === 'string') {
    patterns = [patterns];
  }

  for (var i = 0; i < patterns.length; i++) {
    if (nanomatch.isMatch(str, patterns[i], options)) {
      return true;
    }
  }
  return false;
};

/**
 * Returns true if **all** of the given `patterns`
 * match the specified string.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.all(string, patterns[, options]);
 *
 * console.log(nm.all('foo.js', ['foo.js']));
 * // true
 *
 * console.log(nm.all('foo.js', ['*.js', '!foo.js']));
 * // false
 *
 * console.log(nm.all('foo.js', ['*.js', 'foo.js']));
 * // true
 *
 * console.log(nm.all('foo.js', ['*.js', 'f*', '*o*', '*o.js']));
 * // true
 * ```
 * @param  {String|Array} `str` The string to test.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if any patterns match `str`
 * @api public
 */

nanomatch.all = function(str, patterns, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string: "' + util.inspect(str) + '"');
  }

  if (typeof patterns === 'string') {
    patterns = [patterns];
  }

  for (var i = 0; i < patterns.length; i++) {
    if (!nanomatch.isMatch(str, patterns[i], options)) {
      return false;
    }
  }
  return true;
};

/**
 * Returns a list of strings that _**do not match any**_ of the given `patterns`.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.not(list, patterns[, options]);
 *
 * console.log(nm.not(['a.a', 'b.b', 'c.c'], '*.a'));
 * //=> ['b.b', 'c.c']
 * ```
 * @param {Array} `list` Array of strings to match.
 * @param {String|Array} `patterns` One or more glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Array} Returns an array of strings that **do not match** the given patterns.
 * @api public
 */

nanomatch.not = function(list, patterns, options) {
  var opts = extend({}, options);
  var ignore = opts.ignore;
  delete opts.ignore;

  list = utils.arrayify(list);

  var matches = utils.diff(list, nanomatch(list, patterns, opts));
  if (ignore) {
    matches = utils.diff(matches, nanomatch(list, ignore));
  }

  return opts.nodupes !== false ? utils.unique(matches) : matches;
};

/**
 * Returns true if the given `string` contains the given pattern. Similar
 * to [.isMatch](#isMatch) but the pattern can match any part of the string.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.contains(string, pattern[, options]);
 *
 * console.log(nm.contains('aa/bb/cc', '*b'));
 * //=> true
 * console.log(nm.contains('aa/bb/cc', '*d'));
 * //=> false
 * ```
 * @param {String} `str` The string to match.
 * @param {String|Array} `patterns` Glob pattern to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns true if the patter matches any part of `str`.
 * @api public
 */

nanomatch.contains = function(str, patterns, options) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string: "' + util.inspect(str) + '"');
  }

  if (typeof patterns === 'string') {
    if (utils.isEmptyString(str) || utils.isEmptyString(patterns)) {
      return false;
    }

    var equals = utils.equalsPattern(patterns, options);
    if (equals(str)) {
      return true;
    }
    var contains = utils.containsPattern(patterns, options);
    if (contains(str)) {
      return true;
    }
  }

  var opts = extend({}, options, {contains: true});
  return nanomatch.any(str, patterns, opts);
};

/**
 * Returns true if the given pattern and options should enable
 * the `matchBase` option.
 * @return {Boolean}
 * @api private
 */

nanomatch.matchBase = function(pattern, options) {
  if (pattern && pattern.indexOf('/') !== -1 || !options) return false;
  return options.basename === true || options.matchBase === true;
};

/**
 * Filter the keys of the given object with the given `glob` pattern
 * and `options`. Does not attempt to match nested keys. If you need this feature,
 * use [glob-object][] instead.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.matchKeys(object, patterns[, options]);
 *
 * var obj = { aa: 'a', ab: 'b', ac: 'c' };
 * console.log(nm.matchKeys(obj, '*b'));
 * //=> { ab: 'b' }
 * ```
 * @param {Object} `object` The object with keys to filter.
 * @param {String|Array} `patterns` One or more glob patterns to use for matching.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Object} Returns an object with only keys that match the given patterns.
 * @api public
 */

nanomatch.matchKeys = function(obj, patterns, options) {
  if (!utils.isObject(obj)) {
    throw new TypeError('expected the first argument to be an object');
  }
  var keys = nanomatch(Object.keys(obj), patterns, options);
  return utils.pick(obj, keys);
};

/**
 * Returns a memoized matcher function from the given glob `pattern` and `options`.
 * The returned function takes a string to match as its only argument and returns
 * true if the string is a match.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.matcher(pattern[, options]);
 *
 * var isMatch = nm.matcher('*.!(*a)');
 * console.log(isMatch('a.a'));
 * //=> false
 * console.log(isMatch('a.b'));
 * //=> true
 * ```
 * @param {String} `pattern` Glob pattern
 * @param {Object} `options` See available [options](#options) for changing how matches are performed.
 * @return {Function} Returns a matcher function.
 * @api public
 */

nanomatch.matcher = function matcher(pattern, options) {
  if (utils.isEmptyString(pattern)) {
    return function() {
      return false;
    };
  }

  if (Array.isArray(pattern)) {
    return compose(pattern, options, matcher);
  }

  // if pattern is a regex
  if (pattern instanceof RegExp) {
    return test(pattern);
  }

  // if pattern is invalid
  if (!utils.isString(pattern)) {
    throw new TypeError('expected pattern to be an array, string or regex');
  }

  // if pattern is a non-glob string
  if (!utils.hasSpecialChars(pattern)) {
    if (options && options.nocase === true) {
      pattern = pattern.toLowerCase();
    }
    return utils.matchPath(pattern, options);
  }

  // if pattern is a glob string
  var re = nanomatch.makeRe(pattern, options);

  // if `options.matchBase` or `options.basename` is defined
  if (nanomatch.matchBase(pattern, options)) {
    return utils.matchBasename(re, options);
  }

  function test(regex) {
    var equals = utils.equalsPattern(options);
    var unixify = utils.unixify(options);

    return function(str) {
      if (equals(str)) {
        return true;
      }

      if (regex.test(unixify(str))) {
        return true;
      }
      return false;
    };
  }

  // create matcher function
  var matcherFn = test(re);
  // set result object from compiler on matcher function,
  // as a non-enumerable property. useful for debugging
  utils.define(matcherFn, 'result', re.result);
  return matcherFn;
};

/**
 * Returns an array of matches captured by `pattern` in `string, or
 * `null` if the pattern did not match.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.capture(pattern, string[, options]);
 *
 * console.log(nm.capture('test/*.js', 'test/foo.js'));
 * //=> ['foo']
 * console.log(nm.capture('test/*.js', 'foo/bar.css'));
 * //=> null
 * ```
 * @param {String} `pattern` Glob pattern to use for matching.
 * @param {String} `string` String to match
 * @param {Object} `options` See available [options](#options) for changing how matches are performed
 * @return {Boolean} Returns an array of captures if the string matches the glob pattern, otherwise `null`.
 * @api public
 */

nanomatch.capture = function(pattern, str, options) {
  var re = nanomatch.makeRe(pattern, extend({capture: true}, options));
  var unixify = utils.unixify(options);

  function match() {
    return function(string) {
      var match = re.exec(unixify(string));
      if (!match) {
        return null;
      }

      return match.slice(1);
    };
  }

  var capture = memoize('capture', pattern, options, match);
  return capture(str);
};

/**
 * Create a regular expression from the given glob `pattern`.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.makeRe(pattern[, options]);
 *
 * console.log(nm.makeRe('*.js'));
 * //=> /^(?:(\.[\\\/])?(?!\.)(?=.)[^\/]*?\.js)$/
 * ```
 * @param {String} `pattern` A glob pattern to convert to regex.
 * @param {Object} `options` See available [options](#options) for changing how matches are performed.
 * @return {RegExp} Returns a regex created from the given pattern.
 * @api public
 */

nanomatch.makeRe = function(pattern, options) {
  if (pattern instanceof RegExp) {
    return pattern;
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('expected pattern to be a string');
  }

  if (pattern.length > MAX_LENGTH) {
    throw new Error('expected pattern to be less than ' + MAX_LENGTH + ' characters');
  }

  function makeRe() {
    var opts = utils.extend({wrap: false}, options);
    var result = nanomatch.create(pattern, opts);
    var regex = toRegex(result.output, opts);
    utils.define(regex, 'result', result);
    return regex;
  }

  return memoize('makeRe', pattern, options, makeRe);
};

/**
 * Parses the given glob `pattern` and returns an object with the compiled `output`
 * and optional source `map`.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.create(pattern[, options]);
 *
 * console.log(nm.create('abc/*.js'));
 * // { options: { source: 'string', sourcemap: true },
 * //   state: {},
 * //   compilers:
 * //    { ... },
 * //   output: '(\\.[\\\\\\/])?abc\\/(?!\\.)(?=.)[^\\/]*?\\.js',
 * //   ast:
 * //    { type: 'root',
 * //      errors: [],
 * //      nodes:
 * //       [ ... ],
 * //      dot: false,
 * //      input: 'abc/*.js' },
 * //   parsingErrors: [],
 * //   map:
 * //    { version: 3,
 * //      sources: [ 'string' ],
 * //      names: [],
 * //      mappings: 'AAAA,GAAG,EAAC,kBAAC,EAAC,EAAE',
 * //      sourcesContent: [ 'abc/*.js' ] },
 * //   position: { line: 1, column: 28 },
 * //   content: {},
 * //   files: {},
 * //   idx: 6 }
 * ```
 * @param {String} `pattern` Glob pattern to parse and compile.
 * @param {Object} `options` Any [options](#options) to change how parsing and compiling is performed.
 * @return {Object} Returns an object with the parsed AST, compiled string and optional source map.
 * @api public
 */

nanomatch.create = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected a string');
  }
  function create() {
    return nanomatch.compile(nanomatch.parse(pattern, options), options);
  }
  return memoize('create', pattern, options, create);
};

/**
 * Parse the given `str` with the given `options`.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.parse(pattern[, options]);
 *
 * var ast = nm.parse('a/{b,c}/d');
 * console.log(ast);
 * // { type: 'root',
 * //   errors: [],
 * //   input: 'a/{b,c}/d',
 * //   nodes:
 * //    [ { type: 'bos', val: '' },
 * //      { type: 'text', val: 'a/' },
 * //      { type: 'brace',
 * //        nodes:
 * //         [ { type: 'brace.open', val: '{' },
 * //           { type: 'text', val: 'b,c' },
 * //           { type: 'brace.close', val: '}' } ] },
 * //      { type: 'text', val: '/d' },
 * //      { type: 'eos', val: '' } ] }
 * ```
 * @param {String} `str`
 * @param {Object} `options`
 * @return {Object} Returns an AST
 * @api public
 */

nanomatch.parse = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected a string');
  }

  function parse() {
    var snapdragon = utils.instantiate(null, options);
    parsers(snapdragon, options);

    var ast = snapdragon.parse(pattern, options);
    utils.define(ast, 'snapdragon', snapdragon);
    ast.input = pattern;
    return ast;
  }

  return memoize('parse', pattern, options, parse);
};

/**
 * Compile the given `ast` or string with the given `options`.
 *
 * ```js
 * var nm = require('nanomatch');
 * nm.compile(ast[, options]);
 *
 * var ast = nm.parse('a/{b,c}/d');
 * console.log(nm.compile(ast));
 * // { options: { source: 'string' },
 * //   state: {},
 * //   compilers:
 * //    { eos: [Function],
 * //      noop: [Function],
 * //      bos: [Function],
 * //      brace: [Function],
 * //      'brace.open': [Function],
 * //      text: [Function],
 * //      'brace.close': [Function] },
 * //   output: [ 'a/(b|c)/d' ],
 * //   ast:
 * //    { ... },
 * //   parsingErrors: [] }
 * ```
 * @param {Object|String} `ast`
 * @param {Object} `options`
 * @return {Object} Returns an object that has an `output` property with the compiled string.
 * @api public
 */

nanomatch.compile = function(ast, options) {
  if (typeof ast === 'string') {
    ast = nanomatch.parse(ast, options);
  }

  function compile() {
    var snapdragon = utils.instantiate(ast, options);
    compilers(snapdragon, options);
    return snapdragon.compile(ast, options);
  }

  return memoize('compile', ast.input, options, compile);
};

/**
 * Clear the regex cache.
 *
 * ```js
 * nm.clearCache();
 * ```
 * @api public
 */

nanomatch.clearCache = function() {
  nanomatch.cache.__data__ = {};
};

/**
 * Compose a matcher function with the given patterns.
 * This allows matcher functions to be compiled once and
 * called multiple times.
 */

function compose(patterns, options, matcher) {
  var matchers;

  return memoize('compose', String(patterns), options, function() {
    return function(file) {
      // delay composition until it's invoked the first time,
      // after that it won't be called again
      if (!matchers) {
        matchers = [];
        for (var i = 0; i < patterns.length; i++) {
          matchers.push(matcher(patterns[i], options));
        }
      }

      var len = matchers.length;
      while (len--) {
        if (matchers[len](file) === true) {
          return true;
        }
      }
      return false;
    };
  });
}

/**
 * Memoize a generated regex or function. A unique key is generated
 * from the `type` (usually method name), the `pattern`, and
 * user-defined options.
 */

function memoize(type, pattern, options, fn) {
  var key = utils.createKey(type + '=' + pattern, options);

  if (options && options.cache === false) {
    return fn(pattern, options);
  }

  if (cache.has(type, key)) {
    return cache.get(type, key);
  }

  var val = fn(pattern, options);
  cache.set(type, key, val);
  return val;
}

/**
 * Expose compiler, parser and cache on `nanomatch`
 */

nanomatch.compilers = compilers;
nanomatch.parsers = parsers;
nanomatch.cache = cache;

/**
 * Expose `nanomatch`
 * @type {Function}
 */

module.exports = nanomatch;

},{"./lib/cache":164,"./lib/compilers":165,"./lib/parsers":166,"./lib/utils":167,"extend-shallow":115,"to-regex":223,"util":6}],164:[function(require,module,exports){
arguments[4][156][0].apply(exports,arguments)
},{"dup":156,"fragment-cache":132}],165:[function(require,module,exports){
'use strict';

/**
* Nanomatch compilers
*/

module.exports = function(nanomatch, options) {
  function slash() {
    if (options && typeof options.slash === 'string') {
      return options.slash;
    }
    if (options && typeof options.slash === 'function') {
      return options.slash.call(nanomatch);
    }
    return '\\\\/';
  }

  function star() {
    if (options && typeof options.star === 'string') {
      return options.star;
    }
    if (options && typeof options.star === 'function') {
      return options.star.call(nanomatch);
    }
    return '[^' + slash() + ']*?';
  }

  var ast = nanomatch.ast = nanomatch.parser.ast;
  ast.state = nanomatch.parser.state;
  nanomatch.compiler.state = ast.state;
  nanomatch.compiler

    /**
     * Negation / escaping
     */

    .set('not', function(node) {
      var prev = this.prev();
      if (this.options.nonegate === true || prev.type !== 'bos') {
        return this.emit('\\' + node.val, node);
      }
      return this.emit(node.val, node);
    })
    .set('escape', function(node) {
      if (this.options.unescape && /^[-\w_.]/.test(node.val)) {
        return this.emit(node.val, node);
      }
      return this.emit('\\' + node.val, node);
    })
    .set('quoted', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * Regex
     */

    .set('dollar', function(node) {
      if (node.parent.type === 'bracket') {
        return this.emit(node.val, node);
      }
      return this.emit('\\' + node.val, node);
    })

    /**
     * Dot: "."
     */

    .set('dot', function(node) {
      if (node.dotfiles === true) this.dotfiles = true;
      return this.emit('\\' + node.val, node);
    })

    /**
     * Slashes: "/" and "\"
     */

    .set('backslash', function(node) {
      return this.emit(node.val, node);
    })
    .set('slash', function(node, nodes, i) {
      var val = '[' + slash() + ']';
      var parent = node.parent;
      var prev = this.prev();

      // set "node.hasSlash" to true on all ancestor parens nodes
      while (parent.type === 'paren' && !parent.hasSlash) {
        parent.hasSlash = true;
        parent = parent.parent;
      }

      if (prev.addQmark) {
        val += '?';
      }

      // word boundary
      if (node.rest.slice(0, 2) === '\\b') {
        return this.emit(val, node);
      }

      // globstars
      if (node.parsed === '**' || node.parsed === './**') {
        this.output = '(?:' + this.output;
        return this.emit(val + ')?', node);
      }

      // negation
      if (node.parsed === '!**' && this.options.nonegate !== true) {
        return this.emit(val + '?\\b', node);
      }
      return this.emit(val, node);
    })

    /**
     * Square brackets
     */

    .set('bracket', function(node) {
      var close = node.close;
      var open = !node.escaped ? '[' : '\\[';
      var negated = node.negated;
      var inner = node.inner;
      var val = node.val;

      if (node.escaped === true) {
        inner = inner.replace(/\\?(\W)/g, '\\$1');
        negated = '';
      }

      if (inner === ']-') {
        inner = '\\]\\-';
      }

      if (negated && inner.indexOf('.') === -1) {
        inner += '.';
      }
      if (negated && inner.indexOf('/') === -1) {
        inner += '/';
      }

      val = open + negated + inner + close;
      return this.emit(val, node);
    })

    /**
     * Square: "[.]" (only matches a single character in brackets)
     */

    .set('square', function(node) {
      var val = (/^\W/.test(node.val) ? '\\' : '') + node.val;
      return this.emit(val, node);
    })

    /**
     * Question mark: "?"
     */

    .set('qmark', function(node) {
      var prev = this.prev();
      // don't use "slash" variable so that we always avoid
      // matching backslashes and slashes with a qmark
      var val = '[^.\\\\/]';
      if (this.options.dot || (prev.type !== 'bos' && prev.type !== 'slash')) {
        val = '[^\\\\/]';
      }

      if (node.parsed.slice(-1) === '(') {
        var ch = node.rest.charAt(0);
        if (ch === '!' || ch === '=' || ch === ':') {
          return this.emit(node.val, node);
        }
      }

      if (node.val.length > 1) {
        val += '{' + node.val.length + '}';
      }
      return this.emit(val, node);
    })

    /**
     * Plus
     */

    .set('plus', function(node) {
      var prev = node.parsed.slice(-1);
      if (prev === ']' || prev === ')') {
        return this.emit(node.val, node);
      }
      if (!this.output || (/[?*+]/.test(ch) && node.parent.type !== 'bracket')) {
        return this.emit('\\+', node);
      }
      var ch = this.output.slice(-1);
      if (/\w/.test(ch) && !node.inside) {
        return this.emit('+\\+?', node);
      }
      return this.emit('+', node);
    })

    /**
     * globstar: '**'
     */

    .set('globstar', function(node, nodes, i) {
      if (!this.output) {
        this.state.leadingGlobstar = true;
      }

      var prev = this.prev();
      var before = this.prev(2);
      var next = this.next();
      var after = this.next(2);
      var type = prev.type;
      var val = node.val;

      if (prev.type === 'slash' && next.type === 'slash') {
        if (before.type === 'text') {
          this.output += '?';

          if (after.type !== 'text') {
            this.output += '\\b';
          }
        }
      }

      var parsed = node.parsed;
      if (parsed.charAt(0) === '!') {
        parsed = parsed.slice(1);
      }

      var isInside = node.isInside.paren || node.isInside.brace;
      if (parsed && type !== 'slash' && type !== 'bos' && !isInside) {
        val = star();
      } else {
        val = this.options.dot !== true
          ? '(?:(?!(?:[' + slash() + ']|^)\\.).)*?'
          : '(?:(?!(?:[' + slash() + ']|^)(?:\\.{1,2})($|[' + slash() + ']))(?!\\.{2}).)*?';
      }

      if ((type === 'slash' || type === 'bos') && this.options.dot !== true) {
        val = '(?!\\.)' + val;
      }

      if (prev.type === 'slash' && next.type === 'slash' && before.type !== 'text') {
        if (after.type === 'text' || after.type === 'star') {
          node.addQmark = true;
        }
      }

      if (this.options.capture) {
        val = '(' + val + ')';
      }

      return this.emit(val, node);
    })

    /**
     * Star: "*"
     */

    .set('star', function(node, nodes, i) {
      var prior = nodes[i - 2] || {};
      var prev = this.prev();
      var next = this.next();
      var type = prev.type;

      function isStart(n) {
        return n.type === 'bos' || n.type === 'slash';
      }

      if (this.output === '' && this.options.contains !== true) {
        this.output = '(?![' + slash() + '])';
      }

      if (type === 'bracket' && this.options.bash === false) {
        var str = next && next.type === 'bracket' ? star() : '*?';
        if (!prev.nodes || prev.nodes[1].type !== 'posix') {
          return this.emit(str, node);
        }
      }

      var prefix = !this.dotfiles && type !== 'text' && type !== 'escape'
        ? (this.options.dot ? '(?!(?:^|[' + slash() + '])\\.{1,2}(?:$|[' + slash() + ']))' : '(?!\\.)')
        : '';

      if (isStart(prev) || (isStart(prior) && type === 'not')) {
        if (prefix !== '(?!\\.)') {
          prefix += '(?!(\\.{2}|\\.[' + slash() + ']))(?=.)';
        } else {
          prefix += '(?=.)';
        }
      } else if (prefix === '(?!\\.)') {
        prefix = '';
      }

      if (prev.type === 'not' && prior.type === 'bos' && this.options.dot === true) {
        this.output = '(?!\\.)' + this.output;
      }

      var output = prefix + star();
      if (this.options.capture) {
        output = '(' + output + ')';
      }

      return this.emit(output, node);
    })

    /**
     * Text
     */

    .set('text', function(node) {
      return this.emit(node.val, node);
    })

    /**
     * End-of-string
     */

    .set('eos', function(node) {
      var prev = this.prev();
      var val = node.val;

      this.output = '(?:\\.[' + slash() + '](?=.))?' + this.output;
      if (this.state.metachar && prev.type !== 'qmark' && prev.type !== 'slash') {
        val += (this.options.contains ? '[' + slash() + ']?' : '(?:[' + slash() + ']|$)');
      }

      return this.emit(val, node);
    });

  /**
   * Allow custom compilers to be passed on options
   */

  if (options && typeof options.compilers === 'function') {
    options.compilers(nanomatch.compiler);
  }
};


},{}],166:[function(require,module,exports){
'use strict';

var regexNot = require('regex-not');
var toRegex = require('to-regex');

/**
 * Characters to use in negation regex (we want to "not" match
 * characters that are matched by other parsers)
 */

var cached;
var NOT_REGEX = '[\\[!*+?$^"\'.\\\\/]+';
var not = createTextRegex(NOT_REGEX);

/**
 * Nanomatch parsers
 */

module.exports = function(nanomatch, options) {
  var parser = nanomatch.parser;
  var opts = parser.options;

  parser.state = {
    slashes: 0,
    paths: []
  };

  parser.ast.state = parser.state;
  parser

    /**
     * Beginning-of-string
     */

    .capture('prefix', function() {
      if (this.parsed) return;
      var m = this.match(/^\.[\\/]/);
      if (!m) return;
      this.state.strictOpen = !!this.options.strictOpen;
      this.state.addPrefix = true;
    })

    /**
     * Escape: "\\."
     */

    .capture('escape', function() {
      if (this.isInside('bracket')) return;
      var pos = this.position();
      var m = this.match(/^(?:\\(.)|([$^]))/);
      if (!m) return;

      return pos({
        type: 'escape',
        val: m[2] || m[1]
      });
    })

    /**
     * Quoted strings
     */

    .capture('quoted', function() {
      var pos = this.position();
      var m = this.match(/^["']/);
      if (!m) return;

      var quote = m[0];
      if (this.input.indexOf(quote) === -1) {
        return pos({
          type: 'escape',
          val: quote
        });
      }

      var tok = advanceTo(this.input, quote);
      this.consume(tok.len);

      return pos({
        type: 'quoted',
        val: tok.esc
      });
    })

    /**
     * Negations: "!"
     */

    .capture('not', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(this.notRegex || /^!+/);
      if (!m) return;
      var val = m[0];

      var isNegated = (val.length % 2) === 1;
      if (parsed === '' && !isNegated) {
        val = '';
      }

      // if nothing has been parsed, we know `!` is at the start,
      // so we need to wrap the result in a negation regex
      if (parsed === '' && isNegated && this.options.nonegate !== true) {
        this.bos.val = '(?!^(?:';
        this.append = ')$).*';
        val = '';
      }
      return pos({
        type: 'not',
        val: val
      });
    })

    /**
     * Dot: "."
     */

    .capture('dot', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\.+/);
      if (!m) return;

      var val = m[0];
      this.state.dot = val === '.' && (parsed === '' || parsed.slice(-1) === '/');

      return pos({
        type: 'dot',
        dotfiles: this.state.dot,
        val: val
      });
    })

    /**
     * Plus: "+"
     */

    .capture('plus', /^\+(?!\()/)

    /**
     * Question mark: "?"
     */

    .capture('qmark', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\?+(?!\()/);
      if (!m) return;

      this.state.metachar = true;
      this.state.qmark = true;

      return pos({
        type: 'qmark',
        parsed: parsed,
        val: m[0]
      });
    })

    /**
     * Globstar: "**"
     */

    .capture('globstar', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(/^\*{2}(?![*(])(?=[,)/]|$)/);
      if (!m) return;

      var type = opts.noglobstar !== true ? 'globstar' : 'star';
      var node = pos({type: type, parsed: parsed});
      this.state.metachar = true;

      while (this.input.slice(0, 4) === '/**/') {
        this.input = this.input.slice(3);
      }

      node.isInside = {
        brace: this.isInside('brace'),
        paren: this.isInside('paren')
      };

      if (type === 'globstar') {
        this.state.globstar = true;
        node.val = '**';

      } else {
        this.state.star = true;
        node.val = '*';
      }

      return node;
    })

    /**
     * Star: "*"
     */

    .capture('star', function() {
      var pos = this.position();
      var starRe = /^(?:\*(?![*(])|[*]{3,}(?!\()|[*]{2}(?![(/]|$)|\*(?=\*\())/;
      var m = this.match(starRe);
      if (!m) return;

      this.state.metachar = true;
      this.state.star = true;
      return pos({
        type: 'star',
        val: m[0]
      });
    })

    /**
     * Slash: "/"
     */

    .capture('slash', function() {
      var pos = this.position();
      var m = this.match(/^\//);
      if (!m) return;

      this.state.slashes++;
      return pos({
        type: 'slash',
        val: m[0]
      });
    })

    /**
     * Backslash: "\\"
     */

    .capture('backslash', function() {
      var pos = this.position();
      var m = this.match(/^\\(?![*+?(){}[\]'"])/);
      if (!m) return;

      var val = m[0];

      if (this.isInside('bracket')) {
        val = '\\';
      } else if (val.length > 1) {
        val = '\\\\';
      }

      return pos({
        type: 'backslash',
        val: val
      });
    })

    /**
     * Square: "[.]"
     */

    .capture('square', function() {
      if (this.isInside('bracket')) return;
      var pos = this.position();
      var m = this.match(/^\[([^!^\\])\]/);
      if (!m) return;

      return pos({
        type: 'square',
        val: m[1]
      });
    })

    /**
     * Brackets: "[...]" (basic, this can be overridden by other parsers)
     */

    .capture('bracket', function() {
      var pos = this.position();
      var m = this.match(/^(?:\[([!^]?)([^\]]+|\]-)(\]|[^*+?]+)|\[)/);
      if (!m) return;

      var val = m[0];
      var negated = m[1] ? '^' : '';
      var inner = (m[2] || '').replace(/\\\\+/, '\\\\');
      var close = m[3] || '';

      if (m[2] && inner.length < m[2].length) {
        val = val.replace(/\\\\+/, '\\\\');
      }

      var esc = this.input.slice(0, 2);
      if (inner === '' && esc === '\\]') {
        inner += esc;
        this.consume(2);

        var str = this.input;
        var idx = -1;
        var ch;

        while ((ch = str[++idx])) {
          this.consume(1);
          if (ch === ']') {
            close = ch;
            break;
          }
          inner += ch;
        }
      }

      return pos({
        type: 'bracket',
        val: val,
        escaped: close !== ']',
        negated: negated,
        inner: inner,
        close: close
      });
    })

    /**
     * Text
     */

    .capture('text', function() {
      if (this.isInside('bracket')) return;
      var pos = this.position();
      var m = this.match(not);
      if (!m || !m[0]) return;

      return pos({
        type: 'text',
        val: m[0]
      });
    });

  /**
   * Allow custom parsers to be passed on options
   */

  if (options && typeof options.parsers === 'function') {
    options.parsers(nanomatch.parser);
  }
};

/**
 * Advance to the next non-escaped character
 */

function advanceTo(input, endChar) {
  var ch = input.charAt(0);
  var tok = { len: 1, val: '', esc: '' };
  var idx = 0;

  function advance() {
    if (ch !== '\\') {
      tok.esc += '\\' + ch;
      tok.val += ch;
    }

    ch = input.charAt(++idx);
    tok.len++;

    if (ch === '\\') {
      advance();
      advance();
    }
  }

  while (ch && ch !== endChar) {
    advance();
  }
  return tok;
}

/**
 * Create text regex
 */

function createTextRegex(pattern) {
  if (cached) return cached;
  var opts = {contains: true, strictClose: false};
  var not = regexNot.create(pattern, opts);
  var re = toRegex('^(?:[*]\\((?=.)|' + not + ')', opts);
  return (cached = re);
}

/**
 * Expose negation string
 */

module.exports.not = NOT_REGEX;

},{"regex-not":175,"to-regex":223}],167:[function(require,module,exports){
'use strict';

var utils = module.exports;
var path = require('path');

/**
 * Module dependencies
 */

var isWindows = require('is-windows')();
var Snapdragon = require('snapdragon');
utils.define = require('define-property');
utils.diff = require('arr-diff');
utils.extend = require('extend-shallow');
utils.pick = require('object.pick');
utils.typeOf = require('kind-of');
utils.unique = require('array-unique');

/**
 * Returns true if the given value is effectively an empty string
 */

utils.isEmptyString = function(val) {
  return String(val) === '' || String(val) === './';
};

/**
 * Returns true if the platform is windows, or `path.sep` is `\\`.
 * This is defined as a function to allow `path.sep` to be set in unit tests,
 * or by the user, if there is a reason to do so.
 * @return {Boolean}
 */

utils.isWindows = function() {
  return path.sep === '\\' || isWindows === true;
};

/**
 * Return the last element from an array
 */

utils.last = function(arr, n) {
  return arr[arr.length - (n || 1)];
};

/**
 * Get the `Snapdragon` instance to use
 */

utils.instantiate = function(ast, options) {
  var snapdragon;
  // if an instance was created by `.parse`, use that instance
  if (utils.typeOf(ast) === 'object' && ast.snapdragon) {
    snapdragon = ast.snapdragon;
  // if the user supplies an instance on options, use that instance
  } else if (utils.typeOf(options) === 'object' && options.snapdragon) {
    snapdragon = options.snapdragon;
  // create a new instance
  } else {
    snapdragon = new Snapdragon(options);
  }

  utils.define(snapdragon, 'parse', function(str, options) {
    var parsed = Snapdragon.prototype.parse.call(this, str, options);
    parsed.input = str;

    // escape unmatched brace/bracket/parens
    var last = this.parser.stack.pop();
    if (last && this.options.strictErrors !== true) {
      var open = last.nodes[0];
      var inner = last.nodes[1];
      if (last.type === 'bracket') {
        if (inner.val.charAt(0) === '[') {
          inner.val = '\\' + inner.val;
        }

      } else {
        open.val = '\\' + open.val;
        var sibling = open.parent.nodes[1];
        if (sibling.type === 'star') {
          sibling.loose = true;
        }
      }
    }

    // add non-enumerable parser reference
    utils.define(parsed, 'parser', this.parser);
    return parsed;
  });

  return snapdragon;
};

/**
 * Create the key to use for memoization. The key is generated
 * by iterating over the options and concatenating key-value pairs
 * to the pattern string.
 */

utils.createKey = function(pattern, options) {
  if (typeof options === 'undefined') {
    return pattern;
  }
  var key = pattern;
  for (var prop in options) {
    if (options.hasOwnProperty(prop)) {
      key += ';' + prop + '=' + String(options[prop]);
    }
  }
  return key;
};

/**
 * Cast `val` to an array
 * @return {Array}
 */

utils.arrayify = function(val) {
  if (typeof val === 'string') return [val];
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Return true if `val` is a non-empty string
 */

utils.isString = function(val) {
  return typeof val === 'string';
};

/**
 * Return true if `val` is a non-empty string
 */

utils.isRegex = function(val) {
  return utils.typeOf(val) === 'regexp';
};

/**
 * Return true if `val` is a non-empty string
 */

utils.isObject = function(val) {
  return utils.typeOf(val) === 'object';
};

/**
 * Escape regex characters in the given string
 */

utils.escapeRegex = function(str) {
  return str.replace(/[-[\]{}()^$|*+?.\\/\s]/g, '\\$&');
};

/**
 * Combines duplicate characters in the provided `input` string.
 * @param {String} `input`
 * @returns {String}
 */

utils.combineDupes = function(input, patterns) {
  patterns = utils.arrayify(patterns).join('|').split('|');
  patterns = patterns.map(function(s) {
    return s.replace(/\\?([+*\\/])/g, '\\$1');
  });
  var substr = patterns.join('|');
  var regex = new RegExp('(' + substr + ')(?=\\1)', 'g');
  return input.replace(regex, '');
};

/**
 * Returns true if the given `str` has special characters
 */

utils.hasSpecialChars = function(str) {
  return /(?:(?:(^|\/)[!.])|[*?+()|[\]{}]|[+@]\()/.test(str);
};

/**
 * Normalize slashes in the given filepath.
 *
 * @param {String} `filepath`
 * @return {String}
 */

utils.toPosixPath = function(str) {
  return str.replace(/\\+/g, '/');
};

/**
 * Strip backslashes before special characters in a string.
 *
 * @param {String} `str`
 * @return {String}
 */

utils.unescape = function(str) {
  return utils.toPosixPath(str.replace(/\\(?=[*+?!.])/g, ''));
};

/**
 * Strip the drive letter from a windows filepath
 * @param {String} `fp`
 * @return {String}
 */

utils.stripDrive = function(fp) {
  return utils.isWindows() ? fp.replace(/^[a-z]:[\\/]+?/i, '/') : fp;
};

/**
 * Strip the prefix from a filepath
 * @param {String} `fp`
 * @return {String}
 */

utils.stripPrefix = function(str) {
  if (str.charAt(0) === '.' && (str.charAt(1) === '/' || str.charAt(1) === '\\')) {
    return str.slice(2);
  }
  return str;
};

/**
 * Returns true if `str` is a common character that doesn't need
 * to be processed to be used for matching.
 * @param {String} `str`
 * @return {Boolean}
 */

utils.isSimpleChar = function(str) {
  return str.trim() === '' || str === '.';
};

/**
 * Returns true if the given str is an escaped or
 * unescaped path character
 */

utils.isSlash = function(str) {
  return str === '/' || str === '\\/' || str === '\\' || str === '\\\\';
};

/**
 * Returns a function that returns true if the given
 * pattern matches or contains a `filepath`
 *
 * @param {String} `pattern`
 * @return {Function}
 */

utils.matchPath = function(pattern, options) {
  return (options && options.contains)
    ? utils.containsPattern(pattern, options)
    : utils.equalsPattern(pattern, options);
};

/**
 * Returns true if the given (original) filepath or unixified path are equal
 * to the given pattern.
 */

utils._equals = function(filepath, unixPath, pattern) {
  return pattern === filepath || pattern === unixPath;
};

/**
 * Returns true if the given (original) filepath or unixified path contain
 * the given pattern.
 */

utils._contains = function(filepath, unixPath, pattern) {
  return filepath.indexOf(pattern) !== -1 || unixPath.indexOf(pattern) !== -1;
};

/**
 * Returns a function that returns true if the given
 * pattern is the same as a given `filepath`
 *
 * @param {String} `pattern`
 * @return {Function}
 */

utils.equalsPattern = function(pattern, options) {
  var unixify = utils.unixify(options);
  options = options || {};

  return function fn(filepath) {
    var equal = utils._equals(filepath, unixify(filepath), pattern);
    if (equal === true || options.nocase !== true) {
      return equal;
    }
    var lower = filepath.toLowerCase();
    return utils._equals(lower, unixify(lower), pattern);
  };
};

/**
 * Returns a function that returns true if the given
 * pattern contains a `filepath`
 *
 * @param {String} `pattern`
 * @return {Function}
 */

utils.containsPattern = function(pattern, options) {
  var unixify = utils.unixify(options);
  options = options || {};

  return function(filepath) {
    var contains = utils._contains(filepath, unixify(filepath), pattern);
    if (contains === true || options.nocase !== true) {
      return contains;
    }
    var lower = filepath.toLowerCase();
    return utils._contains(lower, unixify(lower), pattern);
  };
};

/**
 * Returns a function that returns true if the given
 * regex matches the `filename` of a file path.
 *
 * @param {RegExp} `re` Matching regex
 * @return {Function}
 */

utils.matchBasename = function(re) {
  return function(filepath) {
    return re.test(filepath) || re.test(path.basename(filepath));
  };
};

/**
 * Returns the given value unchanced.
 * @return {any}
 */

utils.identity = function(val) {
  return val;
};

/**
 * Determines the filepath to return based on the provided options.
 * @return {any}
 */

utils.value = function(str, unixify, options) {
  if (options && options.unixify === false) {
    return str;
  }
  if (options && typeof options.unixify === 'function') {
    return options.unixify(str);
  }
  return unixify(str);
};

/**
 * Returns a function that normalizes slashes in a string to forward
 * slashes, strips `./` from beginning of paths, and optionally unescapes
 * special characters.
 * @return {Function}
 */

utils.unixify = function(options) {
  var opts = options || {};
  return function(filepath) {
    if (opts.stripPrefix !== false) {
      filepath = utils.stripPrefix(filepath);
    }
    if (opts.unescape === true) {
      filepath = utils.unescape(filepath);
    }
    if (opts.unixify === true || utils.isWindows()) {
      filepath = utils.toPosixPath(filepath);
    }
    return filepath;
  };
};

},{"arr-diff":81,"array-unique":84,"define-property":103,"extend-shallow":115,"is-windows":148,"kind-of":152,"object.pick":172,"path":2,"snapdragon":194}],168:[function(require,module,exports){
'use strict';

var typeOf = require('kind-of');
var copyDescriptor = require('copy-descriptor');
var define = require('define-property');

/**
 * Copy static properties, prototype properties, and descriptors from one object to another.
 *
 * ```js
 * function App() {}
 * var proto = App.prototype;
 * App.prototype.set = function() {};
 * App.prototype.get = function() {};
 *
 * var obj = {};
 * copy(obj, proto);
 * ```
 * @param {Object} `receiver`
 * @param {Object} `provider`
 * @param {String|Array} `omit` One or more properties to omit
 * @return {Object}
 * @api public
 */

function copy(receiver, provider, omit) {
  if (!isObject(receiver)) {
    throw new TypeError('expected receiving object to be an object.');
  }
  if (!isObject(provider)) {
    throw new TypeError('expected providing object to be an object.');
  }

  var props = nativeKeys(provider);
  var keys = Object.keys(provider);
  var len = props.length;
  omit = arrayify(omit);

  while (len--) {
    var key = props[len];

    if (has(keys, key)) {
      define(receiver, key, provider[key]);
    } else if (!(key in receiver) && !has(omit, key)) {
      copyDescriptor(receiver, provider, key);
    }
  }
};

/**
 * Return true if the given value is an object or function
 */

function isObject(val) {
  return typeOf(val) === 'object' || typeof val === 'function';
}

/**
 * Returns true if an array has any of the given elements, or an
 * object has any of the give keys.
 *
 * ```js
 * has(['a', 'b', 'c'], 'c');
 * //=> true
 *
 * has(['a', 'b', 'c'], ['c', 'z']);
 * //=> true
 *
 * has({a: 'b', c: 'd'}, ['c', 'z']);
 * //=> true
 * ```
 * @param {Object} `obj`
 * @param {String|Array} `val`
 * @return {Boolean}
 */

function has(obj, val) {
  val = arrayify(val);
  var len = val.length;

  if (isObject(obj)) {
    for (var key in obj) {
      if (val.indexOf(key) > -1) {
        return true;
      }
    }

    var keys = nativeKeys(obj);
    return has(keys, val);
  }

  if (Array.isArray(obj)) {
    var arr = obj;
    while (len--) {
      if (arr.indexOf(val[len]) > -1) {
        return true;
      }
    }
    return false;
  }

  throw new TypeError('expected an array or object.');
}

/**
 * Cast the given value to an array.
 *
 * ```js
 * arrayify('foo');
 * //=> ['foo']
 *
 * arrayify(['foo']);
 * //=> ['foo']
 * ```
 *
 * @param {String|Array} `val`
 * @return {Array}
 */

function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}

/**
 * Returns true if a value has a `contructor`
 *
 * ```js
 * hasConstructor({});
 * //=> true
 *
 * hasConstructor(Object.create(null));
 * //=> false
 * ```
 * @param  {Object} `value`
 * @return {Boolean}
 */

function hasConstructor(val) {
  return isObject(val) && typeof val.constructor !== 'undefined';
}

/**
 * Get the native `ownPropertyNames` from the constructor of the
 * given `object`. An empty array is returned if the object does
 * not have a constructor.
 *
 * ```js
 * nativeKeys({a: 'b', b: 'c', c: 'd'})
 * //=> ['a', 'b', 'c']
 *
 * nativeKeys(function(){})
 * //=> ['length', 'caller']
 * ```
 *
 * @param  {Object} `obj` Object that has a `constructor`.
 * @return {Array} Array of keys.
 */

function nativeKeys(val) {
  if (!hasConstructor(val)) return [];
  return Object.getOwnPropertyNames(val);
}

/**
 * Expose `copy`
 */

module.exports = copy;

/**
 * Expose `copy.has` for tests
 */

module.exports.has = has;

},{"copy-descriptor":102,"define-property":169,"kind-of":170}],169:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"dup":99,"is-descriptor":142}],170:[function(require,module,exports){
arguments[4][138][0].apply(exports,arguments)
},{"dup":138,"is-buffer":139}],171:[function(require,module,exports){
/*!
 * object-visit <https://github.com/jonschlinkert/object-visit>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var isObject = require('isobject');

module.exports = function visit(thisArg, method, target, val) {
  if (!isObject(thisArg) && typeof thisArg !== 'function') {
    throw new Error('object-visit expects `thisArg` to be an object.');
  }

  if (typeof method !== 'string') {
    throw new Error('object-visit expects `method` name to be a string');
  }

  if (typeof thisArg[method] !== 'function') {
    return thisArg;
  }

  var args = [].slice.call(arguments, 3);
  target = target || {};

  for (var key in target) {
    var arr = [key, target[key]].concat(args);
    thisArg[method].apply(thisArg, arr);
  }
  return thisArg;
};

},{"isobject":150}],172:[function(require,module,exports){
/*!
 * object.pick <https://github.com/jonschlinkert/object.pick>
 *
 * Copyright (c) 2014-2015 Jon Schlinkert, contributors.
 * Licensed under the MIT License
 */

'use strict';

var isObject = require('isobject');

module.exports = function pick(obj, keys) {
  if (!isObject(obj) && typeof obj !== 'function') {
    return {};
  }

  var res = {};
  if (typeof keys === 'string') {
    if (keys in obj) {
      res[keys] = obj[keys];
    }
    return res;
  }

  var len = keys.length;
  var idx = -1;

  while (++idx < len) {
    var key = keys[idx];
    if (key in obj) {
      res[key] = obj[key];
    }
  }
  return res;
};

},{"isobject":150}],173:[function(require,module,exports){
/*!
 * pascalcase <https://github.com/jonschlinkert/pascalcase>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

function pascalcase(str) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string.');
  }
  str = str.replace(/([A-Z])/g, ' $1');
  if (str.length === 1) { return str.toUpperCase(); }
  str = str.replace(/^[\W_]+|[\W_]+$/g, '').toLowerCase();
  str = str.charAt(0).toUpperCase() + str.slice(1);
  return str.replace(/[\W_]+(\w|$)/g, function (_, ch) {
    return ch.toUpperCase();
  });
}

module.exports = pascalcase;

},{}],174:[function(require,module,exports){
'use strict';

/**
 * POSIX character classes
 */

module.exports = {
  alnum: 'a-zA-Z0-9',
  alpha: 'a-zA-Z',
  ascii: '\\x00-\\x7F',
  blank: ' \\t',
  cntrl: '\\x00-\\x1F\\x7F',
  digit: '0-9',
  graph: '\\x21-\\x7E',
  lower: 'a-z',
  print: '\\x20-\\x7E ',
  punct: '\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~',
  space: ' \\t\\r\\n\\v\\f',
  upper: 'A-Z',
  word: 'A-Za-z0-9_',
  xdigit: 'A-Fa-f0-9'
};

},{}],175:[function(require,module,exports){
'use strict';

var extend = require('extend-shallow');
var safe = require('safe-regex');

/**
 * The main export is a function that takes a `pattern` string and an `options` object.
 *
 * ```js
 & var not = require('regex-not');
 & console.log(not('foo'));
 & //=> /^(?:(?!^(?:foo)$).)*$/
 * ```
 *
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {RegExp} Converts the given `pattern` to a regex using the specified `options`.
 * @api public
 */

function toRegex(pattern, options) {
  return new RegExp(toRegex.create(pattern, options));
}

/**
 * Create a regex-compatible string from the given `pattern` and `options`.
 *
 * ```js
 & var not = require('regex-not');
 & console.log(not.create('foo'));
 & //=> '^(?:(?!^(?:foo)$).)*$'
 * ```
 * @param {String} `pattern`
 * @param {Object} `options`
 * @return {String}
 * @api public
 */

toRegex.create = function(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('expected a string');
  }

  var opts = extend({}, options);
  if (opts.contains === true) {
    opts.strictNegate = false;
  }

  var open = opts.strictOpen !== false ? '^' : '';
  var close = opts.strictClose !== false ? '$' : '';
  var endChar = opts.endChar ? opts.endChar : '+';
  var str = pattern;

  if (opts.strictNegate === false) {
    str = '(?:(?!(?:' + pattern + ')).)' + endChar;
  } else {
    str = '(?:(?!^(?:' + pattern + ')$).)' + endChar;
  }

  var res = open + str + close;
  if (opts.safe === true && safe(res) === false) {
    throw new Error('potentially unsafe regular expression: ' + res);
  }

  return res;
};

/**
 * Expose `toRegex`
 */

module.exports = toRegex;

},{"extend-shallow":115,"safe-regex":184}],176:[function(require,module,exports){
/*!
 * repeat-element <https://github.com/jonschlinkert/repeat-element>
 *
 * Copyright (c) 2015-present, Jon Schlinkert.
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function repeat(ele, num) {
  var arr = new Array(num);

  for (var i = 0; i < num; i++) {
    arr[i] = ele;
  }

  return arr;
};

},{}],177:[function(require,module,exports){
/*!
 * repeat-string <https://github.com/jonschlinkert/repeat-string>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Results cache
 */

var res = '';
var cache;

/**
 * Expose `repeat`
 */

module.exports = repeat;

/**
 * Repeat the given `string` the specified `number`
 * of times.
 *
 * **Example:**
 *
 * ```js
 * var repeat = require('repeat-string');
 * repeat('A', 5);
 * //=> AAAAA
 * ```
 *
 * @param {String} `string` The string to repeat
 * @param {Number} `number` The number of times to repeat the string
 * @return {String} Repeated string
 * @api public
 */

function repeat(str, num) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  // cover common, quick use cases
  if (num === 1) return str;
  if (num === 2) return str + str;

  var max = str.length * num;
  if (cache !== str || typeof cache === 'undefined') {
    cache = str;
    res = '';
  } else if (res.length >= max) {
    return res.substr(0, max);
  }

  while (max > res.length && num > 1) {
    if (num & 1) {
      res += str;
    }

    num >>= 1;
    str += str;
  }

  res += str;
  res = res.substr(0, max);
  return res;
}

},{}],178:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}],179:[function(require,module,exports){
var util      = require('./util');
var types     = require('./types');
var sets      = require('./sets');
var positions = require('./positions');


module.exports = function(regexpStr) {
  var i = 0, l, c,
      start = { type: types.ROOT, stack: []},

      // Keep track of last clause/group and stack.
      lastGroup = start,
      last = start.stack,
      groupStack = [];


  var repeatErr = function(i) {
    util.error(regexpStr, 'Nothing to repeat at column ' + (i - 1));
  };

  // Decode a few escaped characters.
  var str = util.strToChars(regexpStr);
  l = str.length;

  // Iterate through each character in string.
  while (i < l) {
    c = str[i++];

    switch (c) {
      // Handle escaped characters, inclues a few sets.
      case '\\':
        c = str[i++];

        switch (c) {
          case 'b':
            last.push(positions.wordBoundary());
            break;

          case 'B':
            last.push(positions.nonWordBoundary());
            break;

          case 'w':
            last.push(sets.words());
            break;

          case 'W':
            last.push(sets.notWords());
            break;

          case 'd':
            last.push(sets.ints());
            break;

          case 'D':
            last.push(sets.notInts());
            break;

          case 's':
            last.push(sets.whitespace());
            break;

          case 'S':
            last.push(sets.notWhitespace());
            break;

          default:
            // Check if c is integer.
            // In which case it's a reference.
            if (/\d/.test(c)) {
              last.push({ type: types.REFERENCE, value: parseInt(c, 10) });

            // Escaped character.
            } else {
              last.push({ type: types.CHAR, value: c.charCodeAt(0) });
            }
        }

        break;


      // Positionals.
      case '^':
          last.push(positions.begin());
        break;

      case '$':
          last.push(positions.end());
        break;


      // Handle custom sets.
      case '[':
        // Check if this class is 'anti' i.e. [^abc].
        var not;
        if (str[i] === '^') {
          not = true;
          i++;
        } else {
          not = false;
        }

        // Get all the characters in class.
        var classTokens = util.tokenizeClass(str.slice(i), regexpStr);

        // Increase index by length of class.
        i += classTokens[1];
        last.push({
          type: types.SET,
          set: classTokens[0],
          not: not,
        });

        break;


      // Class of any character except \n.
      case '.':
        last.push(sets.anyChar());
        break;


      // Push group onto stack.
      case '(':
        // Create group.
        var group = {
          type: types.GROUP,
          stack: [],
          remember: true,
        };

        c = str[i];

        // If if this is a special kind of group.
        if (c === '?') {
          c = str[i + 1];
          i += 2;

          // Match if followed by.
          if (c === '=') {
            group.followedBy = true;

          // Match if not followed by.
          } else if (c === '!') {
            group.notFollowedBy = true;

          } else if (c !== ':') {
            util.error(regexpStr,
              'Invalid group, character \'' + c +
              '\' after \'?\' at column ' + (i - 1));
          }

          group.remember = false;
        }

        // Insert subgroup into current group stack.
        last.push(group);

        // Remember the current group for when the group closes.
        groupStack.push(lastGroup);

        // Make this new group the current group.
        lastGroup = group;
        last = group.stack;
        break;


      // Pop group out of stack.
      case ')':
        if (groupStack.length === 0) {
          util.error(regexpStr, 'Unmatched ) at column ' + (i - 1));
        }
        lastGroup = groupStack.pop();

        // Check if this group has a PIPE.
        // To get back the correct last stack.
        last = lastGroup.options ?
          lastGroup.options[lastGroup.options.length - 1] : lastGroup.stack;
        break;


      // Use pipe character to give more choices.
      case '|':
        // Create array where options are if this is the first PIPE
        // in this clause.
        if (!lastGroup.options) {
          lastGroup.options = [lastGroup.stack];
          delete lastGroup.stack;
        }

        // Create a new stack and add to options for rest of clause.
        var stack = [];
        lastGroup.options.push(stack);
        last = stack;
        break;


      // Repetition.
      // For every repetition, remove last element from last stack
      // then insert back a RANGE object.
      // This design is chosen because there could be more than
      // one repetition symbols in a regex i.e. `a?+{2,3}`.
      case '{':
        var rs = /^(\d+)(,(\d+)?)?\}/.exec(str.slice(i)), min, max;
        if (rs !== null) {
          if (last.length === 0) {
            repeatErr(i);
          }
          min = parseInt(rs[1], 10);
          max = rs[2] ? rs[3] ? parseInt(rs[3], 10) : Infinity : min;
          i += rs[0].length;

          last.push({
            type: types.REPETITION,
            min: min,
            max: max,
            value: last.pop(),
          });
        } else {
          last.push({
            type: types.CHAR,
            value: 123,
          });
        }
        break;

      case '?':
        if (last.length === 0) {
          repeatErr(i);
        }
        last.push({
          type: types.REPETITION,
          min: 0,
          max: 1,
          value: last.pop(),
        });
        break;

      case '+':
        if (last.length === 0) {
          repeatErr(i);
        }
        last.push({
          type: types.REPETITION,
          min: 1,
          max: Infinity,
          value: last.pop(),
        });
        break;

      case '*':
        if (last.length === 0) {
          repeatErr(i);
        }
        last.push({
          type: types.REPETITION,
          min: 0,
          max: Infinity,
          value: last.pop(),
        });
        break;


      // Default is a character that is not `\[](){}?+*^$`.
      default:
        last.push({
          type: types.CHAR,
          value: c.charCodeAt(0),
        });
    }

  }

  // Check if any groups have not been closed.
  if (groupStack.length !== 0) {
    util.error(regexpStr, 'Unterminated group');
  }

  return start;
};

module.exports.types = types;

},{"./positions":180,"./sets":181,"./types":182,"./util":183}],180:[function(require,module,exports){
var types = require('./types');

exports.wordBoundary = function() {
  return { type: types.POSITION, value: 'b' };
};

exports.nonWordBoundary = function() {
  return { type: types.POSITION, value: 'B' };
};

exports.begin = function() {
  return { type: types.POSITION, value: '^' };
};

exports.end = function() {
  return { type: types.POSITION, value: '$' };
};

},{"./types":182}],181:[function(require,module,exports){
var types = require('./types');

var INTS = function() {
 return [{ type: types.RANGE , from: 48, to: 57 }];
};

var WORDS = function() {
 return [
    { type: types.CHAR, value: 95 },
    { type: types.RANGE, from: 97, to: 122 },
    { type: types.RANGE, from: 65, to: 90 }
  ].concat(INTS());
};

var WHITESPACE = function() {
 return [
    { type: types.CHAR, value: 9 },
    { type: types.CHAR, value: 10 },
    { type: types.CHAR, value: 11 },
    { type: types.CHAR, value: 12 },
    { type: types.CHAR, value: 13 },
    { type: types.CHAR, value: 32 },
    { type: types.CHAR, value: 160 },
    { type: types.CHAR, value: 5760 },
    { type: types.CHAR, value: 6158 },
    { type: types.CHAR, value: 8192 },
    { type: types.CHAR, value: 8193 },
    { type: types.CHAR, value: 8194 },
    { type: types.CHAR, value: 8195 },
    { type: types.CHAR, value: 8196 },
    { type: types.CHAR, value: 8197 },
    { type: types.CHAR, value: 8198 },
    { type: types.CHAR, value: 8199 },
    { type: types.CHAR, value: 8200 },
    { type: types.CHAR, value: 8201 },
    { type: types.CHAR, value: 8202 },
    { type: types.CHAR, value: 8232 },
    { type: types.CHAR, value: 8233 },
    { type: types.CHAR, value: 8239 },
    { type: types.CHAR, value: 8287 },
    { type: types.CHAR, value: 12288 },
    { type: types.CHAR, value: 65279 }
  ];
};

var NOTANYCHAR = function() {
  return [
    { type: types.CHAR, value: 10 },
    { type: types.CHAR, value: 13 },
    { type: types.CHAR, value: 8232 },
    { type: types.CHAR, value: 8233 },
  ];
};

// Predefined class objects.
exports.words = function() {
  return { type: types.SET, set: WORDS(), not: false };
};

exports.notWords = function() {
  return { type: types.SET, set: WORDS(), not: true };
};

exports.ints = function() {
  return { type: types.SET, set: INTS(), not: false };
};

exports.notInts = function() {
  return { type: types.SET, set: INTS(), not: true };
};

exports.whitespace = function() {
  return { type: types.SET, set: WHITESPACE(), not: false };
};

exports.notWhitespace = function() {
  return { type: types.SET, set: WHITESPACE(), not: true };
};

exports.anyChar = function() {
  return { type: types.SET, set: NOTANYCHAR(), not: true };
};

},{"./types":182}],182:[function(require,module,exports){
module.exports = {
  ROOT       : 0,
  GROUP      : 1,
  POSITION   : 2,
  SET        : 3,
  RANGE      : 4,
  REPETITION : 5,
  REFERENCE  : 6,
  CHAR       : 7,
};

},{}],183:[function(require,module,exports){
var types = require('./types');
var sets  = require('./sets');


// All of these are private and only used by randexp.
// It's assumed that they will always be called with the correct input.

var CTRL = '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^ ?';
var SLSH = { '0': 0, 't': 9, 'n': 10, 'v': 11, 'f': 12, 'r': 13 };

/**
 * Finds character representations in str and convert all to
 * their respective characters
 *
 * @param {String} str
 * @return {String}
 */
exports.strToChars = function(str) {
  /* jshint maxlen: false */
  var chars_regex = /(\[\\b\])|(\\)?\\(?:u([A-F0-9]{4})|x([A-F0-9]{2})|(0?[0-7]{2})|c([@A-Z\[\\\]\^?])|([0tnvfr]))/g;
  str = str.replace(chars_regex, function(s, b, lbs, a16, b16, c8, dctrl, eslsh) {
    if (lbs) {
      return s;
    }

    var code = b     ? 8 :
               a16   ? parseInt(a16, 16) :
               b16   ? parseInt(b16, 16) :
               c8    ? parseInt(c8,   8) :
               dctrl ? CTRL.indexOf(dctrl) :
               SLSH[eslsh];

    var c = String.fromCharCode(code);

    // Escape special regex characters.
    if (/[\[\]{}\^$.|?*+()]/.test(c)) {
      c = '\\' + c;
    }

    return c;
  });

  return str;
};


/**
 * turns class into tokens
 * reads str until it encounters a ] not preceeded by a \
 *
 * @param {String} str
 * @param {String} regexpStr
 * @return {Array.<Array.<Object>, Number>}
 */
exports.tokenizeClass = function(str, regexpStr) {
  /* jshint maxlen: false */
  var tokens = [];
  var regexp = /\\(?:(w)|(d)|(s)|(W)|(D)|(S))|((?:(?:\\)(.)|([^\]\\]))-(?:\\)?([^\]]))|(\])|(?:\\)?(.)/g;
  var rs, c;


  while ((rs = regexp.exec(str)) != null) {
    if (rs[1]) {
      tokens.push(sets.words());

    } else if (rs[2]) {
      tokens.push(sets.ints());

    } else if (rs[3]) {
      tokens.push(sets.whitespace());

    } else if (rs[4]) {
      tokens.push(sets.notWords());

    } else if (rs[5]) {
      tokens.push(sets.notInts());

    } else if (rs[6]) {
      tokens.push(sets.notWhitespace());

    } else if (rs[7]) {
      tokens.push({
        type: types.RANGE,
        from: (rs[8] || rs[9]).charCodeAt(0),
          to: rs[10].charCodeAt(0),
      });

    } else if (c = rs[12]) {
      tokens.push({
        type: types.CHAR,
        value: c.charCodeAt(0),
      });

    } else {
      return [tokens, regexp.lastIndex];
    }
  }

  exports.error(regexpStr, 'Unterminated character class');
};


/**
 * Shortcut to throw errors.
 *
 * @param {String} regexp
 * @param {String} msg
 */
exports.error = function(regexp, msg) {
  throw new SyntaxError('Invalid regular expression: /' + regexp + '/: ' + msg);
};

},{"./sets":181,"./types":182}],184:[function(require,module,exports){
var parse = require('ret');
var types = parse.types;

module.exports = function (re, opts) {
    if (!opts) opts = {};
    var replimit = opts.limit === undefined ? 25 : opts.limit;
    
    if (isRegExp(re)) re = re.source;
    else if (typeof re !== 'string') re = String(re);
    
    try { re = parse(re) }
    catch (err) { return false }
    
    var reps = 0;
    return (function walk (node, starHeight) {
        if (node.type === types.REPETITION) {
            starHeight ++;
            reps ++;
            if (starHeight > 1) return false;
            if (reps > replimit) return false;
        }
        
        if (node.options) {
            for (var i = 0, len = node.options.length; i < len; i++) {
                var ok = walk({ stack: node.options[i] }, starHeight);
                if (!ok) return false;
            }
        }
        var stack = node.stack || (node.value && node.value.stack);
        if (!stack) return true;
        
        for (var i = 0; i < stack.length; i++) {
            var ok = walk(stack[i], starHeight);
            if (!ok) return false;
        }
        
        return true;
    })(re, 0);
};

function isRegExp (x) {
    return {}.toString.call(x) === '[object RegExp]';
}

},{"ret":179}],185:[function(require,module,exports){
/*!
 * set-value <https://github.com/jonschlinkert/set-value>
 *
 * Copyright (c) 2014-2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var split = require('split-string');
var extend = require('extend-shallow');
var isPlainObject = require('is-plain-object');
var isObject = require('is-extendable');

module.exports = function(obj, prop, val) {
  if (!isObject(obj)) {
    return obj;
  }

  if (Array.isArray(prop)) {
    prop = [].concat.apply([], prop).join('.');
  }

  if (typeof prop !== 'string') {
    return obj;
  }

  var keys = split(prop, {sep: '.', brackets: true});
  var len = keys.length;
  var idx = -1;
  var current = obj;

  while (++idx < len) {
    var key = keys[idx];
    if (idx !== len - 1) {
      if (!isObject(current[key])) {
        current[key] = {};
      }
      current = current[key];
      continue;
    }

    if (isPlainObject(current[key]) && isPlainObject(val)) {
      current[key] = extend({}, current[key], val);
    } else {
      current[key] = val;
    }
  }

  return obj;
};

},{"extend-shallow":186,"is-extendable":144,"is-plain-object":147,"split-string":217}],186:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"dup":96,"is-extendable":144}],187:[function(require,module,exports){
'use strict';

var isObject = require('isobject');
var define = require('define-property');
var utils = require('snapdragon-util');
var ownNames;

/**
 * Create a new AST `Node` with the given `val` and `type`.
 *
 * ```js
 * var node = new Node('*', 'Star');
 * var node = new Node({type: 'star', val: '*'});
 * ```
 * @name Node
 * @param {String|Object} `val` Pass a matched substring, or an object to merge onto the node.
 * @param {String} `type` The node type to use when `val` is a string.
 * @return {Object} node instance
 * @api public
 */

function Node(val, type, parent) {
  if (typeof type !== 'string') {
    parent = type;
    type = null;
  }

  define(this, 'parent', parent);
  define(this, 'isNode', true);
  define(this, 'expect', null);

  if (typeof type !== 'string' && isObject(val)) {
    lazyKeys();
    var keys = Object.keys(val);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (ownNames.indexOf(key) === -1) {
        this[key] = val[key];
      }
    }
  } else {
    this.type = type;
    this.val = val;
  }
}

/**
 * Returns true if the given value is a node.
 *
 * ```js
 * var Node = require('snapdragon-node');
 * var node = new Node({type: 'foo'});
 * console.log(Node.isNode(node)); //=> true
 * console.log(Node.isNode({})); //=> false
 * ```
 * @param {Object} `node`
 * @returns {Boolean}
 * @api public
 */

Node.isNode = function(node) {
  return utils.isNode(node);
};

/**
 * Define a non-enumberable property on the node instance.
 * Useful for adding properties that shouldn't be extended
 * or visible during debugging.
 *
 * ```js
 * var node = new Node();
 * node.define('foo', 'something non-enumerable');
 * ```
 * @param {String} `name`
 * @param {any} `val`
 * @return {Object} returns the node instance
 * @api public
 */

Node.prototype.define = function(name, val) {
  define(this, name, val);
  return this;
};

/**
 * Returns true if `node.val` is an empty string, or `node.nodes` does
 * not contain any non-empty text nodes.
 *
 * ```js
 * var node = new Node({type: 'text'});
 * node.isEmpty(); //=> true
 * node.val = 'foo';
 * node.isEmpty(); //=> false
 * ```
 * @param {Function} `fn` (optional) Filter function that is called on `node` and/or child nodes. `isEmpty` will return false immediately when the filter function returns false on any nodes.
 * @return {Boolean}
 * @api public
 */

Node.prototype.isEmpty = function(fn) {
  return utils.isEmpty(this, fn);
};

/**
 * Given node `foo` and node `bar`, push node `bar` onto `foo.nodes`, and
 * set `foo` as `bar.parent`.
 *
 * ```js
 * var foo = new Node({type: 'foo'});
 * var bar = new Node({type: 'bar'});
 * foo.push(bar);
 * ```
 * @param {Object} `node`
 * @return {Number} Returns the length of `node.nodes`
 * @api public
 */

Node.prototype.push = function(node) {
  assert(Node.isNode(node), 'expected node to be an instance of Node');
  define(node, 'parent', this);

  this.nodes = this.nodes || [];
  return this.nodes.push(node);
};

/**
 * Given node `foo` and node `bar`, unshift node `bar` onto `foo.nodes`, and
 * set `foo` as `bar.parent`.
 *
 * ```js
 * var foo = new Node({type: 'foo'});
 * var bar = new Node({type: 'bar'});
 * foo.unshift(bar);
 * ```
 * @param {Object} `node`
 * @return {Number} Returns the length of `node.nodes`
 * @api public
 */

Node.prototype.unshift = function(node) {
  assert(Node.isNode(node), 'expected node to be an instance of Node');
  define(node, 'parent', this);

  this.nodes = this.nodes || [];
  return this.nodes.unshift(node);
};

/**
 * Pop a node from `node.nodes`.
 *
 * ```js
 * var node = new Node({type: 'foo'});
 * node.push(new Node({type: 'a'}));
 * node.push(new Node({type: 'b'}));
 * node.push(new Node({type: 'c'}));
 * node.push(new Node({type: 'd'}));
 * console.log(node.nodes.length);
 * //=> 4
 * node.pop();
 * console.log(node.nodes.length);
 * //=> 3
 * ```
 * @return {Number} Returns the popped `node`
 * @api public
 */

Node.prototype.pop = function() {
  return this.nodes && this.nodes.pop();
};

/**
 * Shift a node from `node.nodes`.
 *
 * ```js
 * var node = new Node({type: 'foo'});
 * node.push(new Node({type: 'a'}));
 * node.push(new Node({type: 'b'}));
 * node.push(new Node({type: 'c'}));
 * node.push(new Node({type: 'd'}));
 * console.log(node.nodes.length);
 * //=> 4
 * node.shift();
 * console.log(node.nodes.length);
 * //=> 3
 * ```
 * @return {Object} Returns the shifted `node`
 * @api public
 */

Node.prototype.shift = function() {
  return this.nodes && this.nodes.shift();
};

/**
 * Remove `node` from `node.nodes`.
 *
 * ```js
 * node.remove(childNode);
 * ```
 * @param {Object} `node`
 * @return {Object} Returns the removed node.
 * @api public
 */

Node.prototype.remove = function(node) {
  assert(Node.isNode(node), 'expected node to be an instance of Node');
  this.nodes = this.nodes || [];
  var idx = node.index;
  if (idx !== -1) {
    node.index = -1;
    return this.nodes.splice(idx, 1);
  }
  return null;
};

/**
 * Get the first child node from `node.nodes` that matches the given `type`.
 * If `type` is a number, the child node at that index is returned.
 *
 * ```js
 * var child = node.find(1); //<= index of the node to get
 * var child = node.find('foo'); //<= node.type of a child node
 * var child = node.find(/^(foo|bar)$/); //<= regex to match node.type
 * var child = node.find(['foo', 'bar']); //<= array of node.type(s)
 * ```
 * @param {String} `type`
 * @return {Object} Returns a child node or undefined.
 * @api public
 */

Node.prototype.find = function(type) {
  return utils.findNode(this.nodes, type);
};

/**
 * Return true if the node is the given `type`.
 *
 * ```js
 * var node = new Node({type: 'bar'});
 * cosole.log(node.isType('foo'));          // false
 * cosole.log(node.isType(/^(foo|bar)$/));  // true
 * cosole.log(node.isType(['foo', 'bar'])); // true
 * ```
 * @param {String} `type`
 * @return {Boolean}
 * @api public
 */

Node.prototype.isType = function(type) {
  return utils.isType(this, type);
};

/**
 * Return true if the `node.nodes` has the given `type`.
 *
 * ```js
 * var foo = new Node({type: 'foo'});
 * var bar = new Node({type: 'bar'});
 * foo.push(bar);
 *
 * cosole.log(foo.hasType('qux'));          // false
 * cosole.log(foo.hasType(/^(qux|bar)$/));  // true
 * cosole.log(foo.hasType(['qux', 'bar'])); // true
 * ```
 * @param {String} `type`
 * @return {Boolean}
 * @api public
 */

Node.prototype.hasType = function(type) {
  return utils.hasType(this, type);
};

/**
 * Get the siblings array, or `null` if it doesn't exist.
 *
 * ```js
 * var foo = new Node({type: 'foo'});
 * var bar = new Node({type: 'bar'});
 * var baz = new Node({type: 'baz'});
 * foo.push(bar);
 * foo.push(baz);
 *
 * console.log(bar.siblings.length) // 2
 * console.log(baz.siblings.length) // 2
 * ```
 * @return {Array}
 * @api public
 */

Object.defineProperty(Node.prototype, 'siblings', {
  set: function() {
    throw new Error('node.siblings is a getter and cannot be defined');
  },
  get: function() {
    return this.parent ? this.parent.nodes : null;
  }
});

/**
 * Get the node's current index from `node.parent.nodes`.
 * This should always be correct, even when the parent adds nodes.
 *
 * ```js
 * var foo = new Node({type: 'foo'});
 * var bar = new Node({type: 'bar'});
 * var baz = new Node({type: 'baz'});
 * var qux = new Node({type: 'qux'});
 * foo.push(bar);
 * foo.push(baz);
 * foo.unshift(qux);
 *
 * console.log(bar.index) // 1
 * console.log(baz.index) // 2
 * console.log(qux.index) // 0
 * ```
 * @return {Number}
 * @api public
 */

Object.defineProperty(Node.prototype, 'index', {
  set: function(index) {
    define(this, 'idx', index);
  },
  get: function() {
    if (!Array.isArray(this.siblings)) {
      return -1;
    }
    var tok = this.idx !== -1 ? this.siblings[this.idx] : null;
    if (tok !== this) {
      this.idx = this.siblings.indexOf(this);
    }
    return this.idx;
  }
});

/**
 * Get the previous node from the siblings array or `null`.
 *
 * ```js
 * var foo = new Node({type: 'foo'});
 * var bar = new Node({type: 'bar'});
 * var baz = new Node({type: 'baz'});
 * foo.push(bar);
 * foo.push(baz);
 *
 * console.log(baz.prev.type) // 'bar'
 * ```
 * @return {Object}
 * @api public
 */

Object.defineProperty(Node.prototype, 'prev', {
  set: function() {
    throw new Error('node.prev is a getter and cannot be defined');
  },
  get: function() {
    if (Array.isArray(this.siblings)) {
      return this.siblings[this.index - 1] || this.parent.prev;
    }
    return null;
  }
});

/**
 * Get the siblings array, or `null` if it doesn't exist.
 *
 * ```js
 * var foo = new Node({type: 'foo'});
 * var bar = new Node({type: 'bar'});
 * var baz = new Node({type: 'baz'});
 * foo.push(bar);
 * foo.push(baz);
 *
 * console.log(bar.siblings.length) // 2
 * console.log(baz.siblings.length) // 2
 * ```
 * @return {Object}
 * @api public
 */

Object.defineProperty(Node.prototype, 'next', {
  set: function() {
    throw new Error('node.next is a getter and cannot be defined');
  },
  get: function() {
    if (Array.isArray(this.siblings)) {
      return this.siblings[this.index + 1] || this.parent.next;
    }
    return null;
  }
});

/**
 * Get the first node from `node.nodes`.
 *
 * ```js
 * var foo = new Node({type: 'foo'});
 * var bar = new Node({type: 'bar'});
 * var baz = new Node({type: 'baz'});
 * var qux = new Node({type: 'qux'});
 * foo.push(bar);
 * foo.push(baz);
 * foo.push(qux);
 *
 * console.log(foo.first.type) // 'bar'
 * ```
 * @return {Object} The first node, or undefiend
 * @api public
 */

Object.defineProperty(Node.prototype, 'first', {
  get: function() {
    return this.nodes ? this.nodes[0] : null;
  }
});

/**
 * Get the last node from `node.nodes`.
 *
 * ```js
 * var foo = new Node({type: 'foo'});
 * var bar = new Node({type: 'bar'});
 * var baz = new Node({type: 'baz'});
 * var qux = new Node({type: 'qux'});
 * foo.push(bar);
 * foo.push(baz);
 * foo.push(qux);
 *
 * console.log(foo.last.type) // 'qux'
 * ```
 * @return {Object} The last node, or undefiend
 * @api public
 */

Object.defineProperty(Node.prototype, 'last', {
  get: function() {
    return this.nodes ? utils.last(this.nodes) : null;
  }
});

/**
 * Get the last node from `node.nodes`.
 *
 * ```js
 * var foo = new Node({type: 'foo'});
 * var bar = new Node({type: 'bar'});
 * var baz = new Node({type: 'baz'});
 * var qux = new Node({type: 'qux'});
 * foo.push(bar);
 * foo.push(baz);
 * foo.push(qux);
 *
 * console.log(foo.last.type) // 'qux'
 * ```
 * @return {Object} The last node, or undefiend
 * @api public
 */

Object.defineProperty(Node.prototype, 'scope', {
  get: function() {
    if (this.isScope !== true) {
      return this.parent ? this.parent.scope : this;
    }
    return this;
  }
});

/**
 * Get own property names from Node prototype, but only the
 * first time `Node` is instantiated
 */

function lazyKeys() {
  if (!ownNames) {
    ownNames = Object.getOwnPropertyNames(Node.prototype);
  }
}

/**
 * Simplified assertion. Throws an error is `val` is falsey.
 */

function assert(val, message) {
  if (!val) throw new Error(message);
}

/**
 * Expose `Node`
 */

exports = module.exports = Node;

},{"define-property":188,"isobject":150,"snapdragon-util":192}],188:[function(require,module,exports){
arguments[4][87][0].apply(exports,arguments)
},{"dup":87,"is-descriptor":191}],189:[function(require,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"dup":88,"kind-of":152}],190:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"dup":89,"kind-of":152}],191:[function(require,module,exports){
arguments[4][90][0].apply(exports,arguments)
},{"dup":90,"is-accessor-descriptor":189,"is-data-descriptor":190,"kind-of":152}],192:[function(require,module,exports){
'use strict';

var typeOf = require('kind-of');
var utils = module.exports;

/**
 * Returns true if the given value is a node.
 *
 * ```js
 * var Node = require('snapdragon-node');
 * var node = new Node({type: 'foo'});
 * console.log(utils.isNode(node)); //=> true
 * console.log(utils.isNode({})); //=> false
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @returns {Boolean}
 * @api public
 */

utils.isNode = function(node) {
  return typeOf(node) === 'object' && node.isNode === true;
};

/**
 * Emit an empty string for the given `node`.
 *
 * ```js
 * // do nothing for beginning-of-string
 * snapdragon.compiler.set('bos', utils.noop);
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @returns {undefined}
 * @api public
 */

utils.noop = function(node) {
  append(this, '', node);
};

/**
 * Appdend `node.val` to `compiler.output`, exactly as it was created
 * by the parser.
 *
 * ```js
 * snapdragon.compiler.set('text', utils.identity);
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @returns {undefined}
 * @api public
 */

utils.identity = function(node) {
  append(this, node.val, node);
};

/**
 * Previously named `.emit`, this method appends the given `val`
 * to `compiler.output` for the given node. Useful when you know
 * what value should be appended advance, regardless of the actual
 * value of `node.val`.
 *
 * ```js
 * snapdragon.compiler
 *   .set('i', function(node) {
 *     this.mapVisit(node);
 *   })
 *   .set('i.open', utils.append('<i>'))
 *   .set('i.close', utils.append('</i>'))
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @returns {Function} Returns a compiler middleware function.
 * @api public
 */

utils.append = function(val) {
  return function(node) {
    append(this, val, node);
  };
};

/**
 * Used in compiler middleware, this onverts an AST node into
 * an empty `text` node and deletes `node.nodes` if it exists.
 * The advantage of this method is that, as opposed to completely
 * removing the node, indices will not need to be re-calculated
 * in sibling nodes, and nothing is appended to the output.
 *
 * ```js
 * utils.toNoop(node);
 * // convert `node.nodes` to the given value instead of deleting it
 * utils.toNoop(node, []);
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @param {Array} `nodes` Optionally pass a new `nodes` value, to replace the existing `node.nodes` array.
 * @api public
 */

utils.toNoop = function(node, nodes) {
  if (nodes) {
    node.nodes = nodes;
  } else {
    delete node.nodes;
    node.type = 'text';
    node.val = '';
  }
};

/**
 * Visit `node` with the given `fn`. The built-in `.visit` method in snapdragon
 * automatically calls registered compilers, this allows you to pass a visitor
 * function.
 *
 * ```js
 * snapdragon.compiler.set('i', function(node) {
 *   utils.visit(node, function(childNode) {
 *     // do stuff with "childNode"
 *     return childNode;
 *   });
 * });
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @param {Function} `fn`
 * @return {Object} returns the node after recursively visiting all child nodes.
 * @api public
 */

utils.visit = function(node, fn) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  assert(isFunction(fn), 'expected a visitor function');
  fn(node);
  return node.nodes ? utils.mapVisit(node, fn) : node;
};

/**
 * Map [visit](#visit) the given `fn` over `node.nodes`. This is called by
 * [visit](#visit), use this method if you do not want `fn` to be called on
 * the first node.
 *
 * ```js
 * snapdragon.compiler.set('i', function(node) {
 *   utils.mapVisit(node, function(childNode) {
 *     // do stuff with "childNode"
 *     return childNode;
 *   });
 * });
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @param {Object} `options`
 * @param {Function} `fn`
 * @return {Object} returns the node
 * @api public
 */

utils.mapVisit = function(node, fn) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  assert(isArray(node.nodes), 'expected node.nodes to be an array');
  assert(isFunction(fn), 'expected a visitor function');

  for (var i = 0; i < node.nodes.length; i++) {
    utils.visit(node.nodes[i], fn);
  }
  return node;
};

/**
 * Unshift an `*.open` node onto `node.nodes`.
 *
 * ```js
 * var Node = require('snapdragon-node');
 * snapdragon.parser.set('brace', function(node) {
 *   var match = this.match(/^{/);
 *   if (match) {
 *     var parent = new Node({type: 'brace'});
 *     utils.addOpen(parent, Node);
 *     console.log(parent.nodes[0]):
 *     // { type: 'brace.open', val: '' };
 *
 *     // push the parent "brace" node onto the stack
 *     this.push(parent);
 *
 *     // return the parent node, so it's also added to the AST
 *     return brace;
 *   }
 * });
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @param {Function} `Node` (required) Node constructor function from [snapdragon-node][].
 * @param {Function} `filter` Optionaly specify a filter function to exclude the node.
 * @return {Object} Returns the created opening node.
 * @api public
 */

utils.addOpen = function(node, Node, val, filter) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  assert(isFunction(Node), 'expected Node to be a constructor function');

  if (typeof val === 'function') {
    filter = val;
    val = '';
  }

  if (typeof filter === 'function' && !filter(node)) return;
  var open = new Node({ type: node.type + '.open', val: val});
  var unshift = node.unshift || node.unshiftNode;
  if (typeof unshift === 'function') {
    unshift.call(node, open);
  } else {
    utils.unshiftNode(node, open);
  }
  return open;
};

/**
 * Push a `*.close` node onto `node.nodes`.
 *
 * ```js
 * var Node = require('snapdragon-node');
 * snapdragon.parser.set('brace', function(node) {
 *   var match = this.match(/^}/);
 *   if (match) {
 *     var parent = this.parent();
 *     if (parent.type !== 'brace') {
 *       throw new Error('missing opening: ' + '}');
 *     }
 *
 *     utils.addClose(parent, Node);
 *     console.log(parent.nodes[parent.nodes.length - 1]):
 *     // { type: 'brace.close', val: '' };
 *
 *     // no need to return a node, since the parent
 *     // was already added to the AST
 *     return;
 *   }
 * });
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @param {Function} `Node` (required) Node constructor function from [snapdragon-node][].
 * @param {Function} `filter` Optionaly specify a filter function to exclude the node.
 * @return {Object} Returns the created closing node.
 * @api public
 */

utils.addClose = function(node, Node, val, filter) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  assert(isFunction(Node), 'expected Node to be a constructor function');

  if (typeof val === 'function') {
    filter = val;
    val = '';
  }

  if (typeof filter === 'function' && !filter(node)) return;
  var close = new Node({ type: node.type + '.close', val: val});
  var push = node.push || node.pushNode;
  if (typeof push === 'function') {
    push.call(node, close);
  } else {
    utils.pushNode(node, close);
  }
  return close;
};

/**
 * Wraps the given `node` with `*.open` and `*.close` nodes.
 *
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @param {Function} `Node` (required) Node constructor function from [snapdragon-node][].
 * @param {Function} `filter` Optionaly specify a filter function to exclude the node.
 * @return {Object} Returns the node
 * @api public
 */

utils.wrapNodes = function(node, Node, filter) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  assert(isFunction(Node), 'expected Node to be a constructor function');

  utils.addOpen(node, Node, filter);
  utils.addClose(node, Node, filter);
  return node;
};

/**
 * Push the given `node` onto `parent.nodes`, and set `parent` as `node.parent.
 *
 * ```js
 * var parent = new Node({type: 'foo'});
 * var node = new Node({type: 'bar'});
 * utils.pushNode(parent, node);
 * console.log(parent.nodes[0].type) // 'bar'
 * console.log(node.parent.type) // 'foo'
 * ```
 * @param {Object} `parent`
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Object} Returns the child node
 * @api public
 */

utils.pushNode = function(parent, node) {
  assert(utils.isNode(parent), 'expected parent node to be an instance of Node');
  assert(utils.isNode(node), 'expected node to be an instance of Node');

  node.define('parent', parent);
  parent.nodes = parent.nodes || [];
  parent.nodes.push(node);
  return node;
};

/**
 * Unshift `node` onto `parent.nodes`, and set `parent` as `node.parent.
 *
 * ```js
 * var parent = new Node({type: 'foo'});
 * var node = new Node({type: 'bar'});
 * utils.unshiftNode(parent, node);
 * console.log(parent.nodes[0].type) // 'bar'
 * console.log(node.parent.type) // 'foo'
 * ```
 * @param {Object} `parent`
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {undefined}
 * @api public
 */

utils.unshiftNode = function(parent, node) {
  assert(utils.isNode(parent), 'expected parent node to be an instance of Node');
  assert(utils.isNode(node), 'expected node to be an instance of Node');

  node.define('parent', parent);
  parent.nodes = parent.nodes || [];
  parent.nodes.unshift(node);
};

/**
 * Pop the last `node` off of `parent.nodes`. The advantage of
 * using this method is that it checks for `node.nodes` and works
 * with any version of `snapdragon-node`.
 *
 * ```js
 * var parent = new Node({type: 'foo'});
 * utils.pushNode(parent, new Node({type: 'foo'}));
 * utils.pushNode(parent, new Node({type: 'bar'}));
 * utils.pushNode(parent, new Node({type: 'baz'}));
 * console.log(parent.nodes.length); //=> 3
 * utils.popNode(parent);
 * console.log(parent.nodes.length); //=> 2
 * ```
 * @param {Object} `parent`
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Number|Undefined} Returns the length of `node.nodes` or undefined.
 * @api public
 */

utils.popNode = function(node) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  if (typeof node.pop === 'function') {
    return node.pop();
  }
  return node.nodes && node.nodes.pop();
};

/**
 * Shift the first `node` off of `parent.nodes`. The advantage of
 * using this method is that it checks for `node.nodes` and works
 * with any version of `snapdragon-node`.
 *
 * ```js
 * var parent = new Node({type: 'foo'});
 * utils.pushNode(parent, new Node({type: 'foo'}));
 * utils.pushNode(parent, new Node({type: 'bar'}));
 * utils.pushNode(parent, new Node({type: 'baz'}));
 * console.log(parent.nodes.length); //=> 3
 * utils.shiftNode(parent);
 * console.log(parent.nodes.length); //=> 2
 * ```
 * @param {Object} `parent`
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Number|Undefined} Returns the length of `node.nodes` or undefined.
 * @api public
 */

utils.shiftNode = function(node) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  if (typeof node.shift === 'function') {
    return node.shift();
  }
  return node.nodes && node.nodes.shift();
};

/**
 * Remove the specified `node` from `parent.nodes`.
 *
 * ```js
 * var parent = new Node({type: 'abc'});
 * var foo = new Node({type: 'foo'});
 * utils.pushNode(parent, foo);
 * utils.pushNode(parent, new Node({type: 'bar'}));
 * utils.pushNode(parent, new Node({type: 'baz'}));
 * console.log(parent.nodes.length); //=> 3
 * utils.removeNode(parent, foo);
 * console.log(parent.nodes.length); //=> 2
 * ```
 * @param {Object} `parent`
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Object|undefined} Returns the removed node, if successful, or undefined if it does not exist on `parent.nodes`.
 * @api public
 */

utils.removeNode = function(parent, node) {
  assert(utils.isNode(parent), 'expected parent.node to be an instance of Node');
  assert(utils.isNode(node), 'expected node to be an instance of Node');

  if (!parent.nodes) {
    return null;
  }

  if (typeof parent.remove === 'function') {
    return parent.remove(node);
  }

  var idx = parent.nodes.indexOf(node);
  if (idx !== -1) {
    return parent.nodes.splice(idx, 1);
  }
};

/**
 * Returns true if `node.type` matches the given `type`. Throws a
 * `TypeError` if `node` is not an instance of `Node`.
 *
 * ```js
 * var Node = require('snapdragon-node');
 * var node = new Node({type: 'foo'});
 * console.log(utils.isType(node, 'foo')); // false
 * console.log(utils.isType(node, 'bar')); // true
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @param {String} `type`
 * @return {Boolean}
 * @api public
 */

utils.isType = function(node, type) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  switch (typeOf(type)) {
    case 'array':
      var types = type.slice();
      for (var i = 0; i < types.length; i++) {
        if (utils.isType(node, types[i])) {
          return true;
        }
      }
      return false;
    case 'string':
      return node.type === type;
    case 'regexp':
      return type.test(node.type);
    default: {
      throw new TypeError('expected "type" to be an array, string or regexp');
    }
  }
};

/**
 * Returns true if the given `node` has the given `type` in `node.nodes`.
 * Throws a `TypeError` if `node` is not an instance of `Node`.
 *
 * ```js
 * var Node = require('snapdragon-node');
 * var node = new Node({
 *   type: 'foo',
 *   nodes: [
 *     new Node({type: 'bar'}),
 *     new Node({type: 'baz'})
 *   ]
 * });
 * console.log(utils.hasType(node, 'xyz')); // false
 * console.log(utils.hasType(node, 'baz')); // true
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @param {String} `type`
 * @return {Boolean}
 * @api public
 */

utils.hasType = function(node, type) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  if (!Array.isArray(node.nodes)) return false;
  for (var i = 0; i < node.nodes.length; i++) {
    if (utils.isType(node.nodes[i], type)) {
      return true;
    }
  }
  return false;
};

/**
 * Returns the first node from `node.nodes` of the given `type`
 *
 * ```js
 * var node = new Node({
 *   type: 'foo',
 *   nodes: [
 *     new Node({type: 'text', val: 'abc'}),
 *     new Node({type: 'text', val: 'xyz'})
 *   ]
 * });
 *
 * var textNode = utils.firstOfType(node.nodes, 'text');
 * console.log(textNode.val);
 * //=> 'abc'
 * ```
 * @param {Array} `nodes`
 * @param {String} `type`
 * @return {Object|undefined} Returns the first matching node or undefined.
 * @api public
 */

utils.firstOfType = function(nodes, type) {
  for (var i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (utils.isType(node, type)) {
      return node;
    }
  }
};

/**
 * Returns the node at the specified index, or the first node of the
 * given `type` from `node.nodes`.
 *
 * ```js
 * var node = new Node({
 *   type: 'foo',
 *   nodes: [
 *     new Node({type: 'text', val: 'abc'}),
 *     new Node({type: 'text', val: 'xyz'})
 *   ]
 * });
 *
 * var nodeOne = utils.findNode(node.nodes, 'text');
 * console.log(nodeOne.val);
 * //=> 'abc'
 *
 * var nodeTwo = utils.findNode(node.nodes, 1);
 * console.log(nodeTwo.val);
 * //=> 'xyz'
 * ```
 *
 * @param {Array} `nodes`
 * @param {String|Number} `type` Node type or index.
 * @return {Object} Returns a node or undefined.
 * @api public
 */

utils.findNode = function(nodes, type) {
  if (!Array.isArray(nodes)) {
    return null;
  }
  if (typeof type === 'number') {
    return nodes[type];
  }
  return utils.firstOfType(nodes, type);
};

/**
 * Returns true if the given node is an "*.open" node.
 *
 * ```js
 * var Node = require('snapdragon-node');
 * var brace = new Node({type: 'brace'});
 * var open = new Node({type: 'brace.open'});
 * var close = new Node({type: 'brace.close'});
 *
 * console.log(utils.isOpen(brace)); // false
 * console.log(utils.isOpen(open)); // true
 * console.log(utils.isOpen(close)); // false
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Boolean}
 * @api public
 */

utils.isOpen = function(node) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  return node.type.slice(-5) === '.open';
};

/**
 * Returns true if the given node is a "*.close" node.
 *
 * ```js
 * var Node = require('snapdragon-node');
 * var brace = new Node({type: 'brace'});
 * var open = new Node({type: 'brace.open'});
 * var close = new Node({type: 'brace.close'});
 *
 * console.log(utils.isClose(brace)); // false
 * console.log(utils.isClose(open)); // false
 * console.log(utils.isClose(close)); // true
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Boolean}
 * @api public
 */

utils.isClose = function(node) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  return node.type.slice(-6) === '.close';
};

/**
 * Returns true if `node.nodes` **has** an `.open` node
 *
 * ```js
 * var Node = require('snapdragon-node');
 * var brace = new Node({
 *   type: 'brace',
 *   nodes: []
 * });
 *
 * var open = new Node({type: 'brace.open'});
 * console.log(utils.hasOpen(brace)); // false
 *
 * brace.pushNode(open);
 * console.log(utils.hasOpen(brace)); // true
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Boolean}
 * @api public
 */

utils.hasOpen = function(node) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  var first = node.first || node.nodes ? node.nodes[0] : null;
  if (utils.isNode(first)) {
    return first.type === node.type + '.open';
  }
  return false;
};

/**
 * Returns true if `node.nodes` **has** a `.close` node
 *
 * ```js
 * var Node = require('snapdragon-node');
 * var brace = new Node({
 *   type: 'brace',
 *   nodes: []
 * });
 *
 * var close = new Node({type: 'brace.close'});
 * console.log(utils.hasClose(brace)); // false
 *
 * brace.pushNode(close);
 * console.log(utils.hasClose(brace)); // true
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Boolean}
 * @api public
 */

utils.hasClose = function(node) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  var last = node.last || node.nodes ? node.nodes[node.nodes.length - 1] : null;
  if (utils.isNode(last)) {
    return last.type === node.type + '.close';
  }
  return false;
};

/**
 * Returns true if `node.nodes` has both `.open` and `.close` nodes
 *
 * ```js
 * var Node = require('snapdragon-node');
 * var brace = new Node({
 *   type: 'brace',
 *   nodes: []
 * });
 *
 * var open = new Node({type: 'brace.open'});
 * var close = new Node({type: 'brace.close'});
 * console.log(utils.hasOpen(brace)); // false
 * console.log(utils.hasClose(brace)); // false
 *
 * brace.pushNode(open);
 * brace.pushNode(close);
 * console.log(utils.hasOpen(brace)); // true
 * console.log(utils.hasClose(brace)); // true
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Boolean}
 * @api public
 */

utils.hasOpenAndClose = function(node) {
  return utils.hasOpen(node) && utils.hasClose(node);
};

/**
 * Push the given `node` onto the `state.inside` array for the
 * given type. This array is used as a specialized "stack" for
 * only the given `node.type`.
 *
 * ```js
 * var state = { inside: {}};
 * var node = new Node({type: 'brace'});
 * utils.addType(state, node);
 * console.log(state.inside);
 * //=> { brace: [{type: 'brace'}] }
 * ```
 * @param {Object} `state` The `compiler.state` object or custom state object.
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Array} Returns the `state.inside` stack for the given type.
 * @api public
 */

utils.addType = function(state, node) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  assert(isObject(state), 'expected state to be an object');

  var type = node.parent
    ? node.parent.type
    : node.type.replace(/\.open$/, '');

  if (!state.hasOwnProperty('inside')) {
    state.inside = {};
  }
  if (!state.inside.hasOwnProperty(type)) {
    state.inside[type] = [];
  }

  var arr = state.inside[type];
  arr.push(node);
  return arr;
};

/**
 * Remove the given `node` from the `state.inside` array for the
 * given type. This array is used as a specialized "stack" for
 * only the given `node.type`.
 *
 * ```js
 * var state = { inside: {}};
 * var node = new Node({type: 'brace'});
 * utils.addType(state, node);
 * console.log(state.inside);
 * //=> { brace: [{type: 'brace'}] }
 * utils.removeType(state, node);
 * //=> { brace: [] }
 * ```
 * @param {Object} `state` The `compiler.state` object or custom state object.
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @return {Array} Returns the `state.inside` stack for the given type.
 * @api public
 */

utils.removeType = function(state, node) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  assert(isObject(state), 'expected state to be an object');

  var type = node.parent
    ? node.parent.type
    : node.type.replace(/\.close$/, '');

  if (state.inside.hasOwnProperty(type)) {
    return state.inside[type].pop();
  }
};

/**
 * Returns true if `node.val` is an empty string, or `node.nodes` does
 * not contain any non-empty text nodes.
 *
 * ```js
 * var node = new Node({type: 'text'});
 * utils.isEmpty(node); //=> true
 * node.val = 'foo';
 * utils.isEmpty(node); //=> false
 * ```
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @param {Function} `fn`
 * @return {Boolean}
 * @api public
 */

utils.isEmpty = function(node, fn) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');

  if (!Array.isArray(node.nodes)) {
    if (node.type !== 'text') {
      return true;
    }
    if (typeof fn === 'function') {
      return fn(node, node.parent);
    }
    return !utils.trim(node.val);
  }

  for (var i = 0; i < node.nodes.length; i++) {
    var child = node.nodes[i];
    if (utils.isOpen(child) || utils.isClose(child)) {
      continue;
    }
    if (!utils.isEmpty(child, fn)) {
      return false;
    }
  }

  return true;
};

/**
 * Returns true if the `state.inside` stack for the given type exists
 * and has one or more nodes on it.
 *
 * ```js
 * var state = { inside: {}};
 * var node = new Node({type: 'brace'});
 * console.log(utils.isInsideType(state, 'brace')); //=> false
 * utils.addType(state, node);
 * console.log(utils.isInsideType(state, 'brace')); //=> true
 * utils.removeType(state, node);
 * console.log(utils.isInsideType(state, 'brace')); //=> false
 * ```
 * @param {Object} `state`
 * @param {String} `type`
 * @return {Boolean}
 * @api public
 */

utils.isInsideType = function(state, type) {
  assert(isObject(state), 'expected state to be an object');
  assert(isString(type), 'expected type to be a string');

  if (!state.hasOwnProperty('inside')) {
    return false;
  }

  if (!state.inside.hasOwnProperty(type)) {
    return false;
  }

  return state.inside[type].length > 0;
};

/**
 * Returns true if `node` is either a child or grand-child of the given `type`,
 * or `state.inside[type]` is a non-empty array.
 *
 * ```js
 * var state = { inside: {}};
 * var node = new Node({type: 'brace'});
 * var open = new Node({type: 'brace.open'});
 * console.log(utils.isInside(state, open, 'brace')); //=> false
 * utils.pushNode(node, open);
 * console.log(utils.isInside(state, open, 'brace')); //=> true
 * ```
 * @param {Object} `state` Either the `compiler.state` object, if it exists, or a user-supplied state object.
 * @param {Object} `node` Instance of [snapdragon-node][]
 * @param {String} `type` The `node.type` to check for.
 * @return {Boolean}
 * @api public
 */

utils.isInside = function(state, node, type) {
  assert(utils.isNode(node), 'expected node to be an instance of Node');
  assert(isObject(state), 'expected state to be an object');

  if (Array.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      if (utils.isInside(state, node, type[i])) {
        return true;
      }
    }
    return false;
  }

  var parent = node.parent;
  if (typeof type === 'string') {
    return (parent && parent.type === type) || utils.isInsideType(state, type);
  }

  if (typeOf(type) === 'regexp') {
    if (parent && parent.type && type.test(parent.type)) {
      return true;
    }

    var keys = Object.keys(state.inside);
    var len = keys.length;
    var idx = -1;
    while (++idx < len) {
      var key = keys[idx];
      var val = state.inside[key];

      if (Array.isArray(val) && val.length !== 0 && type.test(key)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Get the last `n` element from the given `array`. Used for getting
 * a node from `node.nodes.`
 *
 * @param {Array} `array`
 * @param {Number} `n`
 * @return {undefined}
 * @api public
 */

utils.last = function(arr, n) {
  return arr[arr.length - (n || 1)];
};

/**
 * Cast the given `val` to an array.
 *
 * ```js
 * console.log(utils.arrayify(''));
 * //=> []
 * console.log(utils.arrayify('foo'));
 * //=> ['foo']
 * console.log(utils.arrayify(['foo']));
 * //=> ['foo']
 * ```
 * @param {any} `val`
 * @return {Array}
 * @api public
 */

utils.arrayify = function(val) {
  if (typeof val === 'string' && val !== '') {
    return [val];
  }
  if (!Array.isArray(val)) {
    return [];
  }
  return val;
};

/**
 * Convert the given `val` to a string by joining with `,`. Useful
 * for creating a cheerio/CSS/DOM-style selector from a list of strings.
 *
 * @param {any} `val`
 * @return {Array}
 * @api public
 */

utils.stringify = function(val) {
  return utils.arrayify(val).join(',');
};

/**
 * Ensure that the given value is a string and call `.trim()` on it,
 * or return an empty string.
 *
 * @param {String} `str`
 * @return {String}
 * @api public
 */

utils.trim = function(str) {
  return typeof str === 'string' ? str.trim() : '';
};

/**
 * Return true if val is an object
 */

function isObject(val) {
  return typeOf(val) === 'object';
}

/**
 * Return true if val is a string
 */

function isString(val) {
  return typeof val === 'string';
}

/**
 * Return true if val is a function
 */

function isFunction(val) {
  return typeof val === 'function';
}

/**
 * Return true if val is an array
 */

function isArray(val) {
  return Array.isArray(val);
}

/**
 * Shim to ensure the `.append` methods work with any version of snapdragon
 */

function append(compiler, val, node) {
  if (typeof compiler.append !== 'function') {
    return compiler.emit(val, node);
  }
  return compiler.append(val, node);
}

/**
 * Simplified assertion. Throws an error is `val` is falsey.
 */

function assert(val, message) {
  if (!val) throw new Error(message);
}

},{"kind-of":193}],193:[function(require,module,exports){
arguments[4][138][0].apply(exports,arguments)
},{"dup":138,"is-buffer":139}],194:[function(require,module,exports){
'use strict';

var Base = require('base');
var define = require('define-property');
var Compiler = require('./lib/compiler');
var Parser = require('./lib/parser');
var utils = require('./lib/utils');
var regexCache = {};
var cache = {};

/**
 * Create a new instance of `Snapdragon` with the given `options`.
 *
 * ```js
 * var snapdragon = new Snapdragon();
 * ```
 *
 * @param {Object} `options`
 * @api public
 */

function Snapdragon(options) {
  Base.call(this, null, options);
  this.options = utils.extend({source: 'string'}, this.options);
  this.compiler = new Compiler(this.options);
  this.parser = new Parser(this.options);

  Object.defineProperty(this, 'compilers', {
    get: function() {
      return this.compiler.compilers;
    }
  });

  Object.defineProperty(this, 'parsers', {
    get: function() {
      return this.parser.parsers;
    }
  });

  Object.defineProperty(this, 'regex', {
    get: function() {
      return this.parser.regex;
    }
  });
}

/**
 * Inherit Base
 */

Base.extend(Snapdragon);

/**
 * Add a parser to `snapdragon.parsers` for capturing the given `type` using
 * the specified regex or parser function. A function is useful if you need
 * to customize how the token is created and/or have access to the parser
 * instance to check options, etc.
 *
 * ```js
 * snapdragon
 *   .capture('slash', /^\//)
 *   .capture('dot', function() {
 *     var pos = this.position();
 *     var m = this.match(/^\./);
 *     if (!m) return;
 *     return pos({
 *       type: 'dot',
 *       val: m[0]
 *     });
 *   });
 * ```
 * @param {String} `type`
 * @param {RegExp|Function} `regex`
 * @return {Object} Returns the parser instance for chaining
 * @api public
 */

Snapdragon.prototype.capture = function() {
  return this.parser.capture.apply(this.parser, arguments);
};

/**
 * Register a plugin `fn`.
 *
 * ```js
 * var snapdragon = new Snapdgragon([options]);
 * snapdragon.use(function() {
 *   console.log(this);          //<= snapdragon instance
 *   console.log(this.parser);   //<= parser instance
 *   console.log(this.compiler); //<= compiler instance
 * });
 * ```
 * @param {Object} `fn`
 * @api public
 */

Snapdragon.prototype.use = function(fn) {
  fn.call(this, this);
  return this;
};

/**
 * Parse the given `str`.
 *
 * ```js
 * var snapdragon = new Snapdgragon([options]);
 * // register parsers
 * snapdragon.parser.use(function() {});
 *
 * // parse
 * var ast = snapdragon.parse('foo/bar');
 * console.log(ast);
 * ```
 * @param {String} `str`
 * @param {Object} `options` Set `options.sourcemap` to true to enable source maps.
 * @return {Object} Returns an AST.
 * @api public
 */

Snapdragon.prototype.parse = function(str, options) {
  this.options = utils.extend({}, this.options, options);
  var parsed = this.parser.parse(str, this.options);

  // add non-enumerable parser reference
  define(parsed, 'parser', this.parser);
  return parsed;
};

/**
 * Compile the given `AST`.
 *
 * ```js
 * var snapdragon = new Snapdgragon([options]);
 * // register plugins
 * snapdragon.use(function() {});
 * // register parser plugins
 * snapdragon.parser.use(function() {});
 * // register compiler plugins
 * snapdragon.compiler.use(function() {});
 *
 * // parse
 * var ast = snapdragon.parse('foo/bar');
 *
 * // compile
 * var res = snapdragon.compile(ast);
 * console.log(res.output);
 * ```
 * @param {Object} `ast`
 * @param {Object} `options`
 * @return {Object} Returns an object with an `output` property with the rendered string.
 * @api public
 */

Snapdragon.prototype.compile = function(ast, options) {
  this.options = utils.extend({}, this.options, options);
  var compiled = this.compiler.compile(ast, this.options);

  // add non-enumerable compiler reference
  define(compiled, 'compiler', this.compiler);
  return compiled;
};

/**
 * Expose `Snapdragon`
 */

module.exports = Snapdragon;

/**
 * Expose `Parser` and `Compiler`
 */

module.exports.Compiler = Compiler;
module.exports.Parser = Parser;

},{"./lib/compiler":195,"./lib/parser":196,"./lib/utils":199,"base":86,"define-property":202}],195:[function(require,module,exports){
(function (__filename){
'use strict';

var use = require('use');
var define = require('define-property');
var debug = require('debug')('snapdragon:compiler');
var utils = require('./utils');

/**
 * Create a new `Compiler` with the given `options`.
 * @param {Object} `options`
 */

function Compiler(options, state) {
  debug('initializing', __filename);
  this.options = utils.extend({source: 'string'}, options);
  this.state = state || {};
  this.compilers = {};
  this.output = '';
  this.set('eos', function(node) {
    return this.emit(node.val, node);
  });
  this.set('noop', function(node) {
    return this.emit(node.val, node);
  });
  this.set('bos', function(node) {
    return this.emit(node.val, node);
  });
  use(this);
}

/**
 * Prototype methods
 */

Compiler.prototype = {

  /**
   * Throw an error message with details including the cursor position.
   * @param {String} `msg` Message to use in the Error.
   */

  error: function(msg, node) {
    var pos = node.position || {start: {column: 0}};
    var message = this.options.source + ' column:' + pos.start.column + ': ' + msg;

    var err = new Error(message);
    err.reason = msg;
    err.column = pos.start.column;
    err.source = this.pattern;

    if (this.options.silent) {
      this.errors.push(err);
    } else {
      throw err;
    }
  },

  /**
   * Define a non-enumberable property on the `Compiler` instance.
   *
   * ```js
   * compiler.define('foo', 'bar');
   * ```
   * @name .define
   * @param {String} `key` propery name
   * @param {any} `val` property value
   * @return {Object} Returns the Compiler instance for chaining.
   * @api public
   */

  define: function(key, val) {
    define(this, key, val);
    return this;
  },

  /**
   * Emit `node.val`
   */

  emit: function(str, node) {
    this.output += str;
    return str;
  },

  /**
   * Add a compiler `fn` with the given `name`
   */

  set: function(name, fn) {
    this.compilers[name] = fn;
    return this;
  },

  /**
   * Get compiler `name`.
   */

  get: function(name) {
    return this.compilers[name];
  },

  /**
   * Get the previous AST node.
   */

  prev: function(n) {
    return this.ast.nodes[this.idx - (n || 1)] || { type: 'bos', val: '' };
  },

  /**
   * Get the next AST node.
   */

  next: function(n) {
    return this.ast.nodes[this.idx + (n || 1)] || { type: 'eos', val: '' };
  },

  /**
   * Visit `node`.
   */

  visit: function(node, nodes, i) {
    var fn = this.compilers[node.type];
    this.idx = i;

    if (typeof fn !== 'function') {
      throw this.error('compiler "' + node.type + '" is not registered', node);
    }
    return fn.call(this, node, nodes, i);
  },

  /**
   * Map visit over array of `nodes`.
   */

  mapVisit: function(nodes) {
    if (!Array.isArray(nodes)) {
      throw new TypeError('expected an array');
    }
    var len = nodes.length;
    var idx = -1;
    while (++idx < len) {
      this.visit(nodes[idx], nodes, idx);
    }
    return this;
  },

  /**
   * Compile `ast`.
   */

  compile: function(ast, options) {
    var opts = utils.extend({}, this.options, options);
    this.ast = ast;
    this.parsingErrors = this.ast.errors;
    this.output = '';

    // source map support
    if (opts.sourcemap) {
      var sourcemaps = require('./source-maps');
      sourcemaps(this);
      this.mapVisit(this.ast.nodes);
      this.applySourceMaps();
      this.map = opts.sourcemap === 'generator' ? this.map : this.map.toJSON();
      return this;
    }

    this.mapVisit(this.ast.nodes);
    return this;
  }
};

/**
 * Expose `Compiler`
 */

module.exports = Compiler;

}).call(this,"/node_modules\\snapdragon\\lib\\compiler.js")
},{"./source-maps":198,"./utils":199,"debug":200,"define-property":202,"use":232}],196:[function(require,module,exports){
(function (__filename){
'use strict';

var use = require('use');
var util = require('util');
var Cache = require('map-cache');
var define = require('define-property');
var debug = require('debug')('snapdragon:parser');
var Position = require('./position');
var utils = require('./utils');

/**
 * Create a new `Parser` with the given `input` and `options`.
 * @param {String} `input`
 * @param {Object} `options`
 * @api public
 */

function Parser(options) {
  debug('initializing', __filename);
  this.options = utils.extend({source: 'string'}, options);
  this.init(this.options);
  use(this);
}

/**
 * Prototype methods
 */

Parser.prototype = {
  constructor: Parser,

  init: function(options) {
    this.orig = '';
    this.input = '';
    this.parsed = '';

    this.column = 1;
    this.line = 1;

    this.regex = new Cache();
    this.errors = this.errors || [];
    this.parsers = this.parsers || {};
    this.types = this.types || [];
    this.sets = this.sets || {};
    this.fns = this.fns || [];
    this.currentType = 'root';

    var pos = this.position();
    this.bos = pos({type: 'bos', val: ''});

    this.ast = {
      type: 'root',
      errors: this.errors,
      nodes: [this.bos]
    };

    define(this.bos, 'parent', this.ast);
    this.nodes = [this.ast];

    this.count = 0;
    this.setCount = 0;
    this.stack = [];
  },

  /**
   * Throw a formatted error with the cursor column and `msg`.
   * @param {String} `msg` Message to use in the Error.
   */

  error: function(msg, node) {
    var pos = node.position || {start: {column: 0, line: 0}};
    var line = pos.start.line;
    var column = pos.start.column;
    var source = this.options.source;

    var message = source + ' <line:' + line + ' column:' + column + '>: ' + msg;
    var err = new Error(message);
    err.source = source;
    err.reason = msg;
    err.pos = pos;

    if (this.options.silent) {
      this.errors.push(err);
    } else {
      throw err;
    }
  },

  /**
   * Define a non-enumberable property on the `Parser` instance.
   *
   * ```js
   * parser.define('foo', 'bar');
   * ```
   * @name .define
   * @param {String} `key` propery name
   * @param {any} `val` property value
   * @return {Object} Returns the Parser instance for chaining.
   * @api public
   */

  define: function(key, val) {
    define(this, key, val);
    return this;
  },

  /**
   * Mark position and patch `node.position`.
   */

  position: function() {
    var start = { line: this.line, column: this.column };
    var self = this;

    return function(node) {
      define(node, 'position', new Position(start, self));
      return node;
    };
  },

  /**
   * Set parser `name` with the given `fn`
   * @param {String} `name`
   * @param {Function} `fn`
   * @api public
   */

  set: function(type, fn) {
    if (this.types.indexOf(type) === -1) {
      this.types.push(type);
    }
    this.parsers[type] = fn.bind(this);
    return this;
  },

  /**
   * Get parser `name`
   * @param {String} `name`
   * @api public
   */

  get: function(name) {
    return this.parsers[name];
  },

  /**
   * Push a `token` onto the `type` stack.
   *
   * @param {String} `type`
   * @return {Object} `token`
   * @api public
   */

  push: function(type, token) {
    this.sets[type] = this.sets[type] || [];
    this.count++;
    this.stack.push(token);
    return this.sets[type].push(token);
  },

  /**
   * Pop a token off of the `type` stack
   * @param {String} `type`
   * @returns {Object} Returns a token
   * @api public
   */

  pop: function(type) {
    this.sets[type] = this.sets[type] || [];
    this.count--;
    this.stack.pop();
    return this.sets[type].pop();
  },

  /**
   * Return true if inside a `stack` node. Types are `braces`, `parens` or `brackets`.
   *
   * @param {String} `type`
   * @return {Boolean}
   * @api public
   */

  isInside: function(type) {
    this.sets[type] = this.sets[type] || [];
    return this.sets[type].length > 0;
  },

  /**
   * Return true if `node` is the given `type`.
   *
   * ```js
   * parser.isType(node, 'brace');
   * ```
   * @param {Object} `node`
   * @param {String} `type`
   * @return {Boolean}
   * @api public
   */

  isType: function(node, type) {
    return node && node.type === type;
  },

  /**
   * Get the previous AST node
   * @return {Object}
   */

  prev: function(n) {
    return this.stack.length > 0
      ? utils.last(this.stack, n)
      : utils.last(this.nodes, n);
  },

  /**
   * Update line and column based on `str`.
   */

  consume: function(len) {
    this.input = this.input.substr(len);
  },

  /**
   * Update column based on `str`.
   */

  updatePosition: function(str, len) {
    var lines = str.match(/\n/g);
    if (lines) this.line += lines.length;
    var i = str.lastIndexOf('\n');
    this.column = ~i ? len - i : this.column + len;
    this.parsed += str;
    this.consume(len);
  },

  /**
   * Match `regex`, return captures, and update the cursor position by `match[0]` length.
   * @param {RegExp} `regex`
   * @return {Object}
   */

  match: function(regex) {
    var m = regex.exec(this.input);
    if (m) {
      this.updatePosition(m[0], m[0].length);
      return m;
    }
  },

  /**
   * Capture `type` with the given regex.
   * @param {String} `type`
   * @param {RegExp} `regex`
   * @return {Function}
   */

  capture: function(type, regex) {
    if (typeof regex === 'function') {
      return this.set.apply(this, arguments);
    }

    this.regex.set(type, regex);
    this.set(type, function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(regex);
      if (!m || !m[0]) return;

      var prev = this.prev();
      var node = pos({
        type: type,
        val: m[0],
        parsed: parsed,
        rest: this.input
      });

      if (m[1]) {
        node.inner = m[1];
      }

      define(node, 'inside', this.stack.length > 0);
      define(node, 'parent', prev);
      prev.nodes.push(node);
    }.bind(this));
    return this;
  },

  /**
   * Create a parser with open and close for parens,
   * brackets or braces
   */

  capturePair: function(type, openRegex, closeRegex, fn) {
    this.sets[type] = this.sets[type] || [];

    /**
     * Open
     */

    this.set(type + '.open', function() {
      var parsed = this.parsed;
      var pos = this.position();
      var m = this.match(openRegex);
      if (!m || !m[0]) return;

      var val = m[0];
      this.setCount++;
      this.specialChars = true;
      var open = pos({
        type: type + '.open',
        val: val,
        rest: this.input
      });

      if (typeof m[1] !== 'undefined') {
        open.inner = m[1];
      }

      var prev = this.prev();
      var node = pos({
        type: type,
        nodes: [open]
      });

      define(node, 'rest', this.input);
      define(node, 'parsed', parsed);
      define(node, 'prefix', m[1]);
      define(node, 'parent', prev);
      define(open, 'parent', node);

      if (typeof fn === 'function') {
        fn.call(this, open, node);
      }

      this.push(type, node);
      prev.nodes.push(node);
    });

    /**
     * Close
     */

    this.set(type + '.close', function() {
      var pos = this.position();
      var m = this.match(closeRegex);
      if (!m || !m[0]) return;

      var parent = this.pop(type);
      var node = pos({
        type: type + '.close',
        rest: this.input,
        suffix: m[1],
        val: m[0]
      });

      if (!this.isType(parent, type)) {
        if (this.options.strict) {
          throw new Error('missing opening "' + type + '"');
        }

        this.setCount--;
        node.escaped = true;
        return node;
      }

      if (node.suffix === '\\') {
        parent.escaped = true;
        node.escaped = true;
      }

      parent.nodes.push(node);
      define(node, 'parent', parent);
    });

    return this;
  },

  /**
   * Capture end-of-string
   */

  eos: function() {
    var pos = this.position();
    if (this.input) return;
    var prev = this.prev();

    while (prev.type !== 'root' && !prev.visited) {
      if (this.options.strict === true) {
        throw new SyntaxError('invalid syntax:' + util.inspect(prev, null, 2));
      }

      if (!hasDelims(prev)) {
        prev.parent.escaped = true;
        prev.escaped = true;
      }

      visit(prev, function(node) {
        if (!hasDelims(node.parent)) {
          node.parent.escaped = true;
          node.escaped = true;
        }
      });

      prev = prev.parent;
    }

    var tok = pos({
      type: 'eos',
      val: this.append || ''
    });

    define(tok, 'parent', this.ast);
    return tok;
  },

  /**
   * Run parsers to advance the cursor position
   */

  next: function() {
    var parsed = this.parsed;
    var len = this.types.length;
    var idx = -1;
    var tok;

    while (++idx < len) {
      if ((tok = this.parsers[this.types[idx]].call(this))) {
        define(tok, 'rest', this.input);
        define(tok, 'parsed', parsed);
        this.last = tok;
        return tok;
      }
    }
  },

  /**
   * Parse the given string.
   * @return {Array}
   */

  parse: function(input) {
    if (typeof input !== 'string') {
      throw new TypeError('expected a string');
    }

    this.init(this.options);
    this.orig = input;
    this.input = input;
    var self = this;

    function parse() {
      // check input before calling `.next()`
      input = self.input;

      // get the next AST ndoe
      var node = self.next();
      if (node) {
        var prev = self.prev();
        if (prev) {
          define(node, 'parent', prev);
          if (prev.nodes) {
            prev.nodes.push(node);
          }
        }

        if (self.sets.hasOwnProperty(prev.type)) {
          self.currentType = prev.type;
        }
      }

      // if we got here but input is not changed, throw an error
      if (self.input && input === self.input) {
        throw new Error('no parsers registered for: "' + self.input.slice(0, 5) + '"');
      }
    }

    while (this.input) parse();
    if (this.stack.length && this.options.strict) {
      var node = this.stack.pop();
      throw this.error('missing opening ' + node.type + ': "' + this.orig + '"');
    }

    var eos = this.eos();
    var tok = this.prev();
    if (tok.type !== 'eos') {
      this.ast.nodes.push(eos);
    }

    return this.ast;
  }
};

/**
 * Visit `node` with the given `fn`
 */

function visit(node, fn) {
  if (!node.visited) {
    define(node, 'visited', true);
    return node.nodes ? mapVisit(node.nodes, fn) : fn(node);
  }
  return node;
}

/**
 * Map visit over array of `nodes`.
 */

function mapVisit(nodes, fn) {
  var len = nodes.length;
  var idx = -1;
  while (++idx < len) {
    visit(nodes[idx], fn);
  }
}

function hasOpen(node) {
  return node.nodes && node.nodes[0].type === (node.type + '.open');
}

function hasClose(node) {
  return node.nodes && utils.last(node.nodes).type === (node.type + '.close');
}

function hasDelims(node) {
  return hasOpen(node) && hasClose(node);
}

/**
 * Expose `Parser`
 */

module.exports = Parser;

}).call(this,"/node_modules\\snapdragon\\lib\\parser.js")
},{"./position":197,"./utils":199,"debug":200,"define-property":202,"map-cache":153,"use":232,"util":6}],197:[function(require,module,exports){
'use strict';

var define = require('define-property');

/**
 * Store position for a node
 */

module.exports = function Position(start, parser) {
  this.start = start;
  this.end = { line: parser.line, column: parser.column };
  define(this, 'content', parser.orig);
  define(this, 'source', parser.options.source);
};

},{"define-property":202}],198:[function(require,module,exports){
'use strict';

var fs = require('fs');
var path = require('path');
var define = require('define-property');
var utils = require('./utils');

/**
 * Expose `mixin()`.
 * This code is based on `source-maps-support.js` in reworkcss/css
 * https://github.com/reworkcss/css/blob/master/lib/stringify/source-map-support.js
 * Copyright (c) 2012 TJ Holowaychuk <tj@vision-media.ca>
 */

module.exports = mixin;

/**
 * Mixin source map support into `compiler`.
 *
 * @param {Object} `compiler`
 * @api public
 */

function mixin(compiler) {
  define(compiler, '_comment', compiler.comment);
  compiler.map = new utils.SourceMap.SourceMapGenerator();
  compiler.position = { line: 1, column: 1 };
  compiler.content = {};
  compiler.files = {};

  for (var key in exports) {
    define(compiler, key, exports[key]);
  }
}

/**
 * Update position.
 *
 * @param {String} str
 */

exports.updatePosition = function(str) {
  var lines = str.match(/\n/g);
  if (lines) this.position.line += lines.length;
  var i = str.lastIndexOf('\n');
  this.position.column = ~i ? str.length - i : this.position.column + str.length;
};

/**
 * Emit `str` with `position`.
 *
 * @param {String} str
 * @param {Object} [pos]
 * @return {String}
 */

exports.emit = function(str, node) {
  var position = node.position || {};
  var source = position.source;
  if (source) {
    if (position.filepath) {
      source = utils.unixify(position.filepath);
    }

    this.map.addMapping({
      source: source,
      generated: {
        line: this.position.line,
        column: Math.max(this.position.column - 1, 0)
      },
      original: {
        line: position.start.line,
        column: position.start.column - 1
      }
    });

    if (position.content) {
      this.addContent(source, position);
    }
    if (position.filepath) {
      this.addFile(source, position);
    }

    this.updatePosition(str);
    this.output += str;
  }
  return str;
};

/**
 * Adds a file to the source map output if it has not already been added
 * @param {String} `file`
 * @param {Object} `pos`
 */

exports.addFile = function(file, position) {
  if (typeof position.content !== 'string') return;
  if (Object.prototype.hasOwnProperty.call(this.files, file)) return;
  this.files[file] = position.content;
};

/**
 * Adds a content source to the source map output if it has not already been added
 * @param {String} `source`
 * @param {Object} `position`
 */

exports.addContent = function(source, position) {
  if (typeof position.content !== 'string') return;
  if (Object.prototype.hasOwnProperty.call(this.content, source)) return;
  this.map.setSourceContent(source, position.content);
};

/**
 * Applies any original source maps to the output and embeds the source file
 * contents in the source map.
 */

exports.applySourceMaps = function() {
  Object.keys(this.files).forEach(function(file) {
    var content = this.files[file];
    this.map.setSourceContent(file, content);

    if (this.options.inputSourcemaps === true) {
      var originalMap = utils.sourceMapResolve.resolveSync(content, file, fs.readFileSync);
      if (originalMap) {
        var map = new utils.SourceMap.SourceMapConsumer(originalMap.map);
        var relativeTo = originalMap.sourcesRelativeTo;
        this.map.applySourceMap(map, file, utils.unixify(path.dirname(relativeTo)));
      }
    }
  }, this);
};

/**
 * Process comments, drops sourceMap comments.
 * @param {Object} node
 */

exports.comment = function(node) {
  if (/^# sourceMappingURL=/.test(node.comment)) {
    return this.emit('', node.position);
  }
  return this._comment(node);
};

},{"./utils":199,"define-property":202,"fs":1,"path":2}],199:[function(require,module,exports){
'use strict';

/**
 * Module dependencies
 */

exports.extend = require('extend-shallow');
exports.SourceMap = require('source-map');
exports.sourceMapResolve = require('source-map-resolve');

/**
 * Convert backslash in the given string to forward slashes
 */

exports.unixify = function(fp) {
  return fp.split(/\\+/).join('/');
};

/**
 * Return true if `val` is a non-empty string
 *
 * @param {String} `str`
 * @return {Boolean}
 */

exports.isString = function(str) {
  return str && typeof str === 'string';
};

/**
 * Cast `val` to an array
 * @return {Array}
 */

exports.arrayify = function(val) {
  if (typeof val === 'string') return [val];
  return val ? (Array.isArray(val) ? val : [val]) : [];
};

/**
 * Get the last `n` element from the given `array`
 * @param {Array} `array`
 * @return {*}
 */

exports.last = function(arr, n) {
  return arr[arr.length - (n || 1)];
};

},{"extend-shallow":203,"source-map":214,"source-map-resolve":215}],200:[function(require,module,exports){
arguments[4][111][0].apply(exports,arguments)
},{"./debug":201,"_process":3,"dup":111}],201:[function(require,module,exports){
arguments[4][112][0].apply(exports,arguments)
},{"dup":112,"ms":162}],202:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"dup":99,"is-descriptor":142}],203:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"dup":96,"is-extendable":144}],204:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');
var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

exports.ArraySet = ArraySet;

},{"./util":213}],205:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = require('./base64');

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

},{"./base64":206}],206:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
exports.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
exports.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

},{}],207:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};

},{}],208:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

exports.MappingList = MappingList;

},{"./util":213}],209:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
exports.quickSort = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

},{}],210:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');
var binarySearch = require('./binary-search');
var ArraySet = require('./array-set').ArraySet;
var base64VLQ = require('./base64-vlq');
var quickSort = require('./quick-sort').quickSort;

function SourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap)
    : new BasicSourceMapConsumer(sourceMap);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
}

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      if (source != null && sourceRoot != null) {
        source = util.join(sourceRoot, source);
      }
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: Optional. the column number in the original source.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    if (this.sourceRoot != null) {
      needle.source = util.relative(this.sourceRoot, needle.source);
    }
    if (!this._sources.has(needle.source)) {
      return [];
    }
    needle.source = this._sources.indexOf(needle.source);

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

exports.SourceMapConsumer = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The only parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._sources.toArray().map(function (s) {
      return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
    }, this);
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          if (this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    if (this.sourceRoot != null) {
      aSource = util.relative(this.sourceRoot, aSource);
    }

    if (this._sources.has(aSource)) {
      return this.sourcesContent[this._sources.indexOf(aSource)];
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + aSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + aSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    if (this.sourceRoot != null) {
      source = util.relative(this.sourceRoot, source);
    }
    if (!this._sources.has(source)) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }
    source = this._sources.indexOf(source);

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

exports.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The only parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'))
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer.sources.indexOf(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        if (section.consumer.sourceRoot !== null) {
          source = util.join(section.consumer.sourceRoot, source);
        }
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = section.consumer._names.at(mapping.name);
        this._names.add(name);
        name = this._names.indexOf(name);

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };

exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

},{"./array-set":204,"./base64-vlq":205,"./binary-search":207,"./quick-sort":209,"./util":213}],211:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ = require('./base64-vlq');
var util = require('./util');
var ArraySet = require('./array-set').ArraySet;
var MappingList = require('./mapping-list').MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util.getArg(aArgs, 'file', null);
  this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet();
  this._names = new ArraySet();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util.getArg(aArgs, 'generated');
    var original = util.getArg(aArgs, 'original', null);
    var source = util.getArg(aArgs, 'source', null);
    var name = util.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet();
    var newNames = new ArraySet();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source)
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
        throw new Error(
            'original.line and original.column are not numbers -- you probably meant to omit ' +
            'the original mapping entirely and only map the generated position. If so, pass ' +
            'null for the original mapping instead of an object with empty or null values.'
        );
    }

    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = ''

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      var key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

exports.SourceMapGenerator = SourceMapGenerator;

},{"./array-set":204,"./base64-vlq":205,"./mapping-list":208,"./util":213}],212:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
var util = require('./util');

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are accessed by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      // The last line of a file might not have a newline.
      var newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ?
            remainingLines[remainingLinesIndex++] : undefined;
      }
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[remainingLinesIndex];
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex];
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

exports.SourceNode = SourceNode;

},{"./source-map-generator":211,"./util":213}],213:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || !!aPath.match(urlRegexp);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

},{}],214:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./lib/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./lib/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./lib/source-node').SourceNode;

},{"./lib/source-map-consumer":210,"./lib/source-map-generator":211,"./lib/source-node":212}],215:[function(require,module,exports){
// Copyright 2014, 2015, 2016, 2017 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

// Note: source-map-resolve.js is generated from source-map-resolve-node.js and
// source-map-resolve-template.js. Only edit the two latter files, _not_
// source-map-resolve.js!

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["source-map-url", "resolve-url"], factory)
  } else if (typeof exports === "object") {
    var sourceMappingURL = require("source-map-url")
    var resolveUrl = require("resolve-url")
    module.exports = factory(sourceMappingURL, resolveUrl)
  } else {
    root.sourceMapResolve = factory(root.sourceMappingURL, root.resolveUrl)
  }
}(this, function(sourceMappingURL, resolveUrl) {

  function callbackAsync(callback, error, result) {
    setImmediate(function() { callback(error, result) })
  }

  function parseMapToJSON(string, data) {
    try {
      return JSON.parse(string.replace(/^\)\]\}'/, ""))
    } catch (error) {
      error.sourceMapData = data
      throw error
    }
  }

  function readSync(read, url, data) {
    var readUrl = url
    try {
      return String(read(readUrl))
    } catch (error) {
      error.sourceMapData = data
      throw error
    }
  }



  function resolveSourceMap(code, codeUrl, read, callback) {
    var mapData
    try {
      mapData = resolveSourceMapHelper(code, codeUrl)
    } catch (error) {
      return callbackAsync(callback, error)
    }
    if (!mapData || mapData.map) {
      return callbackAsync(callback, null, mapData)
    }
    var readUrl = mapData.url
    read(readUrl, function(error, result) {
      if (error) {
        error.sourceMapData = mapData
        return callback(error)
      }
      mapData.map = String(result)
      try {
        mapData.map = parseMapToJSON(mapData.map, mapData)
      } catch (error) {
        return callback(error)
      }
      callback(null, mapData)
    })
  }

  function resolveSourceMapSync(code, codeUrl, read) {
    var mapData = resolveSourceMapHelper(code, codeUrl)
    if (!mapData || mapData.map) {
      return mapData
    }
    mapData.map = readSync(read, mapData.url, mapData)
    mapData.map = parseMapToJSON(mapData.map, mapData)
    return mapData
  }

  var dataUriRegex = /^data:([^,;]*)(;[^,;]*)*(?:,(.*))?$/
  var jsonMimeTypeRegex = /^(?:application|text)\/json$/

  function resolveSourceMapHelper(code, codeUrl) {
    var url = sourceMappingURL.getFrom(code)
    if (!url) {
      return null
    }

    var dataUri = url.match(dataUriRegex)
    if (dataUri) {
      var mimeType = dataUri[1]
      var lastParameter = dataUri[2] || ""
      var encoded = dataUri[3] || ""
      var data = {
        sourceMappingURL: url,
        url: null,
        sourcesRelativeTo: codeUrl,
        map: encoded
      }
      if (!jsonMimeTypeRegex.test(mimeType)) {
        var error = new Error("Unuseful data uri mime type: " + (mimeType || "text/plain"))
        error.sourceMapData = data
        throw error
      }
      data.map = parseMapToJSON(
        lastParameter === ";base64" ? atob(encoded) : decodeURIComponent(encoded),
        data
      )
      return data
    }

    var mapUrl = resolveUrl(codeUrl, url)
    return {
      sourceMappingURL: url,
      url: mapUrl,
      sourcesRelativeTo: mapUrl,
      map: null
    }
  }



  function resolveSources(map, mapUrl, read, options, callback) {
    if (typeof options === "function") {
      callback = options
      options = {}
    }
    var pending = map.sources ? map.sources.length : 0
    var result = {
      sourcesResolved: [],
      sourcesContent:  []
    }

    if (pending === 0) {
      callbackAsync(callback, null, result)
      return
    }

    var done = function() {
      pending--
      if (pending === 0) {
        callback(null, result)
      }
    }

    resolveSourcesHelper(map, mapUrl, options, function(fullUrl, sourceContent, index) {
      result.sourcesResolved[index] = fullUrl
      if (typeof sourceContent === "string") {
        result.sourcesContent[index] = sourceContent
        callbackAsync(done, null)
      } else {
        var readUrl = fullUrl
        read(readUrl, function(error, source) {
          result.sourcesContent[index] = error ? error : String(source)
          done()
        })
      }
    })
  }

  function resolveSourcesSync(map, mapUrl, read, options) {
    var result = {
      sourcesResolved: [],
      sourcesContent:  []
    }

    if (!map.sources || map.sources.length === 0) {
      return result
    }

    resolveSourcesHelper(map, mapUrl, options, function(fullUrl, sourceContent, index) {
      result.sourcesResolved[index] = fullUrl
      if (read !== null) {
        if (typeof sourceContent === "string") {
          result.sourcesContent[index] = sourceContent
        } else {
          var readUrl = fullUrl
          try {
            result.sourcesContent[index] = String(read(readUrl))
          } catch (error) {
            result.sourcesContent[index] = error
          }
        }
      }
    })

    return result
  }

  var endingSlash = /\/?$/

  function resolveSourcesHelper(map, mapUrl, options, fn) {
    options = options || {}
    var fullUrl
    var sourceContent
    var sourceRoot
    for (var index = 0, len = map.sources.length; index < len; index++) {
      sourceRoot = null
      if (typeof options.sourceRoot === "string") {
        sourceRoot = options.sourceRoot
      } else if (typeof map.sourceRoot === "string" && options.sourceRoot !== false) {
        sourceRoot = map.sourceRoot
      }
      // If the sourceRoot is the empty string, it is equivalent to not setting
      // the property at all.
      if (sourceRoot === null || sourceRoot === '') {
        fullUrl = resolveUrl(mapUrl, map.sources[index])
      } else {
        // Make sure that the sourceRoot ends with a slash, so that `/scripts/subdir` becomes
        // `/scripts/subdir/<source>`, not `/scripts/<source>`. Pointing to a file as source root
        // does not make sense.
        fullUrl = resolveUrl(mapUrl, sourceRoot.replace(endingSlash, "/"), map.sources[index])
      }
      sourceContent = (map.sourcesContent || [])[index]
      fn(fullUrl, sourceContent, index)
    }
  }



  function resolve(code, codeUrl, read, options, callback) {
    if (typeof options === "function") {
      callback = options
      options = {}
    }
    if (code === null) {
      var mapUrl = codeUrl
      var data = {
        sourceMappingURL: null,
        url: mapUrl,
        sourcesRelativeTo: mapUrl,
        map: null
      }
      var readUrl = mapUrl
      read(readUrl, function(error, result) {
        if (error) {
          error.sourceMapData = data
          return callback(error)
        }
        data.map = String(result)
        try {
          data.map = parseMapToJSON(data.map, data)
        } catch (error) {
          return callback(error)
        }
        _resolveSources(data)
      })
    } else {
      resolveSourceMap(code, codeUrl, read, function(error, mapData) {
        if (error) {
          return callback(error)
        }
        if (!mapData) {
          return callback(null, null)
        }
        _resolveSources(mapData)
      })
    }

    function _resolveSources(mapData) {
      resolveSources(mapData.map, mapData.sourcesRelativeTo, read, options, function(error, result) {
        if (error) {
          return callback(error)
        }
        mapData.sourcesResolved = result.sourcesResolved
        mapData.sourcesContent  = result.sourcesContent
        callback(null, mapData)
      })
    }
  }

  function resolveSync(code, codeUrl, read, options) {
    var mapData
    if (code === null) {
      var mapUrl = codeUrl
      mapData = {
        sourceMappingURL: null,
        url: mapUrl,
        sourcesRelativeTo: mapUrl,
        map: null
      }
      mapData.map = readSync(read, mapUrl, mapData)
      mapData.map = parseMapToJSON(mapData.map, mapData)
    } else {
      mapData = resolveSourceMapSync(code, codeUrl, read)
      if (!mapData) {
        return null
      }
    }
    var result = resolveSourcesSync(mapData.map, mapData.sourcesRelativeTo, read, options)
    mapData.sourcesResolved = result.sourcesResolved
    mapData.sourcesContent  = result.sourcesContent
    return mapData
  }



  return {
    resolveSourceMap:     resolveSourceMap,
    resolveSourceMapSync: resolveSourceMapSync,
    resolveSources:       resolveSources,
    resolveSourcesSync:   resolveSourcesSync,
    resolve:              resolve,
    resolveSync:          resolveSync,
    parseMapToJSON:       parseMapToJSON
  }

}));

},{"resolve-url":178,"source-map-url":216}],216:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.sourceMappingURL = factory()
  }
}(this, function() {

  var innerRegex = /[#@] sourceMappingURL=([^\s'"]*)/

  var regex = RegExp(
    "(?:" +
      "/\\*" +
      "(?:\\s*\r?\n(?://)?)?" +
      "(?:" + innerRegex.source + ")" +
      "\\s*" +
      "\\*/" +
      "|" +
      "//(?:" + innerRegex.source + ")" +
    ")" +
    "\\s*"
  )

  return {

    regex: regex,
    _innerRegex: innerRegex,

    getFrom: function(code) {
      var match = code.match(regex)
      return (match ? match[1] || match[2] || "" : null)
    },

    existsIn: function(code) {
      return regex.test(code)
    },

    removeFrom: function(code) {
      return code.replace(regex, "")
    },

    insertBefore: function(code, string) {
      var match = code.match(regex)
      if (match) {
        return code.slice(0, match.index) + string + code.slice(match.index)
      } else {
        return code + string
      }
    }
  }

}));

},{}],217:[function(require,module,exports){
/*!
 * split-string <https://github.com/jonschlinkert/split-string>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var extend = require('extend-shallow');

module.exports = function(str, options, fn) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  if (typeof options === 'function') {
    fn = options;
    options = null;
  }

  // allow separator to be defined as a string
  if (typeof options === 'string') {
    options = { sep: options };
  }

  var opts = extend({sep: '.'}, options);
  var quotes = opts.quotes || ['"', "'", '`'];
  var brackets;

  if (opts.brackets === true) {
    brackets = {
      '<': '>',
      '(': ')',
      '[': ']',
      '{': '}'
    };
  } else if (opts.brackets) {
    brackets = opts.brackets;
  }

  var tokens = [];
  var stack = [];
  var arr = [''];
  var sep = opts.sep;
  var len = str.length;
  var idx = -1;
  var closeIdx;

  function expected() {
    if (brackets && stack.length) {
      return brackets[stack[stack.length - 1]];
    }
  }

  while (++idx < len) {
    var ch = str[idx];
    var next = str[idx + 1];
    var tok = { val: ch, idx: idx, arr: arr, str: str };
    tokens.push(tok);

    if (ch === '\\') {
      tok.val = keepEscaping(opts, str, idx) === true ? (ch + next) : next;
      tok.escaped = true;
      if (typeof fn === 'function') {
        fn(tok);
      }
      arr[arr.length - 1] += tok.val;
      idx++;
      continue;
    }

    if (brackets && brackets[ch]) {
      stack.push(ch);
      var e = expected();
      var i = idx + 1;

      if (str.indexOf(e, i + 1) !== -1) {
        while (stack.length && i < len) {
          var s = str[++i];
          if (s === '\\') {
            s++;
            continue;
          }

          if (quotes.indexOf(s) !== -1) {
            i = getClosingQuote(str, s, i + 1);
            continue;
          }

          e = expected();
          if (stack.length && str.indexOf(e, i + 1) === -1) {
            break;
          }

          if (brackets[s]) {
            stack.push(s);
            continue;
          }

          if (e === s) {
            stack.pop();
          }
        }
      }

      closeIdx = i;
      if (closeIdx === -1) {
        arr[arr.length - 1] += ch;
        continue;
      }

      ch = str.slice(idx, closeIdx + 1);
      tok.val = ch;
      tok.idx = idx = closeIdx;
    }

    if (quotes.indexOf(ch) !== -1) {
      closeIdx = getClosingQuote(str, ch, idx + 1);
      if (closeIdx === -1) {
        arr[arr.length - 1] += ch;
        continue;
      }

      if (keepQuotes(ch, opts) === true) {
        ch = str.slice(idx, closeIdx + 1);
      } else {
        ch = str.slice(idx + 1, closeIdx);
      }

      tok.val = ch;
      tok.idx = idx = closeIdx;
    }

    if (typeof fn === 'function') {
      fn(tok, tokens);
      ch = tok.val;
      idx = tok.idx;
    }

    if (tok.val === sep && tok.split !== false) {
      arr.push('');
      continue;
    }

    arr[arr.length - 1] += tok.val;
  }

  return arr;
};

function getClosingQuote(str, ch, i, brackets) {
  var idx = str.indexOf(ch, i);
  if (str.charAt(idx - 1) === '\\') {
    return getClosingQuote(str, ch, idx + 1);
  }
  return idx;
}

function keepQuotes(ch, opts) {
  if (opts.keepDoubleQuotes === true && ch === '"') return true;
  if (opts.keepSingleQuotes === true && ch === "'") return true;
  return opts.keepQuotes;
}

function keepEscaping(opts, str, idx) {
  if (typeof opts.keepEscaping === 'function') {
    return opts.keepEscaping(str, idx);
  }
  return opts.keepEscaping === true || str[idx + 1] === '\\';
}

},{"extend-shallow":115}],218:[function(require,module,exports){
/*!
 * static-extend <https://github.com/jonschlinkert/static-extend>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var copy = require('object-copy');
var define = require('define-property');
var util = require('util');

/**
 * Returns a function for extending the static properties,
 * prototype properties, and descriptors from the `Parent`
 * constructor onto `Child` constructors.
 *
 * ```js
 * var extend = require('static-extend');
 * Parent.extend = extend(Parent);
 *
 * // optionally pass a custom merge function as the second arg
 * Parent.extend = extend(Parent, function(Child) {
 *   Child.prototype.mixin = function(key, val) {
 *     Child.prototype[key] = val;
 *   };
 * });
 *
 * // extend "child" constructors
 * Parent.extend(Child);
 *
 * // optionally define prototype methods as the second arg
 * Parent.extend(Child, {
 *   foo: function() {},
 *   bar: function() {}
 * });
 * ```
 * @param {Function} `Parent` Parent ctor
 * @param {Function} `extendFn` Optional extend function for handling any necessary custom merging. Useful when updating methods that require a specific prototype.
 *   @param {Function} `Child` Child ctor
 *   @param {Object} `proto` Optionally pass additional prototype properties to inherit.
 *   @return {Object}
 * @api public
 */

function extend(Parent, extendFn) {
  if (typeof Parent !== 'function') {
    throw new TypeError('expected Parent to be a function.');
  }

  return function(Ctor, proto) {
    if (typeof Ctor !== 'function') {
      throw new TypeError('expected Ctor to be a function.');
    }

    util.inherits(Ctor, Parent);
    copy(Ctor, Parent);

    // proto can be null or a plain object
    if (typeof proto === 'object') {
      var obj = Object.create(proto);

      for (var k in obj) {
        Ctor.prototype[k] = obj[k];
      }
    }

    // keep a reference to the parent prototype
    define(Ctor.prototype, '_parent_', {
      configurable: true,
      set: function() {},
      get: function() {
        return Parent.prototype;
      }
    });

    if (typeof extendFn === 'function') {
      extendFn(Ctor, Parent);
    }

    Ctor.extend = extend(Ctor, extendFn);
  };
};

/**
 * Expose `extend`
 */

module.exports = extend;

},{"define-property":219,"object-copy":168,"util":6}],219:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"dup":99,"is-descriptor":142}],220:[function(require,module,exports){
/*!
 * to-object-path <https://github.com/jonschlinkert/to-object-path>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var typeOf = require('kind-of');

module.exports = function toPath(args) {
  if (typeOf(args) !== 'arguments') {
    args = arguments;
  }
  return filter(args).join('.');
};

function filter(arr) {
  var len = arr.length;
  var idx = -1;
  var res = [];

  while (++idx < len) {
    var ele = arr[idx];
    if (typeOf(ele) === 'arguments' || Array.isArray(ele)) {
      res.push.apply(res, filter(ele));
    } else if (typeof ele === 'string') {
      res.push(ele);
    }
  }
  return res;
}

},{"kind-of":221}],221:[function(require,module,exports){
arguments[4][138][0].apply(exports,arguments)
},{"dup":138,"is-buffer":139}],222:[function(require,module,exports){
/*!
 * to-regex-range <https://github.com/jonschlinkert/to-regex-range>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var repeat = require('repeat-string');
var isNumber = require('is-number');
var cache = {};

function toRegexRange(min, max, options) {
  if (isNumber(min) === false) {
    throw new RangeError('toRegexRange: first argument is invalid.');
  }

  if (typeof max === 'undefined' || min === max) {
    return String(min);
  }

  if (isNumber(max) === false) {
    throw new RangeError('toRegexRange: second argument is invalid.');
  }

  options = options || {};
  var relax = String(options.relaxZeros);
  var shorthand = String(options.shorthand);
  var capture = String(options.capture);
  var key = min + ':' + max + '=' + relax + shorthand + capture;
  if (cache.hasOwnProperty(key)) {
    return cache[key].result;
  }

  var a = Math.min(min, max);
  var b = Math.max(min, max);

  if (Math.abs(a - b) === 1) {
    var result = min + '|' + max;
    if (options.capture) {
      return '(' + result + ')';
    }
    return result;
  }

  var isPadded = padding(min) || padding(max);
  var positives = [];
  var negatives = [];

  var tok = {min: min, max: max, a: a, b: b};
  if (isPadded) {
    tok.isPadded = isPadded;
    tok.maxLen = String(tok.max).length;
  }

  if (a < 0) {
    var newMin = b < 0 ? Math.abs(b) : 1;
    var newMax = Math.abs(a);
    negatives = splitToPatterns(newMin, newMax, tok, options);
    a = tok.a = 0;
  }

  if (b >= 0) {
    positives = splitToPatterns(a, b, tok, options);
  }

  tok.negatives = negatives;
  tok.positives = positives;
  tok.result = siftPatterns(negatives, positives, options);

  if (options.capture && (positives.length + negatives.length) > 1) {
    tok.result = '(' + tok.result + ')';
  }

  cache[key] = tok;
  return tok.result;
}

function siftPatterns(neg, pos, options) {
  var onlyNegative = filterPatterns(neg, pos, '-', false, options) || [];
  var onlyPositive = filterPatterns(pos, neg, '', false, options) || [];
  var intersected = filterPatterns(neg, pos, '-?', true, options) || [];
  var subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
  return subpatterns.join('|');
}

function splitToRanges(min, max) {
  min = Number(min);
  max = Number(max);

  var nines = 1;
  var stops = [max];
  var stop = +countNines(min, nines);

  while (min <= stop && stop <= max) {
    stops = push(stops, stop);
    nines += 1;
    stop = +countNines(min, nines);
  }

  var zeros = 1;
  stop = countZeros(max + 1, zeros) - 1;

  while (min < stop && stop <= max) {
    stops = push(stops, stop);
    zeros += 1;
    stop = countZeros(max + 1, zeros) - 1;
  }

  stops.sort(compare);
  return stops;
}

/**
 * Convert a range to a regex pattern
 * @param {Number} `start`
 * @param {Number} `stop`
 * @return {String}
 */

function rangeToPattern(start, stop, options) {
  if (start === stop) {
    return {pattern: String(start), digits: []};
  }

  var zipped = zip(String(start), String(stop));
  var len = zipped.length, i = -1;

  var pattern = '';
  var digits = 0;

  while (++i < len) {
    var numbers = zipped[i];
    var startDigit = numbers[0];
    var stopDigit = numbers[1];

    if (startDigit === stopDigit) {
      pattern += startDigit;

    } else if (startDigit !== '0' || stopDigit !== '9') {
      pattern += toCharacterClass(startDigit, stopDigit);

    } else {
      digits += 1;
    }
  }

  if (digits) {
    pattern += options.shorthand ? '\\d' : '[0-9]';
  }

  return { pattern: pattern, digits: [digits] };
}

function splitToPatterns(min, max, tok, options) {
  var ranges = splitToRanges(min, max);
  var len = ranges.length;
  var idx = -1;

  var tokens = [];
  var start = min;
  var prev;

  while (++idx < len) {
    var range = ranges[idx];
    var obj = rangeToPattern(start, range, options);
    var zeros = '';

    if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
      if (prev.digits.length > 1) {
        prev.digits.pop();
      }
      prev.digits.push(obj.digits[0]);
      prev.string = prev.pattern + toQuantifier(prev.digits);
      start = range + 1;
      continue;
    }

    if (tok.isPadded) {
      zeros = padZeros(range, tok);
    }

    obj.string = zeros + obj.pattern + toQuantifier(obj.digits);
    tokens.push(obj);
    start = range + 1;
    prev = obj;
  }

  return tokens;
}

function filterPatterns(arr, comparison, prefix, intersection, options) {
  var res = [];

  for (var i = 0; i < arr.length; i++) {
    var tok = arr[i];
    var ele = tok.string;

    if (options.relaxZeros !== false) {
      if (prefix === '-' && ele.charAt(0) === '0') {
        if (ele.charAt(1) === '{') {
          ele = '0*' + ele.replace(/^0\{\d+\}/, '');
        } else {
          ele = '0*' + ele.slice(1);
        }
      }
    }

    if (!intersection && !contains(comparison, 'string', ele)) {
      res.push(prefix + ele);
    }

    if (intersection && contains(comparison, 'string', ele)) {
      res.push(prefix + ele);
    }
  }
  return res;
}

/**
 * Zip strings (`for in` can be used on string characters)
 */

function zip(a, b) {
  var arr = [];
  for (var ch in a) arr.push([a[ch], b[ch]]);
  return arr;
}

function compare(a, b) {
  return a > b ? 1 : b > a ? -1 : 0;
}

function push(arr, ele) {
  if (arr.indexOf(ele) === -1) arr.push(ele);
  return arr;
}

function contains(arr, key, val) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return true;
    }
  }
  return false;
}

function countNines(min, len) {
  return String(min).slice(0, -len) + repeat('9', len);
}

function countZeros(integer, zeros) {
  return integer - (integer % Math.pow(10, zeros));
}

function toQuantifier(digits) {
  var start = digits[0];
  var stop = digits[1] ? (',' + digits[1]) : '';
  if (!stop && (!start || start === 1)) {
    return '';
  }
  return '{' + start + stop + '}';
}

function toCharacterClass(a, b) {
  return '[' + a + ((b - a === 1) ? '' : '-') + b + ']';
}

function padding(str) {
  return /^-?(0+)\d/.exec(str);
}

function padZeros(val, tok) {
  if (tok.isPadded) {
    var diff = Math.abs(tok.maxLen - String(val).length);
    switch (diff) {
      case 0:
        return '';
      case 1:
        return '0';
      default: {
        return '0{' + diff + '}';
      }
    }
  }
  return val;
}

/**
 * Expose `toRegexRange`
 */

module.exports = toRegexRange;

},{"is-number":145,"repeat-string":177}],223:[function(require,module,exports){
'use strict';

var safe = require('safe-regex');
var define = require('define-property');
var extend = require('extend-shallow');
var not = require('regex-not');
var MAX_LENGTH = 1024 * 64;

/**
 * Session cache
 */

var cache = {};

/**
 * Create a regular expression from the given `pattern` string.
 *
 * @param {String|RegExp} `pattern` Pattern can be a string or regular expression.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

module.exports = function(patterns, options) {
  if (!Array.isArray(patterns)) {
    return makeRe(patterns, options);
  }
  return makeRe(patterns.join('|'), options);
};

/**
 * Create a regular expression from the given `pattern` string.
 *
 * @param {String|RegExp} `pattern` Pattern can be a string or regular expression.
 * @param {Object} `options`
 * @return {RegExp}
 * @api public
 */

function makeRe(pattern, options) {
  if (pattern instanceof RegExp) {
    return pattern;
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('expected a string');
  }

  if (pattern.length > MAX_LENGTH) {
    throw new Error('expected pattern to be less than ' + MAX_LENGTH + ' characters');
  }

  var key = pattern;
  // do this before shallow cloning options, it's a lot faster
  if (!options || (options && options.cache !== false)) {
    key = createKey(pattern, options);

    if (cache.hasOwnProperty(key)) {
      return cache[key];
    }
  }

  var opts = extend({}, options);
  if (opts.contains === true) {
    if (opts.negate === true) {
      opts.strictNegate = false;
    } else {
      opts.strict = false;
    }
  }

  if (opts.strict === false) {
    opts.strictOpen = false;
    opts.strictClose = false;
  }

  var open = opts.strictOpen !== false ? '^' : '';
  var close = opts.strictClose !== false ? '$' : '';
  var flags = opts.flags || '';
  var regex;

  if (opts.nocase === true && !/i/.test(flags)) {
    flags += 'i';
  }

  try {
    if (opts.negate || typeof opts.strictNegate === 'boolean') {
      pattern = not.create(pattern, opts);
    }

    var str = open + '(?:' + pattern + ')' + close;
    regex = new RegExp(str, flags);

    if (opts.safe === true && safe(regex) === false) {
      throw new Error('potentially unsafe regular expression: ' + regex.source);
    }

  } catch (err) {
    if (opts.strictErrors === true || opts.safe === true) {
      err.key = key;
      err.pattern = pattern;
      err.originalOptions = options;
      err.createdOptions = opts;
      throw err;
    }

    try {
      regex = new RegExp('^' + pattern.replace(/(\W)/g, '\\$1') + '$');
    } catch (err) {
      regex = /.^/; //<= match nothing
    }
  }

  if (opts.cache !== false) {
    memoize(regex, key, pattern, opts);
  }
  return regex;
}

/**
 * Memoize generated regex. This can result in dramatic speed improvements
 * and simplify debugging by adding options and pattern to the regex. It can be
 * disabled by passing setting `options.cache` to false.
 */

function memoize(regex, key, pattern, options) {
  define(regex, 'cached', true);
  define(regex, 'pattern', pattern);
  define(regex, 'options', options);
  define(regex, 'key', key);
  cache[key] = regex;
}

/**
 * Create the key to use for memoization. The key is generated
 * by iterating over the options and concatenating key-value pairs
 * to the pattern string.
 */

function createKey(pattern, options) {
  if (!options) return pattern;
  var key = pattern;
  for (var prop in options) {
    if (options.hasOwnProperty(prop)) {
      key += ';' + prop + '=' + String(options[prop]);
    }
  }
  return key;
}

/**
 * Expose `makeRe`
 */

module.exports.makeRe = makeRe;

},{"define-property":103,"extend-shallow":115,"regex-not":175,"safe-regex":184}],224:[function(require,module,exports){
'use strict';

var isObject = require('is-extendable');
var union = require('arr-union');
var get = require('get-value');
var set = require('set-value');

module.exports = function unionValue(obj, prop, value) {
  if (!isObject(obj)) {
    throw new TypeError('union-value expects the first argument to be an object.');
  }

  if (typeof prop !== 'string') {
    throw new TypeError('union-value expects `prop` to be a string.');
  }

  var arr = arrayify(get(obj, prop));
  set(obj, prop, union(arr, arrayify(value)));
  return obj;
};

function arrayify(val) {
  if (val === null || typeof val === 'undefined') {
    return [];
  }
  if (Array.isArray(val)) {
    return val;
  }
  return [val];
}

},{"arr-union":83,"get-value":133,"is-extendable":144,"set-value":226}],225:[function(require,module,exports){
arguments[4][96][0].apply(exports,arguments)
},{"dup":96,"is-extendable":144}],226:[function(require,module,exports){
/*!
 * set-value <https://github.com/jonschlinkert/set-value>
 *
 * Copyright (c) 2014-2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var toPath = require('to-object-path');
var extend = require('extend-shallow');
var isPlainObject = require('is-plain-object');
var isObject = require('is-extendable');

module.exports = function(obj, path, val) {
  if (!isObject(obj)) {
    return obj;
  }

  if (Array.isArray(path)) {
    path = toPath(path);
  }

  if (typeof path !== 'string') {
    return obj;
  }

  var segs = path.split('.');
  var len = segs.length, i = -1;
  var res = obj;
  var last;

  while (++i < len) {
    var key = segs[i];

    while (key[key.length - 1] === '\\') {
      key = key.slice(0, -1) + '.' + segs[++i];
    }

    if (i === len - 1) {
      last = key;
      break;
    }

    if (!isObject(obj[key])) {
      obj[key] = {};
    }
    obj = obj[key];
  }

  if (obj.hasOwnProperty(last) && isObject(obj[last])) {
    if (isPlainObject(val)) {
      extend(obj[last], val);
    } else {
      obj[last] = val;
    }

  } else {
    obj[last] = val;
  }
  return res;
};


},{"extend-shallow":225,"is-extendable":144,"is-plain-object":147,"to-object-path":220}],227:[function(require,module,exports){
/*!
 * unset-value <https://github.com/jonschlinkert/unset-value>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var isObject = require('isobject');
var has = require('has-value');

module.exports = function unset(obj, prop) {
  if (!isObject(obj)) {
    throw new TypeError('expected an object.');
  }
  if (obj.hasOwnProperty(prop)) {
    delete obj[prop];
    return true;
  }

  if (has(obj, prop)) {
    var segs = prop.split('.');
    var last = segs.pop();
    while (segs.length && segs[segs.length - 1].slice(-1) === '\\') {
      last = segs.pop().slice(0, -1) + '.' + last;
    }
    while (segs.length) obj = obj[prop = segs.shift()];
    return (delete obj[last]);
  }
  return true;
};

},{"has-value":228,"isobject":150}],228:[function(require,module,exports){
/*!
 * has-value <https://github.com/jonschlinkert/has-value>
 *
 * Copyright (c) 2014-2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isObject = require('isobject');
var hasValues = require('has-values');
var get = require('get-value');

module.exports = function(obj, prop, noZero) {
  if (isObject(obj)) {
    return hasValues(get(obj, prop), noZero);
  }
  return hasValues(obj, prop);
};

},{"get-value":133,"has-values":230,"isobject":229}],229:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var isArray = require('isarray');

module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && isArray(val) === false;
};

},{"isarray":149}],230:[function(require,module,exports){
/*!
 * has-values <https://github.com/jonschlinkert/has-values>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

module.exports = function hasValue(o, noZero) {
  if (o === null || o === undefined) {
    return false;
  }

  if (typeof o === 'boolean') {
    return true;
  }

  if (typeof o === 'number') {
    if (o === 0 && noZero === true) {
      return false;
    }
    return true;
  }

  if (o.length !== undefined) {
    return o.length !== 0;
  }

  for (var key in o) {
    if (o.hasOwnProperty(key)) {
      return true;
    }
  }
  return false;
};

},{}],231:[function(require,module,exports){
/** @license URI.js v4.2.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.URI = global.URI || {})));
}(this, (function (exports) { 'use strict';

function merge() {
    for (var _len = arguments.length, sets = Array(_len), _key = 0; _key < _len; _key++) {
        sets[_key] = arguments[_key];
    }

    if (sets.length > 1) {
        sets[0] = sets[0].slice(0, -1);
        var xl = sets.length - 1;
        for (var x = 1; x < xl; ++x) {
            sets[x] = sets[x].slice(1, -1);
        }
        sets[xl] = sets[xl].slice(1);
        return sets.join('');
    } else {
        return sets[0];
    }
}
function subexp(str) {
    return "(?:" + str + ")";
}
function typeOf(o) {
    return o === undefined ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
}
function toUpperCase(str) {
    return str.toUpperCase();
}
function toArray(obj) {
    return obj !== undefined && obj !== null ? obj instanceof Array ? obj : typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj) : [];
}
function assign(target, source) {
    var obj = target;
    if (source) {
        for (var key in source) {
            obj[key] = source[key];
        }
    }
    return obj;
}

function buildExps(isIRI) {
    var ALPHA$$ = "[A-Za-z]",
        CR$ = "[\\x0D]",
        DIGIT$$ = "[0-9]",
        DQUOTE$$ = "[\\x22]",
        HEXDIG$$ = merge(DIGIT$$, "[A-Fa-f]"),
        //case-insensitive
    LF$$ = "[\\x0A]",
        SP$$ = "[\\x20]",
        PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$)),
        //expanded
    GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]",
        SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]",
        RESERVED$$ = merge(GEN_DELIMS$$, SUB_DELIMS$$),
        UCSCHAR$$ = isIRI ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]",
        //subset, excludes bidi control characters
    IPRIVATE$$ = isIRI ? "[\\uE000-\\uF8FF]" : "[]",
        //subset
    UNRESERVED$$ = merge(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]", UCSCHAR$$),
        SCHEME$ = subexp(ALPHA$$ + merge(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*"),
        USERINFO$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:]")) + "*"),
        DEC_OCTET$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("[1-9]" + DIGIT$$) + "|" + DIGIT$$),
        DEC_OCTET_RELAXED$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("0?[1-9]" + DIGIT$$) + "|0?0?" + DIGIT$$),
        //relaxed parsing rules
    IPV4ADDRESS$ = subexp(DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$),
        H16$ = subexp(HEXDIG$$ + "{1,4}"),
        LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$),
        IPV6ADDRESS1$ = subexp(subexp(H16$ + "\\:") + "{6}" + LS32$),
        //                           6( h16 ":" ) ls32
    IPV6ADDRESS2$ = subexp("\\:\\:" + subexp(H16$ + "\\:") + "{5}" + LS32$),
        //                      "::" 5( h16 ":" ) ls32
    IPV6ADDRESS3$ = subexp(subexp(H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{4}" + LS32$),
        //[               h16 ] "::" 4( h16 ":" ) ls32
    IPV6ADDRESS4$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,1}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{3}" + LS32$),
        //[ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
    IPV6ADDRESS5$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,2}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{2}" + LS32$),
        //[ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
    IPV6ADDRESS6$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,3}" + H16$) + "?\\:\\:" + H16$ + "\\:" + LS32$),
        //[ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
    IPV6ADDRESS7$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,4}" + H16$) + "?\\:\\:" + LS32$),
        //[ *4( h16 ":" ) h16 ] "::"              ls32
    IPV6ADDRESS8$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,5}" + H16$) + "?\\:\\:" + H16$),
        //[ *5( h16 ":" ) h16 ] "::"              h16
    IPV6ADDRESS9$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,6}" + H16$) + "?\\:\\:"),
        //[ *6( h16 ":" ) h16 ] "::"
    IPV6ADDRESS$ = subexp([IPV6ADDRESS1$, IPV6ADDRESS2$, IPV6ADDRESS3$, IPV6ADDRESS4$, IPV6ADDRESS5$, IPV6ADDRESS6$, IPV6ADDRESS7$, IPV6ADDRESS8$, IPV6ADDRESS9$].join("|")),
        ZONEID$ = subexp(subexp(UNRESERVED$$ + "|" + PCT_ENCODED$) + "+"),
        //RFC 6874
    IPV6ADDRZ$ = subexp(IPV6ADDRESS$ + "\\%25" + ZONEID$),
        //RFC 6874
    IPV6ADDRZ_RELAXED$ = subexp(IPV6ADDRESS$ + subexp("\\%25|\\%(?!" + HEXDIG$$ + "{2})") + ZONEID$),
        //RFC 6874, with relaxed parsing rules
    IPVFUTURE$ = subexp("[vV]" + HEXDIG$$ + "+\\." + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:]") + "+"),
        IP_LITERAL$ = subexp("\\[" + subexp(IPV6ADDRZ_RELAXED$ + "|" + IPV6ADDRESS$ + "|" + IPVFUTURE$) + "\\]"),
        //RFC 6874
    REG_NAME$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$)) + "*"),
        HOST$ = subexp(IP_LITERAL$ + "|" + IPV4ADDRESS$ + "(?!" + REG_NAME$ + ")" + "|" + REG_NAME$),
        PORT$ = subexp(DIGIT$$ + "*"),
        AUTHORITY$ = subexp(subexp(USERINFO$ + "@") + "?" + HOST$ + subexp("\\:" + PORT$) + "?"),
        PCHAR$ = subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@]")),
        SEGMENT$ = subexp(PCHAR$ + "*"),
        SEGMENT_NZ$ = subexp(PCHAR$ + "+"),
        SEGMENT_NZ_NC$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\@]")) + "+"),
        PATH_ABEMPTY$ = subexp(subexp("\\/" + SEGMENT$) + "*"),
        PATH_ABSOLUTE$ = subexp("\\/" + subexp(SEGMENT_NZ$ + PATH_ABEMPTY$) + "?"),
        //simplified
    PATH_NOSCHEME$ = subexp(SEGMENT_NZ_NC$ + PATH_ABEMPTY$),
        //simplified
    PATH_ROOTLESS$ = subexp(SEGMENT_NZ$ + PATH_ABEMPTY$),
        //simplified
    PATH_EMPTY$ = "(?!" + PCHAR$ + ")",
        PATH$ = subexp(PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$),
        QUERY$ = subexp(subexp(PCHAR$ + "|" + merge("[\\/\\?]", IPRIVATE$$)) + "*"),
        FRAGMENT$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"),
        HIER_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$),
        URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"),
        RELATIVE_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$),
        RELATIVE$ = subexp(RELATIVE_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"),
        URI_REFERENCE$ = subexp(URI$ + "|" + RELATIVE$),
        ABSOLUTE_URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?"),
        GENERIC_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
        RELATIVE_REF$ = "^(){0}" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
        ABSOLUTE_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?$",
        SAMEDOC_REF$ = "^" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
        AUTHORITY_REF$ = "^" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?$";
    return {
        NOT_SCHEME: new RegExp(merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
        NOT_USERINFO: new RegExp(merge("[^\\%\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_HOST: new RegExp(merge("[^\\%\\[\\]\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_PATH: new RegExp(merge("[^\\%\\/\\:\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_PATH_NOSCHEME: new RegExp(merge("[^\\%\\/\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_QUERY: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]", IPRIVATE$$), "g"),
        NOT_FRAGMENT: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
        ESCAPE: new RegExp(merge("[^]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        UNRESERVED: new RegExp(UNRESERVED$$, "g"),
        OTHER_CHARS: new RegExp(merge("[^\\%]", UNRESERVED$$, RESERVED$$), "g"),
        PCT_ENCODED: new RegExp(PCT_ENCODED$, "g"),
        IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
        IPV6ADDRESS: new RegExp("^\\[?(" + IPV6ADDRESS$ + ")" + subexp(subexp("\\%25|\\%(?!" + HEXDIG$$ + "{2})") + "(" + ZONEID$ + ")") + "?\\]?$") //RFC 6874, with relaxed parsing rules
    };
}
var URI_PROTOCOL = buildExps(false);

var IRI_PROTOCOL = buildExps(true);

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/** Highest positive signed 32-bit float value */

var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'

/** Regular expressions */
var regexPunycode = /^xn--/;
var regexNonASCII = /[^\0-\x7E]/; // non-ASCII chars
var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

/** Error messages */
var errors = {
	'overflow': 'Overflow: input needs wider integers to process',
	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	'invalid-input': 'Invalid input'
};

/** Convenience shortcuts */
var baseMinusTMin = base - tMin;
var floor = Math.floor;
var stringFromCharCode = String.fromCharCode;

/*--------------------------------------------------------------------------*/

/**
 * A generic error utility function.
 * @private
 * @param {String} type The error type.
 * @returns {Error} Throws a `RangeError` with the applicable error message.
 */
function error$1(type) {
	throw new RangeError(errors[type]);
}

/**
 * A generic `Array#map` utility function.
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The function that gets called for every array
 * item.
 * @returns {Array} A new array of values returned by the callback function.
 */
function map(array, fn) {
	var result = [];
	var length = array.length;
	while (length--) {
		result[length] = fn(array[length]);
	}
	return result;
}

/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 * @param {String} domain The domain name or email address.
 * @param {Function} callback The function that gets called for every
 * character.
 * @returns {Array} A new string of characters returned by the callback
 * function.
 */
function mapDomain(string, fn) {
	var parts = string.split('@');
	var result = '';
	if (parts.length > 1) {
		// In email addresses, only the domain name should be punycoded. Leave
		// the local part (i.e. everything up to `@`) intact.
		result = parts[0] + '@';
		string = parts[1];
	}
	// Avoid `split(regex)` for IE8 compatibility. See #17.
	string = string.replace(regexSeparators, '\x2E');
	var labels = string.split('.');
	var encoded = map(labels, fn).join('.');
	return result + encoded;
}

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 * @see `punycode.ucs2.encode`
 * @see <https://mathiasbynens.be/notes/javascript-encoding>
 * @memberOf punycode.ucs2
 * @name decode
 * @param {String} string The Unicode input string (UCS-2).
 * @returns {Array} The new array of code points.
 */
function ucs2decode(string) {
	var output = [];
	var counter = 0;
	var length = string.length;
	while (counter < length) {
		var value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// It's a high surrogate, and there is a next character.
			var extra = string.charCodeAt(counter++);
			if ((extra & 0xFC00) == 0xDC00) {
				// Low surrogate.
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				output.push(value);
				counter--;
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

/**
 * Creates a string based on an array of numeric code points.
 * @see `punycode.ucs2.decode`
 * @memberOf punycode.ucs2
 * @name encode
 * @param {Array} codePoints The array of numeric code points.
 * @returns {String} The new Unicode string (UCS-2).
 */
var ucs2encode = function ucs2encode(array) {
	return String.fromCodePoint.apply(String, toConsumableArray(array));
};

/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 * @private
 * @param {Number} codePoint The basic numeric code point value.
 * @returns {Number} The numeric value of a basic code point (for use in
 * representing integers) in the range `0` to `base - 1`, or `base` if
 * the code point does not represent a value.
 */
var basicToDigit = function basicToDigit(codePoint) {
	if (codePoint - 0x30 < 0x0A) {
		return codePoint - 0x16;
	}
	if (codePoint - 0x41 < 0x1A) {
		return codePoint - 0x41;
	}
	if (codePoint - 0x61 < 0x1A) {
		return codePoint - 0x61;
	}
	return base;
};

/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 * @private
 * @param {Number} digit The numeric value of a basic code point.
 * @returns {Number} The basic code point whose value (when used for
 * representing integers) is `digit`, which needs to be in the range
 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
 * used; else, the lowercase form is used. The behavior is undefined
 * if `flag` is non-zero and `digit` has no uppercase form.
 */
var digitToBasic = function digitToBasic(digit, flag) {
	//  0..25 map to ASCII a..z or A..Z
	// 26..35 map to ASCII 0..9
	return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */
var adapt = function adapt(delta, numPoints, firstTime) {
	var k = 0;
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	for (; /* no initialization */delta > baseMinusTMin * tMax >> 1; k += base) {
		delta = floor(delta / baseMinusTMin);
	}
	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 * @memberOf punycode
 * @param {String} input The Punycode string of ASCII-only symbols.
 * @returns {String} The resulting string of Unicode symbols.
 */
var decode = function decode(input) {
	// Don't use UCS-2.
	var output = [];
	var inputLength = input.length;
	var i = 0;
	var n = initialN;
	var bias = initialBias;

	// Handle the basic code points: let `basic` be the number of input code
	// points before the last delimiter, or `0` if there is none, then copy
	// the first basic code points to the output.

	var basic = input.lastIndexOf(delimiter);
	if (basic < 0) {
		basic = 0;
	}

	for (var j = 0; j < basic; ++j) {
		// if it's not a basic code point
		if (input.charCodeAt(j) >= 0x80) {
			error$1('not-basic');
		}
		output.push(input.charCodeAt(j));
	}

	// Main decoding loop: start just after the last delimiter if any basic code
	// points were copied; start at the beginning otherwise.

	for (var index = basic > 0 ? basic + 1 : 0; index < inputLength;) /* no final expression */{

		// `index` is the index of the next character to be consumed.
		// Decode a generalized variable-length integer into `delta`,
		// which gets added to `i`. The overflow checking is easier
		// if we increase `i` as we go, then subtract off its starting
		// value at the end to obtain `delta`.
		var oldi = i;
		for (var w = 1, k = base;; /* no condition */k += base) {

			if (index >= inputLength) {
				error$1('invalid-input');
			}

			var digit = basicToDigit(input.charCodeAt(index++));

			if (digit >= base || digit > floor((maxInt - i) / w)) {
				error$1('overflow');
			}

			i += digit * w;
			var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

			if (digit < t) {
				break;
			}

			var baseMinusT = base - t;
			if (w > floor(maxInt / baseMinusT)) {
				error$1('overflow');
			}

			w *= baseMinusT;
		}

		var out = output.length + 1;
		bias = adapt(i - oldi, out, oldi == 0);

		// `i` was supposed to wrap around from `out` to `0`,
		// incrementing `n` each time, so we'll fix that now:
		if (floor(i / out) > maxInt - n) {
			error$1('overflow');
		}

		n += floor(i / out);
		i %= out;

		// Insert `n` at position `i` of the output.
		output.splice(i++, 0, n);
	}

	return String.fromCodePoint.apply(String, output);
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 * @memberOf punycode
 * @param {String} input The string of Unicode symbols.
 * @returns {String} The resulting Punycode string of ASCII-only symbols.
 */
var encode = function encode(input) {
	var output = [];

	// Convert the input in UCS-2 to an array of Unicode code points.
	input = ucs2decode(input);

	// Cache the length.
	var inputLength = input.length;

	// Initialize the state.
	var n = initialN;
	var delta = 0;
	var bias = initialBias;

	// Handle the basic code points.
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = input[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _currentValue2 = _step.value;

			if (_currentValue2 < 0x80) {
				output.push(stringFromCharCode(_currentValue2));
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	var basicLength = output.length;
	var handledCPCount = basicLength;

	// `handledCPCount` is the number of code points that have been handled;
	// `basicLength` is the number of basic code points.

	// Finish the basic string with a delimiter unless it's empty.
	if (basicLength) {
		output.push(delimiter);
	}

	// Main encoding loop:
	while (handledCPCount < inputLength) {

		// All non-basic code points < n have been handled already. Find the next
		// larger one:
		var m = maxInt;
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = input[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var currentValue = _step2.value;

				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow.
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		var handledCPCountPlusOne = handledCPCount + 1;
		if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
			error$1('overflow');
		}

		delta += (m - n) * handledCPCountPlusOne;
		n = m;

		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = input[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var _currentValue = _step3.value;

				if (_currentValue < n && ++delta > maxInt) {
					error$1('overflow');
				}
				if (_currentValue == n) {
					// Represent delta as a generalized variable-length integer.
					var q = delta;
					for (var k = base;; /* no condition */k += base) {
						var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
						if (q < t) {
							break;
						}
						var qMinusT = q - t;
						var baseMinusT = base - t;
						output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		++delta;
		++n;
	}
	return output.join('');
};

/**
 * Converts a Punycode string representing a domain name or an email address
 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
 * it doesn't matter if you call it on a string that has already been
 * converted to Unicode.
 * @memberOf punycode
 * @param {String} input The Punycoded domain name or email address to
 * convert to Unicode.
 * @returns {String} The Unicode representation of the given Punycode
 * string.
 */
var toUnicode = function toUnicode(input) {
	return mapDomain(input, function (string) {
		return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
	});
};

/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted,
 * i.e. it doesn't matter if you call it with a domain that's already in
 * ASCII.
 * @memberOf punycode
 * @param {String} input The domain name or email address to convert, as a
 * Unicode string.
 * @returns {String} The Punycode representation of the given domain name or
 * email address.
 */
var toASCII = function toASCII(input) {
	return mapDomain(input, function (string) {
		return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
	});
};

/*--------------------------------------------------------------------------*/

/** Define the public API */
var punycode = {
	/**
  * A string representing the current Punycode.js version number.
  * @memberOf punycode
  * @type String
  */
	'version': '2.1.0',
	/**
  * An object of methods to convert from JavaScript's internal character
  * representation (UCS-2) to Unicode code points, and back.
  * @see <https://mathiasbynens.be/notes/javascript-encoding>
  * @memberOf punycode
  * @type Object
  */
	'ucs2': {
		'decode': ucs2decode,
		'encode': ucs2encode
	},
	'decode': decode,
	'encode': encode,
	'toASCII': toASCII,
	'toUnicode': toUnicode
};

/**
 * URI.js
 *
 * @fileoverview An RFC 3986 compliant, scheme extendable URI parsing/validating/resolving library for JavaScript.
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/uri-js
 */
/**
 * Copyright 2011 Gary Court. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY GARY COURT ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL GARY COURT OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Gary Court.
 */
var SCHEMES = {};
function pctEncChar(chr) {
    var c = chr.charCodeAt(0);
    var e = void 0;
    if (c < 16) e = "%0" + c.toString(16).toUpperCase();else if (c < 128) e = "%" + c.toString(16).toUpperCase();else if (c < 2048) e = "%" + (c >> 6 | 192).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();else e = "%" + (c >> 12 | 224).toString(16).toUpperCase() + "%" + (c >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
    return e;
}
function pctDecChars(str) {
    var newStr = "";
    var i = 0;
    var il = str.length;
    while (i < il) {
        var c = parseInt(str.substr(i + 1, 2), 16);
        if (c < 128) {
            newStr += String.fromCharCode(c);
            i += 3;
        } else if (c >= 194 && c < 224) {
            if (il - i >= 6) {
                var c2 = parseInt(str.substr(i + 4, 2), 16);
                newStr += String.fromCharCode((c & 31) << 6 | c2 & 63);
            } else {
                newStr += str.substr(i, 6);
            }
            i += 6;
        } else if (c >= 224) {
            if (il - i >= 9) {
                var _c = parseInt(str.substr(i + 4, 2), 16);
                var c3 = parseInt(str.substr(i + 7, 2), 16);
                newStr += String.fromCharCode((c & 15) << 12 | (_c & 63) << 6 | c3 & 63);
            } else {
                newStr += str.substr(i, 9);
            }
            i += 9;
        } else {
            newStr += str.substr(i, 3);
            i += 3;
        }
    }
    return newStr;
}
function _normalizeComponentEncoding(components, protocol) {
    function decodeUnreserved(str) {
        var decStr = pctDecChars(str);
        return !decStr.match(protocol.UNRESERVED) ? str : decStr;
    }
    if (components.scheme) components.scheme = String(components.scheme).replace(protocol.PCT_ENCODED, decodeUnreserved).toLowerCase().replace(protocol.NOT_SCHEME, "");
    if (components.userinfo !== undefined) components.userinfo = String(components.userinfo).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_USERINFO, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.host !== undefined) components.host = String(components.host).replace(protocol.PCT_ENCODED, decodeUnreserved).toLowerCase().replace(protocol.NOT_HOST, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.path !== undefined) components.path = String(components.path).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(components.scheme ? protocol.NOT_PATH : protocol.NOT_PATH_NOSCHEME, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.query !== undefined) components.query = String(components.query).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_QUERY, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.fragment !== undefined) components.fragment = String(components.fragment).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_FRAGMENT, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    return components;
}

function _stripLeadingZeros(str) {
    return str.replace(/^0*(.*)/, "$1") || "0";
}
function _normalizeIPv4(host, protocol) {
    var matches = host.match(protocol.IPV4ADDRESS) || [];

    var _matches = slicedToArray(matches, 2),
        address = _matches[1];

    if (address) {
        return address.split(".").map(_stripLeadingZeros).join(".");
    } else {
        return host;
    }
}
function _normalizeIPv6(host, protocol) {
    var matches = host.match(protocol.IPV6ADDRESS) || [];

    var _matches2 = slicedToArray(matches, 3),
        address = _matches2[1],
        zone = _matches2[2];

    if (address) {
        var _address$toLowerCase$ = address.toLowerCase().split('::').reverse(),
            _address$toLowerCase$2 = slicedToArray(_address$toLowerCase$, 2),
            last = _address$toLowerCase$2[0],
            first = _address$toLowerCase$2[1];

        var firstFields = first ? first.split(":").map(_stripLeadingZeros) : [];
        var lastFields = last.split(":").map(_stripLeadingZeros);
        var isLastFieldIPv4Address = protocol.IPV4ADDRESS.test(lastFields[lastFields.length - 1]);
        var fieldCount = isLastFieldIPv4Address ? 7 : 8;
        var lastFieldsStart = lastFields.length - fieldCount;
        var fields = Array(fieldCount);
        for (var x = 0; x < fieldCount; ++x) {
            fields[x] = firstFields[x] || lastFields[lastFieldsStart + x] || '';
        }
        if (isLastFieldIPv4Address) {
            fields[fieldCount - 1] = _normalizeIPv4(fields[fieldCount - 1], protocol);
        }
        var allZeroFields = fields.reduce(function (acc, field, index) {
            if (!field || field === "0") {
                var lastLongest = acc[acc.length - 1];
                if (lastLongest && lastLongest.index + lastLongest.length === index) {
                    lastLongest.length++;
                } else {
                    acc.push({ index: index, length: 1 });
                }
            }
            return acc;
        }, []);
        var longestZeroFields = allZeroFields.sort(function (a, b) {
            return b.length - a.length;
        })[0];
        var newHost = void 0;
        if (longestZeroFields && longestZeroFields.length > 1) {
            var newFirst = fields.slice(0, longestZeroFields.index);
            var newLast = fields.slice(longestZeroFields.index + longestZeroFields.length);
            newHost = newFirst.join(":") + "::" + newLast.join(":");
        } else {
            newHost = fields.join(":");
        }
        if (zone) {
            newHost += "%" + zone;
        }
        return newHost;
    } else {
        return host;
    }
}
var URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i;
var NO_MATCH_IS_UNDEFINED = "".match(/(){0}/)[1] === undefined;
function parse(uriString) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var components = {};
    var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
    if (options.reference === "suffix") uriString = (options.scheme ? options.scheme + ":" : "") + "//" + uriString;
    var matches = uriString.match(URI_PARSE);
    if (matches) {
        if (NO_MATCH_IS_UNDEFINED) {
            //store each component
            components.scheme = matches[1];
            components.userinfo = matches[3];
            components.host = matches[4];
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = matches[7];
            components.fragment = matches[8];
            //fix port number
            if (isNaN(components.port)) {
                components.port = matches[5];
            }
        } else {
            //IE FIX for improper RegExp matching
            //store each component
            components.scheme = matches[1] || undefined;
            components.userinfo = uriString.indexOf("@") !== -1 ? matches[3] : undefined;
            components.host = uriString.indexOf("//") !== -1 ? matches[4] : undefined;
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = uriString.indexOf("?") !== -1 ? matches[7] : undefined;
            components.fragment = uriString.indexOf("#") !== -1 ? matches[8] : undefined;
            //fix port number
            if (isNaN(components.port)) {
                components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches[4] : undefined;
            }
        }
        if (components.host) {
            //normalize IP hosts
            components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
        }
        //determine reference type
        if (components.scheme === undefined && components.userinfo === undefined && components.host === undefined && components.port === undefined && !components.path && components.query === undefined) {
            components.reference = "same-document";
        } else if (components.scheme === undefined) {
            components.reference = "relative";
        } else if (components.fragment === undefined) {
            components.reference = "absolute";
        } else {
            components.reference = "uri";
        }
        //check for reference errors
        if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
            components.error = components.error || "URI is not a " + options.reference + " reference.";
        }
        //find scheme handler
        var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
        //check if scheme can't handle IRIs
        if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
            //if host component is a domain name
            if (components.host && (options.domainHost || schemeHandler && schemeHandler.domainHost)) {
                //convert Unicode IDN -> ASCII IDN
                try {
                    components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
                } catch (e) {
                    components.error = components.error || "Host's domain name can not be converted to ASCII via punycode: " + e;
                }
            }
            //convert IRI -> URI
            _normalizeComponentEncoding(components, URI_PROTOCOL);
        } else {
            //normalize encodings
            _normalizeComponentEncoding(components, protocol);
        }
        //perform scheme specific parsing
        if (schemeHandler && schemeHandler.parse) {
            schemeHandler.parse(components, options);
        }
    } else {
        components.error = components.error || "URI can not be parsed.";
    }
    return components;
}

function _recomposeAuthority(components, options) {
    var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
    var uriTokens = [];
    if (components.userinfo !== undefined) {
        uriTokens.push(components.userinfo);
        uriTokens.push("@");
    }
    if (components.host !== undefined) {
        //normalize IP hosts, add brackets and escape zone separator for IPv6
        uriTokens.push(_normalizeIPv6(_normalizeIPv4(String(components.host), protocol), protocol).replace(protocol.IPV6ADDRESS, function (_, $1, $2) {
            return "[" + $1 + ($2 ? "%25" + $2 : "") + "]";
        }));
    }
    if (typeof components.port === "number") {
        uriTokens.push(":");
        uriTokens.push(components.port.toString(10));
    }
    return uriTokens.length ? uriTokens.join("") : undefined;
}

var RDS1 = /^\.\.?\//;
var RDS2 = /^\/\.(\/|$)/;
var RDS3 = /^\/\.\.(\/|$)/;
var RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/;
function removeDotSegments(input) {
    var output = [];
    while (input.length) {
        if (input.match(RDS1)) {
            input = input.replace(RDS1, "");
        } else if (input.match(RDS2)) {
            input = input.replace(RDS2, "/");
        } else if (input.match(RDS3)) {
            input = input.replace(RDS3, "/");
            output.pop();
        } else if (input === "." || input === "..") {
            input = "";
        } else {
            var im = input.match(RDS5);
            if (im) {
                var s = im[0];
                input = input.slice(s.length);
                output.push(s);
            } else {
                throw new Error("Unexpected dot segment condition");
            }
        }
    }
    return output.join("");
}

function serialize(components) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
    var uriTokens = [];
    //find scheme handler
    var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
    //perform scheme specific serialization
    if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(components, options);
    if (components.host) {
        //if host component is an IPv6 address
        if (protocol.IPV6ADDRESS.test(components.host)) {}
        //TODO: normalize IPv6 address as per RFC 5952

        //if host component is a domain name
        else if (options.domainHost || schemeHandler && schemeHandler.domainHost) {
                //convert IDN via punycode
                try {
                    components.host = !options.iri ? punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase()) : punycode.toUnicode(components.host);
                } catch (e) {
                    components.error = components.error || "Host's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
                }
            }
    }
    //normalize encoding
    _normalizeComponentEncoding(components, protocol);
    if (options.reference !== "suffix" && components.scheme) {
        uriTokens.push(components.scheme);
        uriTokens.push(":");
    }
    var authority = _recomposeAuthority(components, options);
    if (authority !== undefined) {
        if (options.reference !== "suffix") {
            uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (components.path && components.path.charAt(0) !== "/") {
            uriTokens.push("/");
        }
    }
    if (components.path !== undefined) {
        var s = components.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
            s = removeDotSegments(s);
        }
        if (authority === undefined) {
            s = s.replace(/^\/\//, "/%2F"); //don't allow the path to start with "//"
        }
        uriTokens.push(s);
    }
    if (components.query !== undefined) {
        uriTokens.push("?");
        uriTokens.push(components.query);
    }
    if (components.fragment !== undefined) {
        uriTokens.push("#");
        uriTokens.push(components.fragment);
    }
    return uriTokens.join(""); //merge tokens into a string
}

function resolveComponents(base, relative) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var skipNormalization = arguments[3];

    var target = {};
    if (!skipNormalization) {
        base = parse(serialize(base, options), options); //normalize base components
        relative = parse(serialize(relative, options), options); //normalize relative components
    }
    options = options || {};
    if (!options.tolerant && relative.scheme) {
        target.scheme = relative.scheme;
        //target.authority = relative.authority;
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || "");
        target.query = relative.query;
    } else {
        if (relative.userinfo !== undefined || relative.host !== undefined || relative.port !== undefined) {
            //target.authority = relative.authority;
            target.userinfo = relative.userinfo;
            target.host = relative.host;
            target.port = relative.port;
            target.path = removeDotSegments(relative.path || "");
            target.query = relative.query;
        } else {
            if (!relative.path) {
                target.path = base.path;
                if (relative.query !== undefined) {
                    target.query = relative.query;
                } else {
                    target.query = base.query;
                }
            } else {
                if (relative.path.charAt(0) === "/") {
                    target.path = removeDotSegments(relative.path);
                } else {
                    if ((base.userinfo !== undefined || base.host !== undefined || base.port !== undefined) && !base.path) {
                        target.path = "/" + relative.path;
                    } else if (!base.path) {
                        target.path = relative.path;
                    } else {
                        target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
                    }
                    target.path = removeDotSegments(target.path);
                }
                target.query = relative.query;
            }
            //target.authority = base.authority;
            target.userinfo = base.userinfo;
            target.host = base.host;
            target.port = base.port;
        }
        target.scheme = base.scheme;
    }
    target.fragment = relative.fragment;
    return target;
}

function resolve(baseURI, relativeURI, options) {
    var schemelessOptions = assign({ scheme: 'null' }, options);
    return serialize(resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true), schemelessOptions);
}

function normalize(uri, options) {
    if (typeof uri === "string") {
        uri = serialize(parse(uri, options), options);
    } else if (typeOf(uri) === "object") {
        uri = parse(serialize(uri, options), options);
    }
    return uri;
}

function equal(uriA, uriB, options) {
    if (typeof uriA === "string") {
        uriA = serialize(parse(uriA, options), options);
    } else if (typeOf(uriA) === "object") {
        uriA = serialize(uriA, options);
    }
    if (typeof uriB === "string") {
        uriB = serialize(parse(uriB, options), options);
    } else if (typeOf(uriB) === "object") {
        uriB = serialize(uriB, options);
    }
    return uriA === uriB;
}

function escapeComponent(str, options) {
    return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.ESCAPE : IRI_PROTOCOL.ESCAPE, pctEncChar);
}

function unescapeComponent(str, options) {
    return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.PCT_ENCODED : IRI_PROTOCOL.PCT_ENCODED, pctDecChars);
}

var handler = {
    scheme: "http",
    domainHost: true,
    parse: function parse(components, options) {
        //report missing host
        if (!components.host) {
            components.error = components.error || "HTTP URIs must have a host.";
        }
        return components;
    },
    serialize: function serialize(components, options) {
        //normalize the default port
        if (components.port === (String(components.scheme).toLowerCase() !== "https" ? 80 : 443) || components.port === "") {
            components.port = undefined;
        }
        //normalize the empty path
        if (!components.path) {
            components.path = "/";
        }
        //NOTE: We do not parse query strings for HTTP URIs
        //as WWW Form Url Encoded query strings are part of the HTML4+ spec,
        //and not the HTTP spec.
        return components;
    }
};

var handler$1 = {
    scheme: "https",
    domainHost: handler.domainHost,
    parse: handler.parse,
    serialize: handler.serialize
};

var O = {};
var isIRI = true;
//RFC 3986
var UNRESERVED$$ = "[A-Za-z0-9\\-\\.\\_\\~" + (isIRI ? "\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF" : "") + "]";
var HEXDIG$$ = "[0-9A-Fa-f]"; //case-insensitive
var PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$)); //expanded
//RFC 5322, except these symbols as per RFC 6068: @ : / ? # [ ] & ; =
//const ATEXT$$ = "[A-Za-z0-9\\!\\#\\$\\%\\&\\'\\*\\+\\-\\/\\=\\?\\^\\_\\`\\{\\|\\}\\~]";
//const WSP$$ = "[\\x20\\x09]";
//const OBS_QTEXT$$ = "[\\x01-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]";  //(%d1-8 / %d11-12 / %d14-31 / %d127)
//const QTEXT$$ = merge("[\\x21\\x23-\\x5B\\x5D-\\x7E]", OBS_QTEXT$$);  //%d33 / %d35-91 / %d93-126 / obs-qtext
//const VCHAR$$ = "[\\x21-\\x7E]";
//const WSP$$ = "[\\x20\\x09]";
//const OBS_QP$ = subexp("\\\\" + merge("[\\x00\\x0D\\x0A]", OBS_QTEXT$$));  //%d0 / CR / LF / obs-qtext
//const FWS$ = subexp(subexp(WSP$$ + "*" + "\\x0D\\x0A") + "?" + WSP$$ + "+");
//const QUOTED_PAIR$ = subexp(subexp("\\\\" + subexp(VCHAR$$ + "|" + WSP$$)) + "|" + OBS_QP$);
//const QUOTED_STRING$ = subexp('\\"' + subexp(FWS$ + "?" + QCONTENT$) + "*" + FWS$ + "?" + '\\"');
var ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]";
var QTEXT$$ = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]";
var VCHAR$$ = merge(QTEXT$$, "[\\\"\\\\]");
var SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]";
var UNRESERVED = new RegExp(UNRESERVED$$, "g");
var PCT_ENCODED = new RegExp(PCT_ENCODED$, "g");
var NOT_LOCAL_PART = new RegExp(merge("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$), "g");
var NOT_HFNAME = new RegExp(merge("[^]", UNRESERVED$$, SOME_DELIMS$$), "g");
var NOT_HFVALUE = NOT_HFNAME;
function decodeUnreserved(str) {
    var decStr = pctDecChars(str);
    return !decStr.match(UNRESERVED) ? str : decStr;
}
var handler$2 = {
    scheme: "mailto",
    parse: function parse$$1(components, options) {
        var mailtoComponents = components;
        var to = mailtoComponents.to = mailtoComponents.path ? mailtoComponents.path.split(",") : [];
        mailtoComponents.path = undefined;
        if (mailtoComponents.query) {
            var unknownHeaders = false;
            var headers = {};
            var hfields = mailtoComponents.query.split("&");
            for (var x = 0, xl = hfields.length; x < xl; ++x) {
                var hfield = hfields[x].split("=");
                switch (hfield[0]) {
                    case "to":
                        var toAddrs = hfield[1].split(",");
                        for (var _x = 0, _xl = toAddrs.length; _x < _xl; ++_x) {
                            to.push(toAddrs[_x]);
                        }
                        break;
                    case "subject":
                        mailtoComponents.subject = unescapeComponent(hfield[1], options);
                        break;
                    case "body":
                        mailtoComponents.body = unescapeComponent(hfield[1], options);
                        break;
                    default:
                        unknownHeaders = true;
                        headers[unescapeComponent(hfield[0], options)] = unescapeComponent(hfield[1], options);
                        break;
                }
            }
            if (unknownHeaders) mailtoComponents.headers = headers;
        }
        mailtoComponents.query = undefined;
        for (var _x2 = 0, _xl2 = to.length; _x2 < _xl2; ++_x2) {
            var addr = to[_x2].split("@");
            addr[0] = unescapeComponent(addr[0]);
            if (!options.unicodeSupport) {
                //convert Unicode IDN -> ASCII IDN
                try {
                    addr[1] = punycode.toASCII(unescapeComponent(addr[1], options).toLowerCase());
                } catch (e) {
                    mailtoComponents.error = mailtoComponents.error || "Email address's domain name can not be converted to ASCII via punycode: " + e;
                }
            } else {
                addr[1] = unescapeComponent(addr[1], options).toLowerCase();
            }
            to[_x2] = addr.join("@");
        }
        return mailtoComponents;
    },
    serialize: function serialize$$1(mailtoComponents, options) {
        var components = mailtoComponents;
        var to = toArray(mailtoComponents.to);
        if (to) {
            for (var x = 0, xl = to.length; x < xl; ++x) {
                var toAddr = String(to[x]);
                var atIdx = toAddr.lastIndexOf("@");
                var localPart = toAddr.slice(0, atIdx).replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_LOCAL_PART, pctEncChar);
                var domain = toAddr.slice(atIdx + 1);
                //convert IDN via punycode
                try {
                    domain = !options.iri ? punycode.toASCII(unescapeComponent(domain, options).toLowerCase()) : punycode.toUnicode(domain);
                } catch (e) {
                    components.error = components.error || "Email address's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
                }
                to[x] = localPart + "@" + domain;
            }
            components.path = to.join(",");
        }
        var headers = mailtoComponents.headers = mailtoComponents.headers || {};
        if (mailtoComponents.subject) headers["subject"] = mailtoComponents.subject;
        if (mailtoComponents.body) headers["body"] = mailtoComponents.body;
        var fields = [];
        for (var name in headers) {
            if (headers[name] !== O[name]) {
                fields.push(name.replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFNAME, pctEncChar) + "=" + headers[name].replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFVALUE, pctEncChar));
            }
        }
        if (fields.length) {
            components.query = fields.join("&");
        }
        return components;
    }
};

var URN_PARSE = /^([^\:]+)\:(.*)/;
//RFC 2141
var handler$3 = {
    scheme: "urn",
    parse: function parse$$1(components, options) {
        var matches = components.path && components.path.match(URN_PARSE);
        var urnComponents = components;
        if (matches) {
            var scheme = options.scheme || urnComponents.scheme || "urn";
            var nid = matches[1].toLowerCase();
            var nss = matches[2];
            var urnScheme = scheme + ":" + (options.nid || nid);
            var schemeHandler = SCHEMES[urnScheme];
            urnComponents.nid = nid;
            urnComponents.nss = nss;
            urnComponents.path = undefined;
            if (schemeHandler) {
                urnComponents = schemeHandler.parse(urnComponents, options);
            }
        } else {
            urnComponents.error = urnComponents.error || "URN can not be parsed.";
        }
        return urnComponents;
    },
    serialize: function serialize$$1(urnComponents, options) {
        var scheme = options.scheme || urnComponents.scheme || "urn";
        var nid = urnComponents.nid;
        var urnScheme = scheme + ":" + (options.nid || nid);
        var schemeHandler = SCHEMES[urnScheme];
        if (schemeHandler) {
            urnComponents = schemeHandler.serialize(urnComponents, options);
        }
        var uriComponents = urnComponents;
        var nss = urnComponents.nss;
        uriComponents.path = (nid || options.nid) + ":" + nss;
        return uriComponents;
    }
};

var UUID = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/;
//RFC 4122
var handler$4 = {
    scheme: "urn:uuid",
    parse: function parse(urnComponents, options) {
        var uuidComponents = urnComponents;
        uuidComponents.uuid = uuidComponents.nss;
        uuidComponents.nss = undefined;
        if (!options.tolerant && (!uuidComponents.uuid || !uuidComponents.uuid.match(UUID))) {
            uuidComponents.error = uuidComponents.error || "UUID is not valid.";
        }
        return uuidComponents;
    },
    serialize: function serialize(uuidComponents, options) {
        var urnComponents = uuidComponents;
        //normalize UUID
        urnComponents.nss = (uuidComponents.uuid || "").toLowerCase();
        return urnComponents;
    }
};

SCHEMES[handler.scheme] = handler;
SCHEMES[handler$1.scheme] = handler$1;
SCHEMES[handler$2.scheme] = handler$2;
SCHEMES[handler$3.scheme] = handler$3;
SCHEMES[handler$4.scheme] = handler$4;

exports.SCHEMES = SCHEMES;
exports.pctEncChar = pctEncChar;
exports.pctDecChars = pctDecChars;
exports.parse = parse;
exports.removeDotSegments = removeDotSegments;
exports.serialize = serialize;
exports.resolveComponents = resolveComponents;
exports.resolve = resolve;
exports.normalize = normalize;
exports.equal = equal;
exports.escapeComponent = escapeComponent;
exports.unescapeComponent = unescapeComponent;

Object.defineProperty(exports, '__esModule', { value: true });

})));


},{}],232:[function(require,module,exports){
/*!
 * use <https://github.com/jonschlinkert/use>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

module.exports = function base(app, options) {
  if (!isObject(app) && typeof app !== 'function') {
    throw new TypeError('expected an object or function');
  }

  var opts = isObject(options) ? options : {};
  var prop = typeof opts.prop === 'string' ? opts.prop : 'fns';
  if (!Array.isArray(app[prop])) {
    define(app, prop, []);
  }

  /**
   * Define a plugin function to be passed to use. The only
   * parameter exposed to the plugin is `app`, the object or function.
   * passed to `use(app)`. `app` is also exposed as `this` in plugins.
   *
   * Additionally, **if a plugin returns a function, the function will
   * be pushed onto the `fns` array**, allowing the plugin to be
   * called at a later point by the `run` method.
   *
   * ```js
   * var use = require('use');
   *
   * // define a plugin
   * function foo(app) {
   *   // do stuff
   * }
   *
   * var app = function(){};
   * use(app);
   *
   * // register plugins
   * app.use(foo);
   * app.use(bar);
   * app.use(baz);
   * ```
   * @name .use
   * @param {Function} `fn` plugin function to call
   * @api public
   */

  define(app, 'use', use);

  /**
   * Run all plugins on `fns`. Any plugin that returns a function
   * when called by `use` is pushed onto the `fns` array.
   *
   * ```js
   * var config = {};
   * app.run(config);
   * ```
   * @name .run
   * @param {Object} `value` Object to be modified by plugins.
   * @return {Object} Returns the object passed to `run`
   * @api public
   */

  define(app, 'run', function(val) {
    if (!isObject(val)) return;

    if (!val.use || !val.run) {
      define(val, prop, val[prop] || []);
      define(val, 'use', use);
    }

    if (!val[prop] || val[prop].indexOf(base) === -1) {
      val.use(base);
    }

    var self = this || app;
    var fns = self[prop];
    var len = fns.length;
    var idx = -1;

    while (++idx < len) {
      val.use(fns[idx]);
    }
    return val;
  });

  /**
   * Call plugin `fn`. If a function is returned push it into the
   * `fns` array to be called by the `run` method.
   */

  function use(type, fn, options) {
    var offset = 1;

    if (typeof type === 'string' || Array.isArray(type)) {
      fn = wrap(type, fn);
      offset++;
    } else {
      options = fn;
      fn = type;
    }

    if (typeof fn !== 'function') {
      throw new TypeError('expected a function');
    }

    var self = this || app;
    var fns = self[prop];

    var args = [].slice.call(arguments, offset);
    args.unshift(self);

    if (typeof opts.hook === 'function') {
      opts.hook.apply(self, args);
    }

    var val = fn.apply(self, args);
    if (typeof val === 'function' && fns.indexOf(val) === -1) {
      fns.push(val);
    }
    return self;
  }

  /**
   * Wrap a named plugin function so that it's only called on objects of the
   * given `type`
   *
   * @param {String} `type`
   * @param {Function} `fn` Plugin function
   * @return {Function}
   */

  function wrap(type, fn) {
    return function plugin() {
      return this.type === type ? fn.apply(this, arguments) : plugin;
    };
  }

  return app;
};

function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

function define(obj, key, val) {
  Object.defineProperty(obj, key, {
    configurable: true,
    writable: true,
    value: val
  });
}

},{}]},{},[8]);
