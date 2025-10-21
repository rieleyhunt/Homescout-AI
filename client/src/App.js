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



  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <form onSubmit={handleSubmit}>
          <div class="mb-3">
            <label for="nameInput" class="form-label">Ask me anything</label>
            <input 
              type="text"
              class="form-control" 
              id="nameInput" placeholder="prompt" 
              value={prompt} onChange={(e) => setPrompt(e.target.value)}>
            </input>
            <button type="submit" class="btn btn-primary ">Submit</button>
          </div>
        </form>

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
