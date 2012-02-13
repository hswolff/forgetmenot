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
    mainConfigFile: './main.js'
})