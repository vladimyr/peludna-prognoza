#!/usr/bin/env node

'use strict';

const { getCities, getPollenData } = require('./client');
const { prompt } = require('inquirer');
const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const name = require('path').basename(process.argv[1]);
const pkg = require('./package.json');
const print = require('./printer');

const flag = (argv, short, long) => ({ [long]: argv[short] || argv[long] });
const jsonify = obj => JSON.stringify(obj, null, 2);
const normalize = str => removeDiacritics(str.toLowerCase().trim());
const compare = (str1, str2) => normalize(str1) === normalize(str2);

const help = chalk`
  {bold ${name}} v${pkg.version}

  Usage:
    $ ${name} [city]
    $ ${name} -c <city>

  Options:
    -c, --city     Select city                                         [string]
    -j, --json     Output data in JSON format                          [boolean]
    -x, --xml      Output data in XML format                           [boolean]
    -h, --help     Show help                                           [boolean]
    -v, --version  Show version number                                 [boolean]

  Homepage:     {green https://github.com/vladimyr/peludna-prognoza}
  Report issue: {green https://github.com/vladimyr/peludna-prognoza/issues}
`;

program().catch(err => { throw err; });

async function program(options = getOptions(argv)) {
  const {
    version: showVersion,
    help: showHelp,
    json: outputJson,
    xml: outputXml
  } = options;

  if (showVersion) return console.log(pkg.version);
  if (showHelp) return console.log(help);

  const cities = await getCities();
  const city = options.city || await selectCity(cities);
  const { url } = cities.find(({ name }) => compare(name, city)) || {};
  if (!url) {
    const msg = chalk`Odabrani grad nije pronadjen: {blue ${city}}`;
    console.error(chalk`{bgRed.whiteBright Error} ${msg}`);
    process.exit();
  }
  const data = await getPollenData(url);
  if (outputJson) return console.log(jsonify(data, null, 2));
  if (outputXml) return console.log(data.toXML());
  return print(data);
}

function getOptions(argv) {
  const options = {
    ...flag(argv, 'c', 'city'),
    ...flag(argv, 'j', 'json'),
    ...flag(argv, 'x', 'xml'),
    ...flag(argv, 'h', 'help'),
    ...flag(argv, 'v', 'version')
  };
  options.city = options.city || argv._[0];
  return options;
}

async function selectCity(cities) {
  const { city } = await prompt([{
    type: 'list',
    name: 'city',
    message: 'Select city',
    choices: cities
  }]);
  return city;
}

const replacements = [
  [/[čć]/g, 'c'],
  [/dž/g, 'dz'],
  [/đ/g, 'dj'],
  [/š/g, 's'],
  [/ž/g, 'z']
];

function removeDiacritics(str) {
  return replacements.reduce((acc, [pattern, replacement]) => {
    acc = acc.replace(pattern, replacement);
    return acc;
  }, str);
}
