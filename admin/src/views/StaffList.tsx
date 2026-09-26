import { dictionaryFor, type Locale } from '../i18n/index.ts';
import type { Role, StaffMember } from '../staff.ts';
import { Layout } from './Layout.tsx';

export type GrantFormState = {
  email: string;
  roleId: string;
};

type Props = {
  locale: Locale;
  staffMembers: StaffMember[];
  roles: Role[];
  updatedEmail: string | null;
  error: string | null;
  form?: GrantFormState;
};

export function StaffList({
  locale,
  staffMembers,
  roles,
  updatedEmail,
  error,
  form = { email: '', roleId: '' }
}: Props) {
  const dict = dictionaryFor(locale);
  const permissionLabel = (permission: string) =>
    dict.permissions[permission] ?? permission;

  return (
    <Layout locale={locale} title={dict.staffMembers} path="/staff">
      <h1>{dict.staffMembers}</h1>

      {updatedEmail && (
        <p class="notice" role="status">
          {dict.staffUpdated(updatedEmail)}
        </p>
      )}
      {error && (
        <p class="notice notice-error" role="alert">
          {error}
        </p>
      )}

      <section class="card">
        {staffMembers.length === 0 ? (
          <p class="muted">{dict.noStaffMembers}</p>
        ) : (
          <ul class="staff-list">
            {staffMembers.map((member) => (
              <li key={member.id}>
                <p class="staff-email">
                  {member.email}{' '}
                  {member.revoked_at && (
                    <span class="badge badge-unavailable">{dict.revoked}</span>
                  )}
                </p>
                {member.roles.length === 0 ? (
                  <p class="muted">{dict.noRoles}</p>
                ) : (
                  <ul class="role-chips">
                    {member.roles.map((role) => (
                      <li key={role.id}>
                        <span>{role.name}</span>
                        <form
                          method="post"
                          action={`/${locale}/staff/${member.id}/roles/${role.id}/removal`}
                        >
                          <button
                            type="submit"
                            class="link-button"
                            aria-label={dict.removeRole(role.name)}
                          >
                            {dict.remove}
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}
                {!member.revoked_at && (
                  <form
                    method="post"
                    action={`/${locale}/staff/${member.id}/revocation`}
                  >
                    <button type="submit" class="danger-button">
                      {dict.revoke}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section class="card">
        <form method="post" action={`/${locale}/staff`}>
          <h2>{dict.grantRole}</h2>
          <label class="stacked" for="email">
            {dict.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autocomplete="off"
            value={form.email}
            aria-describedby="email-help"
          />
          <p id="email-help" class="muted">
            {dict.grantRoleHelp}
          </p>

          <label class="stacked" for="role_id">
            {dict.role}
          </label>
          <select id="role_id" name="role_id" required>
            <option value="" selected={form.roleId === ''} disabled>
              {dict.chooseRole}
            </option>
            {roles.map((role) => (
              <option
                key={role.id}
                value={String(role.id)}
                selected={form.roleId === String(role.id)}
              >
                {role.name}
              </option>
            ))}
          </select>

          <button type="submit">{dict.grant}</button>
        </form>
      </section>

      <section class="card">
        <h2>{dict.roles}</h2>
        <dl>
          {roles.map((role) => (
            <div key={role.id} class="field">
              <dt>{role.name}</dt>
              <dd>
                {role.description && <p class="prewrap">{role.description}</p>}
                <p class="muted">
                  {role.permissions.map(permissionLabel).join(' · ') ||
                    dict.none}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </Layout>
  );
}
