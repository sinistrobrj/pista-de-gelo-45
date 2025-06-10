
import { Input } from "@/components/ui/input"
import { forwardRef } from "react"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder = "(12) 34567-8900", className }, ref) => {
    const formatPhone = (input: string) => {
      // Remove tudo que não é número
      const numbers = input.replace(/\D/g, '')
      
      // Aplica a máscara (12) 34567-8900
      if (numbers.length <= 2) {
        return numbers.length > 0 ? `(${numbers}` : ''
      } else if (numbers.length <= 7) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
      } else if (numbers.length <= 11) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
      } else {
        // Limita a 11 dígitos
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value)
      onChange(formatted)
    }

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        maxLength={15} // (12) 34567-8900 = 15 caracteres
      />
    )
  }
)

PhoneInput.displayName = "PhoneInput"
