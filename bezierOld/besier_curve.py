import matplotlib.pyplot as plt

# Objeto ponto na forma (x,y)
class Point(object):
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __str__(self):
        return "({}, {})".format(self.x, self.y)
    def __add__(self, point):
        return Point(self.x+point.x, self.y+point.y)
    def multiple(self, t):
        return Point(t*self.x,t*self.y)
    def plot(self, P, color = 'b'):
        plt.plot([self.x,P.x],[self.y,P.y],color)

# Objeto linha na forma aX + bY + c = 0 (parametros a, b e c)
class Line(object):
    def __init__(self, a, b, c):
        self.a, self.b, self.c = a, b, c

# Objeto curva de bezier definido por uma quantidade indeterminada de pontos de controle
class Besier(object):
    def __init__(self, *args):
        self.points = args
        self.degree = len(args)-1

    # Casteljau para achar elemento especifico
    def casteljau(self, t):
        l = self.points
        while (len(l)>1):
            l = [(l[k].multiple(1-t) + l[k+1].multiple(t)) for k in range(len(l)-1)]
        return l[0]

    # Divide a curva em duas com casteljau
    def split(self, t):
        l = self.points
        a, b = [l[0]], [l[-1]]
        while (len(l)>1):
            l = [(l[k].multiple(1-t) + l[k+1].multiple(t)) for k in range(len(l)-1)]
            a.append(l[0])
            b.append(l[-1])
        b.reverse()
        return Besier(*a), Besier(*b)

    # Verifica se a curva é aproximadamente linear para um certo epsilon
    def is_near_linear(self, epsilon):
        x = [val.x for val in self.points]
        y = [val.y for val in self.points]
        out_square_len = min(max(x)-min(x), max(y)-min(y))
        return out_square_len <= epsilon
    
    # Plota a curva
    def plot(self, epsilon, color = 'b'):
        if(self.is_near_linear(epsilon)):
            [self.points[i].plot(self.points[i+1],color) for i in range(self.degree)]
        else:
            C1, C2 = self.split(0.5)
            C1.plot(epsilon,color)
            C2.plot(epsilon,color)

    # Desenha a curva
    def draw(self, epsilon, color='b'):
        self.plot(epsilon,color)
        plt.show()

    # Linha intercepra o CH da curva
    def line_intercepts_CH(self, line):
        p = self.points[0]
        b = (line.a*p.x + line.b*p.y+line.c) > 0
        for p in self.points[1:]:
            nb = (line.a*p.x + line.b*p.y+line.c) > 0
            if (nb != b): return False
        return True

    # Linha intercepta a curva de besier
    def line_intercepts(self, line, epsilon):
        if self.line_intercepts_CH(line):
            if(self.is_near_linear(epsilon)):
                return self.line_intercepts_CH(line)
            else:
                C1, C2 = self.split(0.5)
                return (C1.line_intercepts(line,epsilon) and C2.line_intercepts(line,epsilon))
        else: return False

    # CH of two curves intercept
    def CH_intercept(self, C):
        x = [val.x for val in self.points]
        y = [val.y for val in self.points]
        x2 = [val.x for val in C.points]
        y2 = [val.y for val in C.points]
        l1 = Point(min(x),max(y))
        r1 = Point(max(x),min(y))
        l2 = Point(min(x2),max(y2))
        r2 = Point(max(x2),min(y2))
        if (l1.x == r1.x or l1.y == r2.y or l2.x == r2.x or l2.y == r2.y): return False
        if(l1.x >= r2.x or l2.x >= r1.x): return False
        if(l1.y <= r2.y or l2.y <= r1.y): return False
        return True

    # Two curves intercept with epsioon error margin
    def curve_intercept(self, C, epsilon):
        if self.CH_intercept(C):
            if self.is_near_linear(epsilon):
                if C.is_near_linear(epsilon): return self.CH_intercept(C)
                else:
                    C1, C2 = C.split(0.5)
                    return self.curve_intercept(C1,epsilon) or self.curve_intercept(C2,epsilon)
            else:
                S1, S2 = self.split(0.5)
                return S1.curve_intercept(C,epsilon) or S2.curve_intercept(C,epsilon)
        return False    



if __name__ == "__main__":

    C = Besier(Point(1,1),Point(2,7),Point(8,6),Point(12,2))
    print(C.casteljau(0.25))
    C2, C3 = C.split(0.25)
    print([str(x) for x in C2.points])
    print([str(x) for x in C3.points])
    print(C.line_intercepts_CH(Line(1,1,0)))
    print(C.line_intercepts_CH(Line(1,1,-6)))
    print(C.line_intercepts(Line(1,1,0),0.1))
    D = Besier(Point(1,2),Point(2,3), Point(3,4))
    print(C.CH_intercept(D))
    print(C.curve_intercept(D,0.1))
    C = Besier(Point(2,0),Point(2,2),Point(3,0),Point(0.5,1))
    C.plot(2,color='y')
    C.plot(0.5,color='b')
    C.plot(0.3,color='g')
    C.plot(0.1,color='r')
    plt.show()