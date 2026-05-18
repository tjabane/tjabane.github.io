const canvas = document.getElementById("agent-canvas");
const ctx = canvas.getContext("2d");
const palette = ["#4fd8e8", "#7468d8", "#96d85f", "#d85fb6", "#d89b4f"];
let width = 0;
let height = 0;
let agents = [];
let packets = [];
let dpr = 1;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createAgents();
}

function createAgents() {
  const count = width < 640 ? 9 : 14;
  agents = Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    const ring = Math.min(width, height) * (index % 2 ? 0.3 : 0.39);
    return {
      x: width * 0.62 + Math.cos(angle) * ring,
      y: height * 0.5 + Math.sin(angle) * ring * 0.78,
      baseX: width * 0.62 + Math.cos(angle) * ring,
      baseY: height * 0.5 + Math.sin(angle) * ring * 0.78,
      r: 8 + (index % 4),
      color: palette[index % palette.length],
      phase: Math.random() * Math.PI * 2
    };
  });
  packets = [];
}

function drawAgent(agent, time) {
  const bob = Math.sin(time * 0.0016 + agent.phase) * 4;
  const x = agent.x;
  const y = agent.y + bob;
  const outer = agent.r + 6;

  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = "rgba(79, 216, 232, 0.22)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "rgba(6, 10, 18, 0.96)";
  ctx.beginPath();
  ctx.arc(0, 0, agent.r + 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(79, 216, 232, 0.42)";
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  ctx.rect(-outer, -outer, outer * 2, outer * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(145, 167, 183, 0.72)";
  ctx.beginPath();
  ctx.arc(0, 0, agent.r * 0.62, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.12 + Math.sin(time * 0.002 + agent.phase) * 0.06;
  ctx.strokeStyle = agent.color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, agent.r + 23, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawLink(a, b, time) {
  const pulse = 0.16 + Math.sin(time * 0.0014 + a.phase + b.phase) * 0.06;
  ctx.strokeStyle = `rgba(54, 243, 255, ${pulse})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([12, 9]);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function spawnPackets() {
  if (packets.length > 18 || Math.random() > 0.22) return;
  const from = Math.floor(Math.random() * agents.length);
  const hop = 1 + Math.floor(Math.random() * 4);
  packets.push({
    from,
    to: (from + hop) % agents.length,
    t: 0,
    speed: 0.008 + Math.random() * 0.009,
    color: palette[Math.floor(Math.random() * palette.length)]
  });
}

function drawPackets() {
  packets = packets.filter((packet) => packet.t < 1);
  for (const packet of packets) {
    packet.t += packet.speed;
    const a = agents[packet.from];
    const b = agents[packet.to];
    const t = packet.t;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t + Math.sin(t * Math.PI) * -12;

    ctx.shadowColor = packet.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = packet.color;
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawBackground(time) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(54, 243, 255, 0.045)";
  ctx.lineWidth = 1;
  const spacing = 40;
  const offset = (time * 0.018) % spacing;

  for (let x = -spacing; x < width + spacing; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x + offset, 0);
    ctx.lineTo(x + offset, height);
    ctx.stroke();
  }

  for (let y = -spacing; y < height + spacing; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(width, y + offset);
    ctx.stroke();
  }

  const scanY = (time * 0.08) % height;
  const gradient = ctx.createLinearGradient(0, scanY - 42, 0, scanY + 42);
  gradient.addColorStop(0, "rgba(54, 243, 255, 0)");
  gradient.addColorStop(0.5, "rgba(54, 243, 255, 0.06)");
  gradient.addColorStop(1, "rgba(54, 243, 255, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, scanY - 42, width, 84);
}

function animate(time = 0) {
  drawBackground(time);

  agents.forEach((agent, index) => {
    agent.x = agent.baseX + Math.sin(time * 0.0009 + agent.phase) * 12;
    agent.y = agent.baseY + Math.cos(time * 0.0011 + agent.phase) * 10;
    const next = agents[(index + 1) % agents.length];
    const skip = agents[(index + 3) % agents.length];
    drawLink(agent, next, time);
    if (index % 3 === 0) drawLink(agent, skip, time);
  });

  spawnPackets();
  drawPackets();
  agents.forEach((agent) => drawAgent(agent, time));
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
resize();
requestAnimationFrame(animate);
