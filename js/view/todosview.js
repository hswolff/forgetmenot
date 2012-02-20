define(['jquery', 
		'underscore', 
		'backbone', 
		'collection/todos',
		'view/todoview'], 
function($, _, Backbone, Todos, TodoView) {
	
	var TodosView = Backbone.View.extend({

		el: "#todoItemsList",
		
		initialize: function(collection) {
			_.bindAll(this, 'addTodo');

			// this.addAll(collection);
			this.$el.empty();
			// If collection is empty add one
			if(!collection.length) {
				collection.create();
			}
			collection.each(this.addTodo);
			
			collection.bind('add', this.addTodo);

			collection.bind('change', function(model, attr) {
				model.view.$el.addClass('syncing');
			});
			collection.bind('sync', function(model, attr) {
				model.view.$el.removeClass('syncing');
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