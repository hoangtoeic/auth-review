import { saltRoundConstants } from "src/main/auth/constant/saltRound";
import * as bcrypt from 'bcrypt';

class PasswordUtil {
 async generateHash(password: string): Promise<string> {
  const passwordHash = await bcrypt.hash(
    password,
    saltRoundConstants.saltRounds,
  );
  return passwordHash
  }

  async isPasswordCorrect(password: string, passwordUser: string): Promise<Boolean> {
    const isPasswordCorrect = await bcrypt.compareSync(
      password,
      passwordUser
    );
    return isPasswordCorrect
  }
}

export const passwordUtil = new PasswordUtil()