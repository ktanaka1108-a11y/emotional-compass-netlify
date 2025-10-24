
import React, { useState, useEffect, useRef } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Language, useTranslations } from './localization';
import type { AppState, Emotion, JournalEntry, ConversationTurn, AIResponse } from './types';
import { EMOTIONS, UNSURE_SIGNALS } from './constants';
import { getFirstQuestionForUnsurePath, getFollowUpQuestion, getAIMentorship } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import GroundingExercise from './components/GroundingExercise';

function App() {
  // Local storage state
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
  const [preferredName, setPreferredName] = useLocalStorage<string>('preferredName', '');
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);

  // App flow state
  const [appState, setAppState] = useState<AppState>('ONBOARDING_LANG');

  // Current journal entry state
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [currentIntensity, setCurrentIntensity] = useState<number>(5);
  const [currentUnsureSignals, setCurrentUnsureSignals] = useState<string[]>([]);
  const [currentFreeText, setCurrentFreeText] = useState('');
  const [currentConversation, setCurrentConversation] = useState<ConversationTurn[]>([]);
  const [currentAIResponse, setCurrentAIResponse] = useState<AIResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const t = useTranslations(language);
  const endOfConversationRef = useRef<HTMLDivElement>(null);

  // Effect to manage initial state based on stored values
  useEffect(() => {
    if (localStorage.getItem('language') === null) {
      setAppState('ONBOARDING_LANG');
    } else if (localStorage.getItem('preferredName') === null) {
      setAppState('ONBOARDING_NAME');
    } else {
      setAppState('SELECTING_EMOTION');
    }
  }, []); // Run once on mount

  // Effect to scroll to the bottom of the conversation
  useEffect(() => {
    endOfConversationRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation]);

  const resetJournalState = () => {
    setCurrentEmotion(null);
    setCurrentIntensity(5);
    setCurrentUnsureSignals([]);
    setCurrentFreeText('');
    setCurrentConversation([]);
    setCurrentAIResponse(null);
    setIsAnalyzing(false);
    setCurrentAnswer('');
  };

  const handleStartNew = () => {
    resetJournalState();
    setAppState('SELECTING_EMOTION');
  };

  const handleEmotionSelect = (emotion: Emotion) => {
    setCurrentEmotion(emotion);
    setAppState('ADJUSTING_INTENSITY');
  };
  
  const handleUnsureSelect = () => {
    setCurrentEmotion(null);
    setAppState('SELECTING_UNSURE_SIGNALS');
  };

  const handleIntensitySubmit = () => {
    setCurrentConversation([{
      question: t('initial_question'),
      answer: ''
    }]);
    setAppState('REFLECTING');
  };

  const handleUnsureSignalsSubmit = async () => {
    setIsAnalyzing(true);
    setAppState('REFLECTING');
    const { question_en, question_ja } = await getFirstQuestionForUnsurePath(currentUnsureSignals, currentFreeText, t);
    const firstQuestion = language === 'ja' ? question_ja : question_en;
    setCurrentConversation([{ question: firstQuestion, answer: '' }]);
    setIsAnalyzing(false);
  };
  
  const handleAnswerSubmit = async () => {
    if (!currentAnswer.trim()) return;

    const updatedConversation = [...currentConversation];
    updatedConversation[updatedConversation.length - 1].answer = currentAnswer;

    setCurrentConversation(updatedConversation);
    setCurrentAnswer('');
    setIsAnalyzing(true);

    if (updatedConversation.length >= 3) {
      // After 3 turns, analyze
      setAppState('ANALYZING');
      const aiResponse = await getAIMentorship({
          secondaryEmotion: currentEmotion ? t(currentEmotion.nameKey) : null,
          intensity: currentIntensity,
          unsureSignals: currentUnsureSignals,
          conversation: updatedConversation,
      }, preferredName);
      setCurrentAIResponse(aiResponse);

      const newEntry: JournalEntry = {
        id: new Date().toISOString(),
        date: new Date().toLocaleString(language),
        secondaryEmotion: currentEmotion ? t(currentEmotion.nameKey) : unsureSignalsToText(),
        intensity: currentIntensity,
        unsureSignals: currentUnsureSignals,
        conversation: updatedConversation,
        aiResponse: aiResponse,
      };
      setJournalEntries(prev => [newEntry, ...prev]);
      setIsAnalyzing(false);
      setAppState('REFRAMING');

    } else {
      // Get next question
      const { question_en, question_ja } = await getFollowUpQuestion(updatedConversation, language);
      const nextQuestion = language === 'ja' ? question_ja : question_en;
      setCurrentConversation(prev => [...prev, { question: nextQuestion, answer: '' }]);
      setIsAnalyzing(false);
    }
  };

  const unsureSignalsToText = () => {
    return currentUnsureSignals.map(s => t(s.replace(/-/g, '_') as any)).join(', ');
  }

  // Render logic based on appState
  const renderContent = () => {
    switch (appState) {
        case 'ONBOARDING_LANG':
            return (
                <div className="text-center">
                    <h1 className="text-3xl font-serif text-stone mb-4">Welcome</h1>
                    <p className="text-soft-stone mb-8">Please select your language.</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => { setLanguage('en'); setAppState('ONBOARDING_NAME'); }} className="px-6 py-2 bg-beige rounded-full text-stone font-semibold">English</button>
                        <button onClick={() => { setLanguage('ja'); setAppState('ONBOARDING_NAME'); }} className="px-6 py-2 bg-beige rounded-full text-stone font-semibold">日本語</button>
                    </div>
                </div>
            );

        case 'ONBOARDING_NAME':
            return (
                 <div className="text-center max-w-sm mx-auto">
                    <h1 className="text-3xl font-serif text-stone mb-2">{t('onboarding_name_title')}</h1>
                    <p className="text-soft-stone mb-6">{t('onboarding_name_subtitle')}</p>
                    <input
                        type="text"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        placeholder={t('onboarding_name_placeholder')}
                        className="w-full px-4 py-3 border border-beige rounded-lg focus:ring-2 focus:ring-pale-blue outline-none"
                    />
                    <button
                        onClick={() => { resetJournalState(); setAppState('SELECTING_EMOTION'); }}
                        className="mt-6 w-full py-3 bg-pale-blue text-stone rounded-lg font-semibold"
                    >
                        {t('continue_button')}
                    </button>
                </div>
            )
        
        case 'SELECTING_EMOTION':
            return (
                 <div className="text-center">
                    <h1 className="text-3xl font-serif text-stone mb-2">{t('emotion_selection_title')}</h1>
                    <p className="text-soft-stone mb-8">{t('emotion_selection_subtitle')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {EMOTIONS.map((emotion) => (
                            <button key={emotion.nameKey} onClick={() => handleEmotionSelect(emotion)} className="flex flex-col items-center justify-center p-4 aspect-square rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 rounded-full ${emotion.color} flex items-center justify-center text-stone`}>{emotion.icon}</div>
                                <span className="mt-2 text-stone font-medium text-sm">{t(emotion.nameKey)}</span>
                            </button>
                        ))}
                    </div>
                    <button onClick={handleUnsureSelect} className="mt-8 text-stone font-semibold underline">
                        {t('unsure_button')}
                    </button>
                </div>
            )
        
        case 'ADJUSTING_INTENSITY':
             return (
                 <div className="text-center max-w-md mx-auto">
                    <h1 className="text-3xl font-serif text-stone mb-2">{t('intensity_title')}</h1>
                    <p className="text-soft-stone mb-12">{t('intensity_subtitle')}</p>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-soft-stone">1</span>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={currentIntensity}
                            onChange={(e) => setCurrentIntensity(Number(e.target.value))}
                            className="w-full h-2 bg-beige rounded-lg appearance-none cursor-pointer"
                        />
                         <span className="text-sm text-soft-stone">10</span>
                    </div>
                    <p className="text-5xl font-serif text-stone mt-8">{currentIntensity}</p>
                    <button
                        onClick={handleIntensitySubmit}
                        className="mt-12 w-full py-3 bg-pale-blue text-stone rounded-lg font-semibold"
                    >
                        {t('continue_button')}
                    </button>
                </div>
             )
        
        case 'SELECTING_UNSURE_SIGNALS':
             const toggleSignal = (signalKey: string) => {
                setCurrentUnsureSignals(prev =>
                    prev.includes(signalKey)
                        ? prev.filter(s => s !== signalKey)
                        : [...prev, signalKey]
                );
             };
             return (
                 <div className="max-w-md mx-auto">
                    <h1 className="text-3xl font-serif text-stone text-center mb-2">{t('unsure_path_title')}</h1>
                    <p className="text-soft-stone text-center mb-8">{t('unsure_path_subtitle')}</p>
                    <div className="flex flex-wrap gap-3 justify-center mb-6">
                        {UNSURE_SIGNALS.map(signal => (
                            <button
                                key={signal.key}
                                onClick={() => toggleSignal(signal.key)}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                                    currentUnsureSignals.includes(signal.key)
                                        ? 'bg-pale-blue border-pale-blue text-stone'
                                        : 'bg-white border-beige text-soft-stone'
                                }`}
                            >
                                {t(signal.nameKey)}
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={currentFreeText}
                        onChange={(e) => setCurrentFreeText(e.target.value)}
                        placeholder={t('unsure_path_placeholder')}
                        rows={3}
                        className="w-full p-3 border border-beige rounded-lg focus:ring-2 focus:ring-pale-blue outline-none"
                    />
                    <button
                        onClick={handleUnsureSignalsSubmit}
                        disabled={currentUnsureSignals.length === 0 && !currentFreeText.trim()}
                        className="mt-6 w-full py-3 bg-pale-blue text-stone rounded-lg font-semibold disabled:bg-gray-200"
                    >
                        {t('continue_button')}
                    </button>
                </div>
             )

        case 'REFLECTING':
            const currentTurn = currentConversation[currentConversation.length - 1];
            return (
                 <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
                     <div className="flex-grow overflow-y-auto pr-2">
                        {currentConversation.map((turn, index) => (
                            <div key={index}>
                                <div className="mb-4">
                                    <p className="font-semibold text-stone">{t(turn.question as any) || turn.question}</p>
                                </div>
                                {turn.answer && (
                                     <div className="mb-6 flex justify-end">
                                         <p className="bg-pale-blue text-stone rounded-lg p-3 max-w-xs">{turn.answer}</p>
                                     </div>
                                )}
                            </div>
                        ))}
                        {isAnalyzing && <div className="flex justify-start"><LoadingSpinner /></div>}
                         <div ref={endOfConversationRef} />
                     </div>
                     {!isAnalyzing && currentTurn && !currentTurn.answer && (
                         <div className="mt-4 flex gap-2">
                            <input
                                type="text"
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                                placeholder="Type your answer..."
                                className="flex-grow px-4 py-2 border border-beige rounded-full focus:ring-2 focus:ring-pale-blue outline-none"
                                autoFocus
                            />
                            <button onClick={handleAnswerSubmit} className="px-4 py-2 bg-pale-blue text-stone rounded-full font-semibold">Send</button>
                         </div>
                     )}
                 </div>
            )

        case 'ANALYZING':
            return (
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-soft-stone font-serif text-xl">{t('analyzing_text')}</p>
                </div>
            )
        
        case 'REFRAMING':
            if (!currentAIResponse) return null;
            const responseInLang = language === 'ja' ? {
                bridge: currentAIResponse.bridgeText_ja,
                summary: currentAIResponse.summary_ja,
            } : {
                bridge: currentAIResponse.bridgeText_en,
                summary: currentAIResponse.summary_en,
            };

            return (
                 <div className="max-w-2xl mx-auto animate-fade-in">
                    <h1 className="text-3xl font-serif text-stone text-center mb-6">{t('reframe_title')}</h1>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <p className="italic text-soft-stone mb-4">"{responseInLang.bridge}"</p>
                        <p className="text-stone mb-4">{responseInLang.summary}</p>
                        <div className="text-center mt-6 border-t border-beige pt-4">
                            <p className="text-sm text-soft-stone mb-2">Likely Feelings:</p>
                            <div className="flex gap-2 justify-center flex-wrap">
                                {currentAIResponse.primary.map(p => <span key={p} className="px-3 py-1 bg-blush/50 text-stone text-sm rounded-full">{p}</span>)}
                                {currentAIResponse.secondary.map(s => <span key={s} className="px-3 py-1 bg-beige text-stone text-sm rounded-full">{s}</span>)}
                            </div>
                        </div>
                    </div>
                     <button onClick={() => setAppState('GROUNDING')} className="mt-8 w-full py-3 bg-pale-blue text-stone rounded-lg font-semibold">
                        {t('grounding_button')}
                     </button>
                 </div>
            )

        case 'GROUNDING':
            return <GroundingExercise onComplete={() => setAppState('JOURNALING')} language={language} />;

        case 'JOURNALING':
             return (
                 <div className="max-w-3xl mx-auto w-full">
                     <h1 className="text-3xl font-serif text-stone text-center mb-8">{t('journal_title')}</h1>
                      <button onClick={handleStartNew} className="w-full mb-8 py-3 bg-pale-blue text-stone rounded-lg font-semibold">
                        {t('journal_new_button')}
                      </button>
                     {journalEntries.length === 0 ? (
                         <p className="text-center text-soft-stone">{t('journal_empty')}</p>
                     ) : (
                         <div className="space-y-6">
                            {journalEntries.map(entry => (
                                <div key={entry.id} className="bg-white p-5 rounded-lg shadow-sm">
                                    <p className="text-sm text-soft-stone mb-1">{entry.date}</p>
                                    <h2 className="text-lg font-semibold text-stone mb-3">{entry.secondaryEmotion} (Intensity: {entry.intensity})</h2>
                                    <details>
                                        <summary className="cursor-pointer text-sm text-stone underline">Show Details</summary>
                                        <div className="mt-4 text-stone space-y-3">
                                            <p><span className="font-semibold">Core Needs:</span> {entry.aiResponse.primary.join(', ')}</p>
                                            <p className="italic">"{language === 'ja' ? entry.aiResponse.bridgeText_ja : entry.aiResponse.bridgeText_en}"</p>
                                            <p>{language === 'ja' ? entry.aiResponse.summary_ja : entry.aiResponse.summary_en}</p>
                                        </div>
                                    </details>
                                </div>
                            ))}
                         </div>
                     )}
                 </div>
             )
        
        default:
            return <div>App State not recognized</div>;
    }
  }

  const renderHeader = () => {
    const showBackButton = !['ONBOARDING_LANG', 'JOURNALING'].includes(appState);

    const handleBack = () => {
        switch(appState) {
            case 'ONBOARDING_NAME':
                setAppState('ONBOARDING_LANG');
                break;
            case 'SELECTING_EMOTION':
                setAppState('ONBOARDING_NAME');
                break;
            case 'ADJUSTING_INTENSITY':
            case 'SELECTING_UNSURE_SIGNALS':
                setAppState('SELECTING_EMOTION');
                break;
            case 'REFLECTING':
                currentEmotion ? setAppState('ADJUSTING_INTENSITY') : setAppState('SELECTING_UNSURE_SIGNALS');
                break;
            case 'REFRAMING':
            case 'ANALYZING':
                setAppState('REFLECTING');
                break;
            case 'GROUNDING':
                setAppState('REFRAMING');
                break;
        }
    }

    return (
        <header className="h-14 flex items-center justify-between">
            {showBackButton ? (
                <button onClick={handleBack} className="text-soft-stone hover:text-stone">{t('back_button')}</button>
            ) : <div />}
            {(appState !== 'JOURNALING' && appState !== 'ONBOARDING_LANG' && appState !== 'ONBOARDING_NAME') && (
                 <button onClick={() => setAppState('JOURNALING')} className="text-soft-stone hover:text-stone">{t('home_button')}</button>
            )}
        </header>
    )
  }

  return (
    <main className={`min-h-screen bg-ivory font-sans text-stone transition-colors duration-500`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {renderHeader()}
        <div className="py-8 flex items-center justify-center" style={{minHeight: 'calc(100vh - 56px)'}}>
          {renderContent()}
        </div>
      </div>
    </main>
  );
}

export default App;
