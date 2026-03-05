import { useEffect, useState } from 'react';
import type { StudentConfig, StudentConfigRow } from '../../lib/adaptive-workbook/types';
import { CEFR_LEVELS, EIKEN_LEVELS, JLPT_LEVELS, SKILL_OPTIONS, DIFFICULTY_OPTIONS } from '../../lib/adaptive-workbook/types';

interface Props {
  existingConfig: StudentConfigRow | null;
  onBack: () => void;
  onSaved: (config: StudentConfigRow) => void;
  onGenerate: (config: StudentConfigRow) => void;
}

interface UserOption {
  id: string;
  email: string;
  display_name: string | null;
}

const EMPTY_CONFIG: StudentConfig = {
  target_language: 'english',
  student: { user_id: '', display_name: '', location: '', occupation: '', language_environment: '' },
  level: { cefr: 'A2', eiken: '', jlpt: '', weak_skills: [], skill_priority: [] },
  goals: { target_exam: '', deadline: '', phase: '', free_text: '' },
  navigator: { name: '', personality: '', speech_samples: [''] },
  scenario: { workplace: '', scenes: [''] },
  monthly_themes: [
    { theme: '', cooking_tie_in: '' },
    { theme: '', cooking_tie_in: '' },
    { theme: '', cooking_tie_in: '' },
  ],
  tech: { difficulty: 'normal', tts: 'browser' },
};

