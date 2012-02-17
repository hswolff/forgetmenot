define(['jquery', 
		'underscore', 
		'backbone', 
		'collection/todos',
		'view/todo'], 
function($, _, Backbone, Todos, TodoView) {
	
	var TodosView = Backbone.View.extend({

        el: $("#todoItemsList"), 
        
        initialize: function(models) {
        	_.bindAll(this);

        	this.collection = new Todos(models);
        	this.addAll();
            
            this.collection.bind('reset', this.addAll);
			this.collection.bind('add', this.addOne);
        },

        addAll: function(collection, r) {
        	collection = collection || this.collection;
        	$(this.el).empty();
			// If collection is empty add one
			if(!collection.length) {
				var model = collection.create();
			}
            collection.each(this.addOne);
        },
        
        addOne: function(o, p) {
        	console.log('ooo', o,p)
            var view = new TodoView({model:o.todo || o});
            console.log(view, view.render().el)
			this.$el.append(view.render().el);
            return view;
        }

    });
	
    return TodosView;
});