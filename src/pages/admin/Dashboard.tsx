import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, Image, Map, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const modules = [
    {
      title: 'Exhibitions',
      description: 'Manage museum exhibitions and featured content',
      icon: <Image className="h-8 w-8 text-indigo-600" />,
      link: '/admin/exhibitions'
    },
    {
      title: 'Artists',
      description: 'Manage artist profiles and portfolios',
      icon: <Users className="h-8 w-8 text-indigo-600" />,
      link: '/admin/artists'
    },
    {
      title: 'Map',
      description: 'Manage map and artwork locations',
      icon: <Map className="h-8 w-8 text-indigo-600" />,
      link: '/admin/map'
    },
    {
      title: 'History',
      description: 'Manage historical content and milestones',
      icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
      link: '/admin/history'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link
            key={module.title}
            to={module.link}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              {module.icon}
              <div>
                <h2 className="text-lg font-semibold">{module.title}</h2>
                <p className="text-gray-600">{module.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}