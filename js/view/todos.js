define(['jquery', 
		'underscore', 
		'backbone', 
		'collection/todos',
		'view/todo'], 
function($, _, Backbone, Todos, TodoView) {
	
	var TodosView = Backbone.View.extend({

        el: $("#todoItemsList"), 
        
        events: {
            'click #createNew' :       	'newTodo',
			'click #clearCompleted' : 	'clearCompleted'
        },
        
        initialize: function(bootstrap) {

        	this.collection = new Todos;

            _.bindAll(this, 'render', 'newTodo', 'addOne', 'addAll');
            this.collection.bind('reset', this.addAll);
			this.collection.bind('add', this.addOne);
			this.collection.bind('add', function(model, collection){
				model.view.edit();
			});

        },

		clearCompleted: function() {
			var remove = this.collection.done();
			_.each(remove, function(todo){
				todo.destroy();
			});
		},

        addAll: function(collection, r) {
        	$(this.el).empty();
			// If collection is empty add one
			if(!collection.length) {
				var model = collection.create();
			}
            collection.each(this.addOne);
        },
        
        addOne: function(o, p) {
            var view = new TodoView({model:o.todo || o});
			$(this.el).append(view.render().el);
            return view;
        },

        newTodo: function(o) {
            this.collection.create();
        }

    });
	
    return TodosView;
});