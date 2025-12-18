import Airtable from 'airtable';
import { env } from '$env/dynamic/private';

const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID } = env;
if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) throw new Error('Missing Airtable env vars');

Airtable.configure({ apiKey: AIRTABLE_TOKEN });
const base = Airtable.base(AIRTABLE_BASE_ID);

export default base;
