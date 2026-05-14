import { getTimeRemaining, isLetterUnlocked } from '../utils/dateUtils';

export const useCountdown = (unlockDate: string, now: Date) => {
  const isUnlocked = isLetterUnlocked(unlockDate, now);
  const { days, hours, minutes, seconds } = getTimeRemaining(unlockDate, now);

  return {
    isUnlocked,
    days,
    hours,
    minutes,
    seconds
  };
};
