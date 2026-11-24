# vetro-skills

Skill per agenti AI (Claude Code e compatibili) dedicate a chi sviluppa software per **vetrerie e trasformatori del vetro piano**: gestionali, preventivatori, ottimizzatori di taglio, app d'ordine.

*English below.*

## Cosa contiene

La skill `vetro` insegna all'agente le regole pratiche del mestiere:

- come leggere composizioni come `4`, `6T`, `33.1`, `44.2A`, `4/16/4`, `33.1/16Ar/4BE`;
- come calcolare i **m² fatturabili** con arrotondamento dei lati, minimo per pezzo e quantità, senza errori di virgola mobile;
- come calcolare il **peso** di monolitici, stratificati e vetrocamere;
- lavorazioni (molatura, fori, tacche, tempera, stratifica, vetrocamera), ordine del ciclo e vincoli;
- ottimizzazione del taglio: livelli a ghigliottina, rifili, larghezza minima di troncaggio, rotazione, difetti, rimanenze, cavalletti, misura della resa, approcci algoritmici, output verso il banco;
- norme di riferimento (UNI EN 12150, UNI EN 1279, UNI 7697 e altre);
- glossario italiano–inglese.

Include due script Node senza dipendenze, con test:

```bash
# composizione, peso, m² fatturabili, perimetro
node skills/vetro/scripts/glass-calc.mjs "33.1/16Ar/4BE" 1000 1200 --passo 40 --minimo 0.5 --qta 2

# verifica di uno schema di taglio: area utile, sovrapposizioni, difetti, ghigliottina, livelli, resa
node skills/vetro/scripts/cut-check.mjs schema.json --max-livelli 4
```

`cut-check.mjs` è utile anche da solo: puoi usarlo nei test automatici di qualsiasi ottimizzatore per essere sicuro che gli schemi prodotti si possano davvero tagliare.

## Principio guida

Le regole commerciali (arrotondamenti, minimi, listini) cambiano da vetreria a vetreria. La skill non le inventa: le tratta come parametri e chiede all'utente i valori della sua azienda.

## Installazione

**Claude Code, copia manuale**

```bash
# per tutti i progetti
cp -r skills/vetro ~/.claude/skills/vetro
# solo per un progetto
cp -r skills/vetro .claude/skills/vetro
```

**Con la CLI `skills`**

```bash
npx skills add massimobianchi1977-bot/vetro-skills --skill vetro -a claude-code
```

**App Claude**: comprimi la cartella `skills/vetro` in uno zip e caricalo tra le skill nelle impostazioni.

## Test

```bash
node --test skills/vetro/scripts/*.test.mjs
```

## Contribuire

Lavori in vetreria o scrivi software per il settore? Le prassi cambiano da zona a zona: segnala con una issue o una pull request regole diverse, errori o termini mancanti. Ogni correzione va accompagnata, se possibile, da un riferimento (norma, scheda tecnica, listino tipo).

## Avvertenze

I valori indicativi (Ug, pesi, limiti dei fori) servono per controlli di plausibilità e non sostituiscono le schede tecniche dei produttori, le norme o la valutazione di un tecnico.

---

## English

Agent skill for developers building software for **flat-glass processors and glass shops** (ERP, quoting tools, cutting optimizers, ordering apps). It teaches the agent how to read glass compositions (`33.1`, `44.2`, `4/16Ar/4`), compute billable area with side rounding and per-piece minimums, compute weights, the order and constraints of glass processing (tempering, laminating, insulating glass units), guillotine cutting rules and staged cutting, and the relevant EN/UNI standards. It ships a dependency-free validator for cutting layouts (overlaps, trims, defects, guillotine feasibility, number of stages, yield) that any optimizer can use in its test suite. The skill text is in Italian; an Italian–English glossary is included. Contributions from other countries are welcome.

## Licenza / License

MIT — vedi [LICENSE](LICENSE).

Realizzato da Massimo Bianchi — M&M Service and Consulting ([memsc.it](https://www.memsc.it)), consulenza e software per vetrerie.
