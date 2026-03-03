import { useState, useEffect } from 'react';
import LessonArchive from '../lesson-archive/LessonArchive';

interface Student {
  id: string;
  display_name: string | null;
  email: string;
  avatar_url: string | null;
}

export default function StudentArchiveManager({ userId }: { userId: string }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users?q=&page=1')
      .then((res) => res.json())
      .then((data) => {
        // Filter to personal tier users only
        const personalUsers = (data.users || []).filter(
          (u: any) => u.tier === 'personal' || u.effectiveTier === 'personal'
        );
        setStudents(personalUsers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p>No personal tier students found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStudent(s)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
              selectedStudent?.id === s.id
                ? 'bg-teal-500 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-teal-300'
            }`}
          >
            {s.avatar_url ? (
              <img src={s.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs font-medium">
                {(s.display_name || s.email || '?')[0].toUpperCase()}
              </div>
            )}
            <span>{s.display_name || s.email}</span>
          </button>
        ))}
      </div>

      {selectedStudent ? (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-3">
            Archive: {selectedStudent.display_name || selectedStudent.email}
          </h3>
          <LessonArchive
            key={selectedStudent.id}
            studentId={selectedStudent.id}
            userId={userId}
            isAdmin={true}
          />
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          <p>Select a student above to manage their archive</p>
        </div>
      )}
    </div>
  );
}
