import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useToastHelpers } from '@/hooks/useToast';
import { useSettings } from '@/services/database/useDatabase';
import { GeminiClient } from '@/services/ai/gemini';
import { AIError, AIErrorCode } from '@/services/ai/errorTypes';

const STEPS = [
  { id: 'api-key', title: 'API Key', description: 'Connect your Gemini AI' },
  { id: 'metrics', title: 'Baseline Metrics', description: 'Your body measurements' },
  { id: 'goals', title: 'Goals & Targets', description: 'Set your macro targets' },
  { id: 'dumbbells', title: 'Dumbbell Range', description: 'Available equipment' },
];

type StepId = 'api-key' | 'metrics' | 'goals' | 'dumbbells';

interface OnboardingData {
  apiKey: string;
  baselineMetrics: {
    weight: number;
    height: number;
    age: number;
    gender: 'male' | 'female';
  };
  dailyMacroTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  primaryGoal: 'lose' | 'maintain' | 'gain';
  dumbbellWeights: {
    minKg: number;
    maxKg: number;
  };
}

const DEFAULT_DATA: OnboardingData = {
  apiKey: '',
  baselineMetrics: {
    weight: 70,
    height: 175,
    age: 30,
    gender: 'male',
  },
  dailyMacroTargets: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
  },
  primaryGoal: 'maintain',
  dumbbellWeights: {
    minKg: 5,
    maxKg: 25,
  },
};

