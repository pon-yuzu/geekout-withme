import { useState, useEffect, useRef } from 'react';

interface Props {
  language: 'english' | 'japanese';
  onComplete: (level: string) => void;
  onBack: () => void;
}

interface VoiceQuestion {
  level: string;
  prompt: string;
  hint: string;
  minWords: number; // Minimum expected words/complexity for this level
}

const englishVoiceQuestions: VoiceQuestion[] = [
  {
    level: 'A1',
    prompt: 'Please introduce yourself. Say your name and where you are from.',
    hint: 'Example: "My name is... I am from..."',
    minWords: 5,
  },
  {
    level: 'A2',
    prompt: 'What do you like to do on weekends? Tell me about your hobbies.',
    hint: 'Talk about activities you enjoy',
    minWords: 15,
  },
  {
    level: 'B1',
    prompt: 'Describe your favorite movie or book. Why do you like it?',
    hint: 'Give reasons and examples',
    minWords: 30,
  },
  {
    level: 'B2',
    prompt: 'What are the advantages and disadvantages of social media?',
    hint: 'Discuss both sides of the topic',
    minWords: 50,
  },
  {
    level: 'C1',
    prompt: 'How do you think technology will change education in the next 20 years?',
    hint: 'Share your predictions and reasoning',
    minWords: 70,
  },
];

const japaneseVoiceQuestions: VoiceQuestion[] = [
  {
    level: 'N5',
    prompt: '自己紹介をしてください。名前と出身を言ってください。',
    hint: '例：「私の名前は...です。...から来ました。」',
    minWords: 5,
  },
  {
    level: 'N4',
    prompt: '週末は何をしますか？趣味について話してください。',
    hint: '好きな活動について話してください',
    minWords: 15,
  },
  {
    level: 'N3',
    prompt: '好きな映画か本について説明してください。なぜ好きですか？',
    hint: '理由と例を挙げてください',
    minWords: 25,
  },
  {
    level: 'N2',
    prompt: 'SNSの長所と短所は何だと思いますか？',
    hint: '両方の面について話してください',
    minWords: 40,
  },
  {
    level: 'N1',
    prompt: '今後20年間で、テクノロジーは教育をどう変えると思いますか？',
    hint: '予測とその理由を述べてください',
    minWords: 60,
  },
];

export default function VoiceAssessment({ language, onComplete, onBack }: Props) {
  const questions = language === 'english' ? englishVoiceQuestions : japaneseVoiceQuestions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'english' ? 'en-US' : 'ja-JP';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const startRecording = () => {
    setTranscript('');
    setIsRecording(true);
    recognitionRef.current?.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
  };

  const analyzeResponse = () => {
    setIsAnalyzing(true);
    
    // Simple word count analysis (in production, this would call Claude API)
    const wordCount = transcript.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    setTimeout(() => {
      // Determine level based on response complexity
      let achievedLevel = currentQuestion.level;
      
      if (wordCount < currentQuestion.minWords * 0.5) {
        // Response too short - stop here
        const level = currentIndex === 0 
          ? (language === 'english' ? 'Below A1' : 'Below N5')
          : questions[currentIndex - 1].level;
        onComplete(level);
        return;
      }

      // If last question completed successfully
      if (currentIndex === questions.length - 1) {
        onComplete(achievedLevel);
        return;
      }

      // Move to next question
      setCurrentIndex(currentIndex + 1);
      setTranscript('');
      setIsAnalyzing(false);
    }, 1500);
  };

  if (!isSupported) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">🎤</div>
        <h3 className="text-xl font-medium mb-4">Voice Assessment Not Supported</h3>
        <p className="text-slate-400 mb-6">
          Your browser doesn't support voice recognition. 
          Please try Chrome, Edge, or Safari.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <span className="text-sm text-slate-400">
          Question {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-8">
        <div
          className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Level indicator */}
      <div className="text-center mb-4">
        <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm">
          Level: {currentQuestion.level}
        </span>
      </div>

      {/* Question */}
      <h3 className="text-xl font-medium text-center mb-2">
        {currentQuestion.prompt}
      </h3>
      <p className="text-slate-400 text-center mb-8">
        {currentQuestion.hint}
      </p>

      {/* Recording UI */}
      <div className="max-w-lg mx-auto">
        {/* Microphone button */}
        <div className="text-center mb-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
            className={`w-24 h-24 rounded-full transition-all ${
              isRecording
                ? 'bg-red-500 animate-pulse'
                : 'bg-gradient-to-r from-primary-500 to-accent-500 hover:scale-105'
            } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-4xl">{isRecording ? '⏹' : '🎤'}</span>
          </button>
          <p className="mt-3 text-sm text-slate-400">
            {isRecording ? 'Click to stop' : 'Click to start recording'}
          </p>
        </div>

        {/* Transcript display */}
        {transcript && (
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-400 mb-2">Your response:</p>
            <p className="text-white">{transcript.trim()}</p>
          </div>
        )}

        {/* Analyze button */}
        {transcript && !isRecording && (
          <div className="text-center">
            <button
              onClick={analyzeResponse}
              disabled={isAnalyzing}
              className={`px-8 py-3 rounded-full font-medium transition-all ${
                isAnalyzing
                  ? 'bg-white/10 text-slate-400'
                  : 'bg-gradient-to-r from-primary-500 to-accent-500 hover:opacity-90'
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Analyzing...
                </span>
              ) : (
                'Submit & Continue →'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
