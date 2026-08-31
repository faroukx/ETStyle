# Politique de confidentialité — ETStyle

Dernière mise à jour : 30 août 2026

ETStyle est une extension de navigateur qui personnalise l'interface du portail étudiant (portail.etsmtl.ca) et de SignETS (signets-ens.etsmtl.ca), les deux sites de l'École de technologie supérieure (ÉTS).

## Données traitées

ETStyle ne collecte, ne transmet et ne vend aucune donnée. Tout se passe localement, dans le navigateur :

- Les préférences d'affichage (thème, couleur d'accent, police, options d'interface) sont enregistrées dans le stockage local du navigateur (`localStorage`).
- Ces mêmes préférences sont synchronisées entre le portail et SignETS via `chrome.storage.sync`, la fonction native de synchronisation de Chrome liée au compte Google de l'utilisateur. ETStyle n'y accède que pour lire et écrire ces préférences ; les données restent dans l'écosystème Chrome de l'utilisateur.
- Les notes, cotes et autres informations académiques affichées par l'extension proviennent des pages de l'ÉTS déjà ouvertes dans l'onglet actif. Elles sont lues et affichées à l'écran, jamais enregistrées ni transmises ailleurs.

## Serveurs contactés

ETStyle ne communique avec aucun serveur autre que ceux de l'ÉTS déjà utilisés par les pages elles-mêmes — par exemple pour récupérer l'historique multi-programme sur la page « Évolution de votre cote » de SignETS. Aucune requête n'est envoyée vers un serveur appartenant au développeur ou à un tiers.

## Bibliothèques incluses

L'extension embarque Chart.js et chartjs-plugin-annotation (licence MIT) directement dans son paquet. Aucun script n'est chargé depuis un serveur externe au moment de l'exécution.

## Contact

Pour toute question sur cette politique, ouvrez une issue sur le dépôt du projet : https://github.com/faroukx/ETStyle
