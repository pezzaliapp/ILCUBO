#!/usr/bin/env bash
#
# build.sh — genera deploy/ilcubo.bundle.min.js
#
# Concatena i moduli applicativi (customize + gamemodes + qol) nell'ordine
# corretto, li minifica e li offusca, poi antepone il prelude di protezione
# (che resta leggibile, perché contiene l'avviso di copyright).
#
# Requisiti: node + npx (terser e javascript-obfuscator scaricati al volo).
#
# Uso:   bash build.sh
#
set -euo pipefail
cd "$(dirname "$0")"

OUT="../deploy/ilcubo.bundle.min.js"
TMPDIR_B="$(mktemp -d)"
TMP_APP="$TMPDIR_B/app.js"
TMP_APP_OBF="$TMPDIR_B/app.obf.js"
TMP_PRELUDE="$TMPDIR_B/prelude.min.js"

echo "→ Concateno i moduli (ordine: customize → gamemodes → qol)…"
cat customize.js gamemodes.js qol.js > "$TMP_APP"

echo "→ Offusco i moduli applicativi…"
npx javascript-obfuscator "$TMP_APP" --output "$TMP_APP_OBF" \
  --compact true \
  --control-flow-flattening false \
  --dead-code-injection false \
  --rename-globals false \
  --rename-properties false \
  --self-defending false \
  --string-array true \
  --string-array-threshold 0.75 \
  --string-array-encoding base64 \
  --split-strings false \
  --identifier-names-generator hexadecimal \
  --transform-object-keys false \
  --unicode-escape-sequence false

echo "→ Minifico il prelude di protezione (mantengo il banner)…"
npx terser _prelude.js --compress --mangle --comments '/©/' --output "$TMP_PRELUDE"

echo "→ Assemblo il bundle finale…"
{
  echo '/*! © 2016–2026 Alessandro Pezzali — ILCUBO. Tutti i diritti riservati. Codice protetto. */'
  cat "$TMP_PRELUDE"
  echo ''
  cat "$TMP_APP_OBF"
} > "$OUT"

rm -rf "$TMPDIR_B"

node --check "$OUT" && echo "✓ Bundle valido: $OUT"
echo "✓ Dimensione: $(wc -c < "$OUT") byte"
