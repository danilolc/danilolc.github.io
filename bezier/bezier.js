//############################
//Processing Bezier
//############################

const ScreenX = 640;
const ScreenY = 480;

// [X, Y, W]
const LISTA_FOCOS_INICIAL = [

    [50,  202, 1],
    [73,  341, 1],
    [242, 451, 1],
    [553, 357, 1],
    [556, 119, 1],
    [242, 51,  1],

];

var lista_focos = LISTA_FOCOS_INICIAL.slice().map(x => x.slice())

var drag = false;
var selected = 1;

var desenha_hull = false;
var casteljau_point = false;
var casteljau_t = 0.5;

var atualiza_tela = true;

var epsilon = 1;

// Operações com pontos e vetores
const add = (p1, p2) => [p1[0] + p2[0], p1[1] + p2[1]]
const sub = (p1, p2) => [p1[0] - p2[0], p1[1] - p2[1]]
const mult = (k, p) => [k*p[0], k*p[1]]
const vecp = (v1, v2) => v1[0]*v2[1] - v1[1]*v2[0]
const dotp = (v1, v2) => v1[0]*v2[0] + v1[1]*v2[1]

// Operações com pontos e vetores 3d
const add3 = (p1, p2) => [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]]
const sub3 = (p1, p2) => [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]]
const mult3 = (k, p) => [k*p[0], k*p[1], k*p[2]]
const vecp3 = (v1, v2) => [ v1[1]*v2[2] - v1[2]*v2[1], v1[2]*v2[0] - v1[0]*v2[2], v1[0]*v2[1] - v1[1]*v2[0] ]
const dotp3 = (v1, v2) => v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2]

// a! / b!
function product_Range(a, b) {

  var prd = a;
  var i = a;
 
  while (i++ < b) {
    prd *= i;
  }

  return prd;

}

// Combinações n escolhe r
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

//https://en.m.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
function convex_hull(_points) {

    const compare = (p1, p2) => {
    
        if (p1[0] < p2[0]) return true;
        else if (p1[0] > p2[0]) return false;
        return p1[1] < p2[1];

    } 

    var P = _points.slice()
    var L = []
    var U = []
    var n = P.length

    P.sort(compare)
    
    for (var i = 0; i < n; i++) {

        while (1) {

            var l = L.length;
            if (l < 2)
                break

            var v1 = sub(L[l-2], L[l-1])
            var v2 = sub(P[i],   L[l-1])

            if (vecp(v1, v2) < 0)
                break;

            L.pop();

        }
        
        L.push(P[i])

    }

    L.pop();

    for (var i = n-1; i >= 0; i--) {

        while (1) {

            var l = U.length;
            if (l < 2)
                break

            var v1 = sub(U[l-2], U[l-1])
            var v2 = sub(P[i],   U[l-1])

            if (vecp(v1, v2) < 0)
                break;

            U.pop();

        }
        
        U.push(P[i])

    }

    U.pop();

    return L.concat(U);

}

// Exercise 6.21 Degree raising
function acrescentar_ponto() {

    var n = lista_focos.length - 1
    B = lista_focos.map(p => [p[0] * p[2], p[1] * p[2], p[2]])
    C = Array(n+2)
    
    C[0] = B[0]
    C[n+1] = B[n]
    for (var i = 1; i <= n; i++) {
        var a = i / (n+1)
        C[i] = add3(mult3(1-a, B[i]), mult3(a, B[i-1]))
    }

    lista_focos = C.map(p => [p[0] / p[2], p[1] / p[2], p[2]]);
    set_weight(lista_focos[selected][2])
    atualiza_tela = true;

}

function casteljau(_lista, t, bleft, bright) { // Função recursiva que diminui o tamanho da lista até sobrar um ponto

    let lista = _lista.map(p => [p[0] * p[2], p[1] * p[2], p[2]])
    let len = lista.length;

    while (1) {

        //Vai salvando os pontos de Bleft e Bright em seus vetores
        if (bleft != undefined)
            bleft.push(lista[0].slice())
        if (bright != undefined)
            bright.push(lista[len-1].slice())

        if (len <= 1)
            break;

        var lista2 = []
        for (var i = 0; i < len - 1; i++) {
            lista2.push(add3(mult3(1-t, lista[i]), mult3(t, lista[i+1])))
        }

        lista = lista2;
        len -= 1;

    }

    const trans = l => {
        for(let i = 0; i < l.length; i++) {
            l[i][0] /= l[i][2];
            l[i][1] /= l[i][2];
        }
    }

    if (bleft != undefined)
        trans(bleft)
    if (bright != undefined)
        trans(bright)
    trans(lista)

    return lista[0];

}

function corta_em_t() {

    var bleft = []
    //var weighted_list = lista_focos.map(p => [p[0] * p[2], p[1] * p[2], p[2]])
    casteljau(lista_focos, casteljau_t, bleft)

    lista_focos = bleft
    
    set_weight(lista_focos[selected][2])
    atualiza_tela = true;

}


function draw_square(x, y, rad) {

    square(x - rad, y - rad, 2*rad);
    line(x - rad, y - rad, x + rad, y + rad);
    line(x - rad, y + rad, x + rad, y - rad);

}

