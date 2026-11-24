#!/usr/bin/env node
// glass-calc.mjs — calcoli di base per il vetro piano.
// Nessuna dipendenza, Node 18+. Licenza MIT.
//
// Uso da riga di comando:
//   node glass-calc.mjs "33.1/16Ar/4BE" 1000 1200 --passo 40 --minimo 0.5 --qta 2
//
// Uso come modulo:
//   import { parseComposizione, pesoKg, areaFatturabile, metriLineari } from './glass-calc.mjs';

import { pathToFileURL } from 'node:url';

export const KG_M2_PER_MM_VETRO = 2.5; // densità ~2500 kg/m³
export const KG_M2_PER_MM_PVB = 1.07; // densità PVB ~1070 kg/m³
export const PVB_FOGLIO_MM = 0.38;

const SPESSORI_A_DUE_CIFRE = new Set([10, 12, 15, 19, 25]);

function normalizza(s) {
  return String(s)
    .trim()
    .toUpperCase()
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ')
    .replace(/(\d)\s+(?=[A-Z])/g, '$1'); // "6 TEMP." -> "6TEMP.", "16 AR" -> "16AR"
}

// Divide le cifre di uno stratificato senza "+": "33" -> [3,3], "1010" -> [10,10], "106" -> [10,6]
function dividiCifreStratificato(cifre, avvisi) {
  if (cifre.length === 2) return [Number(cifre[0]), Number(cifre[1])];
  if (cifre.length === 4) return [Number(cifre.slice(0, 2)), Number(cifre.slice(2))];
  if (cifre.length === 3) {
    const primeDue = Number(cifre.slice(0, 2));
    const ultimeDue = Number(cifre.slice(1));
    if (SPESSORI_A_DUE_CIFRE.has(primeDue)) {
      avvisi.push(`"${cifre}" interpretato come ${primeDue}+${cifre[2]}: meglio scrivere la forma esplicita con "+"`);
      return [primeDue, Number(cifre[2])];
    }
    if (SPESSORI_A_DUE_CIFRE.has(ultimeDue)) {
      avvisi.push(`"${cifre}" interpretato come ${cifre[0]}+${ultimeDue}: meglio scrivere la forma esplicita con "+"`);
      return [Number(cifre[0]), ultimeDue];
    }
    avvisi.push(`"${cifre}" interpretato come tre lastre ${cifre.split('').join('+')}: verificare`);
    return cifre.split('').map(Number);
  }
  throw new Error(`Stratificato non interpretabile: "${cifre}"`);
}

function parseVetro(token, avvisi) {
  // Stratificato esplicito: 10+6.2, 4+4+4.2, 6+6.2A
  let m = token.match(/^(\d+(?:\+\d+)+)\.(\d+)([A-Z]*)$/);
  if (m) {
    const lastre = m[1].split('+').map(Number);
    return creaStratificato(token, lastre, Number(m[2]), m[3]);
  }
  // Stratificato compatto: 33.1, 44.2, 1010.2, 44.2A, 33.1BE
  m = token.match(/^(\d{2,4})\.(\d)([A-Z]*)$/);
  if (m) {
    const lastre = dividiCifreStratificato(m[1], avvisi);
    return creaStratificato(token, lastre, Number(m[2]), m[3]);
  }
  // Monolitico: 4, 6T, 10TEMP, 4BE, 5.5
  m = token.match(/^(\d+(?:\.\d+)?)([A-Z.]*)$/);
  if (m) {
    const spessore = Number(m[1]);
    return {
      tipo: 'monolitico',
      token,
      lastreMm: [spessore],
      spessoreVetroMm: spessore,
      pvbFogli: 0,
      pvbMm: 0,
      suffisso: m[2].replace(/\./g, ''),
    };
  }
  throw new Error(`Vetro non interpretabile: "${token}"`);
}

