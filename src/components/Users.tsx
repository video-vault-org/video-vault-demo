import { Dialog, useLanguage } from '../lib/ui';

const users = [
  { username: 'alex', displayName: 'Alex', admin: true, editor: true, moderator: false },
  { username: 'sam', displayName: 'Sam', admin: false, editor: false, moderator: false },
  { username: 'robin', displayName: 'Robin', admin: false, editor: true, moderator: true }
];

const Users = function ({ close }: { close: () => void }) {
  const { t } = useLanguage();
  const readOnly = t('In der schreibgeschützten Demo nicht verfügbar.', 'Unavailable in this read-only demo.');
  return (
    <Dialog title={t('Benutzerverwaltung', 'User management')} close={close}>
      <p>{t('Fiktive Beispielkonten. Konten, Passwörter und Rollen lassen sich in der Demo nicht ändern.', 'Fictional example accounts. Accounts, passwords and roles cannot be changed in this demo.')}</p>
      <button className="primary" disabled title={readOnly}>
        {t('Nutzer hinzufügen', 'Add user')}
      </button>
      {users.map((user) => (
        <article className="comment" key={user.username}>
          <h3>{user.displayName}</h3>
          <p>@{user.username}</p>
          <div className="actions">
            <label>
              <input type="checkbox" checked={user.admin} disabled readOnly /> Admin
            </label>
            <label>
              <input type="checkbox" checked={user.editor} disabled readOnly /> Editor
            </label>
            <label>
              <input type="checkbox" checked={user.moderator} disabled readOnly /> Moderator
            </label>
          </div>
          <div className="actions">
            <button disabled title={readOnly}>
              {t('Bearbeiten', 'Edit')}
            </button>
            <button disabled title={readOnly}>
              {t('Passwort zurücksetzen', 'Reset password')}
            </button>
            <button disabled className="danger" title={readOnly}>
              {t('Löschen', 'Delete')}
            </button>
          </div>
        </article>
      ))}
    </Dialog>
  );
};

export { Users };
