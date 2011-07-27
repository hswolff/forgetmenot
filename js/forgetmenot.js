$(function() {
    // Global namespace
	window.fmn = {};
	
    fmn.Model = Backbone.Model.extend({
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
            "click .display .content" : 			"edit",
			"click input.done" : 					"toggleDone",
            "click .display .delete" :  			"deleteTodo",
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
            var content = this.model.get('content');
            $(this.el).addClass("editing");
            this.input.val(content);
            this.input.focus();
        },
        
        save: function(indent) {
			var $inputVal = this.input.val();
            this.model.save({ 
				content: ($inputVal == '' ? this.model.defaults.content : $inputVal),
				indent: parseInt(this.model.get('indent') + (indent ? indent : ''))
			});
        },

		close: function() {
			this.save();
			$(this.el).removeClass("editing");
			this.trigger('close');
		},
        
        deleteTodo: function() {
            this.remove();
        },
        
        keyboardActions: function(e) {
	
			// Enter button
			if (e.keyCode == 13) {
				this.close();
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

    fmn.Collection = Backbone.Collection.extend({
        model: fmn.Model,
		url: "fmn.php?",
		
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
    
    fmn.Todos = new fmn.Collection;
	
	// Stats Template
	fmn.StatsView = Backbone.View.extend({
		el: $('#stats'),
        template: _.template($('#stats-template').html()),

		initialize: function() {
			_.bindAll(this, 'render')
			fmn.Todos.bind('all', this.render)
		},
		
		render: function() {
			$(this.el).html(this.template({
				total: fmn.Todos.length,
				done: fmn.Todos.done().length
			}));
		}
	
	});

    fmn.App = Backbone.View.extend({
        el: $("#todoApp"),
        
        events: {
            'click #createNew' :       	'newTodo',
			'click #clearCompleted' : 	'clearCompleted'
        },
        
        initialize: function() {
            Backbone.emulateJSON = true;
            _.bindAll(this, 'render', 'newTodo', 'addOne', 'addAll');
            fmn.Todos.bind('reset', this.addAll);
			fmn.Todos.bind('add', this.addOne);
			fmn.Todos.bind('add', function(model, collection){
				model.view.edit();
			});
            fmn.Todos.fetch();

			this.render();
        },

		render: function() {
			this.stats = new fmn.StatsView;
		},
		
		clearCompleted: function() {
			var remove = fmn.Todos.done();
			_.each(remove, function(todo){
				todo.destroy();
			});
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