function creaStratificato(token, lastre, fogli, suffisso) {
  const spessoreVetro = lastre.reduce((a, b) => a + b, 0);
  return {
    tipo: 'stratificato',
    token,
    lastreMm: lastre,
    spessoreVetroMm: spessoreVetro,
    pvbFogli: fogli,
    pvbMm: arrotonda(fogli * PVB_FOGLIO_MM, 2),
    suffisso,
  };
}

function parseIntercapedine(token) {
  const m = token.match(/^(\d+(?:\.\d+)?)(AR|KR|ARIA|ARGON|KRIPTON|KRYPTON)?$/);
  if (!m) throw new Error(`Intercapedine non interpretabile: "${token}"`);
  const g = m[2] || 'ARIA';
  const gas = g.startsWith('AR') && g !== 'ARIA' ? 'argon' : g.startsWith('K') ? 'kripton' : 'aria';
  return { token, mm: Number(m[1]), gas };
}

function tokenizza(s, avvisi) {
  const parti = s.split(/\s*[\/\-]\s*|\s+/).filter(Boolean);
  if (parti.length > 1) return parti;
  // Un solo token: può essere "4+16+4" (vetrocamera scritta con +) o uno stratificato esplicito
  const t = parti[0];
  if (t.includes('+') && !/\.\d+[A-Z]*$/.test(t)) {
    avvisi.push(`"${t}" letto come vetrocamera (il "+" senza ".n" non indica uno stratificato)`);
    return t.split('+');
  }
  return parti;
}

export function parseComposizione(input) {
  const avvisi = [];
  const s = normalizza(input);
  if (!s) throw new Error('Composizione vuota');
  const tokens = tokenizza(s, avvisi);
  if (tokens.length % 2 === 0) {
    throw new Error(`Composizione "${input}": numero di elementi pari, manca un vetro o un'intercapedine`);
  }
  const vetri = [];
  const intercapedini = [];
  tokens.forEach((t, i) => {
    if (i % 2 === 0) vetri.push(parseVetro(t, avvisi));
    else intercapedini.push(parseIntercapedine(t));
  });
  for (const c of intercapedini) {
    if (c.mm < 4 || c.mm > 30) avvisi.push(`Intercapedine di ${c.mm} mm insolita: verificare`);
  }
  const spessoreVetroTotaleMm = vetri.reduce((a, v) => a + v.spessoreVetroMm, 0);
  const pvbTotaleMm = arrotonda(vetri.reduce((a, v) => a + v.pvbMm, 0), 2);
  const intercapedineTotaleMm = intercapedini.reduce((a, c) => a + c.mm, 0);
  let tipo;
  if (intercapedini.length === 0) tipo = vetri[0].tipo;
  else if (intercapedini.length === 1) tipo = 'vetrocamera doppia';
  else tipo = intercapedini.length === 2 ? 'vetrocamera tripla' : 'vetrocamera multipla';
  return {
    input: String(input),
    tipo,
    vetri,
    intercapedini,
    spessoreVetroTotaleMm,
    pvbTotaleMm,
    spessoreNominaleMm: arrotonda(spessoreVetroTotaleMm + pvbTotaleMm + intercapedineTotaleMm, 2),
    avvisi,
  };
}

export function pesoKgM2(composizione) {
  const c = typeof composizione === 'string' ? parseComposizione(composizione) : composizione;
  return c.spessoreVetroTotaleMm * KG_M2_PER_MM_VETRO + c.pvbTotaleMm * KG_M2_PER_MM_PVB;
}

// Peso sulle misure reali (non arrotondate)
export function pesoKg(composizione, baseMm, altezzaMm, quantita = 1) {
  controllaMisure(baseMm, altezzaMm);
  const areaM2 = (baseMm * altezzaMm) / 1e6;
  return arrotonda(pesoKgM2(composizione) * areaM2 * quantita, 2);
}

