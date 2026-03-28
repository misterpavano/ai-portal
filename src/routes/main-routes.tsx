import { Navigate, Route, Routes } from "react-router-dom";
import DesignSystemPage from "../pages/main/designSystem";
import PowerPointSlideGeneratorPage from "../pages/main/powerpointSlideGenerator";
// import AIChatbotPage from "../pages/main/aiChatbot";
import DashboardPage from "../pages/main/dashboard";
import DoctorDiscussionGuidePage from "../pages/main/doctorDiscussionGuide";
import DiscussionGuidePage from "../pages/main/discussionGuide";
import SideMenu from "../components/layouts/LeftSideMenu";
import ProtectedRoute from "../hoc/ProtectedRoute/ProtectedRoute";
import AdminPage from "../pages/main/admin";
import ProjectBriefGeneratorPage from "../pages/main/projectBriefGenerator";
// import AgentsPage from "../pages/main/agents";
import BlogGeneratorPage from "../pages/main/blogGenerator";
import InterviewSummariesPage from "../pages/main/interviewSummaries";
import MeetingNotesPage from "../pages/main/meetingNotes";
import MKGChatbotPage from "../pages/main/mkgChatbot";
import AIPersonasPage from "../pages/main/aiPersonas";
import RouteValidatorPage from "../pages/main/routeValidator";
import AIChatbotPage from "../pages/main/aiChatbot";
import AudioToTextPage from "../pages/main/audioToText";

const MainRoutes = () => {
  return (
    <SideMenu>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discussion-guide"
          element={
            <ProtectedRoute>
              <DiscussionGuidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-discussion-guide"
          element={
            <ProtectedRoute>
              <DoctorDiscussionGuidePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meeting-summaries"
          element={
            <ProtectedRoute>
              <InterviewSummariesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/route-assistant"
          element={
            <ProtectedRoute>
              <RouteValidatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audio-to-text"
          element={
            <ProtectedRoute>
              <AudioToTextPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meeting-notes"
          element={
            <ProtectedRoute>
              <MeetingNotesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-personas"
          element={
            <ProtectedRoute>
              <AIPersonasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog-generator"
          element={
            <ProtectedRoute>
              <BlogGeneratorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/powerpoint-slide-generator"
          element={
            <ProtectedRoute>
              <PowerPointSlideGeneratorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/design-system"
          element={
            <ProtectedRoute>
              <DesignSystemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-chatbot"
          element={
            <ProtectedRoute>
              <AIChatbotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/project-brief-generator"
          element={
            <ProtectedRoute>
              <ProjectBriefGeneratorPage />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/agents"
          element={
            <ProtectedRoute>
              <AgentsPage />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </SideMenu>
  );
};

export default MainRoutes;
