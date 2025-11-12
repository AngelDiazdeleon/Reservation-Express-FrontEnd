import React from 'react';

interface StatCard {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: string;
  color: 'blue' | 'green' | 'amber' | 'red' | 'teal';
}

interface StatsCardsProps {
  stats: StatCard[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
      green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
      amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
      red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
      teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="stats-cards-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div className="stat-header">
            <div className={`stat-icon ${getColorClasses(stat.color)}`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <div className="stat-info">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
              {stat.trend && (
                <p className={`stat-trend ${stat.trend.isPositive ? 'positive' : 'negative'}`}>
                  {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;