process.env.NODE_ENV = process.platform;
process.env.NODE_PATH = require('path').resolve(__dirname, '..', 'src');
require('module').Module._initPaths();
