import cookies from "js-cookie";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export function useSecureCookie<T = string>(
  cookieName: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const currentValue = cookies.get(cookieName);
    if (currentValue) {
      setValue(fromCookieString<T>(currentValue));
    }
  }, [cookieName]);

  useEffect(() => {
    cookies.set(cookieName, toCookieString(value));
  }, [cookieName, value]);

  return [value, setValue];
}

function fromCookieString<T = string>(value: string) {
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    return value as unknown as T;
  }
}

function toCookieString<T = string>(value: T) {
  if (typeof value === "string") {
    return value;
  } else {
    return JSON.stringify(value);
  }
}
