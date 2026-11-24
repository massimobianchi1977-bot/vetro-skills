# Ottimizzazione del taglio del vetro piano

## Il problema

Dati dei pezzi rettangolari con quantità (la distinta) e delle lastre disponibili (lastre intere e rimanenze di magazzino), trovare schemi di taglio che producano tutti i pezzi consumando meno vetro possibile, rispettando i vincoli del banco di taglio.

In letteratura è il **2D guillotine cutting stock problem** (o bin packing a ghigliottina, se le lastre sono tutte uguali). È un problema NP-difficile: per le distinte reali si usano euristiche, e i metodi esatti valgono solo per casi piccoli o come confronto.

## Vincoli del banco

### Taglio a ghigliottina e livelli

Il vetro si incide e si spezza: ogni taglio deve attraversare tutto il pezzo di vetro su cui si lavora in quel momento. Gli schemi si descrivono quindi a **livelli** che alternano la direzione:

1. primo livello: tagli che attraversano tutta la lastra e la dividono in strisce;
2. secondo livello: tagli dentro ogni striscia, nella direzione perpendicolare;
3. terzo livello: tagli dentro i pezzi del secondo livello, di nuovo perpendicolari, e così via.

Molti software e banchi del settore chiamano i livelli con lettere (spesso X, Y, Z, W). Nomenclatura, direzione del primo livello e numero massimo di livelli cambiano da costruttore a costruttore: sono parametri, da leggere dalla configurazione della macchina dell'utente. Più livelli permettono rese migliori, ma rendono lo schema più lento e più difficile da troncare.

Uno schema non a ghigliottina (per esempio la classica disposizione "a girandola" di cinque pezzi) sembra efficiente sullo schermo ma non si può tagliare. Va scartato sempre.

### Rifili

I bordi della lastra madre sono spesso scheggiati o non a squadra. Si prevede un **rifilo** su ogni lato, configurabile per lato e per tipo di vetro (gli stratificati di solito ne vogliono di più). Le rimanenze già rifilate possono averlo nullo su alcuni lati.

### Larghezza minima di troncaggio

Una striscia troppo stretta non si spezza in modo pulito, e il minimo cresce con lo spessore. È un parametro per spessore: se una soluzione lascia sfridi o pezzi più stretti del minimo tra due tagli, il banco può non riuscire a eseguirla.

### Spessore del taglio

Sul float il taglio per incisione non asporta materiale, quindi lo sfrido di taglio si considera zero. Va previsto un valore diverso da zero quando:

- i pezzi vanno molati e l'azienda taglia con sovrametallo;
- lo stratificato si taglia con un procedimento che richiede distanza tra i tagli;
- si usano macchine ad acqua o di fresatura per sagome.

### Rotazione dei pezzi

Ruotare un pezzo di 90° migliora la resa, ma è vietato per:

- vetri stampati e con disegno, dove la venatura o il motivo hanno un verso;
- retinati;
- satinati, decorati o serigrafati con un verso;
- pezzi per cui il cliente ha indicato la direzione.

La rotazione deve essere un attributo del materiale e, se serve, del singolo pezzo.

### Coating e lato della lastra

I vetri con coating (basso emissivo, selettivi) vanno caricati sul banco con il lato richiesto dal produttore. Alcuni banchi fanno anche la sbordatura del coating durante il taglio. Lo schema deve sapere se la lastra è coated e su quale faccia.

### Difetti

Una lastra può avere zone difettose da escludere: il software deve accettarle come rettangoli vietati, e lo schema non deve metterci pezzi sopra.

## Rimanenze

- Lo sfrido grande abbastanza diventa una **rimanenza** da etichettare e riusare. La soglia (area minima e lati minimi) è configurabile.
- Usare prima le rimanenze riduce il magazzino, ma può peggiorare la resa del lotto: rendi la scelta esplicita all'utente.
- Una rimanenza va registrata con materiale, misure reali e posizione in magazzino, altrimenti nessuno la ritrova.

## Sequenza e logistica

La resa non è l'unico obiettivo. Al banco contano anche:

- **priorità di consegna**: le commesse urgenti vanno tagliate per prime, anche a costo di qualche punto di resa;
- **cavalletti**: mescolare tante commesse sulla stessa lastra migliora la resa ma complica lo smistamento. Un limite al numero di commesse o di cavalletti per lastra è un parametro utile;
- **tempera**: raggruppare i pezzi da temperare aiuta a riempire il forno;
- **lavorazioni successive**: pezzi da molare, forare o assemblare in vetrocamera seguono percorsi diversi.

## Misurare la qualità

- **Resa (rendimento) %** = somma delle aree reali dei pezzi / somma delle aree delle lastre consumate × 100.
- Dichiara sempre come conti l'ultima lastra usata solo in parte e le rimanenze rientrate a magazzino: due software che le contano in modo diverso danno rese non confrontabili.
- Altri indicatori: numero di lastre, numero di tagli, livelli usati, tempo stimato al banco.

## Approcci algoritmici

- **Euristiche greedy a strisce**: ordina i pezzi (per altezza o area decrescente), riempi strisce del primo livello, poi colonne del secondo. Veloci, buone per un primo risultato.
- **Più tentativi**: varia ordinamenti, rotazioni e larghezze delle strisce e tieni lo schema migliore. Ricerche ad albero limitate (beam search) danno spesso il salto di qualità.
- **Generazione di colonne (Gilmore-Gomory)**: adatta a lotti grandi con poche misure ripetute molte volte.
- **Determinismo**: a parità di input lo schema dovrebbe essere identico, così una commessa si può rifare uguale. Se usi casualità, fissa il seme.
- **Validazione finale obbligatoria**: prima di mandare uno schema al banco controlla sovrapposizioni, rifili, ghigliottina e numero di livelli con `scripts/cut-check.mjs` o con un controllo equivalente.

## Output verso il banco

- Ogni costruttore di banchi di taglio usa i suoi formati di file. Non inventarli: chiedi all'utente un file reale esportato dalla sua macchina e la documentazione del formato.
- Origine e verso degli assi cambiano tra macchine (angolo in basso a sinistra, in alto a sinistra, base lungo il lato lungo o corto): rendili configurabili e verificali con un disegno di prova.
- Prima di usare un nuovo esportatore in produzione, prova un file al banco su una lastra di scarto.
- Le etichette dei pezzi riportano almeno commessa, posizione, misure, materiale e cavalletto di destinazione, meglio se con codice a barre o QR.
