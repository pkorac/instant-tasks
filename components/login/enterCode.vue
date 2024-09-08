<template>
	<form
		@submit.prevent="$emit('checkCode', { code, email })"
		class="flex flex-col gap-4"
	>
		<UAlert
			icon="i-heroicons-envelope-open"
			description="Check your email for the login code. It might take a minute to arrive."
			title="Code sent"
			v-if="!errorMessage"
		/>
		<UAlert
			icon="i-heroicons-exclamation-triangle"
			color="red"
			variant="subtle"
			title="Error!"
			:description="errorMessage"
			v-if="errorMessage"
		/>
		<UFormGroup label="Code">
			<UInput placeholder="123456" icon="i-heroicons-hashtag" v-model="code" />
		</UFormGroup>
		<UButton type="submit" label="Login with code" :loading="loading" />
		<UButton label="Enter email" variant="ghost" @click="$emit('enterEmail')" />
	</form>
</template>
<script setup lang="ts">
const code = defineModel<string>();
defineProps({
	errorMessage: {
		type: String,
		required: false,
		default: "",
	},
	loading: {
		type: Boolean,
		required: false,
		default: false,
	},
	email: {
		type: String,
		required: true,
		default: "",
	},
});

defineEmits(["checkCode", "enterEmail"]);
</script>
