var currentPlayer = 'red';

var red_spawn_taken = false;
var green_spawn_taken = false;
var yellow_spawn_taken = false;
var blue_spawn_taken = false;

var red_place_1 = null;
var red_place_2 = null;
var red_place_3 = null;
var red_place_4 = null;

var red_pawn_1;
var red_pawn_2;
var red_pawn_3;
var red_pawn_4;

var green_pawn_1;
var green_pawn_2;
var green_pawn_3;
var green_pawn_4;

var blue_pawn_1;
var blue_pawn_2;
var blue_pawn_3;
var blue_pawn_4;

var yellow_pawn_1;
var yellow_pawn_2;
var yellow_pawn_3;
var yellow_pawn_4;

var current_value = 0;

var button = document.getElementById('button');

var red_pawn_points = [0, 0, 0, 0];
var green_pawn_points = [0, 0, 0, 0];
var blue_pawn_points = [0, 0, 0, 0];
var yellow_pawn_points = [0, 0, 0, 0];

function moveToFinalBase(name) {
    var index = name.split("_")[2];

    var pawnPoints;
    
    if(currentPlayer == 'red')
        pawnPoints = red_pawn_points;
    if(currentPlayer == 'green')
        pawnPoints = green_pawn_points;
    if(currentPlayer == 'blue')
        pawnPoints = blue_pawn_points;
    if(currentPlayer == 'yellow')
        pawnPoints = yellow_pawn_points;
    
    if(pawnPoints[index - 1] > 39) {
        if((pawnPoints[index - 1] - 39) < 5) {
            return pawnPoints[index - 1] - 39;
        } else {
            return 999;
        }
    }
    
    return 0;
}

function pointsReached(name, value) {
    var index = name.split("_")[2];
    
    if(currentPlayer == 'red')
        red_pawn_points[index - 1] += value;
    if(currentPlayer == 'green')
        green_pawn_points[index - 1] += value;
    if(currentPlayer == 'blue')
        blue_pawn_points[index - 1] += value;
    if(currentPlayer == 'yellow')
        yellow_pawn_points[index - 1] += value;
}

function resetPoints(color, index) {
    index = parseInt(index, 10);
    
    if(color == 'red')
        red_pawn_points[index - 1] = 0;
    if(color == 'green')
        green_pawn_points[index - 1] = 0;
    if(color == 'blue')
        blue_pawn_points[index - 1] = 0;
    if(color == 'yellow')
        yellow_pawn_points[index - 1] = 0;
}

window.onload = function() {
    initPawns();
    initPawnsClickFunc();
};

var dice = {
  sides: 6,
  roll: function () {
    var randomNumber = Math.floor(Math.random() * this.sides) + 1;
    return randomNumber;
  }
};

button.onclick = function() {
    var result = dice.roll();
    printNumber(result);

    current_value = result;
    
    button.style.opacity = 0.1;
    button.disabled = true;
    
    if(isBaseFull() && current_value != 6) {
        setTimeout(function(){nextPlayer(); }, 1000);
    }
};

function pushToBoard(name, parentId) {
    $("#" + parentId).prepend("<div id='" + name + "' class='" + currentPlayer + "Pawn'></div>");
    initPawns();
    initPawnsClickFunc();
}


function isClickedBase(pawn) {    
    var i;
    for (i = 1; i < 5; i++) {
        if(pawn.parentNode.contains(document.getElementById("base_" + currentPlayer + "_" + i)))
            return true;
    }
    return false;
}

function isCurrentPlayerPawn(pawn) {
    return pawn.getAttribute('id').includes(currentPlayer);
} 

function isCellTakenByPlayer(cellId) {
    return document.getElementById(cellId).children.length > 0;
}

function nextPlayer() {
    button.style.opacity = 1;
    button.disabled = false;
    
    if(current_value != 6) {
        printNumber('?');
        
        document.getElementById('dice' + toCapitalize(currentPlayer)).style.visibility = "hidden";
        document.getElementById('dice' + toCapitalize(getNextPlayer())).style.visibility = "visible";
        currentPlayer = getNextPlayer();
    }
}

