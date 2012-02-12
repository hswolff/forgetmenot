$(function() {
    // Global namespace
	window.fmn = {};
	
    fmn.Todo = Backbone.Model.extend({
        defaults: {
            name: "new empty todo",
            list_id: 1,
            parent_id: 0,
            position: 0,
            status: 0
        },
        
        initialize: function() {
            if (!this.get("name")) {
              this.set({"name": this.defaults.name});
            }
        },

		done: function() {
		    if (this.get("status") == 0) {
		        this.save({status: 1});
		    } else {
		        this.save({status: 0});
		    }
			
		},

    });

    // Each Individual Todo Item View
    fmn.TodoView = Backbone.View.extend({
        tagName: "li",
        template: _.template($('#item-template').html()),
        
        events: {
            "dblclick .display .name" : 			"edit",
			"click input.done" : 					"toggleDone",
            "click .display .delete" :  			"destroyTodo",
			"keydown .edit input" : 				"keyboardActions"       
        },
        
        initialize: function() {
            _.bindAll(this, 'render', 'deleteTodo', 'close','save', 'keyboardActions');
            this.bind('close', this.render);
			this.model.bind('change:done', this.render);			
			this.model.bind('destroy', this.deleteTodo);
            this.model.view = this;
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
			this.el.className = 'todo indent-' + this.model.get('indent');
            this.input = this.$(".input");
            this.input.bind('blur', this.close);
            return this;
        },
        
        edit: function() {
            var name = this.model.get('name');
            $(this.el).addClass("editing");
            this.input.val(name);
            this.input.focus();
        },
        
        save: function(indent) {
			var $inputVal = this.input.val();
            this.model.save({ 
				name: ($inputVal == '' ? this.model.defaults.name : $inputVal)
				// indent: parseInt(this.model.get('indent') + (indent ? indent : ''))
			});
        },

		close: function() {
			this.save();
			$(this.el).removeClass("editing");
			this.trigger('close');
		},
		
		destroyTodo: function() {
			this.model.destroy();
		},
        
        deleteTodo: function() {
            this.remove();
        },
        
        keyboardActions: function(e) {
	
			// Enter button
			if (e.keyCode == 13) {
				this.close();
				fmn.app.newTodo();
				return;
				var nextModel = fmn.Todos.getNext(this.model);
				if (this.model === nextModel) {
					fmn.app.newTodo();
				} else {
					nextModel.view.edit();
				}
				e.preventDefault();
			}
			
			// Tab key - move todo to right one
			// And make sub todo of parent (if it exists)
			if (e.keyCode == 9 && !e.shiftKey) {
				e.preventDefault();
			}
			
			// Shift + Tab key - move todo to left one
			// And un-sub it from parent (if it exists)
			if (e.shiftKey && e.keyCode == 9) {
				e.preventDefault();
			}

			// Up key - close current todo and open todo above to edit
			if (e.keyCode == 38) {
				this.close();
				fmn.Todos.getPrevious(this.model).view.edit();
			}
			
			// Down key - close current todo and open todo above to edit
			if (e.keyCode == 40) {
				this.close();
				fmn.Todos.getNext(this.model).view.edit();
			}
			
			// Backspace key
			if (e.keyCode == 8) {
				if (this.input.val() == '') {
					e.preventDefault();
				}
			}
			
        },

		toggleDone: function() {
			this.model.done();
		}
    });


    fmn.Todos = Backbone.Collection.extend({
        model: fmn.Todo,
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

});