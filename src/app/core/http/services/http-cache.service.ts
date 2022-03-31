/* tslint:disable:typedef */
import {Injectable} from '@angular/core';
import {HttpResponse} from '@angular/common/http';
// import { each } from 'lodash-es';

const cachePersistenceKey = 'httpCache';

export interface HttpCacheEntry {
  lastUpdated: Date;
  data: HttpResponse<any>;
  expiration: number;
}

/**
 * Provides a cache facility for HTTP requests with configurable persistence policy.
 */
@Injectable(
  {providedIn : 'root'}
)
export class HttpCacheService {
  private cachedData: { [key: string]: HttpCacheEntry } = {};
  private storage: Storage | null = null;

  constructor() {
    this.loadCacheData();
  }

  /**
   * Sets the cache data for the specified request.
   * @param url The request URL. / @param cacheKey The cachekey of the request (f.e. Sport_1)
   * @param data The received data.
   * @param lastUpdated The cache last update, current date is used if not specified.
   */
  setCacheData(
    url: string,
    data: HttpResponse<any>,
    maxAge: number,
    lastUpdated?: Date
  ) {
    this.cachedData[url] = {
      lastUpdated: lastUpdated || new Date(),
      data,
      expiration: maxAge + Date.now()
      // expiration: Date.now()

    };

    this.saveCacheData();
  }

  /**
   * Gets the cached data for the specified request.
   * @param url The request URL. / @param cacheKey The cachekey of the request (f.e. Sport_1)
   * @return The cached data or null if no cached data exists for this request.
   */
  getCacheData(url: string): HttpResponse<any> | null {
    const cacheEntry = this.cachedData[url];

    if (cacheEntry) {
      if (cacheEntry.expiration < Date.now()) {
        return null;
      }

      return cacheEntry.data;
    }

    return null;
  }

  /**
   * Gets the cached entry for the specified request.
   * @param url The request URL. / @param cacheKey The cachekey of the request (f.e. Sport_1)
   * @return The cache entry or null if no cache entry exists for this request.
   */
  getHttpCacheEntry(url: string): HttpCacheEntry | null {
    return this.cachedData[url] || null;
  }

  /**
   * Clears the cached entry (if exists) for the specified request.
   * @param url The request URL. / @param cacheKey The cachekey of the request (f.e. Sport_1)
   */
  clearCache(url: string): void {
    delete this.cachedData[url];

    this.saveCacheData();
  }

  /**
   * Cleans cache entries older than the specified date.
   * @param expirationDate The cache expiration date. If no date is specified, all cache is cleared.
   */
  cleanCache(expirationDate?: Date) {
    if (expirationDate) {
      // each(this.cachedData, (value: HttpCacheEntry, key: string) => {
      //   if (expirationDate >= value.lastUpdated) {
      //     delete this.cachedData[key];
      //   }
      // });
    } else {
      this.cachedData = {};
    }
    this.saveCacheData();
  }

  /**
   * Sets the cache persistence policy.
   * Note that changing the cache persistence will also clear the cache from its previous storage.
   * @param persistence How the cache should be persisted, it can be either local or session storage, or if no value is
   *   provided it will be only in-memory (default).
   */
  // setPersistence(persistence?: 'local' | 'session') {
  //   this.cleanCache();
  //   // @ts-ignore
  //   if (persistence === 'local' || persistence === 'session') {
  //     this.storage =
  //       window[`${persistence}Storage`];
  //   } else {
  //     this.storage =
  //       null;
  //   }
  //   this.loadCacheData();
  // }

  private saveCacheData() {
    if (this.storage) {
      this.storage[cachePersistenceKey] = JSON.stringify(this.cachedData);
    }
  }

  private loadCacheData() {
    const data = this.storage ? this.storage[cachePersistenceKey] : null;
    this.cachedData = data ? JSON.parse(data) : {};
  }
}