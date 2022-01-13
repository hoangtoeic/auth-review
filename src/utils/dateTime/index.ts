export function setTimeResetTokenExpired() : string {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const day = new Date().getDate();
  const setTimeResetTokenExpired = new Date(year, month, day + 1);
  return setTimeResetTokenExpired.toISOString();
}

export function setTimeRefreshTokenExpired() : string {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const day = new Date().getDate();
  const setTimeRefreshTokenExpired = new Date(year + 1, month, day);
  return setTimeRefreshTokenExpired.toISOString();
}