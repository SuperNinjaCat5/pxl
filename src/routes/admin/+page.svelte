<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import '$lib/assets/styles/admin.css';
	import '$lib/assets/styles/admin-page.css';
	import { onMount } from 'svelte';

	type User = {
		user_id: number;
		email: string;
	};

	type UserInfo = {
		email: string;
		is_admin: boolean;
		is_ship_edit: boolean;
		is_shop_edit: boolean;
		is_canvas_mod: boolean;
	};

	let users: User[] = [];
	let filteredUsers: User[] = [];
	let search = '';
	let selectedUser: User | null = null;
	let selectedUserInfo: UserInfo | null = null;
	let highlightIndex = 0;
	let showList = false;
	let showInfo = false;

	onMount(async () => {
		const res = await fetch('/api/users/all');
		users = (await res.json()) as User[];
		filteredUsers = users;
	});

	$: filteredUsers = users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()));

	$: highlightIndex = Math.min(highlightIndex, filteredUsers.length - 1);

	const selectUser = async (user: User) => {
		selectedUser = user;
		selectedUserInfo = null; // show "Loading..."
		showList = false;
		showInfo = true;

		const res = await fetch('/api/users/grab', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ user_email: user.email })
		});

		selectedUserInfo = await res.json();
	};
</script>

<svelte:head>
	<title>Pixel - Admin</title>
</svelte:head>

<div class="admin-page">
	<Header message="Admin Panel of Power and Cool" /><br /><br />
	<div class="page-content">
		<input
			type="text"
			placeholder="Search users..."
			bind:value={search}
			on:focus={() => {
				showList = true;
				selectedUser = null;
				selectedUserInfo = null;
			}}
			on:click={() => {
				showList = true;
				selectedUser = null;
				selectedUserInfo = null;
			}}
			on:keydown={(e) => {
				if (e.key === 'Enter' && filteredUsers.length > 0) {
					selectUser(filteredUsers[highlightIndex]);
				} else if (e.key === 'ArrowDown') {
					highlightIndex = Math.min(highlightIndex + 1, filteredUsers.length - 1);
				} else if (e.key === 'ArrowUp') {
					highlightIndex = Math.max(highlightIndex - 1, 0);
				}
			}} />

		{#if showList && filteredUsers.length > 0}
			<ul>
				{#each filteredUsers as user, i (user.user_id)}
					<li class:selected={selectedUser?.user_id === user.user_id}>
						<button
							type="button"
							on:click={() => selectUser(user)}
							class:highlighted={i === highlightIndex}>
							{user.email}
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		{#if showInfo && selectedUser}
			<h3 class="user-title">{selectedUser.email}</h3>
			<div class="user-info">
				{#if !selectedUserInfo}
					<p>Loading...</p>
				{:else}
					<p>Admin: {selectedUserInfo.is_admin ? 'true' : 'false'}</p>
					<p>Ship Edit: {selectedUserInfo.is_ship_edit ? 'true' : 'false'}</p>
					<p>Shop Edit: {selectedUserInfo.is_shop_edit ? 'true' : 'false'}</p>
					<p>Canvas Mod: {selectedUserInfo.is_canvas_mod ? 'true' : 'false'}</p>
				{/if}
			</div>
		{/if}
	</div>
</div>
