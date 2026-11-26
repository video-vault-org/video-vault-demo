import { describe, expect, test, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const details = async function () {
  const actor = userEvent.setup();
  await actor.click(screen.getAllByRole('button', { name: /Mehr Details/ })[0]);
  return actor;
};

describe('read-only static demo', () => {
  test('starts directly, explains public examples and never calls an API', () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Geschichten, die bleiben.' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Ein Sommer am See' })).toBeVisible();
    expect(screen.queryByLabelText('Passwort')).not.toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Demo-Hinweis' })).toHaveTextContent('nicht verschlüsselt');
    expect(screen.getByRole('button', { name: /Video hinzufügen/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Benutzerverwaltung' })).toBeEnabled();
    expect(fetch).not.toHaveBeenCalled();
  });

  test('combines search, configured filters and dates, then resets', async () => {
    render(<App />);
    const actor = userEvent.setup();
    await actor.selectOptions(screen.getByLabelText('Kategorie'), 'Freizeit / Leisure');
    expect(screen.getAllByRole('heading', { level: 2 }).map((n) => n.textContent)).toEqual(['Ein Abend im Garten']);
    await actor.click(screen.getByRole('button', { name: 'Zurücksetzen' }));
    await actor.type(screen.getByRole('searchbox', { name: 'Personen' }), 'Sam');
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
    await actor.type(screen.getByRole('searchbox', { name: 'Videos durchsuchen' }), 'Wolken');
    expect(screen.getAllByRole('heading', { level: 2 }).map((n) => n.textContent)).toEqual(['Unterwegs in den Bergen']);
    await actor.clear(screen.getByRole('searchbox', { name: 'Videos durchsuchen' }));
    await actor.clear(screen.getByRole('searchbox', { name: 'Personen' }));
    await actor.type(screen.getByRole('searchbox', { name: 'Videos durchsuchen' }), 'no-such-video');
    expect(screen.getByText('Keine passenden Videos')).toBeVisible();
    await actor.click(screen.getByRole('button', { name: 'Zurücksetzen' }));
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
  });

  test('shows complete details, static media and title-based download with disabled writes', async () => {
    render(<App />);
    const actor = await details();
    const dialog = screen.getByRole('dialog', { name: 'Ein Sommer am See' });
    expect(dialog.querySelector('video')).toHaveAttribute('src', '/demo/lake.mp4');
    expect(within(dialog).getByRole('link', { name: 'Herunterladen' })).toHaveAttribute('download', 'Ein Sommer am See.mp4');
    expect(within(dialog).getByText('Am See')).toBeVisible();
    expect(within(dialog).getByRole('button', { name: 'Bearbeiten' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Löschen' })).toBeDisabled();
    await actor.click(within(dialog).getByRole('button', { name: 'Schließen' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('paginates comments, shows edited dates and tombstones and prevents writes', async () => {
    render(<App />);
    const actor = await details();
    await actor.click(screen.getByRole('button', { name: 'Kommentare' }));
    const dialog = screen.getByRole('dialog', { name: 'Kommentare' });
    expect(dialog.querySelectorAll('.comment')).toHaveLength(2);
    expect(dialog.querySelector('time')).toHaveAttribute('dateTime', '2026-08-12T12:10:00Z');
    expect(within(dialog).getByLabelText('Dein Kommentar')).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Speichern' })).toBeDisabled();
    await actor.click(within(dialog).getByRole('button', { name: 'Weitere Kommentare laden' }));
    expect(dialog.querySelectorAll('.comment')).toHaveLength(4);
    expect(within(dialog).getByText('Gelöscht')).toBeVisible();
    expect(within(dialog).queryByRole('button', { name: 'Weitere Kommentare laden' })).not.toBeInTheDocument();
    await actor.click(within(dialog).getByRole('button', { name: 'Schließen' }));
    expect(screen.getByRole('dialog', { name: 'Ein Sommer am See' })).toBeVisible();
  });

  test('translates content and persists language; account stays read-only', async () => {
    render(<App />);
    const actor = userEvent.setup();
    await actor.click(screen.getByRole('button', { name: 'Sprache wechseln' }));
    expect(screen.getByRole('heading', { name: 'A summer by the lake' })).toBeVisible();
    expect(localStorage.getItem('videovault.demo.language')).toBe('en');
    await actor.click(screen.getByRole('button', { name: 'My account' }));
    const dialog = screen.getByRole('dialog', { name: 'My account' });
    expect(within(dialog).getByRole('button', { name: 'Change password' })).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: 'Delete account' })).toBeDisabled();
    expect(within(dialog).getByText(/no real user account/)).toBeVisible();
  });
});

test('shows fictional users while disabling all account and role changes', async () => {
  render(<App />);
  const actor = userEvent.setup();
  await actor.click(screen.getByRole('button', { name: 'Benutzerverwaltung' }));
  const dialog = screen.getByRole('dialog', { name: 'Benutzerverwaltung' });
  expect(within(dialog).getByRole('heading', { name: 'Alex' })).toBeVisible();
  expect(within(dialog).getByRole('button', { name: 'Nutzer hinzufügen' })).toBeDisabled();
  for (const checkbox of within(dialog).getAllByRole('checkbox')) expect(checkbox).toBeDisabled();
  for (const button of within(dialog).getAllByRole('button', { name: 'Passwort zurücksetzen' })) expect(button).toBeDisabled();
});
