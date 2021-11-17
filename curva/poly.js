//############################
//Processing Bezier
//############################
const P = 97;
const SSize = P*8;

const mod = (x, n) => ((x % n) + n) % n;

// y^2 = x^3 + ax + b
const A = -1;
const B = 1;

let P1 = [-1, -1];
let P2 = [-1, -1];
let P3 = [-1, -1];

// a^e
function pow2(a, e) {

    let r = 1;
    let binStr = e.toString(2);

    for (let i = binStr.length - 1; i >= 0; i--) {

        if(binStr[i] == '1') {
            r = mod(r*a, P);
        }

        a = mod(a*a, P);

    }

    return r;

}

// a/b mod P
function divide(a, b) {

    if (b == 0) {
        console.log("Division by 0")
        return a/0;
    }

    return mod(a * pow2(b, P-2), P)

}

// P + P
function double(p) {

    if(p[1] == 0) return [-1, -1];

    let l = divide(3*p[0]*p[0] + A, 2*p[1]);

    let x = mod(l*l - 2*p[0], P);
    let y = mod(l*(p[0] - x) - p[1], P);

    return [x, y];

}

// p1 + p2
function oper(p1, p2) {

    // O + p2 = p2
    if (p1[0] == -1) return p2;

    // p1 + O = p1
    if (p1[0] == -1) return p1;

    if (p1[0] == p2[0]) {
        
        if (p1[1] == p2[1]) return double(p1);
        else return [-1, -1]

    }

    // (x,y) + (a,b)
    let l = divide(p2[1]-p1[1], p2[0]-p1[0]);

    let x = mod(l*l - p1[0] - p2[0], P);
    let y = mod(l*(p1[0] - x) - p1[1], P);

    return [x, y];

}

// k*P
function multp(k, p) {

    let r = [-1, -1];

    let binStr = k.toString(2);

    for (let i = binStr.length - 1; i >= 0; i--) {

        if(binStr[i] == '1') {
            r = oper(r, p);
        }
        
        p = double(p);

    }

    return r;

}

const isOnCurve = (x, y) => pow2(y, 2) == mod(pow2(x, 3) + A*x + B, P);

function setup() {

    var canvas = createCanvas(SSize, SSize);
    canvas.parent('canvasForHTML');


}

function squa(x, y) {

    if (x == P1[0] && y == P1[1])
        fill(200, 0, 0);
    else if (x == P2[0] && y == P2[1])
        fill(0, 180, 0);
    else if (x == P3[0] && y == P3[1])
        fill(0, 0, 200);
    else
        fill(51);

    square(x*SSize / P, y*SSize / P, SSize / P)

}

function drawline(p1, p2) {

    let a = SSize / P;
    let b = a / 2;

    stroke(50)
    line(p1[0]*a+b, p1[1]*a+b, p2[0]*a+b, p2[1]*a+b)


}


let drawn = false;

// Main Loop
function draw() {

    if (!drawn) {

        background(250);

        translate(0, SSize);
        scale(1, -1);

        //line(0.1, 0.1, 0.9, 0.9);

        strokeWeight(1);
        stroke(220)
        for(let i = 0; i < P; i++) {

            line(SSize * i / P, 0, SSize * i / P, SSize);
            line(0, SSize * i / P, SSize, SSize * i / P);

        }

        noStroke();

        for(let x = 0; x < P; x++) {
            for(let y = 0; y < P; y++) {

                if (isOnCurve(x, y))
                    squa(x, y);

            }
        }

        if (point_selected)
            drawline(P1, P2);

        drawn = true;
    }

}

let pressing = false;
let point_selected = false;

function mousePressed() {

    let x = mouseX;
    let y = SSize - mouseY;

    x = floor(x * P / SSize);
    y = floor(y * P / SSize);

    if (isOnCurve(x, y)) {

        P1 = [x,y];
        P2 = [-1, -1];
        P3 = [-1, -1];

        drawn = false;
        pressing = true;
        point_selected = false;

    }

}

function mouseReleased() {

    let x = mouseX;
    let y = SSize - mouseY;

    x = floor(x * P / SSize);
    y = floor(y * P / SSize);

    if (isOnCurve(x, y)) {

        P2 = [x, y];
        P3 = oper(P1, P2);

        point_selected = true;
        console.log(P1, P2, P3)

    } else {

        P1 = [-1, -1]
    
    }
  
    drawn = false;
    pressing = false;

}