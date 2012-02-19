define(['jquery', 
		'underscore', 
		'backbone', 
		'model/todo'], 
function($, _, Backbone, Todo) {
	
	var Todos = Backbone.Collection.extend({
		model: Todo,
		url: "api.php?",

		initialize: function() {
			
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
		}
		
	});

	return Todos;
});