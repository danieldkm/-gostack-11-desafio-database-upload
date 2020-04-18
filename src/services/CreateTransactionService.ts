import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    let category = await categoryRepository.findOne({
      title: categoryTitle,
    });

    if (!category) {
      category = categoryRepository.create({
        title: categoryTitle,
      });
      await categoryRepository.save(category);
    }

    if (!['income', 'outcome'].includes(type)) {
      throw Error('Type is not valid');
    }

    const balance = await transactionRepository.getBalance();
    if (balance) {
      if (balance.total < value && type === 'outcome') {
        throw new AppError('There is no total cash value!');
      }
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
    });

    transaction.category_id = category.id;

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
