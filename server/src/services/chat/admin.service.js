import User from "../../models/User.js";
import InternshipProgram from "../../models/InternshipProgram.js";

export const getAdminChatData = async (companyId) => {
  const totalInterns = await User.countDocuments({
    role: "intern",
    company: companyId
  });

  const totalMentors = await User.countDocuments({
    role: "mentor",
    company: companyId
  });

  const totalPrograms = await InternshipProgram.countDocuments({
    company: companyId
  });

  const activePrograms = await InternshipProgram.countDocuments({
    company: companyId,
    status: "active"
  });

  return {
    totalInterns,
    totalMentors,
    totalPrograms,
    activePrograms
  };
};