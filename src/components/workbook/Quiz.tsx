import { useState } from 'react';
import type { Quiz as QuizType } from '../../lib/workbook/types';
import { useTranslation } from '../../i18n/index';

interface Props {
  quiz: QuizType;
  id: string;
}

export function Quiz({ quiz, id }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(index: number) {
    if (selected !== null) return;
    setSelected(index);
  }

  const isCorrect = selected === quiz.correct;

  return (
    <div className="bg-orange-50 p-4 rounded-lg my-3">
      <div className="font-bold mb-3 text-orange-700">Q: {quiz.question}</div>
      <div className="flex flex-col gap-2">
        {quiz.options.map((option, i) => {
          let cls = 'p-3 bg-white border-2 border-gray-200 rounded-lg cursor-pointer transition-all';
          if (selected !== null) {
            if (i === quiz.correct) cls = 'p-3 bg-green-50 border-2 border-green-500 rounded-lg';
            else if (i === selected) cls = 'p-3 bg-red-50 border-2 border-red-500 rounded-lg';
          }
          return (
            <div
              key={i}
              className={cls}
              onClick={() => handleSelect(i)}
            >
              {option}
            </div>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`mt-3 p-3 rounded-lg ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isCorrect ? `⭕ ${t('quiz.correct')}` : `❌ ${t('quiz.incorrect')}`}
        </div>
      )}
    </div>
  );
}
