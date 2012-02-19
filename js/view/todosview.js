define(['jquery', 
		'underscore', 
		'backbone', 
		'collection/todos',
		'view/todoview'], 
function($, _, Backbone, Todos, TodoView) {
	
	var TodosView = Backbone.View.extend({

		el: "#todoItemsList",
		
		initialize: function(collection) {
			_.bindAll(this);

			// this.addAll(collection);
			this.$el.empty();
			// If collection is empty add one
			if(!collection.length) {
				collection.create();
			}
			collection.each(this.addTodo);
			
			collection.bind('add', this.addTodo);
			collection.bind('add', function(model, collection){
				// model.view.edit();
			});
		},
		
		addTodo: function(o, p) {
			var view = new TodoView({model:o.todo || o});
			this.$el.append(view.render().el);
			return view;
		}

	});
	
	return TodosView;
});