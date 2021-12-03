import { useState, useEffect } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import { Room, Star } from '@mui/icons-material';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import "./app.css";
import axios from 'axios';
import { format } from 'timeago.js';
import Register from './components/Register';
import Login from './components/Login';

mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

function App() {

  const myStorage = window.localStorage; // Store user into local storage

  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));

  const [pins, setPins] = useState([]);

  const [currentPlaceId, setCurrentPlaceId] = useState(null);

  const [newPlace, setNewPlace] = useState(null);

  const [title, setTitle] = useState(null);

  const [desc, setDesc] = useState(null);

  const [rating, setRating] = useState(0);

  const [showRegister, setShowRegister] = useState(false);

  const [showLogin, setShowLogin] = useState(false);

  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude:  52.52,
    longitude: 13.408,
    zoom: 4 
  });


  useEffect(() => {
    const getPins = async () => {
      try {
        const res = await axios.get("https://travel-pin-backend.herokuapp.com/api/pins");
        setPins(res.data);
        console.log(res.data)
      } catch (err) {
        console.log(err)
      }
    };
    getPins();
  },[])


  const handleMarkerClick = (id,lat,long) => {
    setCurrentPlaceId(id);
    setViewport({...viewport, latitude: lat, longitude: long})
  }

  const handleAddClick = (e) => {
    const [long, lat] = e.lngLat;
    setNewPlace({
      lat,
      long
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); // To prevent page from refreshing
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating,
      lat: newPlace.lat,
      long: newPlace.long
    }

    try {
      const res = await axios.post("https://travel-pin-backend.herokuapp.com/api/pins", newPin);
      setPins([...pins, res.data])
      setNewPlace(null);
    } catch (err) {
      console.log(err)
    }
  }

  const handleLogout = () => {
    myStorage.removeItem("user");
    setCurrentUser(null);
  }



  return (
    <div className="App">
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        onViewportChange={nextViewport => setViewport(nextViewport)}
        mapStyle="mapbox://styles/bamz-west/ckw0z6yp59alw14m33055i3ky"
        onDblClick = {handleAddClick}
        transitionDuration="200"
      >
        {pins.map(p => (
          <div key={p._id}>
            <Marker 
            latitude={p.lat} 
            longitude={p.long} 
            offsetLeft={-viewport.zoom * 3.5}
            offsetTop={-viewport.zoom * 7}
            >
              <Room 
                style={{
                  fontSize: viewport.zoom * 7, 
                  color: p.username === currentUser ? "tomato" : "slateblue", 
                  cursor: "pointer" 
                }}
                onClick={() => handleMarkerClick(p._id,p.lat,p.long)}
              />
            </Marker>
            {p._id === currentPlaceId && (
              <Popup
                latitude={p.lat}
                longitude={p.long}
                closeButton={true}
                closeOnClick={false}
                anchor="left"
                onClose={() => setCurrentPlaceId(null)}
              >
                <div className="card">
                  <label>Place</label>
                  <h4 className="place">{p.title}</h4>
                  <label>Review</label>
                  <p className="desc">{p.desc}</p>
                  <label>Rating</label>
                  <div className="stars">
                    {Array(p.rating).fill(<Star className="star" />)}
                  </div>
                  <label>Information</label>
                  <span className="username">Created by <b>{p.username}</b></span>
                  <span className="date">{format(p.createdAt)}</span>
                </div>
              </Popup>
            )}
          </div>
        ))}
        {newPlace && currentUser && (
          <Popup
            latitude={newPlace.lat}
            longitude={newPlace.long}
            closeButton={true}
            closeOnClick={false}
            anchor="left"
            onClose={() => setNewPlace(null)}
          >
            <div>
              <form onSubmit={handleSubmit}>
                <label>Title</label>
                <input 
                  placeholder="Enter a title" 
                  onChange={(e) => setTitle(e.target.value)} 
                />
                <label>Review</label>
                <textarea 
                  placeholder="say something about this place." 
                  onChange={(e) => setDesc(e.target.value)}
                />
                <label>Rating</label>
                <select onChange={(e) => setRating(e.target.value)} >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button className="submitButton" type="submit">Add Pin</button>
              </form>
            </div>
          </Popup>
        )}
        {currentUser ? (
          <button className="button logout" onClick={handleLogout}>Log out</button>
        ) : (
          <div className="buttons">
            <button 
              className="button login" 
              onClick={()=>{
                setShowLogin(true)
                setShowRegister(false)
              }}
            >
              Login
            </button>
            <button 
              className="button register" 
              onClick={()=>{
                setShowRegister(true)
                setShowLogin(false)
              }}
            >
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && <Login setShowLogin={setShowLogin} myStorage={myStorage} setCurrentUser={setCurrentUser} />}
      </ReactMapGL>
    </div>
  );
}

export default App;
