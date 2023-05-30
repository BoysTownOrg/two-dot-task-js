const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: { withMasks: "./jspsych/jatos/word-learning-in-masks-main.js" },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "with-masks.html",
      template: "jatos-template.html",
      chunks: ["withMasks"],
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
