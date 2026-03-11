import type { PaidCourse } from '../../lib/workbook/paid-courses';

export default function PaidCourseCard({ course, isLoggedIn }: { course: PaidCourse; isLoggedIn?: boolean }) {
  if (course.comingSoon) {
    return (
      <div className="block bg-white border border-dashed border-gray-200 rounded-2xl p-6 shadow-sm opacity-60">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{course.emoji} {course.title}</h3>
          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
            Coming Soon
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-4">{course.subtitle} — {course.level}</p>
        <p className="text-sm text-gray-400">{course.description}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <a href={course.baseUrl || `/workbook/course/${course.id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{course.emoji} {course.title}</h3>
          <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs font-medium rounded-full">
            ¥{course.price.toLocaleString()}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {course.subtitle} — {course.level}
        </p>

        <p className="text-sm text-gray-600 mb-4">{course.description}</p>

        {/* Progress-like bar showing sample access */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>{course.sampleDays.length}日分 無料サンプル / 全{course.totalDays}日</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-orange-400 h-2 rounded-full transition-all"
              style={{ width: `${(course.sampleDays.length / course.totalDays) * 100}%` }}
            />
          </div>
        </div>
      </a>

      {/* Access period info */}
      <div className="border-t border-gray-100 pt-3 mt-1">
        {isLoggedIn ? (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <span>✓</span> 会員登録済み — 購入後1年間アクセス可能
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-xs text-gray-500">
              📅 アクセス期間: 購入から6ヶ月
            </p>
            <p className="text-xs text-orange-600 font-medium">
              💡 <a href="/signup?redirect=/workbook" className="hover:underline">無料会員登録</a>で1年に延長！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
