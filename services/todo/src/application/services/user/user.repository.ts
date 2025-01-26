import { User } from '../../../domain/user';

export interface UserRepository {
  createUser: (user: User) => Promise<User>;
}
