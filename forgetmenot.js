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
        id: "todo-",
        className: "todo",
        template: _.template($('#item-template').html()),
        
        events: {
            "click"                 :       "edit",
            "click div.save"        :       "save",
            "click div.delete"      :       "deleteTodo"
        },
        
        initialize: function() {
            _.bindAll(this, 'render', 'edit', 'deleteTodo');
            this.render();
        },
        
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        
        edit: function() {
            this.$("span").hide();
            this.$("input, div").show();
            //return false;
        },
        
        save: function() {
            var newVal = this.$("input").val();
            this.model.save({content: newVal});
            this.$("span").show();
            this.$("input, div").hide();
            this.$("span").text(newVal);
        },
        
        deleteTodo: function() {
            this.model.destroy();
            this.remove();
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
            var view = new TodoView({model:todo});
            $(this.el).append(view.render().el);
        },
        
        addOne: function(todo) {
            var view = new TodoView({model:todo});
            $(this.el).append(view.render().el);
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