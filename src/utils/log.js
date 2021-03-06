const DEBUG = 2;
const INFO = 1;
const ERROR = 0;

const level = INFO;

export function debug(...args) {
  if (level >= DEBUG) {
    console.log(...args);
  }
}

export function info(...args) {
  if (level >= INFO) {
    console.info(...args);
  }
}

export function error(...args) {
  if (level >= ERROR) {
    console.error(...args);
  }
}
