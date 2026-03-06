import { useState } from 'react';
import AdaptiveWorkbookList from './AdaptiveWorkbookList';
import HearingForm from './HearingForm';
import WorkbookReview from './WorkbookReview';
import type { StudentConfigRow } from '../../lib/adaptive-workbook/types';

type View = 'list' | 'form' | 'review';

export default function AdaptiveWorkbookManager() {
  const [view, setView] = useState<View>('list');
  const [selectedConfig, setSelectedConfig] = useState<StudentConfigRow | null>(null);

  const handleNewConfig = () => {
    setSelectedConfig(null);
    setView('form');
  };

  const handleEditConfig = (config: StudentConfigRow) => {
    setSelectedConfig(config);
    if (config.status === 'generating' || config.status === 'review' || config.status === 'active') {
      setView('review');
    } else {
      setView('form');
    }
  };

  const handleSaved = (config: StudentConfigRow) => {
    setSelectedConfig(config);
    setView('list');
  };

  const handleStartGeneration = (config: StudentConfigRow) => {
    setSelectedConfig(config);
    setView('review');
  };

  const handleBack = () => {
    setView('list');
    setSelectedConfig(null);
  };

  return (
    <div>
      {view === 'list' && (
        <AdaptiveWorkbookList
          onNew={handleNewConfig}
          onSelect={handleEditConfig}
        />
      )}
      {view === 'form' && (
        <HearingForm
          existingConfig={selectedConfig}
          onBack={handleBack}
          onSaved={handleSaved}
          onGenerate={handleStartGeneration}
        />
      )}
      {view === 'review' && selectedConfig && (
        <WorkbookReview
          config={selectedConfig}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
