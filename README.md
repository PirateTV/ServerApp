Serverová aplikace pro Pirátskou televizi
=========================================
NodeJS aplikace, která spouští portál pro Pirátskou televizi.

Tento portál nyní umoòuje agregovat YouTube kanály a playlisty pod tzv. poøady pomocí YouTube RSS.
Portál udruje databázi poøadù s pøímım odkazem na YouTube kanál/playlist, lokální kopií úvodního obrázku a dalších nezbytnıch informací.

Vìtšina vìcí je momentálnì "hardcoded" pøímo ve zdrojovém kódu, jeliko je aplikace šitá na míru na jedno konkrétní pouití a není ambice z ní dìlat redakèní systém.

## Pouité technologie
- NodeJS
- Vue.js
- RethinkDB https://rethinkdb.com/
- Moduly NodeJS uvedené v package.json
- Grafické soubory z https://www.flaticon.com/, https://www.subtlepatterns.com/
- Videopøehrávaè Plyr https://plyr.io/

## Instalace
- Nainstalujte a spuste si RethinkDB https://rethinkdb.com/docs/install/
- Vytvoøte v RethinkDB databázi `piratskatelevize` a v ní tabulku `shows`
- Naklonujte si tento repozitáø.
- Pomocí pøíkazu `npm install` nainstalujte veškeré závislosti.
- Aplikace pouívá bower, nicménì všechny kompatibilní komponenty jsou pøiloeny v repozitáøi
- Pøejdìte do adresáøe `src` a poté mùete aplikaci spustit pomocí pøíkazu `node ./server.js`

## Dummy data
Momentálnì nejsou k dispozici.

### Autor
Ondøej Kotas http://krtkovo.eu/, http://ondrejkotas.cz/
Licence: GNU GPL v3
2019