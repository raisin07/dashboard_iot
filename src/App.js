import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import ReactPaginate from "react-paginate";
import mqtt from "mqtt"; // 🚀 Import de MQTT
import "chartjs-adapter-date-fns";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

// 📍 **Coordonnées précises de la mine**
const CAMPUS_CYBER = [48.896742, 2.233377];

// 🔴 **Icône de la mine active**
const mineIconActive = new L.Icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// 💥 **Icône de la mine explosée**
const mineIconExploded = new L.Icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5f/BlackDot.svg",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// **🔴 Seuil de détection d'explosion**
const EXPLOSION_THRESHOLD = 2;
const MAX_DATA_POINTS = 500; // 📊 Historique max des points affichés
const ITEMS_PER_PAGE = 10; // 📄 Nombre d'éléments par page

const Dashboard = () => {
  const [data, setData] = useState([]); // 📡 Historique des données reçues
  const [status, setStatus] = useState("Active"); // ✅ État de la mine
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const options = {
      clientId: "dashboard-client-" + Math.random().toString(16).substr(2, 8),
      reconnectPeriod: 5000, // 🔄 Reconnexion automatique toutes les 5s
    };

    // ✅ **Connexion à Mosquitto WebSocket**
    const client = mqtt.connect("wss://test.mosquitto.org:8081/mqtt", options);

    client.on("connect", () => {
      console.log("✅ Connecté au broker Mosquitto !");
      client.subscribe("helium/6081F9D8CF9CEC95/rx", (err) => {
        if (!err) {
          console.log("📡 Abonné au topic !");
        } else {
          console.error("❌ Erreur d'abonnement :", err);
        }
      });
    });

    client.on("error", (err) => {
      console.error("❌ Erreur MQTT :", err);
    });

    client.on("close", () => {
      console.warn("⚠️ Connexion fermée !");
    });

    client.on("message", (topic, message) => {
      console.log(`📩 Message reçu sur ${topic}:`, message.toString());
      try {
        const parsedMessage = JSON.parse(message.toString());

        // 🔥 **Détection d'explosion et réinitialisation**
        const isExploded =
          Math.abs(parsedMessage.ax) > EXPLOSION_THRESHOLD ||
          Math.abs(parsedMessage.ay) > EXPLOSION_THRESHOLD ||
          Math.abs(parsedMessage.az) > EXPLOSION_THRESHOLD;

        setStatus(isExploded ? "Explosée" : "Active"); // ✅ **Mise à jour immédiate de l'état**

        setData((prevData) => {
          const updatedData = [...prevData, parsedMessage]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // 🕒 Trie des données par timestamp
            .slice(-MAX_DATA_POINTS); // 🔄 Conservation de l’historique

          return updatedData;
        });

        // 🔄 **Met à jour la page pour afficher les nouvelles données**
        setCurrentPage(0);

      } catch (error) {
        console.error("❌ Erreur de parsing du message :", error);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  // 📌 **Gestion de la pagination**
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentPageData = data.slice(offset, offset + ITEMS_PER_PAGE);
  const pageCount = Math.ceil(data.length / ITEMS_PER_PAGE);

  // 📊 **Données du graphique**
  const chartData = {
    labels: data.map((d) => d.timestamp),
    datasets: [
      {
        label: "Vibration (mg)",
        data: data.map((d) => d.vibration),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      zoom: {
        pan: { enabled: true, mode: "x" },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute",
          displayFormats: { second: "HH:mm:ss", minute: "HH:mm", hour: "HH:mm" },
        },
        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 10 },
        title: { display: true, text: "Temps" },
      },
      y: { title: { display: true, text: "Vibration (mg)" } },
    },
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard LoRaWAN - Mine</h2>
      <div className="status-container">
        <span>État de la mine :</span>
        <span className={`status ${status === "Active" ? "active" : "exploded"}`}>{status}</span>
      </div>

      {/* 🌍 **Carte avec localisation de la mine** */}
      <MapContainer center={CAMPUS_CYBER} zoom={18} className="map-container">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={CAMPUS_CYBER} icon={status === "Active" ? mineIconActive : mineIconExploded}>
          <Popup>{status === "Active" ? "⚠️ Mine active ⚠️" : "💥 Mine explosée ! 💥"}</Popup>
        </Marker>
      </MapContainer>

      <div className="chart-container small-chart">
        <h3>Vibrations détectées</h3>
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="table-container">
        <h3>Derniers événements</h3>
        <table>
          <thead>
            <tr>
              <th>Heure</th>
              <th>Vibration (mg)</th>
              <th>AX</th>
              <th>AY</th>
              <th>AZ</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((d, index) => (
              <tr key={index}>
                <td>{new Date(d.timestamp).toLocaleTimeString()}</td>
                <td>{d.vibration.toFixed(2)}</td>
                <td>{d.ax.toFixed(2)}</td>
                <td>{d.ay.toFixed(2)}</td>
                <td>{d.az.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReactPaginate
  previousLabel={"← Précédent"}
  nextLabel={"Suivant →"}
  breakLabel={"..."}
  pageCount={pageCount}
  marginPagesDisplayed={1}
  pageRangeDisplayed={3}
  onPageChange={handlePageClick}
  containerClassName={"pagination-container"}
  pageClassName={"page-item"}
  pageLinkClassName={"page-link"}
  previousClassName={"page-button"}
  nextClassName={"page-button"}
  activeClassName={"active"}
  disabledClassName={"disabled"}
/>

    </div>
  );
};

export default Dashboard;
