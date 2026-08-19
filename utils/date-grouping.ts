import type { Conversation } from "@/types/database.types";

export interface GroupedConversations {
  today: Conversation[];
  yesterday: Conversation[];
  previous7Days: Conversation[];
  older: Conversation[];
}

/**
 * Group conversations chronologically: Today, Yesterday, Previous 7 days, Older
 */
export function groupConversationsByDate(conversations: Conversation[]): GroupedConversations {
  const groups: GroupedConversations = {
    today: [],
    yesterday: [],
    previous7Days: [],
    older: [],
  };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000; // 24 hours in ms
  const startOf7DaysAgo = startOfToday - 7 * 86400000;

  for (const conv of conversations) {
    const convTime = new Date(conv.updated_at || conv.created_at).getTime();

    if (convTime >= startOfToday) {
      groups.today.push(conv);
    } else if (convTime >= startOfYesterday) {
      groups.yesterday.push(conv);
    } else if (convTime >= startOf7DaysAgo) {
      groups.previous7Days.push(conv);
    } else {
      groups.older.push(conv);
    }
  }

  return groups;
}
