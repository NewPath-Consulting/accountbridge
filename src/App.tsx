import './App.css'
import {BrowserRouter as Router, Routes, Route, useLocation, ScrollRestoration, Navigate} from "react-router-dom";
import {Navbar} from "./components/navbar/Navbar.tsx";
import Sidebar from "./components/sidebar/Sidebar.tsx";
import {CreatMakeAccountPage} from "./pages/create-account-page/CreatMakeAccount.tsx";
import {CreateConnectionsPage} from "./pages/create-connections-page/CreateConnections.tsx";
import {CustomerInformationPage} from "./pages/customer-info-page/CustomerInformationPage.tsx";
import OAuthSuccess from "./pages/OAuthSuccess.tsx";
import {InvoiceConfigPage} from "./pages/invoice-configuration-page/InvoiceConfigPage.tsx";
import {PaymentConfigPage} from "./pages/payment-config-page/PaymentConfigPage.tsx";
import {DonationConfigPage} from "./pages/donation-config-page/DonationConfigPage.tsx";
import ProgressBar2 from "./components/progress-bar-2/ProgressBar2.tsx";
import {CloneScenariosPage} from "./pages/clone-scenarios-page/CloneScenariosPage.tsx";
import {SchedulingPage} from "./pages/scheduling-page/SchedulingPage.tsx";
import {GeneralInformationPage} from "./pages/general-information-page/GeneralInformationPage.tsx";
import {OnBoardingProvider} from "./contexts/onBoardingContext.tsx";
import {ONBOARDING_STEPS} from "./onboardingSteps.tsx";
import {useEffect, useRef} from "react";
import {ProtectedOnboardingRoute} from "./components/protected-onboarding-route/ProtectedOnboardingRoute.tsx";
import {ScrollToTop} from "./components/scroll-to-top/ScrollToTop.tsx";
import {RunScenariosPage} from "./pages/run-scenarios-page/RunScenariosPage.tsx";
import {LoginPage} from "./pages/auth/LoginPage.tsx";
import {RegistrationPage} from "./pages/auth/RegistrationPage.tsx";
import {AuthContext, AuthProvider} from "./contexts/AuthContext.tsx";
import {ProtectedRoute} from "./components/protected-onboarding-route/ProtectedRoute.tsx";

//26aba993-f746-44bf-9378-e71a2ffae2e6
// teamId: 740188, folderId = 220109
//teamId: 740495, folderId = 246724
export const folderId = 63437;
function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
        {/* Standalone Login & Register Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        {/* Onboarding Pages with Layout */}
        <Route
          path="/*"
          element={
          <ProtectedRoute>
            <OnBoardingProvider>
              <div className="app-container">
                <div className="navbar">
                  <Navbar />
                </div>
                <div className="main-layout">
                  <Sidebar className="sidebar" />
                  <div className="content-area">
                    <div className="progress-bar">
                      <ProgressBar2 />
                    </div>
                    <Routes>
                      <Route path="/" element={<CreatMakeAccountPage />} />
                      <Route path="/create-connections" element={<ProtectedOnboardingRoute><CreateConnectionsPage /></ProtectedOnboardingRoute>} />
                      <Route path="/customer-information" element={<ProtectedOnboardingRoute><CustomerInformationPage /></ProtectedOnboardingRoute>} />
                      <Route path="/invoice-config" element={<ProtectedOnboardingRoute><InvoiceConfigPage /></ProtectedOnboardingRoute>} />
                      <Route path="/oauth-success" element={<OAuthSuccess />} />
                      <Route path="/payment-config" element={<ProtectedOnboardingRoute><PaymentConfigPage /></ProtectedOnboardingRoute>} />
                      <Route path="/donation-config" element={<ProtectedOnboardingRoute><DonationConfigPage /></ProtectedOnboardingRoute>} />
                      <Route path="/clone-scenarios" element={<ProtectedOnboardingRoute><CloneScenariosPage /></ProtectedOnboardingRoute>} />
                      <Route path="/job-scheduling" element={<ProtectedOnboardingRoute><SchedulingPage /></ProtectedOnboardingRoute>} />
                      <Route path="/general-information" element={<ProtectedOnboardingRoute><GeneralInformationPage /></ProtectedOnboardingRoute>} />
                      <Route path="/run-and-test" element={<ProtectedOnboardingRoute><RunScenariosPage /></ProtectedOnboardingRoute>} />
                    </Routes>
                  </div>
                </div>
              </div>
            </OnBoardingProvider>
          </ProtectedRoute>
          }
        />
      </Routes>
      </AuthProvider>
    </Router>


  );
}

export default App
