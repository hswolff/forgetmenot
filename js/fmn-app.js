$(function() {

	// Stats Template
	fmn.StatsView = Backbone.View.extend({
		el: $('#stats'),
        template: _.template($('#stats-template').html()),

		initialize: function() {
			_.bindAll(this, 'render')
			fmn.Todos.bind('all', this.render);
		},
		
		render: function() {
			$(this.el).html(this.template({
				total: fmn.Todos.length,
				done: fmn.Todos.done().length
			}));
		}
	
	});

    fmn.App = Backbone.View.extend({
        el: $("#todoApp"),
        
        events: {
            'click #createNew' :       	'newTodo',
			'click #clearCompleted' : 	'clearCompleted'
        },
        
        initialize: function(bootstrap) {

        	fmn.todos = new fmn.Todos;

            Backbone.emulateJSON = true;
            _.bindAll(this, 'render', 'newTodo', 'addOne', 'addAll');
            fmn.Todos.bind('reset', this.addAll);
			fmn.Todos.bind('add', this.addOne);
			fmn.Todos.bind('add', function(model, collection){
				model.view.edit();
			});

			this.render();
        },

		render: function() {
			this.stats = new fmn.StatsView;
		},
		
		clearCompleted: function() {
			var remove = fmn.Todos.done();
			_.each(remove, function(todo){
				todo.destroy();
			});
		},

        addAll: function(collection, r) {
			// If collection is empty add one
			if(!collection.length) {
				var model = collection.create();
			}
            collection.each(this.addOne);
        },
        
        addOne: function(o, p) {
            var view = new fmn.TodoView({model:o.todo || o});
			this.$("#todoItemsList").append(view.render().el);
            return view;
        },

        newTodo: function(o) {
            fmn.Todos.create();
        }

    });

    // Run application
    fmn.app = new fmn.App;

});