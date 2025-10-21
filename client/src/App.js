import logo from './logo.svg';
import './App.css';
import React, {useState} from "react";

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch ("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: "123",
          message: prompt,
        }),
      });

      const data = await res.json();
      setResponse(data.reply);
    } catch (err) {
      console.error("Error", err);
    }
  };

  const [location, setLocation] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [listings, setListings] = useState("");

  const handleScrape = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch ("http://localhost:5000/api/scrape/realtor-scrape", {
        method: "POST",
        headers: {
          "Content-Type": "applications/json",
        },
        body: JSON.stringify({
            location: location,
            maxDistance: maxDistance,
            minPrice: minPrice,
            maxPrice: maxPrice,
        }),
      });

      const data = await res.json();
      setListings(data.listings);
    } catch (err) {
      console.error("Error", err);
    }
  };



  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <form onSubmit={handleSubmit}>
          <div class="mb-3">
            <label for="promptInput" class="form-label">Ask me anything</label>
            <input 
              type="text"
              class="form-control" 
              id="promptInput" placeholder="prompt" 
              value={prompt} onChange={(e) => setPrompt(e.target.value)}>
            </input>
            <button type="submit" class="btn btn-primary">Submit</button>
          </div>
        </form>

        <form onSubmit={handleScrape}>
          <div class="mb-3">
            <label for="locationInput" class="form-label"></label>
            <input 
              type="text"
              class="form-control" 
              id="locationInput" placeholder="Location" 
              value={location} onChange={(e) => setLocation(e.target.value)}>
            </input>
            <label for="maxDistance" class="form-label"></label>
            <input
              type="text"
              class="form-control"
              id="maxDistance"
              value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)}>
            </input>
            <label for="minPrice" class="form-label"></label>
              <input
                type="text"
                class="form-control"
                id="minPrice"
                value={minPrice} onChange={(e) => setMinPrice(e.target.value)}>
              </input>
            <label for="maxPrice" class="form-label"></label>
              <input
              type="text"
              class="form-control"
              id="maxPrice"
              value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
            </input>
          </div>
        </form>

      {listings && (
        <div className="mt-3">
          <h5>Listings:</h5>
          <p>{listings}</p>
        </div>
      )}

      {response && (
        <div className="mt-3">
          <h5>AI Response:</h5>
          <p>{response}</p>
        </div>
      )}
      
      </header>


    </div>
  );
}

export default App;
