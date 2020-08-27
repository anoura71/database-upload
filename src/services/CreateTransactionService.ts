import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';


interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}


class CreateTransactionService {


  public async execute({ title, value, type, category }: Request): Promise<Transaction> {

    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    // Não permite a criação de uma transação diferente de 'income' ou 'outcome'
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Transaction type must be either <income> or <outcome>.');
    }

    // Não permite que uma retirada gere um saldo negativo
    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && value > total) {
      throw new AppError('Unable to create an outcome transaction without a valid balance.');
    }

    // Busca a categoria com o título informado
    let transactionCategory = await categoriesRepository.findOne({
      where: {
        title: category,
      }
    })
    // Categoria não existe
    if (!transactionCategory) {
      // Criar nova categoria, com o título informado
      transactionCategory = categoriesRepository.create({
        title: category
      });
      // Grava no BD
      await categoriesRepository.save(transactionCategory);
    }

    // Cria nova transação
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      // (Usar categoria na nova transação)
      category: transactionCategory,
    });
    // Grava no BD
    await transactionsRepository.save(transaction);

    return transaction;
  }


}


export default CreateTransactionService;
