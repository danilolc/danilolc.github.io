//  1
//2 | 0
//  3
final int[] DX = {1, 0, -1, 0};
final int[] DY = {0, -1, 0, 1};
final int R = 25;
final int RELOAD = 30;
final color BColor = color(123,255,123,123);
final color GColor = color(255,42,203,255);

class Pixel {
  Pixel(int x, int y, PImage img) {
    this.x = x;
    this.y = y;
    
    for(od = 0; od < 4; od++) {
      if(alpha(img.get(x - DX[od], y - DY[od])) == 0) {
        ox = x - DX[od];
        oy = y - DY[od];
        break;
      }
    }
  }
  
  public
  int x;
  int y;
  
  int ox, oy, od;
  
  boolean active = true;
}

void clean(PImage img) {
  for(int x = 0; x < img.width; x++)
  for(int y = 0; y < img.height; y++)
  {
    color c = img.get(x, y);
    if(alpha(c) != 0) img.pixels[x + y * img.width] |= 0xff000000;
    if(c == color(1, 2, 3)){ img.pixels[x + y * img.width] = color(0, 0, 0, 0); println("AAAAAAAA");}
  }
  img.updatePixels();
}

int Laser = 0;
float LaserX, LaserY, LaserA, LaserB;

final int[] Pixlist = {40, 64, 30, 60, 18, 62, 14, 66, 12, 54, 10, 44, 12, 30,
                       16, 20, 18, 30, 18, 38, 30, 45, 40, 32, 43, 16, 46, 00,
                     
                       100 - 40, 64, 100 - 30, 60, 100 - 18, 62, 100 - 14, 66, 100 - 12, 54, 100 - 10, 44, 100 - 12, 30,
                       100 - 16, 20, 100 - 18, 30, 100 - 18, 38, 100 - 30, 45, 100 - 40, 32, 100 - 43, 16, 100 - 46, 00};

class Ship {
  PImage img;
  
  float px = 200, py = 200, r = 0;
  float vx = 0, vy = 0, w = 0.007;
  boolean up, left, right, bar;
  
   
  Ship(String source) {
    img = loadImage(source);
    up = false;
    left = false;
    right = false;
    bar = false;
  }
  
  int key_delay = 0;
  
  void shoot() {
    
    if(key_delay != 0) return;
    key_delay = RELOAD;
    
    final int DIST = 20;
    float sx = px + DIST*cos(r-HALF_PI);
    float sy = py + DIST*sin(r-HALF_PI);
    
    Meteor target = null;
    float[] e = null;
    
    float dist = 99999;
    for (Meteor met : mets) {
      float[] buff = met.screen2img(sx, sy);
      buff = met.raster((int)buff[0], (int)buff[1],  met.r - (r - HALF_PI));
      if (buff == null) continue;
      
      if (buff[2] < dist) {
        dist = buff[2];
        e = buff;
        target = met;
      }
    
    }
    
    Laser = 3;
    LaserX = sx;
    LaserY = sy;
    
    if (target != null && e != null) {
      target.come((int)e[0], (int)e[1], (r - HALF_PI) - target.r);
      
      float[] pos = target.img2screen(e[0], e[1]);
      LaserA = pos[0];
      LaserB = pos[1];
    }
    else {
      LaserA = sx + 725*cos(r-HALF_PI);
      LaserB = sy + 725*sin(r-HALF_PI);
    }
    
  }
  
  float[] img2screen(float x, float y) {
    
    x -= img.width / 2;
    y -= img.height / 2;
    
    x /= 1.6;
    y /= 1.6;    
    
    float _x = x;
    x = x*cos(r) - y*sin(r);
    y = _x*sin(r) + y*cos(r);
    
    x += px;
    y += py;
    
    float[] v = {x, y};
    return v;
  }
  
  boolean collide()
  {
    for(int i = 0; i < 56; i += 2) 
    {
      float sk[] = img2screen(Pixlist[i], Pixlist[i+1]);
      
      for(Meteor m : mets)
      {
        // if(m == null) continue;
        
        float s[] = m.screen2img((int)sk[0], (int)sk[1]);
        if((int)s[0] < 0 || (int)s[0] >= m.img.width) continue;
        if((int)s[1] < 0 || (int)s[1] >= m.img.height) continue;
        
        if(alpha(m.img.get((int)s[0], (int)s[1])) != 0) 
          ;//exit();
        
      }
    }
    return false;
  }
  
