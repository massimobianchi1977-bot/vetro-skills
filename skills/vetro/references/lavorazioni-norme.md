# Lavorazioni e norme

## Lavorazioni comuni

| Lavorazione | Come si fattura di solito | Note per il software |
|---|---|---|
| Taglio | Compreso nel prezzo al m² | Distinte a misura finita; formati speciali con supplemento |
| Molatura filo grezzo (filo greggio) | Metro lineare | Toglie il tagliente, aspetto opaco |
| Molatura filo lucido | Metro lineare, prezzo per fascia di spessore | Bordo a vista; lati selezionabili |
| Bisellatura | Metro lineare, prezzo per larghezza del bisello | Larghezza in mm è un parametro |
| Fori | A pezzo, per fascia di diametro | Diametro e posizione da memorizzare |
| Tacche, scassi, intagli | A pezzo | Servono quote o disegno |
| Sagome (forme non rettangolari) | Supplemento a pezzo o % | Area fatturata di solito sul rettangolo circoscritto |
| Tempera | Supplemento €/m², spesso con minimo | Vincola tutte le lavorazioni a "prima" |
| Stratifica | Prezzo del prodotto stratificato | Lastre temperate da stratificare: si temperano prima |
| Vetrocamera | Prezzo al m² della composizione, minimo dedicato | Canalina, gas, sigillante, sbordatura |
| Sabbiatura / satinatura | €/m² | Il satinato acidato di solito si compra già pronto |
| Verniciatura / serigrafia | €/m² | Prima della tempera se smalto ceramico |
| Fuori misura / fuori formato | Supplemento oltre soglie | Le soglie dipendono dalle macchine dell'azienda |

## Ordine del ciclo

Taglio → molatura → fori e tacche → lavaggio → verniciatura/serigrafia → tempera → stratifica → vetrocamera.

Il software deve:

- impedire lavorazioni meccaniche dopo la tempera;
- per un pezzo temperato, mandare al taglio la misura finita (la tempera non cambia le dimensioni in modo significativo, ma dopo non si corregge più);
- ricordare che uno stratificato di lastre temperate va ordinato come singole lastre temperate, poi stratificate.

## Fori nei temperati

La norma UNI EN 12150-1 fissa limiti per i fori nel vetro temperato espressi in multipli dello spessore s. Le regole pratiche citate più spesso sono:

- diametro del foro non inferiore a s;
- distanza del bordo del foro dal bordo del vetro di almeno 2s;
- distanza tra due fori di almeno 2s;
- fori vicini agli angoli: distanze maggiori.

Molti temperisti chiedono margini più ampi (per esempio 3s dal bordo sui piani cucina). Rendi questi limiti configurabili per fornitore e usali per un avviso, non per un blocco definitivo: fa fede chi tempera.

## Norme da conoscere

| Norma | Argomento |
|---|---|
| UNI EN 572 | Vetro di base (float, stampato, ecc.) |
| UNI EN 12150 | Vetro temperato termicamente di sicurezza |
| UNI EN 1863 | Vetro indurito termicamente (heat strengthened) |
| UNI EN 14179 | Temperato con heat soak test |
| UNI EN ISO 12543 / UNI EN 14449 | Vetro stratificato e stratificato di sicurezza |
| UNI EN 1279 | Vetrate isolanti (vetrocamera) |
| UNI EN 12600 | Prova del pendolo: classificazione all'urto (es. 1B1, 2B2) |
| UNI EN 356 | Vetri antieffrazione (classi P1A–P8B) |
| UNI EN 1063 | Vetri antiproiettile |
| UNI EN 673 | Calcolo della trasmittanza termica Ug |
| UNI 7697 | Criteri di sicurezza nelle applicazioni vetrarie: dove serve un vetro di sicurezza (Italia) |

Le norme si aggiornano: nei documenti generati dal software cita la norma senza anno, oppure leggi l'anno dalla configurazione.

## Sicurezza: cosa non deve fare il software

- Non suggerire un monolitico float dove la UNI 7697 richiede vetro di sicurezza (es. parapetti, porte, vetrate a rischio d'urto). Nel dubbio, segnala che la scelta va verificata dal tecnico.
- Non presentare un temperato come "anti-caduta": in caso di rottura si frantuma in piccoli pezzi ma non resta in sede. Dove serve che il vetro resti in posizione dopo la rottura serve uno stratificato.
- Non trattare i valori indicativi (Ug, pesi, limiti dei fori) come certificazioni.
