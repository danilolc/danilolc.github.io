//############################
//Processing Bezier
//############################
const SSize = 600;
let Scale = 20;

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

    Scale /= 1.004;
    atualiza_tela = true
	
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

        // poly
        strokeWeight(1.7)
        stroke(0)

        let roots = Roots()

        let lp = 0;
        let a = points[1][0];
        // Usa as raízas para saber o domínio da função
        if (roots.length < 3)
            for(let i = Scale*roots[0]; i <= SSize + 1; i++) {

                let x = i / Scale;
                let px = Scale*p(x);

                line(i-1, lp, i, px);
                line(i-1, -lp, i, -px);

                lp = px;

                // A linha só sobe a partir daqui
                if ((3*x*x > -a && x > 0) || (a > 0)) {
                    // Se saiu da tela
                    if (2 * px > SSize) break;
                }

            }
        // Com 3 raízes são duas curvas 
        else {

            // Curva 1
            for(let i = Scale*roots[0]; i <= Scale*roots[1] + 1; i++) {

                let x = i / Scale;
                let px = Scale*p(x);

                line(i-1, lp, i, px);
                line(i-1, -lp, i, -px);

                lp = px;

            }

            // Curva 2
            for(let i = Scale*roots[2]; i <= SSize + 1; i++) {

                let x = i / Scale;
                let px = Scale*p(x);

                line(i-1, lp, i, px);
                line(i-1, -lp, i, -px);

                lp = px;

                // A segunda curva só sobe
                if (px > SSize) break;

            }

        }


        /*let lp = 0;
        for(let i = -SSize; i <= SSize; i++) {

            let x = i / Scale;
            let px = Scale*p(x);

            line(i-1, lp, i, px);
            line(i-1, -lp, i, -px);

            lp = px;

        }*/

        // points
        strokeWeight(10)
        if (a < 0) {

            let x = sqrt(-a/3);
            point(Scale*x, Scale*p(x));
            point(Scale*x, -Scale*p(x));

        }

        /*for (let x of roots)
            point(Scale*x, 0)*/

        strokeWeight(5)
        for(let i = 0; i < points.length; i++) {
            
            (selected == i) ? stroke(0,0,255) : stroke(255,0,0);
            point(points[i][0], points[i][1])

        }
        
        atualiza_tela = false;

    }

}

function p(x) {

    let a = points[1][0];
    let b = points[1][1];

    let k = x*x*x + a*x + b;
    
    if (k > 0)
        return Math.sqrt(k);

    return 0;

}

function P(x) {

    let a = points[1][0];
    let b = points[1][1];

    return x*x*x + a*x + b;

}

function P1(x) {

    let a = points[1][0];

    return 3*x*x + a;
    
}

// Random entre -1 e 1
const random = () => (Math.random() * 2) - 1
const sortNumber = (a, b) => a - b


function Roots() {

    let a = points[1][0];

    let r1 = -0.001;
    let err = 0;
    let i = 0;

    do {
    
        let p1 = P1(r1);
        if (p1 == 0) {
            r1 = random()
            continue;
        }

        err = P(r1) / p1;
        r1 -= err * (1 + random() / 5);
        i++;

    } while (err*err > 0.00001 /*&& i < 1000000*/)

    let A = 1;
    let B = r1;
    let C = r1*r1 + a;

    //let delta = B*B - 4 * A * C;
    let delta = -3 * r1*r1 - 4 * a;

    if (delta < 0)
        return [r1]
    if (delta == 0)
        return [r1, -B / 2].sort(sortNumber)
    
    let sdelta = Math.sqrt(delta)
    return [r1, (-B - sdelta) / 2, (-B + sdelta) / 2].sort(sortNumber)

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

