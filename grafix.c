#include <gl\gl.h>
#include <windows.h>
#include <math.h>
#include <stdlib.h>

typedef struct vec vec;
//typedef struct ball ball;
typedef struct knot knot;
typedef struct rope rope;

extern POINT mouse;

struct vec
{
    float x, y;
};

struct knot
{
    vec pos;
    vec pos0, vel, acc, col;
    char stuck;
};

struct rope
{
    knot *kn;
    int n;
    float delta;
    float k;
    float att;
} rp;

void area(int, int);
void quit(void);

void clean()
{
    if(rp.kn) free(rp.kn);
}

void setrope(rope *rp, vec p0, vec p1, int n, float k, float att)
{
    rp->n = n;
    rp->kn = calloc(n, sizeof(knot));
    if(!rp->kn) quit();
    vec ds = {(p1.x - p0.x) / n, (p1.y - p0.y) / n};
    rp->delta = sqrt(ds.x * ds.x + ds.y * ds.y);
    //rp->k = k*n*n / 400;
    rp->k = k;
    rp->att = att;
    for(int i = 0; i < n; i++)
    {
        rp->kn[i].pos = p0;
        rp->kn[i].pos0 = p0;
        p0.x += ds.x;
        p0.y += ds.y;
    }
    rp->kn[0].stuck = 1;
    //rp->kn[n/2].stuck = 1;
    rp->kn[n-1].stuck = 1;
}


float a;
int width = 800, height = 600;
void setup()
{
    area(width, height);
    glViewport(0, 0, width, height);
    a = (float)width / height;
    glOrtho(-a, a, -1, 1, -1, 1);
    glMatrixMode(GL_MODELVIEW);
    glClearColor(0, 0, 0, 1);
    glColor3f(1, 1, 1);
    vec p0 = {-0.8, -0.1};
    vec p1 = {-0.7, -0.1};
    setrope(&rp, p0, p1, 1200, 500, 0.01);
    glPointSize(4);
    glLineWidth(20);

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    glEnable( GL_LINE_SMOOTH );
glEnable( GL_POLYGON_SMOOTH );
glHint( GL_LINE_SMOOTH_HINT, GL_NICEST );
glHint( GL_POLYGON_SMOOTH_HINT, GL_NICEST );

}

void drawrope(rope rp)
{
    glBegin(GL_LINES);
    for(int i = 0; i < rp.n - 1; i++)
    {
        glColor3f(rp.kn[i].col.x, 0, rp.kn[i].col.y);
        glVertex2f(rp.kn[i].pos.x, rp.kn[i].pos.y);
        glColor3f(rp.kn[i+1].col.x, 0, rp.kn[i+1].col.y);
        glVertex2f(rp.kn[i+1].pos.x, rp.kn[i+1].pos.y);
    }
    glEnd();
}

void collide(knot *n, vec c, float r, float e)
{
    if(n->stuck) return;
    vec ds = {n->pos.x - c.x, n->pos.y - c.y};
    float dist = sqrt(ds.x*ds.x + ds.y*ds.y);
    if(dist < r)
    {
        float k = (ds.x * n->vel.x+ds.y * n->vel.y) / (dist*dist);
        vec p = {ds.x * k * e, ds.y * k * e};
        n->vel.x += 2 * p.x;
        n->vel.y += 2 * p.y;
        ds.x *= r / dist;
        ds.y *= r / dist;
        n->pos.x = ds.x + c.x;
        n->pos.y = ds.y + c.y;

    }
}
vec b0;
float grav = -0.000;

float theta = 0;

void euler(rope rp, float dt)
{
    //S=S0+V0t+At2/2
    for(int i = 0; i < rp.n; i++)
    {
        if(rp.kn[i].stuck) continue;
        rp.kn[i].pos0.x += rp.kn[i].vel.x*dt + rp.kn[i].acc.x*dt*dt/2;
        rp.kn[i].pos0.y += rp.kn[i].vel.y*dt + rp.kn[i].acc.y*dt*dt/2;



        //COLLISIONS
        vec b = {0, 0.5};
        vec b1 = {0, -0.5};
        vec b2 = {0.8, 0};
        collide(&rp.kn[i], b, 0.1, -0.8);
        collide(&rp.kn[i], b1, 0.1, -0.8);
        collide(&rp.kn[i], b2, 0.1, -0.8);



    }


    rp.kn[0].acc.x = 0;
    rp.kn[0].acc.y = grav * 3;
    for(int i = 0; i < rp.n - 1; i++)
    {
        vec ds = {rp.kn[i+1].pos0.x - rp.kn[i].pos0.x, rp.kn[i+1].pos0.y - rp.kn[i].pos0.y};
        float dm = sqrt(ds.x*ds.x+ds.y*ds.y);

        float x = dm - rp.delta;

        //if(x < 0) x = 0;

        rp.kn[i].col.x = x * x * rp.n * 10;
        rp.kn[i].col.y = 1 - x * x * rp.n * 10;

        ds.x *= rp.k * x / dm;
        ds.y *= rp.k * x / dm;
        rp.kn[i].acc.x += ds.x;
        rp.kn[i].acc.y += ds.y;
        rp.kn[i+1].acc.x = -ds.x;
        rp.kn[i+1].acc.y = -ds.y + grav;
    }

    for(int i = 0; i < rp.n; i++)
    {
        if(rp.kn[i].stuck) continue;
        //rp.kn[i].pos0.x += rp.kn[i].vel.x*dt + rp.kn[i].acc.x*dt*dt/2;
        //rp.kn[i].pos0.y += rp.kn[i].vel.y*dt + rp.kn[i].acc.y*dt*dt/2;
        rp.kn[i].vel.x += rp.kn[i].acc.x*dt;
        rp.kn[i].vel.y += rp.kn[i].acc.y*dt;
        rp.kn[i].vel.x /= (1 + rp.att * dt);
        rp.kn[i].vel.y /= (1 + rp.att * dt);

    }
}

void updaterope(rope rp, float dt, int n)
{
    for(; n; n--)
    {
        euler(rp, dt/2);
        for(int i = 0; i < rp.n; i++)
        {
            rp.kn[i].pos0 = rp.kn[i].pos;
        }
    }
    euler(rp, dt);
    for(int i = 0; i < rp.n; i++)
    {
        rp.kn[i].pos = rp.kn[i].pos0;
    }
}

void draw()
{
    //MOUSE
    b0.x = (float)mouse.x * 2*a / width - 1;
    b0.y = -(float)mouse.y * 2 / height + 1;

    rp.kn[rp.n-1].pos.x = b0.x;
    rp.kn[rp.n-1].pos.y = b0.y;

    glClear(GL_COLOR_BUFFER_BIT);
    drawrope(rp);
    updaterope(rp, 0.01, 5);

    glBegin(GL_POINTS);
    glColor3f(1,1,1);
    glVertex2f(b0.x, b0.y);
    glEnd();

    //_sleep(1);
}
