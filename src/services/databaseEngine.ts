/**
 * ============================================================================
 * منصة المدرسة الرقمية | Digital School Platform
 * محرك قاعدة البيانات الهيكلي المتكامل (Relational Schema & Database Engine)
 * ============================================================================
 */

export const DATABASE_SCHEMA_SQL = `
-- 1. جدول المستخدمين والحسابات (Users & Authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    national_id VARCHAR(10) UNIQUE,
    phone VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'parent')),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول الفصول الدراسية (Classes)
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    supervisor_name VARCHAR(100),
    max_capacity INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول الطلاب (Students)
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(36) PRIMARY KEY,
    national_id VARCHAR(10) UNIQUE NOT NULL,
    student_number VARCHAR(20) UNIQUE NOT NULL,
    link_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
    grade VARCHAR(50) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    parent_name VARCHAR(100) NOT NULL,
    parent_phone VARCHAR(15) NOT NULL,
    parent_email VARCHAR(100),
    avatar_url TEXT,
    attendance_rate DECIMAL(5,2) DEFAULT 100.00,
    academic_average DECIMAL(5,2) DEFAULT 95.00,
    behavior_rating VARCHAR(20) DEFAULT 'ممتاز',
    behavior_points_total INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. جدول الحضور والغياب (Attendance Records)
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'late', 'excused', 'unexcused')),
    note TEXT,
    recorded_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, record_date)
);

-- 5. جدول درجات المواد الدراسية (Subject Grades)
CREATE TABLE IF NOT EXISTS subject_grades (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    teacher_name VARCHAR(100) NOT NULL,
    period1 DECIMAL(5,2) DEFAULT 0,
    period2 DECIMAL(5,2) DEFAULT 0,
    quizzes DECIMAL(5,2) DEFAULT 0,
    homework DECIMAL(5,2) DEFAULT 0,
    participation DECIMAL(5,2) DEFAULT 0,
    final_exam DECIMAL(5,2) DEFAULT 0,
    total_score DECIMAL(5,2) DEFAULT 0,
    letter_grade VARCHAR(5) DEFAULT 'A+',
    appreciation TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. جدول الواجبات المدرسية (Assignments)
CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(36) PRIMARY KEY,
    class_id VARCHAR(36),
    subject_name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date VARCHAR(50),
    teacher_name VARCHAR(100) NOT NULL,
    total_points INT DEFAULT 10,
    questions_json JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. جدول تسليمات الواجبات (Assignment Submissions)
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id VARCHAR(36) PRIMARY KEY,
    assignment_id VARCHAR(36) NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    student_answers_json JSON,
    teacher_feedback TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);

-- 8. جدول المحادثات والرسائل الفورية (Chat Messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('parent', 'teacher', 'admin')),
    sender_name VARCHAR(100) NOT NULL,
    message_text TEXT,
    is_voice BOOLEAN DEFAULT FALSE,
    voice_duration VARCHAR(10),
    image_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. جدول الإشعارات والتعاميم (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(20) CHECK (category IN ('attendance', 'academic', 'admin', 'urgent')),
    is_read BOOLEAN DEFAULT FALSE,
    student_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. جدول الحصص والجدول الأسبوعي (Timetable Schedule)
CREATE TABLE IF NOT EXISTS timetable_schedule (
    id VARCHAR(36) PRIMARY KEY,
    day_name VARCHAR(20) NOT NULL,
    day_index INT NOT NULL,
    period_number INT NOT NULL,
    period_time VARCHAR(50) NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    teacher_name VARCHAR(100) NOT NULL,
    room_name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(20)
);

-- فهارس تحسين الأداء والبحث السريع (Indexes)
CREATE INDEX IF NOT EXISTS idx_students_national_id ON students(national_id);
CREATE INDEX IF NOT EXISTS idx_students_link_code ON students(link_code);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(record_date);
CREATE INDEX IF NOT EXISTS idx_grades_student ON subject_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversation ON chat_messages(conversation_id);
`;

export interface TableMeta {
  tableName: string;
  nameArabic: string;
  name?: string;
  displayName?: string;
  description: string;
  icon: string;
  rowCount: number;
}

