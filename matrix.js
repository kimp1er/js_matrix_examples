const range = (start, end, length = end - start + 1) =>
  Array.from({ length }, (_, i) => start + i)


var m;

let canvas = document.getElementById("matrixField"),
  ctx = canvas.getContext("2d"),
  w,
  h

const Tau = Math.PI * 2,
  radius = 3,
  Msqrt = Math.sqrt,
  Mrandom = Math.random;

function handleResize(){
  w = ctx.canvas.width = window.innerWidth;
  h = ctx.canvas.height = window.innerHeight;
  midX = w * .5;
}
window.onresize = () => handleResize();
handleResize();

class Point {
  constructor(x,y,w,h,x1,y1){
    this.p = new Path2D();
    this.x = x
    this.y = y
    this.w = w
    this.h = h
		this.x1 = x1
		this.y2 = y1
    this.p.rect(x,y,w,h)
    this.visible = null
    this.color = 'black'
  }
  draw() {
    ctx.fillStyle = this.color
    this.visible = true
    ctx.fill(this.p)
  }
  clear(p=false) {
		if (p) {
			this.passed = true
		}
    ctx.fillStyle = p ? p : 'white'
    this.visible = false
    ctx.fill(this.p)
  }
}

function drawMatrix(size=5) {
  ctx.clearRect(0,0,w,h)
  return Array.from({length: h / size},
    (_, j) => Array.from({length: w / size }, (_, i) => {
        var getaCoin = Math.round(Math.random() + 0.2) 
        var point = new Point(i * size, j * size, size, size, i, j)
        getaCoin ? point.clear() : point.draw()
        return point
    }
    )
  )
}


let cur_pos = { x: 0, y: 0}
, mx = drawMatrix(20)
, end = mx[40][49]
, path_color = '#33FF99'
, start = mx[cur_pos.x][cur_pos.y]
, step = 20
, passed = '#FFFF99'

function startMatrix(){
  cur_pos = { x: 0, y: 0}
  mx = drawMatrix(20)
  end = mx[40][49]
  path_color = '#33FF99'
  start = mx[cur_pos.x][cur_pos.y]
  step = 20
	start.color = path_color
	start.draw()
	end.color = 'red'
	end.visible = 'win'
	end.draw()
}

startMatrix()

function reconstructionPath(cameFrom, current){
  console.log(cameFrom)
  console.log(current)
}


function getNewPosition(d){
	var x = start.x1,
		y = start.y2,
		color = start.color
		console.log(color)
	
	switch (d) {
		case 'left':
			console.log('left and %s %s', x,y)
			pos = x > 0 ? mx[y][x - 1] : mx[y][x]
			break;
		case 'right':
			console.log('right and %s %s', x,y)
			pos = mx[y][x + 1]
			break;
		case 'up':
			console.log('up and %s %s', x,y)
			pos = y > 0 ? mx[y - 1][x] : mx[y][x]
			break;
		case 'dawn':
			console.log('down and %s %s', x,y)
			pos = mx[y + 1][x]
			break;
	}

	if (!pos.visible || pos.passed){
		[start,  pos] = [pos, start]

		start.color = color
		start.draw()
		pos.clear(passed)

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

function AStar() {
  var q = [start];
  var cameFrom = [];
  while (q.lenght){
    current = q.pop();
    if (current.color == end.color){ 
      return reconstructionPath(cameFrom, current)
    } else if (current.color == 'black') {
      continue
    }

  }
}
