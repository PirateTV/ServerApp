Serverov� aplikace pro Pir�tskou televizi
=========================================
NodeJS aplikace, kter� spou�t� port�l pro Pir�tskou televizi.

Tento port�l nyn� umo��uje agregovat YouTube kan�ly a playlisty pod tzv. po�ady pomoc� YouTube RSS.
Port�l udr�uje datab�zi po�ad� s p��m�m odkazem na YouTube kan�l/playlist, lok�ln� kopi� �vodn�ho obr�zku a dal��ch nezbytn�ch informac�.

V�t�ina v�c� je moment�ln� "hardcoded" p��mo ve zdrojov�m k�du, jeliko� je aplikace �it� na m�ru na jedno konkr�tn� pou�it� a nen� ambice z n� d�lat redak�n� syst�m.

## Pou�it� technologie
- NodeJS
- Vue.js
- RethinkDB https://rethinkdb.com/
- Moduly NodeJS uveden� v package.json
- Grafick� soubory z https://www.flaticon.com/, https://www.subtlepatterns.com/
- Videop�ehr�va� Plyr https://plyr.io/

## Instalace
- Nainstalujte a spust�e si RethinkDB https://rethinkdb.com/docs/install/
- Vytvo�te v RethinkDB datab�zi `piratskatelevize` a v n� tabulku `shows`
- Naklonujte si tento repozit��.
- Pomoc� p��kazu `npm install` nainstalujte ve�ker� z�vislosti.
- Aplikace pou��v� bower, nicm�n� v�echny kompatibiln� komponenty jsou p�ilo�eny v repozit��i
- P�ejd�te do adres��e `src` a pot� m��ete aplikaci spustit pomoc� p��kazu `node ./server.js`

## Dummy data
Moment�ln� nejsou k dispozici.

### Autor
Ond�ej Kotas http://krtkovo.eu/, http://ondrejkotas.cz/
Licence: GNU GPL v3
2019