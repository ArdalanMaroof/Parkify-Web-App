import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../ParkingSpots.css';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import parkifyLogo from '../assets/Parkify-logo.jpg';
import BottomNav from './component/BottomNav';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import availableIcon from '../assets/location.png';
import unavailableIcon from '../assets/placeholder.png';
import currentIcon from '../assets/pin.png';
import MapHelper from './component/MapHelper';
import MapClickCloser from './component/MapClickCloser';
import ParkingTimer from './component/ParkingTimer';
import { handleStripePayment } from './component/stripePayment';


const blueIcon = new L.Icon({
  iconUrl: availableIcon,
  shadowUrl: markerShadow,
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: unavailableIcon,
  shadowUrl: markerShadow,
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: currentIcon,
  shadowUrl: markerShadow,
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});



const ParkingSpots = () => {
  const [allSpots, setAllSpots] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [type, setType] = useState("All");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [points, setPoints] = useState(0);
  const [reportedSpots, setReportedSpots] = useState({});
  const [inputVisible, setInputVisible] = useState({});
  const [freeCounts, setFreeCounts] = useState({});
  const [parkedSpotId, setParkedSpotId] = useState(null);
  const navigate = useNavigate();
  const [lastAction, setLastAction] = useState({});
  const [successMessage, setSuccessMessage] = useState({});
  const [confirmedSpots, setConfirmedSpots] = useState({});
  const [activeSpotId, setActiveSpotId] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);




  const query = new URLSearchParams(useLocation().search);
  const selectedArea = query.get("location") || "All";

  useEffect(() => {
    const stored = localStorage.getItem("confirmedSpotId");
    if (stored) {
      setParkedSpotId(stored);
      setConfirmedSpots(prev => ({ ...prev, [stored]: true }));
      setActiveSpotId(stored); // Automatically open popup on reload
    }
  }, []);


  const fetchSpots = async () => {
    try {
      const res = await axios.get("https://parkify-web-app-backend.onrender.com/api/free-parking");
      setAllSpots(res.data);
    } catch (err) {
      console.error("Error fetching spots from DB", err);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const submitPoints = async (points, action) => {
    const email = localStorage.getItem("email");
    const username = localStorage.getItem("username");

    //For debugging
    console.log("📨 Submitting points...");
    console.log("Email:", email);
    console.log("Username:", username);
    console.log("Points:", points);
    console.log("Action:", action);

    if (!email || !username) {
      console.warn("⚠️ Missing email or username in localStorage.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/score/add", {
        email,
        username,
        score: points,
        action
      });
      console.log("✅ Points submitted successfully:", res.data);
    } catch (err) {
      console.error("Error submitting score", err);
    }
  };


  const filteredSpots = allSpots
    .filter((spot) => {
      if (!spot.latitude || !spot.longitude) return false;
      if (selectedArea === "All") return true;
      return (
        spot.area?.toLowerCase().includes(selectedArea.toLowerCase()) ||
        spot.address?.toLowerCase().includes(selectedArea.toLowerCase())
      );
    })
    .filter((spot) => {
      if (type === "All") return true;
      return type === "Paid" ? spot.paid : !spot.paid;
    })
    .filter((spot) => (onlyAvailable ? spot.hasSpots === true : true));

  const getMarkerIcon = (spot) => {
    return spot.hasSpots ? blueIcon : redIcon;
  };

  const handleReportSubmit = async (spotId) => {
    const num = parseInt(freeCounts[spotId]);
    if (!isNaN(num) && num >= 0) {
      try {
        await axios.put(`https://parkify-web-app-backend.onrender.com/api/free-parking/${spotId}`, {
          hasSpots: true,
          availableSpots: num,
        });
        await fetchSpots();
        const earned = num * 5;
        setPoints((prev) => prev + earned);
        setReportedSpots((prev) => ({ ...prev, [spotId]: true }));
        submitPoints(earned, "multi_spot_report");
        alert(`Thanks! You earned ${earned} points.`);
      } catch (error) {
        console.error("Error updating spot:", error);
        alert("Failed to update spot.");
      }
    }
  };




  return (
    <div className="spots-container">
      <header className="top-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          ←
        </button>
        <div className="header-title">
          <h2>Parking Spots in {selectedArea}</h2>
        </div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={availableIcon} alt="Available" style={{ width: '20px' }} />
          <span style={{ color: '#007bff', fontWeight: 500 }}>Available (Blue)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={unavailableIcon} alt="Unavailable" style={{ width: '20px' }} />
          <span style={{ color: '#d32f2f', fontWeight: 500 }}>Occupied (Red)</span>
        </div>
      </div>

      <div className="filter-tabs">
        {['All', 'Paid', 'Free'].map((tab) => (
          <button key={tab} className={type === tab ? 'active' : ''} onClick={() => setType(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="availability-filter">
        <label>
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={() => setOnlyAvailable(!onlyAvailable)}
          />
          <span className="checkmark"></span>
          Show only available spots
        </label>
      </div>

      <p style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontWeight: '500' }}>
        Showing <span style={{ color: '#ff5722' }}>{filteredSpots.length}</span> of <span style={{ color: '#ff5722' }}>{allSpots.length}</span> spots
      </p>

      <div style={{ height: '80vh', width: '100%', position: 'relative' }}>
        <MapContainer
          center={userLocation ? [userLocation.lat, userLocation.lng] : [49.2827, -123.1207]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
          <MapHelper
            onMapReady={(mapInstance) => {
              // Save map instance in ref or state if needed
              if (activeSpotId) {
                const spot = filteredSpots.find((s) => s._id === activeSpotId);
                if (spot) {
                  const point = mapInstance.latLngToContainerPoint([spot.latitude, spot.longitude]);
                  setPopupPosition({ x: point.x, y: point.y });
                }
              }
            }}
          />
          <MapClickCloser onClose={() => setActiveSpotId(null)} />



          <MarkerClusterGroup chunkedLoading iconCreateFunction={(cluster) => {
            return L.divIcon({
              html: `<div style="background:#007bff;color:#fff;font-size:13px;font-weight:bold;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">${cluster.getChildCount()}</div>`
            });
          }}>
            {filteredSpots.map((spot, index) => (
              <Marker
                key={spot._id}
                position={[spot.latitude, spot.longitude]}
                icon={getMarkerIcon(spot)}
                eventHandlers={{
                  click: (e) => {
                    setActiveSpotId(spot._id);
                    const map = e.target._map;
                    const container = map.getContainer();
                    const rect = container.getBoundingClientRect();
                    const point = map.latLngToContainerPoint([spot.latitude, spot.longitude]);

                    const popupWidth = 280;  // same as your popup CSS
                    const popupHeight = 300; // approximate height

                    let x = point.x;
                    let y = point.y;

                    // Clamp X
                    x = Math.max(popupWidth / 2, Math.min(x, rect.width - popupWidth / 2));

                    // Clamp Y
                    y = Math.max(popupHeight, Math.min(y, rect.height));

                    setPopupPosition({ x, y });
                  }


                }}
              >
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {activeSpotId && popupPosition && (() => {
          const spot = filteredSpots.find(s => s._id === activeSpotId);
          if (!spot) return null;

          return (
            <div
              className="custom-popup"
              style={{
                position: 'absolute',
                zIndex: 1000,
                left: popupPosition.x,
                top: popupPosition.y,
                transform: 'translate(-50%, -100%)',
                background: 'white',
                padding: '14px',
                borderRadius: '8px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                width: '280px',
              }}
            >
              <button
                onClick={() => setActiveSpotId(null)}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '10px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>

              <h4>{spot.name}</h4>
              <p><strong>Type:</strong> {spot.type}</p>
              <p><strong>Address:</strong> {spot.address || spot.area || 'N/A'}</p>
              <p><strong>Rate:</strong> {spot.paid ? (spot.rate || 'Check signage') : 'Free'}</p>
              <p><strong>Hours:</strong> {spot.hours || 'Unknown'}</p>

              {!reportedSpots[spot._id] && (
                <div style={{ marginTop: '8px' }}>
                  <p><strong>Status:</strong> {spot.hasSpots ? `✅ Available (${spot.availableSpots})` : '❌ Full'}</p>

                  <div style={{ marginTop: '6px' }}>
                    {!freeCounts[spot._id + "_confirmed"] ? (
                      <button
                        disabled={!!parkedSpotId && parkedSpotId !== spot._id}
                        onClick={async () => {
                          if (!!parkedSpotId && parkedSpotId !== spot._id) return;
                          try {
                            await axios.put(`https://parkify-web-app-backend.onrender.com/api/free-parking/${spot._id}`, {
                              hasSpots: true,
                              availableSpots: (spot.availableSpots || 0) + 1,
                            });
                            await fetchSpots();
                            setReportedSpots((prev) => ({ ...prev, [spot._id]: true }));
                            setFreeCounts((prev) => ({ ...prev, [spot._id + "_confirmed"]: true }));
                            setPoints((prev) => prev + 5);
                            //Give 5 points
                            submitPoints(5, "spot_available");

                            alert("Thanks! 1 spot added. You earned 5 points.");
                          } catch (err) {
                            alert("Error updating spot.");
                          }
                        }}
                        style={{
                          width: '100%',
                          backgroundColor: (!!parkedSpotId && parkedSpotId !== spot._id) ? '#ccc' : '#4CAF50',
                          color: 'white',
                          padding: '8px',
                          border: 'none',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          marginTop: '6px',
                          cursor: (!!parkedSpotId && parkedSpotId !== spot._id) ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ✅ Spot Available
                      </button>
                    ) : (
                      <div style={{ marginTop: '10px' }}>
                        <p>See more available spots?</p>
                        <input
                          type="number"
                          min="0"
                          placeholder="Enter number"
                          value={freeCounts[spot._id] || ''}
                          onChange={(e) =>
                            setFreeCounts((prev) => ({ ...prev, [spot._id]: e.target.value }))
                          }
                          style={{
                            width: '100%',
                            padding: '6px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            marginBottom: '6px',
                          }}
                        />
                        <button
                          disabled={!!parkedSpotId && parkedSpotId !== spot._id}
                          onClick={() => {
                            if (!!parkedSpotId && parkedSpotId !== spot._id) return;
                            handleReportSubmit(spot._id);
                          }}
                          style={{
                            width: '100%',
                            backgroundColor: (!!parkedSpotId && parkedSpotId !== spot._id) ? '#ccc' : '#007bff',
                            color: 'white',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: (!!parkedSpotId && parkedSpotId !== spot._id) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Report More Spots
                        </button>
                      </div>
                    )}

                    <input
                      type="number"
                      min="0"
                      placeholder="Enter number"
                      value={freeCounts[spot._id] || ''}
                      onChange={(e) =>
                        setFreeCounts((prev) => ({ ...prev, [spot._id]: e.target.value }))
                      }
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        marginBottom: '6px',
                      }}
                    />
                    <button
                      disabled={!!parkedSpotId && parkedSpotId !== spot._id}
                      onClick={() => {
                        if (!!parkedSpotId && parkedSpotId !== spot._id) return;
                        handleReportSubmit(spot._id);
                      }}
                      style={{
                        width: '100%',
                        backgroundColor: (!!parkedSpotId && parkedSpotId !== spot._id) ? '#ccc' : '#007bff',
                        color: 'white',
                        padding: '8px',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        marginBottom: '6px',
                        cursor: (!!parkedSpotId && parkedSpotId !== spot._id) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Report Available Spots
                    </button>

                    {/* Only show "Mark as Full" if not already full */}
                    {!reportedSpots[spot._id] && spot.hasSpots && (
                      <>
                        <p style={{ marginTop: '10px' }}>Is this lot full?</p>
                        <button
                          disabled={!!parkedSpotId && parkedSpotId !== spot._id}
                          onClick={async () => {
                            if (!!parkedSpotId && parkedSpotId !== spot._id) return;
                            try {
                              await axios.put(`https://parkify-web-app-backend.onrender.com/api/free-parking/${spot._id}`, {
                                hasSpots: false,
                                availableSpots: 0,
                              });
                              await fetchSpots();
                              alert("Thanks! Spot marked as full.");
                              setReportedSpots((prev) => ({ ...prev, [spot._id]: true }));
                              // 5 points for reporting full meaked
                              submitPoints(5, "marked_full");

                            } catch (err) {
                              alert("Failed to report full status.");
                              console.error(err);
                            }
                          }}
                          style={{
                            width: '100%',
                            backgroundColor: (!!parkedSpotId && parkedSpotId !== spot._id) ? '#ccc' : '#d32f2f',
                            color: 'white',
                            padding: '8px',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: (!!parkedSpotId && parkedSpotId !== spot._id) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Mark as Full
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => localStorage.setItem("navigatedSpot", JSON.stringify(spot))}
              >
                <button style={{
                  margin: "10px 0",
                  padding: "8px 12px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  width: "100%",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}>
                  Get Directions
                </button>
              </a>
              {confirmedSpots[spot._id] ? (
                <ParkingTimer
                  spotId={spot._id}
                  seconds={3600}
                  onTimerEnd={() => {
                    localStorage.removeItem("confirmedSpotId");
                    localStorage.removeItem(`parkingStart_${spot._id}`);
                    setConfirmedSpots(prev => {
                      const updated = { ...prev };
                      delete updated[spot._id];
                      return updated;
                    });
                    setParkedSpotId(null);
                  }}
                />
              ) : parkedSpotId && parkedSpotId !== spot._id ? (
                <div style={{ marginTop: '6px' }}>
                  <p style={{ color: '#555', fontWeight: 'bold' }}>
                    You are parked at another location.
                  </p>
                  <button
                    onClick={() => setActiveSpotId(parkedSpotId)}
                    style={{
                      backgroundColor: '#1976d2',
                      color: 'white',
                      padding: '6px 10px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%',
                      marginTop: '4px'
                    }}
                  >
                    🔄 Go to Active Spot
                  </button>
                </div>

              ) : (
                <div style={{ marginTop: '6px' }}>
                  <strong>Are you parking here?</strong>
                  {spot.hasSpots ? (
                    <button
                      onClick={async () => {
                        await handleStripePayment(spot);
                        submitPoints(2, "parking_confirmed");
                      }}

                      disabled={!!parkedSpotId && parkedSpotId !== spot._id}
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '6px 10px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        width: '100%',
                        marginTop: '4px'
                      }}
                    >
                      Yes, I’m parking here
                    </button>
                  ) : (
                    <p style={{ color: '#f44336', marginTop: '4px' }}>
                      ❌ Spot marked as full. Please mark it as available to confirm parking.
                    </p>
                  )}


                </div>
              )}

            </div>
          );
        })()}

      </div>
      <BottomNav />
    </div>
  );
};

export default ParkingSpots;
