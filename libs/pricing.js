const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const getUsdPerCredit = ({ priceUsd, credits }) => {
  const p = toNumber(priceUsd);
  const c = toNumber(credits);
  if (p === null || c === null || c <= 0) return null;
  return p / c;
};

export const formatUsd = (value, { minFractionDigits = 0, maxFractionDigits = 0 } = {}) => {
  const n = toNumber(value);
  if (n === null) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
  }).format(n);
};

export const formatUsdPerCredit = ({ priceUsd, credits }) => {
  const unit = getUsdPerCredit({ priceUsd, credits });
  if (unit === null) return "";

  // Match UI examples like: $0.098, $0.0497, $0.0333
  return `${formatUsd(unit, { minFractionDigits: 0, maxFractionDigits: 4 })} / credit`;
};

