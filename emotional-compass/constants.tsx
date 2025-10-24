import React from 'react';
import type { Emotion, UnsureSignal } from './types';

export const EMOTIONS: Emotion[] = [
  {
    nameKey: 'anger',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 9.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm9 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM8 14h8" /></svg>,
    color: 'bg-red-200',
    gradient: 'from-red-100 to-blush',
  },
  {
    nameKey: 'anxiety',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3.5" /><circle cx="12" cy="12" r="8" /></svg>,
    color: 'bg-purple-200',
    gradient: 'from-purple-100 to-ivory',
  },
  {
    nameKey: 'sadness',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.5 15a3.5 3.5 0 0 1-7 0m-1-5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm6 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" /></svg>,
    color: 'bg-blue-200',
    gradient: 'from-blue-100 to-pale-blue',
  },
  {
    nameKey: 'guilt_shame',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 22h20L12 2z" /></svg>,
    color: 'bg-yellow-200',
    gradient: 'from-yellow-100 to-beige',
  },
   {
    nameKey: 'irritated',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>,
    color: 'bg-orange-200',
    gradient: 'from-orange-100 to-blush',
  },
  {
    nameKey: 'overwhelmed',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><path d="M8 12h8" /></svg>,
    color: 'bg-teal-200',
    gradient: 'from-teal-100 to-pale-blue',
  },
  {
    nameKey: 'numb_blank',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /></svg>,
    color: 'bg-gray-300',
    gradient: 'from-gray-200 to-ivory',
  },
  {
    nameKey: 'joy',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 14a5 5 0 0 0 5 0m-6-4.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm6 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" /></svg>,
    color: 'bg-green-200',
    gradient: 'from-green-100 to-ivory',
  },
];

export const UNSURE_SIGNALS: UnsureSignal[] = [
  { key: 'chest-tight', nameKey: 'chest_tight' },
  { key: 'want-to-cry', nameKey: 'want_to_cry' },
  { key: 'restless', nameKey: 'restless' },
  { key: 'exhausted', nameKey: 'exhausted' },
  { key: 'feel-nothing', nameKey: 'feel_nothing' },
  { key: 'was-criticized', nameKey: 'was_criticized' },
  { key: 'felt-ignored', nameKey: 'felt_ignored' },
];
