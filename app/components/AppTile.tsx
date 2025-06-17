import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface AppTileProps {
  title: string;
  icon: LucideIcon;
  href?: string;
  color: string;
  description?: string;
  onClick?: () => void;
}

export default function AppTile({ title, icon: Icon, href, color, description, onClick }: AppTileProps) {
  const content = (
    <div className="flex flex-col items-center space-y-3 p-6 group">
      {/* App Icon */}
      <div className={`
        ${color}
        w-16 h-16 rounded-2xl 
        flex items-center justify-center
        shadow-lg shadow-black/10
        transition-all duration-200 
        group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-black/20
        group-active:scale-95 group-active:duration-75
      `}>
        <Icon size={28} className="text-white" />
      </div>
      
      {/* App Title */}
      <span className="text-sm font-medium text-gray-900 dark:text-white text-center leading-tight">
        {title}
      </span>
    </div>
  );

  // If onClick is provided, render as a button
  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full h-full">
        {content}
      </button>
    );
  }

  // Otherwise render as a Link (existing behavior)
  return (
    <Link href={href || '#'} className="block w-full h-full">
      {content}
    </Link>
  );
} 