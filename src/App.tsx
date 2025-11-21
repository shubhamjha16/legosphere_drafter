import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BuyWords from './pages/BuyWords';
import DraftingPage from './pages/DraftingPage';
import ResearchPage from './pages/ResearchPage';
import ChatPdfPage from './pages/ChatPdfPage';
import GenerateArgumentsPage from './pages/GenerateArgumentsPage';
import LegalMemoPage from './pages/LegalMemoPage';
import ReviewDraftPage from './pages/ReviewDraftPage';
import CaseFlowPage from './pages/CaseFlowPage';
import { UsageProvider } from './context/UsageContext';

function App() {
  return (
    <UsageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="buy-words" element={<BuyWords />} />
            <Route path="draft" element={<DraftingPage />} />
            <Route path="research" element={<ResearchPage />} />
            <Route path="chat-pdf" element={<ChatPdfPage />} />
            <Route path="generate-arguments" element={<GenerateArgumentsPage />} />
            <Route path="legal-memo" element={<LegalMemoPage />} />
            <Route path="review-draft" element={<ReviewDraftPage />} />
            <Route path="case-flow" element={<CaseFlowPage />} />
          </Route>
        </Routes>
      </Router>
    </UsageProvider>
  );
}

export default App;
