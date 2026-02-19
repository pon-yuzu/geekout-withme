import { useTranslation } from '../../i18n/index';

interface Participant {
  id: string;
  name: string;
  muted: boolean;
}

interface Props {
  participants: Participant[];
}

export default function ParticipantList({ participants }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 mb-3">
        {t('participants.title')} ({participants.length})
      </h3>
      <div className="space-y-2">
        {participants.map(participant => (
          <div
            key={participant.id}
            className="flex items-center gap-3 py-2"
          >
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm flex-1 truncate">{participant.name}</span>
            {participant.muted && (
              <span className="text-xs text-red-600">{'\u{1F507}'}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