export const databaseEngine = {
  // Get live database metadata
  getTablesMeta(): TableMeta[] {
    try {
      const students = JSON.parse(localStorage.getItem('madrasa_db_students_v3') || '[]');
      const classes = JSON.parse(localStorage.getItem('madrasa_db_classes_v3') || '[]');
      const notifs = JSON.parse(localStorage.getItem('madrasa_db_notifications_v3') || '[]');
      const convs = JSON.parse(localStorage.getItem('madrasa_db_conversations_v3') || '[]');
      const sched = JSON.parse(localStorage.getItem('madrasa_db_schedule_v3') || '[]');

      let totalGrades = 0;
      let totalAssignments = 0;
      students.forEach((s: any) => {
        if (s.grades) totalGrades += s.grades.length;
        if (s.assignments) totalAssignments += s.assignments.length;
      });

      let totalMessages = 0;
      convs.forEach((c: any) => {
        if (c.messages) totalMessages += c.messages.length;
      });

      return [
        { tableName: 'students', nameArabic: 'سجل الطلاب الأساسي', name: 'students', displayName: 'سجل الطلاب الأساسي', description: 'بيانات الهوية الوطنية، الصفوف، والمعدلات التراكمية', icon: '👨‍🎓', rowCount: students.length },
        { tableName: 'teachers', nameArabic: 'دليل المعلمين ورموز الدخول', name: 'teachers', displayName: 'دليل المعلمين ورموز الدخول', description: 'بيانات المعلمين، رموز الدخول الفريدة، والفصول المسندة', icon: '👨‍🏫', rowCount: 6 },
        { tableName: 'subject_grades', nameArabic: 'سجل الدرجات وكشوف العلامات', name: 'subject_grades', displayName: 'سجل الدرجات وكشوف العلامات', description: 'تفصيل درجات الفترات والاختبارات القصيرة والنهائي', icon: '📊', rowCount: totalGrades },
        { tableName: 'assignments', nameArabic: 'بنك الواجبات التفاعلية', name: 'assignments', displayName: 'بنك الواجبات التفاعلية', description: 'الواجبات والأسئلة ونماذج الإجابة الإلكترونية', icon: '📝', rowCount: totalAssignments },
        { tableName: 'chat_messages', nameArabic: 'سجل المحادثات والرسائل', name: 'chat_messages', displayName: 'سجل المحادثات والرسائل', description: 'الرسائل الفورية والملاحظات الصوتية بين الأولياء والمعلمين', icon: '💬', rowCount: totalMessages },
        { tableName: 'timetable_schedule', nameArabic: 'الجدول المدرسي والحصص', name: 'timetable_schedule', displayName: 'الجدول المدرسي والحصص', description: 'توزيع الحصص الأسبوعية والمواد والقاعات', icon: '⏰', rowCount: sched.reduce((acc: number, d: any) => acc + (d.periods?.length || 0), 0) },
        { tableName: 'classes', nameArabic: 'الفصول والشعب الدراسية', name: 'classes', displayName: 'الفصول والشعب الدراسية', description: 'الفصول، المشرفين، وإحصائيات الطلاب', icon: '🏫', rowCount: classes.length },
        { tableName: 'notifications', nameArabic: 'مركز الإشعارات والتعاميم', name: 'notifications', displayName: 'مركز الإشعارات والتعاميم', description: 'تنبيهات الحضور، الواجبات، والرسائل الإدارية', icon: '🔔', rowCount: notifs.length },
      ];
    } catch {
      return [];
    }
  },

  // Export full SQL Dump File
  exportSQLDump(): string {
    const students = JSON.parse(localStorage.getItem('madrasa_db_students_v3') || '[]');
    let insertStatements = `-- Generated Digital School SQL Backup Dump\n-- Timestamp: ${new Date().toISOString()}\n\n`;
    insertStatements += DATABASE_SCHEMA_SQL + '\n\n';

    // Insert students
    students.forEach((s: any) => {
      insertStatements += `INSERT INTO students (id, national_id, student_number, link_code, name, grade, class_name, parent_name, parent_phone, attendance_rate, academic_average) VALUES ('${s.id}', '${s.nationalId}', '${s.studentNumber}', '${s.linkCode}', '${s.name}', '${s.grade}', '${s.className}', '${s.parentName}', '${s.parentPhone}', ${s.attendanceRate}, ${s.academicAverage});\n`;
    });

    return insertStatements;
  },

  // Export full JSON Database Backup
  exportJSONBackup(): string {
    const fullBackup = {
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      platform: 'Digital School Platform (منصة المدرسة الرقمية)',
      database: {
        students: JSON.parse(localStorage.getItem('madrasa_db_students_v3') || '[]'),
        classes: JSON.parse(localStorage.getItem('madrasa_db_classes_v3') || '[]'),
        notifications: JSON.parse(localStorage.getItem('madrasa_db_notifications_v3') || '[]'),
        conversations: JSON.parse(localStorage.getItem('madrasa_db_conversations_v3') || '[]'),
        schedule: JSON.parse(localStorage.getItem('madrasa_db_schedule_v3') || '[]'),
        dailyReport: JSON.parse(localStorage.getItem('madrasa_db_reports_v3') || '{}'),
      }
    };
    return JSON.stringify(fullBackup, null, 2);
  },

  // Restore Database from JSON
  restoreFromJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed?.database) {
        const { students, classes, notifications, conversations, schedule, dailyReport } = parsed.database;
        if (students) localStorage.setItem('madrasa_db_students_v3', JSON.stringify(students));
        if (classes) localStorage.setItem('madrasa_db_classes_v3', JSON.stringify(classes));
        if (notifications) localStorage.setItem('madrasa_db_notifications_v3', JSON.stringify(notifications));
        if (conversations) localStorage.setItem('madrasa_db_conversations_v3', JSON.stringify(conversations));
        if (schedule) localStorage.setItem('madrasa_db_schedule_v3', JSON.stringify(schedule));
        if (dailyReport) localStorage.setItem('madrasa_db_reports_v3', JSON.stringify(dailyReport));
        localStorage.setItem('madrasa_last_sync_timestamp', Date.now().toString());
        return true;
      }
    } catch {}
    return false;
  }
};
