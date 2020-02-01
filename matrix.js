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

window.onresize = () => handleResize();
handleResize();

class Point {
  constructor(x,y,w,h,x1,y1,person=false){
    this.p = new Path2D();
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.x1 = x1
    this.y2 = y1
    this.p.rect(x,y,w,h)
    this.color = 'black'
    this.passed = 'white'
    this.person = person
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
}

function drawMatrix(size=5) {
  ctx.clearRect(0,0,w,h)
  return Array.from({length: h / size},
    (_, j) => Array.from({length: w / size }, (_, i) => {
      var getaCoin = Math.round(Math.random() + 0.2) 
      var point = new Point(i * size, j * size, size, size, i, j)
      getaCoin ? point.clear() : point.show()
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

window.onload = () => startMatrix()


function getNewPosition(d){
  var x = start.x1
    , y = start.y2
    , person = start.person

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

  console.log('Called getNewPosition', start, pos)
  if (!pos.visible){
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


