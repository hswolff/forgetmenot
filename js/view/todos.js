define(['jquery', 
		'underscore', 
		'backbone', 
		'collection/todos',
		'view/todo'], 
function($, _, Backbone, Todos, TodoView) {
	
	var TodosView = Backbone.View.extend({

        el: "#todoItemsList",
        
        initialize: function(collection) {
        	_.bindAll(this);

        	this.addAll(collection);
            
            collection.bind('reset', this.addAll);
			collection.bind('add', this.addOne);
            collection.bind('add', function(model, collection){
                model.view.edit();
            });
        },

        addAll: function(collection, r) {
        	this.$el.empty();
			// If collection is empty add one
			if(!collection.length) {
				var model = collection.create();
			}
            collection.each(this.addOne);
        },
        
        addOne: function(o, p) {
            var view = new TodoView({model:o.todo || o});
			this.$el.append(view.render().el);
            return view;
        }

    });
	
    return TodosView;
});