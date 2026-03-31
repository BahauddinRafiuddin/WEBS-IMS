import { getInternChatData } from "./intern.service.js";
import { getMentorChatData } from "./mentor.service.js";
import { getAdminChatData } from "./admin.service.js";
import { getSuperAdminChatData } from "./superAdmin.service.js";

export const getChatContextData = async (context) => {
  switch (context.role) {
    case "intern":
      return await getInternChatData(context.userId);

    case "mentor":
      return await getMentorChatData(context.userId);

    case "admin":
      return await getAdminChatData(context.companyId);

    case "super_admin":
      return await getSuperAdminChatData();

    default:
      return {};
  }
};