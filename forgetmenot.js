$(document).ready(function() {
    
    window.Todo = Backbone.Model.extend({
        //Default Attributes
        defaults: {
            content: "new empty todo",
            parent: "0",
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
            this.model.save({ 
				content: this.input.val(),
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
			 	backspace		8
				tab				9
				enter			13
				shift			16
				ctrl			17
				alt				18
				left arrow		37
				up arrow		38
				right arrow		39
				down arrow		40
				delete			46
			**/
			// Enter button - close todo and save
			if (e.keyCode == 13) {
			    this.close();
			}
			// Tab key - move todo to left one
			if (e.keyCode == 9) {
				$(this.el).css('padding-left', function(i, val) {
				    return i + parseInt(val.replace('px','')) + 25;
				});
				this.save(1);
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
				var todoToOpen = Todos.at(this.model.get("order") - 2);
				// If we're already at the top then preventDefault()
				if (!todoToOpen) {
					e.preventDefault();
				} else {
					this.close();
					todoToOpen.view.edit();
				}
			}
			// Down key - close current todo and open todo above to edit
			if (e.keyCode == 40) {
				var todoToOpen = Todos.at(this.model.get("order"));
				// If we're already at the top then preventDefault()
				if (!todoToOpen) {
					e.preventDefault();
				} else {
					this.close();
					todoToOpen.view.edit();
				}
			}
			// Backspace key
			if (e.keyCode == 8) {
				if (this.input.val() == '') {
					// need to refactor...make this DRY
					var todoToOpen = Todos.at(this.model.get("order") - 2);
					// If we're already at the top then preventDefault()
					if (!todoToOpen) {
						e.preventDefault();
					} else {
						this.close();
						todoToOpen.view.edit();
					}
					this.deleteTodo();
				}
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
            Todos.bind('refresh', this.resetOrder);
            Todos.fetch();
        },
        
        createNew: function() {
            var todo = Todos.create({
				content: ''
			});
            this.addOne(todo, "prepend").edit();
        },
        
        addOne: function(todo, order) {
            var view = new TodoView({model:todo});
			if (order == 'prepend') {
				this.$("#todoItemsList").prepend(view.render().el);
			} else {
				this.$("#todoItemsList").append(view.render().el);
			}
            return view;
        },
        
        addAll: function() {
            Todos.each(this.addOne);
        },

        resetOrder: function(todo) {
            var order = 0;
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

    window.todoapp = new TodoApp;

});