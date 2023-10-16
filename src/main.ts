import Circle from "./utils/Circle";
import Engine from "./utils/Engine";
import Rectangle from "./utils/Rectangle";
import Vector from "./utils/Vector";

declare global {
    interface Window {
        engine: Engine;
    }
}

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

Engine.DEBUG = false;
const engine = new Engine(canvas, [
    new Circle({ x: 250, y: 240, radius: 25 }),
    // new Circle({ x: 250, y: 650, radius: 250, fixed: true }),
    // new Circle({ x: 250, y: -150, radius: 250, fixed: true }),
    // new Circle({ x: -150, y: 250, radius: 250, fixed: true }),
    // new Circle({ x: 650, y: 250, radius: 250, fixed: true }),
    new Rectangle({ x: 50, y: 350, width: 400, height: 50, fixed: true, name: "Fix" }),
]);

stopBtn.addEventListener("click", () => engine.stop());
startBtn.addEventListener("click", () => engine.start());
loopBtn.addEventListener("click", () => engine.loop(0));
resetBtn.addEventListener("click", () => window.location.reload());
canvas.addEventListener("click", function (event) {
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < 1; i++) {
        engine.insertShape(
            new Circle({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                radius: 10,
            })
        );
    }
});

window.engine = engine;
