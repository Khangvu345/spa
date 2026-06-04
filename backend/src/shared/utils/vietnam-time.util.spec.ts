import {
  createVietnamDateTime,
  formatVietnamDateKey,
  formatVietnamTime,
  getVietnamDateTimeParts,
  parseVietnamDateOnly,
  parseVietnamDateTime,
} from './vietnam-time.util';

describe('vietnam-time util', () => {
  it('formats UTC instants as Vietnam local date and time', () => {
    const date = new Date('2026-05-20T02:00:00.000Z');

    expect(formatVietnamDateKey(date)).toBe('2026-05-20');
    expect(formatVietnamTime(date)).toBe('09:00');
    expect(getVietnamDateTimeParts(date)).toMatchObject({
      year: 2026,
      month: 5,
      day: 20,
      hour: 9,
      minute: 0,
    });
  });

  it('creates Vietnam local datetimes as UTC instants for storage', () => {
    expect(createVietnamDateTime(2026, 5, 20, 8).toISOString()).toBe(
      '2026-05-20T01:00:00.000Z',
    );
    expect(createVietnamDateTime(2026, 5, 20, 22).toISOString()).toBe(
      '2026-05-20T15:00:00.000Z',
    );
  });

  it('parses date-only strings as Vietnam midnight', () => {
    expect(parseVietnamDateOnly('2026-05-20')?.toISOString()).toBe(
      '2026-05-19T17:00:00.000Z',
    );
    expect(parseVietnamDateOnly('2026-02-31')).toBeNull();
    expect(parseVietnamDateOnly('20/05/2026')).toBeNull();
  });

  it('parses offset-less ISO datetimes as Vietnam local time', () => {
    expect(parseVietnamDateTime('2026-05-20T09:30:00')?.toISOString()).toBe(
      '2026-05-20T02:30:00.000Z',
    );
    expect(
      parseVietnamDateTime('2026-05-20T09:30:00.250')?.toISOString(),
    ).toBe('2026-05-20T02:30:00.250Z');
    expect(parseVietnamDateTime('2026-05-20')).toBeNull();
  });

  it('keeps explicit timezone offsets as absolute instants', () => {
    expect(
      parseVietnamDateTime('2026-05-20T09:30:00.000+07:00')?.toISOString(),
    ).toBe('2026-05-20T02:30:00.000Z');
    expect(parseVietnamDateTime('2026-05-20T02:30:00.000Z')?.toISOString()).toBe(
      '2026-05-20T02:30:00.000Z',
    );
  });
});
