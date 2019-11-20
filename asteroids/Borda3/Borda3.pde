//  1
//2 | 0
//  3
final int[] DX = {1, 0, -1, 0};
final int[] DY = {0, -1, 0, 1};
final color BColor = color(123,255,123,150);

class Meteor {
  PImage img;
  
  Meteor(String source) {
    img = loadImage(source);
  }
  
  void draw() {
    image(img, 0, 0, 512, 512);
  }
  
  boolean havePixel2(int px, int py, int di) {
    px += DX[di];
    py += DY[di];
    
    if(px < 0 || px >= img.width || py < 0 || py >= img.height)
      return true;
    return img.pixels[px + py * img.width] == BColor;
  }
  
  void contour2(int ox, int oy, int oi, int miny, int maxy) {
    
    int lx = -1;
    int px = ox, py = oy, di = oi;
    
    do {
      if (havePixel2(px, py, di)) {
        
        //img.pixels[px + py * img.width] = color(255, 0, 255, 150);
        
        if (di == 2) { 
          
          int i = px;
          
          if(py != maxy && py != miny) {
            while(img.pixels[--i + py * img.width - 1] == BColor);
            
            while(!havePixel2(i, py, 2))
              img.pixels[--i + py * img.width] = color(255,0,0,255);
            
            //while(havePixel2(i, py, 2))
            //  img.pixels[--i + py * img.width] = color(0,0,0,0);
          }
          else {
            while(havePixel2(i, py, 2))
              img.pixels[--i + py * img.width] = color(0,0,255,255);
          }
          
          if(lx != -1) {
            i = lx;
            while(havePixel2(i, py+1, 2))
              img.pixels[--i + (py+1) * img.width] = color(0,255,0,255);
          }
            
          lx = px;
        }
        
        di = (di - 1) & ~-4; //(DI - 1) % 4
      } else {
        
        //img.pixels[px + py * img.width] = color(0,0,255,255);
        
        px += DX[di];
        py += DY[di];
        
        di = (di + 1) % 4;

      }
    
    } while(py > miny - 1);
    img.updatePixels();

  }
  
  void come(int x, int y, float w) {
    
    int cx = -1, cy = -1;
    int maxy = -1, miny = 9999;
    
    float A = 40, B = 15;
    float cw = cos(w);
    float sw = sin(w);
    
    int lx = -1, ly = -1;
    
    for (float t = 0; t < 2*PI; t += HALF_PI / (2*A)) {
      int _x = (int)(A*cos(t)*cw - B*sin(t)*sw + x);
      int _y = (int)(A*cos(t)*sw + B*sin(t)*cw + y);
      
      if (lx == _x && ly == _y)
        continue;
      
      if (_y > maxy) { 
        maxy = _y;
        cx = _x + 1;
        cy = _y;
      }
      if (_y < miny) miny = _y;
      
      if(_x >= 0 && _x < img.width && _y >= 0 && _y < img.height)
        img.pixels[_x + img.width * _y] = BColor;
    }
    
    contour2(cx, cy, 2, miny, maxy);
    
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

void setup() {
  size(512, 512);
  noSmooth();
  
  met = new Meteor("img.png");
  met.raster(0,0,-1.2);
}

float angle = 0;
void draw() {
  background(100, 110, 152);
  
  met = new Meteor("img.png");
  met.raster(0,0,-angle);
  met.draw();
  
  angle = atan2(mouseY, mouseX);
    
}
