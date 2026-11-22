import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './app/global.scss';
import App from './App';
import AppProvider from './app/provider/appProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppProvider>
    <Router>
      <App />
    </Router>
  </AppProvider>
);
