import { useState } from "react";
import icon from "/icon.png";
import Button from "@mui/material/Button";
import "./App.css";
import { ROUTES, router } from './router';
import { RouterProvider } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0);
  return <RouterProvider router={router} />;
  return (
    <>
      <div>
        <img src={icon} className="logo" alt="Annual ERP logo" />
      </div>
      <h1>Annual ERP</h1>
      <div className="card">
        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            fontWeight: 500,
            backgroundColor: "#1a1a1a",
            color: "text.primary",
            "&:hover": {
              borderColor: "info.main",
              backgroundColor: "#1a1a1a",
              boxShadow: "0 0 0 2px #770d66",
            },
            border: "1px solid transparent",
            transition: "border-color 0.25s",
          }}
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Welcome to Annual ERP!</p>
    </>
  );
}

export default App;
