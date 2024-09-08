export default function toastSuccess(message: string) {
	const toast = useToast();
	toast.add({
		title: "Success",
		description: message,
		icon: "i-heroicons-check-circle",
	});
}
