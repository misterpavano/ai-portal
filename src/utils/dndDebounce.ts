export function dndDebounce(func: (...args: any[]) => void, wait: number) {
  let timeout: number | undefined;
  return (...args: any[]) => {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
}
