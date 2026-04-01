import Company from '../../models/Company.js';
import Enrollment from '../../models/Enrollment.js';
import InternshipProgram from '../../models/InternshipProgram.js';
import Payment from '../../models/Payment.js';
import Task from '../../models/Task.js'
import User from '../../models/User.js';
import { calculateInternPerformanceService } from '../performance.service.js';

export const fetchers = {

  profile_details: async ({ userId, role }) => {
    switch (role) {
      case 'intern':
        return User.findById(userId)
          .select("name email")
          .populate("company", "name email").lean()
      case 'mentor':
        return User.findById(userId)
          .select("name email")
          .populate("company", "name email").lean()
      case 'admin':
        return User.findById(userId)
          .select("name email")
          .populate("company", "name email").lean()
      case 'super_admin':
        return User.findById(userId)
          .select("name email")
          .populate("company", "name email").lean()
    }
  },

  tasks: async ({ userId, role }) => {
    if (role === "intern") {
      return Task.find({ assignedIntern: userId })
        .select("title status dueDate description -_id")
        .lean();
    }
    if (role === "mentor") {
      return Task.find({ mentor: userId })
        .populate("assignedIntern", "name")
        .select("title status assignedIntern reviewStatus -_id")
        .lean();
    }
  },

  programs: async ({ userId, companyId, role }) => {
    if (role === "intern") {
      return Enrollment.find({ intern: userId })
        .populate("program", "title domain status type price")
        .lean();
    }
    if (role === "admin") {
      return InternshipProgram.find({ company: companyId })
        .select("title status")
        .populate("mentor", "name email")
        .lean();
    }
  },

  performance: async ({ userId, role, companyId }) => {
    if (role === "intern") {
      const programId = await InternshipProgram.find({ company: companyId }).select("_id")
      const data = await calculateInternPerformanceService(userId, programId)
      return data
    }
  },

  interns: async ({ companyId }) => {
    return User.find({ company: companyId, role: "intern" })
      .select("name email isActive -_id")
      .lean();
  },

  mentors: async ({ companyId }) => {
    return User.find({ company: companyId, role: "mentor" })
      .select("name email isActive -_id")
      .lean();
  },

  interns_mentors: async ({ companyId }) => {
    return User.find({
      company: companyId,
      role: { $in: ["intern", "mentor"] }
    })
      .select("name email isActive -_id")
      .lean();
  },
  companies: async ({ companyId, role }) => {
    switch (role) {
      case 'admin':
        return Company.findById(companyId).select("name email phone isActive -_id").lean();
      case 'super_admin':
        return Company.find().select("name email phone isActive -_id").lean();
    }
  },

  finance: async ({ companyId, role }) => {
    switch (role) {
      case 'admin': {
        const paymentData = await Payment.find({ company: companyId, paymentStatus: "success" })
          .select("-_id")
          .populate("intern", "name email")
          .populate("program", "title price")
          .sort({ createdAt: -1 })
          .lean()
        const totalTransactions = paymentData.length
        const totalRevenue = paymentData.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalCommission = paymentData.reduce((sum, p) => sum + p.superAdminCommission, 0);
        const totalCompanyEarning = paymentData.reduce((sum, p) => sum + p.companyEarning, 0);
        return {
          summary: {
            totalRevenue,
            totalCommission,
            totalCompanyEarning,
            totalTransactions,
            currency: "₹"
          },
        }
      }
      case 'super_admin': {
        const paymentData = await Payment.find({ paymentStatus: "success" })
          .select("-_id")
          .populate("intern", "name email")
          .populate("program", "title price")
          .sort({ createdAt: -1 })
          .lean()
        const totalTransactions = paymentData.length
        const totalRevenue = paymentData.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalCommissionEarned = paymentData.reduce((sum, p) => sum + p.superAdminCommission, 0);
        const totalCompanyEarning = paymentData.reduce((sum, p) => sum + p.companyEarning, 0);
        return {
          summary: {
            totalRevenue,
            totalCommissionEarned,
            totalCompanyEarning,
            totalTransactions,
            currency: "₹"
          },
        }
      }
    }
  },

  general: async () => null, // No extra data needed
};