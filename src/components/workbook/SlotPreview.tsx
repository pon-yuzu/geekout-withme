import type { SlotValues } from '../../lib/workbook/types';
import { useTranslation } from '../../i18n/index';

interface Props {
  slots: SlotValues;
}

export function SlotPreview({ slots }: Props) {
  const { t } = useTranslation();
  const languageDisplay = slots.language === 'japanese' ? '日本語' : slots.language === 'english' ? '英語' : undefined;

  return (
    <div className="flex gap-2 p-4 overflow-x-auto">
      <SlotChip
        label={t('workbook.slot.language')}
        value={languageDisplay}
        emoji="🌐"
        color="bg-teal-100 text-teal-800"
      />
      <SlotChip
        label={t('workbook.slot.theme')}
        value={slots.topicLabel}
        emoji="🎯"
        color="bg-orange-100 text-orange-800"
      />
      <SlotChip
        label={t('workbook.slot.level')}
        value={slots.levelLabel}
        emoji="📊"
        color="bg-orange-100 text-orange-800"
      />
      <SlotChip
        label={t('workbook.slot.goal')}
        value={slots.destLabel}
        emoji="✈️"
        color="bg-purple-100 text-purple-800"
      />
    </div>
  );
}

function SlotChip({
  label,
  value,
  emoji,
  color,
}: {
  label: string;
  value?: string;
  emoji: string;
  color: string;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
        value ? color : 'bg-gray-100 text-gray-400'
      }`}
    >
      <span>{emoji}</span>
      <span>{value ?? `${label}...`}</span>
    </div>
  );
}
