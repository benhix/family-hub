'use client';

import { useResolveUserName } from '../hooks/useResolveUserName';

interface DynamicUserNameProps {
  userId?: string;
  fallbackName: string;
  className?: string;
}

export default function DynamicUserName({ userId, fallbackName, className = '' }: DynamicUserNameProps) {
  const resolvedName = useResolveUserName(userId, fallbackName);
  
  return <span className={className}>{resolvedName}</span>;
} 