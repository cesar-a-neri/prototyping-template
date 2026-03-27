import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CommandPalette from './components/CommandPalette';
import { ThemeProvider } from './lib/theme';
import { ConfigProvider } from './lib/config';
import { TooltipProvider } from './components/ui/tooltip';
import { getPrototypeRoutes } from './utils/prototypes';
import { PrototypeRoute } from './types';
import { Agentation } from 'agentation';
import { DebugModeProvider, useDebugMode } from './lib/tweakpane';

const DebugAgentation: React.FC = () => {
  const { debugMode } = useDebugMode();
  return debugMode ? <Agentation /> : null;
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
    <DebugModeProvider>
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
          {import.meta.env.DEV && <DebugAgentation />}
        </TooltipProvider>
      </ConfigProvider>
    </ThemeProvider>
    </DebugModeProvider>
  );
};

export default App;
