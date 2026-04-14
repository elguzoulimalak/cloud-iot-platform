<div align="center">
  <img src="./front/public/logo.png" alt="Cloud-IoT Logo" width="120" style="border-radius: 20px" onerror="this.style.display='none'"/>

# Cloud-IoT Edge Platform

  ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
  ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
  ![RabbitMQ](https://img.shields.io/badge/Rabbitmq-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)

</div>

---

Une plateforme complète basée sur des microservices pour la gestion, la surveillance et l'administration des objets connectés (IoT) et terminaux réseaux (End Devices). Le système exploite un réseau de brokers MQTT et des bases de données distribuées pour offrir une visibilité instantanée sur la santé de votre flotte système.

## 🌟 Fonctionnalités

- **🕹️ Dashboard Glassmorphism** : Interface utilisateur riche, moderne et réactive développée avec React (Vite).
- **📡 Télémétrie en Temps Réel** : Visualisation instantanée du CPU, de la RAM, et de l'Environnement via WebSocket et RabbitMQ.
- **🔒 Authentification Sécurisée** : Architecture de sécurité décentralisée avec des jetons JWT validés par un service de signature dédié (`Signing Service`).
- **🗄️ Orchestration Polyglotte** : Utilisation de PostgreSQL pour le stockage relationnel (Utilisateurs et Appareils) et MongoDB pour l'ingestion massive des données de télémétrie.
- **🐳 Déploiement Conteneurisé** : L'écosystème entier (7+ conteneurs) s'active en une seule commande grâce à `docker-compose`.

## 🏗️ Architecture des Microservices

Le backend de l'application est découpé de manière granulaire :

- `API Gateway` (Nginx) : Point d'entrée unique et de reverse-proxy.
- `Signing Service` (FastAPI + Postgres) : Emission et vérification des JWT.
- `Device Management` (FastAPI + Postgres + Redis) : Gestion CRUD des appareils, mise en cache avec Redis.
- `Monitoring Service` (FastAPI + MongoDB + Socket.IO) : Ingestion des messages MQTT et diffusion WebSockets aux clients web.
- `Simulation Engine` (Python) : Service autonome générant un trafic de télémétrie continu testant la résistance du système.

## 🚀 Démarrer le projet

### Pré-requis

- [Docker &amp; Docker Compose](https://www.docker.com/) installés.
- [Node.js](https://nodejs.org/) (Version LTS).

### 1. Démarrer l'infrastructure et le Backend

Naviguez à la racine du projet et montez les conteneurs :

```bash
docker-compose up --build
```

> *Cette commande démarre Nginx, les microservices FastAPI, RabbitMQ, PostgreSQL, Redis, MongoDB ainsi que le moteur de simulation.*

### 2. Démarrer le Frontend

Dans un nouveau terminal, lancez le client React :

```bash
cd front
npm install
npm run dev
```

Accédez à votre tableau de bord via : **http://localhost:5173**
*(Les appels APIs seront automatiquement redirigés vers la passerelle sur le port `8080`)*.

---

*Conçu et développé dans le cadre d'une architecture orientée événements.*
