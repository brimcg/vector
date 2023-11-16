var eqn = {
	create: function(d, container, id) {
		d3.select(container).append("table")
			.attr("id", id)
			.attr("class", "eqn");
		eqn.update(d, id);
	},

	update: function(d, id) {
		d3.select(`#${id}`)
			.selectAll("tr")
			.data(d)
			.join("tr")
			.selectAll("td")
			.data(d => d)
			.join("td")
				.html(d => d);
	
	}
}
