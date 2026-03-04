"use client";

const PURCHASE_SENT_PREFIX = "ga4_purchase_sent_";

const hasWindow = () => typeof window !== "undefined";

export const trackEvent = (eventName, params = {}) => {
  if (!hasWindow()) return false;
  if (!eventName || typeof window.gtag !== "function") return false;

  window.gtag("event", eventName, params);
  return true;
};

const parseGaClientId = (gaCookieValue) => {
  if (!gaCookieValue || typeof gaCookieValue !== "string") return null;

  // _ga format: GA1.1.123456789.987654321
  const parts = gaCookieValue.split(".");
  if (parts.length < 4) return null;

  const clientId = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  return /^\d+\.\d+$/.test(clientId) ? clientId : null;
};

export const getGaClientId = () => {
  if (!hasWindow()) return null;

  const allCookies = document.cookie || "";
  const cookies = allCookies.split(";").map((c) => c.trim());
  const gaCookie = cookies.find((cookie) => cookie.startsWith("_ga="));
  if (!gaCookie) return null;

  const value = decodeURIComponent(gaCookie.slice(4));
  return parseGaClientId(value);
};

export const hasPurchaseSent = (transactionId) => {
  if (!hasWindow() || !transactionId) return false;
  return window.sessionStorage.getItem(`${PURCHASE_SENT_PREFIX}${transactionId}`) === "1";
};

export const markPurchaseSent = (transactionId) => {
  if (!hasWindow() || !transactionId) return;
  window.sessionStorage.setItem(`${PURCHASE_SENT_PREFIX}${transactionId}`, "1");
};
