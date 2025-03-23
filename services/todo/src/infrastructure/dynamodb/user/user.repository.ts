import { UserRepository } from '../../../application/services/user/user.repository';
import { userEntity } from '../entities/user.entity';
import { User } from '../../../domain/user';
import { PutItemCommand } from 'dynamodb-toolbox/entity/actions/put';

export const dynamodbUserRepository: () => UserRepository = () => {
  async function createUser(user: User) {
    const { username, email, fullname } = user.toDTO();

    const { ToolboxItem } = await userEntity
      .build(PutItemCommand)
      .item({
        pk: username,
        sk: username,
        email: email,
        fullname: fullname,
        username: username,
      })
      .send();

    return new User(
      ToolboxItem.username,
      ToolboxItem.fullname,
      ToolboxItem.email,
    );
  }

  return {
    createUser,
  };
};
