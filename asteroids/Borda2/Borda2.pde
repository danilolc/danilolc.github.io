//  1
//2 | 0
//  3
final int[] DX = {1, 0, -1, 0};
final int[] DY = {0, -1, 0, 1};
final int R = 30;

void clean(PImage img) {
  for(int x = 0; x < img.width; x++)
  for(int y = 0; y < img.height; y++)
    img.pixels[x + y * img.width] = color(255);
}

class Meteor {
  PImage img;
  
  int M = 0;
  float[] CM = {0.f, 0.f};
  long I = 0;
  
  float px = 300, py = 300, r = 1;
  float vx = 0, vy = 0, w = 0.02;
  
  Meteor(String source) {
    img = loadImage(source);
    findBorder();
  }
  
  void draw() {
    px += vx;
    py += vy;
    r += w;
    pushMatrix();
    
    translate(px, py);
    rotate(r);
    translate(-CM[0], -CM[1]);
    image(met.img, 0, 0, 256, 256);
    
    popMatrix();
  }
  
  void findBorder() {
    while(true) {
      int x = int(random(img.width));
      int y = int(random(img.height));
    
      if (img.pixels[x + y * img.width] != color(255,255,255)) {
        do x--;
        while(img.pixels[x + y * img.width] != color(255,255,255));
        
        contour(x, y, 0);
        break;
      }
    }
  }

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

  boolean havePixel(int px, int py, int di) {
    px += DX[di];
    py += DY[di];
  
    return(img.pixels[px + py * img.width] != color(255, 255, 255));
  }

  void contour(int ox, int oy, int oi) {
    
    int px = ox, py = oy, di = oi;
    
    do {
      if (havePixel(px, py, di)) {
    
        /*if (di == 0) {
          img.loadPixels();
          for(int i = px; havePixel(i, py, di); )
            img.pixels[++i + py * img.width] = color(255, 0, 255);        
          img.updatePixels();
        }*/
    
        integrate(px, py, di);
        di = (di - 1) & ~-4; //(DI - 1) % 4
      } else {
        px += DX[di];
        py += DY[di];
        di = (di + 1) % 4;
      }
    
    } while(px != ox || py != oy || di != oi);
    
    M /= 2;
    CM[0] /= 2 * M;
    CM[1] /= 2 * M;
    I /= 3;
      
    I -= (CM[0]*CM[0]+CM[1]*CM[1]) * M;
  }

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
    float s = max(abs(a), abs(b));
    a /= s;
    b /= s;
    for(int PPPP = 0; PPPP < 100000; PPPP++)
    {
    if(x >= 0 && x < img.width && y >= 0 && y < img.width) {
      if (img.pixels[x + y * img.width] != color(255,255,255)) {
        //img.pixels[x + y * img.width] = color(255,144,144);
        come(x, y);
        break;
      } else {
        //img.pixels[x + y * img.width] = color(144,144,255);
      }
    }
      i += a;
      j -= b;
      
      x = floor(i);
      y = floor(j);
    }
    
  }


}

Meteor met;
void setup() {
  size(512, 512);
  //noSmooth();
  stroke(255,0,0);
  
  met = new Meteor("img.png");
  met.draw();
  
  strokeWeight(3);
}

float angle;
void draw() {
  fill(0);
  background(255);
  
  
  angle = -atan2(mouseY, mouseX);
  
  met.draw();
  
  line(0, 0, mouseX, mouseY);
  
  text("M = " + met.M, 10, 10);
  text("X = " + met.CM[0], 10, 20);
  text("Y = " + met.CM[1], 10, 30);
  text("I = " + met.I, 10, 40);
  text(angle, 10, 50);
  
}

void mouseClicked() {
  met.img.loadPixels();
  float x = 0, y = 0, a = angle;
  
  x -= met.px;
  y -= met.py;
  
  float _x = x;
  x = x*cos(-met.r)-y*sin(-met.r);
  y = _x*sin(-met.r)+y*cos(-met.r);
  x += met.CM[0];
  y += met.CM[1];
  
  point(x, y);
  a += met.r;
  
  met.raster((int)x, (int)y, a);
  println("x = " + x + ", y = " + y + ", a = " + a);
  met.img.updatePixels();
}