/**
 * Superficie fatturabile.
 * @param {number} baseMm
 * @param {number} altezzaMm
 * @param {object} opz
 * @param {number} [opz.passoMm=0]      arrotondamento per eccesso di ogni lato (0 = nessuno)
 * @param {number} [opz.minimoM2=0]     minimo fatturabile per pezzo
 * @param {number} [opz.quantita=1]
 * @param {'matematico'|'eccesso'} [opz.arrotondamentoArea='matematico']  arrotondamento a 2 decimali
 */
export function areaFatturabile(baseMm, altezzaMm, opz = {}) {
  controllaMisure(baseMm, altezzaMm);
  const { passoMm = 0, minimoM2 = 0, quantita = 1, arrotondamentoArea = 'matematico' } = opz;
  if (!Number.isInteger(quantita) || quantita < 1) throw new Error('Quantità non valida');
  const b = arrotondaLato(baseMm, passoMm);
  const h = arrotondaLato(altezzaMm, passoMm);
  const mm2 = b * h;
  const centesimi = mm2 / 10000; // centesimi di m²
  const centArr = arrotondamentoArea === 'eccesso' ? Math.ceil(centesimi - 1e-9) : Math.round(centesimi);
  const minimoCent = Math.round(minimoM2 * 100);
  const unitCent = Math.max(centArr, minimoCent);
  return {
    baseArrotondataMm: b,
    altezzaArrotondataMm: h,
    areaPezzoM2: centArr / 100,
    minimoApplicato: unitCent > centArr,
    areaUnitariaM2: unitCent / 100,
    quantita,
    areaTotaleM2: (unitCent * quantita) / 100,
  };
}

// Metri lineari dei lati lavorati (es. molatura). latiBase/latiAltezza: quanti lati per dimensione (0-2)
export function metriLineari(baseMm, altezzaMm, { latiBase = 2, latiAltezza = 2, quantita = 1 } = {}) {
  controllaMisure(baseMm, altezzaMm);
  for (const n of [latiBase, latiAltezza]) {
    if (![0, 1, 2].includes(n)) throw new Error('latiBase e latiAltezza devono essere 0, 1 o 2');
  }
  return arrotonda(((baseMm * latiBase + altezzaMm * latiAltezza) / 1000) * quantita, 3);
}

function arrotondaLato(mm, passo) {
  const intero = Math.ceil(mm - 1e-9);
  return passo > 0 ? Math.ceil(intero / passo) * passo : intero;
}

function controllaMisure(b, h) {
  if (!(b > 0) || !(h > 0)) throw new Error('Base e altezza devono essere numeri positivi in mm');
}

function arrotonda(x, decimali) {
  const f = 10 ** decimali;
  return Math.round((x + Number.EPSILON) * f) / f;
}

// ---- CLI ----
function cli(argv) {
  const pos = [];
  const opz = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) opz[a.slice(2)] = argv[++i];
    else pos.push(a);
  }
  if (pos.length < 1) {
    console.log('Uso: node glass-calc.mjs "<composizione>" [baseMm altezzaMm] [--passo 40] [--minimo 0.4] [--qta 1] [--area matematico|eccesso]');
    process.exit(1);
  }
  const comp = parseComposizione(pos[0]);
  const out = { composizione: comp, pesoKgM2: arrotonda(pesoKgM2(comp), 2) };
  if (pos.length >= 3) {
    const b = Number(pos[1]);
    const h = Number(pos[2]);
    const quantita = opz.qta ? Number(opz.qta) : 1;
    out.pesoKg = pesoKg(comp, b, h, quantita);
    out.areaFatturabile = areaFatturabile(b, h, {
      passoMm: opz.passo ? Number(opz.passo) : 0,
      minimoM2: opz.minimo ? Number(String(opz.minimo).replace(',', '.')) : 0,
      quantita,
      arrotondamentoArea: opz.area || 'matematico',
    });
    out.perimetroMl = metriLineari(b, h, { quantita });
  }
  console.log(JSON.stringify(out, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    cli(process.argv.slice(2));
  } catch (e) {
    console.error('Errore:', e.message);
    process.exit(1);
  }
}
