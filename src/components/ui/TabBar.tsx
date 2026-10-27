import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Dumbbell, BarChart2, Settings } from 'lucide-react';

export type TabId = 'nutrition' | 'workout' | 'progress' | 'settings';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'nutrition', label: 'Nutrition', icon: Home },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'progress', label: 'Progress', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-system-grouped-background border-t border-system-border" />
    );
  }

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-system-grouped-background/95 backdrop-blur supports-[backdrop-filter]:bg-system-grouped-background/80 border-t border-system-border safe-area-bottom"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        <AnimatePresence mode="wait">
          {TABS.map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={tab.label}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[72px] ${
                activeTab === tab.id
                  ? 'bg-system-blue/10 text-system-blue'
                  : 'text-system-muted-foreground active:text-system-foreground'
              }`}
            >
              <tab.icon className="w-6 h-6" aria-hidden="true" />
              <span className="text-xs font-medium">{tab.label}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}