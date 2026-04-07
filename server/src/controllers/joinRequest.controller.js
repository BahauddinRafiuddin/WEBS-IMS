import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import JoinRequest from "../models/joinRequest.model.js"
import InternshipProgram from "../models/InternshipProgram.js"

// Public user sends a request
export const sendJoinRequest = async (req, res) => {
  try {
    const { companyId, programId, message } = req.body;
    const userId = req.user._id;

    // Block if already has a pending/accepted request to this company
    const existing = await JoinRequest.findOne({
      user: userId,
      company: companyId,
      status: { $in: ["pending", "accepted"] }
    });
    if (existing) {
      return res.status(400).json({ message: "Request already exists for this company" });
    }

    const request = await JoinRequest.create({
      user: userId,
      company: companyId,
      program: programId || null,
      message
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not send request" });
  }
};

// Admin views all pending requests for their company
export const getJoinRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Step 1: Get users already accepted anywhere
    const acceptedUsers = await JoinRequest.find({ status: "accepted" }).distinct("user");

    // Step 2: Define the query filter
    const filter = {
      company: req.user.company,
      user: { $nin: acceptedUsers }
    };

    // Step 3: Fetch requests and total count in parallel
    const [requests, totalRequests] = await Promise.all([
      JoinRequest.find(filter)
        .populate("user", "name email createdAt")
        .populate("program", "title")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      JoinRequest.countDocuments(filter)
    ]);

    res.json({
      success: true,
      requests,
      pagination: {
        total: totalRequests,
        pages: Math.ceil(totalRequests / limit),
        currentPage: page
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
};
// Admin accepts or rejects
export const reviewJoinRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "accepted" | "rejected"

    const request = await JoinRequest.findOne({ _id: id, company: req.user.company });

    // Check if user already accepted in another company
    const alreadyJoinInOtherCompany = await JoinRequest.findOne({
      user: request.user,
      status: "accepted",
      company: { $ne: req.user.company }
    });

    if (alreadyJoinInOtherCompany) {
      return res.status(400).json({
        success: false,
        message: "User is already accepted in another company"
      });
    }
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending") return res.status(400).json({ message: "Already reviewed" });

    request.status = action;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    if (action === "accepted") {
      let programMsg = "";
      // Promote public_user → intern, assign company (and optionally program enrollment)
      await User.findByIdAndUpdate(request.user, {
        role: "intern",
        company: request.company,
        isActive: true
      });

      // If they requested a specific program, auto-enroll
      if (request.program) {
        // Check program exists and belongs to same company
        const program = await InternshipProgram.findById(request.program)

        if (!program) {
          return res.status(404).json({
            success: false,
            message: "Program not found in your company"
          })
        }
        if (program.company.toString() !== req.user.company.toString()) {
          return res.status(403).json({
            success: false,
            message: "This program is not in your company"
          });
        }
        // Create enrollment
        const enrollment = await Enrollment.create({
          intern: request.user,
          program: program._id,
          mentor: program.mentor,
          paymentStatus:
            program.type === "free" ? "not_required" : "pending"
        })

        programMsg = `You Have Enrolled In ${program.title} Program.`
      }

      // Send acceptance email
      const user = await User.findById(request.user).select("email name");

      await sendEmail(user.email, "You've been accepted!", `
        <h2>Welcome, ${user.name}!</h2>
        <p>Your internship request has been accepted. You can now access your intern dashboard.</p>
        <b>${programMsg}</b>
      `);
    }

    res.json({ success: true, status: action });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Review failed" });
  }
};

// Public user checks their request status
export const getMyRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({ user: req.user._id })
      .populate("company", "name email")
      .populate("program", "title")
      .sort("-createdAt");

    res.json({ success: true, requests });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Failed to fetch requests" });
  }
};