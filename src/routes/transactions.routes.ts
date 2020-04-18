import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find({
    select: ['id', 'title', 'value', 'type', 'category_id'],
    relations: ['category'],
  });
  // const list: Transaction[] = [];
  // transactions.forEach(transaction => {
  //   list.push({
  //     id: transaction.id,
  //     title: transaction.title,
  //     value: transaction.value,
  //     type: transaction.type,
  //     category: {
  //       id: transaction.category.id,
  //       title: transaction.category.title,
  //     },
  //   });
  // });
  // const list = transactions.forEach(trans => );
  const balance = await transactionRepository.getBalance();
  return response.status(200).json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    categoryTitle: category,
  });
  response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  // const transactionRepository = getCustomRepository(TransactionsRepository);
  // transactionRepository.delete();
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);
  return response.status(200).json({ ok: true });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionsService = new ImportTransactionsService();
    const transactions = await importTransactionsService.execute({
      filename: request.file.filename,
    });
    return response.json(transactions);
  },
);

export default transactionsRouter;
