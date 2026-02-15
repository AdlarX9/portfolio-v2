#!/bin/bash

# 1. Vérification de sécurité : est-ce que NPM est là ?
if ! command -v npm &> /dev/null
then
    echo "❌ Erreur : Node.js/NPM n'est pas installé."
    exit 1
fi

echo "🎨 Démarrage du formatage..."

# 2. La commande magique
# npx prettier : lance l'outil
# --write : écrase les fichiers avec la version formatée (sinon il affiche juste le résultat)
# "**/*.{html,css,js}" : cherche récursivement dans tous les dossiers
# --ignore-path .gitignore : respecte ton .gitignore (pour ne pas formater node_modules !)
npx prettier --write "*.html" "src/**/*.{html,css,js}" --ignore-path .gitignore

echo "✅ Terminé ! Tous les fichiers HTML, CSS et JS sont formatés."
