// Test: node --test glass-calc.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseComposizione, pesoKg, pesoKgM2, areaFatturabile, metriLineari } from './glass-calc.mjs';

test('monolitico semplice e temperato', () => {
  const c = parseComposizione('4');
  assert.equal(c.tipo, 'monolitico');
  assert.equal(c.spessoreNominaleMm, 4);
  const t = parseComposizione('6 temp.');
  assert.equal(t.vetri[0].spessoreVetroMm, 6);
  assert.equal(t.vetri[0].suffisso, 'TEMP');
});

test('stratificati compatti', () => {
  const c = parseComposizione('33.1');
  assert.equal(c.tipo, 'stratificato');
  assert.deepEqual(c.vetri[0].lastreMm, [3, 3]);
  assert.equal(c.pvbTotaleMm, 0.38);
  assert.equal(c.spessoreNominaleMm, 6.38);
  assert.deepEqual(parseComposizione('44.2').vetri[0].lastreMm, [4, 4]);
  assert.equal(parseComposizione('44.2').pvbTotaleMm, 0.76);
  assert.deepEqual(parseComposizione('1010.2').vetri[0].lastreMm, [10, 10]);
  assert.deepEqual(parseComposizione('64.2').vetri[0].lastreMm, [6, 4]);
});

test('stratificati asimmetrici e espliciti', () => {
  const a = parseComposizione('106.2');
  assert.deepEqual(a.vetri[0].lastreMm, [10, 6]);
  assert.ok(a.avvisi.length > 0);
  assert.deepEqual(parseComposizione('610.2').vetri[0].lastreMm, [6, 10]);
  assert.deepEqual(parseComposizione('10+6.2').vetri[0].lastreMm, [10, 6]);
  assert.deepEqual(parseComposizione('4+4+4.2').vetri[0].lastreMm, [4, 4, 4]);
  assert.equal(parseComposizione('44.2A').vetri[0].suffisso, 'A');
});

test('vetrocamere', () => {
  for (const s of ['4/16/4', '4-16-4', '4 - 16 - 4', '4+16+4']) {
    const c = parseComposizione(s);
    assert.equal(c.tipo, 'vetrocamera doppia', s);
    assert.equal(c.spessoreNominaleMm, 24, s);
    assert.equal(c.intercapedini[0].gas, 'aria', s);
  }
  const c = parseComposizione('33.1/16Ar/4BE');
  assert.equal(c.intercapedini[0].gas, 'argon');
  assert.equal(c.vetri[1].suffisso, 'BE');
  assert.equal(c.spessoreNominaleMm, 26.38);
  const t = parseComposizione('4/12Kr/4/12Kr/4');
  assert.equal(t.tipo, 'vetrocamera tripla');
  assert.equal(t.intercapedini[1].gas, 'kripton');
  assert.equal(parseComposizione('4/16 Ar/4').intercapedini[0].gas, 'argon');
});

test('composizioni non valide', () => {
  assert.throws(() => parseComposizione(''));
  assert.throws(() => parseComposizione('4/16'));
  assert.throws(() => parseComposizione('abc'));
});

test('peso', () => {
  assert.equal(pesoKg('4/16/4', 1000, 1200), 24);
  assert.equal(pesoKg('10', 2000, 1000), 50);
  assert.equal(pesoKg('33.1', 1000, 1000), 15.41);
  assert.equal(pesoKgM2('4'), 10);
  assert.equal(pesoKg('4', 1000, 1000, 3), 30);
});

test('area fatturabile con passo e minimo', () => {
  const a = areaFatturabile(1000, 1210, { passoMm: 40, minimoM2: 0.4 });
  assert.equal(a.baseArrotondataMm, 1000);
  assert.equal(a.altezzaArrotondataMm, 1240);
  assert.equal(a.areaUnitariaM2, 1.24);
  assert.equal(a.minimoApplicato, false);

  const p = areaFatturabile(300, 400, { passoMm: 40, minimoM2: 0.4 });
  assert.equal(p.baseArrotondataMm, 320);
  assert.equal(p.areaPezzoM2, 0.13);
  assert.equal(p.areaUnitariaM2, 0.4);
  assert.equal(p.minimoApplicato, true);

  const q = areaFatturabile(1000, 1210, { passoMm: 40, minimoM2: 0.4, quantita: 3 });
  assert.equal(q.areaTotaleM2, 3.72);

  // il minimo si applica al pezzo, non alla riga
  const r = areaFatturabile(300, 400, { passoMm: 40, minimoM2: 0.4, quantita: 5 });
  assert.equal(r.areaTotaleM2, 2);
});

test('area: nessun passo, arrotondamento per eccesso, virgola mobile', () => {
  assert.equal(areaFatturabile(1005, 1000).areaPezzoM2, 1.01); // 1.005 -> 1.01, non 1.00
  assert.equal(areaFatturabile(1001, 1000, { arrotondamentoArea: 'eccesso' }).areaPezzoM2, 1.01);
  assert.equal(areaFatturabile(1000, 1000, { arrotondamentoArea: 'eccesso' }).areaPezzoM2, 1);
  assert.equal(areaFatturabile(999.4, 1000).baseArrotondataMm, 1000);
  assert.throws(() => areaFatturabile(0, 100));
  assert.throws(() => areaFatturabile(100, 100, { quantita: 0 }));
});

test('metri lineari', () => {
  assert.equal(metriLineari(1000, 500), 3);
  assert.equal(metriLineari(1000, 500, { latiBase: 2, latiAltezza: 0 }), 2);
  assert.equal(metriLineari(1000, 500, { latiBase: 1, latiAltezza: 1, quantita: 2 }), 3);
});
