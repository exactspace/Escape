/*global document: false */


var canvas = document.getElementById('playfield');

var playfieldWidth = 430;
var playfieldHeight = 230;

canvas.width = 840;
canvas.height = 412;

var mapStartLoc = ({x:250, y:25}); // x y coords of mini map
var lastMapCurrentPixelLoc = ({x:0, y:0});
var mapPixelMultiplier = 6;
var mapPixelOffset = mapPixelMultiplier/2;
var blinkPixel = false;

var roomStartLoc = ({x:40, y:25});

var dungeonSize = ({width:25, height:25});

var currentRoomPos;

var player = new Object();

var messages;

player.maxHealth;
player.health;
player.food;
player.keys;
player.gold;

var lastMove = new Object();

lastMove.health = 0;
lastMove.food = 0;
lastMove.keys = 0;
lastMove.gold = 0;

player.roomsVisited = 0;

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function writeMessage(messageStr, style){

	messageStr = "<p class='"+style+"'>"+messageStr +"</p>\r";

	messages = messageStr+messages;
	
	//document.getElementById("messages").innerHTML = "<p class='messageBold' style='float: left;'>>("+currentRoomPos.x+","+currentRoomPos.y+")</p> "+messages;
	
	document.getElementById("messages").innerHTML = messages;
	
	var objDiv = document.getElementById("messages");
	objDiv.scrollBottom = objDiv.scrollHeight;

}

// create context for map 
var mapCtx = canvas.getContext('2d');

function initPlayer(){

	currentRoomPos = ({x:2, y:2});
	
	//map outline
	mapCtx.rect(mapStartLoc.x-2,mapStartLoc.y-2,152,152);
	mapCtx.strokeStyle="white";
	mapCtx.stroke();
			
	player.maxHealth = 20; //20
	player.health = player.maxHealth;
	player.food = 20; //20

	player.keys = 4; //4
	player.gold = 0; //0
	
	lastMove.health = player.health;
	lastMove.food = player.food;
	lastMove.keys = player.keys;
	lastMove.gold = player.gold;
	
	player.roomsVisited = 1;
	
	messages = "";
	
	writeMessage("Use the W,A,S,D keys to travel between chambers. Doorways marked with \"+\" are locked and cost one key to unlock them.  Moving costs 1 food. If you have no food left, moving costs 1 health. The game will end when you have no health left.","messageBold");
	
	writeMessage("You've been thrown into a dark chamber cell. Luckily, you're equipped with "+player.keys+" keys and some food. Maybe there's a chance of getting out before you starve to death?","messageReg");
	
	

}

initPlayer();

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}



function makeRandomChestProperties(chest) {
	
	chest.opened = false;
		
	var openChestChance = Math.floor(Math.random()*2);
	
	if(openChestChance == 0){

		chest.keys = Math.floor(Math.random()*3) + 1;
		
	}else{
	
		chest.keys = 0;
	
	}
	
	
	openChestChance = Math.floor(Math.random()*2);
	
	if(openChestChance == 0){
	
		chest.gold = Math.floor(Math.random()*10) + 1;
		
	}else{
	
		chest.gold = 0;
	
	}
	
	openChestChance = Math.floor(Math.random()*2);
	
	if(openChestChance == 0){

		chest.food = Math.floor(Math.random()*7) + 1;
		
	}else{
	
		chest.food = 0;
	
	}
	
	openChestChance = Math.floor(Math.random()*2);
	
	if(openChestChance == 0){

		chest.health = Math.floor(Math.random()*6) + 1;
		
	}else{
	
		chest.health = 0;
	
	}
	

}

function makeRandomWallStrProperty() {

	var wallChance = Math.floor(Math.random()*3);
	
	var wallStr;
		
	if(wallChance == 0){
		wallStr = "w"; // wall
	}else if(wallChance ==1){
		wallStr = "o"; // open doorway
	}else{
		wallStr = "l"; // locked
	}
	
	return wallStr;

}

