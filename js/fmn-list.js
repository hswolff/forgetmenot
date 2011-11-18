$(function() {
 
    fmn.Collection = Backbone.Collection.extend({
        model: fmn.Model,
		url: "fmn.php?",
		
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
			return this.filter(function(todo){ return todo.get('done') == 1; });
		},
		
        comparator: function(todo) {
			if (todo.get('id').length === 1) {
				return '0'+todo.get('id');
			} else {
				return todo.get('id');
			}
        }
    });
    
    fmn.Todos = new fmn.Collection;
	

});