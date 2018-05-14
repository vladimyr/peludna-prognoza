'use strict';

const { Level, Type } = require('./parser');
const chalk = require('chalk');
const Table = require('cli-table');

const formatter = {
  [Level.High]: chalk.red.bold,
  [Level.Moderate]: chalk.yellow.bold,
  [Level.Low]: chalk.green.bold
};

const formatDate = date => {
  const [, m, d] = date.split('-');
  return `${d}.${m}.`;
};
const times = (n, cb) => Array.from({ length: n }, cb);

module.exports = function print({ type, data }) {
  if (type === Type.Combined) return printCombined(data);
  data.forEach(entry => printTable(entry));
};

function printCombined({ tree, grass, weed }) {
  printTable(tree);
  printTable(grass);
  printTable(weed);
}

function printTable({ label, name, records }) {
  const title = label || name;
  const head = [chalk.bold.blue(title), ...times(records.length, () => '')];
  const dates = records.map(it => formatDate(it.date));
  const values = records.map(it => formatLevel(it.level, it.value));
  const table = new Table({ head });
  table.push(
    { [chalk.reset('Datum')]: dates },
    { [chalk.reset('Koncentracija')]: values }
  );
  console.log(table.toString());
}

function formatLevel(level, value) {
  let str = '● ';
  str += level.label;
  if (value) str += ` (${value})`;
  const format = formatter[level.value];
  if (format) return format(str);
  return str;
}