function makeRooms(rows, cols){

  var arr = [];

  // Creates all lines:
  for(var i=0; i < rows; i++){

      // Creates an empty line
      arr.push([]);

      // Adds cols to the empty line:
      arr[i].push( new Array(cols));

      for(var j=0; j < cols; j++){
        // Initializes:

		var room = new Object();
		
//		room.colR1 = Math.floor(Math.random()*206)+50;
//		room.colR2 = Math.floor(Math.random()*206)+50;
//		room.colR3 = Math.floor(Math.random()*206)+50;
//		
//		room.colG1 = Math.floor(Math.random()*206)+50;
//		room.colG2 = Math.floor(Math.random()*206)+50;
//		room.colG3 = Math.floor(Math.random()*206)+50;
//		
//		room.colB1 = Math.floor(Math.random()*206)+50;
//		room.colB2 = Math.floor(Math.random()*206)+50;
//		room.colB3 = Math.floor(Math.random()*206)+50;

		room.colR1 = Math.floor(206/(dungeonSize.width/j))+50;
		room.colG1 = Math.floor(206/(dungeonSize.width/i))+50;
		room.colB1 = Math.floor(206/(dungeonSize.width/i))+50;
		
		room.colR2 = Math.floor(206/(dungeonSize.width/i))+50;
		room.colG2 = Math.floor(206/(dungeonSize.width/i))+50;
		room.colB2 = Math.floor(206/(dungeonSize.width/j))+50;

		room.colR3 = Math.floor(250 - (206/(dungeonSize.width/j)));
		room.colG3 = Math.floor(250 - (206/(dungeonSize.width/i)));
		room.colB3 = Math.floor(250 - (206/(dungeonSize.width/i)));

				
		if(i == currentRoomPos.x && j == currentRoomPos.y){
		
			room.exitRight = "o";
	
			room.exitDown = "o";
		
		}else if(i == currentRoomPos.x -1 && j == currentRoomPos.y){
		
			room.exitRight = "o";
	
			room.exitDown = makeRandomWallStrProperty()
		
		}else if(i == currentRoomPos.x && j == currentRoomPos.y -1){
		
			room.exitRight = makeRandomWallStrProperty();
	
			room.exitDown = "o";
		
		}else{

			room.exitRight = makeRandomWallStrProperty();
	
			room.exitDown = makeRandomWallStrProperty();
		
		}
		
		if(i == dungeonSize.width-1){
						
			room.exitRight = "w";
		
		}
		
		if(j == dungeonSize.height-1){
		
			room.exitDown = "w";
		
		}
		
		
		
		room.chest = new Object();
		room.keys = new Object();
		room.keys = null;
		room.gold = new Object();
		room.gold = null;
		room.food = new Object();
		room.food = null;
		
		room.visited = false;
		
		if(i != currentRoomPos.x && j != currentRoomPos.y){

			var centerRoomProp = Math.floor(Math.random()*6);
			
			if(centerRoomProp == 1){
			
				room.keys = Math.floor(Math.random()*3) + 1;
					
			}
			else if(centerRoomProp == 2){
			
				room.gold = Math.floor(Math.random()*5) + 1;
			
			}else if(centerRoomProp == 3){
			
				room.food = Math.floor(Math.random()*6) + 1;
			
			}else if(centerRoomProp == 4){
			
				makeRandomChestProperties(room.chest);
			
			}

		}else if(i == currentRoomPos.x && j == currentRoomPos.y){
				
			room.visited = true;
		
		}
	
        arr[i][j] = room;
      }
  }

	return arr;
}

var rooms = makeRooms(dungeonSize.width,dungeonSize.height);


CanvasRenderingContext2D.prototype.wrapText = function (text, x, y, lineHeight) {

    var lines = text.split("\n");

    for (var i = 0; i < lines.length; i++) {

		if(i > 0){
		
			lines[i] = lines[i].substring(1);
		
		}

        this.fillText(lines[i], x, y);
        y += lineHeight;

    }
}

function returnWallStringForProperty(propertyStr,dirStr){

	if(propertyStr == "w"){
		
		if(dirStr == "hor"){
	
			return "|";
			
		}else{
		
			return "-";
		
		} 
	
	}else if(propertyStr == "o"){
	
		return " ";
	
	}else{
	
		return "+";
	
	}

}



var aniCurrentMapPixelLocVar=setInterval(function(){aniCurrentMapPixelLoc()},500);

