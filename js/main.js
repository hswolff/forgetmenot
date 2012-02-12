require.config({
	baseUrl: "js",
	paths: {
		'jquery': 'libs/jquery',
		'underscore': 'libs/underscore',
		'backbone': 'libs/backbone',
		'text': 'libs/text',
		'wrap': 'libs/wrap'
	},
	wrapJS: {
		"underscore": {
			attach: "_"
		},
		"backbone": {
		  deps: ["underscore", "jquery"],
		  attach: "Backbone"
		}
	}
})

require(["jquery", 'wrap!underscore', 'wrap!backbone'], function($, _, Backbone) {
    console.log('hi', $, _, Backbone);
});