declare module 'express' {
  import { IncomingHttpHeaders } from 'http'

  export interface Request {
    headers: IncomingHttpHeaders & { authorization?: string }
    [key: string]: any
  }
}
