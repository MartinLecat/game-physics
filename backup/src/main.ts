import Engine from "./utils/Engine";
import Rectangle from "./utils/Rectangle";
import Vector from "./utils/Vector";

const startBtn = document.createElement("button");
startBtn.innerText = "START";
const stopBtn = document.createElement("button");
stopBtn.innerText = "STOP";
const loopBtn = document.createElement("button");
loopBtn.innerText = "LOOP";
const resetBtn = document.createElement("button");
resetBtn.innerText = "RESET";

const canvas = document.createElement("canvas");
canvas.width = 500;
canvas.height = 500;
Object.assign(canvas.style, {
    width: "500px",
    height: "500px",
    margin: "auto",
    border: "1px solid black",
} as CSSStyleDeclaration);
document.body.appendChild(canvas);
document.body.appendChild(startBtn);
document.body.appendChild(stopBtn);
document.body.appendChild(loopBtn);
document.body.appendChild(resetBtn);

Vector.POINT_SIZE = 10;
Engine.DEBUG = true;
const engine = new Engine(canvas, [
    new Rectangle({ x: 225, y: 400, width: 50, height: 50, mass: 1, name: "Mover", omega: 0 }),
    new Rectangle({ x: 55, y: -25, width: 390, height: 50, mass: 0, name: "Wall N", inactive: true }),
    new Rectangle({ x: 475, y: 55, width: 50, height: 390, mass: 0, name: "Wall E", inactive: true }),
    new Rectangle({ x: 55, y: 475, width: 390, height: 50, mass: 0, name: "Wall S", inactive: true }),
    new Rectangle({ x: -25, y: 55, width: 50, height: 390, mass: 0, name: "Wall W", inactive: true }),

    // new Rectangle({ x: 50, y: 400, width: 400, height: 50, mass: 0, name: "Wall" }),
]);
stopBtn.addEventListener("click", () => engine.stop());
startBtn.addEventListener("click", () => engine.start());
loopBtn.addEventListener("click", () => engine.loop());
resetBtn.addEventListener("click", () => window.location.reload());
window["engine"] = engine;
