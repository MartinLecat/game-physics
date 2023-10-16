import Shape from "./Shape";
import Vector from "./Vector";

export type RectangleParameters = {
    x: number;
    y: number;
    width: number;
    height: number;
    mass?: number;
    name?: string;
    omega?: number;
    inactive?: boolean;
};

export default class Rectangle implements Shape {
    public mass: number;
    public width: number;
    public height: number;

    public name: string;
    public id: number;

    public topLeft: Vector;
    public topRight: Vector;
    public bottomLeft: Vector;
    public bottomRight: Vector;

    public velocity: Vector;
    public a: Vector;
    public theta: number;
    public omega: number;
    public alpha: number;
    public J: number;
    public inactive: boolean;

    static rectID: number = 0;

    constructor({ x, y, width, height, mass = 1, name = "", omega = 0, inactive = false }: RectangleParameters) {
        this.width = width;
        this.height = height;
        this.mass = mass;
        this.name = name;

        this.topLeft = new Vector(x, y);
        this.topRight = new Vector(x + this.width, y);
        this.bottomLeft = new Vector(x, y + this.height);
        this.bottomRight = new Vector(x + this.width, y + this.height);

        this.velocity = new Vector(0, 0);
        this.a = new Vector(0, 0);
        this.theta = 0;
        this.omega = omega;
        this.alpha = 0;
        this.J = (this.mass * (this.height ** 2 + this.width ** 2)) / 12000 || 1;
        this.id = Rectangle.rectID++;

        this.inactive = inactive;
    }

    center(): Vector {
        return this.bottomRight.add(this.topLeft).scale(0.5);
    }

    rotate(angle: number): Rectangle {
        this.theta += angle;
        let center = this.center();

        this.topLeft = this.topLeft.rotate(angle, center);
        this.topRight = this.topRight.rotate(angle, center);
        this.bottomLeft = this.bottomLeft.rotate(angle, center);
        this.bottomRight = this.bottomRight.rotate(angle, center);

        return this;
    }
    move(v: Vector): Rectangle {
        this.topLeft = this.topLeft.add(v);
        this.topRight = this.topRight.add(v);
        this.bottomLeft = this.bottomLeft.add(v);
        this.bottomRight = this.bottomRight.add(v);

        return this;
    }

    vertex(id: number): Vector {
        switch (id) {
            case 0:
                return this.topLeft;
            case 1:
                return this.topRight;
            case 2:
                return this.bottomLeft;
            case 3:
                return this.bottomRight;
            default:
                throw new Error("Unknown vertex id: " + id);
        }
    }

    draw(context: CanvasRenderingContext2D, drawPoints: boolean = false) {
        context.strokeStyle = "black";
        context.save();
        context.translate(this.topLeft.x, this.topLeft.y);
        context.rotate(this.theta);
        context.strokeRect(0, 0, this.width, this.height);
        if (drawPoints) {
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.font = "24px monospace";
            context.fillStyle = "black";
            context.fillText(this.name, this.width / 2, this.height / 2, this.width);
        }
        context.restore();

        if (drawPoints) {
            this.topLeft.draw(context);
            this.topRight.draw(context);
            this.bottomLeft.draw(context);
            this.bottomRight.draw(context);
        }
    }

    getPos() {
        return {
            topLeft: {
                x: this.topLeft.x,
                y: this.topLeft.y,
            },
            bottomRight: {
                x: this.bottomRight.x,
                y: this.bottomRight.y,
            },
        };
    }
}
