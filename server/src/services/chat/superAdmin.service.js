import Company from "../../models/Company.js";
import User from "../../models/User.js";

export const getSuperAdminChatData = async () => {
  const totalCompanies = await Company.countDocuments();
  const activeCompanies = await Company.countDocuments({ isActive: true });

  const totalAdmins = await User.countDocuments({
    role: "admin"
  });

  return {
    totalCompanies,
    activeCompanies,
    totalAdmins
  };
};