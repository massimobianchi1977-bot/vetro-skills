#!/usr/bin/env node
// cut-check.mjs — verifica di uno schema di taglio del vetro piano.
// Nessuna dipendenza, Node 18+. Licenza MIT.
//
// Controlla: pezzi dentro la lastra (al netto dei rifili), sovrapposizioni, zone difettose,
// eseguibilità a ghigliottina, numero di livelli di taglio, resa.
//
// Coordinate in mm, origine nell'angolo in basso a sinistra della lastra, x lungo la base.
//
// Uso da riga di comando:  node cut-check.mjs schema.json
// Uso come modulo:         import { verificaSchema } from './cut-check.mjs';
//
// Formato dello schema:
// {
//   "lastra": { "base": 3210, "altezza": 2250 },
//   "rifili": { "sx": 10, "dx": 10, "inf": 10, "sup": 10 },      // opzionale
//   "difetti": [ { "x": 0, "y": 0, "base": 100, "altezza": 100 } ], // opzionale
//   "pezzi": [ { "id": "A1", "x": 10, "y": 10, "base": 1000, "altezza": 800 } ]
// }

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const EPS = 1e-6;

/**
 * @param {object} schema
 * @param {object} [opz]
 * @param {number} [opz.maxLivelli]  numero massimo di livelli ammessi dal banco
 * @returns {{valido:boolean, errori:string[], avvisi:string[], ghigliottina:boolean|null,
 *            livelli:number|null, primoTaglio:'verticale'|'orizzontale'|null, resaPct:number}}
 */
export function verificaSchema(schema, opz = {}) {
  const errori = [];
  const avvisi = [];
  const { lastra, pezzi = [], difetti = [] } = schema || {};
  const rif = { sx: 0, dx: 0, inf: 0, sup: 0, ...(schema?.rifili || {}) };

  if (!lastra || !(lastra.base > 0) || !(lastra.altezza > 0)) {
    return esito(false, ['Lastra mancante o con misure non valide'], avvisi, null, null, null, 0);
  }
  if (!Array.isArray(pezzi) || pezzi.length === 0) {
    return esito(false, ['Nessun pezzo nello schema'], avvisi, null, null, null, 0);
  }

  const rett = pezzi.map((p, i) => ({
    id: p.id ?? `#${i + 1}`,
    x0: Number(p.x),
    y0: Number(p.y),
    x1: Number(p.x) + Number(p.base),
    y1: Number(p.y) + Number(p.altezza),
  }));

  // misure e posizione
  const utile = { x0: rif.sx, y0: rif.inf, x1: lastra.base - rif.dx, y1: lastra.altezza - rif.sup };
  for (const [i, r] of rett.entries()) {
    const p = pezzi[i];
    if (![p.x, p.y, p.base, p.altezza].every((v) => Number.isFinite(Number(v)))) {
      errori.push(`Pezzo ${r.id}: coordinate o misure non numeriche`);
      continue;
    }
    if (!(p.base > 0) || !(p.altezza > 0)) errori.push(`Pezzo ${r.id}: misure non positive`);
    if (r.x0 < utile.x0 - EPS || r.y0 < utile.y0 - EPS || r.x1 > utile.x1 + EPS || r.y1 > utile.y1 + EPS) {
      errori.push(`Pezzo ${r.id}: fuori dall'area utile della lastra (rifili compresi)`);
    }
  }

  // sovrapposizioni tra pezzi e con i difetti
  for (let i = 0; i < rett.length; i++) {
    for (let j = i + 1; j < rett.length; j++) {
      if (siSovrappongono(rett[i], rett[j])) errori.push(`Pezzi ${rett[i].id} e ${rett[j].id} si sovrappongono`);
    }
    for (const [k, d] of difetti.entries()) {
      const rd = { x0: d.x, y0: d.y, x1: d.x + d.base, y1: d.y + d.altezza };
      if (siSovrappongono(rett[i], rd)) errori.push(`Pezzo ${rett[i].id} su una zona difettosa (#${k + 1})`);
    }
  }

  const areaPezzi = rett.reduce((a, r) => a + (r.x1 - r.x0) * (r.y1 - r.y0), 0);
  const resaPct = Math.round((areaPezzi / (lastra.base * lastra.altezza)) * 10000) / 100;

  if (errori.length) return esito(false, errori, avvisi, null, null, null, resaPct);

  // ghigliottina e livelli: si prova a partire da entrambe le direzioni e si tiene la migliore
  const regione = { x0: 0, y0: 0, x1: lastra.base, y1: lastra.altezza };
  const daVerticale = livelli(regione, rett, 'V');
  const daOrizzontale = livelli(regione, rett, 'H');
  const migliore = Math.min(daVerticale, daOrizzontale);
  if (!Number.isFinite(migliore)) {
    errori.push('Lo schema non è eseguibile a ghigliottina: esiste un gruppo di pezzi che nessun taglio passante separa');
    return esito(false, errori, avvisi, false, null, null, resaPct);
  }
  const primoTaglio = daVerticale <= daOrizzontale ? 'verticale' : 'orizzontale';
  if (opz.maxLivelli && migliore > opz.maxLivelli) {
    errori.push(`Servono ${migliore} livelli di taglio, il banco ne ammette ${opz.maxLivelli}`);
  }
  if (resaPct < 50) avvisi.push(`Resa bassa (${resaPct}%): controllare se conviene un'altra lastra o una rimanenza`);
  return esito(errori.length === 0, errori, avvisi, true, migliore, primoTaglio, resaPct);
}

