import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    if (!id) {
      throw new AppError('Id da transaction deve ser informada.', 401);
    }

    const transactionRepository = getCustomRepository(TransactionRepository);
    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
