import { useState } from 'react';
import { useSettings, DEFAULT_SETTINGS } from '@/services/database/useDatabase';
import Card from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { useToastHelpers } from '@/hooks/useToast';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { AlertTriangle, Download, Trash2, RefreshCw, Key, Smartphone, CheckCircle, Palette, Code2 } from 'lucide-react';

export function Settings() {
  const { settings, saveSettings, isReady } = useSettings();
  const { success, error } = useToastHelpers();
  const { isInstallable, install, isIOS, getIOSInstructions } = usePWAInstall();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return;
    setIsValidating(true);
    try {
      await saveSettings({ apiKey: apiKey.trim() });
      success('API Key Saved', 'Your Gemini API key has been updated.');
    } catch (err) {
      error('Failed to Save', 'Unable to save API key. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // This would need to import db from the database module
      const { db } = await import('@/services/database/schema');
      const [settingsData, metrics, routines, nutrition] = await Promise.all([
        db.settings.toArray(),
        db.bodyMetrics.toArray(),
        db.dailyRoutines.toArray(),
        db.nutritionLogs.toArray(),
      ]);

      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        settings: settingsData,
        bodyMetrics: metrics,
        dailyRoutines: routines,
        nutritionLogs: nutrition,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      success('Data Exported', 'Your fitness data has been downloaded as JSON.');
    } catch (err) {
      error('Export Failed', 'Unable to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('This will delete ALL your data including workouts, nutrition logs, and settings. This cannot be undone. Are you sure?')) {
      return;
    }

    if (!confirm('Last chance! This action is irreversible. Type "DELETE" to confirm.')) {
      return;
    }

    setIsClearing(true);
    try {
      const { clearAllData } = await import('@/services/database/db');
      await clearAllData();
      localStorage.removeItem('onboarding_complete');
      localStorage.removeItem('fitness_user_id');
      success('Data Cleared', 'All data has been reset. Reloading...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      error('Clear Failed', 'Unable to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const handleResetOnboarding = async () => {
    if (!confirm('Reset onboarding? You\'ll need to go through setup again.')) {
      return;
    }
    localStorage.removeItem('onboarding_complete');
    success('Onboarding Reset', 'Reload the app to start fresh.');
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-system-grouped-background">
        <div className="animate-spin rounded-full h-8 w-8 border-3 border-system-blue border-t-transparent" />
      </div>
    );
  }

  // settings could be undefined if useLiveQuery hasn't resolved yet
  const s = settings ?? DEFAULT_SETTINGS;
  const baseline = s.baselineMetrics;
  const macros = s.dailyMacroTargets;
  const dumbbells = s.dumbbellWeights;

  return (
    <div className="min-h-screen bg-system-grouped-background">
      <div className="safe-area-top" />

      <header className="sticky top-16 z-10 bg-system-grouped-background/95 backdrop-blur border-b border-system-border px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-system-foreground">Settings</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pb-24 space-y-6">
        {/* API Key Section */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-system-foreground flex items-center gap-2">
              <Key className="w-5 h-5" />
              AI API Key
            </h3>
          </div>
          <p className="text-sm text-system-muted-foreground">
            Your Gemini API key enables AI-powered nutrition parsing and workout generation.
          </p>
          <div className="flex gap-2">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={s.apiKey ? '••••••••••••••••' : 'Enter your Gemini API key'}
              className="flex-1"
            />
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showApiKey ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' } />
              </svg>
            </Button>
            <Button onClick={handleSaveApiKey} disabled={isValidating || !apiKey.trim()}>
              {isValidating ? 'Saving...' : 'Save'}
            </Button>
          </div>
          {s.apiKey && !apiKey && (
            <p className="text-xs text-system-green">API key is configured</p>
          )}
        </Card>

        {/* Units Section */}
        <Card className="p-4 space-y-4">
          <h3 className="font-medium text-system-foreground">Units</h3>
          <SegmentedControl
            options={[
              { id: 'metric', label: 'Metric (kg/cm)' },
              { id: 'imperial', label: 'Imperial (lbs/in)' },
            ]}
            selectedId={'metric'}
            onChange={() => {}}
          />
        </Card>

        {/* Baseline Metrics Section */}
        <Card className="p-4 space-y-4">
          <h3 className="font-medium text-system-foreground">Baseline Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (kg)"
              type="number"
              value={baseline.weight}
              onChange={e => saveSettings({ baselineMetrics: { ...baseline, weight: parseFloat(e.target.value) || 0 } })}
              step="0.1"
              min="30"
              max="300"
            />
            <Input
              label="Height (cm)"
              type="number"
              value={baseline.height}
              onChange={e => saveSettings({ baselineMetrics: { ...baseline, height: parseFloat(e.target.value) || 0 } })}
              step="1"
              min="100"
              max="250"
            />
            <Input
              label="Age"
              type="number"
              value={baseline.age}
              onChange={e => saveSettings({ baselineMetrics: { ...baseline, age: parseInt(e.target.value) || 0 } })}
              step="1"
              min="13"
              max="120"
            />
            <Input
              label="Gender"
              type="text"
              value={baseline.gender}
              onChange={e => saveSettings({ baselineMetrics: { ...baseline, gender: e.target.value as 'male' | 'female' } })}
            />
          </div>
        </Card>

        {/* Macro Targets Section */}
        <Card className="p-4 space-y-4">
          <h3 className="font-medium text-system-foreground">Daily Macro Targets</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Calories"
              type="number"
              value={macros.calories}
              onChange={e => saveSettings({ dailyMacroTargets: { ...macros, calories: parseInt(e.target.value) || 0 } })}
              step="50"
              min="800"
              max="5000"
            />
            <Input
              label="Protein (g)"
              type="number"
              value={macros.protein}
              onChange={e => saveSettings({ dailyMacroTargets: { ...macros, protein: parseInt(e.target.value) || 0 } })}
              step="5"
              min="30"
              max="500"
            />
            <Input
              label="Carbs (g)"
              type="number"
              value={macros.carbs}
              onChange={e => saveSettings({ dailyMacroTargets: { ...macros, carbs: parseInt(e.target.value) || 0 } })}
              step="5"
              min="20"
              max="800"
            />
            <Input
              label="Fat (g)"
              type="number"
              value={macros.fat}
              onChange={e => saveSettings({ dailyMacroTargets: { ...macros, fat: parseInt(e.target.value) || 0 } })}
              step="5"
              min="20"
              max="300"
            />
          </div>
        </Card>

        {/* Primary Goal Section */}
        <Card className="p-4 space-y-4">
          <h3 className="font-medium text-system-foreground">Primary Goal</h3>
          <SegmentedControl
            options={[
              { id: 'lose', label: 'Lose Weight' },
              { id: 'maintain', label: 'Maintain' },
              { id: 'gain', label: 'Gain Muscle' },
            ]}
            selectedId={s.primaryGoal || 'maintain'}
            onChange={id => saveSettings({ primaryGoal: id as 'lose' | 'maintain' | 'gain' })}
          />
        </Card>

        {/* Dumbbell Range Section */}
        <Card className="p-4 space-y-4">
          <h3 className="font-medium text-system-foreground">Dumbbell Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Weight (kg)"
              type="number"
              value={dumbbells.minKg}
              onChange={e => saveSettings({ dumbbellWeights: { ...dumbbells, minKg: parseFloat(e.target.value) || 0 } })}
              step="0.5"
              min="1"
              max="100"
            />
            <Input
              label="Max Weight (kg)"
              type="number"
              value={dumbbells.maxKg}
              onChange={e => saveSettings({ dumbbellWeights: { ...dumbbells, maxKg: parseFloat(e.target.value) || 0 } })}
              step="0.5"
              min="1"
              max="100"
            />
          </div>
        </Card>

        {/* Data Management Section */}
        <Card className="p-4 space-y-4 border-system-red/20">
          <h3 className="font-medium text-system-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-system-red" />
            Data Management
          </h3>

          <Button
            variant="secondary"
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full justify-start"
            leftIcon={<Download className="w-4 h-4" />}
          >
            {isExporting ? 'Exporting...' : 'Export All Data (JSON)'}
          </Button>

          <Button
            variant="secondary"
            onClick={handleResetOnboarding}
            className="w-full justify-start"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Reset Onboarding
          </Button>

          <Button
            variant="destructive"
            onClick={handleClearData}
            disabled={isClearing}
            className="w-full justify-start"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </Button>
        </Card>

        {/* PWA Install Section */}
        <Card className="p-4 space-y-4 border-system-blue/20">
          <h3 className="font-medium text-system-foreground flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-system-blue" />
            Install App
          </h3>
          <p className="text-sm text-system-muted-foreground">
            Install Fitness Tracking App on your home screen for offline access and a native app experience.
          </p>
          {isInstallable ? (
            <div className="space-y-3">
              <Button
                onClick={async () => {
                  setIsInstalling(true);
                  const result = await install();
                  if (result) {
                    success('Installed!', 'App has been added to your home screen.');
                  }
                  setIsInstalling(false);
                }}
                disabled={isInstalling}
                className="w-full justify-start"
                leftIcon={<Smartphone className="w-4 h-4" />}
              >
                {isInstalling ? 'Installing...' : 'Install App'}
              </Button>
            </div>
          ) : isIOS ? (
            <div className="p-3 bg-system-blue/5 border border-system-blue/20 rounded-lg">
              <p className="text-sm text-system-blue flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                On iOS: {getIOSInstructions}
              </p>
            </div>
          ) : (
            <p className="text-sm text-system-muted-foreground">
              App is already installed or install not available on this browser.
            </p>
          )}
        </Card>

        {/* Design System Demo */}
        <Card className="p-4 space-y-4 border-system-blue/20">
          <h3 className="font-medium text-system-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-system-blue" />
            Apple Design System Demo
          </h3>
          <p className="text-sm text-system-muted-foreground">
            Explore the fluid interface principles, spring animations, gestures, and materials implemented in this app.
          </p>
          <Button
            variant="primary"
            leftIcon={<Code2 className="w-4 h-4" />}
            onClick={() => window.open('/demo', '_blank')}
          >
            Open Design Demo
          </Button>
        </Card>

        {/* App Info */}
        <Card className="p-4">
          <div className="text-center text-sm text-system-muted-foreground">
            <p className="font-medium text-system-foreground">Fitness Tracking App</p>
            <p>Version 1.0.0</p>
            <p className="mt-2">Built with React, TypeScript, Dexie, and Gemini AI</p>
          </div>
        </Card>
      </div>
    </div>
  );
}