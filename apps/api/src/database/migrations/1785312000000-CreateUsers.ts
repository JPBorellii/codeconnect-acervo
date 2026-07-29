import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableUnique,
} from 'typeorm';

export class CreateUsers1785312000000 implements MigrationInterface {
  name = 'CreateUsers1785312000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'name', type: 'varchar', length: '100', isNullable: false },
          { name: 'email', type: 'varchar', length: '254', isNullable: false },
          {
            name: 'password_hash',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
    );
    await queryRunner.createUniqueConstraint(
      'users',
      new TableUnique({ name: 'users_email_unique', columnNames: ['email'] }),
    );
    await queryRunner.createCheckConstraint(
      'users',
      new TableCheck({
        name: 'users_email_lowercase_check',
        expression: '"email" = lower("email")',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
