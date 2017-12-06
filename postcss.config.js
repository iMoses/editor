module.exports = {
    plugins: [
        require('autoprefixer')({browsers: ['last 2 Chrome versions']}),
        require('postcss-merge-longhand'),
        require('postcss-merge-rules')
    ]
};
