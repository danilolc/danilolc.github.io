//  1
//2 | 0
//  3
final int[] DX = {1, 0, -1, 0};
final int[] DY = {0, -1, 0, 1};
final int R = 25;
final int RELOAD = 45;
final color BColor = color(123,123,123,0);

void clean(PImage img) {
  for(int x = 0; x < img.width; x++)
  for(int y = 0; y < img.height; y++)
    img.pixels[x + y * img.width] = color(255);
}

int Laser = 0;

void laser(int x, int y, int a, int b) {
  
}

class Ship {
  PImage img;
  
  float px = 200, py = 200, r = 0;
  float vx = 0, vy = 0, w = 0.007;
   
  Ship(String source) {
    img = loadImage(source);
  }
  
  int key_delay = 0;
  
  void shoot() {
    
    if(key_delay != 0) return;
    key_delay = RELOAD;
    Laser = 3;
    
    met.img.loadPixels();
    
    float x = px, y = py, a = HALF_PI - r;
    
    x -= met.px;
    y -= met.py;
    
    float _x = x;
    x = x*cos(-met.r)-y*sin(-met.r);
    y = _x*sin(-met.r)+y*cos(-met.r);
    x += met.CM[0];
    y += met.CM[1];
    
    a += met.r;
    
    met.raster((int)x, (int)y, a);
    met.img.updatePixels();
  }
  
  void update() {
    if (keyPressed)
    if (key == CODED) {
      if (keyCode == UP) {
        vx += 0.05*sin(r);
        vy -= 0.05*cos(r);
      }
      if (keyCode == LEFT){
        w -= 0.002;
      }
      if (keyCode == RIGHT){
        w += 0.002;
      }
    } else if (key == ' ') {
      shoot();
    }
    
    if (px > 512) px -= 512;
    if (px < 0) px += 512;
    
    if (py > 512) py -= 512;
    if (py < 0) py += 512;
    
    px += vx;
    py += vy;
    r += w;
    
    vx *= 0.995;
    vy *= 0.995;
    w *= 0.99;
  }
  
  void draw() {
    
    if (key_delay != 0) {
      key_delay--;
    }
    
    pushMatrix();
    
    translate(px, py);
    rotate(r);
    
    stroke(0, 255, 50, key_delay * (float)255 / RELOAD);
    line(0, 0, 0, -1000);
    
    if(keyCode == UP && keyPressed)
    {
      stroke(255, 100, 0);
      fill(255, 255, 0);
      ellipse(0, 15, 10, 30);
    }
    
    imageMode(CENTER);
    image(img, 0, 0, 500 / 8, 340 / 8);
    imageMode(CORNER);
    
    
    
    popMatrix();
  }
  
}

class Meteor {
  PImage img;
  
  int M = 0;
  float[] CM = {0, 0};
  long I = 0;
  
  float px = 300, py = 300, r = 0;
  float vx = 0, vy = 0, w = 0.000;
  
  Meteor(String source) {
    img = loadImage(source);
    findBorder();
  }
  
  void update() {
    px += vx;
    py += vy;
    r += w;
  }
  
  void draw() {
    pushMatrix();
    
    translate(px, py);
    rotate(r);
    translate(-CM[0], -CM[1]);
    image(img, 0, 0, 256, 256);
    
    popMatrix();
  }
  
  void findBorder() {
    M = 0;
    CM[0] = 0;
    CM[1] = 0;
    I = 0;
    
    while(true) {
      int x = int(random(img.width));
      int y = int(random(img.height));
    
      if (alpha(img.pixels[x + y * img.width]) != 0) {
        do x--;
        while(alpha(img.pixels[x + y * img.width]) != 0);
        
        contour(x, y, 0);
        break;
      }
    }
  }

  void integrate(int px, int py, int di) {
    int a = (di % 2 == 0)? px : py;
    int v = 1;
    
    if (di == 0 || di == 3) {
      a++;
      v = -1;
    }
    
    v *= a;
    M += v; // v * b
    
    v *= a;
    CM[di % 2] += v; // v * b^2
    
    v *= a;
    I += v; // v * b^3
  }

  boolean havePixel(int px, int py, int di) {
    px += DX[di];
    py += DY[di];
  
    return alpha(img.pixels[px + py * img.width]) != 0;
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
  
  
  void come(int x, int y, float w) {
    
    float a = 40, b = 20;
    float cw = cos(w);
    float sw = sin(w);
    
    for (float t = 0; t < 2*PI; t += HALF_PI / (2*a)) {
      float _x = a*cos(t)*cw-b*sin(t)*sw+x;
      float _y = a*cos(t)*sw+b*sin(t)*cw+y;
      if(_x >= 0 && _x < img.width && _y >= 0 && _y < img.height)
      img.pixels[(int)_x + img.width * (int)_y] = color(255, 0, 0, 255);
    }
    
    float _X_ = CM[0], _Y_ = CM[1];
    //findBorder();    
    _X_ -= CM[0];
    _Y_ -= CM[1];
    
    float __X_ = _X_;
    
    _X_ = _X_*cos(r) - _Y_*sin(r);
    _Y_ = __X_*sin(r) + _Y_*cos(r);
    
    px -= _X_;
    py -= _Y_;
    img.updatePixels();
  }

  void raster(int x, int y, float angle) {
    float i = x, j = y;
    
    float a = cos(angle), b = sin(angle);
    float s = max(abs(a), abs(b));
    a /= s;
    b /= s;
    for(int PPPP = 0; PPPP < 100000; PPPP++){
      if(x >= 0 && x < img.width && y >= 0 && y < img.width) {
        if (alpha(img.pixels[x + y * img.width]) != 0) {
          //img.pixels[x + y * img.width] = color(255,144,144);
          come(x, y, -angle);
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
Ship ship;

void setup() {
  size(512, 512);
  //noSmooth();
  stroke(255,0,0);
  
  ship = new Ship("ship.png");
  met = new Meteor("img.png");
  
  strokeWeight(3);
}

float angle;
void draw() {
  fill(0);
  background(100+Laser*30, 110+Laser*30, 152+Laser*30);
  
  if (Laser > 0)
    Laser--;
  
  
  angle = -atan2(mouseY, mouseX);
  
  ship.update();
  ship.draw();
  
  met.update();
  met.draw();
  
  //text("M = " + met.M, 10, 10);
  //text("X = " + met.CM[0], 10, 20);
  //text("Y = " + met.CM[1], 10, 30);
  //text("I = " + met.I, 10, 40);
  //text(-ship.r + HALF_PI, 10, 50);
  
}
