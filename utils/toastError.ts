export default function toastError(message: string) {
	const toast = useToast();
	toast.add({
		title: "Error",
		description: message,
		icon: "i-heroicons-x",
		color: "red",
	});
}
