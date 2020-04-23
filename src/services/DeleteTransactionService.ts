import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    if (!id) {
      throw new AppError('Id da transaction deve ser informada.', 401);
    }

    const transactionRepository = getCustomRepository(TransactionRepository);

    const transaction = await transactionRepository.findOne(id);
    if (!transaction) {
      throw new AppError('Transaction does not exists.');
    }
    await transactionRepository.remove(transaction);
    // await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
