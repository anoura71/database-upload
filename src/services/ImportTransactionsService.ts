import csvParse from 'csv-parse';
import fs from 'fs';
import { In, getCustomRepository, getRepository } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';


interface CsvTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category?: string;
}


class ImportTransactionsService {

  async execute(filePath: string): Promise<Transaction[]> {

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const contactsReadStream = fs.createReadStream(filePath);
    const parsers = csvParse({
      from_line: 2,
    });
    const parseCsv = contactsReadStream.pipe(parsers);

    const transactions: CsvTransaction[] = [];
    const categories: string[] = [];

    // Percorre as linhas do arquivo
    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map(
        (cell: string) => cell.trim(),
      );
      if (!title || !type || !value) {
        // Se algum dos dados obrigatórios não for especificado, descartar a linha
        return;
      }
      // Inclui a categoria no array de categorias
      categories.push(category);
      // Inclui a transação no array de transações
      transactions.push({ title, type, value, category });
    });

    // Verifica se o parsing do arquivo CSV terminou
    await new Promise(resolve => parseCsv.on('end', resolve));

    // Busca as categorias já existentes no BD, dentre as categorias do CSV
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      }
    });
    // Mapeia somente os títulos das categorias já existentes no BD, também existentes no CSV
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title
    );
    // Mapeia as categorias do CSV que não estão no BD, retirando as duplicações
    const addCategoriesTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);
    // Monta o objeto para gravar cada uma das novas categorias
    const newCategories = categoriesRepository.create(
      addCategoriesTitles.map(title => ({
        title,
      })),
    );
    // Grava as novas categorias no BD
    await categoriesRepository.save(newCategories);

    // Agrupa todas as categorias (pré-existentes e criadas) em um array único
    const finalCategories = [...newCategories, ...existentCategories];
    // Mapeia as transações do CSV
    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        value: transaction.value,
        type: transaction.type,
        category: finalCategories.find(
          category=> category.title===transaction.category
        ),
      }))
    );
    // Grava as transações no BD
    await transactionsRepository.save(createdTransactions);

    // Exclui o arquivo CSV do filesystem (da pasta de upload do servidor)
    await fs.promises.unlink(filePath);

    return createdTransactions;
  }

}


export default ImportTransactionsService;
