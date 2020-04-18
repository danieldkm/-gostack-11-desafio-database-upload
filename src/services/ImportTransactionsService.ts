import path from 'path';
import fs from 'fs';
import uploadConfig from '../config/upload';
// import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}
interface Trans {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const userAvatarFilePath = path.join(uploadConfig.directory, filename);
    const createTransactionService = new CreateTransactionService();
    const data = fs.readFileSync(userAvatarFilePath, 'utf8');
    const allTextLines = data.split(/\r\n|\n/);
    const headers = allTextLines[0].split(',');
    const lines: Trans[] = [];

    for (let i = 1; i < allTextLines.length; i++) {
      const datas = allTextLines[i].split(',');
      if (datas.length === headers.length) {
        let tarr: Trans = {
          title: '',
          type: 'income',
          value: 0,
          category: '',
        };
        for (let j = 0; j < headers.length; j++) {
          if (headers[j].trim() === 'value') {
            tarr = {
              ...tarr,
              ...{ [headers[j].trim()]: parseInt(datas[j].trim(), 10) },
            };
          } else {
            tarr = {
              ...tarr,
              ...{ [headers[j].trim()]: datas[j].trim() },
            };
          }
        }
        lines.push(tarr);
      }
    }

    const transactions: Transaction[] = [];
    /* eslint-disable no-await-in-loop */
    for (let index = 0; index < lines.length; index++) {
      transactions.push(
        await createTransactionService.execute({
          title: lines[index].title,
          type: lines[index].type,
          value: lines[index].value,
          categoryTitle: lines[index].category,
        }),
      );
      // );
    }
    /* eslint-disable no-await-in-loop */
    return transactions;
  }
}

export default ImportTransactionsService;
