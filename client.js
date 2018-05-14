'use strict';

const { parseCities, parsePollenData } = require('./parser');
const r = require('got');
const urlJoin = require('url-join');

const baseUrl = 'http://www.plivazdravlje.hr/alergije/';

module.exports = {
  getCities,
  getPollenData
};

async function getCities() {
  const url = urlJoin(baseUrl, '/prognoza?xml2');
  const { body } = await r.get(url);
  return parseCities(body);
}

async function getPollenData(url) {
  const { body } = await r.get(url);
  return parsePollenData(body);
}
