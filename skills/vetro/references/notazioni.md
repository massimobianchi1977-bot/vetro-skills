# Notazioni delle composizioni

## Monolitici

Il numero è lo spessore nominale in mm. Spessori float più comuni: 3, 4, 5, 6, 8, 10, 12, 15, 19.

Suffissi che si incontrano spesso (non standardizzati, chiedi sempre quali usa l'azienda):

| Suffisso | Significato tipico |
|---|---|
| `T`, `temp.`, `TEMP` | Temperato (UNI EN 12150) |
| `I`, `ind.` | Indurito / heat strengthened (UNI EN 1863) |
| `HST` | Temperato con heat soak test (UNI EN 14179) |
| `BE`, `LE`, `b.e.` | Basso emissivo (low-e) |
| `SEL` | Magnetronico selettivo / controllo solare |
| `EC`, `extrachiaro` | Extrachiaro (basso tenore di ferro) |
| `SAT`, `acidato` | Satinato |

## Stratificati

Formato `AB.n`: A e B sono gli spessori delle due lastre, n il numero di fogli di PVB da 0,38 mm.

| Scritta | Lastre | PVB | Spessore nominale circa |
|---|---|---|---|
| `33.1` | 3 + 3 | 1 × 0,38 = 0,38 mm | 6,4 mm |
| `33.2` | 3 + 3 | 0,76 mm | 6,8 mm |
| `44.1` | 4 + 4 | 0,38 mm | 8,4 mm |
| `44.2` | 4 + 4 | 0,76 mm | 8,8 mm |
| `55.2` | 5 + 5 | 0,76 mm | 10,8 mm |
| `66.2` | 6 + 6 | 0,76 mm | 12,8 mm |
| `88.2` | 8 + 8 | 0,76 mm | 16,8 mm |
| `1010.2` | 10 + 10 | 0,76 mm | 20,8 mm |

Varianti:

- **Asimmetrici**: `64.2` = 6 + 4. Con spessori a due cifre la scritta diventa ambigua (`106.2`): meglio la forma esplicita `10+6.2`.
- **Più di due lastre**: `444.2` o forme esplicite tipo `4+4+4`. Chiedi come l'azienda le indica.
- **Acustici**: PVB fonoisolante, spesso indicato con `A`, `Ac`, `silence` o il nome commerciale (`44.2A`).
- **Ionoplastici** (SentryGlas e simili): intercalari più rigidi, spessori tipici 0,89 / 1,52 mm. Non sono multipli di 0,38: non usare la regola dei fogli PVB.
- Stratificato **temperato**: le lastre vengono temperate prima di essere stratificate, quindi non si taglia più.

## Vetrocamere (vetri isolanti)

I token si alternano: vetro / intercapedine / vetro [/ intercapedine / vetro].

- Separatori: `/`, `-` o spazio. `4/16/4` = `4-16-4`.
- L'intercapedine è in mm: valori tipici da 6 a 20. Suffisso del gas: `Ar` (argon), `Kr` (kripton), oppure niente (aria).
- Ogni vetro può essere monolitico o stratificato: `33.1/16Ar/4BE`.
- Triplo vetro: `4/12/4/12/4`, `33.1BE/14Ar/4/14Ar/4BE`.
- Spessore totale = somma vetri + somma intercapedini (+ PVB degli stratificati).

### Numerazione delle facce

Si contano dall'esterno verso l'interno: in un doppio vetro le facce sono 1 e 2 (lastra esterna), 3 e 4 (lastra interna); in un triplo da 1 a 6.

- I coating per il controllo solare (selettivi) stanno di solito in faccia 2.
- Il basso emissivo per l'isolamento termico sta spesso in faccia 3 nel doppio vetro.
- La posizione corretta dipende dal prodotto: fa fede la scheda tecnica del produttore del coating.

I vetri con coating magnetronico in vetrocamera richiedono la **sbordatura** (rimozione del coating sul perimetro, dove va il sigillante): è una lavorazione da prevedere nel ciclo.

## Ambiguità da gestire nel codice

- `4-16-4` può essere scritto anche `4+16+4` da alcuni utenti: il `+` dentro una vetrocamera non è uno stratificato. Se un token centrale è ≥ 6 e non ha il punto, è quasi sempre un'intercapedine.
- Spazi e maiuscole variano: normalizza (trim, maiuscole, virgola → punto) prima di fare il parsing.
- Se la stringa non si interpreta con certezza, segnalalo all'utente invece di indovinare: un errore di composizione cambia prezzo, peso e prestazioni.
