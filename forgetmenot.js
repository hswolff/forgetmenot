$(document).ready(function() {
    
    window.Todo = Backbone.Model.extend({
        //Default Attributes
        defaults: {
            content: "new empty todo",
            parent: "0",
            indent: "0",
            order: "0",
            complete: false
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
        }
    });
    
    window.Todos = new TodoList;


    window.TodoView = Backbone.View.extend({
        tagName: "li",
        id: "todo-",
        className: "todo",
        template: _.template($('#item-template').html()),
        
        events: {
            "click"                 :       "edit",
            "click div.save"        :       "save",
            "click div.delete"      :       "deleteTodo",
            "keypress input"        :       "updateOnEnter",
            "keydown input"         :       "reOrderOnTab"
        },
        
        initialize: function() {
            _.bindAll(this, 'render', 'edit', 'deleteTodo', 'save', 'updateOnEnter');
            this.el.id += this.model.get("id");
            this.render();
            // Give reverse access to a model's view by setting its 'this' 
            // to a new attribute on the model
            this.model.view = this;
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.input = this.$("input");
            this.input.bind('blur', this.save);
            return this;
        },
        
        edit: function() {
            this.input.removeAttr("disabled").focus();
            this.$(".delete").show();
            //return false;
        },
        
        save: function() {
            this.model.save({ content: this.input.val() });
            this.input.attr("disabled", "disabled");
        },
        
        deleteTodo: function() {
            this.model.destroy();
            this.remove();
        },
        
        updateOnEnter: function(e) {
          if (e.keyCode == 13) {
              this.save();
              this.input.blur();
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
        
        test: function() {
            alert('test');
        }
    });

    window.todoapp = new TodoApp;

});