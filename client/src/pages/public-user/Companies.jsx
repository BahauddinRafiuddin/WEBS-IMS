import { useEffect, useState } from "react";
import { getAllCompaniesWithPrograms, sendJoinRequest } from "../../api/publicUser.api.js";
import { toastError, toastSuccess } from "../../utils/toast";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  const fetchCompanies = async () => {
    try {
      const res = await getAllCompaniesWithPrograms();
      setCompanies(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Join Company
  const handleJoinCompany = async (company) => {
    try {
      setSending(company._id);
      console.log(company._id)
      await sendJoinRequest({
        companyId: company._id,
        message: `Hi, I want to join ${company.name}. Please consider my request.`,
      });

      toastSuccess("Request sent successfully 🚀");
    } catch (err) {
      toastError(err?.response?.data?.message || "Error sending request");
    } finally {
      setSending(null);
    }
  };

  // Join Program
  const handleJoinProgram = async (company, program) => {
    try {
      setSending(program._id);

      await sendJoinRequest({
        companyId: company._id,
        programId: program._id,
        message: `Hi, I want to enroll in "${program.title}" at ${company.name}.`,
      });

      toastSuccess("Program request sent 🚀");
    } catch (err) {
      toastError(err?.response?.data?.message || "Error");
    } finally {
      setSending(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading companies...</div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-6">Available Companies</h1>

      {companies.length === 0 ? (
        <p className="text-gray-500">No companies available</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 p-5 flex flex-col justify-between"
            >
              {/* Company Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {company.name}
                </h2>

                <p className="text-sm text-gray-500 mt-1">{company.email}</p>

                {company.description && (
                  <p className="text-sm mt-2 text-gray-600 line-clamp-3">
                    {company.description}
                  </p>
                )}

                {/* Programs */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Programs
                  </h3>

                  {company.programs?.length > 0 ? (
                    <div className="space-y-2">
                      {company.programs.map((program) => (
                        <div
                          key={program._id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {program.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {program.type}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              handleJoinProgram(company, program)
                            }
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition"
                          >
                            {sending === program._id ? "..." : "Join"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
                      No programs available
                    </p>
                  )}
                </div>
              </div>

              {/* Company Join Button */}
              <button
                onClick={() => handleJoinCompany(company)}
                className="mt-5 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition font-medium"
              >
                {sending === company._id ? "Sending..." : "Join Company"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;
