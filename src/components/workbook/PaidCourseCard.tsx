import type { PaidCourse } from '../../lib/workbook/paid-courses';

export default function PaidCourseCard({ course }: { course: PaidCourse }) {
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
    <a
      href={course.baseUrl || `/workbook/course/${course.id}`}
      className="block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
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
      <div className="mb-2">
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
  );
}
