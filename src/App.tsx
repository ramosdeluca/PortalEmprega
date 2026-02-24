import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Briefcase, Building2, LayoutDashboard, LogOut, Menu, X, Search, MapPin, Users, PlusCircle, CheckCircle, Clock, MessageCircle, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import Home from './pages/Home';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Apply from './pages/Apply';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SignupCandidate from './pages/SignupCandidate';
import Subscription from './pages/Subscription';
import Dashboard from './pages/Dashboard';
import CandidateDashboard from './pages/CandidateDashboard';
import CreateJob from './pages/CreateJob';
import ManageJobs from './pages/ManageJobs';
import CandidateList from './pages/CandidateList';
import PotentialCandidatesList from './pages/PotentialCandidatesList';
import Settings from './pages/Settings';

import { api } from './services/api';
import { supabase } from './services/supabase';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState<any>(null);
  const [candidate, setCandidate] = useState<any>(null);

  const fetchUserData = async () => {
    const role = await api.auth.getUserRole();
    if (role === 'candidate') {
      const data = await api.candidate.getMe();
      setCandidate(data);
      setCompany(null);
    } else {
      const data = await api.company.getMe();
      setCompany(data);
      setCandidate(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData();
      } else {
        setCompany(null);
        setCandidate(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname]);

  const handleLogout = async () => {
    await api.auth.signOut();
    navigate('/');
  };

  const isCompanyRoute = location.pathname.startsWith('/company');

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-lg overflow-hidden flex items-center justify-center w-10 h-10">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-900 tracking-tight">PortalEmprega</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/jobs" className="text-zinc-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors">
              Ver Vagas
            </Link>
            {!company && !candidate ? (
              <>
                <Link to="/signup-candidate" className="text-zinc-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors">
                  Sou Interessado
                </Link>
                <Link to="/login" className="text-zinc-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                  Sou Empresa
                </Link>
              </>
            ) : company ? (
              <>
                <Link to="/company/dashboard" className="flex items-center gap-2 text-zinc-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  Painel Empresa
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-zinc-600 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/candidate/dashboard" className="flex items-center gap-2 text-zinc-600 hover:text-emerald-600 px-3 py-2 text-sm font-medium transition-colors">
                  <User className="w-4 h-4" />
                  Meu Currículo
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-zinc-600 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-zinc-500 hover:bg-zinc-100 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-200 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/jobs" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-emerald-600 hover:bg-zinc-50">
                Ver Vagas
              </Link>
              {!company ? (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-emerald-600 hover:bg-zinc-50">
                    Login Empresa
                  </Link>
                  <Link to="/signup" className="block px-3 py-2 rounded-md text-base font-medium text-emerald-600 font-semibold">
                    Cadastrar Empresa
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/company/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-zinc-700 hover:text-emerald-600 hover:bg-zinc-50">
                    Painel
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">
                    Sair
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/jobs/:id/apply" element={<Apply />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup-candidate" element={<SignupCandidate />} />

            {/* Candidate Routes */}
            <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
            <Route path="/company/subscription" element={<Subscription />} />
            <Route path="/company/dashboard" element={<Dashboard />} />
            <Route path="/company/jobs/new" element={<CreateJob />} />
            <Route path="/company/jobs/:id/edit" element={<CreateJob />} />
            <Route path="/company/jobs" element={<ManageJobs />} />
            <Route path="/company/jobs/:id/candidates" element={<CandidateList />} />
            <Route path="/company/jobs/:id/potential-candidates" element={<PotentialCandidatesList />} />
            <Route path="/company/settings" element={<Settings />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-zinc-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="bg-emerald-600 p-1 rounded">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-zinc-900 tracking-tight">PortalEmprega</span>
            </div>
            <p className="text-zinc-500 text-sm">
              © 2026 PortalEmprega. Conectando talentos a oportunidades incríveis.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