function aniCurrentMapPixelLoc(){

	if(blinkPixel){
		mapCtx.fillStyle = "rgba(0,255,242,255)";
	}else{
		mapCtx.fillStyle = "rgba(158,158,158,255)";
	}
	
	blinkPixel = !blinkPixel;
	
	mapCtx.fillRect(lastMapCurrentPixelLoc.x, lastMapCurrentPixelLoc.y, mapPixelOffset, mapPixelOffset);
}

// create context for background 
var textCtx = canvas.getContext('2d');



function drawBG(writeMessages){

	lastMapCurrentPixelLoc.x = mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier);
	lastMapCurrentPixelLoc.y = mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier);
	
	var l;
	var r;
	var u;
	var d;
	
	var c;
	
	var roomProperties = rooms[currentRoomPos.x][currentRoomPos.y];
	
	textCtx.fillStyle = "#A1A1A1";
	textCtx.font = "bold 18px Courier New";
	
	
	
	// Create gradient
	var gradient=textCtx.createLinearGradient(roomStartLoc.x,roomStartLoc.y,roomStartLoc.x+100,0);
	gradient.addColorStop("0",rgbToHex(roomProperties.colR1,roomProperties.colG1,roomProperties.colB1));
	gradient.addColorStop("0.5",rgbToHex(roomProperties.colR2,roomProperties.colG2,roomProperties.colB2));
	gradient.addColorStop("1.0",rgbToHex(roomProperties.colR3,roomProperties.colG3,roomProperties.colB3));
	
	
	// check if room was visited for points
		
	if(roomProperties.visited == false){
	
		roomProperties.visited = true;
		
		player.roomsVisited += 1;
	
	}
	
	var isChestObjEmpty = isEmpty(roomProperties.chest);
	
	if(isChestObjEmpty == false){
	
		if(roomProperties.chest.opened == false){
		
			c = "C";
			
			if(player.keys > 0){
			
				writeMessage("There is a chest in this room. It costs one key to open. Press J if you wish to open it.","messageReg");
			
			}else{
			
				writeMessage("There is a chest in this room. It costs one key to open. Unfortunately, you have no keys left.","messageReg");
				
			}
		
		}else{
		
			c = "_";
			
			if(writeMessages){
			
				writeMessage("An empty chest lay before you.","messageReg");
			
			}
		
		}
	
	}
	else if (roomProperties.keys != null) {
	
		c = "K";
		
		writeMessage("You see something shiny on the floor. A key! Is there more than one? Press J to find out.","messageReg");
	
	}else if (roomProperties.food != null) {
	
		c = "F";
		
		writeMessage("You see a can of food on the floor. You could always use more of that. Press J to pick it up.","messageReg");
	
	}else if (roomProperties.gold != null) {
	
		c = "G";
		
		writeMessage("You see gold, but is it of any use? Press J to pick it up.","messageReg");
	
	}else{
	
		c = " ";

		
		if(writeMessages){
	
			writeMessage("Empty room.","messageReg");
		
		}
	
	}
		
	var leftRoomProperties;
	
	if(currentRoomPos.x > 0){
	
		leftRoomProperties = rooms[currentRoomPos.x-1][currentRoomPos.y];
		
		l = returnWallStringForProperty(leftRoomProperties.exitRight, "hor");
		
		if(l == " "){
		
			mapCtx.fillStyle = "rgba(255,255,255,255)";
			mapCtx.fillRect((mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier)-mapPixelOffset), mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier), mapPixelOffset, mapPixelOffset);
		
		}else if(l == "+"){
		
			mapCtx.fillStyle = "rgba(255,0,255,255)";
			mapCtx.fillRect((mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier)-mapPixelOffset), mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier), mapPixelOffset, mapPixelOffset);
		
		}
	
	}else{
	
		l = "|";
	
	}
	
	var upRoomProperties;
	
	if(currentRoomPos.y > 0){
	
		upRoomProperties = rooms[currentRoomPos.x][currentRoomPos.y-1];
		
		u = returnWallStringForProperty(upRoomProperties.exitDown, "ver");
		
		if(u == " "){
		
			mapCtx.fillStyle = "rgba(255,255,255,255)";
			mapCtx.fillRect(mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier), (mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)-mapPixelOffset), mapPixelOffset, mapPixelOffset);
		
		}else if(u == "+"){
		
			mapCtx.fillStyle = "rgba(255,0,255,255)";
			mapCtx.fillRect(mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier), (mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)-mapPixelOffset), mapPixelOffset, mapPixelOffset);
		
		}
	
	}else{
	
		u = "-";
	
	}
	
	
	
	r = returnWallStringForProperty(roomProperties.exitRight, "hor");
	
	if(r == " "){
	
		mapCtx.fillStyle = "rgba(255,255,255,255)";
		mapCtx.fillRect((mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier)+mapPixelOffset), mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier), mapPixelOffset, mapPixelOffset);
	
	}else if(r == "+"){
	
		mapCtx.fillStyle = "rgba(255,0,255,255)";
		mapCtx.fillRect((mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier)+mapPixelOffset), mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier), mapPixelOffset, mapPixelOffset);
	
	}
	
	d = returnWallStringForProperty(roomProperties.exitDown, "ver");
	
	if(d == " "){
		
		mapCtx.fillStyle = "rgba(255,255,255,255)";
		mapCtx.fillRect(mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier), (mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)+mapPixelOffset), mapPixelOffset, mapPixelOffset);
		
	}else if(d == "+"){
	
		mapCtx.fillStyle = "rgba(255,0,255,255)";
		mapCtx.fillRect(mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier), (mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)+mapPixelOffset), mapPixelOffset, mapPixelOffset);
	
	}
	
	
	
	var roomStr = 
   "+------"+u+"------+\n\
	|             |\n\
	|             |\n\
	|             |\n\
	|      "+c+"      |\n\
	"+l+"             "+r+"\n\
	|             |\n\
	|             |\n\
	|             |\n\
	|             |\n\
	+------"+d+"------+\n\
	";
	
	// Fill with gradient
	textCtx.fillStyle=gradient;
		
	textCtx.wrapText(roomStr,roomStartLoc.x,roomStartLoc.y,16);
	
	
	
	
	var diff;
	
	textCtx.fillStyle='#DEDEDE';
	
	textCtx.wrapText("("+currentRoomPos.x+","+currentRoomPos.y+")",0,210,16);
	
	textCtx.wrapText(player.health+"/"+player.maxHealth,80,210,16);
	
	diff = player.health - lastMove.health;
	
	if(diff < 0){
	
		textCtx.fillStyle='#EB1313';
		textCtx.wrapText(""+diff+"",80,230,16);

	}else if(diff > 0){
	
		textCtx.fillStyle='#05ED14';
		textCtx.wrapText("+"+diff,80,230,16);
	
	}
	
	
	
	textCtx.fillStyle='#DEDEDE';
	
	textCtx.wrapText("Food:"+player.food,160,210,16);
	
	diff = player.food - lastMove.food;
	
	if(diff < 0){
	
		textCtx.fillStyle='#EB1313';
		textCtx.wrapText(""+diff+"",160,230,16);

	}else if(diff > 0){
	
		textCtx.fillStyle='#05ED14';
		textCtx.wrapText("+"+diff,160,230,16);
	
	}
	
	
	
	
	textCtx.fillStyle='#DEDEDE';
	
	textCtx.wrapText("Keys:"+player.keys,260,210,16);
	
	diff = player.keys - lastMove.keys;
	
	if(diff < 0){
	
		textCtx.fillStyle='#EB1313';
		textCtx.wrapText(""+diff+"",260,230,16);

	}else if(diff > 0){
	
		textCtx.fillStyle='#05ED14';
		textCtx.wrapText("+"+diff,260,230,16);
	
	}
	
	
	
	textCtx.fillStyle='#DEDEDE';
	
	textCtx.wrapText("Gold:"+player.gold,350,210,16);
	
	diff = player.gold - lastMove.gold;
	
	if(diff < 0){
	
		textCtx.fillStyle='#EB1313';
		textCtx.wrapText(""+diff+"",350,230,16);

	}else if(diff > 0){
	
		textCtx.fillStyle='#05ED14';
		textCtx.wrapText("+"+diff,350,230,16);
	
	}
	
	
	
	
	if(player.health <= 0){
	
		endGame();
	
	}
	
		
	lastMove.health = player.health;
	lastMove.food 	= player.food;
	lastMove.keys 	= player.keys;
	lastMove.gold 	= player.gold;
	
}

