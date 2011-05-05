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
        localStorage: new Store("forgetmenot")
    });
    
    window.Todos = new TodoList;


    window.TodoView = Backbone.View.extend({
        tagName: "li",
        id: "todo-" + this.model,
        className: "todo",
        template: _.template($('#item-template').html()),
        
        events: {
            "click"                 :       "edit",
            "click div.save"        :       "save",
            "click div.delete"      :       "deleteTodo",
            "keypress input"        :       "updateOnEnter"
        },
        
        initialize: function() {
            _.bindAll(this, 'render', 'edit', 'deleteTodo', 'save', 'updateOnEnter');
            this.render();
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.input = this.$("input");
            this.input.bind('blur', this.save);
            return this;
        },
        
        edit: function() {
            this.$("input").removeAttr("disabled").focus();
            this.$(".delete").show();
            //return false;
        },
        
        save: function() {
            var newVal = this.$("input").val();
            this.model.save({content: newVal});
            this.$("input").attr("disabled", "disabled");
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
            var todo = Todos.create();
            this.addOne(todo);
        },
        
        addOne: function(todo) {
            var view = new TodoView({model:todo});
            this.$("#todoItemsList").append(view.render().el);
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