"use server";

import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function resetStudentPassword(studentId: string, newPassword: string) {
  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.auth.admin.updateUserById(studentId, {
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to reset password" };
  }
}
