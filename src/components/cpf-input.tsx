
import { Input } from "@/components/ui/input"
import { forwardRef } from "react"

interface CpfInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const CpfInput = forwardRef<HTMLInputElement, CpfInputProps>(
  ({ value, onChange, placeholder = "000.000.000-00", className }, ref) => {
    const formatCpf = (cpf: string) => {
      // Remove tudo que não é dígito
      const numbers = cpf.replace(/\D/g, '')
      
      // Aplica a máscara
      if (numbers.length <= 3) return numbers
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
      if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCpf(e.target.value)
      onChange(formatted)
    }

    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        maxLength={14}
      />
    )
  }
)

CpfInput.displayName = "CpfInput"
