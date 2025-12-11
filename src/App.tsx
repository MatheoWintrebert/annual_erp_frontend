import { useState } from "react";
import icon from "../icon.png";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <img src={icon} className="logo" alt="Annual ERP logo" />
      </div>
      <h1>Annual ERP</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Welcome to Annual ERP!
      </p>
    </>
  );
}

export default App;
