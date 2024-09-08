<template>
	<ds-surface>
		<form
			@submit.prevent="$emit('updateProfile', { name })"
			class="flex flex-col gap-4"
			v-if="profile"
		>
			<UFormGroup label="Name" class="" size="lg">
				<UInput placeholder="John Doe" v-model="name" />
			</UFormGroup>
			<p class="mb-4">{{ profile.email }}</p>
			<div class="flex gap-4">
				<UButton label="Update" type="submit" />
				<UButton label="Sign out" @click="$emit('signOut')" variant="outline" />
			</div>
		</form>
	</ds-surface>
</template>
<script setup lang="ts">
const props = defineProps({
	profile: {
		type: Object,
		required: true,
	},
});
defineEmits(["updateProfile", "signOut"]);

const name = ref<string>(props.profile?.name || "");
</script>
