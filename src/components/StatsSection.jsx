import { Users, FileWarning, CheckSquare } from 'lucide-react';
import './StatsSection.css';

const StatsSection = () => {
  const stats = [
    {
      label: "Active Citizens",
      value: "15,200+",
      icon: <Users size={24} />
    },
    {
      label: "Issues Reported",
      value: "8,940",
      icon: <FileWarning size={24} />
    },
    {
      label: "Issues Resolved",
      value: "7,450",
      icon: <CheckSquare size={24} />
    }
  ];

  return (
    <section className="stats-section">
      <div className="container stats-container">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
