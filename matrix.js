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
  constructor(x,y,w,h,x1,y1,isWall,person=false){
    this.p = new Path2D();
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.x1 = x1
    this.y1 = y1
    this.p.rect(x,y,w,h)
    this.color = isWall ? 'black' : 'white'
    this.passed = 'white'
    this.person = person
    this.visible = false
    this.wall = isWall
    this.f;
    this.g;
    this.heu;
    this.cost = 1;
    this.visited = false;
    this.closed = false;
    this.parent = null;
  }
  show() {
    this.visible = true
    ctx.fillStyle = this.color
    this._draw()
  }
  _draw() {
    ctx.fill(this.p)
    if (this.person ) {
      ctx.drawImage(this.person, this.x, this.y, this.w, this.h)
    } 
  }
  clear() {
    ctx.fillStyle = this.passed
    this.visible = false
    this._draw()
  }
  see() {
    ctx.fillStyle = 'blue'
    this._draw()
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
      var point = new Point(i * size, j * size, size, size, i, j, !isWall)
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
  start = mx[1][1];
  end = mx[Math.round(h / step)-3][Math.round( w / step)-5];
  end.color = 'red';
  end.visible = true;
  end.show();
  start.color = path_color;
  start.person = icon;
  start.visible = true
  start.show()
}



function getNewPosition(d){
  var x = start.x1
    , y = start.y1

  switch (d) {
      case 'left':
        console.log('left and %s %s', x,y)
        pos = (mx[y][x -1 ] && mx[y]) ? mx[y][x - 1] : mx[y][x]
      break;
      case 'right':
        console.log('right and %s %s', x,y)
        if (mx[y][x+1] && mx[y]) pos = mx[y][x + 1]
      break;
      case 'up':
        console.log('up and %s %s', x,y)
        if (mx[y-1][x]) pos = mx[y - 1][x]
      break;
      case 'dawn':
        console.log('down and %s %s', x,y)
        if (mx[y+1][x]) pos = mx[y + 1][x]
      break;
      }
  move_person_to(pos)
}

function move_person_to(pos){
  var person = start.person

  console.log('Called getNewPosition', start, pos)
  if (!pos.wall){
    [start,  pos] = [pos, start]
    if (person){
      start.person = person
      start.color = path_color
    }
    start.show()
    pos.person = false
    pos.clear()
  } else if (pos === end) { startMatrix() }

}

document.addEventListener('keydown', event => {
  switch (event.key) {
      case 'h':
        getNewPosition('left');
      break
      case 'j':
        getNewPosition('dawn');
      break
      case 'k':
        getNewPosition('up');
      break;
      case 'l':
        getNewPosition('right');
      break;
      }
}, false)


const heap = () => [node => node.f]
const manhattan = (pos0, pos1) => {
  var d1 = Math.abs(pos1.x - pos0.x)
  var d2 = Math.abs(pos1.y - pos0.y)
  return d1 + d2
}

function getNeighbors (grid, currentNode, diagonal=false) {
  var ret = [];
  var x = currentNode.y1;
  var y = currentNode.x1;

  if (grid[x-1] && grid[x-1][y]){
    ret.push(grid[x-1][y])
  }

  if (grid[x+1] && grid[x+1][y]){
    ret.push(grid[x+1][y])
  }

  // South
  if(grid[x] && grid[x][y-1]) {
    ret.push(grid[x][y-1]);
  }

  // North
  if(grid[x] && grid[x][y+1]) {
    ret.push(grid[x][y+1]);
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

const search = (grid, start, end, heu) => {
  heu = heu || manhattan

  var openHeap = heap();

  openHeap.push(start);

  while(openHeap.length){
    var currentNode = openHeap.pop();

    if(currentNode === end) {
      var curr = currentNode;
      var ret = [];
      while(curr.parent){
        ret.push(curr)
        curr = curr.parent
      }
      return ret;
    }

    currentNode.closed = true;

    var neighbors = getNeighbors(grid, currentNode)

    neighbors.forEach(neighbor => {

    if(!(neighbor.closed || neighbor.wall)){

      var gScore = currentNode.g + neighbors.cost;
      var beenVisited = neighbor.visited;

      if(!beenVisited || gScore < neighbors.g){
        neighbors.visited = true;
        neighbor.parent = currentNode;
        neighbor.heu = neighbor.heu || heu(neighbor.pos, end.pos)
        neighbor.g = gScore
        neighbor.f = neighbor.g + neighbor.heu;

        if (!beenVisited) {
          openHeap.push(neighbor)
        } else {
          openHeap.rescoreElement(neighbor)
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
  dest_path = search(mx, start, end, manhattan)
  dest_path.forEach( e => e != end ? e.see() : e.show())
}

function clearPath() {
  mx.forEach(r => r.forEach(n => {
    n.show()
    n.visited = false
    n.closed = false
  }))
}

window.onresize = () => { handleResize(); startMatrix(); }
handleResize();

function stupid_move() { 
  d = new Date();
  if(d % 60 === 0 || d % 30 === 0 ){
    if (dest_path.length) {
      move_person_to(dest_path.pop());
    } else {
      cancelAnimationFrame(animates)
    }
  }
}

function animates(){
  stupid_move();
  requestAnimationFrame(animates);
}
startMatrix()
//animate()
//window.onload = () => animate()
function startAnimate(){
  showPath();
  animates();
}
