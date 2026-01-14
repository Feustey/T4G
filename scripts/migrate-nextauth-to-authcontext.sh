#!/bin/bash

# Script de migration next-auth → AuthContext
# Migre les 18 fichiers libs qui utilisent encore next-auth

set -euo pipefail

echo "🔄 Migration next-auth → AuthContext"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Trouver tous les fichiers utilisant next-auth
FILES=$(grep -rl "from ['\"]next-auth/react['\"]" libs/ 2>/dev/null | grep -v node_modules || true)

if [ -z "$FILES" ]; then
    echo "✅ Aucun fichier à migrer - Migration déjà complète!"
    exit 0
fi

COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo "📝 $COUNT fichiers à migrer"
echo ""

MIGRATED=0

for file in $FILES; do
    echo "Migration: $file"
    
    # Créer un backup
    cp "$file" "$file.backup"
    
    # Remplacer les imports next-auth par AuthContext
    # Pattern 1: import { signOut } from 'next-auth/react'
    sed -i '' "s/import { signOut } from ['\"]next-auth\/react['\"]/import { useAuth } from '@\/contexts\/AuthContext'/g" "$file"
    
    # Pattern 2: import { useSession } from 'next-auth/react'
    sed -i '' "s/import { useSession } from ['\"]next-auth\/react['\"]/import { useAuth } from '@\/contexts\/AuthContext'/g" "$file"
    
    # Pattern 3: import { useSession, signOut } from 'next-auth/react'
    sed -i '' "s/import { useSession, signOut } from ['\"]next-auth\/react['\"]/import { useAuth } from '@\/contexts\/AuthContext'/g" "$file"
    sed -i '' "s/import { signOut, useSession } from ['\"]next-auth\/react['\"]/import { useAuth } from '@\/contexts\/AuthContext'/g" "$file"
    
    # Pattern 4: import { getSession } from 'next-auth/react'
    sed -i '' "s/import { getSession } from ['\"]next-auth\/react['\"]/import { useAuth } from '@\/contexts\/AuthContext'/g" "$file"
    
    # Vérifier s'il reste des imports next-auth
    if grep -q "next-auth/react" "$file"; then
        echo "  ⚠️  Import next-auth toujours présent - vérification manuelle requise"
    else
        echo "  ✅ Imports migrés"
        MIGRATED=$((MIGRATED + 1))
        rm "$file.backup"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Migration terminée: $MIGRATED/$COUNT fichiers"
echo ""
echo "⚠️  Note: Les usages de useSession() et signOut() doivent être"
echo "   mis à jour manuellement pour utiliser useAuth()."
echo ""
echo "Exemple:"
echo "  const { data: session } = useSession()  →  const { user, isAuthenticated } = useAuth()"
echo "  signOut()  →  logout()"
echo ""

# Vérifier s'il reste des fichiers avec next-auth
REMAINING=$(grep -rl "next-auth/react" libs/ 2>/dev/null | grep -v node_modules | grep -v ".backup" || true)

if [ -n "$REMAINING" ]; then
    echo "⚠️  Fichiers nécessitant vérification manuelle:"
    echo "$REMAINING"
else
    echo "🎉 Tous les imports next-auth ont été migrés!"
fi


