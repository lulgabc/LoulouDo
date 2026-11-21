import { describe, expect, it } from 'vitest';
import { DICTS } from '@/i18n/translations';
import { LOCALES, localeFromCode } from '@/i18n/locales';
import { formatDate, formatMoney, translate, translatePlural } from '@/i18n/core';
import { createInitialState } from '@/domain/seed';
import fs from 'node:fs';
import path from 'node:path';
import { CATEGORIES } from '@/domain/constants';

const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('多语言字典', () => {
  it('七种语言都存在且 key 数量一致', () => {
    const baseKeys = Object.keys(DICTS.zh).sort();
    for (const locale of LOCALES) {
      expect(Object.keys(DICTS[locale]).sort(), locale).toEqual(baseKeys);
    }
  });

  it('所有翻译非空，且占位符与中文基准一致', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(DICTS[locale])) {
        expect(value.trim().length, `${locale}:${key}`).toBeGreaterThan(0);
        expect(placeholders(value), `${locale}:${key}`).toEqual(
          placeholders((DICTS.zh as Record<string, string>)[key]),
        );
      }
    }
  });

  it('插值会替换所有参数，缺参数时保留原样', () => {
    expect(translate('en', 'home.streak', { n: 7 })).toBe('Day streak: 7');
    expect(translate('de', 'home.streak', { n: 3 })).toBe('Serie: 3');
    expect(translate('fr', 'home.streak')).toContain('{n}');
  });

  it('单复数辅助函数选择正确形式', () => {
    expect(translatePlural('en', 'task.startsIn', 1)).toBe('Starts in 1 day');
    expect(translatePlural('en', 'task.startsIn', 3)).toBe('Starts in 3 days');
    expect(translatePlural('de', 'task.startsIn', 1)).toBe('Startet in 1 Tag');
    expect(translatePlural('fr', 'task.startsIn', 2)).toBe('Commence dans 2 jours');
  });

  it('系统语言归一化', () => {
    expect(localeFromCode('pt-BR')).toBe('pt');
    expect(localeFromCode('zh-Hant')).toBe('zh');
    expect(localeFromCode('de-AT')).toBe('de');
    expect(localeFromCode('ja-JP')).toBe('zh');
    expect(localeFromCode(undefined, 'en')).toBe('en');
  });

  it('日期与金额按语言格式化', () => {
    expect(formatDate('en', '2026-11-19')).toMatch(/Nov/);
    expect(formatDate('de', '2026-11-19')).toMatch(/Nov/);
    expect(formatMoney('de', 12.5)).toContain('12,50');
    expect(formatMoney('en', 12.5)).toBe('12.50');
  });
});

describe('示例数据可翻译', () => {
  it('所有示例任务、假期和心愿都有可用的翻译 key', () => {
    const state = createInitialState();
    for (const task of state.tasks) {
      expect(task.titleKey, task.title).toBeTruthy();
      for (const locale of LOCALES) {
        expect(DICTS[locale][task.titleKey as keyof typeof DICTS.zh]).toBeTruthy();
      }
    }
    for (const holiday of state.settings.holidays) {
      expect(holiday.nameKey).toBeTruthy();
      for (const locale of LOCALES) {
        expect(DICTS[locale][holiday.nameKey as keyof typeof DICTS.zh]).toBeTruthy();
      }
    }
    const wish = state.profiles[0].wish;
    expect(wish.titleKey).toBeTruthy();
    expect(DICTS.en[wish.titleKey as keyof typeof DICTS.zh]).toBeTruthy();
  });

  it('每个类别的名称、短名和提示都有翻译', () => {
    for (const cat of CATEGORIES) {
      const keys = [
        `category.${cat.id}.name`,
        `category.${cat.id}.short`,
        `category.${cat.id}.hint`,
      ] as const;
      for (const locale of LOCALES) {
        for (const key of keys) {
          expect(DICTS[locale][key as keyof typeof DICTS.zh], `${locale}:${key}`).toBeTruthy();
        }
      }
    }
  });
});

describe('源码中的字面量 key', () => {
  it('所有 t()/tn() 字面量 key 都存在于字典中', () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
      }
    };
    walk('app');
    walk('src/components');
    const keys = new Set(Object.keys(DICTS.zh));
    const missing: string[] = [];
    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      for (const match of source.matchAll(/\bt\(\s*['"]([\w.]+)['"]/g)) {
        if (!keys.has(match[1])) missing.push(`${file}: ${match[1]}`);
      }
      for (const match of source.matchAll(/\btn\(\s*['"]([\w.]+)['"]/g)) {
        for (const suffix of ['_one', '_other']) {
          if (!keys.has(`${match[1]}${suffix}`)) missing.push(`${file}: ${match[1]}${suffix}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('皮肤名称和描述都有翻译', () => {
    for (const id of ['candy', 'forest', 'fantasy', 'cute']) {
      for (const field of ['name', 'tagline']) {
        for (const locale of LOCALES) {
          expect(DICTS[locale][`theme.${id}.${field}` as keyof typeof DICTS.zh]).toBeTruthy();
        }
      }
    }
  });
});
