import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChildProfilePage from "./pages/ChildProfilePage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import RecordingPage from "./pages/RecordingPage";
import TestingPage from "./pages/TestingPage";
import "./styles/app.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/children/:childId/session/:sessionId" element={<RecordingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/children/:childId" element={<ChildProfilePage />} />
        <Route path="/testing" element={<TestingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
