import { MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <a href="/" className="logo">
            <MapPin className="logo-icon" size={28} />
            <span className="logo-text">CivicFix</span>
          </a>
          <p className="footer-description">
            Empowering citizens and local governments to build better, safer, and cleaner communities through AI-driven insights.
          </p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>Platform</h4>
            <a href="#">Report Issue</a>
            <a href="#">Live Map</a>
            <a href="#">Leaderboard</a>
          </div>
          <div className="link-group">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div className="link-group">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} CivicFix Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
