import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import ReactPaginate from "react-paginate";
import 'chartjs-adapter-date-fns';

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
  zoomPlugin
);

const mineIcon = new L.Icon({
  iconUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("Active");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const position = [48.8566, 2.3522];
  const maxDataPoints = 3600;
  const dataReductionFactor = 10; // Réduit le nombre de points affichés

  useEffect(() => {
    return () => {
      ChartJS.helpers.each(ChartJS.instances, function (instance) {
        instance.destroy();
      });
    };
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [
          ...prevData.slice(-maxDataPoints + 1), // Garde un nombre fixe de points, en supprimant les anciens
          {
            timestamp: new Date().toISOString(),
            vibration: Math.random() * 2000,
            ax: (Math.random() - 0.5) * 10,
            ay: (Math.random() - 0.5) * 10,
            az: (Math.random() - 0.5) * 10,
          },
        ];
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentPageData = data.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(data.length / itemsPerPage);

  const reducedData = data.filter((_, index) => index % dataReductionFactor === 0);

  const chartData = {
    labels: reducedData.map((d) => d.timestamp),
    datasets: [
      {
        label: "Vibration (mg)",
        data: reducedData.map((d) => d.vibration),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // Désactive les animations pour éviter les décalages
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: "x",
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "minute", // Affichage en minutes pour éviter la surcharge
          displayFormats: {
            second: "HH:mm:ss",
            minute: "HH:mm",
            hour: "HH:mm",
          },
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10, // Réduit le nombre d'heures affichées pour plus de clarté
        },
        title: {
          display: true,
          text: "Temps",
        },
      },
      y: {
        title: {
          display: true,
          text: "Vibration (mg)",
        },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard LoRaWAN - Mine</h2>
      <div className="status-container">
        <span>État de la mine :</span>
        <span className={`status ${status === "Active" ? "active" : "inactive"}`}>
          {status}
        </span>
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