drawBG(false);


function clearPlayfield (){ 
	//textCtx.clearRect (0, 0, playfieldWidth, playfieldHeight);
	textCtx.clearRect(roomStartLoc.x, 14, 162, 171);
	clearText();
	
	mapCtx.fillStyle = "rgba(255,255,255,255)";
	mapCtx.fillRect(lastMapCurrentPixelLoc.x, lastMapCurrentPixelLoc.y, mapPixelOffset, mapPixelOffset);
}

function clearText (){ 
	textCtx.clearRect(0, 175, playfieldWidth, 65);
}

function clearMap () {

	mapCtx.clearRect(mapStartLoc.x-2,mapStartLoc.y-2,152,152); 
	
	currentRoomPos = ({x:2, y:2});
	
	lastMapCurrentPixelLoc.x = mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier);
	lastMapCurrentPixelLoc.y = mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier);

}

function endGame(){

	if(player.food == 0 && player.health == 0){

		writeMessage("You died, most likely of starvation.","messageRed");
	
		textCtx.fillText("YOU'RE DEAD", roomStartLoc.x+23, roomStartLoc.y+30);
		
	}
	
	var finalScore = player.roomsVisited + player.gold;
	
	writeMessage("Your final score is "+finalScore+". Press R to start a new game.","messageBlue");


}

