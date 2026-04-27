/**
 * Deeply searches an object and converts all BigInt values to strings
 * to allow for safe JSON serialization.
 */
export function recursiveSerialize(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "bigint") {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(recursiveSerialize);
  }

  if (typeof obj === "object") {
    const serialized: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = recursiveSerialize(obj[key]);
      }
    }
    return serialized;
  }

  return obj;
}
