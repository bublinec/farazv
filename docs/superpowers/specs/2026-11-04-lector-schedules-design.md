# Súkromné rozpisy lektorov — schválený rozsah

Dátum: 4. november 2026. Stav: schválené pokračovanie 4. novembra 2026; heslo zadané raz, minimum 8 znakov.
Vetva: `filip/upravy`. Bez zlúčenia do `main`, nasadenia, produkčných migrácií,
zmeny živých účtov alebo zásahu do `old/`.

## Zadanie

Na `/spolocenstva/lektori` doplniť tlačidlo Rozpis lektorov na mieste podľa
skice. Ľudia vo veku 45–80 rokov cez jednoduchý dialóg zadajú spoločné heslo
a otvoria mesačné PDF. Dokument obsahuje kontakty a musí byť chránený aj
pri priamom volaní servera. LEKTORKA spravuje iba rozpisy. Správca nastavuje
heslo a roly nechránených účtov. Ostatný obsah a vzhľad zostávajú zachované.

## Zistenia v existujúcom projekte

- `src/content/editor-access.ts` pozná iba `admin` a `editor`.
- `src/server/editor-access.ts` overuje aktuálne granty pri každej autorizácii.
  Konfigurační správcovia sú chránení pred odobratím prístupu.
- `/admin/pristupy` už poskytuje pridanie a odobratie redaktora, bez výberu roly.
- Existujúce admin API predpokladajú, že každý oprávnený používateľ smie
  upravovať obsah. Nová rola vyžaduje kontrolu schopností vo všetkých cestách.
- Bežné nastavenia farnosti sa pri uložení zverejňujú. Heslo ani jeho hash
  nepatria do `SettingsDocument` alebo jeho snapshotov.
- Existujúce uploady slúžia verejným obrázkom v Cloudinary.
- Kontaktný panel lektorov vykresľuje `OfficeAside` cez `CommunityAside`.

## Prístup a alternatívy

Odporúčanie: malé PDF uložiť súkromne do PostgreSQL a vydávať iba cez
serverový endpoint s overením prístupu. Nevznikne verejná adresa súboru ani
potreba ďalšieho poskytovateľa. Maximálna veľkosť PDF bude 3 MB, s rezervou
pre limit tela požiadavky hostingu.

Autentifikované objektové úložisko lepšie škáluje veľké súbory, ale pridáva
konfiguráciu a prevádzkovú závislosť. Verejný upload s heslom iba v modale
nespĺňa zadanie, pretože URL súboru by obišlo dialóg.

## Oprávnenia

| Rola                            | Prístup                                                               |
| ------------------------------- | --------------------------------------------------------------------- |
| Chránený správca z konfigurácie | Všetky funkcie; účet nemožno meniť cez CMS.                           |
| Redaktor                        | Doterajšie úpravy obsahu, bez správy rolí, hesla a rozpisov.          |
| LEKTORKA                        | Iba sekcia rozpisov: zoznam, nahratie, náhrada, náhľad a odstránenie. |

V Prístupoch pribudne výber roly pri pridaní aj zmene účtu. Server odmietne
zmenu chráneného účtu aj pri ručnej API požiadavke. Zmena alebo odobratie roly
sa uplatní pri nasledujúcej požiadavke aj pre prihlásený účet. Audit zaznamená
aktéra, čas a zmenu roly, bez hesiel alebo tokenov.

LEKTORKA po prihlásení skončí na `/admin/lektori`. Ostatné admin stránky jej
neposkytnú údaje. Existujúce API pre záznamy, médiá, importy, náhľady, uploady,
podnety, prístupy a obnovu cache ju odmietnu. Skrytie navigácie bude iba
používateľská pomôcka; hranicu vynucuje server. CMS nevytvára ani nemení
prístup do GitHub repozitára.

## Rozpisy v CMS

Sekcia zobrazí aktuálny a nasledujúci mesiac podľa bratislavského kalendára,
vrátane prechodu december/január. Pre mesiac existuje najviac jeden dokument.
Nasledujúci mesiac je možné nahrať a sprístupniť vopred s jasným označením.

Formulár umožní vybrať mesiac a PDF, uložiť, otvoriť kontrolný náhľad,
nahradiť a po potvrdení odstrániť. Server overí verziu pri náhrade, aby
súbežná úprava neprepísala novšiu. Neúspešná náhrada zachová pôvodné PDF.

Samostatná tabuľka uloží bajty PDF, mesiac `YYYY-MM`, bezpečný názov, veľkosť,
verziu, aktéra a čas. Upload má ohraničené čítanie tela, limit 3 MB a kontrolu
formátu a podpisu; samotný názov alebo MIME od klienta nestačí. Staršie
mesiace sa čitateľom nevydávajú. Zostanú v stránkovanej súkromnej histórii
správy rozpisov, kde ich oprávnený používateľ môže odstrániť.

## Heslo a prístup čitateľov

V Nastaveniach pribudne oddelený súkromný panel iba pre správcu. Uloží
solený hash hesla s nákladnou deriváciou. Vráti iba informáciu, či je heslo
nastavené. Heslo sa zadáva raz, podporuje medzery a diakritiku, má
8–128 znakov. LEKTORKA ho nesmie čítať alebo meniť. Bez hesla server
prístup zamietne. Heslo ani hash nevstúpia do verejných nastavení.

