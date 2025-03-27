import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import ReactPaginate from "react-paginate";
import mqtt from "mqtt";

const CAMPUS_CYBER = [48.886528, 2.249308];

const mineIconActive = new L.Icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const mineIconExploded = new L.Icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const EXPLOSION_THRESHOLD = 2;
const MAX_DATA_POINTS = 500;
const ITEMS_PER_PAGE = 10;

const Dashboard = () => {
  const [capteursData, setCapteursData] = useState({
    "capteur-son": [],
    "capteur-lumiere": [],
    "capteur-gyroscope": []
  });
  const [status, setStatus] = useState("Active");
  const [currentPage, setCurrentPage] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const options = {
      clientId: "dashboard-client-" + Math.random().toString(16).substr(2, 8),
      username: "quentin",
      password: "Quentin123",
      reconnectPeriod: 5000,
      clean: true,
      connectTimeout: 4000,
      keepalive: 60,
      protocolVersion: 4,
    };

    const client = mqtt.connect("wss://olivehoney-vl70wf.a01.euc1.aws.hivemq.cloud:8884/mqtt", options);

    const topic = "capteurs";

    client.on("connect", () => {
      console.log("✅ HiveMQ connecté !");
      client.subscribe(topic, (err) => {
        if (!err) {
          console.log("📡 Abonné à", topic);
        } else {
          console.error("❌ Erreur d'abonnement :", err);
        }
      });
    });

    client.on("error", (err) => console.error("❌ Erreur MQTT :", err));
    client.on("close", () => console.warn("⚠️ Connexion MQTT fermée."));

    client.on("message", (topic, message) => {
      const raw = message.toString();
      setLogs((prevLogs) => [
        ...prevLogs.slice(-99),
        `=== ${topic} ===`,
        `[${new Date().toLocaleTimeString()}] ${raw}`,
        ""
      ]);

      try {
        const parsed = JSON.parse(raw);
        const { capteurId, timestamp } = parsed;

        if (!capteurId || !timestamp) return;

        const isExploded =
          Math.abs(parsed.ax || 0) > EXPLOSION_THRESHOLD ||
          Math.abs(parsed.ay || 0) > EXPLOSION_THRESHOLD ||
          Math.abs(parsed.az || 0) > EXPLOSION_THRESHOLD;

        setStatus(isExploded ? "Explosée" : "Active");

        setCapteursData((prev) => {
          const capteurData = prev[capteurId] || [];
          const updated = [...capteurData, parsed]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .slice(-MAX_DATA_POINTS);
          return { ...prev, [capteurId]: updated };
        });

        setCurrentPage(0);
      } catch (err) {
        console.error("❌ Erreur parsing JSON:", err);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  const handlePageClick = ({ selected }) => setCurrentPage(selected);

  const renderTable = (capteurId, columns) => {
    const data = capteursData[capteurId] || [];
    const offset = currentPage * ITEMS_PER_PAGE;
    const currentPageData = data.slice(offset, offset + ITEMS_PER_PAGE);
    const pageCount = Math.ceil(data.length / ITEMS_PER_PAGE);

    return (
      <div key={capteurId} className="table-container">
        <h3>Événements - {capteurId}</h3>
        <table>
          <thead>
            <tr>
              <th>Heure</th>
              {columns.map((col) => (
                <th key={col}>{col.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((d, index) => (
              <tr key={index}>
                <td>{new Date(d.timestamp).toLocaleTimeString()}</td>
                {columns.map((col) => (
//                  <td key={col}>{(d[col] || 0).toFixed ? d[col].toFixed(2) : d[col]}</td>
                  <td key={col}>
                    {typeof d[col] === 'number'
                      ? d[col].toFixed(2)
                      : d[col] !== undefined
                        ? d[col]
                        : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <ReactPaginate
          previousLabel={"← Précédent"}
          nextLabel={"Suivant →"}
          breakLabel={"..."}
          pageCount={pageCount}
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

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard LoRaWAN - Mine</h2>
      <div className="status-container">
        <span>État de la mine :</span>
        <span className={`status ${status === "Active" ? "active" : "exploded"}`}>{status}</span>
      </div>

      <MapContainer center={CAMPUS_CYBER} zoom={18} className="map-container">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={CAMPUS_CYBER} icon={status === "Active" ? mineIconActive : mineIconExploded}>
          <Popup>{status === "Active" ? "⚠️ Mine active ⚠️" : "💥 Mine explosée ! 💥"}</Popup>
        </Marker>
      </MapContainer>

      {renderTable("capteur-gyroscope", ["vibration", "ax", "ay", "az"])}
      {renderTable("capteur-son", ["categorie", "decibels"])}
      {renderTable("capteur-lumiere", ["lux"])}

      <div className="log-container">
        <h3>Console MQTT</h3>
        <textarea
          className="log-box"
          rows={10}
          readOnly
          value={logs.join("\n")}
        />
      </div>
    </div>
  );
};

export default Dashboard;