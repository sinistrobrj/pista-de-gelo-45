
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductSelector } from "./product-selector"
import { CartSummary } from "./cart-summary"
import { VendaHeader } from "./VendaHeader"
import { ClienteSelector } from "./ClienteSelector"
import { CarrinhoActions } from "./CarrinhoActions"
import { usePontoVenda } from "@/hooks/usePontoVenda"

export function PontoVenda() {
  const {
    clientes,
    produtos,
    clienteSelecionado,
    carrinho,
    descontoPercentual,
    loading,
    regrasFidelidade,
    initialized,
    authLoading,
    user,
    setClienteSelecionado,
    setDescontoPercentual,
    adicionarAoCarrinho,
    atualizarQuantidade,
    removerDoCarrinho,
    calcularTotais,
    recarregarProdutos,
    finalizarVenda
  } = usePontoVenda()

  console.log('=== RENDER STATE ===')
  console.log('authLoading:', authLoading)
  console.log('loading:', loading)
  console.log('initialized:', initialized)
  console.log('user exists:', !!user)
  console.log('clientes length:', clientes.length)
  console.log('produtos length:', produtos.length)

  if (authLoading) {
    console.log('Mostrando loading por authLoading')
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log('Usuário não logado')
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p>Usuário não autenticado. Faça login novamente.</p>
        </div>
      </div>
    )
  }

  if (!initialized) {
    console.log('Não inicializado ainda')
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados do sistema...</p>
        </div>
      </div>
    )
  }

  const { total, descontoAplicado, totalComDesconto, descontoFinal, descontoFidelidade } = calcularTotais()

  return (
    <div className="p-6 space-y-6">
      <VendaHeader 
        onRecarregarProdutos={recarregarProdutos}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClienteSelector
            clientes={clientes}
            clienteSelecionado={clienteSelecionado}
            onClienteChange={setClienteSelecionado}
            regrasFidelidade={regrasFidelidade}
            descontoFidelidade={descontoFidelidade}
          />

          <Card>
            <CardHeader>
              <CardTitle>Produtos Disponíveis ({produtos.length} itens)</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSelector
                produtos={produtos}
                carrinho={carrinho}
                onAddToCart={adicionarAoCarrinho}
                onUpdateQuantity={atualizarQuantidade}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <CartSummary
            carrinho={carrinho}
            descontoPercentual={descontoPercentual}
            onDescontoChange={setDescontoPercentual}
            onRemoveItem={removerDoCarrinho}
            total={total}
            totalComDesconto={totalComDesconto}
            descontoAplicado={descontoAplicado}
            descontoFidelidade={descontoFidelidade}
            descontoFinal={descontoFinal}
          />

          <CarrinhoActions
            onFinalizarVenda={finalizarVenda}
            loading={loading}
            carrinhoVazio={carrinho.length === 0}
            clienteSelecionado={clienteSelecionado}
          />
        </div>
      </div>
    </div>
  )
}
