import Task from "../../models/Task.js";
import Enrollment from "../../models/Enrollment.js";

export const getMentorChatData = async (userId) => {
  const tasks = await Task.find({ mentor: userId });

  const totalTasks = tasks.length;
  const pendingReviews = tasks.filter(
    t => t.reviewStatus === "pending" && t.status === "submitted"
  ).length;

  const approvedTasks = tasks.filter(t => t.status === "approved").length;

  const totalInterns = await Enrollment.countDocuments({
    mentor: userId
  });

  return {
    totalTasks,
    pendingReviews,
    approvedTasks,
    totalInterns
  };
};