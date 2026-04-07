import { MapPin, Bell, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import './FeaturesSection.css';
import { useNavigate } from 'react-router-dom';

const FeaturesSection = () => {
  const navigate = useNavigate();
  const features = [
    {
      title: "Interactive Live Map",
      description: "Visualize all reported issues in your community on a real-time, interactive map dashboard.",
      icon: <MapPin size={28} />
    },
    {
      title: "Smart Categorization",
      description: "Our AI auto-tags your photo and assigns it to the exact right local authority instantly.",
      icon: <CheckCircle size={28} />
    },
    {
      title: "Instant Notifications",
      description: "Receive push notifications and email updates the moment your reported issue is resolved.",
      icon: <Bell size={28} />
    },
    {
      title: "Secure & Anonymous",
      description: "We protect your identity. Report sensitive issues with confidence using our secure platform.",
      icon: <ShieldCheck size={28} />
    },
    {
      title: "24/7 Availability",
      description: "Local problems don't sleep, and neither do we. Submit reports 24 hours a day, 7 days a week.",
      icon: <Clock size={28} />
    }
  ];

  return (
    <section className="features-section section">
      <div className="container">
        
        <div className="features-header text-center">
          <div className="badge">Platform Features</div>
          <h2 className="section-title">Everything you need to improve your city</h2>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
          
          <div className="feature-cta-card">
            <h3>Ready to make a difference?</h3>
            <p>Join thousands of citizens improving their neighborhoods today.</p>
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>
              Get Started Now
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
