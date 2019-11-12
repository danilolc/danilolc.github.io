PImage img;

//  1
//2 | 0
//  3
int[] dx = {1, 0, -1, 0};
int[] dy = {0, -1, 0, 1};

void setup() {
  size(512, 512);
  noSmooth();
  fill(255, 0, 0);
  
  img = loadImage("img.bmp");
}

boolean havePixel(int px, int py, int di) {
  px += dx[di];
  py += dy[di];

  return(img.pixels[px + py*img.width] != color(255,255,255));
}

int M = 0;
int CMX = 0;
int CMY = 0;
int I = 0;
void integrate(int px, int py, int di) {

}


int OX, OY, OI;
int PX, PY, DI;
boolean couting = false;

void contour() {
  if (!couting) return;
  
  int x = PX*16 + 8;
  int y = PY*16 + 8;

  if (havePixel(PX, PY, DI)) {
    
    if(DI == 1) {
      int _x = PX, _y = PY;
      while(havePixel(_x, _y, DI)) {
        img.loadPixels();
        img.pixels[_x+32*_y-32] = color(255, 0, 255);
        img.updatePixels();
        _y--;
      }
    }
    
    integrate(PX, PY, DI);
    
    stroke(0,255,0);
    ellipse(x, y, 8, 8);
    line(x, y, x + dx[DI]*8, y + dy[DI]*8);
    
    DI = (DI - 1) & ~-4; //(DI - 1) % 4
  } else {
    stroke(0);
    ellipse(x, y, 8, 8);
    line(x, y, x + dx[DI]*8, y + dy[DI]*8);
    
    PX += dx[DI];
    PY += dy[DI];
    DI = (DI + 1) % 4;
  }
  
  if (PX == OX && PY == OY && DI == OI)
    couting = false;

}

int SPEED = 6;
int a = 0;
void draw() {
  a = (a + 1) % SPEED;
  if(a != 0) return;

  image(img, 0, 0, 512, 512);
  text(M, 10, 10);
  
  contour();
}



void mouseClicked() {
  PX = mouseX / 16;
  PY = mouseY / 16;
  
  for(DI = 0; DI < 4; DI++) {
    if (havePixel(PX, PY, DI)) {
      couting = true;
      OX = PX;
      OY = PY;
      OI = DI;
      return;
    }
  }
}
