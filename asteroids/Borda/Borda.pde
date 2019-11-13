PImage img;

final int SI = 128;

final int SD = 512 / SI;
final int SDD = SD / 2;

//  1
//2 | 0
//  3
int[] dx = {1, 0, -1, 0};
int[] dy = {0, -1, 0, 1};

void setup() {
  size(512, 512);
  noSmooth();
  fill(255, 0, 0);

  img = loadImage("img.png");
}

boolean havePixel(int px, int py, int di) {
  px += dx[di];
  py += dy[di];

  return(img.pixels[px + py*img.width] != color(255, 255, 255));
}

int M = 0;
float[] CM = {0, 0};
int I = 0;
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

  int x = PX*SD + SDD;
  int y = PY*SD + SDD;

  if (havePixel(PX, PY, DI)) {

    if (DI == 0) {
      int _x = PX;
      while (havePixel(_x, PY, DI)) {
        _x++;
        img.loadPixels();
        img.pixels[_x + PY * SI] = color(255, 0, 255);
        img.updatePixels();
      }
    }

    integrate(PX, PY, DI);

    stroke(0, 255, 0);
    ellipse(x, y, SD/2, SD/2);
    line(x, y, x + dx[DI]*SDD, y + dy[DI]*SDD);

    DI = (DI - 1) & ~-4; //(DI - 1) % 4
  } else {
    stroke(0);
    ellipse(x, y, SDD, SDD);
    line(x, y, x + dx[DI]*SDD, y + dy[DI]*SDD);

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

final int SPEED = 1;
int a = 0;
void draw() {
  a = (a + 1) % SPEED;
  if (a != 0) return;

  image(img, 0, 0, 512, 512);
  
  fill(0);
  text("M = " + M, 10, 10);
  text("X = " + CM[0], 10, 20);
  text("Y = " + CM[1], 10, 30);
  text("I = " + I, 10, 40);

  contour();
}



void mouseClicked() {
  PX = mouseX / SD;
  PY = mouseY / SD;

  for (DI = 0; DI < 4; DI++) {
    if (havePixel(PX, PY, DI)) {
      couting = true;
      OX = PX;
      OY = PY;
      OI = DI;
      return;
    }
  }
}
