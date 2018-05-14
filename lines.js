'use strict';

const stringLength = require('string-length');

class Lines {
  constructor() {
    this._line = '';
    this._lines = [];
  }

  write(str) {
    this._line += str;
    return this;
  }

  restartLine(column) {
    const line = this._line;
    const index = column + line.length - stringLength(line);
    this._line = line.padEnd(index).substring(0, index - 1);
    return this;
  }

  next() {
    this._lines.push(this._line);
    this._line = '';
    return this;
  }

  toString() {
    return this._lines.join('\n');
  }
}

module.exports = Lines;
