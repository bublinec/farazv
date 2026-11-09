# Príručka redaktora

[Prevádzka a obnova](operations.md) · [Projekt](../README.md)

Otvorte https://farazv.sk/admin a prihláste sa cez schválený Google účet. Ak
prihlásenie zlyhá, skontrolujte vybraný účet a kontaktujte správcu stránky.

## Ukladanie a zverejnenie

**Uložiť** uchová nezverejnený koncept súkromne. Ak je však záznam už
**zverejnený, uloženie ihneď aktualizuje aj verejný web**. Spoločné nastavenia
farnosti sa zverejňujú pri každom uložení.

**Náhľad** zobrazí aktuálny formulár v editore bez uloženia či zverejnenia.
Tlačidlom **Späť na úpravu** sa vrátite k práci. Na prvé zverejnenie najskôr
uložte zmeny a potom zapnite prepínač **Zverejnené**. Vypnutie stiahne záznam
z webu, ale zachová uložený koncept aj neuložený text v otvorenom formulári.
Spoločné nastavenia nemajú prepínač na stiahnutie z webu.

Pred odchodom uložte zmeny. Neuložený formulár upozorní na odchod; pri zatvorení
karty závisí upozornenie aj od prehliadača. Po chybe zostávajú údaje vo formulári.
Ak záznam medzitým upravil iný redaktor, najskôr si zachovajte vlastný text:
otvorte aktuálny záznam v novej karte, porovnajte zmeny a preneste ich vedome.
Kontrola verzie chráni pred prepísaním cudzej práce.

## Farské oznamy

Pri tvorbe rozpisu vyberte **pondelok** týždňa. Upravujete sedem dní pondelok–nedeľa.
Verejný pohľad má osem dní nedeľa–nedeľa; predchádzajúca nedeľa patrí svojmu
vlastnému rozpisu. Nasledujúci publikovaný týždeň sa aktivuje **v sobotu o 20:00**
v časovom pásme Bratislava. Rozhoduje týždeň rozpisu, nie čas poslednej úpravy.

Šablóna kopíruje iba potvrdené pravidelné časy, miesta a označenia. Nekopíruje
úmysly, celebrantov, liturgiu ani milodary. Skontrolujte liturgiu každého dňa a
omše. Čas píšte ako `18:00`. Deň bez omše označte výslovne; chýbajúci rozpis je
iná situácia. Doplňte oznamy a prípadné milodary, skontrolujte náhľad a uložte.
Pri novom koncepte potom zapnite zverejnenie.

Rozpis možno pripraviť aj vložením textu alebo importom `.doc`, `.docx` či `.txt`
do 3 MB. Skontrolujte rozpoznané údaje, upozornenia a liturgické texty; importovaný
návrh treba výslovne použiť a uložiť. Import sám nič nezverejňuje.

Ak platný rozpis chýba, web môže zobraziť označené pravidelné časy bez domyslených
úmyslov či celebrantov. Ak nie sú potvrdené ani tie, nevymýšľa ich. Chyba databázy
sa zobrazuje ako dočasná nedostupnosť. Niektoré historické importované rozpisy sú
pre chyby v pôvodných dátach iba na čítanie; verejný archív rozpisov neexistuje.

## Výveska a články

Nové oznamy a pozvánky patria do **Vývesky**; magazínové články do **Naše
spoločenstvo**. Staré správy, udalosti a textové oznamy si zachovávajú svoje odkazy.
Vyplňte názov, dátum, perex a obsah. Dátum článku určuje zobrazenie a poradie,
nie časovač zverejnenia: zapnutie viditeľnosti zverejní aj článok s budúcim dátumom.
Pred prvým zverejnením skontrolujte URL; potom zostáva zachovaná aj pri zmene názvu.

Editor podporuje nadpisy, zvýraznenie, zoznamy, odkazy a obrázky. Ľubovoľné HTML
ani programový kód sa nevykonávajú. Pri plagáte vyberte celý čitateľný obrázok a
prípadný cieľ odkazu. Platnosť trvá vrátane zvoleného dňa v bratislavskom čase;
od nasledujúcej polnoci sa príspevok prestane zobrazovať medzi aktuálnymi oznamami.
Publikovaný detail môže zostať dostupný.

Pri migrácii sa jednorazovo zverejnili všetky staré magazínové články. Toto
rozhodnutie sa nevzťahuje na nové koncepty ani pôvodne nepublikované správy.

## Obrázky a spoločné údaje

Najprv hľadajte obrázok v knižnici. Nový nahrajte ako JPG, PNG, WebP, AVIF alebo
GIF do 10 MB. **Titulok** je viditeľný popis pri obrázku. Alternatívny text obrázka
sa v aktuálnom formulári odvodzuje od názvu článku alebo mena osoby; samostatné
pole na jeho úpravu tu nie je. Používajte preto výstižný názov a skontrolujte náhľad.

Ak po nahratí zlyhá dokončenie overenia, skúste zopakovať dokončenie; počas
päťminútového okna netreba posielať súbor znova. Po jeho uplynutí vyberte súbor
opäť. PDF sa cez túto knižnicu nenahrávajú. Odstránenie obrázka z článku nemaže
originál z Cloudinary, ktorý môže používať viac stránok.

Kontakty, kňazi, úradné hodiny, náuky, IBAN a QR kód sa upravujú v spoločných
nastaveniach. Pri zmene IBAN aktualizujte alebo odstráňte aj platobný QR kód.
**Uloženie nastavení zmení verejné údaje**; potom skontrolujte kontakt, pätu webu
a platobné údaje. Pravidelná šablóna omší zatiaľ nemá samostatný ovládací prvok
v tomto formulári; jej zmenu dohodnite s technickým správcom. Konkrétne týždenné
časy upravujte vo farských oznamoch.

