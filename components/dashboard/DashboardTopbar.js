import { createClient } from "@/libs/supabase/server";
import DashboardTopbarClient from "@/components/dashboard/DashboardTopbarClient";

const getIdentityData = (user) => {
  const identities = Array.isArray(user?.identities) ? user.identities : [];
  return identities[0]?.identity_data || null;
};

const getUserLabel = (user) => {
  const identityData = getIdentityData(user);
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    identityData?.full_name ||
    identityData?.name ||
    user?.user_metadata?.user_name ||
    identityData?.user_name ||
    user?.email;
  return name || "User";
};

const getUserInitial = (label) => {
  const normalized = String(label || "").trim();
  return normalized ? normalized[0].toUpperCase() : "U";
};

export default async function DashboardTopbar({ user }) {
  const userLabel = getUserLabel(user);
  const userInitial = getUserInitial(userLabel);
  const identityData = getIdentityData(user);
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.user_metadata?.avatar ||
    identityData?.avatar_url ||
    identityData?.picture ||
    identityData?.avatar_url;

  let availableCredit = null;
  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("total_credit,used_credit")
      .eq("id", user?.id)
      .maybeSingle();

    if (!error) {
      const total = profile?.total_credit || 0;
      const used = profile?.used_credit || 0;
      availableCredit = Math.max(0, total - used);
    }
  } catch {
    // Ignore credit display errors; don't block the rest of the UI.
  }

  return (
    <DashboardTopbarClient
      userLabel={userLabel}
      userInitial={userInitial}
      avatarUrl={avatarUrl}
      availableCredit={availableCredit}
    />
  );
}

