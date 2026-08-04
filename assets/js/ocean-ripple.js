/**
 * Ocean Ripple — a "Ribbon Field" stripe gradient rendered to canvas.
 *
 * Recreates the 21st.dev "Ocean Ripple" preset:
 *
 *   Foam      #EAF7FB @ 0%
 *   Sky blue  #7FC6E6 @ 33%
 *   Cobalt    #2E7CC0 @ 67%
 *   Navy      #123A6B @ 100%
 *
 *   mode stripes · angle 90 · count 6 · softness 22 · wave 12 · spread -20
 *   fade 40 · envelope ramp · soften 4 · animated false · backdrop #EAF4FC
 *
 * ---------------------------------------------------------------------------
 * Why the colour ramp is a stop table rather than a re-derived generator
 * ---------------------------------------------------------------------------
 * The preset ships an exact CSS equivalent and states the guarantee plainly:
 * "A CSS linear-gradient is exact only when `wave` is zero." So the published
 * stop list *is* the ground truth for the wave-free field — `count`, `spread`,
 * `fade`, `envelope` and `softness` are already baked into those percentages.
 *
 * Reproducing them from the raw parameters would mean guessing at a generator
 * whose internals are not published, and guessing wrong is invisible until you
 * compare the two side by side. Sampling the published stops instead makes the
 * wave-zero case exact by construction, and leaves `wave` as the one thing
 * canvas genuinely adds over CSS. That is the whole reason this file exists.
 *
 * Not modelled: `distortion` (undefined in the preset), `grain` and `vignette`
 * (both 0 here, so they are no-ops anyway).
 *
 * ---------------------------------------------------------------------------
 * Why it renders at half scale and is blurred on the way up
 * ---------------------------------------------------------------------------
 * The stop table has deliberately tight transitions — the Foam/Sky edge ramps
 * over 3.63% of the width — so once `wave` bends it, the boundary is a nearly
 * vertical hard edge sliding sideways a few pixels per row. Rasterise that too
 * coarsely and the bilinear upscale cannot hide the row quantisation: the edge
 * reads as a staircase rather than a curve. Half scale plus a real blur is what
 * makes it a ripple.
 *
 * `soften: 4` is that blur, and it is applied by drawing the layer *larger than
 * the canvas* so the blur kernel's transparent fringe falls outside the visible
 * area instead of leaving a pale rim around the band.
 *
 * `animated: false` in the preset, so this paints once per resize and then
 * costs nothing. Set `data-animated="true"` on the canvas to opt into the slow
 * drift; it is skipped anyway under `prefers-reduced-motion`.
 */
