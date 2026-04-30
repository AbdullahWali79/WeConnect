export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Role = "admin" | "student";
export type ProfileStatus = "pending" | "approved" | "rejected";
export type ApplicationStatus = "pending" | "approved" | "rejected";
export type EnrollmentStatus = "active" | "completed" | "dropped";
export type TaskStatus = "pending" | "in_progress" | "submitted" | "reviewed" | "revision_required";
export type ResourceType = "video" | "google_doc" | "google_sheet" | "image" | "github" | "custom";
export type SubmissionStatus = "submitted" | "reviewed" | "revision_required";
export type CourseStatus = "active" | "inactive";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: Role;
  status: ProfileStatus;
  created_at: string;
};

export type CourseCategory = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Course = {
  id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  duration: string | null;
  level: string | null;
  status: CourseStatus;
  created_at: string;
};

export type Application = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  course_id: string | null;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
};

export type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  status: EnrollmentStatus;
  progress_percentage: number;
  final_score: number;
  completed_at: string | null;
  created_at: string;
};

export type Task = {
  id: string;
  course_id: string;
  student_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  max_score: number;
  status: TaskStatus;
  created_at: string;
};

export type TaskResource = {
  id: string;
  task_id: string;
  resource_type: ResourceType;
  title: string | null;
  url: string;
  created_at: string;
};

export type Submission = {
  id: string;
  task_id: string;
  student_id: string;
  explanation: string | null;
  github_url: string | null;
  google_doc_url: string | null;
  google_sheet_url: string | null;
  image_url: string | null;
  proof_url: string | null;
  status: SubmissionStatus;
  score: number;
  feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
};

export type ProgressReport = {
  id: string;
  student_id: string;
  course_id: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  average_score: number;
  progress_percentage: number;
  updated_at: string;
};

export type CompletedStudent = {
  id: string;
  student_id: string;
  course_id: string;
  final_score: number;
  progress_percentage: number;
  is_public: boolean;
  completed_at: string;
};

export type PromotionalPopup = {
  id: string;
  title: string;
  message: string;
  image_url: string | null;
  show_on: "landing" | "student" | "both";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  priority: "low" | "normal" | "high" | "urgent";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CompletedStudentShowcase = {
  id: string;
  student_id: string;
  course_id: string;
  student_name: string | null;
  course_name: string | null;
  final_score: number | null;
  progress_percentage: number | null;
  completed_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      course_categories: {
        Row: CourseCategory;
        Insert: Partial<CourseCategory> & { name: string };
        Update: Partial<CourseCategory>;
        Relationships: [];
      };
      courses: {
        Row: Course;
        Insert: Partial<Course> & { title: string };
        Update: Partial<Course>;
        Relationships: [];
      };
      applications: {
        Row: Application;
        Insert: Partial<Application> & { full_name: string; email: string; phone: string };
        Update: Partial<Application>;
        Relationships: [];
      };
      enrollments: {
        Row: Enrollment;
        Insert: Partial<Enrollment> & { student_id: string; course_id: string };
        Update: Partial<Enrollment>;
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task> & { course_id: string; student_id: string; title: string };
        Update: Partial<Task>;
        Relationships: [];
      };
      task_resources: {
        Row: TaskResource;
        Insert: Partial<TaskResource> & { task_id: string; url: string };
        Update: Partial<TaskResource>;
        Relationships: [];
      };
      submissions: {
        Row: Submission;
        Insert: Partial<Submission> & { task_id: string; student_id: string };
        Update: Partial<Submission>;
        Relationships: [];
      };
      progress_reports: {
        Row: ProgressReport;
        Insert: Partial<ProgressReport> & { student_id: string; course_id: string };
        Update: Partial<ProgressReport>;
        Relationships: [];
      };
      announcements: {
        Row: Announcement;
        Insert: Partial<Announcement> & { title: string; message: string };
        Update: Partial<Announcement>;
        Relationships: [];
      };
      promotional_popups: {
        Row: PromotionalPopup;
        Insert: Partial<PromotionalPopup> & { title: string; message: string };
        Update: Partial<PromotionalPopup>;
        Relationships: [];
      }
      completed_students: {
        Row: CompletedStudent;
        Insert: Partial<CompletedStudent> & { student_id: string; course_id: string };
        Update: Partial<CompletedStudent>;
        Relationships: [];
      };
    };
    Views: {
      completed_student_showcase: {
        Row: CompletedStudentShowcase;
        Relationships: [];
      };
    };
    Functions: {
      approve_application: {
        Args: { application_id: string };
        Returns: null;
      };
      can_request_student_access: {
        Args: { target_email: string };
        Returns: boolean;
      };
      reject_application: {
        Args: { application_id: string };
        Returns: null;
      };
      mark_course_completed: {
        Args: { target_student_id: string; target_course_id: string };
        Returns: null;
      };
      refresh_student_progress: {
        Args: { target_student_id: string; target_course_id: string };
        Returns: null;
      };
      submit_task: {
        Args: {
          target_task_id: string;
          submission_explanation: string | null;
          submission_github_url?: string | null;
          submission_google_doc_url?: string | null;
          submission_google_sheet_url?: string | null;
          submission_image_url?: string | null;
          submission_proof_url?: string | null;
        };
        Returns: null;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
