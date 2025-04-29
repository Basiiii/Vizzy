export class CacheKeyHelper {
  static userFavorites(userId: string) {
    return `favorites:user:${userId}`;
  }
}
