'use strict';

const et = require('elementtree');
const { Element } = et;

const isDetailed = entries => entries.every(node => node.tag === 'plant');
const pascalCase = str => str[0].toUpperCase() + str.substring(1).toLowerCase();
const withLabel = (obj, label) => Object.assign(obj, { label });
const withReferences = obj => Object.assign(obj, { refs: getReferences(obj) });
const withXmlWritter = (obj, xmltree, attr = {}) => Object.assign(obj, {
  toXML(options = {}) {
    options.indent = options.indent || 2;
    const rootNode = xmltree.getroot();
    Object.keys(attr).forEach(key => rootNode.set(key, attr[key]));
    return xmltree.write(options).trim();
  }
});

const Level = {
  High: Symbol('high'),
  Moderate: Symbol('moderate'),
  Low: Symbol('low'),

  fromId(id) {
    const level = pascalCase(id.replace(/ALLERGY_INDICATOR_LEVEL_/, ''));
    return Level[level];
  }
};

const Type = {
  Combined: 'combined',
  Detailed: 'detailed'
};

module.exports = {
  Level,
  Type,
  parseCities,
  parsePollenData
};

function parseCities(xml) {
  const xmltree = et.parse(xml);
  const cities = xmltree.findall('.//city').map(node => ({
    name: node.findtext('./name'),
    url: node.findtext('./link')
  }));
  return withXmlWritter(cities, xmltree);
}

function parsePollenData(xml) {
  const xmltree = et.parse(xml);
  const entries = xmltree.getroot().getchildren();
  if (isDetailed(entries)) {
    const data = entries.map(node => ({
      id: parseInt(node.get('id'), 10),
      name: node.findtext('./name'),
      records: parseDaily(node.find('./daily'))
    }));
    const result = { type: Type.Detailed, data };
    return withXmlWritter(withReferences(result), xmltree, { type: result.type });
  }

  const tree = withLabel(parseCategory(xmltree.find('./tree')), 'Drveće');
  const grass = withLabel(parseCategory(xmltree.find('./grass')), 'Trava');
  const weed = withLabel(parseCategory(xmltree.find('./weed')), 'Korovi');
  const data = { tree, weed, grass };
  const result = { type: Type.Combined, data };
  return withXmlWritter(withReferences(result), xmltree, { type: Type.Combined });
}

function parseCategory(category) {
  category = category || new Element();
  return {
    records: parseDaily(category.find('./daily')),
    prevalent: parsePrevalent(category.find('./prevails'))
  };
}

function parseDaily(days) {
  days = days || new Element();
  return days.findall('./day').map(node => parseData(node));
}

function parseData(day) {
  day = day || new Element();
  const date = day.findtext('./date');
  const type = day.findtext('./type');
  const level = day.find('./level') || day.find('./value');
  const value = parseValue(day.find('./value'));

  const data = {
    date,
    level: {
      id: level.get('id'),
      value: Level.fromId(level.get('id')),
      label: level.text
    }
  };
  if (value) data.value = value;
  if (type) data.type = type;
  return data;
}

function parseValue(value) {
  if (!value || value.get('id')) return null;
  return parseFloat(value.text);
}

function parsePrevalent(prevalent) {
  prevalent = prevalent || new Element();
  return prevalent.getchildren().map(node => ({
    id: parseInt(node.get('id'), 10),
    name: node.text
  }));
}

function getReferences({ type, data }) {
  const sortById = (a, b) => a.id > b.id;
  if (type === Type.Detailed) {
    return data.map(({ id, name }) => ({ id, name })).sort(sortById);
  }
  return [
    ...data.tree.prevalent,
    ...data.weed.prevalent,
    ...data.grass.prevalent
  ].sort(sortById);
}
