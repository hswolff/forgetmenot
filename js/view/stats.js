define(['jquery', 
		'underscore', 
		'backbone',
		'text!template/stats.html'], 
function($, _, Backbone, stats) {
	
	// Stats Template
	var StatsView = Backbone.View.extend({
		el: $('#stats'),
        template: _.template(stats),

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