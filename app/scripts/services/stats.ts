import {Injectable, Inject} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Http, Response} from '@angular/http';
import {Observable, ReplaySubject} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import {ExpensesCalculatorService} from './expenses-calculator';
import {MyQueryEncoder} from './query-encoder';


@Injectable()
export class StatsService {
	private stats: ReplaySubject<ITB.Stats>;

	constructor(@Inject('Configs') private Configs, private http: Http, private expensesCalculator: ExpensesCalculatorService) {
		this.stats = new ReplaySubject(1);
	}

	public getData(userId: string, monthBias = 0): Observable<ITB.Stats> {
		let search: URLSearchParams = new URLSearchParams('', new MyQueryEncoder());
		search.set('encryptedUserId', userId);
		search.set('dateBias', `${monthBias}`);
		search.set('WebsiteId', '10bis');
		search.set('DomainId', '10bis');

		this.http.get(`${this.Configs.baseUrl}/UserTransactionsReport`, {search})
			.first()
			.map((response: Response) => response.json())
			.map((response: ITB.Response.Stats) => this.convertToStats(response, monthBias))
			.subscribe((response: ITB.Stats) => {
				this.stats.next(response);
			});

		return this.stats.asObservable();
	}

	private convertToStats(response: ITB.Response.Stats, monthBias: number): ITB.Stats {
		return this.expensesCalculator.calculate(<ITB.Stats>{
			dailyCompanyLimit: 35,
			monthlyUsed: response.Moneycards[0].MonthlyUsage,
			transactions: this.mapTransactions(response.Transactions)
		}, monthBias);
	}

	private mapTransactions(transactions: ITB.Response.Transaction[]): ITB.Transaction[] {
		return transactions.filter((transaction) => transaction.PaymentMethod === 'Moneycard')
			.map((transaction) => ({
				amount: transaction.TransactionAmount,
				date: new Date(parseInt(transaction.TransactionDate.replace(/[^\d]+/ig, ''), 10)),
				restaurant: transaction.ResName
			}));
	}
}