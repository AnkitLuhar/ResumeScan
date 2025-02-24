import React, { useEffect, useState } from "react";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";
import ResumeScanLoaderClean from "./pages/ResumeScanLoaderClean";
const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <ResumeScanLoaderClean />;
  }

  return (
    <>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/Analysis" element={<Analysis />} />
        <Route exact path="/*" element={<Home />} />
        <Route exact path="/Analysis/*" element={<Analysis />} />
      </Routes>
    </>
  );
};

export default App;