(function () {
  "use strict";

  var TAU = Math.PI * 2;

  // Preset parameters.
  var ANGLE = 90; // degrees; 90 = left-to-right, matching `linear-gradient(90deg, …)`
  var CENTER_X = 50;
  var CENTER_Y = 50;
  var WAVE = 12;
  var SOFTEN = 4;
  var SPEED = 40;
  var BACKDROP = "#EAF4FC";

  // The published wave-free field, as CSS stop positions.
  var STOPS = [
    { t: 0.0, c: [0xea, 0xf7, 0xfb] }, // Foam
    { t: 0.165, c: [0xea, 0xf7, 0xfb] },
    { t: 0.2013, c: [0x7f, 0xc6, 0xe6] }, // Sky blue
    { t: 0.4637, c: [0x7f, 0xc6, 0xe6] },
    { t: 0.5363, c: [0x2e, 0x7c, 0xc0] }, // Cobalt
    { t: 0.7987, c: [0x2e, 0x7c, 0xc0] },
    { t: 0.835, c: [0x12, 0x3a, 0x6b] }, // Navy
    { t: 1.0, c: [0x12, 0x3a, 0x6b] },
  ];

  // Precomputed colour ramp. CSS gradients interpolate in sRGB by default, so
  // the lerp below is componentwise on the raw bytes on purpose — converting to
  // linear light here would *not* match the CSS fallback.
  var LUT_N = 2048;
  var lut = new Uint8Array(LUT_N * 3);
  (function buildLut() {
    var seg = 0;
    for (var i = 0; i < LUT_N; i++) {
      var t = i / (LUT_N - 1);
      while (seg < STOPS.length - 2 && t > STOPS[seg + 1].t) seg++;
      var a = STOPS[seg];
      var b = STOPS[seg + 1];
      var span = b.t - a.t;
      var f = span <= 0 ? 0 : (t - a.t) / span;
      if (f < 0) f = 0;
      else if (f > 1) f = 1;
      var o = i * 3;
      lut[o] = a.c[0] + (b.c[0] - a.c[0]) * f;
      lut[o + 1] = a.c[1] + (b.c[1] - a.c[1]) * f;
      lut[o + 2] = a.c[2] + (b.c[2] - a.c[2]) * f;
    }
  })();

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  var scratch = document.createElement("canvas");

  function paint(canvas, clock) {
    var rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    // Displayed backing store, capped: the image is blurred, so device-pixel
    // fidelity would buy nothing but memory.
    var W = clamp(Math.round(rect.width), 16, 1440);
    var H = clamp(Math.round(rect.height), 16, 560);

    // Half-scale raster.
    var w = Math.max(8, Math.round(W / 2));
    var h = Math.max(8, Math.round(H / 2));

    scratch.width = w;
    scratch.height = h;
    var sctx = scratch.getContext("2d");
    var img = sctx.createImageData(w, h);
    var data = img.data;

    // `angle - 90` so that 90deg means "along = x", as in the CSS fallback.
    var th = ((ANGLE - 90) * Math.PI) / 180;
    var ca = Math.cos(th);
    var sa = Math.sin(th);
    var cx = CENTER_X / 100;
    var cy = CENTER_Y / 100;

    // Aspect-correct the wave amplitude.
    //
    // The preset's `(wave / 100) * 0.35` is a displacement in normalised
    // *along* units, while the sine's period is in normalised *cross* units.
    // Those are the same physical length only on a square canvas. On this
    // band — roughly 1900x150 — the period is 62px tall while the swing is 80px
    // wide, so every colour boundary becomes a near-horizontal streak and the
    // field reads as one giant chevron rather than as ripples.
    //
    // Measuring the swing in cross units instead (multiply by H/W) keeps the
    // wave's own proportions fixed no matter how the band is shaped, and
    // reduces to the preset exactly when H == W.
    var amp = ((WAVE / 100) * 0.35 * h) / w;

    var p = 0;
    for (var y = 0; y < h; y++) {
      var v = (y + 0.5) / h - cy;
      for (var x = 0; x < w; x++) {
        var u = (x + 0.5) / w - cx;
        var along = u * ca + v * sa;
        var cross = -u * sa + v * ca;

        // The preset's bend, verbatim.
        along += amp * Math.sin(cross * 2.4 * TAU + clock);

        var t = clamp(along + 0.5, 0, 1);
        var o = ((t * (LUT_N - 1)) | 0) * 3;
        data[p++] = lut[o];
        data[p++] = lut[o + 1];
        data[p++] = lut[o + 2];
        data[p++] = 255;
      }
    }
    sctx.putImageData(img, 0, 0);

    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, W, H);

    // Oversize by more than the blur radius so the kernel never samples past
    // the layer's edge. Canvas `filter` is unsupported on older WebKit, where
    // this degrades to the plain upscale rather than failing.
    var pad = SOFTEN * 4;
    if ("filter" in ctx) ctx.filter = "blur(" + SOFTEN + "px)";
    ctx.drawImage(scratch, -pad, -pad, W + pad * 2, H + pad * 2);
    if ("filter" in ctx) ctx.filter = "none";
  }

  function init() {
    var canvases = document.querySelectorAll("[data-ocean-ripple]");
    if (!canvases.length) return;

    var reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var animated = false;
    Array.prototype.forEach.call(canvases, function (c) {
      c.parentNode.style.backgroundColor = BACKDROP;
      if (c.getAttribute("data-animated") === "true") animated = true;
    });
    animated = animated && !reduced;

    var clock = 0;

    function repaint() {
      Array.prototype.forEach.call(canvases, function (c) {
        paint(c, clock);
      });
    }

    repaint();

    // Resize is debounced with rAF: the per-pixel loop is cheap but not free,
    // and a drag-resize fires this far faster than it can matter.
    var pending = false;
    window.addEventListener(
      "resize",
      function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          pending = false;
          repaint();
        });
      },
      { passive: true }
    );

    if (animated) {
      var last = null;
      (function frame(now) {
        if (last !== null) clock += ((now - last) / 1000) * (SPEED / 100);
        last = now;
        repaint();
        requestAnimationFrame(frame);
      })(performance.now());
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
