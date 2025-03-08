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
