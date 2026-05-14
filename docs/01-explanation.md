# How Time-Locked Letters Works (A Simple Guide)

Hello! Imagine you have a special magic box where you can put a letter, but the box has a timer that won't let anyone open it until a specific time. That's exactly what this app is!

Here is how the "magic" happens, step by step:

## 1. Remembering Your Letters (`localStorage`)
The app uses a secret drawer in your web browser called `localStorage`. 

- **Reading the drawer**: When you open the app, it looks inside this drawer to see if there are any letters you wrote before.
  - *Line:* `const data = localStorage.getItem(STORAGE_KEY);` in `storage.ts`.
- **Saving to the drawer**: Every time you write a new letter or delete one, the app quickly puts the new list back into the drawer so it's safe.
  - *Line:* `localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));` in `storage.ts`.

## 2. The Watching Eye (`useEffect`)
In React, `useEffect` is like a little robot that watches for things to change or does a job as soon as the app starts.

- **The Starter Robot**: In `useLetters.ts`, we have a robot that runs only *once* when the app opens to grab your letters from the secret drawer.
- **The Clock Robot**: In `useNow.ts`, we have a robot that wakes up every single second. Its only job is to say, "The time is now [Current Time]!" 
  - *Line:* `setInterval(() => { setNow(new Date()); }, 1000);`
  - This is important because without this robot, the countdown timers on your letters wouldn't move!

## 3. The Big Race (`Date Comparisons`)
This is where the app decides if a letter can be opened. It's like a race between the **Unlock Date** and **Right Now**.

- **Is it time yet?**: The app takes the date you chose (the "Future Date") and the current time from our Clock Robot. It asks, "Is the Future Date already behind us?"
  - *Line:* `isPast(new Date(unlockDate))` in `dateUtils.ts`.
- **The Countdown**: If it's not time yet, the app does some math. It subtracts "Right Now" from the "Future Date" to find out how many seconds are left. Then it turns those seconds into Days, Hours, and Minutes so they look pretty on your screen!

## 4. Why This is Tricky for Beginners
- **The "Invisible" Drawer**: Beginners often forget that `localStorage` only saves *strings* (plain text). We have to use `JSON.stringify` to turn our letters into text to save them, and `JSON.parse` to turn them back into "live" data when we read them.
- **The Runaway Robot**: If you don't tell the `useEffect` robot to stop when the app closes (`clearInterval`), it might keep trying to work in the background, which makes the computer tired.
- **Time Zones**: Dates can be confusing because the world has different time zones. We store everything in "Global Time" (ISO 8601) so that no matter where you are, the letter opens at the right moment.

And that's it! A secret drawer, a helpful robot, and a race against time.