function esito(valido, errori, avvisi, ghigliottina, livelliN, primoTaglio, resaPct) {
  return { valido, errori, avvisi, ghigliottina, livelli: livelliN, primoTaglio, resaPct };
}

function siSovrappongono(a, b) {
  return a.x0 < b.x1 - EPS && b.x0 < a.x1 - EPS && a.y0 < b.y1 - EPS && b.y0 < a.y1 - EPS;
}

// Numero minimo di livelli per separare tutti i pezzi della regione partendo dalla direzione dir.
// 'V' = tagli verticali (x costante), 'H' = tagli orizzontali (y costante). Infinity = non a ghigliottina.
function livelli(reg, ps, dir) {
  if (ps.length === 0) return 0;
  if (ps.length === 1 && coincide(ps[0], reg)) return 0;
  const tagli = posizioniDiTaglio(reg, ps, dir);
  const altra = dir === 'V' ? 'H' : 'V';
  if (tagli.length === 0) {
    // nessun taglio in questa direzione: si passa all'altra senza consumare un livello
    if (posizioniDiTaglio(reg, ps, altra).length === 0) return Infinity;
    return livelli(reg, ps, altra);
  }
  const bordi = dir === 'V' ? [reg.x0, ...tagli, reg.x1] : [reg.y0, ...tagli, reg.y1];
  let peggiore = 0;
  for (let i = 0; i < bordi.length - 1; i++) {
    const a = bordi[i];
    const b = bordi[i + 1];
    const sotto = dir === 'V' ? { ...reg, x0: a, x1: b } : { ...reg, y0: a, y1: b };
    const dentro = ps.filter((p) =>
      dir === 'V' ? p.x0 >= a - EPS && p.x1 <= b + EPS : p.y0 >= a - EPS && p.y1 <= b + EPS,
    );
    peggiore = Math.max(peggiore, livelli(sotto, dentro, altra));
    if (!Number.isFinite(peggiore)) return Infinity;
  }
  return 1 + peggiore;
}

function posizioniDiTaglio(reg, ps, dir) {
  const [lo, hi] = dir === 'V' ? [reg.x0, reg.x1] : [reg.y0, reg.y1];
  const candidati = new Set();
  for (const p of ps) {
    for (const c of dir === 'V' ? [p.x0, p.x1] : [p.y0, p.y1]) {
      if (c > lo + EPS && c < hi - EPS) candidati.add(c);
    }
  }
  return [...candidati]
    .filter((c) => ps.every((p) => (dir === 'V' ? !(p.x0 < c - EPS && p.x1 > c + EPS) : !(p.y0 < c - EPS && p.y1 > c + EPS))))
    .sort((a, b) => a - b);
}

function coincide(p, reg) {
  return (
    Math.abs(p.x0 - reg.x0) < EPS && Math.abs(p.x1 - reg.x1) < EPS && Math.abs(p.y0 - reg.y0) < EPS && Math.abs(p.y1 - reg.y1) < EPS
  );
}

// ---- CLI ----
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) {
    console.log('Uso: node cut-check.mjs schema.json [--max-livelli 4]');
    process.exit(1);
  }
  try {
    const schema = JSON.parse(readFileSync(file, 'utf8'));
    const i = process.argv.indexOf('--max-livelli');
    const maxLivelli = i > 0 ? Number(process.argv[i + 1]) : undefined;
    const r = verificaSchema(schema, { maxLivelli });
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.valido ? 0 : 2);
  } catch (e) {
    console.error('Errore:', e.message);
    process.exit(1);
  }
}
