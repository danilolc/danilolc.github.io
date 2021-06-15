//############################
//Processing Max Flow Min Cut
//############################

const ScreenX = 640;
const ScreenY = 480;

let atualiza_tela = true;

let drag = false;
let img;

let img2;
let segmented = false;

let selectors = [[20, 20], [ScreenX - 20, ScreenY - 20]]
let selected = -1;

function draw_square(x, y, rad) {

    square(x - rad, y - rad, 2*rad);
    line(x - rad, y - rad, x + rad, y + rad);
    line(x - rad, y + rad, x + rad, y - rad);

}

function draw_selector(x, y) {

    strokeWeight(2);
    noFill();

    stroke(0,0,0);
    draw_square(x+2, y+2, 6);

    stroke(255,255,255);
    draw_square(x, y, 6);

}

function min_cut() {

    img2.loadPixels();
    for (let i = 0; i < img2.width; i++) {
      for (let j = 0; j < img2.height; j++) {
        img2.set(i, j, color(brightness( img2.get(i,j) )*255, 0,0  ) );
      }
    }
    img2.updatePixels();

    segmented = true;
    atualiza_tela = true;

}

function preload() {

    img = loadImage('https://happycoding.io/images/stanley-1.jpg');

}

function dists(a,b) {

    if (a == b) return 5

    return abs(a-b) //max 2.55

}


function bfs(RL, UD, s, t, parent) {

    let visited = Array(img.width * img.height).fill(0)

    let q = new FastPriorityQueue((a,b) => a.dist < b.dist);
    q.add({dist: 0, edge: s});
    visited[s] = 1;
    parent[s] = -1;

    while(!q.isEmpty()) {
        let u = q.poll().edge

        let i = u % img.width;
        let j = floor(u / img.width);

        let neigs = [];
        if (i > 0) neigs.push(u-1)
        if (i < img.width - 1) neigs.push(u+1)
        if (j > 0) neigs.push(u - img.width)
        if (j < img.height - 1) neigs.push(u + img.width)

        for (let v of neigs) {
            
            if(visited[v] == 0) {

                if (v == t) {
                    parent[v] = u;
                    return true;
                }

                q.add({dist: (abs(u - v) == img.width)? 1/UD[v] : 1/RL[v], edge: v});
                parent[v] = u;
                visited[v] = 1;

            }

        }

    }


}

function ffs() {

    let pix = Array(img.width * img.height)

    img.loadPixels();
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        pix[i+j*img.width] = (brightness(img.get(i, j)));
      }
    }
    img.updatePixels();

    let RL  = Array(img.width * img.height)
    let UD = Array(img.width * img.height)
    
    for (let i = 0; i < img.width; i++) {
      for (let j = 0; j < img.height; j++) {
        if (i+1 != img.width)
            RL[i+j*img.width] = dists(pix[i+j*img.width], pix[i+1+j*img.width]);
        if (j+1 != img.height) 
            UD[i+j*img.width] = dists(pix[i+j*img.width], pix[i+(j+1)*img.width]);
      }
    }



    let s = 1;
    let t = img.height*img.width-1;

    let parent = Array(img.width * img.height).fill(-1)
    bfs(RL, UD, s, t, parent);

    img2.loadPixels();
    for (let v = t; v != s; v = parent[v]) {
        if (v == -1) break;

        let i = v % img.width;
        let j = floor(v / img.width);
        img2.set(i, j, color(0,255,0) );

    }
    img2.updatePixels();

    segmented = true;
    atualiza_tela = true;


    return pix

}

//bfs
//var x = new FastPriorityQueue();
//x.add(0);
//x.pool();
//while(!x.isEmpty())
//x.trim()


function setup() {

    img2 = createImage(img.width, img.height);

    var canvas = createCanvas(ScreenX, ScreenY);
    canvas.parent('canvasForHTML');

}

// Main Loop
function draw() {
	
    if (atualiza_tela) {
    
        if (segmented) {

            image(img2, 0, 0, ScreenX, ScreenY);
            selectors.map(s => draw_selector(s[0],s[1]))
            
            segmented = false;

        } else {

            image(img, 0, 0, ScreenX, ScreenY);
            selectors.map(s => draw_selector(s[0],s[1]))

        }

        atualiza_tela = false;

    }

}

/*function keyPressed() {

    if (keyCode === DELETE) deletar_ponto()

}*/


function mousePressed(event) {

    selectors.map((p, i) => {

        if (abs(mouseX - p[0]) < 15 && abs(mouseY - p[1]) < 15) {

            selected = i;
            drag = true;
            atualiza_tela = true;

        }

    })

}

function mouseReleased() {

    if (drag) {

        drag = false;
        atualiza_tela = true;

    }
}

function mouseDragged() {

    if (drag) {

        var mx = mouseX
        if (mx < 0) mx = 0;
        if (mx > ScreenX) mx = ScreenX;

        var my = mouseY
        if (my < 0) my = 0;
        if (my > ScreenY) my = ScreenY;

        selectors[selected] = [mx, my];

        atualiza_tela = true;

    }
}