function returnToBase(attributes, pawn) {
    removeClicked(pawn);
    var color = attributes[0];
    var number = attributes[2];
    resetPoints(color, number);
    document.getElementById("base_" + color + "_" + number).parentElement.appendChild(pawn);
}

function interaction(name, pawn) { 
    if(current_value !== 0 && isCurrentPlayerPawn(pawn)) {
        if(current_value == 6 && !spawnTaken() && isClickedBase(pawn)) {
            printNumber('?');
            
            var id = 'cell' + toCapitalize(currentPlayer);
            if(isCellTakenByPlayer(id)) {
                var enemyPawn = document.getElementById(id).firstElementChild;
                if(enemyPawn.getAttribute('id').split("_")[0] != currentPlayer) {
                    returnToBase(enemyPawn.getAttribute('id').split("_"), enemyPawn);
                }
            }
            
            removeClicked(pawn);
            pushToBoard(name, id);
            
            changeSpawnTaken();
            current_value = 0;
            
            button.style.opacity = 1;
            button.disabled = false;
        } else if(!isClickedBase(pawn)) {
            printNumber('?');
                        
            var value = pawn.parentElement.lastChild.textContent;
            switch(value) {
                case '1':
                case '11':
                case '21':
                case '31':
                    changeSpawnTaken();
                    break;
            }
            
            value = parseInt(value, 10);
            var moveCount = getBaseName(((value + current_value) % 41) + ((value + current_value) > 40 ? 1 : 0));
            var idValue = moveCount;

            pointsReached(name, current_value);
            var output = moveToFinalBase(name);
            if(output < 5 && output > 0) {
                idValue = name.charAt(0).toUpperCase() + '' + output;
                moveCount = idValue;
            } else if(output == 999) {
                nextPlayer();
                return;
            }
                        
            if(isCellTakenByPlayer(idValue)) {
                var enemyPawnMove = document.getElementById(idValue).firstElementChild;
                if(enemyPawnMove.getAttribute('id').split("_")[0] != currentPlayer) {
                    returnToBase(enemyPawnMove.getAttribute('id').split("_"), enemyPawnMove);
                } else {
                    return;
                }
            }

            removeClicked(pawn);
            
            pushToBoard(name, moveCount);
            
            nextPlayer();
            current_value = 0;
        }
    }
}

function getBaseName(value) {
    switch(value) {
        case 1:
            return 'cellRed';
        case 11:
            return 'cellGreen';
        case 21:
            return 'cellBlue';
        case 31:
            return 'cellYellow';
        default:
            return value;
    }
}

function getNextPlayer(){
    if(currentPlayer == 'red')
        return 'green';
    else if(currentPlayer == 'green')
        return 'blue';
    else if(currentPlayer == 'blue')
        return 'yellow';
    else if(currentPlayer == 'yellow')
        return 'red';
}

function isBaseFull() {
    return document.getElementById("base_" + currentPlayer + "_1").parentElement.contains(document.getElementById(currentPlayer + '_pawn_1')) && 
        document.getElementById("base_" + currentPlayer + "_2").parentElement.contains(document.getElementById(currentPlayer + '_pawn_2')) && 
        document.getElementById("base_" + currentPlayer + "_3").parentElement.contains(document.getElementById(currentPlayer + '_pawn_3')) && 
        document.getElementById("base_" + currentPlayer + "_4").parentElement.contains(document.getElementById(currentPlayer + '_pawn_4'));
} 

function removeClicked(pawn) {
    pawn.parentNode.removeChild(pawn);
}

function printNumber(number) {
    var currentDice;
    if ($("#diceRed").css("visibility") == "visible") {
        currentDice = document.getElementById('diceRed');
    } else if($("#diceGreen").css("visibility") == "visible") {
        currentDice = document.getElementById('diceGreen');
    } else if($("#diceYellow").css("visibility") == "visible") {
        currentDice = document.getElementById('diceYellow');
    } else if($("#diceBlue").css("visibility") == "visible") {
        currentDice = document.getElementById('diceBlue');
    }
    
    currentDice.innerHTML = number;
}

