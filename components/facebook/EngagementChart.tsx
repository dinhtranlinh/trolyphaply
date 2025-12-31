'use client';

interface DailyStat {
  date: string;
  total: number;
  successful: number;
  failed: number;
}

interface EngagementChartProps {
  data: DailyStat[];
  title?: string;
  height?: number;
}

export default function EngagementChart({ 
  data, 
  title = '7-Day Activity Trend',
  height = 300 
}: EngagementChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="flex items-center justify-center py-12 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
      
      <div className="space-y-2">
        {data.map((day) => {
          const successPercent = (day.successful / maxTotal) * 100;
          const failedPercent = (day.failed / maxTotal) * 100;

          return (
            <div key={day.date} className="flex items-center gap-3">
              <div className="w-24 text-sm text-gray-600">
                {new Date(day.date).toLocaleDateString('vi-VN', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden flex">
                {day.successful > 0 && (
                  <div
                    className="bg-green-500 h-full transition-all hover:bg-green-600"
                    style={{ width: `${successPercent}%` }}
                    title={`Success: ${day.successful}`}
                  ></div>
                )}
                {day.failed > 0 && (
                  <div
                    className="bg-red-500 h-full transition-all hover:bg-red-600"
                    style={{ width: `${failedPercent}%` }}
                    title={`Failed: ${day.failed}`}
                  ></div>
                )}
              </div>
              <div className="w-16 text-sm text-gray-600 text-right font-medium">
                {day.total}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Success</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">Failed</span>
        </div>
        <div className="ml-auto text-gray-500">
          Total: {data.reduce((sum, day) => sum + day.total, 0)}
        </div>
      </div>
    </div>
  );
}
