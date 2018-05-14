'use strict';

const chalk = require('chalk');
const lines = str => str.split('\n').filter(line => line.length > 0);

module.exports = lines(chalk`
 {bold.yellow _,-._}
{bold.yellow / \\}{whiteBright _}{bold.yellow / \\}  {bold.red _,-._}
{bold.yellow >-}{whiteBright (_)}{bold.yellow -<} {bold.red / \\}{whiteBright _}{bold.red / \\}
{bold.yellow \\_/ \\_/} {bold.red >-}{whiteBright (_)}{bold.red -<}
  {bold.yellow \`-'}   {bold.red \\_/ \\_/}
          {bold.red \`-'}
`);
