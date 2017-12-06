module.exports = {
    webpack: {
        loaders: {
            cssModules: {
                query: {
                    localIdentName: '[hash:base64:4]',
                }
            },
        },
    },
};
