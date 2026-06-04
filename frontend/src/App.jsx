import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import HowItWorksPage from './pages/HowItWorksPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AssessmentPage from './pages/AssessmentPage';
import DashboardPage from './pages/DashboardPage';
import RecommendationsPage from './pages/RecommendationsPage';
import EnterprisesPage from './pages/EnterprisesPage';
import EnterpriseDetailPage from './pages/EnterpriseDetailPage';
import VacanciesPage from './pages/VacanciesPage';
import VacancyDetailPage from './pages/VacancyDetailPage';
import ToursPage from './pages/ToursPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import MessagesPage from './pages/MessagesPage';
import DigitalPassportPage from './pages/DigitalPassportPage';
import ProfilePage from './pages/ProfilePage';
import MyTourBookingsPage from './pages/MyTourBookingsPage';
import EnterpriseDashboardPage from './pages/enterprise/EnterpriseDashboardPage';
import EnterpriseProfilePage from './pages/enterprise/EnterpriseProfilePage';
import EnterpriseMyProfilePage from './pages/enterprise/EnterpriseMyProfilePage';
import EnterpriseVacanciesPage from './pages/enterprise/EnterpriseVacanciesPage';
import EnterpriseVacancyFormPage from './pages/enterprise/EnterpriseVacancyFormPage';
import EnterpriseApplicationsPage from './pages/enterprise/EnterpriseApplicationsPage';
import EnterpriseToursPage from './pages/enterprise/EnterpriseToursPage';
import EnterpriseTourFormPage from './pages/enterprise/EnterpriseTourFormPage';
import EnterpriseTourBookingsPage from './pages/enterprise/EnterpriseTourBookingsPage';
import EnterpriseAllTourBookingsPage from './pages/enterprise/EnterpriseAllTourBookingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import { useAuthStore } from './store/authStore';
import './styles/globals.css';
import './App.css';

function AuthRedirect({ children }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return children;
  }

  // Редирект по ролям
  if (user.role === 'superadmin') {
    return <Navigate to="/admin" replace />;
  }
  if (user.role === 'enterprise_user') {
    return <Navigate to="/enterprise/dashboard" replace />;
  }

  return children;
}

function DashboardRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Админа — в админку
  if (user.role === 'superadmin') {
    return <Navigate to="/admin" replace />;
  }
  // HR — в панель предприятия
  if (user.role === 'enterprise_user') {
    return <Navigate to="/enterprise/dashboard" replace />;
  }

  return <DashboardPage />;
}

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Router>
      <div className="app-layout">
        <Header />
        <main className="app-main container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/register" element={<AuthRedirect><RegisterPage /></AuthRedirect>} />
            <Route path="/auth/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />

            {/* Catalog */}
            <Route path="/enterprises" element={<EnterprisesPage />} />
            <Route path="/enterprise/:slug" element={<EnterpriseDetailPage />} />
            <Route path="/vacancies" element={<VacanciesPage />} />
            <Route path="/vacancy/:id" element={<VacancyDetailPage />} />
            <Route path="/tours" element={<ToursPage />} />

            {/* Dashboard with role redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/dashboard/assessment" element={<AssessmentPage />} />
            <Route path="/dashboard/recommendations" element={<RecommendationsPage />} />
            <Route path="/dashboard/applications" element={<MyApplicationsPage />} />
            <Route path="/dashboard/tour-bookings" element={<MyTourBookingsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/digital-passport" element={<DigitalPassportPage />} />

            {/* Messages */}
            <Route element={<ProtectedRoute roles={['seeker', 'student', 'enterprise_user']} />}>
              <Route path="/messages" element={<MessagesPage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<ProtectedRoute roles={['superadmin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Enterprise HR routes */}
            <Route element={<ProtectedRoute roles={['enterprise_user']} />}>
              <Route path="/enterprise/dashboard" element={<EnterpriseDashboardPage />} />
              <Route path="/enterprise/profile" element={<EnterpriseProfilePage />} />
              <Route path="/enterprise/my-profile" element={<EnterpriseMyProfilePage />} />
              <Route path="/enterprise/vacancies" element={<EnterpriseVacanciesPage />} />
              <Route path="/enterprise/vacancies/new" element={<EnterpriseVacancyFormPage />} />
              <Route path="/enterprise/vacancies/:id/edit" element={<EnterpriseVacancyFormPage />} />
              <Route path="/enterprise/applications" element={<EnterpriseApplicationsPage />} />
              <Route path="/enterprise/tours" element={<EnterpriseToursPage />} />
              <Route path="/enterprise/tours/new" element={<EnterpriseTourFormPage />} />
              <Route path="/enterprise/tours/:id/edit" element={<EnterpriseTourFormPage />} />
              <Route path="/enterprise/tours/:id/bookings" element={<EnterpriseTourBookingsPage />} />
              <Route path="/enterprise/tour-bookings" element={<EnterpriseAllTourBookingsPage />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;