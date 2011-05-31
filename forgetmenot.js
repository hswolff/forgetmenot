$(document).ready(function() {
    
    window.Todo = Backbone.Model.extend({
        //Default Attributes
        defaults: {
            content: "new empty todo",
            parent: "0",
            indent: "0",
            order: "0",
            done: false
        },
        
        initialize: function() {
            if (!this.get("content")) {
              this.set({"content": this.defaults.content});
            }
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
            "dblclick .display .content"       :       "edit",
            "keypress .edit input"              :       "updateOnEnter",
            "click div.save"        :       "save",
            "click div.delete"      :       "deleteTodo",
            "keydown input"         :       "reOrderOnTab"
        },
        
        initialize: function() {
            _.bindAll(this, 'render', 'edit', 'deleteTodo', 'save', 'updateOnEnter');
            this.model.bind('change', this.render);
            this.el.id += this.model.get("id");
            // Give reverse access to a model's view by setting its 'this' 
            // to a new attribute on the model
            this.model.view = this;
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.input = this.$(".input");
            //this.input.bind('blur', this.save);
            return this;
        },
        
        edit: function() {
            var content = this.model.get('content');
            $(this.el).addClass("editing");
            this.input.val(content);
            this.input.focus();
            //return false;
        },
        
        save: function() {
            this.model.save({ content: this.input.val() });
            $(this.el).removeClass("editing");
        },
        
        deleteTodo: function() {
            this.model.destroy();
            this.remove();
        },
        
        updateOnEnter: function(e) {
          if (e.keyCode == 13) {
              this.save();
          }
        },
        
        reOrderOnTab: function(e) {
          if (e.keyCode == 9) {
              console.log('tab4');
              $(this.el).css('left', function(index) {
                  return index + 50;
              });
              e.preventDefault();
          }
        }
    });

    //window.todoview = new TodoView({model: todo});

    window.TodoApp = Backbone.View.extend({
        el: $("#todoApp"),
        
        events: {
            //"dblclick"          :       "test",
            "click #createNew"  :       "createNew"
        },
        
        initialize: function() {
            _.bindAll(this, 'createNew', 'addOne', 'addAll');
            Todos.bind('refresh', this.addAll);
            Todos.bind('remove', this.orderOnDelete);
            Todos.fetch();
        },
        
        createNew: function() {
            var todo = Todos.create({
                order: Todos.nextOrder()
            });
            this.addOne(todo).edit();
        },
        
        addOne: function(todo) {
            var view = new TodoView({model:todo});
            this.$("#todoItemsList").append(view.render().el);
            return view;
        },
        
        addAll: function() {
            Todos.each(this.addOne);
        },

        orderOnDelete: function(todo) {
            var order = 0;
            _.each(Todos.models, function(todo) {
                order++;
                todo.set({ order: order});
                todo.save();
            });
            Todos.refresh();
        },
        
        test: function() {
            alert('test');
        }
    });

    window.todoapp = new TodoApp;

});