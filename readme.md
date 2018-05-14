# Peludna prognoza :croatia: [![Build Status](https://travis-ci.com/vladimyr/peludna-prognoza.svg?branch=master)](https://travis-ci.com/vladimyr/peludna-prognoza) [![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg)](https://github.com/Flet/semistandard) [![npm package version](https://img.shields.io/npm/v/peludna-prognoza.svg)](https://npm.im/peludna-prognoza) [![github license](https://img.shields.io/github/license/vladimyr/peludna-prognoza.svg)](https://github.com/vladimyr/peludna-prognoza/blob/master/LICENSE)

>Fetch pollen measurement data for Croatian cities from your terminal

This CLI fetches data from [Pliva's allergies data API](http://www.plivazdravlje.hr/alergije/prognoza?xml2).

## Installation

```    
$ npm install -g peludna-prognoza
```

Or for a one-time run:

```    
$ npx peludna-prognoza
```

## Usage

```
$ peludna-prognoza --help

  peludna-prognoza v1.0.0

  Usage:
    $ peludna-prognoza [city]
    $ peludna-prognoza -c <city>

  Options:
    -c, --city     Select city                                         [string]
    -j, --json     Output data in JSON format                          [boolean]
    -j, --xml      Output data in XML format                           [boolean]
    -w, --web      Show data using web browser                         [boolean]
    -h, --help     Show help                                           [boolean]
    -v, --version  Show version number                                 [boolean]

  Homepage:     https://github.com/vladimyr/peludna-prognoza
  Report issue: https://github.com/vladimyr/peludna-prognoza/issues
```
