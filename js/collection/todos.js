define(['jquery', 
		'underscore', 
		'backbone', 
		'model/todo'], 
function($, _, Backbone, Todo) {
	
	var Todos = Backbone.Collection.extend({
        model: Todo,
		url: "api.php?",

		initialize: function() {
			this.model.bind('remove', function(model,collection) {
				// console.log(model, collection);
			});
		},
		
		getNext: function(todo) {
			var m = this.at(this.indexOf(todo) + 1);
			if (!m) {
				return todo;
			} else {
				return m;
			}
		},
		
		getPrevious: function(todo) {
			var m = this.at(this.indexOf(todo) - 1);
			if (!m) {
				return todo;
			} else {
				return m;
			}
		},
		
		done: function() {
			return this.filter(function(todo){ return todo.get('status') == 1; });
		},
		
        comparator: function(todo) {
			if (todo.get('id').length === 1) {
				return '0'+todo.get('id');
			} else {
				return todo.get('id');
			}
        }
    });

    return Todos;
});