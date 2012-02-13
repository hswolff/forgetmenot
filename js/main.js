require.config({
	baseUrl: "./js",
	paths: {
		'jquery': 'libs/jquery',
		'underscore': 'libs/underscore',
		'backbone': 'libs/backbone',
		'text': 'libs/text'
	}
});

require(['jquery', 
		'underscore', 
		'backbone', 
		'collection/todos', 
		'view/stats', 
		'view/todo',
		'view/todos'], 
function($, _, Backbone, Todos, StatsView, TodoView, TodosView) {

    var Routes = Backbone.Router.extend({
		routes: {
			'list/:list': 	"list"
		},

		initialize: function() {
			this.bind('route:list', function(a, b) {
				// console.log('hi', a,b);
			});
		},

		list: function(list) {
			fmn.app.collection.fetch({data: {list: list}});
		}
	});

    var App = Backbone.View.extend({
        el: $("#todoApp"),
        
        initialize: function(bootstrap) {

        	this.collection = new Todos;

            Backbone.emulateJSON = true;

            this.todosView = new TodosView;

			this.stats = new StatsView;
        }

    });

    // Run application
    var app = new App;

    app.todosView.collection.reset(json);

    // fmn.app.router = new fmn.Routes;
	// Backbone.history.start({pushState: false, root: '/forgetmenot/'});

	$(function() {
		if(!window.location.hash) {
			// fmn.app.router.navigate('list/1');
		}
	});
});