import type { MouseEvent } from 'react';
import { LangSwitcher } from '../../components/LangSwitcher';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import { PROFILE } from '../../data/profile';
import { useCatalog } from '../../hooks/useCatalog';
import { useI18n } from '../../hooks/useI18n';
import { Catalog } from './Catalog';
import { Contact } from './Contact';
import { Identity } from './Identity';
import { ProjectCard, ProjectDetail } from './ProjectDetail';
import { Stats } from './Stats';
import { Story } from './Story';
import { QUICK_COMMANDS, useTerminal } from './useTerminal';
import type { CommandResult } from './commands';
import './terminal.css';

const BANNER = `██╗  ██╗ ██████╗  █████╗ ███╗   ██╗ ██████╗   ████████╗██████╗  █████╗ ███╗   ██╗
██║  ██║██╔═══██╗██╔══██╗████╗  ██║██╔════╝   ╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║
███████║██║   ██║███████║██╔██╗ ██║██║  ███╗     ██║   ██████╔╝███████║██╔██╗ ██║
██╔══██║██║   ██║██╔══██║██║╚██╗██║██║   ██║     ██║   ██╔══██╗██╔══██║██║╚██╗██║
██║  ██║╚██████╔╝██║  ██║██║ ╚████║╚██████╔╝     ██║   ██║  ██║██║  ██║██║ ╚████║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝      ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝`;

const USER = PROFILE.name.toLowerCase().replace(/\s+/g, '');

/** Một kết quả lệnh in ra màn hình. Mỗi `kind` là một khối nội dung của theme. */
function Output({ result }: { result: CommandResult }) {
  switch (result.kind) {
    case 'text':
      return (
        <div className="term-text">
          {result.lines.map((line, i) => (
            <p key={i} className="term-line">
              {line || '\u00a0'}
            </p>
          ))}
        </div>
      );
    case 'projects':
      return <Catalog category={result.category} items={result.items} />;
    case 'project':
      return <ProjectCard project={result.item} />;
    case 'profile':
      return <Identity />;
    case 'stats':
      return <Stats />;
    case 'skills':
      return <Story />;
    case 'contact':
      return <Contact />;
    case 'error':
      return <p className="term-error">{result.message}</p>;
    case 'noop':
      return null;
  }
}

export function Shell() {
  const { t, ti } = useI18n();
  const { query, setQuery, projects, all } = useCatalog();
  const term = useTerminal();

  /**
   * Bấm vào chỗ trống trong khung là con trỏ nhảy về dòng lệnh — terminal thật
   * nào cũng vậy. Trừ khi đang bấm vào một thứ bấm được, hoặc đang bôi đen chữ.
   */
  const reclaimFocus = (e: MouseEvent) => {
    const el = e.target as HTMLElement;
    if (el.closest('a, button, input, select, textarea, [role="dialog"]')) return;
    if (window.getSelection()?.toString()) return;
    term.focusInput();
  };

  return (
    <div className="term-shell" onClick={reclaimFocus}>
      <div className="term-crt" aria-hidden />

      <header className="term-bar">
        <span className="term-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>

        <h1 className="term-titlebar">
          {USER}
          <span className="term-dim">@github: </span>~/portfolio
        </h1>

        <label className="term-search">
          <span className="sr-only">{t('search.label')}</span>
          <span className="term-dim" aria-hidden>
            grep
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            spellCheck={false}
            autoComplete="off"
          />
          <span className="term-dim term-count" aria-hidden>
            {projects.length}/{all.length}
          </span>
        </label>

        <LangSwitcher className="term-lang" />
        <ThemeSwitcher />
      </header>

      <div
        className="term-screen"
        ref={term.scrollRef}
        role="log"
        aria-live="polite"
        aria-label={ti({ vi: 'Kết quả lệnh', en: 'Command output' })}
      >
        {!term.cleared && (
          <>
            <pre className="term-banner" aria-hidden>
              {BANNER}
            </pre>

            <p className="term-boot term-dim">
              portfolio v1.0.0 · {PROFILE.socials.length} links · {all.length} projects ·{' '}
              {new Date().getFullYear() - PROFILE.codingSince} years uptime
            </p>

            <p className="term-hint">
              {ti({ vi: 'Gõ ', en: 'Type ' })}
              <code className="term-code">help</code>
              {ti({
                vi: ' để xem mọi lệnh · Tab tự hoàn thành · ↑ ↓ lịch sử',
                en: ' to see every command · Tab completes · ↑ ↓ history',
              })}
            </p>
          </>
        )}

        {term.entries.map((entry) => (
          <div key={entry.id} className="term-entry" data-cmd={entry.input}>
            <p className="term-echo">
              <span className="term-prompt">{term.prompt}</span> {entry.input}
            </p>
            <Output result={entry.result} />
          </div>
        ))}
      </div>

      <form className="term-composer" onSubmit={term.submit}>
        <div className="term-quick">
          {QUICK_COMMANDS.map((c) => (
            <button key={c} type="button" className="term-quick-btn" onClick={() => term.run(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="term-inputrow">
          <span className="term-prompt" aria-hidden>
            {term.prompt}
          </span>
          <span className="term-field">
            <input
              ref={term.inputRef}
              className="term-input"
              type="text"
              value={term.value}
              onChange={(e) => term.setValue(e.target.value)}
              onKeyDown={term.onKeyDown}
              data-empty={term.value === '' ? 'true' : 'false'}
              aria-label={ti({ vi: 'Dòng lệnh', en: 'Command line' })}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {term.value === '' && <span className="term-caret" aria-hidden />}
          </span>
        </div>
      </form>

      <ProjectDetail />
    </div>
  );
}
