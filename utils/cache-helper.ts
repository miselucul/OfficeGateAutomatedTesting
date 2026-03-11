import { Page } from '@playwright/test';

/**
 * Helper functions untuk handle cache di Office Gate app
 */
export class CacheHelper {
  /**
   * Hapus specific cache untuk office-gate
   */
  static async clearOfficeGateCache(page: Page): Promise<boolean> {
    try {
      const result = await page.evaluate((): { success: boolean; message: string } => {
        try {
          // Cek apakah ada cache
          const hasCache = localStorage.getItem('office-gate-data-cache') !== null;
          
          if (hasCache) {
            localStorage.removeItem('office-gate-data-cache');
            return { 
              success: true, 
              message: '✅ office-gate-data-cache berhasil dihapus' 
            };
          } else {
            return { 
              success: true, 
              message: 'ℹ️ Tidak ada cache yang ditemukan' 
            };
          }
        } catch (error) {
          return { 
            success: false, 
            message: `❌ Gagal hapus cache: ${error}` 
          };
        }
      });
      
      console.log(result.message);
      return result.success;
    } catch (error) {
      console.error('❌ Error accessing localStorage:', error);
      return false;
    }
  }

  /**
   * Hapus SEMUA localStorage (hati-hati!)
   */
  static async clearAllLocalStorage(page: Page): Promise<void> {
    await page.evaluate(() => {
      localStorage.clear();
    });
    console.log('✅ Semua localStorage cleared');
  }

  /**
   * Dapatkan timestamp cache (untuk debugging)
   */
  static async getCacheTimestamp(page: Page): Promise<number | null> {
    return await page.evaluate((): number | null => {
      const cache = localStorage.getItem('office-gate-data-cache');
      if (cache) {
        try {
          const parsed = JSON.parse(cache);
          return parsed.timestamp || null;
        } catch {
          return null;
        }
      }
      return null;
    });
  }

  /**
   * Cek apakah cache masih ada
   */
  static async hasCache(page: Page): Promise<boolean> {
    return await page.evaluate(() => {
      return localStorage.getItem('office-gate-data-cache') !== null;
    });
  }

  /**
   * Refresh dengan fresh data dari server
   */
  static async refreshWithFreshData(page: Page): Promise<void> {
    await this.clearOfficeGateCache(page);
    await page.reload({ waitUntil: 'networkidle' });
    console.log('🔄 Page reloaded with fresh data');
  }
}