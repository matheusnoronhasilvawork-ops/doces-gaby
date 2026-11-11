
import { useState, useEffect } from 'react'
import logoDoces from './assets/Doces_Gaby_em_Rosa_Glossy-removebg-preview.png'
import coracao1 from './assets/coracao1.png'
import coracao2 from './assets/coracao2.png'
import './App.css'
import { FaCalendar, FaHeart, FaUtensils } from 'react-icons/fa6'
import { db } from "./services/firebase"
import { collection, getDocs, doc, updateDoc, increment, addDoc } from 'firebase/firestore'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

function App() {
  const [interesses, setInteresses] = useState<string[]>(() => {
    const salvos = localStorage.getItem("interesses")
    if (!salvos) return []
    try {
      const dados = JSON.parse(salvos)
      return Array.isArray(dados) ? dados : []
    } catch {
      return []
    }
  })
  const [produtos, setProdutos] = useState<any[]>([])
  const [loja, setLoja] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState("")
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos")

  const produtosFiltrados = categoriaSelecionada === "Todos" || categoriaSelecionada === "Cocadas" ? produtos : []

  async function solicitarItem() {
    const resultado = await Swal.fire({
      title: 'Fazer uma solicitação',
      width: '90%',
      html: `
    <input
      id="nome-solicitacao"
      class="swal2-input"
      placeholder="Nome do item"
      style="width: 90%; max-width: 90%; margin: 10px auto; box-sizing: border-box;"
    >
    <textarea
      id="descricao-solicitacao"
      class="swal2-textarea"
      placeholder="Descrição (opcional)"
      style="width: 90%; max-width: 90%; margin: 10px auto; box-sizing: border-box;"
    ></textarea>
  `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Enviar solicitação',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#db2777',
      cancelButtonColor: '#6b7280',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const nome = document.getElementById('nome-solicitacao') as HTMLInputElement
        const descricao = document.getElementById('descricao-solicitacao') as HTMLTextAreaElement

        if (!nome.value.trim()) {
          Swal.showValidationMessage('Informe o nome do item.')
          return false
        }

        try {
          await addDoc(collection(db, "sugestoes"), {
            nome: nome.value.trim(),
            descricao: descricao.value.trim()
          })
          return true
        } catch (error) {
          console.error("Erro ao enviar solicitação:", error)
          Swal.showValidationMessage('Não foi possível enviar sua solicitação. Tente novamente.')
          return false
        }
      }
    })

    if (resultado.isConfirmed) {
      await Swal.fire({
        icon: 'success',
        title: 'Solicitação enviada!',
        text: 'Obrigado pela sua sugestão.',
        confirmButtonText: 'Fechar',
        confirmButtonColor: '#db2777'
      })
    }
  }

  async function alternarInteresse(produto: any) {
    const jaExiste = interesses.includes(produto.id)
    const quantidade = jaExiste ? -1 : 1
    try {
      await updateDoc(doc(db, "doces", produto.id), {
        qtd_interessados: increment(quantidade)
      })
      setInteresses((anterior) =>
        jaExiste
          ? anterior.filter((id) => id !== produto.id)
          : [...anterior, produto.id]
      )
      setProdutos((anterior) =>
        anterior.map((item) =>
          item.id === produto.id
            ? {
              ...item,
              qtd_interessados: (item.qtd_interessados || 0) + quantidade
            }
            : item
        )
      )
    } catch (error) {
      console.error("Erro ao atualizar interesse:", error)
    }
  }

  async function buscarInfoLoja() {
    try {
      const resultado = await getDocs(collection(db, "loja"))
      const documento = resultado.docs[0]
      if (!documento) return
      const dados = {
        id: documento.id,
        ...documento.data()
      }
      setLoja(dados)
    } catch (error) {
      console.error("Erro ao buscar informações da loja:", error)
    }
  }

  async function buscarDoces() {
    try {
      const resultado = await getDocs(collection(db, "doces"))
      const dados = resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
      }))
      setProdutos(dados)
    } catch (error) {
      console.error("Erro ao buscar doces:", error)
      setErro("Não foi possível carregar os produtos.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    buscarDoces()
    buscarInfoLoja()
  }, [])

  useEffect(() => {
    localStorage.setItem("interesses", JSON.stringify(interesses))
  }, [interesses])

  return (
    <>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className='flex flex-col w-screen h-screen justify-center items-center overflow-x-hidden'>
          <div className='w-full min-[500px]:w-125 h-full'>
            <header className='w-full h-15 bg-white'>
              <img className='w-30' src={logoDoces} alt="" />
            </header>
            <main className='flex flex-col flex-1 bg-gray-50'>
              <div className='relative flex *:items-center justify-center w-full h-80 bg-red-100'>
                <img className='w-70' src={loja.imagem_abertura} alt="" />
                <div className='absolute bg-red-200 pl-4 w-85 h-30 left-0 bottom-0 rounded-tr-4xl'>
                  <h1 className='font-bold text-2xl leading-8'>Doces feitos com amor para adoçar seu dia!</h1>
                  <p>Docinhos com qualidade feito com fruta de verdade!</p>
                </div>
                <img className='absolute h-12 w-12 right-7 top-29' src={coracao1} alt="" />
                <img className='absolute h-12 w-12 left-0 top-10' src={coracao1} alt="" />
                <img className='absolute h-12 w-12 left-9 top-29' src={coracao2} alt="" />
              </div>
              <section className='flex flex-col px-5 py-4'>
                <div className='w-full flex items-center justify-center p-2 bg-red-500 rounded-lg'>
                  <span className="text-white font-bold text-md">Desconto por tempo limitado: Todas por R$4</span>
                </div>
                <div className='flex flex-row justify-between w-full'>
                  <div className='flex flow items-center gap-2'>
                    <FaCalendar color='pink' />
                    <span className='text-pink-600 font-medium'>Disponível hoje</span>
                  </div>
                </div>
                <div className='flex flex-row w-full mt-4 overflow-x-scroll gap-4 scrollbar-none'>
                  {produtos.some((produto) => produto.qtd_comigo > 0) ? (
                    produtos.map((produto) => (
                      produto.qtd_comigo > 0 && (
                        <div key={produto.id} className='flex flex-col h-50 min-w-40 max-w-40 bg-white rounded-lg overflow-hidden'>
                          <div className='h-2/5 w-full bg-red-100'>
                            <img className='w-full h-full object-cover' src={produto.imagem} alt={produto.nome} />
                          </div>
                          <div className='flex flex-col h-3/5 w-full p-2'>
                            <div className='flex flex-row w-full justify-between gap-1'>
                              <h2 className='text-[0.8rem] font-medium leading-4 min-w-0'>{produto.nome}</h2>
                              <h3 className='text-[0.8rem] whitespace-nowrap shrink-0'>R$ {produto.preco}</h3>
                            </div>
                            <p className='text-[0.7rem]'>{produto.descricao}</p>
                            <div className='flex flex-col w-full mt-auto gap-2'>
                              <h4 className='text-[0.7rem] text-green-600'>Comigo: {produto.qtd_comigo} un.</h4>
                            </div>
                          </div>
                        </div>
                      )
                    ))
                  ) : (
                    <p className='text-center text-sm text-gray-500 py-6 w-full'>
                      Não temos doces disponíveis hoje. Volte mais tarde!
                    </p>
                  )}
                </div>
                <div className='flex flex-row justify-between w-full'>
                  <div className='flex flow items-center gap-2'>
                    <FaUtensils color='pink' />
                    <span className='text-pink-600 font-medium'>Nosso cardápio</span>
                  </div>
                </div>
                <div className='flex flex-row w-full justify-between gap-2'>
                  <button onClick={() => setCategoriaSelecionada("Todos")} className={`text-[0.7rem] py-1 px-5 rounded-xl ${categoriaSelecionada === "Todos" ? 'bg-pink-600 text-white' : 'border border-pink-600'}`}>Todos</button>
                  <button onClick={() => setCategoriaSelecionada("Bolos")} className={`text-[0.7rem] py-1 px-5 rounded-xl ${categoriaSelecionada === "Bolos" ? 'bg-pink-600 text-white' : 'border border-pink-600'}`}>Bolos</button>
                  <button onClick={() => setCategoriaSelecionada("Brigadeiros")} className={`text-[0.7rem] py-1 px-5 rounded-xl ${categoriaSelecionada === "Brigadeiros" ? 'bg-pink-600 text-white' : 'border border-pink-600'}`}>Brigadeiros</button>
                  <button onClick={() => setCategoriaSelecionada("Cocadas")} className={`text-[0.7rem] py-1 px-5 rounded-xl ${categoriaSelecionada === "Cocadas" ? 'bg-pink-600 text-white' : 'border border-pink-600'}`}>Cocadas</button>
                </div>
                <div className='flex flex-col w-full mt-4 gap-4'>
                  {produtosFiltrados.length > 0 ? (
                    produtosFiltrados.map((produto) => (
                      <div key={produto.id} className='flex flex-row w-full border h-35 border-gray-600 rounded-lg overflow-hidden'>
                        <div className='w-1/3 h-full bg-red-100'>
                          <img className='w-full h-full object-cover' src={produto.imagem} alt={produto.nome} />
                        </div>
                        <div className='flex flex-col w-2/3 pl-2 pr-6 py-2'>
                          <div className='flex flex-row w-full justify-between gap-1'>
                            <h2 className='text-sm'>{produto.nome}</h2>
                            <h2 className='text-sm whitespace-nowrap'>R$ {produto.preco}</h2>
                          </div>
                          <div className='flex flex-row w-full justify-between'>
                            <h2 className='bg-pink-300 text-[0.7rem] px-2 rounded-lg'>{produto.status}</h2>
                            <div className='flex flex-row gap-1'>
                              <FaHeart />
                              <h2 className='text-[0.7rem]'>{produto.qtd_interessados || 0} Interessados</h2>
                            </div>
                          </div>
                          <p className='text-[0.7rem]'>{produto.descricao}</p>
                          <div className='flex flex-col w-full mt-auto gap-2'>
                            <h4 className='text-[0.7rem] font-bold'>Estoque: {produto.qtd_total_estoque} un.</h4>
                            <button onClick={() => alternarInteresse(produto)} className={`w-full text-white rounded-lg mt-auto ${interesses.includes(produto.id) ? 'bg-green-600' : 'bg-pink-600'}`}>
                              {interesses.includes(produto.id) ? 'Interessado' : 'Mostrar interesse'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-center text-sm text-gray-500 py-6'>Não temos produtos disponíveis nesta categoria no momento.</p>
                  )}
                </div>
                <h1 className='font-bold text-lg mt-6'>Como funciona?</h1>
                <div className='grid grid-cols-2 grid-rows-2 gap-y-3'>
                  <div className='flex flex-row col-span-1 gap-2'>
                    <div className='flex flex-col'>
                      <div className='flex flex-row gap-2'>
                        <h2 className='font-bold text-pink-600'>1.</h2>
                        <h2 className='font-bold flex flex-row'>Escolha seus doces</h2>
                      </div>
                      <h3 className='text-[0.7rem]'>Veja oque temos disponível e demonstre interesse</h3>
                    </div>
                  </div>
                  <div className='flex flex-row col-span-1 gap-2'>
                    <div className='flex flex-col'>
                      <div className='flex flex-row gap-2'>
                        <h2 className='font-bold text-pink-600'>2.</h2>
                        <h2 className='font-bold'>Transporte de doces</h2>
                      </div>
                      <h3 className='text-[0.7rem]'>Os doces com interesse ficarão disponíveis para compra</h3>
                    </div>
                  </div>
                  <div className='flex flex-row col-span-2 relative'>
                    <div className='flex flex-col items-center w-full'>
                      <div className='flex flex-row gap-2'>
                        <h2 className='font-bold text-pink-600'>3.</h2>
                        <h2 className='font-bold'>Pagamento</h2>
                      </div>
                      <h3 className='text-sm'>Pagamento via PIX: {loja.telefone}</h3>
                    </div>
                  </div>
                </div>
                <div className='flex flex-row justify-between w-full p-2 rounded-md bg-pink-200'>
                  <div className='flex flex-col w-2/3'>
                    <h2 className='text-md font-bold'>Precisa de algo mais?</h2>
                    <h3 className='text-sm'>Não encontrou oque queria ou deseja algo a mais?</h3>
                    <button onClick={solicitarItem} className='bg-pink-400 py-1 px-4 rounded-lg'>Fazer uma solicitação</button>
                  </div>
                  <img className='w-20' src={loja.imagem_abertura} alt="" />
                </div>
                {erro && (
                  <p className='text-red-500 text-sm mt-4'>{erro}</p>
                )}
              </section>
            </main>
          </div>
        </div>
      )}
    </>
  )
}

export default App
