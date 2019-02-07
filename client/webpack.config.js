let path = require("path");

let config = {
  entry: "./src/index.jsx",
  output: {
    path: path.resolve(__dirname, "../server/dist"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".js", ".json", ".jsx", ".css"]
  },
  module: {
    rules: [
      {
        test: /\.js|\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"]
          }
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "../server/dist")
  }
};

module.exports = (env, argv) => {
  if (!argv.mode) {
    config.mode = "development";
  }

  return config;
};
