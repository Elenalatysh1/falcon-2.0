/**
 * QR Model 2 encoder, byte mode, error correction H (or L if the payload needs it).
 * Used only to produce the module matrix; drawing is in qr.js.
 */
(function () {
  const EXP = new Uint8Array(256);
  const LOG = new Uint8Array(256);
  let value = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = value;
    LOG[value] = i;
    value = value << 1;
    if (value > 255) value ^= 0x11d;
  }
  EXP[255] = EXP[0];

  function mul(a, b) {
    if (!a || !b) return 0;
    return EXP[(LOG[a] + LOG[b]) % 255];
  }

  function rs(data, ecc) {
    const gen = [1];
    for (let i = 0; i < ecc; i += 1) {
      const next = new Array(gen.length + 1).fill(0);
      const a = EXP[i];
      for (let j = 0; j < gen.length; j += 1) {
        next[j] ^= gen[j];
        next[j + 1] ^= mul(gen[j], a);
      }
      gen.length = 0;
      gen.push(...next);
    }
    const rec = new Uint8Array(data.length + ecc);
    rec.set(data);
    for (let i = 0; i < data.length; i += 1) {
      const factor = rec[i];
      if (!factor) continue;
      for (let j = 0; j < gen.length; j += 1) rec[i + j] ^= mul(gen[j], factor);
    }
    return rec.slice(data.length);
  }

  /* data codewords, ecc per block, [group1 blocks, group1 data, group2 blocks, group2 data] for H then L */
  const H = {
    1: [9, 17, 1, 9, 0, 0],
    2: [16, 28, 1, 16, 0, 0],
    3: [26, 22, 2, 13, 0, 0],
    4: [36, 16, 4, 9, 0, 0],
    5: [46, 22, 2, 11, 2, 12],
    6: [60, 28, 4, 15, 0, 0],
    7: [66, 26, 4, 13, 1, 14],
    8: [86, 26, 4, 14, 2, 15],
    9: [100, 24, 4, 12, 4, 13],
    10: [122, 28, 6, 15, 2, 16],
  };
  const L = {
    1: [19, 7, 1, 19, 0, 0],
    2: [34, 10, 1, 34, 0, 0],
    3: [55, 15, 1, 55, 0, 0],
    4: [80, 20, 1, 80, 0, 0],
    5: [108, 26, 1, 108, 0, 0],
    6: [136, 18, 2, 68, 0, 0],
    7: [156, 20, 2, 78, 0, 0],
    8: [194, 24, 2, 97, 0, 0],
    9: [232, 30, 2, 116, 0, 0],
    10: [274, 18, 2, 68, 2, 69],
  };

  const ALIGN = {
    1: [],
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
    6: [6, 34],
    7: [6, 22, 38],
    8: [6, 24, 42],
    9: [6, 26, 46],
    10: [6, 28, 50],
  };

  function versionFor(bytes, table) {
    for (let version = 1; version <= 10; version += 1) {
      const cap = table[version][0];
      const need = 2 + bytes + 1;
      if (need <= cap) return version;
    }
    return 0;
  }

  function bits(text) {
    const bytes = new TextEncoder().encode(text);
    const out = [];
    function push(value, length) {
      for (let i = length - 1; i >= 0; i -= 1) out.push((value >> i) & 1);
    }
    push(0b0100, 4);
    push(bytes.length, 8);
    bytes.forEach((byte) => push(byte, 8));
    push(0, Math.min(4, 8 - (out.length % 8 || 8)));
    while (out.length % 8) out.push(0);
    return { bits: out, bytes: bytes.length };
  }

  function codewords(bitList, capacity) {
    const words = [];
    for (let i = 0; i < bitList.length; i += 8) {
      let word = 0;
      for (let j = 0; j < 8; j += 1) word = (word << 1) | (bitList[i + j] || 0);
      words.push(word);
    }
    const pad = [0xec, 0x11];
    let n = 0;
    while (words.length < capacity) words.push(pad[n++ % 2]);
    return Uint8Array.from(words.slice(0, capacity));
  }

  function interleave(data, spec) {
    const [, ecc, g1, d1, g2, d2] = spec;
    const blocks = [];
    let offset = 0;
    for (let i = 0; i < g1; i += 1) {
      const slice = data.slice(offset, offset + d1);
      offset += d1;
      blocks.push({ data: slice, ecc: rs(slice, ecc) });
    }
    for (let i = 0; i < g2; i += 1) {
      const slice = data.slice(offset, offset + d2);
      offset += d2;
      blocks.push({ data: slice, ecc: rs(slice, ecc) });
    }
    const out = [];
    const maxData = Math.max(d1, d2);
    for (let i = 0; i < maxData; i += 1) {
      blocks.forEach((block) => { if (i < block.data.length) out.push(block.data[i]); });
    }
    for (let i = 0; i < ecc; i += 1) blocks.forEach((block) => out.push(block.ecc[i]));
    return Uint8Array.from(out);
  }

  function sizeOf(version) {
    return 21 + (version - 1) * 4;
  }

  function reserved(version) {
    const n = sizeOf(version);
    const grid = Array.from({ length: n }, () => Array(n).fill(0));
    function box(x, y, w, h) {
      for (let r = y; r < y + h; r += 1) for (let c = x; c < x + w; c += 1) if (grid[r] && grid[r][c] !== undefined) grid[r][c] = 1;
    }
    box(0, 0, 9, 9);
    box(n - 8, 0, 8, 9);
    box(0, n - 8, 9, 8);
    for (let i = 8; i < n - 8; i += 1) {
      grid[6][i] = 1;
      grid[i][6] = 1;
    }
    const pos = ALIGN[version];
    pos.forEach((r) => pos.forEach((c) => {
      if ((r < 9 && c < 9) || (r < 9 && c > n - 10) || (r > n - 10 && c < 9)) return;
      box(c - 2, r - 2, 5, 5);
    }));
    if (version >= 7) {
      box(0, n - 11, 6, 3);
      box(n - 11, 0, 3, 6);
    }
    return grid;
  }

  function place(version, words) {
    const n = sizeOf(version);
    const grid = Array.from({ length: n }, () => Array(n).fill(null));
    const lock = reserved(version);
    let bit = 0;
    const bitsOf = [];
    words.forEach((word) => {
      for (let i = 7; i >= 0; i -= 1) bitsOf.push((word >> i) & 1);
    });
    let up = true;
    for (let col = n - 1; col > 0; col -= 2) {
      if (col === 6) col -= 1;
      for (let i = 0; i < n; i += 1) {
        const row = up ? n - 1 - i : i;
        for (let k = 0; k < 2; k += 1) {
          const c = col - k;
          if (lock[row][c]) continue;
          grid[row][c] = bitsOf[bit] || 0;
          bit += 1;
        }
      }
      up = !up;
    }
    return { grid, lock };
  }

  function maskFn(id) {
    return [
      (r, c) => (r + c) % 2 === 0,
      (r, c) => r % 2 === 0,
      (r, c) => c % 3 === 0,
      (r, c) => (r + c) % 3 === 0,
      (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
      (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
      (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
      (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
    ][id];
  }

  function applyMask(grid, lock, id) {
    const n = grid.length;
    const next = grid.map((row) => row.slice());
    const test = maskFn(id);
    for (let r = 0; r < n; r += 1) {
      for (let c = 0; c < n; c += 1) {
        if (!lock[r][c] && next[r][c] != null && test(r, c)) next[r][c] ^= 1;
      }
    }
    return next;
  }

  function score(grid) {
    const n = grid.length;
    let total = 0;
    const dark = (r, c) => grid[r] && grid[r][c] === 1;
    function run(get) {
      let last = -1;
      let count = 0;
      for (let i = 0; i < n; i += 1) {
        const bit = get(i);
        if (bit === last) count += 1;
        else {
          if (count >= 5) total += 3 + (count - 5);
          last = bit;
          count = 1;
        }
      }
      if (count >= 5) total += 3 + (count - 5);
    }
    for (let r = 0; r < n; r += 1) run((c) => (dark(r, c) ? 1 : 0));
    for (let c = 0; c < n; c += 1) run((r) => (dark(r, c) ? 1 : 0));
    for (let r = 0; r < n - 1; r += 1) {
      for (let c = 0; c < n - 1; c += 1) {
        const a = dark(r, c);
        if (a === dark(r, c + 1) && a === dark(r + 1, c) && a === dark(r + 1, c + 1)) total += 3;
      }
    }
    let blacks = 0;
    grid.forEach((row) => row.forEach((cell) => { if (cell === 1) blacks += 1; }));
    total += Math.floor(Math.abs((blacks * 100) / (n * n) - 50) / 5) * 10;
    return total;
  }

  function formatBits(ecc, mask) {
    const eccBits = ecc === "H" ? 0b10 : 0b01;
    const data = (eccBits << 3) | mask;
    let bits = data << 10;
    const poly = 0b10100110111;
    for (let i = 14; i >= 10; i -= 1) {
      if ((bits >> i) & 1) bits ^= poly << (i - 10);
    }
    return (data << 10 | bits) ^ 0b101010000010010;
  }

  function versionBits(version) {
    let bits = version << 12;
    const poly = 0b1111100100101;
    for (let i = 17; i >= 12; i -= 1) {
      if ((bits >> i) & 1) bits ^= poly << (i - 12);
    }
    return bits;
  }

  function paintFinders(grid) {
    const n = grid.length;
    function finder(x, y) {
      for (let r = -1; r < 8; r += 1) {
        for (let c = -1; c < 8; c += 1) {
          const rr = y + r;
          const cc = x + c;
          if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
          const on = r === -1 || c === -1 || r === 7 || c === 7 ? 0 : r === 0 || c === 0 || r === 6 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          grid[rr][cc] = on ? 1 : 0;
        }
      }
    }
    finder(0, 0);
    finder(n - 7, 0);
    finder(0, n - 7);
    for (let i = 8; i < n - 8; i += 1) {
      grid[6][i] = i % 2 === 0 ? 1 : 0;
      grid[i][6] = i % 2 === 0 ? 1 : 0;
    }
    grid[n - 8][8] = 1;
  }

  function paintAlign(grid, version) {
    const n = grid.length;
    const pos = ALIGN[version];
    pos.forEach((r) => pos.forEach((c) => {
      if ((r < 9 && c < 9) || (r < 9 && c > n - 10) || (r > n - 10 && c < 9)) return;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          const on = Math.max(Math.abs(dx), Math.abs(dy)) !== 1;
          grid[r + dy][c + dx] = on ? 1 : 0;
        }
      }
    }));
  }

  function paintFormat(grid, bits) {
    const n = grid.length;
    for (let i = 0; i < 6; i += 1) grid[8][i] = (bits >> i) & 1;
    grid[8][7] = (bits >> 6) & 1;
    grid[8][8] = (bits >> 7) & 1;
    grid[7][8] = (bits >> 8) & 1;
    for (let i = 9; i < 15; i += 1) grid[14 - i][8] = (bits >> i) & 1;
    for (let i = 0; i < 8; i += 1) grid[n - 1 - i][8] = (bits >> i) & 1;
    for (let i = 8; i < 15; i += 1) grid[8][n - 15 + i] = (bits >> i) & 1;
  }

  function paintVersion(grid, version) {
    if (version < 7) return;
    const bits = versionBits(version);
    const n = grid.length;
    for (let i = 0; i < 18; i += 1) {
      const bit = (bits >> i) & 1;
      const r = Math.floor(i / 3);
      const c = i % 3;
      grid[r][n - 11 + c] = bit;
      grid[n - 11 + c][r] = bit;
    }
  }

  function encodeQr(text, ecc) {
    const payload = bits(text);
    let level = ecc === "L" ? "L" : "H";
    let table = level === "H" ? H : L;
    let version = versionFor(payload.bytes, table);
    if (!version && level === "H") {
      level = "L";
      table = L;
      version = versionFor(payload.bytes, table);
    }
    if (!version) throw new Error("QR payload is too long");
    const spec = table[version];
    const words = interleave(codewords(payload.bits, spec[0]), spec);
    const { grid, lock } = place(version, words);
    let best = null;
    let bestScore = Infinity;
    let bestMask = 0;
    for (let mask = 0; mask < 8; mask += 1) {
      const masked = applyMask(grid, lock, mask);
      paintFinders(masked);
      paintAlign(masked, version);
      paintFormat(masked, formatBits(level, mask));
      paintVersion(masked, version);
      const penalty = score(masked);
      if (penalty < bestScore) {
        bestScore = penalty;
        best = masked;
        bestMask = mask;
      }
    }
    return { modules: best, version, mask: bestMask, level, size: best.length };
  }

  window.encodeQr = encodeQr;
})();
