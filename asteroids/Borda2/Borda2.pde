//  1
//2 | 0
//  3
int[] dx = {1, 0, -1, 0};
int[] dy = {0, -1, 0, 1};

boolean havePixel(int px, int py, int di) {
  px += dx[di];
  py += dy[di];

  return(img.pixels[px + py * img.width] != color(255, 255, 255));
}

int M = 0;
float[] CM = {0, 0};
long I = 0; //Up to 33G
void integrate(int px, int py, int di) {
  int b = (di % 2 == 0)? px : py;
  int v = -1;
  
  if (di == 0 || di == 3) b++;
  else v = 1;
  
  v *= b;
  M += v; // v * b
  
  v *= b;
  CM[di % 2] += v; // v * b^2
  
  v *= b;
  I += v; // v * b^3
}


int OX, OY, OI;
int PX, PY, DI;
boolean couting = false;
void contour() {
  if (!couting) return;

  if (havePixel(PX, PY, DI)) {

    /*if (DI == 0) {
      img.loadPixels();
      for(int i = PX; havePixel(i, PY, DI); )
        img.pixels[++i + PY * img.width] = color(255, 0, 255);        
      img.updatePixels();
    }*/

    integrate(PX, PY, DI);
    DI = (DI - 1) & ~-4; //(DI - 1) % 4
  } else {
    PX += dx[DI];
    PY += dy[DI];
    DI = (DI + 1) % 4;
  }

  if (PX == OX && PY == OY && DI == OI) {
    couting = false;
    M /= 2;
    CM[0] /= 2 * M;
    CM[1] /= 2 * M;
    I /= 3;
    
    I -= (CM[0]*CM[0]+CM[1]*CM[1]) * M;
  }
}

void findBorder(){
  while(true) {
    int x = int(random(img.width));
    int y = int(random(img.height));
  
    if (img.pixels[x + y * img.width] != color(255,255,255)) {
      do x--;
      while(img.pixels[x + y * img.width] != color(255,255,255));
      
      PX = x;
      PY = y;
      DI = 0;
      
      OX = x;
      OY = y;
      OI = 0;
      
      couting = true;
      break;
    }
  }
}


PImage img;
void setup() {
  size(512, 512);
  noSmooth();
  
  img = loadImage("img.png");
  
  findBorder();
  while(couting) contour();

  image(img, 0, 0, 512, 512);
  
  fill(0);
  text("M = " + M, 10, 10);
  text("X = " + CM[0], 10, 20);
  text("Y = " + CM[1], 10, 30);
  text("I = " + I, 10, 40);
}
