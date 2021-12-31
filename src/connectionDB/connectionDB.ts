import { User } from "src/db/entities/user.entity";
import {ConnectionManager,Connection} from 'typeorm';

export  async function ConnectionDB(): Promise<Connection> {
  const connectionManager = new ConnectionManager();
  const connection = connectionManager.create({
  name: 'test4-db',
  type: 'postgres',
    host:'localhost',
    port:5432,
    username: 'postgres',
    password: '14121999aA',
    database: 'test4',
    entities: [User],
    synchronize: false,
});
//console.log('call')
 return  await connection.connect(); // performs connection
}