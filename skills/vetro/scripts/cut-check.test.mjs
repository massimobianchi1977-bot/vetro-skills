// Test: node --test cut-check.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { verificaSchema } from './cut-check.mjs';

const lastra = { base: 1000, altezza: 1000 };

test('due pezzi affiancati: un solo livello', () => {
  const r = verificaSchema({
    lastra,
    pezzi: [
      { id: 'A', x: 0, y: 0, base: 500, altezza: 1000 },
      { id: 'B', x: 500, y: 0, base: 500, altezza: 1000 },
    ],
  });
  assert.equal(r.valido, true);
  assert.equal(r.ghigliottina, true);
  assert.equal(r.livelli, 1);
  assert.equal(r.primoTaglio, 'verticale');
  assert.equal(r.resaPct, 100);
});

test('pezzi con sfrido: due livelli e resa', () => {
  const r = verificaSchema({
    lastra,
    pezzi: [
      { id: 'A', x: 0, y: 0, base: 600, altezza: 400 },
      { id: 'B', x: 0, y: 400, base: 600, altezza: 600 },
    ],
  });
  assert.equal(r.valido, true);
  assert.equal(r.livelli, 2);
  assert.equal(r.resaPct, 60);
});

test('schema a tre livelli', () => {
  // striscia verticale 0-600; dentro, fascia orizzontale 0-400 divisa in due pezzi da 300
  const r = verificaSchema({
    lastra,
    pezzi: [
      { id: 'A', x: 0, y: 0, base: 300, altezza: 400 },
      { id: 'B', x: 300, y: 0, base: 300, altezza: 400 },
      { id: 'C', x: 0, y: 400, base: 600, altezza: 600 },
      { id: 'D', x: 600, y: 0, base: 400, altezza: 1000 },
    ],
  });
  assert.equal(r.valido, true);
  assert.equal(r.livelli, 3);
});

test('girandola: non eseguibile a ghigliottina', () => {
  const r = verificaSchema({
    lastra: { base: 300, altezza: 300 },
    pezzi: [
      { id: 'A', x: 0, y: 0, base: 200, altezza: 100 },
      { id: 'B', x: 200, y: 0, base: 100, altezza: 200 },
      { id: 'C', x: 100, y: 200, base: 200, altezza: 100 },
      { id: 'D', x: 0, y: 100, base: 100, altezza: 200 },
      { id: 'E', x: 100, y: 100, base: 100, altezza: 100 },
    ],
  });
  assert.equal(r.valido, false);
  assert.equal(r.ghigliottina, false);
  assert.equal(r.resaPct, 100);
});

test('massimo livelli del banco', () => {
  const schema = {
    lastra,
    pezzi: [
      { id: 'A', x: 0, y: 0, base: 300, altezza: 400 },
      { id: 'B', x: 300, y: 0, base: 300, altezza: 400 },
      { id: 'C', x: 0, y: 400, base: 600, altezza: 600 },
      { id: 'D', x: 600, y: 0, base: 400, altezza: 1000 },
    ],
  };
  assert.equal(verificaSchema(schema, { maxLivelli: 3 }).valido, true);
  const r = verificaSchema(schema, { maxLivelli: 2 });
  assert.equal(r.valido, false);
  assert.match(r.errori[0], /livelli/);
});

test('rifili, sovrapposizioni e difetti', () => {
  const fuori = verificaSchema({
    lastra,
    rifili: { sx: 10, dx: 10, inf: 10, sup: 10 },
    pezzi: [{ id: 'A', x: 0, y: 10, base: 500, altezza: 500 }],
  });
  assert.equal(fuori.valido, false);
  assert.match(fuori.errori[0], /area utile/);

  const sovrapposti = verificaSchema({
    lastra,
    pezzi: [
      { id: 'A', x: 0, y: 0, base: 500, altezza: 500 },
      { id: 'B', x: 400, y: 0, base: 500, altezza: 500 },
    ],
  });
  assert.equal(sovrapposti.valido, false);
  assert.match(sovrapposti.errori[0], /sovrappongono/);

  const difetto = verificaSchema({
    lastra,
    difetti: [{ x: 100, y: 100, base: 50, altezza: 50 }],
    pezzi: [{ id: 'A', x: 0, y: 0, base: 500, altezza: 500 }],
  });
  assert.equal(difetto.valido, false);
  assert.match(difetto.errori[0], /difettosa/);
});

test('schema con rifili corretto', () => {
  const r = verificaSchema({
    lastra: { base: 3210, altezza: 2250 },
    rifili: { sx: 10, dx: 10, inf: 10, sup: 10 },
    pezzi: [
      { id: 'A', x: 10, y: 10, base: 1000, altezza: 800 },
      { id: 'B', x: 10, y: 810, base: 1000, altezza: 800 },
      { id: 'C', x: 1010, y: 10, base: 1500, altezza: 2230 },
    ],
  });
  assert.equal(r.valido, true);
  assert.equal(r.ghigliottina, true);
});

test('input non validi', () => {
  assert.equal(verificaSchema({}).valido, false);
  assert.equal(verificaSchema({ lastra, pezzi: [] }).valido, false);
  assert.equal(verificaSchema({ lastra, pezzi: [{ x: 0, y: 0, base: -5, altezza: 10 }] }).valido, false);
});
