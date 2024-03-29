const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    withMasks: "./jspsych/jatos/word-learning-in-masks-main.ts",
    default: "./jspsych/jatos/word-learning-main.ts",
    exp1b: "./jspsych/jatos/word-learning-in-noise-1b.ts",
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
    new HtmlWebpackPlugin({
      filename: "1b.html",
      template: "jatos-template.html",
      chunks: ["exp1b"],
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.wav$/i,
        type: "asset/resource",
      },
      {
        test: /\.xlsx$/i,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
