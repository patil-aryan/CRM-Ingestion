import { useToast } from "@/hooks/use-toast"
import { Toast, ToastDescription, ToastTitle } from "@/components/ui/toast"

export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col gap-2 p-4 max-w-md w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant} onDismiss={() => dismissToast(toast.id)}>
          <div>
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
        </Toast>
      ))}
    </div>
  )
}

