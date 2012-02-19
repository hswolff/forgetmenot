({
    appDir: "../",
    baseUrl: "js",
    dir: "../../forgetmenot-build",
    modules: [
        {
            name: 'common'
        },
        {
        	name: 'main',
        	exclude: ['common']
        }
    ],
    paths: {
        'jquery': 'libs/jquery',
        'underscore': 'libs/underscore',
        'backbone': 'libs/backbone',
        'text': 'libs/text'
    }
})