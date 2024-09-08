<template>
	<form @submit.prevent="$emit('mailCode', email)" class="flex flex-col gap-4">
		<UAlert
			icon="i-heroicons-command-line"
			color="red"
			variant="subtle"
			title="Error!"
			:description="errorMessage"
			v-if="errorMessage"
		/>
		<UFormGroup label="Email">
			<UInput
				placeholder="you@example.com"
				icon="i-heroicons-envelope"
				type="email"
				v-model="email"
			/>
		</UFormGroup>
		<UAlert
			description="Enter your email above, and we'll send you a login code."
			title="Get login code emailed to you"
			v-if="!errorMessage"
		/>
		<UButton type="submit" label="Email code" :loading="loading" />
		<UButton label="Enter code" variant="ghost" @click="$emit('enterCode')" />
	</form>
</template>
<script setup lang="ts">
const email = defineModel<string>();
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
});

defineEmits(["mailCode", "enterCode"]);
</script>
