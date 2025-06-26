import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import React, { useState } from "react";
import { routeArray } from "@/config/routes";
import ApperIcon from "@/components/ApperIcon";
const Layout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-surface-200 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold font-display text-gray-900">
                  AttendTrack
                </h1>
              </div>
            </div>

            {/* Current Date */}
            <div className="hidden md:block">
              <div className="text-sm text-gray-600">{currentDate}</div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <ApperIcon name={mobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
              </button>
</div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              <nav className="flex space-x-1">
                {routeArray && Array.isArray(routeArray) ? (
                routeArray.map((route) => {
                  if (!route || !route.id || !route.path) return null;
                  return (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`
                      }
                    >
                      {route.icon && <ApperIcon name={route.icon} className="w-4 h-4 mr-2" />}
                      {route.label || 'Navigation Item'}
                    </NavLink>
                  );
                })
              ) : (
                <div className="text-gray-500 text-sm">Navigation loading...</div>
              )}
            </nav>
</div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-surface-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-1">
              {routeArray && Array.isArray(routeArray) ? (
                routeArray.map((route) => {
                  if (!route || !route.id || !route.path) return null;
                  return (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`
                      }
                    >
                      {route.icon && <ApperIcon name={route.icon} className="w-5 h-5 mr-3" />}
                      {route.label || 'Navigation Item'}
                    </NavLink>
                  );
                })
              ) : (
                <div className="text-gray-500 text-base px-3 py-2">Navigation loading...</div>
              )}
            </div>
</div>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;