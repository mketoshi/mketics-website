import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  KeyRound,
  Loader2,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const roleOptions = ["admin", "staff", "client"];

const roleAccess = {
  admin: [
    "Full business console access",
    "Manage users and staff access",
    "Manage company settings",
    "View finance, invoices, reports and executive snapshots",
    "Create and update leads, quotes, clients, projects and documents",
  ],
  staff: [
    "Work on leads, projects, tasks and documents",
    "View operations dashboards and delivery reports",
    "Create follow-up notes and support updates",
    "No direct user-management access",
    "No finance, invoices, executive snapshot or settings access by default",
  ],
  client: [
    "No admin dashboard access",
    "Reserved for future client portal access",
    "Can be linked to client records later",
  ],
};

export default function AdminUserManagementDashboard({ isActive, profile }) {
  const [usersState, setUsersState] = useState({
    loading: false,
    error: "",
    users: [],
  });

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    role: "staff",
    phone: "",
    organisation: "",
  });

  const [newUserForm, setNewUserForm] = useState({
    authUserId: "",
    fullName: "",
    email: "",
    role: "staff",
    phone: "",
    organisation: "MKETICS (PTY) LTD",
  });

  const [saveState, setSaveState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const [createState, setCreateState] = useState({
    loading: false,
    error: "",
    success: "",
  });

  const isAdminUser = profile?.role === "admin";

  const selectedUser = useMemo(() => {
    return usersState.users.find((user) => user.id === selectedUserId) || null;
  }, [usersState.users, selectedUserId]);

  const filteredUsers = useMemo(() => {
    return usersState.users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const searchableText = [
        user.full_name,
        user.email,
        user.role,
        user.phone,
        user.organisation,
        user.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchTerm.trim() ||
        searchableText.includes(searchTerm.trim().toLowerCase());

      return matchesRole && matchesSearch;
    });
  }, [usersState.users, searchTerm, roleFilter]);

  const stats = useMemo(() => {
    const total = usersState.users.length;
    const admins = usersState.users.filter((user) => user.role === "admin").length;
    const staff = usersState.users.filter((user) => user.role === "staff").length;
    const clients = usersState.users.filter((user) => user.role === "client").length;

    return { total, admins, staff, clients };
  }, [usersState.users]);

  useEffect(() => {
    if (isActive && isAdminUser) {
      fetchUsers();
    }
  }, [isActive, isAdminUser]);

  useEffect(() => {
    if (!selectedUser) return;

    setEditForm({
      fullName: selectedUser.full_name || "",
      email: selectedUser.email || "",
      role: selectedUser.role || "staff",
      phone: selectedUser.phone || "",
      organisation: selectedUser.organisation || "",
    });

    setSaveState({
      loading: false,
      error: "",
      success: "",
    });
  }, [selectedUserId, selectedUser?.updated_at]);

  async function fetchUsers() {
    if (!supabase) return;

    try {
      setUsersState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, phone, organisation, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsersState({
        loading: false,
        error: "",
        users: data || [],
      });
    } catch (error) {
      setUsersState({
        loading: false,
        error:
          error?.message ||
          "Unable to load users. Check Supabase profile access policies.",
        users: [],
      });
    }
  }

  async function handleCreateProfile(event) {
    event.preventDefault();

    if (!supabase) return;

    if (!newUserForm.authUserId.trim()) {
      setCreateState({
        loading: false,
        error: "Enter the Supabase Auth user ID for this person.",
        success: "",
      });
      return;
    }

    if (!newUserForm.email.trim()) {
      setCreateState({
        loading: false,
        error: "Enter the user email address.",
        success: "",
      });
      return;
    }

    if (!roleOptions.includes(newUserForm.role)) {
      setCreateState({
        loading: false,
        error: "Choose a valid user role.",
        success: "",
      });
      return;
    }

    try {
      setCreateState({
        loading: true,
        error: "",
        success: "",
      });

      const profileRow = {
        id: newUserForm.authUserId.trim(),
        full_name: newUserForm.fullName.trim() || null,
        email: newUserForm.email.trim(),
        role: newUserForm.role,
        phone: newUserForm.phone.trim() || null,
        organisation: newUserForm.organisation.trim() || null,
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(profileRow, { onConflict: "id" })
        .select("id, full_name, email, role, phone, organisation, created_at, updated_at")
        .single();

      if (error) throw error;

      setUsersState((current) => {
        const alreadyExists = current.users.some((user) => user.id === data.id);

        return {
          ...current,
          users: alreadyExists
            ? current.users.map((user) => (user.id === data.id ? data : user))
            : [data, ...current.users],
        };
      });

      setSelectedUserId(data.id);

      setNewUserForm({
        authUserId: "",
        fullName: "",
        email: "",
        role: "staff",
        phone: "",
        organisation: "MKETICS (PTY) LTD",
      });

      setCreateState({
        loading: false,
        error: "",
        success: "Profile saved. The user can sign in if their Supabase Auth account exists.",
      });
    } catch (error) {
      setCreateState({
        loading: false,
        error:
          error?.message ||
          "Unable to create this profile. Confirm the Auth user exists and your account is admin.",
        success: "",
      });
    }
  }

  async function handleUpdateProfile(event) {
    event.preventDefault();

    if (!selectedUser || !supabase) return;

    if (!roleOptions.includes(editForm.role)) {
      setSaveState({
        loading: false,
        error: "Choose a valid user role.",
        success: "",
      });
      return;
    }

    try {
      setSaveState({
        loading: true,
        error: "",
        success: "",
      });

      const updatedProfile = {
        full_name: editForm.fullName.trim() || null,
        email: editForm.email.trim() || null,
        role: editForm.role,
        phone: editForm.phone.trim() || null,
        organisation: editForm.organisation.trim() || null,
      };

      const { data, error } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", selectedUser.id)
        .select("id, full_name, email, role, phone, organisation, created_at, updated_at")
        .single();

      if (error) throw error;

      setUsersState((current) => ({
        ...current,
        users: current.users.map((user) =>
          user.id === selectedUser.id ? data : user
        ),
      }));

      setSaveState({
        loading: false,
        error: "",
        success: "User profile and access role updated.",
      });
    } catch (error) {
      setSaveState({
        loading: false,
        error:
          error?.message ||
          "Unable to update this user. Check profile policies and your admin role.",
        success: "",
      });
    }
  }

  async function handleDemoteToClient() {
    if (!selectedUser || !supabase) return;

    const confirmed = window.confirm(
      `Remove admin/staff access for ${selectedUser.email || selectedUser.full_name}? This will set the profile role to client.`
    );

    if (!confirmed) return;

    setEditForm((current) => ({ ...current, role: "client" }));

    try {
      setSaveState({
        loading: true,
        error: "",
        success: "",
      });

      const { data, error } = await supabase
        .from("profiles")
        .update({ role: "client" })
        .eq("id", selectedUser.id)
        .select("id, full_name, email, role, phone, organisation, created_at, updated_at")
        .single();

      if (error) throw error;

      setUsersState((current) => ({
        ...current,
        users: current.users.map((user) =>
          user.id === selectedUser.id ? data : user
        ),
      }));

      setSaveState({
        loading: false,
        error: "",
        success: "Admin/staff access removed. Role changed to client.",
      });
    } catch (error) {
      setSaveState({
        loading: false,
        error: error?.message || "Unable to remove access for this user.",
        success: "",
      });
    }
  }

  async function copyAccessSummary() {
    const summary = [
      "MKETICS ADMIN ACCESS SUMMARY",
      "",
      `Total profiles: ${stats.total}`,
      `Admins: ${stats.admins}`,
      `Staff: ${stats.staff}`,
      `Client role profiles: ${stats.clients}`,
      "",
      "Current users:",
      ...usersState.users.map(
        (user) =>
          `- ${user.full_name || user.email || "Unnamed"} | ${user.email || "No email"} | ${toReadableLabel(user.role)}`
      ),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setSaveState({
        loading: false,
        error: "",
        success: "Access summary copied.",
      });
    } catch {
      setSaveState({
        loading: false,
        error: "Unable to copy access summary in this browser.",
        success: "",
      });
    }
  }

  function updateNewUserField(event) {
    const { name, value } = event.target;

    setNewUserForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (createState.error || createState.success) {
      setCreateState({ loading: false, error: "", success: "" });
    }
  }

  function updateEditField(event) {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (saveState.error || saveState.success) {
      setSaveState({ loading: false, error: "", success: "" });
    }
  }

  if (!isAdminUser) {
    return (
      <section className="rounded-[2rem] border border-red-200 bg-white p-6 shadow-sm">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-700">
          <ShieldAlert size={22} />
        </div>

        <h2 className="mt-4 text-2xl font-black text-[#020B1F]">
          Admin access required.
        </h2>

        <p className="mt-2 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
          User management is restricted to MKETICS admin accounts. Staff users can
          work inside assigned business areas but cannot manage user roles.
        </p>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0B7CFF]">
              Users & Access Control
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#020B1F]">
              Admin user management.
            </h2>

            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-slate-600">
              Manage MKETICS admin, staff and future client profile records. New
              users must first be created in Supabase Authentication, then their
              Auth user ID can be linked here.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyAccessSummary}
              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-5 py-3 text-sm font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
            >
              <Clipboard size={17} className="mr-2" />
              Copy Summary
            </button>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={usersState.loading}
              className="inline-flex items-center justify-center rounded-full bg-[#061A33] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0B7CFF] disabled:opacity-70"
            >
              {usersState.loading ? (
                <Loader2 size={17} className="mr-2 animate-spin" />
              ) : (
                <RefreshCw size={17} className="mr-2" />
              )}
              Refresh Users
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Profiles" value={stats.total} />
        <StatCard label="Admins" value={stats.admins} />
        <StatCard label="Staff" value={stats.staff} />
        <StatCard label="Clients" value={stats.clients} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                <UsersRound size={21} />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#020B1F]">
                  User records
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  View and manage profile roles connected to Supabase Auth users.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_190px]">
              <label className="relative block">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search name, email, role or Auth ID..."
                  className="w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                />
              </label>

              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              >
                <option value="all">All roles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {toReadableLabel(role)}
                  </option>
                ))}
              </select>
            </div>

            {usersState.error && (
              <StatusMessage type="error" message={usersState.error} />
            )}

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-[850px] w-full border-collapse bg-white text-left">
                  <thead className="bg-[#F8FCFF]">
                    <tr>
                      <Th>User</Th>
                      <Th>Role</Th>
                      <Th>Organisation</Th>
                      <Th>Created</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>

                  <tbody>
                    {usersState.loading && (
                      <tr>
                        <td colSpan="5" className="px-5 py-10 text-center">
                          <Loader2
                            className="mx-auto animate-spin text-[#0B7CFF]"
                            size={28}
                          />
                          <p className="mt-3 text-sm font-black text-slate-500">
                            Loading users...
                          </p>
                        </td>
                      </tr>
                    )}

                    {!usersState.loading && filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-5 py-10 text-center">
                          <UsersRound className="mx-auto text-slate-400" size={28} />
                          <p className="mt-3 text-sm font-black text-slate-500">
                            No users found.
                          </p>
                        </td>
                      </tr>
                    )}

                    {!usersState.loading &&
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className="border-t border-slate-200 align-top transition hover:bg-[#F8FCFF]"
                        >
                          <Td>
                            <p className="font-black text-[#020B1F]">
                              {user.full_name || "Unnamed profile"}
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {user.email || "No email"}
                            </p>
                            <p className="mt-1 max-w-[320px] truncate text-[11px] font-bold text-slate-400">
                              {user.id}
                            </p>
                          </Td>

                          <Td>
                            <RoleBadge role={user.role} />
                          </Td>

                          <Td>{user.organisation || "Not provided"}</Td>
                          <Td>{formatDate(user.created_at)}</Td>

                          <Td>
                            <button
                              type="button"
                              onClick={() => setSelectedUserId(user.id)}
                              className="inline-flex items-center justify-center rounded-full border border-[#0B7CFF]/25 bg-[#EAF6FF] px-4 py-2 text-xs font-black text-[#061A33] transition hover:border-cyan-300 hover:bg-cyan-300"
                            >
                              <UserCog size={14} className="mr-2" />
                              Manage
                            </button>
                          </Td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                <KeyRound size={21} />
              </div>

              <div>
                <h3 className="text-xl font-black text-[#020B1F]">
                  Access levels
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Role guidance for the MKETICS business console.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {roleOptions.map((role) => (
                <article
                  key={role}
                  className="rounded-[1.25rem] border border-slate-200 bg-[#F8FCFF] p-4"
                >
                  <RoleBadge role={role} />

                  <ul className="mt-4 grid gap-2">
                    {roleAccess[role].map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs font-bold leading-5 text-slate-600"
                      >
                        <CheckCircle2
                          size={14}
                          className="mt-0.5 shrink-0 text-[#0B7CFF]"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5 content-start">
          <form
            onSubmit={handleCreateProfile}
            className="rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
              <UserPlus size={22} />
            </div>

            <h3 className="mt-4 text-xl font-black text-[#020B1F]">
              Add staff/admin profile
            </h3>

            <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
              Create the user first in Supabase Authentication, then paste their
              Auth user ID here to link their dashboard profile.
            </p>

            {createState.error && (
              <StatusMessage type="error" message={createState.error} />
            )}

            {createState.success && (
              <StatusMessage type="success" message={createState.success} />
            )}

            <div className="mt-5 grid gap-4">
              <InputField
                label="Supabase Auth User ID"
                name="authUserId"
                value={newUserForm.authUserId}
                onChange={updateNewUserField}
                placeholder="Paste auth.users.id UUID"
              />

              <InputField
                label="Full Name"
                name="fullName"
                value={newUserForm.fullName}
                onChange={updateNewUserField}
                placeholder="Staff member name"
              />

              <InputField
                label="Email"
                name="email"
                value={newUserForm.email}
                onChange={updateNewUserField}
                placeholder="staff@mketics.co.za"
                type="email"
              />

              <label className="block">
                <span className="text-sm font-black text-[#061A33]">Role</span>
                <select
                  name="role"
                  value={newUserForm.role}
                  onChange={updateNewUserField}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {toReadableLabel(role)}
                    </option>
                  ))}
                </select>
              </label>

              <InputField
                label="Phone"
                name="phone"
                value={newUserForm.phone}
                onChange={updateNewUserField}
                placeholder="Optional"
              />

              <InputField
                label="Organisation"
                name="organisation"
                value={newUserForm.organisation}
                onChange={updateNewUserField}
                placeholder="MKETICS (PTY) LTD"
              />
            </div>

            <button
              type="submit"
              disabled={createState.loading}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {createState.loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Saving Profile
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Save Profile
                </>
              )}
            </button>
          </form>

          {selectedUser ? (
            <form
              onSubmit={handleUpdateProfile}
              className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                <UserCog size={22} />
              </div>

              <h3 className="mt-4 text-xl font-black text-[#020B1F]">
                Manage selected user
              </h3>

              <p className="mt-2 break-words text-xs font-bold leading-5 text-slate-500">
                Auth ID: {selectedUser.id}
              </p>

              {saveState.error && (
                <StatusMessage type="error" message={saveState.error} />
              )}

              {saveState.success && (
                <StatusMessage type="success" message={saveState.success} />
              )}

              <div className="mt-5 grid gap-4">
                <InputField
                  label="Full Name"
                  name="fullName"
                  value={editForm.fullName}
                  onChange={updateEditField}
                />

                <InputField
                  label="Email"
                  name="email"
                  value={editForm.email}
                  onChange={updateEditField}
                  type="email"
                />

                <label className="block">
                  <span className="text-sm font-black text-[#061A33]">Role</span>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={updateEditField}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-black outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {toReadableLabel(role)}
                      </option>
                    ))}
                  </select>
                </label>

                <InputField
                  label="Phone"
                  name="phone"
                  value={editForm.phone}
                  onChange={updateEditField}
                />

                <InputField
                  label="Organisation"
                  name="organisation"
                  value={editForm.organisation}
                  onChange={updateEditField}
                />
              </div>

              <button
                type="submit"
                disabled={saveState.loading}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#0B7CFF] to-[#00AEEF] px-6 py-3 font-black text-white shadow-[0_16px_40px_rgba(0,174,239,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saveState.loading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    Saving Changes
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save User Access
                  </>
                )}
              </button>

              {selectedUser.role !== "client" && (
                <button
                  type="button"
                  onClick={handleDemoteToClient}
                  disabled={saveState.loading}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-red-200 bg-red-50 px-6 py-3 font-black text-red-800 transition hover:bg-red-100 disabled:opacity-70"
                >
                  <ShieldAlert size={18} className="mr-2" />
                  Remove Admin/Staff Access
                </button>
              )}
            </form>
          ) : (
            <div className="rounded-[2rem] border border-cyan-200 bg-white p-5 shadow-sm">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#061A33] text-cyan-300">
                <ShieldCheck size={22} />
              </div>

              <h3 className="mt-4 text-xl font-black text-[#020B1F]">
                Select a user.
              </h3>

              <p className="mt-2 text-sm font-semibold leading-7 text-slate-600">
                Use Manage in the user table to update a profile, change a role
                or remove dashboard access.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function InputField({ label, name, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[#061A33]">{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#F8FCFF] px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}

function RoleBadge({ role }) {
  const badgeStyles = {
    admin: "bg-[#061A33] text-cyan-300",
    staff: "bg-[#EAF6FF] text-[#0B7CFF]",
    client: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${
        badgeStyles[role] || badgeStyles.client
      }`}
    >
      {toReadableLabel(role)}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0B7CFF]">
        {label}
      </p>
      <p className="mt-3 text-4xl font-black text-[#020B1F]">{value}</p>
    </article>
  );
}

function StatusMessage({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
        isError
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
      {isError ? (
        <AlertCircle size={20} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
      )}

      <p className="text-sm font-bold leading-6">{message}</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }) {
  return (
    <td className="px-5 py-4 text-sm font-semibold leading-6 text-slate-700">
      {children}
    </td>
  );
}

function formatDate(value) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function toReadableLabel(value) {
  if (!value) return "Not provided";

  return String(value)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
