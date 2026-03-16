const NON_FATAL_PAPA_PARSE_ERROR_CODES = new Set(["UndetectableDelimiter"]);

export const getPapaParseFatalError = (errors = []) => {
  if (!Array.isArray(errors)) return null;

  return (
    errors.find((error) => {
      const code = error?.code;
      return !NON_FATAL_PAPA_PARSE_ERROR_CODES.has(code);
    }) || null
  );
};
