import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';


class DeleteTransactionService {


  public async execute(id: string): Promise<void> {

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    // Verifica se o id é de uma transação que já existe
    const transaction = await transactionsRepository.findOne(id);
    if (!transaction) {
      throw new AppError('Transaction does not exist.', 404);
    }

    // Exclui a transação
    await transactionsRepository.remove(transaction);
  }


}


export default DeleteTransactionService;
