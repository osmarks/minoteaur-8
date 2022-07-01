(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __commonJS = (cb, mod) => function __require() {
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

  // node_modules/dayjs/dayjs.min.js
  var require_dayjs_min = __commonJS({
    "node_modules/dayjs/dayjs.min.js"(exports, module) {
      !function(t, e) {
        typeof exports == "object" && typeof module != "undefined" ? module.exports = e() : typeof define == "function" && define.amd ? define(e) : (t = typeof globalThis != "undefined" ? globalThis : t || self).dayjs = e();
      }(exports, function() {
        "use strict";
        var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", f = "month", h = "quarter", c = "year", d = "date", $ = "Invalid Date", l = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_") }, m = function(t2, e2, n2) {
          var r2 = String(t2);
          return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
        }, g = { s: m, z: function(t2) {
          var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
          return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
        }, m: function t2(e2, n2) {
          if (e2.date() < n2.date())
            return -t2(n2, e2);
          var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, f), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), f);
          return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
        }, a: function(t2) {
          return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
        }, p: function(t2) {
          return { M: f, y: c, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: h }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
        }, u: function(t2) {
          return t2 === void 0;
        } }, D = "en", v = {};
        v[D] = M;
        var p = function(t2) {
          return t2 instanceof _;
        }, S = function(t2, e2, n2) {
          var r2;
          if (!t2)
            return D;
          if (typeof t2 == "string")
            v[t2] && (r2 = t2), e2 && (v[t2] = e2, r2 = t2);
          else {
            var i2 = t2.name;
            v[i2] = t2, r2 = i2;
          }
          return !n2 && r2 && (D = r2), r2 || !n2 && D;
        }, w = function(t2, e2) {
          if (p(t2))
            return t2.clone();
          var n2 = typeof e2 == "object" ? e2 : {};
          return n2.date = t2, n2.args = arguments, new _(n2);
        }, O = g;
        O.l = S, O.i = p, O.w = function(t2, e2) {
          return w(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
        };
        var _ = function() {
          function M2(t2) {
            this.$L = S(t2.locale, null, true), this.parse(t2);
          }
          var m2 = M2.prototype;
          return m2.parse = function(t2) {
            this.$d = function(t3) {
              var e2 = t3.date, n2 = t3.utc;
              if (e2 === null)
                return new Date(NaN);
              if (O.u(e2))
                return new Date();
              if (e2 instanceof Date)
                return new Date(e2);
              if (typeof e2 == "string" && !/Z$/i.test(e2)) {
                var r2 = e2.match(l);
                if (r2) {
                  var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                  return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
                }
              }
              return new Date(e2);
            }(t2), this.$x = t2.x || {}, this.init();
          }, m2.init = function() {
            var t2 = this.$d;
            this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
          }, m2.$utils = function() {
            return O;
          }, m2.isValid = function() {
            return !(this.$d.toString() === $);
          }, m2.isSame = function(t2, e2) {
            var n2 = w(t2);
            return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
          }, m2.isAfter = function(t2, e2) {
            return w(t2) < this.startOf(e2);
          }, m2.isBefore = function(t2, e2) {
            return this.endOf(e2) < w(t2);
          }, m2.$g = function(t2, e2, n2) {
            return O.u(t2) ? this[e2] : this.set(n2, t2);
          }, m2.unix = function() {
            return Math.floor(this.valueOf() / 1e3);
          }, m2.valueOf = function() {
            return this.$d.getTime();
          }, m2.startOf = function(t2, e2) {
            var n2 = this, r2 = !!O.u(e2) || e2, h2 = O.p(t2), $2 = function(t3, e3) {
              var i2 = O.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
              return r2 ? i2 : i2.endOf(a);
            }, l2 = function(t3, e3) {
              return O.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
            }, y2 = this.$W, M3 = this.$M, m3 = this.$D, g2 = "set" + (this.$u ? "UTC" : "");
            switch (h2) {
              case c:
                return r2 ? $2(1, 0) : $2(31, 11);
              case f:
                return r2 ? $2(1, M3) : $2(0, M3 + 1);
              case o:
                var D2 = this.$locale().weekStart || 0, v2 = (y2 < D2 ? y2 + 7 : y2) - D2;
                return $2(r2 ? m3 - v2 : m3 + (6 - v2), M3);
              case a:
              case d:
                return l2(g2 + "Hours", 0);
              case u:
                return l2(g2 + "Minutes", 1);
              case s:
                return l2(g2 + "Seconds", 2);
              case i:
                return l2(g2 + "Milliseconds", 3);
              default:
                return this.clone();
            }
          }, m2.endOf = function(t2) {
            return this.startOf(t2, false);
          }, m2.$set = function(t2, e2) {
            var n2, o2 = O.p(t2), h2 = "set" + (this.$u ? "UTC" : ""), $2 = (n2 = {}, n2[a] = h2 + "Date", n2[d] = h2 + "Date", n2[f] = h2 + "Month", n2[c] = h2 + "FullYear", n2[u] = h2 + "Hours", n2[s] = h2 + "Minutes", n2[i] = h2 + "Seconds", n2[r] = h2 + "Milliseconds", n2)[o2], l2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
            if (o2 === f || o2 === c) {
              var y2 = this.clone().set(d, 1);
              y2.$d[$2](l2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
            } else
              $2 && this.$d[$2](l2);
            return this.init(), this;
          }, m2.set = function(t2, e2) {
            return this.clone().$set(t2, e2);
          }, m2.get = function(t2) {
            return this[O.p(t2)]();
          }, m2.add = function(r2, h2) {
            var d2, $2 = this;
            r2 = Number(r2);
            var l2 = O.p(h2), y2 = function(t2) {
              var e2 = w($2);
              return O.w(e2.date(e2.date() + Math.round(t2 * r2)), $2);
            };
            if (l2 === f)
              return this.set(f, this.$M + r2);
            if (l2 === c)
              return this.set(c, this.$y + r2);
            if (l2 === a)
              return y2(1);
            if (l2 === o)
              return y2(7);
            var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[l2] || 1, m3 = this.$d.getTime() + r2 * M3;
            return O.w(m3, this);
          }, m2.subtract = function(t2, e2) {
            return this.add(-1 * t2, e2);
          }, m2.format = function(t2) {
            var e2 = this, n2 = this.$locale();
            if (!this.isValid())
              return n2.invalidDate || $;
            var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = O.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, f2 = n2.months, h2 = function(t3, n3, i3, s3) {
              return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].substr(0, s3);
            }, c2 = function(t3) {
              return O.s(s2 % 12 || 12, t3, "0");
            }, d2 = n2.meridiem || function(t3, e3, n3) {
              var r3 = t3 < 12 ? "AM" : "PM";
              return n3 ? r3.toLowerCase() : r3;
            }, l2 = { YY: String(this.$y).slice(-2), YYYY: this.$y, M: a2 + 1, MM: O.s(a2 + 1, 2, "0"), MMM: h2(n2.monthsShort, a2, f2, 3), MMMM: h2(f2, a2), D: this.$D, DD: O.s(this.$D, 2, "0"), d: String(this.$W), dd: h2(n2.weekdaysMin, this.$W, o2, 2), ddd: h2(n2.weekdaysShort, this.$W, o2, 3), dddd: o2[this.$W], H: String(s2), HH: O.s(s2, 2, "0"), h: c2(1), hh: c2(2), a: d2(s2, u2, true), A: d2(s2, u2, false), m: String(u2), mm: O.s(u2, 2, "0"), s: String(this.$s), ss: O.s(this.$s, 2, "0"), SSS: O.s(this.$ms, 3, "0"), Z: i2 };
            return r2.replace(y, function(t3, e3) {
              return e3 || l2[t3] || i2.replace(":", "");
            });
          }, m2.utcOffset = function() {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
          }, m2.diff = function(r2, d2, $2) {
            var l2, y2 = O.p(d2), M3 = w(r2), m3 = (M3.utcOffset() - this.utcOffset()) * e, g2 = this - M3, D2 = O.m(this, M3);
            return D2 = (l2 = {}, l2[c] = D2 / 12, l2[f] = D2, l2[h] = D2 / 3, l2[o] = (g2 - m3) / 6048e5, l2[a] = (g2 - m3) / 864e5, l2[u] = g2 / n, l2[s] = g2 / e, l2[i] = g2 / t, l2)[y2] || g2, $2 ? D2 : O.a(D2);
          }, m2.daysInMonth = function() {
            return this.endOf(f).$D;
          }, m2.$locale = function() {
            return v[this.$L];
          }, m2.locale = function(t2, e2) {
            if (!t2)
              return this.$L;
            var n2 = this.clone(), r2 = S(t2, e2, true);
            return r2 && (n2.$L = r2), n2;
          }, m2.clone = function() {
            return O.w(this.$d, this);
          }, m2.toDate = function() {
            return new Date(this.valueOf());
          }, m2.toJSON = function() {
            return this.isValid() ? this.toISOString() : null;
          }, m2.toISOString = function() {
            return this.$d.toISOString();
          }, m2.toString = function() {
            return this.$d.toUTCString();
          }, M2;
        }(), b = _.prototype;
        return w.prototype = b, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", f], ["$y", c], ["$D", d]].forEach(function(t2) {
          b[t2[1]] = function(e2) {
            return this.$g(e2, t2[0], t2[1]);
          };
        }), w.extend = function(t2, e2) {
          return t2.$i || (t2(e2, _, w), t2.$i = true), w;
        }, w.locale = S, w.isDayjs = p, w.unix = function(t2) {
          return w(1e3 * t2);
        }, w.en = v[D], w.Ls = v, w.p = {}, w;
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
  function element(name2) {
    return document.createElement(name2);
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
  function init(component, options, instance10, create_fragment11, not_equal, props, dirty = [-1]) {
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
    $$.ctx = instance10 ? instance10(component, options.props || {}, (i, ret, ...rest) => {
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
    $$.fragment = create_fragment11 ? create_fragment11($$.ctx) : false;
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
  function create_if_block(ctx) {
    let img;
    let img_src_value;
    return {
      c() {
        img = element("img");
        if (img.src !== (img_src_value = ctx[1]))
          attr(img, "src", img_src_value);
        attr(img, "class", "svelte-1a8wdpe");
      },
      m(target, anchor) {
        insert(target, img, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(img);
      }
    };
  }
  function create_fragment(ctx) {
    let h1;
    let div;
    let t;
    let current;
    const default_slot_template = ctx[4].default;
    const default_slot = create_slot(default_slot_template, ctx, ctx[3], null);
    let if_block = ctx[1] && create_if_block(ctx);
    return {
      c() {
        h1 = element("h1");
        div = element("div");
        if (default_slot)
          default_slot.c();
        t = space();
        if (if_block)
          if_block.c();
        attr(div, "class", "other");
        attr(h1, "style", ctx[0]);
        attr(h1, "class", "svelte-1a8wdpe");
      },
      m(target, anchor) {
        insert(target, h1, anchor);
        append(h1, div);
        if (default_slot) {
          default_slot.m(div, null);
        }
        append(h1, t);
        if (if_block)
          if_block.m(h1, null);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (default_slot) {
          if (default_slot.p && (!current || dirty & 8)) {
            update_slot(default_slot, default_slot_template, ctx2, ctx2[3], !current ? -1 : dirty, null, null);
          }
        }
        if (ctx2[1])
          if_block.p(ctx2, dirty);
        if (!current || dirty & 1) {
          attr(h1, "style", ctx2[0]);
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
        if (default_slot)
          default_slot.d(detaching);
        if (if_block)
          if_block.d();
      }
    };
  }
  function instance($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    let { page } = $$props;
    let url = page.icon_filename && `/file/${page.id}/${encodeURIComponent(page.icon_filename)}`;
    let { style = "" } = $$props;
    $$self.$$set = ($$props2) => {
      if ("page" in $$props2)
        $$invalidate(2, page = $$props2.page);
      if ("style" in $$props2)
        $$invalidate(0, style = $$props2.style);
      if ("$$scope" in $$props2)
        $$invalidate(3, $$scope = $$props2.$$scope);
    };
    return [style, url, page, $$scope, slots];
  }
  var IconHeader = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance, create_fragment, safe_not_equal, { page: 2, style: 0 });
    }
  };
  var IconHeader_default = IconHeader;

  // client/InteractiveListPage.svelte
  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[1] = list[i];
    return child_ctx;
  }
  function create_each_block(ctx) {
    let div;
    let raw_value = ctx[1] + "";
    return {
      c() {
        div = element("div");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        div.innerHTML = raw_value;
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function create_fragment2(ctx) {
    let ul;
    let each_value = item;
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }
    return {
      c() {
        ul = element("ul");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
      },
      m(target, anchor) {
        insert(target, ul, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & 0) {
          each_value = item;
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block(child_ctx);
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
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(ul);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function instance2($$self) {
    let items;
    return [];
  }
  var InteractiveListPage = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance2, create_fragment2, safe_not_equal, {});
    }
  };
  var InteractiveListPage_default = InteractiveListPage;

  // client/View.svelte
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
  function create_if_block_1(ctx) {
    let interactivelistpage;
    let current;
    interactivelistpage = new InteractiveListPage_default({
      props: {
        items: ctx[1].rendered_content.List
      }
    });
    return {
      c() {
        create_component(interactivelistpage.$$.fragment);
      },
      m(target, anchor) {
        mount_component(interactivelistpage, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const interactivelistpage_changes = {};
        if (dirty & 2)
          interactivelistpage_changes.items = ctx2[1].rendered_content.List;
        interactivelistpage.$set(interactivelistpage_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(interactivelistpage.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(interactivelistpage.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(interactivelistpage, detaching);
      }
    };
  }
  function create_if_block2(ctx) {
    let div;
    let raw_value = ctx[1].rendered_content.Markdown + "";
    return {
      c() {
        div = element("div");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        div.innerHTML = raw_value;
      },
      p(ctx2, dirty) {
        if (dirty & 2 && raw_value !== (raw_value = ctx2[1].rendered_content.Markdown + ""))
          div.innerHTML = raw_value;
        ;
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function create_fragment3(ctx) {
    let a;
    let t0;
    let a_href_value;
    let t1;
    let iconheader;
    let t2;
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    iconheader = new IconHeader_default({
      props: {
        page: ctx[1],
        $$slots: { default: [create_default_slot] },
        $$scope: { ctx }
      }
    });
    const if_block_creators = [create_if_block2, create_if_block_1];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[1].rendered_content.Markdown)
        return 0;
      if (ctx2[1].rendered_content.List)
        return 1;
      return -1;
    }
    if (~(current_block_type_index = select_block_type(ctx, -1))) {
      if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    }
    return {
      c() {
        a = element("a");
        t0 = text("Edit");
        t1 = space();
        create_component(iconheader.$$.fragment);
        t2 = space();
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
        attr(a, "href", a_href_value = "#/page/" + ctx[0] + "/edit");
      },
      m(target, anchor) {
        insert(target, a, anchor);
        append(a, t0);
        insert(target, t1, anchor);
        mount_component(iconheader, target, anchor);
        insert(target, t2, anchor);
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].m(target, anchor);
        }
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (!current || dirty & 1 && a_href_value !== (a_href_value = "#/page/" + ctx2[0] + "/edit")) {
          attr(a, "href", a_href_value);
        }
        const iconheader_changes = {};
        if (dirty & 2)
          iconheader_changes.page = ctx2[1];
        if (dirty & 6) {
          iconheader_changes.$$scope = { dirty, ctx: ctx2 };
        }
        iconheader.$set(iconheader_changes);
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if (~current_block_type_index) {
            if_blocks[current_block_type_index].p(ctx2, dirty);
          }
        } else {
          if (if_block) {
            group_outros();
            transition_out(if_blocks[previous_block_index], 1, 1, () => {
              if_blocks[previous_block_index] = null;
            });
            check_outros();
          }
          if (~current_block_type_index) {
            if_block = if_blocks[current_block_type_index];
            if (!if_block) {
              if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
              if_block.c();
            } else {
              if_block.p(ctx2, dirty);
            }
            transition_in(if_block, 1);
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          } else {
            if_block = null;
          }
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(iconheader.$$.fragment, local);
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(iconheader.$$.fragment, local);
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(a);
        if (detaching)
          detach(t1);
        destroy_component(iconheader, detaching);
        if (detaching)
          detach(t2);
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].d(detaching);
        }
        if (detaching)
          detach(if_block_anchor);
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

  // client/util.js
  var import_dayjs = __toModule(require_dayjs_min());
  var setRoute = (...parts) => {
    window.location.hash = "#/" + parts.map(encodeURIComponent).join("/");
  };
  var formatDate = (dt) => (0, import_dayjs.default)(dt).format("YYYY-MM-DD HH:mm:ss");
  var metricPrefixes = ["", "k", "M", "G", "T", "P", "E", "Z", "Y"];
  var applyMetricPrefix = (x, unit) => {
    let exp = Math.floor(Math.log10(x) / 3);
    let val = x / Math.pow(10, exp * 3);
    return val.toFixed(3) + metricPrefixes[exp] + unit;
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
        attr(button, "class", "svelte-15cbyli");
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
  function get_each_context2(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[2] = list[i][0];
    child_ctx[29] = list[i][1];
    return child_ctx;
  }
  function get_each_context_1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[29] = list[i];
    return child_ctx;
  }
  function create_else_block_3(ctx) {
    let input;
    let mounted;
    let dispose;
    return {
      c() {
        input = element("input");
        attr(input, "class", "title svelte-1bue60s");
      },
      m(target, anchor) {
        insert(target, input, anchor);
        set_input_value(input, ctx[0]);
        if (!mounted) {
          dispose = listen(input, "input", ctx[21]);
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty[0] & 1 && input.value !== ctx2[0]) {
          set_input_value(input, ctx2[0]);
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(input);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_10(ctx) {
    let a;
    let t0;
    let a_href_value;
    let t1;
    let iconheader;
    let current;
    iconheader = new IconHeader_default({
      props: {
        page: ctx[1],
        $$slots: { default: [create_default_slot_7] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        a = element("a");
        t0 = text("View");
        t1 = space();
        create_component(iconheader.$$.fragment);
        attr(a, "href", a_href_value = "#/page/" + ctx[2] + "/");
      },
      m(target, anchor) {
        insert(target, a, anchor);
        append(a, t0);
        insert(target, t1, anchor);
        mount_component(iconheader, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        if (!current || dirty[0] & 4 && a_href_value !== (a_href_value = "#/page/" + ctx2[2] + "/")) {
          attr(a, "href", a_href_value);
        }
        const iconheader_changes = {};
        if (dirty[0] & 2)
          iconheader_changes.page = ctx2[1];
        if (dirty[0] & 2 | dirty[1] & 8) {
          iconheader_changes.$$scope = { dirty, ctx: ctx2 };
        }
        iconheader.$set(iconheader_changes);
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
        if (detaching)
          detach(a);
        if (detaching)
          detach(t1);
        destroy_component(iconheader, detaching);
      }
    };
  }
  function create_default_slot_7(ctx) {
    let t0;
    let t1_value = ctx[1].title + "";
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
        if (dirty[0] & 2 && t1_value !== (t1_value = ctx2[1].title + ""))
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
  function create_else_block_2(ctx) {
    let t;
    return {
      c() {
        t = text("invalid content type");
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_if_block_9(ctx) {
    let interactivelistpage;
    let current;
    interactivelistpage = new InteractiveListPage_default({ props: { items: ctx[3] } });
    return {
      c() {
        create_component(interactivelistpage.$$.fragment);
      },
      m(target, anchor) {
        mount_component(interactivelistpage, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const interactivelistpage_changes = {};
        if (dirty[0] & 8)
          interactivelistpage_changes.items = ctx2[3];
        interactivelistpage.$set(interactivelistpage_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(interactivelistpage.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(interactivelistpage.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(interactivelistpage, detaching);
      }
    };
  }
  function create_if_block_8(ctx) {
    let textarea;
    let mounted;
    let dispose;
    return {
      c() {
        textarea = element("textarea");
        attr(textarea, "class", "editor svelte-1bue60s");
      },
      m(target, anchor) {
        insert(target, textarea, anchor);
        set_input_value(textarea, ctx[3]);
        ctx[23](textarea);
        if (!mounted) {
          dispose = [
            listen(textarea, "input", ctx[22]),
            listen(textarea, "keydown", ctx[20]),
            listen(textarea, "keypress", ctx[19])
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty[0] & 8) {
          set_input_value(textarea, ctx2[3]);
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(textarea);
        ctx[23](null);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_default_slot_6(ctx) {
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
  function create_default_slot_5(ctx) {
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
  function create_default_slot_4(ctx) {
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
  function create_if_block_7(ctx) {
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
  function create_if_block_5(ctx) {
    let t;
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    const if_block_creators = [create_if_block_6, create_else_block_1];
    const if_blocks = [];
    function select_block_type_2(ctx2, dirty) {
      if (ctx2[4].type === "Conflict")
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type_2(ctx, [-1, -1]);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        t = space();
        if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        insert(target, t, anchor);
        if_blocks[current_block_type_index].m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type_2(ctx2, dirty);
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
        if (detaching)
          detach(t);
        if_blocks[current_block_type_index].d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function create_else_block_1(ctx) {
    let error_1;
    let current;
    error_1 = new Error_default({
      props: {
        $$slots: { default: [create_default_slot_3] },
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
        if (dirty[0] & 16 | dirty[1] & 8) {
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
  function create_if_block_6(ctx) {
    let error_1;
    let current;
    error_1 = new Error_default({
      props: {
        $$slots: { default: [create_default_slot_2] },
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
        if (dirty[0] & 17 | dirty[1] & 8) {
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
  function create_default_slot_3(ctx) {
    let t;
    return {
      c() {
        t = text(ctx[4]);
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 16)
          set_data(t, ctx2[4]);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot_2(ctx) {
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
        attr(a, "href", a_href_value = "#/page/" + ctx[4].arg);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, a, anchor);
        append(a, t1);
        insert(target, t2, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 1)
          set_data(t1, ctx2[0]);
        if (dirty[0] & 16 && a_href_value !== (a_href_value = "#/page/" + ctx2[4].arg)) {
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
  function create_if_block_4(ctx) {
    let div;
    let t0;
    let t1_value = ctx[29].error + "";
    let t1;
    return {
      c() {
        div = element("div");
        t0 = text("Failed, code ");
        t1 = text(t1_value);
        attr(div, "class", "error");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, t0);
        append(div, t1);
      },
      p: noop,
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function create_each_block_1(ctx) {
    let li;
    let t0;
    let div;
    let progress;
    let progress_value_value;
    let t1;
    let span;
    let t2_value = ctx[29].file.name + "";
    let t2;
    let t3;
    let t4_value = formatDate(ctx[29].file.lastModified) + "";
    let t4;
    let t5;
    let t6_value = applyMetricPrefix(ctx[29].file.size, "B") + "";
    let t6;
    let if_block = ctx[29].error && create_if_block_4(ctx);
    return {
      c() {
        li = element("li");
        if (if_block)
          if_block.c();
        t0 = space();
        div = element("div");
        progress = element("progress");
        t1 = space();
        span = element("span");
        t2 = text(t2_value);
        t3 = text(" - ");
        t4 = text(t4_value);
        t5 = text(" - ");
        t6 = text(t6_value);
        attr(progress, "min", "0");
        attr(progress, "max", "1");
        progress.value = progress_value_value = ctx[29].progress;
        attr(progress, "class", "svelte-1bue60s");
      },
      m(target, anchor) {
        insert(target, li, anchor);
        if (if_block)
          if_block.m(li, null);
        append(li, t0);
        append(li, div);
        append(div, progress);
        append(li, t1);
        append(li, span);
        append(span, t2);
        append(span, t3);
        append(span, t4);
        append(span, t5);
        append(span, t6);
      },
      p(ctx2, dirty) {
        if (ctx2[29].error)
          if_block.p(ctx2, dirty);
      },
      d(detaching) {
        if (detaching)
          detach(li);
        if (if_block)
          if_block.d();
      }
    };
  }
  function create_default_slot_1(ctx) {
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
  function create_if_block_3(ctx) {
    let largebutton;
    let current;
    function func_1() {
      return ctx[25](ctx[29]);
    }
    largebutton = new LargeButton_default({
      props: {
        onclick: func_1,
        color: "#75fd63",
        $$slots: { default: [create_default_slot2] },
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
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const largebutton_changes = {};
        if (dirty[0] & 128)
          largebutton_changes.onclick = func_1;
        if (dirty[1] & 8) {
          largebutton_changes.$$scope = { dirty, ctx };
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
  function create_default_slot2(ctx) {
    let t;
    return {
      c() {
        t = text("Make Icon");
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
  function create_else_block(ctx) {
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
  function create_if_block_2(ctx) {
    let video;
    let video_src_value;
    let video_alt_value;
    return {
      c() {
        video = element("video");
        if (video.src !== (video_src_value = ctx[29].path))
          attr(video, "src", video_src_value);
        attr(video, "alt", video_alt_value = ctx[29].filename);
        attr(video, "class", "file svelte-1bue60s");
        video.controls = true;
      },
      m(target, anchor) {
        insert(target, video, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 128 && video.src !== (video_src_value = ctx2[29].path)) {
          attr(video, "src", video_src_value);
        }
        if (dirty[0] & 128 && video_alt_value !== (video_alt_value = ctx2[29].filename)) {
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
        if (audio.src !== (audio_src_value = ctx[29].path))
          attr(audio, "src", audio_src_value);
        attr(audio, "alt", audio_alt_value = ctx[29].filename);
        attr(audio, "class", "file svelte-1bue60s");
        audio.controls = true;
      },
      m(target, anchor) {
        insert(target, audio, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 128 && audio.src !== (audio_src_value = ctx2[29].path)) {
          attr(audio, "src", audio_src_value);
        }
        if (dirty[0] & 128 && audio_alt_value !== (audio_alt_value = ctx2[29].filename)) {
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
        if (img.src !== (img_src_value = ctx[29].path))
          attr(img, "src", img_src_value);
        attr(img, "alt", img_alt_value = ctx[29].filename);
        attr(img, "class", "file svelte-1bue60s");
      },
      m(target, anchor) {
        insert(target, img, anchor);
      },
      p(ctx2, dirty) {
        if (dirty[0] & 128 && img.src !== (img_src_value = ctx2[29].path)) {
          attr(img, "src", img_src_value);
        }
        if (dirty[0] & 128 && img_alt_value !== (img_alt_value = ctx2[29].filename)) {
          attr(img, "alt", img_alt_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(img);
      }
    };
  }
  function create_each_block2(ctx) {
    let li;
    let div2;
    let largebutton;
    let t0;
    let t1;
    let a0;
    let t2_value = ctx[29].filename + "";
    let t2;
    let t3;
    let div0;
    let t4_value = ctx[29].mime_type + "";
    let t4;
    let t5;
    let div1;
    let t6_value = formatDate(ctx[29].upload_time) + "";
    let t6;
    let t7;
    let a1;
    let a1_href_value;
    let t8;
    let current;
    let mounted;
    let dispose;
    function func() {
      return ctx[24](ctx[2]);
    }
    largebutton = new LargeButton_default({
      props: {
        onclick: func,
        color: "#ff5b00",
        $$slots: { default: [create_default_slot_1] },
        $$scope: { ctx }
      }
    });
    let if_block0 = ctx[29].type == "image" && create_if_block_3(ctx);
    function click_handler() {
      return ctx[26](ctx[29]);
    }
    function select_block_type_3(ctx2, dirty) {
      if (ctx2[29].type == "image")
        return create_if_block3;
      if (ctx2[29].type == "audio")
        return create_if_block_12;
      if (ctx2[29].type == "video")
        return create_if_block_2;
      return create_else_block;
    }
    let current_block_type = select_block_type_3(ctx, [-1, -1]);
    let if_block1 = current_block_type(ctx);
    return {
      c() {
        li = element("li");
        div2 = element("div");
        create_component(largebutton.$$.fragment);
        t0 = space();
        if (if_block0)
          if_block0.c();
        t1 = space();
        a0 = element("a");
        t2 = text(t2_value);
        t3 = space();
        div0 = element("div");
        t4 = text(t4_value);
        t5 = space();
        div1 = element("div");
        t6 = text(t6_value);
        t7 = space();
        a1 = element("a");
        if_block1.c();
        t8 = space();
        attr(a0, "href", "");
        attr(div2, "class", "info svelte-1bue60s");
        attr(a1, "href", a1_href_value = ctx[29].path);
        attr(li, "class", "file svelte-1bue60s");
      },
      m(target, anchor) {
        insert(target, li, anchor);
        append(li, div2);
        mount_component(largebutton, div2, null);
        append(div2, t0);
        if (if_block0)
          if_block0.m(div2, null);
        append(div2, t1);
        append(div2, a0);
        append(a0, t2);
        append(div2, t3);
        append(div2, div0);
        append(div0, t4);
        append(div2, t5);
        append(div2, div1);
        append(div1, t6);
        append(li, t7);
        append(li, a1);
        if_block1.m(a1, null);
        append(li, t8);
        current = true;
        if (!mounted) {
          dispose = listen(a0, "click", prevent_default(click_handler));
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const largebutton_changes = {};
        if (dirty[0] & 128)
          largebutton_changes.onclick = func;
        if (dirty[1] & 8) {
          largebutton_changes.$$scope = { dirty, ctx };
        }
        largebutton.$set(largebutton_changes);
        if (ctx[29].type == "image") {
          if (if_block0) {
            if_block0.p(ctx, dirty);
            if (dirty[0] & 128) {
              transition_in(if_block0, 1);
            }
          } else {
            if_block0 = create_if_block_3(ctx);
            if_block0.c();
            transition_in(if_block0, 1);
            if_block0.m(div2, t1);
          }
        } else if (if_block0) {
          group_outros();
          transition_out(if_block0, 1, 1, () => {
            if_block0 = null;
          });
          check_outros();
        }
        if ((!current || dirty[0] & 128) && t2_value !== (t2_value = ctx[29].filename + ""))
          set_data(t2, t2_value);
        if ((!current || dirty[0] & 128) && t4_value !== (t4_value = ctx[29].mime_type + ""))
          set_data(t4, t4_value);
        if ((!current || dirty[0] & 128) && t6_value !== (t6_value = formatDate(ctx[29].upload_time) + ""))
          set_data(t6, t6_value);
        if (current_block_type === (current_block_type = select_block_type_3(ctx, dirty)) && if_block1) {
          if_block1.p(ctx, dirty);
        } else {
          if_block1.d(1);
          if_block1 = current_block_type(ctx);
          if (if_block1) {
            if_block1.c();
            if_block1.m(a1, null);
          }
        }
        if (!current || dirty[0] & 128 && a1_href_value !== (a1_href_value = ctx[29].path)) {
          attr(a1, "href", a1_href_value);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(largebutton.$$.fragment, local);
        transition_in(if_block0);
        current = true;
      },
      o(local) {
        transition_out(largebutton.$$.fragment, local);
        transition_out(if_block0);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(li);
        destroy_component(largebutton);
        if (if_block0)
          if_block0.d();
        if_block1.d();
        mounted = false;
        dispose();
      }
    };
  }
  function create_fragment7(ctx) {
    let current_block_type_index;
    let if_block0;
    let t0;
    let current_block_type_index_1;
    let if_block1;
    let t1;
    let largebutton0;
    let t2;
    let largebutton1;
    let t3;
    let largebutton2;
    let t4;
    let t5;
    let t6;
    let div4;
    let div0;
    let t7;
    let t8;
    let t9;
    let div1;
    let t10_value = ctx[3].length + "";
    let t10;
    let t11;
    let t12;
    let div2;
    let t13_value = ctx[10](ctx[3]) + "";
    let t13;
    let t14;
    let t15;
    let div3;
    let t16_value = ctx[11](ctx[3]) + "";
    let t16;
    let t17;
    let t18;
    let ul;
    let t19;
    let current;
    const if_block_creators = [create_if_block_10, create_else_block_3];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[1])
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, [-1, -1]);
    if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    const if_block_creators_1 = [create_if_block_8, create_if_block_9, create_else_block_2];
    const if_blocks_1 = [];
    function select_block_type_1(ctx2, dirty) {
      if (ctx2[9] === "Markdown")
        return 0;
      if (ctx2[9] === "List")
        return 1;
      return 2;
    }
    current_block_type_index_1 = select_block_type_1(ctx, [-1, -1]);
    if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    largebutton0 = new LargeButton_default({
      props: {
        onclick: ctx[12],
        color: "#06c2ac",
        $$slots: { default: [create_default_slot_6] },
        $$scope: { ctx }
      }
    });
    largebutton1 = new LargeButton_default({
      props: {
        onclick: ctx[13],
        color: "#bf77f6",
        $$slots: { default: [create_default_slot_5] },
        $$scope: { ctx }
      }
    });
    largebutton2 = new LargeButton_default({
      props: {
        onclick: ctx[15],
        color: "#fcb001",
        $$slots: { default: [create_default_slot_4] },
        $$scope: { ctx }
      }
    });
    let if_block2 = ctx[6] && create_if_block_7(ctx);
    let if_block3 = ctx[4] && create_if_block_5(ctx);
    let each_value_1 = Object.values(ctx[14]);
    let each_blocks_1 = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    }
    let each_value = Object.entries(ctx[7]);
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block2(get_each_context2(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        if_block0.c();
        t0 = space();
        if_block1.c();
        t1 = space();
        create_component(largebutton0.$$.fragment);
        t2 = space();
        create_component(largebutton1.$$.fragment);
        t3 = space();
        create_component(largebutton2.$$.fragment);
        t4 = space();
        if (if_block2)
          if_block2.c();
        t5 = space();
        if (if_block3)
          if_block3.c();
        t6 = space();
        div4 = element("div");
        div0 = element("div");
        t7 = text(ctx[5]);
        t8 = text(" keypresses");
        t9 = space();
        div1 = element("div");
        t10 = text(t10_value);
        t11 = text(" characters");
        t12 = space();
        div2 = element("div");
        t13 = text(t13_value);
        t14 = text(" words");
        t15 = space();
        div3 = element("div");
        t16 = text(t16_value);
        t17 = text(" lines");
        t18 = space();
        ul = element("ul");
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].c();
        }
        t19 = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(div4, "class", "info");
        attr(ul, "class", "files");
      },
      m(target, anchor) {
        if_blocks[current_block_type_index].m(target, anchor);
        insert(target, t0, anchor);
        if_blocks_1[current_block_type_index_1].m(target, anchor);
        insert(target, t1, anchor);
        mount_component(largebutton0, target, anchor);
        insert(target, t2, anchor);
        mount_component(largebutton1, target, anchor);
        insert(target, t3, anchor);
        mount_component(largebutton2, target, anchor);
        insert(target, t4, anchor);
        if (if_block2)
          if_block2.m(target, anchor);
        insert(target, t5, anchor);
        if (if_block3)
          if_block3.m(target, anchor);
        insert(target, t6, anchor);
        insert(target, div4, anchor);
        append(div4, div0);
        append(div0, t7);
        append(div0, t8);
        append(div4, t9);
        append(div4, div1);
        append(div1, t10);
        append(div1, t11);
        append(div4, t12);
        append(div4, div2);
        append(div2, t13);
        append(div2, t14);
        append(div4, t15);
        append(div4, div3);
        append(div3, t16);
        append(div3, t17);
        insert(target, t18, anchor);
        insert(target, ul, anchor);
        for (let i = 0; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].m(ul, null);
        }
        append(ul, t19);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
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
          if_block0 = if_blocks[current_block_type_index];
          if (!if_block0) {
            if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block0.c();
          } else {
            if_block0.p(ctx2, dirty);
          }
          transition_in(if_block0, 1);
          if_block0.m(t0.parentNode, t0);
        }
        if_block1.p(ctx2, dirty);
        const largebutton0_changes = {};
        if (dirty[1] & 8) {
          largebutton0_changes.$$scope = { dirty, ctx: ctx2 };
        }
        largebutton0.$set(largebutton0_changes);
        const largebutton1_changes = {};
        if (dirty[1] & 8) {
          largebutton1_changes.$$scope = { dirty, ctx: ctx2 };
        }
        largebutton1.$set(largebutton1_changes);
        const largebutton2_changes = {};
        if (dirty[1] & 8) {
          largebutton2_changes.$$scope = { dirty, ctx: ctx2 };
        }
        largebutton2.$set(largebutton2_changes);
        if (ctx2[6]) {
          if (if_block2) {
            if (dirty[0] & 64) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block_7(ctx2);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(t5.parentNode, t5);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, () => {
            if_block2 = null;
          });
          check_outros();
        }
        if (ctx2[4]) {
          if (if_block3) {
            if_block3.p(ctx2, dirty);
            if (dirty[0] & 16) {
              transition_in(if_block3, 1);
            }
          } else {
            if_block3 = create_if_block_5(ctx2);
            if_block3.c();
            transition_in(if_block3, 1);
            if_block3.m(t6.parentNode, t6);
          }
        } else if (if_block3) {
          group_outros();
          transition_out(if_block3, 1, 1, () => {
            if_block3 = null;
          });
          check_outros();
        }
        if (!current || dirty[0] & 32)
          set_data(t7, ctx2[5]);
        if ((!current || dirty[0] & 8) && t10_value !== (t10_value = ctx2[3].length + ""))
          set_data(t10, t10_value);
        if ((!current || dirty[0] & 8) && t13_value !== (t13_value = ctx2[10](ctx2[3]) + ""))
          set_data(t13, t13_value);
        if ((!current || dirty[0] & 8) && t16_value !== (t16_value = ctx2[11](ctx2[3]) + ""))
          set_data(t16, t16_value);
        if (dirty[0] & 16384) {
          each_value_1 = Object.values(ctx2[14]);
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_1(ctx2, each_value_1, i);
            if (each_blocks_1[i]) {
              each_blocks_1[i].p(child_ctx, dirty);
            } else {
              each_blocks_1[i] = create_each_block_1(child_ctx);
              each_blocks_1[i].c();
              each_blocks_1[i].m(ul, t19);
            }
          }
          for (; i < each_blocks_1.length; i += 1) {
            each_blocks_1[i].d(1);
          }
          each_blocks_1.length = each_value_1.length;
        }
        if (dirty[0] & 458880) {
          each_value = Object.entries(ctx2[7]);
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
        transition_in(if_block0);
        transition_in(if_block1);
        transition_in(largebutton0.$$.fragment, local);
        transition_in(largebutton1.$$.fragment, local);
        transition_in(largebutton2.$$.fragment, local);
        transition_in(if_block2);
        transition_in(if_block3);
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        transition_out(if_block0);
        transition_out(if_block1);
        transition_out(largebutton0.$$.fragment, local);
        transition_out(largebutton1.$$.fragment, local);
        transition_out(largebutton2.$$.fragment, local);
        transition_out(if_block2);
        transition_out(if_block3);
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if_blocks[current_block_type_index].d(detaching);
        if (detaching)
          detach(t0);
        if_blocks_1[current_block_type_index_1].d(detaching);
        if (detaching)
          detach(t1);
        destroy_component(largebutton0, detaching);
        if (detaching)
          detach(t2);
        destroy_component(largebutton1, detaching);
        if (detaching)
          detach(t3);
        destroy_component(largebutton2, detaching);
        if (detaching)
          detach(t4);
        if (if_block2)
          if_block2.d(detaching);
        if (detaching)
          detach(t5);
        if (if_block3)
          if_block3.d(detaching);
        if (detaching)
          detach(t6);
        if (detaching)
          detach(div4);
        if (detaching)
          detach(t18);
        if (detaching)
          detach(ul);
        destroy_each(each_blocks_1, detaching);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function instance7($$self, $$props, $$invalidate) {
    let { id } = $$props;
    let { title } = $$props;
    let { page } = $$props;
    let contentObj = page?.content;
    let contentType = page?.content && Object.keys(page?.content)[0];
    let content = page?.content?.Markdown || "";
    let error;
    let newID;
    let keypresses = 0;
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
    let saving = false;
    const save = async () => {
      if (saving) {
        return;
      }
      $$invalidate(6, saving = true);
      $$invalidate(4, error = null);
      try {
        if (id) {
          await rpc_default("UpdatePage", [id, { Markdown: content }]);
        } else {
          newID = await rpc_default("CreatePage", { content, title });
        }
        $$invalidate(4, error = null);
        $$invalidate(6, saving = false);
        return true;
      } catch (e) {
        $$invalidate(4, error = e);
        $$invalidate(6, saving = false);
        return false;
      }
    };
    const done = async () => {
      if (await save())
        setRoute("page", newID || id);
    };
    let pendingFiles = {};
    const extantFiles = {};
    if (page?.files) {
      for (const file of page.files) {
        extantFiles[file.id] = file;
        file.path = `/file/${file.page}/${encodeURIComponent(file.filename)}`;
        file.type = file.mime_type.split("/")[0];
      }
    }
    const addFile = async () => {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.click();
      input.oninput = (ev) => {
        for (const file of ev.target.files) {
          upload(file);
        }
      };
    };
    let editorTextarea;
    const insertFileIntoDocument = (file) => {
      console.log(file);
      const start = editorTextarea.value.slice(0, editorTextarea.selectionStart) + `[`;
      $$invalidate(8, editorTextarea.value = start + `](${file.path})` + editorTextarea.value.slice(editorTextarea.selectionEnd), editorTextarea);
      editorTextarea.focus();
      $$invalidate(8, editorTextarea.selectionEnd = $$invalidate(8, editorTextarea.selectionStart = start.length, editorTextarea), editorTextarea);
    };
    const deleteFile = async (id2) => {
      await rpc_default("delete_file", id2);
      delete extantFiles[id2];
      $$invalidate(7, extantFiles);
    };
    const setAsIcon = async (filename) => {
      await rpc_default("set_as_icon", id, filename);
      $$invalidate(1, page.icon_filename = filename, page);
      $$invalidate(1, page);
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
        const match = /^(\s*)(([*+-])|(\d+)([).]))(\s*)/.exec(line);
        if (match) {
          const lineStart = match[1] + (match[4] ? (parseInt(match[4]) + 1).toString() + match[5] : match[2]) + match[6];
          const contentAfterCursor = editor.value.slice(selStart, nextLineStart);
          const prev = editor.value.substr(0, selStart) + "\n" + lineStart;
          editor.value = prev + contentAfterCursor + editor.value.substr(nextLineStart);
          editor.selectionStart = editor.selectionEnd = prev.length;
          ev.preventDefault();
        }
      }
      $$invalidate(5, keypresses++, keypresses);
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
        const match = /^(\s*)([*+-]|\d+[).])/.exec(editor.value.slice(lastLineStart, nextLineStart));
        let line = editor.value.substr(lastLineStart);
        if (ev.shiftKey) {
          line = line.replace(/^  /, "");
        } else {
          line = "  " + line;
        }
        if (match) {
          editor.value = editor.value.substr(0, lastLineStart) + line;
          editor.selectionStart = editor.selectionEnd = selStart + (ev.shiftKey ? -2 : 2);
          ev.preventDefault();
        }
      }
    };
    registerShortcut("Enter", done);
    registerShortcut("s", save);
    function input_input_handler() {
      title = this.value;
      $$invalidate(0, title);
    }
    function textarea_input_handler() {
      content = this.value;
      $$invalidate(3, content);
    }
    function textarea_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        editorTextarea = $$value;
        $$invalidate(8, editorTextarea);
      });
    }
    const func = (id2) => deleteFile(id2);
    const func_1 = (file) => setAsIcon(file.filename);
    const click_handler = (file) => insertFileIntoDocument(file);
    $$self.$$set = ($$props2) => {
      if ("id" in $$props2)
        $$invalidate(2, id = $$props2.id);
      if ("title" in $$props2)
        $$invalidate(0, title = $$props2.title);
      if ("page" in $$props2)
        $$invalidate(1, page = $$props2.page);
    };
    return [
      title,
      page,
      id,
      content,
      error,
      keypresses,
      saving,
      extantFiles,
      editorTextarea,
      contentType,
      wordCount,
      lineCount,
      save,
      done,
      pendingFiles,
      addFile,
      insertFileIntoDocument,
      deleteFile,
      setAsIcon,
      textareaKeypress,
      textareaKeydown,
      input_input_handler,
      textarea_input_handler,
      textarea_binding,
      func,
      func_1,
      click_handler
    ];
  }
  var Edit = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance7, create_fragment7, safe_not_equal, { id: 2, title: 0, page: 1 }, [-1, -1]);
    }
  };
  var Edit_default = Edit;

  // client/Index.svelte
  function create_fragment8(ctx) {
    let h1;
    return {
      c() {
        h1 = element("h1");
        h1.textContent = `Hello ${name} (green)!`;
        attr(h1, "class", "svelte-1r6p9et");
      },
      m(target, anchor) {
        insert(target, h1, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(h1);
      }
    };
  }
  var name = "world";
  var Index = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, null, create_fragment8, safe_not_equal, {});
    }
  };
  var Index_default = Index;

  // client/MetadataSidebar.svelte
  function get_each_context3(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[7] = list[i][0];
    child_ctx[8] = list[i][1];
    return child_ctx;
  }
  function get_each_context_12(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[11] = list[i];
    return child_ctx;
  }
  function create_each_block_12(ctx) {
    let li;
    let t_value = ctx[11] + "";
    let t;
    return {
      c() {
        li = element("li");
        t = text(t_value);
      },
      m(target, anchor) {
        insert(target, li, anchor);
        append(li, t);
      },
      p(ctx2, dirty) {
        if (dirty & 1 && t_value !== (t_value = ctx2[11] + ""))
          set_data(t, t_value);
      },
      d(detaching) {
        if (detaching)
          detach(li);
      }
    };
  }
  function create_else_block2(ctx) {
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
            listen(input, "input", ctx[6]),
            listen(input, "keydown", ctx[5]),
            listen(button, "click", ctx[4])
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
  function create_if_block_32(ctx) {
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
  function create_if_block_22(ctx) {
    let error;
    let current;
    error = new Error_default({
      props: {
        $$slots: { default: [create_default_slot3] },
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
        if (dirty & 16392) {
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
  function create_default_slot3(ctx) {
    let t0;
    let a;
    let t1_value = ctx[3][1] + "";
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
        attr(a, "href", a_href_value = "#/page/" + ctx[3][0]);
      },
      m(target, anchor) {
        insert(target, t0, anchor);
        insert(target, a, anchor);
        append(a, t1);
        insert(target, t2, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 8 && t1_value !== (t1_value = ctx2[3][1] + ""))
          set_data(t1, t1_value);
        if (dirty & 8 && a_href_value !== (a_href_value = "#/page/" + ctx2[3][0])) {
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
  function create_if_block4(ctx) {
    let h2;
    let t1;
    let ul;
    let each_value = Object.values(ctx[0].backlinks);
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block3(get_each_context3(ctx, each_value, i));
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
  function create_if_block_13(ctx) {
    let t_value = ` (as ${ctx[7].text})`;
    let t;
    return {
      c() {
        t = text(t_value);
      },
      m(target, anchor) {
        insert(target, t, anchor);
      },
      p(ctx2, dirty) {
        if (dirty & 1 && t_value !== (t_value = ` (as ${ctx2[7].text})`))
          set_data(t, t_value);
      },
      d(detaching) {
        if (detaching)
          detach(t);
      }
    };
  }
  function create_each_block3(ctx) {
    let li;
    let a;
    let t0_value = ctx[8] + "";
    let t0;
    let a_href_value;
    let t1;
    let show_if = ctx[7].text.toLowerCase() != ctx[0].title.toLowerCase();
    let t2;
    let div;
    let t3_value = ctx[7].context + "";
    let t3;
    let t4;
    let if_block = show_if && create_if_block_13(ctx);
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
        t3 = text(t3_value);
        t4 = space();
        attr(a, "href", a_href_value = `#/page/${ctx[7].from}`);
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
        append(div, t3);
        append(li, t4);
      },
      p(ctx2, dirty) {
        if (dirty & 1 && t0_value !== (t0_value = ctx2[8] + ""))
          set_data(t0, t0_value);
        if (dirty & 1 && a_href_value !== (a_href_value = `#/page/${ctx2[7].from}`)) {
          attr(a, "href", a_href_value);
        }
        if (dirty & 1)
          show_if = ctx2[7].text.toLowerCase() != ctx2[0].title.toLowerCase();
        if (show_if) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block_13(ctx2);
            if_block.c();
            if_block.m(li, t2);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        if (dirty & 1 && t3_value !== (t3_value = ctx2[7].context + ""))
          set_data(t3, t3_value);
      },
      d(detaching) {
        if (detaching)
          detach(li);
        if (if_block)
          if_block.d();
      }
    };
  }
  function create_fragment9(ctx) {
    let div3;
    let div0;
    let h20;
    let t1;
    let ul;
    let t2;
    let li;
    let current_block_type_index;
    let if_block0;
    let t3;
    let t4;
    let h21;
    let t6;
    let div1;
    let t7;
    let t8_value = formatDate(ctx[0].created) + "";
    let t8;
    let t9;
    let div2;
    let t10;
    let t11_value = formatDate(ctx[0].updated) + "";
    let t11;
    let t12;
    let current;
    let each_value_1 = ctx[0].names;
    let each_blocks = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block_12(get_each_context_12(ctx, each_value_1, i));
    }
    const if_block_creators = [create_if_block_32, create_else_block2];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[2])
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    let if_block1 = ctx[3] && create_if_block_22(ctx);
    let if_block2 = ctx[0].backlinks.length > 0 && create_if_block4(ctx);
    return {
      c() {
        div3 = element("div");
        div0 = element("div");
        h20 = element("h2");
        h20.textContent = "Names";
        t1 = space();
        ul = element("ul");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t2 = space();
        li = element("li");
        if_block0.c();
        t3 = space();
        if (if_block1)
          if_block1.c();
        t4 = space();
        h21 = element("h2");
        h21.textContent = "Info";
        t6 = space();
        div1 = element("div");
        t7 = text("Created ");
        t8 = text(t8_value);
        t9 = space();
        div2 = element("div");
        t10 = text("Updated ");
        t11 = text(t11_value);
        t12 = space();
        if (if_block2)
          if_block2.c();
        attr(div3, "class", "meta-root");
      },
      m(target, anchor) {
        insert(target, div3, anchor);
        append(div3, div0);
        append(div0, h20);
        append(div0, t1);
        append(div0, ul);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(ul, null);
        }
        append(ul, t2);
        append(ul, li);
        if_blocks[current_block_type_index].m(li, null);
        append(ul, t3);
        if (if_block1)
          if_block1.m(ul, null);
        append(div3, t4);
        append(div3, h21);
        append(div3, t6);
        append(div3, div1);
        append(div1, t7);
        append(div1, t8);
        append(div3, t9);
        append(div3, div2);
        append(div2, t10);
        append(div2, t11);
        append(div3, t12);
        if (if_block2)
          if_block2.m(div3, null);
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & 1) {
          each_value_1 = ctx2[0].names;
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_12(ctx2, each_value_1, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block_12(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(ul, t2);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value_1.length;
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
          if_block0.m(li, null);
        }
        if (ctx2[3]) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
            if (dirty & 8) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block_22(ctx2);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(ul, null);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });
          check_outros();
        }
        if ((!current || dirty & 1) && t8_value !== (t8_value = formatDate(ctx2[0].created) + ""))
          set_data(t8, t8_value);
        if ((!current || dirty & 1) && t11_value !== (t11_value = formatDate(ctx2[0].updated) + ""))
          set_data(t11, t11_value);
        if (ctx2[0].backlinks.length > 0) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
          } else {
            if_block2 = create_if_block4(ctx2);
            if_block2.c();
            if_block2.m(div3, null);
          }
        } else if (if_block2) {
          if_block2.d(1);
          if_block2 = null;
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block0);
        transition_in(if_block1);
        current = true;
      },
      o(local) {
        transition_out(if_block0);
        transition_out(if_block1);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div3);
        destroy_each(each_blocks, detaching);
        if_blocks[current_block_type_index].d();
        if (if_block1)
          if_block1.d();
        if (if_block2)
          if_block2.d();
      }
    };
  }
  function instance8($$self, $$props, $$invalidate) {
    let { page } = $$props;
    var newName = "";
    var addingName = false;
    var alreadyExists;
    const addName = async () => {
      if (addingName)
        return;
      $$invalidate(2, addingName = true);
      console.log("add name", newName);
      try {
        console.log("invoking dark bee gods... please wait.");
        $$invalidate(0, page.names = page.names.concat([await rpc_default("AddName", [page.id, newName])]), page);
        $$invalidate(3, alreadyExists = null);
      } catch (e) {
        if (e.type === "Conflict") {
          $$invalidate(3, alreadyExists = [e.arg, newName]);
        }
      }
      $$invalidate(2, addingName = false);
      $$invalidate(1, newName = "");
    };
    const submitIfEnterKey = (ev) => {
      if (ev.key === "Enter") {
        addName();
      }
    };
    function input_input_handler() {
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
      addingName,
      alreadyExists,
      addName,
      submitIfEnterKey,
      input_input_handler
    ];
  }
  var MetadataSidebar = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance8, create_fragment9, safe_not_equal, { page: 0 });
    }
  };
  var MetadataSidebar_default = MetadataSidebar;

  // client/App.svelte
  var { window: window_1 } = globals;
  function get_each_context4(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[17] = list[i][0];
    child_ctx[18] = list[i][1];
    return child_ctx;
  }
  function create_if_block_23(ctx) {
    let div;
    let each_value = ctx[5];
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block4(get_each_context4(ctx, each_value, i));
    }
    return {
      c() {
        div = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(div, "class", "result-pages");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].m(div, null);
        }
      },
      p(ctx2, dirty) {
        if (dirty & 32) {
          each_value = ctx2[5];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context4(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block4(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(div, null);
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
          detach(div);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_each_block4(ctx) {
    let div;
    let a;
    let t0_value = ctx[18] + "";
    let t0;
    let a_href_value;
    let t1;
    return {
      c() {
        div = element("div");
        a = element("a");
        t0 = text(t0_value);
        t1 = space();
        attr(a, "class", "wikilink");
        attr(a, "href", a_href_value = `#/page/${ctx[17]}`);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, a);
        append(a, t0);
        append(div, t1);
      },
      p(ctx2, dirty) {
        if (dirty & 32 && t0_value !== (t0_value = ctx2[18] + ""))
          set_data(t0, t0_value);
        if (dirty & 32 && a_href_value !== (a_href_value = `#/page/${ctx2[17]}`)) {
          attr(a, "href", a_href_value);
        }
      },
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function create_if_block_14(ctx) {
    let div;
    let previous_key = ctx[1]?.id || "";
    let current;
    let key_block = create_key_block(ctx);
    return {
      c() {
        div = element("div");
        key_block.c();
        attr(div, "class", "main-ui svelte-94yc43");
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
          key_block = create_key_block(ctx2);
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
  function create_key_block(ctx) {
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
  function create_if_block5(ctx) {
    let div;
    let metadatasidebar;
    let current;
    metadatasidebar = new MetadataSidebar_default({ props: { page: ctx[2] } });
    return {
      c() {
        div = element("div");
        create_component(metadatasidebar.$$.fragment);
        attr(div, "class", "meta svelte-94yc43");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(metadatasidebar, div, null);
        current = true;
      },
      p(ctx2, dirty) {
        const metadatasidebar_changes = {};
        if (dirty & 4)
          metadatasidebar_changes.page = ctx2[2];
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
  function create_fragment10(ctx) {
    let main;
    let div;
    let a0;
    let t1;
    let a1;
    let t3;
    let a2;
    let t5;
    let a3;
    let t7;
    let input;
    let t8;
    let div_class_value;
    let t9;
    let t10;
    let current;
    let mounted;
    let dispose;
    let if_block0 = ctx[5] && create_if_block_23(ctx);
    let if_block1 = ctx[0] && create_if_block_14(ctx);
    let if_block2 = ctx[2] && create_if_block5(ctx);
    return {
      c() {
        main = element("main");
        div = element("div");
        a0 = element("a");
        a0.textContent = "Index";
        t1 = space();
        a1 = element("a");
        a1.textContent = "Search";
        t3 = space();
        a2 = element("a");
        a2.textContent = "C++ page";
        t5 = space();
        a3 = element("a");
        a3.textContent = "Create page";
        t7 = space();
        input = element("input");
        t8 = space();
        if (if_block0)
          if_block0.c();
        t9 = space();
        if (if_block1)
          if_block1.c();
        t10 = space();
        if (if_block2)
          if_block2.c();
        attr(a0, "href", "#/");
        attr(a1, "href", "#/search");
        attr(a2, "href", "#/page/2849188017017574009");
        attr(a3, "href", "#/create");
        attr(input, "type", "search");
        attr(input, "placeholder", "Search");
        attr(input, "class", "svelte-94yc43");
        attr(div, "class", div_class_value = "" + (null_to_empty("navigation " + (ctx[3] ? "search-mode" : "")) + " svelte-94yc43"));
        attr(main, "class", "svelte-94yc43");
      },
      m(target, anchor) {
        insert(target, main, anchor);
        append(main, div);
        append(div, a0);
        append(div, t1);
        append(div, a1);
        append(div, t3);
        append(div, a2);
        append(div, t5);
        append(div, a3);
        append(div, t7);
        append(div, input);
        set_input_value(input, ctx[4]);
        ctx[11](input);
        append(div, t8);
        if (if_block0)
          if_block0.m(div, null);
        append(main, t9);
        if (if_block1)
          if_block1.m(main, null);
        append(main, t10);
        if (if_block2)
          if_block2.m(main, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(window_1, "hashchange", ctx[7]),
            listen(input, "input", ctx[10]),
            listen(input, "input", ctx[8]),
            listen(input, "keydown", ctx[9])
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & 16) {
          set_input_value(input, ctx2[4]);
        }
        if (ctx2[5]) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_23(ctx2);
            if_block0.c();
            if_block0.m(div, null);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (!current || dirty & 8 && div_class_value !== (div_class_value = "" + (null_to_empty("navigation " + (ctx2[3] ? "search-mode" : "")) + " svelte-94yc43"))) {
          attr(div, "class", div_class_value);
        }
        if (ctx2[0]) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
            if (dirty & 1) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block_14(ctx2);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(main, t10);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });
          check_outros();
        }
        if (ctx2[2]) {
          if (if_block2) {
            if_block2.p(ctx2, dirty);
            if (dirty & 4) {
              transition_in(if_block2, 1);
            }
          } else {
            if_block2 = create_if_block5(ctx2);
            if_block2.c();
            transition_in(if_block2, 1);
            if_block2.m(main, null);
          }
        } else if (if_block2) {
          group_outros();
          transition_out(if_block2, 1, 1, () => {
            if_block2 = null;
          });
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block1);
        transition_in(if_block2);
        current = true;
      },
      o(local) {
        transition_out(if_block1);
        transition_out(if_block2);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(main);
        ctx[11](null);
        if (if_block0)
          if_block0.d();
        if (if_block1)
          if_block1.d();
        if (if_block2)
          if_block2.d();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance9($$self, $$props, $$invalidate) {
    window.rpc = rpc_default;
    var child;
    var params;
    var page;
    var searchMode = false;
    var currentPage;
    const parseURL = () => window.location.hash.slice(1).split("/").filter((x) => x !== "").map(decodeURIComponent);
    const unparseURL = (parts) => {
      window.location.hash = "/" + parts.filter((x) => x != "").map(encodeURIComponent).join("/");
    };
    const updateRoute = async () => {
      const parts = parseURL();
      console.log(parts);
      $$invalidate(3, searchMode = false);
      currentPage = null;
      if (parts[0] === "page") {
        currentPage = parts[1];
        $$invalidate(2, page = await rpc_default("GetPage", parts[1]));
        $$invalidate(1, params = { id: currentPage, page });
        $$invalidate(2, page.id = currentPage, page);
        if (parts[2] === "edit") {
          $$invalidate(0, child = Edit_default);
        } else {
          $$invalidate(0, child = View_default);
        }
      } else if (parts[0] === "search") {
        $$invalidate(0, child = null);
        $$invalidate(2, page = null);
        $$invalidate(3, searchMode = true);
      } else if (parts[0] === "create") {
        $$invalidate(2, page = null);
        $$invalidate(1, params = { title: parts[1] });
        $$invalidate(0, child = Edit_default);
      } else {
        $$invalidate(0, child = Index_default);
        $$invalidate(2, page = null);
        $$invalidate(1, params = {});
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
        $$invalidate(5, searchResults = []);
      }
    };
    const searchKeypress = (ev) => {
      if (ev.key === "Enter" && searchResults) {
        const results = searchResults.filter((x) => x[0] !== currentPage);
        if (results.length > 0) {
          switchPage(results[0][0]);
        }
      }
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
      page,
      searchMode,
      searchQuery,
      searchResults,
      searchInput,
      updateRoute,
      searchInputHandler,
      searchKeypress,
      input_input_handler,
      input_binding
    ];
  }
  var App = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance9, create_fragment10, safe_not_equal, {});
    }
  };
  var App_default = App;

  // client/app.js
  new App_default({
    target: document.body
  });
})();
