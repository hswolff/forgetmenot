$(function() {
    // Global namespace
	window.fmn = {};
	
    fmn.Model = Backbone.Model.extend({
        //Default Attributes
        defaults: {
            content: "new empty todo",
            parent: 0,
            indent: 0,
            position: 0,
            done: 0
        },
        
        initialize: function() {
            if (!this.get("content")) {
              this.set({"content": this.defaults.content});
            }
        },

		done: function() {
		    if (this.get("done") == 0) {
		        this.save({done: 1});
		    } else {
		        this.save({done: 0});
		    }
			
		},

    });

    // Each Individual Todo Item View
    fmn.TodoView = Backbone.View.extend({
        tagName: "li",
        template: _.template($('#item-template').html()),
        
        events: {
            "dblclick .display"        :      	"edit",
            //"click .display"        :      	"edit",
            "keydown .edit input"              :      	"keyboardActions",
			"click input.done"  			    : 		"toggleDone",
            "click .display .delete"					   : 	    "deleteTodo"            
        },
        
        initialize: function() {
            _.bindAll(this, 'render', 'deleteTodo', 'close','save', 'keyboardActions');
            this.bind('close', this.render);
            this.el.id = this.model.cid;
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
				content: ($inputVal == '' ? this.model.defaults.content : $inputVal),
				indent: parseInt(this.model.get('indent') + (indent ? indent : ''))
			});
//			this.model.indentBy(indent);
        },

		close: function() {
			this.save();
			$(this.el).removeClass("editing");
			this.trigger('close');
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
				this.close();
				fmn.app.newTodo();
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

		toggleDone: function() {
			this.model.done();
		}
    });

    fmn.Collection = Backbone.Collection.extend({
        model: fmn.Model,
		url: "fmn.php?",
        
        comparator: function(todo) {
          return todo.get('id');
        }
    });
    
    fmn.Todos = new fmn.Collection;

    fmn.App = Backbone.View.extend({
        el: $("#todoApp"),
        
        events: {
            "click #createNew"  :       "newTodo"
        },
        
        initialize: function() {
            Backbone.emulateJSON = true;
            _.bindAll(this, 'newTodo', 'addOne', 'addAll');
            fmn.Todos.bind('reset', this.addAll);
			fmn.Todos.bind('add', this.addOne);
			fmn.Todos.bind('add', function(model, collection){
				model.view.edit();
			});
            fmn.Todos.fetch();
        },

        addAll: function(collection, r) {
			// If collection is empty add one
			if(!collection.length) {
				var model = collection.create();
			}
            collection.each(this.addOne);
        },
        
        addOne: function(o, p) {
            var view = new fmn.TodoView({model:o.todo || o});
			this.$("#todoItemsList").append(view.render().el);
            return view;
        },

        newTodo: function(o) {
            fmn.Todos.create();
        }

    });

    fmn.app = new fmn.App;

});