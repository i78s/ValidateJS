var path = require("path");
var nodeModulesPath = path.join(__dirname, 'node_modules');

module.exports = {
  entry: {
    app: './docs/app.ts'
  },
  output: {
    path: path.join(__dirname, 'docs'),
    filename: "[name].js"
  },
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