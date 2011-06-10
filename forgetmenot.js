$(document).ready(function() {
    
    window.Todo = Backbone.Model.extend({
        //Default Attributes
        defaults: {
            content: "new empty todo",
            parent: "0",
            indent: 0,
            order: "0",
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
          if (e.keyCode == 13) {
              this.close();
          }
		  if (e.keyCode == 9) {
             $(this.el).css('padding-left', function(i, val) {
                 return i + parseInt(val.replace('px','')) + 25;
             });
			this.save(1);
			this.edit();
			e.preventDefault();
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