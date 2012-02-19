require.config({
    priority: ['common', 'main'],
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
		'view/todoview',
		'view/todosview'], 
function($, _, Backbone, Todos, StatsView, TodoView, TodosView) {

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
    new App;    

});