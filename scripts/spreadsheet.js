

let sizeX = 5;
let sizeY = 5;

$(document).ready(function(){

	$("#spreadsheetTable tr:first-child td").click(function(){
		selectColumn($(this)[0].cellIndex);
	})
	$("#spreadsheetTable td:first-child").click(function(){
		selectRow($(this)[0].parentNode.rowIndex);
	})
})

function deselectAll(){
	$('#spreadsheetTable tr td').not('tr:first-child td:first-child').removeClass('spreadSheetSelectedColor');

}

function selectRow(rowIndex){
	deselectAll();
	rowIndex += 1;
	$('#spreadsheetTable tr:nth-child('+rowIndex+') td:gt(0) ').addClass("spreadSheetSelectedColor");

}

function selectColumn(collIndex){
	deselectAll();
	collIndex += 1;
	$('#spreadsheetTable tr:gt(0) td:nth-child('+collIndex +')').addClass("spreadSheetSelectedColor");
}