function checkMoveWithPos(pos, dir){

	var roomProperties = rooms[pos.x][pos.y];
	
	var movePlayer = false;
	
	var usedKey = false;
	
	if(dir == "hor"){
	
		if(roomProperties.exitRight == "o"){
		
			movePlayer = true;
		
		}
		else if(roomProperties.exitRight == "l" && player.keys > 0){
		
			player.keys -= 1;
			
			usedKey = true;
				
			roomProperties.exitRight = "o";
		
			movePlayer = true;
		
		}

	}else{
	
		if(roomProperties.exitDown == "o"){
		
			movePlayer = true;
		
		}
		else if(roomProperties.exitDown == "l" && player.keys > 0){
		
			player.keys -= 1;
			
			usedKey = true;
			
			roomProperties.exitDown = "o";
		
			movePlayer = true;
		
		}
	
	}
	
	if(movePlayer){ 
	
		if(usedKey && player.keys == 0){
		
			writeMessage("Oh no! You used all your keys! Looks like there's no hope in seeing your family this Christmas.. unless you find some keys.","messageRed");
		
		}
	
		// recover health when moving
		if(player.food > 0 && player.health < player.maxHealth){
		
			player.health += 1;
		
		}
	
		if(player.food > 0){ // lose food when moving
		
			player.food -= 1;
			
			if(player.food == 0){
		
				writeMessage("You ran out of food! You can feel yourself getting weaker with every step you take.","messageRed");
		
			}
		
		}else if(player.health > 0){ // player starving
		
			player.health -= 1;
		
		}
		
		if(player.food == 0 && player.health == 6){
		
			writeMessage("You're wasting away to almost nothing from starving to death. Your body more or less resembles skin and bones. Find food fast.","messageRed");
		
		} 
		
		if(player.health == 10){
		
			writeMessage("You're running dangerously low on health!","messageRed");
		
		}
			
	}

	return movePlayer;

}

