# 📌 Dashboard LoRaWAN - Mine (Projet Scolaire)

⚠️ **Avertissement : Ce projet est réalisé dans un cadre académique.**
Ce repository est dédié au développement d'un **dashboard de monitoring** permettant de suivre différentes données relatives à une mine utilisant **LoRaWAN**. **Aucune utilisation réelle ou malveillante n'est prévue.**

---

## 🎯 **Objectif du projet**
Ce projet vise à développer une interface permettant de **collecter, visualiser et analyser** les données transmises par des capteurs placés sur une zone de détection. Ces capteurs utilisent **LoRaWAN** pour transmettre les informations en temps réel.

## 📡 **Données surveillées**
Le système collecte et affiche les informations suivantes :

- **📍 Position** : Localisation de la mine
- **⏳ Horodotage** : Date et heure des événements
- **📢 Identifiant** : ID unique de l'événement
- **📊 Vibrations** : Mesure des vibrations du sol (**gyroscope et accéléromètre**)
- **🚨 Cause de l'événement** : Type de déclenchement (**Qui ? Quoi ?**)
- **⚠️ État de la mine** : Actif / Inactif / Alerte

## 🛠️ **Technologies utilisées**
- **Capteurs** : Gyroscope et accéléromètre 📡
- **Frontend** : React.js (avec Chart.js, Leaflet, et React-Paginate)
- **Backend** (à venir) : API pour centraliser les données
- **Base de données** (à venir) : Stockage des événements
- **LoRaWAN** : Protocole de transmission des données
- **MQTT** : Communication des capteurs vers la plateforme

## 📌 **Fonctionnalités principales**
✅ Visualisation des **données en temps réel** 📊
✅ **Carte interactive** avec localisation de la mine 🗺️
✅ **Graphiques dynamiques** pour l’analyse des vibrations 📈
✅ **Pagination des événements** pour une meilleure navigation 📑
✅ **Zoom et pan** sur les graphiques pour explorer les données 🔍

## 🔁 **Exemples de données à envoyer via MQTT**
Pour tester le dashboard, vous pouvez publier des messages sur le topic MQTT `capteurs` avec les formats suivants :

### 🌀 Capteur gyroscope
```json
{
  "capteurId": "capteur-gyroscope",
  "timestamp": "2025-03-27T10:15:00Z",
  "vibration": 1.8,
  "ax": 0.5,
  "ay": -0.3,
  "az": 0.2
}
```

### 🔊 Capteur son
```json
{
  "capteurId": "capteur-son",
  "timestamp": "2025-03-27T10:16:00Z",
  "categorie": "Coup de feu",
  "decibels": 92.5
}
```

### 💡 Capteur lumière
```json
{
  "capteurId": "capteur-lumiere",
  "timestamp": "2025-03-27T10:17:00Z",
  "lux": 630
}
```

Ces messages doivent être envoyés au format JSON via MQTT sur le topic `capteurs`. Ils seront automatiquement affichés dans les tableaux correspondants du dashboard.

## 🚀 **Installation et exécution**
### 📥 **Cloner le repository**
```sh
 git clone https://github.com/TonNomGitHub/dashboard-lorawan.git
 cd dashboard-lorawan
```
### 📦 **Installer les dépendances**
```sh
 npm install
```
### ▶️ **Lancer l'application**
```sh
 npm start
```
L'application sera disponible sur **http://localhost:3000** 🚀

## 📌 **Mise en garde et responsabilités**
🔴 **Ce projet est uniquement destiné à un usage académique et pédagogique.**
🔴 **Aucune donnée sensible ou réelle n'est impliquée dans ce système.**
🔴 **Toute utilisation en dehors du cadre scolaire est sous la responsabilité de l'utilisateur.**

---

🚀 **Projet réalisé dans le cadre d'une formation en cybersécurité et IoT.**
