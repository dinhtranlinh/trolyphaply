'use client';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
  subtitle?: string;
}

export default function KPICard({
  title,
  value,
  icon,
  color = 'blue',
  subtitle,
}: KPICardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${colorClasses[color]}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}
