var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../nl5/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../nl5/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../nl5/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../nl5/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../nl5/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../nl5/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../nl5/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../nl5/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../nl5/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../nl5/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../nl5/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../nl5/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir4, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env3) {
    return 1;
  }
  hasColors(count4, env3) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../nl5/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../nl5/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process2 extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process2.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd3) {
    this.#cwd = cwd3;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../nl5/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../nl5/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// worker.js
import { Writable as Writable2 } from "node:stream";
import { EventEmitter as EventEmitter2 } from "node:events";
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
// @__NO_SIDE_EFFECTS__
function createNotImplementedError2(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError2, "createNotImplementedError");
__name2(createNotImplementedError2, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented2(name) {
  const fn = /* @__PURE__ */ __name2(() => {
    throw /* @__PURE__ */ createNotImplementedError2(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented2, "notImplemented");
__name2(notImplemented2, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass2(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass2, "notImplementedClass");
__name2(notImplementedClass2, "notImplementedClass");
var _timeOrigin2 = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow2 = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin2;
var nodeTiming2 = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry2 = class {
  static {
    __name(this, "PerformanceEntry");
  }
  static {
    __name2(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow2();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow2() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark3 = class PerformanceMark22 extends PerformanceEntry2 {
  static {
    __name(this, "PerformanceMark2");
  }
  static {
    __name2(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure2 = class extends PerformanceEntry2 {
  static {
    __name(this, "PerformanceMeasure");
  }
  static {
    __name2(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming2 = class extends PerformanceEntry2 {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  static {
    __name2(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList2 = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  static {
    __name2(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance2 = class {
  static {
    __name(this, "Performance");
  }
  static {
    __name2(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin2;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming2;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming2("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin2) {
      return _performanceNow2();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark3(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure2(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw /* @__PURE__ */ createNotImplementedError2("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver2 = class {
  static {
    __name(this, "PerformanceObserver");
  }
  static {
    __name2(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError2("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw /* @__PURE__ */ createNotImplementedError2("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance2 = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance2();
if (!("__unenv__" in performance2)) {
  const proto = Performance2.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance2)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance2, key, desc);
      }
    }
  }
}
globalThis.performance = performance2;
globalThis.Performance = Performance2;
globalThis.PerformanceEntry = PerformanceEntry2;
globalThis.PerformanceMark = PerformanceMark3;
globalThis.PerformanceMeasure = PerformanceMeasure2;
globalThis.PerformanceObserver = PerformanceObserver2;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList2;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming2;
var noop_default2 = Object.assign(() => {
}, { __unenv__: true });
var _console2 = globalThis.console;
var _ignoreErrors2 = true;
var _stderr2 = new Writable2();
var _stdout2 = new Writable2();
var log3 = _console2?.log ?? noop_default2;
var info3 = _console2?.info ?? log3;
var trace3 = _console2?.trace ?? info3;
var debug3 = _console2?.debug ?? log3;
var table3 = _console2?.table ?? log3;
var error3 = _console2?.error ?? log3;
var warn3 = _console2?.warn ?? error3;
var createTask3 = _console2?.createTask ?? /* @__PURE__ */ notImplemented2("console.createTask");
var clear3 = _console2?.clear ?? noop_default2;
var count3 = _console2?.count ?? noop_default2;
var countReset3 = _console2?.countReset ?? noop_default2;
var dir3 = _console2?.dir ?? noop_default2;
var dirxml3 = _console2?.dirxml ?? noop_default2;
var group3 = _console2?.group ?? noop_default2;
var groupEnd3 = _console2?.groupEnd ?? noop_default2;
var groupCollapsed3 = _console2?.groupCollapsed ?? noop_default2;
var profile3 = _console2?.profile ?? noop_default2;
var profileEnd3 = _console2?.profileEnd ?? noop_default2;
var time3 = _console2?.time ?? noop_default2;
var timeEnd3 = _console2?.timeEnd ?? noop_default2;
var timeLog3 = _console2?.timeLog ?? noop_default2;
var timeStamp3 = _console2?.timeStamp ?? noop_default2;
var Console2 = _console2?.Console ?? /* @__PURE__ */ notImplementedClass2("console.Console");
var _times2 = /* @__PURE__ */ new Map();
var _stdoutErrorHandler2 = noop_default2;
var _stderrErrorHandler2 = noop_default2;
var workerdConsole2 = globalThis["console"];
var {
  assert: assert3,
  clear: clear22,
  // @ts-expect-error undocumented public API
  context: context2,
  count: count22,
  countReset: countReset22,
  // @ts-expect-error undocumented public API
  createTask: createTask22,
  debug: debug22,
  dir: dir22,
  dirxml: dirxml22,
  error: error22,
  group: group22,
  groupCollapsed: groupCollapsed22,
  groupEnd: groupEnd22,
  info: info22,
  log: log22,
  profile: profile22,
  profileEnd: profileEnd22,
  table: table22,
  time: time22,
  timeEnd: timeEnd22,
  timeLog: timeLog22,
  timeStamp: timeStamp22,
  trace: trace22,
  warn: warn22
} = workerdConsole2;
Object.assign(workerdConsole2, {
  Console: Console2,
  _ignoreErrors: _ignoreErrors2,
  _stderr: _stderr2,
  _stderrErrorHandler: _stderrErrorHandler2,
  _stdout: _stdout2,
  _stdoutErrorHandler: _stdoutErrorHandler2,
  _times: _times2
});
var console_default2 = workerdConsole2;
globalThis.console = console_default2;
var hrtime4 = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name2(/* @__PURE__ */ __name(function hrtime22(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime2"), "hrtime"), { bigint: /* @__PURE__ */ __name2(/* @__PURE__ */ __name(function bigint2() {
  return BigInt(Date.now() * 1e6);
}, "bigint"), "bigint") });
var ReadStream2 = class {
  static {
    __name(this, "ReadStream");
  }
  static {
    __name2(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};
var WriteStream2 = class {
  static {
    __name(this, "WriteStream");
  }
  static {
    __name2(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir32, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env22) {
    return 1;
  }
  hasColors(count32, env22) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};
var NODE_VERSION2 = "22.14.0";
var Process2 = class _Process extends EventEmitter2 {
  static {
    __name(this, "_Process");
  }
  static {
    __name2(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter2.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream2(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream2(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream2(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd22) {
    this.#cwd = cwd22;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION2}`;
  }
  get versions() {
    return { node: NODE_VERSION2 };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw /* @__PURE__ */ createNotImplementedError2("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw /* @__PURE__ */ createNotImplementedError2("process.getActiveResourcesInfo");
  }
  exit() {
    throw /* @__PURE__ */ createNotImplementedError2("process.exit");
  }
  reallyExit() {
    throw /* @__PURE__ */ createNotImplementedError2("process.reallyExit");
  }
  kill() {
    throw /* @__PURE__ */ createNotImplementedError2("process.kill");
  }
  abort() {
    throw /* @__PURE__ */ createNotImplementedError2("process.abort");
  }
  dlopen() {
    throw /* @__PURE__ */ createNotImplementedError2("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw /* @__PURE__ */ createNotImplementedError2("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw /* @__PURE__ */ createNotImplementedError2("process.loadEnvFile");
  }
  disconnect() {
    throw /* @__PURE__ */ createNotImplementedError2("process.disconnect");
  }
  cpuUsage() {
    throw /* @__PURE__ */ createNotImplementedError2("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError2("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw /* @__PURE__ */ createNotImplementedError2("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw /* @__PURE__ */ createNotImplementedError2("process.initgroups");
  }
  openStdin() {
    throw /* @__PURE__ */ createNotImplementedError2("process.openStdin");
  }
  assert() {
    throw /* @__PURE__ */ createNotImplementedError2("process.assert");
  }
  binding() {
    throw /* @__PURE__ */ createNotImplementedError2("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented2("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented2("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented2("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented2("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented2("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented2("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name2(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
var globalProcess2 = globalThis["process"];
var getBuiltinModule2 = globalProcess2.getBuiltinModule;
var workerdProcess2 = getBuiltinModule2("node:process");
var unenvProcess2 = new Process2({
  env: globalProcess2.env,
  hrtime: hrtime4,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess2.nextTick
});
var { exit: exit2, features: features2, platform: platform2 } = workerdProcess2;
var {
  _channel: _channel2,
  _debugEnd: _debugEnd2,
  _debugProcess: _debugProcess2,
  _disconnect: _disconnect2,
  _events: _events2,
  _eventsCount: _eventsCount2,
  _exiting: _exiting2,
  _fatalException: _fatalException2,
  _getActiveHandles: _getActiveHandles2,
  _getActiveRequests: _getActiveRequests2,
  _handleQueue: _handleQueue2,
  _kill: _kill2,
  _linkedBinding: _linkedBinding2,
  _maxListeners: _maxListeners2,
  _pendingMessage: _pendingMessage2,
  _preload_modules: _preload_modules2,
  _rawDebug: _rawDebug2,
  _send: _send2,
  _startProfilerIdleNotifier: _startProfilerIdleNotifier2,
  _stopProfilerIdleNotifier: _stopProfilerIdleNotifier2,
  _tickCallback: _tickCallback2,
  abort: abort2,
  addListener: addListener2,
  allowedNodeEnvironmentFlags: allowedNodeEnvironmentFlags2,
  arch: arch2,
  argv: argv2,
  argv0: argv02,
  assert: assert22,
  availableMemory: availableMemory2,
  binding: binding2,
  channel: channel2,
  chdir: chdir2,
  config: config2,
  connected: connected2,
  constrainedMemory: constrainedMemory2,
  cpuUsage: cpuUsage2,
  cwd: cwd2,
  debugPort: debugPort2,
  disconnect: disconnect2,
  dlopen: dlopen2,
  domain: domain2,
  emit: emit2,
  emitWarning: emitWarning2,
  env: env2,
  eventNames: eventNames2,
  execArgv: execArgv2,
  execPath: execPath2,
  exitCode: exitCode2,
  finalization: finalization2,
  getActiveResourcesInfo: getActiveResourcesInfo2,
  getegid: getegid2,
  geteuid: geteuid2,
  getgid: getgid2,
  getgroups: getgroups2,
  getMaxListeners: getMaxListeners2,
  getuid: getuid2,
  hasUncaughtExceptionCaptureCallback: hasUncaughtExceptionCaptureCallback2,
  hrtime: hrtime32,
  initgroups: initgroups2,
  kill: kill2,
  listenerCount: listenerCount2,
  listeners: listeners2,
  loadEnvFile: loadEnvFile2,
  mainModule: mainModule2,
  memoryUsage: memoryUsage2,
  moduleLoadList: moduleLoadList2,
  nextTick: nextTick2,
  off: off2,
  on: on2,
  once: once2,
  openStdin: openStdin2,
  permission: permission2,
  pid: pid2,
  ppid: ppid2,
  prependListener: prependListener2,
  prependOnceListener: prependOnceListener2,
  rawListeners: rawListeners2,
  reallyExit: reallyExit2,
  ref: ref2,
  release: release2,
  removeAllListeners: removeAllListeners2,
  removeListener: removeListener2,
  report: report2,
  resourceUsage: resourceUsage2,
  send: send2,
  setegid: setegid2,
  seteuid: seteuid2,
  setgid: setgid2,
  setgroups: setgroups2,
  setMaxListeners: setMaxListeners2,
  setSourceMapsEnabled: setSourceMapsEnabled2,
  setuid: setuid2,
  setUncaughtExceptionCaptureCallback: setUncaughtExceptionCaptureCallback2,
  sourceMapsEnabled: sourceMapsEnabled2,
  stderr: stderr2,
  stdin: stdin2,
  stdout: stdout2,
  throwDeprecation: throwDeprecation2,
  title: title2,
  traceDeprecation: traceDeprecation2,
  umask: umask2,
  unref: unref2,
  uptime: uptime2,
  version: version2,
  versions: versions2
} = unenvProcess2;
var _process2 = {
  abort: abort2,
  addListener: addListener2,
  allowedNodeEnvironmentFlags: allowedNodeEnvironmentFlags2,
  hasUncaughtExceptionCaptureCallback: hasUncaughtExceptionCaptureCallback2,
  setUncaughtExceptionCaptureCallback: setUncaughtExceptionCaptureCallback2,
  loadEnvFile: loadEnvFile2,
  sourceMapsEnabled: sourceMapsEnabled2,
  arch: arch2,
  argv: argv2,
  argv0: argv02,
  chdir: chdir2,
  config: config2,
  connected: connected2,
  constrainedMemory: constrainedMemory2,
  availableMemory: availableMemory2,
  cpuUsage: cpuUsage2,
  cwd: cwd2,
  debugPort: debugPort2,
  dlopen: dlopen2,
  disconnect: disconnect2,
  emit: emit2,
  emitWarning: emitWarning2,
  env: env2,
  eventNames: eventNames2,
  execArgv: execArgv2,
  execPath: execPath2,
  exit: exit2,
  finalization: finalization2,
  features: features2,
  getBuiltinModule: getBuiltinModule2,
  getActiveResourcesInfo: getActiveResourcesInfo2,
  getMaxListeners: getMaxListeners2,
  hrtime: hrtime32,
  kill: kill2,
  listeners: listeners2,
  listenerCount: listenerCount2,
  memoryUsage: memoryUsage2,
  nextTick: nextTick2,
  on: on2,
  off: off2,
  once: once2,
  pid: pid2,
  platform: platform2,
  ppid: ppid2,
  prependListener: prependListener2,
  prependOnceListener: prependOnceListener2,
  rawListeners: rawListeners2,
  release: release2,
  removeAllListeners: removeAllListeners2,
  removeListener: removeListener2,
  report: report2,
  resourceUsage: resourceUsage2,
  setMaxListeners: setMaxListeners2,
  setSourceMapsEnabled: setSourceMapsEnabled2,
  stderr: stderr2,
  stdin: stdin2,
  stdout: stdout2,
  title: title2,
  throwDeprecation: throwDeprecation2,
  traceDeprecation: traceDeprecation2,
  umask: umask2,
  uptime: uptime2,
  version: version2,
  versions: versions2,
  // @ts-expect-error old API
  domain: domain2,
  initgroups: initgroups2,
  moduleLoadList: moduleLoadList2,
  reallyExit: reallyExit2,
  openStdin: openStdin2,
  assert: assert22,
  binding: binding2,
  send: send2,
  exitCode: exitCode2,
  channel: channel2,
  getegid: getegid2,
  geteuid: geteuid2,
  getgid: getgid2,
  getgroups: getgroups2,
  getuid: getuid2,
  setegid: setegid2,
  seteuid: seteuid2,
  setgid: setgid2,
  setgroups: setgroups2,
  setuid: setuid2,
  permission: permission2,
  mainModule: mainModule2,
  _events: _events2,
  _eventsCount: _eventsCount2,
  _exiting: _exiting2,
  _maxListeners: _maxListeners2,
  _debugEnd: _debugEnd2,
  _debugProcess: _debugProcess2,
  _fatalException: _fatalException2,
  _getActiveHandles: _getActiveHandles2,
  _getActiveRequests: _getActiveRequests2,
  _kill: _kill2,
  _preload_modules: _preload_modules2,
  _rawDebug: _rawDebug2,
  _startProfilerIdleNotifier: _startProfilerIdleNotifier2,
  _stopProfilerIdleNotifier: _stopProfilerIdleNotifier2,
  _tickCallback: _tickCallback2,
  _disconnect: _disconnect2,
  _handleQueue: _handleQueue2,
  _pendingMessage: _pendingMessage2,
  _channel: _channel2,
  _send: _send2,
  _linkedBinding: _linkedBinding2
};
var process_default2 = _process2;
globalThis.process = process_default2;
var CarnivalRoom = class {
  static {
    __name(this, "CarnivalRoom");
  }
  static {
    __name2(this, "CarnivalRoom");
  }
  constructor(state, env22) {
    this.state = state;
    this.env = env22;
  }
  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }
    const [client, server] = Object.values(new WebSocketPair());
    this.state.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  async webSocketMessage(ws, raw) {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    const data = await this.state.storage.get("data") || {};
    const seq = await this.state.storage.get("seq") || 0;
    const id = msg.id;

    // ── Server-side auth gate ──────────────────────────────────────
    const _att = ws.deserializeAttachment() || {};
    const _isAdmin = _att.isAdmin === true;
    const _writeTyes = ['set','update','push','remove'];
    if (_writeTyes.includes(msg.type)) {
      const _storedPin = getAt(data, 'meta')?.adminPin;
      if (_storedPin && !_isAdmin) {
        ws.send(j({ type: 'error', id, message: 'unauthorized' }));
        return;
      }
    }
    // ──────────────────────────────────────────────────────────────

    switch (msg.type) {
      case "servertime":
        ws.send(j({ type: "servertime", id, ts: Date.now() }));
        break;
      case "create": {
        const existing = await this.state.storage.get("data");
        if (existing?.meta?.createdAt) {
          ws.send(j({ type: "error", id, message: "code_taken" }));
          break;
        }
        const meta = stamp(msg.meta);
        const expiresAt = meta.expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1e3;
        meta.expiresAt = expiresAt;
        await this.state.storage.put("data", { meta });
        await this.state.storage.setAlarm(expiresAt);
        ws.send(j({ type: "created", id }));
        break;
      }
      case "get": {
        const val = getAt(data, msg.path);
        ws.send(j({ type: "snapshot", id, path: msg.path, data: val, seq }));
        break;
      }
      case "auth": {
        // Server-side PIN verification — sets isAdmin on this WS connection
        const storedPin = getAt(data, 'meta')?.adminPin;
        if (!storedPin) {
          // No PIN configured — auto-grant admin
          ws.serializeAttachment({ ..._att, isAdmin: true, authFails: 0 });
          ws.send(j({ type: 'auth_ok', id }));
          break;
        }
        const fails = _att.authFails || 0;
        if (fails >= 5) {
          ws.send(j({ type: 'auth_fail', id, message: 'too_many_attempts' }));
          break;
        }
        if (String(msg.pin) === String(storedPin)) {
          ws.serializeAttachment({ ..._att, isAdmin: true, authFails: 0 });
          ws.send(j({ type: 'auth_ok', id }));
        } else {
          ws.serializeAttachment({ ..._att, isAdmin: false, authFails: fails + 1 });
          ws.send(j({ type: 'auth_fail', id, message: 'wrong_pin' }));
        }
        break;
      }
      case "set": {
        const processed = stamp(msg.data);
        const next = setAt(data, msg.path, processed);
        const newSeq = seq + 1;
        await this.state.storage.put("data", next);
        await this.state.storage.put("seq", newSeq);
        ws.send(j({ type: "ack", id }));
        this.broadcast(msg.path, processed, newSeq);
        if (msg.path && msg.path.startsWith("results/")) {
          this.pushToFirebase(next, msg.path.slice(8), processed).catch(() => {
          });
        }
        break;
      }
      case "update": {
        const existing = getAt(data, msg.path) || {};
        const merged = { ...existing, ...stamp(msg.data) };
        const next = setAt(data, msg.path, merged);
        const newSeq = seq + 1;
        await this.state.storage.put("data", next);
        await this.state.storage.put("seq", newSeq);
        ws.send(j({ type: "ack", id }));
        this.broadcast(msg.path, merged, newSeq);
        if (msg.path && msg.path.startsWith("results/")) {
          this.pushToFirebase(next, msg.path.slice(8), merged).catch(() => {
          });
        }
        break;
      }
      case "push": {
        const existing = getAt(data, msg.path) || {};
        const key = "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        existing[key] = stamp(msg.data);
        const next = setAt(data, msg.path, existing);
        const newSeq = seq + 1;
        await this.state.storage.put("data", next);
        await this.state.storage.put("seq", newSeq);
        ws.send(j({ type: "pushed", id, key }));
        this.broadcast(msg.path, existing, newSeq);
        break;
      }
      case "remove": {
        const parts = msg.path.split("/");
        const leaf = parts.pop();
        const parent = getAt(data, parts.join("/"));
        if (parent && typeof parent === "object") {
          delete parent[leaf];
          const newSeq = seq + 1;
          await this.state.storage.put("data", data);
          await this.state.storage.put("seq", newSeq);
          this.broadcast(parts.join("/"), parent, newSeq);
        }
        ws.send(j({ type: "ack", id }));
        break;
      }
      case "subscribe": {
        const att = ws.deserializeAttachment() || {};
        const subs = new Set(att.subs || []);
        subs.add(msg.path);
        ws.serializeAttachment({ ...att, subs: [...subs] });
        const val = getAt(data, msg.path);
        ws.send(j({ type: "snapshot", path: msg.path, data: val, seq }));
        break;
      }
      case "unsubscribe": {
        const att = ws.deserializeAttachment() || {};
        const subs = new Set(att.subs || []);
        subs.delete(msg.path);
        ws.serializeAttachment({ ...att, subs: [...subs] });
        break;
      }
    }
  }
  // ── Firebase bridge: mirror published results to RTDB ──────────
  async pushToFirebase(stateData, resultKey, resultData) {
    const FB_API_KEY = "AIzaSyA-bNl8XqvZ7DQ6YftL9teXbqxYICBlPF8";
    const FB_DB_URL = "https://willy-district-sport-default-rtdb.asia-southeast1.firebasedatabase.app";
    const meta = stateData && stateData.meta ? stateData.meta : {};
    const school = meta.school || "";
    const sport = meta.sport || "";
    const name = meta.name || "";
    const carnivalCode = this.state.id && this.state.id.name ? this.state.id.name : "unknown";
    const authResp = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + FB_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnSecureToken: true })
      }
    );
    if (!authResp.ok) return;
    const { idToken } = await authResp.json();
    await fetch(
      FB_DB_URL + "/carnivalResults/" + carnivalCode + "/meta.json?auth=" + idToken,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school, sport, name, carnivalCode, updatedAt: Date.now() })
      }
    );
    await fetch(
      FB_DB_URL + "/carnivalResults/" + carnivalCode + "/results/" + resultKey + ".json?auth=" + idToken,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...resultData, _school: school, _carnivalCode: carnivalCode })
      }
    );
  }
  // ── DO alarm: fires at expiresAt, wipes everything ────────────
  async alarm() {
    await this.state.storage.deleteAll();
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.close(1001, "Carnival expired");
      } catch {
      }
    }
  }
  async webSocketClose(ws) {
    try {
      ws.close();
    } catch {
    }
  }
  async webSocketError(ws) {
    try {
      ws.close();
    } catch {
    }
  }
  broadcast(changedPath, newValue, seq) {
    for (const session of this.state.getWebSockets()) {
      const att = session.deserializeAttachment() || {};
      const subs = att.subs || [];
      for (const sub of subs) {
        if (changedPath.startsWith(sub) || sub.startsWith(changedPath)) {
          try {
            session.send(j({ type: "snapshot", path: sub, data: newValue, seq }));
          } catch {
          }
          break;
        }
      }
    }
  }
};
var worker_default = {
  async fetch(request, env22) {
    const url = new URL(request.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const m = url.pathname.match(/^\/ws\/([A-Z0-9]{4,8})$/i);
    if (m) {
      const room = env22.CARNIVAL_ROOM.get(env22.CARNIVAL_ROOM.idFromName(m[1].toUpperCase()));
      return room.fetch(request);
    }
    if (url.pathname === "/ping") return new Response("pong", { headers: cors });
    const INDEX_HTML_B64 = "PCFET0NUWVBFIGh0bWw+CjxodG1sIGxhbmc9ImVuLUFVIj4KPGhlYWQ+CiAgPG1ldGEgY2hhcnNldD0iVVRGLTgiPgogIDxtZXRhIG5hbWU9InZpZXdwb3J0IiBjb250ZW50PSJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MSwgbWF4aW11bS1zY2FsZT0xLCB1c2VyLXNjYWxhYmxlPW5vIj4KICA8bWV0YSBuYW1lPSJhcHBsZS1tb2JpbGUtd2ViLWFwcC1jYXBhYmxlIiBjb250ZW50PSJ5ZXMiPgogIDxtZXRhIG5hbWU9ImFwcGxlLW1vYmlsZS13ZWItYXBwLXN0YXR1cy1iYXItc3R5bGUiIGNvbnRlbnQ9ImJsYWNrLXRyYW5zbHVjZW50Ij4KICA8bWV0YSBuYW1lPSJ0aGVtZS1jb2xvciIgY29udGVudD0iIzBkMTExNyI+CiAgPHRpdGxlPkNhcm5pdmFsIFRpbWluZzwvdGl0bGU+CiAgPHN0eWxlPgogICAgKiwgKjo6YmVmb3JlLCAqOjphZnRlciB7IGJveC1zaXppbmc6IGJvcmRlci1ib3g7IG1hcmdpbjogMDsgcGFkZGluZzogMDsgfQoKICAgIDpyb290IHsKICAgICAgLS1iZzogIzBkMTExNzsKICAgICAgLS1zdXJmYWNlOiAjMTYxYjIyOwogICAgICAtLXN1cmZhY2UyOiAjMjEyNjJkOwogICAgICAtLXN1cmZhY2UzOiAjMzAzNjNkOwogICAgICAtLWFjY2VudDogIzE0YjhhNjsKICAgICAgLS1hY2NlbnQyOiAjMDg5MWIyOwogICAgICAtLXRleHQ6ICNmMGY2ZmM7CiAgICAgIC0tbXV0ZWQ6ICM4Yjk0OWU7CiAgICAgIC0tc3VjY2VzczogIzNmYjk1MDsKICAgICAgLS13YXJuOiAjZDI5OTIyOwogICAgICAtLWRhbmdlcjogI2Y4NTE0OTsKICAgICAgLS1ib3JkZXI6ICMzMDM2M2Q7CiAgICB9CgogICAgaHRtbCwgYm9keSB7CiAgICAgIGhlaWdodDogMTAwJTsKICAgICAgYmFja2dyb3VuZDogdmFyKC0tYmcpOwogICAgICBjb2xvcjogdmFyKC0tdGV4dCk7CiAgICAgIGZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsICdTZWdvZSBVSScsIHN5c3RlbS11aSwgc2Fucy1zZXJpZjsKICAgICAgZm9udC1zaXplOiAxNnB4OwogICAgICBsaW5lLWhlaWdodDogMS41OwogICAgICBvdmVyZmxvdy14OiBoaWRkZW47CiAgICB9CgogICAgLyog4pSA4pSAIFNjcmVlbnMg4pSA4pSAICovCiAgICAuc2NyZWVuIHsgZGlzcGxheTogbm9uZTsgbWluLWhlaWdodDogMTAwdmg7IH0KICAgIC5zY3JlZW4uYWN0aXZlIHsgZGlzcGxheTogYmxvY2s7IH0KCiAgICAvKiDilIDilIAgSGVhZGVyIOKUgOKUgCAqLwogICAgLmhlYWRlciB7CiAgICAgIGJhY2tncm91bmQ6IHZhcigtLXN1cmZhY2UpOwogICAgICBib3JkZXItYm90dG9tOiAxcHggc29saWQgdmFyKC0tc3VyZmFjZTMpOwogICAgICBwYWRkaW5nOiAxMnB4IDE2cHg7CiAgICAgIGRpc3BsYXk6IGZsZXg7CiAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgIGdhcDogMTBweDsKICAgICAgcG9zaXRpb246IHN0aWNreTsKICAgICAgdG9wOiAwOwogICAgICB6LWluZGV4OiAxMDA7CiAgICB9CiAgICAubG9nby1iYWRnZSB7CiAgICAgIHdpZHRoOiAzMHB4OyBoZWlnaHQ6IDMwcHg7CiAgICAgIGJhY2tncm91bmQ6IHZhcigtLWFjY2VudCk7CiAgICAgIGJvcmRlci1yYWRpdXM6IDdweDsKICAgICAgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICAgIGZvbnQtc2l6ZTogMTNweDsgZm9udC13ZWlnaHQ6IDkwMDsgY29sb3I6ICMwMDA7CiAgICAgIGZsZXgtc2hyaW5rOiAwOwogICAgICBsZXR0ZXItc3BhY2luZzogLTFweDsKICAgIH0KICAgIC5oZWFkZXItdGl0bGUgeyBmb250LXdlaWdodDogNzAwOyBmb250LXNpemU6IDFyZW07IH0KICAgIC5oZWFkZXItc3ViIHsgZm9udC1zaXplOiAwLjc1cmVtOyBjb2xvcjogdmFyKC0tbXV0ZWQpOyB9CiAgICAuaGVhZGVyLXJpZ2h0IHsgbWFyZ2luLWxlZnQ6IGF1dG87IGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogOHB4OyB9CiAgICAuY29ubi1kb3QgewogICAgICB3aWR0aDogOHB4OyBoZWlnaHQ6IDhweDsgYm9yZGVyLXJhZGl1czogNTAlOwogICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1tdXRlZCk7IGZsZXgtc2hyaW5rOiAwOwogICAgfQogICAgLmNvbm4tZG90LmxpdmUgeyBiYWNrZ3JvdW5kOiB2YXIoLS1zdWNjZXNzKTsgYm94LXNoYWRvdzogMCAwIDZweCB2YXIoLS1zdWNjZXNzKTsgfQoKICAgIC8qIOKUgOKUgCBDb250ZW50IOKUgOKUgCAqLwogICAgLmNvbnRlbnQgeyBwYWRkaW5nOiAxNnB4OyB9CgogICAgLyog4pSA4pSAIEhvbWUgU2NyZWVuIOKUgOKUgCAqLwogICAgLmhvbWUtaGVybyB7CiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsKICAgICAgcGFkZGluZzogNTJweCAyNHB4IDMycHg7CiAgICAgIGJhY2tncm91bmQ6IGxpbmVhci1ncmFkaWVudCgxODBkZWcsIHJnYmEoMjAsMTg0LDE2NiwwLjA1KSAwJSwgdHJhbnNwYXJlbnQgMTAwJSk7CiAgICB9CiAgICAuaG9tZS1sb2dvIHsKICAgICAgd2lkdGg6IDgwcHg7IGhlaWdodDogODBweDsKICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgdmFyKC0tYWNjZW50KSAwJSwgdmFyKC0tYWNjZW50MikgMTAwJSk7CiAgICAgIGJvcmRlci1yYWRpdXM6IDIycHg7CiAgICAgIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgICBmb250LXNpemU6IDM0cHg7IGZvbnQtd2VpZ2h0OiA5MDA7IGNvbG9yOiAjMDAwOwogICAgICBtYXJnaW46IDAgYXV0byAyNHB4OwogICAgICBib3gtc2hhZG93OiAwIDEycHggNDBweCByZ2JhKDIwLDE4NCwxNjYsMC4zNSk7CiAgICAgIGxldHRlci1zcGFjaW5nOiAtMnB4OwogICAgfQogICAgLmhvbWUtdGl0bGUgewogICAgICBmb250LXNpemU6IDIuMnJlbTsgZm9udC13ZWlnaHQ6IDkwMDsKICAgICAgYmFja2dyb3VuZDogbGluZWFyLWdyYWRpZW50KDEzNWRlZywgdmFyKC0tYWNjZW50KSAwJSwgIzY3ZThmOSAxMDAlKTsKICAgICAgLXdlYmtpdC1iYWNrZ3JvdW5kLWNsaXA6IHRleHQ7IC13ZWJraXQtdGV4dC1maWxsLWNvbG9yOiB0cmFuc3BhcmVudDsKICAgICAgYmFja2dyb3VuZC1jbGlwOiB0ZXh0OwogICAgICBtYXJnaW4tYm90dG9tOiA4cHg7IGxldHRlci1zcGFjaW5nOiAtMXB4OwogICAgfQogICAgLmhvbWUtdGFnbGluZSB7IGNvbG9yOiB2YXIoLS1tdXRlZCk7IGZvbnQtc2l6ZTogMXJlbTsgbWFyZ2luLWJvdHRvbTogMTJweDsgfQogICAgLmhvbWUtc3BvcnRzIHsKICAgICAgZGlzcGxheTogZmxleDsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGdhcDogMTBweDsgZmxleC13cmFwOiB3cmFwOwogICAgICBtYXJnaW4tYm90dG9tOiAzNnB4OwogICAgfQogICAgLmhvbWUtc3BvcnQtcGlsbCB7CiAgICAgIGJhY2tncm91bmQ6IHZhcigtLXN1cmZhY2UyKTsKICAgICAgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tc3VyZmFjZTMpOwogICAgICBib3JkZXItcmFkaXVzOiAyMHB4OwogICAgICBwYWRkaW5nOiA1cHggMTJweDsKICAgICAgZm9udC1zaXplOiAwLjhyZW07CiAgICAgIGNvbG9yOiB2YXIoLS1tdXRlZCk7CiAgICB9CiAgICAuaG9tZS1zcG9ydC1waWxsIHNwYW4geyBtYXJnaW4tcmlnaHQ6IDVweDsgfQoKICAgIC8qIOKUgOKUgCBCdXR0b25zIOKUgOKUgCAqLwogICAgLmJ0biB7CiAgICAgIGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsKICAgICAgcGFkZGluZzogMTRweCAyMHB4OwogICAgICBib3JkZXI6IG5vbmU7IGJvcmRlci1yYWRpdXM6IDEwcHg7CiAgICAgIGZvbnQtc2l6ZTogMXJlbTsgZm9udC13ZWlnaHQ6IDYwMDsKICAgICAgY3Vyc29yOiBwb2ludGVyOyB0cmFuc2l0aW9uOiBhbGwgMC4xNXM7CiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgdGV4dC1kZWNvcmF0aW9uOiBub25lOwogICAgICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50OwogICAgICBmb250LWZhbWlseTogaW5oZXJpdDsKICAgIH0KICAgIC5idG46YWN0aXZlIHsgdHJhbnNmb3JtOiBzY2FsZSgwLjk3KTsgfQogICAgLmJ0bi1wcmltYXJ5IHsgYmFja2dyb3VuZDogdmFyKC0tYWNjZW50KTsgY29sb3I6ICMwMDA7IH0KICAgIC5idG4tcHJpbWFyeTpob3ZlciB7IGZpbHRlcjogYnJpZ2h0bmVzcygwLjkpOyB9CiAgICAuYnRuLXNlY29uZGFyeSB7CiAgICAgIGJhY2tncm91bmQ6IHZhcigtLXN1cmZhY2UyKTsgY29sb3I6IHZhcigtLXRleHQpOwogICAgICBib3JkZXI6IDFweCBzb2xpZCB2YXIoLS1zdXJmYWNlMyk7CiAgICB9CiAgICAuYnRuLXNlY29uZGFyeTpob3ZlciB7IGJhY2tncm91bmQ6IHZhcigtLXN1cmZhY2UzKTsgfQogICAgLmJ0bi1kYW5nZXIgeyBiYWNrZ3JvdW5kOiB2YXIoLS1kYW5nZXIpOyBjb2xvcjogI2ZmZjsgfQogICAgLmJ0bi1zdWNjZXNzIHsgYmFja2dyb3VuZDogdmFyKC0tc3VjY2Vzcyk7IGNvbG9yOiAjMDAwOyB9CiAgICAuYnRuLWdvIHsKICAgICAgYmFja2dyb3VuZDogdmFyKC0tc3VjY2Vzcyk7IGNvbG9yOiAjMDAwOwogICAgICBmb250LXNpemU6IDEuNXJlbTsgZm9udC13ZWlnaHQ6IDkwMDsKICAgICAgcGFkZGluZzogMjJweDsKICAgIH0KICAgIC5idG4tc3RvcCB7CiAgICAgIGJhY2tncm91bmQ6IHZhcigtLWRhbmdlcik7IGNvbG9yOiAjZmZmOwogICAgICBmb250LXNpemU6IDEuNnJlbTsgZm9udC13ZWlnaHQ6IDkwMDsKICAgICAgcGFkZGluZzogMDsgbWluLWhlaWdodDogMTMwcHg7CiAgICAgIGJvcmRlci1yYWRpdXM6IDE0cHg7IGJvcmRlcjogbm9uZTsKICAgICAgY3Vyc29yOiBwb2ludGVyOyB3aWR0aDogMTAwJTsKICAgICAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDsKICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMXM7CiAgICAgIGZvbnQtZmFtaWx5OiBpbmhlcml0OwogICAgfQogICAgLmJ0bi1zdG9wOmFjdGl2ZSB7IHRyYW5zZm9ybTogc2NhbGUoMC45Nyk7IH0KICAgIC5idG4tdGFwIHsKICAgICAgYmFja2dyb3VuZDogdmFyKC0tYWNjZW50KTsgY29sb3I6ICMwMDA7CiAgICAgIGZvbnQtd2VpZ2h0OiA5MDA7IHBhZGRpbmc6IDA7CiAgICAgIG1pbi1oZWlnaHQ6IDIyMHB4OyBib3JkZXItcmFkaXVzOiAxOHB4OwogICAgICBkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOwogICAgICBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgICAgZ2FwOiA2cHg7IHdpZHRoOiAxMDAlOyBib3JkZXI6IG5vbmU7CiAgICAgIGN1cnNvcjogcG9pbnRlcjsgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDsKICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMDhzOyB1c2VyLXNlbGVjdDogbm9uZTsKICAgICAgZm9udC1mYW1pbHk6IGluaGVyaXQ7CiAgICB9CiAgICAuYnRuLXRhcDphY3RpdmUgeyB0cmFuc2Zvcm06IHNjYWxlKDAuOTYpOyBmaWx0ZXI6IGJyaWdodG5lc3MoMC44NSk7IH0KICAgIC5idG4tdGFwIC50YXAtbWFpbiB7IGZvbnQtc2l6ZTogMi40cmVtOyBmb250LXdlaWdodDogOTAwOyBsaW5lLWhlaWdodDogMTsgfQogICAgLmJ0bi10YXAgLnRhcC1zdWIgeyBmb250LXNpemU6IDFyZW07IGZvbnQtZmFtaWx5OiAnTWVubG8nLCdTRiBNb25vJyxtb25vc3BhY2U7IG9wYWNpdHk6IDAuNzU7IH0KICAgIC5idG4tc20geyBwYWRkaW5nOiA4cHggMTRweDsgZm9udC1zaXplOiAwLjg1cmVtOyB3aWR0aDogYXV0bzsgZGlzcGxheTogaW5saW5lLWJsb2NrOyB9CiAgICAuYnRuLWljb24gewogICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zdXJmYWNlMik7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXN1cmZhY2UzKTsKICAgICAgY29sb3I6IHZhcigtLXRleHQpOyBwYWRkaW5nOiA4cHggMTJweDsKICAgICAgd2lkdGg6IGF1dG87IGRpc3BsYXk6IGlubGluZS1mbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBnYXA6IDVweDsKICAgICAgZm9udC1zaXplOiAwLjgycmVtOyBib3JkZXItcmFkaXVzOiA4cHg7CiAgICAgIGZvbnQtZmFtaWx5OiBpbmhlcml0OwogICAgfQogICAgLmJ0bltkaXNhYmxlZF0geyBvcGFjaXR5OiAwLjM4OyBwb2ludGVyLWV2ZW50czogbm9uZTsgfQoKICAgIC8qIOKUgOKUgCBGb3JtIOKUgOKUgCAqLwogICAgLmZvcm0tZ3JvdXAgeyBtYXJnaW4tYm90dG9tOiAxNnB4OyB9CiAgICBsYWJlbCB7CiAgICAgIGRpc3BsYXk6IGJsb2NrOyBmb250LXNpemU6IDAuNzhyZW07IGZvbnQtd2VpZ2h0OiA2MDA7CiAgICAgIGNvbG9yOiB2YXIoLS1tdXRlZCk7IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7CiAgICAgIGxldHRlci1zcGFjaW5nOiAwLjA2ZW07IG1hcmdpbi1ib3R0b206IDZweDsKICAgIH0KICAgIGlucHV0W3R5cGU9dGV4dF0sIGlucHV0W3R5cGU9bnVtYmVyXSwgc2VsZWN0LCB0ZXh0YXJlYSB7CiAgICAgIHdpZHRoOiAxMDAlOyBiYWNrZ3JvdW5kOiB2YXIoLS1zdXJmYWNlMik7CiAgICAgIGJvcmRlcjogMS41cHggc29saWQgdmFyKC0tc3VyZmFjZTMpOyBib3JkZXItcmFkaXVzOiA4cHg7CiAgICAgIGNvbG9yOiB2YXIoLS10ZXh0KTsgcGFkZGluZzogMTJweCAxNHB4OwogICAgICBmb250LXNpemU6IDFyZW07IGZvbnQtZmFtaWx5OiBpbmhlcml0OwogICAgICBvdXRsaW5lOiBub25lOyB0cmFuc2l0aW9uOiBib3JkZXItY29sb3IgMC4xNXM7CiAgICB9CiAgICBpbnB1dDpmb2N1cywgc2VsZWN0OmZvY3VzIHsgYm9yZGVyLWNvbG9yOiB2YXIoLS1hY2NlbnQpOyB9CiAgICBzZWxlY3Qgb3B0aW9uIHsgYmFja2dyb3VuZDogdmFyKC0tc3VyZmFjZTIpOyB9CgogICAgLyog4pSA4pSAIFNwb3J0IFBpY2tlciDilIDilIAgKi8KICAgIC5zcG9ydC1ncmlkIHsgZGlzcGxheTogZ3JpZDsgZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zOiAxZnIgMWZyOyBnYXA6IDEwcHg7IG1hcmdpbi1ib3R0b206IDE2cHg7IH0KICAgIC5zcG9ydC1idG4gewogICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zdXJmYWNlMik7IGJvcmRlcjogMnB4IHNvbGlkIHZhcigtLXN1cmZhY2UzKTsKICAgICAgYm9yZGVyLXJhZGl1czogMTJweDsgcGFkZGluZzogMTZweCAxMnB4OwogICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7IGN1cnNvcjogcG9pbnRlcjsKICAgICAgdHJhbnNpdGlvbjogYWxsIDAuMTVzOyAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50OwogICAgfQogICAgLnNwb3J0LWJ0bi5hY3RpdmUgeyBib3JkZXItY29sb3I6IHZhcigtLWFjY2VudCk7IGJhY2tncm91bmQ6IHJnYmEoMjAsMTg0LDE2NiwwLjEpOyB9CiAgICAuc3BvcnQtYnRuIC5zLWljb24geyBmb250LXNpemU6IDIuMnJlbTsgbWFyZ2luLWJvdHRvbTogNnB4OyB9CiAgICAuc3BvcnQtYnRuIC5zLWxhYmVsIHsgZm9udC1zaXplOiAwLjg1cmVtOyBmb250LXdlaWdodDogNzAwOyB9CiAgICAuc3BvcnQtYnRuIC5zLWRlc2MgeyBmb250LXNpemU6IDAuNzJyZW07IGNvbG9yOiB2YXIoLS1tdXRlZCk7IG1hcmdpbi10b3A6IDJweDsgfQoKICAgIC8qIOKUgOKUgCBUaWVyIFBpbGxzIOKUgOKUgCAqLwogICAgLnBpbGwtcm93IHsgZGlzcGxheTogZmxleDsgZ2FwOiA4cHg7IGZsZXgtd3JhcDogd3JhcDsgfQogICAgLnBpbGwgewogICAgICBwYWRkaW5nOiA2cHggMTRweDsgYm9yZGVyLXJhZGl1czogMjBweDsKICAgICAgYm9yZGVyOiAxLjVweCBzb2xpZCB2YXIoLS1zdXJmYWNlMyk7IGJhY2tncm91bmQ6IHZhcigtLXN1cmZhY2UyKTsKICAgICAgZm9udC1zaXplOiAwLjhyZW07IGZvbnQtd2VpZ2h0OiA2MDA7CiAgICAgIGN1cnNvcjogcG9pbnRlcjsgdHJhbnNpdGlvbjogYWxsIDAuMTVzOwogICAgICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50OwogICAgfQogICAgLnBpbGwuYWN0aXZlIHsgYm9yZGVyLWNvbG9yOiB2YXIoLS1hY2NlbnQpOyBjb2xvcjogdmFyKC0tYWNjZW50KTsgYmFja2dyb3VuZDogcmdiYSgyMCwxODQsMTY2LDAuMSk7IH0KCiAgICAvKiDilIDilIAgQ2FyZCDilIDilIAgKi8KICAgIC5jYXJkIHsKICAgICAgYmFja2dyb3VuZDogdmFyKC0tc3VyZmFjZSk7IGJvcmRlcjogMXB4IHNvbGlkIHZhcigtLXN1cmZhY2UzKTsKICAgICAgYm9yZGVyLXJhZGl1czogMTJweDsgcGFkZGluZzogMTZweDsgbWFyZ2luLWJvdHRvbTogMTJweDsKICAgIH0KICAgIC5jYXJkLXRpdGxlIHsKICAgICAgZm9udC1zaXplOiAwLjczcmVtOyBmb250LXdlaWdodDogNzAwOyBjb2xvcjogdmFyKC0tbXV0ZWQpOwogICAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyBsZXR0ZXItc3BhY2luZzogMC4wN2VtOyBtYXJnaW4tYm90dG9tOiAxMHB4OwogICAgfQoKICAgIC8qIOKUgOKUgCBCYWRnZSDilIDilIAgKi8KICAgIC5iYWRnZSB7CiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jazsgcGFkZGluZzogM3B4IDlweDsKICAgICAgYm9yZGVyLXJhZGl1czogMjBweDsgZm9udC1zaXplOiAwLjdyZW07CiAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7IHRleHQtdHJhbnNmb3JtOiB1cHBlcmNhc2U7IGxldHRlci1zcGFjaW5nOiAwLjA1ZW07CiAgICB9CiAgICAuYmFkZ2UtbGl2ZSB7IGJhY2tncm91bmQ6IHJnYmEoNjMsMTg1LDgwLDAuMTUpOyBjb2xvcjogdmFyKC0tc3VjY2Vzcyk7IGJvcmRlcjogMXB4IHNvbGlkIHJnYmEoNjMsMTg1LDgwLDAuMyk7IH0KICAgIC5iYWRnZS1hcm1lZCB7IGJhY2tncm91bmQ6IHJnYmEoMjEwLDE1MywzNCwwLjE1KTsgY29sb3I6IHZhcigtLXdhcm4pOyBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDIxMCwxNTMsMzQsMC4zKTsgfQogICAgLmJhZGdlLWlkbGUgeyBiYWNrZ3JvdW5kOiByZ2JhKDEzOSwxNDgsMTU4LDAuMTUpOyBjb2xvcjogdmFyKC0tbXV0ZWQpOyBib3JkZXI6IDFweCBzb2xpZCByZ2JhKDEzOSwxNDgsMTU4LDAuMik7IH0KICAgIC5iYWRnZS1kb25lIHsgYmFja2dyb3VuZDogcmdiYSgyMCwxODQsMTY2LDAuMTUpOyBjb2xvcjogdmFyKC0tYWNjZW50KTsgYm9yZGVyOiAxcHggc29saWQgcmdiYSgyMCwxODQsMTY2LDAuMyk7IH0KCiAgICAvKiDilIDilIAgQ2xvY2sg4pSA4pSAICovCiAgICAuY2xvY2sgewogICAgICBmb250LWZhbWlseTogJ01lbmxvJywnU0YgTW9ubycsJ0NvdXJpZXIgTmV3Jyxtb25vc3BhY2U7CiAgICAgIGZvbnQtc2l6ZTogNC4ycmVtOyBmb250LXdlaWdodDogNzAwOwogICAgICBsZXR0ZXItc3BhY2luZzogLTNweDsgY29sb3I6IHZhcigtLWFjY2VudCk7CiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgbGluZS1oZWlnaHQ6IDE7IHBhZGRpbmc6IDE0cHggMDsKICAgIH0KICAgIC5jbG9jay5zdG9wcGVkIHsgY29sb3I6IHZhcigtLW11dGVkKTsgfQoKICAgIC8qIOKUgOKUgCBMYW5lIFJvdyDilIDilIAgKi8KICAgIC5sYW5lLXJvdyB7CiAgICAgIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7CiAgICAgIHBhZGRpbmc6IDEwcHggMTJweDsgYmFja2dyb3VuZDogdmFyKC0tc3VyZmFjZTIpOwogICAgICBib3JkZXItcmFkaXVzOiA4cHg7IG1hcmdpbi1ib3R0b206IDZweDsgZ2FwOiAxMHB4OwogICAgfQogICAgLmxhbmUtbnVtIHsKICAgICAgd2lkdGg6IDI4cHg7IGhlaWdodDogMjhweDsgYm9yZGVyLXJhZGl1czogNTAlOwogICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zdXJmYWNlMyk7CiAgICAgIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGp1c3RpZnktY29udGVudDogY2VudGVyOwogICAgICBmb250LXdlaWdodDogNzAwOyBmb250LXNpemU6IDAuODVyZW07IGZsZXgtc2hyaW5rOiAwOwogICAgfQogICAgLmxhbmUtbmFtZSB7IGZsZXg6IDE7IGZvbnQtd2VpZ2h0OiA1MDA7IH0KICAgIC5sYW5lLXRpbWUgeyBmb250LWZhbWlseTogJ01lbmxvJyxtb25vc3BhY2U7IGZvbnQtd2VpZ2h0OiA3MDA7IGZvbnQtc2l6ZTogMS4wNXJlbTsgfQogICAgLmNvbmYtSElHSCB7IGNvbG9yOiB2YXIoLS1zdWNjZXNzKTsgZm9udC1zaXplOiAwLjdyZW07IH0KICAgIC5jb25mLU9LIHsgY29sb3I6IHZhcigtLWFjY2VudCk7IGZvbnQtc2l6ZTogMC43cmVtOyB9CiAgICAuY29uZi1DSEVDSyB7IGNvbG9yOiB2YXIoLS13YXJuKTsgZm9udC1zaXplOiAwLjdyZW07IH0KICAgIC5jb25mLUxPVyB7IGNvbG9yOiB2YXIoLS1kYW5nZXIpOyBmb250LXNpemU6IDAuN3JlbTsgfQoKICAgIC8qIOKUgOKUgCBQbGFjZSBSb3cgKFhDKSDilIDilIAgKi8KICAgIC5wbGFjZS1yb3cgewogICAgICBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICBwYWRkaW5nOiAxMHB4IDEycHg7IGJhY2tncm91bmQ6IHZhcigtLXN1cmZhY2UyKTsKICAgICAgYm9yZGVyLXJhZGl1czogOHB4OyBtYXJnaW4tYm90dG9tOiA2cHg7IGdhcDogMTBweDsKICAgIH0KICAgIC5tZWRhbCB7CiAgICAgIHdpZHRoOiAzMnB4OyBoZWlnaHQ6IDMycHg7IGJvcmRlci1yYWRpdXM6IDUwJTsKICAgICAgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICAgIGZvbnQtd2VpZ2h0OiA4MDA7IGZvbnQtc2l6ZTogMC45cmVtOyBmbGV4LXNocmluazogMDsKICAgIH0KICAgIC5tZWRhbC5wMSB7IGJhY2tncm91bmQ6ICNGRkQ3MDA7IGNvbG9yOiAjMDAwOyB9CiAgICAubWVkYWwucDIgeyBiYWNrZ3JvdW5kOiAjQzBDMEMwOyBjb2xvcjogIzAwMDsgfQogICAgLm1lZGFsLnAzIHsgYmFja2dyb3VuZDogI0NEN0YzMjsgY29sb3I6ICNmZmY7IH0KICAgIC5tZWRhbC5wTiB7IGJhY2tncm91bmQ6IHZhcigtLXN1cmZhY2UzKTsgY29sb3I6IHZhcigtLW11dGVkKTsgfQoKICAgIC8qIOKUgOKUgCBUYXAgQ291bnRlciDilIDilIAgKi8KICAgIC50YXAtY291bnRlciB7IHRleHQtYWxpZ246IGNlbnRlcjsgcGFkZGluZzogMTZweCAwIDhweDsgfQogICAgLnRhcC1wbGFjZSB7CiAgICAgIGZvbnQtc2l6ZTogNS41cmVtOyBmb250LXdlaWdodDogOTAwOyBsaW5lLWhlaWdodDogMTsKICAgICAgY29sb3I6IHZhcigtLWFjY2VudCk7CiAgICAgIGZvbnQtZmFtaWx5OiAnTWVubG8nLCdTRiBNb25vJyxtb25vc3BhY2U7CiAgICB9CiAgICAudGFwLWxhYmVsIHsgZm9udC1zaXplOiAwLjc4cmVtOyBjb2xvcjogdmFyKC0tbXV0ZWQpOyB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlOyBsZXR0ZXItc3BhY2luZzogMC4xZW07IH0KCiAgICAvKiDilIDilIAgUm9sZSBHcmlkIOKUgOKUgCAqLwogICAgLnJvbGUtZ3JpZCB7IGRpc3BsYXk6IGdyaWQ7IGdyaWQtdGVtcGxhdGUtY29sdW1uczogMWZyIDFmcjsgZ2FwOiAxMHB4OyB9CiAgICAucm9sZS1jYXJkIHsKICAgICAgYmFja2dyb3VuZDogdmFyKC0tc3VyZmFjZTIpOyBib3JkZXI6IDJweCBzb2xpZCB2YXIoLS1zdXJmYWNlMyk7CiAgICAgIGJvcmRlci1yYWRpdXM6IDEycHg7IHBhZGRpbmc6IDIwcHggMTJweDsgdGV4dC1hbGlnbjogY2VudGVyOwogICAgICBjdXJzb3I6IHBvaW50ZXI7IHRyYW5zaXRpb246IGFsbCAwLjE1czsKICAgICAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDsKICAgIH0KICAgIC5yb2xlLWNhcmQ6aG92ZXIsIC5yb2xlLWNhcmQ6YWN0aXZlIHsgYm9yZGVyLWNvbG9yOiB2YXIoLS1hY2NlbnQpOyBiYWNrZ3JvdW5kOiByZ2JhKDIwLDE4NCwxNjYsMC4wOCk7IH0KICAgIC5yb2xlLWNhcmQgLnItaWNvbiB7IGZvbnQtc2l6ZTogMi4ycmVtOyBtYXJnaW4tYm90dG9tOiA4cHg7IH0KICAgIC5yb2xlLWNhcmQgLnItbGFiZWwgeyBmb250LXdlaWdodDogNzAwOyBmb250LXNpemU6IDAuOXJlbTsgfQogICAgLnJvbGUtY2FyZCAuci1kZXNjIHsgZm9udC1zaXplOiAwLjczcmVtOyBjb2xvcjogdmFyKC0tbXV0ZWQpOyBtYXJnaW4tdG9wOiAzcHg7IH0KICAgIC5yb2xlLWNhcmQuZnVsbCB7IGdyaWQtY29sdW1uOiAxIC8gLTE7IH0KCiAgICAvKiDilIDilIAgVmlkZW8gRmluaXNoIOKUgOKUgCAqLwogICAgLnZmLXByZXZpZXcgeyB3aWR0aDoxMDAlOyBhc3BlY3QtcmF0aW86MTYvOTsgYmFja2dyb3VuZDojMDAwOyBib3JkZXItcmFkaXVzOjEycHg7IG9iamVjdC1maXQ6Y292ZXI7IGRpc3BsYXk6YmxvY2s7IH0KICAgIC52Zi1jYW52YXMgIHsgd2lkdGg6MTAwJTsgYXNwZWN0LXJhdGlvOjE2Lzk7IGJhY2tncm91bmQ6IzExMTsgYm9yZGVyLXJhZGl1czoxMnB4OyBkaXNwbGF5OmJsb2NrOyB0b3VjaC1hY3Rpb246bm9uZTsgfQogICAgLnZmLXRpbWUtYmlnIHsgZm9udC1zaXplOjIuOHJlbTsgZm9udC13ZWlnaHQ6ODAwOyBmb250LWZhbWlseTonTWVubG8nLCdDb3VyaWVyIE5ldycsbW9ub3NwYWNlOyB0ZXh0LWFsaWduOmNlbnRlcjsgbGV0dGVyLXNwYWNpbmc6LTFweDsgbGluZS1oZWlnaHQ6MTsgfQogICAgLnZmLXRpbWUtc3ViIHsgZm9udC1zaXplOjAuNzhyZW07IGNvbG9yOnZhcigtLW11dGVkKTsgdGV4dC1hbGlnbjpjZW50ZXI7IG1hcmdpbi10b3A6NHB4OyB9CiAgICAudmYtZnJhbWUtcm93IHsgZGlzcGxheTpmbGV4OyBnYXA6MTBweDsgYWxpZ24taXRlbXM6Y2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyBtYXJnaW46MTBweCAwOyB9Ci52Zi1sYW5lLWJ0biB7IHBhZGRpbmc6NnB4IDEycHg7Ym9yZGVyLXJhZGl1czo2cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO2JhY2tncm91bmQ6dmFyKC0tc3VyZmFjZS0yKTtjb2xvcjp2YXIoLS10ZXh0KTtmb250LXNpemU6MC44NXJlbTtjdXJzb3I6cG9pbnRlcjsgfQoudmYtbGFuZS1idG4uYWN0aXZlIHsgYmFja2dyb3VuZDp2YXIoLS1hY2NlbnQpO2NvbG9yOiMwMDA7Ym9yZGVyLWNvbG9yOnZhcigtLWFjY2VudCk7Zm9udC13ZWlnaHQ6NzAwOyB9CiAgICAudmYtc3RlcCB7IHdpZHRoOjU2cHg7IGhlaWdodDo1NnB4OyBib3JkZXItcmFkaXVzOjUwJTsgZm9udC1zaXplOjEuNHJlbTsgZm9udC13ZWlnaHQ6NzAwOyBiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpOyBib3JkZXI6MnB4IHNvbGlkIHZhcigtLWJvcmRlcik7IGRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyBjdXJzb3I6cG9pbnRlcjsgdXNlci1zZWxlY3Q6bm9uZTsgLXdlYmtpdC11c2VyLXNlbGVjdDpub25lOyB9CiAgICAudmYtc3RlcDphY3RpdmUgeyBiYWNrZ3JvdW5kOnZhcigtLWFjY2VudCk7IGNvbG9yOiNmZmY7IH0KICAgIC52Zi1zY3J1YmJlciB7IGZsZXg6MTsgYWNjZW50LWNvbG9yOnZhcigtLWFjY2VudCk7IH0KICAgIC52Zi1tYXJrLXJvdyB7IGRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBnYXA6MTBweDsgcGFkZGluZzoxMHB4IDA7IGJvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7IH0KICAgIC52Zi1tYXJrLXJvdzpsYXN0LWNoaWxkIHsgYm9yZGVyLWJvdHRvbTpub25lOyB9CiAgICAudmYtbWFyay1wb3MgIHsgd2lkdGg6MjhweDsgaGVpZ2h0OjI4cHg7IGJvcmRlci1yYWRpdXM6NTAlOyBiYWNrZ3JvdW5kOnZhcigtLWFjY2VudCk7IGNvbG9yOiNmZmY7IGZvbnQtd2VpZ2h0OjcwMDsgZm9udC1zaXplOjAuODJyZW07IGRpc3BsYXk6ZmxleDsgYWxpZ24taXRlbXM6Y2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyBmbGV4LXNocmluazowOyB9CiAgICAudmYtbWFyay1wb3MuZW1wdHkgeyBiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpOyBjb2xvcjp2YXIoLS1tdXRlZCk7IGJvcmRlcjoycHggc29saWQgdmFyKC0tYm9yZGVyKTsgfQogICAgLnZmLW1hcmstbmFtZSB7IGZsZXg6MTsgZm9udC13ZWlnaHQ6NjAwOyBmb250LXNpemU6MC45cmVtOyB9CiAgICAudmYtbWFyay10aW1lIHsgZm9udC1mYW1pbHk6J01lbmxvJyxtb25vc3BhY2U7IGZvbnQtc2l6ZTowLjlyZW07IGNvbG9yOnZhcigtLWFjY2VudCk7IGZvbnQtd2VpZ2h0OjcwMDsgbWluLXdpZHRoOjU4cHg7IHRleHQtYWxpZ246cmlnaHQ7IH0KICAgIC52Zi1tYXJrLWJ0biAgeyBwYWRkaW5nOjZweCAxNHB4OyBmb250LXNpemU6MC44cmVtOyBib3JkZXItcmFkaXVzOjhweDsgYmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlKTsgYm9yZGVyOjEuNXB4IHNvbGlkIHZhcigtLWJvcmRlcik7IGZvbnQtd2VpZ2h0OjYwMDsgY3Vyc29yOnBvaW50ZXI7IH0KICAgIC52Zi1tYXJrLWJ0bjphY3RpdmUgeyBiYWNrZ3JvdW5kOnZhcigtLWFjY2VudCk7IGNvbG9yOiNmZmY7IGJvcmRlci1jb2xvcjp2YXIoLS1hY2NlbnQpOyB9CiAgICAudmYtbWFyay1idG4uZG9uZSB7IGJhY2tncm91bmQ6cmdiYSgyMCwxODQsMTY2LDAuMTIpOyBib3JkZXItY29sb3I6dmFyKC0tYWNjZW50KTsgY29sb3I6dmFyKC0tYWNjZW50KTsgfQogICAgLnZmLXJlYyB7IGRpc3BsYXk6aW5saW5lLWZsZXg7IGFsaWduLWl0ZW1zOmNlbnRlcjsgZ2FwOjZweDsgZm9udC1zaXplOjAuODJyZW07IGZvbnQtd2VpZ2h0OjcwMDsgY29sb3I6I2VmNDQ0NDsgfQogICAgLnZmLXJlYy1kb3QgeyB3aWR0aDoxMHB4OyBoZWlnaHQ6MTBweDsgYm9yZGVyLXJhZGl1czo1MCU7IGJhY2tncm91bmQ6I2VmNDQ0NDsgYW5pbWF0aW9uOnZmLXB1bHNlIDFzIGluZmluaXRlOyB9CiAgICBAa2V5ZnJhbWVzIHZmLXB1bHNlIHsgMCUsMTAwJXtvcGFjaXR5OjF9IDUwJXtvcGFjaXR5OjAuM30gfQoKICAgIC8qIOKUgOKUgCBDb3VudGRvd24gT3ZlcmxheSDilIDilIAgKi8KICAgICNjb3VudGRvd24tb3ZlcmxheSB7CiAgICAgIGRpc3BsYXk6IG5vbmU7IHBvc2l0aW9uOiBmaXhlZDsgaW5zZXQ6IDA7CiAgICAgIGJhY2tncm91bmQ6IHJnYmEoMTMsMTcsMjMsMC45Nyk7IHotaW5kZXg6IDIwMDsKICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgYWxpZ24taXRlbXM6IGNlbnRlcjsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7CiAgICB9CiAgICAjY291bnRkb3duLW92ZXJsYXkuYWN0aXZlIHsgZGlzcGxheTogZmxleDsgfQogICAgI2NvdW50ZG93bi1udW0gewogICAgICBmb250LXNpemU6IDExcmVtOyBmb250LXdlaWdodDogOTAwOwogICAgICBmb250LWZhbWlseTogJ01lbmxvJywnU0YgTW9ubycsbW9ub3NwYWNlOwogICAgICBsaW5lLWhlaWdodDogMTsgdHJhbnNpdGlvbjogY29sb3IgMC4xczsKICAgIH0KICAgICNjb3VudGRvd24tbGFiZWwgewogICAgICBmb250LXNpemU6IDEuMXJlbTsgY29sb3I6IHZhcigtLW11dGVkKTsKICAgICAgbWFyZ2luLXRvcDogMTZweDsgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZTsgbGV0dGVyLXNwYWNpbmc6IDAuMTVlbTsKICAgIH0KCiAgICAvKiDilIDilIAgRmxhc2ggT3ZlcmxheSDilIDilIAgKi8KICAgICNmbGFzaC1vdmVybGF5IHsKICAgICAgZGlzcGxheTogbm9uZTsgcG9zaXRpb246IGZpeGVkOyBpbnNldDogMDsKICAgICAgei1pbmRleDogMjUwOyBwb2ludGVyLWV2ZW50czogbm9uZTsKICAgIH0KICAgICNmbGFzaC1vdmVybGF5LnJlY2FsbCB7IGJhY2tncm91bmQ6IHJnYmEoMjQ4LDgxLDczLDAuODIpOyBkaXNwbGF5OiBibG9jazsgfQogICAgI2ZsYXNoLW92ZXJsYXkuZ28geyBiYWNrZ3JvdW5kOiByZ2JhKDYzLDE4NSw4MCwwLjQ1KTsgZGlzcGxheTogYmxvY2s7IH0KICAgICN0YXAtZmxhc2ggewogICAgICBkaXNwbGF5OiBub25lOyBwb3NpdGlvbjogZml4ZWQ7IGluc2V0OiAwOwogICAgICBiYWNrZ3JvdW5kOiByZ2JhKDIwLDE4NCwxNjYsMC4yOCk7IHotaW5kZXg6IDE5OTsgcG9pbnRlci1ldmVudHM6IG5vbmU7CiAgICB9CiAgICAjdGFwLWZsYXNoLnNob3cgeyBkaXNwbGF5OiBibG9jazsgfQoKICAgIC8qIOKUgOKUgCBKb2luIENvZGUg4pSA4pSAICovCiAgICAuam9pbi1jb2RlIHsKICAgICAgZm9udC1zaXplOiAzLjJyZW07IGZvbnQtZmFtaWx5OiAnTWVubG8nLG1vbm9zcGFjZTsKICAgICAgZm9udC13ZWlnaHQ6IDkwMDsgY29sb3I6IHZhcigtLWFjY2VudCk7CiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsgbGV0dGVyLXNwYWNpbmc6IDEycHg7IHBhZGRpbmc6IDIwcHg7CiAgICB9CiAgICAucXItd3JhcCB7IHRleHQtYWxpZ246IGNlbnRlcjsgcGFkZGluZzogMTJweCAwOyB9CiAgICAucXItd3JhcCBpbWcgeyBib3JkZXItcmFkaXVzOiAxMHB4OyBtYXgtd2lkdGg6IDE4MHB4OyB9CgogICAgLyog4pSA4pSAIE1vZGFsIOKUgOKUgCAqLwogICAgLm1vZGFsLWJhY2tkcm9wIHsKICAgICAgZGlzcGxheTogbm9uZTsgcG9zaXRpb246IGZpeGVkOyBpbnNldDogMDsKICAgICAgYmFja2dyb3VuZDogcmdiYSgwLDAsMCwwLjcyKTsgei1pbmRleDogNDAwOwogICAgICBhbGlnbi1pdGVtczogZmxleC1lbmQ7CiAgICB9CiAgICAubW9kYWwtYmFja2Ryb3AuYWN0aXZlIHsgZGlzcGxheTogZmxleDsgfQogICAgLm1vZGFsIHsKICAgICAgYmFja2dyb3VuZDogdmFyKC0tc3VyZmFjZSk7IGJvcmRlci1yYWRpdXM6IDIwcHggMjBweCAwIDA7CiAgICAgIHBhZGRpbmc6IDI0cHggMjBweCA0NHB4OyB3aWR0aDogMTAwJTsKICAgICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXN1cmZhY2UzKTsKICAgIH0KICAgIC5tb2RhbC10aXRsZSB7IGZvbnQtc2l6ZTogMS4xcmVtOyBmb250LXdlaWdodDogNzAwOyBtYXJnaW4tYm90dG9tOiAxMHB4OyB9CiAgICAubW9kYWwtYm9keSB7IGNvbG9yOiB2YXIoLS1tdXRlZCk7IG1hcmdpbi1ib3R0b206IDIwcHg7IGZvbnQtc2l6ZTogMC45NXJlbTsgfQoKICAgIC8qIOKUgOKUgCBUb2FzdCDilIDilIAgKi8KICAgICN0b2FzdCB7CiAgICAgIHBvc2l0aW9uOiBmaXhlZDsgYm90dG9tOiAyOHB4OyBsZWZ0OiA1MCU7CiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWCgtNTAlKSB0cmFuc2xhdGVZKDgwcHgpOwogICAgICBiYWNrZ3JvdW5kOiB2YXIoLS1zdXJmYWNlKTsgYm9yZGVyOiAxcHggc29saWQgdmFyKC0tc3VyZmFjZTMpOwogICAgICBib3JkZXItcmFkaXVzOiAyNHB4OyBwYWRkaW5nOiAxMHB4IDIwcHg7CiAgICAgIGZvbnQtc2l6ZTogMC45cmVtOyBmb250LXdlaWdodDogNTAwOwogICAgICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gMC4yOHMgY3ViaWMtYmV6aWVyKDAuMzQsMS41NiwwLjY0LDEpOwogICAgICB6LWluZGV4OiAzNTA7IHdoaXRlLXNwYWNlOiBub3dyYXA7CiAgICAgIGJveC1zaGFkb3c6IDAgOHB4IDMycHggcmdiYSgwLDAsMCwwLjUpOwogICAgfQogICAgI3RvYXN0LnNob3cgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSkgdHJhbnNsYXRlWSgwKTsgfQoKICAgIC8qIOKUgOKUgCBVdGlsaXR5IOKUgOKUgCAqLwogICAgLnN0YWNrIHsgZGlzcGxheTogZmxleDsgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgZ2FwOiAxMHB4OyB9CiAgICAucm93IHsgZGlzcGxheTogZmxleDsgZ2FwOiAxMHB4OyB9CiAgICAucm93ID4gLmJ0biB7IGZsZXg6IDE7IH0KICAgIC5kaXZpZGVyIHsgYm9yZGVyOiBub25lOyBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0tc3VyZmFjZTMpOyBtYXJnaW46IDE2cHggMDsgfQogICAgLnRleHQtY2VudGVyIHsgdGV4dC1hbGlnbjogY2VudGVyOyB9CiAgICAudGV4dC1tdXRlZCB7IGNvbG9yOiB2YXIoLS1tdXRlZCk7IH0KICAgIC50ZXh0LXNtIHsgZm9udC1zaXplOiAwLjg1cmVtOyB9CiAgICAudGV4dC14cyB7IGZvbnQtc2l6ZTogMC43NXJlbTsgfQogICAgLmZvbnQtbW9ubyB7IGZvbnQtZmFtaWx5OiAnTWVubG8nLCdTRiBNb25vJyxtb25vc3BhY2U7IH0KICAgIC5tdC04IHsgbWFyZ2luLXRvcDogOHB4OyB9CiAgICAubXQtMTYgeyBtYXJnaW4tdG9wOiAxNnB4OyB9CiAgICAubXQtMjQgeyBtYXJnaW4tdG9wOiAyNHB4OyB9CiAgICAubXQtMzIgeyBtYXJnaW4tdG9wOiAzMnB4OyB9CiAgICAuaGlkZGVuIHsgZGlzcGxheTogbm9uZSAhaW1wb3J0YW50OyB9CiAgICAuZmxleCB7IGRpc3BsYXk6IGZsZXg7IH0KICAgIC5pdGVtcy1jZW50ZXIgeyBhbGlnbi1pdGVtczogY2VudGVyOyB9CiAgICAuZ2FwLTggeyBnYXA6IDhweDsgfQoKICAgIC8qIOKUgOKUgCBYQyBuYW1lIGlucHV0IGlubGluZSDilIDilIAgKi8KICAgIC54Yy1uYW1lLWlucHV0IHsKICAgICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7IGJvcmRlcjogbm9uZTsKICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IGRhc2hlZCB2YXIoLS1zdXJmYWNlMyk7CiAgICAgIGJvcmRlci1yYWRpdXM6IDA7IHBhZGRpbmc6IDJweCAwOwogICAgICBmb250LXNpemU6IDAuOTVyZW07IGZvbnQtZmFtaWx5OiBpbmhlcml0OwogICAgICBjb2xvcjogdmFyKC0tdGV4dCk7IHdpZHRoOiAxMDAlOyBvdXRsaW5lOiBub25lOwogICAgfQogICAgLnhjLW5hbWUtaW5wdXQ6Zm9jdXMgeyBib3JkZXItYm90dG9tLWNvbG9yOiB2YXIoLS1hY2NlbnQpOyB9CgogICAgLyog4pSA4pSAIEFkbWluIExhbmUgSW5wdXQgUm93IOKUgOKUgCAqLwogICAgLnN0YXR1cy1idG4gewogIHBhZGRpbmc6IDNweCA3cHg7IGJvcmRlci1yYWRpdXM6IDZweDsgZm9udC1zaXplOiAuNzJyZW07IGZvbnQtd2VpZ2h0OiA3MDA7CiAgYm9yZGVyOiAxLjVweCBzb2xpZCB2YXIoLS1ib3JkZXIpOyBiYWNrZ3JvdW5kOiB2YXIoLS1zdXJmYWNlMik7IGNvbG9yOiB2YXIoLS1tdXRlZCk7CiAgY3Vyc29yOiBwb2ludGVyOyBsZXR0ZXItc3BhY2luZzogLjA0ZW07IHRyYW5zaXRpb246IGFsbCAuMTVzOwp9Ci5zdGF0dXMtYnRuLmFjdGl2ZS1kbnMgeyBiYWNrZ3JvdW5kOiByZ2JhKDI0NSwxNTgsMTEsLjE4KTsgY29sb3I6ICNmNTllMGI7IGJvcmRlci1jb2xvcjogI2Y1OWUwYjsgfQouc3RhdHVzLWJ0bi5hY3RpdmUtZG5mIHsgYmFja2dyb3VuZDogcmdiYSgyMzksNjgsNjgsLjE4KTsgY29sb3I6ICNlZjQ0NDQ7IGJvcmRlci1jb2xvcjogI2VmNDQ0NDsgfQouYWRtaW4tbGFuZS1yb3cgewogICAgICBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOwogICAgICBnYXA6IDhweDsgcGFkZGluZzogNnB4IDA7CiAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCB2YXIoLS1zdXJmYWNlMyk7CiAgICB9CiAgICAuYWRtaW4tbGFuZS1yb3c6bGFzdC1jaGlsZCB7IGJvcmRlci1ib3R0b206IG5vbmU7IH0KICAgIC5hZG1pbi1sYW5lLW51bSB7CiAgICAgIHdpZHRoOiAyNHB4OyBoZWlnaHQ6IDI0cHg7IGJvcmRlci1yYWRpdXM6IDUwJTsKICAgICAgYmFja2dyb3VuZDogdmFyKC0tc3VyZmFjZTMpOwogICAgICBkaXNwbGF5OiBmbGV4OyBhbGlnbi1pdGVtczogY2VudGVyOyBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsKICAgICAgZm9udC13ZWlnaHQ6IDcwMDsgZm9udC1zaXplOiAwLjhyZW07IGZsZXgtc2hyaW5rOiAwOwogICAgICBjb2xvcjogdmFyKC0tbXV0ZWQpOwogICAgfQogICAgLmFkbWluLWxhbmUtbmFtZS1pbnB1dCB7CiAgICAgIGZsZXg6IDE7IGJhY2tncm91bmQ6IHRyYW5zcGFyZW50OyBib3JkZXI6IG5vbmU7CiAgICAgIGJvcmRlci1yYWRpdXM6IDA7IHBhZGRpbmc6IDZweCAwOwogICAgICBmb250LXNpemU6IDAuOTVyZW07IGZvbnQtZmFtaWx5OiBpbmhlcml0OwogICAgICBjb2xvcjogdmFyKC0tdGV4dCk7IG91dGxpbmU6IG5vbmU7CiAgICB9CgogICAgQG1lZGlhIChtYXgtd2lkdGg6IDM4MHB4KSB7CiAgICAgIC5jbG9jayB7IGZvbnQtc2l6ZTogMy40cmVtOyB9CiAgICAgIC50YXAtcGxhY2UgeyBmb250LXNpemU6IDQuNXJlbTsgfQogICAgICAjY291bnRkb3duLW51bSB7IGZvbnQtc2l6ZTogOXJlbTsgfQogICAgfQoKICAgIC8qIOKUgOKUgCBEZW1vIENhcmQg4pSA4pSAICovCiAgICAuZGVtby1jYXJkIHsKICAgICAgZGlzcGxheTogZmxleDsgYWxpZ24taXRlbXM6IGNlbnRlcjsgZ2FwOiAxNHB4OwogICAgICBiYWNrZ3JvdW5kOiBsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDI0NSwxNTgsMTEsMC4xMikgMCUsIHJnYmEoMjQ1LDE1OCwxMSwwLjA2KSAxMDAlKTsKICAgICAgYm9yZGVyOiAxLjVweCBzb2xpZCByZ2JhKDI0NSwxNTgsMTEsMC4zNSk7CiAgICAgIGJvcmRlci1yYWRpdXM6IDE0cHg7IHBhZGRpbmc6IDE2cHg7CiAgICAgIGN1cnNvcjogcG9pbnRlcjsgdHJhbnNpdGlvbjogYWxsIDAuMTVzOwogICAgICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50OwogICAgICBtYXJnaW4tdG9wOiAyMHB4OwogICAgfQogICAgLmRlbW8tY2FyZDphY3RpdmUgeyB0cmFuc2Zvcm06IHNjYWxlKDAuOTgpOyBmaWx0ZXI6IGJyaWdodG5lc3MoMC45Myk7IH0KICAgIC5kZW1vLWNhcmQtaWNvbiB7IGZvbnQtc2l6ZTogMnJlbTsgZmxleC1zaHJpbms6IDA7IH0KICAgIC5kZW1vLWNhcmQtdGl0bGUgeyBmb250LXdlaWdodDogNzAwOyBmb250LXNpemU6IDAuOTVyZW07IGNvbG9yOiAjZjU5ZTBiOyB9CiAgICAuZGVtby1jYXJkLWRlc2MgeyBmb250LXNpemU6IDAuNzhyZW07IGNvbG9yOiB2YXIoLS1tdXRlZCk7IG1hcmdpbi10b3A6IDJweDsgfQogICAgLmRlbW8tY2FyZC1hcnJvdyB7IG1hcmdpbi1sZWZ0OiBhdXRvOyBmb250LXNpemU6IDEuM3JlbTsgY29sb3I6ICNmNTllMGI7IGZsZXgtc2hyaW5rOiAwOyB9CgogICAgLyog4pSA4pSAIERlbW8gQmFubmVyIChhZG1pbiBzY3JlZW4pIOKUgOKUgCAqLwogICAgLmRlbW8tYmFubmVyIHsKICAgICAgYmFja2dyb3VuZDogcmdiYSgyNDUsMTU4LDExLDAuMTApOwogICAgICBib3JkZXI6IDEuNXB4IHNvbGlkIHJnYmEoMjQ1LDE1OCwxMSwwLjMwKTsKICAgICAgYm9yZGVyLXJhZGl1czogMTJweDsgcGFkZGluZzogMTRweCAxNnB4OwogICAgICBtYXJnaW4tYm90dG9tOiAxNHB4OwogICAgfQogICAgLmRlbW8tYmFubmVyLXRvcCB7CiAgICAgIGRpc3BsYXk6IGZsZXg7IGFsaWduLWl0ZW1zOiBjZW50ZXI7IGdhcDogMTBweDsgbWFyZ2luLWJvdHRvbTogMTBweDsKICAgIH0KICAgIC5kZW1vLWNvZGUtcGlsbCB7CiAgICAgIGZvbnQtZmFtaWx5OiAnTWVubG8nLCdTRiBNb25vJyxtb25vc3BhY2U7CiAgICAgIGZvbnQtc2l6ZTogMS42cmVtOyBmb250LXdlaWdodDogOTAwOyBsZXR0ZXItc3BhY2luZzogNHB4OwogICAgICBjb2xvcjogI2Y1OWUwYjsgYmFja2dyb3VuZDogcmdiYSgyNDUsMTU4LDExLDAuMTIpOwogICAgICBib3JkZXI6IDEuNXB4IHNvbGlkIHJnYmEoMjQ1LDE1OCwxMSwwLjMpOwogICAgICBib3JkZXItcmFkaXVzOiA4cHg7IHBhZGRpbmc6IDRweCAxNHB4OwogICAgICBjdXJzb3I6IHBvaW50ZXI7IHRyYW5zaXRpb246IGFsbCAwLjE1czsgZGlzcGxheTogaW5saW5lLWJsb2NrOwogICAgfQogICAgLmRlbW8tY29kZS1waWxsOmFjdGl2ZSB7IHRyYW5zZm9ybTogc2NhbGUoMC45Nik7IH0KICAgIC5kZW1vLWJhbm5lci1oaW50IHsgZm9udC1zaXplOiAwLjc4cmVtOyBjb2xvcjogdmFyKC0tbXV0ZWQpOyB9CiAgICAuZGVtby1iYW5uZXItaGludCBzdHJvbmcgeyBjb2xvcjogdmFyKC0tdGV4dCk7IH0KICAgIC5kZW1vLXFyIHsgbWFyZ2luLXRvcDogMTBweDsgfQogIAogICAgLyog4pSA4pSAIFhDIFBob3RvIEJ1cnN0ICsgRmluaXNoIENhcmQg4pSA4pSAICovCiAgICAuZmluaXNoLXBob3RvLXdyYXAgewogICAgICB3aWR0aDoxMDAlO2JhY2tncm91bmQ6dmFyKC0tc3VyZmFjZTMpO2JvcmRlci1yYWRpdXM6MTBweDsKICAgICAgb3ZlcmZsb3c6aGlkZGVuO21hcmdpbi1ib3R0b206OHB4O3Bvc2l0aW9uOnJlbGF0aXZlOwogICAgICBhc3BlY3QtcmF0aW86NC8zO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjsKICAgIH0KICAgIC5maW5pc2gtcGhvdG8td3JhcCBpbWcgeyB3aWR0aDoxMDAlO2hlaWdodDoxMDAlO29iamVjdC1maXQ6Y292ZXI7ZGlzcGxheTpibG9jazsgfQogICAgLmZpbmlzaC1waG90by1jYXB0dXJpbmcgewogICAgICBjb2xvcjp2YXIoLS1tdXRlZCk7Zm9udC1zaXplOjAuOHJlbTt0ZXh0LWFsaWduOmNlbnRlcjtwYWRkaW5nOjE2cHg7CiAgICB9CiAgICAuZmluaXNoLXBob3RvLXdyYXAgLm9jci1iYWRnZSB7CiAgICAgIHBvc2l0aW9uOmFic29sdXRlO3RvcDo2cHg7cmlnaHQ6NnB4OwogICAgICBiYWNrZ3JvdW5kOnJnYmEoMjAsMTg0LDE2NiwwLjkpO2NvbG9yOiNmZmY7CiAgICAgIGZvbnQtc2l6ZTowLjdyZW07Zm9udC13ZWlnaHQ6NzAwO3BhZGRpbmc6M3B4IDdweDtib3JkZXItcmFkaXVzOjIwcHg7CiAgICB9CiAgICAuYmliLXNjYW4tcm93IHsgZGlzcGxheTpmbGV4O2dhcDo2cHg7bWFyZ2luLWJvdHRvbTo4cHg7IH0KICAgIC8qIFF1YWxpZmllciBiYWRnZSAqLwogICAgLnF1YWxpZmllci1jaGlwIHsKICAgICAgZGlzcGxheTppbmxpbmUtZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjRweDsKICAgICAgYmFja2dyb3VuZDpyZ2JhKDIzNCwxNzksOCwwLjIpO2NvbG9yOiNlYWIzMDg7CiAgICAgIGZvbnQtc2l6ZTowLjY1cmVtO2ZvbnQtd2VpZ2h0OjcwMDtwYWRkaW5nOjJweCA3cHg7Ym9yZGVyLXJhZGl1czoyMHB4OwogICAgICBib3JkZXI6MXB4IHNvbGlkIHJnYmEoMjM0LDE3OSw4LDAuNCk7CiAgICB9CiAgICAvKiBGaW5pc2ggY2FyZCBzaGFyZSBvdmVybGF5ICovCiAgICAjZmluaXNoLWNhcmQtb3ZlcmxheSB7CiAgICAgIHBvc2l0aW9uOmZpeGVkO2luc2V0OjA7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLC44NSk7ei1pbmRleDo5OTkwOwogICAgICBkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOwogICAgICBwYWRkaW5nOjE2cHg7Z2FwOjEycHg7CiAgICB9CiAgICAjZmluaXNoLWNhcmQtb3ZlcmxheSBjYW52YXMsCiAgICAjZmluaXNoLWNhcmQtb3ZlcmxheSBpbWcgeyBtYXgtd2lkdGg6bWluKDMyMHB4LDg1dncpO2JvcmRlci1yYWRpdXM6MTJweDsgfQogICAgI2ZpbmlzaC1jYXJkLW92ZXJsYXkgLmNhcmQtYWN0aW9ucyB7IGRpc3BsYXk6ZmxleDtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyOyB9CgogIAogICAgLyogdjguNS4wIOKAlCBhdXRvLWRldGVjdCAqLwogICAgI3hjLWxpbmUtc2V0dXAtb3ZlcmxheSB7CiAgICAgIGRpc3BsYXk6bm9uZTtwb3NpdGlvbjpmaXhlZDtpbnNldDowO3otaW5kZXg6OTk5NjtiYWNrZ3JvdW5kOiMwMDA7CiAgICAgIGZsZXgtZGlyZWN0aW9uOmNvbHVtbjsKICAgIH0KICAgICN4Yy1saW5lLXNldHVwLW92ZXJsYXkgdmlkZW8gewogICAgICB3aWR0aDoxMDAlO2hlaWdodDoxMDAlO29iamVjdC1maXQ6Y292ZXI7cG9zaXRpb246YWJzb2x1dGU7aW5zZXQ6MDsKICAgIH0KICAgICN4Yy1saW5lLWNhbnZhcy1vdmVybGF5IHsKICAgICAgcG9zaXRpb246YWJzb2x1dGU7aW5zZXQ6MDt3aWR0aDoxMDAlO2hlaWdodDoxMDAlO3RvdWNoLWFjdGlvbjpub25lOwogICAgfQogICAgI3hjLWxpbmUtaW5zdHJ1Y3Rpb24gewogICAgICBwb3NpdGlvbjphYnNvbHV0ZTt0b3A6MTZweDtsZWZ0OjA7cmlnaHQ6MDt0ZXh0LWFsaWduOmNlbnRlcjsKICAgICAgY29sb3I6I2ZmZjtmb250LXNpemU6MXJlbTtmb250LXdlaWdodDo2MDA7CiAgICAgIGJhY2tncm91bmQ6cmdiYSgwLDAsMCwuNjUpO3BhZGRpbmc6MTBweDtwb2ludGVyLWV2ZW50czpub25lOwogICAgfQogICAgI3hjLWxpbmUtc2V0dXAtYnRucyB7CiAgICAgIHBvc2l0aW9uOmFic29sdXRlO2JvdHRvbTowO2xlZnQ6MDtyaWdodDowOwogICAgICBkaXNwbGF5OmZsZXg7Z2FwOjEwcHg7cGFkZGluZzoxNnB4O2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNyk7CiAgICB9CiAgICAueGMtZGV0ZWN0LWJhciB7CiAgICAgIGRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjEwcHg7CiAgICAgIHBhZGRpbmc6OHB4IDE0cHg7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlLTIpO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7CiAgICB9CiAgICAueGMtZGV0ZWN0LXB1bHNlIHsKICAgICAgd2lkdGg6MTJweDtoZWlnaHQ6MTJweDtib3JkZXItcmFkaXVzOjUwJTtiYWNrZ3JvdW5kOiNlZjQ0NDQ7ZmxleC1zaHJpbms6MDsKICAgICAgYW5pbWF0aW9uOnhjcHVsc2UgMXMgaW5maW5pdGU7CiAgICB9CiAgICBAa2V5ZnJhbWVzIHhjcHVsc2UgewogICAgICAwJSwxMDAle29wYWNpdHk6MTt0cmFuc2Zvcm06c2NhbGUoMSl9CiAgICAgIDUwJXtvcGFjaXR5Oi40O3RyYW5zZm9ybTpzY2FsZSguOCl9CiAgICB9CiAgICAueGMtYXV0by1jb3VudGRvd24gewogICAgICBkaXNwbGF5OmlubGluZS1ibG9jazt3aWR0aDoyOHB4O2hlaWdodDoyOHB4O2JvcmRlci1yYWRpdXM6NTAlOwogICAgICBiYWNrZ3JvdW5kOnZhcigtLWFjY2VudCk7Y29sb3I6I2ZmZjtmb250LXNpemU6Ljc1cmVtO2ZvbnQtd2VpZ2h0OjcwMDsKICAgICAgdGV4dC1hbGlnbjpjZW50ZXI7bGluZS1oZWlnaHQ6MjhweDtmbGV4LXNocmluazowOwogICAgfQoKICAgIDwvc3R5bGU+CjxsaW5rIHJlbD0iaWNvbiIgdHlwZT0iaW1hZ2Uvc3ZnK3htbCIgaHJlZj0iZGF0YTppbWFnZS9zdmcreG1sO3V0ZjgsPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSclMjMxYTU2ZGInIHN0cm9rZS13aWR0aD0nMicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJz48Y2lyY2xlIGN4PScxMicgY3k9JzgnIHI9JzYnLz48cGF0aCBkPSdNMTUuNDc3IDEyLjg5IDE3IDIybC01LTMtNSAzIDEuNTIzLTkuMTEnLz48L3N2Zz4iPjxtZXRhIG5hbWU9InJvYm90cyIgY29udGVudD0iaW5kZXgsIGZvbGxvdyI+CjxsaW5rIHJlbD0iY2Fub25pY2FsIiBocmVmPSJodHRwczovL2Nhcm5pdmFsdGltaW5nLmNvbS8iPjxtZXRhIHByb3BlcnR5PSJvZzp0aXRsZSIgY29udGVudD0iQ2Fybml2YWwgVGltaW5nIOKAlCBMaXZlIFJhY2UgTWFuYWdlbWVudCBmb3IgU2Nob29sIENhcm5pdmFscyI+PG1ldGEgcHJvcGVydHk9Im9nOmRlc2NyaXB0aW9uIiBjb250ZW50PSJSZWFsLXRpbWUgcmFjZSB0aW1pbmcgZm9yIHNjaG9vbCBhdGhsZXRpY3MsIHN3aW1taW5nIGFuZCBjcm9zcyBjb3VudHJ5IGNhcm5pdmFscy4gTXVsdGktZGV2aWNlLCBsaXZlIHJlc3VsdHMsIFFSIHBhaXJpbmcuIEZyZWUgdG8gdXNlLiI+PG1ldGEgcHJvcGVydHk9Im9nOnVybCIgY29udGVudD0iaHR0cHM6Ly9jYXJuaXZhbHRpbWluZy5jb20vIj48bWV0YSBwcm9wZXJ0eT0ib2c6dHlwZSIgY29udGVudD0id2Vic2l0ZSI+PG1ldGEgcHJvcGVydHk9Im9nOmxvY2FsZSIgY29udGVudD0iZW5fQVUiPjxtZXRhIHByb3BlcnR5PSJvZzpzaXRlX25hbWUiIGNvbnRlbnQ9IkNhcm5pdmFsIFRpbWluZyI+PG1ldGEgbmFtZT0idHdpdHRlcjpjYXJkIiBjb250ZW50PSJzdW1tYXJ5X2xhcmdlX2ltYWdlIj48bWV0YSBuYW1lPSJ0d2l0dGVyOnRpdGxlIiBjb250ZW50PSJDYXJuaXZhbCBUaW1pbmcg4oCUIExpdmUgUmFjZSBNYW5hZ2VtZW50IGZvciBTY2hvb2wgQ2Fybml2YWxzIj48bWV0YSBuYW1lPSJ0d2l0dGVyOmRlc2NyaXB0aW9uIiBjb250ZW50PSJSZWFsLXRpbWUgcmFjZSB0aW1pbmcgZm9yIHNjaG9vbCBhdGhsZXRpY3MsIHN3aW1taW5nIGFuZCBjcm9zcyBjb3VudHJ5IGNhcm5pdmFscy4gTXVsdGktZGV2aWNlLCBsaXZlIHJlc3VsdHMsIFFSIHBhaXJpbmcuIEZyZWUgdG8gdXNlLiI+PHNjcmlwdCB0eXBlPSJhcHBsaWNhdGlvbi9sZCtqc29uIj57CiAgIkBjb250ZXh0IjogImh0dHBzOi8vc2NoZW1hLm9yZyIsCiAgIkB0eXBlIjogIk9yZ2FuaXphdGlvbiIsCiAgIm5hbWUiOiAiQ2Fybml2YWwgVGltaW5nIiwKICAiYWx0ZXJuYXRlTmFtZSI6ICJTcG9ydCBQb3J0YWwiLAogICJ1cmwiOiAiaHR0cHM6Ly9jYXJuaXZhbHRpbWluZy5jb20iLAogICJsb2dvIjogImh0dHBzOi8vY2Fybml2YWx0aW1pbmcuY29tL2Zhdmljb24uc3ZnIiwKICAiZGVzY3JpcHRpb24iOiAiU2Nob29sIHNwb3J0IG1hbmFnZW1lbnQgcGxhdGZvcm0g4oCUIGNhcm5pdmFscywgbGl2ZSB0aW1pbmcsIGRpc3RyaWN0IGh1YiwgcGFyZW50LWZhY2luZyByZXN1bHRzLiIsCiAgImFkZHJlc3MiOiB7IkB0eXBlIjogIlBvc3RhbEFkZHJlc3MiLCAiYWRkcmVzc0NvdW50cnkiOiAiQVUiLCAiYWRkcmVzc1JlZ2lvbiI6ICJWSUMifSwKICAiZm91bmRlciI6IHsiQHR5cGUiOiAiUGVyc29uIiwgIm5hbWUiOiAiUGFkZHkgR2FsbGl2YW4ifSwKICAibGVnYWxOYW1lIjogIkx1Y2sgRHJhZ29uIFB0eSBMdGQiLAogICJ0YXhJRCI6ICJBQk4gNjQgNjk3IDQzNCA4OTgiLAogICJlbWFpbCI6ICJpbmZvQHNwb3J0cG9ydGFsLmNvbS5hdSIsCiAgImFyZWFTZXJ2ZWQiOiB7IkB0eXBlIjogIkNvdW50cnkiLCAibmFtZSI6ICJBdXN0cmFsaWEifSwKICAia25vd3NBYm91dCI6IFsiU2Nob29sIHNwb3J0IiwgIkF0aGxldGljcyBjYXJuaXZhbHMiLCAiU3dpbW1pbmcgY2Fybml2YWxzIiwgIkNyb3NzIGNvdW50cnkiLCAiTGl2ZSBldmVudCB0aW1pbmciXQp9PC9zY3JpcHQ+PHNjcmlwdCBzcmM9Imh0dHBzOi8vY2RuLmpzZGVsaXZyLm5ldC9ucG0vdGVzc2VyYWN0LmpzQDUvZGlzdC90ZXNzZXJhY3QubWluLmpzIj48L3NjcmlwdD4KPC9oZWFkPgo8Ym9keT4KCjwhLS0gWEMgcGhvdG8gYnVyc3QgY2FtZXJhIGVsZW1lbnRzIC0tPgo8dmlkZW8gaWQ9InhjLWNhbSIgYXV0b3BsYXkgcGxheXNpbmxpbmUgbXV0ZWQgc3R5bGU9ImRpc3BsYXk6bm9uZTtwb3NpdGlvbjphYnNvbHV0ZTt3aWR0aDoxcHg7aGVpZ2h0OjFweCI+PC92aWRlbz4KPGNhbnZhcyBpZD0ieGMtY2FwIiBzdHlsZT0iZGlzcGxheTpub25lIj48L2NhbnZhcz4KCjxkaXYgaWQ9InJlY29ubmVjdC1iYW5uZXIiIHN0eWxlPSJkaXNwbGF5Om5vbmU7cG9zaXRpb246Zml4ZWQ7dG9wOjA7bGVmdDowO3JpZ2h0OjA7ei1pbmRleDo5OTk5O2JhY2tncm91bmQ6I2Y1OWUwYjtjb2xvcjojMDAwO3RleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6OHB4IDE2cHg7Zm9udC1zaXplOi45cmVtO2ZvbnQtd2VpZ2h0OjYwMDtsZXR0ZXItc3BhY2luZzouMDJlbTsiPgogIOKaoSBSZWNvbm5lY3RpbmfigKYKPC9kaXY+Cgo8IS0tIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAogICAgIFNDUkVFTjogSE9NRQrilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgLS0+CjxkaXYgaWQ9InNjcmVlbi1ob21lIiBjbGFzcz0ic2NyZWVuIGFjdGl2ZSI+CiAgPGRpdiBjbGFzcz0iaG9tZS1oZXJvIj4KICAgIDxkaXYgY2xhc3M9ImhvbWUtbG9nbyI+Q1Q8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImhvbWUtdGl0bGUiPkNhcm5pdmFsIFRpbWluZzwvZGl2PgogICAgPGRpdiBjbGFzcz0iaG9tZS10YWdsaW5lIj5SZWFsLXRpbWUgdGltaW5nIGZvciBzY2hvb2wgYXRobGV0aWNzLCBzd2ltbWluZyAmYW1wOyBjcm9zcyBjb3VudHJ5PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJob21lLXNwb3J0cyI+CiAgICAgIDxkaXYgY2xhc3M9ImhvbWUtc3BvcnQtcGlsbCI+PHNwYW4+PHN2ZyB3aWR0aD0nMjInIGhlaWdodD0nMjInIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSdjdXJyZW50Q29sb3InIHN0cm9rZS13aWR0aD0nMicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBhcmlhLWhpZGRlbj0ndHJ1ZScgc3R5bGU9J3ZlcnRpY2FsLWFsaWduOm1pZGRsZSc+PHBvbHlsaW5lIHBvaW50cz0nMjIgMTIgMTggMTIgMTUgMjEgOSAzIDYgMTIgMiAxMicvPjwvc3ZnPjwvc3Bhbj5UcmFjayAmIEZpZWxkPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImhvbWUtc3BvcnQtcGlsbCI+PHNwYW4+PHN2ZyB3aWR0aD0nMjInIGhlaWdodD0nMjInIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSdjdXJyZW50Q29sb3InIHN0cm9rZS13aWR0aD0nMicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBhcmlhLWhpZGRlbj0ndHJ1ZScgc3R5bGU9J3ZlcnRpY2FsLWFsaWduOm1pZGRsZSc+PHBhdGggZD0nTTIgMjBzMi0yIDUtMiA1IDIgNyAyIDUtMiA3LTIgMyAxIDMgMU0yIDE2czItMiA1LTIgNSAyIDcgMiA1LTIgNy0yIDMgMSAzIDEnLz48Y2lyY2xlIGN4PScxNCcgY3k9JzUnIHI9JzInLz48L3N2Zz48L3NwYW4+U3dpbW1pbmc8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iaG9tZS1zcG9ydC1waWxsIj48c3Bhbj48c3ZnIHdpZHRoPScyMicgaGVpZ2h0PScyMicgdmlld0JveD0nMCAwIDI0IDI0JyBmaWxsPSdub25lJyBzdHJva2U9J2N1cnJlbnRDb2xvcicgc3Ryb2tlLXdpZHRoPScyJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIGFyaWEtaGlkZGVuPSd0cnVlJyBzdHlsZT0ndmVydGljYWwtYWxpZ246bWlkZGxlJz48cGF0aCBkPSdNMTIgMjJWOE01IDhsNy02IDcgNk0zIDIyaDE4TTkgMjJWMTZoNnY2Jy8+PC9zdmc+PC9zcGFuPkNyb3NzIENvdW50cnk8L2Rpdj4KICAgIDwvZGl2PgogIDwvZGl2PgogIDxkaXYgY2xhc3M9ImNvbnRlbnQiPgogICAgPGRpdiBjbGFzcz0ic3RhY2siPgogICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIG9uY2xpY2s9InNob3dTY3JlZW4oJ3NldHVwJykiPjxzdmcgd2lkdGg9JzIyJyBoZWlnaHQ9JzIyJyB2aWV3Qm94PScwIDAgMjQgMjQnIGZpbGw9J25vbmUnIHN0cm9rZT0nY3VycmVudENvbG9yJyBzdHJva2Utd2lkdGg9JzInIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgYXJpYS1oaWRkZW49J3RydWUnIHN0eWxlPSd2ZXJ0aWNhbC1hbGlnbjptaWRkbGUnPjxyZWN0IHdpZHRoPScyMCcgaGVpZ2h0PScxNCcgeD0nMicgeT0nNicgcng9JzInLz48bGluZSB4MT0nMicgeDI9JzIyJyB5MT0nMTAnIHkyPScxMCcvPjxwYXRoIGQ9J005IDZWMmg2djQnLz48L3N2Zz4gTmV3IENhcm5pdmFsPC9idXR0b24+CiAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJzaG93U2NyZWVuKCdqb2luLXNjcmVlbicpIj48c3ZnIHdpZHRoPScyMicgaGVpZ2h0PScyMicgdmlld0JveD0nMCAwIDI0IDI0JyBmaWxsPSdub25lJyBzdHJva2U9J2N1cnJlbnRDb2xvcicgc3Ryb2tlLXdpZHRoPScyJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIGFyaWEtaGlkZGVuPSd0cnVlJyBzdHlsZT0ndmVydGljYWwtYWxpZ246bWlkZGxlJz48cmVjdCB4PSc1JyB5PScyJyB3aWR0aD0nMTQnIGhlaWdodD0nMjAnIHJ4PScyJy8+PHBhdGggZD0nTTEyIDE4aC4wMScvPjwvc3ZnPiBKb2luIENhcm5pdmFsPC9idXR0b24+CiAgICA8L2Rpdj4KCiAgICA8ZGl2IGNsYXNzPSJkZW1vLWNhcmQiIG9uY2xpY2s9InN0YXJ0RGVtbygpIj4KICAgICAgPGRpdiBjbGFzcz0iZGVtby1jYXJkLWljb24iPjxzdmcgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y1OWUwYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBvbHlsaW5lIHBvaW50cz0iMTIgNiAxMiAxMiAxNiAxNCIvPjwvc3ZnPjwvZGl2PgogICAgICA8ZGl2IHN0eWxlPSJmbGV4OjEiPgogICAgICAgIDxkaXYgY2xhc3M9ImRlbW8tY2FyZC10aXRsZSI+TGl2ZSBkZW1vPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iZGVtby1jYXJkLWRlc2MiPlJ1bnMgYSByZWFsIGNhcm5pdmFsIHdpdGggOCBhdGhsZXRlcy4gTm8gc2lnbi11cC48L2Rpdj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImRlbW8tY2FyZC1hcnJvdyI+4oaSPC9kaXY+CiAgICA8L2Rpdj4KCiAgICA8IS0tIOKUgOKUgCBIb3cgaXQgd29ya3Mg4pSA4pSAIC0tPgogICAgPGRpdiBzdHlsZT0ibWFyZ2luLXRvcDozMnB4Ij4KICAgICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjAuOHJlbTtmb250LXdlaWdodDo3MDA7bGV0dGVyLXNwYWNpbmc6MC4wOGVtO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtjb2xvcjp2YXIoLS1tdXRlZCk7bWFyZ2luLWJvdHRvbToxNHB4O3RleHQtYWxpZ246Y2VudGVyIj5Ib3cgaXQgd29ya3M8L2Rpdj4KCiAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47Z2FwOjEwcHgiPgogICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2dhcDoxMnB4Ij4KICAgICAgICAgIDxkaXYgc3R5bGU9IndpZHRoOjI2cHg7aGVpZ2h0OjI2cHg7Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDp2YXIoLS1hY2NlbnQpO2NvbG9yOiNmZmY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZTowLjhyZW07ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2ZsZXgtc2hyaW5rOjAiPjE8L2Rpdj4KICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtd2VpZ2h0OjYwMDtmb250LXNpemU6MC45cmVtIj5SYWNlIENvbnRyb2wgY3JlYXRlcyBhIGNhcm5pdmFsPC9kaXY+CiAgICAgICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtc2l6ZTowLjc4cmVtO2NvbG9yOnZhcigtLW11dGVkKTttYXJnaW4tdG9wOjJweCI+VGFrZXMgMTAgc2Vjb25kcy4gWW91IGdldCBhIDQtbGV0dGVyIGNvZGUuPC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6MTJweCI+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJ3aWR0aDoyNnB4O2hlaWdodDoyNnB4O2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQ6dmFyKC0tYWNjZW50KTtjb2xvcjojZmZmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MC44cmVtO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmbGV4LXNocmluazowIj4yPC9kaXY+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8ZGl2IHN0eWxlPSJmb250LXdlaWdodDo2MDA7Zm9udC1zaXplOjAuOXJlbSI+RXZlcnlvbmUgam9pbnMgb24gdGhlaXIgcGhvbmU8L2Rpdj4KICAgICAgICAgICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjAuNzhyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO21hcmdpbi10b3A6MnB4Ij5PcGVuIGNhcm5pdmFsdGltaW5nLmNvbSwgdGFwIEpvaW4gQ2Fybml2YWwsIGVudGVyIHRoZSBjb2RlLiBQaWNrIGEgcm9sZSDigJQgVGltZXIsIE9ic2VydmVyLCBTdGFydGVyIG9yIFhDIE1hcnNoYWwuPC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6ZmxleC1zdGFydDtnYXA6MTJweCI+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJ3aWR0aDoyNnB4O2hlaWdodDoyNnB4O2JvcmRlci1yYWRpdXM6NTAlO2JhY2tncm91bmQ6dmFyKC0tYWNjZW50KTtjb2xvcjojZmZmO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MC44cmVtO2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtmbGV4LXNocmluazowIj4zPC9kaXY+CiAgICAgICAgICA8ZGl2PgogICAgICAgICAgICA8ZGl2IHN0eWxlPSJmb250LXdlaWdodDo2MDA7Zm9udC1zaXplOjAuOXJlbSI+UmFjZSBDb250cm9sIGFybXMgJmFtcDsgZmlyZXMgR088L2Rpdj4KICAgICAgICAgICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjAuNzhyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO21hcmdpbi10b3A6MnB4Ij5BbGwgdGltZXJzIHN0YXJ0IHNpbXVsdGFuZW91c2x5LiBUYXAgU1RPUCB3aGVuIHlvdXIgYXRobGV0ZSBmaW5pc2hlcy48L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpmbGV4LXN0YXJ0O2dhcDoxMnB4Ij4KICAgICAgICAgIDxkaXYgc3R5bGU9IndpZHRoOjI2cHg7aGVpZ2h0OjI2cHg7Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDp2YXIoLS1hY2NlbnQpO2NvbG9yOiNmZmY7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZTowLjhyZW07ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2ZsZXgtc2hyaW5rOjAiPjQ8L2Rpdj4KICAgICAgICAgIDxkaXY+CiAgICAgICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtd2VpZ2h0OjYwMDtmb250LXNpemU6MC45cmVtIj5UaW1lcyBzeW5jIGluc3RhbnRseSDigJQgcHVibGlzaCB3aGVuIHJlYWR5PC9kaXY+CiAgICAgICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtc2l6ZTowLjc4cmVtO2NvbG9yOnZhcigtLW11dGVkKTttYXJnaW4tdG9wOjJweCI+UmFjZSBDb250cm9sIHNlZXMgYWxsIHNwbGl0cyBsaXZlIGFuZCBwdWJsaXNoZXMgdGhlIGF2ZXJhZ2VkIHJlc3VsdC48L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj4KCiAgICAgIDwhLS0gUm9sZXMgLS0+CiAgICAgIDxkaXYgc3R5bGU9Im1hcmdpbi10b3A6MjBweDtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpO2JvcmRlci1yYWRpdXM6MTJweDtwYWRkaW5nOjE0cHggMTZweCI+CiAgICAgICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjAuNzhyZW07Zm9udC13ZWlnaHQ6NzAwO21hcmdpbi1ib3R0b206MTBweDtjb2xvcjp2YXIoLS1tdXRlZCk7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlO2xldHRlci1zcGFjaW5nOjAuMDZlbSI+Um9sZXM8L2Rpdj4KICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo3cHg7Zm9udC1zaXplOjAuODJyZW0iPgogICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDo4cHgiPjxzcGFuIHN0eWxlPSJmb250LXdlaWdodDo3MDA7bWluLXdpZHRoOjExMHB4Ij5SYWNlIENvbnRyb2w8L3NwYW4+PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLW11dGVkKSI+QXJtcyByYWNlcywgZmlyZXMgR08vUkVDQUxMLCBwdWJsaXNoZXMgcmVzdWx0cy4gT25lIHBlciBjYXJuaXZhbC48L3NwYW4+PC9kaXY+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7Z2FwOjhweCI+PHNwYW4gc3R5bGU9ImZvbnQtd2VpZ2h0OjcwMDttaW4td2lkdGg6MTEwcHgiPlRpbWVyPC9zcGFuPjxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1tdXRlZCkiPlRhcHMgU1RPUCBmb3Igb25lIGxhbmUuIEJyaW5nIDLigJMzIHBlciBsYW5lIGZvciBhY2N1cmFjeS48L3NwYW4+PC9kaXY+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7Z2FwOjhweCI+PHNwYW4gc3R5bGU9ImZvbnQtd2VpZ2h0OjcwMDttaW4td2lkdGg6MTEwcHgiPlN0YXJ0ZXI8L3NwYW4+PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLW11dGVkKSI+RmlyZXMgR08gZnJvbSB0aGUgc3RhcnQgbGluZSAob3B0aW9uYWwg4oCUIFJhY2UgQ29udHJvbCBjYW4gZG8gaXQpLjwvc3Bhbj48L2Rpdj4KICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDtnYXA6OHB4Ij48c3BhbiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwO21pbi13aWR0aDoxMTBweCI+T2JzZXJ2ZXI8L3NwYW4+PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLW11dGVkKSI+V2F0Y2hlcyBsaXZlIHNwbGl0cyBvbiBhbnkgZGV2aWNlLiBSZWFkLW9ubHkuPC9zcGFuPjwvZGl2PgogICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDo4cHgiPjxzcGFuIHN0eWxlPSJmb250LXdlaWdodDo3MDA7bWluLXdpZHRoOjExMHB4Ij5YQyBNYXJzaGFsPC9zcGFuPjxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1tdXRlZCkiPlRhcHMgZmluaXNoZXJzIGluIG9yZGVyIGF0IHRoZSBjcm9zcyBjb3VudHJ5IGZpbmlzaCBjaHV0ZS48L3NwYW4+PC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPCEtLSBUaW1lciBhY2N1cmFjeSAtLT4KICAgICAgPGRpdiBzdHlsZT0ibWFyZ2luLXRvcDoxMHB4O2JhY2tncm91bmQ6dmFyKC0tc3VyZmFjZSk7Ym9yZGVyLXJhZGl1czoxMnB4O3BhZGRpbmc6MTRweCAxNnB4Ij4KICAgICAgICA8ZGl2IHN0eWxlPSJmb250LXNpemU6MC43OHJlbTtmb250LXdlaWdodDo3MDA7bWFyZ2luLWJvdHRvbTo4cHg7Y29sb3I6dmFyKC0tbXV0ZWQpO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtsZXR0ZXItc3BhY2luZzowLjA2ZW0iPkhvdyBtYW55IHRpbWVycyBwZXIgbGFuZT88L2Rpdj4KICAgICAgICA8ZGl2IHN0eWxlPSJmb250LXNpemU6MC44MnJlbTtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2dhcDo1cHgiPgogICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDo4cHgiPjxzcGFuIHN0eWxlPSJtaW4td2lkdGg6NzBweDtmb250LXdlaWdodDo3MDAiPjEgdGltZXI8L3NwYW4+PHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLW11dGVkKSI+VGhhdCB0aW1lIGlzIHVzZWQgZGlyZWN0bHkuPC9zcGFuPjwvZGl2PgogICAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDo4cHgiPjxzcGFuIHN0eWxlPSJtaW4td2lkdGg6NzBweDtmb250LXdlaWdodDo3MDAiPjIgdGltZXJzPC9zcGFuPjxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1tdXRlZCkiPkF2ZXJhZ2Ugb2YgYm90aC48L3NwYW4+PC9kaXY+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7Z2FwOjhweCI+PHNwYW4gc3R5bGU9Im1pbi13aWR0aDo3MHB4O2ZvbnQtd2VpZ2h0OjcwMCI+MysgdGltZXJzPC9zcGFuPjxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1tdXRlZCkiPlRyaW1tZWQgbWVhbiDigJQgZmFzdGVzdCBhbmQgc2xvd2VzdCBkcm9wcGVkLCByZXN0IGF2ZXJhZ2VkLiA8c3Ryb25nPlJlY29tbWVuZGVkIGZvciBhY2N1cmFjeS48L3N0cm9uZz48L3NwYW4+PC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBzdHlsZT0ibWFyZ2luLXRvcDo4cHg7Zm9udC1zaXplOjAuNzhyZW07Y29sb3I6dmFyKC0tbXV0ZWQpIj5ObyBoYXJkIGxpbWl0IG9uIHRpbWVycy4gTW9yZSB0aW1lcnMgcGVyIGxhbmUgPSBtb3JlIGFjY3VyYXRlIHJlc3VsdC48L2Rpdj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KCgogICAgPCEtLSDilIDilIAgU2Nob29sIFNwb3J0IFBvcnRhbCB1cHNlbGwg4pSA4pSAIC0tPgogICAgPGRpdiBzdHlsZT0ibWFyZ2luLXRvcDoyNHB4O2JhY2tncm91bmQ6bGluZWFyLWdyYWRpZW50KDEzNWRlZywjMGQxYjNlIDAlLCMxYTNhNmUgNjAlLCMxYTU2ZGIgMTAwJSk7Ym9yZGVyLXJhZGl1czoxNHB4O3BhZGRpbmc6MThweCAyMHB4O2NvbG9yOiNmZmYiPgogICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7bWFyZ2luLWJvdHRvbTo2cHgiPgogICAgICAgIDxzcGFuIHN0eWxlPSJmb250LXNpemU6MS4xcmVtIj7wn4+FPC9zcGFuPgogICAgICAgIDxzcGFuIHN0eWxlPSJmb250LXNpemU6MC44cmVtO2ZvbnQtd2VpZ2h0OjcwMDt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7bGV0dGVyLXNwYWNpbmc6MC4wNmVtO2NvbG9yOiNmY2QzNGQiPlNjaG9vbCBTcG9ydCBQb3J0YWw8L3NwYW4+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IHN0eWxlPSJmb250LXNpemU6MC45OHJlbTtmb250LXdlaWdodDo3MDA7bWFyZ2luLWJvdHRvbTo2cHg7bGluZS1oZWlnaHQ6MS4zIj5XYW50IHBlcnNpc3RlbnQgcmVzdWx0cywgaG91c2UgcG9pbnRzICZhbXA7IGRpc3RyaWN0IHF1YWxpZmllcnM/PC9kaXY+CiAgICAgIDxkaXYgc3R5bGU9ImZvbnQtc2l6ZTowLjgycmVtO2NvbG9yOnJnYmEoMjU1LDI1NSwyNTUsMC43NSk7bWFyZ2luLWJvdHRvbToxNHB4O2xpbmUtaGVpZ2h0OjEuNSI+Q2Fybml2YWwgVGltaW5nIGlzIGZyZWUgYW5kIGFsd2F5cyB3aWxsIGJlLiBTY2hvb2wgU3BvcnQgUG9ydGFsIGFkZHMgYXV0b21hdGljIGhvdXNlIHBvaW50IHRhbGxpZXMsIGV2ZW50IHByb2dyYW0gYnVpbGRlciwgZGlzdHJpY3QgcXVhbGlmaWVyIHRyYWNraW5nIGFuZCBwZXJtYW5lbnQgcHVibGljIHJlc3VsdHMgcGFnZXMg4oCUIGZvciAkMS9zdHVkZW50L3llYXIuPC9kaXY+CiAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDtnYXA6MTBweDtmbGV4LXdyYXA6d3JhcCI+CiAgICAgICAgPGEgaHJlZj0iaHR0cHM6Ly9zY2hvb2xzcG9ydHBvcnRhbC5jb20uYXUiIHRhcmdldD0iX2JsYW5rIiBzdHlsZT0iYmFja2dyb3VuZDojZjU5ZTBiO2NvbG9yOiMwZDFiM2U7cGFkZGluZzo5cHggMThweDtib3JkZXItcmFkaXVzOjdweDtmb250LXNpemU6MC44NXJlbTtmb250LXdlaWdodDo3MDA7dGV4dC1kZWNvcmF0aW9uOm5vbmU7ZGlzcGxheTppbmxpbmUtYmxvY2siPlNlZSBTY2hvb2wgU3BvcnQgUG9ydGFsIOKGkjwvYT4KICAgICAgICA8YSBocmVmPSJodHRwczovL3NjaG9vbHNwb3J0cG9ydGFsLmNvbS5hdSNkZW1vIiB0YXJnZXQ9Il9ibGFuayIgc3R5bGU9ImJvcmRlcjoxLjVweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuMyk7Y29sb3I6I2ZmZjtwYWRkaW5nOjhweCAxNnB4O2JvcmRlci1yYWRpdXM6N3B4O2ZvbnQtc2l6ZTowLjg1cmVtO2ZvbnQtd2VpZ2h0OjYwMDt0ZXh0LWRlY29yYXRpb246bm9uZTtkaXNwbGF5OmlubGluZS1ibG9jayI+TGl2ZSBkZW1vPC9hPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgoKICAgIDxkaXYgY2xhc3M9InRleHQtY2VudGVyIHRleHQtbXV0ZWQgdGV4dC14cyBtdC0zMiI+CiAgICAgIFdvcmtzIG9mZmxpbmUgwrcgTm8gYXBwIGluc3RhbGwgwrcgRnJlZSB0byB1c2U8YnI+CiAgICAgIDxzcGFuIHN0eWxlPSJvcGFjaXR5OjAuNSI+Q2Fybml2YWwgVGltaW5nIMK3IGNhcm5pdmFsdGltaW5nLmNvbTwvc3Bhbj4KICAgIDwvZGl2PgogIDwvZGl2Pgo8L2Rpdj4KCjwhLS0g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCiAgICAgU0NSRUVOOiBTRVRVUCAoTmV3IENhcm5pdmFsKQrilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgLS0+CjxkaXYgaWQ9InNjcmVlbi1zZXR1cCIgY2xhc3M9InNjcmVlbiI+CiAgPGRpdiBjbGFzcz0iaGVhZGVyIj4KICAgIDxkaXYgY2xhc3M9ImxvZ28tYmFkZ2UiPlNQPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJoZWFkZXItdGl0bGUiPk5ldyBDYXJuaXZhbDwvZGl2PgogICAgPGRpdiBjbGFzcz0iaGVhZGVyLXJpZ2h0Ij4KICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1pY29uIGJ0bi1zbSIgb25jbGljaz0ic2hvd1NjcmVlbignaG9tZScpIj7ihpAgQmFjazwvYnV0dG9uPgogICAgPC9kaXY+CiAgPC9kaXY+CiAgPGRpdiBjbGFzcz0iY29udGVudCI+CiAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgPGxhYmVsPlNjaG9vbCBOYW1lPC9sYWJlbD4KICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJzZXR1cC1zY2hvb2wiIHBsYWNlaG9sZGVyPSJlLmcuIFdpbGxpYW1zdG93biBQcmltYXJ5IFNjaG9vbCI+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAiPgogICAgICA8bGFiZWw+Q2Fybml2YWwgLyBFdmVudCBOYW1lPC9sYWJlbD4KICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJzZXR1cC1uYW1lIiBwbGFjZWhvbGRlcj0iZS5nLiBXaW50ZXIgU3BvcnQgMjAyNiI+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAiPgogICAgICA8bGFiZWw+U3BvcnQgVHlwZTwvbGFiZWw+CiAgICAgIDxkaXYgY2xhc3M9InNwb3J0LWdyaWQiPgogICAgICAgIDxkaXYgY2xhc3M9InNwb3J0LWJ0biBhY3RpdmUiIGRhdGEtc3BvcnQ9InRyYWNrIiBvbmNsaWNrPSJzZWxlY3RTcG9ydCgndHJhY2snKSI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJzLWljb24iPjxzdmcgd2lkdGg9JzIyJyBoZWlnaHQ9JzIyJyB2aWV3Qm94PScwIDAgMjQgMjQnIGZpbGw9J25vbmUnIHN0cm9rZT0nY3VycmVudENvbG9yJyBzdHJva2Utd2lkdGg9JzInIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgYXJpYS1oaWRkZW49J3RydWUnIHN0eWxlPSd2ZXJ0aWNhbC1hbGlnbjptaWRkbGUnPjxwb2x5bGluZSBwb2ludHM9JzIyIDEyIDE4IDEyIDE1IDIxIDkgMyA2IDEyIDIgMTInLz48L3N2Zz48L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InMtbGFiZWwiPlRyYWNrICYgRmllbGQ8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InMtZGVzYyI+TGFuZSB0aW1pbmc8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJzcG9ydC1idG4iIGRhdGEtc3BvcnQ9InN3aW0iIG9uY2xpY2s9InNlbGVjdFNwb3J0KCdzd2ltJykiPgogICAgICAgICAgPGRpdiBjbGFzcz0icy1pY29uIj48c3ZnIHdpZHRoPScyMicgaGVpZ2h0PScyMicgdmlld0JveD0nMCAwIDI0IDI0JyBmaWxsPSdub25lJyBzdHJva2U9J2N1cnJlbnRDb2xvcicgc3Ryb2tlLXdpZHRoPScyJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIGFyaWEtaGlkZGVuPSd0cnVlJyBzdHlsZT0ndmVydGljYWwtYWxpZ246bWlkZGxlJz48cGF0aCBkPSdNMiAyMHMyLTIgNS0yIDUgMiA3IDIgNS0yIDctMiAzIDEgMyAxTTIgMTZzMi0yIDUtMiA1IDIgNyAyIDUtMiA3LTIgMyAxIDMgMScvPjxjaXJjbGUgY3g9JzE0JyBjeT0nNScgcj0nMicvPjwvc3ZnPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0icy1sYWJlbCI+U3dpbW1pbmc8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InMtZGVzYyI+TGFuZSB0aW1pbmc8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJzcG9ydC1idG4iIGRhdGEtc3BvcnQ9InhjIiBvbmNsaWNrPSJzZWxlY3RTcG9ydCgneGMnKSI+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJzLWljb24iPjxzdmcgd2lkdGg9JzIyJyBoZWlnaHQ9JzIyJyB2aWV3Qm94PScwIDAgMjQgMjQnIGZpbGw9J25vbmUnIHN0cm9rZT0nY3VycmVudENvbG9yJyBzdHJva2Utd2lkdGg9JzInIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgYXJpYS1oaWRkZW49J3RydWUnIHN0eWxlPSd2ZXJ0aWNhbC1hbGlnbjptaWRkbGUnPjxwYXRoIGQ9J00xMiAyMlY4TTUgOGw3LTYgNyA2TTMgMjJoMThNOSAyMlYxNmg2djYnLz48L3N2Zz48L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InMtbGFiZWwiPkNyb3NzIENvdW50cnk8L2Rpdj4KICAgICAgICAgIDxkaXYgY2xhc3M9InMtZGVzYyI+RmluaXNoIG9yZGVyIHRhcDwvZGl2PgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InNwb3J0LWJ0biIgZGF0YS1zcG9ydD0ibWl4ZWQiIG9uY2xpY2s9InNlbGVjdFNwb3J0KCdtaXhlZCcpIj4KICAgICAgICAgIDxkaXYgY2xhc3M9InMtaWNvbiI+PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iNyIgaGVpZ2h0PSI3Ii8+PHJlY3QgeD0iMTQiIHk9IjMiIHdpZHRoPSI3IiBoZWlnaHQ9IjciLz48cmVjdCB4PSIzIiB5PSIxNCIgd2lkdGg9IjciIGhlaWdodD0iNyIvPjxyZWN0IHg9IjE0IiB5PSIxNCIgd2lkdGg9IjciIGhlaWdodD0iNyIvPjwvc3ZnPjwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0icy1sYWJlbCI+TWl4ZWQgRXZlbnRzPC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJzLWRlc2MiPkFsbCBtb2RlczwvZGl2PgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgIDxsYWJlbD5Db21wZXRpdGlvbiBUaWVyPC9sYWJlbD4KICAgICAgPGRpdiBjbGFzcz0icGlsbC1yb3ciPgogICAgICAgIDxkaXYgY2xhc3M9InBpbGwgYWN0aXZlIiBkYXRhLXRpZXI9InNjaG9vbCIgb25jbGljaz0ic2VsZWN0VGllcignc2Nob29sJykiPlNjaG9vbDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9InBpbGwiIGRhdGEtdGllcj0iZGlzdHJpY3QiIG9uY2xpY2s9InNlbGVjdFRpZXIoJ2Rpc3RyaWN0JykiPkRpc3RyaWN0PC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0icGlsbCIgZGF0YS10aWVyPSJyZWdpb24iIG9uY2xpY2s9InNlbGVjdFRpZXIoJ3JlZ2lvbicpIj5SZWdpb248L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJwaWxsIiBkYXRhLXRpZXI9InN0YXRlIiBvbmNsaWNrPSJzZWxlY3RUaWVyKCdzdGF0ZScpIj5TdGF0ZTwvZGl2PgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgIDxsYWJlbD5BY2NlbnQgQ29sb3VyIDxzcGFuIHN0eWxlPSJmb250LXdlaWdodDo0MDA7dGV4dC10cmFuc2Zvcm06bm9uZTtmb250LXNpemU6MC44NWVtIj4ob3B0aW9uYWwpPC9zcGFuPjwvbGFiZWw+CiAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0ic2V0dXAtY29sb3VyIiBwbGFjZWhvbGRlcj0iIzE0YjhhNiDigJQgbGVhdmUgYmxhbmsgZm9yIHRlYWwiPgogICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgIDxsYWJlbD5Ib3VzZXMgPHNwYW4gc3R5bGU9ImNvbG9yOnZhcigtLW11dGVkKTtmb250LXNpemU6LjhyZW07Zm9udC13ZWlnaHQ6NDAwIj4ob3B0aW9uYWwg4oCUIGZvciBwb2ludHMgdGFsbHkpPC9zcGFuPjwvbGFiZWw+CiAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0ic2V0dXAtaG91c2VzIiBwbGFjZWhvbGRlcj0iUmVkLCBCbHVlLCBHcmVlbiwgWWVsbG93Ij4KICAgICAgPGRpdiBzdHlsZT0iY29sb3I6dmFyKC0tbXV0ZWQpO2ZvbnQtc2l6ZTouNzVyZW07bWFyZ2luLXRvcDo0cHgiPkNvbW1hLXNlcGFyYXRlZC4gTGVhdmUgYmxhbmsgdG8gc2tpcCBob3VzZSBwb2ludHMuPC9kaXY+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAiPgogICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO21hcmdpbi1ib3R0b206OHB4Ij4KICAgICAgICA8bGFiZWwgc3R5bGU9Im1hcmdpbjowIj5FdmVudCBQcm9ncmFtIDxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1tdXRlZCk7Zm9udC1zaXplOi44cmVtO2ZvbnQtd2VpZ2h0OjQwMCI+KG9wdGlvbmFsKTwvc3Bhbj48L2xhYmVsPgogICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJwYWRkaW5nOjRweCAxMHB4O2ZvbnQtc2l6ZTouOHJlbSIgb25jbGljaz0iYWRkUHJvZ3JhbVJvdygpIj4rIEFkZCBFdmVudDwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBpZD0icHJvZ3JhbS1yb3dzIiBzdHlsZT0ibWF4LWhlaWdodDoyNDBweDtvdmVyZmxvdy15OmF1dG8iPjwvZGl2PgogICAgICA8ZGl2IHN0eWxlPSJjb2xvcjp2YXIoLS1tdXRlZCk7Zm9udC1zaXplOi43NXJlbTttYXJnaW4tdG9wOjRweCI+UHJlLWxvYWQgeW91ciBkYXkncyBzY2hlZHVsZS4gVXNlICJOZXh0IEV2ZW50IOKGkiIgaW4gUmFjZSBDb250cm9sIHRvIGF1dG8tYWR2YW5jZS48L2Rpdj4KICAgIDwvZGl2PgogICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IG10LTgiIG9uY2xpY2s9ImNyZWF0ZUNhcm5pdmFsKCkiPkNyZWF0ZSBDYXJuaXZhbCDihpI8L2J1dHRvbj4KICA8L2Rpdj4KPC9kaXY+Cgo8IS0tIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAogICAgIFNDUkVFTjogSk9JTgrilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgLS0+CjxkaXYgaWQ9InNjcmVlbi1qb2luLXNjcmVlbiIgY2xhc3M9InNjcmVlbiI+CiAgPGRpdiBjbGFzcz0iaGVhZGVyIj4KICAgIDxkaXYgY2xhc3M9ImxvZ28tYmFkZ2UiPlNQPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJoZWFkZXItdGl0bGUiPkpvaW4gQ2Fybml2YWw8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImhlYWRlci1yaWdodCI+CiAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4taWNvbiBidG4tc20iIG9uY2xpY2s9InNob3dTY3JlZW4oJ2hvbWUnKSI+4oaQIEJhY2s8L2J1dHRvbj4KICAgIDwvZGl2PgogIDwvZGl2PgogIDxkaXYgY2xhc3M9ImNvbnRlbnQiPgogICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgIDxsYWJlbD40LUxldHRlciBDb2RlPC9sYWJlbD4KICAgICAgPGlucHV0IHR5cGU9InRleHQiIGlkPSJqb2luLWNvZGUtaW5wdXQiIHBsYWNlaG9sZGVyPSJBQkNEIgogICAgICAgIG1heGxlbmd0aD0iNiIKICAgICAgICBzdHlsZT0iZm9udC1mYW1pbHk6J01lbmxvJyxtb25vc3BhY2U7Zm9udC1zaXplOjEuOHJlbTt0ZXh0LXRyYW5zZm9ybTp1cHBlcmNhc2U7bGV0dGVyLXNwYWNpbmc6OHB4O3RleHQtYWxpZ246Y2VudGVyIj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgIDxsYWJlbD5Zb3VyIE5hbWU8L2xhYmVsPgogICAgICA8aW5wdXQgdHlwZT0idGV4dCIgaWQ9ImpvaW4tbmFtZS1pbnB1dCIgcGxhY2Vob2xkZXI9ImUuZy4gQWxleCI+CiAgICA8L2Rpdj4KICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tcHJpbWFyeSIgb25jbGljaz0iam9pbkNhcm5pdmFsKCkiPkpvaW4g4oaSPC9idXR0b24+CiAgICA8ZGl2IGlkPSJqb2luLWVycm9yIiBjbGFzcz0idGV4dC1jZW50ZXIgdGV4dC1tdXRlZCBtdC0xNiBoaWRkZW4iIHN0eWxlPSJjb2xvcjp2YXIoLS1kYW5nZXIpIj48L2Rpdj4KICA8L2Rpdj4KPC9kaXY+Cgo8IS0tIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAogICAgIFNDUkVFTjogUk9MRSBQSUNLRVIK4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQIC0tPgo8ZGl2IGlkPSJzY3JlZW4tcm9sZSIgY2xhc3M9InNjcmVlbiI+CiAgPGRpdiBjbGFzcz0iaGVhZGVyIj4KICAgIDxkaXYgY2xhc3M9ImxvZ28tYmFkZ2UiPlNQPC9kaXY+CiAgICA8ZGl2PgogICAgICA8ZGl2IGNsYXNzPSJoZWFkZXItdGl0bGUiIGlkPSJyb2xlLXNjaG9vbC1uYW1lIj5DaG9vc2UgUm9sZTwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJoZWFkZXItc3ViIiBpZD0icm9sZS1jYXJuaXZhbC1uYW1lIj48L2Rpdj4KICAgIDwvZGl2PgogIDwvZGl2PgogIDxkaXYgY2xhc3M9ImNvbnRlbnQiPgogICAgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgIDxkaXYgY2xhc3M9ImNhcmQtdGl0bGUiPkNhcm5pdmFsPC9kaXY+CiAgICAgIDxkaXYgc3R5bGU9ImZvbnQtc2l6ZToxcmVtO2ZvbnQtd2VpZ2h0OjcwMCIgaWQ9InJvbGUtam9pbmVkLW5hbWUiPjwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJ0ZXh0LXhzIHRleHQtbXV0ZWQgbXQtOCBmb250LW1vbm8iIGlkPSJyb2xlLWpvaW5lZC1jb2RlIj48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0idGV4dC14cyB0ZXh0LW11dGVkIG10LTQiIGlkPSJyb2xlLWV4cGlyZXMtbm90ZSIgc3R5bGU9ImRpc3BsYXk6bm9uZSI+PC9kaXY+CiAgICA8L2Rpdj4KICAgIDxkaXYgaWQ9InJvbGUtZ3JpZCIgY2xhc3M9InJvbGUtZ3JpZCI+PC9kaXY+CiAgICA8ZGl2IGlkPSJyb2xlLWxhbmUtcGlja2VyIiBjbGFzcz0iaGlkZGVuIG10LTE2Ij4KICAgICAgPGxhYmVsIHN0eWxlPSJmb250LXNpemU6MS4xcmVtO2ZvbnQtd2VpZ2h0OjcwMDtkaXNwbGF5OmJsb2NrO21hcmdpbi1ib3R0b206MTJweCI+V2hpY2ggbGFuZSBhcmUgeW91IHRpbWluZz88L2xhYmVsPgogICAgICA8ZGl2IGlkPSJsYW5lLXBpY2stYnRucyIgc3R5bGU9ImRpc3BsYXk6ZmxleDtmbGV4LXdyYXA6d3JhcDtnYXA6OHB4O21hcmdpbi10b3A6OHB4Ij48L2Rpdj4KICAgIDwvZGl2PgogIDwvZGl2Pgo8L2Rpdj4KCjwhLS0g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCiAgICAgU0NSRUVOOiBUSU1FUiAoTGFuZSkK4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQIC0tPgo8ZGl2IGlkPSJzY3JlZW4tdGltZXIiIGNsYXNzPSJzY3JlZW4iPgogIDxkaXYgY2xhc3M9ImhlYWRlciI+CiAgICA8ZGl2IGNsYXNzPSJjb25uLWRvdCIgaWQ9InRpbWVyLWRvdCI+PC9kaXY+PHNwYW4gaWQ9InRpbWVyLWRvdC1sYmwiIHN0eWxlPSJmb250LXNpemU6MC42NXJlbTtmb250LXdlaWdodDo3MDA7bGV0dGVyLXNwYWNpbmc6LjA1ZW07Y29sb3I6dmFyKC0tbXV0ZWQpIj48L3NwYW4+CiAgICA8ZGl2PgogICAgICA8ZGl2IGNsYXNzPSJoZWFkZXItdGl0bGUiIGlkPSJ0aW1lci1sYW5lLWxhYmVsIj5MYW5lIDE8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iaGVhZGVyLXN1YiIgaWQ9InRpbWVyLWV2ZW50LWxhYmVsIj48L2Rpdj4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0iaGVhZGVyLXJpZ2h0IiBpZD0idGltZXItYmFkZ2Utd3JhcCI+PC9kaXY+CiAgPC9kaXY+CiAgPGRpdiBjbGFzcz0iY29udGVudCI+CiAgICA8ZGl2IGNsYXNzPSJjYXJkIiBpZD0idGltZXItYXRobGV0ZS1jYXJkIj4KICAgICAgPGRpdiBjbGFzcz0iY2FyZC10aXRsZSIgaWQ9InRpbWVyLWF0aGxldGUtZXZlbnQiPkV2ZW50PC9kaXY+CiAgICAgIDxkaXYgaWQ9InRpbWVyLWF0aGxldGUtbmFtZSIgc3R5bGU9ImZvbnQtc2l6ZToxLjVyZW07Zm9udC13ZWlnaHQ6NzAwIj7igJQ8L2Rpdj4KICAgICAgPGRpdiBpZD0idGltZXItYXRobGV0ZS1ub3RlIiBjbGFzcz0idGV4dC1tdXRlZCB0ZXh0LXNtIj48L2Rpdj4KICAgIDwvZGl2PgoKICAgIDxkaXYgaWQ9InRpbWVyLXJlY2FsbC1iYW5uZXIiIGNsYXNzPSJoaWRkZW4iIHN0eWxlPSJiYWNrZ3JvdW5kOiM3ZjFkMWQ7Y29sb3I6I2ZjYTVhNTtib3JkZXItcmFkaXVzOjEwcHg7cGFkZGluZzoxMHB4IDE0cHg7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxLjA1cmVtO21hcmdpbi1ib3R0b206OHB4OyI+RkFMU0UgU1RBUlQg4oCUIFJhY2UgUmVjYWxsZWQ8L2Rpdj4KCiAgICA8ZGl2IGNsYXNzPSJjbG9jayIgaWQ9InRpbWVyLWNsb2NrIj4wOjAwLjAwPC9kaXY+CgogICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCIgaWQ9InRpbWVyLW5hbWUtZ2F0ZSI+CiAgICAgIDxsYWJlbD5Zb3VyIG5hbWUgKG5lZWRlZCB0byBzdG9wKTwvbGFiZWw+CiAgICAgIDxpbnB1dCB0eXBlPSJ0ZXh0IiBpZD0idGltZXItbmFtZS1pbnB1dCIgcGxhY2Vob2xkZXI9ImUuZy4gQWxleCI+CiAgICA8L2Rpdj4KCiAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXN0b3AiIGlkPSJ0aW1lci1zdG9wLWJ0biIgb25jbGljaz0idGltZXJTdG9wKCkiIGRpc2FibGVkPlNUT1A8L2J1dHRvbj4KCiAgICA8ZGl2IGlkPSJ0aW1lci1teS1zcGxpdCIgY2xhc3M9ImhpZGRlbiBtdC0xNiI+CiAgICAgIDxkaXYgY2xhc3M9ImNhcmQiPgogICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtdGl0bGUiPllvdXIgdGltZTwvZGl2PgogICAgICAgIDxkaXYgaWQ9InRpbWVyLW15LXRpbWUiIGNsYXNzPSJmb250LW1vbm8iIHN0eWxlPSJmb250LXNpemU6Mi4ycmVtO2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjp2YXIoLS1hY2NlbnQpIj48L2Rpdj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KCiAgICA8ZGl2IGlkPSJ0aW1lci1zcGxpdHMtY2FyZCIgY2xhc3M9ImNhcmQgbXQtOCBoaWRkZW4iPgogICAgICA8ZGl2IGNsYXNzPSJjYXJkLXRpdGxlIj5BbGwgdGltZXJzIHRoaXMgbGFuZTwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJ0ZXh0LXhzIHRleHQtbXV0ZWQiIHN0eWxlPSJwYWRkaW5nOjAgNHB4IDZweDtsaW5lLWhlaWdodDoxLjQ7Ij5SYWNlIENvbnRyb2wgcHVibGlzaGVzIGEgPHN0cm9uZz50cmltbWVkIG1lYW48L3N0cm9uZz4g4oCUIHdpdGggMysgdGltZXJzIHRoZSBmYXN0ZXN0IGFuZCBzbG93ZXN0IGFyZSBkcm9wcGVkLjwvZGl2PgogICAgICA8ZGl2IGlkPSJ0aW1lci1zcGxpdHMtbGlzdCI+PC9kaXY+CiAgICA8L2Rpdj4KCiAgICA8ZGl2IGlkPSJ0aW1lci13YWl0aW5nLW1zZyIgY2xhc3M9InRleHQtY2VudGVyIHRleHQtbXV0ZWQgbXQtMzIiPgogICAgICA8ZGl2IHN0eWxlPSJmb250LXNpemU6Mi41cmVtIj48c3ZnIHdpZHRoPScyOCcgaGVpZ2h0PScyOCcgdmlld0JveD0nMCAwIDI0IDI0JyBmaWxsPSdub25lJyBzdHJva2U9J2N1cnJlbnRDb2xvcicgc3Ryb2tlLXdpZHRoPScyJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIGFyaWEtaGlkZGVuPSd0cnVlJyBzdHlsZT0ndmVydGljYWwtYWxpZ246bWlkZGxlJz48Y2lyY2xlIGN4PScxMicgY3k9JzEzJyByPSc4Jy8+PHBhdGggZD0nTTEyIDl2NGwyIDJNOSAyaDYnLz48L3N2Zz48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibXQtOCI+V2FpdGluZyBmb3IgcmFjZSB0byBiZSBhcm1lZC4uLjwvZGl2PgogICAgPC9kaXY+CiAgPC9kaXY+CjwvZGl2PgoKPCEtLSDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKICAgICBTQ1JFRU46IEFETUlOIChMYW5lIFJhY2UpCuKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkCAtLT4KPGRpdiBpZD0ic2NyZWVuLWFkbWluIiBjbGFzcz0ic2NyZWVuIj4KICA8ZGl2IGNsYXNzPSJoZWFkZXIiPgogICAgPGRpdiBjbGFzcz0iY29ubi1kb3QiIGlkPSJhZG1pbi1kb3QiPjwvZGl2PjxzcGFuIGlkPSJhZG1pbi1kb3QtbGJsIiBzdHlsZT0iZm9udC1zaXplOjAuNjVyZW07Zm9udC13ZWlnaHQ6NzAwO2xldHRlci1zcGFjaW5nOi4wNWVtO2NvbG9yOnZhcigtLW11dGVkKSI+PC9zcGFuPgogICAgPGRpdiBjbGFzcz0iaGVhZGVyLXRpdGxlIj5SYWNlIENvbnRyb2w8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImhlYWRlci1yaWdodCI+PHNwYW4gY2xhc3M9InRleHQtbXV0ZWQgdGV4dC14cyIgaWQ9ImFkbWluLXNjaG9vbC1sYmwiPjwvc3Bhbj48L2Rpdj4KICA8L2Rpdj4KICA8ZGl2IGNsYXNzPSJjb250ZW50Ij4KCiAgICA8IS0tIERlbW8gYmFubmVyIChzaG93biB3aGVuIGlzRGVtbz10cnVlKSAtLT4KICAgIDxkaXYgaWQ9ImFkbWluLWRlbW8tYmFubmVyIiBjbGFzcz0iZGVtby1iYW5uZXIgaGlkZGVuIj4KICAgICAgPGRpdiBjbGFzcz0iZGVtby1iYW5uZXItdG9wIj4KICAgICAgICA8c3BhbiBzdHlsZT0iZm9udC1zaXplOjEuMXJlbTtmb250LXdlaWdodDo3MDA7Y29sb3I6I2Y1OWUwYiI+RGVtbyBDYXJuaXZhbDwvc3Bhbj4KICAgICAgICA8c3BhbiBjbGFzcz0iYmFkZ2UiIHN0eWxlPSJiYWNrZ3JvdW5kOnJnYmEoMjQ1LDE1OCwxMSwwLjE1KTtjb2xvcjojZjU5ZTBiO2JvcmRlci1jb2xvcjpyZ2JhKDI0NSwxNTgsMTEsMC4zKSI+REVNTzwvc3Bhbj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImRlbW8tYmFubmVyLWhpbnQiIHN0eWxlPSJtYXJnaW4tYm90dG9tOjEwcHgiPgogICAgICAgIDxzdHJvbmc+U2hhcmUgdGhpcyBjb2RlPC9zdHJvbmc+IOKAlCBvcGVuIGNhcm5pdmFsdGltaW5nLmNvbSBvbiBhbm90aGVyIGRldmljZSBhbmQgdGFwICJKb2luIENhcm5pdmFsIgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTJweDtmbGV4LXdyYXA6d3JhcCI+CiAgICAgICAgPHNwYW4gY2xhc3M9ImRlbW8tY29kZS1waWxsIiBpZD0iZGVtby1jb2RlLWRpc3BsYXkiIG9uY2xpY2s9ImNvcHlEZW1vQ29kZSgpIiB0aXRsZT0iVGFwIHRvIGNvcHkiPj8/Pz88L3NwYW4+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1pY29uIGJ0bi1zbSIgb25jbGljaz0iY29weURlbW9Db2RlKCkiPjxzdmcgd2lkdGg9IjEzIiBoZWlnaHQ9IjEzIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOm1pZGRsZTttYXJnaW4tcmlnaHQ6NHB4Ij48cmVjdCB4PSI5IiB5PSI5IiB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHJ4PSIyIiByeT0iMiIvPjxwYXRoIGQ9Ik01IDE1SDRhMiAyIDAgMCAxLTItMlY0YTIgMiAwIDAgMSAyLTJoOWEyIDIgMCAwIDEgMiAydjEiLz48L3N2Zz4gQ29weSBjb2RlPC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJkZW1vLXFyIj4KICAgICAgICA8ZGl2IHN0eWxlPSJmb250LXNpemU6MC43MnJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7bWFyZ2luLWJvdHRvbTo2cHgiPk9yIHNjYW4gdG8gam9pbiBmcm9tIHBob25lOjwvZGl2PgogICAgICAgIDxkaXYgaWQ9ImRlbW8tcXItY2FudmFzIiBzdHlsZT0iZGlzcGxheTppbmxpbmUtYmxvY2s7YmFja2dyb3VuZDojZmZmO3BhZGRpbmc6NnB4O2JvcmRlci1yYWRpdXM6NnB4Ij48L2Rpdj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KCiAgICA8IS0tIFNldHVwIHBhbmVsIC0tPgogICAgPGRpdiBpZD0iYWRtaW4tc2V0dXAtcGFuZWwiPgogICAgICA8ZGl2IGNsYXNzPSJjYXJkIj4KICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLXRpdGxlIj5SYWNlIFNldHVwPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCI+CiAgICAgICAgICA8bGFiZWw+QWdlIEdyb3VwPC9sYWJlbD4KICAgICAgICAgIDxzZWxlY3QgaWQ9ImFkbWluLWFnZS1zZWwiPjwvc2VsZWN0PgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAiPgogICAgICAgICAgPGxhYmVsPkdlbmRlcjwvbGFiZWw+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJwaWxsLXJvdyI+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InBpbGwgYWN0aXZlIiBkYXRhLWFnPSJib3lzIiBvbmNsaWNrPSJzZWxlY3RBZG1pbkdlbmRlcignYm95cycpIj5Cb3lzPC9kaXY+CiAgICAgICAgICAgIDxkaXYgY2xhc3M9InBpbGwiIGRhdGEtYWc9ImdpcmxzIiBvbmNsaWNrPSJzZWxlY3RBZG1pbkdlbmRlcignZ2lybHMnKSI+R2lybHM8L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0icGlsbCIgZGF0YS1hZz0ibWl4ZWQiIG9uY2xpY2s9InNlbGVjdEFkbWluR2VuZGVyKCdtaXhlZCcpIj5NaXhlZDwvZGl2PgogICAgICAgICAgPC9kaXY+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iZm9ybS1ncm91cCBtYi0wIj4KICAgICAgICAgIDxsYWJlbD5FdmVudDwvbGFiZWw+CiAgICAgICAgICA8c2VsZWN0IGlkPSJhZG1pbi1ldmVudC1zZWwiPjwvc2VsZWN0PgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+TGFuZSBBc3NpZ25tZW50czwvZGl2PgogICAgICAgIDxkaXYgaWQ9ImFkbWluLWxhbmUtaW5wdXRzIj48L2Rpdj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImNhcmQiIGlkPSJhZG1pbi1ob3VzZS1jYXJkIiBzdHlsZT0iZGlzcGxheTpub25lIj4KICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO21hcmdpbi1ib3R0b206OHB4Ij4KICAgICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtdGl0bGUiIHN0eWxlPSJtYXJnaW46MCI+SG91c2UgUG9pbnRzPC9kaXY+CiAgICAgICAgICA8YnV0dG9uIHR5cGU9ImJ1dHRvbiIgY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBzdHlsZT0icGFkZGluZzo0cHggMTBweDtmb250LXNpemU6Ljc4cmVtO2NvbG9yOiNlZjQ0NDQ7Ym9yZGVyLWNvbG9yOiNlZjQ0NDQiIG9uY2xpY2s9ImFkbWluUmVzZXRIb3VzZVBvaW50cygpIj5SZXNldDwvYnV0dG9uPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgaWQ9ImFkbWluLWhvdXNlLXN0YW5kaW5ncyI+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7Z2FwOjhweDtmbGV4LXdyYXA6d3JhcCI+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IiBvbmNsaWNrPSJhZG1pbkFybSgpIiBzdHlsZT0iZmxleDoxIj5BUk0gUkFDRSDihpI8L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgaWQ9ImFkbWluLW5leHQtZXZlbnQtYnRuIiBvbmNsaWNrPSJhZG1pbk5leHRFdmVudCgpIiBzdHlsZT0iZmxleDoxO2Rpc3BsYXk6bm9uZSI+TmV4dCBFdmVudCDihpI8L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KCiAgICA8IS0tIExpdmUgcGFuZWwgLS0+CiAgICA8ZGl2IGlkPSJhZG1pbi1saXZlLXBhbmVsIiBjbGFzcz0iaGlkZGVuIj4KICAgICAgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTgiIHN0eWxlPSJtYXJnaW4tYm90dG9tOjZweCI+CiAgICAgICAgICA8ZGl2IGlkPSJhZG1pbi1yYWNlLWxibCIgc3R5bGU9ImZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MS4wNXJlbTtmbGV4OjEiPjwvZGl2PgogICAgICAgICAgPHNwYW4gaWQ9ImFkbWluLXN0YXRlLWJhZGdlIiBjbGFzcz0iYmFkZ2UgYmFkZ2UtYXJtZWQiPkFSTUVEPC9zcGFuPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImNsb2NrIiBpZD0iYWRtaW4tbGl2ZS1jbG9jayIgc3R5bGU9ImZvbnQtc2l6ZTozcmVtO3BhZGRpbmc6OHB4IDAiPjA6MDAuMDA8L2Rpdj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InJvdyI+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1nbyIgaWQ9ImFkbWluLWdvLWJ0biIgb25jbGljaz0iYWRtaW5HbygpIj5HTzwvYnV0dG9uPgogICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJhZG1pblJlY2FsbCgpIj5SRUNBTEw8L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InJvdyBtdC04Ij4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iYWRtaW5DbGVhcigpIj5DTEVBUiBTUExJVFM8L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iYWRtaW5BYmFuZG9uKCkiPkFCQU5ET048L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InJvdyBtdC04Ij4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iYWRtaW5SZW5hbWVMYW5lcygpIiBzdHlsZT0iZmxleDoxIj48c3ZnIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0eWxlPSJ2ZXJ0aWNhbC1hbGlnbjptaWRkbGU7bWFyZ2luLXJpZ2h0OjRweCI+PHBhdGggZD0iTTExIDRINGEyIDIgMCAwIDAtMiAydjE0YTIgMiAwIDAgMCAyIDJoMTRhMiAyIDAgMCAwIDItMnYtNyIvPjxwYXRoIGQ9Ik0xOC41IDIuNWEyLjEyMSAyLjEyMSAwIDAgMSAzIDNMMTIgMTVsLTQgMSAxLTQgOS41LTkuNXoiLz48L3N2Zz4gRWRpdCBOYW1lczwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgICAgPGhyIGNsYXNzPSJkaXZpZGVyIj4KICAgICAgPGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+TGl2ZSBTcGxpdHM8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0idGV4dC14cyB0ZXh0LW11dGVkIiBzdHlsZT0icGFkZGluZzowIDRweCA4cHg7bGluZS1oZWlnaHQ6MS40OyI+UHVibGlzaGVkIHRpbWUgPSA8c3Ryb25nPnRyaW1tZWQgbWVhbjwvc3Ryb25nPi4gMysgdGltZXJzOiBkcm9wIGZhc3Rlc3QgJmFtcDsgc2xvd2VzdCwgbWVhbiB0aGUgcmVzdC4gMiB0aW1lcnM6IHBsYWluIG1lYW4uIDEgdGltZXI6IHRoYXQgdmFsdWUuPC9kaXY+CiAgICAgIDxkaXYgaWQ9ImFkbWluLXNwbGl0cy1saXN0Ij48L2Rpdj4KICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IG10LTE2IGhpZGRlbiIgaWQ9ImFkbWluLXB1Ymxpc2gtYnRuIiBvbmNsaWNrPSJhZG1pblB1Ymxpc2goKSI+PHN2ZyB3aWR0aD0nMjInIGhlaWdodD0nMjInIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSdjdXJyZW50Q29sb3InIHN0cm9rZS13aWR0aD0nMicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBhcmlhLWhpZGRlbj0ndHJ1ZScgc3R5bGU9J3ZlcnRpY2FsLWFsaWduOm1pZGRsZSc+PHJlY3QgeD0nOCcgeT0nMicgd2lkdGg9JzgnIGhlaWdodD0nNCcgcng9JzEnIHJ5PScxJy8+PHBhdGggZD0nTTE2IDRoMmEyIDIgMCAwIDEgMiAydjE0YTIgMiAwIDAgMS0yIDJINmEyIDIgMCAwIDEtMi0yVjZhMiAyIDAgMCAxIDItMmgyJy8+PC9zdmc+IFB1Ymxpc2ggUmVzdWx0czwvYnV0dG9uPgogICAgICA8ZGl2IGlkPSJhZG1pbi1leHBvcnQtYnRucyIgY2xhc3M9ImhpZGRlbiIgc3R5bGU9ImRpc3BsYXk6bm9uZTtnYXA6OHB4O21hcmdpbi10b3A6OHB4Ij4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9ImZsZXg6MSIgb25jbGljaz0iYWRtaW5FeHBvcnRDU1YoKSI+4qyHIEV4cG9ydCBDU1Y8L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9ImZsZXg6MSIgb25jbGljaz0iYWRtaW5QcmludFJlc3VsdHMoKSI+8J+WqCBQcmludDwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgoKICAgIDwhLS0gRG9uZSBwYW5lbCAtLT4KICAgIDxkaXYgaWQ9ImFkbWluLWRvbmUtcGFuZWwiIGNsYXNzPSJoaWRkZW4iPgogICAgICA8ZGl2IGNsYXNzPSJjYXJkIj4KICAgICAgICA8ZGl2IGNsYXNzPSJjYXJkLXRpdGxlIj5QdWJsaXNoZWQgUmVzdWx0czwvZGl2PgogICAgICAgIDxkaXYgaWQ9ImFkbWluLXJlc3VsdHMtbGlzdCI+PC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJyb3cgbXQtOCI+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IiBpZD0iYWRtaW4tZG9uZS1wdWJsaXNoLWJ0biIgb25jbGljaz0iYWRtaW5QdWJsaXNoRnJvbURvbmUoKSI+UHVibGlzaCBSZXN1bHRzPC9idXR0b24+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIG9uY2xpY2s9ImFkbWluTmV3UmFjZSgpIj4rIE5ldyBSYWNlPC9idXR0b24+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIG9uY2xpY2s9ImV4cG9ydENTVigpIj48c3ZnIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNSIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0eWxlPSJ2ZXJ0aWNhbC1hbGlnbjptaWRkbGU7bWFyZ2luLXJpZ2h0OjRweCI+PHBhdGggZD0iTTIxIDE1djRhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJ2LTQiLz48cG9seWxpbmUgcG9pbnRzPSI3IDEwIDEyIDE1IDE3IDEwIi8+PGxpbmUgeDE9IjEyIiB5MT0iMTUiIHgyPSIxMiIgeTI9IjMiLz48L3N2Zz4gRXhwb3J0IENTVjwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogIDwvZGl2Pgo8L2Rpdj4KCjwhLS0g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCiAgICAgU0NSRUVOOiBTVEFSVEVSCuKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkCAtLT4KPGRpdiBpZD0ic2NyZWVuLXN0YXJ0ZXIiIGNsYXNzPSJzY3JlZW4iPgogIDxkaXYgY2xhc3M9ImhlYWRlciI+CiAgICA8ZGl2IGNsYXNzPSJjb25uLWRvdCIgaWQ9InN0YXJ0ZXItZG90Ij48L2Rpdj48c3BhbiBpZD0ic3RhcnRlci1kb3QtbGJsIiBzdHlsZT0iZm9udC1zaXplOjAuNjVyZW07Zm9udC13ZWlnaHQ6NzAwO2xldHRlci1zcGFjaW5nOi4wNWVtO2NvbG9yOnZhcigtLW11dGVkKSI+PC9zcGFuPgogICAgPGRpdiBjbGFzcz0iaGVhZGVyLXRpdGxlIj5TdGFydGVyPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJoZWFkZXItcmlnaHQiPjxzcGFuIGlkPSJzdGFydGVyLWV2ZW50LWxibCIgY2xhc3M9InRleHQtbXV0ZWQgdGV4dC14cyI+PC9zcGFuPjwvZGl2PgogIDwvZGl2PgogIDxkaXYgY2xhc3M9ImNvbnRlbnQiPgogICAgPGRpdiBpZD0ic3RhcnRlci13YWl0aW5nIiBjbGFzcz0idGV4dC1jZW50ZXIiIHN0eWxlPSJwYWRkaW5nLXRvcDo2MHB4Ij4KICAgICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjMuNXJlbSI+PHN2ZyB3aWR0aD0nMjInIGhlaWdodD0nMjInIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSdjdXJyZW50Q29sb3InIHN0cm9rZS13aWR0aD0nMicgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBhcmlhLWhpZGRlbj0ndHJ1ZScgc3R5bGU9J3ZlcnRpY2FsLWFsaWduOm1pZGRsZSc+PHBhdGggZD0nTTYgOGE2IDYgMCAwIDEgMTIgMGMwIDcgMyA5IDMgOUgzczMtMiAzLTknLz48cGF0aCBkPSdNMTAuMyAyMWExLjk0IDEuOTQgMCAwIDAgMy40IDAnLz48L3N2Zz48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0idGV4dC1tdXRlZCBtdC0xNiI+V2FpdGluZyBmb3IgUmFjZSBDb250cm9sIHRvIGFybS4uLjwvZGl2PgogICAgPC9kaXY+CiAgICA8ZGl2IGlkPSJzdGFydGVyLWFybWVkIiBjbGFzcz0iaGlkZGVuIj4KICAgICAgPGRpdiBjbGFzcz0iY2FyZCB0ZXh0LWNlbnRlciI+CiAgICAgICAgPGRpdiBpZD0ic3RhcnRlci1yYWNlLWluZm8iIGNsYXNzPSJ0ZXh0LW11dGVkIHRleHQtc20iPjwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImNsb2NrIG10LTgiIGlkPSJzdGFydGVyLWNsb2NrIj4wOjAwLjAwPC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPCEtLSBHdW4gZGV0ZWN0aW9uIHBhbmVsIC0tPgogICAgICA8ZGl2IHN0eWxlPSJtYXJnaW4tdG9wOjE2cHg7cGFkZGluZzoxNnB4O2JhY2tncm91bmQ6dmFyKC0tc3VyZmFjZS0yKTtib3JkZXItcmFkaXVzOjEycHgiPgogICAgICAgIDwhLS0gSWRsZSBzdGF0ZSAtLT4KICAgICAgICA8ZGl2IGlkPSJzdGFydGVyLWxpc3Rlbi1pZGxlIj4KICAgICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtc2l6ZTowLjhyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO3RleHQtYWxpZ246Y2VudGVyO21hcmdpbi1ib3R0b206MTJweCI+UG9pbnQgbWljIHRvd2FyZCB0aGUgc3RhcnRpbmcgcGlzdG9sPC9kaXY+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIHN0eWxlPSJ3aWR0aDoxMDAlO2ZvbnQtc2l6ZToxLjFyZW07cGFkZGluZzoxNnB4IiBvbmNsaWNrPSJzdGFydGVyTGlzdGVuU3RhcnQoKSI+CiAgICAgICAgICAgIPCfjpnvuI8gTGlzdGVuIGZvciBHdW4KICAgICAgICAgIDwvYnV0dG9uPgogICAgICAgIDwvZGl2PgogICAgICAgIDwhLS0gTGlzdGVuaW5nIHN0YXRlIC0tPgogICAgICAgIDxkaXYgaWQ9InN0YXJ0ZXItbGlzdGVuLWFjdGl2ZSIgY2xhc3M9ImhpZGRlbiI+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7bWFyZ2luLWJvdHRvbToxMHB4Ij4KICAgICAgICAgICAgPGRpdiBzdHlsZT0id2lkdGg6MTBweDtoZWlnaHQ6MTBweDtib3JkZXItcmFkaXVzOjUwJTtiYWNrZ3JvdW5kOiNlZjQ0NDQ7YW5pbWF0aW9uOnZmLXB1bHNlIDAuOHMgaW5maW5pdGU7ZmxleC1zaHJpbms6MCI+PC9kaXY+CiAgICAgICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtc2l6ZTowLjlyZW07Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOiNlZjQ0NDQ7ZmxleDoxIj5MaXN0ZW5pbmfigKY8L2Rpdj4KICAgICAgICAgICAgPGRpdiBpZD0ic3RhcnRlci1jYWwtbGJsIiBzdHlsZT0iZm9udC1zaXplOjAuNzJyZW07Y29sb3I6dmFyKC0tbXV0ZWQpIj5DYWxpYnJhdGluZzwvZGl2PgogICAgICAgICAgPC9kaXY+CiAgICAgICAgICA8IS0tIFZvbHVtZSBiYXIgLS0+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpO2JvcmRlci1yYWRpdXM6NHB4O2hlaWdodDoxNHB4O292ZXJmbG93OmhpZGRlbjttYXJnaW4tYm90dG9tOjEwcHgiPgogICAgICAgICAgICA8ZGl2IGlkPSJzdGFydGVyLXZvbC1iYXIiIHN0eWxlPSJoZWlnaHQ6MTAwJTt3aWR0aDowJTtiYWNrZ3JvdW5kOnZhcigtLWFjY2VudCk7Ym9yZGVyLXJhZGl1czo0cHg7dHJhbnNpdGlvbjp3aWR0aCAwLjA0cyI+PC9kaXY+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDwhLS0gU2Vuc2l0aXZpdHkgLS0+CiAgICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo2cHg7bWFyZ2luLWJvdHRvbToxMnB4Ij4KICAgICAgICAgICAgPHNwYW4gc3R5bGU9ImZvbnQtc2l6ZTowLjc1cmVtO2NvbG9yOnZhcigtLW11dGVkKSI+U2Vuc2l0aXZpdHk6PC9zcGFuPgogICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9ImZvbnQtc2l6ZTowLjc1cmVtO3BhZGRpbmc6NHB4IDEwcHgiIGRhdGEtc2Vucz0iaGlnaCIgb25jbGljaz0ic3RhcnRlclNldFNlbnMoJ2hpZ2gnKSI+SGlnaDwvYnV0dG9uPgogICAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiICAgc3R5bGU9ImZvbnQtc2l6ZTowLjc1cmVtO3BhZGRpbmc6NHB4IDEwcHgiIGRhdGEtc2Vucz0ibWVkIiAgb25jbGljaz0ic3RhcnRlclNldFNlbnMoJ21lZCcpIj5NZWQ8L2J1dHRvbj4KICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJmb250LXNpemU6MC43NXJlbTtwYWRkaW5nOjRweCAxMHB4IiBkYXRhLXNlbnM9ImxvdyIgIG9uY2xpY2s9InN0YXJ0ZXJTZXRTZW5zKCdsb3cnKSI+TG93PC9idXR0b24+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDtnYXA6OHB4Ij4KICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJmbGV4OjE7Zm9udC1zaXplOjAuODVyZW0iIG9uY2xpY2s9InN0YXJ0ZXJMaXN0ZW5TdG9wKCkiPlN0b3AgTGlzdGVuaW5nPC9idXR0b24+CiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBzdHlsZT0iZm9udC1zaXplOjAuODVyZW07cGFkZGluZzo4cHggMTJweCIgdGl0bGU9IlJlY2FsaWJyYXRlIG5vaXNlIGZsb29yIiBvbmNsaWNrPSJzdGFydGVyUmVjYWxpYnJhdGUoKSI+4oa6IFJlY2FsPC9idXR0b24+CiAgICAgICAgICA8L2Rpdj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CgogICAgICA8IS0tIE1hbnVhbCBmYWxsYmFjayArIHJlY2FsbCAtLT4KICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDo4cHg7bWFyZ2luLXRvcDoxMnB4Ij4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9ImZsZXg6MTtmb250LXNpemU6MC44NXJlbSIgaWQ9InN0YXJ0ZXItZ28tYnRuIiBvbmNsaWNrPSJzdGFydGVyR28oKSI+TWFudWFsIEdPPC9idXR0b24+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJmbGV4OjE7Zm9udC1zaXplOjAuODVyZW07Y29sb3I6dmFyKC0tZGFuZ2VyKTtib3JkZXItY29sb3I6dmFyKC0tZGFuZ2VyKSIgb25jbGljaz0ic3RhcnRlclJlY2FsbCgpIj5SRUNBTEw8L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICA8L2Rpdj4KICA8L2Rpdj4KPC9kaXY+Cgo8IS0tIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAogICAgIFNDUkVFTjogT0JTRVJWRVIgKExhbmUgUmFjZSkK4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQIC0tPgo8ZGl2IGlkPSJzY3JlZW4tb2JzZXJ2ZXIiIGNsYXNzPSJzY3JlZW4iPgogIDxkaXYgY2xhc3M9ImhlYWRlciI+CiAgICA8ZGl2IGNsYXNzPSJjb25uLWRvdCIgaWQ9Im9ic2VydmVyLWRvdCI+PC9kaXY+PHNwYW4gaWQ9Im9ic2VydmVyLWRvdC1sYmwiIHN0eWxlPSJmb250LXNpemU6MC42NXJlbTtmb250LXdlaWdodDo3MDA7bGV0dGVyLXNwYWNpbmc6LjA1ZW07Y29sb3I6dmFyKC0tbXV0ZWQpIj48L3NwYW4+CiAgICA8ZGl2IGNsYXNzPSJoZWFkZXItdGl0bGUiPkxpdmUgUmVzdWx0czwvZGl2PgogICAgPGRpdiBjbGFzcz0iaGVhZGVyLXJpZ2h0Ij48c3BhbiBpZD0ib2JzZXJ2ZXItZXZlbnQtbGJsIiBjbGFzcz0idGV4dC1tdXRlZCB0ZXh0LXhzIj48L3NwYW4+PC9kaXY+CiAgPC9kaXY+CiAgPGRpdiBjbGFzcz0iY29udGVudCI+CiAgICA8ZGl2IGNsYXNzPSJjbG9jayIgaWQ9Im9ic2VydmVyLWNsb2NrIiBzdHlsZT0iZm9udC1zaXplOjIuOHJlbSI+MDowMC4wMDwvZGl2PgogICAgPGRpdiBpZD0ib2JzZXJ2ZXItbGFuZXMtbGlzdCI+PC9kaXY+CiAgICA8ZGl2IGlkPSJvYnNlcnZlci13YWl0aW5nIiBjbGFzcz0idGV4dC1jZW50ZXIgdGV4dC1tdXRlZCBtdC0zMiI+CiAgICAgIDxkaXYgc3R5bGU9Im9wYWNpdHk6MC4zNTttYXJnaW4tYm90dG9tOjhweCI+PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik01IDEyLjU1YTExIDExIDAgMCAxIDE0LjA4IDAiLz48cGF0aCBkPSJNMS40MiA5YTE2IDE2IDAgMCAxIDIxLjE2IDAiLz48cGF0aCBkPSJNOC41MyAxNi4xMWE2IDYgMCAwIDEgNi45NSAwIi8+PGxpbmUgeDE9IjEyIiB5MT0iMjAiIHgyPSIxMiIgeTI9IjIwIi8+PC9zdmc+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9Im10LTgiPldhaXRpbmcgZm9yIG5leHQgcmFjZS4uLjwvZGl2PgogICAgPC9kaXY+CiAgPC9kaXY+CjwvZGl2PgoKPCEtLSDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKICAgICBTQ1JFRU46IFhDIE1BUlNIQUwK4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQIC0tPgo8ZGl2IGlkPSJzY3JlZW4tbWFyc2hhbCIgY2xhc3M9InNjcmVlbiI+CiAgPGRpdiBjbGFzcz0iaGVhZGVyIj4KICAgIDxkaXYgY2xhc3M9ImNvbm4tZG90IiBpZD0ibWFyc2hhbC1kb3QiPjwvZGl2PjxzcGFuIGlkPSJtYXJzaGFsLWRvdC1sYmwiIHN0eWxlPSJmb250LXNpemU6MC42NXJlbTtmb250LXdlaWdodDo3MDA7bGV0dGVyLXNwYWNpbmc6LjA1ZW07Y29sb3I6dmFyKC0tbXV0ZWQpIj48L3NwYW4+CiAgICA8ZGl2IGNsYXNzPSJoZWFkZXItdGl0bGUiPkZpbmlzaCBNYXJzaGFsPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJoZWFkZXItcmlnaHQiPjxzcGFuIGlkPSJtYXJzaGFsLWV2ZW50LWxibCIgY2xhc3M9InRleHQteHMgdGV4dC1tdXRlZCI+PC9zcGFuPjwvZGl2PgogIDwvZGl2PgogIDxkaXYgY2xhc3M9ImNvbnRlbnQiIHN0eWxlPSJwYWRkaW5nOjAiPgogICAgPCEtLSBXQUlUSU5HIC0tPgogICAgPGRpdiBpZD0ibWFyc2hhbC13YWl0aW5nIiBjbGFzcz0idGV4dC1jZW50ZXIiIHN0eWxlPSJwYWRkaW5nOjYwcHggMjBweCAwIj4KICAgICAgPGRpdiBpZD0ibWFyc2hhbC13YWl0LW1zZyIgY2xhc3M9InRleHQtbXV0ZWQgbXQtMTYiPldhaXRpbmcgZm9yIHJhY2UgdG8gc3RhcnQuLi48L2Rpdj4KICAgIDwvZGl2PgoKICAgIDwhLS0gTElWRSAtLT4KICAgIDxkaXYgaWQ9Im1hcnNoYWwtbGl2ZSIgY2xhc3M9ImhpZGRlbiIgc3R5bGU9ImRpc3BsYXk6ZmxleDtmbGV4LWRpcmVjdGlvbjpjb2x1bW47aGVpZ2h0OjEwMCUiPgogICAgICAKICAgICAgPCEtLSBBdXRvLWRldGVjdCB0b2dnbGUgYmFyIC0tPgogICAgICA8ZGl2IGlkPSJ4Yy1hdXRvLWJhciIgc3R5bGU9ImRpc3BsYXk6bm9uZSIgY2xhc3M9InhjLWRldGVjdC1iYXIiPgogICAgICAgIDxkaXYgY2xhc3M9InhjLWRldGVjdC1wdWxzZSI+PC9kaXY+CiAgICAgICAgPGRpdiBzdHlsZT0iZmxleDoxO2ZvbnQtc2l6ZTouODVyZW07Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOnZhcigtLXRleHQpIiBpZD0ieGMtZGV0ZWN0LXN0YXR1cyI+U2V0dGluZyB1cOKApjwvZGl2PgogICAgICAgIDxpbnB1dCB0eXBlPSJyYW5nZSIgaWQ9InhjLXNlbnNpdGl2aXR5IiBtaW49IjgiIG1heD0iNTUiIHZhbHVlPSIyMiIKICAgICAgICAgIHN0eWxlPSJ3aWR0aDo3MHB4IiB0aXRsZT0iU2Vuc2l0aXZpdHkiCiAgICAgICAgICBvbmlucHV0PSJ4Y0RpZmZUaHJlc2hvbGQ9K3RoaXMudmFsdWU7ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLXNlbnMtdmFsJykudGV4dENvbnRlbnQ9dGhpcy52YWx1ZSIKICAgICAgICAgID4KICAgICAgICA8c3BhbiBpZD0ieGMtc2Vucy12YWwiIHN0eWxlPSJmb250LXNpemU6LjdyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO21pbi13aWR0aDoxOHB4Ij4yMjwvc3Bhbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSBidG4tc20iIG9uY2xpY2s9InhjU3RvcEF1dG9Nb2RlKCkiIHN0eWxlPSJmb250LXNpemU6LjdyZW0iPuKclSBPZmY8L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICAgIDwhLS0gQXV0by1kZXRlY3QgbW9kZSBidXR0b24gLS0+CiAgICAgIDxidXR0b24gaWQ9InhjLWF1dG8tbW9kZS1idG4iIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSBidG4tc20iCiAgICAgICAgc3R5bGU9IndpZHRoOjEwMCU7Ym9yZGVyLXJhZGl1czowO2JvcmRlci1sZWZ0Om5vbmU7Ym9yZGVyLXJpZ2h0Om5vbmU7Ym9yZGVyLXRvcDpub25lO3BhZGRpbmc6OHB4O2ZvbnQtc2l6ZTouOHJlbSIKICAgICAgICBvbmNsaWNrPSJ4Y1N0YXJ0QXV0b01vZGUoKSI+8J+OryBTd2l0Y2ggdG8gQXV0by1EZXRlY3QgKG5vIHRhcHBpbmcpPC9idXR0b24+CiAgICAgIDwhLS0gQmlnIHRhcCBidXR0b24g4oCUIGFsd2F5cyB2aXNpYmxlLCBhbHdheXMgdGFwcGFibGUgLS0+CiAgICAgIDxidXR0b24gY2xhc3M9ImJ0bi10YXAiIGlkPSJtYXJzaGFsLXRhcC1idG4iIG9uY2xpY2s9Im1hcnNoYWxUYXAoKSIKICAgICAgICBzdHlsZT0iZmxleC1zaHJpbms6MDtib3JkZXItcmFkaXVzOjA7bWFyZ2luOjA7d2lkdGg6MTAwJSI+CiAgICAgICAgPHNwYW4gY2xhc3M9InRhcC1tYWluIiBpZD0ibWFyc2hhbC1jbG9jay1taW5pIj4wOjAwLjAwPC9zcGFuPgogICAgICAgIDxzcGFuIGNsYXNzPSJ0YXAtc3ViIj5UQVAgRklOSVNIPC9zcGFuPgogICAgICA8L2J1dHRvbj4KCiAgICAgIDwhLS0gRmluaXNoZXIgbGlzdCAtLT4KICAgICAgPGRpdiBzdHlsZT0iZmxleDoxO292ZXJmbG93LXk6YXV0bztwYWRkaW5nOjEwcHggMTZweCIgaWQ9Im1hcnNoYWwtZmluaXNoZXMtd3JhcCI+CiAgICAgICAgPGRpdiBpZD0ibWFyc2hhbC1maW5pc2hlcy1saXN0Ij48L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJ0ZXh0LWNlbnRlciBtdC04Ij4KICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4taWNvbiBidG4tc20iIG9uY2xpY2s9Im1hcnNoYWxVbmRvKCkiPuKGqSBVbmRvIGxhc3Q8L2J1dHRvbj4KICAgICAgICA8L2Rpdj4KICAgICAgPC9kaXY+CgogICAgICA8IS0tIElubGluZSBiaWIgbnVtcGFkIC0tPgogICAgICA8ZGl2IGlkPSJtYXJzaGFsLWJpYi1wYWQiIGNsYXNzPSJoaWRkZW4iCiAgICAgICAgc3R5bGU9ImZsZXgtc2hyaW5rOjA7cGFkZGluZzoxNHB4IDE2cHggMTZweDtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UtMik7Ym9yZGVyLXRvcDoycHggc29saWQgdmFyKC0tYWNjZW50KSI+CiAgICAgICAgPCEtLSBGaW5pc2ggcGhvdG8gcHJldmlldyAtLT4KICAgICAgICA8ZGl2IGNsYXNzPSJmaW5pc2gtcGhvdG8td3JhcCIgaWQ9ImZpbmlzaC1waG90by13cmFwIj4KICAgICAgICAgIDxkaXYgY2xhc3M9ImZpbmlzaC1waG90by1jYXB0dXJpbmciIGlkPSJmaW5pc2gtcGhvdG8tc3RhdHVzIj7wn5O3IENhcHR1cmluZ+KApjwvZGl2PgogICAgICAgICAgPGltZyBpZD0iZmluaXNoLXBob3RvLWltZyIgc3JjPSIiIHN0eWxlPSJkaXNwbGF5Om5vbmUiPgogICAgICAgIDwvZGl2PgogICAgICAgIDwhLS0gQmliIGxhYmVsICsgT0NSIHJvdyAtLT4KICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7bWFyZ2luLWJvdHRvbTo0cHgiPgogICAgICAgICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjAuODJyZW07Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOnZhcigtLXRleHQpO2ZsZXg6MSIKICAgICAgICAgICAgaWQ9Im1hcnNoYWwtYmliLWZvciI+RW50ZXIgYmliIGZvciAxc3QgcGxhY2U8L2Rpdj4KICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IGJ0bi1zbSIgaWQ9Im9jci1idG4iIG9uY2xpY2s9InJ1bkJpYk9DUigpIiBzdHlsZT0iZmxleC1zaHJpbms6MDtmb250LXNpemU6MC43MnJlbSI+8J+UjSBBdXRvPC9idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjIuMnJlbTtmb250LXdlaWdodDo3MDA7Y29sb3I6dmFyKC0tYWNjZW50KTtsZXR0ZXItc3BhY2luZzowLjEyZW07bWluLWhlaWdodDoyLjZyZW07bWFyZ2luLWJvdHRvbTo4cHgiCiAgICAgICAgICBpZD0ibWFyc2hhbC1iaWItZGlzcGxheSI+XzwvZGl2PgogICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6cmVwZWF0KDMsMWZyKTtnYXA6NnB4O21heC13aWR0aDoyODBweCI+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtIiBvbmNsaWNrPSJiaWJEaWdpdCgnMScpIj4xPC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtIiBvbmNsaWNrPSJiaWJEaWdpdCgnMicpIj4yPC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtIiBvbmNsaWNrPSJiaWJEaWdpdCgnMycpIj4zPC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtIiBvbmNsaWNrPSJiaWJEaWdpdCgnNCcpIj40PC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtIiBvbmNsaWNrPSJiaWJEaWdpdCgnNScpIj41PC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtIiBvbmNsaWNrPSJiaWJEaWdpdCgnNicpIj42PC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtIiBvbmNsaWNrPSJiaWJEaWdpdCgnNycpIj43PC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtIiBvbmNsaWNrPSJiaWJEaWdpdCgnOCcpIj44PC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtIiBvbmNsaWNrPSJiaWJEaWdpdCgnOScpIj45PC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtO2NvbG9yOnZhcigtLWRhbmdlcikiIG9uY2xpY2s9ImJpYkJhY2soKSI+4oyrPC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9InBhZGRpbmc6MTRweDtmb250LXNpemU6MS4xcmVtIiBvbmNsaWNrPSJiaWJEaWdpdCgnMCcpIj4wPC9idXR0b24+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIHN0eWxlPSJwYWRkaW5nOjE0cHg7Zm9udC1zaXplOjEuMXJlbSIgb25jbGljaz0iYmliQ29uZmlybSgpIj7inJM8L2J1dHRvbj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSBidG4tc20iIHN0eWxlPSJ3aWR0aDoxMDAlO21heC13aWR0aDoyODBweDttYXJnaW4tdG9wOjhweCIgb25jbGljaz0iYmliU2tpcCgpIj5Ta2lwIOKAlCBiaWIgdW5rbm93bjwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgogIDwvZGl2Pgo8L2Rpdj4KCjwhLS0g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCiAgICAgU0NSRUVOOiBYQyBBRE1JTgrilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgLS0+CjxkaXYgaWQ9InNjcmVlbi1hZG1pbi14YyIgY2xhc3M9InNjcmVlbiI+CiAgPGRpdiBjbGFzcz0iaGVhZGVyIj4KICAgIDxkaXYgY2xhc3M9ImNvbm4tZG90IiBpZD0ieGMtYWRtaW4tZG90Ij48L2Rpdj48c3BhbiBpZD0ieGMtYWRtaW4tZG90LWxibCIgc3R5bGU9ImZvbnQtc2l6ZTowLjY1cmVtO2ZvbnQtd2VpZ2h0OjcwMDtsZXR0ZXItc3BhY2luZzouMDVlbTtjb2xvcjp2YXIoLS1tdXRlZCkiPjwvc3Bhbj4KICAgIDxkaXYgY2xhc3M9ImhlYWRlci10aXRsZSI+WEMgUmFjZSBDb250cm9sPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJoZWFkZXItcmlnaHQiPjxzcGFuIGNsYXNzPSJ0ZXh0LXhzIHRleHQtbXV0ZWQiIGlkPSJ4Yy1hZG1pbi1zY2hvb2wtbGJsIj48L3NwYW4+PC9kaXY+CiAgPC9kaXY+CiAgPGRpdiBjbGFzcz0iY29udGVudCI+CgogICAgPCEtLSBTZXR1cCAtLT4KICAgIDxkaXYgaWQ9InhjLXNldHVwLXBhbmVsIj4KICAgICAgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+UmFjZSBTZXR1cDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAiPgogICAgICAgICAgPGxhYmVsPkFnZSBHcm91cDwvbGFiZWw+CiAgICAgICAgICA8c2VsZWN0IGlkPSJ4Yy1hZ2Utc2VsIj48L3NlbGVjdD4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJmb3JtLWdyb3VwIj4KICAgICAgICAgIDxsYWJlbD5HZW5kZXI8L2xhYmVsPgogICAgICAgICAgPGRpdiBjbGFzcz0icGlsbC1yb3ciPgogICAgICAgICAgICA8ZGl2IGNsYXNzPSJwaWxsIGFjdGl2ZSIgZGF0YS14Y2c9ImJveXMiIG9uY2xpY2s9InNlbGVjdFhDR2VuZGVyKCdib3lzJykiPkJveXM8L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0icGlsbCIgZGF0YS14Y2c9ImdpcmxzIiBvbmNsaWNrPSJzZWxlY3RYQ0dlbmRlcignZ2lybHMnKSI+R2lybHM8L2Rpdj4KICAgICAgICAgICAgPGRpdiBjbGFzcz0icGlsbCIgZGF0YS14Y2c9Im1peGVkIiBvbmNsaWNrPSJzZWxlY3RYQ0dlbmRlcignbWl4ZWQnKSI+TWl4ZWQ8L2Rpdj4KICAgICAgICAgIDwvZGl2PgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImZvcm0tZ3JvdXAgbWItMCI+CiAgICAgICAgICA8bGFiZWw+UmFjZSAvIERpc3RhbmNlPC9sYWJlbD4KICAgICAgICAgIDxzZWxlY3QgaWQ9InhjLWV2ZW50LXNlbCI+PC9zZWxlY3Q+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIG9uY2xpY2s9InhjQWRtaW5Bcm0oKSI+QVJNIFJBQ0Ug4oaSPC9idXR0b24+CiAgICA8L2Rpdj4KCiAgICA8IS0tIExpdmUgLS0+CiAgICA8ZGl2IGlkPSJ4Yy1saXZlLXBhbmVsIiBjbGFzcz0iaGlkZGVuIj4KICAgICAgPGRpdiBjbGFzcz0iY2FyZCI+CiAgICAgICAgPGRpdiBjbGFzcz0iZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTgiIHN0eWxlPSJtYXJnaW4tYm90dG9tOjZweCI+CiAgICAgICAgICA8ZGl2IGlkPSJ4Yy1yYWNlLWxibCIgc3R5bGU9ImZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MS4wNXJlbTtmbGV4OjEiPjwvZGl2PgogICAgICAgICAgPHNwYW4gaWQ9InhjLXN0YXRlLWJhZGdlIiBjbGFzcz0iYmFkZ2UgYmFkZ2UtYXJtZWQiPkFSTUVEPC9zcGFuPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImNsb2NrIiBpZD0ieGMtYWRtaW4tY2xvY2siIHN0eWxlPSJmb250LXNpemU6M3JlbTtwYWRkaW5nOjhweCAwIj4wOjAwLjAwPC9kaXY+CiAgICAgIDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJyb3ciPgogICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tZ28iIGlkPSJ4Yy1nby1idG4iIG9uY2xpY2s9InhjQWRtaW5HbygpIj5HTzwvYnV0dG9uPgogICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJ4Y0FkbWluUmVjYWxsKCkiPlJFQ0FMTDwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icm93IG10LTgiPgogICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBvbmNsaWNrPSJ4Y0FkbWluQWJhbmRvbigpIj5BQkFORE9OPC9idXR0b24+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IGhpZGRlbiIgaWQ9InhjLXB1Ymxpc2gtYnRuIiBvbmNsaWNrPSJ4Y0FkbWluUHVibGlzaCgpIj48c3ZnIHdpZHRoPScyMicgaGVpZ2h0PScyMicgdmlld0JveD0nMCAwIDI0IDI0JyBmaWxsPSdub25lJyBzdHJva2U9J2N1cnJlbnRDb2xvcicgc3Ryb2tlLXdpZHRoPScyJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIGFyaWEtaGlkZGVuPSd0cnVlJyBzdHlsZT0ndmVydGljYWwtYWxpZ246bWlkZGxlJz48cmVjdCB4PSc4JyB5PScyJyB3aWR0aD0nOCcgaGVpZ2h0PSc0JyByeD0nMScgcnk9JzEnLz48cGF0aCBkPSdNMTYgNGgyYTIgMiAwIDAgMSAyIDJ2MTRhMiAyIDAgMCAxLTIgMkg2YTIgMiAwIDAgMS0yLTJWNmEyIDIgMCAwIDEgMi0yaDInLz48L3N2Zz4gUHVibGlzaCBSZXN1bHRzPC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgICA8aHIgY2xhc3M9ImRpdmlkZXIiPgogICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDoxMHB4O21hcmdpbi1ib3R0b206MTBweCI+CiAgICAgICAgPGRpdiBjbGFzcz0iY2FyZC10aXRsZSIgc3R5bGU9Im1hcmdpbi1ib3R0b206MDtmbGV4OjEiPkZpbmlzaGVycyA8c3BhbiBpZD0ieGMtY291bnQtbGJsIiBjbGFzcz0idGV4dC1tdXRlZCB0ZXh0LXhzIj48L3NwYW4+PC9kaXY+CiAgICAgICAgPGxhYmVsIHN0eWxlPSJmb250LXNpemU6MC43OHJlbTtjb2xvcjp2YXIoLS1tdXRlZCk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4Ij4KICAgICAgICAgIPCfj4UgUXVhbCBzcG90cwogICAgICAgICAgPGlucHV0IHR5cGU9Im51bWJlciIgaWQ9InhjLXF1YWwtc3BvdHMiIHZhbHVlPSIxMCIgbWluPSIwIiBtYXg9Ijk5IgogICAgICAgICAgICBzdHlsZT0id2lkdGg6NTJweDtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UzKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7Ym9yZGVyLXJhZGl1czo2cHg7Y29sb3I6dmFyKC0tdGV4dCk7cGFkZGluZzozcHggNnB4O2ZvbnQtc2l6ZTowLjgycmVtO3RleHQtYWxpZ246Y2VudGVyIj4KICAgICAgICA8L2xhYmVsPgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBpZD0ieGMtZmluaXNoZXJzLWxpc3QiPjwvZGl2PgogICAgPC9kaXY+CiAgPC9kaXY+CjwvZGl2PgoKPCEtLSDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKICAgICBTQ1JFRU46IFhDIE9CU0VSVkVSCuKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkCAtLT4KPGRpdiBpZD0ic2NyZWVuLW9ic2VydmVyLXhjIiBjbGFzcz0ic2NyZWVuIj4KICA8ZGl2IGNsYXNzPSJoZWFkZXIiPgogICAgPGRpdiBjbGFzcz0iY29ubi1kb3QiIGlkPSJ4Yy1vYnNlcnZlci1kb3QiPjwvZGl2PgogICAgPGRpdiBjbGFzcz0iaGVhZGVyLXRpdGxlIj5YQyBMaXZlIFJlc3VsdHM8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImhlYWRlci1yaWdodCI+PHNwYW4gaWQ9InhjLW9ic2VydmVyLWV2ZW50LWxibCIgY2xhc3M9InRleHQteHMgdGV4dC1tdXRlZCI+PC9zcGFuPjwvZGl2PgogIDwvZGl2PgogIDxkaXYgY2xhc3M9ImNvbnRlbnQiPgogICAgPGRpdiBjbGFzcz0iY2xvY2siIGlkPSJ4Yy1vYnNlcnZlci1jbG9jayIgc3R5bGU9ImZvbnQtc2l6ZToyLjhyZW0iPjA6MDAuMDA8L2Rpdj4KICAgIDxkaXYgaWQ9InhjLW9ic2VydmVyLXBsYWNlcyI+PC9kaXY+CiAgICA8ZGl2IGlkPSJ4Yy1vYnNlcnZlci13YWl0aW5nIiBjbGFzcz0idGV4dC1jZW50ZXIgdGV4dC1tdXRlZCBtdC0zMiI+CiAgICAgIDxkaXYgc3R5bGU9ImZvbnQtc2l6ZToyLjVyZW0iPjxzdmcgd2lkdGg9JzIyJyBoZWlnaHQ9JzIyJyB2aWV3Qm94PScwIDAgMjQgMjQnIGZpbGw9J25vbmUnIHN0cm9rZT0nY3VycmVudENvbG9yJyBzdHJva2Utd2lkdGg9JzInIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgYXJpYS1oaWRkZW49J3RydWUnIHN0eWxlPSd2ZXJ0aWNhbC1hbGlnbjptaWRkbGUnPjxwYXRoIGQ9J00xMiAyMlY4TTUgOGw3LTYgNyA2TTMgMjJoMThNOSAyMlYxNmg2djYnLz48L3N2Zz48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibXQtOCI+V2FpdGluZyBmb3IgcmFjZSB0byBzdGFydC4uLjwvZGl2PgogICAgPC9kaXY+CiAgPC9kaXY+CjwvZGl2PgoKPCEtLSDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKICAgICBTQ1JFRU46IFZJREVPIEZJTklTSArilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgLS0+CjxkaXYgaWQ9InNjcmVlbi12aWRlby1maW5pc2giIGNsYXNzPSJzY3JlZW4iPgogIDxkaXYgY2xhc3M9ImhlYWRlciI+CiAgICA8ZGl2IGNsYXNzPSJjb25uLWRvdCIgaWQ9InZmLWRvdCI+PC9kaXY+PHNwYW4gaWQ9InZmLWRvdC1sYmwiIHN0eWxlPSJmb250LXNpemU6MC42NXJlbTtmb250LXdlaWdodDo3MDA7bGV0dGVyLXNwYWNpbmc6LjA1ZW07Y29sb3I6dmFyKC0tbXV0ZWQpIj48L3NwYW4+CiAgICA8ZGl2PgogICAgICA8ZGl2IGNsYXNzPSJoZWFkZXItdGl0bGUiPlZpZGVvIEZpbmlzaDwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJoZWFkZXItc3ViIiBpZD0idmYtaGVhZGVyLXN1YiI+V2FpdGluZyBmb3IgcmFjZeKApjwvZGl2PgogICAgPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJoZWFkZXItcmlnaHQiPgogICAgICA8c3BhbiBpZD0idmYtYmFkZ2UiIGNsYXNzPSJiYWRnZSIgc3R5bGU9ImRpc3BsYXk6bm9uZSI+PC9zcGFuPgogICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLWljb24gYnRuLXNtIiBvbmNsaWNrPSJ2ZkV4aXQoKSI+4oaQIEJhY2s8L2J1dHRvbj4KICAgIDwvZGl2PgogIDwvZGl2PgogIDxkaXYgY2xhc3M9ImNvbnRlbnQiPgoKICAgIDwhLS0gTElWRSBERVRFQ1RJT04gLS0+CiAgICA8ZGl2IGlkPSJ2Zi1jYXB0dXJlLXBhbmVsIj4KICAgICAgPCEtLSBDYW52YXMgc2hvd3MgbGl2ZSBjYW1lcmEgKyBsYW5lLXN0cmlwIG92ZXJsYXkgLS0+CiAgICAgIDxjYW52YXMgaWQ9InZmLWxpdmUtY2FudmFzIiBjbGFzcz0idmYtY2FudmFzIj48L2NhbnZhcz4KICAgICAgPHZpZGVvIGlkPSJ2Zi12aWRlby1wcmV2aWV3IiBzdHlsZT0iZGlzcGxheTpub25lIiBhdXRvcGxheSBtdXRlZCBwbGF5c2lubGluZT48L3ZpZGVvPgoKICAgICAgPCEtLSBTdGF0dXMgYmFyIC0tPgogICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7bWFyZ2luLXRvcDoxMHB4Ij4KICAgICAgICA8ZGl2IGlkPSJ2Zi1zdGF0dXMtZG90IiBzdHlsZT0id2lkdGg6MTBweDtoZWlnaHQ6MTBweDtib3JkZXItcmFkaXVzOjUwJTtiYWNrZ3JvdW5kOnZhcigtLW11dGVkKTtmbGV4LXNocmluazowIj48L2Rpdj4KICAgICAgICA8ZGl2IGlkPSJ2Zi1yYWNlLXN0YXR1cyIgc3R5bGU9ImZvbnQtc2l6ZTowLjg1cmVtO2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjp2YXIoLS10ZXh0KTtmbGV4OjEiPlN0YXJ0aW5nIGNhbWVyYeKApjwvZGl2PgogICAgICAgIDxkaXYgaWQ9InZmLWRldGVjdC1jb3VudCIgc3R5bGU9ImZvbnQtc2l6ZTowLjc4cmVtO2NvbG9yOnZhcigtLW11dGVkKSI+PC9kaXY+CiAgICAgIDwvZGl2PgoKICAgICAgPCEtLSBTZXR0aW5ncyAtLT4KICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDo4cHg7bWFyZ2luLXRvcDoxMnB4O2ZsZXgtd3JhcDp3cmFwO2FsaWduLWl0ZW1zOmNlbnRlciI+CiAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDo0cHgiPgogICAgICAgICAgPGJ1dHRvbiBpZD0idmYtbW9kZS1zd2ltLWJ0biIgY2xhc3M9ImJ0biBidG4tcHJpbWFyeSIgICAgc3R5bGU9ImZvbnQtc2l6ZTowLjhyZW07cGFkZGluZzo2cHggMTJweCIgb25jbGljaz0idmZTZXRNb2RlKCdzd2ltJykiPlN3aW08L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gaWQ9InZmLW1vZGUtdHJhY2stYnRuIiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJmb250LXNpemU6MC44cmVtO3BhZGRpbmc6NnB4IDEycHgiIG9uY2xpY2s9InZmU2V0TW9kZSgndHJhY2snKSI+VHJhY2s8L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gaWQ9InZmLWNhbS1mbGlwLWJ0biIgY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBzdHlsZT0iZm9udC1zaXplOjAuOHJlbTtwYWRkaW5nOjZweCAxMHB4IiB0aXRsZT0iU3dpdGNoIGZyb250L2JhY2sgY2FtZXJhIiBvbmNsaWNrPSJ2ZkZsaXBDYW1lcmEoKSI+8J+Tt+KGlTwvYnV0dG9uPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgaWQ9InZmLWxhbmUtcm93IiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDo0cHg7YWxpZ24taXRlbXM6Y2VudGVyIj4KICAgICAgICAgIDxzcGFuIHN0eWxlPSJmb250LXNpemU6MC43OHJlbTtjb2xvcjp2YXIoLS1tdXRlZCkiPkxhbmVzOjwvc3Bhbj4KICAgICAgICAgIDxidXR0b24gY2xhc3M9InZmLWxhbmUtYnRuIGFjdGl2ZSIgZGF0YS1sYW5lcz0iNCIgb25jbGljaz0idmZTZXRMYW5lcyg0KSI+NDwvYnV0dG9uPgogICAgICAgICAgPGJ1dHRvbiBjbGFzcz0idmYtbGFuZS1idG4iIGRhdGEtbGFuZXM9IjYiIG9uY2xpY2s9InZmU2V0TGFuZXMoNikiPjY8L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gY2xhc3M9InZmLWxhbmUtYnRuIiBkYXRhLWxhbmVzPSI4IiBvbmNsaWNrPSJ2ZlNldExhbmVzKDgpIj44PC9idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NnB4Ij4KICAgICAgICAgIDxzcGFuIHN0eWxlPSJmb250LXNpemU6MC43OHJlbTtjb2xvcjp2YXIoLS1tdXRlZCkiPlByb2dyZXNzIHRvcDwvc3Bhbj4KICAgICAgICAgIDxpbnB1dCB0eXBlPSJudW1iZXIiIGlkPSJ2Zi1wcm9ncmVzcy1pbnB1dCIgdmFsdWU9IjIiIG1pbj0iMSIgbWF4PSI4IgogICAgICAgICAgICBzdHlsZT0id2lkdGg6NDJweDtwYWRkaW5nOjRweCA2cHg7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlKTtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7Ym9yZGVyLXJhZGl1czo2cHg7Y29sb3I6dmFyKC0tdGV4dCk7Zm9udC1zaXplOjAuODVyZW07dGV4dC1hbGlnbjpjZW50ZXIiPgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj4KCiAgICAgIDwhLS0gT2Zmc2V0IC0tPgogICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7bWFyZ2luLXRvcDoxMHB4O3BhZGRpbmc6OHB4IDEwcHg7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlLTIpO2JvcmRlci1yYWRpdXM6OHB4Ij4KICAgICAgICA8ZGl2IHN0eWxlPSJmbGV4OjE7Zm9udC1zaXplOjAuNzZyZW07Y29sb3I6dmFyKC0tbXV0ZWQpIj5DYW1lcmEgbGFnIG9mZnNldCAobXMgc3VidHJhY3RlZCBmb3IgR0/ihpJkZXRlY3QgbGFnKTwvZGl2PgogICAgICAgIDxpbnB1dCB0eXBlPSJudW1iZXIiIGlkPSJ2Zi1vZmZzZXQtaW5wdXQiIHZhbHVlPSI3NSIgbWluPSIwIiBtYXg9Ijk5OSIKICAgICAgICAgIHN0eWxlPSJ3aWR0aDo1MnB4O3BhZGRpbmc6NHB4IDZweDtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tYm9yZGVyKTtib3JkZXItcmFkaXVzOjZweDtjb2xvcjp2YXIoLS10ZXh0KTtmb250LXNpemU6MC44NXJlbTt0ZXh0LWFsaWduOmNlbnRlciI+CiAgICAgIDwvZGl2PgoKICAgICAgPCEtLSBSZXN1bHRzIC0tPgogICAgICA8ZGl2IHN0eWxlPSJtYXJnaW4tdG9wOjE0cHgiPgogICAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47bWFyZ2luLWJvdHRvbTo4cHgiPgogICAgICAgICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjAuNzhyZW07Zm9udC13ZWlnaHQ6NzAwO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtsZXR0ZXItc3BhY2luZzouMDZlbTtjb2xvcjp2YXIoLS1tdXRlZCkiPkZpbmlzaGVzPC9kaXY+CiAgICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9ImZvbnQtc2l6ZTowLjcycmVtO3BhZGRpbmc6NHB4IDEwcHgiIG9uY2xpY2s9InZmTWFudWFsQWRkKCkiPisgQWRkIE1hbnVhbDwvYnV0dG9uPgogICAgICAgIDwvZGl2PgogICAgICAgIDxkaXYgaWQ9InZmLW1hcmstbGlzdCI+PGRpdiBjbGFzcz0idGV4dC1tdXRlZCB0ZXh0LXNtIHRleHQtY2VudGVyIG10LTgiPldhaXRpbmcgZm9yIHJhY2XigKY8L2Rpdj48L2Rpdj4KICAgICAgPC9kaXY+CgogICAgICA8IS0tIFB1Ymxpc2ggLS0+CiAgICAgIDxkaXYgc3R5bGU9Im1hcmdpbi10b3A6MTZweCI+CiAgICAgICAgPGJ1dHRvbiBpZD0idmYtcHVibGlzaC1idG4iIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIHN0eWxlPSJ3aWR0aDoxMDAlIiBvbmNsaWNrPSJ2ZlB1Ymxpc2goKSI+CiAgICAgICAgICBQdWJsaXNoIFRpbWVzIOKGkgogICAgICAgIDwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PgoKICA8L2Rpdj4KPC9kaXY+Cgo8IS0tIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAogICAgIFNDUkVFTjogSk9JTiBQQUdFIChRUikK4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQIC0tPgo8ZGl2IGlkPSJzY3JlZW4tc2hhcmUiIGNsYXNzPSJzY3JlZW4iPgogIDxkaXYgY2xhc3M9ImhlYWRlciI+CiAgICA8ZGl2IGNsYXNzPSJsb2dvLWJhZGdlIj5TUDwvZGl2PgogICAgPGRpdiBjbGFzcz0iaGVhZGVyLXRpdGxlIiBpZD0ic2hhcmUtc2Nob29sLW5hbWUiPkpvaW4gUGFnZTwvZGl2PgogICAgPGRpdiBjbGFzcz0iaGVhZGVyLXJpZ2h0Ij4KICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1pY29uIGJ0bi1zbSIgb25jbGljaz0iZW50ZXJSb2xlKCdyb2xlJykiPuKGkCBCYWNrPC9idXR0b24+CiAgICA8L2Rpdj4KICA8L2Rpdj4KICA8ZGl2IGNsYXNzPSJjb250ZW50IHRleHQtY2VudGVyIj4KICAgIDxkaXYgY2xhc3M9ImNhcmQiPgogICAgICA8ZGl2IGNsYXNzPSJjYXJkLXRpdGxlIj5TY2FuIHRvIEpvaW48L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0icXItd3JhcCI+PGRpdiBpZD0ic2hhcmUtcXIiIHN0eWxlPSJ3aWR0aDoxODBweDtoZWlnaHQ6MTgwcHg7cGFkZGluZzo4cHg7YmFja2dyb3VuZDojMTYxYjIyO2JvcmRlci1yYWRpdXM6NnB4OyI+PC9kaXY+PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InRleHQtbXV0ZWQgdGV4dC1zbSBtdC04IiBpZD0ic2hhcmUtY2Fybml2YWwtbmFtZSI+PC9kaXY+CiAgICA8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImNhcmQtdGl0bGUgdGV4dC1tdXRlZCBtdC04Ij5PciBlbnRlciB0aGlzIGNvZGU8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImpvaW4tY29kZSIgaWQ9InNoYXJlLWpvaW4tY29kZSI+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJ0ZXh0LW11dGVkIHRleHQteHMgbXQtOCI+T3BlbiBjYXJuaXZhbHRpbWluZy5jb20gYW5kIHRhcCAiSm9pbiBDYXJuaXZhbCI8L2Rpdj4KICA8L2Rpdj4KPC9kaXY+Cgo8IS0tIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAogICAgIFNDUkVFTjogUkVTVUxUUwrilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgLS0+CjxkaXYgaWQ9InNjcmVlbi1yZXN1bHRzIiBjbGFzcz0ic2NyZWVuIj4KICA8ZGl2IGNsYXNzPSJoZWFkZXIiPgogICAgPGRpdiBjbGFzcz0ibG9nby1iYWRnZSI+U1A8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImhlYWRlci10aXRsZSI+UmVzdWx0czwvZGl2PgogICAgPGRpdiBjbGFzcz0iaGVhZGVyLXJpZ2h0Ij4KICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1pY29uIGJ0bi1zbSIgb25jbGljaz0iZXhwb3J0Q1NWKCkiPjxzdmcgd2lkdGg9IjE1IiBoZWlnaHQ9IjE1IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9InZlcnRpY2FsLWFsaWduOm1pZGRsZTttYXJnaW4tcmlnaHQ6NHB4Ij48cGF0aCBkPSJNMjEgMTV2NGEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtNCIvPjxwb2x5bGluZSBwb2ludHM9IjcgMTAgMTIgMTUgMTcgMTAiLz48bGluZSB4MT0iMTIiIHkxPSIxNSIgeDI9IjEyIiB5Mj0iMyIvPjwvc3ZnPiBDU1Y8L2J1dHRvbj4KICAgIDwvZGl2PgogIDwvZGl2PgogIDxkaXYgY2xhc3M9ImNvbnRlbnQiPgogICAgPGRpdiBpZD0icmVzdWx0cy1hbGwiIGNsYXNzPSJ0ZXh0LW11dGVkIHRleHQtY2VudGVyIG10LTMyIj5Mb2FkaW5nLi4uPC9kaXY+CiAgPC9kaXY+CjwvZGl2PgoKPCEtLSDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKICAgICBPVkVSTEFZUwrilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgLS0+CjxkaXYgaWQ9ImNvdW50ZG93bi1vdmVybGF5Ij4KICA8ZGl2IGlkPSJjb3VudGRvd24tbnVtIiBzdHlsZT0iY29sb3I6dmFyKC0tdGV4dCkiPjM8L2Rpdj4KICA8ZGl2IGlkPSJjb3VudGRvd24tbGFiZWwiPkdldCBzZXQuLi48L2Rpdj4KPC9kaXY+Cgo8ZGl2IGlkPSJmbGFzaC1vdmVybGF5Ij48L2Rpdj4KPGRpdiBpZD0idGFwLWZsYXNoIj48L2Rpdj4KPGRpdiBpZD0idG9hc3QiPjwvZGl2PgoKPGRpdiBjbGFzcz0ibW9kYWwtYmFja2Ryb3AiIGlkPSJtb2RhbC1iZCI+CiAgPGRpdiBjbGFzcz0ibW9kYWwiPgogICAgPGRpdiBjbGFzcz0ibW9kYWwtdGl0bGUiIGlkPSJtb2RhbC10dGwiPjwvZGl2PgogICAgPGRpdiBjbGFzcz0ibW9kYWwtYm9keSIgaWQ9Im1vZGFsLWJkeSI+PC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJzdGFjayIgaWQ9Im1vZGFsLWJ0bnMtd3JhcCI+PC9kaXY+CiAgPC9kaXY+CjwvZGl2PgoKPCEtLSDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKICAgICBGSVJFQkFTRSBTREsK4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQIC0tPgo8c2NyaXB0PgogICAgLy8gSW5saW5lZCBRUkNvZGUgZ2VuZXJhdG9yIChkYXZpZHNoaW1qcy9xcmNvZGVqcyAxLjAuMCkg4oCUIG5vIGV4dGVybmFsIGRlcGVuZGVuY3kKICAgIHZhciBRUkNvZGU7IWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhKXt0aGlzLm1vZGU9Yy5NT0RFXzhCSVRfQllURSx0aGlzLmRhdGE9YSx0aGlzLnBhcnNlZERhdGE9W107Zm9yKHZhciBiPVtdLGQ9MCxlPXRoaXMuZGF0YS5sZW5ndGg7ZT5kO2QrKyl7dmFyIGY9dGhpcy5kYXRhLmNoYXJDb2RlQXQoZCk7Zj42NTUzNj8oYlswXT0yNDB8KDE4MzUwMDgmZik+Pj4xOCxiWzFdPTEyOHwoMjU4MDQ4JmYpPj4+MTIsYlsyXT0xMjh8KDQwMzImZik+Pj42LGJbM109MTI4fDYzJmYpOmY+MjA0OD8oYlswXT0yMjR8KDYxNDQwJmYpPj4+MTIsYlsxXT0xMjh8KDQwMzImZik+Pj42LGJbMl09MTI4fDYzJmYpOmY+MTI4PyhiWzBdPTE5MnwoMTk4NCZmKT4+PjYsYlsxXT0xMjh8NjMmZik6YlswXT1mLHRoaXMucGFyc2VkRGF0YT10aGlzLnBhcnNlZERhdGEuY29uY2F0KGIpfXRoaXMucGFyc2VkRGF0YS5sZW5ndGghPXRoaXMuZGF0YS5sZW5ndGgmJih0aGlzLnBhcnNlZERhdGEudW5zaGlmdCgxOTEpLHRoaXMucGFyc2VkRGF0YS51bnNoaWZ0KDE4NyksdGhpcy5wYXJzZWREYXRhLnVuc2hpZnQoMjM5KSl9ZnVuY3Rpb24gYihhLGIpe3RoaXMudHlwZU51bWJlcj1hLHRoaXMuZXJyb3JDb3JyZWN0TGV2ZWw9Yix0aGlzLm1vZHVsZXM9bnVsbCx0aGlzLm1vZHVsZUNvdW50PTAsdGhpcy5kYXRhQ2FjaGU9bnVsbCx0aGlzLmRhdGFMaXN0PVtdfWZ1bmN0aW9uIGkoYSxiKXtpZih2b2lkIDA9PWEubGVuZ3RoKXRocm93IG5ldyBFcnJvcihhLmxlbmd0aCsiLyIrYik7Zm9yKHZhciBjPTA7YzxhLmxlbmd0aCYmMD09YVtjXTspYysrO3RoaXMubnVtPW5ldyBBcnJheShhLmxlbmd0aC1jK2IpO2Zvcih2YXIgZD0wO2Q8YS5sZW5ndGgtYztkKyspdGhpcy5udW1bZF09YVtkK2NdfWZ1bmN0aW9uIGooYSxiKXt0aGlzLnRvdGFsQ291bnQ9YSx0aGlzLmRhdGFDb3VudD1ifWZ1bmN0aW9uIGsoKXt0aGlzLmJ1ZmZlcj1bXSx0aGlzLmxlbmd0aD0wfWZ1bmN0aW9uIG0oKXtyZXR1cm4idW5kZWZpbmVkIiE9dHlwZW9mIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRH1mdW5jdGlvbiBuKCl7dmFyIGE9ITEsYj1uYXZpZ2F0b3IudXNlckFnZW50O3JldHVybi9hbmRyb2lkL2kudGVzdChiKSYmKGE9ITAsYU1hdD1iLnRvU3RyaW5nKCkubWF0Y2goL2FuZHJvaWQgKFswLTldXC5bMC05XSkvaSksYU1hdCYmYU1hdFsxXSYmKGE9cGFyc2VGbG9hdChhTWF0WzFdKSkpLGF9ZnVuY3Rpb24gcihhLGIpe2Zvcih2YXIgYz0xLGU9cyhhKSxmPTAsZz1sLmxlbmd0aDtnPj1mO2YrKyl7dmFyIGg9MDtzd2l0Y2goYil7Y2FzZSBkLkw6aD1sW2ZdWzBdO2JyZWFrO2Nhc2UgZC5NOmg9bFtmXVsxXTticmVhaztjYXNlIGQuUTpoPWxbZl1bMl07YnJlYWs7Y2FzZSBkLkg6aD1sW2ZdWzNdfWlmKGg+PWUpYnJlYWs7YysrfWlmKGM+bC5sZW5ndGgpdGhyb3cgbmV3IEVycm9yKCJUb28gbG9uZyBkYXRhIik7cmV0dXJuIGN9ZnVuY3Rpb24gcyhhKXt2YXIgYj1lbmNvZGVVUkkoYSkudG9TdHJpbmcoKS5yZXBsYWNlKC9cJVswLTlhLWZBLUZdezJ9L2csImEiKTtyZXR1cm4gYi5sZW5ndGgrKGIubGVuZ3RoIT1hPzM6MCl9YS5wcm90b3R5cGU9e2dldExlbmd0aDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnBhcnNlZERhdGEubGVuZ3RofSx3cml0ZTpmdW5jdGlvbihhKXtmb3IodmFyIGI9MCxjPXRoaXMucGFyc2VkRGF0YS5sZW5ndGg7Yz5iO2IrKylhLnB1dCh0aGlzLnBhcnNlZERhdGFbYl0sOCl9fSxiLnByb3RvdHlwZT17YWRkRGF0YTpmdW5jdGlvbihiKXt2YXIgYz1uZXcgYShiKTt0aGlzLmRhdGFMaXN0LnB1c2goYyksdGhpcy5kYXRhQ2FjaGU9bnVsbH0saXNEYXJrOmZ1bmN0aW9uKGEsYil7aWYoMD5hfHx0aGlzLm1vZHVsZUNvdW50PD1hfHwwPmJ8fHRoaXMubW9kdWxlQ291bnQ8PWIpdGhyb3cgbmV3IEVycm9yKGErIiwiK2IpO3JldHVybiB0aGlzLm1vZHVsZXNbYV1bYl19LGdldE1vZHVsZUNvdW50OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubW9kdWxlQ291bnR9LG1ha2U6ZnVuY3Rpb24oKXt0aGlzLm1ha2VJbXBsKCExLHRoaXMuZ2V0QmVzdE1hc2tQYXR0ZXJuKCkpfSxtYWtlSW1wbDpmdW5jdGlvbihhLGMpe3RoaXMubW9kdWxlQ291bnQ9NCp0aGlzLnR5cGVOdW1iZXIrMTcsdGhpcy5tb2R1bGVzPW5ldyBBcnJheSh0aGlzLm1vZHVsZUNvdW50KTtmb3IodmFyIGQ9MDtkPHRoaXMubW9kdWxlQ291bnQ7ZCsrKXt0aGlzLm1vZHVsZXNbZF09bmV3IEFycmF5KHRoaXMubW9kdWxlQ291bnQpO2Zvcih2YXIgZT0wO2U8dGhpcy5tb2R1bGVDb3VudDtlKyspdGhpcy5tb2R1bGVzW2RdW2VdPW51bGx9dGhpcy5zZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKDAsMCksdGhpcy5zZXR1cFBvc2l0aW9uUHJvYmVQYXR0ZXJuKHRoaXMubW9kdWxlQ291bnQtNywwKSx0aGlzLnNldHVwUG9zaXRpb25Qcm9iZVBhdHRlcm4oMCx0aGlzLm1vZHVsZUNvdW50LTcpLHRoaXMuc2V0dXBQb3NpdGlvbkFkanVzdFBhdHRlcm4oKSx0aGlzLnNldHVwVGltaW5nUGF0dGVybigpLHRoaXMuc2V0dXBUeXBlSW5mbyhhLGMpLHRoaXMudHlwZU51bWJlcj49NyYmdGhpcy5zZXR1cFR5cGVOdW1iZXIoYSksbnVsbD09dGhpcy5kYXRhQ2FjaGUmJih0aGlzLmRhdGFDYWNoZT1iLmNyZWF0ZURhdGEodGhpcy50eXBlTnVtYmVyLHRoaXMuZXJyb3JDb3JyZWN0TGV2ZWwsdGhpcy5kYXRhTGlzdCkpLHRoaXMubWFwRGF0YSh0aGlzLmRhdGFDYWNoZSxjKX0sc2V0dXBQb3NpdGlvblByb2JlUGF0dGVybjpmdW5jdGlvbihhLGIpe2Zvcih2YXIgYz0tMTs3Pj1jO2MrKylpZighKC0xPj1hK2N8fHRoaXMubW9kdWxlQ291bnQ8PWErYykpZm9yKHZhciBkPS0xOzc+PWQ7ZCsrKS0xPj1iK2R8fHRoaXMubW9kdWxlQ291bnQ8PWIrZHx8KHRoaXMubW9kdWxlc1thK2NdW2IrZF09Yz49MCYmNj49YyYmKDA9PWR8fDY9PWQpfHxkPj0wJiY2Pj1kJiYoMD09Y3x8Nj09Yyl8fGM+PTImJjQ+PWMmJmQ+PTImJjQ+PWQ/ITA6ITEpfSxnZXRCZXN0TWFza1BhdHRlcm46ZnVuY3Rpb24oKXtmb3IodmFyIGE9MCxiPTAsYz0wOzg+YztjKyspe3RoaXMubWFrZUltcGwoITAsYyk7dmFyIGQ9Zi5nZXRMb3N0UG9pbnQodGhpcyk7KDA9PWN8fGE+ZCkmJihhPWQsYj1jKX1yZXR1cm4gYn0sY3JlYXRlTW92aWVDbGlwOmZ1bmN0aW9uKGEsYixjKXt2YXIgZD1hLmNyZWF0ZUVtcHR5TW92aWVDbGlwKGIsYyksZT0xO3RoaXMubWFrZSgpO2Zvcih2YXIgZj0wO2Y8dGhpcy5tb2R1bGVzLmxlbmd0aDtmKyspZm9yKHZhciBnPWYqZSxoPTA7aDx0aGlzLm1vZHVsZXNbZl0ubGVuZ3RoO2grKyl7dmFyIGk9aCplLGo9dGhpcy5tb2R1bGVzW2ZdW2hdO2omJihkLmJlZ2luRmlsbCgwLDEwMCksZC5tb3ZlVG8oaSxnKSxkLmxpbmVUbyhpK2UsZyksZC5saW5lVG8oaStlLGcrZSksZC5saW5lVG8oaSxnK2UpLGQuZW5kRmlsbCgpKX1yZXR1cm4gZH0sc2V0dXBUaW1pbmdQYXR0ZXJuOmZ1bmN0aW9uKCl7Zm9yKHZhciBhPTg7YTx0aGlzLm1vZHVsZUNvdW50LTg7YSsrKW51bGw9PXRoaXMubW9kdWxlc1thXVs2XSYmKHRoaXMubW9kdWxlc1thXVs2XT0wPT1hJTIpO2Zvcih2YXIgYj04O2I8dGhpcy5tb2R1bGVDb3VudC04O2IrKyludWxsPT10aGlzLm1vZHVsZXNbNl1bYl0mJih0aGlzLm1vZHVsZXNbNl1bYl09MD09YiUyKX0sc2V0dXBQb3NpdGlvbkFkanVzdFBhdHRlcm46ZnVuY3Rpb24oKXtmb3IodmFyIGE9Zi5nZXRQYXR0ZXJuUG9zaXRpb24odGhpcy50eXBlTnVtYmVyKSxiPTA7YjxhLmxlbmd0aDtiKyspZm9yKHZhciBjPTA7YzxhLmxlbmd0aDtjKyspe3ZhciBkPWFbYl0sZT1hW2NdO2lmKG51bGw9PXRoaXMubW9kdWxlc1tkXVtlXSlmb3IodmFyIGc9LTI7Mj49ZztnKyspZm9yKHZhciBoPS0yOzI+PWg7aCsrKXRoaXMubW9kdWxlc1tkK2ddW2UraF09LTI9PWd8fDI9PWd8fC0yPT1ofHwyPT1ofHwwPT1nJiYwPT1oPyEwOiExfX0sc2V0dXBUeXBlTnVtYmVyOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1mLmdldEJDSFR5cGVOdW1iZXIodGhpcy50eXBlTnVtYmVyKSxjPTA7MTg+YztjKyspe3ZhciBkPSFhJiYxPT0oMSZiPj5jKTt0aGlzLm1vZHVsZXNbTWF0aC5mbG9vcihjLzMpXVtjJTMrdGhpcy5tb2R1bGVDb3VudC04LTNdPWR9Zm9yKHZhciBjPTA7MTg+YztjKyspe3ZhciBkPSFhJiYxPT0oMSZiPj5jKTt0aGlzLm1vZHVsZXNbYyUzK3RoaXMubW9kdWxlQ291bnQtOC0zXVtNYXRoLmZsb29yKGMvMyldPWR9fSxzZXR1cFR5cGVJbmZvOmZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPXRoaXMuZXJyb3JDb3JyZWN0TGV2ZWw8PDN8YixkPWYuZ2V0QkNIVHlwZUluZm8oYyksZT0wOzE1PmU7ZSsrKXt2YXIgZz0hYSYmMT09KDEmZD4+ZSk7Nj5lP3RoaXMubW9kdWxlc1tlXVs4XT1nOjg+ZT90aGlzLm1vZHVsZXNbZSsxXVs4XT1nOnRoaXMubW9kdWxlc1t0aGlzLm1vZHVsZUNvdW50LTE1K2VdWzhdPWd9Zm9yKHZhciBlPTA7MTU+ZTtlKyspe3ZhciBnPSFhJiYxPT0oMSZkPj5lKTs4PmU/dGhpcy5tb2R1bGVzWzhdW3RoaXMubW9kdWxlQ291bnQtZS0xXT1nOjk+ZT90aGlzLm1vZHVsZXNbOF1bMTUtZS0xKzFdPWc6dGhpcy5tb2R1bGVzWzhdWzE1LWUtMV09Z310aGlzLm1vZHVsZXNbdGhpcy5tb2R1bGVDb3VudC04XVs4XT0hYX0sbWFwRGF0YTpmdW5jdGlvbihhLGIpe2Zvcih2YXIgYz0tMSxkPXRoaXMubW9kdWxlQ291bnQtMSxlPTcsZz0wLGg9dGhpcy5tb2R1bGVDb3VudC0xO2g+MDtoLT0yKWZvcig2PT1oJiZoLS07Oyl7Zm9yKHZhciBpPTA7Mj5pO2krKylpZihudWxsPT10aGlzLm1vZHVsZXNbZF1baC1pXSl7dmFyIGo9ITE7ZzxhLmxlbmd0aCYmKGo9MT09KDEmYVtnXT4+PmUpKTt2YXIgaz1mLmdldE1hc2soYixkLGgtaSk7ayYmKGo9IWopLHRoaXMubW9kdWxlc1tkXVtoLWldPWosZS0tLC0xPT1lJiYoZysrLGU9Nyl9aWYoZCs9YywwPmR8fHRoaXMubW9kdWxlQ291bnQ8PWQpe2QtPWMsYz0tYzticmVha319fX0sYi5QQUQwPTIzNixiLlBBRDE9MTcsYi5jcmVhdGVEYXRhPWZ1bmN0aW9uKGEsYyxkKXtmb3IodmFyIGU9ai5nZXRSU0Jsb2NrcyhhLGMpLGc9bmV3IGssaD0wO2g8ZC5sZW5ndGg7aCsrKXt2YXIgaT1kW2hdO2cucHV0KGkubW9kZSw0KSxnLnB1dChpLmdldExlbmd0aCgpLGYuZ2V0TGVuZ3RoSW5CaXRzKGkubW9kZSxhKSksaS53cml0ZShnKX1mb3IodmFyIGw9MCxoPTA7aDxlLmxlbmd0aDtoKyspbCs9ZVtoXS5kYXRhQ291bnQ7aWYoZy5nZXRMZW5ndGhJbkJpdHMoKT44KmwpdGhyb3cgbmV3IEVycm9yKCJjb2RlIGxlbmd0aCBvdmVyZmxvdy4gKCIrZy5nZXRMZW5ndGhJbkJpdHMoKSsiPiIrOCpsKyIpIik7Zm9yKGcuZ2V0TGVuZ3RoSW5CaXRzKCkrNDw9OCpsJiZnLnB1dCgwLDQpOzAhPWcuZ2V0TGVuZ3RoSW5CaXRzKCklODspZy5wdXRCaXQoITEpO2Zvcig7Oyl7aWYoZy5nZXRMZW5ndGhJbkJpdHMoKT49OCpsKWJyZWFrO2lmKGcucHV0KGIuUEFEMCw4KSxnLmdldExlbmd0aEluQml0cygpPj04KmwpYnJlYWs7Zy5wdXQoYi5QQUQxLDgpfXJldHVybiBiLmNyZWF0ZUJ5dGVzKGcsZSl9LGIuY3JlYXRlQnl0ZXM9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9MCxkPTAsZT0wLGc9bmV3IEFycmF5KGIubGVuZ3RoKSxoPW5ldyBBcnJheShiLmxlbmd0aCksaj0wO2o8Yi5sZW5ndGg7aisrKXt2YXIgaz1iW2pdLmRhdGFDb3VudCxsPWJbal0udG90YWxDb3VudC1rO2Q9TWF0aC5tYXgoZCxrKSxlPU1hdGgubWF4KGUsbCksZ1tqXT1uZXcgQXJyYXkoayk7Zm9yKHZhciBtPTA7bTxnW2pdLmxlbmd0aDttKyspZ1tqXVttXT0yNTUmYS5idWZmZXJbbStjXTtjKz1rO3ZhciBuPWYuZ2V0RXJyb3JDb3JyZWN0UG9seW5vbWlhbChsKSxvPW5ldyBpKGdbal0sbi5nZXRMZW5ndGgoKS0xKSxwPW8ubW9kKG4pO2hbal09bmV3IEFycmF5KG4uZ2V0TGVuZ3RoKCktMSk7Zm9yKHZhciBtPTA7bTxoW2pdLmxlbmd0aDttKyspe3ZhciBxPW0rcC5nZXRMZW5ndGgoKS1oW2pdLmxlbmd0aDtoW2pdW21dPXE+PTA/cC5nZXQocSk6MH19Zm9yKHZhciByPTAsbT0wO208Yi5sZW5ndGg7bSsrKXIrPWJbbV0udG90YWxDb3VudDtmb3IodmFyIHM9bmV3IEFycmF5KHIpLHQ9MCxtPTA7ZD5tO20rKylmb3IodmFyIGo9MDtqPGIubGVuZ3RoO2orKyltPGdbal0ubGVuZ3RoJiYoc1t0KytdPWdbal1bbV0pO2Zvcih2YXIgbT0wO2U+bTttKyspZm9yKHZhciBqPTA7ajxiLmxlbmd0aDtqKyspbTxoW2pdLmxlbmd0aCYmKHNbdCsrXT1oW2pdW21dKTtyZXR1cm4gc307Zm9yKHZhciBjPXtNT0RFX05VTUJFUjoxLE1PREVfQUxQSEFfTlVNOjIsTU9ERV84QklUX0JZVEU6NCxNT0RFX0tBTkpJOjh9LGQ9e0w6MSxNOjAsUTozLEg6Mn0sZT17UEFUVEVSTjAwMDowLFBBVFRFUk4wMDE6MSxQQVRURVJOMDEwOjIsUEFUVEVSTjAxMTozLFBBVFRFUk4xMDA6NCxQQVRURVJOMTAxOjUsUEFUVEVSTjExMDo2LFBBVFRFUk4xMTE6N30sZj17UEFUVEVSTl9QT1NJVElPTl9UQUJMRTpbW10sWzYsMThdLFs2LDIyXSxbNiwyNl0sWzYsMzBdLFs2LDM0XSxbNiwyMiwzOF0sWzYsMjQsNDJdLFs2LDI2LDQ2XSxbNiwyOCw1MF0sWzYsMzAsNTRdLFs2LDMyLDU4XSxbNiwzNCw2Ml0sWzYsMjYsNDYsNjZdLFs2LDI2LDQ4LDcwXSxbNiwyNiw1MCw3NF0sWzYsMzAsNTQsNzhdLFs2LDMwLDU2LDgyXSxbNiwzMCw1OCw4Nl0sWzYsMzQsNjIsOTBdLFs2LDI4LDUwLDcyLDk0XSxbNiwyNiw1MCw3NCw5OF0sWzYsMzAsNTQsNzgsMTAyXSxbNiwyOCw1NCw4MCwxMDZdLFs2LDMyLDU4LDg0LDExMF0sWzYsMzAsNTgsODYsMTE0XSxbNiwzNCw2Miw5MCwxMThdLFs2LDI2LDUwLDc0LDk4LDEyMl0sWzYsMzAsNTQsNzgsMTAyLDEyNl0sWzYsMjYsNTIsNzgsMTA0LDEzMF0sWzYsMzAsNTYsODIsMTA4LDEzNF0sWzYsMzQsNjAsODYsMTEyLDEzOF0sWzYsMzAsNTgsODYsMTE0LDE0Ml0sWzYsMzQsNjIsOTAsMTE4LDE0Nl0sWzYsMzAsNTQsNzgsMTAyLDEyNiwxNTBdLFs2LDI0LDUwLDc2LDEwMiwxMjgsMTU0XSxbNiwyOCw1NCw4MCwxMDYsMTMyLDE1OF0sWzYsMzIsNTgsODQsMTEwLDEzNiwxNjJdLFs2LDI2LDU0LDgyLDExMCwxMzgsMTY2XSxbNiwzMCw1OCw4NiwxMTQsMTQyLDE3MF1dLEcxNToxMzM1LEcxODo3OTczLEcxNV9NQVNLOjIxNTIyLGdldEJDSFR5cGVJbmZvOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1hPDwxMDtmLmdldEJDSERpZ2l0KGIpLWYuZ2V0QkNIRGlnaXQoZi5HMTUpPj0wOyliXj1mLkcxNTw8Zi5nZXRCQ0hEaWdpdChiKS1mLmdldEJDSERpZ2l0KGYuRzE1KTtyZXR1cm4oYTw8MTB8YileZi5HMTVfTUFTS30sZ2V0QkNIVHlwZU51bWJlcjpmdW5jdGlvbihhKXtmb3IodmFyIGI9YTw8MTI7Zi5nZXRCQ0hEaWdpdChiKS1mLmdldEJDSERpZ2l0KGYuRzE4KT49MDspYl49Zi5HMTg8PGYuZ2V0QkNIRGlnaXQoYiktZi5nZXRCQ0hEaWdpdChmLkcxOCk7cmV0dXJuIGE8PDEyfGJ9LGdldEJDSERpZ2l0OmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj0wOzAhPWE7KWIrKyxhPj4+PTE7cmV0dXJuIGJ9LGdldFBhdHRlcm5Qb3NpdGlvbjpmdW5jdGlvbihhKXtyZXR1cm4gZi5QQVRURVJOX1BPU0lUSU9OX1RBQkxFW2EtMV19LGdldE1hc2s6ZnVuY3Rpb24oYSxiLGMpe3N3aXRjaChhKXtjYXNlIGUuUEFUVEVSTjAwMDpyZXR1cm4gMD09KGIrYyklMjtjYXNlIGUuUEFUVEVSTjAwMTpyZXR1cm4gMD09YiUyO2Nhc2UgZS5QQVRURVJOMDEwOnJldHVybiAwPT1jJTM7Y2FzZSBlLlBBVFRFUk4wMTE6cmV0dXJuIDA9PShiK2MpJTM7Y2FzZSBlLlBBVFRFUk4xMDA6cmV0dXJuIDA9PShNYXRoLmZsb29yKGIvMikrTWF0aC5mbG9vcihjLzMpKSUyO2Nhc2UgZS5QQVRURVJOMTAxOnJldHVybiAwPT1iKmMlMitiKmMlMztjYXNlIGUuUEFUVEVSTjExMDpyZXR1cm4gMD09KGIqYyUyK2IqYyUzKSUyO2Nhc2UgZS5QQVRURVJOMTExOnJldHVybiAwPT0oYipjJTMrKGIrYyklMiklMjtkZWZhdWx0OnRocm93IG5ldyBFcnJvcigiYmFkIG1hc2tQYXR0ZXJuOiIrYSl9fSxnZXRFcnJvckNvcnJlY3RQb2x5bm9taWFsOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1uZXcgaShbMV0sMCksYz0wO2E+YztjKyspYj1iLm11bHRpcGx5KG5ldyBpKFsxLGcuZ2V4cChjKV0sMCkpO3JldHVybiBifSxnZXRMZW5ndGhJbkJpdHM6ZnVuY3Rpb24oYSxiKXtpZihiPj0xJiYxMD5iKXN3aXRjaChhKXtjYXNlIGMuTU9ERV9OVU1CRVI6cmV0dXJuIDEwO2Nhc2UgYy5NT0RFX0FMUEhBX05VTTpyZXR1cm4gOTtjYXNlIGMuTU9ERV84QklUX0JZVEU6cmV0dXJuIDg7Y2FzZSBjLk1PREVfS0FOSkk6cmV0dXJuIDg7ZGVmYXVsdDp0aHJvdyBuZXcgRXJyb3IoIm1vZGU6IithKX1lbHNlIGlmKDI3PmIpc3dpdGNoKGEpe2Nhc2UgYy5NT0RFX05VTUJFUjpyZXR1cm4gMTI7Y2FzZSBjLk1PREVfQUxQSEFfTlVNOnJldHVybiAxMTtjYXNlIGMuTU9ERV84QklUX0JZVEU6cmV0dXJuIDE2O2Nhc2UgYy5NT0RFX0tBTkpJOnJldHVybiAxMDtkZWZhdWx0OnRocm93IG5ldyBFcnJvcigibW9kZToiK2EpfWVsc2V7aWYoISg0MT5iKSl0aHJvdyBuZXcgRXJyb3IoInR5cGU6IitiKTtzd2l0Y2goYSl7Y2FzZSBjLk1PREVfTlVNQkVSOnJldHVybiAxNDtjYXNlIGMuTU9ERV9BTFBIQV9OVU06cmV0dXJuIDEzO2Nhc2UgYy5NT0RFXzhCSVRfQllURTpyZXR1cm4gMTY7Y2FzZSBjLk1PREVfS0FOSkk6cmV0dXJuIDEyO2RlZmF1bHQ6dGhyb3cgbmV3IEVycm9yKCJtb2RlOiIrYSl9fX0sZ2V0TG9zdFBvaW50OmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1hLmdldE1vZHVsZUNvdW50KCksYz0wLGQ9MDtiPmQ7ZCsrKWZvcih2YXIgZT0wO2I+ZTtlKyspe2Zvcih2YXIgZj0wLGc9YS5pc0RhcmsoZCxlKSxoPS0xOzE+PWg7aCsrKWlmKCEoMD5kK2h8fGQraD49YikpZm9yKHZhciBpPS0xOzE+PWk7aSsrKTA+ZStpfHxlK2k+PWJ8fCgwIT1ofHwwIT1pKSYmZz09YS5pc0RhcmsoZCtoLGUraSkmJmYrKztmPjUmJihjKz0zK2YtNSl9Zm9yKHZhciBkPTA7Yi0xPmQ7ZCsrKWZvcih2YXIgZT0wO2ItMT5lO2UrKyl7dmFyIGo9MDthLmlzRGFyayhkLGUpJiZqKyssYS5pc0RhcmsoZCsxLGUpJiZqKyssYS5pc0RhcmsoZCxlKzEpJiZqKyssYS5pc0RhcmsoZCsxLGUrMSkmJmorKywoMD09anx8ND09aikmJihjKz0zKX1mb3IodmFyIGQ9MDtiPmQ7ZCsrKWZvcih2YXIgZT0wO2ItNj5lO2UrKylhLmlzRGFyayhkLGUpJiYhYS5pc0RhcmsoZCxlKzEpJiZhLmlzRGFyayhkLGUrMikmJmEuaXNEYXJrKGQsZSszKSYmYS5pc0RhcmsoZCxlKzQpJiYhYS5pc0RhcmsoZCxlKzUpJiZhLmlzRGFyayhkLGUrNikmJihjKz00MCk7Zm9yKHZhciBlPTA7Yj5lO2UrKylmb3IodmFyIGQ9MDtiLTY+ZDtkKyspYS5pc0RhcmsoZCxlKSYmIWEuaXNEYXJrKGQrMSxlKSYmYS5pc0RhcmsoZCsyLGUpJiZhLmlzRGFyayhkKzMsZSkmJmEuaXNEYXJrKGQrNCxlKSYmIWEuaXNEYXJrKGQrNSxlKSYmYS5pc0RhcmsoZCs2LGUpJiYoYys9NDApO2Zvcih2YXIgaz0wLGU9MDtiPmU7ZSsrKWZvcih2YXIgZD0wO2I+ZDtkKyspYS5pc0RhcmsoZCxlKSYmaysrO3ZhciBsPU1hdGguYWJzKDEwMCprL2IvYi01MCkvNTtyZXR1cm4gYys9MTAqbH19LGc9e2dsb2c6ZnVuY3Rpb24oYSl7aWYoMT5hKXRocm93IG5ldyBFcnJvcigiZ2xvZygiK2ErIikiKTtyZXR1cm4gZy5MT0dfVEFCTEVbYV19LGdleHA6ZnVuY3Rpb24oYSl7Zm9yKDswPmE7KWErPTI1NTtmb3IoO2E+PTI1NjspYS09MjU1O3JldHVybiBnLkVYUF9UQUJMRVthXX0sRVhQX1RBQkxFOm5ldyBBcnJheSgyNTYpLExPR19UQUJMRTpuZXcgQXJyYXkoMjU2KX0saD0wOzg+aDtoKyspZy5FWFBfVEFCTEVbaF09MTw8aDtmb3IodmFyIGg9ODsyNTY+aDtoKyspZy5FWFBfVEFCTEVbaF09Zy5FWFBfVEFCTEVbaC00XV5nLkVYUF9UQUJMRVtoLTVdXmcuRVhQX1RBQkxFW2gtNl1eZy5FWFBfVEFCTEVbaC04XTtmb3IodmFyIGg9MDsyNTU+aDtoKyspZy5MT0dfVEFCTEVbZy5FWFBfVEFCTEVbaF1dPWg7aS5wcm90b3R5cGU9e2dldDpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5udW1bYV19LGdldExlbmd0aDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm51bS5sZW5ndGh9LG11bHRpcGx5OmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1uZXcgQXJyYXkodGhpcy5nZXRMZW5ndGgoKSthLmdldExlbmd0aCgpLTEpLGM9MDtjPHRoaXMuZ2V0TGVuZ3RoKCk7YysrKWZvcih2YXIgZD0wO2Q8YS5nZXRMZW5ndGgoKTtkKyspYltjK2RdXj1nLmdleHAoZy5nbG9nKHRoaXMuZ2V0KGMpKStnLmdsb2coYS5nZXQoZCkpKTtyZXR1cm4gbmV3IGkoYiwwKX0sbW9kOmZ1bmN0aW9uKGEpe2lmKHRoaXMuZ2V0TGVuZ3RoKCktYS5nZXRMZW5ndGgoKTwwKXJldHVybiB0aGlzO2Zvcih2YXIgYj1nLmdsb2codGhpcy5nZXQoMCkpLWcuZ2xvZyhhLmdldCgwKSksYz1uZXcgQXJyYXkodGhpcy5nZXRMZW5ndGgoKSksZD0wO2Q8dGhpcy5nZXRMZW5ndGgoKTtkKyspY1tkXT10aGlzLmdldChkKTtmb3IodmFyIGQ9MDtkPGEuZ2V0TGVuZ3RoKCk7ZCsrKWNbZF1ePWcuZ2V4cChnLmdsb2coYS5nZXQoZCkpK2IpO3JldHVybiBuZXcgaShjLDApLm1vZChhKX19LGouUlNfQkxPQ0tfVEFCTEU9W1sxLDI2LDE5XSxbMSwyNiwxNl0sWzEsMjYsMTNdLFsxLDI2LDldLFsxLDQ0LDM0XSxbMSw0NCwyOF0sWzEsNDQsMjJdLFsxLDQ0LDE2XSxbMSw3MCw1NV0sWzEsNzAsNDRdLFsyLDM1LDE3XSxbMiwzNSwxM10sWzEsMTAwLDgwXSxbMiw1MCwzMl0sWzIsNTAsMjRdLFs0LDI1LDldLFsxLDEzNCwxMDhdLFsyLDY3LDQzXSxbMiwzMywxNSwyLDM0LDE2XSxbMiwzMywxMSwyLDM0LDEyXSxbMiw4Niw2OF0sWzQsNDMsMjddLFs0LDQzLDE5XSxbNCw0MywxNV0sWzIsOTgsNzhdLFs0LDQ5LDMxXSxbMiwzMiwxNCw0LDMzLDE1XSxbNCwzOSwxMywxLDQwLDE0XSxbMiwxMjEsOTddLFsyLDYwLDM4LDIsNjEsMzldLFs0LDQwLDE4LDIsNDEsMTldLFs0LDQwLDE0LDIsNDEsMTVdLFsyLDE0NiwxMTZdLFszLDU4LDM2LDIsNTksMzddLFs0LDM2LDE2LDQsMzcsMTddLFs0LDM2LDEyLDQsMzcsMTNdLFsyLDg2LDY4LDIsODcsNjldLFs0LDY5LDQzLDEsNzAsNDRdLFs2LDQzLDE5LDIsNDQsMjBdLFs2LDQzLDE1LDIsNDQsMTZdLFs0LDEwMSw4MV0sWzEsODAsNTAsNCw4MSw1MV0sWzQsNTAsMjIsNCw1MSwyM10sWzMsMzYsMTIsOCwzNywxM10sWzIsMTE2LDkyLDIsMTE3LDkzXSxbNiw1OCwzNiwyLDU5LDM3XSxbNCw0NiwyMCw2LDQ3LDIxXSxbNyw0MiwxNCw0LDQzLDE1XSxbNCwxMzMsMTA3XSxbOCw1OSwzNywxLDYwLDM4XSxbOCw0NCwyMCw0LDQ1LDIxXSxbMTIsMzMsMTEsNCwzNCwxMl0sWzMsMTQ1LDExNSwxLDE0NiwxMTZdLFs0LDY0LDQwLDUsNjUsNDFdLFsxMSwzNiwxNiw1LDM3LDE3XSxbMTEsMzYsMTIsNSwzNywxM10sWzUsMTA5LDg3LDEsMTEwLDg4XSxbNSw2NSw0MSw1LDY2LDQyXSxbNSw1NCwyNCw3LDU1LDI1XSxbMTEsMzYsMTJdLFs1LDEyMiw5OCwxLDEyMyw5OV0sWzcsNzMsNDUsMyw3NCw0Nl0sWzE1LDQzLDE5LDIsNDQsMjBdLFszLDQ1LDE1LDEzLDQ2LDE2XSxbMSwxMzUsMTA3LDUsMTM2LDEwOF0sWzEwLDc0LDQ2LDEsNzUsNDddLFsxLDUwLDIyLDE1LDUxLDIzXSxbMiw0MiwxNCwxNyw0MywxNV0sWzUsMTUwLDEyMCwxLDE1MSwxMjFdLFs5LDY5LDQzLDQsNzAsNDRdLFsxNyw1MCwyMiwxLDUxLDIzXSxbMiw0MiwxNCwxOSw0MywxNV0sWzMsMTQxLDExMyw0LDE0MiwxMTRdLFszLDcwLDQ0LDExLDcxLDQ1XSxbMTcsNDcsMjEsNCw0OCwyMl0sWzksMzksMTMsMTYsNDAsMTRdLFszLDEzNSwxMDcsNSwxMzYsMTA4XSxbMyw2Nyw0MSwxMyw2OCw0Ml0sWzE1LDU0LDI0LDUsNTUsMjVdLFsxNSw0MywxNSwxMCw0NCwxNl0sWzQsMTQ0LDExNiw0LDE0NSwxMTddLFsxNyw2OCw0Ml0sWzE3LDUwLDIyLDYsNTEsMjNdLFsxOSw0NiwxNiw2LDQ3LDE3XSxbMiwxMzksMTExLDcsMTQwLDExMl0sWzE3LDc0LDQ2XSxbNyw1NCwyNCwxNiw1NSwyNV0sWzM0LDM3LDEzXSxbNCwxNTEsMTIxLDUsMTUyLDEyMl0sWzQsNzUsNDcsMTQsNzYsNDhdLFsxMSw1NCwyNCwxNCw1NSwyNV0sWzE2LDQ1LDE1LDE0LDQ2LDE2XSxbNiwxNDcsMTE3LDQsMTQ4LDExOF0sWzYsNzMsNDUsMTQsNzQsNDZdLFsxMSw1NCwyNCwxNiw1NSwyNV0sWzMwLDQ2LDE2LDIsNDcsMTddLFs4LDEzMiwxMDYsNCwxMzMsMTA3XSxbOCw3NSw0NywxMyw3Niw0OF0sWzcsNTQsMjQsMjIsNTUsMjVdLFsyMiw0NSwxNSwxMyw0NiwxNl0sWzEwLDE0MiwxMTQsMiwxNDMsMTE1XSxbMTksNzQsNDYsNCw3NSw0N10sWzI4LDUwLDIyLDYsNTEsMjNdLFszMyw0NiwxNiw0LDQ3LDE3XSxbOCwxNTIsMTIyLDQsMTUzLDEyM10sWzIyLDczLDQ1LDMsNzQsNDZdLFs4LDUzLDIzLDI2LDU0LDI0XSxbMTIsNDUsMTUsMjgsNDYsMTZdLFszLDE0NywxMTcsMTAsMTQ4LDExOF0sWzMsNzMsNDUsMjMsNzQsNDZdLFs0LDU0LDI0LDMxLDU1LDI1XSxbMTEsNDUsMTUsMzEsNDYsMTZdLFs3LDE0NiwxMTYsNywxNDcsMTE3XSxbMjEsNzMsNDUsNyw3NCw0Nl0sWzEsNTMsMjMsMzcsNTQsMjRdLFsxOSw0NSwxNSwyNiw0NiwxNl0sWzUsMTQ1LDExNSwxMCwxNDYsMTE2XSxbMTksNzUsNDcsMTAsNzYsNDhdLFsxNSw1NCwyNCwyNSw1NSwyNV0sWzIzLDQ1LDE1LDI1LDQ2LDE2XSxbMTMsMTQ1LDExNSwzLDE0NiwxMTZdLFsyLDc0LDQ2LDI5LDc1LDQ3XSxbNDIsNTQsMjQsMSw1NSwyNV0sWzIzLDQ1LDE1LDI4LDQ2LDE2XSxbMTcsMTQ1LDExNV0sWzEwLDc0LDQ2LDIzLDc1LDQ3XSxbMTAsNTQsMjQsMzUsNTUsMjVdLFsxOSw0NSwxNSwzNSw0NiwxNl0sWzE3LDE0NSwxMTUsMSwxNDYsMTE2XSxbMTQsNzQsNDYsMjEsNzUsNDddLFsyOSw1NCwyNCwxOSw1NSwyNV0sWzExLDQ1LDE1LDQ2LDQ2LDE2XSxbMTMsMTQ1LDExNSw2LDE0NiwxMTZdLFsxNCw3NCw0NiwyMyw3NSw0N10sWzQ0LDU0LDI0LDcsNTUsMjVdLFs1OSw0NiwxNiwxLDQ3LDE3XSxbMTIsMTUxLDEyMSw3LDE1MiwxMjJdLFsxMiw3NSw0NywyNiw3Niw0OF0sWzM5LDU0LDI0LDE0LDU1LDI1XSxbMjIsNDUsMTUsNDEsNDYsMTZdLFs2LDE1MSwxMjEsMTQsMTUyLDEyMl0sWzYsNzUsNDcsMzQsNzYsNDhdLFs0Niw1NCwyNCwxMCw1NSwyNV0sWzIsNDUsMTUsNjQsNDYsMTZdLFsxNywxNTIsMTIyLDQsMTUzLDEyM10sWzI5LDc0LDQ2LDE0LDc1LDQ3XSxbNDksNTQsMjQsMTAsNTUsMjVdLFsyNCw0NSwxNSw0Niw0NiwxNl0sWzQsMTUyLDEyMiwxOCwxNTMsMTIzXSxbMTMsNzQsNDYsMzIsNzUsNDddLFs0OCw1NCwyNCwxNCw1NSwyNV0sWzQyLDQ1LDE1LDMyLDQ2LDE2XSxbMjAsMTQ3LDExNyw0LDE0OCwxMThdLFs0MCw3NSw0Nyw3LDc2LDQ4XSxbNDMsNTQsMjQsMjIsNTUsMjVdLFsxMCw0NSwxNSw2Nyw0NiwxNl0sWzE5LDE0OCwxMTgsNiwxNDksMTE5XSxbMTgsNzUsNDcsMzEsNzYsNDhdLFszNCw1NCwyNCwzNCw1NSwyNV0sWzIwLDQ1LDE1LDYxLDQ2LDE2XV0sai5nZXRSU0Jsb2Nrcz1mdW5jdGlvbihhLGIpe3ZhciBjPWouZ2V0UnNCbG9ja1RhYmxlKGEsYik7aWYodm9pZCAwPT1jKXRocm93IG5ldyBFcnJvcigiYmFkIHJzIGJsb2NrIEAgdHlwZU51bWJlcjoiK2ErIi9lcnJvckNvcnJlY3RMZXZlbDoiK2IpO2Zvcih2YXIgZD1jLmxlbmd0aC8zLGU9W10sZj0wO2Q+ZjtmKyspZm9yKHZhciBnPWNbMypmKzBdLGg9Y1szKmYrMV0saT1jWzMqZisyXSxrPTA7Zz5rO2srKyllLnB1c2gobmV3IGooaCxpKSk7cmV0dXJuIGV9LGouZ2V0UnNCbG9ja1RhYmxlPWZ1bmN0aW9uKGEsYil7c3dpdGNoKGIpe2Nhc2UgZC5MOnJldHVybiBqLlJTX0JMT0NLX1RBQkxFWzQqKGEtMSkrMF07Y2FzZSBkLk06cmV0dXJuIGouUlNfQkxPQ0tfVEFCTEVbNCooYS0xKSsxXTtjYXNlIGQuUTpyZXR1cm4gai5SU19CTE9DS19UQUJMRVs0KihhLTEpKzJdO2Nhc2UgZC5IOnJldHVybiBqLlJTX0JMT0NLX1RBQkxFWzQqKGEtMSkrM107ZGVmYXVsdDpyZXR1cm4gdm9pZCAwfX0say5wcm90b3R5cGU9e2dldDpmdW5jdGlvbihhKXt2YXIgYj1NYXRoLmZsb29yKGEvOCk7cmV0dXJuIDE9PSgxJnRoaXMuYnVmZmVyW2JdPj4+Ny1hJTgpfSxwdXQ6ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9MDtiPmM7YysrKXRoaXMucHV0Qml0KDE9PSgxJmE+Pj5iLWMtMSkpfSxnZXRMZW5ndGhJbkJpdHM6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5sZW5ndGh9LHB1dEJpdDpmdW5jdGlvbihhKXt2YXIgYj1NYXRoLmZsb29yKHRoaXMubGVuZ3RoLzgpO3RoaXMuYnVmZmVyLmxlbmd0aDw9YiYmdGhpcy5idWZmZXIucHVzaCgwKSxhJiYodGhpcy5idWZmZXJbYl18PTEyOD4+PnRoaXMubGVuZ3RoJTgpLHRoaXMubGVuZ3RoKyt9fTt2YXIgbD1bWzE3LDE0LDExLDddLFszMiwyNiwyMCwxNF0sWzUzLDQyLDMyLDI0XSxbNzgsNjIsNDYsMzRdLFsxMDYsODQsNjAsNDRdLFsxMzQsMTA2LDc0LDU4XSxbMTU0LDEyMiw4Niw2NF0sWzE5MiwxNTIsMTA4LDg0XSxbMjMwLDE4MCwxMzAsOThdLFsyNzEsMjEzLDE1MSwxMTldLFszMjEsMjUxLDE3NywxMzddLFszNjcsMjg3LDIwMywxNTVdLFs0MjUsMzMxLDI0MSwxNzddLFs0NTgsMzYyLDI1OCwxOTRdLFs1MjAsNDEyLDI5MiwyMjBdLFs1ODYsNDUwLDMyMiwyNTBdLFs2NDQsNTA0LDM2NCwyODBdLFs3MTgsNTYwLDM5NCwzMTBdLFs3OTIsNjI0LDQ0MiwzMzhdLFs4NTgsNjY2LDQ4MiwzODJdLFs5MjksNzExLDUwOSw0MDNdLFsxMDAzLDc3OSw1NjUsNDM5XSxbMTA5MSw4NTcsNjExLDQ2MV0sWzExNzEsOTExLDY2MSw1MTFdLFsxMjczLDk5Nyw3MTUsNTM1XSxbMTM2NywxMDU5LDc1MSw1OTNdLFsxNDY1LDExMjUsODA1LDYyNV0sWzE1MjgsMTE5MCw4NjgsNjU4XSxbMTYyOCwxMjY0LDkwOCw2OThdLFsxNzMyLDEzNzAsOTgyLDc0Ml0sWzE4NDAsMTQ1MiwxMDMwLDc5MF0sWzE5NTIsMTUzOCwxMTEyLDg0Ml0sWzIwNjgsMTYyOCwxMTY4LDg5OF0sWzIxODgsMTcyMiwxMjI4LDk1OF0sWzIzMDMsMTgwOSwxMjgzLDk4M10sWzI0MzEsMTkxMSwxMzUxLDEwNTFdLFsyNTYzLDE5ODksMTQyMywxMDkzXSxbMjY5OSwyMDk5LDE0OTksMTEzOV0sWzI4MDksMjIxMywxNTc5LDEyMTldLFsyOTUzLDIzMzEsMTY2MywxMjczXV0sbz1mdW5jdGlvbigpe3ZhciBhPWZ1bmN0aW9uKGEsYil7dGhpcy5fZWw9YSx0aGlzLl9odE9wdGlvbj1ifTtyZXR1cm4gYS5wcm90b3R5cGUuZHJhdz1mdW5jdGlvbihhKXtmdW5jdGlvbiBnKGEsYil7dmFyIGM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIsYSk7Zm9yKHZhciBkIGluIGIpYi5oYXNPd25Qcm9wZXJ0eShkKSYmYy5zZXRBdHRyaWJ1dGUoZCxiW2RdKTtyZXR1cm4gY312YXIgYj10aGlzLl9odE9wdGlvbixjPXRoaXMuX2VsLGQ9YS5nZXRNb2R1bGVDb3VudCgpO01hdGguZmxvb3IoYi53aWR0aC9kKSxNYXRoLmZsb29yKGIuaGVpZ2h0L2QpLHRoaXMuY2xlYXIoKTt2YXIgaD1nKCJzdmciLHt2aWV3Qm94OiIwIDAgIitTdHJpbmcoZCkrIiAiK1N0cmluZyhkKSx3aWR0aDoiMTAwJSIsaGVpZ2h0OiIxMDAlIixmaWxsOmIuY29sb3JMaWdodH0pO2guc2V0QXR0cmlidXRlTlMoImh0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvIiwieG1sbnM6eGxpbmsiLCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiksYy5hcHBlbmRDaGlsZChoKSxoLmFwcGVuZENoaWxkKGcoInJlY3QiLHtmaWxsOmIuY29sb3JEYXJrLHdpZHRoOiIxIixoZWlnaHQ6IjEiLGlkOiJ0ZW1wbGF0ZSJ9KSk7Zm9yKHZhciBpPTA7ZD5pO2krKylmb3IodmFyIGo9MDtkPmo7aisrKWlmKGEuaXNEYXJrKGksaikpe3ZhciBrPWcoInVzZSIse3g6U3RyaW5nKGkpLHk6U3RyaW5nKGopfSk7ay5zZXRBdHRyaWJ1dGVOUygiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIsImhyZWYiLCIjdGVtcGxhdGUiKSxoLmFwcGVuZENoaWxkKGspfX0sYS5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXtmb3IoO3RoaXMuX2VsLmhhc0NoaWxkTm9kZXMoKTspdGhpcy5fZWwucmVtb3ZlQ2hpbGQodGhpcy5fZWwubGFzdENoaWxkKX0sYX0oKSxwPSJzdmciPT09ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSxxPXA/bzptKCk/ZnVuY3Rpb24oKXtmdW5jdGlvbiBhKCl7dGhpcy5fZWxJbWFnZS5zcmM9dGhpcy5fZWxDYW52YXMudG9EYXRhVVJMKCJpbWFnZS9wbmciKSx0aGlzLl9lbEltYWdlLnN0eWxlLmRpc3BsYXk9ImJsb2NrIix0aGlzLl9lbENhbnZhcy5zdHlsZS5kaXNwbGF5PSJub25lIn1mdW5jdGlvbiBkKGEsYil7dmFyIGM9dGhpcztpZihjLl9mRmFpbD1iLGMuX2ZTdWNjZXNzPWEsbnVsbD09PWMuX2JTdXBwb3J0RGF0YVVSSSl7dmFyIGQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgiaW1nIiksZT1mdW5jdGlvbigpe2MuX2JTdXBwb3J0RGF0YVVSST0hMSxjLl9mRmFpbCYmX2ZGYWlsLmNhbGwoYyl9LGY9ZnVuY3Rpb24oKXtjLl9iU3VwcG9ydERhdGFVUkk9ITAsYy5fZlN1Y2Nlc3MmJmMuX2ZTdWNjZXNzLmNhbGwoYyl9O3JldHVybiBkLm9uYWJvcnQ9ZSxkLm9uZXJyb3I9ZSxkLm9ubG9hZD1mLGQuc3JjPSJkYXRhOmltYWdlL2dpZjtiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFVQUFBQUZDQVlBQUFDTmJ5YmxBQUFBSEVsRVFWUUkxMlA0Ly84L3czOEdJQVhESUJLRTBESHhnbGpOQkFBTzlUWEwwWTRPSHdBQUFBQkpSVTVFcmtKZ2dnPT0iLHZvaWQgMH1jLl9iU3VwcG9ydERhdGFVUkk9PT0hMCYmYy5fZlN1Y2Nlc3M/Yy5fZlN1Y2Nlc3MuY2FsbChjKTpjLl9iU3VwcG9ydERhdGFVUkk9PT0hMSYmYy5fZkZhaWwmJmMuX2ZGYWlsLmNhbGwoYyl9aWYodGhpcy5fYW5kcm9pZCYmdGhpcy5fYW5kcm9pZDw9Mi4xKXt2YXIgYj0xL3dpbmRvdy5kZXZpY2VQaXhlbFJhdGlvLGM9Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJELnByb3RvdHlwZS5kcmF3SW1hZ2U7Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJELnByb3RvdHlwZS5kcmF3SW1hZ2U9ZnVuY3Rpb24oYSxkLGUsZixnLGgsaSxqKXtpZigibm9kZU5hbWUiaW4gYSYmL2ltZy9pLnRlc3QoYS5ub2RlTmFtZSkpZm9yKHZhciBsPWFyZ3VtZW50cy5sZW5ndGgtMTtsPj0xO2wtLSlhcmd1bWVudHNbbF09YXJndW1lbnRzW2xdKmI7ZWxzZSJ1bmRlZmluZWQiPT10eXBlb2YgaiYmKGFyZ3VtZW50c1sxXSo9Yixhcmd1bWVudHNbMl0qPWIsYXJndW1lbnRzWzNdKj1iLGFyZ3VtZW50c1s0XSo9Yik7Yy5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fXZhciBlPWZ1bmN0aW9uKGEsYil7dGhpcy5fYklzUGFpbnRlZD0hMSx0aGlzLl9hbmRyb2lkPW4oKSx0aGlzLl9odE9wdGlvbj1iLHRoaXMuX2VsQ2FudmFzPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImNhbnZhcyIpLHRoaXMuX2VsQ2FudmFzLndpZHRoPWIud2lkdGgsdGhpcy5fZWxDYW52YXMuaGVpZ2h0PWIuaGVpZ2h0LGEuYXBwZW5kQ2hpbGQodGhpcy5fZWxDYW52YXMpLHRoaXMuX2VsPWEsdGhpcy5fb0NvbnRleHQ9dGhpcy5fZWxDYW52YXMuZ2V0Q29udGV4dCgiMmQiKSx0aGlzLl9iSXNQYWludGVkPSExLHRoaXMuX2VsSW1hZ2U9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgiaW1nIiksdGhpcy5fZWxJbWFnZS5zdHlsZS5kaXNwbGF5PSJub25lIix0aGlzLl9lbC5hcHBlbmRDaGlsZCh0aGlzLl9lbEltYWdlKSx0aGlzLl9iU3VwcG9ydERhdGFVUkk9bnVsbH07cmV0dXJuIGUucHJvdG90eXBlLmRyYXc9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5fZWxJbWFnZSxjPXRoaXMuX29Db250ZXh0LGQ9dGhpcy5faHRPcHRpb24sZT1hLmdldE1vZHVsZUNvdW50KCksZj1kLndpZHRoL2UsZz1kLmhlaWdodC9lLGg9TWF0aC5yb3VuZChmKSxpPU1hdGgucm91bmQoZyk7Yi5zdHlsZS5kaXNwbGF5PSJub25lIix0aGlzLmNsZWFyKCk7Zm9yKHZhciBqPTA7ZT5qO2orKylmb3IodmFyIGs9MDtlPms7aysrKXt2YXIgbD1hLmlzRGFyayhqLGspLG09aypmLG49aipnO2Muc3Ryb2tlU3R5bGU9bD9kLmNvbG9yRGFyazpkLmNvbG9yTGlnaHQsYy5saW5lV2lkdGg9MSxjLmZpbGxTdHlsZT1sP2QuY29sb3JEYXJrOmQuY29sb3JMaWdodCxjLmZpbGxSZWN0KG0sbixmLGcpLGMuc3Ryb2tlUmVjdChNYXRoLmZsb29yKG0pKy41LE1hdGguZmxvb3IobikrLjUsaCxpKSxjLnN0cm9rZVJlY3QoTWF0aC5jZWlsKG0pLS41LE1hdGguY2VpbChuKS0uNSxoLGkpfXRoaXMuX2JJc1BhaW50ZWQ9ITB9LGUucHJvdG90eXBlLm1ha2VJbWFnZT1mdW5jdGlvbigpe3RoaXMuX2JJc1BhaW50ZWQmJmQuY2FsbCh0aGlzLGEpfSxlLnByb3RvdHlwZS5pc1BhaW50ZWQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fYklzUGFpbnRlZH0sZS5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLl9vQ29udGV4dC5jbGVhclJlY3QoMCwwLHRoaXMuX2VsQ2FudmFzLndpZHRoLHRoaXMuX2VsQ2FudmFzLmhlaWdodCksdGhpcy5fYklzUGFpbnRlZD0hMX0sZS5wcm90b3R5cGUucm91bmQ9ZnVuY3Rpb24oYSl7cmV0dXJuIGE/TWF0aC5mbG9vcigxZTMqYSkvMWUzOmF9LGV9KCk6ZnVuY3Rpb24oKXt2YXIgYT1mdW5jdGlvbihhLGIpe3RoaXMuX2VsPWEsdGhpcy5faHRPcHRpb249Yn07cmV0dXJuIGEucHJvdG90eXBlLmRyYXc9ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXMuX2h0T3B0aW9uLGM9dGhpcy5fZWwsZD1hLmdldE1vZHVsZUNvdW50KCksZT1NYXRoLmZsb29yKGIud2lkdGgvZCksZj1NYXRoLmZsb29yKGIuaGVpZ2h0L2QpLGc9Wyc8dGFibGUgc3R5bGU9ImJvcmRlcjowO2JvcmRlci1jb2xsYXBzZTpjb2xsYXBzZTsiPiddLGg9MDtkPmg7aCsrKXtnLnB1c2goIjx0cj4iKTtmb3IodmFyIGk9MDtkPmk7aSsrKWcucHVzaCgnPHRkIHN0eWxlPSJib3JkZXI6MDtib3JkZXItY29sbGFwc2U6Y29sbGFwc2U7cGFkZGluZzowO21hcmdpbjowO3dpZHRoOicrZSsicHg7aGVpZ2h0OiIrZisicHg7YmFja2dyb3VuZC1jb2xvcjoiKyhhLmlzRGFyayhoLGkpP2IuY29sb3JEYXJrOmIuY29sb3JMaWdodCkrJzsiPjwvdGQ+Jyk7Zy5wdXNoKCI8L3RyPiIpfWcucHVzaCgiPC90YWJsZT4iKSxjLmlubmVySFRNTD1nLmpvaW4oIiIpO3ZhciBqPWMuY2hpbGROb2Rlc1swXSxrPShiLndpZHRoLWoub2Zmc2V0V2lkdGgpLzIsbD0oYi5oZWlnaHQtai5vZmZzZXRIZWlnaHQpLzI7az4wJiZsPjAmJihqLnN0eWxlLm1hcmdpbj1sKyJweCAiK2srInB4Iil9LGEucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7dGhpcy5fZWwuaW5uZXJIVE1MPSIifSxhfSgpO1FSQ29kZT1mdW5jdGlvbihhLGIpe2lmKHRoaXMuX2h0T3B0aW9uPXt3aWR0aDoyNTYsaGVpZ2h0OjI1Nix0eXBlTnVtYmVyOjQsY29sb3JEYXJrOiIjMDAwMDAwIixjb2xvckxpZ2h0OiIjZmZmZmZmIixjb3JyZWN0TGV2ZWw6ZC5IfSwic3RyaW5nIj09dHlwZW9mIGImJihiPXt0ZXh0OmJ9KSxiKWZvcih2YXIgYyBpbiBiKXRoaXMuX2h0T3B0aW9uW2NdPWJbY107InN0cmluZyI9PXR5cGVvZiBhJiYoYT1kb2N1bWVudC5nZXRFbGVtZW50QnlJZChhKSksdGhpcy5fYW5kcm9pZD1uKCksdGhpcy5fZWw9YSx0aGlzLl9vUVJDb2RlPW51bGwsdGhpcy5fb0RyYXdpbmc9bmV3IHEodGhpcy5fZWwsdGhpcy5faHRPcHRpb24pLHRoaXMuX2h0T3B0aW9uLnRleHQmJnRoaXMubWFrZUNvZGUodGhpcy5faHRPcHRpb24udGV4dCl9LFFSQ29kZS5wcm90b3R5cGUubWFrZUNvZGU9ZnVuY3Rpb24oYSl7dGhpcy5fb1FSQ29kZT1uZXcgYihyKGEsdGhpcy5faHRPcHRpb24uY29ycmVjdExldmVsKSx0aGlzLl9odE9wdGlvbi5jb3JyZWN0TGV2ZWwpLHRoaXMuX29RUkNvZGUuYWRkRGF0YShhKSx0aGlzLl9vUVJDb2RlLm1ha2UoKSx0aGlzLl9lbC50aXRsZT1hLHRoaXMuX29EcmF3aW5nLmRyYXcodGhpcy5fb1FSQ29kZSksdGhpcy5tYWtlSW1hZ2UoKX0sUVJDb2RlLnByb3RvdHlwZS5tYWtlSW1hZ2U9ZnVuY3Rpb24oKXsiZnVuY3Rpb24iPT10eXBlb2YgdGhpcy5fb0RyYXdpbmcubWFrZUltYWdlJiYoIXRoaXMuX2FuZHJvaWR8fHRoaXMuX2FuZHJvaWQ+PTMpJiZ0aGlzLl9vRHJhd2luZy5tYWtlSW1hZ2UoKX0sUVJDb2RlLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3RoaXMuX29EcmF3aW5nLmNsZWFyKCl9LFFSQ29kZS5Db3JyZWN0TGV2ZWw9ZH0oKTsKICA8L3NjcmlwdD4KCjwhLS0g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCiAgICAgQVBQIFNDUklQVArilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAgLS0+CjxzY3JpcHQ+Cid1c2Ugc3RyaWN0JzsKCi8vIOKUgOKUgCBXZWJTb2NrZXQgc2hpbSAocmVwbGFjZXMgRmlyZWJhc2UgKyBSZWFsdGltZSBEQikg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACi8vIOKUgOKUgCBXZWJTb2NrZXQgc2hpbSAocmVwbGFjZXMgRmlyZWJhc2UgUmVhbHRpbWUgRGF0YWJhc2UpIOKUgOKUgOKUgOKUgOKUgOKUgAovLyB2NDogaGliZXJuYXRhYmxlIERPIGJhY2tlbmQgKyBzZXEtYmFzZWQgZ2FwIGRldGVjdGlvbgpjb25zdCBXU19IT1NUID0gJ2Nhcm5pdmFsLXRpbWluZy13cy5wZ2FsbGl2YW4ud29ya2Vycy5kZXYnOwpsZXQgX3dzPW51bGwsX3dzQ29kZT1udWxsLF93c1JlYWR5PWZhbHNlLF9yZXFJZD0wLF9tc2dCdWY9W107CmxldCBfcGVuZGluZ1JlcXM9bmV3IE1hcCgpLCBfc3Vic2NyaXB0aW9ucz1uZXcgTWFwKCksIF9yZWNvbm5UaW1lcj1udWxsOwovLyBzZXEgdHJhY2tpbmc6IGxhc3Qgc2VxIHNlZW4gcGVyIHBhdGg7IGlmIGluY29taW5nIHNlcSA+IGxhc3RTZXErMSB3ZSBtaXNzZWQKLy8gdXBkYXRlcyDigJQgcmUtc3Vic2NyaWJlIHRvIGZvcmNlIGEgZnJlc2ggc25hcHNob3QgZnJvbSB0aGUgRE8uCmNvbnN0IF9sYXN0U2VxPW5ldyBNYXAoKTsKCmZ1bmN0aW9uIF9uZXh0SWQoKXsgcmV0dXJuIFN0cmluZygrK19yZXFJZCk7IH0KCi8vIOKUgOKUgCBQZW5kaW5nLXNwbGl0IHNhZmV0eSBuZXQg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACmZ1bmN0aW9uIF9zYXZlUGVuZGluZ1NwbGl0KGxhbmUsIGtleSwgcGF5bG9hZCkgewogIHRyeSB7CiAgICBjb25zdCBxID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnX3BlbmRpbmdTcGxpdHMnKSB8fCAnW10nKTsKICAgIGlmICghcS5maW5kKGUgPT4gZS5rZXkgPT09IGtleSkpIHEucHVzaCh7IGxhbmUsIGtleSwgcGF5bG9hZCwgY2Fybml2YWxDb2RlIH0pOwogICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ19wZW5kaW5nU3BsaXRzJywgSlNPTi5zdHJpbmdpZnkocSkpOwogIH0gY2F0Y2goZSkge30KfQpmdW5jdGlvbiBfY2xlYXJQZW5kaW5nU3BsaXQoa2V5KSB7CiAgdHJ5IHsKICAgIGNvbnN0IHEgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdfcGVuZGluZ1NwbGl0cycpIHx8ICdbXScpOwogICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ19wZW5kaW5nU3BsaXRzJywgSlNPTi5zdHJpbmdpZnkocS5maWx0ZXIoZSA9PiBlLmtleSAhPT0ga2V5KSkpOwogIH0gY2F0Y2goZSkge30KfQphc3luYyBmdW5jdGlvbiBfcmV0cnlQZW5kaW5nU3BsaXRzKCkgewogIHRyeSB7CiAgICBjb25zdCBxID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnX3BlbmRpbmdTcGxpdHMnKSB8fCAnW10nKTsKICAgIGlmICghcS5sZW5ndGgpIHJldHVybjsKICAgIGZvciAoY29uc3QgZSBvZiBxKSB7CiAgICAgIGlmIChlLmNhcm5pdmFsQ29kZSAhPT0gY2Fybml2YWxDb2RlKSBjb250aW51ZTsKICAgICAgdHJ5IHsKICAgICAgICBhd2FpdCBjUmVmKGByYWNlL2N1cnJlbnQvc3BsaXRzLyR7ZS5sYW5lfS8ke2Uua2V5fWApLnNldChlLnBheWxvYWQpOwogICAgICAgIF9jbGVhclBlbmRpbmdTcGxpdChlLmtleSk7CiAgICAgICAgdG9hc3QoJ1NhdmVkIHNwbGl0IHNlbnQg4pyTJyk7CiAgICAgIH0gY2F0Y2goZXJyKSB7fQogICAgfQogIH0gY2F0Y2goZSkge30KfQoKZnVuY3Rpb24gX3dzQ29ubmVjdFRvKGNvZGUpewogIGlmKF93cyAmJiBfd3NDb2RlPT09Y29kZSAmJiAoX3dzLnJlYWR5U3RhdGU9PT0wfHxfd3MucmVhZHlTdGF0ZT09PTEpKSByZXR1cm47CiAgaWYoX3dzKXt0cnl7X3dzLm9uY2xvc2U9bnVsbDtfd3MuY2xvc2UoKTt9Y2F0Y2h7fX0KICBfd3NDb2RlPWNvZGU7IF93c1JlYWR5PWZhbHNlOwogIF93cz1uZXcgV2ViU29ja2V0KGB3c3M6Ly8ke1dTX0hPU1R9L3dzLyR7Y29kZX1gKTsKICBfd3Mub25vcGVuPSgpPT57CiAgICBfd3NSZWFkeT10cnVlOyBjbGVhclRpbWVvdXQoX3JlY29ublRpbWVyKTsKICAgIC8vIFJlcGxheSBhbnkgd3JpdGVzIGJ1ZmZlcmVkIHdoaWxlIGRpc2Nvbm5lY3RlZAogICAgX21zZ0J1Zi5zcGxpY2UoMCkuZm9yRWFjaChtPT5fd3Muc2VuZChtKSk7CiAgICAvLyBSZXRyeSBhbnkgc3BsaXRzIHRoYXQgd2VyZSBsb3N0IGR1cmluZyBhIHByZXZpb3VzIGRpc2Nvbm5lY3QKICAgIHNldFRpbWVvdXQoX3JldHJ5UGVuZGluZ1NwbGl0cywgMzAwKTsKICAgIC8vIFJlLXN1YnNjcmliZSB0byBhbGwgcGF0aHMg4oCUIERPIHNlbmRzIGEgZnJlc2ggc25hcHNob3QgZm9yIGVhY2gsCiAgICAvLyB3aGljaCBoYW5kbGVzIGFueSBnYXAgYWNjdW11bGF0ZWQgZHVyaW5nIHRoZSBkaXNjb25uZWN0aW9uLgogICAgZm9yKGNvbnN0IHAgb2YgX3N1YnNjcmlwdGlvbnMua2V5cygpKSBpZighcC5zdGFydHNXaXRoKCdfXycpKQogICAgICBfd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7dHlwZTonc3Vic2NyaWJlJyxwYXRoOnB9KSk7CiAgICBfbm90aWZ5Q29ubih0cnVlKTsKICB9OwogIF93cy5vbmNsb3NlPV93cy5vbmVycm9yPSgpPT57CiAgICBfd3NSZWFkeT1mYWxzZTsgX25vdGlmeUNvbm4oZmFsc2UpOwogICAgZm9yKGNvbnN0IFsscl0gb2YgX3BlbmRpbmdSZXFzKXtjbGVhclRpbWVvdXQoci50aW1lcik7ci5yZWplY3QobmV3IEVycm9yKCd3cyBjbG9zZWQnKSk7fQogICAgX3BlbmRpbmdSZXFzLmNsZWFyKCk7CiAgICBpZihfd3NDb2RlKSBfcmVjb25uVGltZXI9c2V0VGltZW91dCgoKT0+X3dzQ29ubmVjdFRvKF93c0NvZGUpLDI1MDApOwogIH07CiAgX3dzLm9ubWVzc2FnZT0oe2RhdGF9KT0+ewogICAgY29uc3QgbXNnPUpTT04ucGFyc2UoZGF0YSk7CiAgICAvLyBSZXNvbHZlIHBlbmRpbmcgcmVxdWVzdCAoZ2V0L3NldC91cGRhdGUvcHVzaC9ldGMuKQogICAgaWYobXNnLmlkICYmIF9wZW5kaW5nUmVxcy5oYXMobXNnLmlkKSl7CiAgICAgIGNvbnN0IHI9X3BlbmRpbmdSZXFzLmdldChtc2cuaWQpOwogICAgICBjbGVhclRpbWVvdXQoci50aW1lcik7X3BlbmRpbmdSZXFzLmRlbGV0ZShtc2cuaWQpO3IucmVzb2x2ZShtc2cpOwogICAgfQogICAgaWYobXNnLnR5cGU9PT0nc25hcHNob3QnICYmIG1zZy5wYXRoIT1udWxsKXsKICAgICAgLy8gR2FwIGRldGVjdGlvbjogaWYgc2VxIGp1bXBlZCwgd2UgcmUtc3Vic2NyaWJlIHRvIGdldCBhdXRob3JpdGF0aXZlIHN0YXRlLgogICAgICAvLyAoU25hcHNob3RzIGFscmVhZHkgY2FycnkgZnVsbCBzdGF0ZSBzbyB0aGUgcmUtc3Vic2NyaWJlIHNuYXBzaG90IGZpeGVzIGl0LikKICAgICAgaWYobXNnLnNlcSE9bnVsbCl7CiAgICAgICAgY29uc3QgbGFzdD1fbGFzdFNlcS5nZXQobXNnLnBhdGgpOwogICAgICAgIGlmKGxhc3QhPW51bGwgJiYgbXNnLnNlcSA+IGxhc3QrMSAmJiBfd3NSZWFkeSl7CiAgICAgICAgICAvLyBHYXAgZGV0ZWN0ZWQg4oCUIHJlLXN1YnNjcmliZSBpbW1lZGlhdGVseSBmb3IgYSBndWFyYW50ZWVkIGZyZXNoIHNuYXBzaG90CiAgICAgICAgICBfd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7dHlwZTonc3Vic2NyaWJlJyxwYXRoOm1zZy5wYXRofSkpOwogICAgICAgIH0KICAgICAgICBfbGFzdFNlcS5zZXQobXNnLnBhdGgsIG1zZy5zZXEpOwogICAgICB9CiAgICAgIGNvbnN0IGNicz1fc3Vic2NyaXB0aW9ucy5nZXQobXNnLnBhdGgpOwogICAgICBpZihjYnMpe2NvbnN0IHM9X3NuYXAobXNnLnBhdGgsbXNnLmRhdGEpO2Nicy5mb3JFYWNoKGM9PmMocykpO30KICAgIH0KICB9Owp9CmZ1bmN0aW9uIF93c1JlYWR5MigpeyByZXR1cm4gbmV3IFByb21pc2UoKHJlcyxyZWopPT57IGlmKF93c1JlYWR5KXJldHVybiByZXMoKTsgY29uc3QgdD1zZXRUaW1lb3V0KCgpPT5yZWoobmV3IEVycm9yKCd3cyB0aW1lb3V0JykpLDgwMDApOyBjb25zdCBpdj1zZXRJbnRlcnZhbCgoKT0+e2lmKF93c1JlYWR5KXtjbGVhclRpbWVvdXQodCk7Y2xlYXJJbnRlcnZhbChpdik7cmVzKCk7fX0sNTApOyB9KTsgfQpmdW5jdGlvbiBfbm90aWZ5Q29ubih2KXsKICBjb25zdCBiYW5uZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVjb25uZWN0LWJhbm5lcicpOwogIGlmIChiYW5uZXIpIGJhbm5lci5zdHlsZS5kaXNwbGF5ID0gdiA/ICdub25lJyA6ICdibG9jayc7CiAgY29uc3QgY2JzPV9zdWJzY3JpcHRpb25zLmdldCgnX19jb25uZWN0ZWRfXycpO2lmKGNicyl7Y29uc3Qgcz1fc25hcCgnY29ubmVjdGVkJyx2KTtjYnMuZm9yRWFjaChjPT5jKHMpKTt9Cn0KZnVuY3Rpb24gX3NuYXAocGF0aCxkYXRhKXsgcmV0dXJuIHt2YWw6KCk9PmRhdGEsIGV4aXN0czooKT0+ZGF0YSE9bnVsbCwga2V5OnBhdGguc3BsaXQoJy8nKS5wb3AoKX07IH0KZnVuY3Rpb24gX3NlbmQobXNnKXsgcmV0dXJuIG5ldyBQcm9taXNlKChyZXMscmVqKT0+eyBjb25zdCBpZD1fbmV4dElkKCk7bXNnLmlkPWlkO2NvbnN0IHN0cj1KU09OLnN0cmluZ2lmeShtc2cpO2NvbnN0IHRpbWVyPXNldFRpbWVvdXQoKCk9PntfcGVuZGluZ1JlcXMuZGVsZXRlKGlkKTtyZWoobmV3IEVycm9yKCd3cyB0aW1lb3V0JykpO30sMTAwMDApO19wZW5kaW5nUmVxcy5zZXQoaWQse3Jlc29sdmU6cmVzLHJlamVjdDpyZWosdGltZXJ9KTsgaWYoX3dzUmVhZHkpX3dzLnNlbmQoc3RyKTtlbHNlIF9tc2dCdWYucHVzaChzdHIpOyB9KTsgfQpmdW5jdGlvbiBfcmVmKHBhdGgpeyByZXR1cm4geyBvbmNlOigpPT5fc2VuZCh7dHlwZTonZ2V0JyxwYXRofSkudGhlbihyPT5fc25hcChwYXRoLHIuZGF0YSkpLCBzZXQ6KHYpPT5fc2VuZCh7dHlwZTonc2V0JyxwYXRoLGRhdGE6dn0pLCB1cGRhdGU6KHYpPT5fc2VuZCh7dHlwZTondXBkYXRlJyxwYXRoLGRhdGE6dn0pLCBwdXNoOih2KT0+X3NlbmQoe3R5cGU6J3B1c2gnLHBhdGgsZGF0YTp2fSkudGhlbihyPT4oe2tleTpyLmtleX0pKSwgcmVtb3ZlOigpPT5fc2VuZCh7dHlwZToncmVtb3ZlJyxwYXRofSksIG9uOihldixjYik9PnsgaWYoIV9zdWJzY3JpcHRpb25zLmhhcyhwYXRoKSlfc3Vic2NyaXB0aW9ucy5zZXQocGF0aCxuZXcgU2V0KCkpOyBfc3Vic2NyaXB0aW9ucy5nZXQocGF0aCkuYWRkKGNiKTsgaWYoX3dzUmVhZHkpX3dzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe3R5cGU6J3N1YnNjcmliZScscGF0aH0pKTsgX3NlbmQoe3R5cGU6J2dldCcscGF0aH0pLnRoZW4ocj0+Y2IoX3NuYXAocGF0aCxyLmRhdGEpKSkuY2F0Y2goKCk9Pnt9KTsgfSwgb2ZmOigpPT57IF9zdWJzY3JpcHRpb25zLmRlbGV0ZShwYXRoKTsgaWYoX3dzUmVhZHkpX3dzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe3R5cGU6J3Vuc3Vic2NyaWJlJyxwYXRofSkpOyB9IH07IH0KY29uc3QgZmlyZWJhc2U9e2RhdGFiYXNlOntTZXJ2ZXJWYWx1ZTp7VElNRVNUQU1QOnsnLnN2JzondGltZXN0YW1wJ319fX07CmNvbnN0IGRiPXtyZWY6KHBhdGgpPT57CiAgaWYocGF0aD09PScuaW5mby9zZXJ2ZXJUaW1lT2Zmc2V0JykgcmV0dXJuIHtvbmNlOmFzeW5jKCk9Pntjb25zdCByPWF3YWl0IF9zZW5kKHt0eXBlOidzZXJ2ZXJ0aW1lJ30pO3JldHVybiBfc25hcChwYXRoLHIudHMtRGF0ZS5ub3coKSk7fX07CiAgaWYocGF0aD09PScuaW5mby9jb25uZWN0ZWQnKSByZXR1cm4ge29uOihldixjYik9PnsgaWYoIV9zdWJzY3JpcHRpb25zLmhhcygnX19jb25uZWN0ZWRfXycpKV9zdWJzY3JpcHRpb25zLnNldCgnX19jb25uZWN0ZWRfXycsbmV3IFNldCgpKTsgX3N1YnNjcmlwdGlvbnMuZ2V0KCdfX2Nvbm5lY3RlZF9fJykuYWRkKGNiKTsgY2IoX3NuYXAocGF0aCxfd3NSZWFkeSkpOyB9fTsKICByZXR1cm4gX3JlZihwYXRoKTsKfX07CmNvbnN0IF9fZmJBdXRoUmVhZHkgPSBQcm9taXNlLnJlc29sdmUoKTsKCi8vIOKUgOKUgCBTdGF0ZSDilIDilIAKbGV0IF9jYXJuaXZhbENvZGVWYWwgPSAnJzsKT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdywgJ2Nhcm5pdmFsQ29kZScsIHsKICBnZXQ6ICgpID0+IF9jYXJuaXZhbENvZGVWYWwsCiAgc2V0OiAodikgPT4geyBfY2Fybml2YWxDb2RlVmFsID0gdjsgaWYodikgX3dzQ29ubmVjdFRvKHYpOyB9Cn0pOwpsZXQgY2Fybml2YWxNZXRhID0gbnVsbDsKbGV0IG15TmFtZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdmbF9uYW1lJykgfHwgJyc7CmxldCBteUlkICAgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnZmxfaWQnKSB8fCBnZW5JZCg4KTsKbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZsX2lkJywgbXlJZCk7CmxldCBteUxhbmUgPSAwOwpsZXQgc2VydmVyT2Zmc2V0ID0gMDsKbGV0IHdha2VMb2NrID0gbnVsbDsKbGV0IHJhZklkID0gbnVsbDsKbGV0IHJhY2VTdGF0ZSA9IG51bGw7CmxldCB4Y1N0YXRlICAgPSBudWxsOwpsZXQgYWRtaW5HZW5kZXIgPSAnYm95cyc7CmxldCB4Y0dlbmRlciAgICA9ICdib3lzJzsKbGV0IHNlbFNwb3J0ID0gJ3RyYWNrJzsKbGV0IHNlbFRpZXIgID0gJ3NjaG9vbCc7CmxldCBhY3RpdmVMaXN0ZW5lcnMgPSBbXTsKbGV0IGNvdW50ZG93blJ1bm5pbmcgPSBmYWxzZTsKbGV0IGRxU2V0ID0gbmV3IFNldCgpOwpsZXQgZG5zU2V0ID0gbmV3IFNldCgpOwpsZXQgZG5mU2V0ID0gbmV3IFNldCgpOwpsZXQgcHJvZ3JhbUluZGV4ID0gMDsKLy8gUHJvZ3JhbSBidWlsZGVyIHJvd3MKY29uc3QgcHJvZ3JhbVJvd3MgPSBbXTsKZnVuY3Rpb24gYWRkUHJvZ3JhbVJvdyhhZ2U9JycsIGdlbmRlcj0nYm95cycsIGV2ZW50PScnKSB7CiAgY29uc3QgaWQgPSBEYXRlLm5vdygpICsgTWF0aC5yYW5kb20oKTsKICBwcm9ncmFtUm93cy5wdXNoKGlkKTsKICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvZ3JhbS1yb3dzJyk7CiAgaWYgKCFjb250YWluZXIpIHJldHVybjsKICBjb25zdCByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTsKICByb3cuaWQgPSBgcHJvZy1yb3ctJHtpZH1gOwogIHJvdy5zdHlsZS5jc3NUZXh0ID0gJ2Rpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDkwcHggMWZyIDI4cHg7Z2FwOjVweDttYXJnaW4tYm90dG9tOjZweDthbGlnbi1pdGVtczpjZW50ZXInOwogIHJvdy5pbm5lckhUTUwgPSBgPGlucHV0IGNsYXNzPSJwcm9nLWFnZSIgZGF0YS1waWQ9IiR7aWR9IiBwbGFjZWhvbGRlcj0iOSBZZWFycyIgdmFsdWU9IiR7YWdlfSIKICAgICAgc3R5bGU9InBhZGRpbmc6N3B4IDhweDtib3JkZXItcmFkaXVzOjhweDtib3JkZXI6MXB4IHNvbGlkIHZhcigtLWJvcmRlcik7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlMik7Y29sb3I6dmFyKC0tdGV4dCk7Zm9udC1zaXplOi44MnJlbTt3aWR0aDoxMDAlIj4KICAgIDxzZWxlY3QgY2xhc3M9InByb2ctZ2VuZGVyIiBkYXRhLXBpZD0iJHtpZH0iCiAgICAgIHN0eWxlPSJwYWRkaW5nOjdweCA2cHg7Ym9yZGVyLXJhZGl1czo4cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO2JhY2tncm91bmQ6dmFyKC0tc3VyZmFjZTIpO2NvbG9yOnZhcigtLXRleHQpO2ZvbnQtc2l6ZTouODJyZW07d2lkdGg6MTAwJSI+CiAgICAgIDxvcHRpb24gdmFsdWU9ImJveXMiICR7Z2VuZGVyPT09J2JveXMnPydzZWxlY3RlZCc6Jyd9PkJveXM8L29wdGlvbj4KICAgICAgPG9wdGlvbiB2YWx1ZT0iZ2lybHMiICR7Z2VuZGVyPT09J2dpcmxzJz8nc2VsZWN0ZWQnOicnfT5HaXJsczwvb3B0aW9uPgogICAgICA8b3B0aW9uIHZhbHVlPSJtaXhlZCIgJHtnZW5kZXI9PT0nbWl4ZWQnPydzZWxlY3RlZCc6Jyd9Pk1peGVkPC9vcHRpb24+CiAgICA8L3NlbGVjdD4KICAgIDxpbnB1dCBjbGFzcz0icHJvZy1ldmVudCIgZGF0YS1waWQ9IiR7aWR9IiBwbGFjZWhvbGRlcj0iMTAwbSIgdmFsdWU9IiR7ZXZlbnR9IgogICAgICBzdHlsZT0icGFkZGluZzo3cHggOHB4O2JvcmRlci1yYWRpdXM6OHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tYm9yZGVyKTtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UyKTtjb2xvcjp2YXIoLS10ZXh0KTtmb250LXNpemU6LjgycmVtO3dpZHRoOjEwMCUiPgogICAgPGJ1dHRvbiB0eXBlPSJidXR0b24iIG9uY2xpY2s9InJlbW92ZVByb2dyYW1Sb3coJHtpZH0pIgogICAgICBzdHlsZT0iYmFja2dyb3VuZDpub25lO2JvcmRlcjpub25lO2NvbG9yOnZhcigtLW11dGVkKTtmb250LXNpemU6MXJlbTtjdXJzb3I6cG9pbnRlcjtwYWRkaW5nOjRweDtib3JkZXItcmFkaXVzOjZweCI+4pyVPC9idXR0b24+YDsKICBjb250YWluZXIuYXBwZW5kQ2hpbGQocm93KTsKfQpmdW5jdGlvbiByZW1vdmVQcm9ncmFtUm93KGlkKSB7CiAgY29uc3QgaWR4ID0gcHJvZ3JhbVJvd3MuaW5kZXhPZihpZCk7CiAgaWYgKGlkeCA+IC0xKSBwcm9ncmFtUm93cy5zcGxpY2UoaWR4LCAxKTsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgcHJvZy1yb3ctJHtpZH1gKT8ucmVtb3ZlKCk7Cn0KZnVuY3Rpb24gZ2V0UHJvZ3JhbURhdGEoKSB7CiAgcmV0dXJuIHByb2dyYW1Sb3dzLm1hcChpZCA9PiAoewogICAgYWdlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucHJvZy1hZ2VbZGF0YS1waWQ9IiR7aWR9Il1gKT8udmFsdWUudHJpbSgpfHwnJywKICAgIGdlbmRlcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByb2ctZ2VuZGVyW2RhdGEtcGlkPSIke2lkfSJdYCk/LnZhbHVlfHwnYm95cycsCiAgICBldmVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgLnByb2ctZXZlbnRbZGF0YS1waWQ9IiR7aWR9Il1gKT8udmFsdWUudHJpbSgpfHwnJwogIH0pKS5maWx0ZXIociA9PiByLmFnZSAmJiByLmV2ZW50KTsKfSAvLyBsYW5lcyBEUSdkIGluIGN1cnJlbnQgZG9uZSBwYW5lbAoKLy8g4pSA4pSAIEV2ZW50IExpc3RzIOKUgOKUgApjb25zdCBFVkVOVFMgPSB7CiAgdHJhY2s6IFsnMTAwbSBTcHJpbnQnLCcyMDBtIFNwcmludCcsJzQwMG0nLCc4MDBtJywnMTUwMG0nLCc0w5cxMDBtIFJlbGF5JywnTG9uZyBKdW1wJywnVHJpcGxlIEp1bXAnLCdIaWdoIEp1bXAnLCdTaG90IFB1dCcsJ0Rpc2N1cycsJ0phdmVsaW4nXSwKICBzd2ltOiAgWyc1MG0gRnJlZXN0eWxlJywnNTBtIEJhY2tzdHJva2UnLCc1MG0gQnJlYXN0c3Ryb2tlJywnNTBtIEJ1dHRlcmZseScsJzEwMG0gRnJlZXN0eWxlJywnMTAwbSBCYWNrc3Ryb2tlJywnMTAwbSBCcmVhc3RzdHJva2UnLCcyMDBtIEZyZWVzdHlsZScsJzTDlzUwbSBGcmVlc3R5bGUgUmVsYXknLCc0w5c1MG0gTWVkbGV5IFJlbGF5J10sCiAgeGM6ICAgIFsnQ3Jvc3MgQ291bnRyeSAya20nLCdDcm9zcyBDb3VudHJ5IDNrbScsJ0Nyb3NzIENvdW50cnkgNGttJywnQ3Jvc3MgQ291bnRyeSA1a20nLCdGdW4gUnVuIDFrbScsJ0Z1biBSdW4gMmttJywnRnVuIFJ1biAza20nXSwKICBtaXhlZDogWycxMDBtIFNwcmludCcsJzIwMG0gU3ByaW50JywnNDAwbScsJzgwMG0nLCc1MG0gRnJlZXN0eWxlJywnNTBtIEJhY2tzdHJva2UnLCdDcm9zcyBDb3VudHJ5IDJrbScsJ0Nyb3NzIENvdW50cnkgM2ttJywnTG9uZyBKdW1wJywnSGlnaCBKdW1wJ10KfTsKY29uc3QgQUdFX0dST1VQUyA9IFsnOSBZZWFycycsJzEwIFllYXJzJywnMTEgWWVhcnMnLCcxMi8xMyBZZWFycycsJ09wZW4nLCdZZWFyIDMvNCcsJ1llYXIgNS82JywnWWVhciAz4oCTNiddOwpjb25zdCBMQU5FX0NPVU5UID0gODsKCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAovLyBVVElMSVRJRVMKLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCmZ1bmN0aW9uIGdlbklkKG49OCkgewogIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMiwgMituKS50b1VwcGVyQ2FzZSgpOwp9CgpmdW5jdGlvbiBnZW5Db2RlKCkgewogIGNvbnN0IGNoYXJzID0gJ0FCQ0RFRkdISktMTU5QUVJTVFVWV1hZWic7CiAgbGV0IGMgPSAnJzsKICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykgYyArPSBjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjaGFycy5sZW5ndGgpXTsKICByZXR1cm4gYzsKfQoKZnVuY3Rpb24gZm10TXMobXMpIHsKICBpZiAobXMgPT0gbnVsbCB8fCBtcyA8IDApIHJldHVybiAn4oCUJzsKICBjb25zdCB0b3RhbENzID0gTWF0aC5mbG9vcihtcyAvIDEwKTsKICBjb25zdCBjcyAgPSB0b3RhbENzICUgMTAwOwogIGNvbnN0IHRvdGFsU2VjID0gTWF0aC5mbG9vcih0b3RhbENzIC8gMTAwKTsKICBjb25zdCBzZWMgPSB0b3RhbFNlYyAlIDYwOwogIGNvbnN0IG1pbiA9IE1hdGguZmxvb3IodG90YWxTZWMgLyA2MCk7CiAgaWYgKG1pbiA+IDApIHJldHVybiBgJHttaW59OiR7cGFkKHNlYyl9LiR7cGFkKGNzKX1gOwogIHJldHVybiBgJHtzZWN9LiR7cGFkKGNzKX1gOwp9CgpmdW5jdGlvbiBmbXRTZWMobXMpIHsKICBpZiAobXMgPT0gbnVsbCkgcmV0dXJuICfigJQnOwogIHJldHVybiAobXMgLyAxMDAwKS50b0ZpeGVkKDIpICsgJ3MnOwp9CgpmdW5jdGlvbiBwYWQobikgeyByZXR1cm4gU3RyaW5nKG4pLnBhZFN0YXJ0KDIsJzAnKTsgfQoKZnVuY3Rpb24gbm93U2VydmVyKCkgeyByZXR1cm4gRGF0ZS5ub3coKSArIHNlcnZlck9mZnNldDsgfQoKZnVuY3Rpb24gb3JkaW5hbChuKSB7CiAgY29uc3QgcyA9IFsndGgnLCdzdCcsJ25kJywncmQnXTsKICBjb25zdCB2ID0gbiAlIDEwMDsKICByZXR1cm4gbiArIChzWyh2IC0gMjApICUgMTBdIHx8IHNbdl0gfHwgc1swXSk7Cn0KCmZ1bmN0aW9uIHRyaW1tZWRNZWFuKHZhbHVlcykgewogIGlmICghdmFsdWVzIHx8IHZhbHVlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsOwogIGlmICh2YWx1ZXMubGVuZ3RoIDw9IDIpIHJldHVybiB2YWx1ZXMucmVkdWNlKChhLGIpPT5hK2IsMCkvdmFsdWVzLmxlbmd0aDsKICBjb25zdCBzb3J0ZWQgPSBbLi4udmFsdWVzXS5zb3J0KChhLGIpPT5hLWIpOwogIGNvbnN0IGlubmVyID0gc29ydGVkLnNsaWNlKDEsLTEpOwogIHJldHVybiBpbm5lci5yZWR1Y2UoKGEsYik9PmErYiwwKS9pbm5lci5sZW5ndGg7Cn0KCmZ1bmN0aW9uIGNvbmZpZGVuY2VGb3Ioc3BsaXRzT2JqKSB7CiAgY29uc3QgdmFscyA9IE9iamVjdC52YWx1ZXMoc3BsaXRzT2JqfHx7fSkubWFwKHM9PnMuZWxhcHNlZE1zKS5maWx0ZXIoQm9vbGVhbik7CiAgaWYgKHZhbHMubGVuZ3RoID09PSAwKSByZXR1cm4geyBjbHM6J0xPVycsIGxhYmVsOidObyB0aW1lcnMnIH07CiAgaWYgKHZhbHMubGVuZ3RoID09PSAxKSByZXR1cm4geyBjbHM6J0NIRUNLJywgbGFiZWw6JzEgdGltZXInIH07CiAgY29uc3Qgc3ByZWFkID0gTWF0aC5tYXgoLi4udmFscykgLSBNYXRoLm1pbiguLi52YWxzKTsKICBpZiAodmFscy5sZW5ndGggPj0gMyAmJiBzcHJlYWQgPCAzMDApIHJldHVybiB7IGNsczonSElHSCcsIGxhYmVsOidISUdIJyB9OwogIGlmICh2YWxzLmxlbmd0aCA+PSAyICYmIHNwcmVhZCA8IDYwMCkgcmV0dXJuIHsgY2xzOidPSycsIGxhYmVsOidPSycgfTsKICBpZiAoc3ByZWFkIDwgMTUwMCkgcmV0dXJuIHsgY2xzOidDSEVDSycsIGxhYmVsOidDSEVDSycgfTsKICByZXR1cm4geyBjbHM6J0xPVycsIGxhYmVsOidESVNBR1JFRScgfTsKfQoKZnVuY3Rpb24gZmJFbmMocykgewogIHJldHVybiBTdHJpbmcocykucmVwbGFjZSgvXC4vZywnX19EX18nKS5yZXBsYWNlKC9cLy9nLCdfX1NfXycpCiAgICAucmVwbGFjZSgvXFsvZywnX19MQl9fJykucmVwbGFjZSgvXF0vZywnX19SQl9fJykKICAgIC5yZXBsYWNlKC8jL2csJ19fSF9fJykucmVwbGFjZSgvXCQvZywnX18kX18nKTsKfQoKLy8g4pSA4pSAIFVJIGhlbHBlcnMg4pSA4pSACmZ1bmN0aW9uIHNob3dTY3JlZW4oaWQpIHsKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2NyZWVuJykuZm9yRWFjaChzID0+IHMuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJykpOwogIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjcmVlbi0nICsgaWQpOwogIGlmIChlbCkgeyBlbC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTsgd2luZG93LnNjcm9sbFRvKDAsMCk7IH0KfQoKZnVuY3Rpb24gdG9hc3QobXNnLCBkdXI9MjIwMCkgewogIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvYXN0Jyk7CiAgZWwudGV4dENvbnRlbnQgPSBtc2c7CiAgZWwuY2xhc3NMaXN0LmFkZCgnc2hvdycpOwogIGNsZWFyVGltZW91dChlbC5fdCk7CiAgZWwuX3QgPSBzZXRUaW1lb3V0KCgpPT5lbC5jbGFzc0xpc3QucmVtb3ZlKCdzaG93JyksIGR1cik7Cn0KCmZ1bmN0aW9uIG1vZGFsKHRpdGxlLCBib2R5LCBidXR0b25zKSB7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLXR0bCcpLnRleHRDb250ZW50ID0gdGl0bGU7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWJkeScpLnRleHRDb250ZW50ID0gYm9keTsKICBjb25zdCB3cmFwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGFsLWJ0bnMtd3JhcCcpOwogIHdyYXAuaW5uZXJIVE1MID0gJyc7CiAgYnV0dG9ucy5mb3JFYWNoKGIgPT4gewogICAgY29uc3QgYnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7CiAgICBidG4uY2xhc3NOYW1lID0gJ2J0biAnICsgKGIuY2xzfHwnYnRuLXNlY29uZGFyeScpOwogICAgYnRuLnRleHRDb250ZW50ID0gYi5sYWJlbDsKICAgIGJ0bi5vbmNsaWNrID0gKCkgPT4geyBjbG9zZU1vZGFsKCk7IGIuZm4gJiYgYi5mbigpOyB9OwogICAgd3JhcC5hcHBlbmRDaGlsZChidG4pOwogIH0pOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1iZCcpLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpOwp9CgpmdW5jdGlvbiBjbG9zZU1vZGFsKCkgewogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RhbC1iZCcpLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpOwp9CgpmdW5jdGlvbiB2aWJyYXRlKHBhdCkgeyB0cnkgeyBuYXZpZ2F0b3IudmlicmF0ZSAmJiBuYXZpZ2F0b3IudmlicmF0ZShwYXQpOyB9IGNhdGNoKGUpe30gfQoKZnVuY3Rpb24gZmxhc2godHlwZSwgZHVyPTQ1MCkgewogIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZsYXNoLW92ZXJsYXknKTsKICBlbC5jbGFzc05hbWUgPSB0eXBlOwogIHNldFRpbWVvdXQoKCk9PmVsLmNsYXNzTmFtZT0nJywgZHVyKTsKfQoKZnVuY3Rpb24gdGFwRmxhc2goKSB7CiAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGFwLWZsYXNoJyk7CiAgZWwuY2xhc3NMaXN0LmFkZCgnc2hvdycpOwogIHNldFRpbWVvdXQoKCk9PmVsLmNsYXNzTGlzdC5yZW1vdmUoJ3Nob3cnKSwgMTgwKTsKfQoKLy8g4pSA4pSAIENsb2NrIHN5bmMg4pSA4pSACmFzeW5jIGZ1bmN0aW9uIHN5bmNDbG9jaygpIHsKICBjb25zdCBzbmFwID0gYXdhaXQgZGIucmVmKCcuaW5mby9zZXJ2ZXJUaW1lT2Zmc2V0Jykub25jZSgndmFsdWUnKTsKICBzZXJ2ZXJPZmZzZXQgPSBzbmFwLnZhbCgpIHx8IDA7Cn0KCmFzeW5jIGZ1bmN0aW9uIGdldFNlcnZlclRpbWUoKSB7CiAgY29uc3Qgc25hcCA9IGF3YWl0IGRiLnJlZignLmluZm8vc2VydmVyVGltZU9mZnNldCcpLm9uY2UoJ3ZhbHVlJyk7CiAgcmV0dXJuIERhdGUubm93KCkgKyAoc25hcC52YWwoKSB8fCAwKTsKfQoKLy8g4pSA4pSAIFdha2UgbG9jayDilIDilIAKYXN5bmMgZnVuY3Rpb24gcmVxdWVzdFdha2VMb2NrKCkgewogIHRyeSB7IGlmICgnd2FrZUxvY2snIGluIG5hdmlnYXRvcikgd2FrZUxvY2sgPSBhd2FpdCBuYXZpZ2F0b3Iud2FrZUxvY2sucmVxdWVzdCgnc2NyZWVuJyk7IH0KICBjYXRjaChlKXt9Cn0KCi8vIFJlLWFjcXVpcmUgd2FrZSBsb2NrIHdoZW4gdGFiIGNvbWVzIGJhY2sgdG8gZm9yZWdyb3VuZApkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd2aXNpYmlsaXR5Y2hhbmdlJywgKCkgPT4gewogIGlmIChkb2N1bWVudC52aXNpYmlsaXR5U3RhdGUgPT09ICd2aXNpYmxlJykgcmVxdWVzdFdha2VMb2NrKCk7Cn0pOwoKLy8gV2FybiBiZWZvcmUgY2xvc2luZyBpZiByYWNlIGlzIGxpdmUKd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsIGUgPT4gewogIGlmIChyYWNlU3RhdGU/LnN0YXRlID09PSAnbGl2ZScpIHsKICAgIGUucHJldmVudERlZmF1bHQoKTsKICAgIGUucmV0dXJuVmFsdWUgPSAnQSByYWNlIGlzIGN1cnJlbnRseSBsaXZlIOKAlCB0aW1pbmcgZGF0YSBtYXkgYmUgbG9zdCBpZiB5b3UgbGVhdmUuJzsKICB9Cn0pOwoKLy8g4pSA4pSAIEZpcmViYXNlIGhlbHBlcnMg4pSA4pSACmZ1bmN0aW9uIGNSZWYocGF0aCkgeyByZXR1cm4gZGIucmVmKHBhdGgpOyB9CgpmdW5jdGlvbiBjbGVhbkxpc3RlbmVycygpIHsKICBhY3RpdmVMaXN0ZW5lcnMuZm9yRWFjaChmbj0+Zm4oKSk7CiAgYWN0aXZlTGlzdGVuZXJzID0gW107CiAgaWYgKHJhZklkKSB7IGNhbmNlbEFuaW1hdGlvbkZyYW1lKHJhZklkKTsgcmFmSWQgPSBudWxsOyB9Cn0KCmZ1bmN0aW9uIHdhdGNoQ29ubihkb3RJZCkgewogIGRiLnJlZignLmluZm8vY29ubmVjdGVkJykub24oJ3ZhbHVlJywgc25hcCA9PiB7CiAgICBjb25zdCBlbCAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkb3RJZCk7CiAgICBjb25zdCB0eHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkb3RJZCArICctbGJsJyk7CiAgICBjb25zdCBsaXZlID0gc25hcC52YWwoKSA9PT0gdHJ1ZTsKICAgIGlmIChlbCkgIGVsLmNsYXNzTGlzdC50b2dnbGUoJ2xpdmUnLCBsaXZlKTsKICAgIGlmICh0eHQpIHsgdHh0LnRleHRDb250ZW50ID0gbGl2ZSA/ICdMSVZFJyA6ICdPRkZMSU5FJzsgdHh0LnN0eWxlLmNvbG9yID0gbGl2ZSA/ICd2YXIoLS1zdWNjZXNzKScgOiAndmFyKC0tZGFuZ2VyKSc7IH0KICB9KTsKfQoKLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCi8vIFNFVFVQIFNDUkVFTgovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKZnVuY3Rpb24gc2VsZWN0U3BvcnQocykgewogIHNlbFNwb3J0ID0gczsKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc3BvcnQtYnRuJykuZm9yRWFjaChiPT5iLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKTsKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuc3BvcnQtYnRuW2RhdGEtc3BvcnQ9IiR7c30iXWApLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpOwp9CgpmdW5jdGlvbiBzZWxlY3RUaWVyKHQpIHsKICBzZWxUaWVyID0gdDsKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcucGlsbFtkYXRhLXRpZXJdJykuZm9yRWFjaChwPT5wLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKTsKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAucGlsbFtkYXRhLXRpZXI9IiR7dH0iXWApLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpOwp9CgovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKLy8gREVNTyBNT0RFCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkApjb25zdCBERU1PX0FUSExFVEVTID0gWydBaWRlbiBTbWl0aCcsJ0JlbiBDYXJ0ZXInLCdDaHJpcyBMZWUnLCdEYW5hIFBhcmsnLCdFbW1hIFdoaXRlJywnRmlubiBUYXlsb3InLCdHdXMgQnJvd24nLCdIYXJwZXIgSm9uZXMnXTsKCmFzeW5jIGZ1bmN0aW9uIHN0YXJ0RGVtbygpIHsKICB0b2FzdCgnU2V0dGluZyB1cCBkZW1v4oCmJyk7CiAgbGV0IGNvZGUsIHNuYXA7CiAgZG8gewogICAgY29kZSA9IGdlbkNvZGUoKTsKICAgIGNhcm5pdmFsQ29kZSA9IGNvZGU7IGF3YWl0IF93c1JlYWR5MigpOyBzbmFwID0gYXdhaXQgZGIucmVmKCdtZXRhJykub25jZSgndmFsdWUnKTsKICB9IHdoaWxlIChzbmFwLmV4aXN0cygpKTsKCiAgY2Fybml2YWxDb2RlID0gY29kZTsKICBjYXJuaXZhbE1ldGEgPSB7CiAgICBzY2hvb2w6ICdEZW1vIENhcm5pdmFsJywKICAgIG5hbWU6ICcxMDBtIFNwcmludCBEZW1vJywKICAgIHNwb3J0OiAndHJhY2snLAogICAgdGllcjogJ3NjaG9vbCcsCiAgICBjb2xvdXI6ICcjZjU5ZTBiJywKICAgIGlzRGVtbzogdHJ1ZSwKICAgIGNyZWF0ZWRBdDogZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QCiAgfTsKICBhcHBseUFjY2VudCgnI2Y1OWUwYicpOwogIGF3YWl0IGRiLnJlZignbWV0YScpLnNldChjYXJuaXZhbE1ldGEpOwogIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdmbF9sYXN0X2NvZGUnLCBjb2RlKTsKCiAgc2hvd1NjcmVlbignYWRtaW4nKTsKICBpbml0QWRtaW5WaWV3KCk7CgogIC8vIFByZS1maWxsIGF0aGxldGUgbmFtZXMgYW5kIHNjcm9sbCBkZW1vIGJhbm5lciBpbnRvIHZpZXcKICBzZXRUaW1lb3V0KCgpID0+IHsKICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hZG1pbi1sYW5lLW5hbWUtaW5wdXQnKS5mb3JFYWNoKChpbnAsIGkpID0+IHsKICAgICAgaWYgKERFTU9fQVRITEVURVNbaV0pIGlucC52YWx1ZSA9IERFTU9fQVRITEVURVNbaV07CiAgICB9KTsKICAgIGNvbnN0IGJhbm5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1kZW1vLWJhbm5lcicpOwogICAgaWYgKGJhbm5lcikgYmFubmVyLnNjcm9sbEludG9WaWV3KHtiZWhhdmlvcjonc21vb3RoJywgYmxvY2s6J3N0YXJ0J30pOwogICAgdG9hc3QoYERlbW8gcmVhZHkg4oCUICR7Y29kZX0uIFNoYXJlIHRoZSBjb2RlIG9yIFFSIHdpdGggeW91ciB0aW1lcnMsIHRoZW4gYXJtIHRoZSByYWNlLmApOwogIH0sIDMwMCk7Cn0KCmZ1bmN0aW9uIGNvcHlEZW1vQ29kZSgpIHsKICBjb25zdCBjb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbW8tY29kZS1kaXNwbGF5JykudGV4dENvbnRlbnQ7CiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQpIHsKICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGNvZGUpLnRoZW4oKCkgPT4gdG9hc3QoJ0NvZGUgY29waWVkJykpOwogIH0gZWxzZSB7CiAgICAvLyBmYWxsYmFjawogICAgY29uc3QgdGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZXh0YXJlYScpOwogICAgdGEudmFsdWUgPSBjb2RlOyBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRhKTsKICAgIHRhLnNlbGVjdCgpOyBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpOyBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRhKTsKICAgIHRvYXN0KCdDb2RlIGNvcGllZCcpOwogIH0KfQoKZnVuY3Rpb24gaW5pdERlbW9CYW5uZXIoKSB7CiAgaWYgKCFjYXJuaXZhbE1ldGE/LmlzRGVtbykgcmV0dXJuOwogIGNvbnN0IGJhbm5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1kZW1vLWJhbm5lcicpOwogIGlmICghYmFubmVyKSByZXR1cm47CiAgYmFubmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpOwoKICBjb25zdCBjb2RlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGVtby1jb2RlLWRpc3BsYXknKTsKICBpZiAoY29kZUVsKSBjb2RlRWwudGV4dENvbnRlbnQgPSBjYXJuaXZhbENvZGU7CgogIGNvbnN0IGpvaW5VcmwgPSBgaHR0cHM6Ly9jYXJuaXZhbHRpbWluZy5jb20vP2pvaW49JHtjYXJuaXZhbENvZGV9YDsKICBjb25zdCBxckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlbW8tcXItY2FudmFzJyk7CiAgaWYgKHFyRWwgJiYgdHlwZW9mIFFSQ29kZSAhPT0gJ3VuZGVmaW5lZCcpIHsKICAgIHFyRWwuaW5uZXJIVE1MID0gJyc7CiAgICBuZXcgUVJDb2RlKHFyRWwsIHsgdGV4dDogam9pblVybCwgd2lkdGg6IDEyOCwgaGVpZ2h0OiAxMjgsCiAgICAgIGNvbG9yRGFyazogJyMwMDAwMDAnLCBjb2xvckxpZ2h0OiAnI2ZmZmZmZicgfSk7CiAgfQp9Cgphc3luYyBmdW5jdGlvbiBjcmVhdGVDYXJuaXZhbCgpIHsKICBjb25zdCBzY2hvb2wgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2V0dXAtc2Nob29sJykudmFsdWUudHJpbSgpOwogIGNvbnN0IG5hbWUgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZXR1cC1uYW1lJykudmFsdWUudHJpbSgpOwogIGlmICghc2Nob29sIHx8ICFuYW1lKSB7IHRvYXN0KCdFbnRlciBzY2hvb2wgbmFtZSBhbmQgZXZlbnQgbmFtZScpOyByZXR1cm47IH0KCiAgY29uc3QgY29sb3VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHVwLWNvbG91cicpLnZhbHVlLnRyaW0oKSB8fCAnIzE0YjhhNic7CiAgYXBwbHlBY2NlbnQoY29sb3VyKTsKCiAgLy8gRmluZCB1bmlxdWUgY29kZQogIGxldCBjb2RlLCBzbmFwOwogIGRvIHsKICAgIGNvZGUgPSBnZW5Db2RlKCk7CiAgICBjYXJuaXZhbENvZGUgPSBjb2RlOyBhd2FpdCBfd3NSZWFkeTIoKTsgc25hcCA9IGF3YWl0IGRiLnJlZignbWV0YScpLm9uY2UoJ3ZhbHVlJyk7CiAgfSB3aGlsZSAoc25hcC5leGlzdHMoKSk7CgogIGNhcm5pdmFsQ29kZSA9IGNvZGU7CiAgY29uc3QgaG91c2VzUmF3ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NldHVwLWhvdXNlcycpPy52YWx1ZS50cmltKCl8fCcnOwogIGNvbnN0IGhvdXNlcyA9IGhvdXNlc1JhdyA/IGhvdXNlc1Jhdy5zcGxpdCgnLCcpLm1hcChoPT5oLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pIDogW107CiAgY29uc3QgcHJvZ3JhbSA9IGdldFByb2dyYW1EYXRhKCk7CiAgY2Fybml2YWxNZXRhID0geyBzY2hvb2wsIG5hbWUsIHNwb3J0OnNlbFNwb3J0LCB0aWVyOnNlbFRpZXIsIGNvbG91ciwKICAgIGhvdXNlcywgcHJvZ3JhbSwKICAgIGNyZWF0ZWRBdDogZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QIH07CgogIGF3YWl0IGRiLnJlZignbWV0YScpLnNldChjYXJuaXZhbE1ldGEpOwogIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdmbF9sYXN0X2NvZGUnLCBjb2RlKTsKCiAgdG9hc3QoYENhcm5pdmFsIGNyZWF0ZWQg4oCUICR7Y29kZX1gKTsKICBzaG93Um9sZVBpY2tlcigpOwogIC8vIEFkbWluIGF1dG8tbmF2aWdhdGVzIHRvIHRoZWlyIGNvbnRyb2wgcGFuZWwKICBzZXRUaW1lb3V0KCgpID0+IGVudGVyUm9sZSgnYWRtaW4nKSwgNjAwKTsKfQoKZnVuY3Rpb24gYXBwbHlBY2NlbnQoY29sb3VyKSB7CiAgaWYgKCFjb2xvdXIgfHwgIS9eI1swLTlhLWZBLUZdezMsNn0kLy50ZXN0KGNvbG91cikpIHJldHVybjsKICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJy0tYWNjZW50JywgY29sb3VyKTsKfQoKLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCi8vIEpPSU4KLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCmFzeW5jIGZ1bmN0aW9uIGpvaW5DYXJuaXZhbChyb2xlSGludCkgewogIGNvbnN0IGNvZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9pbi1jb2RlLWlucHV0JykudmFsdWUudHJpbSgpLnRvVXBwZXJDYXNlKCk7CiAgY29uc3QgbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqb2luLW5hbWUtaW5wdXQnKS52YWx1ZS50cmltKCk7CiAgY29uc3QgaXNPYnNlcnZlciA9IHJvbGVIaW50ID09PSAnb2JzZXJ2ZXInOwogIGlmIChjb2RlLmxlbmd0aCA8IDQpIHsgdG9hc3QoJ0VudGVyIDQtbGV0dGVyIGNvZGUnKTsgcmV0dXJuOyB9CiAgaWYgKCFuYW1lICYmICFpc09ic2VydmVyKSB7IHRvYXN0KCdFbnRlciB5b3VyIG5hbWUnKTsgcmV0dXJuOyB9CgogIGNhcm5pdmFsQ29kZSA9IGNvZGU7IGF3YWl0IF93c1JlYWR5MigpOyBjb25zdCBzbmFwID0gYXdhaXQgZGIucmVmKCdtZXRhJykub25jZSgndmFsdWUnKTsKICBjb25zdCBlcnJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqb2luLWVycm9yJyk7CiAgaWYgKCFzbmFwLmV4aXN0cygpKSB7CiAgICBlcnJFbC50ZXh0Q29udGVudCA9ICdDYXJuaXZhbCBub3QgZm91bmQg4oCUIGNoZWNrIHRoZSBjb2RlJzsKICAgIGVyckVsLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpOwogICAgcmV0dXJuOwogIH0KICBlcnJFbC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKCiAgY2Fybml2YWxDb2RlID0gY29kZTsKICBjYXJuaXZhbE1ldGEgPSBzbmFwLnZhbCgpOwogIG15TmFtZSA9IG5hbWU7CiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZsX25hbWUnLCBuYW1lKTsKICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnZmxfbGFzdF9jb2RlJywgY29kZSk7CiAgaWYgKGNhcm5pdmFsTWV0YS5jb2xvdXIpIGFwcGx5QWNjZW50KGNhcm5pdmFsTWV0YS5jb2xvdXIpOwoKICBpZiAoaXNPYnNlcnZlcikgeyBlbnRlclJvbGUoJ29ic2VydmVyJyk7IHJldHVybjsgfQogIHNob3dSb2xlUGlja2VyKCk7Cn0KCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAovLyBST0xFIFBJQ0tFUgovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKZnVuY3Rpb24gc2hvd1JvbGVQaWNrZXIoKSB7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JvbGUtc2Nob29sLW5hbWUnKS50ZXh0Q29udGVudCA9IGNhcm5pdmFsTWV0YT8uc2Nob29sIHx8ICdDYXJuaXZhbCBUaW1pbmcnOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb2xlLWNhcm5pdmFsLW5hbWUnKS50ZXh0Q29udGVudCA9IGNhcm5pdmFsTWV0YT8ubmFtZSB8fCAnJzsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9sZS1qb2luZWQtbmFtZScpLnRleHRDb250ZW50ID0gY2Fybml2YWxNZXRhPy5uYW1lIHx8ICcnOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb2xlLWpvaW5lZC1jb2RlJykudGV4dENvbnRlbnQgPSBgQ29kZTogJHtjYXJuaXZhbENvZGV9YDsKICBjb25zdCBleHBpcmVzTm90ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb2xlLWV4cGlyZXMtbm90ZScpOwogIGlmIChleHBpcmVzTm90ZSAmJiBjYXJuaXZhbE1ldGE/LmV4cGlyZXNBdCkgewogICAgY29uc3QgZGF5c0xlZnQgPSBNYXRoLmNlaWwoKGNhcm5pdmFsTWV0YS5leHBpcmVzQXQgLSBEYXRlLm5vdygpKSAvIDg2NDAwMDAwKTsKICAgIGlmIChkYXlzTGVmdCA+IDApIHsKICAgICAgZXhwaXJlc05vdGUudGV4dENvbnRlbnQgPSBgRXhwaXJlcyBpbiAke2RheXNMZWZ0fSBkYXkke2RheXNMZWZ0PT09MT8nJzoncyd9YDsKICAgICAgZXhwaXJlc05vdGUuc3R5bGUuZGlzcGxheSA9ICcnOwogICAgfSBlbHNlIHsKICAgICAgZXhwaXJlc05vdGUudGV4dENvbnRlbnQgPSAnVGhpcyBjYXJuaXZhbCBoYXMgZXhwaXJlZCc7CiAgICAgIGV4cGlyZXNOb3RlLnN0eWxlLmNvbG9yID0gJ3ZhcigtLXdhcm4pJzsKICAgICAgZXhwaXJlc05vdGUuc3R5bGUuZGlzcGxheSA9ICcnOwogICAgfQogIH0KCiAgY29uc3Qgc3BvcnQgPSBjYXJuaXZhbE1ldGE/LnNwb3J0IHx8ICd0cmFjayc7CiAgY29uc3QgZ3JpZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyb2xlLWdyaWQnKTsKICBjb25zdCByb2xlcyA9IFtdOwoKICBpZiAoWyd0cmFjaycsJ3N3aW0nLCdtaXhlZCddLmluY2x1ZGVzKHNwb3J0KSkgewogICAgcm9sZXMucHVzaCh7IGlkOid0aW1lcicsICAgIGljb246Jzxzdmcgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgYXJpYS1oaWRkZW49InRydWUiIHN0eWxlPSJ2ZXJ0aWNhbC1hbGlnbjptaWRkbGUiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTMiIHI9IjgiLz48cGF0aCBkPSJNMTIgOXY0bDIgMk05IDJoNiIvPjwvc3ZnPicsIGxhYmVsOidUaW1lcicsICAgICAgICBkZXNjOidUaW1lIGEgbGFuZScgfSk7CiAgICByb2xlcy5wdXNoKHsgaWQ6J2FkbWluJywgICAgaWNvbjonPHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBhcmlhLWhpZGRlbj0idHJ1ZSIgc3R5bGU9InZlcnRpY2FsLWFsaWduOm1pZGRsZSI+PGxpbmUgeDE9IjQiIHkxPSIyMSIgeDI9IjQiIHkyPSIxNCIvPjxsaW5lIHgxPSI0IiB5MT0iMTAiIHgyPSI0IiB5Mj0iMyIvPjxsaW5lIHgxPSIxMiIgeTE9IjIxIiB4Mj0iMTIiIHkyPSIxMiIvPjxsaW5lIHgxPSIxMiIgeTE9IjgiIHgyPSIxMiIgeTI9IjMiLz48bGluZSB4MT0iMjAiIHkxPSIyMSIgeDI9IjIwIiB5Mj0iMTYiLz48bGluZSB4MT0iMjAiIHkxPSIxMiIgeDI9IjIwIiB5Mj0iMyIvPjxsaW5lIHgxPSIxIiB5MT0iMTQiIHgyPSI3IiB5Mj0iMTQiLz48bGluZSB4MT0iOSIgeTE9IjgiIHgyPSIxNSIgeTI9IjgiLz48bGluZSB4MT0iMTciIHkxPSIxNiIgeDI9IjIzIiB5Mj0iMTYiLz48L3N2Zz4nLCBsYWJlbDonUmFjZSBDb250cm9sJywgZGVzYzonQXJtICYgbWFuYWdlIHJhY2VzJyB9KTsKICAgIHJvbGVzLnB1c2goeyBpZDonc3RhcnRlcicsICBpY29uOic8c3ZnIHdpZHRoPSIyMiIgaGVpZ2h0PSIyMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBzdHlsZT0idmVydGljYWwtYWxpZ246bWlkZGxlIj48cGF0aCBkPSJNNiA4YTYgNiAwIDAgMSAxMiAwYzAgNyAzIDkgMyA5SDNzMy0yIDMtOSIvPjxwYXRoIGQ9Ik0xMC4zIDIxYTEuOTQgMS45NCAwIDAgMCAzLjQgMCIvPjwvc3ZnPicsIGxhYmVsOidTdGFydGVyJywgICAgICBkZXNjOidGaXJlIHRoZSBndW4nIH0pOwogICAgcm9sZXMucHVzaCh7IGlkOidvYnNlcnZlcicsIGljb246Jzxzdmcgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgYXJpYS1oaWRkZW49InRydWUiIHN0eWxlPSJ2ZXJ0aWNhbC1hbGlnbjptaWRkbGUiPjxwYXRoIGQ9Ik0xIDEyczQtOCAxMS04IDExIDggMTEgOC00IDgtMTEgOC0xMS04LTExLTh6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMyIvPjwvc3ZnPicsIGxhYmVsOidPYnNlcnZlcicsICAgICBkZXNjOidXYXRjaCBsaXZlIHJlc3VsdHMnIH0pOwogIH0KICBpZiAoWyd4YycsJ21peGVkJ10uaW5jbHVkZXMoc3BvcnQpKSB7CiAgICByb2xlcy5wdXNoKHsgaWQ6J21hcnNoYWwnLCAgIGljb246Jzxzdmcgd2lkdGg9IjIyIiBoZWlnaHQ9IjIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgYXJpYS1oaWRkZW49InRydWUiIHN0eWxlPSJ2ZXJ0aWNhbC1hbGlnbjptaWRkbGUiPjxwYXRoIGQ9Ik0xMiAyMlY4TTUgOGw3LTYgNyA2TTMgMjJoMThNOSAyMlYxNmg2djYiLz48L3N2Zz4nLCBsYWJlbDonRmluaXNoIE1hcnNoYWwnLCBkZXNjOidUYXAgZWFjaCBmaW5pc2hlcicsICAgICBmdWxsOiBzcG9ydD09PSJ4YyIgfSk7CiAgICByb2xlcy5wdXNoKHsgaWQ6J2FkbWluLXhjJywgIGljb246Jzxzdmcgd2lkdGg9IjI4IiBoZWlnaHQ9IjI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgYXJpYS1oaWRkZW49InRydWUiIHN0eWxlPSJ2ZXJ0aWNhbC1hbGlnbjptaWRkbGUiPjxsaW5lIHgxPSI0IiB5MT0iMjEiIHgyPSI0IiB5Mj0iMTQiLz48bGluZSB4MT0iNCIgeTE9IjEwIiB4Mj0iNCIgeTI9IjMiLz48bGluZSB4MT0iMTIiIHkxPSIyMSIgeDI9IjEyIiB5Mj0iMTIiLz48bGluZSB4MT0iMTIiIHkxPSI4IiB4Mj0iMTIiIHkyPSIzIi8+PGxpbmUgeDE9IjIwIiB5MT0iMjEiIHgyPSIyMCIgeTI9IjE2Ii8+PGxpbmUgeDE9IjIwIiB5MT0iMTIiIHgyPSIyMCIgeTI9IjMiLz48bGluZSB4MT0iMSIgeTE9IjE0IiB4Mj0iNyIgeTI9IjE0Ii8+PGxpbmUgeDE9IjkiIHkxPSI4IiB4Mj0iMTUiIHkyPSI4Ii8+PGxpbmUgeDE9IjE3IiB5MT0iMTYiIHgyPSIyMyIgeTI9IjE2Ii8+PC9zdmc+JywgbGFiZWw6J1hDIENvbnRyb2wnLCAgICBkZXNjOidBcm0gJiBtYW5hZ2UgWEMgcmFjZXMnLCBmdWxsOiBzcG9ydD09PSd4YycgfSk7CiAgICByb2xlcy5wdXNoKHsgaWQ6J29ic2VydmVyLXhjJyxpY29uOic8c3ZnIHdpZHRoPSIyOCIgaGVpZ2h0PSIyOCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBzdHlsZT0idmVydGljYWwtYWxpZ246bWlkZGxlIj48cGF0aCBkPSJNMSAxMnM0LTggMTEtOCAxMSA4IDExIDgtNCA4LTExIDgtMTEtOC0xMS04eiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjMiLz48L3N2Zz4nLGxhYmVsOidYQyBPYnNlcnZlcicsICAgZGVzYzonV2F0Y2ggZmluaXNoIG9yZGVyJywgICAgZnVsbDogc3BvcnQ9PT0neGMnIH0pOwogIH0KICBpZiAoWyd0cmFjaycsJ3N3aW0nLCdtaXhlZCddLmluY2x1ZGVzKHNwb3J0KSkgewogICAgcm9sZXMucHVzaCh7IGlkOid2aWRlby1maW5pc2gnLCBpY29uOic8c3ZnIHdpZHRoPSIyNiIgaGVpZ2h0PSIyNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBzdHlsZT0idmVydGljYWwtYWxpZ246bWlkZGxlIj48cGF0aCBkPSJNMjMgN2wtNyA1IDcgNVY3eiIvPjxyZWN0IHg9IjEiIHk9IjUiIHdpZHRoPSIxNSIgaGVpZ2h0PSIxNCIgcng9IjIiLz48L3N2Zz4nLCBsYWJlbDonVmlkZW8gRmluaXNoJywgZGVzYzonRnJhbWUtYWNjdXJhdGUgYXV0by10aW1pbmcnLCBmdWxsOnRydWUgfSk7CiAgfQogIHJvbGVzLnB1c2goeyBpZDonc2hhcmUnLCAgIGljb246Jzxzdmcgd2lkdGg9IjIyIiBoZWlnaHQ9IjIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgYXJpYS1oaWRkZW49InRydWUiIHN0eWxlPSJ2ZXJ0aWNhbC1hbGlnbjptaWRkbGUiPjxyZWN0IHg9IjUiIHk9IjIiIHdpZHRoPSIxNCIgaGVpZ2h0PSIyMCIgcng9IjIiLz48cGF0aCBkPSJNMTIgMThoLjAxIi8+PC9zdmc+JywgbGFiZWw6J0pvaW4gUGFnZScsICBkZXNjOidRUiBjb2RlIGZvciBwYXJ0aWNpcGFudHMnLCBmdWxsOnRydWUgfSk7CiAgcm9sZXMucHVzaCh7IGlkOidyZXN1bHRzJywgaWNvbjonPHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBhcmlhLWhpZGRlbj0idHJ1ZSIgc3R5bGU9InZlcnRpY2FsLWFsaWduOm1pZGRsZSI+PGxpbmUgeDE9IjE4IiB5MT0iMjAiIHgyPSIxOCIgeTI9IjEwIi8+PGxpbmUgeDE9IjEyIiB5MT0iMjAiIHgyPSIxMiIgeTI9IjQiLz48bGluZSB4MT0iNiIgeTE9IjIwIiB4Mj0iNiIgeTI9IjE0Ii8+PC9zdmc+JywgbGFiZWw6J1Jlc3VsdHMnLCAgICBkZXNjOidWaWV3IGFsbCByZXN1bHRzJywgICAgICAgICAgZnVsbDp0cnVlIH0pOwoKICBncmlkLmlubmVySFRNTCA9IHJvbGVzLm1hcChyID0+IGAKICAgIDxkaXYgY2xhc3M9InJvbGUtY2FyZCR7ci5mdWxsPycgZnVsbCc6Jyd9IiBvbmNsaWNrPSJlbnRlclJvbGUoJyR7ci5pZH0nKSI+CiAgICAgIDxkaXYgY2xhc3M9InItaWNvbiI+JHtyLmljb259PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9InItbGFiZWwiPiR7ci5sYWJlbH08L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ici1kZXNjIj4ke3IuZGVzY308L2Rpdj4KICAgIDwvZGl2PmApLmpvaW4oJycpOwoKICBzaG93U2NyZWVuKCdyb2xlJyk7Cn0KCgovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKLy8gQURNSU4gUElOCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkApmdW5jdGlvbiBfY2hlY2tBZG1pblBpbihvblN1Y2Nlc3MpIHsKICBjb25zdCBzdG9yZWRQaW4gPSBjYXJuaXZhbE1ldGE/LmFkbWluUGluOwogIGlmICghc3RvcmVkUGluKSB7CiAgICAvLyBObyBQSU4gc2V0IOKAlCBsZXQgdGhlbSBpbiwgb2ZmZXIgdG8gc2V0IG9uZQogICAgb25TdWNjZXNzKCk7CiAgICBfb2ZmZXJTZXRQaW4oKTsKICAgIHJldHVybjsKICB9CiAgX3Bpbk1vZGFsKCdFbnRlciBBZG1pbiBQSU4nLCAoZW50ZXJlZCkgPT4gewogICAgaWYgKGVudGVyZWQgPT09IG51bGwpIHJldHVybjsgLy8gY2FuY2VsbGVkCiAgICBpZiAoU3RyaW5nKGVudGVyZWQpID09PSBTdHJpbmcoc3RvcmVkUGluKSkgewogICAgICBvblN1Y2Nlc3MoKTsKICAgIH0gZWxzZSB7CiAgICAgIHRvYXN0KCdJbmNvcnJlY3QgUElOJyk7CiAgICB9CiAgfSk7Cn0KCmFzeW5jIGZ1bmN0aW9uIF9vZmZlclNldFBpbigpIHsKICAvLyBOb24tYmxvY2tpbmcgbnVkZ2Ug4oCUIHNob3duIGFmdGVyIGFkbWluIGxvYWRzLCB1c2VzIGN1c3RvbSBtb2RhbCAobm8gY29uZmlybSgpKQogIHNldFRpbWVvdXQoKCkgPT4gewogICAgaWYgKGNhcm5pdmFsTWV0YT8uYWRtaW5QaW4pIHJldHVybjsgLy8gYWxyZWFkeSBzZXQgYnkgbm93CiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOwogICAgZWwuaWQgPSAnb2ZmZXItcGluLW1vZGFsJzsKICAgIGVsLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsLjY1KTt6LWluZGV4Ojk5OTk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6MTZweCc7CiAgICBlbC5pbm5lckhUTUwgPSBgCiAgICAgIDxkaXYgc3R5bGU9ImJhY2tncm91bmQ6dmFyKC0tc3VyZmFjZSk7Ym9yZGVyLXJhZGl1czoxNnB4O3BhZGRpbmc6MjBweDttYXgtd2lkdGg6MzAwcHg7d2lkdGg6MTAwJTt0ZXh0LWFsaWduOmNlbnRlciI+CiAgICAgICAgPGRpdiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxcmVtO21hcmdpbi1ib3R0b206OHB4Ij5Qcm90ZWN0IFJhY2UgQ29udHJvbD88L2Rpdj4KICAgICAgICA8ZGl2IHN0eWxlPSJjb2xvcjp2YXIoLS1tdXRlZCk7Zm9udC1zaXplOi44NXJlbTttYXJnaW4tYm90dG9tOjE2cHgiPlNldCBhIDQtZGlnaXQgUElOIHNvIG9ubHkgeW91IGNhbiBhY2Nlc3MgUmFjZSBDb250cm9sIG9uIHRoaXMgY2Fybml2YWwuPC9kaXY+CiAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDo4cHgiPgogICAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJmbGV4OjEiIG9uY2xpY2s9ImRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvZmZlci1waW4tbW9kYWwnKT8ucmVtb3ZlKCkiPlNraXA8L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tcHJpbWFyeSIgc3R5bGU9ImZsZXg6MSIgb25jbGljaz0iZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29mZmVyLXBpbi1tb2RhbCcpPy5yZW1vdmUoKTtfcGluTW9kYWwoJ0Nob29zZSBhIDQtZGlnaXQgUElOJyxhc3luYyhwaW4pPT57aWYocGluPT09bnVsbHx8cGluLmxlbmd0aDwxKXJldHVybjtjYXJuaXZhbE1ldGE9ey4uLihjYXJuaXZhbE1ldGF8fHt9KSxhZG1pblBpbjpTdHJpbmcocGluKX07YXdhaXQgY1JlZignbWV0YScpLnVwZGF0ZSh7YWRtaW5QaW46U3RyaW5nKHBpbil9KTt0b2FzdCgnUElOIHNldCDinJMnKTt9LHRydWUpIj5TZXQgUElOPC9idXR0b24+CiAgICAgICAgPC9kaXY+CiAgICAgIDwvZGl2PmA7CiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsKTsKICB9LCA4MDApOwp9CgpmdW5jdGlvbiBfcGluTW9kYWwodGl0bGUsIGNhbGxiYWNrLCBpc05ldykgewogIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgZWwuaWQgPSAncGluLW1vZGFsJzsKICBlbC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmZpeGVkO2luc2V0OjA7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLC43KTt6LWluZGV4Ojk5OTk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6MTZweCc7CiAgZWwuaW5uZXJIVE1MID0gYAogICAgPGRpdiBzdHlsZT0iYmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlKTtib3JkZXItcmFkaXVzOjE2cHg7cGFkZGluZzoyMHB4O21heC13aWR0aDoyODBweDt3aWR0aDoxMDAlO3RleHQtYWxpZ246Y2VudGVyIj4KICAgICAgPGRpdiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxcmVtO21hcmdpbi1ib3R0b206MTJweCI+JHt0aXRsZX08L2Rpdj4KICAgICAgPGRpdiBpZD0icGluLWRpc3BsYXkiIHN0eWxlPSJmb250LXNpemU6MnJlbTtsZXR0ZXItc3BhY2luZzouNGVtO2ZvbnQtZmFtaWx5Om1vbm9zcGFjZTttaW4taGVpZ2h0OjIuNXJlbTttYXJnaW4tYm90dG9tOjEycHgiPl9fX188L2Rpdj4KICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczpyZXBlYXQoMywxZnIpO2dhcDo4cHg7bWFyZ2luLWJvdHRvbTo4cHgiPgogICAgICAgICR7WzEsMiwzLDQsNSw2LDcsOCw5XS5tYXAobj0+YDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBzdHlsZT0iZm9udC1zaXplOjEuMnJlbTtwYWRkaW5nOjEycHggMCIgb25jbGljaz0iX3BpbktleSgnJHtufScpIj4ke259PC9idXR0b24+YCkuam9pbignJyl9CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJmb250LXNpemU6MXJlbTtwYWRkaW5nOjEycHggMCIgb25jbGljaz0iX3BpbktleSgnZGVsJykiPuKMqzwvYnV0dG9uPgogICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBzdHlsZT0iZm9udC1zaXplOjEuMnJlbTtwYWRkaW5nOjEycHggMCIgb25jbGljaz0iX3BpbktleSgnMCcpIj4wPC9idXR0b24+CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJmb250LXNpemU6MXJlbTtwYWRkaW5nOjEycHggMCIgb25jbGljaz0iX3BpbktleSgnb2snKSI+T0s8L2J1dHRvbj4KICAgICAgPC9kaXY+CiAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBzdHlsZT0id2lkdGg6MTAwJTttYXJnaW4tdG9wOjRweCIgb25jbGljaz0iX3BpbktleSgnY2FuY2VsJykiPkNhbmNlbDwvYnV0dG9uPgogICAgPC9kaXY+YDsKICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsKTsKICBsZXQgcGluVmFsID0gJyc7CiAgZnVuY3Rpb24gcmVmcmVzaCgpIHsKICAgIGNvbnN0IGRpc3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGluLWRpc3BsYXknKTsKICAgIGlmIChkaXNwKSBkaXNwLnRleHRDb250ZW50ID0gcGluVmFsLnNwbGl0KCcnKS5tYXAoKCk9Pifil48nKS5qb2luKCcgJykucGFkRW5kKDcsJ18nKS5yZXBsYWNlKC8gXyAvZywnIF8gJykgfHwgJ19fX18nOwogIH0KICB3aW5kb3cuX3BpbktleSA9IChrKSA9PiB7CiAgICBpZiAoayA9PT0gJ2NhbmNlbCcpIHsgZWwucmVtb3ZlKCk7IGRlbGV0ZSB3aW5kb3cuX3BpbktleTsgY2FsbGJhY2sobnVsbCk7IHJldHVybjsgfQogICAgaWYgKGsgPT09ICdkZWwnKSB7IHBpblZhbCA9IHBpblZhbC5zbGljZSgwLC0xKTsgcmVmcmVzaCgpOyByZXR1cm47IH0KICAgIGlmIChrID09PSAnb2snKSB7CiAgICAgIGlmIChwaW5WYWwubGVuZ3RoID09PSAwKSByZXR1cm47CiAgICAgIGVsLnJlbW92ZSgpOyBkZWxldGUgd2luZG93Ll9waW5LZXk7IGNhbGxiYWNrKHBpblZhbCk7IHJldHVybjsKICAgIH0KICAgIGlmIChwaW5WYWwubGVuZ3RoIDwgOCkgeyBwaW5WYWwgKz0gazsgcmVmcmVzaCgpOyB9CiAgICBpZiAocGluVmFsLmxlbmd0aCA9PT0gNCAmJiAhaXNOZXcpIHsgZWwucmVtb3ZlKCk7IGRlbGV0ZSB3aW5kb3cuX3BpbktleTsgY2FsbGJhY2socGluVmFsKTsgfQogIH07Cn0KCmZ1bmN0aW9uIGVudGVyUm9sZShyb2xlKSB7CiAgY2xlYW5MaXN0ZW5lcnMoKTsKICBpZiAocm9sZSA9PT0gJ3RpbWVyJykgewogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JvbGUtZ3JpZCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgICBjb25zdCBwaWNrZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncm9sZS1sYW5lLXBpY2tlcicpOwogICAgcGlja2VyLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpOwogICAgcGlja2VyLnN0eWxlLm1hcmdpblRvcCA9ICcwJzsKICAgIGNvbnN0IGJ0bnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbGFuZS1waWNrLWJ0bnMnKTsKICAgIGJ0bnMuaW5uZXJIVE1MID0KICAgICAgYDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBzdHlsZT0id2lkdGg6MTAwJTttYXJnaW4tYm90dG9tOjEycHg7Zm9udC1zaXplOjAuOXJlbSIgb25jbGljaz0ic2hvd1JvbGVQaWNrZXIoKSI+4oaQIEJhY2sgdG8gcm9sZXM8L2J1dHRvbj5gICsKICAgICAgQXJyYXkuZnJvbSh7bGVuZ3RoOkxBTkVfQ09VTlR9LChfLGkpPT5pKzEpCiAgICAgICAgLm1hcChuPT5gPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IiBzdHlsZT0ibWluLWhlaWdodDo2NHB4O2ZvbnQtc2l6ZToxLjJyZW07Zm9udC13ZWlnaHQ6NzAwO2ZsZXg6MTttaW4td2lkdGg6ODBweCIgb25jbGljaz0iZW50ZXJUaW1lckxhbmUoJHtufSkiPkxhbmUgJHtufTwvYnV0dG9uPmApCiAgICAgICAgLmpvaW4oJycpOwogICAgc2V0VGltZW91dCgoKSA9PiBwaWNrZXIuc2Nyb2xsSW50b1ZpZXcoe2JlaGF2aW9yOidzbW9vdGgnLCBibG9jazonc3RhcnQnfSksIDUwKTsKICAgIHJldHVybjsKICB9CiAgaWYgKHJvbGUgPT09ICdzaGFyZScpICAgeyBzaG93U2hhcmVQYWdlKCk7IHJldHVybjsgfQogIGlmIChyb2xlID09PSAnYWRtaW4nKSAgIHsgX2NoZWNrQWRtaW5QaW4oKCkgPT4geyBzaG93U2NyZWVuKCdhZG1pbicpOyBpbml0QWRtaW5WaWV3KCk7IH0pOyByZXR1cm47IH0KICBpZiAocm9sZSA9PT0gJ3N0YXJ0ZXInKSB7IHNob3dTY3JlZW4oJ3N0YXJ0ZXInKTsgICAgIGluaXRTdGFydGVyVmlldygpOyAgICByZXR1cm47IH0KICBpZiAocm9sZSA9PT0gJ29ic2VydmVyJyl7IHNob3dTY3JlZW4oJ29ic2VydmVyJyk7ICAgIGluaXRPYnNlcnZlclZpZXcoKTsgICByZXR1cm47IH0KICBpZiAocm9sZSA9PT0gJ21hcnNoYWwnKSB7IHNob3dTY3JlZW4oJ21hcnNoYWwnKTsgICAgIGluaXRNYXJzaGFsVmlldygpOyAgICByZXR1cm47IH0KICBpZiAocm9sZSA9PT0gJ2FkbWluLXhjJyl7IHNob3dTY3JlZW4oJ2FkbWluLXhjJyk7ICAgaW5pdFhDQWRtaW5WaWV3KCk7ICAgIHJldHVybjsgfQogIGlmIChyb2xlID09PSAnb2JzZXJ2ZXIteGMnKXsgc2hvd1NjcmVlbignb2JzZXJ2ZXIteGMnKTsgaW5pdFhDT2JzZXJ2ZXJWaWV3KCk7IHJldHVybjsgfQogIGlmIChyb2xlID09PSAncmVzdWx0cycpICAgICAgeyBzaG93U2NyZWVuKCdyZXN1bHRzJyk7ICAgICAgaW5pdFJlc3VsdHNWaWV3KCk7ICAgcmV0dXJuOyB9CiAgaWYgKHJvbGUgPT09ICd2aWRlby1maW5pc2gnKSB7IHNob3dTY3JlZW4oJ3ZpZGVvLWZpbmlzaCcpOyBpbml0VmlkZW9GaW5pc2goKTsgICByZXR1cm47IH0KICBpZiAocm9sZSA9PT0gJ3JvbGUnKSAgICAgICAgIHsgc2hvd1JvbGVQaWNrZXIoKTsgICAgICAgICAgICByZXR1cm47IH0KfQoKZnVuY3Rpb24gZW50ZXJUaW1lckxhbmUobikgewogIG15TGFuZSA9IG47CiAgY2xlYW5MaXN0ZW5lcnMoKTsKICBzaG93U2NyZWVuKCd0aW1lcicpOwogIGluaXRUaW1lclZpZXcobik7Cn0KCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAovLyBUSU1FUiBWSUVXIChMYW5lIFJhY2UpCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkApmdW5jdGlvbiBpbml0VGltZXJWaWV3KGxhbmUpIHsKICByZXF1ZXN0V2FrZUxvY2soKTsKICBzeW5jQ2xvY2soKTsKICB3YXRjaENvbm4oJ3RpbWVyLWRvdCcpOwoKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXItbGFuZS1sYWJlbCcpLnRleHRDb250ZW50ID0gYExhbmUgJHtsYW5lfWA7CgogIC8vIE5hbWUgZ2F0ZQogIGNvbnN0IG5hbWVJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aW1lci1uYW1lLWlucHV0Jyk7CiAgY29uc3Qgc3RvcEJ0biAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbWVyLXN0b3AtYnRuJyk7CiAgaWYgKG15TmFtZSkgeyBuYW1lSW5wdXQudmFsdWUgPSBteU5hbWU7IHN0b3BCdG4ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpOyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXItbmFtZS1nYXRlJykuc3R5bGUuZGlzcGxheT0nbm9uZSc7IH0KICBuYW1lSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoKT0+ewogICAgbXlOYW1lID0gbmFtZUlucHV0LnZhbHVlLnRyaW0oKTsKICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdmbF9uYW1lJywgbXlOYW1lKTsKICAgIG15TmFtZSA/IHN0b3BCdG4ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpIDogc3RvcEJ0bi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywnJyk7CiAgfSk7CgogIGNvbnN0IHJhY2VSZWYgPSBjUmVmKCdyYWNlL2N1cnJlbnQnKTsKICByYWNlUmVmLm9uKCd2YWx1ZScsIHNuYXAgPT4geyByYWNlU3RhdGUgPSBzbmFwLnZhbCgpOyByZW5kZXJUaW1lclZpZXcobGFuZSwgcmFjZVN0YXRlKTsgfSk7CiAgYWN0aXZlTGlzdGVuZXJzLnB1c2goKCk9PnJhY2VSZWYub2ZmKCkpOwoKICBjUmVmKCdyZWNhbGwnKS5vbigndmFsdWUnLCBzbmFwID0+IHsgaWYgKHNuYXAudmFsKCk/LmFjdGl2ZSkgZmxhc2hSZWNhbGwoKTsgfSk7CiAgYWN0aXZlTGlzdGVuZXJzLnB1c2goKCk9PmNSZWYoJ3JlY2FsbCcpLm9mZigpKTsKCiAgZnVuY3Rpb24gdGljaygpIHsKICAgIGlmIChyYWNlU3RhdGU/LnN0YXRlPT09J2xpdmUnICYmIHJhY2VTdGF0ZS5zdGFydGVkQXRTZXJ2ZXIpIHsKICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXItY2xvY2snKTsKICAgICAgaWYgKGVsKSBlbC50ZXh0Q29udGVudCA9IGZtdE1zKG5vd1NlcnZlcigpIC0gcmFjZVN0YXRlLnN0YXJ0ZWRBdFNlcnZlcik7CiAgICB9CiAgICByYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTsKICB9CiAgcmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7Cn0KCmZ1bmN0aW9uIHJlbmRlclRpbWVyVmlldyhsYW5lLCByYWNlKSB7CiAgY29uc3Qgd2FpdGluZyAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXItd2FpdGluZy1tc2cnKTsKICBjb25zdCBteVNwbGl0ICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aW1lci1teS1zcGxpdCcpOwogIGNvbnN0IHNwbGl0c0NhcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXItc3BsaXRzLWNhcmQnKTsKICBjb25zdCBzdG9wQnRuICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aW1lci1zdG9wLWJ0bicpOwogIGNvbnN0IGJhZGdlICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbWVyLWJhZGdlLXdyYXAnKTsKCiAgY29uc3QgcmVjYWxsQmFubmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbWVyLXJlY2FsbC1iYW5uZXInKTsKCiAgaWYgKCFyYWNlIHx8IHJhY2Uuc3RhdGU9PT0naWRsZScpIHsKICAgIHdhaXRpbmcuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICBteVNwbGl0LmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogICAgc3BsaXRzQ2FyZC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKICAgIGlmIChyZWNhbGxCYW5uZXIpIHJlY2FsbEJhbm5lci5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aW1lci1jbG9jaycpLnRleHRDb250ZW50ID0gJzA6MDAuMDAnOwogICAgYmFkZ2UuaW5uZXJIVE1MID0gYDxzcGFuIGNsYXNzPSJiYWRnZSBiYWRnZS1pZGxlIj5JRExFPC9zcGFuPmA7CiAgICByZXR1cm47CiAgfQogIHdhaXRpbmcuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CgogIGlmIChyZWNhbGxCYW5uZXIpIHsKICAgIHJhY2UucmVjYWxsZWQgPyByZWNhbGxCYW5uZXIuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJykgOiByZWNhbGxCYW5uZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgfQoKICBjb25zdCBzcG9ydExhYmVsID0gY2Fybml2YWxNZXRhPy5zcG9ydD09PSJzd2ltIiA/ICc8c3ZnIHdpZHRoPSIyMiIgaGVpZ2h0PSIyMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGFyaWEtaGlkZGVuPSJ0cnVlIiBzdHlsZT0idmVydGljYWwtYWxpZ246bWlkZGxlIj48cGF0aCBkPSJNMiAyMHMyLTIgNS0yIDUgMiA3IDIgNS0yIDctMiAzIDEgMyAxTTIgMTZzMi0yIDUtMiA1IDIgNyAyIDUtMiA3LTIgMyAxIDMgMSIvPjxjaXJjbGUgY3g9IjE0IiBjeT0iNSIgcj0iMiIvPjwvc3ZnPicgOiAnPHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBhcmlhLWhpZGRlbj0idHJ1ZSIgc3R5bGU9InZlcnRpY2FsLWFsaWduOm1pZGRsZSI+PHBvbHlsaW5lIHBvaW50cz0iMjIgMTIgMTggMTIgMTUgMjEgOSAzIDYgMTIgMiAxMiIvPjwvc3ZnPic7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbWVyLWF0aGxldGUtZXZlbnQnKS5pbm5lckhUTUwgPQogICAgYCR7c3BvcnRMYWJlbH0gJHtyYWNlLmFnZXx8Jyd9ICR7cmFjZS5nZW5kZXJ8fCcnfSDCtyAke3JhY2UuZXZlbnR8fCcnfWA7CgogIGNvbnN0IGxhbmVEYXRhID0gcmFjZS5sYW5lcz8uW2xhbmVdOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aW1lci1hdGhsZXRlLW5hbWUnKS50ZXh0Q29udGVudCA9IGxhbmVEYXRhPy5uYW1lIHx8IGBMYW5lICR7bGFuZX1gOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aW1lci1hdGhsZXRlLW5vdGUnKS50ZXh0Q29udGVudCA9IGxhbmVEYXRhPy5ub3RlIHx8ICcnOwoKICBpZiAocmFjZS5zdGF0ZT09PSdhcm1lZCcpIHsKICAgIGJhZGdlLmlubmVySFRNTCA9IGA8c3BhbiBjbGFzcz0iYmFkZ2UgYmFkZ2UtYXJtZWQiPkFSTUVEPC9zcGFuPmA7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXItY2xvY2snKS50ZXh0Q29udGVudCA9ICcwOjAwLjAwJzsKICB9IGVsc2UgaWYgKHJhY2Uuc3RhdGU9PT0nbGl2ZScpIHsKICAgIGJhZGdlLmlubmVySFRNTCA9IGA8c3BhbiBjbGFzcz0iYmFkZ2UgYmFkZ2UtbGl2ZSI+TElWRTwvc3Bhbj5gOwogIH0gZWxzZSBpZiAocmFjZS5zdGF0ZT09PSdkb25lJykgewogICAgYmFkZ2UuaW5uZXJIVE1MID0gYDxzcGFuIGNsYXNzPSJiYWRnZSBiYWRnZS1kb25lIj5ET05FPC9zcGFuPmA7CiAgfQoKICAvLyBNeSBzcGxpdAogIGNvbnN0IG15UmVjID0gcmFjZS5zcGxpdHM/LltsYW5lXT8uW2ZiRW5jKG15SWQpXTsKICBpZiAobXlSZWMpIHsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aW1lci1teS10aW1lJykudGV4dENvbnRlbnQgPSBmbXRTZWMobXlSZWMuZWxhcHNlZE1zKTsKICAgIG15U3BsaXQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICBzdG9wQnRuLnRleHRDb250ZW50ID0gJ1N0b3BwZWQnOwogICAgc3RvcEJ0bi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywnJyk7CiAgfSBlbHNlIHsKICAgIG15U3BsaXQuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgICBpZiAocmFjZS5zdGF0ZT09PSdsaXZlJykgeyBzdG9wQnRuLnRleHRDb250ZW50ID0gJ1NUT1AnOyBzdG9wQnRuLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTsgfQogICAgY29uc3QgZXhwQnRucyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1leHBvcnQtYnRucycpOwogICAgaWYgKGV4cEJ0bnMpIHsgaWYgKHJhY2Uuc3RhdGU9PT0nZG9uZScpIHsgZXhwQnRucy5zdHlsZS5kaXNwbGF5PSdmbGV4JzsgZXhwQnRucy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsgfSBlbHNlIHsgZXhwQnRucy5zdHlsZS5kaXNwbGF5PSdub25lJzsgfSB9CiAgfQoKICAvLyBBbGwgc3BsaXRzIHRoaXMgbGFuZQogIGNvbnN0IGxhbmVTcGxpdHMgPSByYWNlLnNwbGl0cz8uW2xhbmVdIHx8IHt9OwogIGNvbnN0IHNwbGl0VmFscyA9IE9iamVjdC52YWx1ZXMobGFuZVNwbGl0cyk7CiAgaWYgKHNwbGl0VmFscy5sZW5ndGgpIHsKICAgIHNwbGl0c0NhcmQuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXItc3BsaXRzLWxpc3QnKS5pbm5lckhUTUwgPSBzcGxpdFZhbHMubWFwKHM9PmAKICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO3BhZGRpbmc6N3B4IDA7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgdmFyKC0tc3VyZmFjZTMpIj4KICAgICAgICA8c3BhbiBjbGFzcz0idGV4dC1tdXRlZCB0ZXh0LXNtIj4ke3MubmFtZXx8Jz8nfTwvc3Bhbj4KICAgICAgICA8c3BhbiBjbGFzcz0iZm9udC1tb25vIiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwIj4ke2ZtdFNlYyhzLmVsYXBzZWRNcyl9PC9zcGFuPgogICAgICA8L2Rpdj5gKS5qb2luKCcnKTsKICB9IGVsc2UgeyBzcGxpdHNDYXJkLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOyB9Cn0KCmFzeW5jIGZ1bmN0aW9uIHRpbWVyU3RvcCgpIHsKICBpZiAoIXJhY2VTdGF0ZSB8fCByYWNlU3RhdGUuc3RhdGUhPT0nbGl2ZScpIHsgdG9hc3QoJ1JhY2Ugbm90IGxpdmUnKTsgcmV0dXJuOyB9CiAgaWYgKCFteU5hbWUpIHsgdG9hc3QoJ0VudGVyIHlvdXIgbmFtZSBmaXJzdCcpOyByZXR1cm47IH0KICBjb25zdCBlbGFwc2VkID0gbm93U2VydmVyKCkgLSByYWNlU3RhdGUuc3RhcnRlZEF0U2VydmVyOwogIGlmIChlbGFwc2VkIDwgNTAwKSB7IHRvYXN0KCdUb28gcXVpY2sg4oCUIGNoZWNrIHN0YXJ0Jyk7IHJldHVybjsgfQogIGNvbnN0IGtleSA9IGZiRW5jKG15SWQpOwogIGNvbnN0IHNwbGl0UGF5bG9hZCA9IHsgbmFtZTogbXlOYW1lLCBlbGFwc2VkTXM6IGVsYXBzZWQsIHN0b3BBdDogZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QIH07CiAgX3NhdmVQZW5kaW5nU3BsaXQobXlMYW5lLCBrZXksIHNwbGl0UGF5bG9hZCk7CiAgY29uc3Qgc3BsaXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGltZXItc3RvcC1idG4nKTsKICBpZiAoc3BsaXRCdG4pIHsgc3BsaXRCdG4udGV4dENvbnRlbnQgPSAnU2VuZGluZ+KApic7IHNwbGl0QnRuLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCcnKTsgfQogIHRyeSB7CiAgICBhd2FpdCBjUmVmKGByYWNlL2N1cnJlbnQvc3BsaXRzLyR7bXlMYW5lfS8ke2tleX1gKS5zZXQoc3BsaXRQYXlsb2FkKTsKICAgIF9jbGVhclBlbmRpbmdTcGxpdChrZXkpOwogICAgaWYgKHNwbGl0QnRuKSB7IHNwbGl0QnRuLnRleHRDb250ZW50ID0gJ1NlbnQg4pyTJzsgfQogIH0gY2F0Y2goZXJyKSB7CiAgICBpZiAoc3BsaXRCdG4pIHsgc3BsaXRCdG4udGV4dENvbnRlbnQgPSAn4pqgIFF1ZXVlZCc7IH0KICAgIHRvYXN0KCdXaUZpIGlzc3VlIOKAlCBzcGxpdCBzYXZlZCwgd2lsbCByZXRyeScpOwogIH0KICB2aWJyYXRlKFsxMDBdKTsKICBmbGFzaCgnZ28nLCAzMDApOwogIHRvYXN0KGBTdG9wcGVkIOKAlCAke2ZtdFNlYyhlbGFwc2VkKX1gKTsKICAvLyAzLXNlY29uZCB1bmRvIHdpbmRvdwogIF9zaG93VGltZXJVbmRvKG15TGFuZSwga2V5LCBlbGFwc2VkKTsKfQoKLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCi8vIEFETUlOIFZJRVcgKExhbmUgUmFjZSkKLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCmZ1bmN0aW9uIGluaXRBZG1pblZpZXcoKSB7CiAgcmVxdWVzdFdha2VMb2NrKCk7IHN5bmNDbG9jaygpOwogIHdhdGNoQ29ubignYWRtaW4tZG90Jyk7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLXNjaG9vbC1sYmwnKS50ZXh0Q29udGVudCA9IGNhcm5pdmFsTWV0YT8uc2Nob29sfHwnJzsKCiAgLy8gU2hvdyBjYXJuaXZhbCBjb2RlIGluIGhlYWRlciArIFNoYXJlIGJ1dHRvbgogIGNvbnN0IGNvZGVFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1jb2RlLWxibCcpOwogIGlmIChjb2RlRWwpIHsKICAgIGNvZGVFbC50ZXh0Q29udGVudCA9IGNhcm5pdmFsQ29kZTsKICAgIGNvZGVFbC5vbmNsaWNrID0gKCkgPT4geyB0cnkgeyBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjYXJuaXZhbENvZGUpOyB0b2FzdCgnQ29kZSBjb3BpZWQhJyk7IH0gY2F0Y2goZSl7fSB9OwogIH0KCiAgLy8gRGVtbyBiYW5uZXIKICBjb25zdCBiYW5uZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tZGVtby1iYW5uZXInKTsKICBpZiAoYmFubmVyKSBiYW5uZXIuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgaWYgKGNhcm5pdmFsTWV0YT8uaXNEZW1vKSBpbml0RGVtb0Jhbm5lcigpOwoKICAvLyBQb3B1bGF0ZSBkcm9wZG93bnMKICBjb25zdCBhZ2VTZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tYWdlLXNlbCcpOwogIGFnZVNlbC5pbm5lckhUTUwgPSBBR0VfR1JPVVBTLm1hcChhPT5gPG9wdGlvbj4ke2F9PC9vcHRpb24+YCkuam9pbignJyk7CiAgY29uc3QgZXZTZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tZXZlbnQtc2VsJyk7CiAgY29uc3Qgc3BvcnQgPSBjYXJuaXZhbE1ldGE/LnNwb3J0fHwndHJhY2snOwogIGNvbnN0IGV2TGlzdCA9IEVWRU5UU1tzcG9ydF0gfHwgRVZFTlRTLnRyYWNrOwogIGV2U2VsLmlubmVySFRNTCA9IGV2TGlzdC5tYXAoZT0+YDxvcHRpb24+JHtlfTwvb3B0aW9uPmApLmpvaW4oJycpOwoKICAvLyBMYW5lIGlucHV0cwogIGNvbnN0IGhvdXNlcyA9IGNhcm5pdmFsTWV0YT8uaG91c2VzfHxbXTsKICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tbGFuZS1pbnB1dHMnKTsKICBjb250YWluZXIuaW5uZXJIVE1MID0gQXJyYXkuZnJvbSh7bGVuZ3RoOkxBTkVfQ09VTlR9LChfLGkpPT5pKzEpLm1hcChuPT5gCiAgICA8ZGl2IGNsYXNzPSJhZG1pbi1sYW5lLXJvdyIgaWQ9ImFsci0ke259Ij4KICAgICAgPGRpdiBjbGFzcz0iYWRtaW4tbGFuZS1udW0iPiR7bn08L2Rpdj4KICAgICAgPGlucHV0IGNsYXNzPSJhZG1pbi1sYW5lLW5hbWUtaW5wdXQiIGRhdGEtbGFuZT0iJHtufSIKICAgICAgICBwbGFjZWhvbGRlcj0iTmFtZSBvciBCaWIgIyIgdHlwZT0idGV4dCIgc3R5bGU9ImZsZXg6MSI+CiAgICAgICR7aG91c2VzLmxlbmd0aCA/IGA8c2VsZWN0IGNsYXNzPSJhZG1pbi1sYW5lLWhvdXNlIiBkYXRhLWxhbmU9IiR7bn0iCiAgICAgICAgICBzdHlsZT0icGFkZGluZzo2cHggOHB4O2JvcmRlci1yYWRpdXM6OHB4O2JvcmRlcjoxcHggc29saWQgdmFyKC0tYm9yZGVyKTtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UyKTtjb2xvcjp2YXIoLS10ZXh0KTtmb250LXNpemU6LjgycmVtO21heC13aWR0aDo5MHB4Ij4KICAgICAgICAgIDxvcHRpb24gdmFsdWU9IiI+SG91c2U8L29wdGlvbj4KICAgICAgICAgICR7aG91c2VzLm1hcChoPT5gPG9wdGlvbiB2YWx1ZT0iJHtofSI+JHtofTwvb3B0aW9uPmApLmpvaW4oJycpfQogICAgICAgIDwvc2VsZWN0PmAgOiAnJ30KICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDo0cHgiPgogICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0ic3RhdHVzLWJ0biIgZGF0YS1sYW5lPSIke259IiBkYXRhLXN0eXBlPSJkbnMiIG9uY2xpY2s9InRvZ2dsZUxhbmVTdGF0dXMoJHtufSwnZG5zJykiPkROUzwvYnV0dG9uPgogICAgICAgIDxidXR0b24gdHlwZT0iYnV0dG9uIiBjbGFzcz0ic3RhdHVzLWJ0biIgZGF0YS1sYW5lPSIke259IiBkYXRhLXN0eXBlPSJkbmYiIG9uY2xpY2s9InRvZ2dsZUxhbmVTdGF0dXMoJHtufSwnZG5mJykiPkRORjwvYnV0dG9uPgogICAgICA8L2Rpdj4KICAgIDwvZGl2PmApLmpvaW4oJycpOwogIGRuc1NldC5jbGVhcigpOyBkbmZTZXQuY2xlYXIoKTsKICAvLyBIb3VzZSBzdGFuZGluZ3MKICBjb25zdCBob3VzZUNhcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4taG91c2UtY2FyZCcpOwogIGlmIChob3VzZXMubGVuZ3RoICYmIGhvdXNlQ2FyZCkgewogICAgaG91c2VDYXJkLnN0eWxlLmRpc3BsYXkgPSAnJzsKICAgIGNvbnN0IGhwUmVmID0gY1JlZignaG91c2VQb2ludHMnKTsKICAgIGhwUmVmLm9uKCd2YWx1ZScsIHNuYXAgPT4gewogICAgICBjb25zdCBwdHMgPSBzbmFwLnZhbCgpfHx7fTsKICAgICAgY29uc3Qgc29ydGVkID0gWy4uLmhvdXNlc10ubWFwKGg9Pih7aCwgcHRzOnB0c1toXXx8MH0pKS5zb3J0KChhLGIpPT5iLnB0cy1hLnB0cyk7CiAgICAgIGNvbnN0IHRvdGFsID0gc29ydGVkLnJlZHVjZSgocyxyKT0+cytyLnB0cywwKTsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLWhvdXNlLXN0YW5kaW5ncycpLmlubmVySFRNTCA9IHNvcnRlZC5tYXAoKHIsaSk9PmAKICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo3cHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1ib3JkZXIpIj4KICAgICAgICAgIDxzcGFuIHN0eWxlPSJmb250LXNpemU6LjlyZW07bWluLXdpZHRoOjE4cHgiPiR7aT09PTAmJnRvdGFsPjA/J/CfpYcnOmk9PT0xJiZ0b3RhbD4wPyfwn6WIJzppPT09MiYmdG90YWw+MD8n8J+liSc6Jyd9PC9zcGFuPgogICAgICAgICAgPHNwYW4gc3R5bGU9ImZsZXg6MTtmb250LXdlaWdodDoke2k9PT0wJiZ0b3RhbD4wPyc3MDAnOic0MDAnfSI+JHtyLmh9PC9zcGFuPgogICAgICAgICAgPHNwYW4gc3R5bGU9ImZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MS4wNXJlbTtjb2xvcjoke2k9PT0wJiZ0b3RhbD4wPyd2YXIoLS1hY2NlbnQpJzondmFyKC0tdGV4dCknfSI+JHtyLnB0c308L3NwYW4+CiAgICAgICAgPC9kaXY+YCkuam9pbignJyk7CiAgICB9KTsKICAgIGFjdGl2ZUxpc3RlbmVycy5wdXNoKCgpPT5ocFJlZi5vZmYoKSk7CiAgfSBlbHNlIGlmIChob3VzZUNhcmQpIHsgaG91c2VDYXJkLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IH0KICAvLyBQcm9ncmFtICJOZXh0IEV2ZW50IiBidXR0b24KICBjb25zdCBwcm9nID0gY2Fybml2YWxNZXRhPy5wcm9ncmFtfHxbXTsKICBjb25zdCBuZXh0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLW5leHQtZXZlbnQtYnRuJyk7CiAgaWYgKHByb2cubGVuZ3RoICYmIG5leHRCdG4pIHsgbmV4dEJ0bi5zdHlsZS5kaXNwbGF5ID0gJyc7IHByb2dyYW1JbmRleCA9IDA7IH0KICBlbHNlIGlmIChuZXh0QnRuKSB7IG5leHRCdG4uc3R5bGUuZGlzcGxheSA9ICdub25lJzsgfQoKICBjb25zdCByYWNlUmVmID0gY1JlZigncmFjZS9jdXJyZW50Jyk7CiAgcmFjZVJlZi5vbigndmFsdWUnLCBzbmFwPT57cmFjZVN0YXRlPXNuYXAudmFsKCk7IHJlbmRlckFkbWluVmlldyhyYWNlU3RhdGUpO30pOwogIGFjdGl2ZUxpc3RlbmVycy5wdXNoKCgpPT5yYWNlUmVmLm9mZigpKTsKCiAgZnVuY3Rpb24gdGljaygpIHsKICAgIGlmIChyYWNlU3RhdGU/LnN0YXRlPT09J2xpdmUnICYmIHJhY2VTdGF0ZS5zdGFydGVkQXRTZXJ2ZXIpIHsKICAgICAgY29uc3QgZWw9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLWxpdmUtY2xvY2snKTsKICAgICAgaWYoZWwpIGVsLnRleHRDb250ZW50PWZtdE1zKG5vd1NlcnZlcigpLXJhY2VTdGF0ZS5zdGFydGVkQXRTZXJ2ZXIpOwogICAgfQogICAgcmFmSWQ9cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spOwogIH0KICByYWZJZD1yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7Cn0KCmZ1bmN0aW9uIHNlbGVjdEFkbWluR2VuZGVyKGcpIHsKICBhZG1pbkdlbmRlciA9IGc7CiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWddJykuZm9yRWFjaChwPT5wLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKTsKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS1hZz0iJHtnfSJdYCkuZm9yRWFjaChwPT5wLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpKTsKfQoKZnVuY3Rpb24gcmVuZGVyQWRtaW5WaWV3KHJhY2UpIHsKICBjb25zdCBzZXR1cCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1zZXR1cC1wYW5lbCcpOwogIGNvbnN0IGxpdmUgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLWxpdmUtcGFuZWwnKTsKICBjb25zdCBkb25lICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1kb25lLXBhbmVsJyk7CgogIGlmICghcmFjZSB8fCByYWNlLnN0YXRlPT09J2lkbGUnKSB7CiAgICBzZXR1cC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsgbGl2ZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsgZG9uZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsgcmV0dXJuOwogIH0KICBzZXR1cC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKCiAgaWYgKHJhY2Uuc3RhdGU9PT0nZG9uZScpIHsKICAgIGxpdmUuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7IGRvbmUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICByZW5kZXJBZG1pbkRvbmUocmFjZSk7IHJldHVybjsKICB9CgogIGxpdmUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7IGRvbmUuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLXJhY2UtbGJsJykudGV4dENvbnRlbnQgPSBgJHtyYWNlLmFnZX0gJHtyYWNlLmdlbmRlcn0gwrcgJHtyYWNlLmV2ZW50fWA7CgogIGNvbnN0IGJhZGdlICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1zdGF0ZS1iYWRnZScpOwogIGNvbnN0IGdvQnRuICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1nby1idG4nKTsKICBjb25zdCBwdWJCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tcHVibGlzaC1idG4nKTsKCiAgaWYgKHJhY2Uuc3RhdGU9PT0nYXJtZWQnKSB7CiAgICBiYWRnZS5jbGFzc05hbWU9J2JhZGdlIGJhZGdlLWFybWVkJzsgYmFkZ2UudGV4dENvbnRlbnQ9J0FSTUVEJzsKICAgIGdvQnRuLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTsgcHViQnRuLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLWxpdmUtY2xvY2snKS50ZXh0Q29udGVudD0nMDowMC4wMCc7CiAgfSBlbHNlIGlmIChyYWNlLnN0YXRlPT09J2xpdmUnKSB7CiAgICBiYWRnZS5jbGFzc05hbWU9J2JhZGdlIGJhZGdlLWxpdmUnOyBiYWRnZS50ZXh0Q29udGVudD0nTElWRSc7CiAgICBnb0J0bi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywnJyk7CiAgfQoKICAvLyBTcGxpdHMKICBjb25zdCBsYW5lcyA9IHJhY2UubGFuZXN8fHt9OwogIGNvbnN0IHNwbGl0cyA9IHJhY2Uuc3BsaXRzfHx7fTsKICBsZXQgYWxsVGltZWQgPSBPYmplY3Qua2V5cyhsYW5lcykubGVuZ3RoPjA7CgogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1zcGxpdHMtbGlzdCcpLmlubmVySFRNTCA9IEFycmF5LmZyb20oe2xlbmd0aDpMQU5FX0NPVU5UfSwoXyxpKT0+aSsxKS5tYXAobj0+ewogICAgaWYgKCFsYW5lc1tuXSkgcmV0dXJuICcnOwogICAgY29uc3QgbGFuZVNwbGl0cyA9IHNwbGl0c1tuXXx8e307CiAgICBjb25zdCB2YWxzID0gT2JqZWN0LnZhbHVlcyhsYW5lU3BsaXRzKS5tYXAocz0+cy5lbGFwc2VkTXMpLmZpbHRlcihCb29sZWFuKTsKICAgIGNvbnN0IG1lYW4gPSB2YWxzLmxlbmd0aCA/IHRyaW1tZWRNZWFuKHZhbHMpIDogbnVsbDsKICAgIGNvbnN0IGNvbmYgPSBjb25maWRlbmNlRm9yKGxhbmVTcGxpdHMpOwogICAgaWYgKCFtZWFuKSBhbGxUaW1lZCA9IGZhbHNlOwogICAgcmV0dXJuIGA8ZGl2IGNsYXNzPSJsYW5lLXJvdyI+CiAgICAgIDxkaXYgY2xhc3M9ImxhbmUtbnVtIj4ke259PC9kaXY+CiAgICAgIDxkaXYgY2xhc3M9ImxhbmUtbmFtZSI+JHtsYW5lc1tuXT8ubmFtZXx8YExhbmUgJHtufWB9PC9kaXY+CiAgICAgICR7bWVhbiA/IGA8ZGl2PjxzcGFuIGNsYXNzPSJsYW5lLXRpbWUiPiR7Zm10U2VjKG1lYW4pfTwvc3Bhbj4gPHNwYW4gY2xhc3M9ImNvbmYtJHtjb25mLmNsc30iPiR7Y29uZi5sYWJlbH08L3NwYW4+PC9kaXY+YAogICAgICAgICAgICAgOiBgPHNwYW4gY2xhc3M9InRleHQtbXV0ZWQgdGV4dC14cyI+JHtyYWNlLnN0YXRlPT09J2xpdmUnPyd3YWl0aW5n4oCmJzon4oCUJ308L3NwYW4+YH0KICAgIDwvZGl2PmA7CiAgfSkuam9pbignJyk7CgogIGlmIChyYWNlLnN0YXRlPT09J2xpdmUnICYmIGFsbFRpbWVkKSBwdWJCdG4uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7Cn0KCmZ1bmN0aW9uIHRvZ2dsZUxhbmVTdGF0dXMobGFuZSwgdHlwZSkgewogIGNvbnN0IGwgPSBTdHJpbmcobGFuZSk7CiAgY29uc3Qgc2V0QSA9IHR5cGU9PT0nZG5zJyA/IGRuc1NldCA6IGRuZlNldDsKICBjb25zdCBzZXRCID0gdHlwZT09PSdkbnMnID8gZG5mU2V0IDogZG5zU2V0OwogIGlmIChzZXRBLmhhcyhsKSkgeyBzZXRBLmRlbGV0ZShsKTsgfSBlbHNlIHsgc2V0QS5hZGQobCk7IHNldEIuZGVsZXRlKGwpOyB9CiAgLy8gVXBkYXRlIGJ1dHRvbiBzdHlsZXMKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuc3RhdHVzLWJ0bltkYXRhLWxhbmU9IiR7bGFuZX0iXWApLmZvckVhY2goYnRuID0+IHsKICAgIGNvbnN0IHQgPSBidG4uZGF0YXNldC5zdHlwZTsKICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUtZG5zJywnYWN0aXZlLWRuZicpOwogICAgaWYgKHQ9PT0nZG5zJyAmJiBkbnNTZXQuaGFzKGwpKSBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlLWRucycpOwogICAgaWYgKHQ9PT0nZG5mJyAmJiBkbmZTZXQuaGFzKGwpKSBidG4uY2xhc3NMaXN0LmFkZCgnYWN0aXZlLWRuZicpOwogIH0pOwp9CmZ1bmN0aW9uIGFkbWluTmV4dEV2ZW50KCkgewogIGNvbnN0IHByb2cgPSBjYXJuaXZhbE1ldGE/LnByb2dyYW18fFtdOwogIGlmICghcHJvZy5sZW5ndGgpIHJldHVybjsKICBpZiAocHJvZ3JhbUluZGV4ID49IHByb2cubGVuZ3RoKSB7IHRvYXN0KCfwn4+BIFByb2dyYW0gY29tcGxldGUhJyk7IHJldHVybjsgfQogIGNvbnN0IGV2ID0gcHJvZ1twcm9ncmFtSW5kZXhdOwogIC8vIFNldCBhZ2UKICBjb25zdCBhZ2VTZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tYWdlLXNlbCcpOwogIGlmIChhZ2VTZWwpIGFnZVNlbC52YWx1ZSA9IGV2LmFnZTsKICBzZWxlY3RBZG1pbkdlbmRlcihldi5nZW5kZXJ8fCdib3lzJyk7CiAgLy8gU2V0IGV2ZW50CiAgY29uc3QgZXZTZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tZXZlbnQtc2VsJyk7CiAgaWYgKGV2U2VsKSBldlNlbC52YWx1ZSA9IGV2LmV2ZW50OwogIC8vIExvYWQgc2F2ZWQgbGFuZSBuYW1lcwogIF9sb2FkTGFuZU5hbWVzKGV2LmFnZSwgZXYuZ2VuZGVyfHwnYm95cycsIGV2LmV2ZW50KTsKICBjb25zdCBudW0gPSBwcm9ncmFtSW5kZXggKyAxOwogIHByb2dyYW1JbmRleCsrOwogIGNvbnN0IHJlbWFpbmluZyA9IHByb2cubGVuZ3RoIC0gcHJvZ3JhbUluZGV4OwogIGNvbnN0IG5leHRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tbmV4dC1ldmVudC1idG4nKTsKICBpZiAobmV4dEJ0bikgbmV4dEJ0bi50ZXh0Q29udGVudCA9IHJlbWFpbmluZyA+IDAgPyBgTmV4dCBFdmVudCAoJHtyZW1haW5pbmd9IGxlZnQpIOKGkmAgOiAnUHJvZ3JhbSBEb25lJzsKICB0b2FzdChgRXZlbnQgJHtudW19LyR7cHJvZy5sZW5ndGh9OiAke2V2LmFnZX0gJHtldi5nZW5kZXJ9IOKAlCAke2V2LmV2ZW50fWApOwp9CmFzeW5jIGZ1bmN0aW9uIGFkbWluUmVzZXRIb3VzZVBvaW50cygpIHsKICBpZiAoIWF3YWl0IF9jb25maXJtTW9kYWwoJ1Jlc2V0IGhvdXNlIHBvaW50cz8nLCAnVGhpcyB3aWxsIGNsZWFyIGFsbCBhY2N1bXVsYXRlZCBob3VzZSBwb2ludHMgZm9yIHRoaXMgY2Fybml2YWwuJywgJ1Jlc2V0JykpIHJldHVybjsKICBhd2FpdCBjUmVmKCdob3VzZVBvaW50cycpLnJlbW92ZSgpOwogIHRvYXN0KCdIb3VzZSBwb2ludHMgcmVzZXQnKTsKfQphc3luYyBmdW5jdGlvbiBhZG1pbkFybSgpIHsKICBpZiAoIWF3YWl0IF9jb25maXJtTW9kYWwoJ0FybSB0aGlzIHJhY2U/JywgJ0FsbCBjb25uZWN0ZWQgdGltZXJzIGFuZCB0aGUgU3RhcnRlciB3aWxsIGJlIG5vdGlmaWVkLicsICdBUk0gUkFDRSDihpInKSkgcmV0dXJuOwogIGNvbnN0IGFnZSAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLWFnZS1zZWwnKS52YWx1ZTsKICBjb25zdCBldmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1ldmVudC1zZWwnKS52YWx1ZTsKICBjb25zdCBsYW5lcyA9IHt9OwogIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hZG1pbi1sYW5lLW5hbWUtaW5wdXQnKS5mb3JFYWNoKGlucD0+ewogICAgY29uc3QgbiA9IGlucC5kYXRhc2V0LmxhbmU7CiAgICBjb25zdCB2ID0gaW5wLnZhbHVlLnRyaW0oKTsKICAgIGlmICghdikgcmV0dXJuOwogICAgY29uc3QgaG91c2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAuYWRtaW4tbGFuZS1ob3VzZVtkYXRhLWxhbmU9IiR7bn0iXWApPy52YWx1ZXx8Jyc7CiAgICBjb25zdCBzdGF0dXMgPSBkbnNTZXQuaGFzKG4pID8gJ2RucycgOiBkbmZTZXQuaGFzKG4pID8gJ2RuZicgOiAnJzsKICAgIGxhbmVzW25dID0geyBuYW1lOnYsIC4uLihob3VzZT97aG91c2V9Ont9KSwgLi4uKHN0YXR1cz97c3RhdHVzfTp7fSkgfTsKICB9KTsKICBkbnNTZXQuY2xlYXIoKTsgZG5mU2V0LmNsZWFyKCk7CiAgLy8gUGVyc2lzdCBsYW5lIG5hbWVzIGZvciB0aGlzIGFnZS9nZW5kZXIvZXZlbnQKICBfc2F2ZUxhbmVOYW1lcyhhZ2UsIGFkbWluR2VuZGVyLCBldmVudCwgbGFuZXMpOwogIGF3YWl0IGNSZWYoJ3JhY2UvY3VycmVudCcpLnNldCh7CiAgICByYWNlSWQ6IGdlbklkKDYpLCBhZ2UsIGdlbmRlcjphZG1pbkdlbmRlciwgZXZlbnQsCiAgICBzdGF0ZTonYXJtZWQnLCBsYW5lcywgc3BsaXRzOnt9LAogICAgYXJtZWRBdDogZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QCiAgfSk7CiAgdG9hc3QoJ1JhY2UgYXJtZWQnKTsKfQoKYXN5bmMgZnVuY3Rpb24gYWRtaW5HbygpIHsKICBpZiAoIXJhY2VTdGF0ZSB8fCByYWNlU3RhdGUuc3RhdGUhPT0nYXJtZWQnKSByZXR1cm47CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLWdvLWJ0bicpLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCcnKTsKICBzaG93Q291bnRkb3duKGFzeW5jICgpPT57CiAgICBhd2FpdCBjUmVmKCdyYWNlL2N1cnJlbnQnKS51cGRhdGUoeyBzdGF0ZTonbGl2ZScsIHN0YXJ0ZWRBdFNlcnZlcjpmaXJlYmFzZS5kYXRhYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVAgfSk7CiAgfSk7Cn0KCmFzeW5jIGZ1bmN0aW9uIGFkbWluUmVjYWxsKCkgewogIGF3YWl0IGNSZWYoJ3JhY2UvY3VycmVudCcpLnVwZGF0ZSh7IHN0YXRlOidhcm1lZCcsIHN0YXJ0ZWRBdFNlcnZlcjpudWxsIH0pOwogIGJyb2FkY2FzdFJlY2FsbCgpOwp9CgpmdW5jdGlvbiBicm9hZGNhc3RSZWNhbGwoKSB7CiAgY1JlZigncmVjYWxsJykuc2V0KHsgYWN0aXZlOnRydWUsIGF0OmZpcmViYXNlLmRhdGFiYXNlLlNlcnZlclZhbHVlLlRJTUVTVEFNUCB9KTsKICBzZXRUaW1lb3V0KCgpPT5jUmVmKCdyZWNhbGwnKS5zZXQoe2FjdGl2ZTpmYWxzZX0pLCAyNTAwKTsKICBmbGFzaFJlY2FsbCgpOwp9Cgphc3luYyBmdW5jdGlvbiBhZG1pbkNsZWFyKCkgewogIG1vZGFsKCdDbGVhciBTcGxpdHMnLCdSZW1vdmUgYWxsIHRpbWVyIHNwbGl0cyBmb3IgdGhpcyByYWNlPycsWwogICAgeyBsYWJlbDonQ2xlYXInLCBjbHM6J2J0bi1kYW5nZXInLCBmbjogYXN5bmMgKCk9PnsKICAgICAgYXdhaXQgY1JlZigncmFjZS9jdXJyZW50L3NwbGl0cycpLnNldCh7fSk7CiAgICAgIHRvYXN0KCdTcGxpdHMgY2xlYXJlZCcpOwogICAgfX0sCiAgICB7IGxhYmVsOidDYW5jZWwnIH0KICBdKTsKfQoKYXN5bmMgZnVuY3Rpb24gYWRtaW5BYmFuZG9uKCkgewogIG1vZGFsKCdBYmFuZG9uIFJhY2UnLCdSZXR1cm4gdG8gc2V0dXAgYW5kIGRpc2NhcmQgdGhpcyByYWNlPycsWwogICAgeyBsYWJlbDonQWJhbmRvbicsIGNsczonYnRuLWRhbmdlcicsIGZuOiBhc3luYyAoKT0+ewogICAgICBhd2FpdCBjUmVmKCdyYWNlL2N1cnJlbnQnKS5zZXQoe3N0YXRlOidpZGxlJ30pOwogICAgfX0sCiAgICB7IGxhYmVsOidDYW5jZWwnIH0KICBdKTsKfQoKYXN5bmMgZnVuY3Rpb24gYWRtaW5QdWJsaXNoKCkgewogIGlmICghcmFjZVN0YXRlKSByZXR1cm47CiAgLy8gSGVhdCBwaWNrZXIKICBfcHJvbXB0SGVhdChhc3luYyAoaGVhdFN1ZmZpeCkgPT4gewogICAgY29uc3QgbGFuZXMgID0gcmFjZVN0YXRlLmxhbmVzfHx7fTsKICAgIGNvbnN0IHNwbGl0cyA9IHJhY2VTdGF0ZS5zcGxpdHN8fHt9OwogICAgY29uc3QgcmVzdWx0cyA9IFtdOwogICAgbGV0IHBsYWNlID0gMTsKICAgIC8vIEJ1aWxkIHNvcnRlZCBub24tRFEgZmlyc3QgdG8gYXNzaWduIHBsYWNlcwogICAgY29uc3QgYWxsUm93cyA9IFtdOwogICAgT2JqZWN0LmtleXMobGFuZXMpLmZvckVhY2gobGFuZT0+ewogICAgICBjb25zdCBsYW5lRGF0YSA9IGxhbmVzW2xhbmVdOwogICAgICBjb25zdCBzdGF0dXMgPSBsYW5lRGF0YT8uc3RhdHVzOwogICAgICBjb25zdCBob3VzZSAgPSBsYW5lRGF0YT8uaG91c2V8fCcnOwogICAgICBpZiAoc3RhdHVzID09PSAnZG5zJyB8fCBzdGF0dXMgPT09ICdkbmYnKSB7CiAgICAgICAgYWxsUm93cy5wdXNoKHsgbGFuZTpwYXJzZUludChsYW5lKSwgbmFtZTpsYW5lRGF0YT8ubmFtZXx8YExhbmUgJHtsYW5lfWAsCiAgICAgICAgICB0aW1lTXM6bnVsbCwgZHE6ZmFsc2UsIHN0YXR1cywgaG91c2UgfSk7CiAgICAgICAgcmV0dXJuOwogICAgICB9CiAgICAgIGNvbnN0IHZhbHMgPSBPYmplY3QudmFsdWVzKHNwbGl0c1tsYW5lXXx8e30pLm1hcChzPT5zLmVsYXBzZWRNcykuZmlsdGVyKEJvb2xlYW4pOwogICAgICBjb25zdCBtZWFuID0gdmFscy5sZW5ndGggPyB0cmltbWVkTWVhbih2YWxzKSA6IG51bGw7CiAgICAgIGlmIChtZWFuIT1udWxsKSBhbGxSb3dzLnB1c2goeyBsYW5lOnBhcnNlSW50KGxhbmUpLCBuYW1lOmxhbmVEYXRhPy5uYW1lfHxgTGFuZSAke2xhbmV9YCwKICAgICAgICB0aW1lTXM6bWVhbiwgZHE6IGRxU2V0LmhhcyhTdHJpbmcobGFuZSkpLCBob3VzZSwgc3RhdHVzOicnIH0pOwogICAgfSk7CiAgICBhbGxSb3dzLnNvcnQoKGEsYik9PiB7CiAgICAgIGNvbnN0IG9yZCA9IHIgPT4gci5zdGF0dXM9PT0nZG5zJyA/IDQgOiByLnN0YXR1cz09PSdkbmYnID8gMyA6IHIuZHEgPyAyIDogMDsKICAgICAgaWYgKG9yZChhKSAhPT0gb3JkKGIpKSByZXR1cm4gb3JkKGEpIC0gb3JkKGIpOwogICAgICByZXR1cm4gKGEudGltZU1zfHwwKSAtIChiLnRpbWVNc3x8MCk7CiAgICB9KTsKICAgIGNvbnN0IFBUUyA9IFs4LDYsNSw0LDMsMiwxXTsKICAgIGNvbnN0IGhvdXNlRGVsdGFzID0ge307CiAgICBhbGxSb3dzLmZvckVhY2gociA9PiB7CiAgICAgIGlmICghci5kcSAmJiAhci5zdGF0dXMpIHsKICAgICAgICByLnBsYWNlID0gcGxhY2UrKzsKICAgICAgICBpZiAoci5ob3VzZSkgaG91c2VEZWx0YXNbci5ob3VzZV0gPSAoaG91c2VEZWx0YXNbci5ob3VzZV18fDApICsgKFBUU1tyLnBsYWNlLTFdfHwwKTsKICAgICAgfQogICAgfSk7CiAgICBjb25zdCBldmVudE5hbWUgPSByYWNlU3RhdGUuZXZlbnQgKyBoZWF0U3VmZml4OwogICAgY29uc3Qga2V5ID0gZmJFbmMoYCR7cmFjZVN0YXRlLmFnZX0tJHtyYWNlU3RhdGUuZ2VuZGVyfS0ke2V2ZW50TmFtZX0tJHtyYWNlU3RhdGUucmFjZUlkfWApOwogICAgYXdhaXQgY1JlZihgcmVzdWx0cy8ke2tleX1gKS5zZXQoewogICAgICB0eXBlOidsYW5lJywgYWdlOnJhY2VTdGF0ZS5hZ2UsIGdlbmRlcjpyYWNlU3RhdGUuZ2VuZGVyLCBldmVudDpldmVudE5hbWUsCiAgICAgIHJhY2VJZDpyYWNlU3RhdGUucmFjZUlkLCByZXN1bHRzOmFsbFJvd3MsCiAgICAgIHB1Ymxpc2hlZEF0OmZpcmViYXNlLmRhdGFiYXNlLlNlcnZlclZhbHVlLlRJTUVTVEFNUAogICAgfSk7CiAgICAvLyBBY2N1bXVsYXRlIGhvdXNlIHBvaW50cwogICAgaWYgKE9iamVjdC5rZXlzKGhvdXNlRGVsdGFzKS5sZW5ndGgpIHsKICAgICAgY29uc3QgaHBSZWYgPSBjUmVmKCdob3VzZVBvaW50cycpOwogICAgICBjb25zdCBzbmFwID0gYXdhaXQgaHBSZWYub25jZSgndmFsdWUnKTsKICAgICAgY29uc3QgZXhpc3RpbmcgPSBzbmFwLnZhbCgpfHx7fTsKICAgICAgY29uc3QgbWVyZ2VkID0gey4uLmV4aXN0aW5nfTsKICAgICAgT2JqZWN0LmVudHJpZXMoaG91c2VEZWx0YXMpLmZvckVhY2goKFtoLHB0c10pID0+IHsgbWVyZ2VkW2hdID0gKG1lcmdlZFtoXXx8MCkgKyBwdHM7IH0pOwogICAgICBhd2FpdCBocFJlZi5zZXQobWVyZ2VkKTsKICAgIH0KICAgIGF3YWl0IGNSZWYoJ3JhY2UvY3VycmVudCcpLnVwZGF0ZSh7c3RhdGU6J2RvbmUnfSk7CiAgICBkcVNldC5jbGVhcigpOwogICAgdG9hc3QoJzxzdmcgd2lkdGg9IjIyIiBoZWlnaHQ9IjIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgYXJpYS1oaWRkZW49InRydWUiIHN0eWxlPSJ2ZXJ0aWNhbC1hbGlnbjptaWRkbGUiPjxyZWN0IHg9IjgiIHk9IjIiIHdpZHRoPSI4IiBoZWlnaHQ9IjQiIHJ4PSIxIiByeT0iMSIvPjxwYXRoIGQ9Ik0xNiA0aDJhMiAyIDAgMCAxIDIgMnYxNGEyIDIgMCAwIDEtMiAySDZhMiAyIDAgMCAxLTItMlY2YTIgMiAwIDAgMSAyLTJoMiIvPjwvc3ZnPiBSZXN1bHRzIHB1Ymxpc2hlZCEnKTsKICB9KTsKfQoKZnVuY3Rpb24gX3Byb21wdEhlYXQoY2FsbGJhY2spIHsKICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOwogIGVsLmlkID0gJ2hlYXQtbW9kYWwnOwogIGVsLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsLjY1KTt6LWluZGV4Ojk5OTk7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6MTZweCc7CiAgZWwuaW5uZXJIVE1MID0gYAogICAgPGRpdiBzdHlsZT0iYmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlKTtib3JkZXItcmFkaXVzOjE2cHg7cGFkZGluZzoyMHB4O21heC13aWR0aDozMDBweDt3aWR0aDoxMDAlO3RleHQtYWxpZ246Y2VudGVyIj4KICAgICAgPGRpdiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxcmVtO21hcmdpbi1ib3R0b206NHB4Ij5IZWF0IC8gUm91bmQ8L2Rpdj4KICAgICAgPGRpdiBzdHlsZT0iY29sb3I6dmFyKC0tbXV0ZWQpO2ZvbnQtc2l6ZTouODJyZW07bWFyZ2luLWJvdHRvbToxNHB4Ij5MYWJlbCB0aGlzIHJlc3VsdCAob3B0aW9uYWwpPC9kaXY+CiAgICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6Z3JpZDtncmlkLXRlbXBsYXRlLWNvbHVtbnM6MWZyIDFmcjtnYXA6OHB4O21hcmdpbi1ib3R0b206OHB4Ij4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iX2hlYXRQaWNrKCcg4oCUIEhlYXQgMScpIj5IZWF0IDE8L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iX2hlYXRQaWNrKCcg4oCUIEhlYXQgMicpIj5IZWF0IDI8L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iX2hlYXRQaWNrKCcg4oCUIEhlYXQgMycpIj5IZWF0IDM8L2J1dHRvbj4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgb25jbGljaz0iX2hlYXRQaWNrKCcg4oCUIEZpbmFsJykiPkZpbmFsPC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIHN0eWxlPSJ3aWR0aDoxMDAlIiBvbmNsaWNrPSJfaGVhdFBpY2soJycpIj5ObyBsYWJlbCDigJQgcHVibGlzaCBhcy1pczwvYnV0dG9uPgogICAgPC9kaXY+YDsKICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsKTsKICB3aW5kb3cuX2hlYXRQaWNrID0gKHN1ZmZpeCkgPT4geyBlbC5yZW1vdmUoKTsgZGVsZXRlIHdpbmRvdy5faGVhdFBpY2s7IGNhbGxiYWNrKHN1ZmZpeCk7IH07Cn0KCmFzeW5jIGZ1bmN0aW9uIGFkbWluRWRpdFRpbWUoaWR4KSB7CiAgLy8gTG9hZCBjdXJyZW50IHB1Ymxpc2hlZCByZXN1bHRzIGZvciB0aGlzIHJhY2UgYW5kIGxldCBhZG1pbiBjb3JyZWN0IGEgc2luZ2xlIHRpbWUuCiAgY29uc3QgcmFjZUlkID0gcmFjZVN0YXRlICYmIHJhY2VTdGF0ZS5yYWNlSWQ7CiAgaWYgKCFyYWNlSWQpIHsgdG9hc3QoJ05vIHJhY2UgbG9hZGVkJyk7IHJldHVybjsgfQogIGNvbnN0IGtleSA9IGZiRW5jKGAke3JhY2VTdGF0ZS5hZ2V9LSR7cmFjZVN0YXRlLmdlbmRlcn0tJHtyYWNlU3RhdGUuZXZlbnR9LSR7cmFjZVN0YXRlLnJhY2VJZH1gKTsKICBjb25zdCBzbmFwID0gYXdhaXQgY1JlZihgcmVzdWx0cy8ke2tleX1gKS5vbmNlKCd2YWx1ZScpOwogIGNvbnN0IHB1YiA9IHNuYXAudmFsKCk7CiAgaWYgKCFwdWIgfHwgIUFycmF5LmlzQXJyYXkocHViLnJlc3VsdHMpIHx8ICFwdWIucmVzdWx0c1tpZHhdKSB7IHRvYXN0KCdDYW5ub3QgZWRpdDogcmVzdWx0IG5vdCBmb3VuZCcpOyByZXR1cm47IH0KICBjb25zdCByb3cgPSBwdWIucmVzdWx0c1tpZHhdOwogIGNvbnN0IGN1cnJlbnRTZWMgPSAocm93LnRpbWVNcy8xMDAwKS50b0ZpeGVkKDIpOwogIGNvbnN0IG5ld1N0ciA9IHByb21wdChgRWRpdCB0aW1lIGZvciAke3Jvdy5uYW1lfHwnTGFuZSAnK3Jvdy5sYW5lfSAoc2Vjb25kcywgZS5nLiAxNC44Mik6YCwgY3VycmVudFNlYyk7CiAgaWYgKG5ld1N0cj09PW51bGwpIHJldHVybjsKICBjb25zdCBuZXdTZWMgPSBwYXJzZUZsb2F0KG5ld1N0cik7CiAgaWYgKCFpc0Zpbml0ZShuZXdTZWMpIHx8IG5ld1NlYzw9MCkgeyB0b2FzdCgnSW52YWxpZCB0aW1lJyk7IHJldHVybjsgfQogIHB1Yi5yZXN1bHRzW2lkeF0udGltZU1zID0gTWF0aC5yb3VuZChuZXdTZWMqMTAwMCk7CiAgcHViLnJlc3VsdHNbaWR4XS5lZGl0ZWQgPSB0cnVlOwogIHB1Yi5yZXN1bHRzW2lkeF0uZWRpdGVkQXQgPSBEYXRlLm5vdygpOwogIC8vIFJlLXNvcnQgKyByZS1wbGFjZQogIHB1Yi5yZXN1bHRzLnNvcnQoKGEsYik9PmEudGltZU1zLWIudGltZU1zKTsKICBwdWIucmVzdWx0cy5mb3JFYWNoKChyLGkpPT5yLnBsYWNlPWkrMSk7CiAgcHViLmVkaXRlZEF0ID0gZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QOwogIGF3YWl0IGNSZWYoYHJlc3VsdHMvJHtrZXl9YCkuc2V0KHB1Yik7CiAgdG9hc3QoJ1RpbWUgdXBkYXRlZCcpOwp9CgpmdW5jdGlvbiBhZG1pbk5ld1JhY2UoKSB7CiAgZHFTZXQuY2xlYXIoKTsKICBjUmVmKCdyYWNlL2N1cnJlbnQnKS5zZXQoe3N0YXRlOidpZGxlJ30pOwogIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hZG1pbi1sYW5lLW5hbWUtaW5wdXQnKS5mb3JFYWNoKGlucD0+aW5wLnZhbHVlPScnKTsKICAvLyBUcnkgdG8gcmVsb2FkIHNhdmVkIG5hbWVzIGZvciBjdXJyZW50IHNlbGVjdGlvbgogIGNvbnN0IGFnZSAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLWFnZS1zZWwnKT8udmFsdWU7CiAgY29uc3QgZXZlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tZXZlbnQtc2VsJyk/LnZhbHVlOwogIGlmIChhZ2UgJiYgZXZlbnQpIF9sb2FkTGFuZU5hbWVzKGFnZSwgYWRtaW5HZW5kZXIsIGV2ZW50KTsKfQoKYXN5bmMgZnVuY3Rpb24gYWRtaW5QdWJsaXNoRnJvbURvbmUoKSB7CiAgaWYgKCFyYWNlU3RhdGUgfHwgcmFjZVN0YXRlLnN0YXRlICE9PSAnZG9uZScpIHJldHVybjsKICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tZG9uZS1wdWJsaXNoLWJ0bicpOwogIGlmIChidG4pIHsgYnRuLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCcnKTsgYnRuLnRleHRDb250ZW50ID0gJ1B1Ymxpc2hpbmfigKYnOyB9CiAgYXdhaXQgYWRtaW5QdWJsaXNoKCk7CiAgaWYgKGJ0bikgeyBidG4ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpOyBidG4udGV4dENvbnRlbnQgPSAnUHVibGlzaCBSZXN1bHRzJzsgfQp9CgpmdW5jdGlvbiByZW5kZXJBZG1pbkRvbmUocmFjZSkgewogIGNvbnN0IHNwbGl0cyA9IHJhY2Uuc3BsaXRzfHx7fTsKICBjb25zdCBsYW5lcyAgPSByYWNlLmxhbmVzfHx7fTsKICBjb25zdCByZXN1bHRzID0gW107CiAgT2JqZWN0LmtleXMobGFuZXMpLmZvckVhY2gobGFuZT0+ewogICAgY29uc3QgbGFuZURhdGEgPSBsYW5lc1tsYW5lXTsKICAgIGNvbnN0IHN0YXR1cyA9IGxhbmVEYXRhPy5zdGF0dXM7CiAgICBpZiAoc3RhdHVzID09PSAnZG5zJyB8fCBzdGF0dXMgPT09ICdkbmYnKSB7CiAgICAgIHJlc3VsdHMucHVzaCh7IGxhbmUsIG5hbWU6bGFuZURhdGE/Lm5hbWUsIHRpbWVNczpudWxsLCBzdGF0dXMgfSk7CiAgICAgIHJldHVybjsKICAgIH0KICAgIGNvbnN0IHZhbHMgPSBPYmplY3QudmFsdWVzKHNwbGl0c1tsYW5lXXx8e30pLm1hcChzPT5zLmVsYXBzZWRNcykuZmlsdGVyKEJvb2xlYW4pOwogICAgY29uc3QgbWVhbiA9IHZhbHMubGVuZ3RoID8gdHJpbW1lZE1lYW4odmFscykgOiBudWxsOwogICAgaWYgKG1lYW4pIHJlc3VsdHMucHVzaCh7IGxhbmUsIG5hbWU6bGFuZURhdGE/Lm5hbWUsIHRpbWVNczptZWFuLCBzdGF0dXM6JycgfSk7CiAgfSk7CiAgcmVzdWx0cy5zb3J0KChhLGIpPT57CiAgICBjb25zdCBvcmQgPSByID0+IHIuc3RhdHVzPT09J2RucycgPyA0IDogci5zdGF0dXM9PT0nZG5mJyA/IDMgOiAwOwogICAgaWYgKG9yZChhKSE9PW9yZChiKSkgcmV0dXJuIG9yZChhKS1vcmQoYik7CiAgICByZXR1cm4gKGEudGltZU1zfHwwKS0oYi50aW1lTXN8fDApOwogIH0pOwogIC8vIFJlLW51bWJlciBub24tRFEgcGxhY2VzCiAgbGV0IHBsYWNlID0gMTsKICBjb25zdCBwbGFjZWQgPSByZXN1bHRzLm1hcChyID0+IHsKICAgIGNvbnN0IGlzRFEgPSBkcVNldC5oYXMoU3RyaW5nKHIubGFuZSkpOwogICAgY29uc3QgaXNTcGVjID0gaXNEUSB8fCByLnN0YXR1cz09PSdkbnMnIHx8IHIuc3RhdHVzPT09J2RuZic7CiAgICByZXR1cm4geyAuLi5yLCBpc0RRLCBwbGFjZTogaXNTcGVjID8gbnVsbCA6IHBsYWNlKysgfTsKICB9KTsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRtaW4tcmVzdWx0cy1saXN0JykuaW5uZXJIVE1MID0gcGxhY2VkLm1hcCgocixpKT0+YAogICAgPGRpdiBjbGFzcz0ibGFuZS1yb3ciIHN0eWxlPSJvcGFjaXR5OiR7ci5pc0RRPzAuNDU6MX07dHJhbnNpdGlvbjpvcGFjaXR5IC4xNXMiPgogICAgICA8ZGl2IGNsYXNzPSJtZWRhbCAke3IuaXNEUT8ncE4nOnIuc3RhdHVzPT09J2Rucyc/J3BOJzpyLnN0YXR1cz09PSdkbmYnPydwTic6bWVkYWxDbHMoci5wbGFjZSl9IiBzdHlsZT0iJHtyLmlzRFE/J2JhY2tncm91bmQ6dmFyKC0td2Fybik7Y29sb3I6I2ZmZic6ci5zdGF0dXM/J2JhY2tncm91bmQ6dmFyKC0tbXV0ZWQpO2NvbG9yOiNmZmYnOicnfSI+JHtyLmlzRFE/J0RRJzpyLnN0YXR1cz9yLnN0YXR1cy50b1VwcGVyQ2FzZSgpOihyLnBsYWNlKX08L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibGFuZS1uYW1lIiBvbmNsaWNrPSIkeyFyLnN0YXR1cz9gYWRtaW5FZGl0VGltZSgke2l9KWA6Jyd9IiBzdHlsZT0iZmxleDoxOyR7IXIuc3RhdHVzPydjdXJzb3I6cG9pbnRlcic6Jyd9IiAkeyFyLnN0YXR1cz8ndGl0bGU9IlRhcCB0byBlZGl0IHRpbWUiJzonJ30+JHtyLm5hbWV8fGBMYW5lICR7ci5sYW5lfWB9JHtyLmlzRFE/JzxzcGFuIHN0eWxlPSJmb250LXNpemU6LjdyZW07Y29sb3I6dmFyKC0td2Fybik7bWFyZ2luLWxlZnQ6NnB4Ij5EUTwvc3Bhbj4nOnIuc3RhdHVzP2A8c3BhbiBzdHlsZT0iZm9udC1zaXplOi43cmVtO2NvbG9yOnZhcigtLW11dGVkKTttYXJnaW4tbGVmdDo2cHgiPiR7ci5zdGF0dXMudG9VcHBlckNhc2UoKX08L3NwYW4+YDonJ308L2Rpdj4KICAgICAgPGRpdiBjbGFzcz0ibGFuZS10aW1lIGZvbnQtbW9ubyIgb25jbGljaz0iYWRtaW5FZGl0VGltZSgke2l9KSIgc3R5bGU9ImN1cnNvcjpwb2ludGVyIj4ke3IuaXNEUT8n4oCUJzpmbXRTZWMoci50aW1lTXMpfTwvZGl2PgogICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNtIiBzdHlsZT0ibWFyZ2luLWxlZnQ6NnB4O3BhZGRpbmc6MnB4IDhweDtmb250LXNpemU6LjdyZW07Ym9yZGVyOjFweCBzb2xpZCAke3IuaXNEUT8ndmFyKC0td2FybiknOid2YXIoLS1ib3JkZXIpJ307Y29sb3I6JHtyLmlzRFE/J3ZhcigtLXdhcm4pJzondmFyKC0tbXV0ZWQpJ307YmFja2dyb3VuZDp0cmFuc3BhcmVudDtib3JkZXItcmFkaXVzOjZweCIgb25jbGljaz0iYWRtaW5Ub2dnbGVEUSgnJHtyLmxhbmV9JykiPiR7ci5pc0RRPyfinJUgRFEnOidEUSd9PC9idXR0b24+CiAgICA8L2Rpdj5gKS5qb2luKCcnKSB8fCAnPGRpdiBjbGFzcz0idGV4dC1tdXRlZCB0ZXh0LXNtIj5ObyB0aW1lZCBhdGhsZXRlczwvZGl2Pic7Cn0KCmZ1bmN0aW9uIGFkbWluVG9nZ2xlRFEobGFuZSkgewogIGNvbnN0IGsgPSBTdHJpbmcobGFuZSk7CiAgaWYgKGRxU2V0LmhhcyhrKSkgZHFTZXQuZGVsZXRlKGspOyBlbHNlIGRxU2V0LmFkZChrKTsKICBpZiAocmFjZVN0YXRlKSByZW5kZXJBZG1pbkRvbmUocmFjZVN0YXRlKTsKfQoKZnVuY3Rpb24gbWVkYWxDbHMocCkgeyByZXR1cm4gcD09PTE/J3AxJzpwPT09Mj8ncDInOnA9PT0zPydwMyc6J3BOJzsgfQoKLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCi8vIFNUQVJURVIgVklFVwovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKLy8g4pSA4pSAIFN0YXJ0ZXIgYXVkaW8gc3RhdGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACmxldCBzdGFydGVyQXVkaW9DdHggICAgPSBudWxsOwpsZXQgc3RhcnRlckFuYWx5c2VyICAgID0gbnVsbDsKbGV0IHN0YXJ0ZXJNaWNTdHJlYW0gICA9IG51bGw7CmxldCBzdGFydGVyTGlzdGVuaW5nICAgPSBmYWxzZTsKbGV0IHN0YXJ0ZXJOb2lzZUZsb29yICA9IDA7CmxldCBzdGFydGVyTm9pc2VDb3VudCAgPSAwOwpsZXQgc3RhcnRlclNlbnNpdGl2aXR5ID0gJ21lZCc7CmxldCBzdGFydGVyTGlzdGVuUmFmSWQgPSBudWxsOwpjb25zdCBTVEFSVEVSX1NFTlNfTVVMVCA9IHsgaGlnaDozLCBtZWQ6NSwgbG93OjkgfTsKCmZ1bmN0aW9uIGluaXRTdGFydGVyVmlldygpIHsKICB3YXRjaENvbm4oJ3N0YXJ0ZXItZG90Jyk7CiAgY29uc3QgcmFjZVJlZiA9IGNSZWYoJ3JhY2UvY3VycmVudCcpOwogIHJhY2VSZWYub24oJ3ZhbHVlJywgc25hcD0+ewogICAgY29uc3QgcmFjZSA9IHNuYXAudmFsKCk7CiAgICBjb25zdCB3ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0ZXItd2FpdGluZycpOwogICAgY29uc3QgYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFydGVyLWFybWVkJyk7CiAgICBpZiAoIXJhY2UgfHwgcmFjZS5zdGF0ZT09PSdpZGxlJykgewogICAgICB3LmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpOyBhLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogICAgICBzdGFydGVyTGlzdGVuU3RvcCgpOyByZXR1cm47CiAgICB9CiAgICBpZiAocmFjZS5zdGF0ZT09PSdhcm1lZCcpIHsKICAgICAgdy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsgYS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsKICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0ZXItcmFjZS1pbmZvJykudGV4dENvbnRlbnQgPQogICAgICAgIGAke3JhY2UuYWdlfSAke3JhY2UuZ2VuZGVyfSDCtyAke3JhY2UuZXZlbnR9YDsKICAgIH0gZWxzZSB7CiAgICAgIHcuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7IGEuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgICAgIHN0YXJ0ZXJMaXN0ZW5TdG9wKCk7CiAgICB9CiAgfSk7CiAgYWN0aXZlTGlzdGVuZXJzLnB1c2goKCk9PnJhY2VSZWYub2ZmKCkpOwp9CgovLyDilIDilIAgTWFudWFsIEdPICh3aXRoIGNvdW50ZG93bikg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACmZ1bmN0aW9uIHN0YXJ0ZXJHbygpIHsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnRlci1nby1idG4nKS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywnJyk7CiAgc2hvd0NvdW50ZG93bihhc3luYyAoKT0+ewogICAgYXdhaXQgY1JlZigncmFjZS9jdXJyZW50JykudXBkYXRlKHsgc3RhdGU6J2xpdmUnLCBzdGFydGVkQXRTZXJ2ZXI6ZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QIH0pOwogIH0pOwp9CmZ1bmN0aW9uIHN0YXJ0ZXJSZWNhbGwoKSB7IHN0YXJ0ZXJMaXN0ZW5TdG9wKCk7IGJyb2FkY2FzdFJlY2FsbCgpOyB9CgovLyDilIDilIAgR3VuIGRldGVjdGlvbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKZnVuY3Rpb24gc3RhcnRlclNldFNlbnMocykgewogIHN0YXJ0ZXJTZW5zaXRpdml0eSA9IHM7CiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc2Vuc10nKS5mb3JFYWNoKGIgPT4gewogICAgY29uc3QgYWN0aXZlID0gYi5kYXRhc2V0LnNlbnMgPT09IHM7CiAgICBiLmNsYXNzTmFtZSA9IGFjdGl2ZSA/ICdidG4gYnRuLXByaW1hcnknIDogJ2J0biBidG4tc2Vjb25kYXJ5JzsKICAgIGIuc3R5bGUuZm9udFNpemUgPSAnMC43NXJlbSc7IGIuc3R5bGUucGFkZGluZyA9ICc0cHggMTBweCc7CiAgfSk7Cn0KCmFzeW5jIGZ1bmN0aW9uIHN0YXJ0ZXJMaXN0ZW5TdGFydCgpIHsKICB0cnkgewogICAgc3RhcnRlck1pY1N0cmVhbSA9IGF3YWl0IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHthdWRpbzp0cnVlLCB2aWRlbzpmYWxzZX0pOwogICAgc3RhcnRlckF1ZGlvQ3R4ICA9IG5ldyAod2luZG93LkF1ZGlvQ29udGV4dHx8d2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCkoKTsKICAgIGNvbnN0IHNvdXJjZSA9IHN0YXJ0ZXJBdWRpb0N0eC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZShzdGFydGVyTWljU3RyZWFtKTsKICAgIHN0YXJ0ZXJBbmFseXNlciAgPSBzdGFydGVyQXVkaW9DdHguY3JlYXRlQW5hbHlzZXIoKTsKICAgIHN0YXJ0ZXJBbmFseXNlci5mZnRTaXplID0gMjU2OwogICAgc291cmNlLmNvbm5lY3Qoc3RhcnRlckFuYWx5c2VyKTsKICAgIHN0YXJ0ZXJMaXN0ZW5pbmcgID0gdHJ1ZTsKICAgIHN0YXJ0ZXJOb2lzZUZsb29yID0gMDsKICAgIHN0YXJ0ZXJOb2lzZUNvdW50ID0gMDsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFydGVyLWxpc3Rlbi1pZGxlJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnRlci1saXN0ZW4tYWN0aXZlJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnRlci1jYWwtbGJsJykudGV4dENvbnRlbnQgPSAnQ2FsaWJyYXRpbmfigKYnOwogICAgc3RhcnRlckxpc3RlblJhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0YXJ0ZXJMaXN0ZW5Mb29wKTsKICB9IGNhdGNoKGUpIHsKICAgIHRvYXN0KCdNaWNyb3Bob25lIGFjY2VzcyBkZW5pZWQnKTsKICB9Cn0KCmZ1bmN0aW9uIHN0YXJ0ZXJMaXN0ZW5TdG9wKCkgewogIHN0YXJ0ZXJMaXN0ZW5pbmcgPSBmYWxzZTsKICBpZiAoc3RhcnRlckxpc3RlblJhZklkKSB7IGNhbmNlbEFuaW1hdGlvbkZyYW1lKHN0YXJ0ZXJMaXN0ZW5SYWZJZCk7IHN0YXJ0ZXJMaXN0ZW5SYWZJZD1udWxsOyB9CiAgaWYgKHN0YXJ0ZXJNaWNTdHJlYW0pICAgeyBzdGFydGVyTWljU3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2godD0+dC5zdG9wKCkpOyBzdGFydGVyTWljU3RyZWFtPW51bGw7IH0KICBpZiAoc3RhcnRlckF1ZGlvQ3R4KSAgICB7IHN0YXJ0ZXJBdWRpb0N0eC5jbG9zZSgpLmNhdGNoKCgpPT57fSk7IHN0YXJ0ZXJBdWRpb0N0eD1udWxsOyB9CiAgY29uc3QgaWRsZSAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0ZXItbGlzdGVuLWlkbGUnKTsKICBjb25zdCBhY3RpdmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnRlci1saXN0ZW4tYWN0aXZlJyk7CiAgY29uc3QgYmFyICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0ZXItdm9sLWJhcicpOwogIGlmIChpZGxlKSAgIGlkbGUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgaWYgKGFjdGl2ZSkgYWN0aXZlLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogIGlmIChiYXIpICAgIGJhci5zdHlsZS53aWR0aCA9ICcwJSc7Cn0KCmZ1bmN0aW9uIHN0YXJ0ZXJMaXN0ZW5Mb29wKCkgewogIHN0YXJ0ZXJMaXN0ZW5SYWZJZCA9IG51bGw7CiAgaWYgKCFzdGFydGVyTGlzdGVuaW5nIHx8ICFzdGFydGVyQW5hbHlzZXIpIHJldHVybjsKCiAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KHN0YXJ0ZXJBbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudCk7CiAgc3RhcnRlckFuYWx5c2VyLmdldEJ5dGVUaW1lRG9tYWluRGF0YShkYXRhKTsKCiAgLy8gUk1TCiAgbGV0IHN1bSA9IDA7CiAgZm9yIChsZXQgaT0wOyBpPGRhdGEubGVuZ3RoOyBpKyspIHsgY29uc3Qgdj0oZGF0YVtpXS0xMjgpLzEyODsgc3VtKz12KnY7IH0KICBjb25zdCBybXMgPSBNYXRoLnNxcnQoc3VtIC8gZGF0YS5sZW5ndGgpOwoKICAvLyBWb2x1bWUgYmFyICgwLTEwMCUpCiAgY29uc3QgYmFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0ZXItdm9sLWJhcicpOwogIGlmIChiYXIpIGJhci5zdHlsZS53aWR0aCA9IE1hdGgubWluKDEwMCwgTWF0aC5yb3VuZChybXMqNTAwKSkgKyAnJSc7CgogIGlmIChzdGFydGVyTm9pc2VDb3VudCA8IDQwKSB7CiAgICAvLyBGaXJzdCB+MC43czogY2FsaWJyYXRlIG5vaXNlIGZsb29yCiAgICBzdGFydGVyTm9pc2VGbG9vciA9IChzdGFydGVyTm9pc2VGbG9vciAqIHN0YXJ0ZXJOb2lzZUNvdW50ICsgcm1zKSAvIChzdGFydGVyTm9pc2VDb3VudCArIDEpOwogICAgc3RhcnRlck5vaXNlQ291bnQrKzsKICAgIGlmIChzdGFydGVyTm9pc2VDb3VudCA+PSA0MCkgewogICAgICBjb25zdCBjYWxMYmwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnRlci1jYWwtbGJsJyk7CiAgICAgIGNvbnN0IG5mUGN0ICA9IE1hdGgucm91bmQoTWF0aC5taW4oMTAwLCBzdGFydGVyTm9pc2VGbG9vciAqIDIwMDApKTsKICAgICAgaWYgKGNhbExibCkgY2FsTGJsLnRleHRDb250ZW50ID0gYFJlYWR5IChub2lzZTogJHtuZlBjdH0lKWA7CiAgICB9CiAgfSBlbHNlIHsKICAgIGNvbnN0IG11bHQgICAgICA9IFNUQVJURVJfU0VOU19NVUxUW3N0YXJ0ZXJTZW5zaXRpdml0eV0gfHwgNTsKICAgIGNvbnN0IHRocmVzaG9sZCA9IE1hdGgubWF4KDAuMDYsIHN0YXJ0ZXJOb2lzZUZsb29yICogbXVsdCk7CiAgICBpZiAocm1zID4gdGhyZXNob2xkKSB7CiAgICAgIC8vIEdVTiBERVRFQ1RFRCDigJQgc2hvdyAxLXNlY29uZCBjYW5jZWxsYWJsZSBjb3VudGRvd24KICAgICAgc3RhcnRlckxpc3RlblN0b3AoKTsKICAgICAgc3RhcnRlckd1bkNvdW50ZG93bigpOwogICAgICByZXR1cm47CiAgICB9CiAgfQoKICBzdGFydGVyTGlzdGVuUmFmSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RhcnRlckxpc3Rlbkxvb3ApOwp9CgovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKLy8gT0JTRVJWRVIgVklFVyAoTGFuZSBSYWNlKQovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKZnVuY3Rpb24gcmVuZGVyT2JzZXJ2ZXJSZXN1bHRzKGRhdGEpIHsKICBjb25zdCBib2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvYnNlcnZlci1yZXN1bHRzLWJvYXJkJyk7CiAgY29uc3QgbGlzdCAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2JzZXJ2ZXItcmVzdWx0cy1saXN0Jyk7CiAgaWYgKCFib2FyZCB8fCAhbGlzdCkgcmV0dXJuOwogIGlmICghZGF0YSB8fCAhT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoKSB7IGJvYXJkLnN0eWxlLmRpc3BsYXk9J25vbmUnOyByZXR1cm47IH0KICBib2FyZC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJzsKCiAgY29uc3QgZXZlbnRzID0gT2JqZWN0LnZhbHVlcyhkYXRhKS5zb3J0KChhLGIpID0+IChiLnB1Ymxpc2hlZEF0fHwwKSAtIChhLnB1Ymxpc2hlZEF0fHwwKSk7CiAgbGlzdC5pbm5lckhUTUwgPSBldmVudHMubWFwKGV2ID0+IHsKICAgIGNvbnN0IGlzWEMgPSBldi50eXBlID09PSAneGMnOwogICAgY29uc3QgcGxhY2VzID0gaXNYQyA/IChldi5wbGFjZXN8fFtdKSA6IChldi5yZXN1bHRzfHxbXSk7CiAgICBjb25zdCByb3dzID0gcGxhY2VzLnNsaWNlKDAsNikubWFwKChyLGkpID0+IHsKICAgICAgY29uc3QgaXNEUSA9ICFpc1hDICYmIHIuZHE7CiAgICAgIGNvbnN0IHBvcyAgPSBpc1hDID8gci5wbGFjZSA6IChpc0RRID8gbnVsbCA6IChpKzEpKTsKICAgICAgY29uc3QgbmFtZSA9IHIubmFtZSB8fCAoaXNYQyA/ICcnIDogYExhbmUgJHtyLmxhbmV9YCk7CiAgICAgIGNvbnN0IHRpbWUgPSBmbXRTZWMoaXNYQyA/IHIuZWxhcHNlZE1zIDogci50aW1lTXMpOwogICAgICByZXR1cm4gYDxkaXYgY2xhc3M9ImxhbmUtcm93IiBzdHlsZT0icGFkZGluZzo2cHggNHB4OyR7aXNEUT8nb3BhY2l0eTouNDUnOicnfSIgPgogICAgICAgIDxkaXYgY2xhc3M9Im1lZGFsICR7aXNEUT8ncE4nOm1lZGFsQ2xzKHBvcyl9IiBzdHlsZT0iZm9udC1zaXplOi44cmVtOyR7aXNEUT8nYmFja2dyb3VuZDp2YXIoLS13YXJuKTtjb2xvcjojZmZmJzonJ30iPiR7aXNEUT8nRFEnOihwb3MpfTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImxhbmUtbmFtZSIgc3R5bGU9ImZvbnQtc2l6ZTouOXJlbSI+JHtuYW1lfTwvZGl2PgogICAgICAgIDxkaXYgY2xhc3M9ImxhbmUtdGltZSBmb250LW1vbm8iIHN0eWxlPSJmb250LXNpemU6LjlyZW0iPiR7aXNEUT8n4oCUJzp0aW1lfTwvZGl2PgogICAgICA8L2Rpdj5gOwogICAgfSkuam9pbignJyk7CiAgICByZXR1cm4gYDxkaXYgY2xhc3M9ImNhcmQiIHN0eWxlPSJtYXJnaW4tYm90dG9tOjhweDtwYWRkaW5nOjEwcHggMTJweCI+CiAgICAgIDxkaXYgc3R5bGU9ImZvbnQtc2l6ZTouNzVyZW07Zm9udC13ZWlnaHQ6NzAwO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtsZXR0ZXItc3BhY2luZzouMDZlbTtjb2xvcjp2YXIoLS1tdXRlZCk7bWFyZ2luLWJvdHRvbTo2cHgiPiR7ZXYuYWdlfHwnJ30gJHtldi5nZW5kZXJ8fCcnfSDCtyAke2V2LmV2ZW50fHwnJ308L2Rpdj4KICAgICAgJHtyb3dzfQogICAgPC9kaXY+YDsKICB9KS5qb2luKCcnKTsKfQoKZnVuY3Rpb24gaW5pdE9ic2VydmVyVmlldygpIHsKICB3YXRjaENvbm4oJ29ic2VydmVyLWRvdCcpOwogIGNvbnN0IHJhY2VSZWYgPSBjUmVmKCdyYWNlL2N1cnJlbnQnKTsKICByYWNlUmVmLm9uKCd2YWx1ZScsIHNuYXA9PnsgcmFjZVN0YXRlPXNuYXAudmFsKCk7IHJlbmRlck9ic2VydmVyVmlldyhyYWNlU3RhdGUpOyB9KTsKICBhY3RpdmVMaXN0ZW5lcnMucHVzaCgoKT0+cmFjZVJlZi5vZmYoKSk7CgogIC8vIFB1Ymxpc2hlZCByZXN1bHRzIGJvYXJkCiAgY29uc3QgcmVzUmVmID0gY1JlZigncmVzdWx0cycpOwogIHJlc1JlZi5vbigndmFsdWUnLCBzbmFwID0+IHsgcmVuZGVyT2JzZXJ2ZXJSZXN1bHRzKHNuYXAudmFsKCkpOyB9KTsKICBhY3RpdmVMaXN0ZW5lcnMucHVzaCgoKT0+cmVzUmVmLm9mZigpKTsKCiAgZnVuY3Rpb24gdGljaygpIHsKICAgIGlmIChyYWNlU3RhdGU/LnN0YXRlPT09J2xpdmUnICYmIHJhY2VTdGF0ZS5zdGFydGVkQXRTZXJ2ZXIpIHsKICAgICAgY29uc3QgZWw9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29ic2VydmVyLWNsb2NrJyk7CiAgICAgIGlmKGVsKSBlbC50ZXh0Q29udGVudD1mbXRNcyhub3dTZXJ2ZXIoKS1yYWNlU3RhdGUuc3RhcnRlZEF0U2VydmVyKTsKICAgIH0KICAgIHJhZklkPXJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTsKICB9CiAgcmFmSWQ9cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spOwp9CgpmdW5jdGlvbiByZW5kZXJPYnNlcnZlclZpZXcocmFjZSkgewogIGNvbnN0IHdhaXRpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2JzZXJ2ZXItd2FpdGluZycpOwogIGNvbnN0IGxpc3QgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnb2JzZXJ2ZXItbGFuZXMtbGlzdCcpOwogIGlmICghcmFjZSB8fCByYWNlLnN0YXRlPT09J2lkbGUnKSB7CiAgICB3YWl0aW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpOyBsaXN0LmlubmVySFRNTD0nJzsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvYnNlcnZlci1ldmVudC1sYmwnKS50ZXh0Q29udGVudD0nJzsgcmV0dXJuOwogIH0KICB3YWl0aW5nLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvYnNlcnZlci1ldmVudC1sYmwnKS50ZXh0Q29udGVudD0KICAgIGAke3JhY2UuYWdlfHwnJ30gJHtyYWNlLmdlbmRlcnx8Jyd9IMK3ICR7cmFjZS5ldmVudHx8Jyd9YDsKCiAgY29uc3QgbGFuZXMgID0gcmFjZS5sYW5lc3x8e307CiAgY29uc3Qgc3BsaXRzID0gcmFjZS5zcGxpdHN8fHt9OwogIGNvbnN0IGRhdGEgPSBPYmplY3Qua2V5cyhsYW5lcykubWFwKG49PnsKICAgIGNvbnN0IHZhbHMgPSBPYmplY3QudmFsdWVzKHNwbGl0c1tuXXx8e30pLm1hcChzPT5zLmVsYXBzZWRNcykuZmlsdGVyKEJvb2xlYW4pOwogICAgY29uc3QgbWVhbiA9IHZhbHMubGVuZ3RoID8gdHJpbW1lZE1lYW4odmFscykgOiBudWxsOwogICAgY29uc3QgY29uZiA9IGNvbmZpZGVuY2VGb3Ioc3BsaXRzW25dfHx7fSk7CiAgICByZXR1cm4geyBuOnBhcnNlSW50KG4pLCBuYW1lOmxhbmVzW25dPy5uYW1lfHxgTGFuZSAke259YCwgbWVhbiwgY29uZiB9OwogIH0pOwogIGNvbnN0IHJhbmtlZCA9IFsuLi5kYXRhXS5maWx0ZXIoZD0+ZC5tZWFuIT1udWxsKS5zb3J0KChhLGIpPT5hLm1lYW4tYi5tZWFuKTsKICBjb25zdCByYW5rTWFwPXt9OwogIHJhbmtlZC5mb3JFYWNoKChkLGkpPT5yYW5rTWFwW2Qubl09aSsxKTsKCiAgbGlzdC5pbm5lckhUTUwgPSBkYXRhLnNvcnQoKGEsYik9PmEubi1iLm4pLm1hcChkPT57CiAgICBjb25zdCBwbGFjZSA9IHJhbmtNYXBbZC5uXTsKICAgIGNvbnN0IG51bVN0eWxlID0gcGxhY2U9PT0xPydiYWNrZ3JvdW5kOiNGRkQ3MDA7Y29sb3I6IzAwMCc6cGxhY2U9PT0yPydiYWNrZ3JvdW5kOiNDMEMwQzA7Y29sb3I6IzAwMCc6cGxhY2U9PT0zPydiYWNrZ3JvdW5kOiNDRDdGMzI7Y29sb3I6I2ZmZic6Jyc7CiAgICByZXR1cm4gYDxkaXYgY2xhc3M9ImxhbmUtcm93Ij4KICAgICAgPGRpdiBjbGFzcz0ibGFuZS1udW0iIHN0eWxlPSIke251bVN0eWxlfSI+JHtwbGFjZXx8ZC5ufTwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJsYW5lLW5hbWUiPiR7ZC5uYW1lfTwvZGl2PgogICAgICAke2QubWVhbgogICAgICAgID8gYDxkaXY+PHNwYW4gY2xhc3M9ImxhbmUtdGltZSBmb250LW1vbm8iPiR7Zm10U2VjKGQubWVhbil9PC9zcGFuPiA8c3BhbiBjbGFzcz0iY29uZi0ke2QuY29uZi5jbHN9Ij4ke2QuY29uZi5sYWJlbH08L3NwYW4+PC9kaXY+YAogICAgICAgIDogYDxzcGFuIGNsYXNzPSJ0ZXh0LW11dGVkIHRleHQteHMiPiR7cmFjZS5zdGF0ZT09PSdsaXZlJz8n4oCmJzon4oCUJ308L3NwYW4+YH0KICAgIDwvZGl2PmA7CiAgfSkuam9pbignJyk7Cn0KCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAovLyBDT1VOVERPV04KLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCmZ1bmN0aW9uIHNob3dDb3VudGRvd24ob25HbykgewogIGlmIChjb3VudGRvd25SdW5uaW5nKSByZXR1cm47CiAgY291bnRkb3duUnVubmluZyA9IHRydWU7CiAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGRvd24tb3ZlcmxheScpOwogIGNvbnN0IG51bUVsICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRkb3duLW51bScpOwogIGNvbnN0IGxibEVsICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRkb3duLWxhYmVsJyk7CiAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTsKCiAgWwogICAgeyBuOiczJywgbDonR2V0IHNldOKApicsICAgICAgZDowIH0sCiAgICB7IG46JzInLCBsOidSZWFkeeKApicsICAgICAgICBkOjEwMDAgfSwKICAgIHsgbjonMScsIGw6J09uIHlvdXIgbWFya3PigKYnLGQ6MjAwMCB9LAogICAgeyBuOidHTycsbDonJywgICAgICAgICAgICAgIGQ6MzAwMCwgZ286dHJ1ZSB9CiAgXS5mb3JFYWNoKCh7bixsLGQsZ299KT0+ewogICAgc2V0VGltZW91dCgoKT0+ewogICAgICBudW1FbC50ZXh0Q29udGVudCA9IG47CiAgICAgIG51bUVsLnN0eWxlLmNvbG9yID0gZ28gPyAndmFyKC0tc3VjY2VzcyknIDogJ3ZhcigtLXRleHQpJzsKICAgICAgbGJsRWwudGV4dENvbnRlbnQgPSBsOwogICAgICB2aWJyYXRlKGdvID8gWzIwMCw2MCwyMDBdIDogWzQwXSk7CiAgICAgIGlmIChnbykgeyBmbGFzaCgnZ28nLDYwMCk7IG9uR28gJiYgb25HbygpOyB9CiAgICB9LCBkKTsKICB9KTsKCiAgc2V0VGltZW91dCgoKT0+eyBvdmVybGF5LmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpOyBjb3VudGRvd25SdW5uaW5nPWZhbHNlOyB9LCAzOTAwKTsKfQoKZnVuY3Rpb24gZmxhc2hSZWNhbGwoKSB7CiAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGRvd24tb3ZlcmxheScpOwogIGNvbnN0IG51bUVsICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRkb3duLW51bScpOwogIGNvbnN0IGxibEVsICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRkb3duLWxhYmVsJyk7CiAgb3ZlcmxheS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTsKICBudW1FbC5pbm5lckhUTUwgPSAnPHNwYW4gc3R5bGU9ImRpc3BsYXk6aW5saW5lLWJsb2NrO3dpZHRoOjAuOGVtO2hlaWdodDowLjhlbTtiYWNrZ3JvdW5kOnZhcigtLWRhbmdlcik7Ym9yZGVyLXJhZGl1czo1MCU7dmVydGljYWwtYWxpZ246bWlkZGxlIj48L3NwYW4+JzsKICBudW1FbC5zdHlsZS5jb2xvciAgPSAndmFyKC0tZGFuZ2VyKSc7CiAgbGJsRWwudGV4dENvbnRlbnQgID0gJ0ZBTFNFIFNUQVJUIOKAlCBSRUNBTEwnOwogIHZpYnJhdGUoWzIwMCw4MCwyMDAsODAsMjAwXSk7CiAgZmxhc2goJ3JlY2FsbCcsIDE4MDApOwogIHNldFRpbWVvdXQoKCk9Pm92ZXJsYXkuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyksIDIwMDApOwp9CgovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKLy8gQ1JPU1MgQ09VTlRSWSDigJQgTUFSU0hBTCBWSUVXCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkApsZXQgYmliUGVuZGluZ0tleSAgID0gbnVsbDsKbGV0IGJpYlBlbmRpbmdRdWV1ZSA9IFtdOyAgICAvLyBbe2tleSwgcGxhY2UsIGVsYXBzZWR9XQpsZXQgYmliVmFsdWUgICAgICAgID0gJyc7CmxldCB4Y0NhbVN0cmVhbSAgICAgPSBudWxsOyAgLy8gYWN0aXZlIGdldFVzZXJNZWRpYSBzdHJlYW0KY29uc3QgeGNQaG90b3MgICAgICA9IG5ldyBNYXAoKTsgLy8ga2V5IOKGkiBkYXRhVVJMIG9mIGJlc3QgYnVyc3QgZnJhbWUKbGV0IF9vY3JXb3JrZXIgICAgICA9IG51bGw7ICAvLyByZXVzYWJsZSBUZXNzZXJhY3Qgd29ya2VyCgphc3luYyBmdW5jdGlvbiB4Y0luaXRDYW1lcmEoKSB7CiAgaWYgKHhjQ2FtU3RyZWFtKSByZXR1cm47CiAgdHJ5IHsKICAgIHhjQ2FtU3RyZWFtID0gYXdhaXQgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoewogICAgICB2aWRlbzogeyBmYWNpbmdNb2RlOiAnZW52aXJvbm1lbnQnLCB3aWR0aDogeyBpZGVhbDogNjQwIH0sIGhlaWdodDogeyBpZGVhbDogNDgwIH0gfSwKICAgICAgYXVkaW86IGZhbHNlCiAgICB9KTsKICAgIGNvbnN0IHYgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgneGMtY2FtJyk7CiAgICB2LnNyY09iamVjdCA9IHhjQ2FtU3RyZWFtOwogICAgYXdhaXQgdi5wbGF5KCkuY2F0Y2goKCk9Pnt9KTsKICB9IGNhdGNoKGUpIHsKICAgIHhjQ2FtU3RyZWFtID0gbnVsbDsgLy8gY2FtZXJhIHVuYXZhaWxhYmxlIChkZW55IG9yIG5vIGNhbWVyYSkg4oCUIHNpbGVudGx5IGRlZ3JhZGUKICB9Cn0KCmFzeW5jIGZ1bmN0aW9uIHhjQ2FwdHVyZVBob3RvKGtleSkgewogIC8vIFN0YXJ0IGNhbWVyYSBpZiBub3QgcnVubmluZwogIGlmICgheGNDYW1TdHJlYW0pIHhjSW5pdENhbWVyYSgpOyAvLyBmaXJlIGFuZCBmb3JnZXQg4oCUIGZpcnN0IHRhcCBtYXkgbWlzcwogIHhjUGhvdG9zLnNldChrZXksIG51bGwpOyAvLyBwbGFjZWhvbGRlcgoKICBjb25zdCB2aWRlbyAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgneGMtY2FtJyk7CiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWNhcCcpOwogIGNvbnN0IGN0eCAgICA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpOwoKICAvLyBHaXZlIHZpZGVvIGEgbW9tZW50LCB0aGVuIGJ1cnN0IDMgZnJhbWVzCiAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDgwKSk7CiAgY29uc3QgZnJhbWVzID0gW107CiAgZm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHsKICAgIGlmIChpID4gMCkgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDE4MCkpOwogICAgaWYgKHZpZGVvLnJlYWR5U3RhdGUgPj0gMiAmJiB4Y0NhbVN0cmVhbSkgewogICAgICBjYW52YXMud2lkdGggPSA0MDA7IGNhbnZhcy5oZWlnaHQgPSAzMDA7CiAgICAgIGN0eC5kcmF3SW1hZ2UodmlkZW8sIDAsIDAsIDQwMCwgMzAwKTsKICAgICAgZnJhbWVzLnB1c2goY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvanBlZycsIDAuNTUpKTsKICAgIH0KICB9CiAgLy8gVXNlIGxhc3QgZnJhbWUgKHJ1bm5lciBtb3N0IGxpa2VseSBjbGVhcmVkIHRoZSBsaW5lKQogIGlmIChmcmFtZXMubGVuZ3RoKSB4Y1Bob3Rvcy5zZXQoa2V5LCBmcmFtZXNbZnJhbWVzLmxlbmd0aC0xXSk7Cn0KCmFzeW5jIGZ1bmN0aW9uIHJ1bkJpYk9DUigpIHsKICBjb25zdCBwaG90b0RhdGFVcmwgPSB4Y1Bob3Rvcy5nZXQoYmliUGVuZGluZ0tleSk7CiAgaWYgKCFwaG90b0RhdGFVcmwpIHsgdG9hc3QoJ05vIHBob3RvIGNhcHR1cmVkJyk7IHJldHVybjsgfQogIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvY3ItYnRuJyk7CiAgaWYgKGJ0bikgYnRuLnRleHRDb250ZW50ID0gJ+KPsyc7CiAgdHJ5IHsKICAgIGlmICghX29jcldvcmtlcikgewogICAgICBfb2NyV29ya2VyID0gYXdhaXQgVGVzc2VyYWN0LmNyZWF0ZVdvcmtlcignZW5nJyk7CiAgICAgIGF3YWl0IF9vY3JXb3JrZXIuc2V0UGFyYW1ldGVycyh7IHRlc3NlZGl0X2NoYXJfd2hpdGVsaXN0OiAnMDEyMzQ1Njc4OScgfSk7CiAgICB9CiAgICBjb25zdCB7IGRhdGE6IHsgdGV4dCwgY29uZmlkZW5jZSB9IH0gPSBhd2FpdCBfb2NyV29ya2VyLnJlY29nbml6ZShwaG90b0RhdGFVcmwpOwogICAgY29uc3QgZGlnaXRzID0gdGV4dC5yZXBsYWNlKC9cRC9nLCcnKS5zbGljZSgwLDQpOwogICAgaWYgKGRpZ2l0cyAmJiBjb25maWRlbmNlID4gNTUpIHsKICAgICAgYmliVmFsdWUgPSBkaWdpdHM7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXJzaGFsLWJpYi1kaXNwbGF5JykudGV4dENvbnRlbnQgPSBiaWJWYWx1ZTsKICAgICAgaWYgKGJ0bikgYnRuLnRleHRDb250ZW50ID0gJ+KckyAnICsgZGlnaXRzOwogICAgICB0b2FzdCgnQmliICcgKyBkaWdpdHMgKyAnIGRldGVjdGVkICgnICsgTWF0aC5yb3VuZChjb25maWRlbmNlKSArICclIGNvbmYpJyk7CiAgICB9IGVsc2UgewogICAgICBpZiAoYnRuKSBidG4udGV4dENvbnRlbnQgPSAn8J+UjSBBdXRvJzsKICAgICAgdG9hc3QoJ0NvdWxkIG5vdCByZWFkIGJpYiDigJQgZW50ZXIgbWFudWFsbHknKTsKICAgIH0KICB9IGNhdGNoKGUpIHsKICAgIGlmIChidG4pIGJ0bi50ZXh0Q29udGVudCA9ICfwn5SNIEF1dG8nOwogICAgdG9hc3QoJ09DUiBlcnJvcicpOwogIH0KfQoKZnVuY3Rpb24gaW5pdE1hcnNoYWxWaWV3KCkgewogIHJlcXVlc3RXYWtlTG9jaygpOyBzeW5jQ2xvY2soKTsKICB3YXRjaENvbm4oJ21hcnNoYWwtZG90Jyk7CiAgeGNJbml0Q2FtZXJhKCk7IC8vIHdhcm0gdXAgY2FtZXJhIGluIGJhY2tncm91bmQKCiAgY29uc3QgeGNSZWYgPSBjUmVmKCd4Yy9jdXJyZW50Jyk7CiAgeGNSZWYub24oJ3ZhbHVlJywgc25hcCA9PiB7IHhjU3RhdGU9c25hcC52YWwoKTsgcmVuZGVyTWFyc2hhbFZpZXcoeGNTdGF0ZSk7IH0pOwogIGFjdGl2ZUxpc3RlbmVycy5wdXNoKCgpID0+IHhjUmVmLm9mZigpKTsKCiAgY1JlZigncmVjYWxsJykub24oJ3ZhbHVlJywgc25hcCA9PiB7IGlmKHNuYXAudmFsKCk/LmFjdGl2ZSkgZmxhc2hSZWNhbGwoKTsgfSk7CiAgYWN0aXZlTGlzdGVuZXJzLnB1c2goKCkgPT4gY1JlZigncmVjYWxsJykub2ZmKCkpOwoKICBmdW5jdGlvbiB0aWNrKCkgewogICAgaWYgKHhjU3RhdGU/LnN0YXRlPT09J2xpdmUnICYmIHhjU3RhdGUuc3RhcnRlZEF0U2VydmVyKSB7CiAgICAgIGNvbnN0IHQgPSBmbXRNcyhub3dTZXJ2ZXIoKS14Y1N0YXRlLnN0YXJ0ZWRBdFNlcnZlcik7CiAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcnNoYWwtY2xvY2stbWluaScpOwogICAgICBpZiAoZWwpIGVsLnRleHRDb250ZW50ID0gdDsKICAgIH0KICAgIHJhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spOwogIH0KICByYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTsKfQoKZnVuY3Rpb24gcmVuZGVyTWFyc2hhbFZpZXcoeGMpIHsKICBjb25zdCB3YWl0aW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcnNoYWwtd2FpdGluZycpOwogIGNvbnN0IGxpdmUgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFyc2hhbC1saXZlJyk7CiAgaWYgKCF4YyB8fCB4Yy5zdGF0ZSE9PSdsaXZlJykgewogICAgbGl2ZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsgd2FpdGluZy5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsKICAgIGNvbnN0IG1zZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXJzaGFsLXdhaXQtbXNnJyk7CiAgICBpZiAoeGM/LnN0YXRlPT09J2FybWVkJykgewogICAgICBtc2cuaW5uZXJIVE1MID0gYFJhY2UgYXJtZWQg4oCUIHdhaXRpbmcgZm9yIEdPPGJyPgogICAgICAgIDxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1hY2NlbnQpO2ZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MS4xcmVtIj4ke3hjLmFnZXx8Jyd9ICR7eGMuZ2VuZGVyfHwnJ30gwrcgJHt4Yy5ldmVudHx8Jyd9PC9zcGFuPmA7CiAgICB9IGVsc2UgeyBtc2cudGV4dENvbnRlbnQ9J1dhaXRpbmcgZm9yIHJhY2UgdG8gc3RhcnQuLi4nOyB9CiAgICByZXR1cm47CiAgfQogIGxpdmUuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7IHdhaXRpbmcuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcnNoYWwtZXZlbnQtbGJsJykudGV4dENvbnRlbnQgPSBgJHt4Yy5hZ2V8fCcnfSAke3hjLmdlbmRlcnx8Jyd9IMK3ICR7eGMuZXZlbnR8fCcnfWA7CiAgcmVuZGVyTWFyc2hhbEZpbmlzaGVzKHhjKTsKfQoKZnVuY3Rpb24gcmVuZGVyTWFyc2hhbEZpbmlzaGVzKHhjKSB7CiAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXJzaGFsLWZpbmlzaGVzLWxpc3QnKTsKICBjb25zdCBmaW5pc2hlcyA9IHhjPy5maW5pc2hlcyB8fCB7fTsKICBjb25zdCBlbnRyaWVzID0gT2JqZWN0LmVudHJpZXMoZmluaXNoZXMpCiAgICAuc29ydCgoYSxiKT0+KGFbMV0udGFwQXR8fDApLShiWzFdLnRhcEF0fHwwKSk7CgogIGlmICghZW50cmllcy5sZW5ndGgpIHsKICAgIGxpc3QuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9InRleHQtbXV0ZWQgdGV4dC1zbSB0ZXh0LWNlbnRlciIgc3R5bGU9InBhZGRpbmc6MTJweCAwIj5ObyBmaW5pc2hlcyB5ZXQg4oCUIHRhcCBhYm92ZTwvZGl2Pic7CiAgICByZXR1cm47CiAgfQoKICBsaXN0LmlubmVySFRNTCA9IGVudHJpZXMubWFwKChbayxmXSxpKSA9PiBgCiAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2dhcDo4cHg7cGFkZGluZzo4cHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1ib3JkZXIpIj4KICAgICAgPHNwYW4gY2xhc3M9InBsYWNlLWJhZGdlIiBzdHlsZT0iZmxleC1zaHJpbms6MCI+JHtvcmRpbmFsKGkrMSl9PC9zcGFuPgogICAgICA8c3BhbiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwO21pbi13aWR0aDo3MnB4Ij4ke2ZtdE1zKGYuZWxhcHNlZE1zKX08L3NwYW4+CiAgICAgICR7Zi5iaWIKICAgICAgICA/IGA8c3BhbiBzdHlsZT0iY29sb3I6dmFyKC0tYWNjZW50KTtmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjAuOXJlbSI+QmliICR7Zi5iaWJ9PC9zcGFuPmAKICAgICAgICA6IGA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSBidG4tc20iIG9uY2xpY2s9Im1hcnNoYWxFZGl0QmliKCcke2t9Jywke2krMX0sJHtmLmVsYXBzZWRNc30pIj4rIEJpYjwvYnV0dG9uPmB9CiAgICAgIDxzcGFuIHN0eWxlPSJmbGV4OjE7Zm9udC1zaXplOjAuNzVyZW07Y29sb3I6dmFyKC0tbXV0ZWQpO3RleHQtYWxpZ246cmlnaHQiPiR7Zi5tYXJzaGFsTmFtZXx8Jyd9PC9zcGFuPgogICAgPC9kaXY+YCkuam9pbignJyk7Cn0KCmFzeW5jIGZ1bmN0aW9uIG1hcnNoYWxUYXAoKSB7CiAgaWYgKCF4Y1N0YXRlIHx8IHhjU3RhdGUuc3RhdGUhPT0nbGl2ZScpIHsgdG9hc3QoJ1JhY2Ugbm90IGxpdmUnKTsgcmV0dXJuOyB9CiAgY29uc3QgZWxhcHNlZCA9IG5vd1NlcnZlcigpIC0geGNTdGF0ZS5zdGFydGVkQXRTZXJ2ZXI7CiAgY29uc3QgY291bnQgICA9IE9iamVjdC5rZXlzKHhjU3RhdGUuZmluaXNoZXN8fHt9KS5sZW5ndGg7CiAgY29uc3QgcGxhY2UgICA9IGNvdW50ICsgMTsKCiAgdGFwRmxhc2goKTsgdmlicmF0ZShbNzBdKTsKCiAgLy8gQ2xpZW50LXNpZGUga2V5CiAgY29uc3Qga2V5ID0gbXlJZC5zbGljZSgwLDQpICsgJy0nICsgRGF0ZS5ub3coKS50b1N0cmluZygzNik7CiAgeGNDYXB0dXJlUGhvdG8oa2V5KTsgLy8gZmlyZS1hbmQtZm9yZ2V0IHBob3RvIGJ1cnN0CgogIGF3YWl0IGNSZWYoYHhjL2N1cnJlbnQvZmluaXNoZXMvJHtrZXl9YCkuc2V0KHsKICAgIG1hcnNoYWxJZDogICBteUlkLAogICAgbWFyc2hhbE5hbWU6IG15TmFtZSB8fCAnTWFyc2hhbCcsCiAgICBiaWI6ICAgICAgICAgJycsCiAgICBuYW1lOiAgICAgICAgJycsCiAgICBlbGFwc2VkTXM6ICAgZWxhcHNlZCwKICAgIHRhcEF0OiAgICAgICBmaXJlYmFzZS5kYXRhYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVAKICB9KTsKCiAgdG9hc3QoYCR7b3JkaW5hbChwbGFjZSl9IOKAlCAke2ZtdE1zKGVsYXBzZWQpfWApOwoKICAvLyBRdWV1ZSBiaWIgZW50cnkKICBiaWJQZW5kaW5nUXVldWUucHVzaCh7IGtleSwgcGxhY2UsIGVsYXBzZWQgfSk7CiAgaWYgKCFiaWJQZW5kaW5nS2V5KSBzaG93TmV4dEJpYigpOwp9CgpmdW5jdGlvbiBzaG93TmV4dEJpYigpIHsKICBpZiAoIWJpYlBlbmRpbmdRdWV1ZS5sZW5ndGgpIHsgaGlkZUJpYlBhZCgpOyByZXR1cm47IH0KICBjb25zdCB7IGtleSwgcGxhY2UsIGVsYXBzZWQgfSA9IGJpYlBlbmRpbmdRdWV1ZVswXTsKICBiaWJQZW5kaW5nS2V5ID0ga2V5OwogIGJpYlZhbHVlICAgICAgPSAnJzsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFyc2hhbC1iaWItZm9yJykudGV4dENvbnRlbnQgICAgID0gYEJpYiBmb3IgJHtvcmRpbmFsKHBsYWNlKX0g4oCUICR7Zm10TXMoZWxhcHNlZCl9YDsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFyc2hhbC1iaWItZGlzcGxheScpLnRleHRDb250ZW50ID0gJ18nOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXJzaGFsLWJpYi1wYWQnKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFyc2hhbC1maW5pc2hlcy13cmFwJykuc3R5bGUucGFkZGluZ0JvdHRvbSA9ICcwJzsKCiAgLy8gU2hvdyBwaG90byAobWF5IGFycml2ZSBhc3luYykKICBjb25zdCB1cGRhdGVQaG90byA9ICgpID0+IHsKICAgIGNvbnN0IHBob3RvID0geGNQaG90b3MuZ2V0KGtleSk7CiAgICBjb25zdCBpbWcgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaW5pc2gtcGhvdG8taW1nJyk7CiAgICBjb25zdCBwaCAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaW5pc2gtcGhvdG8tc3RhdHVzJyk7CiAgICBpZiAoIWltZykgcmV0dXJuOwogICAgaWYgKHBob3RvKSB7CiAgICAgIGltZy5zcmMgPSBwaG90bzsgaW1nLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snOwogICAgICBpZiAocGgpIHBoLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgICAgIC8vIFJlc2V0IE9DUiBidXR0b24KICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ29jci1idG4nKTsKICAgICAgaWYgKGJ0bikgYnRuLnRleHRDb250ZW50ID0gJ/CflI0gQXV0byc7CiAgICB9IGVsc2UgaWYgKHBob3RvID09PSBudWxsKSB7CiAgICAgIC8vIFN0aWxsIGNhcHR1cmluZwogICAgICBpZiAocGgpIHsgcGguc3R5bGUuZGlzcGxheT0nJzsgcGgudGV4dENvbnRlbnQ9J/Cfk7cgQ2FwdHVyaW5n4oCmJzsgfQogICAgICBpbWcuc3R5bGUuZGlzcGxheSA9ICdub25lJzsKICAgICAgc2V0VGltZW91dCh1cGRhdGVQaG90bywgMzUwKTsKICAgIH0gZWxzZSB7CiAgICAgIC8vIE5vIGNhbWVyYQogICAgICBpZiAocGgpIHsgcGguc3R5bGUuZGlzcGxheT0nJzsgcGgudGV4dENvbnRlbnQ9J05vIGNhbWVyYSc7IH0KICAgICAgaW1nLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgICB9CiAgfTsKICB1cGRhdGVQaG90bygpOwp9CgpmdW5jdGlvbiBoaWRlQmliUGFkKCkgewogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXJzaGFsLWJpYi1wYWQnKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKICBiaWJQZW5kaW5nS2V5ID0gbnVsbDsKfQoKZnVuY3Rpb24gYmliRGlnaXQoZCkgewogIGlmIChiaWJWYWx1ZS5sZW5ndGggPj0gNCkgcmV0dXJuOwogIGJpYlZhbHVlICs9IGQ7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcnNoYWwtYmliLWRpc3BsYXknKS50ZXh0Q29udGVudCA9IGJpYlZhbHVlIHx8ICdfJzsKfQoKZnVuY3Rpb24gYmliQmFjaygpIHsKICBiaWJWYWx1ZSA9IGJpYlZhbHVlLnNsaWNlKDAsLTEpOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXJzaGFsLWJpYi1kaXNwbGF5JykudGV4dENvbnRlbnQgPSBiaWJWYWx1ZSB8fCAnXyc7Cn0KCmFzeW5jIGZ1bmN0aW9uIGJpYkNvbmZpcm0oKSB7CiAgaWYgKGJpYlBlbmRpbmdLZXkpIHsKICAgIGNvbnN0IHVwZGF0ZXMgPSB7fTsKICAgIGlmIChiaWJWYWx1ZSkgdXBkYXRlcy5iaWIgPSBiaWJWYWx1ZTsKICAgIC8vIFNhdmUgY29tcHJlc3NlZCBwaG90byB0byBGaXJlYmFzZSAoYmFzZTY0IEpQRUcgfjE1LTIwS0IpCiAgICBjb25zdCBwaG90byA9IHhjUGhvdG9zLmdldChiaWJQZW5kaW5nS2V5KTsKICAgIGlmIChwaG90bykgdXBkYXRlcy5waG90byA9IHBob3RvOwogICAgaWYgKE9iamVjdC5rZXlzKHVwZGF0ZXMpLmxlbmd0aCkgewogICAgICBhd2FpdCBjUmVmKGB4Yy9jdXJyZW50L2ZpbmlzaGVzLyR7YmliUGVuZGluZ0tleX1gKS51cGRhdGUodXBkYXRlcyk7CiAgICB9CiAgfQogIGJpYlBlbmRpbmdRdWV1ZS5zaGlmdCgpOwogIGJpYlBlbmRpbmdLZXkgPSBudWxsOwogIHNob3dOZXh0QmliKCk7Cn0KCmZ1bmN0aW9uIGJpYlNraXAoKSB7CiAgYmliUGVuZGluZ1F1ZXVlLnNoaWZ0KCk7CiAgYmliUGVuZGluZ0tleSA9IG51bGw7CiAgc2hvd05leHRCaWIoKTsKfQoKZnVuY3Rpb24gbWFyc2hhbEVkaXRCaWIoa2V5LCBwbGFjZSwgZWxhcHNlZCkgewogIC8vIEVkaXQgYmliIGZvciBhbiBhbHJlYWR5LXRhcHBlZCBmaW5pc2hlcgogIGJpYlBlbmRpbmdRdWV1ZS51bnNoaWZ0KHsga2V5LCBwbGFjZSwgZWxhcHNlZCB9KTsKICBpZiAoIWJpYlBlbmRpbmdLZXkpIHNob3dOZXh0QmliKCk7Cn0KCmFzeW5jIGZ1bmN0aW9uIG1hcnNoYWxVbmRvKCkgewogIGlmICgheGNTdGF0ZSkgcmV0dXJuOwogIGNvbnN0IGZpbmlzaGVzID0geGNTdGF0ZS5maW5pc2hlc3x8e307CiAgY29uc3QgbWluZSA9IE9iamVjdC5lbnRyaWVzKGZpbmlzaGVzKQogICAgLmZpbHRlcigoW2ssZl0pPT5mLm1hcnNoYWxJZD09PW15SWQpCiAgICAuc29ydCgoYSxiKT0+KGJbMV0udGFwQXR8fDApLShhWzFdLnRhcEF0fHwwKSk7CiAgaWYgKCFtaW5lLmxlbmd0aCkgeyB0b2FzdCgnTm90aGluZyB0byB1bmRvJyk7IHJldHVybjsgfQogIGNvbnN0IFtrZXksIGxhc3RdID0gbWluZVswXTsKICBjb25zdCB0b3RhbCA9IE9iamVjdC5rZXlzKGZpbmlzaGVzKS5sZW5ndGg7CiAgbW9kYWwoJ1VuZG8gbGFzdCB0YXAnLAogICAgYFJlbW92ZSB0YXAgYXQgJHtmbXRNcyhsYXN0LmVsYXBzZWRNcyl9PyAoJHt0b3RhbH0gdG90YWwgZmluaXNoZXJzKWAsCiAgICBbCiAgICAgIHsgbGFiZWw6J1VuZG8nLCBjbHM6J2J0bi1kYW5nZXInLCBmbjogYXN5bmMgKCk9PnsKICAgICAgICBhd2FpdCBjUmVmKGB4Yy9jdXJyZW50L2ZpbmlzaGVzLyR7a2V5fWApLnJlbW92ZSgpOwogICAgICAgIC8vIFJlbW92ZSBmcm9tIGJpYiBxdWV1ZSBpZiBwZW5kaW5nCiAgICAgICAgYmliUGVuZGluZ1F1ZXVlID0gYmliUGVuZGluZ1F1ZXVlLmZpbHRlcihxPT5xLmtleSE9PWtleSk7CiAgICAgICAgaWYgKGJpYlBlbmRpbmdLZXk9PT1rZXkpIHsgYmliUGVuZGluZ0tleT1udWxsOyBzaG93TmV4dEJpYigpOyB9CiAgICAgICAgdG9hc3QoJ1JlbW92ZWQnKTsKICAgICAgfX0sCiAgICAgIHsgbGFiZWw6J0NhbmNlbCcgfQogICAgXSk7Cn0KCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAovLyBDUk9TUyBDT1VOVFJZIOKAlCBBRE1JTiBWSUVXCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkApmdW5jdGlvbiBpbml0WENBZG1pblZpZXcoKSB7CiAgcmVxdWVzdFdha2VMb2NrKCk7IHN5bmNDbG9jaygpOwogIHdhdGNoQ29ubigneGMtYWRtaW4tZG90Jyk7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWFkbWluLXNjaG9vbC1sYmwnKS50ZXh0Q29udGVudCA9IGNhcm5pdmFsTWV0YT8uc2Nob29sfHwnJzsKCiAgY29uc3QgYWdlU2VsPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1hZ2Utc2VsJyk7CiAgYWdlU2VsLmlubmVySFRNTD1BR0VfR1JPVVBTLm1hcChhPT5gPG9wdGlvbj4ke2F9PC9vcHRpb24+YCkuam9pbignJyk7CiAgY29uc3QgZXZTZWw9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWV2ZW50LXNlbCcpOwogIGV2U2VsLmlubmVySFRNTD1FVkVOVFMueGMubWFwKGU9PmA8b3B0aW9uPiR7ZX08L29wdGlvbj5gKS5qb2luKCcnKTsKCiAgY29uc3QgeGNSZWY9Y1JlZigneGMvY3VycmVudCcpOwogIHhjUmVmLm9uKCd2YWx1ZScsIHNuYXA9PnsgeGNTdGF0ZT1zbmFwLnZhbCgpOyByZW5kZXJYQ0FkbWluVmlldyh4Y1N0YXRlKTsgfSk7CiAgYWN0aXZlTGlzdGVuZXJzLnB1c2goKCk9PnhjUmVmLm9mZigpKTsKCiAgZnVuY3Rpb24gdGljaygpIHsKICAgIGlmICh4Y1N0YXRlPy5zdGF0ZT09PSdsaXZlJyAmJiB4Y1N0YXRlLnN0YXJ0ZWRBdFNlcnZlcikgewogICAgICBjb25zdCBlbD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgneGMtYWRtaW4tY2xvY2snKTsKICAgICAgaWYoZWwpIGVsLnRleHRDb250ZW50PWZtdE1zKG5vd1NlcnZlcigpLXhjU3RhdGUuc3RhcnRlZEF0U2VydmVyKTsKICAgIH0KICAgIHJhZklkPXJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTsKICB9CiAgcmFmSWQ9cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spOwp9CgpmdW5jdGlvbiBzZWxlY3RYQ0dlbmRlcihnKSB7CiAgeGNHZW5kZXI9ZzsKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS14Y2ddJykuZm9yRWFjaChwPT5wLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpKTsKICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS14Y2c9IiR7Z30iXWApLmZvckVhY2gocD0+cC5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKSk7Cn0KCmFzeW5jIGZ1bmN0aW9uIHhjQWRtaW5Bcm0oKSB7CiAgaWYgKCFhd2FpdCBfY29uZmlybU1vZGFsKCdBcm0gdGhpcyBYQyByYWNlPycsICdBbGwgY29ubmVjdGVkIHRpbWVycyBhbmQgdGhlIFN0YXJ0ZXIgd2lsbCBiZSBub3RpZmllZC4nLCAnQVJNIFJBQ0Ug4oaSJykpIHJldHVybjsKICBjb25zdCBhZ2UgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWFnZS1zZWwnKS52YWx1ZTsKICBjb25zdCBldmVudD0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWV2ZW50LXNlbCcpLnZhbHVlOwogIGF3YWl0IGNSZWYoJ3hjL2N1cnJlbnQnKS5zZXQoewogICAgcmFjZUlkOmdlbklkKDYpLCBhZ2UsIGdlbmRlcjp4Y0dlbmRlciwgZXZlbnQsCiAgICBzdGF0ZTonYXJtZWQnLCBmaW5pc2hlczp7fSwKICAgIGFybWVkQXQ6ZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QCiAgfSk7CiAgdG9hc3QoJ1hDIFJhY2UgYXJtZWQnKTsKfQoKYXN5bmMgZnVuY3Rpb24geGNBZG1pbkdvKCkgewogIGlmICgheGNTdGF0ZSB8fCB4Y1N0YXRlLnN0YXRlIT09J2FybWVkJykgcmV0dXJuOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1nby1idG4nKS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywnJyk7CiAgc2hvd0NvdW50ZG93bihhc3luYyAoKT0+ewogICAgYXdhaXQgY1JlZigneGMvY3VycmVudCcpLnVwZGF0ZSh7c3RhdGU6J2xpdmUnLCBzdGFydGVkQXRTZXJ2ZXI6ZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QfSk7CiAgfSk7Cn0KCmFzeW5jIGZ1bmN0aW9uIHhjQWRtaW5SZWNhbGwoKSB7CiAgYXdhaXQgY1JlZigneGMvY3VycmVudCcpLnVwZGF0ZSh7c3RhdGU6J2FybWVkJywgc3RhcnRlZEF0U2VydmVyOm51bGx9KTsKICBicm9hZGNhc3RSZWNhbGwoKTsKfQoKYXN5bmMgZnVuY3Rpb24geGNBZG1pbkFiYW5kb24oKSB7CiAgbW9kYWwoJ0FiYW5kb24gUmFjZScsJ1JldHVybiB0byBzZXR1cD8nLFsKICAgIHsgbGFiZWw6J0FiYW5kb24nLCBjbHM6J2J0bi1kYW5nZXInLCBmbjphc3luYygpPT57CiAgICAgIGF3YWl0IGNSZWYoJ3hjL2N1cnJlbnQnKS5zZXQoe3N0YXRlOidpZGxlJ30pOwogICAgfX0sCiAgICB7IGxhYmVsOidDYW5jZWwnIH0KICBdKTsKfQoKYXN5bmMgZnVuY3Rpb24geGNBZG1pblB1Ymxpc2goKSB7CiAgaWYgKCF4Y1N0YXRlKSByZXR1cm47CiAgY29uc3QgZmluaXNoZXMgPSB4Y1N0YXRlLmZpbmlzaGVzfHx7fTsKICBjb25zdCBzb3J0ZWQgICA9IE9iamVjdC5lbnRyaWVzKGZpbmlzaGVzKS5zb3J0KChhLGIpPT4oYVsxXS50YXBBdHx8MCktKGJbMV0udGFwQXR8fDApKTsKCiAgY29uc3QgbnVtUXVhbCA9IHBhcnNlSW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1xdWFsLXNwb3RzJyk/LnZhbHVlKXx8MDsKCiAgaWYgKCFhd2FpdCBfY29uZmlybU1vZGFsKAogICAgJ1B1Ymxpc2ggWEMgUmVzdWx0cycsCiAgICBgJHtzb3J0ZWQubGVuZ3RofSBmaW5pc2hlciR7c29ydGVkLmxlbmd0aCE9PTE/J3MnOicnfSDCtyAke251bVF1YWx9IHF1YWxpZmllciBzcG90JHtudW1RdWFsIT09MT8ncyc6Jyd9YCwKICAgICdQVUJMSVNIIOKGkicKICApKSByZXR1cm47CgogIHRvYXN0KCdQdWJsaXNoaW5nICYgZ2VuZXJhdGluZyBjYXJkc+KApicpOwoKICAvLyBHZW5lcmF0ZSBmaW5pc2ggY2FyZHMgZm9yIGZpbmlzaGVycyB3aXRoIHBob3RvcwogIGNvbnN0IGNhcmRzID0ge307CiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzb3J0ZWQubGVuZ3RoOyBpKyspIHsKICAgIGNvbnN0IFtrLCBmXSA9IHNvcnRlZFtpXTsKICAgIGNvbnN0IHBsYWNlID0gaSArIDE7CiAgICB0cnkgewogICAgICBjYXJkc1twbGFjZV0gPSBhd2FpdCBnZW5lcmF0ZUZpbmlzaENhcmQoewogICAgICAgIHBsYWNlLCBuYW1lOiBmLm5hbWUgfHwgKGYuYmliID8gJ0JpYiAnICsgZi5iaWIgOiAnRmluaXNoZXIgJyArIHBsYWNlKSwKICAgICAgICBlbGFwc2VkTXM6IGYuZWxhcHNlZE1zLCBwaG90bzogZi5waG90b3x8bnVsbCwKICAgICAgICBhZ2U6IHhjU3RhdGUuYWdlLCBnZW5kZXI6IHhjU3RhdGUuZ2VuZGVyLAogICAgICAgIGV2ZW50OiB4Y1N0YXRlLmV2ZW50LCBzY2hvb2w6IGNhcm5pdmFsTWV0YT8uc2Nob29sfHwnJwogICAgICB9KTsKICAgIH0gY2F0Y2goZSkgeyAvKiBza2lwIGJhZCBmcmFtZXMgKi8gfQogIH0KCiAgY29uc3Qga2V5ID0gZmJFbmMoYHhjLSR7eGNTdGF0ZS5hZ2V9LSR7eGNTdGF0ZS5nZW5kZXJ9LSR7eGNTdGF0ZS5ldmVudH0tJHt4Y1N0YXRlLnJhY2VJZH1gKTsKICBhd2FpdCBjUmVmKGByZXN1bHRzLyR7a2V5fWApLnNldCh7CiAgICB0eXBlOid4YycsIGFnZTp4Y1N0YXRlLmFnZSwgZ2VuZGVyOnhjU3RhdGUuZ2VuZGVyLCBldmVudDp4Y1N0YXRlLmV2ZW50LAogICAgcmFjZUlkOnhjU3RhdGUucmFjZUlkLAogICAgcXVhbGlmaWVyU3BvdHM6IG51bVF1YWwsCiAgICBwbGFjZXM6IHNvcnRlZC5tYXAoKFtrLGZdLGkpID0+ICh7CiAgICAgIHBsYWNlOiAgICAgICBpICsgMSwKICAgICAgYmliOiAgICAgICAgIGYuYmlifHwnJywKICAgICAgbmFtZTogICAgICAgIGYubmFtZXx8JycsCiAgICAgIGVsYXBzZWRNczogICBmLmVsYXBzZWRNcywKICAgICAgcXVhbGlmaWVyOiAgIG51bVF1YWwgPiAwICYmIChpKzEpIDw9IG51bVF1YWwsCiAgICAgIC4uLihjYXJkc1tpKzFdID8geyBjYXJkOiBjYXJkc1tpKzFdIH0gOiB7fSkKICAgIH0pKSwKICAgIHB1Ymxpc2hlZEF0OiBmaXJlYmFzZS5kYXRhYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVAKICB9KTsKICBhd2FpdCBjUmVmKCd4Yy9jdXJyZW50JykudXBkYXRlKHtzdGF0ZTonZG9uZSd9KTsKCiAgY29uc3QgcXVhbE1zZyA9IG51bVF1YWwgPyBgIMK3ICR7TWF0aC5taW4obnVtUXVhbCwgc29ydGVkLmxlbmd0aCl9IHF1YWxpZmllciR7bnVtUXVhbCE9PTE/J3MnOicnfSBmbGFnZ2VkYCA6ICcnOwogIHRvYXN0KCdYQyBwdWJsaXNoZWQhJyArIHF1YWxNc2cpOwoKICAvLyBPZmZlciB0byB2aWV3IGZpbmlzaCBjYXJkcyBpZiBhbnkgd2VyZSBnZW5lcmF0ZWQKICBjb25zdCBjYXJkQ291bnQgPSBPYmplY3Qua2V5cyhjYXJkcykubGVuZ3RoOwogIGlmIChjYXJkQ291bnQgPiAwKSB7CiAgICBzZXRUaW1lb3V0KCgpID0+IHNob3dGaW5pc2hDYXJkcyhjYXJkcywgc29ydGVkLCB4Y1N0YXRlKSwgMTIwMCk7CiAgfQp9CgovLyDilIDilIAgRmluaXNoIGNhcmQgZ2VuZXJhdG9yIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgAphc3luYyBmdW5jdGlvbiBnZW5lcmF0ZUZpbmlzaENhcmQoeyBwbGFjZSwgbmFtZSwgZWxhcHNlZE1zLCBwaG90bywgYWdlLCBnZW5kZXIsIGV2ZW50LCBzY2hvb2wgfSkgewogIGNvbnN0IFcgPSA0MDAsIEggPSA2MjA7CiAgY29uc3QgYyAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7CiAgYy53aWR0aCA9IFc7IGMuaGVpZ2h0ID0gSDsKICBjb25zdCBjdHggPSBjLmdldENvbnRleHQoJzJkJyk7CgogIC8vIEJhY2tncm91bmQKICBjdHguZmlsbFN0eWxlID0gJyMwZDExMTcnOwogIGN0eC5maWxsUmVjdCgwLCAwLCBXLCBIKTsKCiAgaWYgKHBob3RvKSB7CiAgICB0cnkgewogICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHsKICAgICAgICBjb25zdCBpbWcgPSBuZXcgSW1hZ2UoKTsKICAgICAgICBpbWcub25sb2FkID0gKCkgPT4gewogICAgICAgICAgLy8gRmlsbCB0b3AgNjIlIHdpdGggZmluaXNoIHBob3RvCiAgICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCwgVywgTWF0aC5yb3VuZChIICogMC42MikpOwogICAgICAgICAgcmVzKCk7CiAgICAgICAgfTsKICAgICAgICBpbWcub25lcnJvciA9IHJlajsKICAgICAgICBpbWcuc3JjID0gcGhvdG87CiAgICAgIH0pOwogICAgICAvLyBHcmFkaWVudCBmYWRlIGZyb20gcGhvdG8gdG8gZGFyawogICAgICBjb25zdCBnID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIEgqMC4zOCwgMCwgSCowLjYyKTsKICAgICAgZy5hZGRDb2xvclN0b3AoMCwgJ3JnYmEoMTMsMTcsMjMsMCknKTsKICAgICAgZy5hZGRDb2xvclN0b3AoMSwgJ3JnYmEoMTMsMTcsMjMsMSknKTsKICAgICAgY3R4LmZpbGxTdHlsZSA9IGc7CiAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBXLCBIKTsKICAgIH0gY2F0Y2goZSkgewogICAgICAvLyBObyBwaG90byBmYWxsYmFjayDigJQgdGVhbCBncmFkaWVudCBiYWNrZ3JvdW5kCiAgICAgIGNvbnN0IGcyID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KDAsIDAsIFcsIEgqMC41KTsKICAgICAgZzIuYWRkQ29sb3JTdG9wKDAsICcjMGQxMTE3Jyk7IGcyLmFkZENvbG9yU3RvcCgxLCAnIzBkNDA0MCcpOwogICAgICBjdHguZmlsbFN0eWxlID0gZzI7CiAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCBXLCBIKjAuNjIpOwogICAgfQogIH0gZWxzZSB7CiAgICBjb25zdCBnMiA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAwLCBXLCBIKjAuNSk7CiAgICBnMi5hZGRDb2xvclN0b3AoMCwgJyMwZDExMTcnKTsgZzIuYWRkQ29sb3JTdG9wKDEsICcjMGQzMDMwJyk7CiAgICBjdHguZmlsbFN0eWxlID0gZzI7CiAgICBjdHguZmlsbFJlY3QoMCwgMCwgVywgSCowLjYyKTsKICAgIC8vIENhbWVyYSBpY29uIHBsYWNlaG9sZGVyCiAgICBjdHguZmlsbFN0eWxlID0gJyMzMDM2M2QnOwogICAgY3R4LmZvbnQgPSAnNjRweCBBcmlhbCc7CiAgICBjdHgudGV4dEFsaWduID0gJ2NlbnRlcic7CiAgICBjdHguZmlsbFRleHQoJ/Cfj4MnLCBXLzIsIEgqMC4zMik7CiAgfQoKICBjb25zdCBiYXNlWSA9IEggKiAwLjY0OwoKICAvLyBBY2NlbnQgc3RyaXBlCiAgY3R4LmZpbGxTdHlsZSA9ICcjMTRiOGE2JzsKICBjdHguZmlsbFJlY3QoMCwgYmFzZVkgLSA0LCBXLCA0KTsKCiAgLy8gUGxhY2UgdGV4dCDigJQgZ29sZCAvIHNpbHZlciAvIGJyb256ZSAvIHRlYWwKICBjb25zdCBwbGFjZUNvbG9ycyA9IFsnI0ZGRDcwMCcsJyNDMEMwQzAnLCcjQ0Q3RjMyJ107CiAgY29uc3QgcGxhY2VUZXh0ICAgPSBbJzFTVCcsJzJORCcsJzNSRCddW3BsYWNlLTFdIHx8IChwbGFjZSArICdUSCcpOwogIGN0eC5maWxsU3R5bGUgID0gcGxhY2VDb2xvcnNbcGxhY2UtMV0gfHwgJyMxNGI4YTYnOwogIGN0eC5mb250ICAgICAgID0gYDkwMCAke3BsYWNlPD0zPzgwOjY0fXB4IEFyaWFsYDsKICBjdHgudGV4dEFsaWduICA9ICdjZW50ZXInOwogIGN0eC5zaGFkb3dDb2xvciA9ICdyZ2JhKDAsMCwwLDAuNiknOwogIGN0eC5zaGFkb3dCbHVyICA9IDg7CiAgY3R4LmZpbGxUZXh0KHBsYWNlVGV4dCwgVy8yLCBiYXNlWSArIDcyKTsKICBjdHguc2hhZG93Qmx1ciA9IDA7CgogIC8vIE5hbWUKICBjdHguZmlsbFN0eWxlID0gJyNmMGY2ZmMnOwogIGN0eC5mb250ICAgICAgPSAnYm9sZCAzNHB4IEFyaWFsJzsKICBjb25zdCBkaXNwbGF5TmFtZSA9IG5hbWUubGVuZ3RoID4gMjAgPyBuYW1lLnNsaWNlKDAsMTkpICsgJ+KApicgOiBuYW1lOwogIGN0eC5maWxsVGV4dChkaXNwbGF5TmFtZSwgVy8yLCBiYXNlWSArIDEyMCk7CgogIC8vIFRpbWUKICBjdHguZmlsbFN0eWxlID0gJyMxNGI4YTYnOwogIGN0eC5mb250ICAgICAgPSAnYm9sZCAyNnB4IEFyaWFsJzsKICBjdHguZmlsbFRleHQoZm10TXMoZWxhcHNlZE1zKSwgVy8yLCBiYXNlWSArIDE1OCk7CgogIC8vIEV2ZW50IGluZm8KICBjdHguZmlsbFN0eWxlID0gJyM4Yjk0OWUnOwogIGN0eC5mb250ICAgICAgPSAnMTdweCBBcmlhbCc7CiAgY3R4LmZpbGxUZXh0KGAke2FnZX0gJHtnZW5kZXJ9ICDCtyAgJHtldmVudH1gLCBXLzIsIGJhc2VZICsgMTg2KTsKCiAgLy8gU2Nob29sCiAgaWYgKHNjaG9vbCkgewogICAgY3R4LmZpbGxTdHlsZSA9ICcjOGI5NDllJzsKICAgIGN0eC5mb250ICAgICAgPSAnMTVweCBBcmlhbCc7CiAgICBjdHguZmlsbFRleHQoc2Nob29sLCBXLzIsIGJhc2VZICsgMjA3KTsKICB9CgogIC8vIEZvb3RlciBicmFuZGluZyBiYXIKICBjdHguZmlsbFN0eWxlID0gJyMxNjFiMjInOwogIGN0eC5maWxsUmVjdCgwLCBIIC0gMzgsIFcsIDM4KTsKICBjdHguZmlsbFN0eWxlID0gJyMzMDM2M2QnOwogIGN0eC5maWxsUmVjdCgwLCBIIC0gMzgsIFcsIDEpOwogIGN0eC5maWxsU3R5bGUgPSAnIzhiOTQ5ZSc7CiAgY3R4LmZvbnQgICAgICA9ICcxM3B4IEFyaWFsJzsKICBjdHguZmlsbFRleHQoJ2Nhcm5pdmFsdGltaW5nLmNvbScsIFcvMiwgSCAtIDEzKTsKCiAgcmV0dXJuIGMudG9EYXRhVVJMKCdpbWFnZS9qcGVnJywgMC44Mik7Cn0KCi8vIOKUgOKUgCBTaG93IGZpbmlzaCBjYXJkcyBzbGlkZXNob3cgYWZ0ZXIgcHVibGlzaCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKZnVuY3Rpb24gc2hvd0ZpbmlzaENhcmRzKGNhcmRzLCBzb3J0ZWQsIHhjKSB7CiAgbGV0IGlkeCA9IDA7CiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKGNhcmRzKS5tYXAoTnVtYmVyKS5zb3J0KChhLGIpPT5hLWIpOwogIGlmICgha2V5cy5sZW5ndGgpIHJldHVybjsKCiAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOwogIG92ZXJsYXkuaWQgPSAnZmluaXNoLWNhcmQtb3ZlcmxheSc7CgogIGNvbnN0IHJlbmRlciA9ICgpID0+IHsKICAgIGNvbnN0IHBsYWNlID0ga2V5c1tpZHhdOwogICAgY29uc3QgWywgZl0gPSBzb3J0ZWRbcGxhY2UtMV0gfHwgc29ydGVkWzBdOwogICAgb3ZlcmxheS5pbm5lckhUTUwgPSBgCiAgICAgIDxpbWcgc3JjPSIke2NhcmRzW3BsYWNlXX0iIHN0eWxlPSJtYXgtd2lkdGg6bWluKDMyMHB4LDg1dncpO2JvcmRlci1yYWRpdXM6MTJweDtib3gtc2hhZG93OjAgOHB4IDMycHggcmdiYSgwLDAsMCwuNikiPgogICAgICA8ZGl2IHN0eWxlPSJjb2xvcjojZjBmNmZjO2ZvbnQtc2l6ZTowLjlyZW07dGV4dC1hbGlnbjpjZW50ZXI7b3BhY2l0eTowLjciPiR7cGxhY2V9IG9mICR7a2V5cy5sZW5ndGh9IMK3IHRhcCB0byBzaGFyZTwvZGl2PgogICAgICA8ZGl2IGNsYXNzPSJjYXJkLWFjdGlvbnMiPgogICAgICAgICR7aWR4ID4gMCA/ICc8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSBidG4tc20iIGlkPSJfZmMtcHJldiI+4oaQIFByZXY8L2J1dHRvbj4nIDogJyd9CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSIgaWQ9Il9mYy1zaGFyZSI+U2hhcmUg8J+TpDwvYnV0dG9uPgogICAgICAgICR7aWR4IDwga2V5cy5sZW5ndGgtMSA/ICc8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSBidG4tc20iIGlkPSJfZmMtbmV4dCI+TmV4dCDihpI8L2J1dHRvbj4nIDogJyd9CiAgICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkgYnRuLXNtIiBpZD0iX2ZjLWNsb3NlIj7inJUgQ2xvc2U8L2J1dHRvbj4KICAgICAgPC9kaXY+YDsKCiAgICAvLyBCaW5kIGJ1dHRvbnMKICAgIG92ZXJsYXkucXVlcnlTZWxlY3RvcignI19mYy1jbG9zZScpLm9uY2xpY2sgPSAoKSA9PiBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG92ZXJsYXkpOwogICAgY29uc3QgcHJldkJ0biA9IG92ZXJsYXkucXVlcnlTZWxlY3RvcignI19mYy1wcmV2Jyk7CiAgICBjb25zdCBuZXh0QnRuID0gb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCcjX2ZjLW5leHQnKTsKICAgIGNvbnN0IHNoYXJlQnRuID0gb3ZlcmxheS5xdWVyeVNlbGVjdG9yKCcjX2ZjLXNoYXJlJyk7CiAgICBpZiAocHJldkJ0bikgcHJldkJ0bi5vbmNsaWNrID0gKCkgPT4geyBpZHgtLTsgcmVuZGVyKCk7IH07CiAgICBpZiAobmV4dEJ0bikgbmV4dEJ0bi5vbmNsaWNrID0gKCkgPT4geyBpZHgrKzsgcmVuZGVyKCk7IH07CiAgICBzaGFyZUJ0bi5vbmNsaWNrID0gYXN5bmMgKCkgPT4gewogICAgICBjb25zdCBkYXRhVXJsICA9IGNhcmRzW3BsYWNlXTsKICAgICAgY29uc3QgYmxvYiAgICAgPSBhd2FpdCAoYXdhaXQgZmV0Y2goZGF0YVVybCkpLmJsb2IoKTsKICAgICAgY29uc3QgZmlsZSAgICAgPSBuZXcgRmlsZShbYmxvYl0sIGBmaW5pc2gtJHt4Yy5hZ2V9LSR7eGMuZ2VuZGVyfS1wbGFjZSR7cGxhY2V9LmpwZ2AsIHt0eXBlOidpbWFnZS9qcGVnJ30pOwogICAgICBpZiAobmF2aWdhdG9yLmNhblNoYXJlICYmIG5hdmlnYXRvci5jYW5TaGFyZSh7ZmlsZXM6W2ZpbGVdfSkpIHsKICAgICAgICBuYXZpZ2F0b3Iuc2hhcmUoeyBmaWxlczpbZmlsZV0sIHRpdGxlOiBgJHtvcmRpbmFsKHBsYWNlKX0gUGxhY2Ug4oCUICR7eGMuYWdlfSAke3hjLmdlbmRlcn1gIH0pLmNhdGNoKCgpPT57fSk7CiAgICAgIH0gZWxzZSB7CiAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTsKICAgICAgICBhLmhyZWYgPSBkYXRhVXJsOyBhLmRvd25sb2FkID0gZmlsZS5uYW1lOyBhLmNsaWNrKCk7CiAgICAgIH0KICAgIH07CiAgfTsKCiAgcmVuZGVyKCk7CiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChvdmVybGF5KTsKfQoKZnVuY3Rpb24gcmVuZGVyWENBZG1pblZpZXcoeGMpIHsKICBjb25zdCBzZXR1cD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgneGMtc2V0dXAtcGFuZWwnKTsKICBjb25zdCBsaXZlID1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgneGMtbGl2ZS1wYW5lbCcpOwoKICBpZiAoIXhjIHx8IHhjLnN0YXRlPT09J2lkbGUnKSB7CiAgICBzZXR1cC5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsgbGl2ZS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsgcmV0dXJuOwogIH0KICBzZXR1cC5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsgbGl2ZS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTsKCiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLXJhY2UtbGJsJykudGV4dENvbnRlbnQgPSBgJHt4Yy5hZ2V9ICR7eGMuZ2VuZGVyfSDCtyAke3hjLmV2ZW50fWA7CiAgY29uc3QgYmFkZ2UgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLXN0YXRlLWJhZGdlJyk7CiAgY29uc3QgZ29CdG4gID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWdvLWJ0bicpOwogIGNvbnN0IHB1YkJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1wdWJsaXNoLWJ0bicpOwoKICBpZiAoeGMuc3RhdGU9PT0nYXJtZWQnKSB7CiAgICBiYWRnZS5jbGFzc05hbWU9J2JhZGdlIGJhZGdlLWFybWVkJzsgYmFkZ2UudGV4dENvbnRlbnQ9J0FSTUVEJzsKICAgIGdvQnRuLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTsgcHViQnRuLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpOwogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWFkbWluLWNsb2NrJykudGV4dENvbnRlbnQ9JzA6MDAuMDAnOwogIH0gZWxzZSBpZiAoeGMuc3RhdGU9PT0nbGl2ZScpIHsKICAgIGJhZGdlLmNsYXNzTmFtZT0nYmFkZ2UgYmFkZ2UtbGl2ZSc7IGJhZGdlLnRleHRDb250ZW50PSdMSVZFJzsKICAgIGdvQnRuLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCcnKTsgcHViQnRuLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpOwogIH0gZWxzZSBpZiAoeGMuc3RhdGU9PT0nZG9uZScpIHsKICAgIGJhZGdlLmNsYXNzTmFtZT0nYmFkZ2UgYmFkZ2UtZG9uZSc7IGJhZGdlLnRleHRDb250ZW50PSdET05FJzsKICAgIHB1YkJ0bi5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKICB9CgogIGNvbnN0IGZpbmlzaGVzID0geGMuZmluaXNoZXN8fHt9OwogIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyhmaW5pc2hlcykKICAgIC5zb3J0KChhLGIpPT4oYVsxXS50YXBBdHx8MCktKGJbMV0udGFwQXR8fDApKTsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgneGMtY291bnQtbGJsJykudGV4dENvbnRlbnQgPSBlbnRyaWVzLmxlbmd0aCA/IGAke2VudHJpZXMubGVuZ3RofSBmaW5pc2hlcnNgIDogJyc7CgogIGNvbnN0IHF1YWxOID0gcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLXF1YWwtc3BvdHMnKT8udmFsdWUpfHwwOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1maW5pc2hlcnMtbGlzdCcpLmlubmVySFRNTCA9IGVudHJpZXMubWFwKChbayxmXSxpKT0+YAogICAgPGRpdiBjbGFzcz0icmVzdWx0LXJvdyIgc3R5bGU9ImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjZweCI+CiAgICAgIDxzcGFuIGNsYXNzPSJwbGFjZS1iYWRnZSI+JHtvcmRpbmFsKGkrMSl9PC9zcGFuPgogICAgICAke2YucGhvdG8gPyAnPHNwYW4gc3R5bGU9ImZvbnQtc2l6ZTowLjhyZW0iIHRpdGxlPSJQaG90byBjYXB0dXJlZCI+8J+Ttzwvc3Bhbj4nIDogJyd9CiAgICAgIDxzcGFuIGNsYXNzPSJyZXN1bHQtbmFtZSIgc3R5bGU9ImZsZXg6MSI+JHtmLm5hbWV8fChmLmJpYj8nQmliICcrZi5iaWI6J+KAlCcpfTwvc3Bhbj4KICAgICAgJHtxdWFsTiA+IDAgJiYgKGkrMSkgPD0gcXVhbE4gPyAnPHNwYW4gY2xhc3M9InF1YWxpZmllci1jaGlwIj7wn4+FIFFVQUw8L3NwYW4+JyA6ICcnfQogICAgICA8c3BhbiBjbGFzcz0icmVzdWx0LXRpbWUiPiR7Zm10TXMoZi5lbGFwc2VkTXMpfTwvc3Bhbj4KICAgIDwvZGl2PmApLmpvaW4oJycpOwp9Cgphc3luYyBmdW5jdGlvbiBleHBvcnRDU1YoKSB7CiAgY29uc3QgYnRuID0gZXZlbnQgJiYgZXZlbnQuY3VycmVudFRhcmdldDsKICBpZiAoYnRuKSB7IGJ0bi5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywnJyk7IGJ0bi50ZXh0Q29udGVudD0nRXhwb3J0aW5n4oCmJzsgfQogIHRyeSB7CiAgICBjb25zdCBzbmFwID0gYXdhaXQgY1JlZigncmVzdWx0cycpLm9uY2UoJ3ZhbHVlJyk7CiAgICBjb25zdCByZXN1bHRzID0gc25hcC52YWwoKSB8fCB7fTsKICAgIGNvbnN0IHJvd3MgPSBbWydUeXBlJywnQWdlJywnR2VuZGVyJywnRXZlbnQnLCdQbGFjZScsJ05hbWUnLCdUaW1lIChzKScsJ0RRJ11dOwogICAgT2JqZWN0LnZhbHVlcyhyZXN1bHRzKQogICAgICAuc29ydCgoYSxiKT0+KGEucHVibGlzaGVkQXR8fDApLShiLnB1Ymxpc2hlZEF0fHwwKSkKICAgICAgLmZvckVhY2gociA9PiB7CiAgICAgICAgaWYgKHIudHlwZT09PSd4YycpIHsKICAgICAgICAgIChyLnBsYWNlc3x8W10pLmZvckVhY2gocCA9PiB7CiAgICAgICAgICAgIHJvd3MucHVzaChbJ1hDJyxyLmFnZXx8Jycsci5nZW5kZXJ8fCcnLHIuZXZlbnR8fCcnLHAucGxhY2V8fCcnLHAubmFtZXx8JycsKHAuZWxhcHNlZE1zLzEwMDApLnRvRml4ZWQoMiksJyddKTsKICAgICAgICAgIH0pOwogICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAoci5yZXN1bHRzfHxbXSkuZm9yRWFjaChsID0+IHsKICAgICAgICAgICAgY29uc3QgZHFGbGFnID0gbC5kcSA/ICdZJyA6ICcnOwogICAgICAgICAgICByb3dzLnB1c2goWydMYW5lJyxyLmFnZXx8Jycsci5nZW5kZXJ8fCcnLHIuZXZlbnR8fCcnLGwuZHE/J0RRJzoobC5wbGFjZXx8JycpLGwubmFtZXx8YExhbmUgJHtsLmxhbmV9YCxsLmRxPycnOihsLnRpbWVNcy8xMDAwKS50b0ZpeGVkKDIpLGRxRmxhZ10pOwogICAgICAgICAgfSk7CiAgICAgICAgfQogICAgICB9KTsKICAgIGNvbnN0IGNzdiA9IHJvd3MubWFwKHI9PnIubWFwKGM9PmAiJHtTdHJpbmcoYykucmVwbGFjZSgvIi9nLCdcIicpfSJgKSAgLmpvaW4oJywnKSkuam9pbignXG4nKTsKICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbY3N2XSwge3R5cGU6J3RleHQvY3N2J30pOwogICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTsKICAgIGEuaHJlZiA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7CiAgICBhLmRvd25sb2FkID0gYHJlc3VsdHMtJHtjYXJuaXZhbENvZGV8fCdjYXJuaXZhbCd9LSR7bmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNsaWNlKDAsMTApfS5jc3ZgOwogICAgYS5jbGljaygpOwogIH0gY2F0Y2goZSkgeyB0b2FzdCgnRXhwb3J0IGZhaWxlZDogJyArIGUubWVzc2FnZSk7IH0KICBpZiAoYnRuKSB7IGJ0bi5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7IGJ0bi50ZXh0Q29udGVudD0nRXhwb3J0IENTVic7IH0KfQoKLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCi8vIOKUgOKUgCBWSURFTyBGSU5JU0gg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACi8vIFNUQVRFCmxldCB2ZlN0cmVhbSAgICAgICAgICAgPSBudWxsOwpsZXQgdmZSYWNlU3RhcnRNcyAgICAgID0gMDsKbGV0IHZmT2ZmbGluZU1vZGUgICAgICA9IGZhbHNlOwpsZXQgdmZNb2RlICAgICAgICAgICAgID0gJ3N3aW0nOyAgICAvLyAnc3dpbScgfCAndHJhY2snCmxldCB2ZkxhbmVDb3VudCAgICAgICAgPSA0OwpsZXQgdmZEZXRlY3Rpb25zICAgICAgID0gW107CmxldCB2ZkxpdmVSYWZJZCAgICAgICAgPSBudWxsOwpsZXQgdmZMaXZlT2Zmc2NyICAgICAgID0gbnVsbDsKbGV0IHZmTGl2ZVN0YXRlICAgICAgICA9ICdpZGxlJzsgICAgLy8gJ2NhbGlicmF0aW5nJ3wncmVhZHknfCdkZXRlY3RpbmcnfCdkb25lJwpsZXQgdmZMaXZlVGhyZXNob2xkcyAgID0gbnVsbDsKbGV0IHZmTGl2ZVByZXYgICAgICAgICA9IG51bGw7CmxldCB2ZkxhbmVGb3VuZCAgICAgICAgPSBbXTsKbGV0IHZmQ2FsRGF0YSAgICAgICAgICA9IG51bGw7CgpmdW5jdGlvbiB2ZkdldE9mZnNldCgpICAgeyByZXR1cm4gcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZmLW9mZnNldC1pbnB1dCcpPy52YWx1ZXx8NzUsMTApfHwwOyB9CmZ1bmN0aW9uIHZmR2V0UHJvZ3Jlc3MoKSB7IHJldHVybiBwYXJzZUludChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmYtcHJvZ3Jlc3MtaW5wdXQnKT8udmFsdWV8fDIsMTApfHwyOyB9CgovLyDilIDilIAgTW9kZSAvIGxhbmUgVUkg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACmZ1bmN0aW9uIHZmU2V0TW9kZShtb2RlKSB7CiAgdmZNb2RlID0gbW9kZTsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmYtbW9kZS1zd2ltLWJ0bicpLmNsYXNzTmFtZSAgPSBtb2RlPT09J3N3aW0nICA/ICdidG4gYnRuLXByaW1hcnknICAgOiAnYnRuIGJ0bi1zZWNvbmRhcnknOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2Zi1tb2RlLXRyYWNrLWJ0bicpLmNsYXNzTmFtZSA9IG1vZGU9PT0ndHJhY2snID8gJ2J0biBidG4tcHJpbWFyeScgICA6ICdidG4gYnRuLXNlY29uZGFyeSc7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZmLWxhbmUtcm93Jykuc3R5bGUuZGlzcGxheSAgID0gbW9kZT09PSdzd2ltJyAgPyAnZmxleCcgOiAnbm9uZSc7CiAgaWYgKHZmTGl2ZVN0YXRlICE9PSAnaWRsZScpIHZmUmVzdGFydENhbGlicmF0aW9uKCk7Cn0KZnVuY3Rpb24gdmZTZXRMYW5lcyhuKSB7CiAgdmZMYW5lQ291bnQgPSBuOwogIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy52Zi1sYW5lLWJ0bicpLmZvckVhY2goYiA9PiBiLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScsIHBhcnNlSW50KGIuZGF0YXNldC5sYW5lcyk9PT1uKSk7CiAgaWYgKHZmTGl2ZVN0YXRlICE9PSAnaWRsZScpIHZmUmVzdGFydENhbGlicmF0aW9uKCk7Cn0KCi8vIOKUgOKUgCBJbml0IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgApmdW5jdGlvbiBpbml0VmlkZW9GaW5pc2goKSB7CiAgcmVxdWVzdFdha2VMb2NrKCk7IHN5bmNDbG9jaygpOwogIHZmU2V0TW9kZSgnc3dpbScpOwoKICAvLyBXYXRjaCByYWNlIHN0YXRlIGZyb20gRmlyZWJhc2UKICBjb25zdCByZWYgPSBjUmVmKCdyYWNlL2N1cnJlbnQnKTsKICByZWYub24oJ3ZhbHVlJywgc25hcCA9PiB7CiAgICBjb25zdCByYyA9IHNuYXAudmFsKCk7CiAgICBpZiAoIXJjKSByZXR1cm47CiAgICBpZiAocmMuc3RhdGU9PT0nbGl2ZScgJiYgcmMuc3RhcnRlZEF0U2VydmVyKSB7CiAgICAgIHZmUmFjZVN0YXJ0TXMgPSByYy5zdGFydGVkQXRTZXJ2ZXI7CiAgICAgIHZmT2ZmbGluZU1vZGUgPSBmYWxzZTsKICAgICAgaWYgKHZmTGl2ZVN0YXRlID09PSAncmVhZHknKSB7CiAgICAgICAgdmZMaXZlU3RhdGUgPSAnZGV0ZWN0aW5nJzsKICAgICAgICB2ZkxpdmVQcmV2ICA9IG5ldyBBcnJheSh2ZkxhbmVDb3VudCkuZmlsbChudWxsKTsKICAgICAgICB2ZkxhbmVGb3VuZCA9IG5ldyBBcnJheSh2ZkxhbmVDb3VudCkuZmlsbChmYWxzZSk7CiAgICAgICAgdmZTZXRTdGF0dXMoJ1x1RDgzRFx1REQzNCBEZXRlY3RpbmfigKYnLCAnI2VmNDQ0NCcpOwogICAgICB9CiAgICAgIC8vIGlmIHN0aWxsIGNhbGlicmF0aW5nIGl0IHdpbGwgc3dpdGNoIGF1dG9tYXRpY2FsbHkgd2hlbiBjYWwgZmluaXNoZXMKICAgIH0gZWxzZSBpZiAocmMuc3RhdGU9PT0nYXJtZWQnKSB7CiAgICAgIHZmU2V0U3RhdHVzKCdcdTI2QTEgUmVhZHkg4oCUIHdhaXRpbmcgZm9yIEdPJywgJyNlYWIzMDgnKTsKICAgIH0KICB9KTsKICBhY3RpdmVMaXN0ZW5lcnMucHVzaCgoKSA9PiByZWYub2ZmKCkpOwoKICAvLyBTdGFydCBjYW1lcmEKICBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSh7CiAgICB2aWRlbzogeyBmYWNpbmdNb2RlOidlbnZpcm9ubWVudCcsIHdpZHRoOntpZGVhbDoxOTIwfSwgaGVpZ2h0OntpZGVhbDoxMDgwfSB9LAogICAgYXVkaW86IGZhbHNlCiAgfSkudGhlbihzdHJlYW0gPT4gewogICAgdmZTdHJlYW0gPSBzdHJlYW07CiAgICBjb25zdCB2aWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmYtdmlkZW8tcHJldmlldycpOwogICAgdmlkLnNyY09iamVjdCA9IHN0cmVhbTsgdmlkLnBsYXkoKTsKICAgIHZpZC5hZGRFdmVudExpc3RlbmVyKCdwbGF5aW5nJywgKCkgPT4gewogICAgICB2ZlN0YXJ0Q2FsaWJyYXRpb24oKTsKICAgICAgdG9hc3QoJ0NhbWVyYSByZWFkeSDigJQgY2FsaWJyYXRpbmfigKYnKTsKICAgIH0sIHtvbmNlOnRydWV9KTsKICB9KS5jYXRjaChlcnIgPT4gewogICAgY29uc3QgbXNnID0gZXJyICYmIGVyci5uYW1lID09PSAnTm90Rm91bmRFcnJvcicKICAgICAgPyAnTm8gY2FtZXJhIGZvdW5kIG9uIHRoaXMgZGV2aWNlJwogICAgICA6IGVyciAmJiBlcnIubmFtZSA9PT0gJ05vdEFsbG93ZWRFcnJvcicKICAgICAgICA/ICdDYW1lcmEgYWNjZXNzIGRlbmllZCDigJQgY2hlY2sgYnJvd3NlciBwZXJtaXNzaW9ucycKICAgICAgICA6ICdDYW1lcmEgZXJyb3I6ICcgKyAoZXJyPy5tZXNzYWdlIHx8IGVycik7CiAgICB0b2FzdChtc2cpOwogICAgdmZTZXRTdGF0dXMoJ+KaoCAnICsgbXNnLCAnI2VmNDQ0NCcpOwogICAgLy8gU2hvdyByZXRyeSBidXR0b24gb24gdGhlIGNhbnZhcyBhcmVhCiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmYtbGl2ZS1jYW52YXMnKTsKICAgIGlmIChjYW52YXMpIHsKICAgICAgY2FudmFzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgICAgIGNvbnN0IGVyckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOwogICAgICBlcnJEaXYuaWQgPSAndmYtY2FtLWVycm9yJzsKICAgICAgZXJyRGl2LnN0eWxlLmNzc1RleHQgPSAndGV4dC1hbGlnbjpjZW50ZXI7cGFkZGluZzozMnB4IDE2cHg7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlLTIpO2JvcmRlci1yYWRpdXM6MTJweDttYXJnaW4tYm90dG9tOjEwcHgnOwogICAgICBlcnJEaXYuaW5uZXJIVE1MID0gYDxkaXYgc3R5bGU9ImZvbnQtc2l6ZToycmVtO21hcmdpbi1ib3R0b206OHB4Ij7wn5O3PC9kaXY+PGRpdiBzdHlsZT0iY29sb3I6dmFyKC0tZGFuZ2VyKTtmb250LXdlaWdodDo2MDA7bWFyZ2luLWJvdHRvbToxNnB4Ij4ke21zZ308L2Rpdj48YnV0dG9uIGNsYXNzPSJidG4gYnRuLXByaW1hcnkiIG9uY2xpY2s9InZmUmV0cnlDYW1lcmEoKSI+UmV0cnkgQ2FtZXJhPC9idXR0b24+YDsKICAgICAgY2FudmFzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVyckRpdiwgY2FudmFzKTsKICAgIH0KICB9KTsKfQoKZnVuY3Rpb24gdmZTZXRTdGF0dXModGV4dCwgZG90Q29sb3IpIHsKICBjb25zdCBlbCAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmYtcmFjZS1zdGF0dXMnKTsKICBjb25zdCBkb3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmYtc3RhdHVzLWRvdCcpOwogIGlmIChlbCkgIGVsLnRleHRDb250ZW50ID0gdGV4dDsKICBpZiAoZG90KSBkb3Quc3R5bGUuYmFja2dyb3VuZCA9IGRvdENvbG9yIHx8ICd2YXIoLS1tdXRlZCknOwp9CmZ1bmN0aW9uIHZmU3RhcnRDYWxpYnJhdGlvbigpIHsKICB2ZkxpdmVTdGF0ZSA9ICdjYWxpYnJhdGluZyc7CiAgdmZDYWxEYXRhID0gewogICAgYmFzZWxpbmVzOiBuZXcgQXJyYXkodmZMYW5lQ291bnQpLmZpbGwoMCksCiAgICBjb3VudHM6ICAgIG5ldyBBcnJheSh2ZkxhbmVDb3VudCkuZmlsbCgwKSwKICAgIHByZXY6ICAgICAgbmV3IEFycmF5KHZmTGFuZUNvdW50KS5maWxsKG51bGwpLAogICAgc3RhcnRNczogICBEYXRlLm5vdygpCiAgfTsKICB2ZlNldFN0YXR1cygnQ2FsaWJyYXRpbmfigKYnLCAnIzZiNzI4MCcpOwogIGlmICghdmZMaXZlUmFmSWQpIHZmTGl2ZVJhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHZmTGl2ZUZyYW1lKTsKfQpmdW5jdGlvbiB2ZlJlc3RhcnRDYWxpYnJhdGlvbigpIHsKICB2ZkRldGVjdGlvbnMgPSBbXTsgdmZSZW5kZXJEZXRlY3Rpb25zKCk7CiAgdmZMaXZlU3RhdGUgPSAnaWRsZSc7CiAgdmZTdGFydENhbGlicmF0aW9uKCk7Cn0KCi8vIOKUgOKUgCBMaXZlIGRldGVjdGlvbiBsb29wIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgApmdW5jdGlvbiB2ZkxpdmVGcmFtZSgpIHsKICB2ZkxpdmVSYWZJZCA9IG51bGw7CiAgaWYgKHZmTGl2ZVN0YXRlID09PSAnaWRsZScgfHwgdmZMaXZlU3RhdGUgPT09ICdkb25lJykgcmV0dXJuOwoKICBjb25zdCB2aWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmYtdmlkZW8tcHJldmlldycpOwogIGlmICghdmlkIHx8ICF2aWQudmlkZW9XaWR0aCkgeyB2ZkxpdmVSYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh2ZkxpdmVGcmFtZSk7IHJldHVybjsgfQoKICBpZiAoIXZmTGl2ZU9mZnNjcikgdmZMaXZlT2Zmc2NyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7CiAgY29uc3Qgb2MgPSB2ZkxpdmVPZmZzY3I7CiAgb2Mud2lkdGggPSB2aWQudmlkZW9XaWR0aDsgb2MuaGVpZ2h0ID0gdmlkLnZpZGVvSGVpZ2h0OwogIGNvbnN0IGN0eCA9IG9jLmdldENvbnRleHQoJzJkJyk7CiAgY3R4LmRyYXdJbWFnZSh2aWQsIDAsIDApOwoKICAvLyBQdXNoIGZyYW1lIHRvIHZpc2libGUgY2FudmFzIHdpdGggb3ZlcmxheQogIHZmRHJhd092ZXJsYXkob2MsIGN0eCk7CgogIGNvbnN0IE4gPSB2ZkxhbmVDb3VudDsKICBjb25zdCBzYW1wbGUgPSBpID0+IHZmTW9kZT09PSdzd2ltJwogICAgPyB2ZlNhbXBsZVN0cmlwKGN0eCwgb2Mud2lkdGgsIG9jLmhlaWdodCwgaSwgTikKICAgIDogdmZTYW1wbGVIU3RyaXAoY3R4LCBvYy53aWR0aCwgb2MuaGVpZ2h0LCBpLCBOKTsKCiAgaWYgKHZmTGl2ZVN0YXRlID09PSAnY2FsaWJyYXRpbmcnKSB7CiAgICBjb25zdCBjYWwgPSB2ZkNhbERhdGE7CiAgICBmb3IgKGxldCBpPTA7IGk8TjsgaSsrKSB7CiAgICAgIGNvbnN0IHMgPSBzYW1wbGUoaSk7CiAgICAgIGlmIChjYWwucHJldltpXSkgeyBjYWwuYmFzZWxpbmVzW2ldICs9IHZmUGl4ZWxEaWZmKHMsIGNhbC5wcmV2W2ldKTsgY2FsLmNvdW50c1tpXSsrOyB9CiAgICAgIGNhbC5wcmV2W2ldID0gczsKICAgIH0KICAgIGlmIChEYXRlLm5vdygpIC0gY2FsLnN0YXJ0TXMgPj0gMjAwMCkgewogICAgICB2ZkxpdmVUaHJlc2hvbGRzID0gY2FsLmJhc2VsaW5lcy5tYXAoKGIsaSkgPT4KICAgICAgICBNYXRoLm1heCg2LCBjYWwuY291bnRzW2ldPjAgPyAoYi9jYWwuY291bnRzW2ldKSo0IDogMTApCiAgICAgICk7CiAgICAgIHZmTGl2ZVByZXYgID0gbmV3IEFycmF5KE4pLmZpbGwobnVsbCk7CiAgICAgIHZmTGFuZUZvdW5kID0gbmV3IEFycmF5KE4pLmZpbGwoZmFsc2UpOwogICAgICBpZiAodmZSYWNlU3RhcnRNcyAmJiBub3dTZXJ2ZXIoKSA+IHZmUmFjZVN0YXJ0TXMpIHsKICAgICAgICB2ZkxpdmVTdGF0ZSA9ICdkZXRlY3RpbmcnOwogICAgICAgIHZmU2V0U3RhdHVzKCdcdUQ4M0RcdUREMzQgRGV0ZWN0aW5n4oCmJywgJyNlZjQ0NDQnKTsKICAgICAgfSBlbHNlIHsKICAgICAgICB2ZkxpdmVTdGF0ZSA9ICdyZWFkeSc7CiAgICAgICAgdmZTZXRTdGF0dXMoJ1x1MjcxMyBSZWFkeSDigJQgd2FpdGluZyBmb3IgR08nLCAnIzIyYzU1ZScpOwogICAgICB9CiAgICB9CiAgfSBlbHNlIGlmICh2ZkxpdmVTdGF0ZSA9PT0gJ2RldGVjdGluZycpIHsKICAgIGNvbnN0IG5vd01zID0gbm93U2VydmVyKCk7CiAgICBmb3IgKGxldCBpPTA7IGk8TjsgaSsrKSB7CiAgICAgIGlmICh2ZkxhbmVGb3VuZFtpXSkgY29udGludWU7CiAgICAgIGNvbnN0IHMgPSBzYW1wbGUoaSk7CiAgICAgIGlmICh2ZkxpdmVQcmV2W2ldICYmIHZmUGl4ZWxEaWZmKHMsIHZmTGl2ZVByZXZbaV0pID4gdmZMaXZlVGhyZXNob2xkc1tpXSkgewogICAgICAgIGNvbnN0IGVsYXBzZWRNcyA9IG5vd01zIC0gdmZSYWNlU3RhcnRNcyAtIHZmR2V0T2Zmc2V0KCk7CiAgICAgICAgaWYgKGVsYXBzZWRNcyA+IDEwMCkgewogICAgICAgICAgY29uc3Qgc3RpbGwgPSBvYy50b0RhdGFVUkwoJ2ltYWdlL2pwZWcnLCAwLjgpOwogICAgICAgICAgdmZEZXRlY3Rpb25zLnB1c2goeyBsYW5lOmkrMSwgZWxhcHNlZE1zLCBzdGlsbCB9KTsKICAgICAgICAgIHZmRGV0ZWN0aW9ucy5zb3J0KChhLGIpID0+IGEuZWxhcHNlZE1zIC0gYi5lbGFwc2VkTXMpOwogICAgICAgICAgdmZEZXRlY3Rpb25zLmZvckVhY2goKGQsaikgPT4gZC5wbGFjZSA9IGorMSk7CiAgICAgICAgICB2ZkxhbmVGb3VuZFtpXSA9IHRydWU7CiAgICAgICAgICB2ZlJlbmRlckRldGVjdGlvbnMoKTsKICAgICAgICAgIGNvbnN0IGxibCA9IHZmTW9kZT09PSd0cmFjaycgPyBgTGFuZSAke2krMX1gIDogYFN0cmlwICR7aSsxfWA7CiAgICAgICAgICB0b2FzdChgJHtsYmx9OiAke2ZtdE1zKGVsYXBzZWRNcyl9YCk7CiAgICAgICAgICBjb25zdCBkYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2Zi1kZXRlY3QtY291bnQnKTsKICAgICAgICAgIGlmIChkYykgZGMudGV4dENvbnRlbnQgPSBgJHt2ZkRldGVjdGlvbnMubGVuZ3RofS8ke059YDsKICAgICAgICB9CiAgICAgIH0KICAgICAgdmZMaXZlUHJldltpXSA9IHM7CiAgICB9CiAgICBpZiAodmZMYW5lRm91bmQuZXZlcnkoQm9vbGVhbikpIHsKICAgICAgdmZMaXZlU3RhdGUgPSAnZG9uZSc7CiAgICAgIHZmU2V0U3RhdHVzKCdcdTI3MTMgQWxsIGRvbmUnLCAnIzIyYzU1ZScpOwogICAgICByZXR1cm47CiAgICB9CiAgfQogIHZmTGl2ZVJhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHZmTGl2ZUZyYW1lKTsKfQoKLy8gRHJhdyBjYW1lcmEgZnJhbWUgKyBsYW5lIGRpdmlkZXJzIG9udG8gdmlzaWJsZSBjYW52YXMKZnVuY3Rpb24gdmZEcmF3T3ZlcmxheShvZmZzY3IsIHNyY0N0eCkgewogIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2Zi1saXZlLWNhbnZhcycpOwogIGlmICghY2FudmFzKSByZXR1cm47CiAgY2FudmFzLndpZHRoID0gb2Zmc2NyLndpZHRoOyBjYW52YXMuaGVpZ2h0ID0gb2Zmc2NyLmhlaWdodDsKICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTsKICBjdHguZHJhd0ltYWdlKG9mZnNjciwgMCwgMCk7CiAgY29uc3QgTiA9IHZmTGFuZUNvdW50LCB3ID0gY2FudmFzLndpZHRoLCBoID0gY2FudmFzLmhlaWdodDsKICBjdHguc2F2ZSgpOwogIGN0eC5saW5lV2lkdGggPSAyOwogIGN0eC5mb250ID0gYGJvbGQgJHtNYXRoLm1heCgxMiwgTWF0aC5mbG9vcihoLzIwKSl9cHggc2Fucy1zZXJpZmA7CiAgZm9yIChsZXQgaT0wOyBpPE47IGkrKykgewogICAgY29uc3QgZm91bmQgPSB2ZkxhbmVGb3VuZFtpXTsKICAgIGN0eC5zdHJva2VTdHlsZSA9IGZvdW5kID8gJ3JnYmEoMzQsMTk3LDk0LDAuOCknIDogJ3JnYmEoMjAsMTg0LDE2NiwwLjYpJzsKICAgIGN0eC5maWxsU3R5bGUgICA9IGZvdW5kID8gJ3JnYmEoMzQsMTk3LDk0LDAuOTUpJzogJ3JnYmEoMjAsMTg0LDE2NiwwLjkpJzsKICAgIGlmICh2Zk1vZGUgPT09ICdzd2ltJykgewogICAgICBjb25zdCB4ID0gTWF0aC5yb3VuZChpICogdyAvIE4pOwogICAgICBpZiAoaT4wKSB7IGN0eC5iZWdpblBhdGgoKTsgY3R4Lm1vdmVUbyh4LDApOyBjdHgubGluZVRvKHgsaCk7IGN0eC5zdHJva2UoKTsgfQogICAgICBjdHguZmlsbFRleHQoYEwke2krMX1gLCB4KzQsIDIyKTsKICAgIH0gZWxzZSB7CiAgICAgIGNvbnN0IHkgPSBNYXRoLnJvdW5kKGkgKiBoIC8gTik7CiAgICAgIGlmIChpPjApIHsgY3R4LmJlZ2luUGF0aCgpOyBjdHgubW92ZVRvKDAseSk7IGN0eC5saW5lVG8odyx5KTsgY3R4LnN0cm9rZSgpOyB9CiAgICAgIGN0eC5maWxsVGV4dChgTCR7aSsxfWAsIDYsIHkrMjIpOwogICAgfQogIH0KICBjdHgucmVzdG9yZSgpOwp9CgovLyDilIDilIAgUGl4ZWwgaGVscGVycyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKLy8gU2FtcGxlIGEgdmVydGljYWwgc3RyaXAgKHN3aW06IGNhbWVyYSBhdCBlbmQgd2FsbCkKZnVuY3Rpb24gdmZTYW1wbGVTdHJpcChjdHgsIGNhbnZhc1csIGNhbnZhc0gsIHN0cmlwSWR4LCBudW1TdHJpcHMpIHsKICBjb25zdCBzdyA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IoY2FudmFzVyAvIG51bVN0cmlwcykpOwogIGNvbnN0IHggID0gTWF0aC5taW4oc3RyaXBJZHggKiBzdywgY2FudmFzVyAtIDEpOwogIGNvbnN0IGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKHgsIDAsIHN3LCBjYW52YXNIKS5kYXRhOwogIGNvbnN0IG91dCA9IFtdOwogIGZvciAobGV0IGk9MDtpPGRhdGEubGVuZ3RoO2krPTIwKSBvdXQucHVzaCgoZGF0YVtpXSo3NytkYXRhW2krMV0qMTUwK2RhdGFbaSsyXSoyOSk+PjgpOwogIHJldHVybiBvdXQ7Cn0KLy8gU2FtcGxlIGEgaG9yaXpvbnRhbCBiYW5kICh0cmFjazogY2FtZXJhIGF0IHNpZGUgb2YgZmluaXNoIGxpbmUpCmZ1bmN0aW9uIHZmU2FtcGxlSFN0cmlwKGN0eCwgY2FudmFzVywgY2FudmFzSCwgc3RyaXBJZHgsIG51bVN0cmlwcykgewogIGNvbnN0IHNoID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihjYW52YXNIIC8gbnVtU3RyaXBzKSk7CiAgY29uc3QgeSAgPSBNYXRoLm1pbihzdHJpcElkeCAqIHNoLCBjYW52YXNIIC0gMSk7CiAgY29uc3QgZGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgeSwgY2FudmFzVywgc2gpLmRhdGE7CiAgY29uc3Qgb3V0ID0gW107CiAgZm9yIChsZXQgaT0wO2k8ZGF0YS5sZW5ndGg7aSs9MjApIG91dC5wdXNoKChkYXRhW2ldKjc3K2RhdGFbaSsxXSoxNTArZGF0YVtpKzJdKjI5KT4+OCk7CiAgcmV0dXJuIG91dDsKfQpmdW5jdGlvbiB2ZlBpeGVsRGlmZihhLGIpIHsKICBpZiAoIWF8fCFifHxhLmxlbmd0aCE9PWIubGVuZ3RoKSByZXR1cm4gMDsKICBsZXQgcz0wOyBmb3IgKGxldCBpPTA7aTxhLmxlbmd0aDtpKyspIHMrPU1hdGguYWJzKGFbaV0tYltpXSk7CiAgcmV0dXJuIHMvYS5sZW5ndGg7Cn0KCi8vIOKUgOKUgCBSZXN1bHRzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgApmdW5jdGlvbiB2ZlJlbmRlckRldGVjdGlvbnMoKSB7CiAgY29uc3QgbGlzdCAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmYtbWFyay1saXN0Jyk7CiAgaWYgKCF2ZkRldGVjdGlvbnMubGVuZ3RoKSB7CiAgICBsaXN0LmlubmVySFRNTD0nPGRpdiBjbGFzcz0idGV4dC1tdXRlZCB0ZXh0LXNtIHRleHQtY2VudGVyIG10LTgiPk5vIGZpbmlzaGVzIHlldDwvZGl2Pic7IHJldHVybjsKICB9CiAgY29uc3QgcHJvZ04gPSB2ZkdldFByb2dyZXNzKCk7CiAgbGlzdC5pbm5lckhUTUwgPSB2ZkRldGVjdGlvbnMubWFwKChkLGkpID0+IGAKICAgIDxkaXYgc3R5bGU9ImRpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7Z2FwOjhweDtwYWRkaW5nOjEwcHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO2ZsZXgtd3JhcDp3cmFwIj4KICAgICAgPHNwYW4gY2xhc3M9InBsYWNlLWJhZGdlIj4ke29yZGluYWwoZC5wbGFjZXx8aSsxKX08L3NwYW4+CiAgICAgICR7ZC5sYW5lID8gYDxzcGFuIHN0eWxlPSJjb2xvcjp2YXIoLS1hY2NlbnQpO2ZvbnQtd2VpZ2h0OjcwMDttaW4td2lkdGg6NTJweCI+TGFuZSAke2QubGFuZX08L3NwYW4+YCA6ICcnfQogICAgICA8c3BhbiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxcmVtO21pbi13aWR0aDo3NnB4O2ZvbnQtZmFtaWx5Om1vbm9zcGFjZSI+JHtmbXRNcyhkLmVsYXBzZWRNcyl9PC9zcGFuPgogICAgICAkeyhkLnBsYWNlfHxpKzEpIDw9IHByb2dOID8gJzxzcGFuIHN0eWxlPSJiYWNrZ3JvdW5kOiMxNmEzNGE7Y29sb3I6I2ZmZjtwYWRkaW5nOjJweCA4cHg7Ym9yZGVyLXJhZGl1czo0cHg7Zm9udC1zaXplOjAuN3JlbTtmb250LXdlaWdodDo3MDAiPlBST0dSRVNTRVM8L3NwYW4+JyA6ICcnfQogICAgICAke2Quc3RpbGwgPyBgPGltZyBzcmM9IiR7ZC5zdGlsbH0iIHN0eWxlPSJ3aWR0aDo2MHB4O2hlaWdodDozNHB4O29iamVjdC1maXQ6Y292ZXI7Ym9yZGVyLXJhZGl1czo0cHg7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1ib3JkZXIpIj5gIDogJyd9CiAgICAgIDxidXR0b24gY2xhc3M9InZmLW1hcmstYnRuIiBzdHlsZT0iY29sb3I6dmFyKC0tZGFuZ2VyKTttYXJnaW4tbGVmdDphdXRvIiBvbmNsaWNrPSJ2ZlJlbW92ZSgke2l9KSI+JiN4MjcxNTs8L2J1dHRvbj4KICAgIDwvZGl2PmApLmpvaW4oJycpOwp9CmZ1bmN0aW9uIHZmUmVtb3ZlKGkpIHsKICB2ZkRldGVjdGlvbnMuc3BsaWNlKGksMSk7CiAgdmZEZXRlY3Rpb25zLmZvckVhY2goKGQsaikgPT4gZC5wbGFjZT1qKzEpOwogIHZmUmVuZGVyRGV0ZWN0aW9ucygpOwp9CgovLyDilIDilIAgUHVibGlzaCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKYXN5bmMgZnVuY3Rpb24gdmZQdWJsaXNoKCkgewogIGlmICghdmZEZXRlY3Rpb25zLmxlbmd0aCkgeyB0b2FzdCgnTm90aGluZyB0byBwdWJsaXNoJyk7IHJldHVybjsgfQogIGNvbnN0IHBheWxvYWQgPSB7fTsKICB2ZkRldGVjdGlvbnMuZm9yRWFjaCgoZCxpKSA9PiB7CiAgICBjb25zdCBrID0gZC5sYW5lID8gU3RyaW5nKGQubGFuZSkgOiBgcGxhY2VfJHtpKzF9YDsKICAgIHBheWxvYWRba10gPSB7IHBsYWNlOmQucGxhY2V8fGkrMSwgZWxhcHNlZE1zOmQuZWxhcHNlZE1zLCAuLi4oZC5sYW5lP3tsYW5lOmQubGFuZX06e30pIH07CiAgfSk7CiAgYXdhaXQgY1JlZigncmFjZS9jdXJyZW50L3ZpZGVvRmluaXNoJykuc2V0KHsKICAgIG1hcmtzOnBheWxvYWQsIG1vZGU6dmZNb2RlLCBsYW5lczp2ZkxhbmVDb3VudCwKICAgIG9mZnNldE1zOnZmR2V0T2Zmc2V0KCksIG9mZmxpbmVNb2RlOnZmT2ZmbGluZU1vZGUsCiAgICByZWNvcmRlZEJ5Om15TmFtZXx8J1ZpZGVvIEZpbmlzaCcsCiAgICBwdWJsaXNoZWRBdDpmaXJlYmFzZS5kYXRhYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVAKICB9KTsKICB0b2FzdCgnVmlkZW8gZmluaXNoIHRpbWVzIHB1Ymxpc2hlZCEnKTsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmYtcHVibGlzaC1idG4nKS5kaXNhYmxlZCA9IHRydWU7Cn0KCi8vIOKUgOKUgCBDbGVhbnVwIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgApmdW5jdGlvbiB2ZkV4aXQoKSB7CiAgaWYgKHZmTGl2ZVJhZklkKSB7IGNhbmNlbEFuaW1hdGlvbkZyYW1lKHZmTGl2ZVJhZklkKTsgdmZMaXZlUmFmSWQ9bnVsbDsgfQogIGlmICh2ZlN0cmVhbSkgICAgeyB2ZlN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKHQ9PnQuc3RvcCgpKTsgdmZTdHJlYW09bnVsbDsgfQogIHZmTGl2ZVN0YXRlPSdpZGxlJzsgdmZEZXRlY3Rpb25zPVtdOwogIGVudGVyUm9sZSgncm9sZScpOwp9Ci8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAovLyBERU1PIC8gU0VFRAovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKYXN5bmMgZnVuY3Rpb24gX3NlZWRUZXN0Q2Fybml2YWwoKSB7CiAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTsKCiAgLy8gUHJlLXNlZWQgMyBwdWJsaXNoZWQgcmVzdWx0cyBzbyBSZXN1bHRzIEJvYXJkIHNob3dzIGNvbnRlbnQgaW1tZWRpYXRlbHkKICBhc3luYyBmdW5jdGlvbiBwdWIoa2V5LCBvYmopIHsKICAgIHRyeSB7IGF3YWl0IGNSZWYoJ3Jlc3VsdHMvJyArIGZiRW5jKGtleSkpLnNldChvYmopOyB9IGNhdGNoKGUpIHt9CiAgfQoKICBhd2FpdCBwdWIoJzEyLzEzIFllYXJzLUJveXMtMTAwbSBTcHJpbnQtc2VlZDAwMScsIHsKICAgIHR5cGU6J2xhbmUnLCBhZ2U6JzEyLzEzIFllYXJzJywgZ2VuZGVyOidCb3lzJywgZXZlbnQ6JzEwMG0gU3ByaW50JywKICAgIHJhY2VJZDonc2VlZDAwMScsCiAgICByZXN1bHRzOlsKICAgICAge3BsYWNlOjEsIGxhbmU6MywgbmFtZTonVG9tIEJyYWR5JywgICAgdGltZU1zOjEyMzQwfSwKICAgICAge3BsYWNlOjIsIGxhbmU6MSwgbmFtZTonSmFrZSBNaWxscycsICAgdGltZU1zOjEyNTgwfSwKICAgICAge3BsYWNlOjMsIGxhbmU6NSwgbmFtZTonQWxleCBDYXJ0ZXInLCAgdGltZU1zOjEyNzkwfSwKICAgICAge3BsYWNlOjQsIGxhbmU6MiwgbmFtZTonUnlhbiBTbWl0aCcsICAgdGltZU1zOjEzMDIwfSwKICAgICAge3BsYWNlOjUsIGxhbmU6NCwgbmFtZTonQ2hyaXMgTGVlJywgICAgdGltZU1zOjEzNDUwfQogICAgXSwKICAgIHB1Ymxpc2hlZEF0OiBub3cgLSA2MDAwMDAKICB9KTsKCiAgYXdhaXQgcHViKCcxMCBZZWFycy1HaXJscy01MG0gRnJlZXN0eWxlLXNlZWQwMDInLCB7CiAgICB0eXBlOidsYW5lJywgYWdlOicxMCBZZWFycycsIGdlbmRlcjonR2lybHMnLCBldmVudDonNTBtIEZyZWVzdHlsZScsCiAgICByYWNlSWQ6J3NlZWQwMDInLAogICAgcmVzdWx0czpbCiAgICAgIHtwbGFjZToxLCBsYW5lOjQsIG5hbWU6J0VtbWEgV2lsc29uJywgICB0aW1lTXM6MzQyMTB9LAogICAgICB7cGxhY2U6MiwgbGFuZToyLCBuYW1lOidTb3BoaWUgQ2hlbicsICAgdGltZU1zOjM0ODkwfSwKICAgICAge3BsYWNlOjMsIGxhbmU6NSwgbmFtZTonTGlseSBUaG9tcHNvbicsIHRpbWVNczozNTQyMH0sCiAgICAgIHtwbGFjZTo0LCBsYW5lOjEsIG5hbWU6J0F2YSBSb2JlcnRzJywgICB0aW1lTXM6MzYxMDB9CiAgICBdLAogICAgcHVibGlzaGVkQXQ6IG5vdyAtIDMwMDAwMAogIH0pOwoKICBhd2FpdCBwdWIoJ3hjLU9wZW4tTWl4ZWQtM2ttIENyb3NzIENvdW50cnktc2VlZDAwMycsIHsKICAgIHR5cGU6J3hjJywgYWdlOidPcGVuJywgZ2VuZGVyOidNaXhlZCcsIGV2ZW50Oicza20gQ3Jvc3MgQ291bnRyeScsCiAgICByYWNlSWQ6J3NlZWQwMDMnLAogICAgcGxhY2VzOlsKICAgICAge3BsYWNlOjEsIG5hbWU6J0pvcmRhbiBCbGFrZScsICBlbGFwc2VkTXM6NzQyMDAwfSwKICAgICAge3BsYWNlOjIsIG5hbWU6J1NhbSBBaG1lZCcsICAgICBlbGFwc2VkTXM6NzU0MDAwfSwKICAgICAge3BsYWNlOjMsIG5hbWU6J0Nhc2V5IE1vcmdhbicsICBlbGFwc2VkTXM6NzYxMDAwfSwKICAgICAge3BsYWNlOjQsIG5hbWU6J1JpbGV5IEpvaG5zb24nLCBlbGFwc2VkTXM6Nzc4MDAwfSwKICAgICAge3BsYWNlOjUsIG5hbWU6J1RheWxvciBXaGl0ZScsICBlbGFwc2VkTXM6Nzk1MDAwfQogICAgXSwKICAgIHB1Ymxpc2hlZEF0OiBub3cgLSAxMjAwMDAKICB9KTsKCiAgLy8gQXJtZWQgdHJhY2sgcmFjZSAoMjAwbSBTcHJpbnQpIHdpdGggZ2hvc3Qgc3BsaXRzIGZyb20gMiB2aXJ0dWFsIHRpbWVycwogIC8vIOKGkiBhZG1pbiBzZWVzIG11bHRpLXRpbWVyIGF2ZXJhZ2luZyBpbiBSYWNlIENvbnRyb2wgZG9uZSBwYW5lbCBBTkQgUmVzdWx0cyBCb2FyZAogIGNvbnN0IHNlZWQwMDRTcGxpdHMgPSB7CiAgICAxOnsgdF9naG9zdDE6e2VsYXBzZWRNczoyNzQ1MH0sIHRfZ2hvc3QyOntlbGFwc2VkTXM6Mjc0ODB9IH0sCiAgICAyOnsgdF9naG9zdDE6e2VsYXBzZWRNczoyNzgyMH0sIHRfZ2hvc3QyOntlbGFwc2VkTXM6Mjc4NTB9IH0sCiAgICAzOnsgdF9naG9zdDE6e2VsYXBzZWRNczoyODEwMH0sIHRfZ2hvc3QyOntlbGFwc2VkTXM6MjgxMzB9IH0sCiAgICA0OnsgdF9naG9zdDE6e2VsYXBzZWRNczoyODQ1MH0sIHRfZ2hvc3QyOntlbGFwc2VkTXM6Mjg0NzB9IH0sCiAgICA1OnsgdF9naG9zdDE6e2VsYXBzZWRNczoyODkwMH0sIHRfZ2hvc3QyOntlbGFwc2VkTXM6Mjg5MjB9IH0sCiAgICA2OnsgdF9naG9zdDE6e2VsYXBzZWRNczoyOTIwMH0sIHRfZ2hvc3QyOntlbGFwc2VkTXM6MjkyMzB9IH0KICB9OwogIGNvbnN0IHNlZWQwMDRMYW5lcyA9IHsKICAgIDE6e25hbWU6J1NhbSBBaG1lZCd9LCAgIDI6e25hbWU6J0pvcmRhbiBCbGFrZSd9LAogICAgMzp7bmFtZTonQ2FzZXkgTW9yZ2FuJ30sNDp7bmFtZTonUmlsZXkgSm9obnNvbid9LAogICAgNTp7bmFtZTonVGF5bG9yIFdoaXRlJ30sNjp7bmFtZTonQWxleCBDYXJ0ZXInfQogIH07CiAgYXdhaXQgY1JlZigncmFjZS9jdXJyZW50Jykuc2V0KHsKICAgIHJhY2VJZDonc2VlZDAwNCcsIGFnZTonMTEgWWVhcnMnLCBnZW5kZXI6J01peGVkJywgZXZlbnQ6JzIwMG0gU3ByaW50JywKICAgIHN0YXRlOidkb25lJywgYXJtZWRBdDogbm93IC0gOTAwMDAsIHN0YXJ0ZWRBdFNlcnZlcjogbm93IC0gMzAwMDAsCiAgICBsYW5lczogc2VlZDAwNExhbmVzLCBzcGxpdHM6IHNlZWQwMDRTcGxpdHMKICB9KTsKICAvLyBBbHNvIHB1Ymxpc2ggYXZlcmFnZWQgdGltZXMgdG8gcmVzdWx0cy8gc28gUmVzdWx0cyBCb2FyZCBzaG93cyB0aGVtCiAgY29uc3Qgc2VlZDAwNFJlc3VsdHMgPSBPYmplY3QuZW50cmllcyhzZWVkMDA0U3BsaXRzKS5tYXAoKFtsYW5lLCB0aW1lclNwbGl0c10pID0+IHsKICAgIGNvbnN0IHZhbHMgPSBPYmplY3QudmFsdWVzKHRpbWVyU3BsaXRzKS5tYXAocyA9PiBzLmVsYXBzZWRNcyk7CiAgICBjb25zdCBtZWFuID0gdmFscy5yZWR1Y2UoKGEsYikgPT4gYStiLCAwKSAvIHZhbHMubGVuZ3RoOwogICAgcmV0dXJuIHsgbGFuZTogcGFyc2VJbnQobGFuZSksIG5hbWU6IHNlZWQwMDRMYW5lc1tsYW5lXT8ubmFtZSB8fCAoJ0xhbmUgJytsYW5lKSwgdGltZU1zOiBNYXRoLnJvdW5kKG1lYW4pIH07CiAgfSkuc29ydCgoYSxiKSA9PiBhLnRpbWVNcyAtIGIudGltZU1zKS5tYXAoKHIsaSkgPT4gKHsuLi5yLCBwbGFjZTogaSsxfSkpOwogIGF3YWl0IHB1YignMTEgWWVhcnMtTWl4ZWQtMjAwbSBTcHJpbnQtc2VlZDAwNCcsIHsKICAgIHR5cGU6J2xhbmUnLCBhZ2U6JzExIFllYXJzJywgZ2VuZGVyOidNaXhlZCcsIGV2ZW50OicyMDBtIFNwcmludCcsCiAgICByYWNlSWQ6J3NlZWQwMDQnLCByZXN1bHRzOiBzZWVkMDA0UmVzdWx0cywgcHVibGlzaGVkQXQ6IG5vdyAtIDI1MDAwCiAgfSk7CgogIC8vIEFybWVkIFhDIHJhY2UgcmVhZHkgdG8gdXNlIGltbWVkaWF0ZWx5CiAgYXdhaXQgY1JlZigneGMvY3VycmVudCcpLnNldCh7CiAgICByYWNlSWQ6J3NlZWQwMDUnLCBhZ2U6JzEyLzEzIFllYXJzJywgZ2VuZGVyOidNaXhlZCcsIGV2ZW50OidDcm9zcyBDb3VudHJ5IDJrbScsCiAgICBzdGF0ZTonYXJtZWQnLCBmaW5pc2hlczp7fSwgYXJtZWRBdDogbm93CiAgfSk7Cn0KCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAovLyBVUkwgREVFUC1MSU5LIElOSVQKLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCihhc3luYyBmdW5jdGlvbiBpbml0RnJvbVVSTCgpIHsKICBjb25zdCBwICAgID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpOwogIGNvbnN0IGNvZGUgPSAocC5nZXQoJ2NvZGUnKSB8fCAnJykudHJpbSgpLnRvVXBwZXJDYXNlKCk7CiAgY29uc3QgbmFtZSA9IChwLmdldCgnbmFtZScpIHx8ICcnKS50cmltKCk7CiAgY29uc3Qgcm9sZSA9IChwLmdldCgncm9sZScpIHx8ICcnKS50cmltKCk7CiAgY29uc3Qgc2VlZCA9IHAuZ2V0KCdzZWVkJykgPT09ICcxJzsKICBpZiAoIWNvZGUgfHwgY29kZS5sZW5ndGggPCA0KSByZXR1cm47CgogIGNhcm5pdmFsQ29kZSA9IGNvZGU7CiAgdHJ5IHsgYXdhaXQgX3dzUmVhZHkyKCk7IH0gY2F0Y2goZSkge30KCiAgY29uc3Qgc25hcCA9IGF3YWl0IGNSZWYoJ21ldGEnKS5vbmNlKCd2YWx1ZScpOwogIGxldCBpc05ldyA9IGZhbHNlOwogIGlmICghc25hcC5leGlzdHMoKSkgewogICAgaWYgKHNlZWQgfHwgY29kZS5zdGFydHNXaXRoKCdERU1PJykpIHsKICAgICAgY2Fybml2YWxNZXRhID0gewogICAgICAgIHNjaG9vbDonV2VzdHNpZGUgQXRobGV0aWNzJywgbmFtZTonVGVzdCBDYXJuaXZhbCAyMDI2JywKICAgICAgICBzcG9ydDonbWl4ZWQnLCBjcmVhdGVkQXQ6IERhdGUubm93KCksCiAgICAgICAgZXhwaXJlc0F0OiBEYXRlLm5vdygpICsgNyoyNCozNjAwKjEwMDAKICAgICAgfTsKICAgICAgYXdhaXQgY1JlZignbWV0YScpLnNldChjYXJuaXZhbE1ldGEpOwogICAgICBpc05ldyA9IHRydWU7CiAgICB9CiAgfSBlbHNlIHsKICAgIGNhcm5pdmFsTWV0YSA9IHNuYXAudmFsKCk7CiAgfQoKICBpZiAoaXNOZXcgJiYgc2VlZCkgewogICAgdHJ5IHsgYXdhaXQgX3NlZWRUZXN0Q2Fybml2YWwoKTsgfSBjYXRjaChlKSB7IGNvbnNvbGUud2FybignU2VlZCBmYWlsZWQ6JywgZSk7IH0KICB9CgogIG15TmFtZSA9IG5hbWU7CiAgdHJ5IHsgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZsX25hbWUnLCBuYW1lKTsgfSBjYXRjaChlKXt9CiAgdHJ5IHsgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2ZsX2xhc3RfY29kZScsIGNvZGUpOyB9IGNhdGNoKGUpe30KCiAgLy8gSWYgcm9sZT1vYnNlcnZlciwgZ28gc3RyYWlnaHQgaW4g4oCUIG5vIG5hbWUgbmVlZGVkCiAgaWYgKHJvbGUgPT09ICdvYnNlcnZlcicpIHsKICAgIGVudGVyUm9sZSgnb2JzZXJ2ZXInKTsKICAgIHJldHVybjsKICB9CiAgc2hvd1JvbGVQaWNrZXIoKTsKCiAgaWYgKHJvbGUpIHsKICAgIHNldFRpbWVvdXQoKCkgPT4gewogICAgICBpZiAocm9sZSA9PT0gJ3RpbWVyJykgewogICAgICAgIGVudGVyUm9sZSgndGltZXInKTsKICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgdHJ5IHsgZW50ZXJUaW1lckxhbmUoMSk7IH0gY2F0Y2goZSl7fSB9LCAyMDApOwogICAgICB9IGVsc2UgewogICAgICAgIHRyeSB7IGVudGVyUm9sZShyb2xlKTsgfSBjYXRjaChlKSB7fQogICAgICB9CiAgICB9LCAyMDApOwogIH0KfSkoKTsKCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkAovLyBTSEFSRSBNT0RBTAovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKZnVuY3Rpb24gaW5pdFJlc3VsdHNWaWV3KCkgewogIHdhdGNoQ29ubignb2JzZXJ2ZXItZG90Jyk7ICAvLyByZXVzZSBvYnNlcnZlciBkb3QgaWYgcHJlc2VudAogIGNvbnN0IHJlc1JlZiA9IGNSZWYoJ3Jlc3VsdHMnKTsKICByZXNSZWYub24oJ3ZhbHVlJywgc25hcCA9PiB7CiAgICBjb25zdCBkYXRhID0gc25hcC52YWwoKTsKICAgIGNvbnN0IGVsICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzdWx0cy1hbGwnKTsKICAgIGlmICghZWwpIHJldHVybjsKICAgIGlmICghZGF0YSB8fCAhT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoKSB7CiAgICAgIGVsLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPSJ0ZXh0LW11dGVkIHRleHQtY2VudGVyIG10LTMyIj5ObyByZXN1bHRzIHB1Ymxpc2hlZCB5ZXQuPC9kaXY+JzsKICAgICAgcmV0dXJuOwogICAgfQogICAgY29uc3QgZXZlbnRzID0gT2JqZWN0LnZhbHVlcyhkYXRhKS5zb3J0KChhLGIpID0+IChiLnB1Ymxpc2hlZEF0fHwwKSAtIChhLnB1Ymxpc2hlZEF0fHwwKSk7CiAgICBlbC5pbm5lckhUTUwgPSBldmVudHMubWFwKGV2ID0+IHsKICAgICAgY29uc3QgaXNYQyAgPSBldi50eXBlID09PSAneGMnOwogICAgICBjb25zdCBwbGFjZXMgPSBpc1hDID8gKGV2LnBsYWNlc3x8W10pIDogKGV2LnJlc3VsdHN8fFtdKTsKICAgICAgY29uc3Qgcm93cyAgID0gcGxhY2VzLm1hcCgocixpKSA9PiB7CiAgICAgICAgY29uc3QgaXNEUSA9ICFpc1hDICYmIHIuZHE7CiAgICAgICAgY29uc3QgcG9zICA9IGlzWEMgPyByLnBsYWNlIDogKGlzRFEgPyBudWxsIDogKGkrMSkpOwogICAgICAgIGNvbnN0IG5hbWUgPSByLm5hbWUgfHwgKGlzWEMgPyAnJyA6IGBMYW5lICR7ci5sYW5lfWApOwogICAgICAgIGNvbnN0IHRpbWUgPSBmbXRTZWMoaXNYQyA/IHIuZWxhcHNlZE1zIDogci50aW1lTXMpOwogICAgICAgIHJldHVybiBgPGRpdiBjbGFzcz0ibGFuZS1yb3ciIHN0eWxlPSJwYWRkaW5nOjZweCA0cHg7JHtpc0RRPydvcGFjaXR5Oi40NSc6Jyd9IiA+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJtZWRhbCAke2lzRFE/J3BOJzptZWRhbENscyhwb3MpfSIgc3R5bGU9IiR7aXNEUT8nYmFja2dyb3VuZDp2YXIoLS13YXJuKTtjb2xvcjojZmZmJzonJ30iPiR7aXNEUT8nRFEnOihwb3MpfTwvZGl2PgogICAgICAgICAgPGRpdiBjbGFzcz0ibGFuZS1uYW1lIj4ke25hbWV9PC9kaXY+CiAgICAgICAgICA8ZGl2IGNsYXNzPSJsYW5lLXRpbWUgZm9udC1tb25vIj4ke2lzRFE/J+KAlCc6dGltZX08L2Rpdj4KICAgICAgICA8L2Rpdj5gOwogICAgICB9KS5qb2luKCcnKTsKICAgICAgcmV0dXJuIGA8ZGl2IGNsYXNzPSJjYXJkIiBzdHlsZT0ibWFyZ2luLWJvdHRvbTo4cHgiPgogICAgICAgIDxkaXYgY2xhc3M9ImNhcmQtdGl0bGUiIHN0eWxlPSJmb250LXNpemU6LjhyZW07Y29sb3I6dmFyKC0tbXV0ZWQpIj4KICAgICAgICAgICR7ZXYuYWdlfHwnJ30gJHtldi5nZW5kZXJ8fCcnfSDCtyAke2V2LmV2ZW50fHwnJ30KICAgICAgICA8L2Rpdj4KICAgICAgICAke3Jvd3MgfHwgJzxkaXYgY2xhc3M9InRleHQtbXV0ZWQgdGV4dC1zbSI+Tm8gdGltZXMgcmVjb3JkZWQ8L2Rpdj4nfQogICAgICA8L2Rpdj5gOwogICAgfSkuam9pbignJyk7CiAgfSk7CiAgYWN0aXZlTGlzdGVuZXJzLnB1c2goKCk9PnJlc1JlZi5vZmYoKSk7Cn0KCmZ1bmN0aW9uIHNob3dTaGFyZVBhZ2UoKSB7CiAgLy8gUG9wdWxhdGUgc2hhcmUgc2NyZWVuIChqb2luIFFSIGZvciBwYXJ0aWNpcGFudHMpCiAgY29uc3Qgam9pblVybCA9IGAke2xvY2F0aW9uLm9yaWdpbn0vP2NvZGU9JHtjYXJuaXZhbENvZGV9YDsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hhcmUtc2Nob29sLW5hbWUnKS50ZXh0Q29udGVudCA9CiAgICBjYXJuaXZhbE1ldGE/LnNjaG9vbCB8fCAnSm9pbiBQYWdlJzsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hhcmUtY2Fybml2YWwtbmFtZScpLnRleHRDb250ZW50ID0KICAgIGNhcm5pdmFsTWV0YT8ubmFtZSB8fCAnJzsKICBjb25zdCBjb2RlRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hhcmUtam9pbi1jb2RlJyk7CiAgaWYgKGNvZGVFbCkgY29kZUVsLnRleHRDb250ZW50ID0gY2Fybml2YWxDb2RlOwoKICBzaG93U2NyZWVuKCdzaGFyZScpOwoKICBjb25zdCBxckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYXJlLXFyJyk7CiAgaWYgKHFyRWwgJiYgdHlwZW9mIFFSQ29kZSAhPT0gJ3VuZGVmaW5lZCcpIHsKICAgIHFyRWwuaW5uZXJIVE1MID0gJyc7CiAgICBuZXcgUVJDb2RlKHFyRWwsIHsgdGV4dDogam9pblVybCwgd2lkdGg6IDE2NCwgaGVpZ2h0OiAxNjQsCiAgICAgIGNvbG9yRGFyazogJyMwMDAwMDAnLCBjb2xvckxpZ2h0OiAnI2ZmZmZmZicgfSk7CiAgfQp9CgpmdW5jdGlvbiBzaG93U2hhcmVNb2RhbCgpIHsKICBjb25zdCB1cmwgPSBgJHtsb2NhdGlvbi5vcmlnaW59Lz9jb2RlPSR7Y2Fybml2YWxDb2RlfSZyb2xlPW9ic2VydmVyYDsKICBjb25zdCBleGlzdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaGFyZS1tb2RhbCcpOwogIGlmIChleGlzdGluZykgZXhpc3RpbmcucmVtb3ZlKCk7CgogIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgbW9kYWwuaWQgPSAnc2hhcmUtbW9kYWwnOwogIG1vZGFsLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsLjcpO3otaW5kZXg6MTAwMDA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6MTZweCc7CiAgbW9kYWwuaW5uZXJIVE1MID0gYAogICAgPGRpdiBzdHlsZT0iYmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlKTtib3JkZXItcmFkaXVzOjE2cHg7cGFkZGluZzoyNHB4O21heC13aWR0aDozNDBweDt3aWR0aDoxMDAlO3RleHQtYWxpZ246Y2VudGVyIj4KICAgICAgPGRpdiBzdHlsZT0iZm9udC13ZWlnaHQ6NzAwO2ZvbnQtc2l6ZToxLjFyZW07bWFyZ2luLWJvdHRvbTo0cHgiPlNoYXJlIFJlc3VsdHM8L2Rpdj4KICAgICAgPGRpdiBzdHlsZT0iY29sb3I6dmFyKC0tbXV0ZWQpO2ZvbnQtc2l6ZTouODVyZW07bWFyZ2luLWJvdHRvbToxNnB4Ij5QYXJlbnRzIHNjYW4gdG8gZm9sbG93IGxpdmUgcmVzdWx0czwvZGl2PgogICAgICA8ZGl2IGlkPSJzaGFyZS1xciIgc3R5bGU9ImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO21hcmdpbi1ib3R0b206MTZweCI+PC9kaXY+CiAgICAgIDxkaXYgc3R5bGU9ImZvbnQtZmFtaWx5Om1vbm9zcGFjZTtmb250LXNpemU6Ljc1cmVtO3dvcmQtYnJlYWs6YnJlYWstYWxsO2JhY2tncm91bmQ6dmFyKC0tYmcpO3BhZGRpbmc6OHB4IDEwcHg7Ym9yZGVyLXJhZGl1czo4cHg7bWFyZ2luLWJvdHRvbToxMnB4O2N1cnNvcjpwb2ludGVyIgogICAgICAgICAgIG9uY2xpY2s9Im5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KCcke3VybH0nKS50aGVuKCgpPT50b2FzdCgnTGluayBjb3BpZWQhJykpIj4ke3VybH08L2Rpdj4KICAgICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJ3aWR0aDoxMDAlO21hcmdpbi1ib3R0b206OHB4IgogICAgICAgIG9uY2xpY2s9Im5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KCcke3VybH0nKS50aGVuKCgpPT50b2FzdCgnQ29waWVkIScpKSI+Q29weSBMaW5rPC9idXR0b24+CiAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBzdHlsZT0id2lkdGg6MTAwJSIgb25jbGljaz0iZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYXJlLW1vZGFsJykucmVtb3ZlKCkiPkNsb3NlPC9idXR0b24+CiAgICA8L2Rpdj5gOwogIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobW9kYWwpOwogIG1vZGFsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7IGlmIChlLnRhcmdldCA9PT0gbW9kYWwpIG1vZGFsLnJlbW92ZSgpOyB9KTsKCiAgLy8gR2VuZXJhdGUgUVIKICBjb25zdCBxckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NoYXJlLXFyJyk7CiAgaWYgKHFyRWwgJiYgdHlwZW9mIFFSQ29kZSAhPT0gJ3VuZGVmaW5lZCcpIHsKICAgIG5ldyBRUkNvZGUocXJFbCwgeyB0ZXh0OiB1cmwsIHdpZHRoOiAxNjAsIGhlaWdodDogMTYwLCBjb2xvckRhcms6JyMwMDAnLCBjb2xvckxpZ2h0OicjZmZmJyB9KTsKICB9Cn0KCjwvc2NyaXB0PgoKPGRpdiBpZD0iY3QtZm9vdGVyIiBzdHlsZT0icG9zaXRpb246Zml4ZWQ7Ym90dG9tOjA7bGVmdDowO3JpZ2h0OjA7YmFja2dyb3VuZDpyZ2JhKDEzLDI3LDYyLDAuOTIpO2JhY2tkcm9wLWZpbHRlcjpibHVyKDZweCk7Y29sb3I6cmdiYSgyNTUsMjU1LDI1NSwwLjUpO2ZvbnQtc2l6ZToxMXB4O3RleHQtYWxpZ246Y2VudGVyO3BhZGRpbmc6NnB4IDE2cHg7ei1pbmRleDoxMDA7ZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpjZW50ZXI7Z2FwOjE2cHg7YWxpZ24taXRlbXM6Y2VudGVyO2ZsZXgtd3JhcDp3cmFwOyI+CiAgPHNwYW4+wqkgMjAyNiBMdWNrIERyYWdvbiBQdHkgTHRkPC9zcGFuPgogIDxzcGFuPsK3PC9zcGFuPgogIDxhIGhyZWY9Imh0dHBzOi8vc2Nob29sc3BvcnRwb3J0YWwuY29tLmF1L3ByaXZhY3kiIHN0eWxlPSJjb2xvcjpyZ2JhKDI1NSwyNTUsMjU1LDAuNSk7dGV4dC1kZWNvcmF0aW9uOm5vbmU7IiB0YXJnZXQ9Il9ibGFuayI+UHJpdmFjeTwvYT4KICA8c3Bhbj7Ctzwvc3Bhbj4KICA8YSBocmVmPSJodHRwczovL3NjaG9vbHNwb3J0cG9ydGFsLmNvbS5hdSIgc3R5bGU9ImNvbG9yOnJnYmEoMjU1LDI1NSwyNTUsMC41KTt0ZXh0LWRlY29yYXRpb246bm9uZTsiIHRhcmdldD0iX2JsYW5rIj5TY2hvb2wgU3BvcnQgUG9ydGFsPC9hPgogIDxzcGFuPsK3PC9zcGFuPgogIDxhIGhyZWY9Imh0dHBzOi8vc3BvcnRjYXJuaXZhbC5jb20uYXUiIHN0eWxlPSJjb2xvcjpyZ2JhKDI1NSwyNTUsMjU1LDAuNSk7dGV4dC1kZWNvcmF0aW9uOm5vbmU7IiB0YXJnZXQ9Il9ibGFuayI+Q2Fybml2YWwgUGxhbm5lcjwvYT4KPC9kaXY+CjxzY3JpcHQgZGVmZXIgc3JjPSJodHRwczovL3N0YXRpYy5jbG91ZGZsYXJlaW5zaWdodHMuY29tL2JlYWNvbi5taW4uanMvdjhjNzhkZjdjN2MwZjQ4NDQ5N2VjYmNhNzA0NjY0NGRhMTc3MTUyMzEyNDUxNiIgaW50ZWdyaXR5PSJzaGE1MTItOERTN3JnSXJBbWdoQkZ3b09UdWpjZjZEOXJYdkg4eG04SlExSmEwMWg5UVg4RXpYbGRpc3p1ZllhNElGZktkTFVLVFRyblNGWExEa1VFT1RyWlE4UWc9PSIgZGF0YS1jZi1iZWFjb249J3sidmVyc2lvbiI6IjIwMjQuMTEuMCIsInRva2VuIjoiNmNmOGQyZTI5YzBkNDBiNzg4NGRlM2QxYTYzMmIxYzUiLCJyIjoxLCJzZXJ2ZXJfdGltaW5nIjp7Im5hbWUiOnsiY2ZDYWNoZVN0YXR1cyI6dHJ1ZSwiY2ZFZGdlIjp0cnVlLCJjZkV4dFByaSI6dHJ1ZSwiY2ZMNCI6dHJ1ZSwiY2ZPcmlnaW4iOnRydWUsImNmU3BlZWRCcmFpbiI6dHJ1ZX0sImxvY2F0aW9uX3N0YXJ0c3dpdGgiOm51bGx9fScgY3Jvc3NvcmlnaW49ImFub255bW91cyI+PC9zY3JpcHQ+Cgo8IS0tIOKVkOKVkOKVkOKVkCBYQyBBVVRPLURFVEVDVCBMSU5FIFNFVFVQIE9WRVJMQVkg4pWQ4pWQ4pWQ4pWQIC0tPgo8ZGl2IGlkPSJ4Yy1saW5lLXNldHVwLW92ZXJsYXkiPgogIDx2aWRlbyBpZD0ieGMtc2V0dXAtdmlkIiBhdXRvcGxheSBwbGF5c2lubGluZSBtdXRlZD48L3ZpZGVvPgogIDxjYW52YXMgaWQ9InhjLWxpbmUtY2FudmFzLW92ZXJsYXkiPjwvY2FudmFzPgogIDxkaXYgaWQ9InhjLWxpbmUtaW5zdHJ1Y3Rpb24iPlRhcCB0aGUgTEVGVCBlZGdlIG9mIHlvdXIgZmluaXNoIGxpbmU8L2Rpdj4KICA8ZGl2IGlkPSJ4Yy1saW5lLXNldHVwLWJ0bnMiPgogICAgPGJ1dHRvbiBjbGFzcz0iYnRuIGJ0bi1zZWNvbmRhcnkiIHN0eWxlPSJmbGV4OjEiIG9uY2xpY2s9InhjUmVzZXRMaW5lKCkiPuKGuiBSZXNldDwvYnV0dG9uPgogICAgPGJ1dHRvbiBpZD0ieGMtc3RhcnQtZGV0ZWN0LWJ0biIgY2xhc3M9ImJ0biBidG4tcHJpbWFyeSIgc3R5bGU9ImZsZXg6MjtkaXNwbGF5Om5vbmUiIG9uY2xpY2s9InhjU3RhcnREZXRlY3QoKSI+4pa2IFN0YXJ0IEF1dG8tRGV0ZWN0PC9idXR0b24+CiAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9ImZsZXg6MSIgb25jbGljaz0ieGNDbG9zZUxpbmVTZXR1cCgpIj7inJU8L2J1dHRvbj4KICA8L2Rpdj4KPC9kaXY+Cgo8c2NyaXB0IHNyYz0iaHR0cHM6Ly9mYWxrb3Itd2lkZ2V0Lmx1Y2tkcmFnb24uaW8vd2lkZ2V0LmpzIiBkYXRhLXByb2R1Y3Q9IkNhcm5pdmFsIFRpbWluZyI+PC9zY3JpcHQ+CjwvYm9keT4KPC9odG1sPjwhLS0gdjguNS4wIG5ldyBoZWxwZXIgZnVuY3Rpb25zIGluamVjdGVkIGJlbG93IDwvc2NyaXB0PiB0byBrZWVwIHBhdGNoIGNsZWFuIC0tPgo8c2NyaXB0PgovLyDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZDilZAKLy8gdjguNS4wIEhFTFBFUlMKLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCgovLyDilIDilIAgVEFTSyA1OiBHZW5lcmljIGNvbmZpcm0gbW9kYWwg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACmZ1bmN0aW9uIF9jb25maXJtTW9kYWwodGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCkgewogIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHsKICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgICBlbC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmZpeGVkO2luc2V0OjA7YmFja2dyb3VuZDpyZ2JhKDAsMCwwLC42NSk7ei1pbmRleDo5OTk5O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtwYWRkaW5nOjE2cHgnOwogICAgZWwuaW5uZXJIVE1MID0gYAogICAgICA8ZGl2IHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpO2JvcmRlci1yYWRpdXM6MTZweDtwYWRkaW5nOjI0cHg7bWF4LXdpZHRoOjMyMHB4O3dpZHRoOjEwMCU7dGV4dC1hbGlnbjpjZW50ZXIiPgogICAgICAgIDxkaXYgc3R5bGU9ImZvbnQtd2VpZ2h0OjcwMDtmb250LXNpemU6MS4wNXJlbTttYXJnaW4tYm90dG9tOjhweCI+JHt0aXRsZX08L2Rpdj4KICAgICAgICA8ZGl2IHN0eWxlPSJjb2xvcjp2YXIoLS1tdXRlZCk7Zm9udC1zaXplOjAuODVyZW07bWFyZ2luLWJvdHRvbToyMHB4Ij4ke2JvZHl9PC9kaXY+CiAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDoxMHB4Ij4KICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBzdHlsZT0iZmxleDoxIiBpZD0iX2NvbmYtY2FuY2VsIj5DYW5jZWw8L2J1dHRvbj4KICAgICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tcHJpbWFyeSIgICBzdHlsZT0iZmxleDoxIiBpZD0iX2NvbmYtb2siPiR7Y29uZmlybUxhYmVsfTwvYnV0dG9uPgogICAgICAgIDwvZGl2PgogICAgICA8L2Rpdj5gOwogICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbCk7CiAgICBlbC5xdWVyeVNlbGVjdG9yKCcjX2NvbmYtY2FuY2VsJykub25jbGljayA9ICgpID0+IHsgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChlbCk7IHJlc29sdmUoZmFsc2UpOyB9OwogICAgZWwucXVlcnlTZWxlY3RvcignI19jb25mLW9rJykub25jbGljayAgICAgPSAoKSA9PiB7IGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZWwpOyByZXNvbHZlKHRydWUpOyAgfTsKICB9KTsKfQoKLy8g4pSA4pSAIFRBU0sgNjogR3VuIGNvdW50ZG93biArIHJlY2FsaWJyYXRlIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgApsZXQgX3N0YXJ0ZXJDb3VudGRvd25UaW1lciA9IG51bGw7CgpmdW5jdGlvbiBzdGFydGVyR3VuQ291bnRkb3duKCkgewogIC8vIENhbmNlbCBhbnkgZXhpc3RpbmcKICBpZiAoX3N0YXJ0ZXJDb3VudGRvd25UaW1lcikgeyBjbGVhclRpbWVvdXQoX3N0YXJ0ZXJDb3VudGRvd25UaW1lcik7IF9zdGFydGVyQ291bnRkb3duVGltZXIgPSBudWxsOyB9CgogIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgZWwuaWQgPSAnc3RhcnRlci1ndW4tb3ZlcmxheSc7CiAgZWwuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpmaXhlZDtpbnNldDowO2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNzUpO3otaW5kZXg6OTk5ODtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2dhcDoyMHB4JzsKICBlbC5pbm5lckhUTUwgPSBgCiAgICA8ZGl2IHN0eWxlPSJmb250LXNpemU6NXJlbTthbmltYXRpb246dmYtcHVsc2UgMC41cyBpbmZpbml0ZSI+8J+UqzwvZGl2PgogICAgPGRpdiBzdHlsZT0iZm9udC1zaXplOjEuOHJlbTtmb250LXdlaWdodDo5MDA7Y29sb3I6I2VmNDQ0NDtsZXR0ZXItc3BhY2luZzouMDJlbSIgaWQ9Il9nY2QtbGJsIj5GSVJJTkcgSU4gMXPigKY8L2Rpdj4KICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tc2Vjb25kYXJ5IiBzdHlsZT0iZm9udC1zaXplOjEuMXJlbTtwYWRkaW5nOjE0cHggMzZweDtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpIiBpZD0iX2djZC1jYW5jZWwiPlRBUCBUTyBDQU5DRUw8L2J1dHRvbj5gOwogIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZWwpOwoKICBsZXQgY2FuY2VsbGVkID0gZmFsc2U7CiAgZWwucXVlcnlTZWxlY3RvcignI19nY2QtY2FuY2VsJykub25jbGljayA9ICgpID0+IHsKICAgIGNhbmNlbGxlZCA9IHRydWU7CiAgICBjbGVhclRpbWVvdXQoX3N0YXJ0ZXJDb3VudGRvd25UaW1lcik7CiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVsKTsKICAgIHRvYXN0KCdHTyBjYW5jZWxsZWQnKTsKICAgIC8vIFJlc3RhcnQgbGlzdGVuaW5nCiAgICBzdGFydGVyTGlzdGVuU3RhcnQoKTsKICB9OwoKICBfc3RhcnRlckNvdW50ZG93blRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7CiAgICBpZiAoY2FuY2VsbGVkKSByZXR1cm47CiAgICBpZiAoZG9jdW1lbnQuYm9keS5jb250YWlucyhlbCkpIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZWwpOwogICAgLy8gRklSRSBHTwogICAgdG9hc3QoJ/CflKsgR3VuIGRldGVjdGVkIOKAlCBHTyEnKTsKICAgIHZpYnJhdGUoWzIwMCw2MCwyMDBdKTsKICAgIGZsYXNoKCdnbycsIDYwMCk7CiAgICBjUmVmKCdyYWNlL2N1cnJlbnQnKS51cGRhdGUoewogICAgICBzdGF0ZTonbGl2ZScsCiAgICAgIHN0YXJ0ZWRBdFNlcnZlcjogZmlyZWJhc2UuZGF0YWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QCiAgICB9KTsKICB9LCAxMDAwKTsKfQoKZnVuY3Rpb24gc3RhcnRlclJlY2FsaWJyYXRlKCkgewogIHN0YXJ0ZXJOb2lzZUZsb29yID0gMDsKICBzdGFydGVyTm9pc2VDb3VudCA9IDA7CiAgY29uc3QgY2FsTGJsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0ZXItY2FsLWxibCcpOwogIGlmIChjYWxMYmwpIGNhbExibC50ZXh0Q29udGVudCA9ICdDYWxpYnJhdGluZ+KApic7CiAgdG9hc3QoJ1JlY2FsaWJyYXRpbmcgbm9pc2UgZmxvb3LigKYnKTsKfQoKLy8g4pSA4pSAIFRBU0sgNzogVkYgY2FtZXJhIGZsaXAgKyByZXRyeSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKbGV0IHZmRmFjaW5nTW9kZSA9ICdlbnZpcm9ubWVudCc7CgpmdW5jdGlvbiB2ZkZsaXBDYW1lcmEoKSB7CiAgdmZGYWNpbmdNb2RlID0gKHZmRmFjaW5nTW9kZSA9PT0gJ2Vudmlyb25tZW50JykgPyAndXNlcicgOiAnZW52aXJvbm1lbnQnOwogIHRvYXN0KGBTd2l0Y2hpbmcgdG8gJHt2ZkZhY2luZ01vZGUgPT09ICd1c2VyJyA/ICdmcm9udCcgOiAnYmFjayd9IGNhbWVyYeKApmApOwogIC8vIFJlbW92ZSBleGlzdGluZyBlcnJvciBkaXYgaWYgcHJlc2VudAogIGNvbnN0IGVyckRpdiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2Zi1jYW0tZXJyb3InKTsKICBpZiAoZXJyRGl2KSBlcnJEaXYucmVtb3ZlKCk7CiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZmLWxpdmUtY2FudmFzJyk7CiAgaWYgKGNhbnZhcykgY2FudmFzLnN0eWxlLmRpc3BsYXkgPSAnJzsKICAvLyBTdG9wIGV4aXN0aW5nIHN0cmVhbQogIGlmICh0eXBlb2YgdmZTdHJlYW0gIT09ICd1bmRlZmluZWQnICYmIHZmU3RyZWFtKSB7CiAgICB2ZlN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKHQgPT4gdC5zdG9wKCkpOwogICAgdmZTdHJlYW0gPSBudWxsOwogIH0KICAvLyBSZXN0YXJ0IGNhbWVyYSB3aXRoIG5ldyBmYWNpbmcgbW9kZQogIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHsKICAgIHZpZGVvOiB7IGZhY2luZ01vZGU6IHZmRmFjaW5nTW9kZSwgd2lkdGg6e2lkZWFsOjE5MjB9LCBoZWlnaHQ6e2lkZWFsOjEwODB9IH0sCiAgICBhdWRpbzogZmFsc2UKICB9KS50aGVuKHN0cmVhbSA9PiB7CiAgICB2ZlN0cmVhbSA9IHN0cmVhbTsKICAgIGNvbnN0IHZpZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2Zi12aWRlby1wcmV2aWV3Jyk7CiAgICB2aWQuc3JjT2JqZWN0ID0gc3RyZWFtOyB2aWQucGxheSgpOwogICAgdmlkLmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXlpbmcnLCAoKSA9PiB7CiAgICAgIHZmUmVzdGFydENhbGlicmF0aW9uKCk7CiAgICAgIHRvYXN0KCdDYW1lcmEgc3dpdGNoZWQg4oCUIGNhbGlicmF0aW5n4oCmJyk7CiAgICB9LCB7b25jZTp0cnVlfSk7CiAgfSkuY2F0Y2goZXJyID0+IHsKICAgIHRvYXN0KCdDYW1lcmEgc3dpdGNoIGZhaWxlZDogJyArIChlcnI/Lm1lc3NhZ2UgfHwgZXJyKSk7CiAgICB2ZlNldFN0YXR1cygn4pqgIENhbWVyYSBlcnJvcicsICcjZWY0NDQ0Jyk7CiAgfSk7Cn0KCmZ1bmN0aW9uIHZmUmV0cnlDYW1lcmEoKSB7CiAgY29uc3QgZXJyRGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZmLWNhbS1lcnJvcicpOwogIGlmIChlcnJEaXYpIGVyckRpdi5yZW1vdmUoKTsKICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmYtbGl2ZS1jYW52YXMnKTsKICBpZiAoY2FudmFzKSBjYW52YXMuc3R5bGUuZGlzcGxheSA9ICcnOwogIHZmU2V0U3RhdHVzKCdTdGFydGluZyBjYW1lcmHigKYnLCAndmFyKC0tbXV0ZWQpJyk7CiAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoewogICAgdmlkZW86IHsgZmFjaW5nTW9kZTogdmZGYWNpbmdNb2RlLCB3aWR0aDp7aWRlYWw6MTkyMH0sIGhlaWdodDp7aWRlYWw6MTA4MH0gfSwKICAgIGF1ZGlvOiBmYWxzZQogIH0pLnRoZW4oc3RyZWFtID0+IHsKICAgIHZmU3RyZWFtID0gc3RyZWFtOwogICAgY29uc3QgdmlkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZmLXZpZGVvLXByZXZpZXcnKTsKICAgIHZpZC5zcmNPYmplY3QgPSBzdHJlYW07IHZpZC5wbGF5KCk7CiAgICB2aWQuYWRkRXZlbnRMaXN0ZW5lcigncGxheWluZycsICgpID0+IHsKICAgICAgdmZTdGFydENhbGlicmF0aW9uKCk7CiAgICAgIHRvYXN0KCdDYW1lcmEgcmVhZHkg4oCUIGNhbGlicmF0aW5n4oCmJyk7CiAgICB9LCB7b25jZTp0cnVlfSk7CiAgfSkuY2F0Y2goZXJyID0+IHsKICAgIGNvbnN0IG1zZyA9IGVycj8ubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InID8gJ05vIGNhbWVyYSBmb3VuZCcgOiAnQ2FtZXJhIGVycm9yOiAnICsgKGVycj8ubWVzc2FnZSB8fCBlcnIpOwogICAgdG9hc3QobXNnKTsKICAgIHZmU2V0U3RhdHVzKCfimqAgJyArIG1zZywgJyNlZjQ0NDQnKTsKICB9KTsKfQoKLy8g4pSA4pSAIFRBU0sgODogVkYgbWFudWFsIGFkZCBmaW5pc2gg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACmZ1bmN0aW9uIHZmTWFudWFsQWRkKCkgewogIGNvbnN0IG1heExhbmUgPSB0eXBlb2YgdmZMYW5lQ291bnQgIT09ICd1bmRlZmluZWQnID8gdmZMYW5lQ291bnQgOiA4OwogIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgZWwuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpmaXhlZDtpbnNldDowO2JhY2tncm91bmQ6cmdiYSgwLDAsMCwuNjUpO3otaW5kZXg6OTk5OTtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXI7cGFkZGluZzoxNnB4JzsKICBlbC5pbm5lckhUTUwgPSBgCiAgICA8ZGl2IHN0eWxlPSJiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpO2JvcmRlci1yYWRpdXM6MTZweDtwYWRkaW5nOjI0cHg7bWF4LXdpZHRoOjMyMHB4O3dpZHRoOjEwMCUiPgogICAgICA8ZGl2IHN0eWxlPSJmb250LXdlaWdodDo3MDA7Zm9udC1zaXplOjFyZW07bWFyZ2luLWJvdHRvbToxNnB4Ij5BZGQgTWFudWFsIEZpbmlzaDwvZGl2PgogICAgICA8ZGl2IHN0eWxlPSJtYXJnaW4tYm90dG9tOjEycHgiPgogICAgICAgIDxsYWJlbCBzdHlsZT0iZm9udC1zaXplOjAuOHJlbTtjb2xvcjp2YXIoLS1tdXRlZCkiPkxhbmU8L2xhYmVsPgogICAgICAgIDxzZWxlY3QgaWQ9Il9tZi1sYW5lIiBzdHlsZT0id2lkdGg6MTAwJTttYXJnaW4tdG9wOjRweDtwYWRkaW5nOjhweDtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UtMik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1ib3JkZXIpO2JvcmRlci1yYWRpdXM6OHB4O2NvbG9yOnZhcigtLXRleHQpO2ZvbnQtc2l6ZToxcmVtIj4KICAgICAgICAgICR7QXJyYXkuZnJvbSh7bGVuZ3RoOm1heExhbmV9LChfLGkpPT5gPG9wdGlvbiB2YWx1ZT0iJHtpKzF9Ij5MYW5lICR7aSsxfTwvb3B0aW9uPmApLmpvaW4oJycpfQogICAgICAgIDwvc2VsZWN0PgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBzdHlsZT0ibWFyZ2luLWJvdHRvbToyMHB4Ij4KICAgICAgICA8bGFiZWwgc3R5bGU9ImZvbnQtc2l6ZTowLjhyZW07Y29sb3I6dmFyKC0tbXV0ZWQpIj5UaW1lIChzZWNvbmRzLCBlLmcuIDEyLjQ1KTwvbGFiZWw+CiAgICAgICAgPGlucHV0IHR5cGU9Im51bWJlciIgaWQ9Il9tZi10aW1lIiBzdGVwPSIwLjAxIiBtaW49IjAiIHBsYWNlaG9sZGVyPSIwLjAwIgogICAgICAgICAgc3R5bGU9IndpZHRoOjEwMCU7bWFyZ2luLXRvcDo0cHg7cGFkZGluZzo4cHg7YmFja2dyb3VuZDp2YXIoLS1zdXJmYWNlLTIpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tYm9yZGVyKTtib3JkZXItcmFkaXVzOjhweDtjb2xvcjp2YXIoLS10ZXh0KTtmb250LXNpemU6MXJlbTtib3gtc2l6aW5nOmJvcmRlci1ib3giPgogICAgICA8L2Rpdj4KICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2dhcDoxMHB4Ij4KICAgICAgICA8YnV0dG9uIGNsYXNzPSJidG4gYnRuLXNlY29uZGFyeSIgc3R5bGU9ImZsZXg6MSIgaWQ9Il9tZi1jYW5jZWwiPkNhbmNlbDwvYnV0dG9uPgogICAgICAgIDxidXR0b24gY2xhc3M9ImJ0biBidG4tcHJpbWFyeSIgICBzdHlsZT0iZmxleDoxIiBpZD0iX21mLW9rIj5BZGQgRmluaXNoPC9idXR0b24+CiAgICAgIDwvZGl2PgogICAgPC9kaXY+YDsKICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsKTsKICBlbC5xdWVyeVNlbGVjdG9yKCcjX21mLWNhbmNlbCcpLm9uY2xpY2sgPSAoKSA9PiBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVsKTsKICBlbC5xdWVyeVNlbGVjdG9yKCcjX21mLW9rJykub25jbGljayA9ICgpID0+IHsKICAgIGNvbnN0IGxhbmUgID0gcGFyc2VJbnQoZWwucXVlcnlTZWxlY3RvcignI19tZi1sYW5lJykudmFsdWUpOwogICAgY29uc3QgdGltZVNlYyA9IHBhcnNlRmxvYXQoZWwucXVlcnlTZWxlY3RvcignI19tZi10aW1lJykudmFsdWUpOwogICAgaWYgKCFpc0Zpbml0ZSh0aW1lU2VjKSB8fCB0aW1lU2VjIDw9IDApIHsgdG9hc3QoJ0VudGVyIGEgdmFsaWQgdGltZScpOyByZXR1cm47IH0KICAgIGNvbnN0IGVsYXBzZWRNcyA9IE1hdGgucm91bmQodGltZVNlYyAqIDEwMDApOwogICAgaWYgKHR5cGVvZiB2ZkRldGVjdGlvbnMgIT09ICd1bmRlZmluZWQnKSB7CiAgICAgIHZmRGV0ZWN0aW9ucy5wdXNoKHsgbGFuZSwgZWxhcHNlZE1zLCBtYW51YWw6IHRydWUgfSk7CiAgICAgIGlmICh0eXBlb2YgdmZSZW5kZXJEZXRlY3Rpb25zID09PSAnZnVuY3Rpb24nKSB2ZlJlbmRlckRldGVjdGlvbnMoKTsKICAgIH0KICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZWwpOwogICAgdG9hc3QoYExhbmUgJHtsYW5lfSBtYW51YWxseSBhZGRlZCDigJQgJHt0aW1lU2VjLnRvRml4ZWQoMil9c2ApOwogIH07CiAgc2V0VGltZW91dCgoKSA9PiBlbC5xdWVyeVNlbGVjdG9yKCcjX21mLXRpbWUnKS5mb2N1cygpLCAxMDApOwp9CgovLyDilIDilIAgVEFTSyA5OiBBdGhsZXRlIG5hbWUgcGVyc2lzdGVuY2Ug4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACmZ1bmN0aW9uIF9sYW5lS2V5KGFnZSwgZ2VuZGVyLCBldmVudCkgewogIHJldHVybiBgY3RfbGFuZXNfJHthZ2V9XyR7Z2VuZGVyfV8ke2V2ZW50fWAucmVwbGFjZSgvXHMrL2csJ18nKTsKfQpmdW5jdGlvbiBfc2F2ZUxhbmVOYW1lcyhhZ2UsIGdlbmRlciwgZXZlbnQsIGxhbmVzKSB7CiAgdHJ5IHsgbG9jYWxTdG9yYWdlLnNldEl0ZW0oX2xhbmVLZXkoYWdlLCBnZW5kZXIsIGV2ZW50KSwgSlNPTi5zdHJpbmdpZnkobGFuZXMpKTsgfSBjYXRjaChlKXt9Cn0KZnVuY3Rpb24gX2xvYWRMYW5lTmFtZXMoYWdlLCBnZW5kZXIsIGV2ZW50KSB7CiAgdHJ5IHsKICAgIGNvbnN0IHNhdmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oX2xhbmVLZXkoYWdlLCBnZW5kZXIsIGV2ZW50KSk7CiAgICBpZiAoIXNhdmVkKSByZXR1cm47CiAgICBjb25zdCBsYW5lcyA9IEpTT04ucGFyc2Uoc2F2ZWQpOwogICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFkbWluLWxhbmUtbmFtZS1pbnB1dCcpLmZvckVhY2goaW5wID0+IHsKICAgICAgY29uc3QgbiA9IGlucC5kYXRhc2V0LmxhbmU7CiAgICAgIGlmIChsYW5lc1tuXT8ubmFtZSkgaW5wLnZhbHVlID0gbGFuZXNbbl0ubmFtZTsKICAgIH0pOwogICAgdG9hc3QoJ05hbWVzIGxvYWRlZCBmcm9tIGxhc3QgaGVhdCDihpEnKTsKICB9IGNhdGNoKGUpe30KfQoKLy8gQXV0by1sb2FkIG5hbWVzIHdoZW4gZHJvcGRvd25zIGNoYW5nZSAoYXR0YWNoIGFmdGVyIGFkbWluIHZpZXcgaW5pdHMpCmZ1bmN0aW9uIF9hdHRhY2hMYW5lTmFtZUF1dG9Mb2FkKCkgewogIGNvbnN0IGFnZVNlbCAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkbWluLWFnZS1zZWwnKTsKICBjb25zdCBldmVudFNlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZG1pbi1ldmVudC1zZWwnKTsKICBjb25zdCBsb2FkID0gKCkgPT4gewogICAgY29uc3QgYWdlICAgPSBhZ2VTZWw/LnZhbHVlOwogICAgY29uc3QgZXZlbnQgPSBldmVudFNlbD8udmFsdWU7CiAgICBpZiAoYWdlICYmIGV2ZW50ICYmIHR5cGVvZiBhZG1pbkdlbmRlciAhPT0gJ3VuZGVmaW5lZCcpIF9sb2FkTGFuZU5hbWVzKGFnZSwgYWRtaW5HZW5kZXIsIGV2ZW50KTsKICB9OwogIGlmIChhZ2VTZWwpICAgYWdlU2VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGxvYWQpOwogIGlmIChldmVudFNlbCkgZXZlbnRTZWwuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgbG9hZCk7Cn0KLy8gQ2FsbCBhZnRlciBhIHNob3J0IGRlbGF5IHNvIGluaXRBZG1pblZpZXcgaGFzIHJ1bgpjb25zdCBfb3JpZ0luaXRBZG1pblZpZXcgPSB0eXBlb2YgaW5pdEFkbWluVmlldyA9PT0gJ2Z1bmN0aW9uJyA/IGluaXRBZG1pblZpZXcgOiBudWxsOwoKLy8g4pSA4pSAIFRBU0sgMTA6IFRpbWVyIHVuZG8g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACmxldCBfdGltZXJVbmRvVGltZXIgPSBudWxsOwoKZnVuY3Rpb24gX3Nob3dUaW1lclVuZG8obGFuZSwgc3BsaXRLZXksIGVsYXBzZWRNcykgewogIC8vIENsZWFyIGFueSBleGlzdGluZyB1bmRvCiAgaWYgKF90aW1lclVuZG9UaW1lcikgeyBjbGVhclRpbWVvdXQoX3RpbWVyVW5kb1RpbWVyKTsgX3RpbWVyVW5kb1RpbWVyID0gbnVsbDsgfQogIGNvbnN0IGV4aXN0aW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbWVyLXVuZG8tYmFyJyk7CiAgaWYgKGV4aXN0aW5nKSBleGlzdGluZy5yZW1vdmUoKTsKCiAgY29uc3QgYmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgYmFyLmlkID0gJ3RpbWVyLXVuZG8tYmFyJzsKICBiYXIuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjpmaXhlZDtib3R0b206MjRweDtsZWZ0OjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtNTAlKTtiYWNrZ3JvdW5kOnZhcigtLXN1cmZhY2UpO2JvcmRlcjoxcHggc29saWQgdmFyKC0tYm9yZGVyKTtib3JkZXItcmFkaXVzOjEycHg7cGFkZGluZzoxMnB4IDIwcHg7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6MTZweDt6LWluZGV4Ojk5OTc7Ym94LXNoYWRvdzowIDRweCAyNHB4IHJnYmEoMCwwLDAsLjQpJzsKICBjb25zdCB0aW1lTGVmdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTsKICB0aW1lTGVmdC5zdHlsZS5jc3NUZXh0ID0gJ2ZvbnQtc2l6ZTowLjg1cmVtO2NvbG9yOnZhcigtLW11dGVkKSc7CiAgdGltZUxlZnQudGV4dENvbnRlbnQgPSAnVW5kbyBzdG9wICgzcyknOwogIGNvbnN0IHVuZG9CdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTsKICB1bmRvQnRuLmNsYXNzTmFtZSA9ICdidG4gYnRuLXNlY29uZGFyeSc7CiAgdW5kb0J0bi5zdHlsZS5jc3NUZXh0ID0gJ2ZvbnQtc2l6ZTowLjg1cmVtO3BhZGRpbmc6NnB4IDE2cHg7Y29sb3I6dmFyKC0tYWNjZW50KTtib3JkZXItY29sb3I6dmFyKC0tYWNjZW50KSc7CiAgdW5kb0J0bi50ZXh0Q29udGVudCA9ICfihqkgVW5kbyc7CiAgYmFyLmFwcGVuZENoaWxkKHRpbWVMZWZ0KTsKICBiYXIuYXBwZW5kQ2hpbGQodW5kb0J0bik7CiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChiYXIpOwoKICBsZXQgc2VjcyA9IDM7CiAgY29uc3QgdGljayA9IHNldEludGVydmFsKCgpID0+IHsKICAgIHNlY3MtLTsKICAgIGlmIChzZWNzIDw9IDApIHsgY2xlYXJJbnRlcnZhbCh0aWNrKTsgYmFyLnJlbW92ZSgpOyB9CiAgICBlbHNlIHRpbWVMZWZ0LnRleHRDb250ZW50ID0gYFVuZG8gc3RvcCAoJHtzZWNzfXMpYDsKICB9LCAxMDAwKTsKCiAgdW5kb0J0bi5vbmNsaWNrID0gYXN5bmMgKCkgPT4gewogICAgY2xlYXJJbnRlcnZhbCh0aWNrKTsKICAgIGNsZWFyVGltZW91dChfdGltZXJVbmRvVGltZXIpOwogICAgYmFyLnJlbW92ZSgpOwogICAgdHJ5IHsKICAgICAgYXdhaXQgY1JlZihgcmFjZS9jdXJyZW50L3NwbGl0cy8ke2xhbmV9LyR7c3BsaXRLZXl9YCkucmVtb3ZlKCk7CiAgICAgIGNvbnN0IHNwbGl0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpbWVyLXN0b3AtYnRuJyk7CiAgICAgIGlmIChzcGxpdEJ0bikgeyBzcGxpdEJ0bi50ZXh0Q29udGVudCA9ICdTVE9QJzsgc3BsaXRCdG4ucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpOyB9CiAgICAgIHRvYXN0KCfihqkgU3RvcCB1bmRvbmUg4oCUIHRhcCBTVE9QIGFnYWluIHdoZW4gcmVhZHknKTsKICAgIH0gY2F0Y2goZSkgewogICAgICB0b2FzdCgnQ291bGQgbm90IHVuZG8g4oCUIHNwbGl0IGFscmVhZHkgc3luY2VkJyk7CiAgICB9CiAgfTsKCiAgX3RpbWVyVW5kb1RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7IGNsZWFySW50ZXJ2YWwodGljayk7IGJhci5yZW1vdmUoKTsgfSwgMzAwMCk7Cn0KCi8vIOKUgOKUgCBUQVNLIDEyOiBSZXN1bHRzIGV4cG9ydCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKZnVuY3Rpb24gYWRtaW5FeHBvcnRDU1YoKSB7CiAgaWYgKCFyYWNlU3RhdGUpIHsgdG9hc3QoJ05vIHJhY2UgZGF0YScpOyByZXR1cm47IH0KICBjb25zdCBsYW5lcyAgPSByYWNlU3RhdGUubGFuZXMgIHx8IHt9OwogIGNvbnN0IHNwbGl0cyA9IHJhY2VTdGF0ZS5zcGxpdHMgfHwge307CiAgY29uc3QgcmVzdWx0cyA9IFtdOwogIE9iamVjdC5rZXlzKGxhbmVzKS5mb3JFYWNoKGxhbmUgPT4gewogICAgY29uc3QgdmFscyA9IE9iamVjdC52YWx1ZXMoc3BsaXRzW2xhbmVdfHx7fSkubWFwKHM9PnMuZWxhcHNlZE1zKS5maWx0ZXIoQm9vbGVhbik7CiAgICBjb25zdCBtZWFuID0gdmFscy5sZW5ndGggPyB0cmltbWVkTWVhbih2YWxzKSA6IG51bGw7CiAgICBpZiAobWVhbiAhPSBudWxsKSByZXN1bHRzLnB1c2goeyBsYW5lLCBuYW1lOiBsYW5lc1tsYW5lXT8ubmFtZSB8fCBgTGFuZSAke2xhbmV9YCwgdGltZU1zOiBtZWFuIH0pOwogIH0pOwogIHJlc3VsdHMuc29ydCgoYSxiKSA9PiBhLnRpbWVNcyAtIGIudGltZU1zKTsKICBsZXQgcGxhY2UgPSAxOwogIHJlc3VsdHMuZm9yRWFjaChyID0+IHsgci5wbGFjZSA9IHBsYWNlKys7IH0pOwoKICBjb25zdCBldmVudCAgID0gcmFjZVN0YXRlLmV2ZW50ICAgfHwgJyc7CiAgY29uc3QgYWdlICAgICA9IHJhY2VTdGF0ZS5hZ2UgICAgIHx8ICcnOwogIGNvbnN0IGdlbmRlciAgPSByYWNlU3RhdGUuZ2VuZGVyICB8fCAnJzsKICBjb25zdCBoZWFkZXIgID0gJ1BsYWNlLExhbmUsTmFtZSxUaW1lXHJcbic7CiAgY29uc3Qgcm93cyAgICA9IHJlc3VsdHMubWFwKHIgPT4gYCR7ci5wbGFjZX0sJHtyLmxhbmV9LCIke3IubmFtZX0iLCR7Zm10U2VjKHIudGltZU1zKX1gKS5qb2luKCdcclxuJyk7CiAgY29uc3QgY3N2ICAgICA9IGhlYWRlciArIHJvd3M7CiAgY29uc3QgYmxvYiAgICA9IG5ldyBCbG9iKFtjc3ZdLCB7dHlwZTondGV4dC9jc3YnfSk7CiAgY29uc3QgdXJsICAgICA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7CiAgY29uc3QgYSAgICAgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTsKICBhLmhyZWYgPSB1cmw7CiAgYS5kb3dubG9hZCA9IGAke2FnZX0tJHtnZW5kZXJ9LSR7ZXZlbnR9LXJlc3VsdHMuY3N2YC5yZXBsYWNlKC9ccysvZywnXycpOwogIGEuY2xpY2soKTsKICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7CiAgdG9hc3QoJ0NTViBkb3dubG9hZGVkJyk7Cn0KCmZ1bmN0aW9uIGFkbWluUHJpbnRSZXN1bHRzKCkgewogIGlmICghcmFjZVN0YXRlKSB7IHRvYXN0KCdObyByYWNlIGRhdGEnKTsgcmV0dXJuOyB9CiAgY29uc3QgbGFuZXMgID0gcmFjZVN0YXRlLmxhbmVzICB8fCB7fTsKICBjb25zdCBzcGxpdHMgPSByYWNlU3RhdGUuc3BsaXRzIHx8IHt9OwogIGNvbnN0IHJlc3VsdHMgPSBbXTsKICBPYmplY3Qua2V5cyhsYW5lcykuZm9yRWFjaChsYW5lID0+IHsKICAgIGNvbnN0IHZhbHMgPSBPYmplY3QudmFsdWVzKHNwbGl0c1tsYW5lXXx8e30pLm1hcChzPT5zLmVsYXBzZWRNcykuZmlsdGVyKEJvb2xlYW4pOwogICAgY29uc3QgbWVhbiA9IHZhbHMubGVuZ3RoID8gdHJpbW1lZE1lYW4odmFscykgOiBudWxsOwogICAgaWYgKG1lYW4gIT0gbnVsbCkgcmVzdWx0cy5wdXNoKHsgbGFuZSwgbmFtZTogbGFuZXNbbGFuZV0/Lm5hbWUgfHwgYExhbmUgJHtsYW5lfWAsIHRpbWVNczogbWVhbiB9KTsKICB9KTsKICByZXN1bHRzLnNvcnQoKGEsYikgPT4gYS50aW1lTXMgLSBiLnRpbWVNcyk7CiAgbGV0IHBsYWNlID0gMTsKICByZXN1bHRzLmZvckVhY2gociA9PiB7IHIucGxhY2UgPSBwbGFjZSsrOyB9KTsKCiAgY29uc3QgbWVkYWxzID0gWyfwn6WHJywn8J+liCcsJ/CfpYknXTsKICBjb25zdCByb3dzICAgPSByZXN1bHRzLm1hcChyID0+CiAgICBgPHRyPjx0ZCBzdHlsZT0idGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOjEuNHJlbSI+JHttZWRhbHNbci5wbGFjZS0xXXx8ci5wbGFjZX08L3RkPjx0ZD4ke3IubGFuZX08L3RkPjx0ZCBzdHlsZT0iZm9udC13ZWlnaHQ6NjAwIj4ke3IubmFtZX08L3RkPjx0ZCBzdHlsZT0iZm9udC1mYW1pbHk6bW9ub3NwYWNlO2ZvbnQtc2l6ZToxLjFyZW0iPiR7Zm10U2VjKHIudGltZU1zKX08L3RkPjwvdHI+YAogICkuam9pbignJyk7CgogIGNvbnN0IHdpbiA9IHdpbmRvdy5vcGVuKCcnLCdfYmxhbmsnKTsKICB3aW4uZG9jdW1lbnQud3JpdGUoYDwhRE9DVFlQRSBodG1sPjxodG1sPjxoZWFkPjx0aXRsZT5SZXN1bHRzPC90aXRsZT4KICA8c3R5bGU+Ym9keXtmb250LWZhbWlseTpzYW5zLXNlcmlmO3BhZGRpbmc6MzJweDttYXgtd2lkdGg6NjAwcHg7bWFyZ2luOmF1dG99aDF7Zm9udC1zaXplOjEuNHJlbTttYXJnaW4tYm90dG9tOjRweH1oMntmb250LXNpemU6MXJlbTtjb2xvcjojNjY2O21hcmdpbi1ib3R0b206MjRweDtmb250LXdlaWdodDo0MDB9dGFibGV7d2lkdGg6MTAwJTtib3JkZXItY29sbGFwc2U6Y29sbGFwc2V9dGh7dGV4dC1hbGlnbjpsZWZ0O2JvcmRlci1ib3R0b206MnB4IHNvbGlkICNkZGQ7cGFkZGluZzo4cHggMTJweDtmb250LXNpemU6Ljg1cmVtO3RleHQtdHJhbnNmb3JtOnVwcGVyY2FzZTtjb2xvcjojODg4fXRke3BhZGRpbmc6MTBweCAxMnB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkICNlZWV9QG1lZGlhIHByaW50e2J1dHRvbntkaXNwbGF5Om5vbmV9fQovKiDilIDilIAgQ1QgQWNjZXNzIFBheXdhbGwg4pSA4pSAICovCi5jdC1wYXl3YWxsLW92ZXJsYXl7cG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDtiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsLjcyKTt6LWluZGV4OjkwMDA7ZGlzcGxheTpmbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO3BhZGRpbmc6MTZweH0KLmN0LXBheXdhbGwtb3ZlcmxheS5oaWRkZW57ZGlzcGxheTpub25lfQouY3QtcGF5d2FsbC1ib3h7YmFja2dyb3VuZDojZmZmO2JvcmRlci1yYWRpdXM6MThweDtwYWRkaW5nOjI4cHggMjRweDttYXgtd2lkdGg6MzgwcHg7d2lkdGg6MTAwJTtib3gtc2hhZG93OjAgMjBweCA2MHB4IHJnYmEoMCwwLDAsLjM1KX0KLmN0LXBheXdhbGwtbG9nb3tmb250LXNpemU6MnJlbTt0ZXh0LWFsaWduOmNlbnRlcjttYXJnaW4tYm90dG9tOjZweH0KLmN0LXBheXdhbGwtdGl0bGV7Zm9udC1zaXplOjEuMTVyZW07Zm9udC13ZWlnaHQ6ODAwO3RleHQtYWxpZ246Y2VudGVyO2NvbG9yOiMwZDFiM2U7bWFyZ2luLWJvdHRvbTo0cHh9Ci5jdC1wYXl3YWxsLXN1Yntmb250LXNpemU6Ljg1cmVtO3RleHQtYWxpZ246Y2VudGVyO2NvbG9yOiM2NDc0OGI7bWFyZ2luLWJvdHRvbToyMHB4fQouY3QtcGxhbi1yb3d7ZGlzcGxheTpmbGV4O2ZsZXgtZGlyZWN0aW9uOmNvbHVtbjtnYXA6MTBweDttYXJnaW4tYm90dG9tOjIwcHh9Ci5jdC1wbGFuLWJ0bntkaXNwbGF5OmJsb2NrO3BhZGRpbmc6MTRweCAxOHB4O2JvcmRlci1yYWRpdXM6MTBweDt0ZXh0LWRlY29yYXRpb246bm9uZTtib3JkZXI6MnB4IHNvbGlkICNlMmU4ZjA7Y3Vyc29yOnBvaW50ZXI7dHJhbnNpdGlvbjpib3JkZXItY29sb3IgLjE1cyxiYWNrZ3JvdW5kIC4xNXM7dGV4dC1hbGlnbjpsZWZ0fQouY3QtcGxhbi1idG46aG92ZXJ7Ym9yZGVyLWNvbG9yOiMxYTU2ZGI7YmFja2dyb3VuZDojZjBmNWZmfQouY3QtcGxhbi1idG4ucHJpbWFyeXtiYWNrZ3JvdW5kOiMwZDFiM2U7Ym9yZGVyLWNvbG9yOiMwZDFiM2U7Y29sb3I6I2ZmZn0KLmN0LXBsYW4tYnRuLnByaW1hcnk6aG92ZXJ7YmFja2dyb3VuZDojMWEzYTZlO2JvcmRlci1jb2xvcjojMWEzYTZlfQouY3QtcGxhbi1sYWJlbHtmb250LXNpemU6Ljk1cmVtO2ZvbnQtd2VpZ2h0OjcwMH0KLmN0LXBsYW4tcHJpY2V7Zm9udC1zaXplOjEuMXJlbTtmb250LXdlaWdodDo5MDB9Ci5jdC1wbGFuLWRlc2N7Zm9udC1zaXplOi43OHJlbTtvcGFjaXR5Oi43NTttYXJnaW4tdG9wOjJweH0KLmN0LWRpdmlkZXJ7dGV4dC1hbGlnbjpjZW50ZXI7Zm9udC1zaXplOi44cmVtO2NvbG9yOiM5NGEzYjg7bWFyZ2luOjRweCAwIDEycHh9Ci5jdC1jb2RlLXJvd3tkaXNwbGF5OmZsZXg7Z2FwOjhweH0KLmN0LWNvZGUtaW5wdXR7ZmxleDoxO3BhZGRpbmc6MTFweCAxNHB4O2JvcmRlcjoycHggc29saWQgI2UyZThmMDtib3JkZXItcmFkaXVzOjhweDtmb250LXNpemU6MXJlbTtmb250LWZhbWlseTptb25vc3BhY2U7dGV4dC10cmFuc2Zvcm06dXBwZXJjYXNlO2xldHRlci1zcGFjaW5nOi4xZW07b3V0bGluZTpub25lfQouY3QtY29kZS1pbnB1dDpmb2N1c3tib3JkZXItY29sb3I6IzFhNTZkYn0KLmN0LWNvZGUtc3VibWl0e3BhZGRpbmc6MTFweCAxOHB4O2JhY2tncm91bmQ6IzFhNTZkYjtjb2xvcjojZmZmO2JvcmRlcjpub25lO2JvcmRlci1yYWRpdXM6OHB4O2ZvbnQtc2l6ZTouOXJlbTtmb250LXdlaWdodDo3MDA7Y3Vyc29yOnBvaW50ZXI7d2hpdGUtc3BhY2U6bm93cmFwfQouY3QtY29kZS1zdWJtaXQ6ZGlzYWJsZWR7b3BhY2l0eTouNTtjdXJzb3I6ZGVmYXVsdH0KLmN0LWNvZGUtZXJyb3J7Zm9udC1zaXplOi44MnJlbTtjb2xvcjojZGMyNjI2O21hcmdpbi10b3A6NnB4O21pbi1oZWlnaHQ6MThweH0KLmN0LWFjY2Vzcy1iYWRnZXtkaXNwbGF5OmlubGluZS1mbGV4O2FsaWduLWl0ZW1zOmNlbnRlcjtnYXA6NXB4O2JhY2tncm91bmQ6I2RjZmNlNztjb2xvcjojMTU4MDNkO2JvcmRlci1yYWRpdXM6NnB4O2ZvbnQtc2l6ZTouNzVyZW07Zm9udC13ZWlnaHQ6NzAwO3BhZGRpbmc6M3B4IDhweH0KPC9zdHlsZT4KICA8L2hlYWQ+PGJvZHk+CiAgPGgxPiR7cmFjZVN0YXRlLmV2ZW50fHwnUmFjZSBSZXN1bHRzJ308L2gxPgogIDxoMj4ke3JhY2VTdGF0ZS5hZ2V8fCcnfSAke3JhY2VTdGF0ZS5nZW5kZXJ8fCcnfSAmbWRhc2g7ICR7bmV3IERhdGUoKS50b0xvY2FsZURhdGVTdHJpbmcoJ2VuLUFVJyl9PC9oMj4KICA8dGFibGU+PHRoZWFkPjx0cj48dGg+UGxhY2U8L3RoPjx0aD5MYW5lPC90aD48dGg+QXRobGV0ZTwvdGg+PHRoPlRpbWU8L3RoPjwvdHI+PC90aGVhZD48dGJvZHk+JHtyb3dzfTwvdGJvZHk+PC90YWJsZT4KICA8cCBzdHlsZT0ibWFyZ2luLXRvcDozMnB4O2ZvbnQtc2l6ZTouNzVyZW07Y29sb3I6I2FhYSI+R2VuZXJhdGVkIGJ5IENhcm5pdmFsIFRpbWluZyAmbWRhc2g7IGNhcm5pdmFsdGltaW5nLmNvbTwvcD4KICA8YnV0dG9uIG9uY2xpY2s9IndpbmRvdy5wcmludCgpIiBzdHlsZT0ibWFyZ2luLXRvcDoxNnB4O3BhZGRpbmc6MTBweCAyNHB4O2ZvbnQtc2l6ZToxcmVtO2N1cnNvcjpwb2ludGVyIj7wn5aoIFByaW50PC9idXR0b24+CiAgCjxkaXYgaWQ9ImN0LWZvb3RlciIgc3R5bGU9InBvc2l0aW9uOmZpeGVkO2JvdHRvbTowO2xlZnQ6MDtyaWdodDowO2JhY2tncm91bmQ6cmdiYSgxMywyNyw2MiwwLjkyKTtiYWNrZHJvcC1maWx0ZXI6Ymx1cig2cHgpO2NvbG9yOnJnYmEoMjU1LDI1NSwyNTUsMC41KTtmb250LXNpemU6MTFweDt0ZXh0LWFsaWduOmNlbnRlcjtwYWRkaW5nOjZweCAxNnB4O3otaW5kZXg6MTAwO2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2dhcDoxNnB4O2FsaWduLWl0ZW1zOmNlbnRlcjtmbGV4LXdyYXA6d3JhcDsiPgogIDxzcGFuPsKpIDIwMjYgTHVjayBEcmFnb24gUHR5IEx0ZDwvc3Bhbj4KICA8c3Bhbj7Ctzwvc3Bhbj4KICA8YSBocmVmPSJodHRwczovL3NjaG9vbHNwb3J0cG9ydGFsLmNvbS5hdS9wcml2YWN5IiBzdHlsZT0iY29sb3I6cmdiYSgyNTUsMjU1LDI1NSwwLjUpO3RleHQtZGVjb3JhdGlvbjpub25lOyIgdGFyZ2V0PSJfYmxhbmsiPlByaXZhY3k8L2E+CiAgPHNwYW4+wrc8L3NwYW4+CiAgPGEgaHJlZj0iaHR0cHM6Ly9zY2hvb2xzcG9ydHBvcnRhbC5jb20uYXUiIHN0eWxlPSJjb2xvcjpyZ2JhKDI1NSwyNTUsMjU1LDAuNSk7dGV4dC1kZWNvcmF0aW9uOm5vbmU7IiB0YXJnZXQ9Il9ibGFuayI+U2Nob29sIFNwb3J0IFBvcnRhbDwvYT4KPC9kaXY+Cgo8ZGl2IGlkPSJjdC1wYXl3YWxsLW92ZXJsYXkiIGNsYXNzPSJjdC1wYXl3YWxsLW92ZXJsYXkgaGlkZGVuIj4KICA8ZGl2IGNsYXNzPSJjdC1wYXl3YWxsLWJveCI+CiAgICA8ZGl2IGNsYXNzPSJjdC1wYXl3YWxsLWxvZ28iPvCfj4E8L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImN0LXBheXdhbGwtdGl0bGUiPkNhcm5pdmFsIFRpbWluZzwvZGl2PgogICAgPGRpdiBjbGFzcz0iY3QtcGF5d2FsbC1zdWIiPlJhY2UgQ29udHJvbCByZXF1aXJlcyBhbiBhY2Nlc3MgY29kZS48YnI+Sm9pbiBDYXJuaXZhbCAmYW1wOyBkZW1vcyBhcmUgYWx3YXlzIGZyZWUuPC9kaXY+CiAgICA8ZGl2IGNsYXNzPSJjdC1wbGFuLXJvdyI+CiAgICAgIDxhIGhyZWY9Imh0dHBzOi8vYnV5LnN0cmlwZS5jb20vOHgyNm9HZ3V4OUlUM3dRY2ttOUlRMDUiIHRhcmdldD0iX2JsYW5rIiBjbGFzcz0iY3QtcGxhbi1idG4gcHJpbWFyeSIgb25jbGljaz0iY3RUcmFja0NsaWNrKCdzaW5nbGUnKSI+CiAgICAgICAgPGRpdiBzdHlsZT0iZGlzcGxheTpmbGV4O2p1c3RpZnktY29udGVudDpzcGFjZS1iZXR3ZWVuO2FsaWduLWl0ZW1zOmNlbnRlciI+CiAgICAgICAgICA8c3BhbiBjbGFzcz0iY3QtcGxhbi1sYWJlbCI+U2luZ2xlIENhcm5pdmFsPC9zcGFuPgogICAgICAgICAgPHNwYW4gY2xhc3M9ImN0LXBsYW4tcHJpY2UiPiQ0OTwvc3Bhbj4KICAgICAgICA8L2Rpdj4KICAgICAgICA8ZGl2IGNsYXNzPSJjdC1wbGFuLWRlc2MiPk9uZSBjb2RlLCBvbmUgY2Fybml2YWwuIFBlcmZlY3QgZm9yIGF0aGxldGljcyBjbHVicyAmYW1wOyBvbmUtb2ZmIGV2ZW50cy48L2Rpdj4KICAgICAgPC9hPgogICAgICA8YSBocmVmPSJodHRwczovL2J1eS5zdHJpcGUuY29tLzdzWTNjdTNITDhFUDRBVWVzdTlJUTA2IiB0YXJnZXQ9Il9ibGFuayIgY2xhc3M9ImN0LXBsYW4tYnRuIiBvbmNsaWNrPSJjdFRyYWNrQ2xpY2soJ2FubnVhbCcpIj4KICAgICAgICA8ZGl2IHN0eWxlPSJkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47YWxpZ24taXRlbXM6Y2VudGVyIj4KICAgICAgICAgIDxzcGFuIGNsYXNzPSJjdC1wbGFuLWxhYmVsIj5Bbm51YWwgVW5saW1pdGVkPC9zcGFuPgogICAgICAgICAgPHNwYW4gY2xhc3M9ImN0LXBsYW4tcHJpY2UiPiQxNDk8L3NwYW4+CiAgICAgICAgPC9kaXY+CiAgICAgICAgPGRpdiBjbGFzcz0iY3QtcGxhbi1kZXNjIj5VbmxpbWl0ZWQgY2Fybml2YWxzIGZvciAxMiBtb250aHMuIEJlc3QgZm9yIHNjaG9vbHMgJmFtcDsgcmVndWxhciBldmVudHMuPC9kaXY+CiAgICAgIDwvYT4KICAgIDwvZGl2PgogICAgPGRpdiBjbGFzcz0iY3QtZGl2aWRlciI+QWxyZWFkeSBoYXZlIGEgY29kZT88L2Rpdj4KICAgIDxkaXYgY2xhc3M9ImN0LWNvZGUtcm93Ij4KICAgICAgPGlucHV0IGlkPSJjdC1jb2RlLWlucHV0IiBjbGFzcz0iY3QtY29kZS1pbnB1dCIgdHlwZT0idGV4dCIgcGxhY2Vob2xkZXI9ImUuZy4gQUJDLTEyMzQiIG1heGxlbmd0aD0iMTAiIGF1dG9jb21wbGV0ZT0ib2ZmIiBzcGVsbGNoZWNrPSJmYWxzZSI+CiAgICAgIDxidXR0b24gaWQ9ImN0LWNvZGUtc3VibWl0IiBjbGFzcz0iY3QtY29kZS1zdWJtaXQiIG9uY2xpY2s9ImN0U3VibWl0Q29kZSgpIj5VbmxvY2s8L2J1dHRvbj4KICAgIDwvZGl2PgogICAgPGRpdiBpZD0iY3QtY29kZS1lcnJvciIgY2xhc3M9ImN0LWNvZGUtZXJyb3IiPjwvZGl2PgogICAgPGRpdiBzdHlsZT0ibWFyZ2luLXRvcDoxNnB4O3RleHQtYWxpZ246Y2VudGVyO2ZvbnQtc2l6ZTouNzhyZW07Y29sb3I6Izk0YTNiOCI+CiAgICAgIFNjaG9vbCBTcG9ydCBQb3J0YWwgc3Vic2NyaWJlcnM6IGVudGVyIHlvdXIgc2Nob29sIGNvZGUgYWJvdmUuPGJyPgogICAgICA8YSBocmVmPSJodHRwczovL3NjaG9vbHNwb3J0cG9ydGFsLmNvbS5hdSIgdGFyZ2V0PSJfYmxhbmsiIHN0eWxlPSJjb2xvcjojMWE1NmRiIj5HZXQgU2Nob29sIFNwb3J0IFBvcnRhbCDihpI8L2E+CiAgICA8L2Rpdj4KICA8L2Rpdj4KPC9kaXY+CjwvYm9keT48L2h0bWw+YCk7CiAgd2luLmRvY3VtZW50LmNsb3NlKCk7Cn0KCi8vIEF0dGFjaCBsYW5lLW5hbWUgYXV0b2xvYWQgYWZ0ZXIgRE9NIGlzIHJlYWR5CnNldFRpbWVvdXQoX2F0dGFjaExhbmVOYW1lQXV0b0xvYWQsIDE1MDApOwoKLy8g4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQCi8vICBDVCB2OC41LjAg4oCUIEF1dG8gRmluaXNoIExpbmUgRGV0ZWN0aW9uCi8vIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkApsZXQgeGNBdXRvRGV0ZWN0TW9kZSA9IGZhbHNlOwpsZXQgeGNMaW5lUDEgICAgICAgICA9IG51bGw7ICAgLy8ge3gseX0gbm9ybWFsaXNlZCAwLTEKbGV0IHhjTGluZVAyICAgICAgICAgPSBudWxsOwpsZXQgeGNQcmV2U2FtcGxlcyAgICA9IG51bGw7CmxldCB4Y0RldGVjdEludGVydmFsID0gbnVsbDsKbGV0IHhjTGFzdFRyaWdnZXIgICAgPSAwOwpsZXQgeGNEaWZmVGhyZXNob2xkICA9IDIyOyAgICAgLy8gY29udHJvbGxlZCBieSBzZW5zaXRpdml0eSBzbGlkZXIKY29uc3QgWENfQ09PTERPV05fTVMgPSAyODAwOyAgIC8vIG1pbiBtcyBiZXR3ZWVuIGF1dG8tZGV0ZWN0aW9ucwpjb25zdCBYQ19TQU1QTEVTICAgICA9IDgwOyAgICAgLy8gcGl4ZWxzIHNhbXBsZWQgYWxvbmcgZmluaXNoIGxpbmUKCi8vIOKUgOKUgCBNb2RlIHRvZ2dsZSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIAKZnVuY3Rpb24geGNTdGFydEF1dG9Nb2RlKCkgewogIHhjQXV0b0RldGVjdE1vZGUgPSB0cnVlOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXJzaGFsLXRhcC1idG4nKS5zdHlsZS5kaXNwbGF5ICAgID0gJ25vbmUnOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1hdXRvLW1vZGUtYnRuJykuc3R5bGUuZGlzcGxheSAgID0gJ25vbmUnOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1hdXRvLWJhcicpLnN0eWxlLmRpc3BsYXkgICAgICAgID0gJ2ZsZXgnOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1kZXRlY3Qtc3RhdHVzJykudGV4dENvbnRlbnQgICAgID0gJ0RyYXcgeW91ciBmaW5pc2ggbGluZSB0byBiZWdpbic7CiAgeGNJbml0Q2FtZXJhKCkudGhlbigoKSA9PiB4Y1Nob3dMaW5lU2V0dXAoKSk7Cn0KCmZ1bmN0aW9uIHhjU3RvcEF1dG9Nb2RlKCkgewogIHhjQXV0b0RldGVjdE1vZGUgPSBmYWxzZTsKICB4Y1N0b3BEZXRlY3QoKTsKICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFyc2hhbC10YXAtYnRuJykuc3R5bGUuZGlzcGxheSAgICA9ICcnOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1hdXRvLW1vZGUtYnRuJykuc3R5bGUuZGlzcGxheSAgID0gJyc7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWF1dG8tYmFyJykuc3R5bGUuZGlzcGxheSAgICAgICAgPSAnbm9uZSc7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWxpbmUtc2V0dXAtb3ZlcmxheScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7Cn0KCi8vIOKUgOKUgCBMaW5lIHNldHVwIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgApmdW5jdGlvbiB4Y1Nob3dMaW5lU2V0dXAoKSB7CiAgY29uc3Qgb3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1saW5lLXNldHVwLW92ZXJsYXknKTsKICBvdmVybGF5LnN0eWxlLmRpc3BsYXkgPSAnZmxleCc7CiAgeGNMaW5lUDEgPSBudWxsOyB4Y0xpbmVQMiA9IG51bGw7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLXN0YXJ0LWRldGVjdC1idG4nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1saW5lLWluc3RydWN0aW9uJykudGV4dENvbnRlbnQgICA9ICdUYXAgdGhlIExFRlQgZWRnZSBvZiB5b3VyIGZpbmlzaCBsaW5lJzsKCiAgLy8gV2lyZSB1cCB0aGUgY2FtZXJhIHN0cmVhbSB0byB0aGUgc2V0dXAgdmlkZW8KICBjb25zdCB2aWQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgneGMtc2V0dXAtdmlkJyk7CiAgaWYgKHhjQ2FtU3RyZWFtKSB7IHZpZC5zcmNPYmplY3QgPSB4Y0NhbVN0cmVhbTsgdmlkLnBsYXkoKS5jYXRjaCgoKT0+e30pOyB9CgogIC8vIFJlc2l6ZSBjYW52YXMgdG8gbWF0Y2ggb3ZlcmxheQogIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1saW5lLWNhbnZhcy1vdmVybGF5Jyk7CiAgY29uc3QgcmVzaXplID0gKCkgPT4geyBjYW52YXMud2lkdGggPSBvdmVybGF5LmNsaWVudFdpZHRoOyBjYW52YXMuaGVpZ2h0ID0gb3ZlcmxheS5jbGllbnRIZWlnaHQ7IHhjRHJhd0xpbmUoKTsgfTsKICByZXNpemUoKTsKICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgcmVzaXplKTsKCiAgLy8gVGFwIGhhbmRsZXIgb24gdGhlIGNhbnZhcwogIGNhbnZhcy5vbnRvdWNoc3RhcnQgPSAoZSkgPT4geyBlLnByZXZlbnREZWZhdWx0KCk7IHhjTGluZVNldHVwVGFwKGUudG91Y2hlc1swXSwgY2FudmFzKTsgfTsKICBjYW52YXMub25tb3VzZWRvd24gID0gKGUpID0+IHhjTGluZVNldHVwVGFwKGUsIGNhbnZhcyk7Cn0KCmZ1bmN0aW9uIHhjQ2xvc2VMaW5lU2V0dXAoKSB7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWxpbmUtc2V0dXAtb3ZlcmxheScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7CiAgaWYgKCF4Y0RldGVjdEludGVydmFsKSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgneGMtZGV0ZWN0LXN0YXR1cycpLnRleHRDb250ZW50ID0gJ0RyYXcgeW91ciBmaW5pc2ggbGluZSB0byBiZWdpbic7Cn0KCmZ1bmN0aW9uIHhjTGluZVNldHVwVGFwKGUsIGNhbnZhcykgewogIGNvbnN0IHJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7CiAgY29uc3QgeCA9IChlLmNsaWVudFggLSByZWN0LmxlZnQpIC8gcmVjdC53aWR0aDsKICBjb25zdCB5ID0gKGUuY2xpZW50WSAtIHJlY3QudG9wKSAgLyByZWN0LmhlaWdodDsKCiAgaWYgKCF4Y0xpbmVQMSkgewogICAgeGNMaW5lUDEgPSB7eCwgeX07CiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgneGMtbGluZS1pbnN0cnVjdGlvbicpLnRleHRDb250ZW50ID0gJ05vdyB0YXAgdGhlIFJJR0hUIGVkZ2UnOwogIH0gZWxzZSBpZiAoIXhjTGluZVAyKSB7CiAgICB4Y0xpbmVQMiA9IHt4LCB5fTsKICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1saW5lLWluc3RydWN0aW9uJykudGV4dENvbnRlbnQgPSAn4pyFIExpbmUgc2V0IOKAlCByZWFkeSB0byBkZXRlY3QnOwogICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLXN0YXJ0LWRldGVjdC1idG4nKS5zdHlsZS5kaXNwbGF5ID0gJyc7CiAgfQogIHhjRHJhd0xpbmUoKTsKfQoKZnVuY3Rpb24geGNSZXNldExpbmUoKSB7CiAgeGNMaW5lUDEgPSB4Y0xpbmVQMiA9IG51bGw7CiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLXN0YXJ0LWRldGVjdC1idG4nKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1saW5lLWluc3RydWN0aW9uJykudGV4dENvbnRlbnQgICA9ICdUYXAgdGhlIExFRlQgZWRnZSBvZiB5b3VyIGZpbmlzaCBsaW5lJzsKICB4Y0RyYXdMaW5lKCk7Cn0KCmZ1bmN0aW9uIHhjRHJhd0xpbmUoKSB7CiAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3hjLWxpbmUtY2FudmFzLW92ZXJsYXknKTsKICBjb25zdCBjdHggICAgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTsKICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7CiAgY29uc3QgVyA9IGNhbnZhcy53aWR0aCwgSCA9IGNhbnZhcy5oZWlnaHQ7CgogIGlmICh4Y0xpbmVQMSkgewogICAgY3R4LmZpbGxTdHlsZSA9ICcjMjJjNTVlJzsKICAgIGN0eC5iZWdpblBhdGgoKTsKICAgIGN0eC5hcmMoeGNMaW5lUDEueCAqIFcsIHhjTGluZVAxLnkgKiBILCAxNCwgMCwgTWF0aC5QSSoyKTsKICAgIGN0eC5maWxsKCk7CiAgICBjdHguZmlsbFN0eWxlID0gJyNmZmYnOwogICAgY3R4LmZvbnQgPSAnYm9sZCAxMnB4IHNhbnMtc2VyaWYnOwogICAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInOwogICAgY3R4LmZpbGxUZXh0KCdMJywgeGNMaW5lUDEueCAqIFcsIHhjTGluZVAxLnkgKiBIICsgNCk7CiAgfQogIGlmICh4Y0xpbmVQMikgewogICAgY3R4LmZpbGxTdHlsZSA9ICcjMjJjNTVlJzsKICAgIGN0eC5iZWdpblBhdGgoKTsKICAgIGN0eC5hcmMoeGNMaW5lUDIueCAqIFcsIHhjTGluZVAyLnkgKiBILCAxNCwgMCwgTWF0aC5QSSoyKTsKICAgIGN0eC5maWxsKCk7CiAgICBjdHguZmlsbFN0eWxlID0gJyNmZmYnOwogICAgY3R4LmZvbnQgPSAnYm9sZCAxMnB4IHNhbnMtc2VyaWYnOwogICAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInOwogICAgY3R4LmZpbGxUZXh0KCdSJywgeGNMaW5lUDIueCAqIFcsIHhjTGluZVAyLnkgKiBIICsgNCk7CiAgfQogIGlmICh4Y0xpbmVQMSAmJiB4Y0xpbmVQMikgewogICAgY3R4LnN0cm9rZVN0eWxlID0gJyNlZjQ0NDQnOwogICAgY3R4LmxpbmVXaWR0aCAgID0gNDsKICAgIGN0eC5zZXRMaW5lRGFzaChbMTQsIDddKTsKICAgIGN0eC5zaGFkb3dDb2xvciA9ICcjZWY0NDQ0JzsKICAgIGN0eC5zaGFkb3dCbHVyICA9IDg7CiAgICBjdHguYmVnaW5QYXRoKCk7CiAgICBjdHgubW92ZVRvKHhjTGluZVAxLnggKiBXLCB4Y0xpbmVQMS55ICogSCk7CiAgICBjdHgubGluZVRvKHhjTGluZVAyLnggKiBXLCB4Y0xpbmVQMi55ICogSCk7CiAgICBjdHguc3Ryb2tlKCk7CiAgICBjdHguc2hhZG93Qmx1ciA9IDA7CiAgICBjdHguc2V0TGluZURhc2goW10pOwogIH0KfQoKLy8g4pSA4pSAIERldGVjdGlvbiBsb29wIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgApmdW5jdGlvbiB4Y1N0YXJ0RGV0ZWN0KCkgewogIGlmICgheGNMaW5lUDEgfHwgIXhjTGluZVAyKSByZXR1cm47CiAgeGNDbG9zZUxpbmVTZXR1cCgpOwogIHhjUHJldlNhbXBsZXMgICAgPSBudWxsOwogIHhjTGFzdFRyaWdnZXIgICAgPSAwOwogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1kZXRlY3Qtc3RhdHVzJykudGV4dENvbnRlbnQgPSAn8J+UtCBEZXRlY3Rpbmcg4oCUIHJ1bm5lcnMgYXV0by1yZWNvcmRlZCc7CiAgeGNEZXRlY3RJbnRlcnZhbCA9IHNldEludGVydmFsKHhjQW5hbHlzZUZyYW1lLCAxMTApOyAvLyB+OSBmcHMKfQoKZnVuY3Rpb24geGNTdG9wRGV0ZWN0KCkgewogIGNsZWFySW50ZXJ2YWwoeGNEZXRlY3RJbnRlcnZhbCk7CiAgeGNEZXRlY3RJbnRlcnZhbCA9IG51bGw7CiAgeGNQcmV2U2FtcGxlcyAgICA9IG51bGw7Cn0KCmZ1bmN0aW9uIHhjQW5hbHlzZUZyYW1lKCkgewogIGlmICgheGNDYW1TdHJlYW0pIHJldHVybjsKICBjb25zdCB2aWRlbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1jYW0nKTsKICBjb25zdCBjYXAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1jYXAnKTsKICBpZiAoIXZpZGVvIHx8IHZpZGVvLnJlYWR5U3RhdGUgPCAyKSByZXR1cm47CgogIGNvbnN0IFcgPSAzMjAsIEggPSAyNDA7CiAgY2FwLndpZHRoID0gVzsgY2FwLmhlaWdodCA9IEg7CiAgY29uc3QgY3R4ID0gY2FwLmdldENvbnRleHQoJzJkJyk7CiAgY3R4LmRyYXdJbWFnZSh2aWRlbywgMCwgMCwgVywgSCk7CgogIGNvbnN0IGltZ0RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIFcsIEgpOwogIGNvbnN0IHNhbXBsZXMgPSB4Y1NhbXBsZUxpbmUoaW1nRGF0YSwgeGNMaW5lUDEsIHhjTGluZVAyLCBYQ19TQU1QTEVTKTsKCiAgaWYgKHhjUHJldlNhbXBsZXMpIHsKICAgIGNvbnN0IGRpZmYgPSB4Y0xpbmVEaWZmKHNhbXBsZXMsIHhjUHJldlNhbXBsZXMpOwogICAgY29uc3Qgbm93ICA9IERhdGUubm93KCk7CiAgICBpZiAoZGlmZiA+IHhjRGlmZlRocmVzaG9sZCAmJiAobm93IC0geGNMYXN0VHJpZ2dlcikgPiBYQ19DT09MRE9XTl9NUykgewogICAgICB4Y0xhc3RUcmlnZ2VyID0gbm93OwogICAgICB4Y0F1dG9GaW5pc2goKTsKICAgIH0KICB9CiAgeGNQcmV2U2FtcGxlcyA9IHNhbXBsZXM7Cn0KCmZ1bmN0aW9uIHhjU2FtcGxlTGluZShpbWdEYXRhLCBwMSwgcDIsIG4pIHsKICBjb25zdCB7IGRhdGEsIHdpZHRoLCBoZWlnaHQgfSA9IGltZ0RhdGE7CiAgY29uc3Qgb3V0ID0gW107CiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHsKICAgIGNvbnN0IHQgID0gaSAvIChuIC0gMSk7CiAgICBjb25zdCBweCA9IE1hdGgubWluKHdpZHRoICAtIDEsIE1hdGgubWF4KDAsIE1hdGgucm91bmQocDEueCAqIHdpZHRoICArIHQgKiAocDIueCAtIHAxLngpICogd2lkdGgpKSk7CiAgICBjb25zdCBweSA9IE1hdGgubWluKGhlaWdodCAtIDEsIE1hdGgubWF4KDAsIE1hdGgucm91bmQocDEueSAqIGhlaWdodCArIHQgKiAocDIueSAtIHAxLnkpICogaGVpZ2h0KSkpOwogICAgY29uc3QgaWR4ID0gKHB5ICogd2lkdGggKyBweCkgKiA0OwogICAgb3V0LnB1c2goKGRhdGFbaWR4XSArIGRhdGFbaWR4KzFdICsgZGF0YVtpZHgrMl0pIC8gMyk7CiAgfQogIHJldHVybiBvdXQ7Cn0KCmZ1bmN0aW9uIHhjTGluZURpZmYoYSwgYikgewogIGxldCBzID0gMDsKICBmb3IgKGxldCBpID0gMDsgaSA8IGEubGVuZ3RoOyBpKyspIHMgKz0gTWF0aC5hYnMoYVtpXSAtIGJbaV0pOwogIHJldHVybiBzIC8gYS5sZW5ndGg7Cn0KCi8vIOKUgOKUgCBBdXRvLXRyaWdnZXIgYSBmaW5pc2gg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACmFzeW5jIGZ1bmN0aW9uIHhjQXV0b0ZpbmlzaCgpIHsKICBpZiAoIXhjU3RhdGUgfHwgeGNTdGF0ZS5zdGF0ZSAhPT0gJ2xpdmUnKSByZXR1cm47CgogIGNvbnN0IGVsYXBzZWQgPSBub3dTZXJ2ZXIoKSAtIHhjU3RhdGUuc3RhcnRlZEF0U2VydmVyOwogIGNvbnN0IGNvdW50ICAgPSBPYmplY3Qua2V5cyh4Y1N0YXRlLmZpbmlzaGVzIHx8IHt9KS5sZW5ndGg7CiAgY29uc3QgcGxhY2UgICA9IGNvdW50ICsgMTsKCiAgLy8gQXVkaW8gKyBoYXB0aWMgZmVlZGJhY2sKICB4Y0RldGVjdEJlZXAoKTsKICB2aWJyYXRlKFs4MCwgNDAsIDgwXSk7CgogIGNvbnN0IGtleSA9IG15SWQuc2xpY2UoMCwgNCkgKyAnLScgKyBEYXRlLm5vdygpLnRvU3RyaW5nKDM2KTsKICB4Y0NhcHR1cmVQaG90byhrZXkpOyAvLyBidXJzdCBjYXB0dXJlCgogIC8vIFdyaXRlIHRvIEZpcmViYXNlIChzYW1lIHN0cnVjdHVyZSBhcyBtYXJzaGFsVGFwKQogIGF3YWl0IGNSZWYoYHhjL2N1cnJlbnQvZmluaXNoZXMvJHtrZXl9YCkuc2V0KHsKICAgIG1hcnNoYWxJZDogICBteUlkLAogICAgbWFyc2hhbE5hbWU6IG15TmFtZSB8fCAnQXV0bycsCiAgICBiaWI6ICAgICAgICAgJycsCiAgICBuYW1lOiAgICAgICAgJycsCiAgICBlbGFwc2VkTXM6ICAgZWxhcHNlZCwKICAgIHRhcEF0OiAgICAgICBmaXJlYmFzZS5kYXRhYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVAsCiAgICBhdXRvRGV0ZWN0ZWQ6IHRydWUsCiAgfSk7CgogIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1kZXRlY3Qtc3RhdHVzJykudGV4dENvbnRlbnQgPSBg4pqhICMke3BsYWNlfSBkZXRlY3RlZCDigJQgJHtmbXRNcyhlbGFwc2VkKX1gOwogIHNldFRpbWVvdXQoKCkgPT4gewogICAgaWYgKHhjRGV0ZWN0SW50ZXJ2YWwpIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd4Yy1kZXRlY3Qtc3RhdHVzJykudGV4dENvbnRlbnQgPSAn8J+UtCBEZXRlY3Rpbmcg4oCUIHJ1bm5lcnMgYXV0by1yZWNvcmRlZCc7CiAgfSwgMjAwMCk7CgogIC8vIFF1ZXVlIGJpYiBlbnRyeSDigJQgYnV0IHRyeSBPQ1IgZmlyc3Qgd2l0aCBhdXRvLWNvbmZpcm0KICBiaWJQZW5kaW5nUXVldWUucHVzaCh7IGtleSwgcGxhY2UsIGVsYXBzZWQsIGF1dG9EZXRlY3RlZDogdHJ1ZSB9KTsKICBpZiAoIWJpYlBlbmRpbmdLZXkpIHNob3dOZXh0QmliKCk7Cn0KCmZ1bmN0aW9uIHhjRGV0ZWN0QmVlcCgpIHsKICB0cnkgewogICAgY29uc3QgYWMgID0gbmV3ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpKCk7CiAgICBjb25zdCBvc2MgPSBhYy5jcmVhdGVPc2NpbGxhdG9yKCk7CiAgICBjb25zdCBnICAgPSBhYy5jcmVhdGVHYWluKCk7CiAgICBvc2MuY29ubmVjdChnKTsgZy5jb25uZWN0KGFjLmRlc3RpbmF0aW9uKTsKICAgIG9zYy5mcmVxdWVuY3kudmFsdWUgPSA5MjA7CiAgICBvc2MudHlwZSA9ICdzaW5lJzsKICAgIGcuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLjM1LCBhYy5jdXJyZW50VGltZSk7CiAgICBnLmdhaW4uZXhwb25lbnRpYWxSYW1wVG9WYWx1ZUF0VGltZSgwLjAwMSwgYWMuY3VycmVudFRpbWUgKyAwLjI1KTsKICAgIG9zYy5zdGFydCgpOyBvc2Muc3RvcChhYy5jdXJyZW50VGltZSArIDAuMjUpOwogIH0gY2F0Y2goZSkge30KfQoKCgovLyDilIDilIAgQ1QgQWNjZXNzIEdhdGUg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSACmNvbnN0IENUX0FDQ0VTU19BUEkgPSAnaHR0cHM6Ly9jdC1hY2Nlc3MubHVja2RyYWdvbi5pbyc7CmNvbnN0IENUX0FDQ0VTU19LRVkgPSAnY3RfYWNjZXNzX3YxJzsKCmZ1bmN0aW9uIGN0R2V0QWNjZXNzKCkgewogIHRyeSB7CiAgICBjb25zdCByYXcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShDVF9BQ0NFU1NfS0VZKTsKICAgIGlmICghcmF3KSByZXR1cm4gbnVsbDsKICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKHJhdyk7CiAgICBpZiAoZGF0YS5leHBpcmVzICYmIERhdGUubm93KCkgPiBkYXRhLmV4cGlyZXMpIHsKICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oQ1RfQUNDRVNTX0tFWSk7CiAgICAgIHJldHVybiBudWxsOwogICAgfQogICAgcmV0dXJuIGRhdGE7CiAgfSBjYXRjaChlKSB7IHJldHVybiBudWxsOyB9Cn0KCmZ1bmN0aW9uIGN0U2V0QWNjZXNzKGRhdGEpIHsKICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShDVF9BQ0NFU1NfS0VZLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7Cn0KCmZ1bmN0aW9uIGN0U2hvd0FjY2Vzc0JhZGdlKGRhdGEpIHsKICBjb25zdCBleGlzdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdC1hY2Nlc3MtYmFkZ2UnKTsKICBpZiAoZXhpc3RpbmcpIGV4aXN0aW5nLnJlbW92ZSgpOwogIGNvbnN0IGJhZGdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7CiAgYmFkZ2UuaWQgPSAnY3QtYWNjZXNzLWJhZGdlJzsKICBiYWRnZS5zdHlsZS5jc3NUZXh0ID0gJ3RleHQtYWxpZ246Y2VudGVyO21hcmdpbi10b3A6NnB4O21hcmdpbi1ib3R0b206LTRweCc7CiAgY29uc3QgbGFiZWwgPSBkYXRhLnR5cGUgPT09ICdzc3AnID8gJ+KckyAnICsgKGRhdGEuc2Nob29sIHx8ICdTY2hvb2wgU3BvcnQgUG9ydGFsJykKICAgIDogZGF0YS50eXBlID09PSAnYW5udWFsJyA/ICfinJMgQW5udWFsIHVubGltaXRlZCBhY2Nlc3MnCiAgICA6ICfinJMgU2luZ2xlIGNhcm5pdmFsIGFjY2Vzcyc7CiAgYmFkZ2UuaW5uZXJIVE1MID0gJzxzcGFuIGNsYXNzPSJjdC1hY2Nlc3MtYmFkZ2UiPicgKyBsYWJlbCArICc8L3NwYW4+JzsKICBjb25zdCBidG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2NyZWVuLWhvbWUgLnN0YWNrIC5idG4tcHJpbWFyeScpOwogIGlmIChidG4pIGJ0bi5pbnNlcnRBZGphY2VudEVsZW1lbnQoJ2FmdGVyZW5kJywgYmFkZ2UpOwp9Cgpjb25zdCBfY3RPcmlnU2hvd1NjcmVlbiA9IHR5cGVvZiBzaG93U2NyZWVuID09PSAnZnVuY3Rpb24nID8gc2hvd1NjcmVlbiA6IG51bGw7CmNvbnN0IF9jdE9yaWdSZWYgPSB3aW5kb3cuc2hvd1NjcmVlbjsKCi8vIFdyYXAgc2hvd1NjcmVlbiB0byBpbnRlcmNlcHQgJ3NldHVwJwooZnVuY3Rpb24oKSB7CiAgY29uc3Qgb3JpZyA9IHdpbmRvdy5zaG93U2NyZWVuOwogIHdpbmRvdy5zaG93U2NyZWVuID0gZnVuY3Rpb24obmFtZSwgLi4uYXJncykgewogICAgaWYgKG5hbWUgPT09ICdzZXR1cCcpIHsKICAgICAgY29uc3QgYWNjZXNzID0gY3RHZXRBY2Nlc3MoKTsKICAgICAgaWYgKCFhY2Nlc3MpIHsKICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3QtcGF5d2FsbC1vdmVybGF5JykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7CiAgICAgICAgcmV0dXJuOwogICAgICB9CiAgICB9CiAgICByZXR1cm4gb3JpZy5jYWxsKHRoaXMsIG5hbWUsIC4uLmFyZ3MpOwogIH07Cn0pKCk7Cgphc3luYyBmdW5jdGlvbiBjdFN1Ym1pdENvZGUoKSB7CiAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3QtY29kZS1pbnB1dCcpOwogIGNvbnN0IGJ0biAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2N0LWNvZGUtc3VibWl0Jyk7CiAgY29uc3QgZXJyICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3QtY29kZS1lcnJvcicpOwogIGNvbnN0IGNvZGUgID0gKGlucHV0LnZhbHVlIHx8ICcnKS50cmltKCkudG9VcHBlckNhc2UoKTsKICBpZiAoIWNvZGUpIHsgZXJyLnRleHRDb250ZW50ID0gJ1BsZWFzZSBlbnRlciB5b3VyIGNvZGUuJzsgcmV0dXJuOyB9CiAgYnRuLmRpc2FibGVkID0gdHJ1ZTsgYnRuLnRleHRDb250ZW50ID0gJ0NoZWNraW5nLi4uJzsgZXJyLnRleHRDb250ZW50ID0gJyc7CiAgdHJ5IHsKICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChDVF9BQ0NFU1NfQVBJICsgJy92YWxpZGF0ZScsIHsKICAgICAgbWV0aG9kOiAnUE9TVCcsCiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LAogICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGNvZGUgfSkKICAgIH0pOwogICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3AuanNvbigpOwogICAgaWYgKGRhdGEudmFsaWQpIHsKICAgICAgY3RTZXRBY2Nlc3MoeyBjb2RlLCB0eXBlOiBkYXRhLnR5cGUsIHNjaG9vbDogZGF0YS5zY2hvb2wsIGV4cGlyZXM6IGRhdGEuZXhwaXJlcywgdW5sb2NrZWQ6IERhdGUubm93KCkgfSk7CiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjdC1wYXl3YWxsLW92ZXJsYXknKS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTsKICAgICAgY3RTaG93QWNjZXNzQmFkZ2UoZGF0YSk7CiAgICAgIHNob3dTY3JlZW4oJ3NldHVwJyk7CiAgICB9IGVsc2UgewogICAgICBlcnIudGV4dENvbnRlbnQgPSBkYXRhLmVycm9yIHx8ICdJbnZhbGlkIGNvZGUuIFBsZWFzZSB0cnkgYWdhaW4uJzsKICAgIH0KICB9IGNhdGNoKGUpIHsKICAgIGVyci50ZXh0Q29udGVudCA9ICdDb25uZWN0aW9uIGVycm9yLiBQbGVhc2UgdHJ5IGFnYWluLic7CiAgfSBmaW5hbGx5IHsgYnRuLmRpc2FibGVkID0gZmFsc2U7IGJ0bi50ZXh0Q29udGVudCA9ICdVbmxvY2snOyB9Cn0KCmZ1bmN0aW9uIGN0VHJhY2tDbGljayh0eXBlKSB7IGNvbnNvbGUubG9nKCdDVCBwdXJjaGFzZSBjbGljazonLCB0eXBlKTsgfQoKZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkgewogIGNvbnN0IGFjY2VzcyA9IGN0R2V0QWNjZXNzKCk7CiAgaWYgKGFjY2VzcykgY3RTaG93QWNjZXNzQmFkZ2UoYWNjZXNzKTsKICBjb25zdCBpbnAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY3QtY29kZS1pbnB1dCcpOwogIGlmIChpbnApIHsKICAgIGlucC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSkgeyBpZiAoZS5rZXkgPT09ICdFbnRlcicpIGN0U3VibWl0Q29kZSgpOyB9KTsKICAgIGlucC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uKCkgewogICAgICBjb25zdCBwb3MgPSB0aGlzLnNlbGVjdGlvblN0YXJ0OwogICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZS50b1VwcGVyQ2FzZSgpLnJlcGxhY2UoL1teQS1aMC05LV0vZywgJycpOwogICAgICB0aGlzLnNldFNlbGVjdGlvblJhbmdlKHBvcywgcG9zKTsKICAgIH0pOwogIH0KfSk7Cgo8L3NjcmlwdD4K";
    if (request.method === "GET") {
      const html = new TextDecoder().decode(Uint8Array.from(atob(INDEX_HTML_B64), c => c.charCodeAt(0)));
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
          "X-Frame-Options": "DENY",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }
    return new Response("Not found", { status: 404, headers: cors });
  }
};
function j(obj) {
  return JSON.stringify(obj);
}
__name(j, "j");
__name2(j, "j");
function getAt(obj, path) {
  if (!path) return obj;
  return path.split("/").reduce((o, k) => o == null ? void 0 : o[k], obj);
}
__name(getAt, "getAt");
__name2(getAt, "getAt");
function setAt(obj, path, value) {
  if (!path) return value;
  const keys = path.split("/");
  const result = deepClone(obj) || {};
  let curr = result;
  for (let i = 0; i < keys.length - 1; i++) {
    curr[keys[i]] = deepClone(curr[keys[i]]) || {};
    curr = curr[keys[i]];
  }
  curr[keys[keys.length - 1]] = value;
  return result;
}
__name(setAt, "setAt");
__name2(setAt, "setAt");
function stamp(val) {
  if (val == null || typeof val !== "object") return val;
  if (val[".sv"] === "timestamp") return Date.now();
  const out = Array.isArray(val) ? [] : {};
  for (const [k, v] of Object.entries(val)) out[k] = stamp(v);
  return out;
}
__name(stamp, "stamp");
__name2(stamp, "stamp");
function deepClone(val) {
  if (val == null || typeof val !== "object") return val;
  return JSON.parse(JSON.stringify(val));
}
__name(deepClone, "deepClone");
__name2(deepClone, "deepClone");
export {
  CarnivalRoom,
  worker_default as default
};
