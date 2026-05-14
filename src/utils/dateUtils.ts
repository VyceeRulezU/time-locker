import { isPast, format, differenceInSeconds } from 'date-fns';

export const isLetterUnlocked = (unlockDate: string, now: Date): boolean => {
  return isPast(new Date(unlockDate)) || new Date(unlockDate) <= now;
};

export const formatDisplayDate = (date: string): string => {
  return format(new Date(date), 'PPP');
};

export const getTimeRemaining = (unlockDate: string, now: Date) => {
  const target = new Date(unlockDate);
  const totalSeconds = Math.max(0, differenceInSeconds(target, now));

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
};
