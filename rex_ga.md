# 06/01/26

## Onboarding

- Etape 1 : Seulement séduction (donc skip étape 1)
- Etape 2 : Remove "Empathique" de l'étape 2 (faire le nice guy ça marche pas 😈)
- Etapes 3 et 4 : C'est vrai ou "fake it until you make it" (confidentialité et notifs) ?

## Paywall

- 🚨 Bug `failed to get offerings: Error: There is no singleton instan...`

## UI Conversation

- L'input de texte disparait quand le clavier est ouvert
- 1e conversation -> J'ai upload un screenshot + une ligne de contexte -> loading -> rien -> j'ai du ouvrir le menu des conversations et cliquer sur la conv pour voir la réponse de l'IA (la 2e conversation a fonctionné correctement)
- Ce serait cool de pouvoir cliquer sur le screenshot pour l'ouvrir (dans l'input ET dans la conv)
- Quand l'IA pose plusieurs questions, on devrait pouvoir sélectionner toutes les réponses avant l'envoi (là ça envoie dès le clic sur la réponse à la 1e question)
- Ajouter la date et heure actuelle dans le preprompt (l'IA me les demande pour connaitre le temps écoulé depuis le dernier message)
- Normal que seule la première réponse de l'IA ait un formatage custom ?
- La nouvelle conversation n'apparait dans le menu conversations qu'une fois qu'elle a été fermée -> elle devrait apparaitre dès qu'elle est créée IMO
- 🚨 Bug `[CoachStorage] Failed to load threads: Error: Row too big...`
- Le bouton pour envoyer n'est pas cliquable lorsque je mets juste un screen (demandé par l'IA), il devrait être cliquable si je mets un screen OU un texte

## IA

- l'IA a encore cru que mon dernier message est celui de la femme alors que c'est le mien => bien préciser dans le prompt que les messages de l'utilisateur sont à droite en vert alors que ceux de la femme sont à gauche en gris ? (whatsapp uniquement 😬)
- l'IA propose des messages avec un vocabulaire trop soutenu ("quelle date te SIED le mieux ?" 😂)
- l'IA est pas assez directive (on demande pas, on propose avec assurance !)
- l'IA fait pas mal de fautes d'accord ("le femme", "la message"...) -> c'est un petit modèle ?

## Historique

- Doublon avec le menu dans l'onglet coach non ? Et rien n'y apparait

## Communauté

On verra plus tard

## Profil

On verra plus tard

---

# 07/01/26

## UI Conversation

- Afficher un loading pendant l'upload des images (sinon on croit que ça a buggé)
- Masquer le message de l'input dès l'envoi (actuellement le message reste jusqu'à la fin du chargement)
- Seule la 1e réponse de l'IA est correctement formatée, les autres devraient l'être aussi

## IA

- Comprend toujours mal qui parle quand
- Donner la date au modèle (il croit qu'on est en 2023)
- Hallucinations (invente des refs qui n'existent pas dans la conv)

=> Split le problème en 3 étapes :
1. Parser correctement la conv (testable en donnant les screens des conv dont on a le transcript et en checkant le parsing de l'IA)
2. Analyser correctement la situation (dynamique, relances contextuelles possibles...)
3. Proposer des messages
