import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Settings,
  Menu,
  X,
  UserCog,
  Ghost,
  Brain,
  FileText,
  Workflow
} from 'lucide-react'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: UserCog },
  { name: 'Workflows', href: '/workflows', icon: Workflow },
  { name: 'Files', href: '/files', icon: FileText },
  { name: 'CEO', href: '/ceo', icon: UserCog },
  { name: 'Ghost', href: '/ghost', icon: Ghost },
  { name: 'Vitra', href: '/vitra', icon: Brain },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
          <div className="flex h-20 items-center justify-between px-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-2">
              <img src="/logo.svg" alt="VHQ LAG" className="h-10 w-auto" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-sidebar-foreground hover:text-sidebar-accent-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item ${
                    isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop collapsible sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-16 lg:flex-col group hover:w-64 transition-all duration-300 ease-in-out z-50">
        <div className="flex flex-col flex-grow bg-sidebar/40 backdrop-blur-md border-r border-sidebar-border/50">
          {/* Logo section with fixed height to prevent icon movement */}
          <div className="flex h-24 items-center justify-center border-b border-sidebar-border/50 group-hover:justify-start group-hover:px-4 group-hover:w-full">
            <div className="flex items-center space-x-2">
              {/* Small logo - always visible with more space */}
              <img src="/logo-small.svg" alt="VHQ LAG" className="h-8 w-auto group-hover:hidden" />
              {/* Full logo - only visible on hover with better space usage */}
              <div className="hidden group-hover:flex group-hover:items-center group-hover:space-x-2 group-hover:w-full">
                <img src="/logo.svg" alt="VHQ LAG" className="h-12 w-auto group-hover:max-w-full" />
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive 
                      ? 'bg-sidebar-accent/60 text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                  }`}
                  title={item.name}
                >
                  <item.icon className="h-5 w-5 group-hover:mr-3" />
                  <span className="hidden group-hover:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content - use full width */}
      <div className="lg:pl-16">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-foreground hover:text-muted-foreground"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="VHQ LAG" className="h-6 w-auto" />
          </div>
        </div>

        {/* Page content - use full width */}
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  )
} 