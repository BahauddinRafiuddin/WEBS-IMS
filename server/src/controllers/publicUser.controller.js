import Company from "../models/Company.js";
import InternshipProgram from "../models/InternshipProgram.js";

// Get all companies with programs (basic version)
export const getAllCompaniesWithPrograms = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const query = {
      name: { $regex: search, $options: "i" }
    };

    const companies = await Company.find(query)
      .select("name email logo description")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Attach programs to each company
    const companyIds = companies.map(c => c._id);

    const programs = await InternshipProgram.find({
      company: { $in: companyIds },
      status: {$ne:"draft"}
    })
      .select("title type price company")
      .lean();

    // Map programs to company
    const companyWithPrograms = companies.map(company => {
      return {
        ...company,
        programs: programs.filter(
          p => p.company.toString() === company._id.toString()
        )
      };
    });

    const total = await Company.countDocuments(query);

    res.json({
      success: true,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total,
      data: companyWithPrograms
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch companies"
    });
  }
}