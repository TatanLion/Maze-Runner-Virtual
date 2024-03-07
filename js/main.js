/**
 * @type {HTMLCanvasElement}
**/

// console.log(maps);

const canvas = document.querySelector('#game') //Seleccionamos el canvas
const game = canvas.getContext('2d') //Indicamos que será en 2D

//Botones para mover
const btnUp = document.querySelector('#up')
const btnLeft = document.querySelector('#left')
const btnRight = document.querySelector('#right')
const btnDown = document.querySelector('#down')

const spanLives = document.querySelector('#lives')
const spanTime = document.querySelector('#time')
const spanRecord = document.querySelector('#record')
const pResult = document.querySelector('#result')

let canvasSize
let elementsSize

//Para darle la posición al personaje, pero como no lo sabemos aún lo haremos en donde este la puerta que siempre sera nuestro punto de inicio por ende le damos la posición cuando se renderiza el mapa

const playerPosition = {
    x: undefined,
    y: undefined,
}

const fishPosition = {
    x: undefined,
    y: undefined
}

let enemyPositions = []
let level = 0
let lives = 3

let timeStart
let timePLayer
let timeInterval

window.addEventListener('load', setCanvasSize)
window.addEventListener('resize', setCanvasSize)
window.addEventListener('keydown', moveByKeys)

function startGame(){

    //Le damos un tamaño de acuerdo al tamaño del canvas
    game.font = elementsSize + 'px Verdana'
    game.textAlign = 'end'
    game.textBaseline = 'center'

    //Vamos a imprimir las bombas -- Se usa el doble for para la forma horizontal y vertical
    // for(let x = 1; x <= 10; x++){
    //     for(let y = 1; y <= 10; y++){
    //         game.fillText(emojis['X'], elementSize * x, elementSize * y)
    //     }
    // }

    
    const map = maps[level];

    //Validar si ya no existe ningún mapa y mandar funcion de ganar juego
    if(!map){
        gameWin()
        return
    }

    //Darle el valor de tiempo actual para calcular el tiempo jugado
    if(!timeStart){
        timeStart = Date.now()
        timeInterval = setInterval(showTime, 100)
        showRecord()
    }

    const mapRows = map.trim().split('\n');
    const mapRowCols = mapRows.map(row => row.trim().split(''));
    // console.log({map, mapRows, mapRowCols});

    enemyPositions = []
    game.clearRect(0, 0, canvasSize, canvasSize)

    mapRowCols.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            const emoji = emojis[col];
            const posX = elementsSize * (colI + 1);
            const posY = elementsSize * (rowI + 1);
            // const posX = elementsSize * (colI + 1);
            // const posY = elementsSize * (rowI + 1);
            game.fillText(emoji, posX, posY);

            //Saber en cual esta la puerta para saber la posición del personaje
            if(col == 'O'){
                if(!playerPosition.x && !playerPosition.y){
                    playerPosition.x = Math.trunc(posX)
                    playerPosition.y = Math.trunc(posY)
                }
            }
            if(col == 'I'){
                fishPosition.x = Math.trunc(posX)
                fishPosition.y = Math.trunc(posY)
            }
            if(col == 'X'){
                enemyPositions.push({
                    x: Math.trunc(posX),
                    y: Math.trunc(posY)
                })
            }
        });
    });

    // console.table(`Player X: ${playerPosition.x} -- Player Y: ${playerPosition.y}, -- Canvas W: ${canvas.width} -- Canvas H: ${canvas.height} -- Ele Size: ${elementsSize} -- FishP X: ${fishPosition.x} -- FishP Y: ${fishPosition.y}`);

    movePLayer()
    showLives()
    //Estas medidas no nos serviran ya que nosotros necesitamos un cuadrado
    // canvas.setAttribute('width', window.innerWidth * 0.80) //Esto nos dará el ancho pero no lo ocupara todo
    // canvas.setAttribute('height', window.innerHeight * 0.50) //Esto nos dará el alto pero no lo ocupara todo

    //Crear y Borrar figuras
    // game.fillRect(0, 0, 100, 100) //El lugar donde iniciara y terminara (x, y, ancho, alto)
    // game.clearRect(0, 0, 50, 50) //Borrar cierta parte del rectangulo que se creo
    // game.clearRect(50, 50, 50, 50) //Borrar cierta parte del rectangulo que se creo

    //Mostrar texto y manipular texto
    // game.font = '25px Verdana'
    // game.fillStyle = 'purple'
    // game.textAlign = 'start' //En este caso esto estará atado a el lugar de la ubicación que le dimos al texto
    // game.fillText('Soy un texto', 75, 50)
}

