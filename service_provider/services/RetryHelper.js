export async function retryWithBackoff(fn, retryCount = 3, delay = 1000) {
  for (let i = 0; i < retryCount; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retryCount - 1) throw err;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
}