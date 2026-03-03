import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CommandPalette from './components/CommandPalette';
import { ThemeProvider } from './lib/theme';
import { ConfigProvider } from './lib/config';
import { TooltipProvider } from './components/ui/tooltip';
import { getPrototypeRoutes } from './utils/prototypes';

type PrototypeRoute = {
  path: string;
  title: string;
  module: () => Promise<{ default: React.ComponentType }>;
  sourceFiles: Array<{ path: string; content: string }>;
};

const App: React.FC = () => {
  const [routes, setRoutes] = useState<PrototypeRoute[]>([]);

  useEffect(() => {
    const loadRoutes = async () => {
      const prototypeRoutes = await getPrototypeRoutes();
      setRoutes(prototypeRoutes);
    };
    loadRoutes();
  }, []);

  return (
    <ThemeProvider defaultTheme="light">
      <ConfigProvider>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground theme-transition">
              <CommandPalette prototypes={routes} />
              <main className="w-full max-w-full overflow-x-hidden">
                <Suspense fallback={
                  <div className="text-center py-8 text-muted-foreground">
                    Loading...
                  </div>
                }>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        routes.length > 0
                          ? <Navigate to={routes[0]?.path || '/'} />
                          : <div className="text-center py-8 text-muted-foreground">
                            Loading prototypes...
                          </div>
                      }
                    />
                    {routes.map(({ path, module }) => {
                      const LazyComponent = lazy(module);
                      return (
                        <Route
                          key={path}
                          path={path}
                          element={<LazyComponent />}
                        />
                      );
                    })}
                  </Routes>
                </Suspense>
              </main>
            </div>
          </Router>
        </TooltipProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
};

export default App;
