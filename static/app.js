(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __require = (x) => {
    if (typeof require !== "undefined")
      return require(x);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  };
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // node_modules/localforage/dist/localforage.js
  var require_localforage = __commonJS({
    "node_modules/localforage/dist/localforage.js"(exports, module) {
      (function(f) {
        if (typeof exports === "object" && typeof module !== "undefined") {
          module.exports = f();
        } else if (typeof define === "function" && define.amd) {
          define([], f);
        } else {
          var g;
          if (typeof window !== "undefined") {
            g = window;
          } else if (typeof global !== "undefined") {
            g = global;
          } else if (typeof self !== "undefined") {
            g = self;
          } else {
            g = this;
          }
          g.localforage = f();
        }
      })(function() {
        var define2, module2, exports2;
        return function e(t, n, r) {
          function s(o2, u) {
            if (!n[o2]) {
              if (!t[o2]) {
                var a = typeof __require == "function" && __require;
                if (!u && a)
                  return a(o2, true);
                if (i)
                  return i(o2, true);
                var f = new Error("Cannot find module '" + o2 + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
              }
              var l = n[o2] = { exports: {} };
              t[o2][0].call(l.exports, function(e2) {
                var n2 = t[o2][1][e2];
                return s(n2 ? n2 : e2);
              }, l, l.exports, e, t, n, r);
            }
            return n[o2].exports;
          }
          var i = typeof __require == "function" && __require;
          for (var o = 0; o < r.length; o++)
            s(r[o]);
          return s;
        }({ 1: [function(_dereq_, module3, exports3) {
          (function(global2) {
            "use strict";
            var Mutation = global2.MutationObserver || global2.WebKitMutationObserver;
            var scheduleDrain;
            {
              if (Mutation) {
                var called = 0;
                var observer = new Mutation(nextTick);
                var element2 = global2.document.createTextNode("");
                observer.observe(element2, {
                  characterData: true
                });
                scheduleDrain = function() {
                  element2.data = called = ++called % 2;
                };
              } else if (!global2.setImmediate && typeof global2.MessageChannel !== "undefined") {
                var channel = new global2.MessageChannel();
                channel.port1.onmessage = nextTick;
                scheduleDrain = function() {
                  channel.port2.postMessage(0);
                };
              } else if ("document" in global2 && "onreadystatechange" in global2.document.createElement("script")) {
                scheduleDrain = function() {
                  var scriptEl = global2.document.createElement("script");
                  scriptEl.onreadystatechange = function() {
                    nextTick();
                    scriptEl.onreadystatechange = null;
                    scriptEl.parentNode.removeChild(scriptEl);
                    scriptEl = null;
                  };
                  global2.document.documentElement.appendChild(scriptEl);
                };
              } else {
                scheduleDrain = function() {
                  setTimeout(nextTick, 0);
                };
              }
            }
            var draining;
            var queue = [];
            function nextTick() {
              draining = true;
              var i, oldQueue;
              var len = queue.length;
              while (len) {
                oldQueue = queue;
                queue = [];
                i = -1;
                while (++i < len) {
                  oldQueue[i]();
                }
                len = queue.length;
              }
              draining = false;
            }
            module3.exports = immediate;
            function immediate(task) {
              if (queue.push(task) === 1 && !draining) {
                scheduleDrain();
              }
            }
          }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {}], 2: [function(_dereq_, module3, exports3) {
          "use strict";
          var immediate = _dereq_(1);
          function INTERNAL() {
          }
          var handlers = {};
          var REJECTED = ["REJECTED"];
          var FULFILLED = ["FULFILLED"];
          var PENDING = ["PENDING"];
          module3.exports = Promise2;
          function Promise2(resolver) {
            if (typeof resolver !== "function") {
              throw new TypeError("resolver must be a function");
            }
            this.state = PENDING;
            this.queue = [];
            this.outcome = void 0;
            if (resolver !== INTERNAL) {
              safelyResolveThenable(this, resolver);
            }
          }
          Promise2.prototype["catch"] = function(onRejected) {
            return this.then(null, onRejected);
          };
          Promise2.prototype.then = function(onFulfilled, onRejected) {
            if (typeof onFulfilled !== "function" && this.state === FULFILLED || typeof onRejected !== "function" && this.state === REJECTED) {
              return this;
            }
            var promise = new this.constructor(INTERNAL);
            if (this.state !== PENDING) {
              var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
              unwrap(promise, resolver, this.outcome);
            } else {
              this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
            }
            return promise;
          };
          function QueueItem(promise, onFulfilled, onRejected) {
            this.promise = promise;
            if (typeof onFulfilled === "function") {
              this.onFulfilled = onFulfilled;
              this.callFulfilled = this.otherCallFulfilled;
            }
            if (typeof onRejected === "function") {
              this.onRejected = onRejected;
              this.callRejected = this.otherCallRejected;
            }
          }
          QueueItem.prototype.callFulfilled = function(value) {
            handlers.resolve(this.promise, value);
          };
          QueueItem.prototype.otherCallFulfilled = function(value) {
            unwrap(this.promise, this.onFulfilled, value);
          };
          QueueItem.prototype.callRejected = function(value) {
            handlers.reject(this.promise, value);
          };
          QueueItem.prototype.otherCallRejected = function(value) {
            unwrap(this.promise, this.onRejected, value);
          };
          function unwrap(promise, func, value) {
            immediate(function() {
              var returnValue;
              try {
                returnValue = func(value);
              } catch (e) {
                return handlers.reject(promise, e);
              }
              if (returnValue === promise) {
                handlers.reject(promise, new TypeError("Cannot resolve promise with itself"));
              } else {
                handlers.resolve(promise, returnValue);
              }
            });
          }
          handlers.resolve = function(self2, value) {
            var result = tryCatch(getThen, value);
            if (result.status === "error") {
              return handlers.reject(self2, result.value);
            }
            var thenable = result.value;
            if (thenable) {
              safelyResolveThenable(self2, thenable);
            } else {
              self2.state = FULFILLED;
              self2.outcome = value;
              var i = -1;
              var len = self2.queue.length;
              while (++i < len) {
                self2.queue[i].callFulfilled(value);
              }
            }
            return self2;
          };
          handlers.reject = function(self2, error) {
            self2.state = REJECTED;
            self2.outcome = error;
            var i = -1;
            var len = self2.queue.length;
            while (++i < len) {
              self2.queue[i].callRejected(error);
            }
            return self2;
          };
          function getThen(obj) {
            var then = obj && obj.then;
            if (obj && (typeof obj === "object" || typeof obj === "function") && typeof then === "function") {
              return function appyThen() {
                then.apply(obj, arguments);
              };
            }
          }
          function safelyResolveThenable(self2, thenable) {
            var called = false;
            function onError(value) {
              if (called) {
                return;
              }
              called = true;
              handlers.reject(self2, value);
            }
            function onSuccess(value) {
              if (called) {
                return;
              }
              called = true;
              handlers.resolve(self2, value);
            }
            function tryToUnwrap() {
              thenable(onSuccess, onError);
            }
            var result = tryCatch(tryToUnwrap);
            if (result.status === "error") {
              onError(result.value);
            }
          }
          function tryCatch(func, value) {
            var out = {};
            try {
              out.value = func(value);
              out.status = "success";
            } catch (e) {
              out.status = "error";
              out.value = e;
            }
            return out;
          }
          Promise2.resolve = resolve;
          function resolve(value) {
            if (value instanceof this) {
              return value;
            }
            return handlers.resolve(new this(INTERNAL), value);
          }
          Promise2.reject = reject;
          function reject(reason) {
            var promise = new this(INTERNAL);
            return handlers.reject(promise, reason);
          }
          Promise2.all = all;
          function all(iterable) {
            var self2 = this;
            if (Object.prototype.toString.call(iterable) !== "[object Array]") {
              return this.reject(new TypeError("must be an array"));
            }
            var len = iterable.length;
            var called = false;
            if (!len) {
              return this.resolve([]);
            }
            var values = new Array(len);
            var resolved = 0;
            var i = -1;
            var promise = new this(INTERNAL);
            while (++i < len) {
              allResolver(iterable[i], i);
            }
            return promise;
            function allResolver(value, i2) {
              self2.resolve(value).then(resolveFromAll, function(error) {
                if (!called) {
                  called = true;
                  handlers.reject(promise, error);
                }
              });
              function resolveFromAll(outValue) {
                values[i2] = outValue;
                if (++resolved === len && !called) {
                  called = true;
                  handlers.resolve(promise, values);
                }
              }
            }
          }
          Promise2.race = race;
          function race(iterable) {
            var self2 = this;
            if (Object.prototype.toString.call(iterable) !== "[object Array]") {
              return this.reject(new TypeError("must be an array"));
            }
            var len = iterable.length;
            var called = false;
            if (!len) {
              return this.resolve([]);
            }
            var i = -1;
            var promise = new this(INTERNAL);
            while (++i < len) {
              resolver(iterable[i]);
            }
            return promise;
            function resolver(value) {
              self2.resolve(value).then(function(response) {
                if (!called) {
                  called = true;
                  handlers.resolve(promise, response);
                }
              }, function(error) {
                if (!called) {
                  called = true;
                  handlers.reject(promise, error);
                }
              });
            }
          }
        }, { "1": 1 }], 3: [function(_dereq_, module3, exports3) {
          (function(global2) {
            "use strict";
            if (typeof global2.Promise !== "function") {
              global2.Promise = _dereq_(2);
            }
          }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, { "2": 2 }], 4: [function(_dereq_, module3, exports3) {
          "use strict";
          var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function(obj) {
            return typeof obj;
          } : function(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
          };
          function _classCallCheck(instance15, Constructor) {
            if (!(instance15 instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }
          function getIDB() {
            try {
              if (typeof indexedDB !== "undefined") {
                return indexedDB;
              }
              if (typeof webkitIndexedDB !== "undefined") {
                return webkitIndexedDB;
              }
              if (typeof mozIndexedDB !== "undefined") {
                return mozIndexedDB;
              }
              if (typeof OIndexedDB !== "undefined") {
                return OIndexedDB;
              }
              if (typeof msIndexedDB !== "undefined") {
                return msIndexedDB;
              }
            } catch (e) {
              return;
            }
          }
          var idb = getIDB();
          function isIndexedDBValid() {
            try {
              if (!idb || !idb.open) {
                return false;
              }
              var isSafari = typeof openDatabase !== "undefined" && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);
              var hasFetch = typeof fetch === "function" && fetch.toString().indexOf("[native code") !== -1;
              return (!isSafari || hasFetch) && typeof indexedDB !== "undefined" && typeof IDBKeyRange !== "undefined";
            } catch (e) {
              return false;
            }
          }
          function createBlob(parts, properties) {
            parts = parts || [];
            properties = properties || {};
            try {
              return new Blob(parts, properties);
            } catch (e) {
              if (e.name !== "TypeError") {
                throw e;
              }
              var Builder = typeof BlobBuilder !== "undefined" ? BlobBuilder : typeof MSBlobBuilder !== "undefined" ? MSBlobBuilder : typeof MozBlobBuilder !== "undefined" ? MozBlobBuilder : WebKitBlobBuilder;
              var builder = new Builder();
              for (var i = 0; i < parts.length; i += 1) {
                builder.append(parts[i]);
              }
              return builder.getBlob(properties.type);
            }
          }
          if (typeof Promise === "undefined") {
            _dereq_(3);
          }
          var Promise$1 = Promise;
          function executeCallback(promise, callback) {
            if (callback) {
              promise.then(function(result) {
                callback(null, result);
              }, function(error) {
                callback(error);
              });
            }
          }
          function executeTwoCallbacks(promise, callback, errorCallback) {
            if (typeof callback === "function") {
              promise.then(callback);
            }
            if (typeof errorCallback === "function") {
              promise["catch"](errorCallback);
            }
          }
          function normalizeKey(key2) {
            if (typeof key2 !== "string") {
              console.warn(key2 + " used as a key, but it is not a string.");
              key2 = String(key2);
            }
            return key2;
          }
          function getCallback() {
            if (arguments.length && typeof arguments[arguments.length - 1] === "function") {
              return arguments[arguments.length - 1];
            }
          }
          var DETECT_BLOB_SUPPORT_STORE = "local-forage-detect-blob-support";
          var supportsBlobs = void 0;
          var dbContexts = {};
          var toString = Object.prototype.toString;
          var READ_ONLY = "readonly";
          var READ_WRITE = "readwrite";
          function _binStringToArrayBuffer(bin) {
            var length2 = bin.length;
            var buf = new ArrayBuffer(length2);
            var arr = new Uint8Array(buf);
            for (var i = 0; i < length2; i++) {
              arr[i] = bin.charCodeAt(i);
            }
            return buf;
          }
          function _checkBlobSupportWithoutCaching(idb2) {
            return new Promise$1(function(resolve) {
              var txn = idb2.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
              var blob = createBlob([""]);
              txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, "key");
              txn.onabort = function(e) {
                e.preventDefault();
                e.stopPropagation();
                resolve(false);
              };
              txn.oncomplete = function() {
                var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
                var matchedEdge = navigator.userAgent.match(/Edge\//);
                resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
              };
            })["catch"](function() {
              return false;
            });
          }
          function _checkBlobSupport(idb2) {
            if (typeof supportsBlobs === "boolean") {
              return Promise$1.resolve(supportsBlobs);
            }
            return _checkBlobSupportWithoutCaching(idb2).then(function(value) {
              supportsBlobs = value;
              return supportsBlobs;
            });
          }
          function _deferReadiness(dbInfo) {
            var dbContext = dbContexts[dbInfo.name];
            var deferredOperation = {};
            deferredOperation.promise = new Promise$1(function(resolve, reject) {
              deferredOperation.resolve = resolve;
              deferredOperation.reject = reject;
            });
            dbContext.deferredOperations.push(deferredOperation);
            if (!dbContext.dbReady) {
              dbContext.dbReady = deferredOperation.promise;
            } else {
              dbContext.dbReady = dbContext.dbReady.then(function() {
                return deferredOperation.promise;
              });
            }
          }
          function _advanceReadiness(dbInfo) {
            var dbContext = dbContexts[dbInfo.name];
            var deferredOperation = dbContext.deferredOperations.pop();
            if (deferredOperation) {
              deferredOperation.resolve();
              return deferredOperation.promise;
            }
          }
          function _rejectReadiness(dbInfo, err) {
            var dbContext = dbContexts[dbInfo.name];
            var deferredOperation = dbContext.deferredOperations.pop();
            if (deferredOperation) {
              deferredOperation.reject(err);
              return deferredOperation.promise;
            }
          }
          function _getConnection(dbInfo, upgradeNeeded) {
            return new Promise$1(function(resolve, reject) {
              dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();
              if (dbInfo.db) {
                if (upgradeNeeded) {
                  _deferReadiness(dbInfo);
                  dbInfo.db.close();
                } else {
                  return resolve(dbInfo.db);
                }
              }
              var dbArgs = [dbInfo.name];
              if (upgradeNeeded) {
                dbArgs.push(dbInfo.version);
              }
              var openreq = idb.open.apply(idb, dbArgs);
              if (upgradeNeeded) {
                openreq.onupgradeneeded = function(e) {
                  var db = openreq.result;
                  try {
                    db.createObjectStore(dbInfo.storeName);
                    if (e.oldVersion <= 1) {
                      db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
                    }
                  } catch (ex) {
                    if (ex.name === "ConstraintError") {
                      console.warn('The database "' + dbInfo.name + '" has been upgraded from version ' + e.oldVersion + " to version " + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
                    } else {
                      throw ex;
                    }
                  }
                };
              }
              openreq.onerror = function(e) {
                e.preventDefault();
                reject(openreq.error);
              };
              openreq.onsuccess = function() {
                var db = openreq.result;
                db.onversionchange = function(e) {
                  e.target.close();
                };
                resolve(db);
                _advanceReadiness(dbInfo);
              };
            });
          }
          function _getOriginalConnection(dbInfo) {
            return _getConnection(dbInfo, false);
          }
          function _getUpgradedConnection(dbInfo) {
            return _getConnection(dbInfo, true);
          }
          function _isUpgradeNeeded(dbInfo, defaultVersion) {
            if (!dbInfo.db) {
              return true;
            }
            var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
            var isDowngrade = dbInfo.version < dbInfo.db.version;
            var isUpgrade = dbInfo.version > dbInfo.db.version;
            if (isDowngrade) {
              if (dbInfo.version !== defaultVersion) {
                console.warn('The database "' + dbInfo.name + `" can't be downgraded from version ` + dbInfo.db.version + " to version " + dbInfo.version + ".");
              }
              dbInfo.version = dbInfo.db.version;
            }
            if (isUpgrade || isNewStore) {
              if (isNewStore) {
                var incVersion = dbInfo.db.version + 1;
                if (incVersion > dbInfo.version) {
                  dbInfo.version = incVersion;
                }
              }
              return true;
            }
            return false;
          }
          function _encodeBlob(blob) {
            return new Promise$1(function(resolve, reject) {
              var reader = new FileReader();
              reader.onerror = reject;
              reader.onloadend = function(e) {
                var base64 = btoa(e.target.result || "");
                resolve({
                  __local_forage_encoded_blob: true,
                  data: base64,
                  type: blob.type
                });
              };
              reader.readAsBinaryString(blob);
            });
          }
          function _decodeBlob(encodedBlob) {
            var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
            return createBlob([arrayBuff], { type: encodedBlob.type });
          }
          function _isEncodedBlob(value) {
            return value && value.__local_forage_encoded_blob;
          }
          function _fullyReady(callback) {
            var self2 = this;
            var promise = self2._initReady().then(function() {
              var dbContext = dbContexts[self2._dbInfo.name];
              if (dbContext && dbContext.dbReady) {
                return dbContext.dbReady;
              }
            });
            executeTwoCallbacks(promise, callback, callback);
            return promise;
          }
          function _tryReconnect(dbInfo) {
            _deferReadiness(dbInfo);
            var dbContext = dbContexts[dbInfo.name];
            var forages = dbContext.forages;
            for (var i = 0; i < forages.length; i++) {
              var forage = forages[i];
              if (forage._dbInfo.db) {
                forage._dbInfo.db.close();
                forage._dbInfo.db = null;
              }
            }
            dbInfo.db = null;
            return _getOriginalConnection(dbInfo).then(function(db) {
              dbInfo.db = db;
              if (_isUpgradeNeeded(dbInfo)) {
                return _getUpgradedConnection(dbInfo);
              }
              return db;
            }).then(function(db) {
              dbInfo.db = dbContext.db = db;
              for (var i2 = 0; i2 < forages.length; i2++) {
                forages[i2]._dbInfo.db = db;
              }
            })["catch"](function(err) {
              _rejectReadiness(dbInfo, err);
              throw err;
            });
          }
          function createTransaction(dbInfo, mode, callback, retries) {
            if (retries === void 0) {
              retries = 1;
            }
            try {
              var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
              callback(null, tx);
            } catch (err) {
              if (retries > 0 && (!dbInfo.db || err.name === "InvalidStateError" || err.name === "NotFoundError")) {
                return Promise$1.resolve().then(function() {
                  if (!dbInfo.db || err.name === "NotFoundError" && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
                    if (dbInfo.db) {
                      dbInfo.version = dbInfo.db.version + 1;
                    }
                    return _getUpgradedConnection(dbInfo);
                  }
                }).then(function() {
                  return _tryReconnect(dbInfo).then(function() {
                    createTransaction(dbInfo, mode, callback, retries - 1);
                  });
                })["catch"](callback);
              }
              callback(err);
            }
          }
          function createDbContext() {
            return {
              forages: [],
              db: null,
              dbReady: null,
              deferredOperations: []
            };
          }
          function _initStorage(options) {
            var self2 = this;
            var dbInfo = {
              db: null
            };
            if (options) {
              for (var i in options) {
                dbInfo[i] = options[i];
              }
            }
            var dbContext = dbContexts[dbInfo.name];
            if (!dbContext) {
              dbContext = createDbContext();
              dbContexts[dbInfo.name] = dbContext;
            }
            dbContext.forages.push(self2);
            if (!self2._initReady) {
              self2._initReady = self2.ready;
              self2.ready = _fullyReady;
            }
            var initPromises = [];
            function ignoreErrors() {
              return Promise$1.resolve();
            }
            for (var j = 0; j < dbContext.forages.length; j++) {
              var forage = dbContext.forages[j];
              if (forage !== self2) {
                initPromises.push(forage._initReady()["catch"](ignoreErrors));
              }
            }
            var forages = dbContext.forages.slice(0);
            return Promise$1.all(initPromises).then(function() {
              dbInfo.db = dbContext.db;
              return _getOriginalConnection(dbInfo);
            }).then(function(db) {
              dbInfo.db = db;
              if (_isUpgradeNeeded(dbInfo, self2._defaultConfig.version)) {
                return _getUpgradedConnection(dbInfo);
              }
              return db;
            }).then(function(db) {
              dbInfo.db = dbContext.db = db;
              self2._dbInfo = dbInfo;
              for (var k = 0; k < forages.length; k++) {
                var forage2 = forages[k];
                if (forage2 !== self2) {
                  forage2._dbInfo.db = dbInfo.db;
                  forage2._dbInfo.version = dbInfo.version;
                }
              }
            });
          }
          function getItem(key2, callback) {
            var self2 = this;
            key2 = normalizeKey(key2);
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
                  if (err) {
                    return reject(err);
                  }
                  try {
                    var store = transaction.objectStore(self2._dbInfo.storeName);
                    var req = store.get(key2);
                    req.onsuccess = function() {
                      var value = req.result;
                      if (value === void 0) {
                        value = null;
                      }
                      if (_isEncodedBlob(value)) {
                        value = _decodeBlob(value);
                      }
                      resolve(value);
                    };
                    req.onerror = function() {
                      reject(req.error);
                    };
                  } catch (e) {
                    reject(e);
                  }
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function iterate(iterator, callback) {
            var self2 = this;
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
                  if (err) {
                    return reject(err);
                  }
                  try {
                    var store = transaction.objectStore(self2._dbInfo.storeName);
                    var req = store.openCursor();
                    var iterationNumber = 1;
                    req.onsuccess = function() {
                      var cursor = req.result;
                      if (cursor) {
                        var value = cursor.value;
                        if (_isEncodedBlob(value)) {
                          value = _decodeBlob(value);
                        }
                        var result = iterator(value, cursor.key, iterationNumber++);
                        if (result !== void 0) {
                          resolve(result);
                        } else {
                          cursor["continue"]();
                        }
                      } else {
                        resolve();
                      }
                    };
                    req.onerror = function() {
                      reject(req.error);
                    };
                  } catch (e) {
                    reject(e);
                  }
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function setItem(key2, value, callback) {
            var self2 = this;
            key2 = normalizeKey(key2);
            var promise = new Promise$1(function(resolve, reject) {
              var dbInfo;
              self2.ready().then(function() {
                dbInfo = self2._dbInfo;
                if (toString.call(value) === "[object Blob]") {
                  return _checkBlobSupport(dbInfo.db).then(function(blobSupport) {
                    if (blobSupport) {
                      return value;
                    }
                    return _encodeBlob(value);
                  });
                }
                return value;
              }).then(function(value2) {
                createTransaction(self2._dbInfo, READ_WRITE, function(err, transaction) {
                  if (err) {
                    return reject(err);
                  }
                  try {
                    var store = transaction.objectStore(self2._dbInfo.storeName);
                    if (value2 === null) {
                      value2 = void 0;
                    }
                    var req = store.put(value2, key2);
                    transaction.oncomplete = function() {
                      if (value2 === void 0) {
                        value2 = null;
                      }
                      resolve(value2);
                    };
                    transaction.onabort = transaction.onerror = function() {
                      var err2 = req.error ? req.error : req.transaction.error;
                      reject(err2);
                    };
                  } catch (e) {
                    reject(e);
                  }
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function removeItem(key2, callback) {
            var self2 = this;
            key2 = normalizeKey(key2);
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                createTransaction(self2._dbInfo, READ_WRITE, function(err, transaction) {
                  if (err) {
                    return reject(err);
                  }
                  try {
                    var store = transaction.objectStore(self2._dbInfo.storeName);
                    var req = store["delete"](key2);
                    transaction.oncomplete = function() {
                      resolve();
                    };
                    transaction.onerror = function() {
                      reject(req.error);
                    };
                    transaction.onabort = function() {
                      var err2 = req.error ? req.error : req.transaction.error;
                      reject(err2);
                    };
                  } catch (e) {
                    reject(e);
                  }
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function clear(callback) {
            var self2 = this;
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                createTransaction(self2._dbInfo, READ_WRITE, function(err, transaction) {
                  if (err) {
                    return reject(err);
                  }
                  try {
                    var store = transaction.objectStore(self2._dbInfo.storeName);
                    var req = store.clear();
                    transaction.oncomplete = function() {
                      resolve();
                    };
                    transaction.onabort = transaction.onerror = function() {
                      var err2 = req.error ? req.error : req.transaction.error;
                      reject(err2);
                    };
                  } catch (e) {
                    reject(e);
                  }
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function length(callback) {
            var self2 = this;
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
                  if (err) {
                    return reject(err);
                  }
                  try {
                    var store = transaction.objectStore(self2._dbInfo.storeName);
                    var req = store.count();
                    req.onsuccess = function() {
                      resolve(req.result);
                    };
                    req.onerror = function() {
                      reject(req.error);
                    };
                  } catch (e) {
                    reject(e);
                  }
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function key(n, callback) {
            var self2 = this;
            var promise = new Promise$1(function(resolve, reject) {
              if (n < 0) {
                resolve(null);
                return;
              }
              self2.ready().then(function() {
                createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
                  if (err) {
                    return reject(err);
                  }
                  try {
                    var store = transaction.objectStore(self2._dbInfo.storeName);
                    var advanced = false;
                    var req = store.openKeyCursor();
                    req.onsuccess = function() {
                      var cursor = req.result;
                      if (!cursor) {
                        resolve(null);
                        return;
                      }
                      if (n === 0) {
                        resolve(cursor.key);
                      } else {
                        if (!advanced) {
                          advanced = true;
                          cursor.advance(n);
                        } else {
                          resolve(cursor.key);
                        }
                      }
                    };
                    req.onerror = function() {
                      reject(req.error);
                    };
                  } catch (e) {
                    reject(e);
                  }
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function keys(callback) {
            var self2 = this;
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                createTransaction(self2._dbInfo, READ_ONLY, function(err, transaction) {
                  if (err) {
                    return reject(err);
                  }
                  try {
                    var store = transaction.objectStore(self2._dbInfo.storeName);
                    var req = store.openKeyCursor();
                    var keys2 = [];
                    req.onsuccess = function() {
                      var cursor = req.result;
                      if (!cursor) {
                        resolve(keys2);
                        return;
                      }
                      keys2.push(cursor.key);
                      cursor["continue"]();
                    };
                    req.onerror = function() {
                      reject(req.error);
                    };
                  } catch (e) {
                    reject(e);
                  }
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function dropInstance(options, callback) {
            callback = getCallback.apply(this, arguments);
            var currentConfig = this.config();
            options = typeof options !== "function" && options || {};
            if (!options.name) {
              options.name = options.name || currentConfig.name;
              options.storeName = options.storeName || currentConfig.storeName;
            }
            var self2 = this;
            var promise;
            if (!options.name) {
              promise = Promise$1.reject("Invalid arguments");
            } else {
              var isCurrentDb = options.name === currentConfig.name && self2._dbInfo.db;
              var dbPromise = isCurrentDb ? Promise$1.resolve(self2._dbInfo.db) : _getOriginalConnection(options).then(function(db) {
                var dbContext = dbContexts[options.name];
                var forages = dbContext.forages;
                dbContext.db = db;
                for (var i = 0; i < forages.length; i++) {
                  forages[i]._dbInfo.db = db;
                }
                return db;
              });
              if (!options.storeName) {
                promise = dbPromise.then(function(db) {
                  _deferReadiness(options);
                  var dbContext = dbContexts[options.name];
                  var forages = dbContext.forages;
                  db.close();
                  for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                  }
                  var dropDBPromise = new Promise$1(function(resolve, reject) {
                    var req = idb.deleteDatabase(options.name);
                    req.onerror = function() {
                      var db2 = req.result;
                      if (db2) {
                        db2.close();
                      }
                      reject(req.error);
                    };
                    req.onblocked = function() {
                      console.warn('dropInstance blocked for database "' + options.name + '" until all open connections are closed');
                    };
                    req.onsuccess = function() {
                      var db2 = req.result;
                      if (db2) {
                        db2.close();
                      }
                      resolve(db2);
                    };
                  });
                  return dropDBPromise.then(function(db2) {
                    dbContext.db = db2;
                    for (var i2 = 0; i2 < forages.length; i2++) {
                      var _forage = forages[i2];
                      _advanceReadiness(_forage._dbInfo);
                    }
                  })["catch"](function(err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function() {
                    });
                    throw err;
                  });
                });
              } else {
                promise = dbPromise.then(function(db) {
                  if (!db.objectStoreNames.contains(options.storeName)) {
                    return;
                  }
                  var newVersion = db.version + 1;
                  _deferReadiness(options);
                  var dbContext = dbContexts[options.name];
                  var forages = dbContext.forages;
                  db.close();
                  for (var i = 0; i < forages.length; i++) {
                    var forage = forages[i];
                    forage._dbInfo.db = null;
                    forage._dbInfo.version = newVersion;
                  }
                  var dropObjectPromise = new Promise$1(function(resolve, reject) {
                    var req = idb.open(options.name, newVersion);
                    req.onerror = function(err) {
                      var db2 = req.result;
                      db2.close();
                      reject(err);
                    };
                    req.onupgradeneeded = function() {
                      var db2 = req.result;
                      db2.deleteObjectStore(options.storeName);
                    };
                    req.onsuccess = function() {
                      var db2 = req.result;
                      db2.close();
                      resolve(db2);
                    };
                  });
                  return dropObjectPromise.then(function(db2) {
                    dbContext.db = db2;
                    for (var j = 0; j < forages.length; j++) {
                      var _forage2 = forages[j];
                      _forage2._dbInfo.db = db2;
                      _advanceReadiness(_forage2._dbInfo);
                    }
                  })["catch"](function(err) {
                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function() {
                    });
                    throw err;
                  });
                });
              }
            }
            executeCallback(promise, callback);
            return promise;
          }
          var asyncStorage = {
            _driver: "asyncStorage",
            _initStorage,
            _support: isIndexedDBValid(),
            iterate,
            getItem,
            setItem,
            removeItem,
            clear,
            length,
            key,
            keys,
            dropInstance
          };
          function isWebSQLValid() {
            return typeof openDatabase === "function";
          }
          var BASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
          var BLOB_TYPE_PREFIX = "~~local_forage_type~";
          var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;
          var SERIALIZED_MARKER = "__lfsc__:";
          var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;
          var TYPE_ARRAYBUFFER = "arbf";
          var TYPE_BLOB = "blob";
          var TYPE_INT8ARRAY = "si08";
          var TYPE_UINT8ARRAY = "ui08";
          var TYPE_UINT8CLAMPEDARRAY = "uic8";
          var TYPE_INT16ARRAY = "si16";
          var TYPE_INT32ARRAY = "si32";
          var TYPE_UINT16ARRAY = "ur16";
          var TYPE_UINT32ARRAY = "ui32";
          var TYPE_FLOAT32ARRAY = "fl32";
          var TYPE_FLOAT64ARRAY = "fl64";
          var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;
          var toString$1 = Object.prototype.toString;
          function stringToBuffer(serializedString) {
            var bufferLength = serializedString.length * 0.75;
            var len = serializedString.length;
            var i;
            var p = 0;
            var encoded1, encoded2, encoded3, encoded4;
            if (serializedString[serializedString.length - 1] === "=") {
              bufferLength--;
              if (serializedString[serializedString.length - 2] === "=") {
                bufferLength--;
              }
            }
            var buffer = new ArrayBuffer(bufferLength);
            var bytes = new Uint8Array(buffer);
            for (i = 0; i < len; i += 4) {
              encoded1 = BASE_CHARS.indexOf(serializedString[i]);
              encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
              encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
              encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);
              bytes[p++] = encoded1 << 2 | encoded2 >> 4;
              bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
              bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
            }
            return buffer;
          }
          function bufferToString(buffer) {
            var bytes = new Uint8Array(buffer);
            var base64String = "";
            var i;
            for (i = 0; i < bytes.length; i += 3) {
              base64String += BASE_CHARS[bytes[i] >> 2];
              base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
              base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
              base64String += BASE_CHARS[bytes[i + 2] & 63];
            }
            if (bytes.length % 3 === 2) {
              base64String = base64String.substring(0, base64String.length - 1) + "=";
            } else if (bytes.length % 3 === 1) {
              base64String = base64String.substring(0, base64String.length - 2) + "==";
            }
            return base64String;
          }
          function serialize(value, callback) {
            var valueType = "";
            if (value) {
              valueType = toString$1.call(value);
            }
            if (value && (valueType === "[object ArrayBuffer]" || value.buffer && toString$1.call(value.buffer) === "[object ArrayBuffer]")) {
              var buffer;
              var marker = SERIALIZED_MARKER;
              if (value instanceof ArrayBuffer) {
                buffer = value;
                marker += TYPE_ARRAYBUFFER;
              } else {
                buffer = value.buffer;
                if (valueType === "[object Int8Array]") {
                  marker += TYPE_INT8ARRAY;
                } else if (valueType === "[object Uint8Array]") {
                  marker += TYPE_UINT8ARRAY;
                } else if (valueType === "[object Uint8ClampedArray]") {
                  marker += TYPE_UINT8CLAMPEDARRAY;
                } else if (valueType === "[object Int16Array]") {
                  marker += TYPE_INT16ARRAY;
                } else if (valueType === "[object Uint16Array]") {
                  marker += TYPE_UINT16ARRAY;
                } else if (valueType === "[object Int32Array]") {
                  marker += TYPE_INT32ARRAY;
                } else if (valueType === "[object Uint32Array]") {
                  marker += TYPE_UINT32ARRAY;
                } else if (valueType === "[object Float32Array]") {
                  marker += TYPE_FLOAT32ARRAY;
                } else if (valueType === "[object Float64Array]") {
                  marker += TYPE_FLOAT64ARRAY;
                } else {
                  callback(new Error("Failed to get type for BinaryArray"));
                }
              }
              callback(marker + bufferToString(buffer));
            } else if (valueType === "[object Blob]") {
              var fileReader = new FileReader();
              fileReader.onload = function() {
                var str = BLOB_TYPE_PREFIX + value.type + "~" + bufferToString(this.result);
                callback(SERIALIZED_MARKER + TYPE_BLOB + str);
              };
              fileReader.readAsArrayBuffer(value);
            } else {
              try {
                callback(JSON.stringify(value));
              } catch (e) {
                console.error("Couldn't convert value into a JSON string: ", value);
                callback(null, e);
              }
            }
          }
          function deserialize(value) {
            if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
              return JSON.parse(value);
            }
            var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
            var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);
            var blobType;
            if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
              var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
              blobType = matcher[1];
              serializedString = serializedString.substring(matcher[0].length);
            }
            var buffer = stringToBuffer(serializedString);
            switch (type) {
              case TYPE_ARRAYBUFFER:
                return buffer;
              case TYPE_BLOB:
                return createBlob([buffer], { type: blobType });
              case TYPE_INT8ARRAY:
                return new Int8Array(buffer);
              case TYPE_UINT8ARRAY:
                return new Uint8Array(buffer);
              case TYPE_UINT8CLAMPEDARRAY:
                return new Uint8ClampedArray(buffer);
              case TYPE_INT16ARRAY:
                return new Int16Array(buffer);
              case TYPE_UINT16ARRAY:
                return new Uint16Array(buffer);
              case TYPE_INT32ARRAY:
                return new Int32Array(buffer);
              case TYPE_UINT32ARRAY:
                return new Uint32Array(buffer);
              case TYPE_FLOAT32ARRAY:
                return new Float32Array(buffer);
              case TYPE_FLOAT64ARRAY:
                return new Float64Array(buffer);
              default:
                throw new Error("Unkown type: " + type);
            }
          }
          var localforageSerializer = {
            serialize,
            deserialize,
            stringToBuffer,
            bufferToString
          };
          function createDbTable(t, dbInfo, callback, errorCallback) {
            t.executeSql("CREATE TABLE IF NOT EXISTS " + dbInfo.storeName + " (id INTEGER PRIMARY KEY, key unique, value)", [], callback, errorCallback);
          }
          function _initStorage$1(options) {
            var self2 = this;
            var dbInfo = {
              db: null
            };
            if (options) {
              for (var i in options) {
                dbInfo[i] = typeof options[i] !== "string" ? options[i].toString() : options[i];
              }
            }
            var dbInfoPromise = new Promise$1(function(resolve, reject) {
              try {
                dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
              } catch (e) {
                return reject(e);
              }
              dbInfo.db.transaction(function(t) {
                createDbTable(t, dbInfo, function() {
                  self2._dbInfo = dbInfo;
                  resolve();
                }, function(t2, error) {
                  reject(error);
                });
              }, reject);
            });
            dbInfo.serializer = localforageSerializer;
            return dbInfoPromise;
          }
          function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
            t.executeSql(sqlStatement, args, callback, function(t2, error) {
              if (error.code === error.SYNTAX_ERR) {
                t2.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [dbInfo.storeName], function(t3, results) {
                  if (!results.rows.length) {
                    createDbTable(t3, dbInfo, function() {
                      t3.executeSql(sqlStatement, args, callback, errorCallback);
                    }, errorCallback);
                  } else {
                    errorCallback(t3, error);
                  }
                }, errorCallback);
              } else {
                errorCallback(t2, error);
              }
            }, errorCallback);
          }
          function getItem$1(key2, callback) {
            var self2 = this;
            key2 = normalizeKey(key2);
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                dbInfo.db.transaction(function(t) {
                  tryExecuteSql(t, dbInfo, "SELECT * FROM " + dbInfo.storeName + " WHERE key = ? LIMIT 1", [key2], function(t2, results) {
                    var result = results.rows.length ? results.rows.item(0).value : null;
                    if (result) {
                      result = dbInfo.serializer.deserialize(result);
                    }
                    resolve(result);
                  }, function(t2, error) {
                    reject(error);
                  });
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function iterate$1(iterator, callback) {
            var self2 = this;
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                dbInfo.db.transaction(function(t) {
                  tryExecuteSql(t, dbInfo, "SELECT * FROM " + dbInfo.storeName, [], function(t2, results) {
                    var rows = results.rows;
                    var length2 = rows.length;
                    for (var i = 0; i < length2; i++) {
                      var item = rows.item(i);
                      var result = item.value;
                      if (result) {
                        result = dbInfo.serializer.deserialize(result);
                      }
                      result = iterator(result, item.key, i + 1);
                      if (result !== void 0) {
                        resolve(result);
                        return;
                      }
                    }
                    resolve();
                  }, function(t2, error) {
                    reject(error);
                  });
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function _setItem(key2, value, callback, retriesLeft) {
            var self2 = this;
            key2 = normalizeKey(key2);
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                if (value === void 0) {
                  value = null;
                }
                var originalValue = value;
                var dbInfo = self2._dbInfo;
                dbInfo.serializer.serialize(value, function(value2, error) {
                  if (error) {
                    reject(error);
                  } else {
                    dbInfo.db.transaction(function(t) {
                      tryExecuteSql(t, dbInfo, "INSERT OR REPLACE INTO " + dbInfo.storeName + " (key, value) VALUES (?, ?)", [key2, value2], function() {
                        resolve(originalValue);
                      }, function(t2, error2) {
                        reject(error2);
                      });
                    }, function(sqlError) {
                      if (sqlError.code === sqlError.QUOTA_ERR) {
                        if (retriesLeft > 0) {
                          resolve(_setItem.apply(self2, [key2, originalValue, callback, retriesLeft - 1]));
                          return;
                        }
                        reject(sqlError);
                      }
                    });
                  }
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function setItem$1(key2, value, callback) {
            return _setItem.apply(this, [key2, value, callback, 1]);
          }
          function removeItem$1(key2, callback) {
            var self2 = this;
            key2 = normalizeKey(key2);
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                dbInfo.db.transaction(function(t) {
                  tryExecuteSql(t, dbInfo, "DELETE FROM " + dbInfo.storeName + " WHERE key = ?", [key2], function() {
                    resolve();
                  }, function(t2, error) {
                    reject(error);
                  });
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function clear$1(callback) {
            var self2 = this;
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                dbInfo.db.transaction(function(t) {
                  tryExecuteSql(t, dbInfo, "DELETE FROM " + dbInfo.storeName, [], function() {
                    resolve();
                  }, function(t2, error) {
                    reject(error);
                  });
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function length$1(callback) {
            var self2 = this;
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                dbInfo.db.transaction(function(t) {
                  tryExecuteSql(t, dbInfo, "SELECT COUNT(key) as c FROM " + dbInfo.storeName, [], function(t2, results) {
                    var result = results.rows.item(0).c;
                    resolve(result);
                  }, function(t2, error) {
                    reject(error);
                  });
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function key$1(n, callback) {
            var self2 = this;
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                dbInfo.db.transaction(function(t) {
                  tryExecuteSql(t, dbInfo, "SELECT key FROM " + dbInfo.storeName + " WHERE id = ? LIMIT 1", [n + 1], function(t2, results) {
                    var result = results.rows.length ? results.rows.item(0).key : null;
                    resolve(result);
                  }, function(t2, error) {
                    reject(error);
                  });
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function keys$1(callback) {
            var self2 = this;
            var promise = new Promise$1(function(resolve, reject) {
              self2.ready().then(function() {
                var dbInfo = self2._dbInfo;
                dbInfo.db.transaction(function(t) {
                  tryExecuteSql(t, dbInfo, "SELECT key FROM " + dbInfo.storeName, [], function(t2, results) {
                    var keys2 = [];
                    for (var i = 0; i < results.rows.length; i++) {
                      keys2.push(results.rows.item(i).key);
                    }
                    resolve(keys2);
                  }, function(t2, error) {
                    reject(error);
                  });
                });
              })["catch"](reject);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function getAllStoreNames(db) {
            return new Promise$1(function(resolve, reject) {
              db.transaction(function(t) {
                t.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function(t2, results) {
                  var storeNames = [];
                  for (var i = 0; i < results.rows.length; i++) {
                    storeNames.push(results.rows.item(i).name);
                  }
                  resolve({
                    db,
                    storeNames
                  });
                }, function(t2, error) {
                  reject(error);
                });
              }, function(sqlError) {
                reject(sqlError);
              });
            });
          }
          function dropInstance$1(options, callback) {
            callback = getCallback.apply(this, arguments);
            var currentConfig = this.config();
            options = typeof options !== "function" && options || {};
            if (!options.name) {
              options.name = options.name || currentConfig.name;
              options.storeName = options.storeName || currentConfig.storeName;
            }
            var self2 = this;
            var promise;
            if (!options.name) {
              promise = Promise$1.reject("Invalid arguments");
            } else {
              promise = new Promise$1(function(resolve) {
                var db;
                if (options.name === currentConfig.name) {
                  db = self2._dbInfo.db;
                } else {
                  db = openDatabase(options.name, "", "", 0);
                }
                if (!options.storeName) {
                  resolve(getAllStoreNames(db));
                } else {
                  resolve({
                    db,
                    storeNames: [options.storeName]
                  });
                }
              }).then(function(operationInfo) {
                return new Promise$1(function(resolve, reject) {
                  operationInfo.db.transaction(function(t) {
                    function dropTable(storeName) {
                      return new Promise$1(function(resolve2, reject2) {
                        t.executeSql("DROP TABLE IF EXISTS " + storeName, [], function() {
                          resolve2();
                        }, function(t2, error) {
                          reject2(error);
                        });
                      });
                    }
                    var operations = [];
                    for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
                      operations.push(dropTable(operationInfo.storeNames[i]));
                    }
                    Promise$1.all(operations).then(function() {
                      resolve();
                    })["catch"](function(e) {
                      reject(e);
                    });
                  }, function(sqlError) {
                    reject(sqlError);
                  });
                });
              });
            }
            executeCallback(promise, callback);
            return promise;
          }
          var webSQLStorage = {
            _driver: "webSQLStorage",
            _initStorage: _initStorage$1,
            _support: isWebSQLValid(),
            iterate: iterate$1,
            getItem: getItem$1,
            setItem: setItem$1,
            removeItem: removeItem$1,
            clear: clear$1,
            length: length$1,
            key: key$1,
            keys: keys$1,
            dropInstance: dropInstance$1
          };
          function isLocalStorageValid() {
            try {
              return typeof localStorage !== "undefined" && "setItem" in localStorage && !!localStorage.setItem;
            } catch (e) {
              return false;
            }
          }
          function _getKeyPrefix(options, defaultConfig) {
            var keyPrefix = options.name + "/";
            if (options.storeName !== defaultConfig.storeName) {
              keyPrefix += options.storeName + "/";
            }
            return keyPrefix;
          }
          function checkIfLocalStorageThrows() {
            var localStorageTestKey = "_localforage_support_test";
            try {
              localStorage.setItem(localStorageTestKey, true);
              localStorage.removeItem(localStorageTestKey);
              return false;
            } catch (e) {
              return true;
            }
          }
          function _isLocalStorageUsable() {
            return !checkIfLocalStorageThrows() || localStorage.length > 0;
          }
          function _initStorage$2(options) {
            var self2 = this;
            var dbInfo = {};
            if (options) {
              for (var i in options) {
                dbInfo[i] = options[i];
              }
            }
            dbInfo.keyPrefix = _getKeyPrefix(options, self2._defaultConfig);
            if (!_isLocalStorageUsable()) {
              return Promise$1.reject();
            }
            self2._dbInfo = dbInfo;
            dbInfo.serializer = localforageSerializer;
            return Promise$1.resolve();
          }
          function clear$2(callback) {
            var self2 = this;
            var promise = self2.ready().then(function() {
              var keyPrefix = self2._dbInfo.keyPrefix;
              for (var i = localStorage.length - 1; i >= 0; i--) {
                var key2 = localStorage.key(i);
                if (key2.indexOf(keyPrefix) === 0) {
                  localStorage.removeItem(key2);
                }
              }
            });
            executeCallback(promise, callback);
            return promise;
          }
          function getItem$2(key2, callback) {
            var self2 = this;
            key2 = normalizeKey(key2);
            var promise = self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              var result = localStorage.getItem(dbInfo.keyPrefix + key2);
              if (result) {
                result = dbInfo.serializer.deserialize(result);
              }
              return result;
            });
            executeCallback(promise, callback);
            return promise;
          }
          function iterate$2(iterator, callback) {
            var self2 = this;
            var promise = self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              var keyPrefix = dbInfo.keyPrefix;
              var keyPrefixLength = keyPrefix.length;
              var length2 = localStorage.length;
              var iterationNumber = 1;
              for (var i = 0; i < length2; i++) {
                var key2 = localStorage.key(i);
                if (key2.indexOf(keyPrefix) !== 0) {
                  continue;
                }
                var value = localStorage.getItem(key2);
                if (value) {
                  value = dbInfo.serializer.deserialize(value);
                }
                value = iterator(value, key2.substring(keyPrefixLength), iterationNumber++);
                if (value !== void 0) {
                  return value;
                }
              }
            });
            executeCallback(promise, callback);
            return promise;
          }
          function key$2(n, callback) {
            var self2 = this;
            var promise = self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              var result;
              try {
                result = localStorage.key(n);
              } catch (error) {
                result = null;
              }
              if (result) {
                result = result.substring(dbInfo.keyPrefix.length);
              }
              return result;
            });
            executeCallback(promise, callback);
            return promise;
          }
          function keys$2(callback) {
            var self2 = this;
            var promise = self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              var length2 = localStorage.length;
              var keys2 = [];
              for (var i = 0; i < length2; i++) {
                var itemKey = localStorage.key(i);
                if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
                  keys2.push(itemKey.substring(dbInfo.keyPrefix.length));
                }
              }
              return keys2;
            });
            executeCallback(promise, callback);
            return promise;
          }
          function length$2(callback) {
            var self2 = this;
            var promise = self2.keys().then(function(keys2) {
              return keys2.length;
            });
            executeCallback(promise, callback);
            return promise;
          }
          function removeItem$2(key2, callback) {
            var self2 = this;
            key2 = normalizeKey(key2);
            var promise = self2.ready().then(function() {
              var dbInfo = self2._dbInfo;
              localStorage.removeItem(dbInfo.keyPrefix + key2);
            });
            executeCallback(promise, callback);
            return promise;
          }
          function setItem$2(key2, value, callback) {
            var self2 = this;
            key2 = normalizeKey(key2);
            var promise = self2.ready().then(function() {
              if (value === void 0) {
                value = null;
              }
              var originalValue = value;
              return new Promise$1(function(resolve, reject) {
                var dbInfo = self2._dbInfo;
                dbInfo.serializer.serialize(value, function(value2, error) {
                  if (error) {
                    reject(error);
                  } else {
                    try {
                      localStorage.setItem(dbInfo.keyPrefix + key2, value2);
                      resolve(originalValue);
                    } catch (e) {
                      if (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") {
                        reject(e);
                      }
                      reject(e);
                    }
                  }
                });
              });
            });
            executeCallback(promise, callback);
            return promise;
          }
          function dropInstance$2(options, callback) {
            callback = getCallback.apply(this, arguments);
            options = typeof options !== "function" && options || {};
            if (!options.name) {
              var currentConfig = this.config();
              options.name = options.name || currentConfig.name;
              options.storeName = options.storeName || currentConfig.storeName;
            }
            var self2 = this;
            var promise;
            if (!options.name) {
              promise = Promise$1.reject("Invalid arguments");
            } else {
              promise = new Promise$1(function(resolve) {
                if (!options.storeName) {
                  resolve(options.name + "/");
                } else {
                  resolve(_getKeyPrefix(options, self2._defaultConfig));
                }
              }).then(function(keyPrefix) {
                for (var i = localStorage.length - 1; i >= 0; i--) {
                  var key2 = localStorage.key(i);
                  if (key2.indexOf(keyPrefix) === 0) {
                    localStorage.removeItem(key2);
                  }
                }
              });
            }
            executeCallback(promise, callback);
            return promise;
          }
          var localStorageWrapper = {
            _driver: "localStorageWrapper",
            _initStorage: _initStorage$2,
            _support: isLocalStorageValid(),
            iterate: iterate$2,
            getItem: getItem$2,
            setItem: setItem$2,
            removeItem: removeItem$2,
            clear: clear$2,
            length: length$2,
            key: key$2,
            keys: keys$2,
            dropInstance: dropInstance$2
          };
          var sameValue = function sameValue2(x, y) {
            return x === y || typeof x === "number" && typeof y === "number" && isNaN(x) && isNaN(y);
          };
          var includes = function includes2(array, searchElement) {
            var len = array.length;
            var i = 0;
            while (i < len) {
              if (sameValue(array[i], searchElement)) {
                return true;
              }
              i++;
            }
            return false;
          };
          var isArray = Array.isArray || function(arg) {
            return Object.prototype.toString.call(arg) === "[object Array]";
          };
          var DefinedDrivers = {};
          var DriverSupport = {};
          var DefaultDrivers = {
            INDEXEDDB: asyncStorage,
            WEBSQL: webSQLStorage,
            LOCALSTORAGE: localStorageWrapper
          };
          var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];
          var OptionalDriverMethods = ["dropInstance"];
          var LibraryMethods = ["clear", "getItem", "iterate", "key", "keys", "length", "removeItem", "setItem"].concat(OptionalDriverMethods);
          var DefaultConfig = {
            description: "",
            driver: DefaultDriverOrder.slice(),
            name: "localforage",
            size: 4980736,
            storeName: "keyvaluepairs",
            version: 1
          };
          function callWhenReady(localForageInstance, libraryMethod) {
            localForageInstance[libraryMethod] = function() {
              var _args = arguments;
              return localForageInstance.ready().then(function() {
                return localForageInstance[libraryMethod].apply(localForageInstance, _args);
              });
            };
          }
          function extend() {
            for (var i = 1; i < arguments.length; i++) {
              var arg = arguments[i];
              if (arg) {
                for (var _key in arg) {
                  if (arg.hasOwnProperty(_key)) {
                    if (isArray(arg[_key])) {
                      arguments[0][_key] = arg[_key].slice();
                    } else {
                      arguments[0][_key] = arg[_key];
                    }
                  }
                }
              }
            }
            return arguments[0];
          }
          var LocalForage = function() {
            function LocalForage2(options) {
              _classCallCheck(this, LocalForage2);
              for (var driverTypeKey in DefaultDrivers) {
                if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
                  var driver = DefaultDrivers[driverTypeKey];
                  var driverName = driver._driver;
                  this[driverTypeKey] = driverName;
                  if (!DefinedDrivers[driverName]) {
                    this.defineDriver(driver);
                  }
                }
              }
              this._defaultConfig = extend({}, DefaultConfig);
              this._config = extend({}, this._defaultConfig, options);
              this._driverSet = null;
              this._initDriver = null;
              this._ready = false;
              this._dbInfo = null;
              this._wrapLibraryMethodsWithReady();
              this.setDriver(this._config.driver)["catch"](function() {
              });
            }
            LocalForage2.prototype.config = function config(options) {
              if ((typeof options === "undefined" ? "undefined" : _typeof(options)) === "object") {
                if (this._ready) {
                  return new Error("Can't call config() after localforage has been used.");
                }
                for (var i in options) {
                  if (i === "storeName") {
                    options[i] = options[i].replace(/\W/g, "_");
                  }
                  if (i === "version" && typeof options[i] !== "number") {
                    return new Error("Database version must be a number.");
                  }
                  this._config[i] = options[i];
                }
                if ("driver" in options && options.driver) {
                  return this.setDriver(this._config.driver);
                }
                return true;
              } else if (typeof options === "string") {
                return this._config[options];
              } else {
                return this._config;
              }
            };
            LocalForage2.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
              var promise = new Promise$1(function(resolve, reject) {
                try {
                  var driverName = driverObject._driver;
                  var complianceError = new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
                  if (!driverObject._driver) {
                    reject(complianceError);
                    return;
                  }
                  var driverMethods = LibraryMethods.concat("_initStorage");
                  for (var i = 0, len = driverMethods.length; i < len; i++) {
                    var driverMethodName = driverMethods[i];
                    var isRequired = !includes(OptionalDriverMethods, driverMethodName);
                    if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== "function") {
                      reject(complianceError);
                      return;
                    }
                  }
                  var configureMissingMethods = function configureMissingMethods2() {
                    var methodNotImplementedFactory = function methodNotImplementedFactory2(methodName) {
                      return function() {
                        var error = new Error("Method " + methodName + " is not implemented by the current driver");
                        var promise2 = Promise$1.reject(error);
                        executeCallback(promise2, arguments[arguments.length - 1]);
                        return promise2;
                      };
                    };
                    for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
                      var optionalDriverMethod = OptionalDriverMethods[_i];
                      if (!driverObject[optionalDriverMethod]) {
                        driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
                      }
                    }
                  };
                  configureMissingMethods();
                  var setDriverSupport = function setDriverSupport2(support) {
                    if (DefinedDrivers[driverName]) {
                      console.info("Redefining LocalForage driver: " + driverName);
                    }
                    DefinedDrivers[driverName] = driverObject;
                    DriverSupport[driverName] = support;
                    resolve();
                  };
                  if ("_support" in driverObject) {
                    if (driverObject._support && typeof driverObject._support === "function") {
                      driverObject._support().then(setDriverSupport, reject);
                    } else {
                      setDriverSupport(!!driverObject._support);
                    }
                  } else {
                    setDriverSupport(true);
                  }
                } catch (e) {
                  reject(e);
                }
              });
              executeTwoCallbacks(promise, callback, errorCallback);
              return promise;
            };
            LocalForage2.prototype.driver = function driver() {
              return this._driver || null;
            };
            LocalForage2.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
              var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error("Driver not found."));
              executeTwoCallbacks(getDriverPromise, callback, errorCallback);
              return getDriverPromise;
            };
            LocalForage2.prototype.getSerializer = function getSerializer(callback) {
              var serializerPromise = Promise$1.resolve(localforageSerializer);
              executeTwoCallbacks(serializerPromise, callback);
              return serializerPromise;
            };
            LocalForage2.prototype.ready = function ready(callback) {
              var self2 = this;
              var promise = self2._driverSet.then(function() {
                if (self2._ready === null) {
                  self2._ready = self2._initDriver();
                }
                return self2._ready;
              });
              executeTwoCallbacks(promise, callback, callback);
              return promise;
            };
            LocalForage2.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
              var self2 = this;
              if (!isArray(drivers)) {
                drivers = [drivers];
              }
              var supportedDrivers = this._getSupportedDrivers(drivers);
              function setDriverToConfig() {
                self2._config.driver = self2.driver();
              }
              function extendSelfWithDriver(driver) {
                self2._extend(driver);
                setDriverToConfig();
                self2._ready = self2._initStorage(self2._config);
                return self2._ready;
              }
              function initDriver(supportedDrivers2) {
                return function() {
                  var currentDriverIndex = 0;
                  function driverPromiseLoop() {
                    while (currentDriverIndex < supportedDrivers2.length) {
                      var driverName = supportedDrivers2[currentDriverIndex];
                      currentDriverIndex++;
                      self2._dbInfo = null;
                      self2._ready = null;
                      return self2.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
                    }
                    setDriverToConfig();
                    var error = new Error("No available storage method found.");
                    self2._driverSet = Promise$1.reject(error);
                    return self2._driverSet;
                  }
                  return driverPromiseLoop();
                };
              }
              var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function() {
                return Promise$1.resolve();
              }) : Promise$1.resolve();
              this._driverSet = oldDriverSetDone.then(function() {
                var driverName = supportedDrivers[0];
                self2._dbInfo = null;
                self2._ready = null;
                return self2.getDriver(driverName).then(function(driver) {
                  self2._driver = driver._driver;
                  setDriverToConfig();
                  self2._wrapLibraryMethodsWithReady();
                  self2._initDriver = initDriver(supportedDrivers);
                });
              })["catch"](function() {
                setDriverToConfig();
                var error = new Error("No available storage method found.");
                self2._driverSet = Promise$1.reject(error);
                return self2._driverSet;
              });
              executeTwoCallbacks(this._driverSet, callback, errorCallback);
              return this._driverSet;
            };
            LocalForage2.prototype.supports = function supports(driverName) {
              return !!DriverSupport[driverName];
            };
            LocalForage2.prototype._extend = function _extend(libraryMethodsAndProperties) {
              extend(this, libraryMethodsAndProperties);
            };
            LocalForage2.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
              var supportedDrivers = [];
              for (var i = 0, len = drivers.length; i < len; i++) {
                var driverName = drivers[i];
                if (this.supports(driverName)) {
                  supportedDrivers.push(driverName);
                }
              }
              return supportedDrivers;
            };
            LocalForage2.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
              for (var i = 0, len = LibraryMethods.length; i < len; i++) {
                callWhenReady(this, LibraryMethods[i]);
              }
            };
            LocalForage2.prototype.createInstance = function createInstance(options) {
              return new LocalForage2(options);
            };
            return LocalForage2;
          }();
          var localforage_js = new LocalForage();
          module3.exports = localforage_js;
        }, { "3": 3 }] }, {}, [4])(4);
      });
    }
  });

  // node_modules/svelte/internal/index.mjs
  function noop() {
  }
  function assign(tar, src) {
    for (const k in src)
      tar[k] = src[k];
    return tar;
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
      const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
      return definition[0](slot_ctx);
    }
  }
  function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
  }
  function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
      const lets = definition[2](fn(dirty));
      if ($$scope.dirty === void 0) {
        return lets;
      }
      if (typeof lets === "object") {
        const merged = [];
        const len = Math.max($$scope.dirty.length, lets.length);
        for (let i = 0; i < len; i += 1) {
          merged[i] = $$scope.dirty[i] | lets[i];
        }
        return merged;
      }
      return $$scope.dirty | lets;
    }
    return $$scope.dirty;
  }
  function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    if (slot_changes) {
      const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
      slot.p(slot_context, slot_changes);
    }
  }
  function null_to_empty(value) {
    return value == null ? "" : value;
  }
  var tasks = new Set();
  var is_hydrating = false;
  function start_hydrating() {
    is_hydrating = true;
  }
  function end_hydrating() {
    is_hydrating = false;
  }
  function upper_bound(low, high, key, value) {
    while (low < high) {
      const mid = low + (high - low >> 1);
      if (key(mid) <= value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
  function init_hydrate(target) {
    if (target.hydrate_init)
      return;
    target.hydrate_init = true;
    const children2 = target.childNodes;
    const m = new Int32Array(children2.length + 1);
    const p = new Int32Array(children2.length);
    m[0] = -1;
    let longest = 0;
    for (let i = 0; i < children2.length; i++) {
      const current = children2[i].claim_order;
      const seqLen = upper_bound(1, longest + 1, (idx) => children2[m[idx]].claim_order, current) - 1;
      p[i] = m[seqLen] + 1;
      const newLen = seqLen + 1;
      m[newLen] = i;
      longest = Math.max(newLen, longest);
    }
    const lis = [];
    const toMove = [];
    let last = children2.length - 1;
    for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
      lis.push(children2[cur - 1]);
      for (; last >= cur; last--) {
        toMove.push(children2[last]);
      }
      last--;
    }
    for (; last >= 0; last--) {
      toMove.push(children2[last]);
    }
    lis.reverse();
    toMove.sort((a, b) => a.claim_order - b.claim_order);
    for (let i = 0, j = 0; i < toMove.length; i++) {
      while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
        j++;
      }
      const anchor = j < lis.length ? lis[j] : null;
      target.insertBefore(toMove[i], anchor);
    }
  }
  function append(target, node) {
    if (is_hydrating) {
      init_hydrate(target);
      if (target.actual_end_child === void 0 || target.actual_end_child !== null && target.actual_end_child.parentElement !== target) {
        target.actual_end_child = target.firstChild;
      }
      if (node !== target.actual_end_child) {
        target.insertBefore(node, target.actual_end_child);
      } else {
        target.actual_end_child = node.nextSibling;
      }
    } else if (node.parentNode !== target) {
      target.appendChild(node);
    }
  }
  function insert(target, node, anchor) {
    if (is_hydrating && !anchor) {
      append(target, node);
    } else if (node.parentNode !== target || anchor && node.nextSibling !== anchor) {
      target.insertBefore(node, anchor || null);
    }
  }
  function detach(node) {
    node.parentNode.removeChild(node);
  }
  function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
      if (iterations[i])
        iterations[i].d(detaching);
    }
  }
  function element(name) {
    return document.createElement(name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function empty() {
    return text("");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function prevent_default(fn) {
    return function(event) {
      event.preventDefault();
      return fn.call(this, event);
    };
  }
  function attr(node, attribute, value) {
    if (value == null)
      node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function set_data(text2, data) {
    data = "" + data;
    if (text2.wholeText !== data)
      text2.data = data;
  }
  function set_input_value(input, value) {
    input.value = value == null ? "" : value;
  }
  function select_option(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
      const option = select.options[i];
      if (option.__value === value) {
        option.selected = true;
        return;
      }
    }
  }
  function select_value(select) {
    const selected_option = select.querySelector(":checked") || select.options[0];
    return selected_option && selected_option.__value;
  }
  var HtmlTag = class {
    constructor(claimed_nodes) {
      this.e = this.n = null;
      this.l = claimed_nodes;
    }
    m(html, target, anchor = null) {
      if (!this.e) {
        this.e = element(target.nodeName);
        this.t = target;
        if (this.l) {
          this.n = this.l;
        } else {
          this.h(html);
        }
      }
      this.i(anchor);
    }
    h(html) {
      this.e.innerHTML = html;
      this.n = Array.from(this.e.childNodes);
    }
    i(anchor) {
      for (let i = 0; i < this.n.length; i += 1) {
        insert(this.t, this.n[i], anchor);
      }
    }
    p(html) {
      this.d();
      this.h(html);
      this.i(this.a);
    }
    d() {
      this.n.forEach(detach);
    }
  };
  var active_docs = new Set();
  var current_component;
  function set_current_component(component) {
    current_component = component;
  }
  function get_current_component() {
    if (!current_component)
      throw new Error("Function called outside component initialization");
    return current_component;
  }
  function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
  }
  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  var flushing = false;
  var seen_callbacks = new Set();
  function flush() {
    if (flushing)
      return;
    flushing = true;
    do {
      for (let i = 0; i < dirty_components.length; i += 1) {
        const component = dirty_components[i];
        set_current_component(component);
        update(component.$$);
      }
      set_current_component(null);
      dirty_components.length = 0;
      while (binding_callbacks.length)
        binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  var outroing = new Set();
  var outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros
    };
  }
  function check_outros() {
    if (!outros.r) {
      run_all(outros.c);
    }
    outros = outros.p;
  }
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach2, callback) {
    if (block && block.o) {
      if (outroing.has(block))
        return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach2)
            block.d(1);
          callback();
        }
      });
      block.o(local);
    }
  }
  var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
  function get_spread_update(levels, updates) {
    const update2 = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
      const o = levels[i];
      const n = updates[i];
      if (n) {
        for (const key in o) {
          if (!(key in n))
            to_null_out[key] = 1;
        }
        for (const key in n) {
          if (!accounted_for[key]) {
            update2[key] = n[key];
            accounted_for[key] = 1;
          }
        }
        levels[i] = n;
      } else {
        for (const key in o) {
          accounted_for[key] = 1;
        }
      }
    }
    for (const key in to_null_out) {
      if (!(key in update2))
        update2[key] = void 0;
    }
    return update2;
  }
  function get_spread_object(spread_props) {
    return typeof spread_props === "object" && spread_props !== null ? spread_props : {};
  }
  var boolean_attributes = new Set([
    "allowfullscreen",
    "allowpaymentrequest",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "hidden",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected"
  ]);
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
          on_destroy.push(...new_on_destroy);
        } else {
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance15, create_fragment15, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: null,
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(parent_component ? parent_component.$$.context : options.context || []),
      callbacks: blank_object(),
      dirty,
      skip_bound: false
    };
    let ready = false;
    $$.ctx = instance15 ? instance15(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i])
          $$.bound[i](value);
        if (ready)
          make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment15 ? create_fragment15($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        start_hydrating();
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro)
        transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      end_hydrating();
      flush();
    }
    set_current_component(parent_component);
  }
  var SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        const { on_mount } = this.$$;
        this.$$.on_disconnect = on_mount.map(run).filter(is_function);
        for (const key in this.$$.slotted) {
          this.appendChild(this.$$.slotted[key]);
        }
      }
      attributeChangedCallback(attr2, _oldValue, newValue) {
        this[attr2] = newValue;
      }
      disconnectedCallback() {
        run_all(this.$$.on_disconnect);
      }
      $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
      $on(type, callback) {
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1)
            callbacks.splice(index, 1);
        };
      }
      $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    };
  }
  var SvelteComponent = class {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };

  // client/IconHeader.svelte
  function create_else_block(ctx) {
    let h1;
    let t;
    let div;
    let current;
    let if_block = ctx[2] && create_if_block_2(ctx);
    const default_slot_template = ctx[5].default;
    const default_slot = create_slot(default_slot_template, ctx, ctx[4], null);
    return {
      c() {
        h1 = element("h1");
        if (if_block)
          if_block.c();
        t = space();
        div = element("div");
        if (default_slot)
          default_slot.c();
        attr(div, "class", "other svelte-i1hn5r");
        attr(h1, "style", ctx[1]);
        attr(h1, "class", "svelte-i1hn5r");
      },
      m(target, anchor) {
        insert(target, h1, anchor);
        if (if_block)
          if_block.m(h1, null);
        append(h1, t);
        append(h1, div);
        if (default_slot) {
          default_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (ctx2[2]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block_2(ctx2);
            if_block.c();
            if_block.m(h1, t);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        if (default_slot) {
          if (default_slot.p && (!current || dirty & 16)) {
            update_slot(default_slot, default_slot_template, ctx2, ctx2[4], !current ? -1 : dirty, null, null);
          }
        }
        if (!current || dirty & 2) {
          attr(h1, "style", ctx2[1]);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(h1);
        if (if_block)
          if_block.d();
        if (default_slot)
          default_slot.d(detaching);
      }
    };
  }
  function create_if_block(ctx) {
    let div1;
    let t;
    let div0;
    let current;
    let if_block = ctx[2] && create_if_block_1(ctx);
    const default_slot_template = ctx[5].default;
    const default_slot = create_slot(default_slot_template, ctx, ctx[4], null);
    return {
      c() {
        div1 = element("div");
        if (if_block)
          if_block.c();
        t = space();
        div0 = element("div");
        if (default_slot)
          default_slot.c();
        attr(div0, "class", "other svelte-i1hn5r");
        attr(div1, "style", ctx[1]);
        attr(div1, "class", "svelte-i1hn5r");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        if (if_block)
          if_block.m(div1, null);
        append(div1, t);
        append(div1, div0);
        if (default_slot) {
          default_slot.m(div0, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (ctx2[2]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block_1(ctx2);
            if_block.c();
            if_block.m(div1, t);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        if (default_slot) {
          if (default_slot.p && (!current || dirty & 16)) {
            update_slot(default_slot, default_slot_template, ctx2, ctx2[4], !current ? -1 : dirty, null, null);
          }
        }
        if (!current || dirty & 2) {
          attr(div1, "style", ctx2[1]);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div1);
        if (if_block)
          if_block.d();
        if (default_slot)
          default_slot.d(detaching);
      }
    };
  }
  function create_if_block_2(ctx) {
    let img;
    let img_src_value;
    return {
      c() {
        img = element("img");
        if (img.src !== (img_src_value = ctx[2]))
          attr(img, "src", img_src_value);
        attr(img, "class", "svelte-i1hn5r");
      },
      m(target, anchor) {
        insert(target, img, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && img.src !== (img_src_value = ctx2[2])) {
          attr(img, "src", img_src_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(img);
      }
    };
  }
  function create_if_block_1(ctx) {
    let img;
    let img_src_value;
    return {
      c() {
        img = element("img");
        if (img.src !== (img_src_value = ctx[2]))
          attr(img, "src", img_src_value);
        attr(img, "class", "svelte-i1hn5r");
      },
      m(target, anchor) {
        insert(target, img, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && img.src !== (img_src_value = ctx2[2])) {
          attr(img, "src", img_src_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(img);
      }
    };
  }
  function create_fragment(ctx) {
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    const if_block_creators = [create_if_block, create_else_block];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[0])
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if_blocks[current_block_type_index].m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if_blocks[current_block_type_index].d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance($$self, $$props, $$invalidate) {
    let url;
    let { $$slots: slots = {}, $$scope } = $$props;
    let { page } = $$props;
    let { basic } = $$props;
    let { style = "" } = $$props;
    $$self.$$set = ($$props2) => {
      if ("page" in $$props2)
        $$invalidate(3, page = $$props2.page);
      if ("basic" in $$props2)
        $$invalidate(0, basic = $$props2.basic);
      if ("style" in $$props2)
        $$invalidate(1, style = $$props2.style);
      if ("$$scope" in $$props2)
        $$invalidate(4, $$scope = $$props2.$$scope);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & 8) {
        $:
          $$invalidate(2, url = page.icon_filename && `/file/${page.id}/${encodeURIComponent(page.icon_filename)}`);
      }
    };
    return [basic, style, url, page, $$scope, slots];
  }
  var IconHeader = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance, create_fragment, safe_not_equal, { page: 3, basic: 0, style: 1 });
    }
  };
  var IconHeader_default = IconHeader;

  // client/LinkButton.svelte
  function create_fragment2(ctx) {
    let a;
    let a_style_value;
    let current;
    const default_slot_template = ctx[3].default;
    const default_slot = create_slot(default_slot_template, ctx, ctx[2], null);
    return {
      c() {
        a = element("a");
        if (default_slot)
          default_slot.c();
        attr(a, "href", ctx[0]);
        attr(a, "style", a_style_value = `background-color: ${ctx[1]}`);
        attr(a, "class", "svelte-d7xbzo");
      },
      m(target, anchor) {
        insert(target, a, anchor);
        if (default_slot) {
          default_slot.m(a, null);
        }
        current = true;
      },
      p(ctx2, [dirty]) {
        if (default_slot) {
          if (default_slot.p && (!current || dirty & 4)) {
            update_slot(default_slot, default_slot_template, ctx2, ctx2[2], !current ? -1 : dirty, null, null);
          }
        }
        if (!current || dirty & 1) {
          attr(a, "href", ctx2[0]);
        }
        if (!current || dirty & 2 && a_style_value !== (a_style_value = `background-color: ${ctx2[1]}`)) {
          attr(a, "style", a_style_value);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(a);
        if (default_slot)
          default_slot.d(detaching);
      }
    };
  }
  function instance2($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    let { href } = $$props;
    let { color } = $$props;
    $$self.$$set = ($$props2) => {
      if ("href" in $$props2)
        $$invalidate(0, href = $$props2.href);
      if ("color" in $$props2)
        $$invalidate(1, color = $$props2.color);
      if ("$$scope" in $$props2)
        $$invalidate(2, $$scope = $$props2.$$scope);
    };
    return [href, color, $$scope, slots];
  }
  var LinkButton = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance2, create_fragment2, safe_not_equal, { href: 0, color: 1 });
    }
  };
  var LinkButton_default = LinkButton;

  // node_modules/date-fns/esm/_lib/toInteger/index.js
  function toInteger(dirtyNumber) {
    if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
      return NaN;
    }
    var number = Number(dirtyNumber);
    if (isNaN(number)) {
      return number;
    }
    return number < 0 ? Math.ceil(number) : Math.floor(number);
  }

  // node_modules/date-fns/esm/_lib/requiredArgs/index.js
  function requiredArgs(required, args) {
    if (args.length < required) {
      throw new TypeError(required + " argument" + (required > 1 ? "s" : "") + " required, but only " + args.length + " present");
    }
  }

  // node_modules/date-fns/esm/toDate/index.js
  function toDate(argument) {
    requiredArgs(1, arguments);
    var argStr = Object.prototype.toString.call(argument);
    if (argument instanceof Date || typeof argument === "object" && argStr === "[object Date]") {
      return new Date(argument.getTime());
    } else if (typeof argument === "number" || argStr === "[object Number]") {
      return new Date(argument);
    } else {
      if ((typeof argument === "string" || argStr === "[object String]") && typeof console !== "undefined") {
        console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule");
        console.warn(new Error().stack);
      }
      return new Date(NaN);
    }
  }

  // node_modules/date-fns/esm/addMilliseconds/index.js
  function addMilliseconds(dirtyDate, dirtyAmount) {
    requiredArgs(2, arguments);
    var timestamp = toDate(dirtyDate).getTime();
    var amount = toInteger(dirtyAmount);
    return new Date(timestamp + amount);
  }

  // node_modules/date-fns/esm/_lib/getTimezoneOffsetInMilliseconds/index.js
  function getTimezoneOffsetInMilliseconds(date) {
    var utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
    utcDate.setUTCFullYear(date.getFullYear());
    return date.getTime() - utcDate.getTime();
  }

  // node_modules/date-fns/esm/compareAsc/index.js
  function compareAsc(dirtyDateLeft, dirtyDateRight) {
    requiredArgs(2, arguments);
    var dateLeft = toDate(dirtyDateLeft);
    var dateRight = toDate(dirtyDateRight);
    var diff = dateLeft.getTime() - dateRight.getTime();
    if (diff < 0) {
      return -1;
    } else if (diff > 0) {
      return 1;
    } else {
      return diff;
    }
  }

  // node_modules/date-fns/esm/isDate/index.js
  function isDate(value) {
    requiredArgs(1, arguments);
    return value instanceof Date || typeof value === "object" && Object.prototype.toString.call(value) === "[object Date]";
  }

  // node_modules/date-fns/esm/isValid/index.js
  function isValid(dirtyDate) {
    requiredArgs(1, arguments);
    if (!isDate(dirtyDate) && typeof dirtyDate !== "number") {
      return false;
    }
    var date = toDate(dirtyDate);
    return !isNaN(Number(date));
  }

  // node_modules/date-fns/esm/locale/en-US/_lib/formatDistance/index.js
  var formatDistanceLocale = {
    lessThanXSeconds: {
      one: "less than a second",
      other: "less than {{count}} seconds"
    },
    xSeconds: {
      one: "1 second",
      other: "{{count}} seconds"
    },
    halfAMinute: "half a minute",
    lessThanXMinutes: {
      one: "less than a minute",
      other: "less than {{count}} minutes"
    },
    xMinutes: {
      one: "1 minute",
      other: "{{count}} minutes"
    },
    aboutXHours: {
      one: "about 1 hour",
      other: "about {{count}} hours"
    },
    xHours: {
      one: "1 hour",
      other: "{{count}} hours"
    },
    xDays: {
      one: "1 day",
      other: "{{count}} days"
    },
    aboutXWeeks: {
      one: "about 1 week",
      other: "about {{count}} weeks"
    },
    xWeeks: {
      one: "1 week",
      other: "{{count}} weeks"
    },
    aboutXMonths: {
      one: "about 1 month",
      other: "about {{count}} months"
    },
    xMonths: {
      one: "1 month",
      other: "{{count}} months"
    },
    aboutXYears: {
      one: "about 1 year",
      other: "about {{count}} years"
    },
    xYears: {
      one: "1 year",
      other: "{{count}} years"
    },
    overXYears: {
      one: "over 1 year",
      other: "over {{count}} years"
    },
    almostXYears: {
      one: "almost 1 year",
      other: "almost {{count}} years"
    }
  };
  var formatDistance = function(token, count, options) {
    var result;
    var tokenValue = formatDistanceLocale[token];
    if (typeof tokenValue === "string") {
      result = tokenValue;
    } else if (count === 1) {
      result = tokenValue.one;
    } else {
      result = tokenValue.other.replace("{{count}}", count.toString());
    }
    if (options !== null && options !== void 0 && options.addSuffix) {
      if (options.comparison && options.comparison > 0) {
        return "in " + result;
      } else {
        return result + " ago";
      }
    }
    return result;
  };
  var formatDistance_default = formatDistance;

  // node_modules/date-fns/esm/locale/_lib/buildFormatLongFn/index.js
  function buildFormatLongFn(args) {
    return function() {
      var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      var width = options.width ? String(options.width) : args.defaultWidth;
      var format2 = args.formats[width] || args.formats[args.defaultWidth];
      return format2;
    };
  }

  // node_modules/date-fns/esm/locale/en-US/_lib/formatLong/index.js
  var dateFormats = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy"
  };
  var timeFormats = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a"
  };
  var dateTimeFormats = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}"
  };
  var formatLong = {
    date: buildFormatLongFn({
      formats: dateFormats,
      defaultWidth: "full"
    }),
    time: buildFormatLongFn({
      formats: timeFormats,
      defaultWidth: "full"
    }),
    dateTime: buildFormatLongFn({
      formats: dateTimeFormats,
      defaultWidth: "full"
    })
  };
  var formatLong_default = formatLong;

  // node_modules/date-fns/esm/locale/en-US/_lib/formatRelative/index.js
  var formatRelativeLocale = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P"
  };
  var formatRelative = function(token, _date, _baseDate, _options) {
    return formatRelativeLocale[token];
  };
  var formatRelative_default = formatRelative;

  // node_modules/date-fns/esm/locale/_lib/buildLocalizeFn/index.js
  function buildLocalizeFn(args) {
    return function(dirtyIndex, dirtyOptions) {
      var options = dirtyOptions || {};
      var context = options.context ? String(options.context) : "standalone";
      var valuesArray;
      if (context === "formatting" && args.formattingValues) {
        var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
        var width = options.width ? String(options.width) : defaultWidth;
        valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
      } else {
        var _defaultWidth = args.defaultWidth;
        var _width = options.width ? String(options.width) : args.defaultWidth;
        valuesArray = args.values[_width] || args.values[_defaultWidth];
      }
      var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
      return valuesArray[index];
    };
  }

  // node_modules/date-fns/esm/locale/en-US/_lib/localize/index.js
  var eraValues = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"]
  };
  var quarterValues = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
  };
  var monthValues = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    wide: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };
  var dayValues = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  };
  var dayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    }
  };
  var formattingDayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    }
  };
  var ordinalNumber = function(dirtyNumber, _options) {
    var number = Number(dirtyNumber);
    var rem100 = number % 100;
    if (rem100 > 20 || rem100 < 10) {
      switch (rem100 % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "rd";
      }
    }
    return number + "th";
  };
  var localize = {
    ordinalNumber,
    era: buildLocalizeFn({
      values: eraValues,
      defaultWidth: "wide"
    }),
    quarter: buildLocalizeFn({
      values: quarterValues,
      defaultWidth: "wide",
      argumentCallback: function(quarter) {
        return quarter - 1;
      }
    }),
    month: buildLocalizeFn({
      values: monthValues,
      defaultWidth: "wide"
    }),
    day: buildLocalizeFn({
      values: dayValues,
      defaultWidth: "wide"
    }),
    dayPeriod: buildLocalizeFn({
      values: dayPeriodValues,
      defaultWidth: "wide",
      formattingValues: formattingDayPeriodValues,
      defaultFormattingWidth: "wide"
    })
  };
  var localize_default = localize;

  // node_modules/date-fns/esm/locale/_lib/buildMatchFn/index.js
  function buildMatchFn(args) {
    return function(string) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      var width = options.width;
      var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
      var matchResult = string.match(matchPattern);
      if (!matchResult) {
        return null;
      }
      var matchedString = matchResult[0];
      var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
      var key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, function(pattern) {
        return pattern.test(matchedString);
      }) : findKey(parsePatterns, function(pattern) {
        return pattern.test(matchedString);
      });
      var value;
      value = args.valueCallback ? args.valueCallback(key) : key;
      value = options.valueCallback ? options.valueCallback(value) : value;
      var rest = string.slice(matchedString.length);
      return {
        value,
        rest
      };
    };
  }
  function findKey(object, predicate) {
    for (var key in object) {
      if (object.hasOwnProperty(key) && predicate(object[key])) {
        return key;
      }
    }
    return void 0;
  }
  function findIndex(array, predicate) {
    for (var key = 0; key < array.length; key++) {
      if (predicate(array[key])) {
        return key;
      }
    }
    return void 0;
  }

  // node_modules/date-fns/esm/locale/_lib/buildMatchPatternFn/index.js
  function buildMatchPatternFn(args) {
    return function(string) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      var matchResult = string.match(args.matchPattern);
      if (!matchResult)
        return null;
      var matchedString = matchResult[0];
      var parseResult = string.match(args.parsePattern);
      if (!parseResult)
        return null;
      var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
      value = options.valueCallback ? options.valueCallback(value) : value;
      var rest = string.slice(matchedString.length);
      return {
        value,
        rest
      };
    };
  }

  // node_modules/date-fns/esm/locale/en-US/_lib/match/index.js
  var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
  var parseOrdinalNumberPattern = /\d+/i;
  var matchEraPatterns = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i
  };
  var parseEraPatterns = {
    any: [/^b/i, /^(a|c)/i]
  };
  var matchQuarterPatterns = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i
  };
  var parseQuarterPatterns = {
    any: [/1/i, /2/i, /3/i, /4/i]
  };
  var matchMonthPatterns = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
  };
  var parseMonthPatterns = {
    narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
    any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
  };
  var matchDayPatterns = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
  };
  var parseDayPatterns = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
  };
  var matchDayPeriodPatterns = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
  };
  var parseDayPeriodPatterns = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^mi/i,
      noon: /^no/i,
      morning: /morning/i,
      afternoon: /afternoon/i,
      evening: /evening/i,
      night: /night/i
    }
  };
  var match = {
    ordinalNumber: buildMatchPatternFn({
      matchPattern: matchOrdinalNumberPattern,
      parsePattern: parseOrdinalNumberPattern,
      valueCallback: function(value) {
        return parseInt(value, 10);
      }
    }),
    era: buildMatchFn({
      matchPatterns: matchEraPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseEraPatterns,
      defaultParseWidth: "any"
    }),
    quarter: buildMatchFn({
      matchPatterns: matchQuarterPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseQuarterPatterns,
      defaultParseWidth: "any",
      valueCallback: function(index) {
        return index + 1;
      }
    }),
    month: buildMatchFn({
      matchPatterns: matchMonthPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseMonthPatterns,
      defaultParseWidth: "any"
    }),
    day: buildMatchFn({
      matchPatterns: matchDayPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseDayPatterns,
      defaultParseWidth: "any"
    }),
    dayPeriod: buildMatchFn({
      matchPatterns: matchDayPeriodPatterns,
      defaultMatchWidth: "any",
      parsePatterns: parseDayPeriodPatterns,
      defaultParseWidth: "any"
    })
  };
  var match_default = match;

  // node_modules/date-fns/esm/locale/en-US/index.js
  var locale = {
    code: "en-US",
    formatDistance: formatDistance_default,
    formatLong: formatLong_default,
    formatRelative: formatRelative_default,
    localize: localize_default,
    match: match_default,
    options: {
      weekStartsOn: 0,
      firstWeekContainsDate: 1
    }
  };
  var en_US_default = locale;

  // node_modules/date-fns/esm/subMilliseconds/index.js
  function subMilliseconds(dirtyDate, dirtyAmount) {
    requiredArgs(2, arguments);
    var amount = toInteger(dirtyAmount);
    return addMilliseconds(dirtyDate, -amount);
  }

  // node_modules/date-fns/esm/_lib/getUTCDayOfYear/index.js
  var MILLISECONDS_IN_DAY = 864e5;
  function getUTCDayOfYear(dirtyDate) {
    requiredArgs(1, arguments);
    var date = toDate(dirtyDate);
    var timestamp = date.getTime();
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
    var startOfYearTimestamp = date.getTime();
    var difference = timestamp - startOfYearTimestamp;
    return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
  }

  // node_modules/date-fns/esm/_lib/startOfUTCISOWeek/index.js
  function startOfUTCISOWeek(dirtyDate) {
    requiredArgs(1, arguments);
    var weekStartsOn = 1;
    var date = toDate(dirtyDate);
    var day = date.getUTCDay();
    var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    date.setUTCDate(date.getUTCDate() - diff);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  // node_modules/date-fns/esm/_lib/getUTCISOWeekYear/index.js
  function getUTCISOWeekYear(dirtyDate) {
    requiredArgs(1, arguments);
    var date = toDate(dirtyDate);
    var year = date.getUTCFullYear();
    var fourthOfJanuaryOfNextYear = new Date(0);
    fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
    fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
    var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
    var fourthOfJanuaryOfThisYear = new Date(0);
    fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
    fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
    var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);
    if (date.getTime() >= startOfNextYear.getTime()) {
      return year + 1;
    } else if (date.getTime() >= startOfThisYear.getTime()) {
      return year;
    } else {
      return year - 1;
    }
  }

  // node_modules/date-fns/esm/_lib/startOfUTCISOWeekYear/index.js
  function startOfUTCISOWeekYear(dirtyDate) {
    requiredArgs(1, arguments);
    var year = getUTCISOWeekYear(dirtyDate);
    var fourthOfJanuary = new Date(0);
    fourthOfJanuary.setUTCFullYear(year, 0, 4);
    fourthOfJanuary.setUTCHours(0, 0, 0, 0);
    var date = startOfUTCISOWeek(fourthOfJanuary);
    return date;
  }

  // node_modules/date-fns/esm/_lib/getUTCISOWeek/index.js
  var MILLISECONDS_IN_WEEK = 6048e5;
  function getUTCISOWeek(dirtyDate) {
    requiredArgs(1, arguments);
    var date = toDate(dirtyDate);
    var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime();
    return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
  }

  // node_modules/date-fns/esm/_lib/startOfUTCWeek/index.js
  function startOfUTCWeek(dirtyDate, dirtyOptions) {
    requiredArgs(1, arguments);
    var options = dirtyOptions || {};
    var locale2 = options.locale;
    var localeWeekStartsOn = locale2 && locale2.options && locale2.options.weekStartsOn;
    var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
    var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn);
    if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
      throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
    }
    var date = toDate(dirtyDate);
    var day = date.getUTCDay();
    var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    date.setUTCDate(date.getUTCDate() - diff);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }

  // node_modules/date-fns/esm/_lib/getUTCWeekYear/index.js
  function getUTCWeekYear(dirtyDate, dirtyOptions) {
    requiredArgs(1, arguments);
    var date = toDate(dirtyDate);
    var year = date.getUTCFullYear();
    var options = dirtyOptions || {};
    var locale2 = options.locale;
    var localeFirstWeekContainsDate = locale2 && locale2.options && locale2.options.firstWeekContainsDate;
    var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
    var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate);
    if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
      throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
    }
    var firstWeekOfNextYear = new Date(0);
    firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
    firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
    var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, dirtyOptions);
    var firstWeekOfThisYear = new Date(0);
    firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
    firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
    var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, dirtyOptions);
    if (date.getTime() >= startOfNextYear.getTime()) {
      return year + 1;
    } else if (date.getTime() >= startOfThisYear.getTime()) {
      return year;
    } else {
      return year - 1;
    }
  }

  // node_modules/date-fns/esm/_lib/startOfUTCWeekYear/index.js
  function startOfUTCWeekYear(dirtyDate, dirtyOptions) {
    requiredArgs(1, arguments);
    var options = dirtyOptions || {};
    var locale2 = options.locale;
    var localeFirstWeekContainsDate = locale2 && locale2.options && locale2.options.firstWeekContainsDate;
    var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
    var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate);
    var year = getUTCWeekYear(dirtyDate, dirtyOptions);
    var firstWeek = new Date(0);
    firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
    firstWeek.setUTCHours(0, 0, 0, 0);
    var date = startOfUTCWeek(firstWeek, dirtyOptions);
    return date;
  }

  // node_modules/date-fns/esm/_lib/getUTCWeek/index.js
  var MILLISECONDS_IN_WEEK2 = 6048e5;
  function getUTCWeek(dirtyDate, options) {
    requiredArgs(1, arguments);
    var date = toDate(dirtyDate);
    var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime();
    return Math.round(diff / MILLISECONDS_IN_WEEK2) + 1;
  }

  // node_modules/date-fns/esm/_lib/addLeadingZeros/index.js
  function addLeadingZeros(number, targetLength) {
    var sign = number < 0 ? "-" : "";
    var output = Math.abs(number).toString();
    while (output.length < targetLength) {
      output = "0" + output;
    }
    return sign + output;
  }

  // node_modules/date-fns/esm/_lib/format/lightFormatters/index.js
  var formatters = {
    y: function(date, token) {
      var signedYear = date.getUTCFullYear();
      var year = signedYear > 0 ? signedYear : 1 - signedYear;
      return addLeadingZeros(token === "yy" ? year % 100 : year, token.length);
    },
    M: function(date, token) {
      var month = date.getUTCMonth();
      return token === "M" ? String(month + 1) : addLeadingZeros(month + 1, 2);
    },
    d: function(date, token) {
      return addLeadingZeros(date.getUTCDate(), token.length);
    },
    a: function(date, token) {
      var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? "pm" : "am";
      switch (token) {
        case "a":
        case "aa":
          return dayPeriodEnumValue.toUpperCase();
        case "aaa":
          return dayPeriodEnumValue;
        case "aaaaa":
          return dayPeriodEnumValue[0];
        case "aaaa":
        default:
          return dayPeriodEnumValue === "am" ? "a.m." : "p.m.";
      }
    },
    h: function(date, token) {
      return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
    },
    H: function(date, token) {
      return addLeadingZeros(date.getUTCHours(), token.length);
    },
    m: function(date, token) {
      return addLeadingZeros(date.getUTCMinutes(), token.length);
    },
    s: function(date, token) {
      return addLeadingZeros(date.getUTCSeconds(), token.length);
    },
    S: function(date, token) {
      var numberOfDigits = token.length;
      var milliseconds = date.getUTCMilliseconds();
      var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
      return addLeadingZeros(fractionalSeconds, token.length);
    }
  };
  var lightFormatters_default = formatters;

  // node_modules/date-fns/esm/_lib/format/formatters/index.js
  var dayPeriodEnum = {
    am: "am",
    pm: "pm",
    midnight: "midnight",
    noon: "noon",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    night: "night"
  };
  var formatters2 = {
    G: function(date, token, localize2) {
      var era = date.getUTCFullYear() > 0 ? 1 : 0;
      switch (token) {
        case "G":
        case "GG":
        case "GGG":
          return localize2.era(era, {
            width: "abbreviated"
          });
        case "GGGGG":
          return localize2.era(era, {
            width: "narrow"
          });
        case "GGGG":
        default:
          return localize2.era(era, {
            width: "wide"
          });
      }
    },
    y: function(date, token, localize2) {
      if (token === "yo") {
        var signedYear = date.getUTCFullYear();
        var year = signedYear > 0 ? signedYear : 1 - signedYear;
        return localize2.ordinalNumber(year, {
          unit: "year"
        });
      }
      return lightFormatters_default.y(date, token);
    },
    Y: function(date, token, localize2, options) {
      var signedWeekYear = getUTCWeekYear(date, options);
      var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear;
      if (token === "YY") {
        var twoDigitYear = weekYear % 100;
        return addLeadingZeros(twoDigitYear, 2);
      }
      if (token === "Yo") {
        return localize2.ordinalNumber(weekYear, {
          unit: "year"
        });
      }
      return addLeadingZeros(weekYear, token.length);
    },
    R: function(date, token) {
      var isoWeekYear = getUTCISOWeekYear(date);
      return addLeadingZeros(isoWeekYear, token.length);
    },
    u: function(date, token) {
      var year = date.getUTCFullYear();
      return addLeadingZeros(year, token.length);
    },
    Q: function(date, token, localize2) {
      var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
      switch (token) {
        case "Q":
          return String(quarter);
        case "QQ":
          return addLeadingZeros(quarter, 2);
        case "Qo":
          return localize2.ordinalNumber(quarter, {
            unit: "quarter"
          });
        case "QQQ":
          return localize2.quarter(quarter, {
            width: "abbreviated",
            context: "formatting"
          });
        case "QQQQQ":
          return localize2.quarter(quarter, {
            width: "narrow",
            context: "formatting"
          });
        case "QQQQ":
        default:
          return localize2.quarter(quarter, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    q: function(date, token, localize2) {
      var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);
      switch (token) {
        case "q":
          return String(quarter);
        case "qq":
          return addLeadingZeros(quarter, 2);
        case "qo":
          return localize2.ordinalNumber(quarter, {
            unit: "quarter"
          });
        case "qqq":
          return localize2.quarter(quarter, {
            width: "abbreviated",
            context: "standalone"
          });
        case "qqqqq":
          return localize2.quarter(quarter, {
            width: "narrow",
            context: "standalone"
          });
        case "qqqq":
        default:
          return localize2.quarter(quarter, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    M: function(date, token, localize2) {
      var month = date.getUTCMonth();
      switch (token) {
        case "M":
        case "MM":
          return lightFormatters_default.M(date, token);
        case "Mo":
          return localize2.ordinalNumber(month + 1, {
            unit: "month"
          });
        case "MMM":
          return localize2.month(month, {
            width: "abbreviated",
            context: "formatting"
          });
        case "MMMMM":
          return localize2.month(month, {
            width: "narrow",
            context: "formatting"
          });
        case "MMMM":
        default:
          return localize2.month(month, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    L: function(date, token, localize2) {
      var month = date.getUTCMonth();
      switch (token) {
        case "L":
          return String(month + 1);
        case "LL":
          return addLeadingZeros(month + 1, 2);
        case "Lo":
          return localize2.ordinalNumber(month + 1, {
            unit: "month"
          });
        case "LLL":
          return localize2.month(month, {
            width: "abbreviated",
            context: "standalone"
          });
        case "LLLLL":
          return localize2.month(month, {
            width: "narrow",
            context: "standalone"
          });
        case "LLLL":
        default:
          return localize2.month(month, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    w: function(date, token, localize2, options) {
      var week = getUTCWeek(date, options);
      if (token === "wo") {
        return localize2.ordinalNumber(week, {
          unit: "week"
        });
      }
      return addLeadingZeros(week, token.length);
    },
    I: function(date, token, localize2) {
      var isoWeek = getUTCISOWeek(date);
      if (token === "Io") {
        return localize2.ordinalNumber(isoWeek, {
          unit: "week"
        });
      }
      return addLeadingZeros(isoWeek, token.length);
    },
    d: function(date, token, localize2) {
      if (token === "do") {
        return localize2.ordinalNumber(date.getUTCDate(), {
          unit: "date"
        });
      }
      return lightFormatters_default.d(date, token);
    },
    D: function(date, token, localize2) {
      var dayOfYear = getUTCDayOfYear(date);
      if (token === "Do") {
        return localize2.ordinalNumber(dayOfYear, {
          unit: "dayOfYear"
        });
      }
      return addLeadingZeros(dayOfYear, token.length);
    },
    E: function(date, token, localize2) {
      var dayOfWeek = date.getUTCDay();
      switch (token) {
        case "E":
        case "EE":
        case "EEE":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        case "EEEEE":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        case "EEEEEE":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        case "EEEE":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    e: function(date, token, localize2, options) {
      var dayOfWeek = date.getUTCDay();
      var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        case "e":
          return String(localDayOfWeek);
        case "ee":
          return addLeadingZeros(localDayOfWeek, 2);
        case "eo":
          return localize2.ordinalNumber(localDayOfWeek, {
            unit: "day"
          });
        case "eee":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        case "eeeee":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        case "eeeeee":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        case "eeee":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    c: function(date, token, localize2, options) {
      var dayOfWeek = date.getUTCDay();
      var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;
      switch (token) {
        case "c":
          return String(localDayOfWeek);
        case "cc":
          return addLeadingZeros(localDayOfWeek, token.length);
        case "co":
          return localize2.ordinalNumber(localDayOfWeek, {
            unit: "day"
          });
        case "ccc":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "standalone"
          });
        case "ccccc":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "standalone"
          });
        case "cccccc":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "standalone"
          });
        case "cccc":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "standalone"
          });
      }
    },
    i: function(date, token, localize2) {
      var dayOfWeek = date.getUTCDay();
      var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
      switch (token) {
        case "i":
          return String(isoDayOfWeek);
        case "ii":
          return addLeadingZeros(isoDayOfWeek, token.length);
        case "io":
          return localize2.ordinalNumber(isoDayOfWeek, {
            unit: "day"
          });
        case "iii":
          return localize2.day(dayOfWeek, {
            width: "abbreviated",
            context: "formatting"
          });
        case "iiiii":
          return localize2.day(dayOfWeek, {
            width: "narrow",
            context: "formatting"
          });
        case "iiiiii":
          return localize2.day(dayOfWeek, {
            width: "short",
            context: "formatting"
          });
        case "iiii":
        default:
          return localize2.day(dayOfWeek, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    a: function(date, token, localize2) {
      var hours = date.getUTCHours();
      var dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      switch (token) {
        case "a":
        case "aa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "aaa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          }).toLowerCase();
        case "aaaaa":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "aaaa":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    b: function(date, token, localize2) {
      var hours = date.getUTCHours();
      var dayPeriodEnumValue;
      if (hours === 12) {
        dayPeriodEnumValue = dayPeriodEnum.noon;
      } else if (hours === 0) {
        dayPeriodEnumValue = dayPeriodEnum.midnight;
      } else {
        dayPeriodEnumValue = hours / 12 >= 1 ? "pm" : "am";
      }
      switch (token) {
        case "b":
        case "bb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "bbb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          }).toLowerCase();
        case "bbbbb":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "bbbb":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    B: function(date, token, localize2) {
      var hours = date.getUTCHours();
      var dayPeriodEnumValue;
      if (hours >= 17) {
        dayPeriodEnumValue = dayPeriodEnum.evening;
      } else if (hours >= 12) {
        dayPeriodEnumValue = dayPeriodEnum.afternoon;
      } else if (hours >= 4) {
        dayPeriodEnumValue = dayPeriodEnum.morning;
      } else {
        dayPeriodEnumValue = dayPeriodEnum.night;
      }
      switch (token) {
        case "B":
        case "BB":
        case "BBB":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "abbreviated",
            context: "formatting"
          });
        case "BBBBB":
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "narrow",
            context: "formatting"
          });
        case "BBBB":
        default:
          return localize2.dayPeriod(dayPeriodEnumValue, {
            width: "wide",
            context: "formatting"
          });
      }
    },
    h: function(date, token, localize2) {
      if (token === "ho") {
        var hours = date.getUTCHours() % 12;
        if (hours === 0)
          hours = 12;
        return localize2.ordinalNumber(hours, {
          unit: "hour"
        });
      }
      return lightFormatters_default.h(date, token);
    },
    H: function(date, token, localize2) {
      if (token === "Ho") {
        return localize2.ordinalNumber(date.getUTCHours(), {
          unit: "hour"
        });
      }
      return lightFormatters_default.H(date, token);
    },
    K: function(date, token, localize2) {
      var hours = date.getUTCHours() % 12;
      if (token === "Ko") {
        return localize2.ordinalNumber(hours, {
          unit: "hour"
        });
      }
      return addLeadingZeros(hours, token.length);
    },
    k: function(date, token, localize2) {
      var hours = date.getUTCHours();
      if (hours === 0)
        hours = 24;
      if (token === "ko") {
        return localize2.ordinalNumber(hours, {
          unit: "hour"
        });
      }
      return addLeadingZeros(hours, token.length);
    },
    m: function(date, token, localize2) {
      if (token === "mo") {
        return localize2.ordinalNumber(date.getUTCMinutes(), {
          unit: "minute"
        });
      }
      return lightFormatters_default.m(date, token);
    },
    s: function(date, token, localize2) {
      if (token === "so") {
        return localize2.ordinalNumber(date.getUTCSeconds(), {
          unit: "second"
        });
      }
      return lightFormatters_default.s(date, token);
    },
    S: function(date, token) {
      return lightFormatters_default.S(date, token);
    },
    X: function(date, token, _localize, options) {
      var originalDate = options._originalDate || date;
      var timezoneOffset = originalDate.getTimezoneOffset();
      if (timezoneOffset === 0) {
        return "Z";
      }
      switch (token) {
        case "X":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);
        case "XXXX":
        case "XX":
          return formatTimezone(timezoneOffset);
        case "XXXXX":
        case "XXX":
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },
    x: function(date, token, _localize, options) {
      var originalDate = options._originalDate || date;
      var timezoneOffset = originalDate.getTimezoneOffset();
      switch (token) {
        case "x":
          return formatTimezoneWithOptionalMinutes(timezoneOffset);
        case "xxxx":
        case "xx":
          return formatTimezone(timezoneOffset);
        case "xxxxx":
        case "xxx":
        default:
          return formatTimezone(timezoneOffset, ":");
      }
    },
    O: function(date, token, _localize, options) {
      var originalDate = options._originalDate || date;
      var timezoneOffset = originalDate.getTimezoneOffset();
      switch (token) {
        case "O":
        case "OO":
        case "OOO":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        case "OOOO":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },
    z: function(date, token, _localize, options) {
      var originalDate = options._originalDate || date;
      var timezoneOffset = originalDate.getTimezoneOffset();
      switch (token) {
        case "z":
        case "zz":
        case "zzz":
          return "GMT" + formatTimezoneShort(timezoneOffset, ":");
        case "zzzz":
        default:
          return "GMT" + formatTimezone(timezoneOffset, ":");
      }
    },
    t: function(date, token, _localize, options) {
      var originalDate = options._originalDate || date;
      var timestamp = Math.floor(originalDate.getTime() / 1e3);
      return addLeadingZeros(timestamp, token.length);
    },
    T: function(date, token, _localize, options) {
      var originalDate = options._originalDate || date;
      var timestamp = originalDate.getTime();
      return addLeadingZeros(timestamp, token.length);
    }
  };
  function formatTimezoneShort(offset, dirtyDelimiter) {
    var sign = offset > 0 ? "-" : "+";
    var absOffset = Math.abs(offset);
    var hours = Math.floor(absOffset / 60);
    var minutes = absOffset % 60;
    if (minutes === 0) {
      return sign + String(hours);
    }
    var delimiter = dirtyDelimiter || "";
    return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
  }
  function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
    if (offset % 60 === 0) {
      var sign = offset > 0 ? "-" : "+";
      return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
    }
    return formatTimezone(offset, dirtyDelimiter);
  }
  function formatTimezone(offset, dirtyDelimiter) {
    var delimiter = dirtyDelimiter || "";
    var sign = offset > 0 ? "-" : "+";
    var absOffset = Math.abs(offset);
    var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
    var minutes = addLeadingZeros(absOffset % 60, 2);
    return sign + hours + delimiter + minutes;
  }
  var formatters_default = formatters2;

  // node_modules/date-fns/esm/_lib/format/longFormatters/index.js
  function dateLongFormatter(pattern, formatLong2) {
    switch (pattern) {
      case "P":
        return formatLong2.date({
          width: "short"
        });
      case "PP":
        return formatLong2.date({
          width: "medium"
        });
      case "PPP":
        return formatLong2.date({
          width: "long"
        });
      case "PPPP":
      default:
        return formatLong2.date({
          width: "full"
        });
    }
  }
  function timeLongFormatter(pattern, formatLong2) {
    switch (pattern) {
      case "p":
        return formatLong2.time({
          width: "short"
        });
      case "pp":
        return formatLong2.time({
          width: "medium"
        });
      case "ppp":
        return formatLong2.time({
          width: "long"
        });
      case "pppp":
      default:
        return formatLong2.time({
          width: "full"
        });
    }
  }
  function dateTimeLongFormatter(pattern, formatLong2) {
    var matchResult = pattern.match(/(P+)(p+)?/) || [];
    var datePattern = matchResult[1];
    var timePattern = matchResult[2];
    if (!timePattern) {
      return dateLongFormatter(pattern, formatLong2);
    }
    var dateTimeFormat;
    switch (datePattern) {
      case "P":
        dateTimeFormat = formatLong2.dateTime({
          width: "short"
        });
        break;
      case "PP":
        dateTimeFormat = formatLong2.dateTime({
          width: "medium"
        });
        break;
      case "PPP":
        dateTimeFormat = formatLong2.dateTime({
          width: "long"
        });
        break;
      case "PPPP":
      default:
        dateTimeFormat = formatLong2.dateTime({
          width: "full"
        });
        break;
    }
    return dateTimeFormat.replace("{{date}}", dateLongFormatter(datePattern, formatLong2)).replace("{{time}}", timeLongFormatter(timePattern, formatLong2));
  }
  var longFormatters = {
    p: timeLongFormatter,
    P: dateTimeLongFormatter
  };
  var longFormatters_default = longFormatters;

  // node_modules/date-fns/esm/_lib/protectedTokens/index.js
  var protectedDayOfYearTokens = ["D", "DD"];
  var protectedWeekYearTokens = ["YY", "YYYY"];
  function isProtectedDayOfYearToken(token) {
    return protectedDayOfYearTokens.indexOf(token) !== -1;
  }
  function isProtectedWeekYearToken(token) {
    return protectedWeekYearTokens.indexOf(token) !== -1;
  }
  function throwProtectedError(token, format2, input) {
    if (token === "YYYY") {
      throw new RangeError("Use `yyyy` instead of `YYYY` (in `".concat(format2, "`) for formatting years to the input `").concat(input, "`; see: https://git.io/fxCyr"));
    } else if (token === "YY") {
      throw new RangeError("Use `yy` instead of `YY` (in `".concat(format2, "`) for formatting years to the input `").concat(input, "`; see: https://git.io/fxCyr"));
    } else if (token === "D") {
      throw new RangeError("Use `d` instead of `D` (in `".concat(format2, "`) for formatting days of the month to the input `").concat(input, "`; see: https://git.io/fxCyr"));
    } else if (token === "DD") {
      throw new RangeError("Use `dd` instead of `DD` (in `".concat(format2, "`) for formatting days of the month to the input `").concat(input, "`; see: https://git.io/fxCyr"));
    }
  }

  // node_modules/date-fns/esm/format/index.js
  var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g;
  var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
  var escapedStringRegExp = /^'([^]*?)'?$/;
  var doubleQuoteRegExp = /''/g;
  var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
  function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
    requiredArgs(2, arguments);
    var formatStr = String(dirtyFormatStr);
    var options = dirtyOptions || {};
    var locale2 = options.locale || en_US_default;
    var localeFirstWeekContainsDate = locale2.options && locale2.options.firstWeekContainsDate;
    var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
    var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate);
    if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
      throw new RangeError("firstWeekContainsDate must be between 1 and 7 inclusively");
    }
    var localeWeekStartsOn = locale2.options && locale2.options.weekStartsOn;
    var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
    var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn);
    if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
      throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
    }
    if (!locale2.localize) {
      throw new RangeError("locale must contain localize property");
    }
    if (!locale2.formatLong) {
      throw new RangeError("locale must contain formatLong property");
    }
    var originalDate = toDate(dirtyDate);
    if (!isValid(originalDate)) {
      throw new RangeError("Invalid time value");
    }
    var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
    var utcDate = subMilliseconds(originalDate, timezoneOffset);
    var formatterOptions = {
      firstWeekContainsDate,
      weekStartsOn,
      locale: locale2,
      _originalDate: originalDate
    };
    var result = formatStr.match(longFormattingTokensRegExp).map(function(substring) {
      var firstCharacter = substring[0];
      if (firstCharacter === "p" || firstCharacter === "P") {
        var longFormatter = longFormatters_default[firstCharacter];
        return longFormatter(substring, locale2.formatLong, formatterOptions);
      }
      return substring;
    }).join("").match(formattingTokensRegExp).map(function(substring) {
      if (substring === "''") {
        return "'";
      }
      var firstCharacter = substring[0];
      if (firstCharacter === "'") {
        return cleanEscapedString(substring);
      }
      var formatter = formatters_default[firstCharacter];
      if (formatter) {
        if (!options.useAdditionalWeekYearTokens && isProtectedWeekYearToken(substring)) {
          throwProtectedError(substring, dirtyFormatStr, dirtyDate);
        }
        if (!options.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(substring)) {
          throwProtectedError(substring, dirtyFormatStr, dirtyDate);
        }
        return formatter(utcDate, substring, locale2.localize, formatterOptions);
      }
      if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
        throw new RangeError("Format string contains an unescaped latin alphabet character `" + firstCharacter + "`");
      }
      return substring;
    }).join("");
    return result;
  }
  function cleanEscapedString(input) {
    return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
  }

  // node_modules/date-fns/esm/_lib/assign/index.js
  function assign2(target, dirtyObject) {
    if (target == null) {
      throw new TypeError("assign requires that input parameter not be null or undefined");
    }
    dirtyObject = dirtyObject || {};
    for (var property in dirtyObject) {
      if (Object.prototype.hasOwnProperty.call(dirtyObject, property)) {
        target[property] = dirtyObject[property];
      }
    }
    return target;
  }

  // node_modules/date-fns/esm/_lib/cloneObject/index.js
  function cloneObject(dirtyObject) {
    return assign2({}, dirtyObject);
  }

  // node_modules/date-fns/esm/formatDistanceStrict/index.js
  var MILLISECONDS_IN_MINUTE = 1e3 * 60;
  var MINUTES_IN_DAY = 60 * 24;
  var MINUTES_IN_MONTH = MINUTES_IN_DAY * 30;
  var MINUTES_IN_YEAR = MINUTES_IN_DAY * 365;
  function formatDistanceStrict(dirtyDate, dirtyBaseDate) {
    var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    requiredArgs(2, arguments);
    var locale2 = options.locale || en_US_default;
    if (!locale2.formatDistance) {
      throw new RangeError("locale must contain localize.formatDistance property");
    }
    var comparison = compareAsc(dirtyDate, dirtyBaseDate);
    if (isNaN(comparison)) {
      throw new RangeError("Invalid time value");
    }
    var localizeOptions = cloneObject(options);
    localizeOptions.addSuffix = Boolean(options.addSuffix);
    localizeOptions.comparison = comparison;
    var dateLeft;
    var dateRight;
    if (comparison > 0) {
      dateLeft = toDate(dirtyBaseDate);
      dateRight = toDate(dirtyDate);
    } else {
      dateLeft = toDate(dirtyDate);
      dateRight = toDate(dirtyBaseDate);
    }
    var roundingMethod = options.roundingMethod == null ? "round" : String(options.roundingMethod);
    var roundingMethodFn;
    if (roundingMethod === "floor") {
      roundingMethodFn = Math.floor;
    } else if (roundingMethod === "ceil") {
      roundingMethodFn = Math.ceil;
    } else if (roundingMethod === "round") {
      roundingMethodFn = Math.round;
    } else {
      throw new RangeError("roundingMethod must be 'floor', 'ceil' or 'round'");
    }
    var milliseconds = dateRight.getTime() - dateLeft.getTime();
    var minutes = milliseconds / MILLISECONDS_IN_MINUTE;
    var timezoneOffset = getTimezoneOffsetInMilliseconds(dateRight) - getTimezoneOffsetInMilliseconds(dateLeft);
    var dstNormalizedMinutes = (milliseconds - timezoneOffset) / MILLISECONDS_IN_MINUTE;
    var unit;
    if (options.unit == null) {
      if (minutes < 1) {
        unit = "second";
      } else if (minutes < 60) {
        unit = "minute";
      } else if (minutes < MINUTES_IN_DAY) {
        unit = "hour";
      } else if (dstNormalizedMinutes < MINUTES_IN_MONTH) {
        unit = "day";
      } else if (dstNormalizedMinutes < MINUTES_IN_YEAR) {
        unit = "month";
      } else {
        unit = "year";
      }
    } else {
      unit = String(options.unit);
    }
    if (unit === "second") {
      var seconds = roundingMethodFn(milliseconds / 1e3);
      return locale2.formatDistance("xSeconds", seconds, localizeOptions);
    } else if (unit === "minute") {
      var roundedMinutes = roundingMethodFn(minutes);
      return locale2.formatDistance("xMinutes", roundedMinutes, localizeOptions);
    } else if (unit === "hour") {
      var hours = roundingMethodFn(minutes / 60);
      return locale2.formatDistance("xHours", hours, localizeOptions);
    } else if (unit === "day") {
      var days = roundingMethodFn(dstNormalizedMinutes / MINUTES_IN_DAY);
      return locale2.formatDistance("xDays", days, localizeOptions);
    } else if (unit === "month") {
      var months = roundingMethodFn(dstNormalizedMinutes / MINUTES_IN_MONTH);
      return months === 12 && options.unit !== "month" ? locale2.formatDistance("xYears", 1, localizeOptions) : locale2.formatDistance("xMonths", months, localizeOptions);
    } else if (unit === "year") {
      var years = roundingMethodFn(dstNormalizedMinutes / MINUTES_IN_YEAR);
      return locale2.formatDistance("xYears", years, localizeOptions);
    }
    throw new RangeError("unit must be 'second', 'minute', 'hour', 'day', 'month' or 'year'");
  }

  // node_modules/date-fns/esm/formatDistanceToNowStrict/index.js
  function formatDistanceToNowStrict(dirtyDate, dirtyOptions) {
    requiredArgs(1, arguments);
    return formatDistanceStrict(dirtyDate, Date.now(), dirtyOptions);
  }

  // client/util.js
  var import_localforage = __toModule(require_localforage());
  var setRoute = (...parts) => {
    window.location.hash = "#/" + parts.map(encodeURIComponent).join("/");
  };
  var formatDateRelative = (dt) => formatDistanceToNowStrict(dt, { addSuffix: true });
  var formatDate = (dt) => `${format(dt, "yyyy-MM-dd HH:mm:ss")} (${formatDateRelative(dt)})`;
  var metricPrefixes = ["", "k", "M", "G", "T", "P", "E", "Z", "Y"];
  var applyMetricPrefix = (x, unit) => {
    let log = Math.log10(x);
    let exp = x !== 0 ? Math.floor(log / 3) : 0;
    let val = x / Math.pow(10, exp * 3);
    return (exp !== 0 ? val.toFixed(3 - (log - exp * 3)) : val) + metricPrefixes[exp] + unit;
  };
  var keyboardShortcuts = {};
  var registerShortcut = (key, handler) => {
    keyboardShortcuts[key] = handler;
  };
  window.addEventListener("keydown", (ev) => {
    if (ev.altKey && ev.key in keyboardShortcuts) {
      keyboardShortcuts[ev.key](ev);
      ev.preventDefault();
    }
  });
  var draftsStorage = import_localforage.default.createInstance({
    name: "drafts"
  });
  var generalStorage = import_localforage.default.createInstance({
    name: "general"
  });
  var submitIfEnterKey = (fn) => (ev) => {
    if (ev.key === "Enter") {
      fn();
    }
  };

  // client/View.svelte
  function create_default_slot_2(ctx) {
    let t;
    return {
      c() {
        t = text("Edit");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot_1(ctx) {
    let t;
    return {
      c() {
        t = text("Revisions");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot(ctx) {
    let t_value = ctx[1].title + "";
    let t;
    return {
      c() {
        t = text(t_value);
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 2 && t_value !== (t_value = ctx2[1].title + ""))
          set_data(t, t_value);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block2(ctx) {
    let div;
    let t0;
    let t1_value = formatDate(ctx[1].revision.time) + "";
    let t1;
    let t2;
    let t3;
    let details;
    let summary;
    let t5;
    let pre;
    let code;
    let t6_value = ctx[1].content + "";
    let t6;
    return {
      c() {
        div = element("div");
        t0 = text("Version from ");
        t1 = text(t1_value);
        t2 = text(".");
        t3 = space();
        details = element("details");
        summary = element("summary");
        summary.textContent = "View source";
        t5 = space();
        pre = element("pre");
        code = element("code");
        t6 = text(t6_value);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, t0);
        append(div, t1);
        append(div, t2);
        insert(target, t3, anchor);
        insert(target, details, anchor);
        append(details, summary);
        append(details, t5);
        append(details, pre);
        append(pre, code);
        append(code, t6);
      },
      p(ctx2, dirty) {
        if (dirty & 2 && t1_value !== (t1_value = formatDate(ctx2[1].revision.time) + ""))
          set_data(t1, t1_value);
        if (dirty & 2 && t6_value !== (t6_value = ctx2[1].content + ""))
          set_data(t6, t6_value);
      },
      d(detaching) {
        if (detaching)
          detach(div);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(details);
      }
    };
  }
  function create_fragment3(ctx) {
    let nav;
    let linkbutton0;
    let t0;
    let linkbutton1;
    let t1;
    let iconheader;
    let t2;
    let t3;
    let html_tag;
    let raw_value = ctx[1].rendered_content + "";
    let html_anchor;
    let current;
    linkbutton0 = new LinkButton_default({
      props: {
        href: "#/page/" + ctx[0] + "/edit",
        color: "#75bbfd",
        $$slots: { default: [create_default_slot_2] },
        $$scope: { ctx }
      }
    });
    linkbutton1 = new LinkButton_default({
      props: {
        href: "#/page/" + ctx[0] + "/revisions",
        color: "#f97306",
        $$slots: { default: [create_default_slot_1] },
        $$scope: { ctx }
      }
    });
    iconheader = new IconHeader_default({
      props: {
        page: ctx[1],
        $$slots: { default: [create_default_slot] },
        $$scope: { ctx }
      }
    });
    let if_block = ctx[1].revision && create_if_block2(ctx);
    return {
      c() {
        nav = element("nav");
        create_component(linkbutton0.$$.fragment);
        t0 = space();
        create_component(linkbutton1.$$.fragment);
        t1 = space();
        create_component(iconheader.$$.fragment);
        t2 = space();
        if (if_block)
          if_block.c();
        t3 = space();
        html_tag = new HtmlTag();
        html_anchor = empty();
        html_tag.a = html_anchor;
      },
      m(target, anchor) {
        insert(target, nav, anchor);
        mount_component(linkbutton0, nav, null);
        append(nav, t0);
        mount_component(linkbutton1, nav, null);
        insert(target, t1, anchor);
        mount_component(iconheader, target, anchor);
        insert(target, t2, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, t3, anchor);
        html_tag.m(raw_value, target, anchor);
        insert(target, html_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        const linkbutton0_changes = {};
        if (dirty & 1)
          linkbutton0_changes.href = "#/page/" + ctx2[0] + "/edit";
        if (dirty & 4) {
          linkbutton0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        linkbutton0.$set(linkbutton0_changes);
        const linkbutton1_changes = {};
        if (dirty & 1)
          linkbutton1_changes.href = "#/page/" + ctx2[0] + "/revisions";
        if (dirty & 4) {
          linkbutton1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        linkbutton1.$set(linkbutton1_changes);
        const iconheader_changes = {};
        if (dirty & 2)
          iconheader_changes.page = ctx2[1];
        if (dirty & 6) {
          iconheader_changes.$$scope = { dirty, ctx: ctx2 };
        }
        iconheader.$set(iconheader_changes);
        if (ctx2[1].revision) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block2(ctx2);
            if_block.c();
            if_block.m(t3.parentNode, t3);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        if ((!current || dirty & 2) && raw_value !== (raw_value = ctx2[1].rendered_content + ""))
          html_tag.p(raw_value);
      },
      i(local) {
        if (current)
          return;
        transition_in(linkbutton0.$$.fragment, local);
        transition_in(linkbutton1.$$.fragment, local);
        transition_in(iconheader.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(linkbutton0.$$.fragment, local);
        transition_out(linkbutton1.$$.fragment, local);
        transition_out(iconheader.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(nav);
        destroy_component(linkbutton0);
        destroy_component(linkbutton1);
        if (detaching)
          detach(t1);
        destroy_component(iconheader, detaching);
        if (detaching)
          detach(t2);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(html_anchor);
        if (detaching)
          html_tag.d();
      }
    };
  }
  function instance3($$self, $$props, $$invalidate) {
    let { id } = $$props;
    let { page } = $$props;
    $$self.$$set = ($$props2) => {
      if ("id" in $$props2)
        $$invalidate(0, id = $$props2.id);
      if ("page" in $$props2)
        $$invalidate(1, page = $$props2.page);
    };
    return [id, page];
  }
  var View = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance3, create_fragment3, safe_not_equal, { id: 0, page: 1 });
    }
  };
  var View_default = View;

  // client/Loading.svelte
  function create_fragment4(ctx) {
    let span;
    let t;
    return {
      c() {
        span = element("span");
        t = text(ctx[0]);
        attr(span, "class", "spinner svelte-15te7uy");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        append(span, t);
      },
      p(ctx2, [dirty]) {
        if (dirty & 1)
          set_data(t, ctx2[0]);
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(span);
      }
    };
  }
  function instance4($$self, $$props, $$invalidate) {
    let { operation = "Loading" } = $$props;
    $$self.$$set = ($$props2) => {
      if ("operation" in $$props2)
        $$invalidate(0, operation = $$props2.operation);
    };
    return [operation];
  }
  var Loading = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance4, create_fragment4, safe_not_equal, { operation: 0 });
    }
  };
  var Loading_default = Loading;

  // client/Error.svelte
  function create_fragment5(ctx) {
    let div;
    let current;
    const default_slot_template = ctx[1].default;
    const default_slot = create_slot(default_slot_template, ctx, ctx[0], null);
    return {
      c() {
        div = element("div");
        if (default_slot)
          default_slot.c();
        attr(div, "class", "error svelte-jra88m");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (default_slot) {
          default_slot.m(div, null);
        }
        current = true;
      },
      p(ctx2, [dirty]) {
        if (default_slot) {
          if (default_slot.p && (!current || dirty & 1)) {
            update_slot(default_slot, default_slot_template, ctx2, ctx2[0], !current ? -1 : dirty, null, null);
          }
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        if (default_slot)
          default_slot.d(detaching);
      }
    };
  }
  function instance5($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    $$self.$$set = ($$props2) => {
      if ("$$scope" in $$props2)
        $$invalidate(0, $$scope = $$props2.$$scope);
    };
    return [$$scope, slots];
  }
  var Error2 = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance5, create_fragment5, safe_not_equal, {});
    }
  };
  var Error_default = Error2;

  // client/rpc.js
  var rpc_default = async (cmd, args) => {
    const req = await fetch("/api", { method: "POST", body: JSON.stringify({ [cmd]: args }), headers: { "Content-Type": "application/json" } });
    if (!req.ok) {
      var text2 = await req.text();
      try {
        var errdata = JSON.parse(text2);
      } catch (e) {
        var err = Error(text2);
        err.code = req.statusCode;
        err.statusText = req.statusText;
        throw err;
      }
      var err = Error(errdata[Object.keys(errdata)[0]]);
      err.type = Object.keys(errdata)[0];
      err.arg = errdata[Object.keys(errdata)[0]];
      throw err;
    }
    const data = JSON.parse(await req.text());
    console.log(data);
    return data[Object.keys(data)[0]];
  };

  // client/LargeButton.svelte
  function create_fragment6(ctx) {
    let button;
    let button_style_value;
    let current;
    let mounted;
    let dispose;
    const default_slot_template = ctx[3].default;
    const default_slot = create_slot(default_slot_template, ctx, ctx[2], null);
    return {
      c() {
        button = element("button");
        if (default_slot)
          default_slot.c();
        attr(button, "style", button_style_value = `background-color: ${ctx[1]}`);
        attr(button, "class", "svelte-1reicna");
      },
      m(target, anchor) {
        insert(target, button, anchor);
        if (default_slot) {
          default_slot.m(button, null);
        }
        current = true;
        if (!mounted) {
          dispose = listen(button, "click", function() {
            if (is_function(ctx[0]))
              ctx[0].apply(this, arguments);
          });
          mounted = true;
        }
      },
      p(new_ctx, [dirty]) {
        ctx = new_ctx;
        if (default_slot) {
          if (default_slot.p && (!current || dirty & 4)) {
            update_slot(default_slot, default_slot_template, ctx, ctx[2], !current ? -1 : dirty, null, null);
          }
        }
        if (!current || dirty & 2 && button_style_value !== (button_style_value = `background-color: ${ctx[1]}`)) {
          attr(button, "style", button_style_value);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(button);
        if (default_slot)
          default_slot.d(detaching);
        mounted = false;
        dispose();
      }
    };
  }
  function instance6($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    let { onclick } = $$props;
    let { color } = $$props;
    $$self.$$set = ($$props2) => {
      if ("onclick" in $$props2)
        $$invalidate(0, onclick = $$props2.onclick);
      if ("color" in $$props2)
        $$invalidate(1, color = $$props2.color);
      if ("$$scope" in $$props2)
        $$invalidate(2, $$scope = $$props2.$$scope);
    };
    return [onclick, color, $$scope, slots];
  }
  var LargeButton = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance6, create_fragment6, safe_not_equal, { onclick: 0, color: 1 });
    }
  };
  var LargeButton_default = LargeButton;

  // client/Edit.svelte
  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[1] = list[i][0];
    child_ctx[32] = list[i][1];
    return child_ctx;
  }
  function get_each_context_1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[35] = list[i][0];
    child_ctx[36] = list[i][1];
    return child_ctx;
  }
  function get_each_context_2(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[32] = list[i];
    return child_ctx;
  }
  function create_default_slot_8(ctx) {
    let t;
    return {
      c() {
        t = text("View");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot_7(ctx) {
    let t;
    return {
      c() {
        t = text("Revisions");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot_6(ctx) {
    let t0;
    let t1_value = ctx[0].title + "";
    let t1;
    return {
      c() {
        t0 = text("Editing ");
        t1 = text(t1_value);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, t1, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 1 && t1_value !== (t1_value = ctx2[0].title + ""))
          set_data(t1, t1_value);
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(t1);
      }
    };
  }
  function create_default_slot_5(ctx) {
    let t;
    return {
      c() {
        t = text("Save");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot_4(ctx) {
    let t;
    return {
      c() {
        t = text("Done");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot_3(ctx) {
    let t;
    return {
      c() {
        t = text("Add File");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block_11(ctx) {
    let largebutton;
    let current;
    largebutton = new LargeButton_default({
      props: {
        onclick: ctx[20],
        color: "#ff796c",
        $$slots: { default: [create_default_slot_22] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        create_component(largebutton.$$.fragment);
      },
      m(target, anchor) {
        mount_component(largebutton, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const largebutton_changes = {};
        if (dirty[1] & 1024) {
          largebutton_changes.$$scope = { dirty, ctx: ctx2 };
        }
        largebutton.$set(largebutton_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(largebutton.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(largebutton.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(largebutton, detaching);
      }
    };
  }
  function create_default_slot_22(ctx) {
    let t;
    return {
      c() {
        t = text("Load Draft");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block_10(ctx) {
    let loading;
    let current;
    loading = new Loading_default({ props: { operation: "Saving" } });
    return {
      c() {
        create_component(loading.$$.fragment);
      },
      m(target, anchor) {
        mount_component(loading, target, anchor);
        current = true;
      },
      i(local) {
        if (current)
          return;
        transition_in(loading.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(loading.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(loading, detaching);
      }
    };
  }
  function create_if_block_9(ctx) {
    let t;
    let error_1;
    let current;
    error_1 = new Error_default({
      props: {
        $$slots: { default: [create_default_slot_12] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        t = space();
        create_component(error_1.$$.fragment);
      },
      m(target, anchor) {
        insert(target, t, anchor);
        mount_component(error_1, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const error_1_changes = {};
        if (dirty[0] & 8 | dirty[1] & 1024) {
          error_1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        error_1.$set(error_1_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(error_1.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(error_1.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(t);
        destroy_component(error_1, detaching);
      }
    };
  }
  function create_default_slot_12(ctx) {
    let t;
    return {
      c() {
        t = text(ctx[3]);
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 8)
          set_data(t, ctx2[3]);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block_6(ctx) {
    let if_block_anchor;
    function select_block_type(ctx2, dirty) {
      if (ctx2[7].error)
        return create_if_block_7;
      if (ctx2[7].progress)
        return create_if_block_8;
    }
    let current_block_type = select_block_type(ctx, [-1, -1]);
    let if_block = current_block_type && current_block_type(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, dirty) {
        if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if (if_block)
            if_block.d(1);
          if_block = current_block_type && current_block_type(ctx2);
          if (if_block) {
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        }
      },
      d(detaching) {
        if (if_block) {
          if_block.d(detaching);
        }
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function create_if_block_8(ctx) {
    let div;
    let progress;
    let progress_value_value;
    return {
      c() {
        div = element("div");
        progress = element("progress");
        attr(progress, "min", "0");
        attr(progress, "max", "1");
        progress.value = progress_value_value = ctx[7].progress;
        attr(progress, "class", "svelte-7rp4g8");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, progress);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 128 && progress_value_value !== (progress_value_value = ctx2[7].progress)) {
          progress.value = progress_value_value;
        }
      },
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function create_if_block_7(ctx) {
    let div;
    let t0;
    let t1_value = ctx[7].error + "";
    let t1;
    return {
      c() {
        div = element("div");
        t0 = text("Failed to upload: code ");
        t1 = text(t1_value);
        attr(div, "class", "error");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, t0);
        append(div, t1);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 128 && t1_value !== (t1_value = ctx2[7].error + ""))
          set_data(t1, t1_value);
      },
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function create_if_block_5(ctx) {
    let div;
    let t0;
    let t1_value = formatDate(ctx[5].ts) + "";
    let t1;
    let t2;
    return {
      c() {
        div = element("div");
        t0 = text("Draft from ");
        t1 = text(t1_value);
        t2 = text(".");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, t0);
        append(div, t1);
        append(div, t2);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 32 && t1_value !== (t1_value = formatDate(ctx2[5].ts) + ""))
          set_data(t1, t1_value);
      },
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function create_if_block_3(ctx) {
    let h2;
    let t1;
    let select;
    let option;
    let option_value_value;
    let mounted;
    let dispose;
    let each_value_2 = Object.values(ctx[8]);
    let each_blocks = [];
    for (let i = 0; i < each_value_2.length; i += 1) {
      each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    }
    return {
      c() {
        h2 = element("h2");
        h2.textContent = "Files";
        t1 = text("\nPage icon:\n    ");
        select = element("select");
        option = element("option");
        option.textContent = "(none)";
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        option.__value = option_value_value = null;
        option.value = option.__value;
        if (ctx[0].icon_filename === void 0)
          add_render_callback(() => ctx[23].call(select));
      },
      m(target, anchor) {
        insert(target, h2, anchor);
        insert(target, t1, anchor);
        insert(target, select, anchor);
        append(select, option);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(select, null);
        }
        select_option(select, ctx[0].icon_filename);
        if (!mounted) {
          dispose = [
            listen(select, "change", ctx[23]),
            listen(select, "blur", ctx[24])
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty[0] & 256) {
          each_value_2 = Object.values(ctx2[8]);
          let i;
          for (i = 0; i < each_value_2.length; i += 1) {
            const child_ctx = get_each_context_2(ctx2, each_value_2, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block_2(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(select, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value_2.length;
        }
        if (dirty[0] & 257) {
          select_option(select, ctx2[0].icon_filename);
        }
      },
      d(detaching) {
        if (detaching)
          detach(h2);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(select);
        destroy_each(each_blocks, detaching);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_4(ctx) {
    let option;
    let t_value = ctx[32].filename + "";
    let t;
    let option_value_value;
    return {
      c() {
        option = element("option");
        t = text(t_value);
        option.__value = option_value_value = ctx[32].filename;
        option.value = option.__value;
      },
      m(target, anchor) {
        insert(target, option, anchor);
        append(option, t);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 256 && t_value !== (t_value = ctx2[32].filename + ""))
          set_data(t, t_value);
        if (dirty[0] & 256 && option_value_value !== (option_value_value = ctx2[32].filename)) {
          option.__value = option_value_value;
          option.value = option.__value;
        }
      },
      d(detaching) {
        if (detaching)
          detach(option);
      }
    };
  }
  function create_each_block_2(ctx) {
    let if_block_anchor;
    let if_block = ctx[32].type === "image" && create_if_block_4(ctx);
    return {
      c() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, dirty) {
        if (ctx2[32].type === "image") {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block_4(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function create_default_slot2(ctx) {
    let t;
    return {
      c() {
        t = text("Delete");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_each_block_1(ctx) {
    let li;
    let t0_value = ctx[35] + "";
    let t0;
    let t1;
    let t2_value = ctx[36] + "";
    let t2;
    return {
      c() {
        li = element("li");
        t0 = text(t0_value);
        t1 = text(": ");
        t2 = text(t2_value);
      },
      m(target, anchor) {
        insert(target, li, anchor);
        append(li, t0);
        append(li, t1);
        append(li, t2);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 256 && t0_value !== (t0_value = ctx2[35] + ""))
          set_data(t0, t0_value);
        if (dirty[0] & 256 && t2_value !== (t2_value = ctx2[36] + ""))
          set_data(t2, t2_value);
      },
      d(detaching) {
        if (detaching)
          detach(li);
      }
    };
  }
  function create_else_block2(ctx) {
    let t;
    return {
      c() {
        t = text("No preview available; click to view/download");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block_22(ctx) {
    let video;
    let video_src_value;
    let video_alt_value;
    return {
      c() {
        video = element("video");
        if (video.src !== (video_src_value = ctx[32].path))
          attr(video, "src", video_src_value);
        attr(video, "alt", video_alt_value = ctx[32].filename);
        attr(video, "class", "file svelte-7rp4g8");
        video.controls = true;
      },
      m(target, anchor) {
        insert(target, video, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 256 && video.src !== (video_src_value = ctx2[32].path)) {
          attr(video, "src", video_src_value);
        }
        if (dirty[0] & 256 && video_alt_value !== (video_alt_value = ctx2[32].filename)) {
          attr(video, "alt", video_alt_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(video);
      }
    };
  }
  function create_if_block_12(ctx) {
    let audio;
    let audio_src_value;
    let audio_alt_value;
    return {
      c() {
        audio = element("audio");
        if (audio.src !== (audio_src_value = ctx[32].path))
          attr(audio, "src", audio_src_value);
        attr(audio, "alt", audio_alt_value = ctx[32].filename);
        attr(audio, "class", "file svelte-7rp4g8");
        audio.controls = true;
      },
      m(target, anchor) {
        insert(target, audio, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 256 && audio.src !== (audio_src_value = ctx2[32].path)) {
          attr(audio, "src", audio_src_value);
        }
        if (dirty[0] & 256 && audio_alt_value !== (audio_alt_value = ctx2[32].filename)) {
          attr(audio, "alt", audio_alt_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(audio);
      }
    };
  }
  function create_if_block3(ctx) {
    let img;
    let img_src_value;
    let img_alt_value;
    return {
      c() {
        img = element("img");
        if (img.src !== (img_src_value = ctx[32].path))
          attr(img, "src", img_src_value);
        attr(img, "alt", img_alt_value = ctx[32].filename);
        attr(img, "class", "file svelte-7rp4g8");
      },
      m(target, anchor) {
        insert(target, img, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 256 && img.src !== (img_src_value = ctx2[32].path)) {
          attr(img, "src", img_src_value);
        }
        if (dirty[0] & 256 && img_alt_value !== (img_alt_value = ctx2[32].filename)) {
          attr(img, "alt", img_alt_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(img);
      }
    };
  }
  function create_key_block(ctx) {
    let li3;
    let div;
    let largebutton;
    let t0;
    let a0;
    let t1_value = ctx[32].filename + "";
    let t1;
    let t2;
    let ul;
    let li0;
    let t3;
    let t4_value = applyMetricPrefix(ctx[32].size, "B") + "";
    let t4;
    let t5;
    let li1;
    let t6;
    let t7_value = ctx[32].mime_type + "";
    let t7;
    let t8;
    let li2;
    let t9;
    let t10_value = formatDate(ctx[32].created) + "";
    let t10;
    let t11;
    let t12;
    let a1;
    let a1_href_value;
    let t13;
    let current;
    let mounted;
    let dispose;
    function func() {
      return ctx[25](ctx[1]);
    }
    largebutton = new LargeButton_default({
      props: {
        onclick: func,
        color: "#ff5b00",
        $$slots: { default: [create_default_slot2] },
        $$scope: { ctx }
      }
    });
    function click_handler() {
      return ctx[26](ctx[32]);
    }
    let each_value_1 = Object.entries(ctx[32].metadata);
    let each_blocks = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    }
    function select_block_type_1(ctx2, dirty) {
      if (ctx2[32].type == "image")
        return create_if_block3;
      if (ctx2[32].type == "audio")
        return create_if_block_12;
      if (ctx2[32].type == "video")
        return create_if_block_22;
      return create_else_block2;
    }
    let current_block_type = select_block_type_1(ctx, [-1, -1]);
    let if_block = current_block_type(ctx);
    return {
      c() {
        li3 = element("li");
        div = element("div");
        create_component(largebutton.$$.fragment);
        t0 = space();
        a0 = element("a");
        t1 = text(t1_value);
        t2 = space();
        ul = element("ul");
        li0 = element("li");
        t3 = text("Size: ");
        t4 = text(t4_value);
        t5 = space();
        li1 = element("li");
        t6 = text("MIME type: ");
        t7 = text(t7_value);
        t8 = space();
        li2 = element("li");
        t9 = text("Uploaded: ");
        t10 = text(t10_value);
        t11 = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t12 = space();
        a1 = element("a");
        if_block.c();
        t13 = space();
        attr(a0, "href", "#");
        attr(div, "class", "info svelte-7rp4g8");
        attr(a1, "href", a1_href_value = ctx[32].path);
        attr(li3, "class", "file svelte-7rp4g8");
      },
      m(target, anchor) {
        insert(target, li3, anchor);
        append(li3, div);
        mount_component(largebutton, div, null);
        append(div, t0);
        append(div, a0);
        append(a0, t1);
        append(div, t2);
        append(div, ul);
        append(ul, li0);
        append(li0, t3);
        append(li0, t4);
        append(ul, t5);
        append(ul, li1);
        append(li1, t6);
        append(li1, t7);
        append(ul, t8);
        append(ul, li2);
        append(li2, t9);
        append(li2, t10);
        append(ul, t11);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
        append(li3, t12);
        append(li3, a1);
        if_block.m(a1, null);
        append(li3, t13);
        current = true;
        if (!mounted) {
          dispose = listen(a0, "click", prevent_default(click_handler));
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const largebutton_changes = {};
        if (dirty[0] & 256)
          largebutton_changes.onclick = func;
        if (dirty[1] & 1024) {
          largebutton_changes.$$scope = { dirty, ctx };
        }
        largebutton.$set(largebutton_changes);
        if ((!current || dirty[0] & 256) && t1_value !== (t1_value = ctx[32].filename + ""))
          set_data(t1, t1_value);
        if ((!current || dirty[0] & 256) && t4_value !== (t4_value = applyMetricPrefix(ctx[32].size, "B") + ""))
          set_data(t4, t4_value);
        if ((!current || dirty[0] & 256) && t7_value !== (t7_value = ctx[32].mime_type + ""))
          set_data(t7, t7_value);
        if ((!current || dirty[0] & 256) && t10_value !== (t10_value = formatDate(ctx[32].created) + ""))
          set_data(t10, t10_value);
        if (dirty[0] & 256) {
          each_value_1 = Object.entries(ctx[32].metadata);
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_1(ctx, each_value_1, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block_1(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(ul, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value_1.length;
        }
        if (current_block_type === (current_block_type = select_block_type_1(ctx, dirty)) && if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block.d(1);
          if_block = current_block_type(ctx);
          if (if_block) {
            if_block.c();
            if_block.m(a1, null);
          }
        }
        if (!current || dirty[0] & 256 && a1_href_value !== (a1_href_value = ctx[32].path)) {
          attr(a1, "href", a1_href_value);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(largebutton.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(largebutton.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(li3);
        destroy_component(largebutton);
        destroy_each(each_blocks, detaching);
        if_block.d();
        mounted = false;
        dispose();
      }
    };
  }
  function create_each_block(ctx) {
    let previous_key = ctx[1];
    let key_block_anchor;
    let current;
    let key_block = create_key_block(ctx);
    return {
      c() {
        key_block.c();
        key_block_anchor = empty();
      },
      m(target, anchor) {
        key_block.m(target, anchor);
        insert(target, key_block_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty[0] & 256 && safe_not_equal(previous_key, previous_key = ctx2[1])) {
          group_outros();
          transition_out(key_block, 1, 1, noop);
          check_outros();
          key_block = create_key_block(ctx2);
          key_block.c();
          transition_in(key_block);
          key_block.m(key_block_anchor.parentNode, key_block_anchor);
        } else {
          key_block.p(ctx2, dirty);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(key_block);
        current = true;
      },
      o(local) {
        transition_out(key_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(key_block_anchor);
        key_block.d(detaching);
      }
    };
  }
  function create_fragment7(ctx) {
    let nav;
    let linkbutton0;
    let t0;
    let linkbutton1;
    let t1;
    let iconheader;
    let t2;
    let textarea;
    let t3;
    let largebutton0;
    let t4;
    let largebutton1;
    let t5;
    let largebutton2;
    let t6;
    let t7;
    let t8;
    let t9;
    let div4;
    let div0;
    let t10_value = applyMetricPrefix(ctx[4], "") + "";
    let t10;
    let t11;
    let t12;
    let div1;
    let t13_value = applyMetricPrefix(ctx[2].length, " ") + "";
    let t13;
    let t14;
    let t15;
    let div2;
    let t16_value = applyMetricPrefix(ctx[10](ctx[2]), "") + "";
    let t16;
    let t17;
    let t18;
    let div3;
    let t19_value = applyMetricPrefix(ctx[11](ctx[2]), "") + "";
    let t19;
    let t20;
    let t21;
    let t22;
    let t23;
    let show_if = Object.entries(ctx[8]).length > 0;
    let t24;
    let ul;
    let current;
    let mounted;
    let dispose;
    linkbutton0 = new LinkButton_default({
      props: {
        href: "#/page/" + ctx[1] + "/",
        color: "#76cd26",
        $$slots: { default: [create_default_slot_8] },
        $$scope: { ctx }
      }
    });
    linkbutton1 = new LinkButton_default({
      props: {
        href: "#/page/" + ctx[1] + "/revisions",
        color: "#f97306",
        $$slots: { default: [create_default_slot_7] },
        $$scope: { ctx }
      }
    });
    iconheader = new IconHeader_default({
      props: {
        page: ctx[0],
        $$slots: { default: [create_default_slot_6] },
        $$scope: { ctx }
      }
    });
    largebutton0 = new LargeButton_default({
      props: {
        onclick: ctx[12],
        color: "#06c2ac",
        $$slots: { default: [create_default_slot_5] },
        $$scope: { ctx }
      }
    });
    largebutton1 = new LargeButton_default({
      props: {
        onclick: ctx[13],
        color: "#bf77f6",
        $$slots: { default: [create_default_slot_4] },
        $$scope: { ctx }
      }
    });
    largebutton2 = new LargeButton_default({
      props: {
        onclick: ctx[14],
        color: "#fcb001",
        $$slots: { default: [create_default_slot_3] },
        $$scope: { ctx }
      }
    });
    let if_block0 = ctx[5] && create_if_block_11(ctx);
    let if_block1 = ctx[6] && create_if_block_10(ctx);
    let if_block2 = ctx[3] && create_if_block_9(ctx);
    let if_block3 = ctx[7] && create_if_block_6(ctx);
    let if_block4 = ctx[5] && create_if_block_5(ctx);
    let if_block5 = show_if && create_if_block_3(ctx);
    let each_value = Object.entries(ctx[8]);
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        nav = element("nav");
        create_component(linkbutton0.$$.fragment);
        t0 = space();
        create_component(linkbutton1.$$.fragment);
        t1 = space();
        create_component(iconheader.$$.fragment);
        t2 = space();
        textarea = element("textarea");
        t3 = space();
        create_component(largebutton0.$$.fragment);
        t4 = space();
        create_component(largebutton1.$$.fragment);
        t5 = space();
        create_component(largebutton2.$$.fragment);
        t6 = space();
        if (if_block0)
          if_block0.c();
        t7 = space();
        if (if_block1)
          if_block1.c();
        t8 = space();
        if (if_block2)
          if_block2.c();
        t9 = space();
        div4 = element("div");
        div0 = element("div");
        t10 = text(t10_value);
        t11 = text(" keypresses");
        t12 = space();
        div1 = element("div");
        t13 = text(t13_value);
        t14 = text(" chars");
        t15 = space();
        div2 = element("div");
        t16 = text(t16_value);
        t17 = text(" words");
        t18 = space();
        div3 = element("div");
        t19 = text(t19_value);
        t20 = text(" lines");
        t21 = space();
        if (if_block3)
          if_block3.c();
        t22 = space();
        if (if_block4)
          if_block4.c();
        t23 = space();
        if (if_block5)
          if_block5.c();
        t24 = space();
        ul = element("ul");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(textarea, "class", "editor svelte-7rp4g8");
        attr(div4, "class", "info");
        attr(ul, "class", "files");
      },
      m(target, anchor) {
        insert(target, nav, anchor);
        mount_component(linkbutton0, nav, null);
        append(nav, t0);
        mount_component(linkbutton1, nav, null);
        insert(target, t1, anchor);
        mount_component(iconheader, target, anchor);
        insert(target, t2, anchor);
        insert(target, textarea, anchor);
        set_input_value(textarea, ctx[2]);
        ctx[22](textarea);
        insert(target, t3, anchor);
        mount_component(largebutton0, target, anchor);
        insert(target, t4, anchor);
        mount_component(largebutton1, target, anchor);
        insert(target, t5, anchor);
        mount_component(largebutton2, target, anchor);
        insert(target, t6, anchor);
        if (if_block0)
          if_block0.m(target, anchor);
        insert(target, t7, anchor);
        if (if_block1)
          if_block1.m(target, anchor);
        insert(target, t8, anchor);
        if (if_block2)
          if_block2.m(target, anchor);
        insert(target, t9, anchor);
        insert(target, div4, anchor);
        append(div4, div0);
        append(div0, t10);
        append(div0, t11);
        append(div4, t12);
        append(div4, div1);
        append(div1, t13);
        append(div1, t14);
        append(div4, t15);
        append(div4, div2);
        append(div2, t16);
        append(div2, t17);
        append(div4, t18);
        append(div4, div3);
        append(div3, t19);
        append(div3, t20);
        insert(target, t21, anchor);
        if (if_block3)
          if_block3.m(target, anchor);
        insert(target, t22, anchor);
        if (if_block4)
          if_block4.m(target, anchor);
        insert(target, t23, anchor);
        if (if_block5)
          if_block5.m(target, anchor);
        insert(target, t24, anchor);
        insert(target, ul, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
        current = true;
        if (!mounted) {
          dispose = [
            listen(textarea, "input", ctx[21]),
            listen(textarea, "keydown", ctx[19]),
            listen(textarea, "keypress", ctx[18])
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        const linkbutton0_changes = {};
        if (dirty[0] & 2)
          linkbutton0_changes.href = "#/page/" + ctx2[1] + "/";
        if (dirty[1] & 1024) {
          linkbutton0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        linkbutton0.$set(linkbutton0_changes);
        const linkbutton1_changes = {};
        if (dirty[0] & 2)
          linkbutton1_changes.href = "#/page/" + ctx2[1] + "/revisions";
        if (dirty[1] & 1024) {
          linkbutton1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        linkbutton1.$set(linkbutton1_changes);
        const iconheader_changes = {};
        if (dirty[0] & 1)
          iconheader_changes.page = ctx2[0];
        if (dirty[0] & 1 | dirty[1] & 1024) {
          iconheader_changes.$$scope = { dirty, ctx: ctx2 };
        }
        iconheader.$set(iconheader_changes);
        if (dirty[0] & 4) {
          set_input_value(textarea, ctx2[2]);
        }
        const largebutton0_changes = {};
        if (dirty[1] & 1024) {
          largebutton0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        largebutton0.$set(largebutton0_changes);
        const largebutton1_changes = {};
        if (dirty[1] & 1024) {
          largebutton1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        largebutton1.$set(largebutton1_changes);
        const largebutton2_changes = {};
        if (dirty[1] & 1024) {
          largebutton2_changes.$$scope = { dirty, ctx: ctx2 };
        }
        largebutton2.$set(largebutton2_changes);
        if (ctx2[5]) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
            if (dirty[0] & 32) {
              transition_in(if_block0, 1);
            }
          } else {
            if_block0 = create_if_block_11(ctx2);
            if_block0.c();
            transition_in(if_block0, 1);
            if_block0.m(t7.parentNode, t7);
          }
        } else if (if_block0) {
          group_outros();
          transition_out(if_block0, 1, 1, () => {
            if_block0 = null;
          });
          check_outros();
        }
        if (ctx2[6]) {
          if (if_block1) {
            if (dirty[0] & 64) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block_10(ctx2);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(t8.parentNode, t8);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });
          check_outros();
        }
        if (ctx2[3]) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
            if (dirty[0] & 8) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block_9(ctx2);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(t9.parentNode, t9);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, () => {
            if_block2 = null;
          });
          check_outros();
        }
        if ((!current || dirty[0] & 16) && t10_value !== (t10_value = applyMetricPrefix(ctx2[4], "") + ""))
          set_data(t10, t10_value);
        if ((!current || dirty[0] & 4) && t13_value !== (t13_value = applyMetricPrefix(ctx2[2].length, " ") + ""))
          set_data(t13, t13_value);
        if ((!current || dirty[0] & 4) && t16_value !== (t16_value = applyMetricPrefix(ctx2[10](ctx2[2]), "") + ""))
          set_data(t16, t16_value);
        if ((!current || dirty[0] & 4) && t19_value !== (t19_value = applyMetricPrefix(ctx2[11](ctx2[2]), "") + ""))
          set_data(t19, t19_value);
        if (ctx2[7]) {
          if (if_block3) {
            if_block3.p(ctx2, dirty);
          } else {
            if_block3 = create_if_block_6(ctx2);
            if_block3.c();
            if_block3.m(t22.parentNode, t22);
          }
        } else if (if_block3) {
          if_block3.d(1);
          if_block3 = null;
        }
        if (ctx2[5]) {
          if (if_block4) {
            if_block4.p(ctx2, dirty);
          } else {
            if_block4 = create_if_block_5(ctx2);
            if_block4.c();
            if_block4.m(t23.parentNode, t23);
          }
        } else if (if_block4) {
          if_block4.d(1);
          if_block4 = null;
        }
        if (dirty[0] & 256)
          show_if = Object.entries(ctx2[8]).length > 0;
        if (show_if) {
          if (if_block5) {
            if_block5.p(ctx2, dirty);
          } else {
            if_block5 = create_if_block_3(ctx2);
            if_block5.c();
            if_block5.m(t24.parentNode, t24);
          }
        } else if (if_block5) {
          if_block5.d(1);
          if_block5 = null;
        }
        if (dirty[0] & 196864) {
          each_value = Object.entries(ctx2[8]);
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(ul, null);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(linkbutton0.$$.fragment, local);
        transition_in(linkbutton1.$$.fragment, local);
        transition_in(iconheader.$$.fragment, local);
        transition_in(largebutton0.$$.fragment, local);
        transition_in(largebutton1.$$.fragment, local);
        transition_in(largebutton2.$$.fragment, local);
        transition_in(if_block0);
        transition_in(if_block1);
        transition_in(if_block2);
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        transition_out(linkbutton0.$$.fragment, local);
        transition_out(linkbutton1.$$.fragment, local);
        transition_out(iconheader.$$.fragment, local);
        transition_out(largebutton0.$$.fragment, local);
        transition_out(largebutton1.$$.fragment, local);
        transition_out(largebutton2.$$.fragment, local);
        transition_out(if_block0);
        transition_out(if_block1);
        transition_out(if_block2);
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(nav);
        destroy_component(linkbutton0);
        destroy_component(linkbutton1);
        if (detaching)
          detach(t1);
        destroy_component(iconheader, detaching);
        if (detaching)
          detach(t2);
        if (detaching)
          detach(textarea);
        ctx[22](null);
        if (detaching)
          detach(t3);
        destroy_component(largebutton0, detaching);
        if (detaching)
          detach(t4);
        destroy_component(largebutton1, detaching);
        if (detaching)
          detach(t5);
        destroy_component(largebutton2, detaching);
        if (detaching)
          detach(t6);
        if (if_block0)
          if_block0.d(detaching);
        if (detaching)
          detach(t7);
        if (if_block1)
          if_block1.d(detaching);
        if (detaching)
          detach(t8);
        if (if_block2)
          if_block2.d(detaching);
        if (detaching)
          detach(t9);
        if (detaching)
          detach(div4);
        if (detaching)
          detach(t21);
        if (if_block3)
          if_block3.d(detaching);
        if (detaching)
          detach(t22);
        if (if_block4)
          if_block4.d(detaching);
        if (detaching)
          detach(t23);
        if (if_block5)
          if_block5.d(detaching);
        if (detaching)
          detach(t24);
        if (detaching)
          detach(ul);
        destroy_each(each_blocks, detaching);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance7($$self, $$props, $$invalidate) {
    let { id } = $$props;
    let { page } = $$props;
    let content = page.content;
    let error;
    let keypresses = 0;
    let draft;
    const wordCount = (s) => {
      let words = 0;
      for (const possibleWord of s.split(/\s+/)) {
        if (/[^#*+>|`-]/.test(possibleWord)) {
          words += 1;
        }
      }
      return words;
    };
    const lineCount = (s) => s.split("\n").length;
    let timer;
    let saving = false;
    const save = async () => {
      if (saving) {
        return;
      }
      $$invalidate(6, saving = true);
      $$invalidate(3, error = null);
      $$invalidate(5, draft = null);
      if (timer)
        clearInterval(timer);
      try {
        await rpc_default("UpdatePage", [id, content]);
        $$invalidate(3, error = null);
        $$invalidate(6, saving = false);
        return true;
      } catch (e) {
        $$invalidate(3, error = e);
        $$invalidate(6, saving = false);
        return false;
      }
    };
    const done = async () => {
      if (await save())
        setRoute("page", id);
    };
    let uploadState = null;
    const extantFiles = {};
    for (const file of Object.values(page.files)) {
      extantFiles[file.filename] = file;
      file.path = `/file/${file.page}/${encodeURIComponent(file.filename)}`;
      file.type = file.mime_type.split("/")[0];
    }
    const upload = (files) => {
      $$invalidate(7, uploadState = { progress: 0 });
      let data = new FormData();
      for (const file of files) {
        data.set(file.name, file);
      }
      let request = new XMLHttpRequest();
      request.open("POST", "/api/upload/" + id);
      request.upload.addEventListener("progress", (e) => {
        pendingFiles[thisID].progress = e.loaded / e.total;
      });
      request.addEventListener("load", (e) => {
        if (request.status !== 200) {
          $$invalidate(7, uploadState.error = request.status, uploadState);
          console.log(request.response);
        } else {
          const ret = JSON.parse(request.response);
          for (const file of ret) {
            file.path = `/file/${id}/${encodeURIComponent(file.filename)}`;
            file.type = file.mime_type.split("/")[0];
            $$invalidate(8, extantFiles[file.filename] = file, extantFiles);
          }
          $$invalidate(7, uploadState = null);
        }
      });
      request.send(data);
    };
    const addFile = async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.click();
      input.oninput = (ev) => {
        upload(Array.from(ev.target.files));
      };
    };
    const setIcon = async (icon) => {
      await rpc_default("SetIcon", [id, icon]);
    };
    let editorTextarea;
    const insertFileIntoDocument = (file) => {
      console.log(file);
      const start = editorTextarea.value.slice(0, editorTextarea.selectionStart) + `[`;
      $$invalidate(9, editorTextarea.value = start + `](${file.path})` + editorTextarea.value.slice(editorTextarea.selectionEnd), editorTextarea);
      editorTextarea.focus();
      $$invalidate(9, editorTextarea.selectionEnd = $$invalidate(9, editorTextarea.selectionStart = start.length, editorTextarea), editorTextarea);
    };
    const deleteFile = async (filename) => {
      await rpc_default("DeleteFile", [id, filename]);
      delete extantFiles[filename];
      $$invalidate(8, extantFiles);
    };
    let lastDraft;
    const runSave = () => {
      const now = Date.now();
      lastDraft = now;
      console.log("saved draft");
      draftsStorage.setItem(id, { ts: now, content });
    };
    const saveDraft = () => {
      const now = Date.now();
      if (!lastDraft || now - lastDraft > 5e3) {
        runSave();
      } else {
        if (timer)
          clearInterval(timer);
        timer = setTimeout(runSave, 5e3);
      }
    };
    const textareaKeypress = (ev) => {
      const editor = ev.target;
      const selStart = editor.selectionStart;
      const selEnd = editor.selectionEnd;
      if (selStart !== selEnd)
        return;
      const search = "\n" + editor.value.substr(0, selStart);
      const lastLineStart = search.lastIndexOf("\n") + 1;
      const nextLineStart = selStart + (editor.value.substr(selStart) + "\n").indexOf("\n");
      if (ev.code === "Enter") {
        if (ev.ctrlKey) {
          done();
          return;
        }
        const line = search.substr(lastLineStart);
        const match2 = /^(\s*)(([*+-])|(\d+)([).]))(\s*)/.exec(line);
        if (match2) {
          const lineStart = match2[1] + (match2[4] ? (parseInt(match2[4]) + 1).toString() + match2[5] : match2[2]) + match2[6];
          const contentAfterCursor = editor.value.slice(selStart, nextLineStart);
          const prev = editor.value.substr(0, selStart) + "\n" + lineStart;
          editor.value = prev + contentAfterCursor + editor.value.substr(nextLineStart);
          editor.selectionStart = editor.selectionEnd = prev.length;
          ev.preventDefault();
        }
      }
      $$invalidate(4, keypresses++, keypresses);
      saveDraft();
    };
    const textareaKeydown = (ev) => {
      const editor = ev.target;
      const selStart = editor.selectionStart;
      const selEnd = editor.selectionEnd;
      if (selStart !== selEnd)
        return;
      const search = "\n" + editor.value.substr(0, selStart);
      const lastLineStart = search.lastIndexOf("\n");
      const nextLineStart = selStart + (editor.value.substr(selStart) + "\n").indexOf("\n");
      if (ev.code === "Backspace") {
        const re = /^\s*([*+-]|\d+[).])\s*$/y;
        if (re.test(editor.value.slice(lastLineStart, selStart))) {
          const before = editor.value.substr(0, lastLineStart);
          const after = editor.value.substr(selStart);
          editor.value = before + after;
          editor.selectionStart = editor.selectionEnd = before.length;
          ev.preventDefault();
        }
      } else if (ev.code === "Tab") {
        const match2 = /^(\s*)([*+-]|\d+[).])/.exec(editor.value.slice(lastLineStart, nextLineStart));
        let line = editor.value.substr(lastLineStart);
        if (ev.shiftKey) {
          line = line.replace(/^  /, "");
        } else {
          line = "  " + line;
        }
        if (match2) {
          editor.value = editor.value.substr(0, lastLineStart) + line;
          editor.selectionStart = editor.selectionEnd = selStart + (ev.shiftKey ? -2 : 2);
          ev.preventDefault();
        }
      }
      saveDraft();
    };
    draftsStorage.getItem(id).then((newDraft) => {
      if (newDraft) {
        if (!page || !page.updated || page.updated < newDraft.ts) {
          console.log("draft from", formatDate(newDraft.ts));
          $$invalidate(5, draft = newDraft);
        }
      }
    });
    const loadDraft = () => {
      if (draft) {
        $$invalidate(2, content = draft.content);
      }
    };
    registerShortcut("Enter", done);
    registerShortcut("s", save);
    function textarea_input_handler() {
      content = this.value;
      $$invalidate(2, content);
    }
    function textarea_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        editorTextarea = $$value;
        $$invalidate(9, editorTextarea);
      });
    }
    function select_change_handler() {
      page.icon_filename = select_value(this);
      $$invalidate(0, page);
      $$invalidate(8, extantFiles);
    }
    const blur_handler = (ev) => setIcon(ev.target.value);
    const func = (id2) => deleteFile(id2);
    const click_handler = (file) => insertFileIntoDocument(file);
    $$self.$$set = ($$props2) => {
      if ("id" in $$props2)
        $$invalidate(1, id = $$props2.id);
      if ("page" in $$props2)
        $$invalidate(0, page = $$props2.page);
    };
    return [
      page,
      id,
      content,
      error,
      keypresses,
      draft,
      saving,
      uploadState,
      extantFiles,
      editorTextarea,
      wordCount,
      lineCount,
      save,
      done,
      addFile,
      setIcon,
      insertFileIntoDocument,
      deleteFile,
      textareaKeypress,
      textareaKeydown,
      loadDraft,
      textarea_input_handler,
      textarea_binding,
      select_change_handler,
      blur_handler,
      func,
      click_handler
    ];
  }
  var Edit = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance7, create_fragment7, safe_not_equal, { id: 1, page: 0 }, [-1, -1]);
    }
  };
  var Edit_default = Edit;

  // client/DeleteButton.svelte
  function create_fragment8(ctx) {
    let span;
    let mounted;
    let dispose;
    return {
      c() {
        span = element("span");
        span.textContent = "\u{1F7AA}";
        attr(span, "title", "Remove");
        attr(span, "class", "svelte-1bvbbg5");
      },
      m(target, anchor) {
        insert(target, span, anchor);
        if (!mounted) {
          dispose = listen(span, "click", function() {
            if (is_function(ctx[0]))
              ctx[0].apply(this, arguments);
          });
          mounted = true;
        }
      },
      p(new_ctx, [dirty]) {
        ctx = new_ctx;
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(span);
        mounted = false;
        dispose();
      }
    };
  }
  function instance8($$self, $$props, $$invalidate) {
    let { onclick } = $$props;
    $$self.$$set = ($$props2) => {
      if ("onclick" in $$props2)
        $$invalidate(0, onclick = $$props2.onclick);
    };
    return [onclick];
  }
  var DeleteButton = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance8, create_fragment8, safe_not_equal, { onclick: 0 });
    }
  };
  var DeleteButton_default = DeleteButton;

  // client/Create.svelte
  function get_each_context2(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[10] = list[i];
    return child_ctx;
  }
  function create_each_block2(ctx) {
    let li;
    let deletebutton;
    let a;
    let t0;
    let t1_value = ctx[10] + "";
    let t1;
    let a_href_value;
    let current;
    function func() {
      return ctx[8](ctx[10]);
    }
    deletebutton = new DeleteButton_default({ props: { onclick: func } });
    return {
      c() {
        li = element("li");
        create_component(deletebutton.$$.fragment);
        a = element("a");
        t0 = text("#");
        t1 = text(t1_value);
        attr(a, "class", "wikilink tag");
        attr(a, "href", a_href_value = `#/search/${encodeURIComponent("#" + ctx[10])}`);
      },
      m(target, anchor) {
        insert(target, li, anchor);
        mount_component(deletebutton, li, null);
        append(li, a);
        append(a, t0);
        append(a, t1);
        current = true;
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const deletebutton_changes = {};
        if (dirty & 2)
          deletebutton_changes.onclick = func;
        deletebutton.$set(deletebutton_changes);
        if ((!current || dirty & 2) && t1_value !== (t1_value = ctx[10] + ""))
          set_data(t1, t1_value);
        if (!current || dirty & 2 && a_href_value !== (a_href_value = `#/search/${encodeURIComponent("#" + ctx[10])}`)) {
          attr(a, "href", a_href_value);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(deletebutton.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(deletebutton.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(li);
        destroy_component(deletebutton);
      }
    };
  }
  function create_default_slot_23(ctx) {
    let t;
    return {
      c() {
        t = text("Done");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block4(ctx) {
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    const if_block_creators = [create_if_block_13, create_else_block3];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[3].type === "Conflict")
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if_blocks[current_block_type_index].m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if_blocks[current_block_type_index].d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function create_else_block3(ctx) {
    let error_1;
    let current;
    error_1 = new Error_default({
      props: {
        $$slots: { default: [create_default_slot_13] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        create_component(error_1.$$.fragment);
      },
      m(target, anchor) {
        mount_component(error_1, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const error_1_changes = {};
        if (dirty & 8200) {
          error_1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        error_1.$set(error_1_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(error_1.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(error_1.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(error_1, detaching);
      }
    };
  }
  function create_if_block_13(ctx) {
    let error_1;
    let current;
    error_1 = new Error_default({
      props: {
        $$slots: { default: [create_default_slot3] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        create_component(error_1.$$.fragment);
      },
      m(target, anchor) {
        mount_component(error_1, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const error_1_changes = {};
        if (dirty & 8201) {
          error_1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        error_1.$set(error_1_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(error_1.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(error_1.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(error_1, detaching);
      }
    };
  }
  function create_default_slot_13(ctx) {
    let t;
    return {
      c() {
        t = text(ctx[3]);
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 8)
          set_data(t, ctx2[3]);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot3(ctx) {
    let t0;
    let a;
    let t1;
    let a_href_value;
    let t2;
    return {
      c() {
        t0 = text("Page already exists: ");
        a = element("a");
        t1 = text(ctx[0]);
        t2 = text(".");
        attr(a, "class", "wikilink");
        attr(a, "href", a_href_value = "#/page/" + ctx[3].arg);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, a, anchor);
        append(a, t1);
        insert(target, t2, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 1)
          set_data(t1, ctx2[0]);
        if (dirty & 8 && a_href_value !== (a_href_value = "#/page/" + ctx2[3].arg)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(a);
        if (detaching)
          detach(t2);
      }
    };
  }
  function create_fragment9(ctx) {
    let h1;
    let t1;
    let input0;
    let t2;
    let br0;
    let t3;
    let h2;
    let t5;
    let ul;
    let t6;
    let input1;
    let button;
    let t8;
    let br1;
    let t9;
    let largebutton;
    let t10;
    let if_block_anchor;
    let current;
    let mounted;
    let dispose;
    let each_value = ctx[1];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block2(get_each_context2(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    largebutton = new LargeButton_default({
      props: {
        onclick: ctx[4],
        color: "#bf77f6",
        $$slots: { default: [create_default_slot_23] },
        $$scope: { ctx }
      }
    });
    let if_block = ctx[3] && create_if_block4(ctx);
    return {
      c() {
        h1 = element("h1");
        h1.textContent = "Create Page";
        t1 = space();
        input0 = element("input");
        t2 = space();
        br0 = element("br");
        t3 = space();
        h2 = element("h2");
        h2.textContent = "Tags";
        t5 = space();
        ul = element("ul");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t6 = space();
        input1 = element("input");
        button = element("button");
        button.textContent = "+";
        t8 = space();
        br1 = element("br");
        t9 = space();
        create_component(largebutton.$$.fragment);
        t10 = space();
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
        attr(input0, "class", "title svelte-10fo6jd");
        attr(input1, "type", "text");
        attr(input1, "placeholder", "add another");
        attr(ul, "class", "inline");
      },
      m(target, anchor) {
        insert(target, h1, anchor);
        insert(target, t1, anchor);
        insert(target, input0, anchor);
        set_input_value(input0, ctx[0]);
        insert(target, t2, anchor);
        insert(target, br0, anchor);
        insert(target, t3, anchor);
        insert(target, h2, anchor);
        insert(target, t5, anchor);
        insert(target, ul, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
        append(ul, t6);
        append(ul, input1);
        set_input_value(input1, ctx[2]);
        append(ul, button);
        insert(target, t8, anchor);
        insert(target, br1, anchor);
        insert(target, t9, anchor);
        mount_component(largebutton, target, anchor);
        insert(target, t10, anchor);
        if (if_block)
          if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
        if (!mounted) {
          dispose = [
            listen(input0, "input", ctx[7]),
            listen(input1, "input", ctx[9]),
            listen(input1, "keydown", submitIfEnterKey(ctx[5])),
            listen(button, "click", ctx[5])
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & 1 && input0.value !== ctx2[0]) {
          set_input_value(input0, ctx2[0]);
        }
        if (dirty & 66) {
          each_value = ctx2[1];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context2(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block2(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(ul, t6);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
        if (dirty & 4 && input1.value !== ctx2[2]) {
          set_input_value(input1, ctx2[2]);
        }
        const largebutton_changes = {};
        if (dirty & 8192) {
          largebutton_changes.$$scope = { dirty, ctx: ctx2 };
        }
        largebutton.$set(largebutton_changes);
        if (ctx2[3]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 8) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block4(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(largebutton.$$.fragment, local);
        transition_in(if_block);
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(largebutton.$$.fragment, local);
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(h1);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(input0);
        if (detaching)
          detach(t2);
        if (detaching)
          detach(br0);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(h2);
        if (detaching)
          detach(t5);
        if (detaching)
          detach(ul);
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(t8);
        if (detaching)
          detach(br1);
        if (detaching)
          detach(t9);
        destroy_component(largebutton, detaching);
        if (detaching)
          detach(t10);
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(if_block_anchor);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance9($$self, $$props, $$invalidate) {
    let { title = "" } = $$props;
    let { tags = [] } = $$props;
    let newTag = "";
    let error;
    const done = async () => {
      try {
        const newID = await rpc_default("CreatePage", [title, tags]);
        $$invalidate(3, error = null);
        setRoute("page", newID, "edit");
      } catch (e) {
        $$invalidate(3, error = e);
      }
    };
    const addTag = () => {
      tags.push(newTag);
      $$invalidate(1, tags);
      $$invalidate(2, newTag = "");
    };
    const removeTag = (tag) => {
      $$invalidate(1, tags = tags.filter((x) => x !== tag));
    };
    function input0_input_handler() {
      title = this.value;
      $$invalidate(0, title);
    }
    const func = (tag) => removeTag(tag);
    function input1_input_handler() {
      newTag = this.value;
      $$invalidate(2, newTag);
    }
    $$self.$$set = ($$props2) => {
      if ("title" in $$props2)
        $$invalidate(0, title = $$props2.title);
      if ("tags" in $$props2)
        $$invalidate(1, tags = $$props2.tags);
    };
    return [
      title,
      tags,
      newTag,
      error,
      done,
      addTag,
      removeTag,
      input0_input_handler,
      func,
      input1_input_handler
    ];
  }
  var Create = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance9, create_fragment9, safe_not_equal, { title: 0, tags: 1 });
    }
  };
  var Create_default = Create;

  // client/RevisionHistory.svelte
  function get_each_context3(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[3] = list[i];
    return child_ctx;
  }
  function create_if_block_102(ctx) {
    let nav;
    let linkbutton0;
    let t0;
    let linkbutton1;
    let t1;
    let iconheader;
    let current;
    linkbutton0 = new LinkButton_default({
      props: {
        href: "#/page/" + ctx[1] + "/view",
        color: "#76cd26",
        $$slots: { default: [create_default_slot_24] },
        $$scope: { ctx }
      }
    });
    linkbutton1 = new LinkButton_default({
      props: {
        href: "#/page/" + ctx[1] + "/edit",
        color: "#75bbfd",
        $$slots: { default: [create_default_slot_14] },
        $$scope: { ctx }
      }
    });
    iconheader = new IconHeader_default({
      props: {
        page: ctx[0],
        $$slots: { default: [create_default_slot4] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        nav = element("nav");
        create_component(linkbutton0.$$.fragment);
        t0 = space();
        create_component(linkbutton1.$$.fragment);
        t1 = space();
        create_component(iconheader.$$.fragment);
      },
      m(target, anchor) {
        insert(target, nav, anchor);
        mount_component(linkbutton0, nav, null);
        append(nav, t0);
        mount_component(linkbutton1, nav, null);
        insert(target, t1, anchor);
        mount_component(iconheader, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const linkbutton0_changes = {};
        if (dirty & 2)
          linkbutton0_changes.href = "#/page/" + ctx2[1] + "/view";
        if (dirty & 64) {
          linkbutton0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        linkbutton0.$set(linkbutton0_changes);
        const linkbutton1_changes = {};
        if (dirty & 2)
          linkbutton1_changes.href = "#/page/" + ctx2[1] + "/edit";
        if (dirty & 64) {
          linkbutton1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        linkbutton1.$set(linkbutton1_changes);
        const iconheader_changes = {};
        if (dirty & 1)
          iconheader_changes.page = ctx2[0];
        if (dirty & 65) {
          iconheader_changes.$$scope = { dirty, ctx: ctx2 };
        }
        iconheader.$set(iconheader_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(linkbutton0.$$.fragment, local);
        transition_in(linkbutton1.$$.fragment, local);
        transition_in(iconheader.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(linkbutton0.$$.fragment, local);
        transition_out(linkbutton1.$$.fragment, local);
        transition_out(iconheader.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(nav);
        destroy_component(linkbutton0);
        destroy_component(linkbutton1);
        if (detaching)
          detach(t1);
        destroy_component(iconheader, detaching);
      }
    };
  }
  function create_default_slot_24(ctx) {
    let t;
    return {
      c() {
        t = text("View");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot_14(ctx) {
    let t;
    return {
      c() {
        t = text("Edit");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot4(ctx) {
    let t_value = ctx[0].title + "";
    let t;
    return {
      c() {
        t = text(t_value);
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 1 && t_value !== (t_value = ctx2[0].title + ""))
          set_data(t, t_value);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block_92(ctx) {
    let a;
    let t_value = ctx[3].pageData.title + "";
    let t;
    let a_href_value;
    return {
      c() {
        a = element("a");
        t = text(t_value);
        attr(a, "class", "wikilink");
        attr(a, "href", a_href_value = `#/page/${ctx[3].page}`);
      },
      m(target, anchor) {
        insert(target, a, anchor);
        append(a, t);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t_value !== (t_value = ctx2[3].pageData.title + ""))
          set_data(t, t_value);
        if (dirty & 4 && a_href_value !== (a_href_value = `#/page/${ctx2[3].page}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(a);
      }
    };
  }
  function create_if_block_82(ctx) {
    let t0;
    let a;
    let t1_value = ctx[3].ty.SetIconFilename + "";
    let t1;
    let a_href_value;
    let t2;
    return {
      c() {
        t0 = text("Set icon to ");
        a = element("a");
        t1 = text(t1_value);
        t2 = text(".");
        attr(a, "href", a_href_value = `/file/${ctx[3].page}/${encodeURIComponent(ctx[3].ty.SetIconFilename)}`);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, a, anchor);
        append(a, t1);
        insert(target, t2, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t1_value !== (t1_value = ctx2[3].ty.SetIconFilename + ""))
          set_data(t1, t1_value);
        if (dirty & 4 && a_href_value !== (a_href_value = `/file/${ctx2[3].page}/${encodeURIComponent(ctx2[3].ty.SetIconFilename)}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(a);
        if (detaching)
          detach(t2);
      }
    };
  }
  function create_if_block_72(ctx) {
    let t0;
    let t1_value = ctx[3].ty.RemoveFile + "";
    let t1;
    let t2;
    return {
      c() {
        t0 = text("Removed file ");
        t1 = text(t1_value);
        t2 = text(".");
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, t1, anchor);
        insert(target, t2, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t1_value !== (t1_value = ctx2[3].ty.RemoveFile + ""))
          set_data(t1, t1_value);
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(t2);
      }
    };
  }
  function create_if_block_62(ctx) {
    let t0;
    let a;
    let t1_value = ctx[3].ty.AddFile + "";
    let t1;
    let a_href_value;
    let t2;
    return {
      c() {
        t0 = text("Added file ");
        a = element("a");
        t1 = text(t1_value);
        t2 = text(".");
        attr(a, "href", a_href_value = `/file/${ctx[3].page}/${encodeURIComponent(ctx[3].ty.AddFile)}`);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, a, anchor);
        append(a, t1);
        insert(target, t2, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t1_value !== (t1_value = ctx2[3].ty.AddFile + ""))
          set_data(t1, t1_value);
        if (dirty & 4 && a_href_value !== (a_href_value = `/file/${ctx2[3].page}/${encodeURIComponent(ctx2[3].ty.AddFile)}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(a);
        if (detaching)
          detach(t2);
      }
    };
  }
  function create_if_block_52(ctx) {
    let t0;
    let t1_value = ctx[3].ty.RemoveName + "";
    let t1;
    let t2;
    return {
      c() {
        t0 = text("Removed name ");
        t1 = text(t1_value);
        t2 = text(".");
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, t1, anchor);
        insert(target, t2, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t1_value !== (t1_value = ctx2[3].ty.RemoveName + ""))
          set_data(t1, t1_value);
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(t2);
      }
    };
  }
  function create_if_block_42(ctx) {
    let t0;
    let a;
    let t1;
    let t2_value = ctx[3].ty.RemoveTag + "";
    let t2;
    let a_href_value;
    let t3;
    return {
      c() {
        t0 = text("Removed ");
        a = element("a");
        t1 = text("#");
        t2 = text(t2_value);
        t3 = text(".");
        attr(a, "class", "wikilink tag");
        attr(a, "href", a_href_value = `#/search/${encodeURIComponent("#" + ctx[3].ty.AddTag)}`);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, a, anchor);
        append(a, t1);
        append(a, t2);
        insert(target, t3, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t2_value !== (t2_value = ctx2[3].ty.RemoveTag + ""))
          set_data(t2, t2_value);
        if (dirty & 4 && a_href_value !== (a_href_value = `#/search/${encodeURIComponent("#" + ctx2[3].ty.AddTag)}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(a);
        if (detaching)
          detach(t3);
      }
    };
  }
  function create_if_block_32(ctx) {
    let t0;
    let t1_value = ctx[3].ty.AddName + "";
    let t1;
    let t2;
    return {
      c() {
        t0 = text("Added name ");
        t1 = text(t1_value);
        t2 = text(".");
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, t1, anchor);
        insert(target, t2, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t1_value !== (t1_value = ctx2[3].ty.AddName + ""))
          set_data(t1, t1_value);
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(t2);
      }
    };
  }
  function create_if_block_23(ctx) {
    let t0;
    let a;
    let t1;
    let t2_value = ctx[3].ty.AddTag + "";
    let t2;
    let a_href_value;
    let t3;
    return {
      c() {
        t0 = text("Added ");
        a = element("a");
        t1 = text("#");
        t2 = text(t2_value);
        t3 = text(".");
        attr(a, "class", "wikilink tag");
        attr(a, "href", a_href_value = `#/search/${encodeURIComponent("#" + ctx[3].ty.AddTag)}`);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, a, anchor);
        append(a, t1);
        append(a, t2);
        insert(target, t3, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t2_value !== (t2_value = ctx2[3].ty.AddTag + ""))
          set_data(t2, t2_value);
        if (dirty & 4 && a_href_value !== (a_href_value = `#/search/${encodeURIComponent("#" + ctx2[3].ty.AddTag)}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(a);
        if (detaching)
          detach(t3);
      }
    };
  }
  function create_if_block_14(ctx) {
    let t0_value = ctx[3].ty.ContentUpdate.edit_distance + "";
    let t0;
    let t1;
    let t2_value = ctx[3].ty.ContentUpdate.new_content_size.bytes + "";
    let t2;
    let t3;
    let t4_value = ctx[3].ty.ContentUpdate.new_content_size.words + "";
    let t4;
    let t5;
    let a;
    let t6;
    let a_href_value;
    let t7;
    return {
      c() {
        t0 = text(t0_value);
        t1 = text(" bytes changed, page is now ");
        t2 = text(t2_value);
        t3 = text(" bytes/");
        t4 = text(t4_value);
        t5 = text(" words.\n                ");
        a = element("a");
        t6 = text("View");
        t7 = text(" old version.");
        attr(a, "class", "wikilink");
        attr(a, "href", a_href_value = `#/page/${ctx[1] || ctx[3].page}/revision/${ctx[3].id}`);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, t1, anchor);
        insert(target, t2, anchor);
        insert(target, t3, anchor);
        insert(target, t4, anchor);
        insert(target, t5, anchor);
        insert(target, a, anchor);
        append(a, t6);
        insert(target, t7, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t0_value !== (t0_value = ctx2[3].ty.ContentUpdate.edit_distance + ""))
          set_data(t0, t0_value);
        if (dirty & 4 && t2_value !== (t2_value = ctx2[3].ty.ContentUpdate.new_content_size.bytes + ""))
          set_data(t2, t2_value);
        if (dirty & 4 && t4_value !== (t4_value = ctx2[3].ty.ContentUpdate.new_content_size.words + ""))
          set_data(t4, t4_value);
        if (dirty & 6 && a_href_value !== (a_href_value = `#/page/${ctx2[1] || ctx2[3].page}/revision/${ctx2[3].id}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(t2);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(t4);
        if (detaching)
          detach(t5);
        if (detaching)
          detach(a);
        if (detaching)
          detach(t7);
      }
    };
  }
  function create_if_block5(ctx) {
    let t;
    return {
      c() {
        t = text("Page created.");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_each_block3(ctx) {
    let li;
    let t0;
    let div;
    let t1_value = formatDate(ctx[3].time) + "";
    let t1;
    let t2;
    let t3;
    let if_block0 = !ctx[0] && create_if_block_92(ctx);
    function select_block_type(ctx2, dirty) {
      if (ctx2[3].ty == "PageCreated")
        return create_if_block5;
      if ("ContentUpdate" in ctx2[3].ty)
        return create_if_block_14;
      if ("AddTag" in ctx2[3].ty)
        return create_if_block_23;
      if ("AddName" in ctx2[3].ty)
        return create_if_block_32;
      if ("RemoveTag" in ctx2[3].ty)
        return create_if_block_42;
      if ("RemoveName" in ctx2[3].ty)
        return create_if_block_52;
      if ("AddFile" in ctx2[3].ty)
        return create_if_block_62;
      if ("RemoveFile" in ctx2[3].ty)
        return create_if_block_72;
      if ("SetIconFilename" in ctx2[3].ty)
        return create_if_block_82;
    }
    let current_block_type = select_block_type(ctx, -1);
    let if_block1 = current_block_type && current_block_type(ctx);
    return {
      c() {
        li = element("li");
        if (if_block0)
          if_block0.c();
        t0 = space();
        div = element("div");
        t1 = text(t1_value);
        t2 = space();
        if (if_block1)
          if_block1.c();
        t3 = space();
      },
      m(target, anchor) {
        insert(target, li, anchor);
        if (if_block0)
          if_block0.m(li, null);
        append(li, t0);
        append(li, div);
        append(div, t1);
        append(li, t2);
        if (if_block1)
          if_block1.m(li, null);
        append(li, t3);
      },
      p(ctx2, dirty) {
        if (!ctx2[0]) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_92(ctx2);
            if_block0.c();
            if_block0.m(li, t0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (dirty & 4 && t1_value !== (t1_value = formatDate(ctx2[3].time) + ""))
          set_data(t1, t1_value);
        if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if (if_block1)
            if_block1.d(1);
          if_block1 = current_block_type && current_block_type(ctx2);
          if (if_block1) {
            if_block1.c();
            if_block1.m(li, t3);
          }
        }
      },
      d(detaching) {
        if (detaching)
          detach(li);
        if (if_block0)
          if_block0.d();
        if (if_block1) {
          if_block1.d();
        }
      }
    };
  }
  function create_fragment10(ctx) {
    let t;
    let ul;
    let current;
    let if_block = ctx[0] && create_if_block_102(ctx);
    let each_value = ctx[2];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block3(get_each_context3(ctx, each_value, i));
    }
    return {
      c() {
        if (if_block)
          if_block.c();
        t = space();
        ul = element("ul");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
      },
      m(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert(target, t, anchor);
        insert(target, ul, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
        current = true;
      },
      p(ctx2, [dirty]) {
        if (ctx2[0]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 1) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block_102(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(t.parentNode, t);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
        if (dirty & 7) {
          each_value = ctx2[2];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context3(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block3(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(ul, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach(t);
        if (detaching)
          detach(ul);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function instance10($$self, $$props, $$invalidate) {
    let { page } = $$props;
    let { id } = $$props;
    let { revs: revs2 } = $$props;
    $$self.$$set = ($$props2) => {
      if ("page" in $$props2)
        $$invalidate(0, page = $$props2.page);
      if ("id" in $$props2)
        $$invalidate(1, id = $$props2.id);
      if ("revs" in $$props2)
        $$invalidate(2, revs2 = $$props2.revs);
    };
    return [page, id, revs2];
  }
  var RevisionHistory = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance10, create_fragment10, safe_not_equal, { page: 0, id: 1, revs: 2 });
    }
  };
  var RevisionHistory_default = RevisionHistory;

  // client/ShortPageDescription.svelte
  function get_each_context4(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[1] = list[i];
    return child_ctx;
  }
  function create_default_slot5(ctx) {
    let a;
    let t_value = ctx[0].title + "";
    let t;
    let a_href_value;
    return {
      c() {
        a = element("a");
        t = text(t_value);
        attr(a, "class", "wikilink");
        attr(a, "href", a_href_value = `#/page/${ctx[0].id}`);
      },
      m(target, anchor) {
        insert(target, a, anchor);
        append(a, t);
      },
      p(ctx2, dirty) {
        if (dirty & 1 && t_value !== (t_value = ctx2[0].title + ""))
          set_data(t, t_value);
        if (dirty & 1 && a_href_value !== (a_href_value = `#/page/${ctx2[0].id}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(a);
      }
    };
  }
  function create_each_block4(ctx) {
    let li;
    let a;
    let t0;
    let t1_value = ctx[1] + "";
    let t1;
    let a_href_value;
    return {
      c() {
        li = element("li");
        a = element("a");
        t0 = text("#");
        t1 = text(t1_value);
        attr(a, "class", "wikilink tag");
        attr(a, "href", a_href_value = `#/search/${encodeURIComponent("#" + ctx[1])}`);
      },
      m(target, anchor) {
        insert(target, li, anchor);
        append(li, a);
        append(a, t0);
        append(a, t1);
      },
      p(ctx2, dirty) {
        if (dirty & 1 && t1_value !== (t1_value = ctx2[1] + ""))
          set_data(t1, t1_value);
        if (dirty & 1 && a_href_value !== (a_href_value = `#/search/${encodeURIComponent("#" + ctx2[1])}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(li);
      }
    };
  }
  function create_fragment11(ctx) {
    let iconheader;
    let t0;
    let ul;
    let t1;
    let t2_value = formatDateRelative(ctx[0].updated) + "";
    let t2;
    let t3;
    let t4_value = formatDateRelative(ctx[0].created) + "";
    let t4;
    let t5;
    let t6_value = applyMetricPrefix(ctx[0].size.bytes, "B") + "";
    let t6;
    let t7;
    let t8_value = applyMetricPrefix(ctx[0].size.words, "") + "";
    let t8;
    let t9;
    let t10_value = applyMetricPrefix(ctx[0].size.lines, "") + "";
    let t10;
    let t11;
    let div;
    let raw_value = ctx[0].snippet_html + "";
    let current;
    iconheader = new IconHeader_default({
      props: {
        page: ctx[0],
        basic: true,
        $$slots: { default: [create_default_slot5] },
        $$scope: { ctx }
      }
    });
    let each_value = ctx[0].tags;
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block4(get_each_context4(ctx, each_value, i));
    }
    return {
      c() {
        create_component(iconheader.$$.fragment);
        t0 = space();
        ul = element("ul");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t1 = text("\nUpdated ");
        t2 = text(t2_value);
        t3 = text(", created ");
        t4 = text(t4_value);
        t5 = text(". ");
        t6 = text(t6_value);
        t7 = text(", ");
        t8 = text(t8_value);
        t9 = text(" words, ");
        t10 = text(t10_value);
        t11 = text(" lines.\n");
        div = element("div");
        attr(ul, "class", "inline");
        attr(div, "class", "snippet");
      },
      m(target, anchor) {
        mount_component(iconheader, target, anchor);
        insert(target, t0, anchor);
        insert(target, ul, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
        insert(target, t1, anchor);
        insert(target, t2, anchor);
        insert(target, t3, anchor);
        insert(target, t4, anchor);
        insert(target, t5, anchor);
        insert(target, t6, anchor);
        insert(target, t7, anchor);
        insert(target, t8, anchor);
        insert(target, t9, anchor);
        insert(target, t10, anchor);
        insert(target, t11, anchor);
        insert(target, div, anchor);
        div.innerHTML = raw_value;
        current = true;
      },
      p(ctx2, [dirty]) {
        const iconheader_changes = {};
        if (dirty & 1)
          iconheader_changes.page = ctx2[0];
        if (dirty & 17) {
          iconheader_changes.$$scope = { dirty, ctx: ctx2 };
        }
        iconheader.$set(iconheader_changes);
        if (dirty & 1) {
          each_value = ctx2[0].tags;
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context4(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block4(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(ul, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
        if ((!current || dirty & 1) && t2_value !== (t2_value = formatDateRelative(ctx2[0].updated) + ""))
          set_data(t2, t2_value);
        if ((!current || dirty & 1) && t4_value !== (t4_value = formatDateRelative(ctx2[0].created) + ""))
          set_data(t4, t4_value);
        if ((!current || dirty & 1) && t6_value !== (t6_value = applyMetricPrefix(ctx2[0].size.bytes, "B") + ""))
          set_data(t6, t6_value);
        if ((!current || dirty & 1) && t8_value !== (t8_value = applyMetricPrefix(ctx2[0].size.words, "") + ""))
          set_data(t8, t8_value);
        if ((!current || dirty & 1) && t10_value !== (t10_value = applyMetricPrefix(ctx2[0].size.lines, "") + ""))
          set_data(t10, t10_value);
        if ((!current || dirty & 1) && raw_value !== (raw_value = ctx2[0].snippet_html + ""))
          div.innerHTML = raw_value;
        ;
      },
      i(local) {
        if (current)
          return;
        transition_in(iconheader.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(iconheader.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(iconheader, detaching);
        if (detaching)
          detach(t0);
        if (detaching)
          detach(ul);
        destroy_each(each_blocks, detaching);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(t2);
        if (detaching)
          detach(t3);
        if (detaching)
          detach(t4);
        if (detaching)
          detach(t5);
        if (detaching)
          detach(t6);
        if (detaching)
          detach(t7);
        if (detaching)
          detach(t8);
        if (detaching)
          detach(t9);
        if (detaching)
          detach(t10);
        if (detaching)
          detach(t11);
        if (detaching)
          detach(div);
      }
    };
  }
  function instance11($$self, $$props, $$invalidate) {
    let { page } = $$props;
    $$self.$$set = ($$props2) => {
      if ("page" in $$props2)
        $$invalidate(0, page = $$props2.page);
    };
    return [page];
  }
  var ShortPageDescription = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance11, create_fragment11, safe_not_equal, { page: 0 });
    }
  };
  var ShortPageDescription_default = ShortPageDescription;

  // client/Index.svelte
  function get_each_context5(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[3] = list[i];
    return child_ctx;
  }
  function get_each_context_12(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[6] = list[i];
    return child_ctx;
  }
  function create_each_block_12(ctx) {
    let ul;
    let li;
    let a0;
    let t0_value = ctx[6][1] + "";
    let t0;
    let a0_href_value;
    let t1;
    let a1;
    let t2_value = ctx[6][2] + "";
    let t2;
    let a1_href_value;
    return {
      c() {
        ul = element("ul");
        li = element("li");
        a0 = element("a");
        t0 = text(t0_value);
        t1 = text(" \u2192 ");
        a1 = element("a");
        t2 = text(t2_value);
        attr(a0, "href", a0_href_value = `#/page/${ctx[6][0]}`);
        attr(a0, "class", "wikilink");
        attr(a1, "href", a1_href_value = `#/create/${ctx[6][2]}`);
        attr(a1, "class", "wikilink nonexistent");
      },
      m(target, anchor) {
        insert(target, ul, anchor);
        append(ul, li);
        append(li, a0);
        append(a0, t0);
        append(li, t1);
        append(li, a1);
        append(a1, t2);
      },
      p(ctx2, dirty) {
        if (dirty & 4 && t0_value !== (t0_value = ctx2[6][1] + ""))
          set_data(t0, t0_value);
        if (dirty & 4 && a0_href_value !== (a0_href_value = `#/page/${ctx2[6][0]}`)) {
          attr(a0, "href", a0_href_value);
        }
        if (dirty & 4 && t2_value !== (t2_value = ctx2[6][2] + ""))
          set_data(t2, t2_value);
        if (dirty & 4 && a1_href_value !== (a1_href_value = `#/create/${ctx2[6][2]}`)) {
          attr(a1, "href", a1_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(ul);
      }
    };
  }
  function create_each_block5(ctx) {
    let li;
    let shortpagedescription;
    let t;
    let current;
    shortpagedescription = new ShortPageDescription_default({ props: { page: ctx[3] } });
    return {
      c() {
        li = element("li");
        create_component(shortpagedescription.$$.fragment);
        t = space();
      },
      m(target, anchor) {
        insert(target, li, anchor);
        mount_component(shortpagedescription, li, null);
        append(li, t);
        current = true;
      },
      p(ctx2, dirty) {
        const shortpagedescription_changes = {};
        if (dirty & 2)
          shortpagedescription_changes.page = ctx2[3];
        shortpagedescription.$set(shortpagedescription_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(shortpagedescription.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(shortpagedescription.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(li);
        destroy_component(shortpagedescription);
      }
    };
  }
  function create_fragment12(ctx) {
    let h1;
    let t1;
    let h20;
    let t3;
    let revisionhistory;
    let t4;
    let h21;
    let t6;
    let t7;
    let h22;
    let t9;
    let ul;
    let current;
    revisionhistory = new RevisionHistory_default({
      props: { revs: ctx[0] }
    });
    let each_value_1 = ctx[2];
    let each_blocks_1 = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks_1[i] = create_each_block_12(get_each_context_12(ctx, each_value_1, i));
    }
    let each_value = ctx[1];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block5(get_each_context5(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        h1 = element("h1");
        h1.textContent = "Index";
        t1 = space();
        h20 = element("h2");
        h20.textContent = "Recent Changes";
        t3 = space();
        create_component(revisionhistory.$$.fragment);
        t4 = space();
        h21 = element("h2");
        h21.textContent = "Dead Links";
        t6 = space();
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].c();
        }
        t7 = space();
        h22 = element("h2");
        h22.textContent = "Random Pages";
        t9 = space();
        ul = element("ul");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
      },
      m(target, anchor) {
        insert(target, h1, anchor);
        insert(target, t1, anchor);
        insert(target, h20, anchor);
        insert(target, t3, anchor);
        mount_component(revisionhistory, target, anchor);
        insert(target, t4, anchor);
        insert(target, h21, anchor);
        insert(target, t6, anchor);
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].m(target, anchor);
        }
        insert(target, t7, anchor);
        insert(target, h22, anchor);
        insert(target, t9, anchor);
        insert(target, ul, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
        current = true;
      },
      p(ctx2, [dirty]) {
        const revisionhistory_changes = {};
        if (dirty & 1)
          revisionhistory_changes.revs = ctx2[0];
        revisionhistory.$set(revisionhistory_changes);
        if (dirty & 4) {
          each_value_1 = ctx2[2];
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_12(ctx2, each_value_1, i);
            if (each_blocks_1[i]) {
              each_blocks_1[i].p(child_ctx, dirty);
            } else {
              each_blocks_1[i] = create_each_block_12(child_ctx);
              each_blocks_1[i].c();
              each_blocks_1[i].m(t7.parentNode, t7);
            }
          }
          for (; i < each_blocks_1.length; i += 1) {
            each_blocks_1[i].d(1);
          }
          each_blocks_1.length = each_value_1.length;
        }
        if (dirty & 2) {
          each_value = ctx2[1];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context5(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block5(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(ul, null);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(revisionhistory.$$.fragment, local);
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        transition_out(revisionhistory.$$.fragment, local);
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(h1);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(h20);
        if (detaching)
          detach(t3);
        destroy_component(revisionhistory, detaching);
        if (detaching)
          detach(t4);
        if (detaching)
          detach(h21);
        if (detaching)
          detach(t6);
        destroy_each(each_blocks_1, detaching);
        if (detaching)
          detach(t7);
        if (detaching)
          detach(h22);
        if (detaching)
          detach(t9);
        if (detaching)
          detach(ul);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function instance12($$self, $$props, $$invalidate) {
    let { recentChanges } = $$props;
    let { randomPages } = $$props;
    let { deadLinks } = $$props;
    $$self.$$set = ($$props2) => {
      if ("recentChanges" in $$props2)
        $$invalidate(0, recentChanges = $$props2.recentChanges);
      if ("randomPages" in $$props2)
        $$invalidate(1, randomPages = $$props2.randomPages);
      if ("deadLinks" in $$props2)
        $$invalidate(2, deadLinks = $$props2.deadLinks);
    };
    return [recentChanges, randomPages, deadLinks];
  }
  var Index = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance12, create_fragment12, safe_not_equal, {
        recentChanges: 0,
        randomPages: 1,
        deadLinks: 2
      });
    }
  };
  var Index_default = Index;

  // client/MetadataSidebar.svelte
  function get_each_context6(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[14] = list[i][0];
    child_ctx[15] = list[i][1];
    return child_ctx;
  }
  function get_each_context_13(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[18] = list[i];
    return child_ctx;
  }
  function get_each_context_22(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[21] = list[i];
    return child_ctx;
  }
  function create_each_block_22(ctx) {
    let li;
    let deletebutton;
    let a;
    let t0;
    let t1_value = ctx[21] + "";
    let t1;
    let a_href_value;
    let current;
    function func() {
      return ctx[10](ctx[21]);
    }
    deletebutton = new DeleteButton_default({ props: { onclick: func } });
    return {
      c() {
        li = element("li");
        create_component(deletebutton.$$.fragment);
        a = element("a");
        t0 = text("#");
        t1 = text(t1_value);
        attr(a, "class", "wikilink tag");
        attr(a, "href", a_href_value = `#/search/${encodeURIComponent("#" + ctx[21])}`);
      },
      m(target, anchor) {
        insert(target, li, anchor);
        mount_component(deletebutton, li, null);
        append(li, a);
        append(a, t0);
        append(a, t1);
        current = true;
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const deletebutton_changes = {};
        if (dirty & 1)
          deletebutton_changes.onclick = func;
        deletebutton.$set(deletebutton_changes);
        if ((!current || dirty & 1) && t1_value !== (t1_value = ctx[21] + ""))
          set_data(t1, t1_value);
        if (!current || dirty & 1 && a_href_value !== (a_href_value = `#/search/${encodeURIComponent("#" + ctx[21])}`)) {
          attr(a, "href", a_href_value);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(deletebutton.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(deletebutton.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(li);
        destroy_component(deletebutton);
      }
    };
  }
  function create_else_block_1(ctx) {
    let input;
    let button;
    let mounted;
    let dispose;
    return {
      c() {
        input = element("input");
        button = element("button");
        button.textContent = "+";
        attr(input, "type", "text");
        attr(input, "placeholder", "add another");
      },
      m(target, anchor) {
        insert(target, input, anchor);
        set_input_value(input, ctx[2]);
        insert(target, button, anchor);
        if (!mounted) {
          dispose = [
            listen(input, "input", ctx[11]),
            listen(input, "keydown", submitIfEnterKey(ctx[7])),
            listen(button, "click", ctx[7])
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 4 && input.value !== ctx2[2]) {
          set_input_value(input, ctx2[2]);
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(input);
        if (detaching)
          detach(button);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_43(ctx) {
    let loading;
    let current;
    loading = new Loading_default({ props: { operation: ctx[2] } });
    return {
      c() {
        create_component(loading.$$.fragment);
      },
      m(target, anchor) {
        mount_component(loading, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const loading_changes = {};
        if (dirty & 4)
          loading_changes.operation = ctx2[2];
        loading.$set(loading_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(loading.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(loading.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(loading, detaching);
      }
    };
  }
  function create_each_block_13(ctx) {
    let li;
    let deletebutton;
    let t_value = ctx[18] + "";
    let t;
    let current;
    function func_1() {
      return ctx[12](ctx[18]);
    }
    deletebutton = new DeleteButton_default({ props: { onclick: func_1 } });
    return {
      c() {
        li = element("li");
        create_component(deletebutton.$$.fragment);
        t = text(t_value);
      },
      m(target, anchor) {
        insert(target, li, anchor);
        mount_component(deletebutton, li, null);
        append(li, t);
        current = true;
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const deletebutton_changes = {};
        if (dirty & 1)
          deletebutton_changes.onclick = func_1;
        deletebutton.$set(deletebutton_changes);
        if ((!current || dirty & 1) && t_value !== (t_value = ctx[18] + ""))
          set_data(t, t_value);
      },
      i(local) {
        if (current)
          return;
        transition_in(deletebutton.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(deletebutton.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(li);
        destroy_component(deletebutton);
      }
    };
  }
  function create_else_block4(ctx) {
    let input;
    let button;
    let mounted;
    let dispose;
    return {
      c() {
        input = element("input");
        button = element("button");
        button.textContent = "+";
        attr(input, "type", "text");
        attr(input, "placeholder", "add another");
      },
      m(target, anchor) {
        insert(target, input, anchor);
        set_input_value(input, ctx[1]);
        insert(target, button, anchor);
        if (!mounted) {
          dispose = [
            listen(input, "input", ctx[13]),
            listen(input, "keydown", submitIfEnterKey(ctx[6])),
            listen(button, "click", ctx[6])
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & 2 && input.value !== ctx2[1]) {
          set_input_value(input, ctx2[1]);
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(input);
        if (detaching)
          detach(button);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_33(ctx) {
    let loading;
    let current;
    loading = new Loading_default({ props: { operation: ctx[1] } });
    return {
      c() {
        create_component(loading.$$.fragment);
      },
      m(target, anchor) {
        mount_component(loading, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const loading_changes = {};
        if (dirty & 2)
          loading_changes.operation = ctx2[1];
        loading.$set(loading_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(loading.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(loading.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(loading, detaching);
      }
    };
  }
  function create_if_block_24(ctx) {
    let error;
    let current;
    error = new Error_default({
      props: {
        $$slots: { default: [create_default_slot6] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        create_component(error.$$.fragment);
      },
      m(target, anchor) {
        mount_component(error, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const error_changes = {};
        if (dirty & 16777248) {
          error_changes.$$scope = { dirty, ctx: ctx2 };
        }
        error.$set(error_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(error.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(error.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(error, detaching);
      }
    };
  }
  function create_default_slot6(ctx) {
    let t0;
    let a;
    let t1_value = ctx[5][1] + "";
    let t1;
    let a_href_value;
    let t2;
    return {
      c() {
        t0 = text("Page already exists: ");
        a = element("a");
        t1 = text(t1_value);
        t2 = text(".");
        attr(a, "class", "wikilink");
        attr(a, "href", a_href_value = "#/page/" + ctx[5][0]);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, a, anchor);
        append(a, t1);
        insert(target, t2, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 32 && t1_value !== (t1_value = ctx2[5][1] + ""))
          set_data(t1, t1_value);
        if (dirty & 32 && a_href_value !== (a_href_value = "#/page/" + ctx2[5][0])) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(t0);
        if (detaching)
          detach(a);
        if (detaching)
          detach(t2);
      }
    };
  }
  function create_if_block6(ctx) {
    let h2;
    let t1;
    let ul;
    let each_value = Object.values(ctx[0].backlinks);
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block6(get_each_context6(ctx, each_value, i));
    }
    return {
      c() {
        h2 = element("h2");
        h2.textContent = "Backlinks";
        t1 = space();
        ul = element("ul");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
      },
      m(target, anchor) {
        insert(target, h2, anchor);
        insert(target, t1, anchor);
        insert(target, ul, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
      },
      p(ctx2, dirty) {
        if (dirty & 1) {
          each_value = Object.values(ctx2[0].backlinks);
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context6(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block6(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(ul, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
      },
      d(detaching) {
        if (detaching)
          detach(h2);
        if (detaching)
          detach(t1);
        if (detaching)
          detach(ul);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_if_block_15(ctx) {
    let t_value = ` (as ${ctx[14].text})`;
    let t;
    return {
      c() {
        t = text(t_value);
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 1 && t_value !== (t_value = ` (as ${ctx2[14].text})`))
          set_data(t, t_value);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_each_block6(ctx) {
    let li;
    let a;
    let t0_value = ctx[15] + "";
    let t0;
    let a_href_value;
    let t1;
    let show_if = ctx[14].text.toLowerCase() != ctx[0].title.toLowerCase();
    let t2;
    let div;
    let raw_value = ctx[14].context + "";
    let t3;
    let if_block = show_if && create_if_block_15(ctx);
    return {
      c() {
        li = element("li");
        a = element("a");
        t0 = text(t0_value);
        t1 = space();
        if (if_block)
          if_block.c();
        t2 = space();
        div = element("div");
        t3 = space();
        attr(a, "href", a_href_value = `#/page/${ctx[14].from}`);
        attr(a, "class", "wikilink");
      },
      m(target, anchor) {
        insert(target, li, anchor);
        append(li, a);
        append(a, t0);
        append(li, t1);
        if (if_block)
          if_block.m(li, null);
        append(li, t2);
        append(li, div);
        div.innerHTML = raw_value;
        append(li, t3);
      },
      p(ctx2, dirty) {
        if (dirty & 1 && t0_value !== (t0_value = ctx2[15] + ""))
          set_data(t0, t0_value);
        if (dirty & 1 && a_href_value !== (a_href_value = `#/page/${ctx2[14].from}`)) {
          attr(a, "href", a_href_value);
        }
        if (dirty & 1)
          show_if = ctx2[14].text.toLowerCase() != ctx2[0].title.toLowerCase();
        if (show_if) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block_15(ctx2);
            if_block.c();
            if_block.m(li, t2);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        if (dirty & 1 && raw_value !== (raw_value = ctx2[14].context + ""))
          div.innerHTML = raw_value;
        ;
      },
      d(detaching) {
        if (detaching)
          detach(li);
        if (if_block)
          if_block.d();
      }
    };
  }
  function create_fragment13(ctx) {
    let div4;
    let div0;
    let h20;
    let t1;
    let ul0;
    let t2;
    let current_block_type_index;
    let if_block0;
    let t3;
    let h21;
    let t5;
    let ul1;
    let t6;
    let li;
    let current_block_type_index_1;
    let if_block1;
    let t7;
    let t8;
    let h22;
    let t10;
    let div1;
    let t11;
    let t12_value = formatDate(ctx[0].created) + "";
    let t12;
    let t13;
    let t14;
    let div2;
    let t15;
    let t16_value = formatDate(ctx[0].updated) + "";
    let t16;
    let t17;
    let t18;
    let div3;
    let t19_value = applyMetricPrefix(ctx[0].size.bytes, "B") + "";
    let t19;
    let t20;
    let t21_value = applyMetricPrefix(ctx[0].size.words, "") + "";
    let t21;
    let t22;
    let t23_value = applyMetricPrefix(ctx[0].size.lines, "") + "";
    let t23;
    let t24;
    let t25;
    let current;
    let each_value_2 = ctx[0].tags;
    let each_blocks_1 = [];
    for (let i = 0; i < each_value_2.length; i += 1) {
      each_blocks_1[i] = create_each_block_22(get_each_context_22(ctx, each_value_2, i));
    }
    const out = (i) => transition_out(each_blocks_1[i], 1, 1, () => {
      each_blocks_1[i] = null;
    });
    const if_block_creators = [create_if_block_43, create_else_block_1];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[4])
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    let each_value_1 = ctx[0].names;
    let each_blocks = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block_13(get_each_context_13(ctx, each_value_1, i));
    }
    const out_1 = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    const if_block_creators_1 = [create_if_block_33, create_else_block4];
    const if_blocks_1 = [];
    function select_block_type_1(ctx2, dirty) {
      if (ctx2[3])
        return 0;
      return 1;
    }
    current_block_type_index_1 = select_block_type_1(ctx, -1);
    if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    let if_block2 = ctx[5] && create_if_block_24(ctx);
    let if_block3 = ctx[0].backlinks.length > 0 && create_if_block6(ctx);
    return {
      c() {
        div4 = element("div");
        div0 = element("div");
        h20 = element("h2");
        h20.textContent = "Tags";
        t1 = space();
        ul0 = element("ul");
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].c();
        }
        t2 = space();
        if_block0.c();
        t3 = space();
        h21 = element("h2");
        h21.textContent = "Names";
        t5 = space();
        ul1 = element("ul");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t6 = space();
        li = element("li");
        if_block1.c();
        t7 = space();
        if (if_block2)
          if_block2.c();
        t8 = space();
        h22 = element("h2");
        h22.textContent = "Info";
        t10 = space();
        div1 = element("div");
        t11 = text("Created ");
        t12 = text(t12_value);
        t13 = text(".");
        t14 = space();
        div2 = element("div");
        t15 = text("Updated ");
        t16 = text(t16_value);
        t17 = text(".");
        t18 = space();
        div3 = element("div");
        t19 = text(t19_value);
        t20 = text(", ");
        t21 = text(t21_value);
        t22 = text(" words, ");
        t23 = text(t23_value);
        t24 = text(" lines.");
        t25 = space();
        if (if_block3)
          if_block3.c();
        attr(ul0, "class", "inline");
        attr(ul1, "class", "inline");
        attr(div4, "class", "meta-root");
      },
      m(target, anchor) {
        insert(target, div4, anchor);
        append(div4, div0);
        append(div0, h20);
        append(div0, t1);
        append(div0, ul0);
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].m(ul0, null);
        }
        append(ul0, t2);
        if_blocks[current_block_type_index].m(ul0, null);
        append(div0, t3);
        append(div0, h21);
        append(div0, t5);
        append(div0, ul1);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul1, null);
        }
        append(ul1, t6);
        append(ul1, li);
        if_blocks_1[current_block_type_index_1].m(li, null);
        append(ul1, t7);
        if (if_block2)
          if_block2.m(ul1, null);
        append(div4, t8);
        append(div4, h22);
        append(div4, t10);
        append(div4, div1);
        append(div1, t11);
        append(div1, t12);
        append(div1, t13);
        append(div4, t14);
        append(div4, div2);
        append(div2, t15);
        append(div2, t16);
        append(div2, t17);
        append(div4, t18);
        append(div4, div3);
        append(div3, t19);
        append(div3, t20);
        append(div3, t21);
        append(div3, t22);
        append(div3, t23);
        append(div3, t24);
        append(div4, t25);
        if (if_block3)
          if_block3.m(div4, null);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 257) {
          each_value_2 = ctx2[0].tags;
          let i;
          for (i = 0; i < each_value_2.length; i += 1) {
            const child_ctx = get_each_context_22(ctx2, each_value_2, i);
            if (each_blocks_1[i]) {
              each_blocks_1[i].p(child_ctx, dirty);
              transition_in(each_blocks_1[i], 1);
            } else {
              each_blocks_1[i] = create_each_block_22(child_ctx);
              each_blocks_1[i].c();
              transition_in(each_blocks_1[i], 1);
              each_blocks_1[i].m(ul0, t2);
            }
          }
          group_outros();
          for (i = each_value_2.length; i < each_blocks_1.length; i += 1) {
            out(i);
          }
          check_outros();
        }
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block0 = if_blocks[current_block_type_index];
          if (!if_block0) {
            if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block0.c();
          } else {
            if_block0.p(ctx2, dirty);
          }
          transition_in(if_block0, 1);
          if_block0.m(ul0, null);
        }
        if (dirty & 513) {
          each_value_1 = ctx2[0].names;
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_13(ctx2, each_value_1, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block_13(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(ul1, t6);
            }
          }
          group_outros();
          for (i = each_value_1.length; i < each_blocks.length; i += 1) {
            out_1(i);
          }
          check_outros();
        }
        let previous_block_index_1 = current_block_type_index_1;
        current_block_type_index_1 = select_block_type_1(ctx2, dirty);
        if (current_block_type_index_1 === previous_block_index_1) {
          if_blocks_1[current_block_type_index_1].p(ctx2, dirty);
        } else {
          group_outros();
          transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
            if_blocks_1[previous_block_index_1] = null;
          });
          check_outros();
          if_block1 = if_blocks_1[current_block_type_index_1];
          if (!if_block1) {
            if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx2);
            if_block1.c();
          } else {
            if_block1.p(ctx2, dirty);
          }
          transition_in(if_block1, 1);
          if_block1.m(li, null);
        }
        if (ctx2[5]) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
            if (dirty & 32) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block_24(ctx2);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(ul1, null);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, () => {
            if_block2 = null;
          });
          check_outros();
        }
        if ((!current || dirty & 1) && t12_value !== (t12_value = formatDate(ctx2[0].created) + ""))
          set_data(t12, t12_value);
        if ((!current || dirty & 1) && t16_value !== (t16_value = formatDate(ctx2[0].updated) + ""))
          set_data(t16, t16_value);
        if ((!current || dirty & 1) && t19_value !== (t19_value = applyMetricPrefix(ctx2[0].size.bytes, "B") + ""))
          set_data(t19, t19_value);
        if ((!current || dirty & 1) && t21_value !== (t21_value = applyMetricPrefix(ctx2[0].size.words, "") + ""))
          set_data(t21, t21_value);
        if ((!current || dirty & 1) && t23_value !== (t23_value = applyMetricPrefix(ctx2[0].size.lines, "") + ""))
          set_data(t23, t23_value);
        if (ctx2[0].backlinks.length > 0) {
          if (if_block3) {
            if_block3.p(ctx2, dirty);
          } else {
            if_block3 = create_if_block6(ctx2);
            if_block3.c();
            if_block3.m(div4, null);
          }
        } else if (if_block3) {
          if_block3.d(1);
          if_block3 = null;
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value_2.length; i += 1) {
          transition_in(each_blocks_1[i]);
        }
        transition_in(if_block0);
        for (let i = 0; i < each_value_1.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(if_block1);
        transition_in(if_block2);
        current = true;
      },
      o(local) {
        each_blocks_1 = each_blocks_1.filter(Boolean);
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          transition_out(each_blocks_1[i]);
        }
        transition_out(if_block0);
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(if_block1);
        transition_out(if_block2);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div4);
        destroy_each(each_blocks_1, detaching);
        if_blocks[current_block_type_index].d();
        destroy_each(each_blocks, detaching);
        if_blocks_1[current_block_type_index_1].d();
        if (if_block2)
          if_block2.d();
        if (if_block3)
          if_block3.d();
      }
    };
  }
  function instance13($$self, $$props, $$invalidate) {
    let { page } = $$props;
    var newName = "";
    var newTag = "";
    var addingName = false;
    var addingTag = false;
    var alreadyExists;
    console.log(page);
    const addName = async () => {
      if (addingName)
        return;
      $$invalidate(3, addingName = true);
      try {
        $$invalidate(0, page.names = page.names.concat([await rpc_default("AddName", [page.id, newName])]), page);
        $$invalidate(5, alreadyExists = null);
      } catch (e) {
        if (e.type === "Conflict") {
          $$invalidate(5, alreadyExists = [e.arg, newName]);
        }
      }
      $$invalidate(3, addingName = false);
      $$invalidate(1, newName = "");
    };
    const addTag = async () => {
      if (addingTag)
        return;
      $$invalidate(4, addingTag = true);
      $$invalidate(0, page.tags = page.tags.concat([await rpc_default("AddTag", [page.id, newTag])]), page);
      $$invalidate(4, addingTag = false);
      $$invalidate(2, newTag = "");
    };
    const removeTag = async (tag) => {
      if (addingTag)
        return;
      $$invalidate(4, addingTag = true);
      const slug = await rpc_default("RemoveTag", [page.id, tag]);
      $$invalidate(0, page.tags = page.tags.filter((x) => x !== slug), page);
      $$invalidate(4, addingTag = false);
    };
    const removeName = async (name) => {
      if (addingName)
        return;
      $$invalidate(3, addingName = true);
      await rpc_default("RemoveName", [page.id, name]);
      $$invalidate(0, page.names = page.names.filter((x) => x !== name), page);
      $$invalidate(3, addingName = false);
    };
    const func = (tag) => removeTag(tag);
    function input_input_handler() {
      newTag = this.value;
      $$invalidate(2, newTag);
    }
    const func_1 = (name) => removeName(name);
    function input_input_handler_1() {
      newName = this.value;
      $$invalidate(1, newName);
    }
    $$self.$$set = ($$props2) => {
      if ("page" in $$props2)
        $$invalidate(0, page = $$props2.page);
    };
    return [
      page,
      newName,
      newTag,
      addingName,
      addingTag,
      alreadyExists,
      addName,
      addTag,
      removeTag,
      removeName,
      func,
      input_input_handler,
      func_1,
      input_input_handler_1
    ];
  }
  var MetadataSidebar = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance13, create_fragment13, safe_not_equal, { page: 0 });
    }
  };
  var MetadataSidebar_default = MetadataSidebar;

  // client/App.svelte
  var { window: window_1 } = globals;
  function get_each_context7(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[20] = list[i][0];
    child_ctx[7] = list[i][1];
    return child_ctx;
  }
  function get_each_context_14(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[20] = list[i][0];
    child_ctx[23] = list[i][1];
    return child_ctx;
  }
  function get_each_context_23(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[26] = list[i];
    return child_ctx;
  }
  function create_default_slot_25(ctx) {
    let t;
    return {
      c() {
        t = text("Index");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot_15(ctx) {
    let t;
    return {
      c() {
        t = text("Search");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot7(ctx) {
    let t;
    return {
      c() {
        t = text("Create");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block_34(ctx) {
    let t;
    let ul;
    let each_value_2 = ctx[11](ctx[3]);
    let each_blocks = [];
    for (let i = 0; i < each_value_2.length; i += 1) {
      each_blocks[i] = create_each_block_23(get_each_context_23(ctx, each_value_2, i));
    }
    return {
      c() {
        t = text("Last: ");
        ul = element("ul");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(ul, "class", "inline very-inline");
      },
      m(target, anchor) {
        insert(target, t, anchor);
        insert(target, ul, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
      },
      p(ctx2, dirty) {
        if (dirty & 2056) {
          each_value_2 = ctx2[11](ctx2[3]);
          let i;
          for (i = 0; i < each_value_2.length; i += 1) {
            const child_ctx = get_each_context_23(ctx2, each_value_2, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block_23(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(ul, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value_2.length;
        }
      },
      d(detaching) {
        if (detaching)
          detach(t);
        if (detaching)
          detach(ul);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_each_block_23(ctx) {
    let li;
    let a;
    let t_value = ctx[26][1] + "";
    let t;
    let a_href_value;
    return {
      c() {
        li = element("li");
        a = element("a");
        t = text(t_value);
        attr(a, "class", "wikilink");
        attr(a, "href", a_href_value = `#/page/${ctx[26][0]}`);
      },
      m(target, anchor) {
        insert(target, li, anchor);
        append(li, a);
        append(a, t);
      },
      p(ctx2, dirty) {
        if (dirty & 8 && t_value !== (t_value = ctx2[26][1] + ""))
          set_data(t, t_value);
        if (dirty & 8 && a_href_value !== (a_href_value = `#/page/${ctx2[26][0]}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(li);
      }
    };
  }
  function create_if_block_25(ctx) {
    let ul;
    let t;
    let div;
    let current;
    let each_value_1 = ctx[5].title_matches;
    let each_blocks_1 = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks_1[i] = create_each_block_14(get_each_context_14(ctx, each_value_1, i));
    }
    let each_value = ctx[5].content_matches;
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block7(get_each_context7(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        ul = element("ul");
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].c();
        }
        t = space();
        div = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(ul, "class", "inline");
        attr(div, "class", "result-pages");
      },
      m(target, anchor) {
        insert(target, ul, anchor);
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].m(ul, null);
        }
        insert(target, t, anchor);
        insert(target, div, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(div, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty & 32) {
          each_value_1 = ctx2[5].title_matches;
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_14(ctx2, each_value_1, i);
            if (each_blocks_1[i]) {
              each_blocks_1[i].p(child_ctx, dirty);
            } else {
              each_blocks_1[i] = create_each_block_14(child_ctx);
              each_blocks_1[i].c();
              each_blocks_1[i].m(ul, null);
            }
          }
          for (; i < each_blocks_1.length; i += 1) {
            each_blocks_1[i].d(1);
          }
          each_blocks_1.length = each_value_1.length;
        }
        if (dirty & 32) {
          each_value = ctx2[5].content_matches;
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context7(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block7(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(div, null);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(ul);
        destroy_each(each_blocks_1, detaching);
        if (detaching)
          detach(t);
        if (detaching)
          detach(div);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_each_block_14(ctx) {
    let li;
    let a;
    let t_value = ctx[23] + "";
    let t;
    let a_href_value;
    return {
      c() {
        li = element("li");
        a = element("a");
        t = text(t_value);
        attr(a, "class", "wikilink");
        attr(a, "href", a_href_value = `#/page/${ctx[20]}`);
      },
      m(target, anchor) {
        insert(target, li, anchor);
        append(li, a);
        append(a, t);
      },
      p(ctx2, dirty) {
        if (dirty & 32 && t_value !== (t_value = ctx2[23] + ""))
          set_data(t, t_value);
        if (dirty & 32 && a_href_value !== (a_href_value = `#/page/${ctx2[20]}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(li);
      }
    };
  }
  function create_each_block7(ctx) {
    let div;
    let shortpagedescription;
    let t;
    let current;
    shortpagedescription = new ShortPageDescription_default({ props: { page: ctx[7] } });
    return {
      c() {
        div = element("div");
        create_component(shortpagedescription.$$.fragment);
        t = space();
        attr(div, "class", "result-page svelte-1k1jhlt");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(shortpagedescription, div, null);
        append(div, t);
        current = true;
      },
      p(ctx2, dirty) {
        const shortpagedescription_changes = {};
        if (dirty & 32)
          shortpagedescription_changes.page = ctx2[7];
        shortpagedescription.$set(shortpagedescription_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(shortpagedescription.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(shortpagedescription.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        destroy_component(shortpagedescription);
      }
    };
  }
  function create_if_block_16(ctx) {
    let div;
    let previous_key = ctx[1]?.id || "";
    let current;
    let key_block = create_key_block2(ctx);
    return {
      c() {
        div = element("div");
        key_block.c();
        attr(div, "class", "main-ui svelte-1k1jhlt");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        key_block.m(div, null);
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty & 2 && safe_not_equal(previous_key, previous_key = ctx2[1]?.id || "")) {
          group_outros();
          transition_out(key_block, 1, 1, noop);
          check_outros();
          key_block = create_key_block2(ctx2);
          key_block.c();
          transition_in(key_block);
          key_block.m(div, null);
        } else {
          key_block.p(ctx2, dirty);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(key_block);
        current = true;
      },
      o(local) {
        transition_out(key_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        key_block.d(detaching);
      }
    };
  }
  function create_key_block2(ctx) {
    let switch_instance;
    let switch_instance_anchor;
    let current;
    const switch_instance_spread_levels = [ctx[1]];
    var switch_value = ctx[0];
    function switch_props(ctx2) {
      let switch_instance_props = {};
      for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
        switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
      }
      return { props: switch_instance_props };
    }
    if (switch_value) {
      switch_instance = new switch_value(switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        switch_instance_anchor = empty();
      },
      m(target, anchor) {
        if (switch_instance) {
          mount_component(switch_instance, target, anchor);
        }
        insert(target, switch_instance_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = dirty & 2 ? get_spread_update(switch_instance_spread_levels, [get_spread_object(ctx2[1])]) : {};
        if (switch_value !== (switch_value = ctx2[0])) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = new switch_value(switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(switch_instance_anchor);
        if (switch_instance)
          destroy_component(switch_instance, detaching);
      }
    };
  }
  function create_if_block7(ctx) {
    let div;
    let metadatasidebar;
    let current;
    metadatasidebar = new MetadataSidebar_default({ props: { page: ctx[7] } });
    return {
      c() {
        div = element("div");
        create_component(metadatasidebar.$$.fragment);
        attr(div, "class", "meta svelte-1k1jhlt");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(metadatasidebar, div, null);
        current = true;
      },
      p(ctx2, dirty) {
        const metadatasidebar_changes = {};
        if (dirty & 128)
          metadatasidebar_changes.page = ctx2[7];
        metadatasidebar.$set(metadatasidebar_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(metadatasidebar.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(metadatasidebar.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        destroy_component(metadatasidebar);
      }
    };
  }
  function create_fragment14(ctx) {
    let main;
    let div1;
    let linkbutton0;
    let t0;
    let linkbutton1;
    let t1;
    let linkbutton2;
    let t2;
    let div0;
    let t3;
    let input;
    let t4;
    let div1_class_value;
    let t5;
    let t6;
    let current;
    let mounted;
    let dispose;
    linkbutton0 = new LinkButton_default({
      props: {
        href: "#/",
        color: "#5170d7",
        $$slots: { default: [create_default_slot_25] },
        $$scope: { ctx }
      }
    });
    linkbutton1 = new LinkButton_default({
      props: {
        href: "#/search",
        color: "#fac205",
        $$slots: { default: [create_default_slot_15] },
        $$scope: { ctx }
      }
    });
    linkbutton2 = new LinkButton_default({
      props: {
        href: "#/create",
        color: "#bc13fe",
        $$slots: { default: [create_default_slot7] },
        $$scope: { ctx }
      }
    });
    let if_block0 = ctx[3] && create_if_block_34(ctx);
    let if_block1 = ctx[5] && create_if_block_25(ctx);
    let if_block2 = ctx[0] && create_if_block_16(ctx);
    let if_block3 = ctx[7] && create_if_block7(ctx);
    return {
      c() {
        main = element("main");
        div1 = element("div");
        create_component(linkbutton0.$$.fragment);
        t0 = space();
        create_component(linkbutton1.$$.fragment);
        t1 = space();
        create_component(linkbutton2.$$.fragment);
        t2 = space();
        div0 = element("div");
        if (if_block0)
          if_block0.c();
        t3 = space();
        input = element("input");
        t4 = space();
        if (if_block1)
          if_block1.c();
        t5 = space();
        if (if_block2)
          if_block2.c();
        t6 = space();
        if (if_block3)
          if_block3.c();
        attr(input, "type", "search");
        attr(input, "placeholder", "Search");
        attr(input, "class", "search-input svelte-1k1jhlt");
        attr(div1, "class", div1_class_value = "" + (null_to_empty("navigation " + (ctx[2] ? "search-mode" : "")) + " svelte-1k1jhlt"));
        attr(main, "class", "svelte-1k1jhlt");
      },
      m(target, anchor) {
        insert(target, main, anchor);
        append(main, div1);
        mount_component(linkbutton0, div1, null);
        append(div1, t0);
        mount_component(linkbutton1, div1, null);
        append(div1, t1);
        mount_component(linkbutton2, div1, null);
        append(div1, t2);
        append(div1, div0);
        if (if_block0)
          if_block0.m(div0, null);
        append(div1, t3);
        append(div1, input);
        set_input_value(input, ctx[4]);
        ctx[13](input);
        append(div1, t4);
        if (if_block1)
          if_block1.m(div1, null);
        append(main, t5);
        if (if_block2)
          if_block2.m(main, null);
        append(main, t6);
        if (if_block3)
          if_block3.m(main, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(window_1, "hashchange", ctx[8]),
            listen(input, "input", ctx[12]),
            listen(input, "input", ctx[9]),
            listen(input, "keydown", ctx[10])
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        const linkbutton0_changes = {};
        if (dirty & 536870912) {
          linkbutton0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        linkbutton0.$set(linkbutton0_changes);
        const linkbutton1_changes = {};
        if (dirty & 536870912) {
          linkbutton1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        linkbutton1.$set(linkbutton1_changes);
        const linkbutton2_changes = {};
        if (dirty & 536870912) {
          linkbutton2_changes.$$scope = { dirty, ctx: ctx2 };
        }
        linkbutton2.$set(linkbutton2_changes);
        if (ctx2[3]) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_34(ctx2);
            if_block0.c();
            if_block0.m(div0, null);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (dirty & 16) {
          set_input_value(input, ctx2[4]);
        }
        if (ctx2[5]) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
            if (dirty & 32) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block_25(ctx2);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(div1, null);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });
          check_outros();
        }
        if (!current || dirty & 4 && div1_class_value !== (div1_class_value = "" + (null_to_empty("navigation " + (ctx2[2] ? "search-mode" : "")) + " svelte-1k1jhlt"))) {
          attr(div1, "class", div1_class_value);
        }
        if (ctx2[0]) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
            if (dirty & 1) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block_16(ctx2);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(main, t6);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, () => {
            if_block2 = null;
          });
          check_outros();
        }
        if (ctx2[7]) {
          if (if_block3) {
            if_block3.p(ctx2, dirty);
            if (dirty & 128) {
              transition_in(if_block3, 1);
            }
          } else {
            if_block3 = create_if_block7(ctx2);
            if_block3.c();
            transition_in(if_block3, 1);
            if_block3.m(main, null);
          }
        } else if (if_block3) {
          group_outros();
          transition_out(if_block3, 1, 1, () => {
            if_block3 = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(linkbutton0.$$.fragment, local);
        transition_in(linkbutton1.$$.fragment, local);
        transition_in(linkbutton2.$$.fragment, local);
        transition_in(if_block1);
        transition_in(if_block2);
        transition_in(if_block3);
        current = true;
      },
      o(local) {
        transition_out(linkbutton0.$$.fragment, local);
        transition_out(linkbutton1.$$.fragment, local);
        transition_out(linkbutton2.$$.fragment, local);
        transition_out(if_block1);
        transition_out(if_block2);
        transition_out(if_block3);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(main);
        destroy_component(linkbutton0);
        destroy_component(linkbutton1);
        destroy_component(linkbutton2);
        if (if_block0)
          if_block0.d();
        ctx[13](null);
        if (if_block1)
          if_block1.d();
        if (if_block2)
          if_block2.d();
        if (if_block3)
          if_block3.d();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance14($$self, $$props, $$invalidate) {
    window.rpc = rpc_default;
    var child;
    var params;
    var page;
    var searchMode = false;
    var currentPage;
    var recent = [];
    generalStorage.getItem("recent").then((x) => {
      $$invalidate(3, recent = x || []);
    });
    const parseURL = () => {
      const [hash, query] = window.location.hash.slice(1).split("?");
      const parts = hash.split("/").filter((x) => x !== "").map(decodeURIComponent);
      if (query) {
        query.split("&").map((x) => x.split("=").map(decodeURIComponent)).forEach(([k, v]) => parts[k] = v);
      }
      return parts;
    };
    const unparseURL = (parts, query = {}) => {
      window.location.hash = "/" + parts.filter((x) => x != "").map(encodeURIComponent).join("/");
    };
    const setTitle = (title) => document.title = `${title} - Minoteaur`;
    const updateRoute = async () => {
      const parts = parseURL();
      console.log(parts);
      $$invalidate(2, searchMode = false);
      currentPage = null;
      if (parts[0] === "page") {
        currentPage = parts[1];
        let revisionID = null;
        if (parts[2] === "revision" && parts[3]) {
          revisionID = parts[3];
        }
        $$invalidate(7, page = await rpc_default("GetPage", [parts[1], revisionID]));
        if (page) {
          $$invalidate(3, recent = recent.filter(([a, b]) => a !== currentPage));
          recent.push([currentPage, page.title]);
          if (recent.length > 8)
            recent.shift();
          generalStorage.setItem("recent", recent);
          $$invalidate(3, recent);
        }
        $$invalidate(1, params = { id: currentPage, page });
        $$invalidate(7, page.id = currentPage, page);
        if (parts[2] === "edit") {
          $$invalidate(0, child = Edit_default);
          setTitle(`${page.title} - Editing`);
        } else if (parts[2] === "revisions") {
          revs = await rpc_default("GetRevisions", currentPage);
          revs.sort((a, b) => b.time - a.time);
          $$invalidate(1, params.revs = revs, params);
          $$invalidate(0, child = RevisionHistory_default);
          setTitle(`${page.title} - Revisions`);
        } else {
          $$invalidate(0, child = View_default);
          let title = page.title;
          if (revisionID) {
            title += " (old)";
          }
          setTitle(title);
        }
      } else if (parts[0] === "search") {
        $$invalidate(0, child = null);
        $$invalidate(7, page = null);
        $$invalidate(2, searchMode = true);
        if (parts[1]) {
          $$invalidate(4, searchQuery = parts[1]);
          await searchInputHandler();
        }
        setTitle("Search");
      } else if (parts[0] === "create") {
        $$invalidate(7, page = null);
        $$invalidate(1, params = { title: parts[1] });
        if (parts.tags) {
          $$invalidate(1, params.tags = parts.tags.split(","), params);
        }
        $$invalidate(0, child = Create_default);
        setTitle(`Creating ${parts[1] || "page"}`);
      } else {
        $$invalidate(7, page = null);
        const { recent_changes, random_pages, dead_links } = await rpc_default("IndexPage", null);
        $$invalidate(1, params = {
          recentChanges: recent_changes.map(([revision, page2]) => ({ ...revision, pageData: page2 })),
          randomPages: random_pages,
          deadLinks: dead_links
        });
        $$invalidate(0, child = Index_default);
        setTitle("Index");
      }
    };
    const switchPageState = (newState) => {
      const parts = parseURL();
      if (parts[0] === "page") {
        parts[2] = newState;
        unparseURL(parts);
      }
    };
    const switchPage = (page2) => {
      unparseURL(["page", page2]);
    };
    var searchQuery;
    var searchResults;
    const searchInputHandler = async () => {
      if (searchQuery) {
        $$invalidate(5, searchResults = await rpc_default("Search", searchQuery));
      } else {
        $$invalidate(5, searchResults = { title_matches: [], content_matches: [] });
      }
    };
    const searchKeypress = (ev) => {
      if (ev.key === "Enter" && searchResults) {
        const results = (ev.shiftKey ? searchResults.title_matches : searchResults.content_matches).filter((x) => x[0] !== currentPage);
        if (results.length > 0) {
          switchPage(results[0][0]);
        }
      }
    };
    const reverse = (xs) => {
      const xsprime = xs.map((x) => x);
      xsprime.reverse();
      return xsprime;
    };
    onMount(updateRoute);
    var searchInput;
    registerShortcut("/", () => searchInput.focus());
    registerShortcut("e", () => switchPageState("edit"));
    registerShortcut("v", () => switchPageState(""));
    function input_input_handler() {
      searchQuery = this.value;
      $$invalidate(4, searchQuery);
    }
    function input_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        searchInput = $$value;
        $$invalidate(6, searchInput);
      });
    }
    return [
      child,
      params,
      searchMode,
      recent,
      searchQuery,
      searchResults,
      searchInput,
      page,
      updateRoute,
      searchInputHandler,
      searchKeypress,
      reverse,
      input_input_handler,
      input_binding
    ];
  }
  var App = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance14, create_fragment14, safe_not_equal, {});
    }
  };
  var App_default = App;

  // client/app.js
  new App_default({
    target: document.body
  });
})();
/*!
    localForage -- Offline Storage, Improved
    Version 1.10.0
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
