import React, { useState, useEffect } from 'react';
import { useTranslations, Language } from '../localization';

interface GroundingExerciseProps {
  onComplete: () => void;
  language: Language;
}

const GroundingExercise: React.FC<GroundingExerciseProps> = ({ onComplete, language }) => {
  const t = useTranslations(language);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const completionTimer = setTimeout(onComplete, 30000); // 30-second duration

    const phaseInterval = setInterval(() => {
      setBreathingPhase(prev => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 5000); // Sync with 10s animation (5s in, 5s out)
    
    const countdownInterval = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(completionTimer);
      clearInterval(phaseInterval);
      clearInterval(countdownInterval);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in max-w-lg mx-auto">
       <h2 className="text-2xl font-serif text-stone mb-4">{t('grounding_title')}</h2>
      <p className="text-soft-stone mb-8">{t('grounding_instruction')}</p>
      <div className="
          w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-blush/50 to-pale-blue/50 
          flex flex-col items-center justify-center shadow-xl animate-breathe relative
      ">
        <span className="text-xl font-semibold text-stone z-10 transition-opacity duration-500">
          {breathingPhase === 'inhale' ? t('breathe_in_instruction') : t('breathe_out_instruction')}
        </span>
        <span className="text-lg text-stone/70 mt-1 z-10">{countdown}</span>
      </div>
       <p className="mt-8 text-soft-stone">{t('grounding_sub_instruction')}</p>
       <button 
         onClick={onComplete} 
         className="mt-4 text-sm text-soft-stone underline hover:text-stone transition-colors"
       >
         {t('skip_button')}
       </button>
    </div>
  );
};

export default GroundingExercise;