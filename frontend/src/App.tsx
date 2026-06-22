import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChildProfilePage from "./pages/ChildProfilePage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import RecordingPage from "./pages/RecordingPage";
import TestingPage from "./pages/TestingPage";
import WorkerHandoverPage from "./pages/WorkerHandoverPage";
import WorkerReviewPage from "./pages/WorkerReviewPage";
import YouthChatPage from "./pages/YouthChatPage";
import YouthSideChatPage from "./pages/YouthSideChatPage";
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
        <Route path="/chat/:conversationId" element={<YouthChatPage />} />
        <Route path="/youth/chat/:conversationId" element={<YouthSideChatPage />} />
        <Route path="/worker/handover" element={<WorkerHandoverPage />} />
        <Route path="/worker/handover/:conversationId" element={<WorkerReviewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
