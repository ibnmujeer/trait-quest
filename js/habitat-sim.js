/**
 * Trait Quest - Interactive Habitat Survival Simulator (HTML5 Canvas)
 * Renders a smooth, animated 2D habitat scene (Forest, Desert, or Snow) and
 * animates the selected animal through 4 environmental checkpoints!
 */

window.TraitQuestHabitatSim = (() => {
  let animFrameId = null;
  let particles = [];
  let svgImageCache = {};

  function getAnimalImage(animal) {
    const key = `${animal.speciesId}_${animal.traits.coat}_${animal.traits.ears}_${animal.traits.color}_${animal.traits.special}`;
    if (svgImageCache[key]) {
      return Promise.resolve(svgImageCache[key]);
    }
    return new Promise((resolve) => {
      const svgString = window.TraitQuestArt.renderAnimalSVG(animal, { size: 180, animated: false });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        svgImageCache[key] = img;
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  function initParticles(habitatId, width, height) {
    particles = [];
    const count = habitatId === 'snow' ? 40 : habitatId === 'forest' ? 18 : 22;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 4 + 2,
        vx: habitatId === 'snow' ? -1.2 - Math.random() : habitatId === 'desert' ? 1.5 + Math.random() : -0.4 + Math.random() * 0.8,
        vy: habitatId === 'snow' ? 1.2 + Math.random() * 1.5 : habitatId === 'desert' ? -0.2 + Math.random() * 0.4 : 0.6 + Math.random() * 0.6,
        alpha: 0.4 + Math.random() * 0.5
      });
    }
  }

  function drawHabitatBackground(ctx, habitatId, width, height, tick) {
    if (habitatId === 'forest') {
      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.72);
      sky.addColorStop(0, '#B7F0D8');
      sky.addColorStop(1, '#E6F9EB');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Sunbeams
      ctx.save();
      ctx.fillStyle = 'rgba(255, 253, 208, 0.28)';
      ctx.beginPath();
      ctx.moveTo(80, 0);
      ctx.lineTo(180, 0);
      ctx.lineTo(310, height);
      ctx.lineTo(140, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Distant trees
      for (let x = 30; x < width + 40; x += 95) {
        drawPineTree(ctx, x, height * 0.68, 0.75, '#4C9A67', '#5D4037');
      }
      // Closer trees
      for (let x = -10; x < width + 50; x += 130) {
        drawPineTree(ctx, x, height * 0.74, 1.0, '#2E7D32', '#4E342E');
      }

      // Forest Ground
      const ground = ctx.createLinearGradient(0, height * 0.7, 0, height);
      ground.addColorStop(0, '#4CAF50');
      ground.addColorStop(1, '#2E6B31');
      ctx.fillStyle = ground;
      ctx.fillRect(0, height * 0.72, width, height * 0.28);

      // Fallen log obstacle near 75% width
      ctx.fillStyle = '#6D4C41';
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 3;
      roundRect(ctx, width * 0.72, height * 0.68, 64, 24, 10, true, true);
    } else if (habitatId === 'desert') {
      // Desert Sky
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.72);
      sky.addColorStop(0, '#FDBA74');
      sky.addColorStop(1, '#FEF3C7');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Blazing Sun
      const pulse = Math.sin(tick * 0.06) * 4;
      ctx.fillStyle = 'rgba(251, 191, 36, 0.32)';
      ctx.beginPath();
      ctx.arc(width - 90, 62, 46 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(width - 90, 62, 32, 0, Math.PI * 2);
      ctx.fill();

      // Sand Dunes
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      ctx.quadraticCurveTo(width * 0.28, height * 0.54, width * 0.56, height * 0.72);
      ctx.quadraticCurveTo(width * 0.8, height * 0.56, width, height * 0.72);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Foreground Sand
      const sand = ctx.createLinearGradient(0, height * 0.7, 0, height);
      sand.addColorStop(0, '#FBBF24');
      sand.addColorStop(1, '#D97706');
      ctx.fillStyle = sand;
      ctx.fillRect(0, height * 0.72, width, height * 0.28);

      // Cacti
      drawCactus(ctx, width * 0.22, height * 0.72, 0.9);
      drawCactus(ctx, width * 0.68, height * 0.73, 1.05);
    } else {
      // Frozen Tundra Sky
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.72);
      sky.addColorStop(0, '#7DD3FC');
      sky.addColorStop(1, '#E0F2FE');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      // Icy Mountains
      ctx.fillStyle = '#BAE6FD';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      ctx.lineTo(width * 0.2, height * 0.35);
      ctx.lineTo(width * 0.42, height * 0.72);
      ctx.lineTo(width * 0.65, height * 0.3);
      ctx.lineTo(width * 0.9, height * 0.72);
      ctx.closePath();
      ctx.fill();

      // Snowdrifts
      const snow = ctx.createLinearGradient(0, height * 0.7, 0, height);
      snow.addColorStop(0, '#FFFFFF');
      snow.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = snow;
      ctx.fillRect(0, height * 0.72, width, height * 0.28);

      // Deep snowbank obstacle
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.arc(width * 0.74, height * 0.74, 34, Math.PI, 0);
      ctx.fill();
    }

    // Weather Particles
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > width + 10) p.x = -10;
      if (p.x < -10) p.x = width + 10;
      if (p.y > height) p.y = -10;

      ctx.save();
      if (habitatId === 'snow') {
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha + 0.2})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (habitatId === 'forest') {
        ctx.fillStyle = `rgba(76, 175, 80, ${p.alpha})`;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r * 1.4, p.r * 0.8, 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(245, 158, 11, ${p.alpha * 0.65})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawPineTree(ctx, x, groundY, scale, leafColor, trunkColor) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);
    ctx.fillStyle = trunkColor;
    ctx.fillRect(-8, -24, 16, 26);

    ctx.fillStyle = leafColor;
    for (let layer = 0; layer < 3; layer++) {
      const yOffset = -20 - layer * 24;
      const halfW = 36 - layer * 7;
      ctx.beginPath();
      ctx.moveTo(0, yOffset - 38);
      ctx.lineTo(-halfW, yOffset);
      ctx.lineTo(halfW, yOffset);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCactus(ctx, x, groundY, scale) {
    ctx.save();
    ctx.translate(x, groundY);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#15803D';
    ctx.strokeStyle = '#14532D';
    ctx.lineWidth = 2.5;
    roundRect(ctx, -9, -62, 18, 64, 8, true, true);
    roundRect(ctx, -26, -46, 18, 10, 5, true, true);
    roundRect(ctx, -26, -60, 10, 20, 5, true, true);
    roundRect(ctx, 8, -38, 18, 10, 5, true, true);
    roundRect(ctx, 16, -54, 10, 22, 5, true, true);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  /**
   * Renders a static preview of the habitat & animal before/after the test run
   */
  async function renderIdleScene(canvas, animal, habitatId) {
    if (!canvas) return;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    initParticles(habitatId, width, height);
    const img = await getAnimalImage(animal);

    drawHabitatBackground(ctx, habitatId, width, height, 0);
    if (img) {
      ctx.drawImage(img, width * 0.5 - 65, height * 0.72 - 115, 130, 130);
    }
  }

  /**
   * Runs a lively 3.6-second interactive survival test across the habitat!
   * Calls `onStep(stepIndex, breakdownItem)` as each of the 4 traits is tested,
   * and `onComplete(evalResult)` when finished.
   */
  async function runSimulation(canvas, animal, habitatId, evalResult, onStep, onComplete) {
    if (!canvas) return;
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    initParticles(habitatId, width, height);
    const img = await getAnimalImage(animal);

    const totalFrames = 210; // ~3.5 seconds at 60fps
    let frame = 0;
    let lastStepFired = -1;
    const floatingBadges = [];

    function stepLoop() {
      frame++;
      const progress = Math.min(1, frame / totalFrames);

      drawHabitatBackground(ctx, habitatId, width, height, frame);

      // Trigger the 4 trait checkpoints at 15%, 38%, 62%, 84%
      const stepThresholds = [0.14, 0.38, 0.62, 0.84];
      stepThresholds.forEach((threshold, idx) => {
        if (progress >= threshold && lastStepFired < idx) {
          lastStepFired = idx;
          const item = evalResult.breakdown[idx];
          if (item) {
            if (item.status === 'good') {
              window.TraitQuestAudio.playCorrect();
            } else if (item.status === 'ok') {
              window.TraitQuestAudio.playPop();
            } else {
              window.TraitQuestAudio.playWrong();
            }
            floatingBadges.push({
              x: width * (0.14 + progress * 0.72),
              y: height * 0.45,
              text: `${item.traitIcon} ${item.status === 'good' ? '+25 Great!' : item.status === 'ok' ? `+${item.points} Okay` : `+${item.points} Tough!`}`,
              status: item.status,
              age: 0
            });
            if (onStep) onStep(idx, item);
          }
        }
      });

      // Animal position along the path with a joyful hop
      const animalX = width * 0.08 + progress * (width * 0.72);
      const hop = Math.abs(Math.sin(frame * 0.22)) * 16;
      const animalY = height * 0.72 - 115 - hop;

      if (img) {
        ctx.drawImage(img, animalX, animalY, 126, 126);
      }

      // Draw floating checkpoint feedback badges
      floatingBadges.forEach((b) => {
        b.age++;
        b.y -= 0.7;
        const alpha = Math.max(0, 1 - b.age / 65);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        const textW = ctx.measureText(b.text).width + 22;
        ctx.fillStyle = b.status === 'good' ? '#16A34A' : b.status === 'ok' ? '#D97706' : '#DC2626';
        roundRect(ctx, b.x - textW / 2, b.y - 16, textW, 30, 14, true, false);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.text, b.x, b.y);
        ctx.restore();
      });

      // Draw Progress Bar at top of canvas
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      roundRect(ctx, 20, 16, width - 40, 14, 7, true, false);
      ctx.fillStyle = '#16A34A';
      roundRect(ctx, 20, 16, Math.max(14, (width - 40) * progress), 14, 7, true, false);

      if (frame < totalFrames) {
        animFrameId = requestAnimationFrame(stepLoop);
      } else {
        animFrameId = null;
        if (onComplete) onComplete(evalResult);
      }
    }

    animFrameId = requestAnimationFrame(stepLoop);
  }

  return {
    renderIdleScene,
    runSimulation
  };
})();
