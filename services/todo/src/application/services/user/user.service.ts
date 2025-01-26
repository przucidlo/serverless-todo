import { UserRepository } from './user.repository';

export const userService = (userRepository: UserRepository) => {
  return {
    createUser: userRepository.createUser,
  };
};
