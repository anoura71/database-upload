import {
  MigrationInterface, QueryRunner,
  TableColumn, TableForeignKey
} from "typeorm";


export default class AddCategoryIdToTransactions1598479957709 implements MigrationInterface {


  public async up(queryRunner: QueryRunner): Promise<void> {

    // Cria a coluna Id da Categoria na tabela de Transações
    await queryRunner.addColumn(
      'transactions',
      new TableColumn({
        name: 'category_id',
        type: 'uuid',
        isNullable: true,
      })
    );

    // Cria a chave estrangeira para o Id da Categoria na tabela de Transações
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'TransactionCategory',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      })
    );
  }


  public async down(queryRunner: QueryRunner): Promise<void> {

    // Exclui a chave estrangeira para o Id da Categoria na tabela de Transações
    await queryRunner.dropForeignKey('transactions', 'TransactionCategory');

    // Exclui a coluna Id da Categoria na tabela de Transações
    await queryRunner.dropColumn('transactions', 'category_id');
  }


}
