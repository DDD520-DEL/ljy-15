import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ArtistDetail } from "@/pages/ArtistDetail";
import { Favorites } from "@/pages/Favorites";
import { BrowseHistory } from "@/pages/BrowseHistory";
import { MyBookings } from "@/pages/MyBookings";
import { ArtistDashboard } from "@/pages/ArtistDashboard";
import { ArtistAnalytics } from "@/pages/ArtistAnalytics";
import { Notifications } from "@/pages/Notifications";
import { UserProfile } from "@/pages/UserProfile";
import { HelpCenter } from "@/pages/HelpCenter";
import { ArtistApplication } from "@/pages/ArtistApplication";
import { Feedback } from "@/pages/Feedback";
import { MyFeedbacks } from "@/pages/MyFeedbacks";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artist/:id" element={<ArtistDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/browse-history" element={<BrowseHistory />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/artist-dashboard" element={<ArtistDashboard />} />
        <Route path="/artist-analytics" element={<ArtistAnalytics />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/artist-application" element={<ArtistApplication />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/my-feedbacks" element={<MyFeedbacks />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
