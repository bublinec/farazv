# Rozpisy lektorov — changelog a lokálne overenie

Práce začali 4. novembra 2026 a pokračovali 5. novembra 2026.
Určené výhradne pre vetvu `filip/upravy`, na následné lokálne overenie
s Jurajom. Bez zlúčenia do `main`, nasadenia alebo produkčnej migrácie.

## Čo pribudlo

- Tlačidlo **Rozpis lektorov** v existujúcom kontaktnom paneli na
  `/spolocenstva/lektori`, pred odkazom na všetky kontakty. Ostatné podstránky
  toto tlačidlo nemajú. Nový dialóg podporuje klávesnicu, čítačku obrazovky,
  zobrazenie hesla a ovládacie prvky s výškou najmenej 44 px.
- Súkromný mesačný PDF rozpis pre aktuálny a nasledujúci mesiac podľa času
  Bratislavy, aj cez prechod roka. Nasledujúci mesiac možno sprístupniť vopred.
  Dostupné je otvorenie alebo stiahnutie. Staršie mesiace sa čitateľom nevydávajú.
- `/admin/lektori`: nahratie PDF do 3 MB, kontrolné otvorenie, náhrada,
  odstránenie a stránkovaná súkromná história. Náhrada kontroluje verziu;
  odstránenie uchová číslo verzie, aby staré okno neprepísalo novší súbor.
- Rola `lektorka`, zobrazená ako **Lektor / lektorka**, pre účty pridané cez CMS.
  Vidí iba rozpisy a ostatné CMS API ju odmietajú aj pri priamej požiadavke.
- Výber **Redaktor** alebo **Lektor / lektorka** v existujúcej sekcii Prístupy.
  Správcovia naďalej pochádzajú výhradne z existujúcej env konfigurácie
  `ADMIN_EMAIL_ALLOWLIST`. CMS ich nemôže vytvoriť, zmeniť alebo odobrať.
  Zmeny grantov zaznamenávajú aktéra, čas a predchádzajúcu/novú rolu.
- Samostatný súkromný panel hesla v Nastaveniach iba pre správcu.
  Heslo sa zadáva raz, minimum je 8 znakov, maximum 128. Ukladá sa iba
  solený scrypt hash. Existujúce heslo sa nevracia ani nezobrazuje.

## Ako je chránené PDF

PDF je uložené ako súkromné databázové bajty, nie ako verejné médium alebo URL
v Cloudinary. Verejný obsah a nastavenia neobsahujú súbor, hash hesla ani token.
Server overuje prístup pri zozname mesiacov aj pri každom vydaní PDF.

Po správnom hesle vznikne náhodný token s maximálnou platnosťou 12 hodín.
Databáza uchováva iba jeho hash. Prehliadač ho drží iba v pamäti aktuálnej
podstránky, bez cookie, URL parametra alebo browser storage. Zatvorenie karty,
obnovenie, návrat cez cache prehliadača alebo odchod z podstránky vyžaduje nové
heslo. Zatvorenie samotného dialógu v tej istej podstránke odomknutie zachová.

Zmena hesla zneplatní staré tokeny. Zámok databázového riadka chráni aj súbeh
zmeny hesla s práve dokončeným overením starého hesla. Pokusy sa obmedzujú
atomicky v databáze: najviac 10 overení za 15-minútové okno z jednej adresy
plus spoločný rozpočet 300. Surové adresy ani heslá sa nelogujú. PDF aj chyby
používajú `private, no-store` a `noindex, nofollow`; token sa prenáša iba
v hlavičke autorizácie. Upload počíta skutočne prijaté bajty a kontroluje PDF
hlavičku aj ukončenie. Samotná prípona alebo MIME od klienta nestačí.

Oprávnene otvorené alebo stiahnuté PDF sa nedá spätne vymazať z cudzieho
zariadenia a jeho ďalšiemu zdieľaniu nemožno technicky zabrániť.

## Kde sa zmeny nachádzajú

