/*global document: false */


var canvas = document.getElementById('playfield');

var playfieldWidth = 460;
var playfieldHeight = 230;

canvas.width = playfieldWidth;
canvas.height = playfieldWidth;

var mapStartLoc = ({x:250, y:10}); // x y coords of mini map

var statsTextPos = ({x:30, y:235}); // position of stats text
var statsLineHeight = 16;

var lastMapCurrentPixelLoc = ({x:0, y:0});
var mapPixelMultiplier = 8;
var mapPixelOffset = mapPixelMultiplier/2;
var blinkPixel = false;

var roomStartLoc = ({x:10, y:15});

var dungeonSize = ({width:25, height:25});

var currentRoomPos;

var emptyRoomList = [];

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

    var message = document.createElement('p');
    message.appendChild(document.createTextNode(messageStr));
    message.className = style;

	var messages = document.getElementById("messages");
    messages.insertBefore(message, messages.children[0]);
	messages.scrollBottom = messages.scrollHeight;

}

// create context for map 
var mapCtx = canvas.getContext('2d');

function initPlayer(){
	currentRoomPos = ({x:2, y:2});

	//map outline
	mapCtx.rect(mapStartLoc.x-2,mapStartLoc.y-2,mapPixelMultiplier*dungeonSize.width+2,mapPixelMultiplier*dungeonSize.height+2);
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

function roll(d) {
	return dice.parse(d).value;
}

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

	var openChestChance = roll('D2-1');

	if(openChestChance == 0){

		chest.keys = roll('D4');

	}else{

		chest.keys = 0;

	}


	openChestChance = roll('D2-1');

	if(openChestChance == 0){

		chest.gold = roll('D10');

	}else{

		chest.gold = 0;

	}

	openChestChance = roll('D2-1')

	if(openChestChance == 0){

		chest.food = roll('D7');

	}else{

		chest.food = 0;

	}

	openChestChance = roll('D2-1');

	if(openChestChance == 0){

		chest.health = roll('D4');

	}else{

		chest.health = 0;

	}


}

function makeRandomBeggarProperties(beggar) {

	beggar.interactedWith = false;

	var wantChance = roll('D3-1');

	beggar.wantsGold = 0;
	beggar.wantsFood = 0;
	beggar.wantsKeys = 0;

	beggar.forGold = 0;
	beggar.forFood = 0;
	beggar.forKeys = 0;

	// gives at least 1 to either first or second item so both are never 0

	var atLeastOneChance = roll('D2-1');

	var a = 0;
	var b = 0;

	if(atLeastOneChance == 0){
		a = 1;
	}else{
		b = 1;
	}

	if(wantChance == 0){
		beggar.wantsGold = roll('D55+24');
		beggar.forFood = roll('D6-1') + a;		
		beggar.forKeys = roll('D5-1') + b;
	}else if(wantChance == 1){
		beggar.wantsFood = roll('D10+4');
		beggar.forGold = roll('D20-1') + a;
		beggar.forKeys = roll('D7-1') + b;
	}else if(wantChance == 2){	
		beggar.wantsKeys = roll('D4');
		beggar.forGold = roll('D20-1') + a;
		beggar.forFood = roll('D6-1') + b;
	}
}

