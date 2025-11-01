
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/balance" | "/api/balance/decrease" | "/api/balance/increase" | "/api/balance/[username]" | "/api/pixels" | "/bitvualt" | "/home" | "/login";
		RouteParams(): {
			"/api/balance/[username]": { username: string }
		};
		LayoutParams(): {
			"/": { username?: string };
			"/api": { username?: string };
			"/api/balance": { username?: string };
			"/api/balance/decrease": Record<string, never>;
			"/api/balance/increase": Record<string, never>;
			"/api/balance/[username]": { username: string };
			"/api/pixels": Record<string, never>;
			"/bitvualt": Record<string, never>;
			"/home": Record<string, never>;
			"/login": Record<string, never>
		};
		Pathname(): "/" | "/api" | "/api/" | "/api/balance" | "/api/balance/" | "/api/balance/decrease" | "/api/balance/decrease/" | "/api/balance/increase" | "/api/balance/increase/" | `/api/balance/${string}` & {} | `/api/balance/${string}/` & {} | "/api/pixels" | "/api/pixels/" | "/bitvualt" | "/bitvualt/" | "/home" | "/home/" | "/login" | "/login/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/assets/pxl-logo.png" | "/assets/pxl-title.png" | "/robots.txt" | string & {};
	}
}