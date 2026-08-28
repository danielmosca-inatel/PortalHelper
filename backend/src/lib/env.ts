import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  portalUsername: process.env.PORTAL_USERNAME,
  portalPassword: process.env.PORTAL_PASSWORD,
}