function makeRandomWallStrProperty() {

	var wallChance = roll('D3-1');

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

		room.beggar = new Object();

		room.visited = false;

		if(i != currentRoomPos.x && j != currentRoomPos.y){

			var centerRoomProp = roll('D7-1');

			if(centerRoomProp == 1){

				room.keys = roll('D3');

			}
			else if(centerRoomProp == 2){

				room.gold = roll('D5');

			}else if(centerRoomProp == 3){

				room.food = roll('D6');

			}else if(centerRoomProp == 4){

				//if(Math.floor(Math.random()*2) == 0){

					makeRandomBeggarProperties(room.beggar);

				//}

			}else if(centerRoomProp == 5){

				makeRandomChestProperties(room.chest);

			}

		}else if(i == currentRoomPos.x && j == currentRoomPos.y){

			room.visited = true;

		}else{

			emptyRoomList.push({x:i, y:j});

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
		mapCtx.fillStyle = "rgba(255,255,255,255)";
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

		console.log("points")
		checkPoints();

	}

	var isChestObjEmpty = isEmpty(roomProperties.chest);

	var isBeggarObjEmpty = isEmpty(roomProperties.beggar);

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

	else if(isBeggarObjEmpty == false){

		c = "I";

		var forGoldStr = "";
		var forFoodStr = "";
		var forKeysStr = "";

		if(roomProperties.beggar.forGold > 0){

			forGoldStr ="Gold:"+roomProperties.beggar.forGold+" ";

		}

		if(roomProperties.beggar.forFood > 0){

			forFoodStr ="Food:"+roomProperties.beggar.forFood+" ";

		}

		if(roomProperties.beggar.forKeys > 0){

			forKeysStr ="Keys:"+roomProperties.beggar.forKeys+" ";

		}

		if(roomProperties.beggar.wantsGold > 0){

			writeMessage("Please.. give me "+roomProperties.beggar.wantsGold+" gold, and I will give you: "+forFoodStr+forKeysStr,"messageGreen");

		}else if(roomProperties.beggar.wantsFood > 0){

			writeMessage("Please.. give me "+roomProperties.beggar.wantsFood+" food, and I will give you: "+forGoldStr+forKeysStr,"messageGreen");

		}else{

			writeMessage("Please.. give me "+roomProperties.beggar.wantsKeys+" keys, and I will give you: "+forGoldStr+forFoodStr,"messageGreen");

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
			mapCtx.fillRect((mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier)-mapPixelOffset), mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)+(mapPixelOffset/4), mapPixelOffset, mapPixelOffset/2);

		}else if(l == "+"){

			mapCtx.fillStyle = "rgba(255,0,255,255)";
			mapCtx.fillRect((mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier)-mapPixelOffset), mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)+(mapPixelOffset/4), mapPixelOffset, mapPixelOffset/2);

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
			mapCtx.fillRect(mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier)+(mapPixelOffset/4), (mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)-mapPixelOffset), mapPixelOffset/2, mapPixelOffset);

		}else if(u == "+"){

			mapCtx.fillStyle = "rgba(255,0,255,255)";
			mapCtx.fillRect(mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier)+(mapPixelOffset/4), (mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)-mapPixelOffset), mapPixelOffset/2, mapPixelOffset);

		}

	}else{

		u = "-";

	}



	r = returnWallStringForProperty(roomProperties.exitRight, "hor");

	if(r == " "){

		mapCtx.fillStyle = "rgba(255,255,255,255)";
		mapCtx.fillRect((mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier)+mapPixelOffset), mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)+(mapPixelOffset/4), mapPixelOffset, mapPixelOffset/2);

	}else if(r == "+"){

		mapCtx.fillStyle = "rgba(255,0,255,255)";
		mapCtx.fillRect((mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier)+mapPixelOffset), mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)+(mapPixelOffset/4), mapPixelOffset, mapPixelOffset/2);

	}

	d = returnWallStringForProperty(roomProperties.exitDown, "ver");

	if(d == " "){

		mapCtx.fillStyle = "rgba(255,255,255,255)";
		mapCtx.fillRect((mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier))+(mapPixelOffset/4), (mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)+mapPixelOffset), mapPixelOffset/2, mapPixelOffset);

	}else if(d == "+"){

		mapCtx.fillStyle = "rgba(255,0,255,255)";
		mapCtx.fillRect((mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier))+(mapPixelOffset/4), (mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier)+mapPixelOffset), mapPixelOffset/2, mapPixelOffset);

	}



	var roomStr = 
   "+--------"+u+"--------+\n\
	|                 |\n\
	|                 |\n\
	|                 |\n\
	|                 |\n\
	|        "+c+"        |\n\
	"+l+"                 "+r+"\n\
	|                 |\n\
	|                 |\n\
	|                 |\n\
	|                 |\n\
	|                 |\n\
	+--------"+d+"--------+\n\
	";

	// Fill with gradient
	textCtx.fillStyle=gradient;

	textCtx.wrapText(roomStr,roomStartLoc.x,roomStartLoc.y,16);




	var diff;

	textCtx.fillStyle='#DEDEDE';

	textCtx.wrapText("("+currentRoomPos.x+","+currentRoomPos.y+")",statsTextPos.x,statsTextPos.y,statsLineHeight);

	textCtx.wrapText(player.health+"/"+player.maxHealth,statsTextPos.x+80,statsTextPos.y,statsLineHeight);

	diff = player.health - lastMove.health;

	if(diff < 0){

		textCtx.fillStyle='#EB1313';
		textCtx.wrapText(""+diff+"",statsTextPos.x+80,statsTextPos.y+20,statsLineHeight);

	}else if(diff > 0){

		textCtx.fillStyle='#05ED14';
		textCtx.wrapText("+"+diff,statsTextPos.x+80,statsTextPos.y+20,statsLineHeight);

	}



	textCtx.fillStyle='#DEDEDE';

	textCtx.wrapText("F:"+player.food,statsTextPos.x+160,statsTextPos.y,statsLineHeight);

	diff = player.food - lastMove.food;

	if(diff < 0){

		textCtx.fillStyle='#EB1313';
		textCtx.wrapText(""+diff+"",statsTextPos.x+160,statsTextPos.y+20,statsLineHeight);

	}else if(diff > 0){

		textCtx.fillStyle='#05ED14';
		textCtx.wrapText("+"+diff,statsTextPos.x+160,statsTextPos.y+20,statsLineHeight);

	}




	textCtx.fillStyle='#DEDEDE';

	textCtx.wrapText("K:"+player.keys,statsTextPos.x+260,statsTextPos.y,statsLineHeight);

	diff = player.keys - lastMove.keys;

	if(diff < 0){

		textCtx.fillStyle='#EB1313';
		textCtx.wrapText(""+diff+"",statsTextPos.x+260,statsTextPos.y+20,statsLineHeight);

	}else if(diff > 0){

		textCtx.fillStyle='#05ED14';
		textCtx.wrapText("+"+diff,statsTextPos.x+260,statsTextPos.y+20,statsLineHeight);

	}



	textCtx.fillStyle='#DEDEDE';

	textCtx.wrapText("G:"+player.gold,statsTextPos.x+350,statsTextPos.y,statsLineHeight);

	diff = player.gold - lastMove.gold;

	if(diff < 0){

		textCtx.fillStyle='#EB1313';
		textCtx.wrapText(""+diff+"",statsTextPos.x+350,statsTextPos.y+20,statsLineHeight);

	}else if(diff > 0){

		textCtx.fillStyle='#05ED14';
		textCtx.wrapText("+"+diff,statsTextPos.x+350,statsTextPos.y+20,statsLineHeight);

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
	textCtx.clearRect(roomStartLoc.x, roomStartLoc.y-16, 205, 210);
	clearText();

	mapCtx.fillStyle = "rgba(255,255,255,255)";
	mapCtx.fillRect(lastMapCurrentPixelLoc.x, lastMapCurrentPixelLoc.y, mapPixelOffset, mapPixelOffset);
}

