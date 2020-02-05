const range = (start, end, length = end - start + 1) =>
  Array.from({ length }, (_, i) => start + i)


const clone = obj => JSON.parse(JSON.stringify(obj))


let canvas = document.getElementById("matrixField"),
  ctx = canvas.getContext("2d"),
  drawing_elements = [],
  w,
  h

const Tau = Math.PI * 2,
  radius = 3,
  Msqrt = Math.sqrt,
  Mrandom = Math.random;

function handleResize(){
  w = ctx.canvas.width = window.innerWidth;
  h = ctx.canvas.height = window.innerHeight;
}


class Point {
  constructor({x,y,w,h,x1,y1,wall=false,person=false}){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.x1 = x1;
    this.y1 = y1;
    this.color = wall ? 'black' : 'white';
    this.passed = 'white';
    this.person = person;
    this.visible = false;
    this.wall = wall;
    this.f;
    this.g;
    this.heu;
    this.cost = 1;
    this.visited = false;
    this.closed = false;
    this.parent = null;
  }
  show() {
    this.p || this.path2D
    this.visible = true;
    ctx.fillStyle = this.color;
    this._draw();
  }
  _draw() {
    ctx.fill(this.p || this.path2D);
    if (this.person ) {
      ctx.drawImage(icon, this.x, this.y, this.w, this.h);
    } 
  }
  clear() {
    ctx.fillStyle = this.passed;
    this.visible = false;
    this.wall = false;
    this._draw();
  }
  see() {
    ctx.fillStyle = 'blue';
    this._draw();
  }
  drawWall() {
    this.wall = true;
    this.color = 'black'
    this.show()
  }
  get path2D() {
    this.p = new Path2D();
    this.p.rect(this.x,this.y,this.w,this.h);
  }
  get pos() {
    return {
      x: this.x1,
      y: this.y1,
    }
  }
}

function drawMatrix(size=5) {
  ctx.clearRect(0,0,w,h)
  return Array.from({length: h / size},
    (_, j) => Array.from({length: w / size }, (_, i) => {
      var isWall = Math.round(Math.random() + 0.2) 
      var point = new Point({
        x: i * size,
        y: j * size,
        w: size,
        h: size,
        x1: i,
        y1: j,
        wall: !isWall}
      )
      point.show()
      return point
    }
    )
  )
}

let step = 40
  , mx = drawMatrix(step)
  , start
  , end 
  , path_color = '#33FF99'
  , passed = '#FFFF99'
  , icon = new Image()

icon.src = 'vampire.svg'


function startMatrix(){
  mx = drawMatrix(step);
  current_position = mx[Math.round(h / step)-3][Math.round( w / step)-5];
  end = mx[1][1];
  end.color = 'red';
  end.visible = true;
  end.show();
  current_position.color = path_color;
  current_position.person = icon;
  current_position.visible = true;
  current_position.show();
}



function getNewPosition(direction){
  var x = current_position.x1
    , y = current_position.y1
    , pos;

  switch (direction) {
    case 'left':
      if (mx[y] && mx[y][x - 1])  pos = mx[y][x - 1]
      break;
    case 'right':
      if (mx[y] && mx[y][x + 1]) pos = mx[y][x + 1]
      break;
    case 'up':
      if (mx[y - 1] && mx[y - 1][x]) pos = mx[y - 1][x]
      break;
    case 'down':
      if (mx[y + 1] && mx[y + 1][x]) pos = mx[y + 1][x]
      break;
    case 'clear_up_point':
      if (mx[y - 1] && mx[y - 1][x]) {
        pos = mx[y - 1][x];
        pos.clear()
      }
      break;
    case 'clear_down_point':
      if (mx[y + 1] && mx[y + 1][x]){
        pos = mx[y + 1][x];
        pos.clear()
      }
      break;
    case 'clear_right_point':
      if (mx[y] && mx[y][x + 1]){
        pos = mx[y][x + 1]
        pos.clear()
      }
      break;
    case 'clear_left_point':
      if (mx[y] && mx[y][x - 1]){
        pos = mx[y][x - 1]
        pos.clear()
      }
      break;
    case 'make_wall_up':
      if (mx[y - 1] && mx[y - 1][x]) {
        pos = mx[y - 1][x];
        pos.drawWall()
      }
      break;
    case 'make_wall_down_point':
      if (mx[y + 1] && mx[y + 1][x]){
        pos = mx[y + 1][x];
        pos.drawWall()
      }
      break;
    case 'make_wall_right_point':
      if (mx[y] && mx[y][x + 1]){
        pos = mx[y][x + 1]
        pos.drawWall()
      }
      break;
    case 'make_wall_left_point':
      if (mx[y] && mx[y][x - 1]){
        pos = mx[y][x - 1]
        pos.drawWall()
      }
      break;

  }

  if (pos && !pos.wall) move_person_to(pos);
}

function move_person_to(pos){
  var person = current_position.person;

  if (!pos.wall && pos){
    [current_position,  pos] = [pos, current_position];
    if (person){
      current_position.person = person;
      current_position.color = path_color;
    }
    current_position.show();
    pos.person = false;
    pos.clear();
  } else if (pos === end) { startMatrix() }

}

