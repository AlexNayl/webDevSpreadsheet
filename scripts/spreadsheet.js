
var spreadArray = [];

$(document).ready(async function(){
	spreadArray = await loadCSV("/grades.csv")
	//Initialize the html table
	let tempText = "";
	for (let y = 0; y < spreadArray.length; y++){
		tempText += "<tr>";
		for(let x = 0; x < spreadArray[y].length; x++){
			tempText +="<td>";
			tempText += spreadArray[y][x];
			tempText +="</td>";
		}
		tempText += "</tr>";
	}
	$("#spreadsheetTable").append(tempText);

	$(document).on('keypress', function(e){
		if (e.which == 13) {
			closeEdits();
		}
	});

	$("#spreadsheetTable td").click(function(){
		editCell($(this)[0].parentNode.rowIndex, $(this)[0].cellIndex);
	})
	$("#spreadsheetTable tr:first-child td").click(function(){
		selectColumn($(this)[0].cellIndex);
	})
	$("#spreadsheetTable td:first-child").click(function(){
		selectRow($(this)[0].parentNode.rowIndex);
	})

})

function deselectAll(){
	let cells = $('#spreadsheetTable tr td').not('tr:first-child td:first-child');
	cells.removeClass('spreadSheetSelectedColor');
	closeEdits();

}

function selectRow(rowIndex){
	deselectAll();
	rowIndex += 1;
	let cells = $('#spreadsheetTable tr:nth-child('+rowIndex+') td:gt(0) ');
	cells.addClass("spreadSheetSelectedColor");
	makeChart(cells)

}

function selectColumn(collIndex){
	deselectAll();
	collIndex += 1;
	$('#spreadsheetTable tr:gt(0) td:nth-child('+collIndex +')').addClass("spreadSheetSelectedColor");
}

function editCell(y,x){
	x++;
	y++;
	let cell = $("#spreadsheetTable tr:nth-child("+y+") td:nth-child("+x+")");
	if(cell.html()[0] != "<"){
		//if there isnt any child nodes
		deselectAll();
		cell.addClass("spreadSheetSelectedColor");
		let cellText = cell.text();
		cellText = "<form><input type=\"text\" value=\""+cellText+"\"></form>"
		cell.html(cellText);
	}
}

function closeEdits(){
	let cells = $("#spreadsheetTable td input");
	for(let i = 0; i < cells.length; i++){
		cells[i].parentNode.parentNode.innerHTML = cells[i].value;
	}
}

function makeChart(x){
	//delete any svgs
	$("svg").remove()

	let output = {
		"A": 0,
		"B": 0,
		"C": 0,
		"D": 0,
		"F": 0,
	}

	let gradeChars = ["A","B","C","D","F"]
	let total = 0;
	for(let i = 0; i < x.length; i++){
		let num = parseFloat(x[i].innerHTML)
		let grade = ""
		if(num != NaN){
			if(num > 80){
				grade = "A"
			}else if(num > 70){
				grade = "B"
			}else if(num > 60){
				grade = "C"
			}else if(num > 50){
				grade = "D"
			}else{
				grade = "F"
			}

			output[grade]++

			total++
		}
	}

	//normalize
	output.A = output.A / total
	output.B = output.B / total
	output.C = output.C / total
	output.D = output.D / total
	output.F = output.F / total

	//convert to list /object format
	output =[
		{"char" : "A","val":output.A},
		{"char" : "B","val":output.B},
		{"char" : "C","val":output.C},
		{"char" : "D","val":output.D},
		{"char" : "E","val":output.F}
	]

	//start making the graph
	const margin = 50;
    const width = 800;
    const height = 500;
    const chartWidth = width - 2 * margin;
    const chartHeight = height - 2 * margin;

	const colourScale = d3.scaleLinear()
                          .domain([-1, 1])
                          .range(['red', 'blue']);

    const xScale = d3.scaleBand()
                     .range([0, chartWidth])
                     .domain(output.map(function(d) { return d.char; }))
                     .padding(0.3);

    const yScale = d3.scaleLinear()
                     .range([chartHeight, 0])
					 .domain(output.map(function(d) { return d.val; }))
                     .domain([0, 1]);

    const svg = d3.select('body')
                  .append('svg')
                    .attr('width', width)
                    .attr('height', height);

    const canvas = svg.append('g')
                        .attr('transform', `translate(${margin}, ${margin})`);
	// chart title
    svg.append('text')
          .attr('x', margin + chartWidth / 2)
          .attr('y', margin)
          .attr('text-anchor', 'middle')
          .text('Grade Distribution');

    // x-axis and label
    canvas.append('g')
             .attr('transform', `translate(${margin}, ${chartHeight})`)
             .call(d3.axisBottom(xScale));

    svg.append('text')
           .attr('x', margin + chartWidth / 2 + margin)
           .attr('y', chartHeight + 2 * margin - 15)
           .attr('text-anchor', 'middle')
           .text('Grade');

    // y-axis and label
    canvas.append('g')
             .attr('transform', `translate(${margin}, 0)`)
             .call(d3.axisLeft(yScale));

    svg.append('text')
           .attr('x', -margin + -(chartHeight / 2))
           .attr('y', margin)
           .attr('transform', 'rotate(-90)')
           .attr('text-anchor', 'middle')
           .text('Frequency(%)');

	// the bar chart
	const bars = canvas.selectAll('rect')
	.data(output)
	.enter()
		.append('rect')
			.attr('x', (data) => margin + xScale(data.char))
			.attr('y', (data) => yScale(data.val))
			.attr('height', function(d) { return chartHeight - yScale(d.val); })
			.attr('width', xScale.bandwidth())
			.attr('fill', (data) => colourScale(data.val))
			.on('mouseenter', function(source, index) {
				d3.select(this)
					.transition()
					.duration(200)
					.attr('opacity', 0.5);
			})
			.on('mouseleave', function(source, index) {
				d3.select(this)
					.transition()
					.duration(200)
					.attr('opacity', 1.0);
			});
}

async function loadCSV(path){
	let promise = await fetch(path);
	let text = String(await promise.text());
	let spreadArray = text.split('\n');

	for(let i = 0; i < spreadArray.length; i++){
		spreadArray[i] = String(spreadArray[i]).split(',');
	}

	return spreadArray;

}