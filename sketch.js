var ctx;
var particles = [];
const MIN_SIZE = 2;
const MAX_SIZE = 16;
const PARTICLES_SIZE = 250;

const WIDTH = 800;
const HEIGHT = 800;

function setup() {
	createCanvas(WIDTH, HEIGHT);
	ctx = document.getElementById("defaultCanvas0").getContext("2d");

	for (var i = 0; i < PARTICLES_SIZE; i++) {
		const pos = createVector(random(200, 600), random(200, 600));
		const vel = createVector(random(-5, 5), random(-5, 5));
		const acc = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
		const size = random(MIN_SIZE, MAX_SIZE);
		particles.push(new Particle(pos, vel, acc, size));
	}
}

const hslColor = (matiz) => {
	return 'hsl(' + matiz + ', 100%, 50%)';
}

class Particle {
	constructor(pos, vel, acc, size, color) {
		this.pos = pos;
		this.acc = acc;
		this.size = size;
		this.zone = size * 4;
		this.vel = vel;

		this.glitter = random(0, this.size/2);

		let tailLength = map(size, MIN_SIZE, MAX_SIZE, 4, 16);
		this.tail = [];
		for (let i = 0; i < tailLength; i++) {
			this.tail.push(this.pos.copy());
		}

		this.maxforce = 2;
		this.maxSpeed = map(size, MIN_SIZE, MAX_SIZE, 18, 6);
	}

	getColor(){
		let m = map(this.vel.mag(), MIN_SIZE, MAX_SIZE, 359, 0);
		return hslColor(parseInt(m));
	}

	render() {
		let color = this.getColor();
		fill(color);
		stroke(color)
		for(let i = this.tail.length -1; i > 0; i--){
			let s = i/this.size;
			// ellipse(this.tail[i].x, this.tail[i].y, s, s);
			strokeWeight(s);
			line(this.tail[i].x, this.tail[i].y, this.tail[i-1].x, this.tail[i-1].y);
		}
		//ellipse(this.pos.x, this.pos.y, this.size, this.size);

	}

	applyForce(force) {
		this.acc = this.acc.add(force);
		this.acc = this.acc.limit(this.maxforce);
	}


	update() {
		let old_position = this.pos.copy();
		for(let i = 0; i < this.tail.length - 1; i++){
			this.tail[i] = this.tail[i+1]
		}
		this.tail[this.tail.length - 1] = old_position;

		this.vel = this.vel.add(this.acc);
		this.vel = this.vel.limit(this.maxSpeed);
		this.pos = this.pos.add(this.vel);
	
		this.acc = this.acc.mult(0);
		this.blink();

	}

	blink() {
		for(let i = 0; i < this.glitter; i++) {
			let color = this.getColor();
			fill(color);
			let x = this.pos.x + random(-this.zone, this.zone);
			let y = this.pos.y + random(-this.zone, this.zone);
			ellipse(x, y, 1, 1);
		}
	}

	avoid(others) {
		others.forEach(other => {
			let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y)
			if(d < this.zone && d != 0) {
				var desired = p5.Vector.sub(this.pos, other.pos);
				let avoidMag = map(Math.abs(this.size - other.size), MIN_SIZE, MAX_SIZE, 0.2, this.maxforce);
				desired.setMag(avoidMag);
				this.applyForce(desired);
			}			
		});
	}

	boundaries(width, height) {

		const setAttrib = (atrib, value) => {
			this.pos[atrib] = value;
			for(let i = 0; i < this.tail.length; i++){
				this.tail[i][atrib] = value;
			}
		}

		if(this.pos.x > width) {
			setAttrib('x', 0);
		} else if (this.pos.x < 0) {
			setAttrib('x', width);
		}

		if(this.pos.y > height) {
			setAttrib('y', 0);
		} else if (this.pos.y < 0) {
			setAttrib('y', height);
		}
	}

	beAttracted(target) {
		const d = dist(this.pos.x, this.pos.y, target.x, target.y);
		var desired = p5.Vector.sub(target, this.pos);
		desired.setMag(1);

		// desired.mult(10 / this.size);
		this.applyForce(desired);
	}
}

function draw() {
	ctx.globalCompositeOperation = "source-over";
	ctx.globalAlpha = 0.2;
	background(33);

	ctx.globalCompositeOperation = "lighter";
	ctx.globalAlpha = 1;

	frameRate(60);

	var target = createVector(mouseX, mouseY);

	particles.forEach(particle => {
		particle.render();
		particle.beAttracted(target);
		// particle.avoid(particles)
		particle.update();
		particle.boundaries(WIDTH, HEIGHT);
	});
	
}