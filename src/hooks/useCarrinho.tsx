
import { useState, useCallback } from "react"

interface Produto {
  id: string
  nome: string
  categoria: string
  preco: number
  estoque: number
  tipo?: string
  evento_id?: string
}

interface ItemCarrinho {
  produto_id: string
  nome: string
  preco_unitario: number
  quantidade: number
  subtotal: number
}

export function useCarrinho() {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])

  const adicionarAoCarrinho = useCallback((produto: Produto) => {
    setCarrinho(carrinho => {
      const itemExistente = carrinho.find(item => item.produto_id === produto.id)
      
      if (itemExistente) {
        if (itemExistente.quantidade < produto.estoque) {
          return carrinho.map(item => 
            item.produto_id === produto.id 
              ? { ...item, quantidade: item.quantidade + 1, subtotal: item.preco_unitario * (item.quantidade + 1) }
              : item
          )
        }
        return carrinho
      } else {
        const novoItem: ItemCarrinho = {
          produto_id: produto.id,
          nome: produto.nome,
          preco_unitario: produto.preco,
          quantidade: 1,
          subtotal: produto.preco
        }
        return [...carrinho, novoItem]
      }
    })
  }, [])

  const atualizarQuantidade = useCallback((produtoId: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      setCarrinho(carrinho => carrinho.filter(item => item.produto_id !== produtoId))
      return
    }

    setCarrinho(carrinho => carrinho.map(item => {
      if (item.produto_id === produtoId) {
        return {
          ...item,
          quantidade: novaQuantidade,
          subtotal: item.preco_unitario * novaQuantidade
        }
      }
      return item
    }))
  }, [])

  const removerDoCarrinho = useCallback((produtoId: string) => {
    setCarrinho(carrinho => carrinho.filter(item => item.produto_id !== produtoId))
  }, [])

  const limparCarrinho = useCallback(() => {
    setCarrinho([])
  }, [])

  return {
    carrinho,
    adicionarAoCarrinho,
    atualizarQuantidade,
    removerDoCarrinho,
    limparCarrinho
  }
}
