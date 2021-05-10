const merge = require("webpack-merge");
const baseConfig = require("@mendix/custom-widgets-utils-internal/configs/webpack.config.dev");

const customConfig = {
    module: {
        rules: [
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: "url-loader"
            }
        ]
    }
};

module.exports = [merge(baseConfig[0], customConfig), merge(baseConfig[1], customConfig)];