  void update() {
    if (KUp) {
      vx += 0.05*sin(r);
      vy -= 0.05*cos(r);
    }
    if (KLeft){
      w -= 0.002;
    }
    if (KRight){
      w += 0.002;
    }
    if (KSpace) {
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
  
  void draw(float ox, float oy) {
    
    if (key_delay != 0) {
      key_delay--;
    }
    
    pushMatrix();
    
    translate(px + ox, py + oy);
    rotate(r);
    
    if(KUp) {
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
  
  float px, py, r;
  float vx = 0, vy = 0, w = 0.0;
  
  Meteor(String source, float px, float py, float r) {
    img = loadImage(source);
    clean(img);
    findBorder();
    
    this.px = px;
    this.py = py;
    this.r = r;
  }
  
  Meteor(int imgx, int imgy, float px, float py, float r) {
    img = createImage(imgx, imgy, ARGB);
    
    this.px = px;
    this.py = py;
    this.r = r;
  }
  
  void update() {
    px += vx;
    py += vy;
    r += w;
    
    if (px > 512) px -= 512;
    if (px < 0) px += 512;
    
    if (py > 512) py -= 512;
    if (py < 0) py += 512;
    
  }
  
  void draw() {
    pushMatrix();
    
    translate(px, py);
    rotate(r);
    translate(-CM[0], -CM[1]);
    image(img, 0, 0);
    
    popMatrix();
  }
  
  float[] screen2img(float x, float y) {
    
    x -= px;
    y -= py;
    
    float _x = x;
    x = x*cos(-r)-y*sin(-r);
    y = _x*sin(-r)+y*cos(-r);
    x += CM[0];
    y += CM[1];
    
    float[] v = {x, y};
    return v;
  }
  
  float[] img2screen(float x, float y) {
    
    x -= CM[0];
    y -= CM[1];
    
    float _x = x;
    x = x*cos(r) - y*sin(r);
    y = _x*sin(r) + y*cos(r);
    
    x += px;
    y += py;
    
    float[] v = {x, y};
    return v;
  }
  
  
  
  void findBorder() {
    M = 0;
    CM[0] = 0;
    CM[1] = 0;
    I = 0;
    
    while(true) {
      int x = int(random(img.width));
      int y = int(random(img.height));
    
      if (alpha(img.get(x, y)) != 0) {
        do x--;
        while(alpha(img.get(x, y)) != 0);
        
        contour(x, y, 0);
        break;
      }
    }
  }

  int[] integrate(int px, int py, int di) {
    int m, cm, i;
    
    int a = (di % 2 == 0)? px : py;
    int v = 1;
    
    if (di == 0 || di == 3) {
      a++;
      v = -1;
    }
    
    v *= a;
    m = v; // v * b
    
    v *= a;
    cm = v; // v * b^2
    
    v *= a;
    i = v; // v * b^3
    
    int[] ret = {m, cm, i};
    return ret;
  }

  boolean havePixel(int px, int py, int di) {
    px += DX[di];
    py += DY[di];
    
    float a = alpha(img.get(px, py));
    return a != 0 && a != 200;
  }
  
  void contour(int ox, int oy, int oi) {
    
    int px = ox, py = oy, di = oi;
    
    do {
      if (havePixel(px, py, di)) {
    
        int[] val = integrate(px, py, di);
        M += val[0];
        CM[di % 2] += val[1];
        I += val[2];
        
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
  
  boolean had_left, had_right;
  ArrayList<Pixel> left_list = new ArrayList<Pixel>();
  ArrayList<Pixel> right_list = new ArrayList<Pixel>();
  
  void detect_left(int px, int py) {
    boolean has_left = alpha(img.get(px, py)) == 255;
    
    if(has_left && !had_left)
      left_list.add(new Pixel(px, py, img));
    
    had_left = has_left;
  }
  
  void detect_right(int px, int py) {
    boolean has_right = alpha(img.get(px, py)) == 255;
    
    if(has_right && !had_right)
      right_list.add(new Pixel(px, py, img));
      
    had_right = has_right;
  }
  
  void separa_componentes() {
    
    M = 0;
    CM[0] = 0;
    CM[1] = 0;
    I = 0;
    
    left_list.addAll(right_list);
    
    for(int i = 0; i < left_list.size(); i++) {
      Pixel pix = left_list.get(i);
      
      if(pix.active) {
        
        Meteor met;
        if (i > 0) {
          met = new Meteor(img.width, img.height, px, py, r);
        }
        else
          met = this;
        
        int sx = pix.ox, sy = pix.oy, di = pix.od;
        
        do {
          if (havePixel(sx, sy, di)) {
            for(int j = i + 1; j < left_list.size(); j++) {
              Pixel pix2 = left_list.get(j);
              if(pix2.x == sx + DX[di] && pix2.y == sy + DY[di])
                pix2.active = false;
            }
            
            if (di == 0 && i > 0) { 
              for(int j = sx; havePixel(j, sy, di); ) {
                j++;
                met.img.set(j, sy, img.get(j,sy));
              }
            }
        
            int[] val = integrate(sx, sy, di);
            met.M += val[0];
            met.CM[di % 2] += val[1];
            met.I += val[2];
            
            di = (di - 1) & ~-4;
          } else {
            sx += DX[di];
            sy += DY[di];
            di = (di + 1) % 4;
          }
        } while(sx != pix.ox || sy != pix.oy || di != pix.od);
        
        met.M /= 2;
        met.CM[0] /= 2 * met.M;
        met.CM[1] /= 2 * met.M;
        met.I /= 3;
          
        met.I -= (met.CM[0]*met.CM[0]+met.CM[1]*met.CM[1]) * met.M;
        
        if (i > 0 && M > 500) {
          
          mets.add(met);
          met.img.updatePixels();
          
          met.vx = vx;
          met.vy = vy;
          met.r = r;
          
          met.px -= CM[0];
          met.py -= CM[1];
          
          met.px += met.CM[0];
          met.py += met.CM[1];
          
          
          sx = pix.ox;
          sy = pix.oy;
          di = pix.od;
        
          do {
            if (met.havePixel(sx, sy, di)) {
              if (di == 0 && i > 0) { 
                for(int j = sx; havePixel(j, sy, di); ) {
                  j++;
                  img.set(j, sy, color(0,0,0,0));
                }
              }
          
              di = (di - 1) & ~-4;
            } else {
              sx += DX[di];
              sy += DY[di];
              di = (di + 1) % 4;
            }
          } while(sx != pix.ox || sy != pix.oy || di != pix.od);
          
          
          
          
          
          
        }
        
        
      }
    }
    
    
    int count = 0;
    for (Pixel px : left_list) {
       if (px.active)
        count++;
    }
    
    println("" + count + " COMPONENTES");
    
  }
  
  void limpa(int minx, int maxx, int miny, int maxy) {
    
    had_left = false;
    had_right = false;
    
    int left_x = maxx, left_y = maxy + 1;
    int right_x = maxx - 1, right_y = maxy + 1;
    
    for(int j = maxy; j >= miny; j--){
      
      // Esquerda
      if (minx > 0) { // Função decrescente
        minx--; 
        if(img.get(minx, j) == BColor) {
          while(img.get(--minx, j) == BColor);
          minx++;
        
        } else { // Função crescente
          while(img.get(++minx, j) != BColor);
        }
      }
      else { // Canto da imagem
        if(img.get(minx, j) != BColor)
          while(img.get(++minx, j) != BColor);
      }
      
      // Direita
      if (maxx < img.width - 1) {
        maxx++;
        if(img.get(maxx, j) == BColor) {
          while(img.get(++maxx, j) == BColor);
          maxx--;
        
        } else {
          while(img.get(--maxx, j) != BColor);
        }
      } 
      else {
        if(img.get(maxx, j) != BColor)
          while(img.get(--maxx, j) != BColor);
      }
      
      for(int i = minx; i <= maxx; i++)
        img.set(i, j, color(0,0,0,0));
      
      
      // Percorre a borda da elipse
      if (left_x > minx - 1) {
        do detect_left(left_x--, left_y);
        while(left_x != minx - 1);
        
        detect_left(left_x, --left_y);
      }
      else if (left_x == minx - 1) {
        detect_left(left_x, --left_y);
      }
      else if (left_x < minx - 1) {
        left_y--;
        do detect_left(++left_x, left_y);
        while(left_x != minx - 1);
      }
      
      if (right_x < maxx + 1) {
        do detect_right(right_x++, right_y);
        while(right_x != maxx + 1);
        
        detect_right(right_x, --right_y);
      }
      else if (right_x == maxx + 1) {
        detect_right(right_x, --right_y);
      }
      else if (right_x > maxx + 1) {
        --right_y;
        do detect_right(--right_x, right_y);
        while(right_x != maxx + 1);
      }
    }
    
    --right_y;
    for (int i = right_x - 1; i > left_x; i--) 
      detect_right(i, right_y);
    
    
    if (had_left && had_right)
      right_list.remove(right_list.size() - 1);
    
    if(!right_list.isEmpty() && !left_list.isEmpty()) {
      Pixel first_r = right_list.get(0);
      Pixel first_l = left_list.get(0);
      if (first_r.x + 1 == first_l.x && first_r.y == first_l.y)
        right_list.remove(0);
    }
      
    separa_componentes();
    
    left_list.clear();
    right_list.clear();
    
    img.updatePixels();
    
  }
  
  void come(int x, int y, float w) {
    
    int miny = 9999, maxy = -1;
    int minx = 9999, maxx = -1;
    
    float A = 40, B = 20;
    float cw = cos(w);
    float sw = sin(w);
    
    int lx = -1, ly = -1;
    
    for (float t = 0; t < 2*PI; t += HALF_PI / (2*A)) {
      int _x = (int)(A*cos(t)*cw - B*sin(t)*sw + x);
      int _y = (int)(A*cos(t)*sw + B*sin(t)*cw + y);
      
      if (lx == _x && ly == _y)
        continue;
      
      if(_y < 0 || _y >= img.height)
        continue;
        
      if(_x < 0)
        _x = 0;
      if(_x >= img.width)
        _x = img.width - 1;
      
      if (_y > maxy) { 
        maxy = _y;
        minx = 9999;
        maxx = -1;
      }
      if(_y == maxy) {
        if (_x > maxx)
          maxx = _x;
        if (_x < minx)
          minx = _x;
      }
      if (_y < miny)
        miny = _y;
      
      img.set(_x, _y, BColor);
    }
    
    limpa(minx, maxx, miny, maxy);
    
    //(a,b)(c,d) = ad-bc
    float tor = ((x - CM[0]) * sw - (y - CM[1]) * cw) / I;
    this.w += tor * 10000;
    
    this.vx += cos(r + w) * 5000 / this.M;
    this.vy += sin(r + w) * 5000 / this.M;
    
  }

  float[] raster(int x, int y, float angle) {
    float i = x, j = y;
    
    float a = cos(angle), b = sin(angle);
    float s = max(abs(a), abs(b));
    a /= s;
    b /= s;
    for(int PPPP = 0; PPPP < 100000; PPPP++){
      if(x >= 0 && x < img.width && y >= 0 && y < img.width) {
        if (alpha(img.get(x, y)) != 0) {
          float[] v = {x, y, PPPP};
          return v;
        }
      }
      i += a;
      j -= b;
      
      x = floor(i);
      y = floor(j);
    }
    
    return null;
  }
}

ArrayList<Meteor> mets = new ArrayList<Meteor>();

PImage bgimg;
Ship ship;

void setup() {
  size(512, 512, P2D);
  //noSmooth();
  stroke(255,0,0);
  
  bgimg = loadImage("sky.jpg");

  ship = new Ship("ship.png");
  mets.add(new Meteor("img.png", 100, 100, 0));
  //mets.add(new Meteor("img.png"));
  
  mets.get(0).px -= 100;
  
  strokeWeight(3);
}

void draw() {
  fill(0);
  background(bgimg);
  
  ship.update();
  ship.draw(0, 0);
  
  for (Meteor met : mets) {
    met.update();
    met.draw();
  }
  
  ship.collide();
  
  if (Laser > 0) {
    stroke(255, 0, 50, Laser * (float)255);
      
    line(LaserX, LaserY, LaserA, LaserB);
  
    noStroke();
    fill(255,255,255,Laser*50);
    rect(0,0,512,512);
    
    Laser--;
  }
  
  int py = 10;
  fill(255,255,0);
  for (Meteor met : mets) {
    text("" + met.M + " " + met.px + " " + met.py, 10, py);
    py += 10;
  }
  
  if (KDown) {
    background(20, 50, 90);
    image(mets.get(0).img, 0, 0, 512, 512);
  }
  
}

boolean KLeft = false, KUp = false, KRight = false, KDown = false, KSpace = false;

boolean setKey(int k, boolean v) {
  switch (k) {
    case LEFT:
      return KLeft = v;
    case UP:
      return KUp = v;
    case RIGHT:
      return KRight = v;
    case DOWN:
      return KDown = v;
    case ' ':
      return KSpace = v;
  }
  return false;
}

void keyPressed() {
  setKey(keyCode, true);
}
 
void keyReleased() {
  setKey(keyCode, false);
}
