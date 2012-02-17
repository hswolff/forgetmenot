require.config({
	// priority: ['common', 'main'],
	paths: {
		'jquery': 'libs/jquery',
		'underscore': 'libs/underscore',
		'backbone': 'libs/backbone',
		'text': 'libs/text'
	}
});

require(['common',
		'jquery', 
		'underscore', 
		'backbone', 
		'collection/todos', 
		'view/stats', 
		'view/todoview',
		'view/todosview'], 
function(common, $, _, Backbone, Todos, StatsView, TodoView, TodosView) {

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

    	el: "#app",

    	events: {
    		'click #createNew' :       	'newTodo'
    	},
        
        initialize: function(bootstrap) {

            Backbone.emulateJSON = true;

            this.todos = new Todos(todos);
            this.todos.view = new TodosView(this.todos);

			this.stats = new StatsView(this.todos);
        },

        newTodo: function(o) {
            this.todos.create();
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