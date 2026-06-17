"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidatePath } from "next/cache";

export async function submitFeedback(rating: string, review: string) {
  let sentiment = "neutral";
  if (rating === "excellent") sentiment = "positive";
  else if (["bad", "very-bad"].includes(rating)) sentiment = "negative";

  const { error } = await supabaseAdmin.from("feedbacks").insert({
    rating,
    review,
    sentiment,
  });

  if (error) {
    console.error("Error submitting feedback:", error);
    throw new Error("Failed to submit feedback");
  }

  revalidatePath("/dashboard/feedback");
}

export async function getFeedbacks() {
  const { data, error } = await supabaseAdmin
    .from("feedbacks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching feedbacks:", error);
    throw new Error("Failed to fetch feedbacks");
  }

  return data;
}
