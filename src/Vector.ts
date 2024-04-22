const COLOR_DIST_DROPOF = 3;
const POINTS_DIST = 40;
const RANDOM_WEIGHT_POS = 0.25;

export class Vector {
  cls: any = Vector;
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.cls = Vector;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // Protected abstract method to be implemented in child classes
  protected createInstance(x: number, y: number, z: number): Vector {
    return new Vector(x, y, z);
  }

  copy(): this {
    return new this.cls(this.x, this.y, this.z);
  }

  cross(other: Vector): this {
    return new this.cls(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
    );
  }

  add(other: Vector): this {
    return new this.cls(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  sub(other: Vector): this {
    return new this.cls(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  mult(value: number): this {
    return new this.cls(this.x * value, this.y * value, this.z * value);
  }

  array() {
    return [this.x, this.y, this.z];
  }

  angleBetween(other: this) {
    const dot = this.x * other.x + this.y * other.y + this.z * other.z;
    return Math.acos(dot / (this.len() * other.len()));
  }

  len() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  dist(other: this): number {
    const v = this.sub(other);
    return v.len();
  }
}

class Color extends Vector {
  cls: any = Color;

  toHex(): string {
    const r = Math.min(Math.round(this.x), 250).toString(16).padStart(2, "0");
    const g = Math.min(Math.round(this.y), 250).toString(16).padStart(2, "0");
    const b = Math.min(Math.round(this.z), 250).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
}

class Polygon {
  a: Vector;
  b: Vector;
  c: Vector;

  constructor(p1: Vector, p2: Vector, p3: Vector) {
    this.a = p1;
    this.b = p2;
    this.c = p3;
  }

  get orthogonal() {
    const v1 = this.a.sub(this.b);
    const v2 = this.a.sub(this.c);
    let o = v1.cross(v2);
    if (o.z < 0) {
      return o.mult(-1);
    } else {
      return o;
    }
  }

  get center() {
    return new Vector(
      (this.a.x + this.b.x + this.c.x) / 3,
      (this.a.y + this.b.y + this.c.y) / 3,
      (this.a.z + this.b.z + this.c.z) / 3,
    );
  }
}

export class Light {
  color: Color;
  source: Vector;
  private readonly originalPos: Vector

  constructor(color: Color, source: Vector) {
    this.color = color;
    this.source = source;
    this.originalPos = source
  }

  move
}

export class Frame {
  height: number;
  width: number;
  polygons: Polygon[];
  lights: Light[];
  maxDist: number = 1000;

  constructor(height: number, width: number) {
    this.height = height + 2 * POINTS_DIST;
    this.width = width + 2 * POINTS_DIST;
    this.polygons = [];
    this.lights = [];

    this.generatePolygons();
  }

  get baseX() {
    return -POINTS_DIST;
  }

  get baseY() {
    return -POINTS_DIST;
  }

  get numX() {
    return Math.ceil(this.width / POINTS_DIST);
  }

  get numY() {
    return Math.ceil(this.height / POINTS_DIST);
  }

  generatePolygons() {
    let pointArray = this.generatePointArray();

    for (let y = 0; y < this.numY; y++) {
      for (let x = 1; x < this.numX; x++) {
        let p = pointArray[y][x];
        let pr = pointArray[y][x - 1];
        let pt = pointArray[y + 1][x];
        let pd = pointArray[y + 1][x - 1];

        if (p && pr && pd) {
          this.polygons.push(new Polygon(p, pr, pd));
        }

        if (p && pt && pd) {
          this.polygons.push(new Polygon(p, pt, pd));
        }
      }
    }
  }

  generatePointArray() {
    let pointArray: Vector[][] = [];

    const fuzzyness = POINTS_DIST * RANDOM_WEIGHT_POS;
    for (let y = 0; y <= this.numY; y++) {
      let pointLine = [];
      for (let x = 0; x <= this.numX; x++) {
        const fuzzyX = random(
          x * POINTS_DIST + this.baseX - fuzzyness,
          x * POINTS_DIST + this.baseX + fuzzyness,
        );
        const fuzzyY = random(
          y * POINTS_DIST + this.baseY - fuzzyness,
          y * POINTS_DIST + this.baseY + fuzzyness,
        );
        const fuzzyZ = random(0, 15);
        pointLine.push(new Vector(fuzzyX, fuzzyY, fuzzyZ));
      }
      pointArray.push(pointLine);
    }
    return pointArray;
  }

  addLight(
    r: number,
    g: number,
    b: number,
    x: number,
    y: number,
    z: number,
  ): Light {
    const light = new Light(new Color(r, g, b), new Vector(x, y, z));
    this.lights.push(light);
    return light;
  }

  drawOnCanvas(canvas: CanvasRenderingContext2D) {
    canvas.fillStyle = "black";
    canvas.fillRect(0, 0, canvas.canvas.width, canvas.canvas.height);

    for (const p of this.polygons) {
      this.draw_polygon(p, canvas);
    }
  }

  draw_polygon(p: Polygon, canvas: CanvasRenderingContext2D) {
    let color = this.polygon_mix_color(p, 1500);
    let path = new Path2D();
    path.moveTo(p.a.x, p.a.y);
    path.lineTo(p.b.x, p.b.y);
    path.lineTo(p.c.x, p.c.y);
    path.closePath();
    canvas.fillStyle = color.toHex();
    canvas.fill(path, "nonzero"); // TODO evenodd ????

    canvas.lineWidth = 2;
    canvas.strokeStyle = color.toHex();
    canvas.stroke(path);
  }

  polygon_mix_color(p: Polygon, maxDist: number): Color {
    let colors: Color[] = [];

    for (const light of this.lights) {
      colors.push(this.polygon_color_part(p, light, maxDist));
    }
    return colors.reduce((a, b) => a.add(b));
  }

  polygon_color_part(p: Polygon, l: Light, maxDist: number): Color {
    let color = l.color.copy();
    const relDist = l.source.dist(p.center) / maxDist;
    color = color.mult(Math.max(0, 1 - relDist) * COLOR_DIST_DROPOF);

    const angle = Math.abs(p.orthogonal.angleBetween(l.source.sub(p.center)));
    color = color.mult(0.25 + Math.cos(angle) * 0.75);

    return color;
  }

  maxLightDist(): number {
    let max = 0;
    for (const a of this.lights) {
      for (const b of this.lights) {
        const d = Math.abs(a.source.dist(b.source));
        if (d > max) {
          max = d;
        }
      }
    }

    return 0;
  }
}

const random = (from: number, to: number) => {
  const scale = to - from;
  return Math.random() * scale + from;
};