function desenha_foco(p, i) {

    strokeWeight(1.5);
    
    stroke(selected == i? color(180,0,0) : color(0,180,0));
    noFill();
    
    var rad = (selected == i && drag)? 10 : 6;

    draw_square(p[0], p[1], rad)

}

/*
function desenha_curva1(lista, resolucao) {

    const f = (t) => { // Define o f(t) da curva

        var x = 0;
        var y = 0;
        var n = lista.length - 1
        var SB = 0;

        lista.map((p, i) => {

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

    var p0 = lista[0]

    do { // Desenha linhas de p0 até p1

        if (t > 1) t = 1;
        var p1 = f(t)
        line(p0[0], p0[1], p1[0], p1[1]);
        p0 = p1; // Salva o valor de f(t) para a próxima iteração

        t += dist

    } while (t < 1 + dist)

}
*/

/*function quase_reta_fast(lista, eps) {

    // ||u - prog(v, u)|| < eps  <==> dot(v,v)*dot(u,u) - dot(u,v)^2 < eps*dot(v,v)

    var len = lista.length
    if (len <= 2)
        return true;

    var B = lista[0]
    var A = lista[len - 1]

    // Pre calcula os valores comuns
    var v = sub(A, B)
    var vdv = dotp(v,v)
    if (vdv == 0)
        return false
    var epv = eps*vdv

    for (var i = 1; i < len - 1; i++) {
        var u = sub(lista[i], B)
        var udu = dotp(u,u)
        var udv = dotp(u,v)
        if (vdv*udu - udv*udv > epv)
            return false; //Não é reta
    }

    return true

}*/

function set_weight(w) {

    document.getElementById('w').innerHTML = 'w = ' + str(floor(w*100)/100);
    lista_focos[selected][2] = w;

    document.getElementById('iw').value = w*100;

}

function quase_reta(lista, eps) {

    // Retorna falso se algum ponto tem dist^2 maior que eps da reta

    var len = lista.length
    if (len <= 2)
        return true;

    var B = lista[0]
    var A = lista[len - 1]

    if (A[0] == B[0] && A[1] == B[1])
        return false

    // Testa para cada ponto no interior da lista
    for (var i = 1; i < len - 1; i++) {
        var P = lista[i]

        var u = sub(P, B)
        var v = sub(A, B)

        // Calcula o tamanho da projeção de u em v
        var proj = mult( dotp(u,v)/dotp(v,v), v )
        var perp = sub( u, proj )

        if (dotp(perp, perp) > eps)
            return false; //Não é reta

    }

    return true

}

// Desenha linha ligando os pontos da lista
function draw_control_polygon(lista) {    

    var len = lista.length
    if(len <= 1) return 

    for (var i = 1; i < len; i++) {

        var p0 = lista[i-1]
        var p1 = lista[i]
        line(p0[0], p0[1], p1[0], p1[1]);

    }
}

// Função recursiva que desenha a curva com o método descrito sessão 6.10.1
function desenha_curva2(lista, eps) {

    if (quase_reta(lista, eps))
        return draw_control_polygon(lista)

    var bleft = []
    var bright = []
    //var weighted_list = lista.map(p => [p[0] * p[2], p[1] * p[2], p[2]])
    casteljau(lista, 0.5, bleft, bright)

    desenha_curva2(bleft, eps)
    desenha_curva2(bright, eps)
    
    atualiza_tela = true;

}

function setup() {

    var canvas = createCanvas(ScreenX, ScreenY);
    canvas.parent('canvasForHTML');

    set_weight(lista_focos[selected][2])

}

// Main Loop
function draw() {
	
    if (atualiza_tela) {
        
        noStroke();
        fill(color(250,250,250))
        rect(0, 0, ScreenX, ScreenY);

        if (desenha_hull) {
    
            var hull = convex_hull(lista_focos);

            fill(color(230,230,230))
            beginShape();
            hull.map(p => vertex(p[0], p[1]))
            endShape(CLOSE);

        }

        strokeWeight(1.5);

        if (quase_reta(lista_focos, epsilon))
            stroke(color(100,200,100));
        else
            stroke(color(255,200,100));
        
        desenha_curva2(lista_focos, epsilon)


        lista_focos.map(desenha_foco)

        if (casteljau_point) {
            var point = casteljau(lista_focos, casteljau_t);

            strokeWeight(1);
            stroke(color(0,0,150));
            draw_square(point[0], point[1], 3)

        }


        atualiza_tela = false;

    }

}

function deletar_ponto() {

    if (lista_focos.length > 2) {

        lista_focos.splice(selected, 1);

        if (selected >= lista_focos.length)
            selected = lista_focos.length - 1;

        set_weight(lista_focos[selected][2])

        atualiza_tela = true;

    }

}

/*function keyPressed() {

    if (keyCode === DELETE) deletar_ponto()

}*/


function mousePressed(event) {
    
    const DIST = 15;

    lista_focos.map((p, i) => {

        if (abs(mouseX - p[0]) < 7 && abs(mouseY - p[1]) < 7) {

            selected = i;
            set_weight(lista_focos[selected][2])

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

        //var weight = lista_focos[selected][2]

        lista_focos[selected][0] = mx;
        lista_focos[selected][1] = my;

        atualiza_tela = true;

    }
}

