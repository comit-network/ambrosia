/* eslint-disable @typescript-eslint/no-var-requires */

require('@babel/register');

module.exports = require('./webpack.config.renderer.dev.babel').default;
