// pH scale / Acid-Base titration beaker preset
// Draws a high-fidelity glass beaker with glowing liquid that dynamically changes color based on pH value.
// Expected state variables: pH (ph), volume (volume)
// Expected calculated telemetry: H+ concentration, OH- concentration

const PH = typeof ph !== 'undefined' ? ph : 7;
const VOL = typeof volume !== 'undefined' ? volume : 25;

// Beaker position
const bx = 320; // Center X
const by = 160; // Top of beaker Y
const bWidth = 140;
const bHeight = 140;

// Determine liquid color based on pH
// Phenolphthalein/General pH spectrum:
// pH 1-6: Light orange/reddish clear
// pH 7: Pale transparent green/blue
// pH 8+: Magenta/Pink (Phenolphthalein alkaline state)
let r = 241, g = 245, b = 249, alpha = 0.85; // Default clear
if (PH < 7) {
  // Acidic: Pale red/orange transparent
  const ratio = (7 - PH) / 6;
  r = 254;
  g = Math.round(242 - 120 * ratio);
  b = Math.round(242 - 180 * ratio);
} else if (PH === 7) {
  // Neutral: Pale green/blue
  r = 240; g = 253; b = 250;
} else {
  // Alkaline: Magenta/Pink indicator
  const ratio = Math.min(1.0, (PH - 7.0) / 4);
  r = Math.round(241 + 14 * ratio);
  g = Math.round(245 - 200 * ratio);
  b = Math.round(249 - 80 * ratio);
}

// 1. Draw Buret structure (Top adding liquid)
ctx.strokeStyle = '#94a3b8';
ctx.lineWidth = 4;
// Tube
ctx.beginPath();
ctx.moveTo(bx - 10, 10);
ctx.lineTo(bx - 10, by - 60);
ctx.moveTo(bx + 10, 10);
ctx.lineTo(bx + 10, by - 60);
ctx.stroke();

// Buret markings
ctx.strokeStyle = '#cbd5e1';
ctx.lineWidth = 1.5;
for (let y = 15; y < by - 70; y += 12) {
  ctx.beginPath();
  ctx.moveTo(bx - 10, y);
  ctx.lineTo(bx - 3, y);
  ctx.stroke();
}

// Stopcock / Valve
ctx.fillStyle = '#475569';
ctx.beginPath();
ctx.roundRect(bx - 16, by - 65, 32, 12, 3);
ctx.fill();
// Drip tip
ctx.strokeStyle = '#94a3b8';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(bx, by - 53);
ctx.lineTo(bx, by - 35);
ctx.stroke();

// Droplet animation
if (VOL > 0 && isPlaying) {
  const dripCycle = (time / 800) % 1.0; // Repeat drip cycle
  const dy = by - 35 + dripCycle * 50;
  if (dy < by + 50) {
    ctx.fillStyle = PH > 7 ? 'rgba(236, 72, 153, 0.85)' : 'rgba(14, 165, 233, 0.7)';
    ctx.beginPath();
    ctx.arc(bx, dy, 4.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Splash rings in water
    if (dripCycle > 0.9) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(bx, by + 50, 18 * (dripCycle - 0.9) * 10, 5 * (dripCycle - 0.9) * 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// 2. Draw Beaker
// Liquid filling (draw first so glass outlines stand on top)
const liquidTopY = by + 40; // fill level
const fillHeight = by + bHeight - liquidTopY - 5;
ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
ctx.beginPath();
ctx.roundRect(bx - bWidth / 2 + 5, liquidTopY, bWidth - 10, fillHeight, [0, 0, 14, 14]);
ctx.fill();

// Draw glowing liquid surface
ctx.fillStyle = `rgba(${r - 20}, ${g - 20}, ${b - 20}, 0.9)`;
ctx.beginPath();
ctx.ellipse(bx, liquidTopY, bWidth / 2 - 5, 8, 0, 0, Math.PI * 2);
ctx.fill();

// Beaker glass outline
ctx.strokeStyle = '#e2e8f0';
ctx.lineWidth = 4.5;
ctx.beginPath();
// Left lip
ctx.moveTo(bx - bWidth / 2 - 10, by);
ctx.lineTo(bx - bWidth / 2 + 2, by);
// Left wall
ctx.lineTo(bx - bWidth / 2 + 2, by + bHeight - 12);
// Rounded bottom
ctx.arcTo(bx - bWidth / 2 + 2, by + bHeight, bx - bWidth / 2 + 14, by + bHeight, 12);
ctx.lineTo(bx + bWidth / 2 - 14, by + bHeight);
ctx.arcTo(bx + bWidth / 2 - 2, by + bHeight, bx + bWidth / 2 - 2, by + bHeight - 12, 12);
// Right wall
ctx.lineTo(bx + bWidth / 2 - 2, by);
// Right lip
ctx.lineTo(bx + bWidth / 2 + 10, by);
ctx.stroke();

// Beaker glass highlights (semi-transparent reflection)
ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(bx - bWidth / 2 + 10, by + 20);
ctx.lineTo(bx - bWidth / 2 + 10, by + bHeight - 15);
ctx.stroke();

// Volume measurement lines
ctx.strokeStyle = '#94a3b8';
ctx.lineWidth = 1;
ctx.fillStyle = '#94a3b8';
ctx.font = '8px monospace';
const markingLevels = [
  { y: by + 100, label: '50mL' },
  { y: by + 75, label: '100mL' },
  { y: by + 50, label: '150mL' }
];
markingLevels.forEach(mark => {
  ctx.beginPath();
  ctx.moveTo(bx + bWidth / 2 - 15, mark.y);
  ctx.lineTo(bx + bWidth / 2 - 5, mark.y);
  ctx.stroke();
  ctx.fillText(mark.label, bx + bWidth / 2 - 45, mark.y + 3);
});

// 3. Draw Digital pH Probe (inside liquid)
const px = bx - 30;
const py = by + 20;
ctx.fillStyle = '#1e293b';
ctx.strokeStyle = '#475569';
ctx.lineWidth = 2;
// Probe body
ctx.beginPath();
ctx.roundRect(px - 6, py - 40, 12, 90, 4);
ctx.fill(); ctx.stroke();
// Glass bulb tip
ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
ctx.beginPath();
ctx.arc(px, py + 50, 5, 0, Math.PI * 2);
ctx.fill();

// Wire leading away
ctx.strokeStyle = '#1e293b';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.moveTo(px, py - 40);
ctx.bezierCurveTo(px, py - 80, px - 100, py - 80, bx - 140, py - 40);
ctx.stroke();

// 4. Draw Digital pH Reader Device (left side)
const dx = bx - 190;
const dy = py - 40;
ctx.fillStyle = '#0f172a';
ctx.strokeStyle = '#334155';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.roundRect(dx, dy, 74, 54, 10);
ctx.fill(); ctx.stroke();

// Screen
ctx.fillStyle = '#022c22';
ctx.beginPath();
ctx.roundRect(dx + 6, dy + 6, 62, 42, 4);
ctx.fill();

// LCD digits
ctx.fillStyle = '#34d399';
ctx.shadowColor = '#34d399';
ctx.shadowBlur = 6;
ctx.font = 'bold 16px Courier New';
ctx.textAlign = 'center';
ctx.fillText('pH: ' + PH.toFixed(2), dx + 37, dy + 32);
ctx.shadowBlur = 0; // reset
