define(['jquery', 
		'underscore', 
		'backbone'], 
function($, _, Backbone) {
	
	// Stats Template
	var StatsView = Backbone.View.extend({
		el: $('#stats'),
        template: _.template($('#stats-template').html()),

		initialize: function() {
			_.bindAll(this, 'render')
			// fmn.Todos.bind('all', this.render);
		},
		
		render: function() {
			$(this.el).html(this.template({
				total: fmn.Todos.length,
				done: fmn.Todos.done().length
			}));
		}
	
	});

	return StatsView;
});