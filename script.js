const canvas = document.getElementById("agent-canvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let dpr = 1;
let nodes = [];
let edges = [];
let pulses = [];
let activeNode = 0;
let gossipQueue = [];
let lastBeat = 0;
let beatStep = 0;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildNetwork();
}

function buildNetwork() {
  const count = width < 640 ? 18 : 34;
  const centerX = width * 0.64;
  const centerY = height * 0.5;
  const radius = Math.min(width, height) * 0.34;

  nodes = Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    const band = index % 3;
    const offset = band === 0 ? 0.48 : band === 1 ? 0.74 : 1;
    return {
      x: centerX + Math.cos(angle) * radius * offset,
      y: centerY + Math.sin(angle) * radius * 0.78 * offset,
      phase: Math.random() * Math.PI * 2,
      charge: 0
    };
  });

  edges = [];
  for (let index = 0; index < count; index += 1) {
    edges.push([index, (index + 1) % count]);
    edges.push([index, (index + 2) % count]);
    if (index % 3 === 0) edges.push([index, (index + 7) % count]);
    if (index % 5 === 0) edges.push([index, (index + 11) % count]);
  }

  pulses = [];
  activeNode = Math.floor(count * 0.2);
  gossipQueue = [activeNode];
  beatStep = 0;
  nodes[activeNode].charge = 1;
}

function neighborsOf(index) {
  return edges
    .filter(([a, b]) => a === index || b === index)
    .map(([a, b]) => (a === index ? b : a));
}

function stepGossip(time) {
  const interval = beatStep % 2 === 0 ? 260 : 780;
  if (time - lastBeat < interval) return;
  lastBeat = time;
  beatStep += 1;

  activeNode = gossipQueue.shift() ?? activeNode;
  const neighbors = neighborsOf(activeNode);
  const fanout = Math.min(neighbors.length, width < 640 ? 3 : 5);
  const shuffled = [...neighbors].sort(() => Math.random() - 0.5);
  const targets = shuffled.slice(0, fanout);

  for (const target of targets) {
    pulses.push({
      from: activeNode,
      to: target,
      start: time + Math.random() * 120,
      duration: 980
    });
    gossipQueue.push(target);
  }

  activeNode = targets[Math.floor(Math.random() * targets.length)];
  nodes[activeNode].charge = 1;

  if (gossipQueue.length > nodes.length * 2) {
    gossipQueue = gossipQueue.slice(-nodes.length);
  }
}

function drawBackground(time) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(54, 243, 255, 0.035)";
  ctx.lineWidth = 1;

  const spacing = 42;
  const offset = (time * 0.012) % spacing;
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
}

function drawEdges() {
  ctx.lineWidth = 1;
  for (const [from, to] of edges) {
    const a = nodes[from];
    const b = nodes[to];
    ctx.strokeStyle = "rgba(79, 216, 232, 0.09)";
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

function drawNodes(time) {
  for (const node of nodes) {
    node.charge *= 0.94;
    const glow = 0.08 + node.charge * 0.32;
    const driftX = Math.sin(time * 0.0006 + node.phase) * 5;
    const driftY = Math.cos(time * 0.0007 + node.phase) * 4;

    ctx.save();
    ctx.translate(node.x + driftX, node.y + driftY);
    ctx.fillStyle = `rgba(79, 216, 232, ${0.36 + node.charge * 0.18})`;
    ctx.strokeStyle = `rgba(232, 247, 255, ${0.28 + glow})`;
    ctx.shadowColor = `rgba(79, 216, 232, ${glow})`;
    ctx.shadowBlur = 10 + 14 * node.charge;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawPulses(time) {
  pulses = pulses.filter((pulse) => time - pulse.start < pulse.duration);

  for (const pulse of pulses) {
    const a = nodes[pulse.from];
    const b = nodes[pulse.to];
    const t = Math.min((time - pulse.start) / pulse.duration, 1);
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    const alpha = Math.sin(t * Math.PI);

    if (t > 0.88) b.charge = Math.max(b.charge, alpha);

    ctx.save();
    ctx.shadowColor = `rgba(79, 216, 232, ${0.5 * alpha})`;
    ctx.shadowBlur = 16;
    ctx.fillStyle = `rgba(79, 216, 232, ${0.52 * alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function animate(time = 0) {
  stepGossip(time);
  drawBackground(time);
  drawEdges();
  drawPulses(time);
  drawNodes(time);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
resize();
requestAnimationFrame(animate);
