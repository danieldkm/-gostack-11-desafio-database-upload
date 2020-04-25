import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    console.log('type', type);
    if (!['income', 'outcome'].includes(type)) {
      throw Error('Type is not valid');
    }

    if (total < value && type === 'outcome') {
      throw new AppError('There is no total cash value!');
    }

    let transactionCategory = await categoryRepository.findOne({
      title: category,
    });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    // transaction.category_id = category.id;

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
