/* Fundo "rede neural": nós ligados por linhas, pulsos de dados e símbolos de código.
   Cores: verde WhatsApp + azul/vermelho/amarelo/verde do Google. */
(function () {
  var cv = document.createElement('canvas');
  cv.id = 'net-bg';
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none';
  document.body.prepend(cv);
  var ctx = cv.getContext('2d');

  var COLORS = ['#25D366', '#25D366', '#4285F4', '#EA4335', '#FBBC05', '#34A853'];
  var GLYPHS = ['</>', '{ }', '01', '=>', '[ ]', '&&', '#', '//'];
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, DPR, nodes = [], pulses = [], mouse = { x: -999, y: -999 };

  function size() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var n = Math.round(Math.min(90, Math.max(28, W * H / 22000)));
    nodes = [];
    for (var i = 0; i < n; i++) {
      var code = Math.random() < 0.14;
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
        r: 1.4 + Math.random() * 1.8,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        g: code ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : null
      });
    }
  }

  function hex(c, a) {
    var v = parseInt(c.slice(1), 16);
    return 'rgba(' + (v >> 16) + ',' + ((v >> 8) & 255) + ',' + (v & 255) + ',' + a + ')';
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    var D = Math.min(150, Math.max(105, W / 9)), i, j, a, b;

    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      if (!reduce) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < -20) a.x = W + 20; else if (a.x > W + 20) a.x = -20;
        if (a.y < -20) a.y = H + 20; else if (a.y > H + 20) a.y = -20;
      }
      for (j = i + 1; j < nodes.length; j++) {
        b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < D) {
          var g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          var al = (1 - d / D) * .22;
          g.addColorStop(0, hex(a.c, al)); g.addColorStop(1, hex(b.c, al));
          ctx.strokeStyle = g; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          if (!reduce && Math.random() < .0009 && pulses.length < 14)
            pulses.push({ a: a, b: b, t: 0, c: a.c });
        }
      }
      // reage ao mouse: liga o nó ao cursor
      var mx = a.x - mouse.x, my = a.y - mouse.y, md = Math.sqrt(mx * mx + my * my);
      if (md < 170) {
        ctx.strokeStyle = hex('#25D366', (1 - md / 170) * .4);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }

    for (i = 0; i < nodes.length; i++) {
      a = nodes[i];
      if (a.g) {
        ctx.font = '600 13px ui-monospace,SFMono-Regular,Menlo,monospace';
        ctx.fillStyle = hex(a.c, .5);
        ctx.fillText(a.g, a.x, a.y);
      } else {
        ctx.fillStyle = hex(a.c, .75);
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
      }
    }

    // pulsos de dados viajando pelas conexões
    for (i = pulses.length - 1; i >= 0; i--) {
      var p = pulses[i]; p.t += .02;
      if (p.t >= 1) { pulses.splice(i, 1); continue; }
      var px = p.a.x + (p.b.x - p.a.x) * p.t, py = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillStyle = hex(p.c, .95); ctx.shadowColor = p.c; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
    }

    if (!reduce) requestAnimationFrame(frame);
  }

  addEventListener('resize', function () { size(); if (reduce) frame(); });
  addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
  size(); frame();
})();
