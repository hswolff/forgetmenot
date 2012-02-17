define(['jquery', 
		'underscore', 
		'backbone',
		'text!template/stats.html'], 
function($, _, Backbone, stats) {
	
	// Stats Template
	var StatsView = Backbone.View.extend({
		el: $('#stats'),
        template: _.template(stats),

        events: {
    		'click #clearCompleted' : 	'clearCompleted'
    	},

		initialize: function(collection) {
			_.bindAll(this)
			this.collection = collection;

			var self = this;
			this.collection.bind('change:status', function(model, status) {
				self.render(model.collection.length, model.collection.done().length);
            });

            this.render(this.collection.length, this.collection.done().length);

            this.collection.bind('add remove', this.render)
		},
		
		render: function(total, done) {
			if (_.isObject(total)) {
				total = done.length;
				done = done.done().length;
			}
			this.$el.html(this.template({
				total: total,
				done: done
			}));
		},

		clearCompleted: function() {
			var remove = this.collection.done();
			_.each(remove, function(todo){
				todo.destroy();
			});
		}
	
	});

	return StatsView;
});