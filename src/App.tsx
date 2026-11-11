import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { StartCampaignPage } from './pages/StartCampaignPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { supabase } from './lib/supabase';

function ScrollToTop() {
  window.scrollTo(0, 0);
  return null;
}

export default function App() {
  const [toast, setToast] = useState<string | null>(null);

  const handleNewsletter = async (email: string) => {
    const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim() });
    if (error) setToast('Could not subscribe — please try again.');
    else setToast('You are subscribed. Welcome to GiveRoot!');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
            <Route path="/start" element={<StartCampaignPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </main>
        <Footer onNewsletterSubmit={handleNewsletter} />
      </div>
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-primary-900 px-5 py-3 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}
    </BrowserRouter>
  );
}
