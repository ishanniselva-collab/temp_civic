import { Camera, ListChecks, CheckCircle } from 'lucide-react';
import './ExplainerSection.css';

const ExplainerSection = () => {
  const steps = [
    {
      icon: <Camera size={32} />,
      title: "1. Snap & Report",
      description: "See a pothole, broken streetlight, or garbage dump? Snap a picture and report it in seconds.",
      color: "blue"
    },
    {
      icon: <ListChecks size={32} />,
      title: "2. AI Processing",
      description: "Our AI automatically categorizes, routes, and alerts the correct government department.",
      color: "purple"
    },
    {
      icon: <CheckCircle size={32} />,
      title: "3. Faster Revolution",
      description: "Track the progress in real-time. Once it's fixed, you get notified and local spaces improve.",
      color: "green"
    }
  ];

  return (
    <section className="explainer section bg-white">
      <div className="container">
        
        <div className="section-header text-center">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Fixing your city has never been simpler. Just three steps away.</p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={index} className="step-card group">
              <div className={`step-icon-wrapper ${step.color}`}>
                {step.icon}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default ExplainerSection;
