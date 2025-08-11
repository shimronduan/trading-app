'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Settings, 
  TrendingUp, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Wallet,
  TrendingDown
} from 'lucide-react';
import { cn, formatCurrency, formatPercentage } from '@/utils';
import { useTheme } from '@/lib/theme';
import { useBinanceAccountInfo } from '@/hooks';
import { NavItem } from '@/types';

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    label: 'ATR Multiples',
    href: '/atr-multiples',
    icon: TrendingUp,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isDarkMode, toggleTheme } = useTheme();
  const { data: accountData } = useBinanceAccountInfo();

  const accountInfo = accountData?.data;
  const totalBalance = accountInfo ? parseFloat(accountInfo.totalWalletBalance) : 0;
  const unrealizedPnl = accountInfo ? parseFloat(accountInfo.totalUnrealizedPnl) : 0;
  const pnlPercentage = totalBalance > 0 ? (unrealizedPnl / totalBalance) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Trading Bot
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}
              >
                <Icon className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  isActive
                    ? "text-blue-500 dark:text-blue-400"
                    : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Account Info in Sidebar */}
        {accountInfo && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Wallet className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Total Balance
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(totalBalance)}
                </p>
                <div className="flex items-center space-x-1">
                  {unrealizedPnl >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    unrealizedPnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {formatCurrency(unrealizedPnl)} ({formatPercentage(pnlPercentage)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 lg:ml-0">
        {/* Top navbar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:ml-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            {/* Page title or breadcrumb */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h2>
            </div>

            {/* Top right - Account info (desktop) and theme toggle */}
            <div className="flex items-center space-x-4">
              {/* Desktop account info */}
              {accountInfo && (
                <div className="hidden sm:flex items-center space-x-4 text-sm">
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(totalBalance)}
                    </div>
                    <div className={cn(
                      "flex items-center justify-end space-x-1",
                      unrealizedPnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      {unrealizedPnl >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {formatCurrency(unrealizedPnl)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 lg:pb-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40">
        <div className="grid grid-cols-3 gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-3 px-1 text-xs font-medium",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
