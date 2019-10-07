
class Vet2 {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	
	copy() {
		return new Vet2(this.x, this.y);
	}
	
	len() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	}
	
	lenSq() {
		return this.x*this.x + this.y*this.y;
	}
	
	angle() {
		return h = Math.atan2(this.y, this.x);
	}
	
	cmp(v) {
		return (this.x == v.x) && (this.y == v.y);
	}
	
	dot(v) {
		return this.x*v.x + this.y*v.y;
	}
	
	cross(v) {
		return this.x*v.y - this.y*v.x;
	}
	
	dist(v) {
		return Math.sqrt((v.x-this.x)*(v.x-this.x) + (v.y-this.y)*(v.y-this.y));
	}
	
	distSq(v) {
		return (v.x-this.x)*(v.x-this.x) + (v.y-this.y)*(v.y-this.y);
	}
	
	
	
	
	
	
	
	
	set(v) {
		this.x = v.x;
		this.y = v.y;
	}
	
	setW(v, k) {
		this.x = v.x * k;
		this.y = v.y * k;
	}
	
	setxy(x, y) {
		this.x = x;
		this.y = y;
	}
	
	limit(k) {
		var lenSq = this.lenSq()
		if (lenSq > k * k) {
			let ftr = k / Math.sqrt(lenSq);
			this.x *= ftr;
			this.y *= ftr;
		}
	}
	
	unit() {
		this.mult(1 / this.len());
	}
	
	setLen(k) {
		this.mult(k / this.len());
	}
	
	rotate(theta) {
		this.x = this.x * Math.cos(theta) - this.y * Math.sin(theta);
		this.y = this.x * Math.sin(theta) + this.y * Math.cos(theta);
	}
	
	project(v) {
		var alpha = v.dot(this) / v.magSq();
		this.x = v.x * alpha;
		this.y = v.y * alpha;
	}
	
	
	
	
	
	
	
	
	
	sum(v) {
		this.x += v.x;
		this.y += v.y;
	}
	
	sumK(v, k) {
		this.x += v.x * k;
		this.y += v.y * k;
	}
	
	sub(v) {
		this.x -= v.x;
		this.y -= v.y;
	}
	
	subK(v, k) {
		this.x -= v.x * k;
		this.y -= v.y * k;
	}

	sumS(k) {
		this.x += k;
		this.y += k;
	}
	
	sumS2(k, l) {
		this.x += k;
		this.y += l;
	}
	
	mult(k) {
		this.x *= k;
		this.y *= k;
	}
	
	div(k) {
		this.x /= k;
		this.y /= k;
	}
	
	mult2(k, l) {
		this.x *= k;
		this.y *= l;
	}
	
	div2(k, l) {
		this.x /= k;
		this.y /= l;
	}
	
	
	
	
	
	
	
	$sum(v) {
		return new Vet2(this.x + v.x, this.y + v.y);
	}
	
	$sumK(v, k) {
		return new Vet2(this.x + v.x * k, this.y + v.y * k);
	}
	
	$sub(v) {
		return new Vet2(this.x - v.x, this.y - v.y);
	}
	
	$subK(v, k) {
		return new Vet2(this.x - v.x * k, this.y - v.y * k);
	}

	$sumS(k) {
		return new Vet2(this.x + k, this.y + k);
	}
	
	$sumS2(k, l) {
		return new Vet2(this.x + k, this.y + l);
	}
	
	$mult(k) {
		return new Vet2(this.x * k, this.y * k);
	}
	
	$div(k) {
		return new Vet2(this.x / k, this.y / k);
	}
	
	$mult2(k, l) {
		return new Vet2(this.x * k, this.y * l);
	}
	
	$div2(k, l) {
		return new Vet2(this.x / k, this.y / l);
	}
	
	
}