function movePLayer(){

    //Confirmamos que haya colisión tanto en Y como en X para pasar de nivel
    const fishColisionX = Math.trunc(playerPosition.x) == Math.trunc(fishPosition.x)
    const fishColisionY = Math.trunc(playerPosition.y) == Math.trunc(fishPosition.y)
    if(fishColisionX && fishColisionY){
        levelWin()
    }

    const enemyCollision = enemyPositions.find(enemy => {
        const enemyCollisionX = Math.trunc(enemy.x) == Math.trunc(playerPosition.x)
        const enemyCollisionY = Math.trunc(enemy.y) == Math.trunc(playerPosition.y)
        return enemyCollisionX && enemyCollisionY
    })
    if(enemyCollision){
        levelFail()
    }

    game.fillText(emojis['PLAYER'], playerPosition.x, playerPosition.y)
}

function levelWin(){
    // console.log('Hubo colision y pasas de nivel');
    level++
    startGame()
}

function gameWin(){
    console.log('Se termino el juego');
    clearInterval(timeInterval)

    //Validar record
    const recordTime = localStorage.getItem('record-time')
    const playerTime = Date.now() - timeStart;

    if(recordTime){
        if(recordTime >= playerTime){
            localStorage.setItem('record-time', playerTime)
        }
    }else{
        localStorage.setItem('record-time', playerTime)
    }
    console.log({recordTime, playerTime});
}


function levelFail(){
    //Colocamos la posicion del jugador tanto en X como en Y como undefined y llamamos la funcion que renderiza nuevamente todo
    lives--;
    if(lives <= 0){
        level = 0
        lives = 3
        timeStart = undefined
    }
    playerPosition.x = undefined
    playerPosition.y = undefined
    startGame()
    // console.log(`Lives: ${lives} -- Level: ${level}`);
}

function showLives(){
    spanLives.innerHTML = emojis["HEART"].repeat(lives)
}

function showTime(){
    spanTime.innerHTML = timeFormat(Date.now() - timeStart);
}

function showRecord(){
    spanRecord.innerHTML = timeFormat(localStorage.getItem('record-time'))
}

function timeFormat(time_msec){
    const time = ~~(time_msec /1000);
    const min = (time / 60) | 0;
    const sec =  time - (min * 60);    
    const msec = ((time_msec / 10) | 0) - (time * 100);
    return min +':'+ ((sec < 10 ? '0' : 0) + sec) + ':' + ((msec < 10 ? '0' : 0) + msec);
}

function setCanvasSize(){
    if(window.innerHeight > window.innerWidth){
        canvasSize = Math.trunc(window.innerWidth * 0.7);
    }else{
        canvasSize = Math.trunc(window.innerHeight * 0.7);
    }
    //Basado en las medidas tomadas anteriormente se definira un cuadrado siempre para el canvas, con esto se logra que sea "responsive"
    canvas.setAttribute('width', canvasSize)
    canvas.setAttribute('height', canvasSize)
    
    elementsSize = Math.trunc((canvasSize / 10) - 1);
    // console.log({canvasSize, elementsSize});

    playerPosition.x = undefined
    playerPosition.y = undefined

    startGame()
}

btnUp.addEventListener('click', moveUp)
btnLeft.addEventListener('click', moveLeft)
btnRight.addEventListener('click', moveRight)
btnDown.addEventListener('click', moveDown)

function moveUp(){
    if((playerPosition.y - elementsSize) < elementsSize) return
    // console.log('Arriba')
    playerPosition.y -= elementsSize;
    startGame()
}
function moveLeft(){
    if((playerPosition.x - elementsSize) < elementsSize) return
    // console.log('Izquierda');
    playerPosition.x -= elementsSize;
    startGame()
}
function moveRight(){
    if((playerPosition.x + elementsSize) > canvasSize) return
    // console.log('Derecha');
    playerPosition.x += elementsSize;
    startGame()
}
function moveDown(){
    if((playerPosition.y + elementsSize) > canvasSize) return
    // console.log('Abajo');
    playerPosition.y += elementsSize;
    startGame()
}

function moveByKeys(e){
    // console.log(e);
    if(e.keyCode == 37) moveLeft()
    if(e.keyCode == 38) moveUp()
    if(e.keyCode == 39) moveRight()
    if(e.keyCode == 40) moveDown()
}