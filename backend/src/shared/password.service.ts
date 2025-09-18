import { Inject, Injectable } from '@nestjs/common'
import bcrypt from 'bcryptjs'
import { PASSWORD_CONFIG, PasswordConfig } from './config'

@Injectable()
export class PasswordService {
  constructor(@Inject(PASSWORD_CONFIG) private readonly options: PasswordConfig) {}

  async hash(plain: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(plain, this.options.saltRounds, (err, hash) => {
        if (err) return reject(err)
        resolve(hash)
      })
    })
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plain, hash, (err, same) => {
        if (err) return reject(err)
        resolve(same)
      })
    })
  }

  hashSync(plain: string): string {
    return bcrypt.hashSync(plain, this.options.saltRounds)
  }
}
