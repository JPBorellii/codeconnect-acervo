import { DataSource } from 'typeorm';
import { createTypeOrmOptions, loadEnvironmentFile } from './database.config';

loadEnvironmentFile(`${process.cwd()}/apps/api/.env`);
loadEnvironmentFile(`${process.cwd()}/.env`);

export default new DataSource(createTypeOrmOptions(process.env));
