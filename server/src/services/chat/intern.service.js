
import Task from "../../models/Task.js";
import Enrollment from "../../models/Enrollment.js";

export const getInternChatData = async (userId) => {
  const enrollments = await Enrollment.find({ intern: userId })
    .populate("program", "title status");

  const tasks = await Task.find({ assignedIntern: userId });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "approved").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const submittedTasks = tasks.filter(t => t.status === "submitted").length;

  return {
    enrollments,
    totalTasks,
    completedTasks,
    pendingTasks,
    submittedTasks
  };
};