/**
 * Custom Async Function untuk menunda eksekusi selama durasi tertentu (ms).
 * Mengembalikan Promise<void> menggunakan Promise constructor dan resolve().
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

