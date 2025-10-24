const translations = {
  en: {
    // Onboarding & Nav
    back_button: 'Back',
    home_button: 'Home',
    continue_button: 'Continue',
    onboarding_name_title: "What should I call you?",
    onboarding_name_subtitle: "Using your name can make this feel more personal.",
    onboarding_name_placeholder: "Enter your name or a nickname",
    
    // Emotion Selection
    emotion_selection_title: "How do you feel right now?",
    emotion_selection_subtitle: "Tap an emotion, or if you're not sure...",
    unsure_button: "I'm not sure what I'm feeling",

    // Intensity
    intensity_title: "How strong is this feeling?",
    intensity_subtitle: "1 is very mild, 10 is very intense.",

    // Unsure Path
    unsure_path_title: "Let's explore what's happening.",
    unsure_path_subtitle: "Select any feelings or situations that apply.",
    unsure_path_placeholder: "You can also describe what's on your mind... (e.g., I have to sleep but I can't)",

    // Reflection
    initial_question: "What's the story behind this feeling?",
    fallback_question: "Thank you for sharing. Could you tell me a little more?",
    analyzing_text: "Thinking...",

    // Reframe & Grounding
    reframe_title: "A New Perspective",
    grounding_button: "Breathe with me",
    grounding_title: "A Moment to Pause",
    grounding_instruction: "Take a slow, deep breath, and feel your chest gently rise and fall.",
    grounding_sub_instruction: "Follow the circle's rhythm.",
    breathe_in_instruction: 'Breathe In...',
    breathe_out_instruction: 'Breathe Out...',
    skip_button: 'Skip',

    // Journal
    journal_title: "Your Reflections",
    journal_save_prompt: "Feel free to copy this to your notes or save it with a screenshot.",
    journal_empty: "Your saved reflections will appear here.",
    journal_new_button: "Start New Reflection",
    
    // emotions
    anger: 'Anger',
    anxiety: 'Anxiety',
    sadness: 'Sadness',
    guilt_shame: 'Guilt / Shame',
    irritated: 'Irritated',
    overwhelmed: 'Overwhelmed',
    numb_blank: 'Numb / Blank',
    joy: 'Joy',
    
    // unsure signals
    chest_tight: 'Chest tight',
    want_to_cry: 'Want to cry',
    restless: 'Restless',
    exhausted: 'Exhausted',
    feel_nothing: 'Feel nothing',
    was_criticized: 'Was criticized',
    felt_ignored: 'Felt ignored',
  },
  ja: {
    // Onboarding & Nav
    back_button: '戻る',
    home_button: 'ホーム',
    continue_button: '続ける',
    onboarding_name_title: "お名前を教えてください",
    onboarding_name_subtitle: "よりパーソナルな体験のために",
    onboarding_name_placeholder: "名前やニックネームを入力",

    // Emotion Selection
    emotion_selection_title: "いま、どんな気持ち？",
    emotion_selection_subtitle: "感情をタップするか、もしわからなければ…",
    unsure_button: "うまく言えない・わからない",

    // Intensity
    intensity_title: "どのくらい強い？",
    intensity_subtitle: "1が最も弱く、10が最も強い感覚です。",

    // Unsure Path
    unsure_path_title: "何が起きているか、探ってみましょう",
    unsure_path_subtitle: "当てはまる感覚や状況を選んでください。",
    unsure_path_placeholder: "気になっていることを書いてもいいですよ (例：寝ないといけないのに眠れない)",

    // Reflection
    initial_question: "この気持ちの背景には、何がありますか？",
    fallback_question: "共有してくれてありがとう。もう少し詳しく教えてもらえますか？",
    analyzing_text: "考えています…",

    // Reframe & Grounding
    reframe_title: "新しい視点",
    grounding_button: "一緒に呼吸する",
    grounding_title: "少し、立ち止まる時間",
    grounding_instruction: "ゆっくりと深呼吸をして、胸が優しく上下するのを感じてみましょう。",
    grounding_sub_instruction: "円のリズムに合わせて。",
    breathe_in_instruction: '吸って…',
    breathe_out_instruction: '吐いて…',
    skip_button: 'スキップ',

    // Journal
    journal_title: "あなたのジャーナル",
    journal_save_prompt: "良かったらコピーしてメモに保存するか、スクリーンショットで保存してね。",
    journal_empty: "あなたの記録はここに表示されます。",
    journal_new_button: "新しく始める",

    // emotions
    anger: '怒り',
    anxiety: '不安',
    sadness: '悲しみ',
    guilt_shame: '罪悪感・羞恥心',
    irritated: 'イライラ',
    overwhelmed: '圧倒されている',
    numb_blank: '無感覚・からっぽ',
    joy: '喜び',
    
    // unsure signals
    chest_tight: '胸がぎゅっとする',
    want_to_cry: '涙が出そう',
    restless: 'そわそわする',
    exhausted: 'ぐったりしている',
    feel_nothing: '何も感じない',
    was_criticized: '否定された',
    felt_ignored: '無視された気がする',
  }
};

export type TranslationKey = keyof typeof translations.en;
export type Language = keyof typeof translations;

export const useTranslations = (lang: Language) => {
  return function t(key: TranslationKey): string {
    return translations[lang][key] || key;
  };
};