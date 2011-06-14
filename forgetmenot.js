$(document).ready(function() {
    
    window.Todo = Backbone.Model.extend({
        //Default Attributes
        defaults: {
            content: "new empty todo",
            parent: 0,
			children: 0,
            indent: 0,
            order: 0,
            done: false
        },
        
        initialize: function() {
            if (!this.get("content")) {
              this.set({"content": this.defaults.content});
            }
        },

		done: function() {
			this.save({done: !this.get("done")});
		},
		
		setParent: function(parentTodo) {
			if(!parentTodo) {
				return false;
			}
			this.save({parent: parentTodo.id});
			return true;
		}
    });
    
    window.TodoList = Backbone.Collection.extend({
        model: Todo,
        localStorage: new Store("forgetmenot"),
        
        nextOrder: function() {
            if (this.length === 0) {
                return 1;
            } else {
                return this.last().get('order') + 1;
            }
        },

		thoseWithParentOf: function(parentId) {
			return _.select(this.models, function(model) {
				return model.get('parent') == parentId;
			});
		},
        
        comparator: function(todo) {
          return todo.get('order');
        },
		
		// Get's passed current todo
		// Returns parent todo
		// Checking to make sure the
		// correct parent todo is returned
		getParentTodo: function(todo, previousTodo) {
			var previousTodo = this.at(_.indexOf(Todos.models, (previousTodo ? previousTodo : todo)) - 1);
			if (!previousTodo) {
				return false;
			} else if (todo.get('indent') == previousTodo.get('indent')) {
				return (previousTodo ? previousTodo : NaN);
			} else {
				return this.getParentTodo(todo, previousTodo);
			}
			
		},
		
		// Gets passed current todo
		// Sets current todo's parent todo Id correctly
		setParentTodo: function(todo) {
			todo.get('order');
			var previousTodo = this.getPreviousTodo(todo);
			if (previousTodo.get('parent') == '0') {
				todo.setParent(previousTodo);
			}
		},
		
		// Passed in current todo
		// Returns next todo item
		// Based off of todo's 'order' attribute
		getNextTodo: function(todo) {
			return this.at(_.indexOf(Todos.models, todo) + 1);
		},
		
		// Passed in current todo
		// Returns previous todo item
		// Based off of todo's 'order' attribute
		getPreviousTodo: function(todo) {
			return this.at(_.indexOf(Todos.models, todo) - 1)
		}
		
    });
    
    window.Todos = new TodoList;


    // Each Individual Todo Item View
    window.TodoView = Backbone.View.extend({
        tagName: "li",
        id: "todo-",
        className: "todo",
        template: _.template($('#item-template').html()),
        
        events: {
            "dblclick .display .content"        :      	"edit",
            "click .display .content:hover"        :      	"edit",
            "keydown .edit input"              :      	"keyboardActions",
			"click input.done"  			    : 		"toggleDone",
            "click .display .delete"					   : 	    "deleteTodo"            
        },
        
        initialize: function() {
            _.bindAll(this, 'render', 'deleteTodo', 'close','save', 'keyboardActions');
            this.model.bind('change', this.render);
            this.el.id += this.model.get("id");
			this.el.className += ' indent-' + this.model.get('indent');
            // Give reverse access to a model's view by setting its 'this' 
            // to a new attribute on the model
            this.model.view = this;
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.input = this.$(".input");
            this.input.bind('blur', this.close);
            return this;
        },
        
        edit: function() {
            var content = this.model.get('content');
            $(this.el).addClass("editing");
            this.input.val(content);
            this.input.focus();
            //return false;
        },
        
        save: function(indent) {
			var $inputVal = this.input.val();
            this.model.save({ 
				content: ($inputVal == '' ? this.model.defaults.content : $inputVal),
				indent: this.model.get('indent') + (indent ? indent : 0)
			});
        },

		close: function() {
			this.save();
			$(this.el).removeClass("editing");
		},
        
        deleteTodo: function() {
            this.model.destroy();
            this.remove();
        },
        
        keyboardActions: function(e) {
			/**
				left arrow		37
				up arrow		38
				right arrow		39
				down arrow		40
			**/
			// Enter button
			if (e.keyCode == 13) {
				// If last todo then close current 
				// and create a new todo
				if(!Todos.getNextTodo(this.model)) {
					this.close();
					forgetmenot.createNew("bottom");
				} else {
				// If not last todo then edit next todo
					this.editNextTodo(e);
				}
			}
			// Tab key - move todo to right one
			// And make sub todo of parent (if it exists)
			if (e.keyCode == 9 && !e.shiftKey) {
				if(this.model.setParent(Todos.getParentTodo(this.model))) {
					$(this.el).css('padding-left', function(i, val) {
					    return i + parseInt(val.replace('px','')) + 25;
					});
					this.save(1);
					this.edit();
				}
				e.preventDefault();
			}
			// Shift + Tab key - move todo to left one
			// And un-sub it from parent (if it exists)
			if (e.shiftKey && e.keyCode == 9) {
				console.log(Todos.getParentTodo(Todos.getPreviousTodo(this.model)));
				if(this.model.get('indent') == 1) {
					this.model.save({
						indent: 0,
						parent: 0
					});
				} else if ((this.model.get('indent') - 1) == Todos.getPreviousTodo(this.model).get('indent')) {
					this.model.save({
						parent: Todos.getPreviousTodo(this.model).get('parent'),
						indent: Todos.getPreviousTodo(this.model).get('indent')
					});
				}
				$(this.el).css('padding-left', function(i, val) {
				    return i + parseInt(val.replace('px','')) - 25;
				});
				//this.save(-2);
				this.edit();
				e.preventDefault();
			}
			/**
				Note for Up and Down keys:
				The '- 2' and none increments are
				due to the collection being kept at index 0
				but the order attribute being kept at index 1
			**/
			// Up key - close current todo and open todo above to edit
			if (e.keyCode == 38) {
				this.editPreviousTodo(e);
			}
			// Down key - close current todo and open todo above to edit
			if (e.keyCode == 40) {
				this.editNextTodo(e);
			}
			// Backspace key
			if (e.keyCode == 8) {
				if (this.input.val() == '') {
					this.editPreviousTodo(e);
					this.deleteTodo();
				}
			}
        },

		editNextTodo: function(e) {
			var todoToOpen = Todos.getNextTodo(this.model);
			// If we're already at the top then preventDefault()
			if (!todoToOpen) {
				e.preventDefault();
			} else {
				this.close();
				todoToOpen.view.edit();
			}
		},
		
		editPreviousTodo: function(e) {
			var todoToOpen = Todos.getPreviousTodo(this.model);
			// If we're already at the top then preventDefault()
			if (!todoToOpen) {
				e.preventDefault();
			} else {
				this.close();
				todoToOpen.view.edit();
			}
		},

		toggleDone: function() {
			this.model.done();
		}
    });

    window.TodoApp = Backbone.View.extend({
        el: $("#todoApp"),
        
        events: {
            //"dblclick"          :       "test",
            "click #createNew"  :       "createNew"
        },
        
        initialize: function() {
            _.bindAll(this, 'createNew', 'addOne', 'addAll');
            Todos.bind('refresh', this.addAll);
            //Todos.bind('refresh', this.resetOrder);
			Todos.bind('remove', this.resetOrder);
            Todos.fetch();
			this.resetOrder();
        },
        
        createNew: function(topOrBottom) {
            var todo = Todos.create({
				content: ''
			});
            this.addOne(todo, topOrBottom).edit();
        },
        
        addOne: function(todo, topOrBottom) {
            var view = new TodoView({model:todo});
			if (topOrBottom == 'top') {
				this.$("#todoItemsList").prepend(view.render().el);
			} else if (topOrBottom == 'bottom') {
				var lastTodoPosition = _.last(Todos.models).get("order") + 1;
				todo.set({order: lastTodoPosition});
				Todos.sort({silent: true});
				this.$("#todoItemsList").append(view.render().el);
			} else {
				this.$("#todoItemsList").append(view.render().el);
			}
            return view;
        },
        
        addAll: function() {
            Todos.each(this.addOne);
        },

        resetOrder: function(todo) {
            var order = -1;
            _.each(Todos.models, function(todo) {
                order++;
                todo.set({ order: order});
                todo.save();
            });
            //Todos.refresh();
        },
        
        test: function() {
            alert('test');
        }
    });

    window.forgetmenot = new TodoApp;

});