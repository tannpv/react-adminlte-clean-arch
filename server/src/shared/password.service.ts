import { Injectable } from '@nestjs/common'
import bcrypt from 'bcryptjs'

@Injectable()
export class PasswordService {
  private readonly saltRounds = 10

  async hash(plain: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bcrypt.hash(plain, this.saltRounds, (err, hash) => {
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
    return bcrypt.hashSync(plain, this.saltRounds)
  }
}
