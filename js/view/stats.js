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
		},
		
		render: function(total, done) {
			$(this.el).html(this.template({
				total: total,
				done: done
			}));
		}
	
	});

	return StatsView;
});