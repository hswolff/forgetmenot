define(['jquery', 
		'underscore', 
		'backbone',
		'text!template/todo.html'], 
function($, _, Backbone, todo) {
	
	var TodoView = Backbone.View.extend({
		tagName: "li",
		template: _.template(todo),
		
		events: {
			"click .name": "edit",
			"click input.status" : "status",
			"click .delete" : "delete",
			"keydown input.name" : "keyboardActions"   
		},
		
		initialize: function() {
			_.bindAll(this);
			this.model.view = this;

			this.el.className = 'clearfix todo';
			this.el.id = this.model.cid;

			this.model.bind('change', this.render);			
			this.model.bind('destroy', this.remove);
		},
		
		render: function(model) {
			this.$el.html(this.template(this.model.toJSON()));
			if (model && model.get('edit')) {
				this.$input = this.$("input.name");
				this.$input.bind('blur', this.close);
				this.$input.focus();
			}
			return this;
		},
		
		edit: function() {
			this.$el.addClass("editing");
			this.model.set('edit', true);
		},
		
		close: function() {
			this.$el.removeClass("editing");
			var $inputVal = this.$input.val();
			this.model.save({ 
				name: ($inputVal == '' ? this.model.defaults.name : $inputVal),
				edit: false
			});
		},
		
		delete: function() {
			this.model.destroy();
		},
		
		keyboardActions: function(e) {
	
			// Enter button
			if (e.keyCode == 13) {
				this.close();
				this.model.collection.create();
				return;
				var nextModel = this.model.collection.getNext(this.model);
				if (this.model === nextModel) {
					this.model.collection.create();
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
				this.model.collection.getPrevious(this.model).view.edit();
			}
			
			// Down key - close current todo and open todo above to edit
			if (e.keyCode == 40) {
				this.close();
				this.model.collection.getNext(this.model).view.edit();
			}
			
			// Backspace key
			if (e.keyCode == 8) {
				if (this.$input.val() == '') {
					e.preventDefault();
				}
			}
			
		},

		status: function() {
			this.model.done();
		}
	});

	return TodoView;
});