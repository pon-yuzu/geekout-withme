import { useState } from 'react';

interface Props {
  workbookId: string;
  dayNumber: number;
  initialCompleted: boolean;
  labelComplete?: string;
  labelIncomplete?: string;
}

export function DayCompleteButton({
  workbookId,
  dayNumber,
  initialCompleted,
  labelComplete = 'Completed',
  labelIncomplete = 'Mark as complete',
}: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workbook/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workbookId,
          dayNumber,
          completed: !completed,
        }),
      });
      if (res.ok) setCompleted(!completed);
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={
        completed
          ? 'w-full py-4 bg-teal-400 text-white rounded-xl font-bold text-lg transition-colors hover:bg-teal-500 disabled:opacity-50'
          : 'w-full py-4 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold text-lg hover:border-teal-400 hover:text-teal-500 transition-colors disabled:opacity-50'
      }
    >
      {loading ? '...' : completed ? `\u2713 ${labelComplete}` : labelIncomplete}
    </button>
  );
}
