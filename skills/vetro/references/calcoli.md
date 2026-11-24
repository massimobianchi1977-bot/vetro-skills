# Calcoli

## Superficie fatturabile

Quasi tutte le vetrerie fatturano a m² con tre regole, che vanno lette dalla configurazione dell'azienda e mai fissate nel codice:

1. **Arrotondamento dei lati**: ogni lato arrotondato per eccesso al multiplo del passo (es. 20, 30 o 40 mm). Alcune aziende non arrotondano, altre arrotondano solo l'area.
2. **Area del pezzo**: base × altezza in m², arrotondata a 2 decimali (per eccesso o matematico: chiedi).
3. **Minimo fatturabile per pezzo**: se l'area è sotto il minimo si fattura il minimo. Spesso il minimo cambia per categoria (es. 0,40 m² per i monolitici, 0,50 m² per le vetrocamere).

Poi: area totale riga = area unitaria × quantità. Il minimo si applica **al singolo pezzo**, non al totale della riga.

### Esempi (passo 40 mm, minimo 0,40 m², area arrotondata a 2 decimali)

| Misura (B × H) | Lati arrotondati | Area pezzo | Fatturabile |
|---|---|---|---|
| 1000 × 1210 | 1000 × 1240 | 1,24 m² | 1,24 m² |
| 300 × 400 | 320 × 400 | 0,128 → 0,13 m² | 0,40 m² (minimo) |
| 1000 × 1210, quantità 3 | 1000 × 1240 | 1,24 m² | 3,72 m² |

### Attenzione ai numeri in virgola mobile

`Math.round(1.005 * 100) / 100` in JavaScript dà 1, non 1,01. Lavora in interi:

- lati in mm interi;
- area in mm² (intero esatto);
- centesimi di m² = mm² / 10.000, poi `Math.ceil` o `Math.round` su quel valore;
- converti in m² solo per la visualizzazione.

## Peso

- Vetro: **2,5 kg/m² per mm** di spessore.
- PVB: circa **1,07 kg/m² per mm**, quindi circa 0,41 kg/m² per foglio da 0,38 mm.
- Gas in intercapedine: trascurabile.
- Il peso si calcola sulle **misure reali**, non su quelle arrotondate per la fatturazione.

Esempi:

| Pezzo | Calcolo | Peso |
|---|---|---|
| 4/16/4, 1000 × 1200 | 1,2 m² × 8 mm × 2,5 | 24,0 kg |
| 33.1, 1000 × 1000 | 1 m² × (6 × 2,5 + 0,41) | circa 15,4 kg |
| 10 mm, 2000 × 1000 | 2 m² × 10 × 2,5 | 50,0 kg |

Il peso serve per bancali, cavalletti, portata delle ventose e dei montanti, consegne. Una lastra sopra i 50–60 kg di solito non si movimenta a mano da una persona: è un buon punto per un avviso nel software.

## Metri lineari

- Perimetro completo: 2 × (B + H) / 1000 m.
- Molature e biselli si fatturano sui **lati lavorati**: il software deve permettere di scegliere quali lati (es. solo i due lati lunghi).
- Molti listini hanno un minimo di metri lineari per pezzo: anche questo è configurabile.

## Prestazioni termiche indicative (Ug)

Valori orientativi per vetri verticali, solo per controlli di plausibilità. Fa fede la dichiarazione del produttore del vetro.

| Composizione | Ug circa (W/m²K) |
|---|---|
| Monolitico 4 mm | 5,8 |
| 4/16/4 aria, senza coating | 2,7 |
| 4/16Ar/4 con basso emissivo | 1,0 – 1,1 |
| Triplo con 2 basso emissivi, argon, intercapedini 14–16 | 0,6 – 0,7 |

Se un calcolo produce valori molto lontani da questi, probabilmente c'è un errore di unità o di composizione.
