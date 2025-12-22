import { appendFileSync } from 'fs';
import { resolve } from 'path';

const LOG_FILE = resolve(process.cwd(), 'action-log.json');

export function log_action(action: string, email: string) {
	const entry = {
		time: new Date().toISOString(),
		email,
		action
	};

	appendFileSync('action-log.json', JSON.stringify(entry) + '\n', { encoding: 'utf-8' });
}

export function log_pxl(action: string, x: number, y: number, color: string, email: string) {
	const entry = {
		time: new Date().toISOString(),
		email,
		action,
		x,
		y,
		color
	};

	appendFileSync('action-log.json', JSON.stringify(entry) + '\n', { encoding: 'utf-8' });
}
