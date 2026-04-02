/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  getJoinRequests,
  reviewJoinRequest,
} from "../../api/admin.api.js";
import { toastError, toastSuccess } from "../../utils/toast";

const JoinRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await getJoinRequests();
      setRequests(res.requests || []);
    } catch (err) {
      console.error(err);
      toastError("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ✅ Handle Accept / Reject
  const handleAction = async (id, action) => {
    try {
      setProcessing(id);

      await reviewJoinRequest(id, action);

      // ✅ Update status instead of removing
      setRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: action } : req
        )
      );

      toastSuccess(`Request ${action}`);
    } catch (err) {
      toastError("Failed to update request");
    } finally {
      setProcessing(null);
    }
  };

  // ✅ Status Badge Style
  const getStatusStyle = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading requests...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-6">
        Join Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-gray-500">No requests found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-gray-100 text-left text-sm text-gray-600">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Program</th>
                <th className="p-3">Message</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req) => (
                <tr
                  key={req._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {/* User */}
                  <td className="p-3 font-medium">
                    {req.user?.name}
                  </td>

                  {/* Email */}
                  <td className="p-3 text-sm text-gray-600">
                    {req.user?.email}
                  </td>

                  {/* Program */}
                  <td className="p-3 text-sm">
                    {req.program?.title || "—"}
                  </td>

                  {/* Message */}
                  <td className="p-3 text-sm italic text-gray-600 max-w-xs truncate">
                    {req.message || "—"}
                  </td>

                  {/* Date */}
                  <td className="p-3 text-xs text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusStyle(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-center">
                    {req.status === "pending" ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() =>
                            handleAction(req._id, "accepted")
                          }
                          disabled={processing === req._id}
                          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer transition text-sm"
                        >
                          {processing === req._id
                            ? "..."
                            : "Accept"}
                        </button>

                        <button
                          onClick={() =>
                            handleAction(req._id, "rejected")
                          }
                          disabled={processing === req._id}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer transition text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        No Action
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JoinRequest;