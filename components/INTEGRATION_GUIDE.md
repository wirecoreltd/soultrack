# 📋 Intégration PresenceDot dans ListMembers.jsx

## 1. Copier le fichier
Placer `PresenceDot.jsx` dans :
  → `components/PresenceDot.jsx`

## 2. Ajouter l'import en haut de ListMembers.jsx
Après les autres imports, ajouter :

```js
import PresenceDot from "../../components/PresenceDot";
```

## 3. Dans renderMemberCard — ajouter le rond à côté du nom

Remplacer ce bloc :
```jsx
<h2 className="text-base font-bold text-center flex items-center justify-center gap-1">
  <span>
    {m.prenom} {m.nom}
  </span>
  {m.star === true &&
    m.etat_contact?.trim().toLowerCase() === "existant" && (
      <span className="text-yellow-400">⭐</span>
    )}
</h2>
```

Par :
```jsx
<h2 className="text-base font-bold text-center flex items-center justify-center gap-2">
  <span>
    {m.prenom} {m.nom}
  </span>
  {m.star === true &&
    m.etat_contact?.trim().toLowerCase() === "existant" && (
      <span className="text-yellow-400">⭐</span>
    )}
  <PresenceDot
    memberId={m.id}
    egliseId={userProfile?.eglise_id}
  />
</h2>
```

## C'est tout ! ✅
Le composant gère lui-même :
- Le chargement des données Supabase
- Le calcul de la couleur (vert/jaune/orange/rouge/gris)
- Le popup avec la liste des cultes du mois