## Stránky sviatostí a služieb

V sekcii **Stránky** sú šiesti sviatosti a služby vo farnosti (spevokol, zbor,
miništranti, lektori, akolyti). Pri stránke, ktorá sa ešte nikdy neupravovala,
je stav **Pôvodná verzia z kódu**. Tlačidlo **Začať upravovať** skopíruje
presne to, čo je dnes na webe, do súkromného konceptu.

Upraviť môžete fotku v hlavičke, nadpis, úvod, modrý pás s citátom, obsah,
bočný panel, kontaktnú osobu a telefóny, praktické údaje, odkazy a kroky
prípravy. Obsah tvoria **bloky**: textový blok (text, nadpisy, zoznamy, obrázky,
galérie) a blok kariet (nadpis, text, fotka, odkaz). Bloky pridáte tlačidlami
pod obsahom a šípkami ↑ ↓ zmeníte ich poradie. **Zbalený blok** sa na webe
zobrazí ako otázka, ktorú čitateľ otvorí kliknutím.

**Kým stránku nezverejníte, na webe ostáva pôvodná verzia.** Náhľad otvorí
poslednú uloženú verziu v plnom vzhľade webu. Po zverejnení sa každé ďalšie
uloženie hneď prejaví na webe, rovnako ako pri článkoch.

Každé uloženie sa zapíše do **Histórie** s menom a časom. Tlačidlo **Obnoviť**
vráti stránku do staršej verzie; najstaršia položka je pôvodná verzia z kódu.
Tlačidlo **Vrátiť web na pôvodnú verziu z kódu** stiahne úpravu z webu, ale
koncept aj história ostanú uložené.

**+ Pridať službu** a **+ Pridať sviatosť** vytvoria novú stránku. Zadajte názov;
adresa sa vytvorí z neho a po vytvorení sa nemení. Nová stránka sa po
zverejnení objaví na konci menu a medzi kartami na úvodnej stránke. Pre kartu
môžete vyplniť krátky popis. PDF sa nenahrávajú; odkážte ich napríklad z Google
Drive.

## Prístupy a podnety

Správca môže v **Prístupy** pridať alebo odobrať redaktora podľa presnej adresy
Google účtu. Pozvánka sa e-mailom neposiela. Odobratie platí aj pre už prihláseného
redaktora. Účty správcov sa menia v technickej konfigurácii Vercelu. Súkromné
**Podnety** od návštevníkov a správu prístupov vidia iba správcovia.

Po práci sa odhláste, najmä na zdieľanom počítači. Technickú chybu oznámte na
jurajbublinec@gmail.com spolu s časom a krokom; neposielajte heslá ani export databázy.

## Rozpisy lektorov

Prihlásenie do CMS zostáva cez Google. Správcovia sú naďalej určení existujúcou
konfiguráciou `ADMIN_EMAIL_ALLOWLIST`; ich účty nemožno v CMS upraviť ani odobrať.
V **Prístupy** môže správca pridať Google e-mail a vybrať **Redaktor** alebo
**Lektor / lektorka**, prípadne zmeniť rolu už pridaného účtu. Správcu nemožno
vytvoriť cez CMS. Zmena roly alebo odobratie platí aj pre už prihlásený účet.

Lektor/lektorka vidí iba **Rozpisy lektorov**. Vyberie PDF do 3 MB v paneli
aktuálneho alebo nasledujúceho mesiaca a stlačí **Nahrať PDF**. Čitatelia so
správnym heslom vidia iba aktuálny mesiac; rozpis pripravený dopredu sa
sprístupní od začiatku príslušného mesiaca podľa času v Bratislave. Predchádzajúci
mesiac sa od polnoci zobrazuje iba v súkromnom **Archíve rozpisov** až do ručného
odstránenia. Rozpis možno skontrolovať cez **Otvoriť PDF**, nahradiť alebo odstrániť.
Náhrada a odstránenie vyžadujú potvrdenie. Ak rozpis medzitým zmenil niekto iný,
obnovte zoznam a skontrolujte aktuálny súbor.

Spoločné heslo sa nastavuje výhradne serverovou premennou prostredia
`LECTOR_PASSCODE`, nie v CMS. Musí mať 8 až 128 znakov; medzery sa neodstraňujú.
Zmena serverovej hodnoty vyžaduje nové nasadenie. V novej konfigurácii sa
doterajšie prístupové tokeny neprijmú. Heslo nikdy nevkladajte do repozitára,
verejnej konfigurácie ani premennej s predponou `NEXT_PUBLIC_`.
Toto heslo slúži iba čitateľom PDF; nenahrádza Google prihlásenie do CMS.

Čitateľ otvorí **Rozpis lektorov** na stránke lektorov alebo vo footeri,
prípadne **Rozpis služieb lektorov** v mobilnom menu. Zadá heslo a vyberie
**Otvoriť PDF** alebo **Stiahnuť PDF**. Po zatvorení karty alebo obnovení stránky
heslo zadáva znova. Bez platného serverového hesla sa dokumenty neotvoria;
modal ponúkne odkaz na **Podnety a nápady**. Už stiahnutý súbor alebo skopírované
kontakty nemožno spätne odvolať.
Technické zmeny, lokálne overenie a migrácia sú v
[changelogu rozpisov lektorov](lector-schedules-changelog-2026-11-05.md).
