import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { ParentStudentGate } from '../../components/parent/ParentStudentGate';

/**
 * إضافة ابن لحساب ولي الأمر — نفس بوابة التحقق (رقم الطالب + رمز دخول ولي الأمر).
 * لا ربط بكود الربط وحده (كان متسلسلاً وقابلاً للتخمين).
 */
export const LinkStudent: React.FC = () => {
  const {
    linkStudent,
    setActiveTab,
    schoolProfile,
    previouslyLinkedStudents,
    setParentLinkedStudent,
    authenticatedRole
  } = useSchool();

  const home = authenticatedRole === 'parent' ? 'parent-dashboard' : 'student-profile';

  return (
    <ParentStudentGate
      schoolName={schoolProfile.name}
      previouslyLinkedStudents={previouslyLinkedStudents}
      onSelectStudent={s => { setParentLinkedStudent(s); setActiveTab(home); }}
      onLink={(identifier, code) => {
        const ok = linkStudent(identifier, code);
        if (ok) setActiveTab(home);
        return ok;
      }}
    />
  );
};

export default LinkStudent;
