$(document).ready(function() {
    
    window.Todo = Backbone.Model.extend({
        //Default Attributes
        defaults: {
            content: "new empty todo",
            parent: 0,
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
		},
		
		indentBy: function(number) {
			this.save({indent: (this.get('indent') + (number ? number: 0))});
		}
    });
    
    window.TodoList = Backbone.Collection.extend({
        model: Todo,
//        localStorage: new Store("forgetmenot"),
		url: "fmn.php?",
        
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
		
		thatAreDone: function() {
			return _.select(this.models, function(model) {
				return model.get('done') == true;
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
			var previousTodo = this.at(Todos.indexOf(previousTodo ? previousTodo : todo) - 1);
			if (!previousTodo) {
				return false;
			} else if (todo.get('indent') == previousTodo.get('indent')) {
				return (previousTodo ? previousTodo : NaN);
			} else {
				return this.getParentTodo(todo, previousTodo);
			}
			
		},
		
		maintainChildrenOfParent: function(todo) {
			var childTodo = this.at(Todos.indexOf(childTodo ? childTodo: todo) + 1);
			if (!childTodo) {
				return false;
			} else {
				if(todo.get('indent') == 0) {
					this.getNextTodo(todo).save({parent: todo.get('id'), indent: 1});
				}
				Todos.each(function(model){
					if (todo.get('id') === model.get('parent')) {
						model.save({indent: (todo.get('indent') + 1)});
					}
				});
				return this.maintainChildrenOfParent(childTodo);
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
			return this.at(Todos.indexOf(todo) + 1);
		},
		
		// Passed in current todo
		// Returns previous todo item
		// Based off of todo's 'order' attribute
		getPreviousTodo: function(todo) {
			return this.at(Todos.indexOf(todo) - 1);
		}
		
    });
    
    window.Todos = new TodoList;


    // Each Individual Todo Item View
    window.TodoView = Backbone.View.extend({
        tagName: "li",
        template: _.template($('#item-template').html()),
        
        events: {
            "dblclick .display"        :      	"edit",
            "click .display"        :      	"edit",
            "keydown .edit input"              :      	"keyboardActions",
			"click input.done"  			    : 		"toggleDone",
            "click .display .delete"					   : 	    "deleteTodo"            
        },
        
        initialize: function() {
            _.bindAll(this, 'render', 'deleteTodo', 'close','save', 'keyboardActions');
            this.model.bind('change', this.render);
            this.el.id = this.model.get("id");
            // Give reverse access to a model's view by setting its 'this' 
            // to a new attribute on the model
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
            var content = this.model.get('content');
            $(this.el).addClass("editing");
            this.input.val(content);
            this.input.focus();
            //return false;
        },
        
        save: function(indent) {
			var $inputVal = this.input.val();
            this.model.save({ 
				content: ($inputVal == '' ? this.model.defaults.content : $inputVal)
			});
			this.model.indentBy(indent);
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
				if(!Todos.getNextTodo(this.model)) {
					// If last todo then close current 
					// and create a new todo
					this.close();
					forgetmenot.createNewAfter(this.model);
				} else if (this.model.get('indent') === Todos.getNextTodo(this.model).get('indent')) {
					// If next todo is at same indent
					// Then edit next todo
					this.editNextTodo(e);
				} else if (this.model.get('indent') > Todos.getNextTodo(this.model).get('indent')) {
					// If next todo is closer to indent '0'
					// Then we create a new todo after current
					forgetmenot.createNewAfter(this.model);
				} else {
				// If not last todo then edit next todo
					this.editNextTodo(e);
				}
			}
			// Tab key - move todo to right one
			// And make sub todo of parent (if it exists)
			if (e.keyCode == 9 && !e.shiftKey) {
				this.save();
				if(this.model.setParent(Todos.getParentTodo(this.model))) {
					this.save(1);
					Todos.maintainChildrenOfParent(this.model);
					this.edit();
				}	
				e.preventDefault();
			}
			// Shift + Tab key - move todo to left one
			// And un-sub it from parent (if it exists)
			if (e.shiftKey && e.keyCode == 9) {
				this.save();
				if(this.model.get('indent') == 1) {
					this.model.save({
						indent: 0,
						parent: 0
					});
					Todos.maintainChildrenOfParent(this.model);
				} else if (!Todos.getPreviousTodo(this.model) || this.model.get('indent') == 0) {
					return false;
				} else {
					this.model.save({
						parent: Todos.get(this.model.get('parent')).get('parent'),
						indent: Todos.get(this.model.get('parent')).get('indent')
					});
					Todos.maintainChildrenOfParent(this.model);
				}
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
					e.preventDefault();
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
            _.bindAll(this, 'createNew', 'createNewAfter', 'createNewBefore', 'addOne', 'addAll');
            Todos.bind('refresh', this.addAll);
            //Todos.bind('refresh', this.resetOrder);
			Todos.bind('remove', this.resetOrder);
			Todos.bind('add', this.resetOrder);
            Todos.fetch();
			this.resetOrder();
			if (Todos.length == 0) {
				this.createNew({content: 'Start your first Todo!'});
				Todos.at(0).view.edit();
			}
        },
        
        createNew: function(o) {
            var todo = Todos.create({
				content: o.content ? o.content : ''
			});
            this.addOne(todo, (_.isString(o.topOrBottom) ? o.topOrBottom : 'bottom')).edit();
        },

		createNewAfter: function(todo) {
            var t = Todos.create({
				content: '',
				parent: todo.get('parent'),
				indent: todo.get('indent'),
				order: (todo.get('order') + 1)
			});
			var view = new TodoView({model:t});
			this.$('#' + todo.id).after(view.render().el);
			view.edit();
        },

		createNewBefore: function(todo) {
            var t = Todos.create({
				content: '',
				parent: todo.get('parent'),
				indent: todo.get('indent'),
				order: todo.get('order')
			});
			var view = new TodoView({model:t});
			this.$('#' + todo.id).before(view.render().el);
			view.edit();
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
        }
    });

    window.forgetmenot = new TodoApp;

});