export function Onboarding() {
  const { saveSettings, isReady } = useSettings();
  const { success, error, warning } = useToastHelpers();
  const [currentStep, setCurrentStep] = useState<StepId>('api-key');
  const [data, setData] = useState<OnboardingData>(DEFAULT_DATA);
  const [isValidating, setIsValidating] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(false);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const updateData = useCallback(<K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const validateApiKey = useCallback(async (apiKey: string): Promise<boolean> => {
    if (!apiKey.trim()) return false;

    setIsValidating(true);
    try {
      const client = new GeminiClient({ apiKey: apiKey.trim() });
      await client.generateText('Test', undefined, { maxOutputTokens: 10 });
      setApiKeyValid(true);
      success('Connected', 'API key validated successfully');
      return true;
    } catch (err) {
      if (err instanceof AIError) {
        // Allow proceeding for network/connection issues - key might be valid
        if (err.code === AIErrorCode.NETWORK_ERROR ||
            err.code === AIErrorCode.TIMEOUT ||
            err.code === AIErrorCode.CONNECTION_REFUSED ||
            err.code === AIErrorCode.MODEL_UNAVAILABLE) {
          warning('Connection Issue', 'Could not reach Google AI servers. Your key may still be valid - you can continue and fix this later in Settings.');
          setApiKeyValid(true);
          return true;
        }

        if (err.code === AIErrorCode.API_KEY_INVALID || err.code === AIErrorCode.API_KEY_EXPIRED) {
          error('Invalid API Key', 'Please check your Gemini API key and try again');
        } else if (err.code === AIErrorCode.RATE_LIMIT_EXCEEDED) {
          warning('Rate Limited', 'API key valid but rate limited. You can continue.');
          setApiKeyValid(true);
          return true;
        } else {
          error('Validation Failed', err.message);
        }
      } else {
        // Non-AIError (unexpected) - warn but allow proceeding
        warning('Connection Issue', 'Could not validate API key due to an unexpected error. You can continue and verify in Settings later.');
        setApiKeyValid(true);
        return true;
      }
      setApiKeyValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [error, warning, success]);

  const goNext = useCallback(async () => {
    if (currentStep === 'api-key' && !apiKeyValid && data.apiKey) {
      const valid = await validateApiKey(data.apiKey);
      if (!valid) return;
    }
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id as StepId);
    }
  }, [currentStep, currentStepIndex, data.apiKey, apiKeyValid, validateApiKey]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id as StepId);
    }
  }, [currentStepIndex]);

  const handleComplete = useCallback(async () => {
    try {
      await saveSettings({
        apiKey: data.apiKey,
        baselineMetrics: data.baselineMetrics,
        dailyMacroTargets: data.dailyMacroTargets,
        primaryGoal: data.primaryGoal,
        dumbbellWeights: data.dumbbellWeights,
      });
      localStorage.setItem('onboarding_complete', 'true');
      success('Welcome!', 'Your profile has been set up successfully.');
      window.location.href = '/';
    } catch (err) {
      error('Setup Failed', 'Unable to save your settings. Please try again.');
    }
  }, [data, saveSettings, success, error]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 'api-key':
        return data.apiKey.length > 10;
      case 'metrics':
        return data.baselineMetrics.weight > 0 && data.baselineMetrics.height > 0 && data.baselineMetrics.age > 0;
      case 'goals':
        return data.dailyMacroTargets.calories > 0 && data.dailyMacroTargets.protein > 0;
      case 'dumbbells':
        return data.dumbbellWeights.minKg > 0 && data.dumbbellWeights.maxKg >= data.dumbbellWeights.minKg;
      default:
        return false;
    }
  }, [currentStep, data]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-system-grouped-background">
        <Loader2 className="w-8 h-8 animate-spin text-system-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-system-grouped-background">
      {/* Progress Indicator */}
      <div className="sticky top-0 z-10 bg-system-grouped-background border-b border-system-border px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    index < currentStepIndex
                      ? 'bg-system-green text-white'
                      : index === currentStepIndex
                      ? 'bg-system-blue text-white'
                      : 'bg-system-muted text-system-muted-foreground'
                  }`}>
                    {index < currentStepIndex ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="font-medium text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${
                    index <= currentStepIndex ? 'text-system-foreground' : 'text-system-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-colors ${
                    index < currentStepIndex ? 'bg-system-green' : 'bg-system-border'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-sm text-system-muted-foreground">
            Step {currentStepIndex + 1} of {STEPS.length}: {STEPS[currentStepIndex].description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="max-w-md mx-auto px-4 py-6"
        >
          {currentStep === 'api-key' && (
            <ApiKeyStep
              data={data}
              onChange={updateData}
              isValidating={isValidating}
              apiKeyValid={apiKeyValid}
            />
          )}
          {currentStep === 'metrics' && (
            <MetricsStep data={data} onChange={updateData} />
          )}
          {currentStep === 'goals' && (
            <GoalsStep data={data} onChange={updateData} />
          )}
          {currentStep === 'dumbbells' && (
            <DumbbellsStep data={data} onChange={updateData} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-system-grouped-background border-t border-system-border px-4 py-4 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <Button
            variant="tertiary"
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {currentStepIndex === STEPS.length - 1 ? (
            <Button onClick={handleComplete} disabled={!canProceed()} className="flex-1">
              Complete Setup
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!canProceed()} className="flex-1">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function ApiKeyStep({
  data,
  onChange,
  isValidating,
  apiKeyValid,
}: {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  isValidating: boolean;
  apiKeyValid: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-system-foreground">Connect Your AI</h2>
        <p className="text-system-muted-foreground mt-2">
          Enter your Google Gemini API key to enable AI-powered nutrition parsing and workout generation.
        </p>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-system-foreground mb-2">
              Gemini API Key
            </label>
            <Input
              type="password"
              value={data.apiKey}
              onChange={e => onChange('apiKey', e.target.value)}
              onBlur={e => e.target.value.length > 10 && onChange('apiKey', e.target.value)}
              placeholder="AIzaSy..."
              className={apiKeyValid ? 'border-system-green' : ''}
            />
            {isValidating && (
              <div className="flex items-center gap-2 text-sm text-system-blue mt-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                Validating...
              </div>
            )}
            {apiKeyValid && !isValidating && (
              <div className="flex items-center gap-2 text-sm text-system-green mt-1">
                <Check className="w-4 h-4" />
                API key validated successfully
              </div>
            )}
          </div>

          <div className="p-3 bg-system-muted rounded-lg">
            <h4 className="font-medium text-sm text-system-foreground mb-2">How to get your API key:</h4>
            <ol className="text-sm text-system-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-system-blue underline">Google AI Studio</a></li>
              <li>Click "Create API Key"</li>
              <li>Copy the key and paste it above</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MetricsStep({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-system-foreground">Baseline Metrics</h2>
        <p className="text-system-muted-foreground mt-2">
          Help us personalize your calorie and macro targets.
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-system-foreground mb-2">Weight (kg)</label>
            <Input
              type="number"
              value={data.baselineMetrics.weight}
              onChange={e => onChange('baselineMetrics', { ...data.baselineMetrics, weight: parseFloat(e.target.value) || 0 })}
              min="30"
              max="300"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-system-foreground mb-2">Height (cm)</label>
            <Input
              type="number"
              value={data.baselineMetrics.height}
              onChange={e => onChange('baselineMetrics', { ...data.baselineMetrics, height: parseFloat(e.target.value) || 0 })}
              min="100"
              max="250"
              step="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-system-foreground mb-2">Age</label>
            <Input
              type="number"
              value={data.baselineMetrics.age}
              onChange={e => onChange('baselineMetrics', { ...data.baselineMetrics, age: parseInt(e.target.value) || 0 })}
              min="13"
              max="120"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-system-foreground mb-2">Gender</label>
            <select
              value={data.baselineMetrics.gender}
              onChange={e => onChange('baselineMetrics', { ...data.baselineMetrics, gender: e.target.value as 'male' | 'female' })}
              className="w-full px-3 py-2 bg-system-background border border-system-border rounded-lg text-system-foreground focus:outline-none focus:ring-2 focus:ring-system-blue focus:border-transparent"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="p-3 bg-system-blue/5 border border-system-blue/20 rounded-lg">
          <p className="text-sm text-system-blue">
            These values help calculate your BMR and TDEE for accurate macro targets.
          </p>
        </div>
      </Card>
    </div>
  );
}

function GoalsStep({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}) {
  const calculateMacros = (goal: 'lose' | 'maintain' | 'gain', weight: number) => {
    const tdee = weight * 24 * 1.55; // Rough estimate
    const multiplier = goal === 'lose' ? 0.85 : goal === 'gain' ? 1.15 : 1.0;
    const calories = Math.round(tdee * multiplier);
    const protein = Math.round(weight * 2.2); // 2.2g per kg
    const fat = Math.round(calories * 0.25 / 9);
    const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
    return { calories, protein, carbs, fat };
  };

  const handleGoalChange = (goal: 'lose' | 'maintain' | 'gain') => {
    onChange('primaryGoal', goal);
    const macros = calculateMacros(goal, data.baselineMetrics.weight);
    onChange('dailyMacroTargets', macros);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-system-foreground">Goals & Targets</h2>
        <p className="text-system-muted-foreground mt-2">
          What's your primary fitness goal?
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {(['lose', 'maintain', 'gain'] as const).map(goal => (
            <button
              key={goal}
              onClick={() => handleGoalChange(goal)}
              className={`p-4 rounded-xl border-2 transition-all ${
                data.primaryGoal === goal
                  ? 'border-system-blue bg-system-blue/5 text-system-blue'
                  : 'border-system-border text-system-muted-foreground hover:border-system-muted'
              }`}
            >
              <div className="font-medium capitalize">{goal}</div>
              <div className="text-xs opacity-75 mt-1">
                {goal === 'lose' && 'Lose weight'}
                {goal === 'maintain' && 'Stay fit'}
                {goal === 'gain' && 'Build muscle'}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-4 border-t border-system-border space-y-4">
          <h4 className="font-medium text-system-foreground">Daily Macro Targets</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-system-foreground mb-2">Calories</label>
              <Input
                type="number"
                value={data.dailyMacroTargets.calories}
                onChange={e => onChange('dailyMacroTargets', { ...data.dailyMacroTargets, calories: parseInt(e.target.value) || 0 })}
                min="800"
                max="5000"
                step="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-system-foreground mb-2">Protein (g)</label>
              <Input
                type="number"
                value={data.dailyMacroTargets.protein}
                onChange={e => onChange('dailyMacroTargets', { ...data.dailyMacroTargets, protein: parseInt(e.target.value) || 0 })}
                min="30"
                max="500"
                step="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-system-foreground mb-2">Carbs (g)</label>
              <Input
                type="number"
                value={data.dailyMacroTargets.carbs}
                onChange={e => onChange('dailyMacroTargets', { ...data.dailyMacroTargets, carbs: parseInt(e.target.value) || 0 })}
                min="20"
                max="800"
                step="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-system-foreground mb-2">Fat (g)</label>
              <Input
                type="number"
                value={data.dailyMacroTargets.fat}
                onChange={e => onChange('dailyMacroTargets', { ...data.dailyMacroTargets, fat: parseInt(e.target.value) || 0 })}
                min="20"
                max="300"
                step="5"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function DumbbellsStep({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-system-foreground">Dumbbell Range</h2>
        <p className="text-system-muted-foreground mt-2">
          What dumbbell weights do you have available? This helps generate appropriate workouts.
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-system-foreground mb-2">Minimum Weight (kg)</label>
            <Input
              type="number"
              value={data.dumbbellWeights.minKg}
              onChange={e => onChange('dumbbellWeights', { ...data.dumbbellWeights, minKg: parseFloat(e.target.value) || 0 })}
              min="1"
              max="100"
              step="0.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-system-foreground mb-2">Maximum Weight (kg)</label>
            <Input
              type="number"
              value={data.dumbbellWeights.maxKg}
              onChange={e => onChange('dumbbellWeights', { ...data.dumbbellWeights, maxKg: parseFloat(e.target.value) || 0 })}
              min="1"
              max="100"
              step="0.5"
            />
          </div>
        </div>

        <div className="p-3 bg-system-muted rounded-lg">
          <p className="text-sm text-system-foreground">
            Typical ranges: <span className="font-medium">5-15kg</span> (beginner), <span className="font-medium">10-30kg</span> (intermediate), <span className="font-medium">20-50kg+</span> (advanced)
          </p>
        </div>

        <div className="pt-4 border-t border-system-border">
          <h4 className="font-medium text-system-foreground mb-3">Quick Presets</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { min: 5, max: 15, label: 'Beginner (5-15kg)' },
              { min: 10, max: 30, label: 'Intermediate (10-30kg)' },
              { min: 20, max: 50, label: 'Advanced (20-50kg)' },
            ].map(preset => (
              <button
                key={`${preset.min}-${preset.max}`}
                onClick={() => onChange('dumbbellWeights', { minKg: preset.min, maxKg: preset.max })}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  data.dumbbellWeights.minKg === preset.min && data.dumbbellWeights.maxKg === preset.max
                    ? 'bg-system-blue text-white'
                    : 'bg-system-muted text-system-foreground hover:bg-system-muted/80'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="text-center text-sm text-system-muted-foreground">
        <p>All set! Tap "Complete Setup" to finish onboarding.</p>
      </div>
    </div>
  );
}