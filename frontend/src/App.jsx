import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import MyTourBookingsPage from './pages/MyTourBookingsPage';
import EnterpriseDashboardPage from './pages/enterprise/EnterpriseDashboardPage';
import EnterpriseProfilePage from './pages/enterprise/EnterpriseProfilePage';
import EnterpriseVacanciesPage from './pages/enterprise/EnterpriseVacanciesPage';
import EnterpriseVacancyFormPage from './pages/enterprise/EnterpriseVacancyFormPage';
import EnterpriseApplicationsPage from './pages/enterprise/EnterpriseApplicationsPage';
import EnterpriseToursPage from './pages/enterprise/EnterpriseToursPage';
import EnterpriseTourFormPage from './pages/enterprise/EnterpriseTourFormPage';
import EnterpriseTourBookingsPage from './pages/enterprise/EnterpriseTourBookingsPage';
import EnterpriseAllTourBookingsPage from './pages/enterprise/EnterpriseAllTourBookingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import './styles/globals.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Header />
        <main className="app-main container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/login" element={<LoginPage />} />

            {/* Catalog */}
            <Route path="/enterprises" element={<EnterprisesPage />} />
            <Route path="/enterprise/:slug" element={<EnterpriseDetailPage />} />
            <Route path="/vacancies" element={<VacanciesPage />} />
            <Route path="/vacancy/:id" element={<VacancyDetailPage />} />
            <Route path="/tours" element={<ToursPage />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/assessment" element={<AssessmentPage />} />
            <Route path="/dashboard/recommendations" element={<RecommendationsPage />} />
            <Route path="/dashboard/applications" element={<MyApplicationsPage />} />
            <Route path="/dashboard/tour-bookings" element={<MyTourBookingsPage />} />

            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/dashboard/profile" element={
              <div className="page-content">
                <div className="page-header">
                  <h2>Профиль</h2>
                  <p>Скоро доступно</p>
                </div>
              </div>
            } />
            <Route path="/dashboard/digital-passport" element={<DigitalPassportPage />} />
            <Route path="/dashboard/messages" element={
              <div className="page-content">
                <div className="page-header">
                  <h2>Сообщения</h2>
                  <p>Скоро доступно</p>
                </div>
              </div>
            } />
            {/* Admin routes */}
            {/* Messages */}
            <Route element={<ProtectedRoute roles={['seeker', 'student', 'enterprise_user']} />}>
              <Route path="/messages" element={<MessagesPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={['superadmin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            <Route element={<ProtectedRoute roles={['enterprise_user']} />}>
              <Route path="/enterprise/dashboard" element={<EnterpriseDashboardPage />} />
              <Route path="/enterprise/profile" element={<EnterpriseProfilePage />} />
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
