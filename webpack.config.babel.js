import ExtractTextPlugin from 'extract-text-webpack-plugin';
import webpack from 'webpack';
import path from 'path';
import fs from 'fs';

const babelrc = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '.babelrc'), 'utf-8')
);
babelrc.presets[0] = ['es2015', {modules: false}];

export const paths = {
    public: path.resolve(__dirname, 'public'),
    client: path.resolve(__dirname, 'src/client'),
    shared: path.resolve(__dirname, 'src/shared'),
    js:     path.resolve(__dirname, 'public/js'),
    css:    path.resolve(__dirname, 'public/css'),
};

const includePaths = [
    paths.client,
    paths.shared,
];

export const loaders = {
    babel: {
        loader: 'babel-loader',
        options: {
            babelrc: false,
            ...babelrc,
        },
    },
    css: 'css-loader',
    cssModules: {
        loader: 'css-loader',
        query: {
            modules: true,
            camelCase: true,
            localIdentName: '[path]--[name]--[local]',
        }
    },
    postcss: {
        loader: 'postcss-loader',
    },
    sass: {
        loader: 'sass-loader',
        query: {includePaths},
    },
    style: 'style-loader',
};

export default [{

    entry: [
        'react-hot-loader/patch',
        './src/client/index.js'
    ],

    output: {
        filename: 'editor.js',
        path: paths.js,
        publicPath: '/js/',
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [loaders.babel]
            },
            {
                test: /\.scss$/,
                exclude: /styles/,
                use: [
                    loaders.style,
                    loaders.cssModules,
                    loaders.postcss,
                    loaders.sass,
                ]
            },
            {
                test: /\.scss$/,
                include: /styles/,
                use: [
                    loaders.style,
                    loaders.css,
                    loaders.postcss,
                    loaders.sass,
                ]
            }
        ]
    },

    plugins: [
        new webpack.NamedModulesPlugin,
        new webpack.HotModuleReplacementPlugin,
    ],

    resolve: {
        modules: includePaths.concat('node_modules'),
        symlinks: false,
    },

    performance: {
        hints: false
    },

    devtool: 'source-map',

    devServer: {
        port: 3417,
        hot: true,
        noInfo: true,
        contentBase: paths.public,
        publicPath: '/',
        // proxy: {
        //     '*': 'http://localhost:8200/'
        // }
    }

}, {

    entry: './src/client/styles/index.scss',

    output: {
        filename: 'style.css',
        path: paths.css,
        publicPath: '/css/'
    },

    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        loaders.css,
                        loaders.postcss,
                        loaders.sass,
                    ],
                })
            }
        ]
    },

    resolve: {
        modules: includePaths.concat('node_modules'),
    },

    plugins: [
        new ExtractTextPlugin({
            filename: 'style.css',
            disable: false
        }),
    ],

}];
