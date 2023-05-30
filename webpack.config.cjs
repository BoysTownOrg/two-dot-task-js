const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    withMasks: "./jspsych/jatos/word-learning-in-masks-main.js",
    default: "./jspsych/jatos/word-learning-main.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "with-masks.html",
      template: "jatos-template.html",
      chunks: ["withMasks"],
    }),
    new HtmlWebpackPlugin({
      filename: "default.html",
      template: "jatos-template.html",
      chunks: ["default"],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