document.addEventListener('keydown', function(event) {

	if(player.health > 0){ 

	    if(event.keyCode == 65) { //left, a
	
	        if(currentRoomPos.x > 0){
	
				var movePlayer = checkMoveWithPos({x:currentRoomPos.x-1, y:currentRoomPos.y}, "hor");
				
				if(movePlayer){
				
					currentRoomPos.x -= 1;
					
					clearPlayfield();
					drawBG(true);
					
				}
			}
			
	    }
	    else if(event.keyCode == 68) { //right, d
	
	        if(currentRoomPos.x < dungeonSize.width -1){
	
				var movePlayer = checkMoveWithPos({x:currentRoomPos.x, y:currentRoomPos.y}, "hor");
				
				if(movePlayer){
				
					currentRoomPos.x += 1;
					
					clearPlayfield();
					drawBG(true);
					
				}
		
			
			}
			
	    }
	
		if(event.keyCode == 87) { //up, w
	
	        if(currentRoomPos.y > 0){
	
				var movePlayer = checkMoveWithPos({x:currentRoomPos.x, y:currentRoomPos.y-1},"ver");
				
				if(movePlayer){
				
					currentRoomPos.y -= 1;
					
					clearPlayfield();
					drawBG(true);
					
				}
			}
			
	    }
	    else if(event.keyCode == 83) { //down, s
	
	        if(currentRoomPos.y < dungeonSize.height -1){
	
				var movePlayer = checkMoveWithPos({x:currentRoomPos.x, y:currentRoomPos.y},"ver");
				
				if(movePlayer){
				
					currentRoomPos.y += 1;
					
					clearPlayfield();
					drawBG(true);

					
				}
			}
			
	    }
		else if(event.keyCode == 74) { // action, j
		
			checkRoom();

			clearPlayfield();
			drawBG(false);
			
		}
			
	}else{
	
		if(event.keyCode == 82) { // restart game, r
		
			clearMap();
			
			clearPlayfield();
		
			initPlayer();
			
			rooms = makeRooms(dungeonSize.width,dungeonSize.height);
			
			drawBG(false);
			
		}
	
	}

});

function checkRoom () {

	var roomProperties = rooms[currentRoomPos.x][currentRoomPos.y];
	
	var isChestObjEmpty = isEmpty(roomProperties.chest);
	
	if(isChestObjEmpty == false && roomProperties.chest.opened == false && player.keys > 0){ 
			
		roomProperties.chest.opened = true;
		
		player.keys -= 1;
		
		if(roomProperties.chest.keys == 0 && 
		roomProperties.chest.gold == 0 && 
		roomProperties.chest.food == 0 &&
		roomProperties.chest.health == 0){
		
			writeMessage("You are horribly unlucky. There is nothing in this chest. Worse off, you wasted a key.","messageRed");
			
		}else{
		
		
			var keysStr = "";
			var goldStr = "";
			var foodStr = "";
			var healthStr = "";
			
			if(roomProperties.chest.keys > 0){
			
				keysStr = "Keys:"+roomProperties.chest.keys+" ";
				
			}
			
			if(roomProperties.chest.gold > 0){
				
				goldStr = "Gold:"+roomProperties.chest.gold+" ";
				
			}
			
			if(roomProperties.chest.food > 0){
				
				foodStr = "Food:"+roomProperties.chest.food+" ";
				
			}
			
			if(roomProperties.chest.health > 0){
				
				healthStr = "Health:"+roomProperties.chest.health+" ";
				
			}
			
			writeMessage("You opened the chest. Let's see what you collected: "+keysStr+goldStr+foodStr+healthStr,"messageBlue");
		
		}
		
		player.keys += roomProperties.chest.keys;
		player.gold += roomProperties.chest.gold;
		player.food += roomProperties.chest.food;
		
		if(player.health + roomProperties.chest.health > player.maxHealth){
		
			player.health = player.maxHealth;
		
		}else{
		
			player.health += roomProperties.chest.health;
	
		}
	}else if (roomProperties.keys != null) {
	
		player.keys += roomProperties.keys;
				
		writeMessage("You picked up the shiny object. Let's see what you collected: Keys:"+roomProperties.keys,"messageBlue");
		
		roomProperties.keys = null;
	
	}else if (roomProperties.food != null) {
	
		player.food += roomProperties.food;
			
		writeMessage("You picked up the can. Let's see what you collected: Food:"+roomProperties.food,"messageBlue");
		
		roomProperties.food = null;
	
	}else if (roomProperties.gold != null) {
	
		player.gold += roomProperties.gold;
			
		writeMessage("You picked up the shiny object. Let's see what you collected: Gold:"+roomProperties.gold,"messageBlue");
		
		roomProperties.gold = null;
	
	}
	

}