Po správnom hesle server vydá náhodný odvolateľný token, v databáze uloží
iba jeho hash a platnosť najviac 12 hodín. Prehliadač drží token iba
v pamäti aktuálnej karty: bez cookie, `localStorage`, `sessionStorage` alebo
parametra URL. Zatvorenie karty aj obnovenie stránky vyžaduje nové heslo.
To je prísnejšie než `sessionStorage`, ktoré niektoré prehliadače obnovia
spolu so zatvorenou kartou.

Zmena hesla okamžite zneplatní staré tokeny. Server kontroluje token pri
zozname mesiacov aj každom vydaní PDF. Overenie hesla a zápisy kontrolujú
origin. Pokusy o heslo majú atomické databázové obmedzenie podľa dôveryhodne
získanej adresy a celkového rozpočtu, platné medzi serverovými inštanciami.
Logy neobsahujú heslá, tokeny, PDF ani surové IP adresy. Expirované tokeny
a počítadlá sa priebežne čistia.

PDF nepatrí do `public/`, verejnej knižnice médií, verejného content API ani
Cloudinary. Odpovede vrátane chýb používajú `private, no-store`, zákaz
indexovania a ochranu proti odhadovaniu typu obsahu. PDF má pevný typ
`application/pdf` a bezpečný názov. Otvorenie/stiahnutie použije autorizovaný
fetch a dočasný blob, ktorý UI po použití uvoľní. Priamy odkaz bez tokenu
neposkytne dokument.

Ochrana bráni neoprávnenému získaniu zo servera. Už oprávnene získanému PDF
alebo skopírovaným kontaktom nemožno technicky zabrániť v ďalšom zdieľaní.

## Rozhranie

Tlačidlo Rozpis lektorov pribudne pred odkazom na všetky kontakty iba na
stránke lektorov. Zachová farby a typografiu webu; ružový rám zo skice
iba označuje umiestnenie.

Dialóg má nadpis, označené pole Heslo, možnosť Zobraziť heslo, tlačidlo
Otvoriť rozpis a zatvorenie. Po overení zobrazí mesiace s akciami Otvoriť PDF
a Stiahnuť PDF, aktuálny mesiac prvý. Prázdny mesiac zrozumiteľne oznámi.
Chybné heslo, obmedzenie pokusov a výpadok služby majú rozlíšené správy.

Ovládacie prvky majú minimálne 44 px, čitateľné písmo, dostatočný kontrast
a viditeľný fokus. Overí sa klávesnica, Escape, riadenie a návrat fokusu,
čítačka obrazovky a mobil. Stiahnutie umožní prácu aj bez PDF náhľadu.

## Vlastníci zmien

- Roly: `src/content/editor-access.ts`, `src/server/editor-access.ts`,
  `src/server/auth.ts`, `src/server/admin-http.ts`, admin stránky, upload API,
  `EditorAccess` a admin navigácia.
- Nové samostatné zmluvy, validácia a serverové moduly pre rozpisy,
  heslá, tokeny a limity; bez rozširovania verejných dokumentov o tajomstvá.
- `src/server/db/schema.ts` a nová Drizzle migrácia; existujúce granty
  zostanú redaktormi.
- `/admin/lektori`, samostatné admin API a súkromný panel v Nastaveniach.
- Samostatné čitateľské API pre odomknutie, mesiace a PDF; cielený klientsky
  komponent pri `CommunityAside`/`OfficeAside`.
- Changelog s mapou zmien a návodom, editorská dokumentácia a dátovaný
  záznam v `docs/remake/plan.md`.

## Kritériá overenia

1. `npm run check` pred a po zmene s Node z `.nvmrc`. Shell má teraz Node
   24.13.1 a npm 11.8.0; projekt požaduje Node 22.23.4 a npm 10.9.9.
   Pred kontrolami treba sprístupniť správny lokálny runtime.
2. Unit testy mesiacov, PDF, hesiel a oprávnení.
3. Jednorazová lokálna databáza: migrácia, zachovanie grantov, súbežná
   náhrada, roly, zmena hesla, limity pokusov a odvolanie tokenov.
4. Negatívne testy LEKTORKY vo všetkých rodinách admin API a ochrana účtov.
5. PDF bez tokenu, s chybným/odvolaným tokenom, odhadnutým ID a cudzím
   originom. Kontrola hlavičiek a neprítomnosti súborov alebo tajomstiev
   vo verejných odpovediach a HTML.
6. Browser test hesiel, uploadu/náhrady/odstránenia, mesiacov, obnovenej
   a novej karty, klávesnice, mobilu a automatickej prístupnosti.
7. Fixture build a relevantné verejné regresie. Vlastné procesy, porty,
   databázy a adresáre výstupov. Bez produkčných účtov a provider zápisov.
8. Pred odovzdaním overiť diff, vetvu a cieľ pushu. Commit/push výhradne
   `filip/upravy`; žiadny merge do `main` ani deploy.

## Doplnené pravidlá návrhu

Doplnené voľby: redaktor/LEKTORKA pre nechránené účty, PDF do 3 MB
a prísne odomknutie iba v pamäti karty, ktoré zanikne aj pri obnovení stránky.
Tento dokument je návrh, nie changelog hotovej implementácie.

## Upresnenie vlastníka — 5. november 2026

Správcovia zostávajú výhradne v existujúcich env premenných. Cez CMS sa dajú
pridávať a meniť iba roly redaktor a lektor/lektorka. Google prihlásenie ani
ostatný CMS a verejný obsah sa nemenia. Toto upresnenie má prednosť pred
pôvodným návrhom databázovej roly správcu.
