---
name: vetro
description: Conoscenze di settore per chi sviluppa software per vetrerie e trasformatori del vetro piano (gestionali, preventivatori, ottimizzatori di taglio, app d'ordine). Usala quando il lavoro riguarda calcolo dei m² fatturabili con arrotondamenti e minimi, peso delle lastre, notazioni come 33.1, 44.2 o 4/16/4, vetrocamera, stratificati, temperati, lavorazioni a metro lineare, distinte e schemi di taglio, ottimizzazione a ghigliottina, rimanenze o terminologia italiana del vetro.
---

# Vetro: dominio per software da vetreria

Questa skill raccoglie le regole pratiche del vetro piano che servono quando si scrive codice per una vetreria: come si legge una composizione, come si calcolano superficie fatturabile e peso, quali lavorazioni esistono e quali vincoli tecnici non vanno violati.

## Principi

1. **Mai inventare regole commerciali.** Arrotondamenti, minimi fatturabili e listini cambiano da vetreria a vetreria. Rendili sempre parametri di configurazione e chiedi all'utente i valori della sua azienda se non li conosci.
2. **Le misure si scrivono in millimetri, Base × Altezza.** La base è la misura orizzontale come la lastra sarà montata. Non invertire mai l'ordine senza dirlo: per stratificati con decoro, satinati con verso o vetri a tubi l'orientamento conta.
3. **Un temperato non si lavora dopo la tempera.** Tagli, fori, tacche e molature vanno fatti prima. Il software deve impedire di aggiungere lavorazioni a un pezzo già temperato e deve calcolare il pezzo da tagliare a misura finita.
4. **Un calcolo, una funzione.** Se nel progetto esiste già una funzione per l'area fatturabile o il peso, riusala. Due implementazioni diverse della stessa regola producono preventivi e fatture che non tornano.
5. **Arrotonda alla fine.** Calcola in millimetri interi e arrotonda i m² una sola volta, al passaggio previsto dalla regola commerciale.

## Calcoli rapidi

- **Peso del vetro**: 2,5 kg per m² per ogni millimetro di spessore (densità circa 2.500 kg/m³). Un 4 mm pesa 10 kg/m², un 10 mm 25 kg/m².
- **Peso di uno stratificato**: somma dei vetri più il PVB. Ogni foglio da 0,38 mm pesa circa 0,4 kg/m².
- **Peso di una vetrocamera**: somma dei vetri; il gas dell'intercapedine è trascurabile.
- **Area fatturabile tipica**: ogni lato arrotondato per eccesso al multiplo stabilito (es. 20, 30 o 40 mm), area in m² con 2 decimali, poi il minimo fatturabile per pezzo (es. 0,25–0,50 m²), infine × quantità.
- **Perimetro**: le molature e le bisellature si fatturano a metro lineare sui lati effettivamente lavorati, non per forza su tutto il perimetro.

Dettagli, varianti ed esempi numerici: [references/calcoli.md](references/calcoli.md).

## Leggere una composizione

| Scritta | Significato |
|---|---|
| `4` | Monolitico float da 4 mm |
| `6T` / `6 temp.` | Monolitico temperato da 6 mm |
| `33.1` | Stratificato 3+3 mm con 1 foglio di PVB da 0,38 mm |
| `44.2` | Stratificato 4+4 mm con 2 fogli di PVB (0,76 mm) |
| `4/16/4` o `4-16-4` | Vetrocamera: lastra 4, intercapedine 16 mm, lastra 4 |
| `33.1/16Ar/4BE` | Vetrocamera con stratificato, gas argon e basso emissivo |
| `4/12/4/12/4` | Triplo vetro, due intercapedini da 12 |

Nelle vetrocamere i token si alternano: vetro, intercapedine, vetro, intercapedine, vetro. Regole complete, casi ambigui e numerazione delle facce: [references/notazioni.md](references/notazioni.md).

## Lavorazioni e vincoli

Taglio, molatura (filo grezzo, filo lucido, bisello), fori, tacche, sagome, tempera, stratifica, vetrocamera, sabbiatura e satinatura, verniciatura. Per ognuna: come si fattura di solito, in che ordine va fatta, cosa la rende impossibile. Vedi [references/lavorazioni-norme.md](references/lavorazioni-norme.md), che riassume anche le norme da citare nei documenti (UNI EN 12150, UNI EN 14449, UNI EN 1279, UNI 7697).

## Ottimizzazione del taglio

- Il vetro float si taglia a **ghigliottina**: ogni taglio attraversa tutta la lastra o lo spezzone corrente. Un ottimizzatore che produce schemi non a ghigliottina genera piani irrealizzabili al banco.
- Il taglio per incisione non asporta materiale (**sfrido di taglio quasi nullo**), ma va previsto un **rifilo** sui bordi della lastra madre, spesso 10–20 mm per lato. Rendilo configurabile.
- Gli stratificati richiedono rifili maggiori e banchi dedicati; la tempera richiede di rispettare le misure minime e massime del forno.
- Formati commerciali comuni della lastra float: 6000 × 3210 mm (jumbo) e 3210 × 2250 mm. Verifica sempre i formati effettivi del fornitore dell'utente.
- Le misure in distinta sono **misure finite**: se il pezzo va molato a filo lucido, chiedi se l'azienda taglia già a misura finita o aggiunge un sovrametallo.
- Rotazione vietata per stampati, retinati, decori con verso e pezzi con direzione indicata dal cliente.
- La resa non è l'unico obiettivo: contano anche priorità di consegna, numero di cavalletti per lastra, raggruppamento per tempera e riuso delle rimanenze.
- **Prima di mandare uno schema al banco validalo sempre**: sovrapposizioni, rifili, ghigliottina, numero di livelli (`scripts/cut-check.mjs`).
- Non inventare il formato dei file per il banco: chiedi un file reale esportato dalla macchina dell'utente.

Vincoli completi, rimanenze, metriche di resa, algoritmi e output verso il banco: [references/ottimizzazione-taglio.md](references/ottimizzazione-taglio.md).

## Quando non sai

Le prassi di vetreria variano per zona e azienda. Se una regola cambia un prezzo, un peso o la sicurezza di un pezzo, chiedi all'utente invece di assumere. Per i termini: [references/glossario.md](references/glossario.md) (italiano–inglese).

## Script

Entrambi in Node 18+, senza dipendenze, con test (`node --test scripts/*.test.mjs`).

`scripts/cut-check.mjs` verifica uno schema di taglio in JSON (lastra, rifili, difetti, pezzi con coordinate in mm dall'angolo in basso a sinistra): pezzi dentro l'area utile, sovrapposizioni, zone difettose, eseguibilità a ghigliottina, livelli necessari e resa. Uso: `node scripts/cut-check.mjs schema.json --max-livelli 4` oppure `import { verificaSchema } from './cut-check.mjs'`. Usalo per testare qualsiasi ottimizzatore, anche uno già esistente nel progetto.

`scripts/glass-calc.mjs` contiene funzioni pronte per i calcoli:

- `parseComposizione("33.1/16Ar/4BE")` → strati, spessori, numero di PVB, spessore nominale
- `pesoKg(composizione, baseMm, altezzaMm)` → peso del pezzo
- `areaFatturabile(baseMm, altezzaMm, { passoMm, minimoM2, quantita })` → m² unitari e totali

Si usa da riga di comando (`node scripts/glass-calc.mjs "4/16/4" 1000 1200`) o importandolo. Se il progetto ha già i suoi calcoli, usa lo script solo per verificarli, non per sostituirli.
