import { useState, useMemo } from 'react';
import {
  allResources,
  JLPT_LEVELS,
  CEFR_LEVELS,
  ALL_SKILLS,
  SKILL_LABELS,
  type Resource,
  type Skill,
  type Language,
  type FreeScope,
} from '../data/resources';

interface Props {
  lang: 'en' | 'ja';
}

interface FilterState {
  language: 'all' | Language;
  skills: Skill[];
  levels: string[];
  freeScope: 'all' | FreeScope;
  category: string;
  search: string;
}

const initialFilters: FilterState = {
  language: 'all',
  skills: [],
  levels: [],
  freeScope: 'all',
  category: 'all',
  search: '',
};

export function ResourceLibrary({ lang }: Props) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  const isJa = lang === 'ja';

  const categories = useMemo(() => {
    const resources = filters.language === 'all'
      ? allResources
      : allResources.filter(r => r.language === filters.language);
    return [...new Set(resources.map(r => r.category))];
  }, [filters.language]);

  const filtered = useMemo(() => {
    return allResources.filter(r => {
      if (filters.language !== 'all' && r.language !== filters.language) return false;
      if (filters.skills.length > 0 && !filters.skills.some(s => r.skills.includes(s))) return false;
      if (filters.levels.length > 0 && !filters.levels.some(l => r.levels.includes(l as any))) return false;
      if (filters.freeScope !== 'all' && r.freeScope !== filters.freeScope) return false;
      if (filters.category !== 'all' && r.category !== filters.category) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const searchable = [r.name, r.nameJa, r.description, r.descriptionJa, r.category].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    });
  }, [filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filtered]);

  const toggle = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'skills' | 'levels', value: string) => {
    setFilters(prev => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const resetFilters = () => setFilters(initialFilters);

  const hasActiveFilters = filters.language !== 'all' || filters.skills.length > 0 ||
    filters.levels.length > 0 || filters.freeScope !== 'all' ||
    filters.category !== 'all' || filters.search !== '';

  const showJLPT = filters.language === 'all' || filters.language === 'japanese';
  const showCEFR = filters.language === 'all' || filters.language === 'english';

  return (
    <div>
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder={isJa ? 'リソースを検索...' : 'Search resources...'}
            value={filters.search}
            onChange={e => toggle('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-orange-400 bg-white"
          />
        </div>
      </div>

      {/* Filter toggle for mobile */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden w-full mb-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-600 font-medium flex items-center justify-between"
      >
        <span>{isJa ? 'フィルター' : 'Filters'}{hasActiveFilters ? ' ●' : ''}</span>
        <span className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* Filters */}
      <div className={`space-y-4 mb-6 ${showFilters ? '' : 'hidden md:block'}`}>
        {/* Language */}
        <FilterRow label={isJa ? '言語' : 'Language'}>
          {(['all', 'japanese', 'english'] as const).map(val => (
            <PillButton
              key={val}
              active={filters.language === val}
              onClick={() => {
                toggle('language', val);
                toggle('levels', []);
                toggle('category', 'all');
              }}
            >
              {val === 'all' ? (isJa ? 'すべて' : 'All')
                : val === 'japanese' ? '🇯🇵 Japanese'
                : '🇺🇸 English'}
            </PillButton>
          ))}
        </FilterRow>

        {/* Skills */}
        <FilterRow label={isJa ? 'スキル' : 'Skills'}>
          {ALL_SKILLS.map(skill => (
            <PillButton
              key={skill}
              active={filters.skills.includes(skill)}
              onClick={() => toggleArrayItem('skills', skill)}
            >
              {SKILL_LABELS[skill].emoji} {isJa ? SKILL_LABELS[skill].ja : SKILL_LABELS[skill].en}
            </PillButton>
          ))}
        </FilterRow>

        {/* Levels */}
        <FilterRow label={isJa ? 'レベル' : 'Level'}>
          <div className="flex flex-wrap gap-2">
            {showJLPT && JLPT_LEVELS.map(level => (
              <PillButton
                key={level}
                active={filters.levels.includes(level)}
                onClick={() => toggleArrayItem('levels', level)}
                small
              >
                {level}
              </PillButton>
            ))}
            {showJLPT && showCEFR && <span className="text-gray-300 self-center px-1">|</span>}
            {showCEFR && CEFR_LEVELS.map(level => (
              <PillButton
                key={level}
                active={filters.levels.includes(level)}
                onClick={() => toggleArrayItem('levels', level)}
                small
              >
                {level}
              </PillButton>
            ))}
          </div>
        </FilterRow>

        {/* Category */}
        <FilterRow label={isJa ? 'カテゴリ' : 'Category'}>
          <select
            value={filters.category}
            onChange={e => toggle('category', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-orange-400"
          >
            <option value="all">{isJa ? 'すべて' : 'All'}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </FilterRow>

        {/* Free scope */}
        <FilterRow label={isJa ? '料金' : 'Price'}>
          {(['all', 'free', 'freemium'] as const).map(val => (
            <PillButton
              key={val}
              active={filters.freeScope === val}
              onClick={() => toggle('freeScope', val)}
            >
              {val === 'all' ? (isJa ? 'すべて' : 'All')
                : val === 'free' ? (isJa ? '完全無料のみ' : 'Free Only')
                : (isJa ? 'フリーミアムOK' : 'Freemium OK')}
            </PillButton>
          ))}
        </FilterRow>

        {/* Reset + count */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            {isJa
              ? `${sorted.length} 件のリソースを表示中`
              : `Showing ${sorted.length} resources`}
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-orange-500 hover:text-orange-600 font-medium"
            >
              {isJa ? 'リセット' : 'Reset filters'}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-gray-500 text-lg">
            {isJa ? '条件に一致するリソースが見つかりません' : 'No resources match your filters'}
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
          >
            {isJa ? 'フィルターをリセット' : 'Reset filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(resource => (
            <ResourceCard key={resource.id} resource={resource} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className="text-sm font-medium text-gray-600 sm:min-w-[80px]">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
  small,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`${small ? 'px-3 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-full border font-medium transition-colors ${
        active
          ? 'bg-orange-500 border-orange-500 text-white'
          : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'
      }`}
    >
      {children}
    </button>
  );
}

function ResourceCard({ resource, lang }: { resource: Resource; lang: 'en' | 'ja' }) {
  const isJa = lang === 'ja';
  const desc = (isJa && resource.descriptionJa) ? resource.descriptionJa : resource.description;
  const displayName = resource.nameJa
    ? `${resource.name}${resource.nameJa ? ` (${resource.nameJa})` : ''}`
    : resource.name;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-white rounded-xl p-5 border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all ${
        resource.recommended ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-bold text-gray-800 leading-tight">
          {resource.recommended && <span className="text-orange-500 mr-1">★</span>}
          {displayName}
        </h3>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs">{resource.language === 'japanese' ? '🇯🇵' : '🇺🇸'}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            resource.freeScope === 'free'
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {resource.freeScope === 'free' ? 'FREE' : 'FREEMIUM'}
          </span>
        </div>
      </div>

      {/* Skills + Levels */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
        {resource.skills.map(skill => (
          <span key={skill} className="text-gray-400" title={SKILL_LABELS[skill].en}>
            {SKILL_LABELS[skill].emoji}
          </span>
        ))}
        <span className="text-gray-200">|</span>
        {resource.levels.map(level => (
          <span key={level} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">
            {level}
          </span>
        ))}
      </div>

      {/* Category */}
      <p className="text-xs text-teal-600 font-medium mb-2">{resource.category}</p>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{desc}</p>

      {/* Visit link */}
      <p className="mt-3 text-sm text-orange-500 font-medium">
        {isJa ? 'サイトを見る →' : 'Visit Site →'}
      </p>
    </a>
  );
}