document.addEventListener('keydown', event => {
  event.key === 'k'? getNewPosition('up') : null;
  event.key === 'j'? getNewPosition('down'): null;
  event.key === 'h'? getNewPosition('left'): null;
  event.key === 'l'? getNewPosition('right'): null;
  event.key === 'w'? getNewPosition('clear_up_point'): null;
  event.key === 's'? getNewPosition('clear_down_point'): null;
  event.key === 'd'? getNewPosition('clear_right_point'): null;
  event.key === 'a'? getNewPosition('clear_left_point'): null;
  event.key === 'W'? getNewPosition('make_wall_up_point'): null;
  event.key === 'S'? getNewPosition('make_wall_down_point'): null;
  event.key === 'D'? getNewPosition('make_wall_right_point'): null;
  event.key === 'A'? getNewPosition('make_wall_left_point'): null;
}, false)


const heap = () => [node => node.f]

const manhattan = (pos1, pos0) => {
  var d1 = Math.abs(pos1.x - pos0.x);
  var d2 = Math.abs(pos1.y - pos0.y);
  return d1 - d2;
}

const euclidian = (pos0, pos1) => {
  return Math.sqrt(
    Math.abs(pos1.x-pos0.x) + Math.abs(pos1.y-pos0.y)
  )
}

function getNeighbors (grid, currentNode, diagonal=false) {
  var ret = [];
  var x = currentNode.y1;
  var y = currentNode.x1;

  // South
  if(grid[x] && grid[x][y-1]) {
    ret.push(grid[x][y-1]);
  }

  // North
  if(grid[x] && grid[x][y+1]) {
    ret.push(grid[x][y+1]);
  }

  if (grid[x-1] && grid[x-1][y]){
    ret.push(grid[x-1][y]);
  }

  if (grid[x+1] && grid[x+1][y]){
    ret.push(grid[x+1][y]);
  }


  if (diagonal) {

    // Southwest
    if(grid[x-1] && grid[x-1][y-1]) {
      ret.push(grid[x-1][y-1]);
    }

    // Southeast
    if(grid[x+1] && grid[x+1][y-1]) {
      ret.push(grid[x+1][y-1]);
    }

    // Northwest
    if(grid[x-1] && grid[x-1][y+1]) {
      ret.push(grid[x-1][y+1]);
    }

    // Northeast
      if(grid[x+1] && grid[x+1][y+1]) {
      ret.push(grid[x+1][y+1]);
    }

  }

  return ret;
}

const deepCopyGrid = (grid) => {
  
}

const search = (grid_source, start, end, heu) => {
  heu = heu || euclidian;
  grid = grid_source

  var openHeap = heap();

  openHeap.push(start);

  while(openHeap.length){
    var currentNode = openHeap.pop();

    if(currentNode === end) {
      var curr = currentNode;
      var ret = [];
      while(curr.parent){
        ret.push(curr);
        curr = curr.parent;
      }
      return ret;
    }

    currentNode.closed = true;

    var neighbors = getNeighbors(grid, currentNode);

    neighbors.forEach(neighbor => {

      if(!(neighbor.closed || neighbor.wall)){

        var gScore = currentNode.g + neighbors.cost;
        var beenVisited = neighbor.visited;

        if(!beenVisited || gScore < neighbors.g){
          neighbors.visited = true;
          neighbor.parent = currentNode;
          neighbor.heu = neighbor.heu || heu(neighbor.pos, end.pos);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.heu;

          if (!beenVisited) {
            openHeap.push(neighbor);
          } else {
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }
    )
  }

  return [];
}

var dest_path = [];
function showPath () {
  dest_path = search(mx, current_position, end, manhattan);
  dest_path.forEach( e => e != end ? e.see() : e.show());
}

function clearPath() {
  mx.forEach(r => r.forEach(n => {
    n.show()
    n.visited = false
    n.closed = false
  }));
}

window.onresize = () => { handleResize(); startMatrix(); }
handleResize();

start_move = null
function stupid_move(timestamp) { 
  if (!start_move) start_move = timestamp;
  var progress = timestamp - start_move;
  if(progress > 2000){
    move_person_to(dest_path.pop());
  }
}

function animates(){
  stupid_move(new Date());
  if (dest_path.length){
    requestAnimationFrame(animates);
  } else {
    cancelAnimationFrame(animates);
  }
}
startMatrix();
function startAnimate(){
  showPath();
  animates();
}

const saveMatrixToLocalStorage = (key='matrix', matrix) => {
  localStorage.setItem(key, JSON.stringify(matrix))
}

const localMatricFromLocalStorage = (key='matrix') => {
  var matrix = JSON.parse(localStorage.getItem(key));
  return Array.from({length: matrix.length}, (_, y) => Array.from({length: matrix[0].length}, (_, x) => {return new Point(matrix[y][x])} ));
}

const loadAndDrawMatrix = (m) => {
  mn = localMatricFromLocalStorage(m);
  if (mn) {
  [mn, mx] = [mx, mn];
   mn.forEach(r => r.forEach(i => i.show()));
  }
}
