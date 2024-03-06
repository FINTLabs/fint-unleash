export function databaseUrl(
  username: string,
  password: string,
  host: string,
  port: string,
  parameters: string,
) {
  return `postgresql://${username}:${password}@${host}:${port}/postgres${parameters}`;
}
