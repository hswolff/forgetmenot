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
		'view/todo'], 
function($, _, Backbone, Todos, StatsView, TodoView) {

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
        list: $("#todoItemsList", this.el), 
        
        events: {
            'click #createNew' :       	'newTodo',
			'click #clearCompleted' : 	'clearCompleted'
        },
        
        initialize: function(bootstrap) {

        	this.collection = new Todos;

            Backbone.emulateJSON = true;
            _.bindAll(this, 'render', 'newTodo', 'addOne', 'addAll');
            this.collection.bind('reset', this.addAll);
			this.collection.bind('add', this.addOne);
			this.collection.bind('add', function(model, collection){
				model.view.edit();
			});

			this.render();
        },

		render: function() {
			this.stats = new StatsView;
		},
		
		clearCompleted: function() {
			var remove = this.collection.done();
			_.each(remove, function(todo){
				todo.destroy();
			});
		},

        addAll: function(collection, r) {
        	this.list.empty();
			// If collection is empty add one
			if(!collection.length) {
				var model = collection.create();
			}
            collection.each(this.addOne);
        },
        
        addOne: function(o, p) {
            var view = new TodoView({model:o.todo || o});
			this.$("#todoItemsList").append(view.render().el);
            return view;
        },

        newTodo: function(o) {
            this.collection.create();
        }

    });

    // Run application
    var app = new App;

    app.collection.reset(json);

    // fmn.app.router = new fmn.Routes;
	// Backbone.history.start({pushState: false, root: '/forgetmenot/'});

	$(function() {
		if(!window.location.hash) {
			// fmn.app.router.navigate('list/1');
		}
	});
});