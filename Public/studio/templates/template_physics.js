// Ohm's Law Preset Canvas Logic
// Draws a high-fidelity glowing circuit diagram with animated drifting electrons.
// Expected state variables: voltage (V), resistance (R)
// Expected calculated telemetry: current (I = V / R)

// Calculate state representation
const V = typeof voltage !== 'undefined' ? voltage : 5;
const R = typeof resistance !== 'undefined' ? resistance : 100;
const I = V / R; // Current in Amperes

// Draw wire loop (Circuit frame)
ctx.strokeStyle = '#cbd5e1';
ctx.lineWidth = 6;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';
ctx.beginPath();
ctx.rect(80, 60, 480, 200);
ctx.stroke();

// Draw active wire glow (depends on voltage)
if (V > 0) {
  ctx.strokeStyle = 'rgba(99, 102, 241, ' + Math.min(0.8, V / 15) + ')';
  ctx.lineWidth = 10;
  ctx.shadowColor = '#6366f1';
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow
}

// Draw Battery (Left side)
ctx.fillStyle = '#f8fafc';
ctx.fillRect(50, 130, 60, 60);
ctx.fillStyle = '#1e293b';
ctx.strokeStyle = '#334155';
ctx.lineWidth = 3;
// Negative plate
ctx.beginPath(); ctx.moveTo(60, 160); ctx.lineTo(100, 160); ctx.stroke();
// Positive plate
ctx.beginPath(); ctx.moveTo(70, 150); ctx.lineTo(90, 150); ctx.stroke();
ctx.beginPath(); ctx.moveTo(60, 140); ctx.lineTo(100, 140); ctx.stroke();
ctx.beginPath(); ctx.moveTo(70, 130); ctx.lineTo(90, 130); ctx.stroke();

// Label Battery
ctx.fillStyle = '#6366f1';
ctx.font = 'bold 12px sans-serif';
ctx.fillText('DC SOURCE: ' + V.toFixed(1) + ' V', 40, 110);

// Draw Resistor (Right side)
const rx = 560;
const ry = 120;
ctx.save();
ctx.fillStyle = '#f8fafc';
ctx.fillRect(rx - 15, ry, 30, 80);
// Draw body
const grad = ctx.createLinearGradient(rx - 12, ry, rx + 12, ry);
grad.addColorStop(0, '#f59e0b');
grad.addColorStop(0.5, '#fef3c7');
grad.addColorStop(1, '#d97706');
ctx.fillStyle = grad;
ctx.strokeStyle = '#b45309';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.roundRect(rx - 12, ry + 10, 24, 60, 8);
ctx.fill(); ctx.stroke();

// Draw resistor bands (indicates resistance value)
const bandColors = R < 50 ? ['#ef4444', '#ef4444', '#000000'] : R < 200 ? ['#1e293b', '#d97706', '#22c55e'] : ['#3b82f6', '#10b981', '#a855f7'];
ctx.fillStyle = bandColors[0]; ctx.fillRect(rx - 11, ry + 22, 22, 5);
ctx.fillStyle = bandColors[1]; ctx.fillRect(rx - 11, ry + 35, 22, 5);
ctx.fillStyle = bandColors[2]; ctx.fillRect(rx - 11, ry + 48, 22, 5);
ctx.restore();

// Label Resistor
ctx.fillStyle = '#d97706';
ctx.font = 'bold 12px sans-serif';
ctx.fillText('LOAD: ' + R.toFixed(0) + ' Ω', rx - 40, ry - 10);

// Draw electron animation (drifting dots)
if (I > 0) {
  const timeSec = time / 1000;
  const speed = I * 120; // Flow rate proportional to current
  const electronSpacing = 40;
  const totalLength = 2 * (480 + 200); // Perimeter of circuit rectangle (1360px)
  const count = Math.floor(totalLength / electronSpacing);

  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 6;

  for (let i = 0; i < count; i++) {
    // Current position on wire loop
    let dist = (i * electronSpacing + timeSec * speed) % totalLength;
    let ex = 80, ey = 60;

    if (dist < 480) { // Top wire
      ex = 80 + dist;
      ey = 60;
    } else if (dist < 480 + 200) { // Right wire
      ex = 560;
      ey = 60 + (dist - 480);
    } else if (dist < 480 + 200 + 480) { // Bottom wire
      ex = 560 - (dist - 480 - 200);
      ey = 260;
    } else { // Left wire
      ex = 80;
      ey = 260 - (dist - 480 - 200 - 480);
    }

    ctx.beginPath();
    ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0; // Reset glow
}