| Oblasť                       | Súbory                                                                                                                                       |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Zmluvy a mesiace             | `src/content/lector-schedules.ts`, `src/lib/lector-schedules.ts`                                                                             |
| Súkromné súbory a verzie     | `src/server/lector-store.ts`, `lector-validation.ts`                                                                                         |
| Heslo, tokeny, limity a HTTP | `src/server/lector-access.ts`, `lector-crypto.ts`, `lector-http.ts`                                                                          |
| Databáza                     | `src/server/db/schema.ts`, `drizzle/0005_lector_schedules.sql` a súvisiace metadáta                                                          |
| Roly a autorizácia           | `src/content/editor-access.ts`, `src/lib/auth-policy.ts`, `src/server/auth.ts`, `editor-access.ts`                                           |
| CMS                          | `src/app/admin/lektori/`, `src/components/admin/LectorSchedules*`, `LectorPassword.tsx`, existujúce Prístupy, Nastavenia, layout a navigácia |
| API                          | `src/app/api/admin/lectors/`, `src/app/api/lectors/`, existujúce API prístupov                                                               |
| Verejný dialóg               | `src/components/lectors/`, cielené rozšírenie `CommunityAside.tsx` a `OfficeAside.tsx`                                                       |
| Testy                        | `tests/lector-*.test.ts`, `tests/lectors.integration.test.ts`, `tests/browser/lectors.spec.ts`, `lector-admin.spec.ts`                       |
| Spustenie testov             | `scripts/test-lectors.ts`, rozšírený `scripts/test-admin.ts`, npm skript `test:lectors` a existujúce CI                                      |

## Čo sa neodoberalo ani nemenilo

Google prihlásenie, env e-maily správcov, existujúce obsahové zmluvy,
publikovanie oznamov a článkov, fotografie, kontakty a pôvodné texty zostávajú.
Archív `old/` nebol upravovaný. Nevytvára sa prístup do GitHub repozitára.
Žiadny existujúci účet ani produkčný rozpis nebol cez tieto práce zmenený.

## Migrácia a lokálne overenie s Jurajom

Nová migrácia pridáva rolu k existujúcim grantom s predvolenou hodnotou
`editor` a päť súkromných tabuliek: audit grantov, rozpisy, heslo, prístupové
tokeny a počítadlá pokusov. Existujúce env oprávnenia zostávajú nezmenené.
Nie sú potrebné nové env premenné ani poskytovateľ uploadov.

Na ručné overenie použite oddelenú lokálnu PostgreSQL databázu a existujúci
postup pre Google prihlásenie z [prevádzkového návodu](operations.md).
Pred `npm run db:migrate` overte, že `DATABASE_URL` označuje túto lokálnu
skúšobnú databázu. Na produkciu migrácia v tejto úlohe nebola aplikovaná.
Následne správca cez CMS pridá testovací Google účet s rolou lektora,
nastaví heslo a lektor nahrá PDF pre oba mesiace.

Automatické kontroly používajú Node z `.nvmrc`, koreňový lockfile a
`TEST_POSTGRES_URL` na loopback PostgreSQL s právom vytvárať databázy.
Testovacie skripty vytvoria a odstránia vlastné jednorazové databázy.

```sh
npm run check
npm run build
npm run test:lectors
npm run test:integration
npm run test:admin
```

Pri návrate k starému buildu, ktorý ešte nerozlišuje roly grantov, najprv
odoberte účty lektorov. Starý kód každý aktívny databázový grant považuje
za redaktora. Súkromné tabuľky ani súbory nie je potrebné kvôli návratu mazať.
Zálohy po lokálnom zavedení obsahujú aj súkromné PDF a hash spoločného hesla.

## Záznam overenia

Aktuálne dátované výsledky a hranice overenia sú zaznamenané v
[projektovom pláne](remake/plan.md#verification-record). Tento changelog
opisuje správanie a vlastníkov zmien; nepredstavuje súhlas s nasadením.
