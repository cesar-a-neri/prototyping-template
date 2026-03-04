import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Navigation Component
const Navigation: React.FC = () => {
    const tabs = [
        { id: 'agents', label: 'Agents' },
        { id: 'traces', label: 'Traces' },
        { id: 'evaluations', label: 'Evaluations', active: true },
        { id: 'workflows', label: 'Workflows' },
        { id: 'assets', label: 'Assets' },
    ];

    return (
        <nav className="bg-white border-b border-border">
            <div className="flex items-center justify-between px-4 py-2">
                {/* Left side - Logo, Project selector, and Tabs */}
                <div className="flex items-center gap-2">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="w-6 h-6"
                        />
                        {/* Project Dropdown */}
                        <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-hover text-sm font-medium">
                            Manta
                            <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Tabs - Hidden on mobile, visible on md+ */}
                    <div className="hidden md:flex items-center gap-1 ml-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={cn(
                                    "px-2 h-7 text-sm font-medium rounded transition-colors flex items-center justify-center",
                                    tab.active
                                        ? "text-foreground bg-[#d9daff]"
                                        : "text-muted-foreground hover:text-foreground hover:bg-hover"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right side - Avatar */}
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-foreground">
                        C
                    </div>
                </div>
            </div>

            {/* Mobile tabs - Full width below on small screens */}
            <div className="md:hidden border-t border-border overflow-x-auto">
                <div className="flex items-center gap-1 px-4 py-2 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={cn(
                                "px-2 h-7 text-sm font-medium rounded whitespace-nowrap transition-colors flex items-center justify-center",
                                tab.active
                                    ? "text-foreground bg-[#d9daff]"
                                    : "text-muted-foreground hover:text-foreground hover:bg-hover"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export { Navigation };
