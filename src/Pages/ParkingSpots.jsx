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
import { isUserNearby } from './component/distance';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const blueIcon = new L.Icon({
  iconUrl: availableIcon,
  shadowUrl: markerShadow,
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: unavailableIcon,
  shadowUrl: markerShadow,
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: currentIcon,
  shadowUrl: markerShadow,
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ParkingSpots = () => {
  const [allSpots, setAllSpots] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [type, setType] = useState('All');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [points, setPoints] = useState(0);
  const [reportedSpots, setReportedSpots] = useState({});
  const [inputVisible, setInputVisible] = useState({});
  const [freeCounts, setFreeCounts] = useState({});
  const [parkedSpotId, setParkedSpotId] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();
  const [lastAction, setLastAction] = useState({});
  const [successMessage, setSuccessMessage] = useState({});
  const [confirmedSpots, setConfirmedSpots] = useState({});
  const [activeSpotId, setActiveSpotId] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);

  const query = new URLSearchParams(useLocation().search);
  const selectedArea = query.get('location') || 'All';

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (token) {
      axios
        .get('https://parkify-web-app-backend.onrender.com/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const { name, phoneNumber, vehicleNumber } = res.data;
          const profileComplete = name && phoneNumber && vehicleNumber;
          setIsProfileComplete(profileComplete);
        })
        .catch((err) => {
          console.error('Error fetching profile:', err);
          setIsProfileComplete(false);
        });
    }

    if (userId) {
      axios
        .get('https://parkify-web-app-backend.onrender.com/api/confirmed-parking/active', {
          params: { userId },
        })
        .then((res) => {
          const activeSession = res.data;
          if (activeSession && activeSession.spotId) {
            console.log('✅ Active session found:', activeSession);

            setConfirmedSpots((prev) => ({
              ...prev,
              [activeSession.spotId]: { userId },
            }));
            setParkedSpotId(activeSession.spotId);
            setActiveSpotId(activeSession.spotId);

            // Save locally
            localStorage.setItem('confirmedSpotId', activeSession.spotId);
            localStorage.setItem(
              `parkingStart_${activeSession.spotId}`,
              new Date(activeSession.confirmedAt).toISOString()
            );
          } else {
            console.log('❌ No active session found');
            localStorage.removeItem('confirmedSpotId');
          }
        })
        .catch((err) => {
          console.error('❌ Error checking active session:', err);
        });
    }
  }, []);

  const fetchSpots = async () => {
    try {
      const res = await axios.get('https://parkify-web-app-backend.onrender.com/api/free-parking');
      setAllSpots(res.data);
    } catch (err) {
      console.error('Error fetching spots from DB', err);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const submitPoints = async (points, action) => {
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');

    //For debugging
    console.log('📨 Submitting points...');
    console.log('Email:', email);
    console.log('Username:', username);
    console.log('Points:', points);
    console.log('Action:', action);

    if (!email || !username) {
      console.warn('⚠️ Missing email or username in localStorage.');
      return;
    }

    try {
      const res = await axios.post('https://parkify-web-app-backend.onrender.com/api/score/add', {
        email,
        username,
        score: points,
        action,
      });
      console.log('✅ Points submitted successfully:', res.data);
    } catch (err) {
      console.error('Error submitting score', err);
    }
  };

  useEffect(() => {
    console.log('📍 Requesting user location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('✅ Got location:', latitude, longitude);
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const filteredSpots = allSpots
    .filter((spot) => {
      if (!spot.latitude || !spot.longitude) return false;
      if (selectedArea === 'All') return true;
      return (
        spot.area?.toLowerCase().includes(selectedArea.toLowerCase()) ||
        spot.address?.toLowerCase().includes(selectedArea.toLowerCase())
      );
    })
    .filter((spot) => {
      if (type === 'All') return true;
      return type === 'Paid' ? spot.paid : !spot.paid;
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
        submitPoints(earned, 'multi_spot_report');
        toast.success(`🎉 Thanks! You earned ${earned} points.`, {
          position: 'top-right',
          autoClose: 2000,
        });
      } catch (error) {
        console.error('Error updating spot:', error);
        toast.error('❌ Failed to update spot.', {
          position: 'top-right',
          autoClose: 2000,
        });
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

      {!isProfileComplete && (
        <div
          className="profile-warning"
          onClick={() => navigate('/profile', { state: { from: location } })}
        >
          <span className="warning-icon">⚠</span>
          <span className="warning-text">
            Your profile is incomplete. Please complete it to interact with the app.
          </span>
        </div>
      )}

      <div className="legend-container">
        <div className="legend-item">
          <img src={availableIcon} alt="Available" className="legend-icon" />
          <span className="legend-text legend-available">Available (Blue)</span>
        </div>
        <div className="legend-item">
          <img src={unavailableIcon} alt="Unavailable" className="legend-icon" />
          <span className="legend-text legend-unavailable">Occupied (Red)</span>
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

      <p className="spots-count">
        Showing <span className="count-highlight">{filteredSpots.length}</span> of{' '}
        <span className="count-highlight">{allSpots.length}</span> spots
      </p>

      <div className="map-container">
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

          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={(cluster) =>
              L.divIcon({
                html: `
                  <div class="cluster-icon">
                    ${cluster.getChildCount()}
                  </div>
                `,
                className: 'custom-cluster-icon',
                iconSize: [40, 40],
              })
            }
          >
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

                    const popupWidth = 280; // same as your popup CSS
                    const popupHeight = 300; // approximate height

                    let x = point.x;
                    let y = point.y;

                    // Clamp X
                    x = Math.max(popupWidth / 2, Math.min(x, rect.width - popupWidth / 2));

                    // Clamp Y
                    y = Math.max(popupHeight, Math.min(y, rect.height));

                    setPopupPosition({ x, y });
                  },
                }}
              ></Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {activeSpotId &&
          popupPosition &&
          (() => {
            const spot = filteredSpots.find((s) => s._id === activeSpotId);
            if (!spot) return null;
            const isNearby = isUserNearby(
              userLocation?.lat,
              userLocation?.lng,
              spot.latitude,
              spot.longitude
            );

            return (
              <div
                className="custom-popup"
                style={{
                  left: popupPosition.x,
                  top: popupPosition.y,
                }}
              >
                <button onClick={() => setActiveSpotId(null)} className="popup-close-btn">
                  ×
                </button>
                <h4 className="popup-title">{spot.name}</h4>
                <p className="popup-detail">
                  <strong>Type:</strong> {spot.type}
                </p>
                <p className="popup-detail">
                  <strong>Address:</strong> {spot.address || spot.area || 'N/A'}
                </p>
                <p className="popup-detail">
                  <strong>Rate:</strong> {spot.paid ? spot.rate || 'Check signage' : 'Free'}
                </p>
                <p className="popup-detail">
                  <strong>Hours:</strong> {spot.hours || 'Unknown'}
                </p>
                {!reportedSpots[spot._id] && (
                  <div className="popup-actions">
                    <p className="popup-detail">
                      <strong>Status:</strong>{' '}
                      <span
                        className={`status-badge ${spot.hasSpots ? 'status-available' : 'status-full'}`}
                      >
                        {spot.hasSpots ? `✅ Available (${spot.availableSpots})` : '❌ Full'}
                      </span>
                    </p>
                    {isNearby ? (
                      <>
                        <div className="popup-buttons">
                          {!freeCounts[spot._id + '_confirmed'] ? (
                            <button
                              disabled={
                                (!isProfileComplete || !!parkedSpotId) && parkedSpotId !== spot._id
                              }
                              onClick={async () => {
                                if (
                                  !isProfileComplete ||
                                  (!!parkedSpotId && parkedSpotId !== spot._id)
                                )
                                  return;

                                try {
                                  await axios.put(
                                    `https://parkify-web-app-backend.onrender.com/api/free-parking/${spot._id}`,
                                    {
                                      hasSpots: true,
                                      availableSpots: (spot.availableSpots || 0) + 1,
                                    }
                                  );
                                  await fetchSpots();
                                  setReportedSpots((prev) => ({
                                    ...prev,
                                    [spot._id]: true,
                                  }));
                                  setFreeCounts((prev) => ({
                                    ...prev,
                                    [spot._id + '_confirmed']: true,
                                  }));
                                  setPoints((prev) => prev + 5);
                                  //Give 5 points
                                  submitPoints(5, 'spot_available');

                                  toast.success('🎉 Thanks! 1 spot added. You earned 5 points.', {
                                    position: 'top-right',
                                    autoClose: 3000,
                                  });
                                } catch (err) {
                                  toast.error('❌ Error updating spot.', {
                                    position: 'top-right',
                                    autoClose: 3000,
                                  });
                                }
                              }}
                              className={`popup-btn btn-available ${
                                (!isProfileComplete || !!parkedSpotId) && parkedSpotId !== spot._id
                                  ? 'btn-disabled'
                                  : ''
                              }`}
                            >
                              ✅ Spot Available
                            </button>
                          ) : (
                            <div className="more-spots-section">
                              <p className="popup-text">See more available spots?</p>
                              <input
                                type="number"
                                min="0"
                                placeholder="Enter number"
                                value={freeCounts[spot._id] || ''}
                                onChange={(e) =>
                                  setFreeCounts((prev) => ({
                                    ...prev,
                                    [spot._id]: e.target.value,
                                  }))
                                }
                                className="popup-input"
                              />
                              <button
                                disabled={
                                  (!isProfileComplete || !!parkedSpotId) &&
                                  parkedSpotId !== spot._id
                                }
                                onClick={() => {
                                  if (
                                    !isProfileComplete ||
                                    (!!parkedSpotId && parkedSpotId !== spot._id)
                                  )
                                    return;
                                  handleReportSubmit(spot._id);
                                }}
                                className={`popup-btn btn-report ${
                                  (!isProfileComplete || !!parkedSpotId) &&
                                  parkedSpotId !== spot._id
                                    ? 'btn-disabled'
                                    : ''
                                }`}
                              >
                                📊 Report More Spots
                              </button>
                            </div>
                          )}

                          <input
                            type="number"
                            min="0"
                            placeholder="Enter number"
                            value={freeCounts[spot._id] || ''}
                            onChange={(e) =>
                              setFreeCounts((prev) => ({
                                ...prev,
                                [spot._id]: e.target.value,
                              }))
                            }
                            className="popup-input"
                          />
                          <button
                            disabled={
                              (!isProfileComplete || !!parkedSpotId) && parkedSpotId !== spot._id
                            }
                            onClick={() => {
                              if (
                                !isProfileComplete ||
                                (!!parkedSpotId && parkedSpotId !== spot._id)
                              )
                                return;
                              handleReportSubmit(spot._id);
                            }}
                            className={`popup-btn btn-report ${
                              (!isProfileComplete || !!parkedSpotId) && parkedSpotId !== spot._id
                                ? 'btn-disabled'
                                : ''
                            }`}
                          >
                            📊 Report Available Spots
                          </button>
                          {/* Only show "Mark as Full" if not already full */}
                          {!reportedSpots[spot._id] && spot.hasSpots && (
                            <>
                              <p className="popup-text full-question">Is this lot full?</p>
                              <button
                                disabled={
                                  (!isProfileComplete || !!parkedSpotId) &&
                                  parkedSpotId !== spot._id
                                }
                                onClick={async () => {
                                  if (
                                    !isProfileComplete ||
                                    (!!parkedSpotId && parkedSpotId !== spot._id)
                                  )
                                    return;
                                  try {
                                    await axios.put(
                                      `https://parkify-web-app-backend.onrender.com/api/free-parking/${spot._id}`,
                                      {
                                        hasSpots: false,
                                        availableSpots: 0,
                                      }
                                    );
                                    await fetchSpots();
                                    toast.success('🎉 Thanks! Spot marked as full.', {
                                      position: 'top-right',
                                      autoClose: 3000,
                                    });
                                    setReportedSpots((prev) => ({
                                      ...prev,
                                      [spot._id]: true,
                                    }));
                                    submitPoints(5, 'marked_full');
                                  } catch (err) {
                                    toast.error('❌ Failed to report full status.', {
                                      position: 'top-right',
                                      autoClose: 3000,
                                    });
                                    console.error(err);
                                  }
                                }}
                                className={`popup-btn btn-full ${
                                  (!isProfileComplete || !!parkedSpotId) &&
                                  parkedSpotId !== spot._id
                                    ? 'btn-disabled'
                                    : ''
                                }`}
                              >
                                ❌ Mark as Full
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="location-warning">
                        📍 You must be near this location to confirm or report spots.
                      </div>
                    )}
                  </div>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => localStorage.setItem('navigatedSpot', JSON.stringify(spot))}
                >
                  <button
                    disabled={!isProfileComplete}
                    className={`popup-btn btn-directions ${!isProfileComplete ? 'btn-disabled' : ''}`}
                  >
                    🗺️ Get Directions
                  </button>
                </a>
                {confirmedSpots[spot._id]?.userId === localStorage.getItem('userId') ? (
                  (() => {
                    const startStr = localStorage.getItem(`parkingStart_${spot._id}`);
                    console.log('⏳ [TIMER DEBUG] startStr:', startStr);

                    const startTime = startStr ? new Date(startStr).getTime() : null;
                    const now = Date.now();
                    const duration = 3600 * 1000;
                    const remainingMs = startTime ? startTime + duration - now : 0;
                    const secondsLeft = Math.max(Math.floor(remainingMs / 1000), 0);

                    console.log('[TIMER DEBUG] secondsLeft:', secondsLeft);

                    if (!startTime || isNaN(secondsLeft)) {
                      console.warn('Invalid startTime or secondsLeft:', startTime, secondsLeft);
                      return (
                        <div className="timer-error">❌ Timer failed to load. Please refresh.</div>
                      );
                    }

                    return (
                      <div className="parking-timer-container">
                        <ParkingTimer
                          spotId={spot._id}
                          seconds={secondsLeft}
                          onTimerEnd={() => {
                            console.log('⏱ Timer ended for spot:', spot._id);
                            localStorage.removeItem('confirmedSpotId');
                            localStorage.removeItem(`parkingStart_${spot._id}`);
                            setConfirmedSpots((prev) => {
                              const updated = { ...prev };
                              delete updated[spot._id];
                              return updated;
                            });
                            setParkedSpotId(null);
                          }}
                        />
                      </div>
                    );
                  })()
                ) : parkedSpotId && parkedSpotId !== spot._id ? (
                  <div className="parked-elsewhere">
                    <p className="parked-text">You are parked at another location.</p>
                    <button
                      disabled={!isProfileComplete}
                      onClick={() => setActiveSpotId(parkedSpotId)}
                      className={`popup-btn btn-active-spot ${!isProfileComplete ? 'btn-disabled' : ''}`}
                    >
                      🔄 Go to Active Spot
                    </button>
                  </div>
                ) : isNearby ? (
                  <div className="parking-confirmation">
                    <strong className="parking-question">Are you parking here?</strong>
                    {spot.hasSpots ? (
                      <button
                        onClick={async () => {
                          if (!isProfileComplete) return;
                          await handleStripePayment(spot);
                          submitPoints(2, 'parking_confirmed');
                        }}
                        disabled={
                          (!isProfileComplete || !!parkedSpotId) && parkedSpotId !== spot._id
                        }
                        className={`popup-btn btn-confirm-parking ${
                          (!isProfileComplete || !!parkedSpotId) && parkedSpotId !== spot._id
                            ? 'btn-disabled'
                            : ''
                        }`}
                      >
                        Yes, I'm parking here
                      </button>
                    ) : (
                      <p className="full-spot-message">
                        ❌ Spot marked as full. Please mark it as available to confirm parking.
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })()}
      </div>
      <BottomNav />
    </div>
  );
};

export default ParkingSpots;
