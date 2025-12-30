import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const LOG_FILE = resolve(process.cwd(), 'action-log.json');

function readLog(): any[] {
	if (!existsSync(LOG_FILE)) return [];
	try {
		const content = readFileSync(LOG_FILE, 'utf-8').trim();
		if (!content) return [];
		return JSON.parse(content);
	} catch {
		console.error('Corrupted log file, starting fresh.');
		return [];
	}
}

export function log_action(action: string, email: string) {
	const logs = readLog();
	logs.push({
		time: new Date().toISOString(),
		email,
		action
	});
	writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8');
}

export function log_pxl(action: string, x: number, y: number, color: string, email: string) {
	const logs = readLog();
	logs.push({
		time: new Date().toISOString(),
		email,
		action,
		x,
		y,
		color
	});
	writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf-8');
}
