//############################
//Processing Bezier
//############################


const ScreenX = 640;
const ScreenY = 480;

var drag = false;
var selected = 1;

var atualiza_tela = true;

function product_Range(a, b) {

  var prd = a;
  var i = a;
 
  while (i++ < b) {
    prd *= i;
  }

  return prd;

}

function comb(n, r) {

    if (n < r)
        return 0;
    if (r < 0)
        return 0;
  
    if (n==r)
        return 1;
  
    r = (r < n - r) ? n - r : r;
    return product_Range(r + 1, n) / product_Range(1, n - r);

}


var lista_focos = [

    [50, 202],
    [110, 320],
    [320, 220],
    [480, 120],
    [640, 480],

];

function draw_square(x, y, rad) {

    square(x - rad, y - rad, 2*rad);
    line(x - rad, y - rad, x + rad, y + rad);
    line(x - rad, y + rad, x + rad, y - rad);

}

function desenha_focos(p, i) {

    strokeWeight(1.5);
    
    stroke(selected == i? color(180,0,0) : color(0,180,0));
    noFill();
    
    var rad = (selected == i && drag)? 10 : 6;

    draw_square(p[0], p[1], rad)

}

function desenha_curva(resolucao) {

    strokeWeight(1);
    stroke(color(0,0,0));

    const f = (t) => { // Define o f(t) da curva

        var x = 0;
        var y = 0;
        var n = lista_focos.length - 1
        var SB = 0;

        lista_focos.map((p, i) => {

            if (i == 0) var B = pow(1-t, n) // Teve que separar os casos por causa do problema de 0^0
            else if (i == n) var B = pow(t, n)
            else var B = comb(n, i) * pow(1-t, n-i) * pow(t, i) // Depende só do i, n, t    

            x += B*p[0];
            y += B*p[1];

            SB += B;

        })

        //console.log("Soma B:",SB) // Confere se a soma dos Bs dá 1

        return [x, y];

    }

    var dist = 1/resolucao

    var t = dist;

    var p0 = lista_focos[0]

    do { // Desenha linhas de p0 até p1

        var p1 = f(t)
        line(p0[0], p0[1], p1[0], p1[1]);
        p0 = p1; // Salva o valor de f(t) para a próxima iteração

        t += dist

    } while (t < 1 + dist)

}


function setup() {

    var canvas = createCanvas(ScreenX, ScreenY);
    canvas.parent('canvasForHTML');

}

function draw() {
	
    if (atualiza_tela) {
        
        fill(color(250,250,250))
        rect(0, 0, ScreenX, ScreenY);

        desenha_curva(50)
        lista_focos.map(desenha_focos)


        atualiza_tela = false;

    }

}

function keyPressed() {
    if (keyCode === DELETE) {

        if (lista_focos.length > 2) {

            lista_focos.splice(selected, 1);
            atualiza_tela = true;

        }
    } 
}


function mousePressed(event) {
    
    const DIST = 9;

    lista_focos.map((p, i) => {

        if (abs(mouseX - p[0]) < 7 && abs(mouseY - p[1]) < 7) {

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

        lista_focos[selected] = [mx, my];

        atualiza_tela = true;

    }
}

