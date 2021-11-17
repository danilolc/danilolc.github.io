

/*class Curva {

    constructor(t) {

    }

    doublep(P) {

    }

    addp(P1, P2) {

    }

    multp(k, P) {


    }

}*/


function doublep(P) {

    return P + P;

}

function addp(P1, P2) {

    return P1 + P2

}


function multp(k, P) {

    let R = 0;
    let A = P;

    let binStr = k.toString(2);    

    for (let i = binStr.length - 1; i >= 0; i--) {

        if(binStr[i] == '1') {
            R = addp(R, A);
        }
        
        A = doublep(A);

    }

    return R;

}





// https://mathworld.wolfram.com/Rabin-MillerStrongPseudoprimeTest.html

function bigRandom(bits) {

    return BigInt()

    /*let ints = Math.ceil(bits / 32);

    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    let array = new Uint32Array(ints);
    window.crypto.getRandomValues(array);
    
    byteStr = ""
    for (a of array)
        byteStr += a.toString(2).padStart(32, '0');

    byteStr = byteStr.substring(byteStr.length - bits + 1);
    byteStr = "0b1" + byteStr

    console.log(byteStr, byteStr.length)
    
    return BigInt(byteStr)*/

}

function generate_prime(t) {




}