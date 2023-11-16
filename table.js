//D3 updatable table
// Example:
//	table.create(data, ["C1", "C2"], d3.select("#container"), "mytable");
//  table.update(data, ["C1"], "mytable");

var table = {
	create: function(data, columns, container, id) {
		var t = container.append('table')
			.attr("class", "tabl")
			.attr("id", id);
		var thead = t.append('thead');
		thead.append('tr')
		var	tbody = t.append('tbody');

		table.update(data, columns, id);
	},

	update: function(data, columns, id) {
		var t = d3.select(`#${id}`);
		var thead = t.select('thead');
		var tbody = t.select('tbody');

		// append the header row
		thead.select('tr')
			.selectAll('th')
			.data(columns).join('th')
			.text(function (column) { return column; });

		// create a row for each object in the data
		var rows = tbody.selectAll('tr')
			.data(data)
			.join('tr');

		// create a cell in each row for each column
		var cells = rows.selectAll('td')
			.data(function (row) {
				return columns.map(function (column) {
					return {column: column, value: row[column]};
				});
			})
			.join('td')
			.html(function (d) { return d.value; });
	}
}
