import {
  MigrationInterface, QueryRunner,
  Table
} from "typeorm";


export default class CreateTransactions1598479192353 implements MigrationInterface {


  public async up(queryRunner: QueryRunner): Promise<void> {

    // Cria a tabela de Transações
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'value',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      })
    );
  }


  public async down(queryRunner: QueryRunner): Promise<void> {

    // Exclui a tabela de Transações
    await queryRunner.dropTable('transactions');
  }


}