function clearText (){ 
	textCtx.clearRect(statsTextPos.x, statsTextPos.y-statsLineHeight, playfieldWidth, 65);
}

function clearMap () {

	mapCtx.clearRect(mapStartLoc.x-2,mapStartLoc.y-2,(dungeonSize.width*mapPixelMultiplier)+2,(dungeonSize.height*mapPixelMultiplier)+2); 

	currentRoomPos = ({x:2, y:2});

	lastMapCurrentPixelLoc.x = mapStartLoc.x+(currentRoomPos.x*mapPixelMultiplier);
	lastMapCurrentPixelLoc.y = mapStartLoc.y+(currentRoomPos.y*mapPixelMultiplier);

}

function endGame(){

	if(player.food == 0 && player.health == 0){

		writeMessage("You died, most likely of starvation.","messageRed");

		textCtx.fillText("YOU'RE DEAD", roomStartLoc.x+44, roomStartLoc.y+30);

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

		// check if beggar was in room, and if so add beggar to empty room and remove old beggar
		var currentRoomProperties = rooms[currentRoomPos.x][currentRoomPos.y];

		var isBeggarObjEmpty = isEmpty(currentRoomProperties.beggar);

		if(isBeggarObjEmpty == false && currentRoomProperties.beggar.interactedWith == true){ // beggar in current room

			// get random empty room index
			var emptyRoomIndex = Math.floor(Math.random()*emptyRoomList.length);

			// room properties of random room		
			var newRoomProperties = rooms[emptyRoomList[emptyRoomIndex].x][emptyRoomList[emptyRoomIndex].y];

			// apply random beggar properties to empty room
			makeRandomBeggarProperties(newRoomProperties.beggar);

			// add current player location to empty room list
			emptyRoomList.push({x:currentRoomPos.x, y:currentRoomPos.y});

			// replace beggar object in current room to a blank object
			currentRoomProperties.beggar = new Object();

			// get rid of old empty room index because it's not empty anymore
			emptyRoomList.splice(emptyRoomIndex, 1);

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

var cheevos;

cheevos = [100, 200, 500, 1000, 2000, 5000, 10000, 20000];

function checkPoints (){
  if (player.gold + player.roomsVisited >= cheevos[0]) {
    writeMessage("Holy shit!!!!! You've earned an achievement!!!!!","messageGreen");
    writeMessage("8============================@ "+cheevos[0]+" points","messageGreen");
    cheevos.shift();
    return null;
  }
};

function checkRoom () {

	var roomProperties = rooms[currentRoomPos.x][currentRoomPos.y];

	var isChestObjEmpty = isEmpty(roomProperties.chest);

	var isBeggarObjEmpty = isEmpty(roomProperties.beggar);

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
	}else if(isBeggarObjEmpty == false){

		if(roomProperties.beggar.wantsGold > 0){

			if(player.gold >= roomProperties.beggar.wantsGold){

				player.gold -= roomProperties.beggar.wantsGold;

				player.food += roomProperties.beggar.forFood;
				player.keys += roomProperties.beggar.forKeys;

				roomProperties.beggar.interactedWith = true;

				writeMessage("Oh, bless you!","messageGreen");

			}else{

				writeMessage("Sorry, need more gold.","messageGreen");

			}

		}

		else if(roomProperties.beggar.wantsFood > 0){

			if(player.food >= roomProperties.beggar.wantsFood){

				player.food -= roomProperties.beggar.wantsFood;

				player.gold += roomProperties.beggar.forGold;
				player.keys += roomProperties.beggar.forKeys;

				roomProperties.beggar.interactedWith = true;

				writeMessage("Oh, bless you!","messageGreen");

			}else{

				writeMessage("Sorry, need more food.","messageGreen");

			}

		}

		else if(roomProperties.beggar.wantsKeys > 0){

			if(player.keys >= roomProperties.beggar.wantsKeys){

				player.keys -= roomProperties.beggar.wantsKeys;

				player.gold += roomProperties.beggar.forGold;
				player.food += roomProperties.beggar.forFood;

				roomProperties.beggar.interactedWith = true;

				writeMessage("Oh, bless you!","messageGreen");

			}else{

				writeMessage("Sorry, need more keys.","messageGreen");

			}

		}

	}else if (roomProperties.keys != null) {

		player.keys += roomProperties.keys;

		writeMessage("You picked up the shiny object. Let's see what you collected: Keys:"+roomProperties.keys,"messageBlue");

		roomProperties.keys = null;

		// add current player location to empty room list
		emptyRoomList.push({x:currentRoomPos.x, y:currentRoomPos.y});

	}else if (roomProperties.food != null) {

		player.food += roomProperties.food;

		writeMessage("You picked up the can. Let's see what you collected: Food:"+roomProperties.food,"messageBlue");

		roomProperties.food = null;

		// add current player location to empty room list
		emptyRoomList.push({x:currentRoomPos.x, y:currentRoomPos.y});

	}else if (roomProperties.gold != null) {

		player.gold += roomProperties.gold;

		writeMessage("You picked up the shiny object. Let's see what you collected: Gold:"+roomProperties.gold,"messageBlue");

		roomProperties.gold = null;

		// add current player location to empty room list
		emptyRoomList.push({x:currentRoomPos.x, y:currentRoomPos.y});

	}


}