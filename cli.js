#!/usr/bin/env node

'use strict';

const { getCities, getPollenData } = require('./client');
const { URL } = require('url');
const argv = require('minimist')(process.argv.slice(2));
const chalk = require('chalk');
const diacritics = require('diacritics');
const flowers = require('./flowers');
const fuzzysearch = require('fuzzysearch');
const inquirer = require('inquirer');
const Lines = require('./lines');
const opn = require('opn');
const pkg = require('./package.json');
const print = require('./printer');
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

const flag = (argv, short, long) => ({ [long]: (short && argv[short]) || argv[long] });
const jsonify = obj => JSON.stringify(obj, null, 2);
const removeDiacritics = str => diacritics.remove(str.replace(/đ/g, 'dj'));
const normalize = str => removeDiacritics(str.toLowerCase().trim());
const compare = (str1, str2) => normalize(str1) === normalize(str2);

const name = Object.keys(pkg.bin)[0];
const help = chalk`
  {bold ${name}} v${pkg.version}

  Usage:
    $ ${name} [city]
    $ ${name} -c <city>

  Options:
    -c, --city     Select city                                         [string]
    -j, --json     Output data in JSON format                          [boolean]
    -x, --xml      Output data in XML format                           [boolean]
    -w, --web      Show data using web browser                         [boolean]
    -h, --help     Show help                                           [boolean]
    -v, --version  Show version number                                 [boolean]

  Homepage:     {green ${pkg.homepage}}
  Report issue: {green ${pkg.bugs.url}}
`;

program().catch(err => { throw err; });

async function program(options = getOptions(argv)) {
  const {
    version: showVersion,
    help: showHelp,
    web: openBrowser,
    json: outputJson,
    xml: outputXml
  } = options;

  if (showVersion) return console.log(pkg.version);
  if (showHelp) return outputHelp(help, flowers);

  const cities = await getCities();
  const city = options.city ? { name: options.city } : await selectCity(cities);
  let url;
  if (city.url) ({ url } = city);
  else ({ url } = cities.find(({ name }) => compare(name, city.name)) || {});
  if (!url) {
    const msg = chalk`Odabrani grad nije pronadjen: {blue ${city.name}}`;
    console.error(chalk`{bgRed.whiteBright Error} ${msg}`);
    process.exit(1);
  }
  if (openBrowser) return opn(webpage(url));
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
    ...flag(argv, 'w', 'web'),
    ...flag(argv, 'h', 'help'),
    ...flag(argv, 'v', 'version')
  };
  options.city = options.city || argv._.join(' ');
  return options;
}

async function selectCity(cities) {
  cities = cities.map(city => {
    city.value = city;
    city.normalizedName = normalize(city.name);
    return city;
  });
  const { city } = await inquirer.prompt([{
    type: 'autocomplete',
    name: 'city',
    message: 'Select city',
    pageSize: 10,
    source: async (_, input) => {
      if (!input) return cities;
      const needle = normalize(input);
      return cities.filter(city => fuzzysearch(needle, city.normalizedName));
    }
  }]);
  return city;
}

function outputHelp(help, logo, margin = 66) {
  const output = new Lines();
  help.split('\n').forEach((line, row) => {
    output.write(line);
    const logoLine = logo[row];
    if (!logoLine) return output.next();
    output.restartLine(margin).write(logoLine);
    output.next();
  });
  console.log(output.toString());
}

function webpage(url) {
  const urlObj = new URL(url);
  urlObj.search = '';
  return urlObj.href;
}
