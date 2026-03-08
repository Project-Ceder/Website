(() => {
  const canvas = document.getElementById('roots-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let branches = [];
  let animId;

  const COLORS = [
    'rgba(45, 74, 45, 0.6)',   // green-800
    'rgba(61, 107, 61, 0.5)',  // green-700
    'rgba(74, 124, 74, 0.35)', // green-600
    'rgba(26, 46, 26, 0.4)',   // green-900
  ];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createBranch(x, y, angle, width, depth, delay) {
    return { x, y, angle, width, depth, delay, segments: [], grown: 0, maxLen: rand(40, 90), done: false, color: COLORS[depth % COLORS.length] };
  }

  function grow(branch, dt) {
    if (branch.done || branch.delay > 0) {
      branch.delay -= dt;
      return;
    }

    const speed = 60; // px per second
    branch.grown += speed * dt;

    if (branch.grown >= branch.maxLen) {
      branch.done = true;

      // spawn children
      if (branch.depth < 6 && branch.width > 0.5) {
        const numChildren = branch.depth < 2 ? Math.floor(rand(2, 4)) : Math.floor(rand(1, 3));
        for (let i = 0; i < numChildren; i++) {
          const spread = rand(0.3, 0.8) * (Math.random() < 0.5 ? -1 : 1);
          const childAngle = branch.angle + spread;
          const childWidth = branch.width * rand(0.55, 0.75);
          const endPt = getEndpoint(branch);
          branches.push(createBranch(endPt.x, endPt.y, childAngle, childWidth, branch.depth + 1, rand(0, 0.3)));
        }
      }
    }
  }

  function getEndpoint(branch) {
    const len = Math.min(branch.grown, branch.maxLen);
    return {
      x: branch.x + Math.cos(branch.angle) * len,
      y: branch.y + Math.sin(branch.angle) * len,
    };
  }

  function drawBranch(branch) {
    if (branch.delay > 0) return;
    const len = Math.min(branch.grown, branch.maxLen);
    if (len <= 0) return;

    const end = getEndpoint(branch);

    ctx.beginPath();
    ctx.moveTo(branch.x, branch.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = branch.color;
    ctx.lineWidth = branch.width;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function init() {
    resize();
    branches = [];

    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;

    // start 2-3 trunks from the bottom
    const numTrunks = Math.floor(rand(2, 4));
    for (let i = 0; i < numTrunks; i++) {
      const x = w * rand(0.15, 0.85);
      const angle = -Math.PI / 2 + rand(-0.3, 0.3); // mostly upward
      branches.push(createBranch(x, h + 10, angle, rand(2.5, 4), 0, i * 0.4));
    }
  }

  let lastTime = 0;

  function animate(time) {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0.016;
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allDone = true;
    for (const branch of branches) {
      grow(branch, dt);
      drawBranch(branch);
      if (!branch.done) allDone = false;
    }

    if (!allDone || branches.length < 3) {
      animId = requestAnimationFrame(animate);
    } else {
      // final draw
      for (const branch of branches) drawBranch(branch);
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      init();
      lastTime = 0;
      animId = requestAnimationFrame(animate);
    }, 200);
  });

  init();
  animId = requestAnimationFrame(animate);
})();
