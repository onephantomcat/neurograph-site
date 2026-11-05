(() => {
  'use strict';

  const SVG = 'http://www.w3.org/2000/svg';
  const PAD = 5;
  const PORTS = ['right', 'bottom', 'left', 'top'];
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  function port(rect, side, other) {
    const { x, y, w, h } = rect;
    const horizontal = side === 'left' || side === 'right';
    const margin = Math.min(14, (horizontal ? h : w) / 2);
    const px = clamp(other.x + other.w / 2, x + margin, x + w - margin);
    const py = clamp(other.y + other.h / 2, y + margin, y + h - margin);
    if (side === 'left') return [[x - PAD, py], [x - 2 * PAD, py]];
    if (side === 'right') return [[x + w + PAD, py], [x + w + 2 * PAD, py]];
    if (side === 'top') return [[px, y - PAD], [px, y - 2 * PAD]];
    return [[px, y + h + PAD], [px, y + h + 2 * PAD]];
  }

  function hits([x, y], [u, v], rect) {
    const left = rect.x - PAD, right = rect.x + rect.w + PAD;
    const top = rect.y - PAD, bottom = rect.y + rect.h + PAD;
    return Math.min(x, u) < right && Math.max(x, u) > left &&
      Math.min(y, v) < bottom && Math.max(y, v) > top;
  }

  function route(from, to, rectangles) {
    if (!from || !to) return '';
    const bounds = rectangles.filter(rect =>
      rect.x < Math.max(from.x + from.w, to.x + to.w) + 40 &&
      rect.x + rect.w > Math.min(from.x, to.x) - 40 &&
      rect.y < Math.max(from.y + from.h, to.y + to.h) + 40 &&
      rect.y + rect.h > Math.min(from.y, to.y) - 40);
    let shortest = null;
    let best = Infinity;
    for (const start of PORTS) {
      for (const end of PORTS) {
        const [a, b] = port(from, start, to);
        const [d, c] = port(to, end, from);
        if ((start === 'top' && end === 'bottom') || (start === 'bottom' && end === 'top')) {
          const left = Math.max(from.x, to.x) + 14;
          const right = Math.min(from.x + from.w, to.x + to.w) - 14;
          if (left <= right) a[0] = b[0] = c[0] = d[0] = clamp(d[0], left, right);
        }
        if ((start === 'right' && end === 'left') || (start === 'left' && end === 'right')) {
          const top = Math.max(from.y, to.y) + 14;
          const bottom = Math.min(from.y + from.h, to.y + to.h) - 14;
          if (top <= bottom) a[1] = b[1] = c[1] = d[1] = clamp(d[1], top, bottom);
        }
        const xs = [(b[0] + c[0]) / 2, b[0], c[0]];
        const ys = [(b[1] + c[1]) / 2, b[1], c[1]];
        for (const rect of bounds) {
          xs.push(rect.x - PAD, rect.x + rect.w + PAD);
          ys.push(rect.y - PAD, rect.y + rect.h + PAD);
        }
        const lanes = [
          ...xs.map(x => [[x, b[1]], [x, c[1]]]),
          ...ys.map(y => [[b[0], y], [c[0], y]]),
        ];
        for (const lane of lanes) {
          const points = [a, b, ...lane, c, d].filter(([x, y], i, all) =>
            !i || x !== all[i - 1][0] || y !== all[i - 1][1]);
          let cost = 0;
          for (let i = 1; i < points.length; i += 1) {
            const [x, y] = points[i - 1], [u, v] = points[i];
            cost += Math.abs(x - u) + Math.abs(y - v);
            if (i > 1) {
              const [px, py] = points[i - 2];
              if ((x - px) * (u - x) + (y - py) * (v - y) < 0) cost = Infinity;
              else if ((u - x) * (y - py) !== (v - y) * (x - px)) cost += 12;
            }
          }
          if (cost >= best) continue;
          if (points.some((point, i) => i && rectangles.some(rect => hits(points[i - 1], point, rect)))) continue;
          shortest = points;
          best = cost;
        }
      }
    }
    return shortest ? 'M ' + shortest.map(point => point.join(' ')).join(' L ') : '';
  }

  function layer(host, name, groupClass) {
    host.insertAdjacentHTML('afterbegin', `<svg class="card-connections ${name}" aria-hidden="true">
      <defs>${['normal', 'future'].map(tone => `<marker id="${name}-${tone}" markerUnits="userSpaceOnUse"
        markerWidth="9" markerHeight="10" refX="8" refY="5" orient="auto">
        <path class="connector-tip ${tone}" d="M 1 1 L 8 5 L 1 9"/>
      </marker>`).join('')}</defs><g class="${groupClass}"></g>
    </svg>`);
    const group = host.firstElementChild.lastElementChild;
    return (edges, rectangles) => {
      const obstacles = [...rectangles.values()];
      edges.forEach(({ from, to, future }, index) => {
        let path = group.children[index];
        if (!path) {
          path = document.createElementNS(SVG, 'path');
          group.append(path);
        }
        path.dataset.from = from;
        path.dataset.to = to;
        path.classList.toggle('is-future', Boolean(future));
        path.setAttribute('marker-end', `url(#${name}-${future ? 'future' : 'normal'})`);
        const next = route(rectangles.get(from), rectangles.get(to), obstacles);
        if (path.getAttribute('d') !== next) path.setAttribute('d', next);
      });
      while (group.children.length > edges.length) group.lastElementChild.remove();
    };
  }

  function drag(element, start, { threshold = 4, move, finish }) {
    const { pointerId, clientX, clientY } = start;
    let moved = false;
    const update = event => {
      if (event.pointerId !== pointerId) return;
      const dx = event.clientX - clientX, dy = event.clientY - clientY;
      if (!moved && Math.hypot(dx, dy) < threshold) return;
      moved = true;
      if (event.type === 'pointermove') event.preventDefault();
      move(dx, dy);
    };
    const stop = event => {
      if (event.pointerId !== pointerId) return;
      const canceled = event.type !== 'pointerup';
      if (!canceled) update(event);
      listeners.abort();
      if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
      finish(moved, canceled);
    };
    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    element.addEventListener('pointermove', update, options);
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      element.addEventListener(type, stop, options);
    }
    element.setPointerCapture(pointerId);
  }

  window.CardConnections = { layer, drag };
})();
