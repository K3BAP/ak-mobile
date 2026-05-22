import { AnimatePresence, MotionConfig } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { FavoritesProvider } from "./FavoritesContext";
import { ThemeProvider } from "./ThemeContext";
import { EventLayout } from "./components/EventLayout";
import { EventsScreen } from "./screens/EventsScreen";
import { NowNextScreen } from "./screens/NowNextScreen";
import { ScheduleScreen } from "./screens/ScheduleScreen";
import { BrowseScreen } from "./screens/BrowseScreen";
import { AKDetailScreen } from "./screens/AKDetailScreen";
import { RoomsScreen } from "./screens/RoomsScreen";
import { AgendaScreen } from "./screens/AgendaScreen";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<EventsScreen />} />
        <Route path="/:slug" element={<EventLayout />}>
          <Route index element={<Navigate to="now" replace />} />
          <Route path="now" element={<NowNextScreen />} />
          <Route path="schedule" element={<ScheduleScreen />} />
          <Route path="browse" element={<BrowseScreen />} />
          <Route path="rooms" element={<RoomsScreen />} />
          <Route path="agenda" element={<AgendaScreen />} />
          <Route path="ak/:akId" element={<AKDetailScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <FavoritesProvider>
          <AnimatedRoutes />
        </FavoritesProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}
