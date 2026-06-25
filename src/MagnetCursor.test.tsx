import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render } from '@testing-library/react';
import { MagnetCursor } from './MagnetCursor';

function getCursor(): HTMLElement {
  // The cursor is the only aria-hidden element rendered by the component.
  return document.querySelector('[aria-hidden="true"]') as HTMLElement;
}

function move(clientX: number, clientY: number) {
  act(() => {
    document.dispatchEvent(
      new MouseEvent('pointermove', { clientX, clientY, bubbles: true }),
    );
  });
}

describe('MagnetCursor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.cursor = '';
  });

  it('renders a single aria-hidden, fixed cursor with the base class', () => {
    render(<MagnetCursor />);
    const cursor = getCursor();
    expect(cursor).toBeInTheDocument();
    expect(cursor).toHaveStyle({ position: 'fixed' });
    expect(cursor.className).toBe('magnet-cursor');
    expect(cursor).toHaveAttribute('data-pulling', 'false');
  });

  it('merges a custom className and style', () => {
    render(<MagnetCursor className="brand" style={{ zIndex: 5 }} color="#7c5cff" />);
    const cursor = getCursor();
    expect(cursor.className).toBe('magnet-cursor brand');
    expect(cursor).toHaveStyle({ zIndex: '5' });
    expect(cursor.style.getPropertyValue('--mc-color')).toBe('#7c5cff');
  });

  it('adds the pulling class and flag while locked onto a target', () => {
    render(
      <>
        <MagnetCursor radius={80} strength={0.5} />
        <button data-magnetic>Target</button>
      </>,
    );
    const cursor = getCursor();
    const target = document.querySelector('button') as HTMLElement;
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      right: 180,
      bottom: 140,
      width: 80,
      height: 40,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect);

    move(220, 120);

    expect(cursor.className).toBe('magnet-cursor magnet-cursor--pulling');
    expect(cursor).toHaveAttribute('data-pulling', 'true');
  });

  it('passes options through to the hook (hideNativeCursor)', () => {
    document.body.style.cursor = 'auto';
    const { unmount } = render(<MagnetCursor hideNativeCursor />);
    expect(document.body.style.cursor).toBe('none');
    unmount();
    expect(document.body.style.cursor).toBe('auto');
  });
});
