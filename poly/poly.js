//############################
//Processing Bezier
//############################
const SSize = 600;

let atualiza_tela = true;

let points = [[0,0], [100,100], [-100,150]]

let dragPoint = false;
let selected = -1;
let trash = false;

// X button
const XX = -SSize / 2 + 50;
const XY = SSize / 2 - 50;
const XR = 10

function setup() {

    var canvas = createCanvas(SSize, SSize);
    canvas.parent('canvasForHTML');


}

// Main Loop
function draw() {
	
    if (atualiza_tela) {

        background(250);
        
        translate(SSize / 2, SSize / 2)
        scale(1,-1)

        strokeWeight(0.3)
        stroke(0)
        
        // axis
        line(-SSize,0,SSize,0)
        line(0,-SSize,0,SSize)

        // axis marks
        for(let i = -SSize; i <= SSize; i += SSize / 20) {
            line(-4,i,4,i)
            line(i,-4,i,4)
        }

        // delete button
        trash? stroke(255,0,0) : stroke(200);
        strokeWeight(2)
        circle(XX, XY, XR * 4)
        strokeWeight(6)
        line(XX - XR, XY - XR, XX + XR, XY + XR);
        line(XX + XR, XY - XR, XX - XR, XY + XR);

        // points
        strokeWeight(0.2)
        stroke(0)
        let lp = 0;
        for(let x = -SSize; x <= SSize; x++) {

            let px = p(x);
            line(x-1, lp, x, px);
            lp = px;

        }

        // poly
        strokeWeight(5)
        for(let i = 0; i < points.length; i++) {
            
            (selected == i) ? stroke(0,0,255) : stroke(255,0,0);
            point(points[i][0], points[i][1])

        }
        
        atualiza_tela = false;

    }

}

function p(x) {

    let n = points.length;
    let sum = 0;

    for(let i = 0; i < n; i++) {

        let mul = 1;
        for(let j = 0; j < n; j++) {

            if (j !== i) mul *= (x - points[j][0]) / (points[i][0] - points[j][0]);            

        }

        mul *= points[i][1];
        sum += mul;

    }

    return sum;

}

function mousePressed(event) {

    const DIST = 15;

    if (mouseX < 0 || mouseX > SSize) return;
    if (mouseY < 0 || mouseY > SSize) return;

    let mx = mouseX - SSize / 2;
    let my = mouseY - SSize / 2;
    my = -my;

    for(let i = 0; i < points.length; i++) {

        if (abs(mx - points[i][0]) < DIST && abs(my - points[i][1]) < DIST) {

            selected = i;
            dragPoint = true;
            atualiza_tela = true;
            return;

        }

    }

    if (event.button == 0) { // Primeiro botão do mouse

        points.push([mx, my]);

        if ((mx - XX)*(mx - XX) + (my - XY)*(my - XY) < XR * XR * 4)
            trash = true;
        else
            trash = false;

        selected = points.length - 1;
        dragPoint = true;
        atualiza_tela = true;

    }


}

function mouseReleased() {

    if (dragPoint) {

        if(trash) points.splice(selected, 1);

        selected = -1;
        dragPoint = false;
        trash = false;
        atualiza_tela = true;

    }
}

function mouseDragged() {

    if (dragPoint) {

        var mx = mouseX
        if (mx < 0) mx = 0;
        if (mx > SSize) mx = SSize;

        var my = mouseY
        if (my < 0) my = 0;
        if (my > SSize) my = SSize;

        mx -= SSize / 2;
        my -= SSize / 2;
        my = -my;

        if ((mx - XX)*(mx - XX) + (my - XY)*(my - XY) < XR * XR * 4)
            trash = true;
        else
            trash = false;

        points[selected][0] = mx;
        points[selected][1] = my;

        atualiza_tela = true;

    }
}

