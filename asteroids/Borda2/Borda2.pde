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
  stroke(255,0,0);
  
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



void clean() {
  for(int x = 0; x < img.width; x++)
  for(int y = 0; y < img.height; y++)
    img.pixels[x + y * img.width] = color(255);
}

//Percorrer a borda do círculo
final int R = 20;
void come(int x, int y) {
  int _x, _y;
  for(int i = -R; i <= R; i++) {
    int fj = floor(sqrt(1 + R*R - i*i));
    for (int j = -fj; j <= fj; j++) {
      _x = x + i;
      _y = y + j;
      
      if(_x >= 0 && _x < img.width && _y >= 0 && _y < img.width)
        if (img.pixels[_x + _y * img.width] == color(0)) {
          img.pixels[_x + _y * img.width] = color(255);
          
        }
    }
    
  }
  
}

void raster(int x, int y, float angle) {
  float i = x, j = y;
  
  float a = cos(angle), b = sin(angle);
  float s = abs(a) + abs(b);
  a /= s;
  b /= s;
  
  while(x >= 0 && x < img.width && y >= 0 && y < img.width) {
    if (img.pixels[x + y * img.width] != color(255,255,255)) {
      //img.pixels[x + y * img.width] = color(255,144,144);
      come(x, y);
      break;
    } else {
      //img.pixels[x + y * img.width] = color(144,144,255);
    }
    
    if (floor(i + a) == x && floor(j - b) == y) {
      i += a;
      j -= b;
    }
    
    i += a;
    j -= b;
    
    x = floor(i);
    y = floor(j);
  }
}


float angle = -1.5;
boolean done = false;
void draw() {
  
  //img = loadImage("img.png");
  //img.loadPixels();
  
  //clean();
  angle = -atan2(mouseY, mouseX);
  
  //img.updatePixels();
  
  image(img, 0, 0, 512, 512);
  
  line(0, 0, mouseX, mouseY);
  
  text(angle, 10, 10);
}


void mouseClicked() {
  img.loadPixels();
  raster(0, 0, angle);
  img.updatePixels();
}
