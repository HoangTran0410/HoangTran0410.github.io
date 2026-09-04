import { useMemo } from 'react';
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
import { Timeline } from './Timeline';
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

interface OutputProps {
  result: CommandResult;
  /** true nếu đây là khối timeline mới nhất — chỉ nó được mang id="timeline". */
  anchor?: boolean;
}

/** Một kết quả lệnh in ra màn hình. Mỗi `kind` là một khối nội dung của theme. */
function Output({ result, anchor }: OutputProps) {
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
    case 'timeline':
      return <Timeline anchor={anchor} />;
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
  const { ti } = useI18n();
  const { query, all } = useCatalog();
  const term = useTerminal();

  /**
   * Gõ `timeline` lần nữa là in thêm một khối — nhưng id phải là duy nhất, nên
   * nó đi theo khối mới nhất và các khối cũ bỏ id lại. `#timeline` vì thế luôn
   * trỏ đúng một chỗ, và là chỗ vừa in ra.
   */
  const liveTimeline = useMemo(() => {
    for (let i = term.entries.length - 1; i >= 0; i -= 1) {
      if (term.entries[i].result.kind === 'timeline') return term.entries[i].id;
    }
    return -1;
  }, [term.entries]);

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

        {/* Trên màn hình hẹp chỉ còn `hoangtran@github` — dấu hai chấm đi theo
            đường dẫn, không thì nó đứng lại một mình ở cuối câu. */}
        <h1 className="term-titlebar">
          {USER}
          <span className="term-dim">@github</span>
          <span className="term-titlebar-path">
            <span className="term-dim">: </span>~/portfolio
          </span>
        </h1>

        {/* Bên trái là tên cửa sổ, bên phải là điều khiển — như thanh tiêu đề
            của một cửa sổ terminal thật. Tìm kiếm không ở đây nữa: đã gõ được
            lệnh thì `grep` làm việc đó, và thanh này khỏi chật. */}
        <div className="term-bar-actions">
          <LangSwitcher className="term-lang" />
          <ThemeSwitcher />
        </div>
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
                vi: ' để xem mọi lệnh, ',
                en: ' to see every command, ',
              })}
              <code className="term-code">{ti({ vi: 'grep <chữ>', en: 'grep <text>' })}</code>
              {ti({
                vi: ' để lọc danh sách, hoặc bấm ',
                en: ' to filter the list, or hit ',
              })}
              {/* Trên desktop hàng nút gợi ý bị ẩn, nên chữ này là chỗ bấm duy
                  nhất để gặp timeline mà không phải tự gõ. */}
              <button type="button" className="term-code term-code-btn" onClick={() => term.run('timeline')}>
                timeline
              </button>
              {ti({
                vi: ' để đọc theo năm · Tab tự hoàn thành · ↑ ↓ lịch sử',
                en: ' to read it by year · Tab completes · ↑ ↓ history',
              })}
            </p>

            {/* `?q=` đi theo người dùng từ theme khác sang. Không nói ra thì họ
                mở lên thấy thiếu dự án và tưởng là mất. */}
            {query && (
              <p className="term-hint term-filter">
                {ti({ vi: 'Đang lọc: ', en: 'Filter on: ' })}
                <code className="term-code">grep {query}</code>
                {ti({
                  vi: ' — gõ `grep` không kèm gì để xoá.',
                  en: ' — type `grep` with no argument to clear it.',
                })}
              </p>
            )}
          </>
        )}

        {term.entries.map((entry) => (
          <div key={entry.id} className="term-entry" data-cmd={entry.input}>
            <p className="term-echo">
              <span className="term-prompt">{term.prompt}</span> {entry.input}
            </p>
            <Output result={entry.result} anchor={entry.id === liveTimeline} />
          </div>
        ))}
      </div>

      <form className="term-composer" onSubmit={term.submit}>
        <div className="term-quick">
          {QUICK_COMMANDS.map((c) => (
            <button key={c} type="button" className="term-quick-btn" onClick={() => term.quick(c)}>
              {c.trim()}
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

      <ProjectDetail restoreFocus={term.focusInput} />
    </div>
  );
}