function toCapitalize(str){
    return str.charAt(0).toUpperCase() + str.substring(1);
}

function spawnTaken(){
    if(currentPlayer == 'red')
        return red_spawn_taken;
    if(currentPlayer == 'green')
        return green_spawn_taken;
    if(currentPlayer == 'blue')
        return blue_spawn_taken;
    if(currentPlayer == 'yellow')
        return yellow_spawn_taken;
}

function changeSpawnTaken(){
    if(currentPlayer == 'red')
        red_spawn_taken = !red_spawn_taken;
    if(currentPlayer == 'green')
        green_spawn_taken = !green_spawn_taken;
    if(currentPlayer == 'blue')
        blue_spawn_taken = !blue_spawn_taken;
    if(currentPlayer == 'yellow')
        yellow_spawn_taken = !yellow_spawn_taken;
}

function initPawns(){
    red_pawn_1 = document.getElementById('red_pawn_1');
    red_pawn_2 = document.getElementById('red_pawn_2');
    red_pawn_3 = document.getElementById('red_pawn_3');
    red_pawn_4 = document.getElementById('red_pawn_4');
    green_pawn_1 = document.getElementById('green_pawn_1');
    green_pawn_2 = document.getElementById('green_pawn_2');
    green_pawn_3 = document.getElementById('green_pawn_3');
    green_pawn_4 = document.getElementById('green_pawn_4');
    blue_pawn_1 = document.getElementById('blue_pawn_1');
    blue_pawn_2 = document.getElementById('blue_pawn_2');
    blue_pawn_3 = document.getElementById('blue_pawn_3');
    blue_pawn_4 = document.getElementById('blue_pawn_4');
    yellow_pawn_1 = document.getElementById('yellow_pawn_1');
    yellow_pawn_2 = document.getElementById('yellow_pawn_2');
    yellow_pawn_3 = document.getElementById('yellow_pawn_3');
    yellow_pawn_4 = document.getElementById('yellow_pawn_4');
}

function initPawnsClickFunc(){
    red_pawn_1.onclick = function() {
        interaction('red_pawn_1', document.getElementById('red_pawn_1'));
    };
    red_pawn_2.onclick = function() { 
        interaction('red_pawn_2', document.getElementById('red_pawn_2'));
    };
    red_pawn_3.onclick = function() {
        interaction('red_pawn_3', document.getElementById('red_pawn_3'));
    };
    red_pawn_4.onclick = function() { 
        interaction('red_pawn_4', document.getElementById('red_pawn_4'));
    };
    
    green_pawn_1.onclick = function() {
        interaction('green_pawn_1', document.getElementById('green_pawn_1'));
    };
    green_pawn_2.onclick = function() { 
        interaction('green_pawn_2', document.getElementById('green_pawn_2'));
    };
    green_pawn_3.onclick = function() {
        interaction('green_pawn_3', document.getElementById('green_pawn_3'));
    };
    green_pawn_4.onclick = function() { 
        interaction('green_pawn_4', document.getElementById('green_pawn_4'));
    };
    
    blue_pawn_1.onclick = function() {
        interaction('blue_pawn_1', document.getElementById('blue_pawn_1'));
    };
    blue_pawn_2.onclick = function() { 
        interaction('blue_pawn_2', document.getElementById('blue_pawn_2'));
    };
    blue_pawn_3.onclick = function() {
        interaction('blue_pawn_3', document.getElementById('blue_pawn_3'));
    };
    blue_pawn_4.onclick = function() { 
        interaction('blue_pawn_4', document.getElementById('blue_pawn_4'));
    };
    
    yellow_pawn_1.onclick = function() {
        interaction('yellow_pawn_1', document.getElementById('yellow_pawn_1'));
    };
    yellow_pawn_2.onclick = function() {
        interaction('yellow_pawn_2', document.getElementById('yellow_pawn_2'));
    };
    yellow_pawn_3.onclick = function() {
        interaction('yellow_pawn_3', document.getElementById('yellow_pawn_3'));
    };
    yellow_pawn_4.onclick = function() {
        interaction('yellow_pawn_4', document.getElementById('yellow_pawn_4'));
    };
}

