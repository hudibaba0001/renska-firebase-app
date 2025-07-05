import React from 'react'
import { Card } from 'flowbite-react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

export default function DashboardCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  trendDirection,
  description,
  color = 'blue',
  href
}) {
  const Icon = icon
  const colorClasses = {
    blue: {
      icon: 'bg-blue-50 text-blue-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    },
    green: {
      icon: 'bg-green-50 text-green-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    },
    purple: {
      icon: 'bg-purple-50 text-purple-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    },
    red: {
      icon: 'bg-red-50 text-red-600',
      trend: trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
    }
  }

  const CardContent = () => (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 font-mono">{value}</p>
          {(trend || description) && (
            <div className="mt-2 flex items-center text-sm">
              {trend && (
                <div className={`flex items-center ${colorClasses[color].trend}`}>
                  {trendDirection === 'up' ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-medium">{trendValue}</span>
                  <span className="ml-1">{trend}</span>
                </div>
              )}
              {description && (
                <span className={`${trend ? 'ml-2 pl-2 border-l border-gray-300' : ''} text-gray-500`}>
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${colorClasses[color].icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )

  if (href) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer border-0 ring-1 ring-gray-200 hover:ring-gray-300">
        <a href={href} className="block">
          <CardContent />
        </a>
      </Card>
    )
  }

  return (
    <Card className="border-0 ring-1 ring-gray-200">
      <CardContent />
    </Card>
  )
} 