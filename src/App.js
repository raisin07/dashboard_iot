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

// Icône personnalisée pour la mine
const mineIcon = new L.Icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const Dashboard = () => {
  const [data, setData] = useState([]); // Stocke les données reçues
  const [status, setStatus] = useState("Active");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const position = [48.896742, 2.233377]; // Bâtiment Satellite, Campus Cyber
  const maxDataPoints = 500; // Max historique de points

  useEffect(() => {
    const options = {
      clientId: "dashboard-client-" + Math.random().toString(16).substr(2, 8),
      reconnectPeriod: 5000, // Reconnexion toutes les 5s
    };

    // ✅ Utilisation du broker Mosquitto WebSocket
    const client = mqtt.connect("wss://test.mosquitto.org:8081/mqtt", options);

    client.on("connect", () => {
      console.log("✅ Connecté au broker public Mosquitto !");
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

        setData((prevData) => {
          const updatedData = [...prevData, parsedMessage]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // 🔹 Trie par timestamp
            .slice(-maxDataPoints); // 🔹 Limite la taille de l'historique

          return updatedData;
        });
      } catch (error) {
        console.error("❌ Erreur de parsing du message :", error);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  // 📌 Gestion de la pagination
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = data.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(data.length / itemsPerPage);

  // 📊 Données du graphique
  const chartData = {
    labels: data.map((d) => d.timestamp), // 🔹 Utilisation de toutes les données (sans dataReductionFactor)
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
        <span className={`status ${status === "Active" ? "active" : "inactive"}`}>{status}</span>
      </div>
      <MapContainer center={position} zoom={13} className="map-container">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position} icon={mineIcon}>
          <Popup>⚠️ Localisation de la mine ⚠️</Popup>
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
        <div className="pagination-container">
          <ReactPaginate
            previousLabel={"← Précédent"}
            nextLabel={"Suivant →"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            activeClassName={"active"}
            previousClassName={"page-button"}
            nextClassName={"page-button"}
            disabledClassName={"disabled"}
            breakClassName={"page-button"}
            pageClassName={"page-button"}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
