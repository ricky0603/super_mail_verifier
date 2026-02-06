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

const DashboardTopbar = ({ user }) => {
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

  return (
    <header className="h-16 border-b border-base-300 bg-base-100">
      <div className="h-full px-6 flex items-center justify-end gap-6">
        <div className="text-sm text-base-content/70">
          Credits: <span className="font-semibold text-base-content">99</span>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          {avatarUrl ? (
            <div className="avatar">
              <div className="w-9 rounded-full">
                <img
                  alt={userLabel}
                  src={avatarUrl}
                  className="w-9 h-9"
                  referrerPolicy="no-referrer"
                  width={36}
                  height={36}
                />
              </div>
            </div>
          ) : (
            <div className="avatar placeholder">
              <div className="bg-base-200 text-base-content w-9 h-9 rounded-full flex items-center justify-center">
                <span className="text-sm leading-none">{userInitial}</span>
              </div>
            </div>
          )}
          <div className="text-sm font-medium truncate flex items-center h-9 leading-none">
            {userLabel}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
