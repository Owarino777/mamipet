# Vérification navigateur du blog

Le scénario utilise Chrome headless via CDP (aucune extension ni dépendance navigateur ajoutée). Les données sont fictives, en mémoire, et ne sortent pas de la machine. Ne pas utiliser ce serveur de fixture pour un déploiement.

Dans trois terminaux PowerShell séparés depuis la racine :

```powershell
node scripts/qa-blog-fixture.mjs
```

```powershell
$env:NEXT_PUBLIC_SUPABASE_URL='http://127.0.0.1:54329'
$env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='qa-public-key'
$env:NEXT_PUBLIC_APP_URL='http://localhost:3100'
$env:MAMIPET_QA_DIST_DIR='.next-qa'
npm.cmd run dev -- --port 3100
```

```powershell
$qaBrowserProfile = Join-Path $env:TEMP 'mamipet-blog-qa-chrome'
Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList @('--headless=new','--remote-debugging-port=9224',('--user-data-dir=' + $qaBrowserProfile),'about:blank') -WindowStyle Hidden
node scripts/qa-blog-browser.mjs
```

Le cache `.next-qa` permet de garder le serveur dev habituel ouvert. Fermer les terminaux QA ensuite pour ne pas conserver les variables de fixture ; `.env.local` ne change pas. Fermer uniquement l’instance Chrome dédiée une fois terminé.

Le scénario vérifie la redirection anonyme, le refus API 401, la rédaction, l’enregistrement, l’aperçu, la publication, les balises SEO, le sitemap, la confidentialité des corrections et le retrait. Il mesure les débordements à 390 et 1440 pixels et écrit les captures dans `.qa-artifacts/` (ignoré par Git).

Limites : ce transport simulé ne valide pas Supabase Auth, Storage, les permissions distantes ni les emails. Les politiques SQL sont vérifiées séparément par `npm test`. Les captures sont à relire visuellement ; les mesures ne certifient pas une conformité WCAG complète. Compléter la recette réelle par clavier/lecteur d’écran, upload de couverture et récupération de mot de passe.

Le scénario ouvre aussi la recherche après la mise à jour de MapLibre. Dans l’environnement headless utilisé, la carte affiche son état de secours : la navigation et la liste fonctionnent, mais le chargement réel WebGL/des tuiles reste à contrôler dans Chrome habituel.
