var path = require("path");
var nodeModulesPath = path.join(__dirname, 'node_modules');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [
      path.join(__dirname, 'src'),
      'node_modules'
    ]
  },
    module: {
        loaders: [
            { test: /\.ts/, exclude: /node_modules|test/, loaders: ['ts-loader']}
        ]
    }
};