Serverová aplikace pro Pirátskou televizi
=========================================
NodeJS aplikace, která spouští portál pro Pirátskou televizi.

Tento portál nyní umožňuje agregovat YouTube kanály a playlisty pod tzv. pořady pomocí YouTube RSS.
Portál udržuje databázi pořadů s přímým odkazem na YouTube kanál/playlist, lokální kopií úvodního obrázku a dalších nezbytných informací.

Většina věcí je momentálně "hardcoded" přímo ve zdrojovém kódu, jelikož je aplikace šitá na míru na jedno konkrétní použití a není ambice z ní dělat redakční systém.

## Použité technologie
- NodeJS
- ExpressJS
- RethinkDB https://rethinkdb.com/
- Moduly NodeJS uvedené v package.json
- Grafické soubory z https://www.flaticon.com/, https://www.subtlepatterns.com/
- Videopřehrávač Plyr https://plyr.io/

## Instalace
- Nainstalujte a spustťe si RethinkDB https://rethinkdb.com/docs/install/
- Vytvořte v RethinkDB databázi `piratskatelevize` a v ní tabulky `shows` a `clientLog`
- Naklonujte si tento repozitář.
- Pomocí příkazu `npm install` nainstalujte veškeré závislosti.
- Aplikace používá bower, nicméně všechny kompatibilní komponenty jsou přiloženy v repozitáři
- Přejděte do adresáře `src` a poté můžete aplikaci spustit pomocí příkazu `node ./server.js`

## Dummy data
Momentálně nejsou k dispozici.

### Autor
Ondřej Kotas http://krtkovo.eu/, http://ondrejkotas.cz/      
Licence: GNU GPL v3    
2019
