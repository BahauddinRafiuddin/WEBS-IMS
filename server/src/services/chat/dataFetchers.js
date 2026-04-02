import CommissionHistory from '../../models/CommissionHistory.js';
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
        const user = await User.findById(userId)
          .select("name email")
          .populate("company", "name email").lean()

        return {
          userData: user,
          "role": "can add comapnies to this platform , not associated with any company because he is the owner of the platform"
        }
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
        return Company.findById(companyId).select("name email phone isActive commissionPercentage -_id").lean();
      case 'super_admin':
        return Company.find().select("name email phone isActive commissionPercentage -_id").lean();
    }
  },

  finance: async ({ companyId, role }) => {
    switch (role) {
      case 'admin': {
        let filter = {
          company: companyId,
          paymentStatus: "success"
        }
        const paymentData = await Payment.find(filter)
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
            "totalCompanyEarning₹": totalCompanyEarning,
            totalTransactions,
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

  commission: async ({ companyId, role }) => {
    switch (role) {
      case 'admin': {
        let filter = {
          company: companyId,
          paymentStatus: "success"
        }
        const commissionHistory = await CommissionHistory.find({ company: companyId }).select("-_id").lean()
        const commissionPercentage = await Company.findById(companyId).select("commissionPercentage").lean()
        const breakdown = await Payment.aggregate([
          { $match: filter },
          {
            $group: {
              _id: "$commissionPercentage",
              totalRevenue: { $sum: "$totalAmount" },
              totalCommission: { $sum: "$superAdminCommission" },
              totalEarning: { $sum: "$companyEarning" },
              totalTransactions: { $sum: 1 }
            }
          },
          {
            $project: {
              commissionPercentage: "$_id",
              totalRevenue: 1,
              totalCommission: 1,
              totalEarning: 1,
              totalTransactions: 1,
              _id: 0
            }
          }
        ])
        return {
          summary: {
            "Comapany Pay commsion to platform": "yes",
            "commission That Platform Take for each transaction": commissionPercentage,
            "commissionHistory": commissionHistory,
            "commissionBreakDown₹": breakdown,
          }
        }
      }
      case 'super_admin': {
        const history = await CommissionHistory.find()
          .populate("company", "name")
          .select("-_id")
          .lean()
          .sort({ createdAt: -1 })

        const data = history.map((item) => {

          const start = new Date(item.startDate)
          const end = item.endDate ? new Date(item.endDate) : new Date()

          const durationDays = Math.ceil(
            (end - start) / (1000 * 60 * 60 * 24)
          )
          return {
            companyId: item.company._id,
            companyName: item.company.name,
            commissionPercentage: item.commissionPercentage,
            startDate: item.startDate,
            endDate: item.endDate,
            durationDays
          }
        })

        return data
      }
    }
  },

  general: async () => null, // No extra data needed
};