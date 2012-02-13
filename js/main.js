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

    	events: {
    		'click #createNew' :       	'newTodo',
    		'click #clearCompleted' : 	'clearCompleted'
    	},

        el: $("#todoApp"),
        
        initialize: function(bootstrap) {

            Backbone.emulateJSON = true;

            _.bindAll(this);

            this.todosView = new TodosView;

            this.todosView.collection.reset(json);

            // Set up Stats View
			this.stats = new StatsView;

			this.todosView.collection.bind('change:status', _.bind(function(model, status) {
				this.stats.render(model.collection.length, model.collection.done().length);
            }, this));

            this.stats.render(this.todosView.collection.length, this.todosView.collection.done().length);
        },

        newTodo: function(o) {
            this.todosView.collection.create();
        },

        clearCompleted: function() {
			var remove = this.todosView.collection.done();
			_.each(remove, function(todo){
				todo.destroy();
			});
		}

    });

    // Run application
    var app = new App;    

    // fmn.app.router = new fmn.Routes;
	// Backbone.history.start({pushState: false, root: '/forgetmenot/'});

	$(function() {
		if(!window.location.hash) {
			// fmn.app.router.navigate('list/1');
		}
	});
});