export default function HearingForm({ existingConfig, onBack, onSaved, onGenerate }: Props) {
  const [config, setConfig] = useState<StudentConfig>(
    existingConfig?.config_json || EMPTY_CONFIG
  );
  const [configId, setConfigId] = useState<string | null>(existingConfig?.id || null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/users?limit=200')
      .then((r) => r.json())
      .then((data) => {
        const userList = (data.users || []).map((u: any) => ({
          id: u.id,
          email: u.email || '',
          display_name: u.display_name || null,
        }));
        setUsers(userList);
      })
      .catch(() => {});
  }, []);

  const updateStudent = (field: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      student: { ...prev.student, [field]: value },
    }));
  };

  const updateLevel = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      level: { ...prev.level, [field]: value },
    }));
  };

  const updateGoals = (field: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      goals: { ...prev.goals, [field]: value },
    }));
  };

  const updateNavigator = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      navigator: { ...prev.navigator, [field]: value },
    }));
  };

  const updateScenario = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      scenario: { ...prev.scenario, [field]: value },
    }));
  };

  const updateTheme = (index: number, field: string, value: string) => {
    setConfig((prev) => {
      const themes = [...prev.monthly_themes];
      themes[index] = { ...themes[index], [field]: value };
      return { ...prev, monthly_themes: themes };
    });
  };

  const handleTargetLanguageChange = (lang: 'english' | 'japanese') => {
    setConfig((prev) => ({
      ...prev,
      target_language: lang,
      level: { ...prev.level, eiken: '', jlpt: '' },
    }));
  };

  const isJapanese = config.target_language === 'japanese';

  const handleUserSelect = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    setConfig((prev) => ({
      ...prev,
      student: {
        ...prev.student,
        user_id: userId,
        display_name: user?.display_name || '',
      },
    }));
  };

  const toggleSkill = (skill: string, list: 'weak_skills' | 'skill_priority') => {
    setConfig((prev) => {
      const current = prev.level[list];
      const updated = current.includes(skill)
        ? current.filter((s) => s !== skill)
        : [...current, skill];
      return { ...prev, level: { ...prev.level, [list]: updated } };
    });
  };

  const handleSave = async () => {
    if (!config.student.user_id) {
      setError('Please select a student');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const method = configId ? 'PUT' : 'POST';
      const body = configId
        ? { id: configId, config_json: config }
        : { user_id: config.student.user_id, config_json: config };

      const res = await fetch('/api/admin/wb-configs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setConfigId(data.config.id);
      onSaved(data.config);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    // Save first, then trigger generation
    if (!config.student.user_id) {
      setError('Please select a student');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Save config
      const method = configId ? 'PUT' : 'POST';
      const body = configId
        ? { id: configId, config_json: config }
        : { user_id: config.student.user_id, config_json: config };

      const saveRes = await fetch('/api/admin/wb-configs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!saveRes.ok) throw new Error('Failed to save config');
      const saveData = await saveRes.json();
      const savedConfigId = saveData.config.id;

      // Trigger generation
      const genRes = await fetch('/api/admin/wb-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_id: savedConfigId }),
      });

      if (!genRes.ok) {
        const genData = await genRes.json();
        throw new Error(genData.error || 'Generation failed');
      }

      onGenerate({ ...saveData.config, status: 'generating', days_completed: 1 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-4 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to list
      </button>

      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {existingConfig ? 'Edit Hearing Data' : 'New Hearing Form'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: Student Selection */}
        <Section title="Student">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select Student</Label>
              <select
                value={config.student.user_id}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                disabled={!!existingConfig}
              >
                <option value="">-- Select --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <InputField label="Display Name" value={config.student.display_name} onChange={(v) => updateStudent('display_name', v)} />
            <InputField label="Location" value={config.student.location} onChange={(v) => updateStudent('location', v)} placeholder="e.g., Tokyo, Japan" />
            <InputField label="Occupation" value={config.student.occupation} onChange={(v) => updateStudent('occupation', v)} placeholder="e.g., IT Engineer" />
            <InputField label="Language Environment" value={config.student.language_environment} onChange={(v) => updateStudent('language_environment', v)} placeholder="e.g., Uses English at work occasionally" className="md:col-span-2" />
          </div>
        </Section>

        {/* Target Language */}
        <Section title="Target Language">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleTargetLanguageChange('english')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isJapanese
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              English (英語学習)
            </button>
            <button
              type="button"
              onClick={() => handleTargetLanguageChange('japanese')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isJapanese
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Japanese (日本語学習)
            </button>
          </div>
        </Section>

        {/* Section 2: Language Level */}
        <Section title={isJapanese ? 'Japanese Level' : 'English Level'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>CEFR Level</Label>
              <select
                value={config.level.cefr}
                onChange={(e) => updateLevel('cefr', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {CEFR_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            {isJapanese ? (
              <div>
                <Label>JLPT (optional)</Label>
                <select
                  value={config.level.jlpt || ''}
                  onChange={(e) => updateLevel('jlpt', e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">-- None --</option>
                  {JLPT_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <Label>Eiken (optional)</Label>
                <select
                  value={config.level.eiken || ''}
                  onChange={(e) => updateLevel('eiken', e.target.value || undefined)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">-- None --</option>
                  {EIKEN_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Label>Weak Skills (click to toggle)</Label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill, 'weak_skills')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    config.level.weak_skills.includes(skill)
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <Label>Skill Priority (click to add in order)</Label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => {
                const idx = config.level.skill_priority.indexOf(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill, 'skill_priority')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      idx >= 0
                        ? 'bg-orange-100 text-orange-700 border border-orange-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {idx >= 0 && <span className="mr-1">{idx + 1}.</span>}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Section 3: Learning Goals */}
        <Section title="Learning Goals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Target Exam" value={config.goals.target_exam || ''} onChange={(v) => updateGoals('target_exam', v)} placeholder={isJapanese ? 'e.g., JLPT N3, 日本語能力試験' : 'e.g., TOEIC 700, Eiken 2'} />
            <InputField label="Deadline" value={config.goals.deadline || ''} onChange={(v) => updateGoals('deadline', v)} type="date" />
            <InputField label="Current Phase" value={config.goals.phase} onChange={(v) => updateGoals('phase', v)} placeholder="e.g., Foundation building" />
          </div>
          <div className="mt-4">
            <Label>Free Text Notes</Label>
            <textarea
              value={config.goals.free_text}
              onChange={(e) => updateGoals('free_text', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm h-20"
              placeholder="Any additional learning goals or notes..."
            />
          </div>
        </Section>

        {/* Section 4: Navigator (Oshi) */}
        <Section title="Navigator (Oshi Character)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Navigator Name" value={config.navigator.name} onChange={(v) => updateNavigator('name', v)} placeholder="e.g., Taehyung, Anya" />
            <InputField label="Personality" value={config.navigator.personality} onChange={(v) => updateNavigator('personality', v)} placeholder="e.g., Warm, playful, encouraging" />
          </div>
          <div className="mt-4">
            <Label>Speech Samples</Label>
            {config.navigator.speech_samples.map((sample, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={sample}
                  onChange={(e) => {
                    const samples = [...config.navigator.speech_samples];
                    samples[i] = e.target.value;
                    updateNavigator('speech_samples', samples);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder={`Sample ${i + 1}: e.g., "Let's cook something amazing today!"`}
                />
                {config.navigator.speech_samples.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const samples = config.navigator.speech_samples.filter((_, idx) => idx !== i);
                      updateNavigator('speech_samples', samples);
                    }}
                    className="text-red-400 hover:text-red-600 px-2"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateNavigator('speech_samples', [...config.navigator.speech_samples, ''])}
              className="text-sm text-orange-500 hover:text-orange-700"
            >
              + Add sample
            </button>
          </div>
        </Section>

        {/* Section 5: Scenario */}
        <Section title="Scenario Setting">
          <InputField label="Workplace" value={config.scenario.workplace} onChange={(v) => updateScenario('workplace', v)} placeholder="e.g., IT company in Tokyo" />
          <div className="mt-4">
            <Label>Scenes</Label>
            {config.scenario.scenes.map((scene, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  value={scene}
                  onChange={(e) => {
                    const scenes = [...config.scenario.scenes];
                    scenes[i] = e.target.value;
                    updateScenario('scenes', scenes);
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder={`Scene ${i + 1}: e.g., "Team meeting", "Client presentation"`}
                />
                {config.scenario.scenes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const scenes = config.scenario.scenes.filter((_, idx) => idx !== i);
                      updateScenario('scenes', scenes);
                    }}
                    className="text-red-400 hover:text-red-600 px-2"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateScenario('scenes', [...config.scenario.scenes, ''])}
              className="text-sm text-orange-500 hover:text-orange-700"
            >
              + Add scene
            </button>
          </div>
        </Section>

        {/* Section 6: Monthly Themes */}
        <Section title="Monthly Themes (x3)">
          {config.monthly_themes.map((theme, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0">
              <InputField
                label={`Month ${i + 1} Theme`}
                value={theme.theme}
                onChange={(v) => updateTheme(i, 'theme', v)}
                placeholder="e.g., Daily Life, Travel, Business"
              />
              <InputField
                label="Cooking Tie-in"
                value={theme.cooking_tie_in}
                onChange={(v) => updateTheme(i, 'cooking_tie_in', v)}
                placeholder="e.g., Comfort food recipes for busy weekdays"
              />
            </div>
          ))}
        </Section>

        {/* Section 7: Tech Settings */}
        <Section title="Technical Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Difficulty</Label>
              <select
                value={config.tech.difficulty}
                onChange={(e) => setConfig((prev) => ({ ...prev, tech: { ...prev.tech, difficulty: e.target.value as any } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>TTS Engine</Label>
              <select
                value={config.tech.tts}
                onChange={(e) => setConfig((prev) => ({ ...prev, tech: { ...prev.tech, tts: e.target.value as any } }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="browser">Browser TTS</option>
                <option value="google">Google Cloud TTS</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleGenerate}
            disabled={saving}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {saving ? 'Starting...' : 'Save & Generate 30 Days'}
          </button>
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-500 hover:text-gray-800 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-orange-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm text-gray-600 mb-1">{children}</label>;
}

function InputField({
  label, value, onChange, placeholder, type = 'text', className = '',
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}
