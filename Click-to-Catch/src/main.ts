const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

interface Circle {
    x: number;
    y: number;
    r: number;
    dx: number;
    dy: number;
    color: string;
}

let circles: Circle[] = [];
let score = 0;

function spawnCircle(): void {
    const r = 20 + Math.random() * 15;
    circles.push({
        x: Math.random() * (canvas.width - 2 * r) + r,
        y: Math.random() * (canvas.height - 2 * r) + r,
        r: r,
        dx: (Math.random() - 0.5) * 4,
        dy: (Math.random() - 0.5) * 4,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
}

function update(): void {
    if (!ctx) throw new Error("Canvas not supported");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const c of circles) {
        c.x += c.dx;
        c.y += c.dy;

        if (c.x < c.r || c.x > canvas.width - c.r) {
            c.dx *= -1;
        }
        if (c.y < c.r || c.y > canvas.height - c.r) {
            c.dy *= -1;
        }

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fillStyle = c.color;
        ctx.fill();
    }

    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);

    requestAnimationFrame(update);
}

canvas.addEventListener("click", (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const c of circles) {
        const dx = mouseX - c.x;
        const dy = mouseY - c.y;
        if (Math.sqrt(dx * dx + dy * dy) < c.r) {
            score++;
            circles = circles.filter(circle => circle !== c);
            break;
        }
    }
})

setInterval(spawnCircle, 1000);
update();