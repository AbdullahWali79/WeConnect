import { type ClassValue, clsx } from "clsx";
import type { Application } from "@/lib/supabase/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeWhatsappPhone(phone: string | null | undefined) {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  if (!digits.startsWith("92") && digits.length === 10) digits = `92${digits}`;

  return digits.length >= 11 ? digits : null;
}

export function buildApprovedStudentWhatsappUrl(application: Pick<Application, "full_name" | "phone">, courseTitle?: string | null) {
  const phone = normalizeWhatsappPhone(application.phone);
  if (!phone) return null;

  const messageLines = [
    `Assalam o Alaikum ${application.full_name},`,
    "Aap ka admission approve ho gaya hai.",
    "Aap ab We Connect Software House join kar sakte hain.",
    courseTitle ? `Course: ${courseTitle}.` : null,
    "Address: Sharqi Colony Back Side of Cookooz Cafe, Near Main Masjid.",
  ].filter(Boolean);

  return `https://wa.me/${phone}?text=${encodeURIComponent(messageLines.join("\n"))}`;
}
