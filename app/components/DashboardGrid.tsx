import { 
  Calendar, 
  ShoppingCart, 
  Users, 
  MapPin,  
  Settings, 
  HelpCircle, 
} from 'lucide-react';
import toast from 'react-hot-toast';
import AppTile from './AppTile';

const apps = [
  // Row 1
  { title: 'Calendar', icon: Calendar, href: '/calendar', color: 'bg-blue-500' },
  { title: 'Shopping', icon: ShoppingCart, href: '/shopping', color: 'bg-green-500' },
  
  // Row 2
  { title: 'Family', icon: Users, color: 'bg-purple-500', onClick: () => toast.error('Feature currently unavailable') },
  { title: 'Help', icon: HelpCircle, href: '/demo', color: 'bg-red-500' },
  
  // Row 3
  { title: 'Nada', icon: MapPin, color: 'bg-teal-500', onClick: () => toast.error('Feature currently unavailable') },
  { title: 'Settings', icon: Settings, href: '/settings', color: 'bg-gray-600' },
];

export default function DashboardGrid() {
  return (
    <div className="grid grid-cols-2 gap-6 p-6 max-w-sm mx-auto">
      {apps.map((app, index) => (
        <div key={index} className="col-span-1">
          <AppTile {...app} />
        </div>
      ))}
    </div>
  );
} 