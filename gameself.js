function startGame() {

function hasClass(node, className) {
	var classes = node.className.split(' ');
	var i;
	for (i = 0; i < classes.length; i++) {
		if (classes[i] == className) return true;
	}
	return false;
}
function addClass(node, className) {
	if (!hasClass(node, className)) {
		node.className = node.className + ' ' + className;
		return true;
	} else return false;
}
function removeClass(node, className) {
	var classes = node.className.split(' ');
	var isRemoved = false;
	var i;
	for (i = 0; i < classes.length; i++) {
		if (classes[i] == className) {
			delete classes[i];
			isRemoved = true;
		}
	}
	node.className = classes.join(' ');
	return isRemoved;
}
function getNeightbors(node) {
	var classes = node.className.split(' ');
	var i;
	for (i = 0; i < classes.length; i++) {
		if (classes[i].search('near-') != -1) return parseInt(classes[i].substr(5));
	}
	return false;
}

//options
var game = new Gameself;
var multiplier = 2;
var mineCount = game.mineCount = 10 * multiplier * multiplier;
var rows = game.rows = 8 * multiplier;
var columns = game.columns = 8 * multiplier;

//game field
var mineCoords = [];
var column;
var row;               //mines placement
for (i = 1; i <= mineCount; i++) {
	column = -1;
	row = -1;
	while (!(column >=1 && column <=columns)) column = Math.floor(Math.random() * columns) + 1;
	while (!(row >=1 && row <=rows)) row = Math.floor(Math.random() * rows) + 1;
	mineCoords.push([column, row]);
}
						//field construction
var fieldTemp = document.createElement('table');
fieldTemp.className = 'field';
field = document.getElementById('field-container').appendChild(fieldTemp);
var isMine = false;
for (row = 1; row <= rows; row++) {
	var tr = document.createElement('tr');
	var thisTr = field.appendChild(tr);
	for (col = 1; col <= columns; col++) {
		var td = document.createElement('td');
		td.id = col.toString() + '-' + row.toString();
		isMine = false;
		for (i=0; i < mineCoords.length; i++) {
			if (col == mineCoords[i][0] && row == mineCoords[i][1]) isMine = true;
		}
		if (isMine) {
			addClass(td, 'trapped');
		}
		thisTr.appendChild(td);
	}
}
var statusField = document.createElement('div');
var container = document.getElementById('field-container');
var br = document.createElement('br');
var flagSpan = document.createElement('span');
var statusText = flagSpan.cloneNode();
var turns = flagSpan.cloneNode();
statusText.innerHTML = 'Game in progress. Turns: ';
statusText.appendChild(turns);
statusText.className = 'status-text';
turns.id = 'turn-count';
turns.innerHTML = '0';
statusField.id = 'status-field';
statusField.className = 'status-field';
flagSpan.innerHTML = '⚐';
flagSpan.id = 'flag-button';
statusField.appendChild(flagSpan);
statusField.style.width = (container.offsetWidth).toString() + 'px';
document.getElementById('content').insertBefore(statusField, container);
statusField.appendChild(statusText);
document.getElementById('content').insertBefore(br, container);

//write neightbors count
var cells = document.getElementsByTagName('td');
for (i = 0; i < cells.length; i++) {
	if (hasClass(cells[i], 'trapped')) continue;
	var shifts = [[0,0],[0,1],[1,1],[1,0],[-1,0],[0,-1],[-1,-1],[-1,1],[1,-1]];
	var count = 0;
	var pos = cells[i].id.split('-');
	for (shift = 0; shift < shifts.length; shift++) {
		neight = document.getElementById((parseInt(pos[0]) + shifts[shift][0]).toString() + '-' + (parseInt(pos[1]) + shifts[shift][1]).toString());
		if (neight && hasClass(neight, 'trapped')) {
			count += 1;
		}
	}
	addClass(cells[i], 'near-' + count);
}

//game behavior
	//game class
function Gameself() {
	this.mineCount = 10;
	this.rows = 8;
	this.columns = 8;
	this.turns = 0;
	this.selectedCells = 0;
	this.makeMove = function(target) {
		this.turns++;
		if (!this.turnSpan) this.turnSpan = document.getElementById('turn-count');
		this.turnSpan.innerHTML = this.turns.toString();
		if (hasClass(target, 'trapped')) {
			this.endGame(false);
			return;
		} else if (this.selectedCells >= this.rows * this.columns - this.mineCount) {
			this.endGame(true);
		} else if (getNeightbors(target) > 0) {
			this.showDigit(target);
		} else this.showBlank(target);
	}
	this.showDigit = function(target) {
		target.innerHTML = getNeightbors(target).toString();
	}
	this.showBlank = function(target) {
		addClass(target, 'blank');
		var shifts = [[0,0],[0,1],[1,1],[1,0],[-1,0],[0,-1],[-1,-1],[-1,1],[1,-1]];
		var i;
		var neight;
		var pos = target.id.split('-');
		for (i = 0; i < shifts.length; i++) {
			neight = document.getElementById((parseInt(pos[0]) + shifts[i][0]).toString() + '-' + (parseInt(pos[1]) + shifts[i][1]).toString());
			if (neight && getNeightbors(neight) == 0 && !hasClass(neight, 'blank')) {
				if (addClass(neight, 'selected')) this.selectedCells++;
				this.showBlank(neight);
			} else if (neight && !hasClass(neight, 'trapped') && !hasClass(neight, 'blank')) {
				if (addClass(neight, 'selected')) this.selectedCells++;
				this.showDigit(neight);
			}
		}
	}
	this.endGame = function(isSuccsess) {
		addClass(document.getElementById('field-container').firstChild, 'finished');
		var popupMenu = document.createElement('span');
		popupMenu.className = 'popup-menu';
		var message;
		isSuccsess? message = 'You win!' : message = 'You lose!';
		popupMenu.innerHTML = message + 'Turns: ' + this.turns.toString();
		var popupButton = document.createElement('button');
		popupButton.type = 'button';
		popupButton.innerHTML = 'New game';
		popupButton.id = "retry-button";
		popupMenu.appendChild(popupButton);
		var statusText = document.getElementById('status-field').getElementsByTagName('span')[1];
		statusText.innerHTML = '';
		statusText.appendChild(popupMenu);
		popupButton.onclick = function() {
			removeClass(document.getElementById('field-container').firstChild, 'finished');
			document.getElementById('content').innerHTML = '<div id="field-container"></div>';
			startGame();
		}
		var cells = document.getElementsByTagName('td');
		var i;
		for (i = 0; i < cells.length; i++) {
			if (hasClass(cells[i], 'trapped')) {
				cells[i].innerHTML = '⚫';
			}
		}
	}
	this.putFlag = function(target) {
		if (hasClass(target, 'selected')) return;
		if (!hasClass(target, 'flagged')) {
			addClass(target, 'flagged');
			target.innerHTML = '⚐';
		} else {
			removeClass(target, 'flagged');
			target.innerHTML = '';
		}
	}
}
	//class end

field.onclick = function(event) {
	if (hasClass(this, 'finished')) return;
	if (!event) event = window.event;
	target = event.target || event.srcElement;
	if (target.tagName == 'TD') {
		if (hasClass(flagSpan, 'selected')) {
			game.putFlag(target);
			removeClass(flagSpan, 'selected');
		} else if (!hasClass(target, 'selected')) {
			if (addClass(target, 'selected')) {
				game.selectedCells++;
				if (hasClass(target, 'flagged')) game.putFlag(target);
			} 
			if (!hasClass(flagSpan, 'selected')) game.makeMove(target);
		}
	}
}
field.oncontextmenu = function(event) {
	if (hasClass(this, 'finished')) return;
	if (!event) event = window.event;
	target = event.target || event.srcElement;
	event.preventDefault ? event.preventDefault() : (event.returnValue=false);
	game.putFlag(target);
}
flagSpan.onclick = function() {
	if (!hasClass(flagSpan, 'selected')) {
		addClass(flagSpan, 'selected');
	} else removeClass(flagSpan, 'selected');
}


//end
}
onload = startGame;