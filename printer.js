'use strict';

const { bullet, pointerSmall } = require('figures');
const { Level, Type } = require('./parser');
const chalk = require('chalk');
const Table = require('cli-table');

const formatter = {
  [Level.High]: chalk.red.bold,
  [Level.Moderate]: chalk.yellow.bold,
  [Level.Low]: chalk.green.bold
};

const columns = (col, def) => col.length > 0 ? col : def;
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
  printPrevalent(tree);
  printTable(grass);
  printPrevalent(grass);
  printTable(weed);
  printPrevalent(weed);
}

function printTable({ label, name, records }) {
  const title = label || name;
  const head = [chalk.bold.blue(title), ...times(Math.max(records.length, 1), () => '')];
  const dates = records.map(it => formatDate(it.date));
  const values = records.map(it => formatLevel(it.level, it.value));
  const table = new Table({ head });
  table.push(
    { [chalk.reset('Datum')]: columns(dates, '') },
    { [chalk.reset('Koncentracija')]: columns(values, chalk.magenta('nema podataka')) }
  );
  console.log(table.toString());
}

function printPrevalent({ prevalent }) {
  if (prevalent.length <= 0) return console.log();
  console.log('', chalk.underline('Prevladava pelud:'));
  prevalent.forEach(({ name }) => console.log('', pointerSmall, name));
  console.log();
}

function formatLevel(level, value) {
  let str = bullet + ' ';
  str += level.label;
  if (value) str += ` (${value})`;
  const format = formatter[level.value];
  if (format) return format(str);
  return str;
}
