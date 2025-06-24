import { useToast as useShadcnToast } from "../components/ui/use-toast"

export function useToast() {
  const { toast } = useShadcnToast()
  
  return {
    toast: ({ title, description, variant = "default", ...props }) => {
      toast({
        title,
        description,
        variant,
        ...props,
      })
    }
  }
}

export { toast } from "../components/ui/use-toast"
